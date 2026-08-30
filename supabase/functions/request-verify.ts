import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64urlEncode(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSha256(secret: string, msg: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return base64urlEncode(new Uint8Array(sig));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json();
    const email = (body?.email || "").toString().trim().toLowerCase();
    if (!email) throw new Error("email is required");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    // Lookup user by email using Supabase admin endpoint
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        "apikey": SERVICE_ROLE,
      },
    });

    if (!listRes.ok) {
      console.error('Supabase list users error', await listRes.text());
      // avoid leaking info
      return new Response(JSON.stringify({ success: true, message: "If an account exists, a verification link was sent." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const users = await listRes.json();
    const user = Array.isArray(users) ? users[0] : undefined;

    // Always return generic message to avoid account enumeration
    if (!user) {
      return new Response(JSON.stringify({ success: true, message: "If an account exists, a verification link was sent." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailConfirmed = user?.email_confirmed_at || user?.confirmed_at || null;
    if (emailConfirmed) {
      return new Response(JSON.stringify({ success: true, message: "Account already verified." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a signed token with 1 hour expiry
    const signingSecret = Deno.env.get("SIGNING_SECRET") || SERVICE_ROLE;
    const payload = { email, exp: Date.now() + 1000 * 60 * 60 };
    const payloadStr = JSON.stringify(payload);
    const payloadB64 = base64urlEncode(new TextEncoder().encode(payloadStr));
    const sig = await hmacSha256(signingSecret, payloadB64);
    const token = `${payloadB64}.${sig}`;

    const frontend = Deno.env.get("FRONTEND_URL") || "https://jamupettransit.com";
    const verifyLink = `${frontend.replace(/\/$/,"")}/verify?token=${encodeURIComponent(token)}`;

    // Send email with Resend
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; max-width:600px; margin:0 auto; color:#111;">
        <div style="padding:18px 0; text-align:left;">
          <h1 style="margin:0; font-size:18px; color:#B35A38;">Jamupet Transit</h1>
          <p style="margin:6px 0 0 0; color:#666; font-size:13px;">Verify your email address</p>
        </div>

        <div style="background:#fff; border:1px solid #eee; padding:14px; border-radius:8px;">
          <p style="margin:0 0 12px 0;">Click the button below to verify your Jamupet Transit account.</p>
          <a href="${verifyLink}" style="display:inline-block; padding:10px 14px; background:#B35A38; color:#fff; text-decoration:none; border-radius:6px;">Verify email</a>
          <p style="margin:12px 0 0 0; color:#777; font-size:13px;">If you didn't request this, ignore this email.</p>
        </div>

        <p style="margin:14px 0 0 0; color:#999; font-size:12px;">Jamupet Transit • <a href="https://jamupettransit.com" style="color:#999; text-decoration:none;">jamupettransit.com</a></p>
      </div>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Jamupet Transit <booking@jamupettransit.com>",
        to: email,
        subject: "Jamupet — verify your account",
        text: `Verify your Jamupet account: ${verifyLink}`,
        html: emailHtml,
      }),
    });

    // Don't leak whether email exists; return generic
    return new Response(JSON.stringify({ success: true, message: "If an account exists, a verification link was sent." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
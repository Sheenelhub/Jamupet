import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64urlDecodeToString(b64: string) {
  // replace - _ back to + /
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  while (b64.length % 4) b64 += "=";
  const str = atob(b64);
  return str;
}

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
    const token = (body?.token || "").toString();
    if (!token) throw new Error("token is required");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");

    const signingSecret = Deno.env.get("SIGNING_SECRET") || SERVICE_ROLE;

    const parts = token.split('.');
    if (parts.length !== 2) throw new Error('Invalid token');
    const [payloadB64, sig] = parts;

    // verify signature
    const expected = await hmacSha256(signingSecret, payloadB64);
    if (!(sig === expected)) throw new Error('Invalid token signature');

    const payloadStr = base64urlDecodeToString(payloadB64);
    const payload = JSON.parse(payloadStr);
    if (!payload?.email || !payload?.exp) throw new Error('Invalid token payload');
    if (Date.now() > payload.exp) throw new Error('Token expired');

    const email = payload.email.toString().toLowerCase();

    // find user
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'apikey': SERVICE_ROLE,
      }
    });

    if (!listRes.ok) {
      console.error('Supabase list user error', await listRes.text());
      throw new Error('Unable to find user');
    }

    const users = await listRes.json();
    const user = Array.isArray(users) ? users[0] : undefined;
    if (!user) throw new Error('User not found');

    // If already confirmed, return ok
    if (user.email_confirmed_at || user.confirmed_at) {
      return new Response(JSON.stringify({ success: true, message: 'Account already verified' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Patch user to set email_confirmed_at to now
    const patchRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'apikey': SERVICE_ROLE,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email_confirmed_at: new Date().toISOString() })
    });

    if (!patchRes.ok) {
      console.error('Supabase patch user error', await patchRes.text());
      throw new Error('Failed to verify account');
    }

    return new Response(JSON.stringify({ success: true, message: 'Account verified' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
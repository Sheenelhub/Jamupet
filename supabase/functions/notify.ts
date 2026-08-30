import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface BookingEmailRequest {
  bookingId: string;
  userEmail: string;
  userName: string;
  pickupLocation: string;
  destinationLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleType: string;
  flightNumber?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: BookingEmailRequest = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");
    if (!payload.userEmail) throw new Error("userEmail is required");
    if (!payload.bookingId) throw new Error("bookingId is required");

    const formattedDate = payload.pickupDate
      ? new Date(payload.pickupDate).toLocaleDateString("en-GB", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

    const shortId = payload.bookingId.substring(0, 8);

    const svgIcon = {
      user:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0-0.001-9.999A5 5 0 0 0 12 12zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/></svg>',
      calendar:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333" viewBox="0 0 24 24"><path d="M7 10h5v5H7z"/><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM5 20V9h14v11H5z"/></svg>',
      location:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333" viewBox="0 0 24 24"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
      car:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333" viewBox="0 0 24 24"><path d="M5 11l1-3h12l1 3v6h-1a1 1 0 0 1-2 0H7a1 1 0 0 1-2 0H4v-6zM7.5 7L6.5 9h11l-1-2H7.5z"/></svg>',
      support:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#333" viewBox="0 0 24 24"><path d="M12 1a9 9 0 0 0-9 9v3a5 5 0 0 0 5 5h.5l1.7 2.55c.3.45.95.45 1.25 0L15.5 18H16a5 5 0 0 0 5-5v-3a9 9 0 0 0-9-9z"/></svg>'
    };

    const html = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; max-width:600px; margin:0 auto; color:#111;">
        <div style="padding:18px 0; text-align:left;">
          <h1 style="margin:0; font-size:18px; color:#B35A38;">Jamupet Transit</h1>
          <p style="margin:6px 0 0 0; color:#666; font-size:13px;">Booking confirmed — notification only</p>
        </div>

        <div style="background:#fff; border:1px solid #eee; padding:14px; border-radius:8px;">
          <p style="margin:0 0 10px 0; font-weight:600;">Booking #${shortId}</p>

          <table style="width:100%; border-collapse:collapse; font-size:14px; color:#222;">
            <tr><td style="width:28px; vertical-align:top;">${svgIcon.user}</td><td>${payload.userName}</td></tr>
            <tr><td style="vertical-align:top; padding-top:8px;">${svgIcon.calendar}</td><td style="padding-top:8px;">${formattedDate} • ${payload.pickupTime}</td></tr>
            <tr><td style="vertical-align:top; padding-top:8px;">${svgIcon.location}</td><td style="padding-top:8px;">Pickup: ${payload.pickupLocation}</td></tr>
            <tr><td style="vertical-align:top; padding-top:8px;">${svgIcon.location}</td><td style="padding-top:8px;">Destination: ${payload.destinationLocation}</td></tr>
            <tr><td style="vertical-align:top; padding-top:8px;">${svgIcon.car}</td><td style="padding-top:8px;">${payload.vehicleType} • ${payload.passengers} passenger(s)</td></tr>
            ${payload.flightNumber ? `<tr><td style="vertical-align:top; padding-top:8px;">${svgIcon.calendar}</td><td style="padding-top:8px;">Flight: ${payload.flightNumber}</td></tr>` : ""}
          </table>

          <p style="margin:12px 0 0 0; color:#444; font-size:13px;">A driver will contact you with arrival details.</p>

          <div style="margin-top:12px; display:flex; gap:8px;">
            <a href="https://jamupettransit.com/bookings" style="background:#B35A38; color:#fff; text-decoration:none; padding:8px 12px; border-radius:6px; font-size:14px;">Manage booking</a>
            <a href="mailto:support@jamupettransit.com" style="border:1px solid #ddd; color:#333; text-decoration:none; padding:8px 12px; border-radius:6px; font-size:14px; display:flex; gap:8px; align-items:center;">
              ${svgIcon.support}
              Support
            </a>
          </div>
        </div>

        <p style="margin:14px 0 0 0; color:#999; font-size:12px;">Notification sent from booking@jamupettransit.com — replies will be received at support@jamupettransit.com</p>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Jamupet Transit <booking@jamupettransit.com>",
        to: payload.userEmail,
        subject: `Booking Confirmed — Jamupet Transit #${shortId}`,
        // Send-only address is the envelope sender; route replies to support inbox
        reply_to: "support@jamupettransit.com",
        text: `Booking ${shortId} confirmed for ${payload.userName} on ${formattedDate} at ${payload.pickupTime}. Manage: https://jamupettransit.com/bookings. For support: support@jamupettransit.com`,
        html,
        headers: {
          "Reply-To": "support@jamupettransit.com",
        },
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(emailData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent", emailId: emailData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
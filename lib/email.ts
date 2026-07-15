/**
 * Sends the "she said yes" email via Resend's REST API.
 * Env needed:
 *   RESEND_API_KEY  — from resend.com
 *   FROM_EMAIL      — e.g. "The Garden <hello@yourdomain.com>" (verified domain)
 *   NOTIFY_EMAIL    — optional: your own email, gets a copy so you know the moment it happens
 */
export async function sendYesEmail(toEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("Resend not configured (RESEND_API_KEY / FROM_EMAIL missing) — skipping email.");
    return { skipped: true };
  }

  const bcc = process.env.NOTIFY_EMAIL ? [process.env.NOTIFY_EMAIL] : undefined;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      bcc,
      subject: "You claimed the garden 🌿💚",
      html: yesEmailHtml(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", res.status, body);
    return { ok: false, status: res.status };
  }
  return { ok: true };
}

function yesEmailHtml() {
  return `
  <div style="margin:0;padding:32px 16px;background:#edf4e6;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#f9fdf4;border:2px solid #4c8c4a;border-radius:20px;padding:40px 32px;text-align:center;">
      <div style="font-size:40px;line-height:1;">🌿</div>
      <h1 style="color:#2f6b3c;font-weight:600;font-size:26px;margin:18px 0 6px;">
        The garden is claimed.
      </h1>
      <p style="color:#5a6f52;font-style:italic;font-size:17px;line-height:1.7;margin:18px 0;">
        You solved the puzzle to my heart —<br/>
        and then you said <strong style="color:#2f6b3c;">yes</strong>.
      </p>
      <div style="width:70px;height:2px;background:#4c8c4a;margin:22px auto;border-radius:2px;"></div>
      <p style="color:#22301f;font-size:16px;line-height:1.8;margin:0;">
        Thank you for saying yes. 💚<br/>
        Every square of this heart is yours now,<br/>
        and I plan to keep planting good things in it — with you.
      </p>
      <p style="color:#7d8f74;font-size:13px;margin-top:30px;">
        🌱 September 25 will always open this garden.
      </p>
    </div>
  </div>`;
}

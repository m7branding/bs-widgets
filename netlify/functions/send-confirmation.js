// Sends the Buitenstate confirmation email to the user after a successful
// value-request. Uses SMTP (nodemailer) so it works with any provider
// (SendGrid, Postmark, Mailgun, or a plain SMTP server).
//
// Required Netlify environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
//   MAIL_FROM   e.g.  "Buitenstate <noreply@buitenstate.nl>"
// Optional:
//   ALLOW_ORIGIN  (defaults to '*') — restrict who may call this function.

const nodemailer = require('nodemailer');

const TEMPLATE = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede9e1;margin:0;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#ffffff;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#3c4f19;padding:26px 32px;">
        <span style="color:#1FA1D8;font-size:20px;font-weight:800;letter-spacing:1px;">BUITEN</span><span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:1px;">STATE</span>
        <div style="color:rgba(255,255,255,.7);font-size:11px;letter-spacing:3px;margin-top:2px;">MAKELAARS</div>
      </td></tr>
      <tr><td style="padding:30px 32px 8px;">
        <h1 style="margin:0 0 10px;font-size:21px;color:#1a2510;">Beste {{first_name}},</h1>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#444;">
          Bedankt voor je aanvraag via de <strong>Buitenstate Zoekersmatch</strong>.
          Hieronder vind je een overzicht van wat je hebt ingevuld en wat je zag.
        </p>
      </td></tr>
      <tr><td style="padding:20px 32px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef5e4;border:1px solid #c0d99a;border-radius:12px;">
          <tr><td align="center" style="padding:22px 20px;">
            <div style="font-size:13px;color:#3c4f19;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Actieve zoekers rondom {{city}}</div>
            <div style="font-size:44px;font-weight:800;color:#3c4f19;line-height:1.1;margin:6px 0 2px;">{{amount_of_seekers_shown}}</div>
            <div style="font-size:14px;color:#5a6b3c;">binnen een straal van {{amount_of_seekers_radius_kilometers}} km van jouw woning</div>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:22px 32px 6px;">
        <div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8a8a80;margin-bottom:8px;">Jouw gegevens</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#333;">
          <tr><td style="padding:6px 0;color:#888;width:130px;">Naam</td><td style="padding:6px 0;">{{first_name}} {{last_name}}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">E-mail</td><td style="padding:6px 0;">{{email}}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Telefoon</td><td style="padding:6px 0;">{{phone}}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Adres</td><td style="padding:6px 0;">{{address}}, {{postal_code}} {{city}}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Jouw makelaar</td><td style="padding:6px 0;font-weight:700;color:#3c4f19;">{{broker_name}}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:18px 32px 30px;">
        <p style="margin:0;font-size:15px;line-height:1.6;color:#444;">
          <strong>{{broker_name}}</strong> neemt vrijblijvend contact met je op voor een
          gratis waardebepaling en om te bespreken wat jouw landelijke woning waard is
          voor deze zoekers.
        </p>
      </td></tr>
      <tr><td style="background:#f5f3ee;padding:20px 32px;border-top:1px solid #e6e2d8;">
        <p style="margin:0;font-size:12px;color:#9a9a90;line-height:1.5;">
          Je ontvangt deze e-mail omdat je een aanvraag deed via de Buitenstate Zoekersmatch.<br>
          <a href="https://www.buitenstate.nl" style="color:#1FA1D8;text-decoration:none;">www.buitenstate.nl</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>`;

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
function nf(n) { const x = Number(n); return Number.isFinite(x) ? x.toLocaleString('nl-NL') : esc(n); }

function render(data) {
  const view = { ...data };
  view.amount_of_seekers_shown = nf(data.amount_of_seekers_shown);
  view.amount_of_seekers_radius_kilometers = nf(data.amount_of_seekers_radius_kilometers);
  return TEMPLATE.replace(/\{\{(\w+)\}\}/g, (_, k) => esc(view[k]));
}

function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  // TEMPORARY diagnostic: GET ?diagnose=1 verifies the SMTP connection/auth
  // WITHOUT sending any email, and reports which env vars are present.
  const q = event.queryStringParameters || {};
  if (event.httpMethod === 'GET' && q.diagnose === '1') {
    const cfg = {
      SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
      SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
      SMTP_USER: process.env.SMTP_USER ? 'set' : 'MISSING',
      SMTP_PASS: process.env.SMTP_PASS ? 'set' : 'MISSING',
      MAIL_FROM: process.env.MAIL_FROM || '(default)',
    };
    try {
      await makeTransport().verify();
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, verified: true, cfg }) };
    } catch (e) {
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: false, error: String((e && e.message) || e), cfg }) };
    }
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Method not allowed' };

  let data;
  try { data = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) }; }

  const to = String(data.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: 'Invalid email' }) };
  }

  const transporter = makeTransport();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'Buitenstate <mailings@buitenstate.nl>',
      to,
      subject: 'Jouw zoekersoverzicht — Buitenstate',
      html: render(data),
    });
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ ok: false, error: String((e && e.message) || e) }) };
  }
};

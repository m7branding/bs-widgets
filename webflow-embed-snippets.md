# Webflow embed snippets

Both widgets are served from a subdomain (assumed **https://tools.buitenstate.nl**).
Change the host in the snippets if you use a different one.

## Full widget — Zoekersmatch (auto-resizing iframe)

Paste into a Webflow **HTML Embed**. The widget reports its height so the iframe
grows/shrinks per step (map → form → result) with no scrollbar.

```html
<iframe id="bs-zoekers"
        src="https://tools.buitenstate.nl/zoekers-screener/"
        title="Buitenstate Zoekersmatch"
        loading="lazy"
        style="width:100%;max-width:600px;height:820px;border:0;display:block;margin:0 auto;"></iframe>
<script>
  window.addEventListener('message', function (e) {
    if (e.data && e.data.bsWidget === 'zoekers-screener') {
      document.getElementById('bs-zoekers').style.height = e.data.height + 'px';
    }
  });
</script>
```

## Lightweight map teaser (fixed 400×600)

The whole card links to the full-widget page via `target="_top"` (navigates the
parent tab). Set the destination inside `map-mini/` first (the `href="#"`).

```html
<iframe src="https://tools.buitenstate.nl/map-mini/"
        title="Buitenstate zoekerskaart"
        loading="lazy"
        style="width:400px;max-width:100%;height:475px;border:0;display:block;margin:0 auto;"></iframe>
```

## Hosting setup on Netlify (one-time)

1. **Create the site:** Netlify → *Add new site → Import an existing project* →
   connect GitHub → pick `m7branding/bs-widgets`. Build command: *(empty)*,
   publish directory: `.` (root). Deploy. You get a temporary
   `https://<random-name>.netlify.app` URL.
2. **Add the custom domain:** Site → *Domain management → Add a domain* →
   enter `tools.buitenstate.nl` → *Verify → Add*.
3. **Add the DNS record** where buitenstate.nl DNS lives (Cloudflare, TransIP,
   etc.) — a **CNAME**:
   - Host/name: `tools`
   - Value/target: `<your-site-name>.netlify.app` (shown in Netlify)
   - Proxy/CDN: if on Cloudflare, set this record to **DNS only** (grey cloud)
     so Netlify can issue the certificate.
4. **HTTPS:** once DNS resolves, Netlify auto-provisions a Let's Encrypt
   certificate (Domain management → HTTPS → *Verify / Provision*). Wait for it
   to go green.
5. **CORS:** whitelist `https://tools.buitenstate.nl` on the
   `makelaars.buitenstate.nl/api/value-request` and `/api/companies/coordinates`
   endpoints, so the widget's form submit + office lookup work from the iframe.

That's it — the widgets are then live at
`https://tools.buitenstate.nl/zoekers-screener/` and
`https://tools.buitenstate.nl/map-mini/`, ready for the iframe snippets above.
Every push to `main` auto-deploys.

## Confirmation email (Netlify Function + SMTP)

After a successful value-request, the widget calls
`/.netlify/functions/send-confirmation` (same origin) which emails the user a
Buitenstate-branded confirmation including the seeker count + radius they saw.
Template: `email/confirmation-template.html`.

Set these **environment variables** in Netlify (Site configuration → Environment
variables) — from your email provider's SMTP settings (SendGrid, Postmark,
Mailgun, or any SMTP server):

| Variable | Example |
|----------|---------|
| `SMTP_HOST` | `smtp.postmarkapp.com` |
| `SMTP_PORT` | `587` (or `465` for SSL) |
| `SMTP_USER` | provider username / API token |
| `SMTP_PASS` | provider password / API token |
| `MAIL_FROM` | `Buitenstate <noreply@buitenstate.nl>` |

Notes:
- The **sending domain** (buitenstate.nl) must be verified at your provider
  (SPF/DKIM) or mail will be rejected / land in spam.
- The email send is **best-effort**: if SMTP fails, the user still sees the
  success screen and the value-request is unaffected.
- The CMS currently also sends its own email; disable that when you want this
  one to be the only confirmation.

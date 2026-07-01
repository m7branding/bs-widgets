# Webflow embed snippets

Both widgets are served from a subdomain (assumed **https://widgets.buitenstate.nl**).
Change the host in the snippets if you use a different one.

## Full widget — Zoekersmatch (auto-resizing iframe)

Paste into a Webflow **HTML Embed**. The widget reports its height so the iframe
grows/shrinks per step (map → form → result) with no scrollbar.

```html
<iframe id="bs-zoekers"
        src="https://widgets.buitenstate.nl/zoekers-screener/"
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
<iframe src="https://widgets.buitenstate.nl/map-mini/"
        title="Buitenstate zoekerskaart"
        loading="lazy"
        style="width:400px;max-width:100%;height:600px;border:0;display:block;margin:0 auto;"></iframe>
```

## Hosting setup (one-time)

1. Connect this repo to **Cloudflare Pages** or **Netlify** (no build command; publish root).
2. Add a custom domain `widgets.buitenstate.nl` in that dashboard.
3. Add the DNS record it gives you (a CNAME on `widgets` → the Pages/Netlify target).
4. Whitelist `https://widgets.buitenstate.nl` for CORS on the
   `makelaars.buitenstate.nl/api/value-request` + `/api/companies/coordinates`
   endpoints (same-site once on buitenstate.nl, but the subdomain differs).

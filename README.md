# Buitenstate widgets

Embeddable widgets for Buitenstate. Each widget ships as two files: a
`*-standalone.html` (open directly in a browser to preview) and a
`*-webflow-embed.html` (paste into a Webflow HTML embed — no document wrapper).

## `zoekers-screener/` — Zoekersmatch

Four-step funnel: pick a province → see province-level active seekers →
enter address → see seekers searching near that address (by radius) with the
nearest broker and a "gratis waardebepaling" CTA.

- Geocoding via the Dutch PDOK Locatieserver (Nominatim fallback).
- Radius view lists the **cities seekers are searching in** (from real search
  queries), driven by an adjustable radius slider.
- On submit → `POST https://makelaars.buitenstate.nl/api/value-request`
  (payload wrapped in `data`, `form_id: "toolv2"`); `estate_office_id` is
  resolved live from `POST /api/companies/coordinates`. The displayed seeker
  count is passed along for the notification email.

## `map-mini/` — Lightweight map teaser

400×600 portrait card: interactive NL map, hover shows a green pulsing "live"
dot and a deliberately blurred seeker count. The whole card is one link to the
page where the full Zoekersmatch widget is embedded.

**TODO:** set the `href="#"` in the `map-mini` files to the full-widget page URL.

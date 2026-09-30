# Pronto — marketing site

The public website for Pronto, the appointment and invoicing app for service businesses — salons, clinics,
studios, trainers, consultants and anyone else whose day runs on bookings. The page covers online booking, team
scheduling, automatic reminders, invoices customers pay from a link, and the AI assistant that books, reschedules
and invoices from a typed or spoken request.

It's a single static page: plain HTML, CSS, and a little vanilla JavaScript. No build step, no dependencies.

## Structure

```
index.html        The page (all sections + inline SVG icon sprite)
css/styles.css    Styles, design tokens, light/dark themes
js/main.js        Theme toggle, mobile menu, scroll reveals, hero demo, waitlist form
assets/           Favicon and social preview image (og.png, 1200×630)
404.html          Not-found page (used by GitHub Pages)
```

Brand tokens (orange `#F97316`, warm stone neutrals, Inter) mirror the Pronto app so the site and product feel
like one thing. Dark mode follows the visitor's system setting, with a manual toggle in the header.

## Run locally

Any static file server works:

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

## Before launch

A few values are placeholders until the real ones are decided:

| What | Where | Notes |
| --- | --- | --- |
| Waitlist endpoint | `WAITLIST_ENDPOINT` in `js/main.js` | Any form backend that accepts a POST with `email` and `team` (`solo`, `team` or `large`) — Formspree, Getform, Basin, or the Pronto API. While empty, the form opens the visitor's email app instead. |
| Contact email | `CONTACT_EMAIL` in `js/main.js`, plus the `mailto:` links in `index.html` | Currently `hello@pronto.app`. |
| Social image URL | `og:image` in `index.html` | Social networks need an absolute URL, e.g. `https://your-domain/assets/og.png`. |
| Pricing | Pricing section in `index.html` | Starter and Pro show "Coming soon" until prices are set. |
| Currency | Hero demo (`EXAMPLES` in `js/main.js`), invoice and stats mockups in `index.html` | Sample amounts use `$`, matching the business app's dashboard. |
| Payment methods | Invoicing section and FAQ | Copy says "secure payment link" without naming providers (card, mobile money, …) — add them once the payment integration is chosen. |

The page presents Pronto as being in early access, so the call to action everywhere is joining the early-access
list rather than signing up.

## Deploy

The site is deployable as-is to any static host:

- **GitHub Pages** — Settings → Pages → Deploy from a branch → `main` / `(root)`.
- **Netlify / Vercel / Cloudflare Pages** — point at this repo with no build command and `/` as the output directory.

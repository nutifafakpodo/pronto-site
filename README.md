# Pronto — marketing site

The public website for Pronto, the AI scheduling assistant that turns plain language — typed, spoken, or
texted — into real calendar events across Google Calendar and Outlook.

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
| Waitlist endpoint | `WAITLIST_ENDPOINT` in `js/main.js` | Any form backend that accepts a POST with `email` and `interest` (Formspree, Getform, Basin, or the Pronto API). While empty, the form opens the visitor's email app instead. |
| Contact email | `CONTACT_EMAIL` in `js/main.js`, plus the `mailto:` links in `index.html` | Currently `hello@pronto.app`. |
| Social image URL | `og:image` in `index.html` | Social networks need an absolute URL, e.g. `https://your-domain/assets/og.png`. |
| Business pricing | Pricing section in `index.html` | Plans show "Coming soon" until prices are set. |

Features that aren't live yet (Apple Calendar, daily briefing, WhatsApp/Telegram, Pronto for Business) are
labelled **Soon** on the page — remove the badge as each one ships.

## Deploy

The site is deployable as-is to any static host:

- **GitHub Pages** — Settings → Pages → Deploy from a branch → `main` / `(root)`.
- **Netlify / Vercel / Cloudflare Pages** — point at this repo with no build command and `/` as the output directory.

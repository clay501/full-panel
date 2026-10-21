# fullpanel.co

Static site for Full Panel. No build step: `index.html` is the whole site (Home, Services, How it works, About and Contact are views switched by `#home`, `#services`, `#how`, `#about`, `#contact`).

## Deploy (Cloudflare Pages, Netlify or Vercel)

1. Push this folder to a GitHub repo, with these files at the repo root.
2. Connect the repo in your host. Framework preset: none. Build command: leave blank. Output directory: `/` (root).
3. Add the custom domain `fullpanel.co` in the host, then point the Porkbun DNS records where the host tells you.

## Before launch

- **Contact form (Formspree, same as layered.health).** In Formspree, create a new form for Full Panel with info@fullpanel.co as its email. Copy its endpoint (`https://formspree.io/f/XXXXXXX`) and paste it into both `action=""` and `data-endpoint=""` on the `consult-form` element in `index.html`. Until then, the form asks visitors to email info@fullpanel.co. In Formspree's settings, add fullpanel.co as an allowed domain.
- Fonts load from Google Fonts (Newsreader and Instrument Sans).

## Files

- `index.html` — the site
- `favicon.svg` — the mark
- `assets/logo/` — mark, wordmark and lockup SVGs, light and dark
- `assets/photos/` — About page headshot (JPEG and WebP)

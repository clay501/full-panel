# fullpanel.co

Static site for Full Panel, built with [Eleventy](https://www.11ty.dev/). Each section is a real page: `/`, `/services/` with a page for each service, `/how-it-works/`, `/blog/` (the guides), `/about/` and `/contact/`.

## Work on it

```sh
npm install
npm start        # local preview at http://localhost:8080, reloads as you edit
npm run build    # writes the finished site to _site/
```

## Where things live

- `src/index.njk`, `src/services/`, `src/how-it-works/`, `src/about/`, `src/contact/` — the pages
- `src/services/service.njk` — one page per service at `/services/<slug>/`, each with a consult form
- `src/blog/*.md` — the guides (front matter plus Markdown), published at `/blog/<slug>/`; `src/blog/index.njk` is the guide list and `src/_includes/layouts/guide.njk` the guide layout
- `src/_includes/layouts/base.njk` — the shared head, header, footer and nav
- `src/_includes/partials/` — the logo mark, the slot panel, the "Book a free consult" banner, the consult form and the email signup box
- `src/_data/site.json` — site name, email, nav, LinkedIn page, GA4 ID, Formspree endpoint, email signup endpoint and the Proton booking link
- `src/_data/services.json` — the six services; the home page cards, the Services page and each service's own page all come from here, so a change goes in one place
- `src/_data/faq.json` — the questions on How it works; the FAQPage schema comes from here too
- `src/_data/schema.js` — structured data (JSON-LD): Organization, Person, Service and FAQPage
- `src/_data/panel.json` — the week-of-slots illustration on the home page
- `src/css/styles.css` — all styles; brand colors are CSS variables at the top
- `src/js/main.js` — sticky header, mobile menu, copy-email button, and every consult and signup form
- `src/assets/` — logo SVGs and the About headshot
- `src/downloads/referral-tracking-sheet.csv` — the referral tracking sheet, sent by welcome email 1
- `docs/emails/welcome-sequence.md` — the four-email welcome sequence for new subscribers (load it into the email platform)
- `src/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `site.webmanifest` — browser tab, bookmark and home-screen icons (the mark on pine green)
- `src/404.njk`, `src/sitemap.njk`, `src/robots.njk` — 404 page, sitemap.xml and robots.txt
- `lib/og-image.js` — draws each page's share image (see below)
- `netlify.toml` — Netlify build settings

## Page titles and descriptions

Each page sets `title` and `description` in its front matter (the home page uses `fullTitle` for its whole title). The build fails if a page doesn't have exactly one H1, or if two pages share a title or description, so a new page can't go live without its own.

## Share images

Every page gets a 1200×630 share image at `/og/<page>.png`, drawn at build time from the page's eyebrow and H1 in the site's fonts and colors. Change a headline and its image changes with it. The fonts come from the `@fontsource` packages.

## Analytics

Google Analytics 4 loads once `gaMeasurementId` in `src/_data/site.json` is set. `src/js/main.js` sends three events:

- `generate_lead` when a consult form (contact page or a service page) sends successfully, with `form_source` saying which
- `sign_up` when someone joins the email list
- `booking_click` when someone opens the Proton booking page

Neither form event sends what the person typed.

Mark `generate_lead` as a key event in GA4 (Admin → Events) to count it as a conversion.

## Search Console and Bing

Verify fullpanel.co in Google Search Console as a Domain property (a DNS TXT record in Porkbun), then import it into Bing Webmaster Tools from Search Console. If you'd rather verify with a meta tag, put the codes in `googleSiteVerification` and `bingSiteVerification` in `src/_data/site.json`. Submit `https://fullpanel.co/sitemap.xml` in both.

## Structured data

Every page carries the Organization schema. Pages add more with `schemaNodes` in their front matter: About adds Person, Services adds a Service for each of the six services, and How it works adds FAQPage. The schema is built from the same data files as the visible pages, so editing a service or a question updates both.

Old links like `fullpanel.co/#about` from the single-page version redirect to the matching page.

## Deploy

Netlify builds the site from `main` (`npm run build`) and serves `_site/`, using `netlify.toml`. Every push to `main` goes live, and every pull request gets a deploy preview link first. Netlify serves `404.html` for any missing page. DNS stays at Porkbun: `fullpanel.co` has an A record to Netlify and `www` is a CNAME to `enchanting-druid-d1cdee.netlify.app`.

## Email signup

Each guide has two signup boxes (after the intro and at the end), and the guide list has one. They stay hidden until `subscribeEndpoint` in `src/_data/site.json` is set, so visitors never see a form that can't send. To turn them on:

1. Pick an email platform that supports automations (for example Kit, MailerLite or Buttondown).
2. Create the four emails in `docs/emails/welcome-sequence.md` as an automation triggered on signup. Each email's footer carries the mailing address and an unsubscribe link (CAN-SPAM); the footer text is at the top of that file.
3. Put the platform's signup endpoint in `subscribeEndpoint`. The forms post `email`, `first_name` and `source` (which guide and which box); rename the fields in `src/_includes/partials/capture.njk` if the platform expects different names.

## Guides

The guides are first drafts. Before relying on them, recheck prices, Psychology Today limits and whether the revised ACA Code has been adopted.

## Writing and design conventions

- Colors, type and spacing come from the Full Panel design system: use the CSS custom properties in `src/css/styles.css`, never raw hex values in new components.
- Voice: first person singular, warm, plain, no hype, no exclamation marks.
- Ethics: no client testimonials or reviews, no client stories, no form fields asking about symptoms or clients.

## Contact form

Formspree, same setup as layered.health. The contact page and all six service pages use the same form; service pages add a `service` field and a subject line naming the service. The endpoint is `formEndpoint` in `src/_data/site.json`, and fullpanel.co is on the form's allowed domains in Formspree.

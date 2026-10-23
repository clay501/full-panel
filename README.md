# fullpanel.co

Static site for Full Panel, built with [Eleventy](https://www.11ty.dev/). Each section is a real page: `/`, `/services/`, `/how-it-works/`, `/about/` and `/contact/`.

## Work on it

```sh
npm install
npm start        # local preview at http://localhost:8080, reloads as you edit
npm run build    # writes the finished site to _site/
```

## Where things live

- `src/index.njk`, `src/services/`, `src/how-it-works/`, `src/about/`, `src/contact/` — the pages
- `src/_includes/layouts/base.njk` — the shared head, header, footer and nav
- `src/_includes/partials/` — the logo mark and the "Book a free consult" banner at the bottom of each page
- `src/_data/site.json` — site name, email, nav, Formspree endpoint and the Proton booking link
- `src/_data/services.json` — the six services; the home page cards, the Services page and its jump links all come from here
- `src/_data/faq.json` — the questions on How it works; the FAQPage schema comes from here too
- `src/_data/schema.js` — structured data (JSON-LD): Organization, Person, Service and FAQPage
- `src/_data/panel.json` — the week-of-slots illustration on the home page
- `src/css/styles.css` — all styles; brand colors are CSS variables at the top
- `src/js/main.js` — sticky header, mobile menu, copy-email button and the contact form
- `src/assets/` — logo SVGs and the About headshot
- `src/404.njk`, `src/sitemap.njk`, `src/robots.njk` — 404 page, sitemap.xml and robots.txt

## Page titles and descriptions

Each page sets `title` and `description` in its front matter (the home page uses `fullTitle` for its whole title). The build fails if a page doesn't have exactly one H1, or if two pages share a title or description, so a new page can't go live without its own.

## Structured data

Every page carries the Organization schema. Pages add more with `schemaNodes` in their front matter: About adds Person, Services adds a Service for each of the six services, and How it works adds FAQPage. The schema is built from the same data files as the visible pages, so editing a service or a question updates both.

Old links like `fullpanel.co/#about` from the single-page version redirect to the matching page.

## Deploy

Porkbun static hosting serves a GitHub branch as-is and doesn't run a build. So every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `_site/` to the `site` branch. In Porkbun, GitHub Connect for fullpanel.co points at the `site` branch.

Don't edit the `site` branch by hand; it's replaced on every deploy.

## Contact form

Formspree, same setup as layered.health. The endpoint is `formEndpoint` in `src/_data/site.json`, and fullpanel.co is on the form's allowed domains in Formspree.

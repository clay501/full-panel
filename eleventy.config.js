import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderOgImage } from "./lib/og-image.js";

// "/" -> "home", "/services/" -> "services", "/404.html" -> "404"
const ogSlug = (url) => url.replace(/^\/|\/$|\.html$/g, "").replace(/\//g, "-") || "home";
const decode = (s) => s.replace(/<[^>]*>/g, "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").trim();

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  for (const file of ["favicon.svg", "favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "site.webmanifest"]) {
    eleventyConfig.addPassthroughCopy(`src/${file}`);
  }
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Pages list the schema nodes they need in `schemaNodes` front matter; the
  // Organization is on every page.
  eleventyConfig.addFilter("jsonLd", (schema, keys = []) => {
    const graph = [schema.organization, ...keys.map((key) => schema[key])].flat();
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
  });
  eleventyConfig.addFilter("ogSlug", ogSlug);
  // "/js/main.js" -> "/js/main.js?v=<hash of the file>", so browsers fetch
  // a script or stylesheet again whenever it changes instead of reusing an
  // old cached copy
  eleventyConfig.addFilter("bust", (url) =>
    `${url}?v=${createHash("md5").update(readFileSync(`src${url}`)).digest("hex").slice(0, 10)}`
  );
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // Every page needs one H1, a title and a meta description, and no two
  // pages may share a title or description. Fails the build otherwise.
  eleventyConfig.on("eleventy.after", ({ results }) => {
    const problems = [];
    const seen = { title: new Map(), description: new Map() };
    for (const { url, outputPath, content } of results) {
      if (!outputPath?.endsWith(".html")) continue;
      const h1s = (content.match(/<h1[\s>]/g) || []).length;
      if (h1s !== 1) problems.push(`${url} has ${h1s} H1s`);
      const fields = {
        title: content.match(/<title>([^<]*)<\/title>/)?.[1].trim(),
        description: content.match(/<meta name="description" content="([^"]*)"/)?.[1].trim(),
      };
      for (const [name, value] of Object.entries(fields)) {
        if (!value) { problems.push(`${url} has no ${name}`); continue; }
        if (seen[name].has(value)) problems.push(`${url} has the same ${name} as ${seen[name].get(value)}`);
        else seen[name].set(value, url);
      }
    }
    if (problems.length) throw new Error("Page metadata check failed:\n" + problems.join("\n"));
  });

  // A share image for every page, from its eyebrow and H1, at /og/<slug>.png
  eleventyConfig.on("eleventy.after", async ({ dir, results }) => {
    const outDir = path.join(dir.output, "og");
    await mkdir(outDir, { recursive: true });
    await Promise.all(
      results
        .filter(({ outputPath }) => outputPath?.endsWith(".html"))
        .map(async ({ url, content }) => {
          const title = decode(content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
          const eyebrow = content.match(/<p class="eyebrow">([\s\S]*?)<\/p>/);
          const png = await renderOgImage({ title, eyebrow: eyebrow && decode(eyebrow[1]) });
          await writeFile(path.join(outDir, `${ogSlug(url)}.png`), png);
        })
    );
  });

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}

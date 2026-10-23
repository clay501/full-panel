export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // Pages list the schema nodes they need in `schemaNodes` front matter; the
  // Organization is on every page.
  eleventyConfig.addFilter("jsonLd", (schema, keys = []) => {
    const graph = [schema.organization, ...keys.map((key) => schema[key])].flat();
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/</g, "\\u003c");
  });
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

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}

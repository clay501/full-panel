// A guide's structured data: a BlogPosting by Clay, published by Full Panel.
// The @ids match the Person and Organization in src/_data/schema.js.
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync(new URL("../src/_data/site.json", import.meta.url)));

export function guideNode({ url, title, description, date }) {
  return {
    "@type": "BlogPosting",
    "@id": `${site.url}${url}#article`,
    headline: title,
    description,
    url: `${site.url}${url}`,
    mainEntityOfPage: `${site.url}${url}`,
    datePublished: date.toISOString().slice(0, 10),
    author: { "@id": `${site.url}/about/#clay` },
    publisher: { "@id": `${site.url}/#organization` },
  };
}

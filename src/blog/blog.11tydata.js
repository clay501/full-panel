import { guideNode } from "../../lib/guide-schema.js";

export default {
  layout: "layouts/guide.njk",
  permalink: "/blog/{{ slug }}/",
  eleventyComputed: {
    // The guide's BlogPosting; the guide list page (no slug) gets none
    schemaExtra: (data) =>
      data.slug &&
      guideNode({ url: data.page.url, title: data.title, description: data.description, date: data.page.date }),
  },
};

export default {
  eleventyComputed: {
    // Each service page carries its own Service; the Services page lists all six
    schemaExtra: (data) => data.service && data.schema[`service-${data.service.slug}`],
  },
};

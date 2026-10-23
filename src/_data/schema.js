// JSON-LD nodes for structured data. Built from the same data files as the
// pages, so the schema always matches what visitors see.
import { readFileSync } from "node:fs";

const read = (name) => JSON.parse(readFileSync(new URL(`./${name}.json`, import.meta.url)));
const site = read("site");
const services = read("services");
const faq = read("faq");

const orgId = `${site.url}/#organization`;
const personId = `${site.url}/about/#clay`;

export default {
  organization: {
    "@type": "Organization",
    "@id": orgId,
    name: site.name,
    url: `${site.url}/`,
    logo: `${site.url}/assets/logo/full-panel-mark.svg`,
    slogan: site.tagline,
    description:
      "Full Panel is a marketing and practice growth consultancy based in Philadelphia. It helps private-practice therapists build the referral relationships, directory profiles and search visibility that keep a caseload full.",
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Philadelphia",
      addressRegion: "PA",
      addressCountry: "US",
    },
    founder: { "@id": personId },
  },

  person: {
    "@type": "Person",
    "@id": personId,
    name: "Clay Klaus-Wade",
    url: `${site.url}/about/`,
    image: `${site.url}/assets/photos/clay-klaus-wade.jpg`,
    jobTitle: "Founder",
    description:
      "Counselor in training at the University of Pennsylvania who spent the years before that building referral relationships in health care.",
    worksFor: { "@id": orgId },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Stony Brook University" },
      { "@type": "CollegeOrUniversity", name: "SUNY Empire State University" },
    ],
  },

  services: services.map((s) => ({
    "@type": "Service",
    "@id": `${site.url}/services/#${s.id}`,
    name: s.name,
    serviceType: s.name,
    description: s.short,
    url: `${site.url}/services/#${s.id}`,
    provider: { "@id": orgId },
    audience: { "@type": "Audience", audienceType: "Private-practice therapists" },
  })),

  faq: {
    "@type": "FAQPage",
    "@id": `${site.url}/how-it-works/#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
};

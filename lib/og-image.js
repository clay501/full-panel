// Renders a 1200x630 share image (og:image) for a page from its eyebrow and
// H1, in the site's fonts and light-theme colors.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const font = (pkg, file) => readFileSync(require.resolve(`${pkg}/files/${file}`));
const fonts = [
  { name: "Newsreader", weight: 400, style: "normal", data: font("@fontsource/newsreader", "newsreader-latin-400-normal.woff") },
  { name: "Newsreader", weight: 500, style: "normal", data: font("@fontsource/newsreader", "newsreader-latin-500-normal.woff") },
  { name: "Instrument Sans", weight: 600, style: "normal", data: font("@fontsource/instrument-sans", "instrument-sans-latin-600-normal.woff") },
];

const c = {
  paper: "#f6f3ec", pine: "#16433e", pineSoft: "#d4e2dc", ember: "#b04a26",
  ink: "#1b2422", muted: "#545e5a", sand: "#e8d5b5", line: "#d9d2c4",
};

const h = (type, style, children) => ({ type, props: { style: { display: "flex", ...style }, children } });

// The logo mark: sand bar on top, ember and soft blocks below
const mark = (size) =>
  h("div", { flexDirection: "column", width: size, gap: size * 0.037 }, [
    h("div", { width: size, height: size * 0.48, borderRadius: size * 0.093, background: c.sand }),
    h("div", { gap: size * 0.037 }, [
      h("div", { width: size * 0.296, height: size * 0.444, borderRadius: size * 0.056, background: c.ember }),
      h("div", { width: size * 0.667, height: size * 0.444, borderRadius: size * 0.093, background: c.pineSoft }),
    ]),
  ]);

// The week-of-slots panel from the home page, almost all booked
const panel = () => {
  const open = new Set(["2-3", "4-1"]);
  const rows = [0, 1, 2, 3, 4, 5].map((r) =>
    h("div", { gap: 12 }, [0, 1, 2, 3, 4].map((col) => {
      const key = `${r}-${col}`;
      const style = { width: 40, height: 40, borderRadius: 7 };
      if (key === "3-4") return h("div", { ...style, background: c.ember });
      if (open.has(key)) return h("div", { ...style, border: `2px solid ${c.pineSoft}` });
      return h("div", { ...style, background: c.pineSoft });
    }))
  );
  return h("div", { flexDirection: "column", gap: 12, padding: 36, borderRadius: 28, background: c.pine }, rows);
};

export async function renderOgImage({ eyebrow, title }) {
  const size = title.length > 60 ? 54 : title.length > 36 ? 62 : 72;
  const tree = h("div", { width: 1200, height: 630, background: c.paper, padding: 72, justifyContent: "space-between", alignItems: "center", gap: 64 }, [
    h("div", { flexDirection: "column", justifyContent: "space-between", height: "100%", flex: 1 }, [
      h("div", { alignItems: "center", gap: 18 }, [
        mark(52),
        h("div", { fontFamily: "Newsreader", fontWeight: 500, fontSize: 38, color: c.pine, letterSpacing: -0.4 }, "Full Panel"),
      ]),
      h("div", { flexDirection: "column", gap: 22 }, [
        eyebrow ? h("div", { fontFamily: "Instrument Sans", fontWeight: 600, fontSize: 20, letterSpacing: 2.4, textTransform: "uppercase", color: c.ember }, eyebrow) : null,
        h("div", { fontFamily: "Newsreader", fontWeight: 400, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.015, color: c.ink, textWrap: "balance" }, title),
      ].filter(Boolean)),
      h("div", { fontFamily: "Instrument Sans", fontWeight: 600, fontSize: 20, color: c.muted }, "fullpanel.co"),
    ]),
    panel(),
  ]);
  const svg = await satori(tree, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}

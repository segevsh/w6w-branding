#!/usr/bin/env node
/**
 * Builds every brand asset from one set of path definitions.
 *
 * Nothing in logo/, avatar/ or social/ is hand-edited — change the geometry or
 * the palette here and re-run, so the mark can never drift between assets.
 *
 *   node scripts/build.mjs            # write the SVGs
 *   RENDER=1 node scripts/build.mjs   # also rasterise PNGs into dist/
 *
 * Rasterising needs a Chromium. Either `npx playwright install chromium` and
 * let it be found, or point CHROME at a binary you already have.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const R = (p) => resolve(new URL("..", import.meta.url).pathname, p);

// ── the palette ───────────────────────────────────────────────────────────────
export const C = {
  accent: "#3355E6",
  accentDark: "#5B8CFF",
  ink: "#1A1D24",
  paper: "#FFFFFF",
  night: "#0F1115",
  nightPanel: "#181B22",
  muted: "#9AA3B2",
};

// ── the geometry ──────────────────────────────────────────────────────────────
// One monoline system: 8-unit stroke on a 48-unit x-height, round caps/joins.
// `w` is a plain zigzag; `6` is one swept stem meeting a closed bowl on its left
// quadrant, so the join is tangent and never thickens.
const W1 = "M0 0 L11.5 48 L23 10 L34.5 48 L46 0";
const SIX = '<path d="M91 2 C 76 6, 62 16, 62 32"/><circle cx="78" cy="32" r="16"/>';
const W2 = "M106 0 L117.5 48 L129 10 L140.5 48 L152 0";
const WORD = `<path d="${W1}"/>${SIX}<path d="${W2}"/>`;
// centres the lone `6` inside a 96 tile, then scales it to fill ~62% of the box
const SIX_IN_TILE = (s = 1.12) =>
  `translate(48,48) scale(${s}) translate(-48,-48) translate(-30,23)`;

const svg = (vb, w, h, body, label = "w6w") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${label}">\n${body}\n</svg>\n`;

const strokes = (color, width, body, transform = "") =>
  `  <g ${transform ? `transform="${transform}" ` : ""}fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

const tile = (fill, rx = 22) => `  <rect width="96" height="96" rx="${rx}" fill="${fill}"/>`;

// ── assets ────────────────────────────────────────────────────────────────────
const wordmark = (color) => svg("-6 -6 164 60", 164, 60, strokes(color, 8, WORD));
const mark = (tileFill, sixColor) =>
  svg("0 0 96 96", 96, 96, [tile(tileFill), strokes(sixColor, 9, SIX, SIX_IN_TILE())].join("\n"));
const lockup = (tileFill, sixColor, wordColor) =>
  svg("0 0 284 96", 284, 96, [
    tile(tileFill),
    strokes(sixColor, 9, SIX, SIX_IN_TILE()),
    strokes(wordColor, 8, WORD, "translate(128,24)"),
  ].join("\n"));

/**
 * A banner: flat field, lockup centred, optional tagline under it.
 *
 * `safeH`/`safeW` are the platform's guaranteed-visible box. YouTube's is brutal
 * — 1235x338 out of a 2560x1440 canvas — so the block is measured against it and
 * the build shouts if it would be cropped, which is how the first cut of this
 * file shipped a banner whose tagline fell outside the safe area.
 */
const banner = ({ w, h, safeW, safeH, bg, tileFill, sixColor, wordColor, lockupW, tagline, taglineColor, name }) => {
  const s = lockupW / 284;
  const lockH = 96 * s;
  const fs = tagline ? Math.round(lockupW * 0.105) : 0;
  const gap = tagline ? Math.round(fs * 0.85) : 0;
  const blockH = lockH + gap + fs;
  if (blockH > safeH || lockupW > safeW) {
    console.warn(`  !! ${name}: content ${Math.round(lockupW)}x${Math.round(blockH)} exceeds safe area ${safeW}x${safeH} — it will be cropped`);
  }
  const top = h / 2 - blockH / 2;
  const parts = [
    `  <rect width="${w}" height="${h}" fill="${bg}"/>`,
    `  <g transform="translate(${(w - lockupW) / 2},${top}) scale(${s})">`,
    tile(tileFill),
    strokes(sixColor, 9, SIX, SIX_IN_TILE()),
    strokes(wordColor, 8, WORD, "translate(128,24)"),
    `  </g>`,
  ];
  if (tagline) {
    parts.push(
      `  <text x="${w / 2}" y="${Math.round(top + lockH + gap + fs * 0.78)}" text-anchor="middle" fill="${taglineColor}" font-family="Inter, 'Liberation Sans', Arial, Helvetica, sans-serif" font-size="${fs}" font-weight="500" letter-spacing="0.01em">${tagline}</text>`,
    );
  }
  parts.push(`  <!-- ${name}: safe area ${safeW}x${safeH} centred; content ${Math.round(lockupW)}x${Math.round(blockH)} -->`);
  return svg(`0 0 ${w} ${h}`, w, h, parts.join("\n"));
};

const files = {
  "logo/w6w-wordmark.svg": wordmark(C.accent),
  "logo/w6w-wordmark-mono.svg": wordmark("currentColor"),
  "logo/w6w-wordmark-ondark.svg": wordmark(C.paper),
  "logo/w6w-mark.svg": mark(C.accent, C.paper),
  "logo/w6w-mark-ondark.svg": mark(C.paper, C.accent),
  "logo/w6w-mark-mono.svg": svg("0 0 96 96", 96, 96, strokes("currentColor", 9, SIX, SIX_IN_TILE())),
  "logo/w6w-lockup.svg": lockup(C.accent, C.paper, C.accent),
  "logo/w6w-lockup-ondark.svg": lockup(C.accent, C.paper, C.paper),
  "logo/w6w-lockup-mono.svg": lockup("currentColor", C.paper, "currentColor"),
  "avatar/avatar.svg": mark(C.accent, C.paper),
  "avatar/favicon.svg": svg("0 0 96 96", 96, 96,
    [tile(C.accent, 20), strokes(C.paper, 10, SIX, SIX_IN_TILE(1.2))].join("\n")),
};

const dark = { bg: C.night, tileFill: C.accent, sixColor: C.paper, wordColor: C.paper, taglineColor: C.muted };
const banners = {
  // safe area is the centre 1235x338 — everything outside is cropped on phones
  "social/youtube-banner.svg":   { name: "youtube",  w: 2560, h: 1440, safeW: 1235, safeH: 338, lockupW: 520, tagline: "Central API management", ...dark },
  "social/x-header.svg":         { name: "x",        w: 1500, h: 500,  safeW: 1200, safeH: 360, lockupW: 460, tagline: "Central API management", ...dark },
  "social/linkedin-company.svg": { name: "li-page",  w: 1128, h: 191,  safeW: 1128, safeH: 150, lockupW: 300, ...dark },
  "social/linkedin-personal.svg":{ name: "li-person",w: 1584, h: 396,  safeW: 1300, safeH: 320, lockupW: 440, tagline: "Central API management", ...dark },
  "social/og-image.svg":         { name: "og",       w: 1200, h: 630,  safeW: 1100, safeH: 520, lockupW: 560, tagline: "Central API management", ...dark },
};
for (const [p, cfg] of Object.entries(banners)) files[p] = banner(cfg);

// ── tokens ────────────────────────────────────────────────────────────────────
// The palette, emitted as JSON and CSS from one definition. These are the values
// in @w6w/ui, which is the set partners already consume — see COLOR.md §2 for the
// places the marketing site still disagrees.
const T = {
  accent:            { light: "#3355E6", dark: "#5B8CFF" },
  ink:               { light: "#1A1D24", dark: "#E6E8EE" },
  muted:             { light: "#5F6875", dark: "#9AA3B2" },
  bg:                { light: "#F7F8FA", dark: "#0F1115" },
  panel:             { light: "#FFFFFF", dark: "#181B22" },
  "panel-2":         { light: "#F0F2F6", dark: "#1F232C" },
  border:            { light: "#D9DEE5", dark: "#2A2F3A" },
  success:           { light: "#2E9E5B", dark: "#3FBF77" },
  warning:           { light: "#C77700", dark: "#F0A020" },
  danger:            { light: "#C1362F", dark: "#FF6B6B" },
  "health-unknown":  { light: "#5F6875", dark: "#9AA3B2" },
};
files["tokens/tokens.json"] = JSON.stringify(
  { $comment: "Generated by scripts/build.mjs — do not edit.", radius: "10px", color: T }, null, 2) + "\n";
const cssVars = (mode) =>
  Object.entries(T).map(([k, v]) => `  --w6w-${k}: ${v[mode]};`).join("\n");
files["tokens/tokens.css"] = `/* Generated by scripts/build.mjs — do not edit.
 *
 * Light is the base; dark follows the OS preference and can be forced with
 * data-theme="dark" on any ancestor. Mirrors @w6w/ui's token names so a host can
 * set one and both agree.
 */
:root {
${cssVars("light")}
  --w6w-radius: 10px;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${cssVars("dark")}
  }
}

:root[data-theme="dark"] {
${cssVars("dark")}
}
`;

for (const [p, body] of Object.entries(files)) {
  mkdirSync(dirname(R(p)), { recursive: true });
  writeFileSync(R(p), body);
  console.log(p.endsWith(".svg") ? "svg  " : "gen  ", p);
}

// ── optional rasterisation ────────────────────────────────────────────────────
if (process.env.RENDER) {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  let pw;
  for (const id of [process.env.PLAYWRIGHT, "playwright-core", "playwright"].filter(Boolean)) {
    try { pw = require(id); break; } catch {}
  }
  if (!pw) {
    console.error("\nRENDER=1 but no playwright-core found — `npx playwright install chromium`, or set PLAYWRIGHT to a module path.");
    process.exit(1);
  }
  const browser = await pw.chromium.launch({ executablePath: process.env.CHROME });
  const page = await browser.newPage();
  const png = [
    ["logo/w6w-lockup.svg", "dist/w6w-lockup.png", 852, 288, "transparent"],
    ["logo/w6w-lockup-ondark.svg", "dist/w6w-lockup-ondark.png", 852, 288, C.night],
    ["logo/w6w-wordmark.svg", "dist/w6w-wordmark.png", 656, 240, "transparent"],
    ["avatar/avatar.svg", "dist/avatar-1024.png", 1024, 1024, "transparent"],
    ["avatar/avatar.svg", "dist/avatar-512.png", 512, 512, "transparent"],
    ["avatar/avatar.svg", "dist/avatar-98.png", 98, 98, "transparent"],
    ["avatar/favicon.svg", "dist/favicon-32.png", 32, 32, "transparent"],
    ["social/youtube-banner.svg", "dist/youtube-banner.png", 2560, 1440, C.night],
    ["social/x-header.svg", "dist/x-header.png", 1500, 500, C.night],
    ["social/linkedin-company.svg", "dist/linkedin-company.png", 1128, 191, C.night],
    ["social/linkedin-personal.svg", "dist/linkedin-personal.png", 1584, 396, C.night],
    ["social/og-image.svg", "dist/og-image.png", 1200, 630, C.night],
  ];
  mkdirSync(R("dist"), { recursive: true });
  const { readFileSync } = await import("node:fs");
  for (const [src, out, w, h, bg] of png) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(
      `<body style="margin:0;background:${bg};height:${h}px;display:flex;align-items:center;justify-content:center">` +
      readFileSync(R(src), "utf8").replace("<svg", '<svg style="width:100%;height:100%"') + `</body>`);
    await page.screenshot({ path: R(out), omitBackground: bg === "transparent" });
    console.log("png  ", out, `${w}x${h}`);
  }
  await browser.close();
}

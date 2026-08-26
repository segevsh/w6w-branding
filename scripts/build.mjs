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
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

// ── the wordmark + lockup ────────────────────────────────────────────────────
// Sourced verbatim from logo/logo.svg — the iconmark laid out next to "W6W" set
// in a real display sans and converted to outlines, so it carries no font
// dependency and is never hand-drawn here. Read at build time (not copy-pasted)
// so it can't drift from that source file; recolour it, don't redraw it.
const LOGO_SRC = readFileSync(R("logo/svg/logo.svg"), "utf8");
const logoShapes = [...LOGO_SRC.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
const [, , , WORD_PATH] = logoShapes; // shapes 0-2 = iconmark, 3 = "W6W" outline
const logoCircle = LOGO_SRC.match(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/);
const LOCKUP_CIRCLE = { cx: logoCircle[1], cy: logoCircle[2], r: logoCircle[3] };
const LOCKUP_ICON_PATHS = logoShapes.slice(0, 3);

// measured bboxes of logo.svg's content (SVG getBBox) — icon-only paths+circle,
// the "W6W" path alone, and the two together
const LOCKUP_BBOX = { minX: 67.9016, minY: 105.2733, maxX: 1880.44, maxY: 579.2417 };
const WORD_BBOX = { minX: 676.41, minY: 177.578, maxX: 1880.44, maxY: 511.4447 };
const LOCKUP_W = LOCKUP_BBOX.maxX - LOCKUP_BBOX.minX;
const LOCKUP_H = LOCKUP_BBOX.maxY - LOCKUP_BBOX.minY;
const WORD_W = WORD_BBOX.maxX - WORD_BBOX.minX;
const WORD_H = WORD_BBOX.maxY - WORD_BBOX.minY;

const lockupBody = (color) =>
  `  <g fill="${color}" transform="translate(${-LOCKUP_BBOX.minX},${-LOCKUP_BBOX.minY})">` +
  LOCKUP_ICON_PATHS.map((d) => `<path d="${d}"/>`).join("") +
  `<circle cx="${LOCKUP_CIRCLE.cx}" cy="${LOCKUP_CIRCLE.cy}" r="${LOCKUP_CIRCLE.r}"/>` +
  `<path d="${WORD_PATH}"/></g>`;
const wordBody = (color) =>
  `  <path fill="${color}" transform="translate(${-WORD_BBOX.minX},${-WORD_BBOX.minY})" d="${WORD_PATH}"/>`;

const PAD = 16; // anti-alias margin around the tight content bbox — no frame, no tile
const wordmark = (color) => {
  const w = WORD_W + 2 * PAD, h = WORD_H + 2 * PAD;
  return svg(`-${PAD} -${PAD} ${w} ${h}`, +w.toFixed(2), +h.toFixed(2), wordBody(color));
};
const lockup = (color) => {
  const w = LOCKUP_W + 2 * PAD, h = LOCKUP_H + 2 * PAD;
  return svg(`-${PAD} -${PAD} ${w} ${h}`, +w.toFixed(2), +h.toFixed(2), lockupBody(color));
};

// ── the iconmark ──────────────────────────────────────────────────────────────
// Sourced verbatim from logo/w6w-iconmark.svg (hand-authored, 0 0 1024 1024, 4
// filled shapes) — the one place that geometry is drawn. Every icon-bearing asset
// below reuses this same path data through `iconAt`, scaled and recoloured, so it
// can never drift from the source file.
const ICON_PATHS = [
  "M137.103 391.061C137.103 292.929 510.044 15.2589 510.044 203.16C510.044 391.061 329.474 341.437 329.474 391.061C329.474 440.684 434.806 417.266 434.806 499.229C434.806 581.192 329.474 579.997 329.474 621.018C329.474 662.039 515.618 612.415 510.044 785.819C504.471 959.223 137.103 696.608 137.103 621.018C137.103 545.428 215.224 549.968 215.224 506.039C215.224 462.111 137.103 489.193 137.103 391.061Z",
  "M472 373.97C472 272.209 858.979 -15.7295 858.979 179.12C858.979 373.97 671.612 322.511 671.612 373.97C671.612 425.428 780.909 401.144 780.909 486.138C780.909 571.132 671.612 569.893 671.612 612.431C671.612 654.969 864.762 603.509 858.979 783.326C853.196 963.143 472 690.817 472 612.431C472 534.046 553.062 538.753 553.062 493.2C553.062 447.648 472 475.731 472 373.97Z",
  "M394.072 812.063C398.295 802.768 401.773 792.532 405.142 782.068C392.738 771.314 368.663 756.754 325.572 737.063C174.572 668.063 376.072 714.563 459.072 656.063C542.072 597.563 687.572 757.563 552.572 705.563C438.557 661.647 423.449 725.219 405.142 782.068C436.205 808.999 394.072 812.063 394.072 812.063Z",
];
const ICON_CIRCLE = { cx: 425.5, cy: 597.5, r: 36.5 };
// measured bbox of the shapes above (SVG getBBox) — used to centre/scale consistently
const ICON_BBOX = { minX: 137.103, minY: 113.0, maxX: 859.106, maxY: 843.939 };
const ICON_W = ICON_BBOX.maxX - ICON_BBOX.minX;
const ICON_H = ICON_BBOX.maxY - ICON_BBOX.minY;
const ICON_CX = (ICON_BBOX.minX + ICON_BBOX.maxX) / 2;
const ICON_CY = (ICON_BBOX.minY + ICON_BBOX.maxY) / 2;
const ICON_MAXDIM = Math.max(ICON_W, ICON_H);

const iconBody = () =>
  ICON_PATHS.map((d) => `<path d="${d}"/>`).join("") +
  `<circle cx="${ICON_CIRCLE.cx}" cy="${ICON_CIRCLE.cy}" r="${ICON_CIRCLE.r}"/>`;

// places the icon so its longer dimension is `size` units, centred at (cx, cy)
const iconAt = (fill, cx, cy, size) => {
  const scale = size / ICON_MAXDIM;
  const t = `translate(${cx},${cy}) scale(${scale}) translate(${-ICON_CX},${-ICON_CY})`;
  return `  <g transform="${t}" fill="${fill}">${iconBody()}</g>`;
};
const ICON_FILL_FRAC = 0.7; // icon fills ~70% of a 96 tile
const FAVICON_FILL_FRAC = 0.8; // bolder at small sizes

const svg = (vb, w, h, body, label = "w6w") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${label}">\n${body}\n</svg>\n`;

const tile = (fill, rx = 22) => `  <rect width="96" height="96" rx="${rx}" fill="${fill}"/>`;

// ── assets ────────────────────────────────────────────────────────────────────
const mark = (tileFill, iconColor) =>
  svg("0 0 96 96", 96, 96, [tile(tileFill), iconAt(iconColor, 48, 48, 96 * ICON_FILL_FRAC)].join("\n"));

/**
 * A banner: flat field, lockup centred, optional tagline under it.
 *
 * `safeH`/`safeW` are the platform's guaranteed-visible box. YouTube's is brutal
 * — 1235x338 out of a 2560x1440 canvas — so the block is measured against it and
 * the build shouts if it would be cropped, which is how the first cut of this
 * file shipped a banner whose tagline fell outside the safe area.
 */
const banner = ({ w, h, safeW, safeH, bg, color, lockupW, tagline, taglineColor, name }) => {
  const s = lockupW / LOCKUP_W;
  const lockH = LOCKUP_H * s;
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
    lockupBody(color),
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
  "logo/svg/w6w-wordmark.svg": wordmark(C.accent),
  "logo/svg/w6w-wordmark-mono.svg": wordmark("currentColor"),
  "logo/svg/w6w-wordmark-ondark.svg": wordmark(C.paper),
  "logo/svg/w6w-mark.svg": mark(C.accent, C.paper),
  "logo/svg/w6w-mark-ondark.svg": mark(C.paper, C.accent),
  "logo/svg/w6w-mark-mono.svg": svg("0 0 96 96", 96, 96, iconAt("currentColor", 48, 48, 96 * ICON_FILL_FRAC)),
  "logo/svg/w6w-lockup.svg": lockup(C.accent),
  "logo/svg/w6w-lockup-ondark.svg": lockup(C.paper),
  "logo/svg/w6w-lockup-mono.svg": lockup("currentColor"),
  // Paired with the hand-authored logo/svg/w6w-iconmark.svg (black, for print/
  // one-colour use on light surfaces): the same geometry in paper, for the
  // same use on dark ones. Not part of `files`' hand-edited exception — this
  // one IS generated, from the shared ICON_PATHS/ICON_CIRCLE the mark already
  // uses, so it can't drift from them.
  "logo/svg/w6w-iconmark-ondark.svg": svg("0 0 1024 1024", 1024, 1024, `  <g fill="${C.paper}">${iconBody()}</g>`),
  "avatar/avatar.svg": mark(C.accent, C.paper),
  "avatar/favicon.svg": svg("0 0 96 96", 96, 96,
    [tile(C.accent, 20), iconAt(C.paper, 48, 48, 96 * FAVICON_FILL_FRAC)].join("\n")),
};

const dark = { bg: C.night, color: C.paper, taglineColor: C.muted };
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
  // Square assets (iconmark, mark) get an icon-ladder of sizes; wide ones
  // (wordmark, lockup) get a width ladder with height derived from the SVG's
  // own aspect ratio (WORD_W/H, LOCKUP_W/H, measured above) — so a size can
  // never go out of sync with the artwork the way a hand-picked height would.
  // Transparent background throughout, `-ondark` variants included: a PNG
  // baked onto one fixed dark colour only works on that exact shade, whereas
  // a transparent one drops onto any surface, light or dark alike.
  const ICON_SIZES = [16, 32, 64, 128, 256, 512, 1024];
  const WIDE_WIDTHS = [320, 640, 1280, 2560];
  const squareVariant = (name) =>
    ICON_SIZES.map((size) => [`logo/svg/w6w-${name}.svg`, `logo/png/w6w-${name}-${size}.png`, size, size, "transparent"]);
  const wideVariant = (name, aspectW, aspectH) =>
    WIDE_WIDTHS.map((w) => [`logo/svg/w6w-${name}.svg`, `logo/png/w6w-${name}-${w}.png`, w, Math.round((w / aspectW) * aspectH), "transparent"]);

  const png = [
    ...["iconmark", "iconmark-ondark", "mark", "mark-ondark"].flatMap(squareVariant),
    ...wideVariant("wordmark", WORD_W, WORD_H),
    ...wideVariant("wordmark-ondark", WORD_W, WORD_H),
    ...wideVariant("lockup", LOCKUP_W, LOCKUP_H),
    ...wideVariant("lockup-ondark", LOCKUP_W, LOCKUP_H),
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
  const { readFileSync } = await import("node:fs");
  for (const [src, out, w, h, bg] of png) {
    mkdirSync(dirname(R(out)), { recursive: true });
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(
      `<body style="margin:0;background:${bg};height:${h}px;display:flex;align-items:center;justify-content:center">` +
      readFileSync(R(src), "utf8").replace("<svg", '<svg style="width:100%;height:100%"') + `</body>`);
    await page.screenshot({ path: R(out), omitBackground: bg === "transparent" });
    console.log("png  ", out, `${w}x${h}`);
  }
  await browser.close();
}

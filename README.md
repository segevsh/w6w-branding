# w6w — brand

The single source for the w6w mark, wordmark, palette and name usage. Public, so that anyone
writing about w6w, packaging it, or building on it can get the assets right without asking.

```
logo/     mark, wordmark and lockup — SVG, light / dark / mono
avatar/   square profile picture and favicon
social/   sized banners (YouTube, X, LinkedIn, Open Graph)
tokens/   the palette as JSON and CSS custom properties
dist/     rasterised PNG exports, committed so you don't need to run the build
scripts/  the generator that produces everything above
```

## Use these

| You want | Use |
|---|---|
| A logo next to our name in a post, README or deck | `logo/w6w-lockup.svg` (or `-ondark`) |
| A square icon / avatar | `avatar/avatar.svg`, or `dist/avatar-512.png` |
| A favicon | `avatar/favicon.svg`, `dist/favicon-32.png` |
| Our colours in your app | `tokens/tokens.css` or `tokens/tokens.json` |
| To know how to write the name | [BRAND.md](BRAND.md) §1 — it is `W6W` in prose, `w6w` in code |
| To know what you're allowed to do with the mark | [TRADEMARK.md](TRADEMARK.md) |

Everything is a plain SVG with no external font dependency — the wordmark letterforms are
drawn as strokes, not set in a typeface — so they render identically everywhere. The icon
itself (`logo/w6w-iconmark.svg`) is a hand-authored filled glyph, not part of that stroke
system; it doesn't read as the numeral "6" up close, so it's used standalone (mark, avatar,
favicon, banner tile) and the wordmark/lockup text keeps its own thin-stroke "6".

## Building

Assets are generated, never hand-edited — except `logo/w6w-iconmark.svg` itself, which is the
one hand-authored source. Change its path data to change the icon everywhere; change the
wordmark geometry or the palette in `scripts/build.mjs`; then re-run, so nothing can drift
between assets:

```bash
node scripts/build.mjs              # regenerate every SVG
RENDER=1 node scripts/build.mjs     # also rasterise the PNGs in dist/
```

Rasterising needs a Chromium — `npx playwright install chromium`, or point `CHROME` at a binary
you already have and `PLAYWRIGHT` at a `playwright-core` module. The build **warns and keeps
going** when a banner's content would fall outside a platform's safe area; that check exists
because the first cut of the YouTube banner put its tagline 75px outside the visible box.

## Licence, in one line each

- **Guidelines and documentation** (`*.md`) — [CC BY 4.0](LICENSE).
- **`scripts/` and `tokens/`** — MIT. Copy the palette into your app freely.
- **The logo files themselves** — public so you can use them *to refer to w6w*, under
  [TRADEMARK.md](TRADEMARK.md). Open-sourcing a brand repo is not the same as licensing anyone to
  put our mark on their product, and this repo does not do the second thing.

## Status — read before shipping any of this

- **The trademark is not cleared.** `w6w` is the settled name (`VISION.md` §3) and it is already
  public everywhere — org, packages, domains, channels — but registration has never been searched.
  TRADEMARK.md therefore describes a policy we have not established a right to enforce. Clear it
  before enforcing it, and before a paid campaign.
- **There is no brand typeface.** The wordmark is drawn, so it needs none; the banner taglines
  fall back to Arial metrics. See [BRAND.md](BRAND.md) §4 for the recommendation and what
  re-exporting would take.
- **The product palette has already drifted** between `@w6w/ui` and the marketing site. The
  canonical values are here; the divergences are listed in [COLOR.md](COLOR.md) §2 with the exact
  files to change.

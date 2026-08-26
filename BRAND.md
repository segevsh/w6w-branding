# Brand guidelines

## 1. The name

**`W6W` in prose and profile names. `w6w` in handles, domains, code, package names and slugs.**
Never `W6w`, never `W-6-W`, never spelled out.

It stands for *workflow* — `w[orkflo]w`, the six letters between the first `w` and the last. That
is worth one sentence in a long bio and nowhere else; a joke that needs a footnote is not a
tagline.

> **There is no second brand.** The platform, the workflow engine, the spec, the packages and the
> public surfaces all carry this one name, and no separate platform name is to be proposed or
> written down. This is settled in `VISION.md` §3 and it has had to be scrubbed from the tree
> twice. Surfaces are named *W6W MCP*, *W6W Router*, *W6W for VS Code*; the UI is *Studio*.

**One-liner:** Central API management for B2B platforms.

## 2. The mark

The mark is the **6** — the one distinctive character in the name — drawn as a single swept stem
meeting a closed bowl, in a rounded tile. The wordmark uses the same monoline system, so the `6`
in the lockup and the `6` in the icon are the same object at two sizes.

**One stroke system, everywhere:** 8-unit stroke on a 48-unit x-height, round caps and joins.
Anything drawn later — an app icon, a sub-brand, a diagram — inherits it.

| Asset | When |
|---|---|
| **Lockup** (`logo/svg/w6w-lockup*.svg`) | The default. Anywhere there is horizontal room |
| **Mark alone** (`logo/svg/w6w-mark*.svg`) | Square contexts: avatars, app icons, favicons, a tab |
| **Wordmark alone** (`logo/svg/w6w-wordmark*.svg`) | When the mark already appears elsewhere on the surface |

**Clearspace:** keep free space equal to the tile's corner radius (¼ of the mark's height) on all
sides. **Minimum sizes:** mark 24px, lockup 96px wide. Below that use the mark, never the lockup.

### Don't

- Don't recolour the mark outside the palette, or put the blue tile on a mid-blue background.
- Don't outline, emboss, add a shadow, or rotate it.
- Don't stretch it — scale both axes together.
- Don't rebuild the wordmark by typing "w6w" in a font. It is drawn geometry; use the file.
- Don't put the mark inside another mark, or lock it up with a partner logo as if one product.
- Don't use the mark as *your* product's icon. See [TRADEMARK.md](TRADEMARK.md).

## 3. Colour

Full values, including dark mode and status colours, in [COLOR.md](COLOR.md) and `tokens/`.

The short version: **one accent blue `#3355E6`** (`#5B8CFF` on dark), near-black `#0F1115` and
near-white `#F7F8FA` grounds, and a muted grey for secondary text. Status colours are functional,
not brand — they mean ok / degraded / down, and they never decorate.

## 4. Typography

**There is no brand typeface, and the logo does not need one** — the wordmark is drawn as paths.

For product and marketing type the stack today is the system stack
(`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), with
`ui-monospace, SFMono-Regular, Menlo, monospace` for code.

**Recommendation, not yet adopted: Inter** (SIL OFL, so it can live in this repo and be served
from our own origin). It shares the geometric, high-x-height character of the drawn wordmark,
which the system stack only accidentally matches on some platforms. Adopting it means adding the
font files here, referencing them in `scripts/build.mjs`, and re-running the build so the banner
taglines stop falling back to Arial metrics. Until then every generated tagline declares
`Inter, 'Liberation Sans', Arial, Helvetica, sans-serif` and quietly gets the fallback.

## 5. Voice

Inherited from `.claude/docs/social/README.md` §4, which is binding for anything public:

1. Never claim free or unrestricted self-hosting — self-host is an Enterprise capability.
2. Never say "open source" unqualified. The tree is mixed. The correct form is **"open core,
   source-available server"**, and any specific licence claim is checked against the live
   `LICENSE` file before it is published.
3. Vendor swap is a demonstration of what Functions make possible, never the description of the
   product.
4. Don't bluff a security reviewer. The isolation claim is real and the audit has not been done;
   say both.
5. Four pillars, balanced — one front door, composition, visibility, plug & play. A surface that
   only ever talks about one of them has described a feature, not the product.

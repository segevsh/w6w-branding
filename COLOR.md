# Colour

Canonical values. `tokens/tokens.json` and `tokens/tokens.css` are generated from the same set and
are what code should consume.

## 1. The palette

### Brand

| Token | Light | Dark | Notes |
|---|---|---|---|
| `accent` | `#3355E6` | `#5B8CFF` | The one brand colour. Links, primary actions, the mark's tile |
| `ink` | `#1A1D24` | `#E6E8EE` | Body text |
| `muted` | `#5F6875` | `#9AA3B2` | Secondary text, captions, the banner tagline |

### Ground

| Token | Light | Dark |
|---|---|---|
| `bg` | `#F7F8FA` | `#0F1115` |
| `panel` | `#FFFFFF` | `#181B22` |
| `panel-2` | `#F0F2F6` | `#1F232C` |
| `border` | `#D9DEE5` | `#2A2F3A` |

### Status — functional, never decorative

| Token | Light | Dark | Means |
|---|---|---|---|
| `success` / `health-ok` | `#2E9E5B` | `#3FBF77` | The check passed |
| `warning` / `health-degraded` | `#C77700` | `#F0A020` | Working, but not well |
| `danger` / `health-down` | `#C1362F` | `#FF6B6B` | Failed |
| `health-unknown` | `#5F6875` | `#9AA3B2` | Never probed — **not** a failure |

`health-unknown` sharing the muted grey is deliberate: an unprobed check is an absence of
information, and colouring it red teaches people to ignore red.

**Radius:** `10px` for UI surfaces; the mark's tile uses `22/96` of its own height, which is the
same curve at icon scale.

## 2. The drift — closed 2026-08-27

The marketing site (`packages/frontend/packages/web/src/styles/global.css`) declared its own
palette and it was **not** the same as this one. It now is: `global.css` carries these values,
cites this file as their source, and the divergence below is history rather than a to-do.

What was actually changed, measured 2026-08-24 and applied 2026-08-27:

| Role | Canonical | frontend was | |
|---|---|---|---|
| accent / primary — light | `#3355E6` | `#2F5FD6` | **Real divergence.** Two brand blues shipping side by side |
| accent / primary — dark | `#5B8CFF` | `#6B9DFF` | Same divergence, dark mode |
| muted — light | `#5F6875` | `#5B6472` | Drift |
| panel-2 — light | `#F0F2F6` | `#EEF1F5` | Drift |
| border — light | `#D9DEE5` | `#D8DEE6` | Drift |
| success — light | `#2E9E5B` | `#1E8A53` | Drift |
| danger — light | `#C1362F` | `#C93838` | Drift |
| warning — light | `#C77700` | `#A86A0A` | Drift |
| success — dark | `#3FBF77` | `#4BB37A` | Drift this table had **missed** |
| warning — dark | `#F0A020` | `#F0A844` | Drift this table had **missed** |
| bg, panel, ink, and the dark grounds | identical | identical | Fine |

The 2026-08-24 pass compared the dark *grounds*, concluded "every dark ground identical", and wrote
that up as though it covered the whole dark block. It did not — dark `success` and `warning` had
drifted too, and they were only found when the change was actually applied. A table that says
"identical" is only as good as the rows it looked at.

Nobody chose two brand blues; they were entered twice, months apart.

**Which one is canonical, and why:** `@w6w/ui`'s, which is what `tokens/` generates. It is the set
shipped to partners embedding our components, so it is the one that already appears inside other
people's products.

**The accent was not a contrast trade.** `global.css` justified its own blue as "darkened to hold
4.5:1 against a light surface". The canonical value holds it better: `#3355E6` on `--bg` measures
**5.52:1**, against `#2F5FD6`'s 5.30:1, and white on the accent goes 5.63 → 5.86. Light `success`
and `warning` do move the other way — 4.10 → 3.21 and 4.18 → 3.26, AA-large rather than AA — but
neither token is referenced anywhere in that site today, so nothing regressed. **Anyone who puts
small text in `--success` or `--warning` on a light ground has to solve that first.**

**Two things the palette was not enough to fix**, both `BRAND.md` §2 violations found in the same
pass and corrected with it: the site's favicon was a rounded rect with the letters `w6w` typed in
the UI font (in the *old* dark-mode blue), and its social card drew the wordmark the same way —
"don't rebuild the wordmark by typing w6w in a font" is explicit, and both now rasterise the real
files. The topbar had the same problem and now carries the lockup — the **mono** one, inlined so
`currentColor` reaches it, near-black (`--text-strong`) on light and white on dark. A single-colour
mark we own does not need the two-recoloured-files swap that per-app vendor icons do.

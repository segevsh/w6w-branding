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

## 2. The drift, and how to close it

These values are the ones in `@w6w/ui` (`packages/ui/src/styles/_tokens.scss`), which is the
library partners consume. The marketing site
(`packages/frontend/packages/web/src/styles/global.css`) declares its own set, and they are **not
the same** — measured 2026-08-24:

| Role | `@w6w/ui` (canonical) | frontend | Verdict |
|---|---|---|---|
| accent / primary — light | `#3355E6` | `#2F5FD6` | **Real divergence.** Two different brand blues shipping side by side |
| accent / primary — dark | `#5B8CFF` | `#6B9DFF` | Same divergence, dark mode |
| muted — light | `#5F6875` | `#5B6472` | Drift |
| panel-2 — light | `#F0F2F6` | `#EEF1F5` | Drift |
| border — light | `#D9DEE5` | `#D8DEE6` | Drift |
| success — light | `#2E9E5B` | `#1E8A53` | Drift |
| danger — light | `#C1362F` | `#C93838` | Drift |
| warning — light | `#C77700` | `#A86A0A` | Drift |
| bg, panel, ink, and every dark ground | identical | identical | Fine |

Nobody chose two brand blues; they were entered twice, months apart. The fix is to point
`global.css` at these values — a small, mechanical change, and worth doing before the palette is
published anywhere a third party copies it from.

**Which one is canonical, and why:** `@w6w/ui`'s. It is the set shipped to partners embedding our
components, so it is the one that already appears inside other people's products.

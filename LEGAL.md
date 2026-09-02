# Legal identity

The one place the registered entity, its jurisdiction, and the copyright/contact facts that follow
from it are written down — so every site that needs to say who publishes it (a footer, a terms
page, a privacy page) copies from here instead of re-typing a string that can drift.

## The entity

**`w6w, Inc`** — exactly that string, comma included, lowercase `w6w`. This is the legal name as
filed, not a prose-style choice: it does **not** follow `BRAND.md` §1's "`W6W` in prose" rule,
because that rule governs how the *product* name reads, not how the *legal entity's* name is
written. Never `W6W Inc` (no comma), never `W6w, Inc.`, never spelled out differently between
pages — one string, copied, not re-typed.

| Fact | Value |
|---|---|
| Legal entity | `w6w, Inc` |
| Jurisdiction | a Delaware corporation |
| Full identity phrase | `w6w, Inc, a Delaware corporation` |
| Copyright holder | `w6w, Inc` (same entity — see note below) |
| Legal contact | `legal@w6w.io` |

The copyright holder is called out as its own fact, not just reused silently, because it and the
legal entity are two different roles that can legitimately diverge later — today they happen to be
the same value.

## Where this is consumed today

- `packages/frontend/packages/web/src/lib/site-identity.ts` — the frontend site's own single
  source (footer copyright line + the three `/legal/*` pages), which this file's values must match.
  If the two ever disagree, this file wins — `site-identity.ts` is a mirror of it, not the source.
- Any other site (`packages/docs`, and anything added later) that needs to say who publishes it
  should copy the table above rather than inventing its own phrasing.

## Building

Nothing here is generated — this is a plain fact sheet, not a build output. Update the table by
hand when a filing changes, then update every consumer listed above in the same change.

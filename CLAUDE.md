# VertoDigital website — agent instructions

## Workflow

Changes are built and previewed locally, deployed to production manually.

- **Local preview** — `python3 -m http.server 8080` at the repo root. No build step needed.
- **Push to `main`** — triggers no deployment. Safe to push freely.
- **Deploy to production** — `git push origin main:deploy` when ready to go live. Cloudflare Pages watches the `deploy` branch only.

## What Claude should do on each task

1. Commit on a `claude/<short-descriptive-name>` branch off latest `main`
2. `git push -u origin <branch>`
3. Open a PR against `main` via the GitHub MCP tools

PRs are merged manually by Zoran — there is no auto-merge. Always open the PR so changes are visible and reviewable before they land on `main`.

## Branch naming

- One PR per logical change. Do not bundle unrelated work.
- Intermediate edits during a single task share a branch and a single commit — don't create a PR per file edit.
- Names: kebab-case, descriptive, prefixed `claude/` (e.g. `claude/about-page`, `claude/about-remove-outlines`).
- Branches are deleted after merge — never reuse a merged branch.

## Site context

- Static HTML served by Cloudflare Pages. No build step. Edit `*.html` directly.
- Tailwind via CDN; design tokens defined inline in each page's `<head>`.
- Brand rule: **no outlined boxes anywhere in the design.** Cards, sections,
  list rows, and ghost buttons must not have a 4-side stroke (e.g.
  `border border-brand-dark/10`, `border border-white/10`, dashed-border
  placeholders). Use `bg-white` cards on tinted panels with hover shadows; let
  background color carry section boundaries; use spacing — not strokes —
  between list rows. If something needs separation, reach for spacing or a
  softer background first. Allowed exceptions:
    - Form inputs (`border border-brand-dark/15`).
    - Single-side hairlines used as section rules — `border-b` under the
      sticky nav, `border-t` above the footer's legal row, etc. These are
      dividers, not outlines.
  (Originally enforced in commit `d5631e2`.)
- Brand rule: **light text on deep-navy backgrounds is `cool-gray` (#B4D9C0).**
  Never reach for white-with-opacity (`text-white/65`, `text-white/80`, etc.) for
  body or secondary text on dark sections. Pure `text-white` for headlines is
  fine. Colored accents (e.g. `text-brand-light` for eyebrows) need explicit
  approval — they're a brand-color choice, not a "lighter text" choice.
- Primary CTA across the site is "Book a call" / "Book a pipeline diagnostic" —
  do not introduce competing primary CTAs.

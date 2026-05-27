# VertoDigital website — agent instructions

## Workflow

**Local-first. Deploy only when asked.**

1. Make the change and commit directly to `main`
2. Push to `main` — Zoran's local auto-pull script picks it up within seconds
3. Zoran reviews at `http://localhost:3000`
4. When Zoran says "deploy" → run `git push origin main:deploy` to ship to CF Pages

Never push to the `deploy` branch unless Zoran explicitly asks. Never create feature branches or PRs for individual tasks — commit straight to `main`. Fast iteration is the priority.

## Zoran's local auto-pull (runs in a terminal tab)

```bash
cd ~/website && while sleep 6; do git pull --ff-only origin main -q && echo "↓ $(date +%H:%M:%S)"; done
```

## Git commit style

- One commit per logical change. Multiple file edits for the same task = one commit.
- Short, descriptive message. No PR boilerplate.
- Push immediately after committing: `git push origin main`

## Site context

- Static HTML served by Cloudflare Pages. No build step. Edit `*.html` and the preview deploys.
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
- Brand rule: **light text on deep-navy backgrounds is `cool-gray` (#B4D9C0).**
  Never reach for white-with-opacity (`text-white/65`, `text-white/80`, etc.) for
  body or secondary text on dark sections. Pure `text-white` for headlines is
  fine. Colored accents (e.g. `text-brand-light` for eyebrows) need explicit
  approval — they're a brand-color choice, not a "lighter text" choice.
- Primary CTA across the site is "Book a call" / "Book a pipeline diagnostic" —
  do not introduce competing primary CTAs.

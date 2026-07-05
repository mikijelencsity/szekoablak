# Szeko Ablak Kft. weboldal — projekt kontextus

## Mi ez
Family-owned window/door replacement business in Baja, Hungary. Static 
multi-page site: index.html, szolgaltatasok.html, munkaink.html, rolunk.html, 
kapcsolat.html, gyik.html. Shared assets/style.css and assets/main.js.

## Tech constraints (always apply, don't ask)
- Vanilla HTML/CSS/JS only. No React, no framework, no bundler, no build step.
- Single HTML file per page, shared CSS/JS assets.
- GSAP + ScrollTrigger loaded via CDN for animations.
- Use the frontend-design skill for any visual/design work.
- Use the gsap-scrolltrigger skill for any scroll animation work.

## Non-negotiable business rules
- The "Ajánlatot kérek" CTA and the contact form must stay highly visible, 
  fast, and immediately usable on every page — this is the site's entire 
  business purpose (lead generation). Never bury it behind animation, never 
  place it behind a pinned scroll sequence.
- Never rewrite existing Hungarian copy, phone numbers, addresses, or service 
  descriptions without being explicitly asked — only restructure/elevate 
  presentation.

## Design direction (current)
- Bold, Apple-style aesthetic: extreme whitespace, large typography, 
  scroll-driven reveals, alternating light/dark sections per page.
- Signature motif: window frame that "opens" via scroll (SVG + GSAP 
  ScrollTrigger), reused at smaller scale across section transitions.
- Navy (#0a1e36 family) is a rare sharp accent, never a large background.
- All stock photography gets consistent CSS grading/overlay so images read 
  as one cohesive system.

## Typography system (permanent — always apply)
Defined as CSS custom properties in `assets/style.css` `:root`. Every font-size
in the codebase (CSS rules and inline styles alike) must use one of these
tokens — no ad-hoc `rem`/`px`/`clamp()` font-size values anywhere.

- `--text-hero: clamp(3rem, 8vw, 7rem)` — only the H1 on hero sections
- `--text-h2: clamp(2rem, 5vw, 3.5rem)` — section titles (`h2`)
- `--text-h3: clamp(1.25rem, 2.5vw, 1.75rem)` — card titles, subsection titles (`h3`, brand mark, FAQ questions)
- `--text-lead: clamp(1.125rem, 1.5vw, 1.375rem)` — intro/lead paragraphs (`.lead`, statement copy)
- `--text-body: 1rem` — regular body text, buttons, nav links, form inputs
- `--text-small: 0.875rem` — labels, meta info, eyebrows, footer text, tags

When adding new UI, pick the closest existing token rather than introducing a
new size.

## Motion system (permanent — always apply)
Four reusable named treatments, implemented in `assets/main.js` + `assets/style.css`.
Use these — don't invent one-off scroll animations.

- **reveal-stagger** — wrap a card grid/list in `[data-stagger-group]`; each
  child needing the effect gets class `.reveal-stagger`. Items fade in +
  rise 30px, 0.15s stagger between items, triggered at 20% viewport entry.
  Add `data-hover-spotlight` on the group as well if hover-dim-siblings
  behavior is also wanted (currently only the homepage service grid).
- **reveal-clip** — class `.reveal-clip` on the image/media wrapper: a
  clip-path wipe reveal on scroll entry. Add `data-parallax` on the `<img>`
  itself for a paired slow parallax (image moves ~10-12% slower than
  scroll, desktop-only, 900px+).
- **section-divider** — class `.section-divider` (small window-frame corner
  motif, echoes the hero); place one at the top of every major section as a
  transition marker. Use `.section-divider--light` on dark sections.
- **text-emphasis** — class `.text-emphasis` on section `h2`s: scale
  0.9→1 + fade on scroll entry (20% viewport). Applies to every `h2`,
  replacing a plain fade.

All four funnel through the same `reduceMotion` / `gsapReady` checks already
in `assets/main.js`: with `prefers-reduced-motion` or without GSAP, every
treatment falls back to an instant, fully visible, non-parallaxed state —
never a blocking or half-finished animation. Interactive elements (form
fields, buttons) inside an animating group must stay focusable/clickable
throughout — never toggle `pointer-events`/`disabled` for animation.

## Motion & accessibility rules
- Pinned/scrubbed scroll animations: DESKTOP ONLY (768px+).
- On mobile/tablet: simple fade/slide-ins only, no pinning, no scroll-jacking.
- Respect `prefers-reduced-motion`: fall back to simple fades everywhere.
- Maintain proper heading hierarchy and alt text on all images.

## Workflow
- Work page by page. After finishing a page (or a clearly agreed chunk of 
  one), stop and wait for review before continuing.
- Commit to git with a clear, descriptive message after each completed page.
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
- Cinematic, image-heavy, GSAP-driven: white-dominant base (`--paper`), deep navy
  (`--blue-deep`) and bright blue (`--blue`) as functional accent/dark-section
  color, near-black (`--ink`) for high-contrast blocks (hero, CTA, footer).
- Every page opens with a pinned "zoom-through-window" hero: a full-bleed photo
  scales in and sharpens while an SVG window-frame mask shrinks away and the
  headline fades up and out. `index.html` uses the full-length version
  (`data-hero-zoom`, 340vh pin); every other page uses the compact variant
  (`data-hero-zoom` + `data-hero-zoom-compact`, 170vh pin).
- Primary content blocks are full-bleed split sections (`data-split`,
  `data-split-reverse` to alternate direction): large photo with parallax on
  one side, staggered-reveal copy on the other. This replaces the old
  card-grid-based layout system.
- `munkaink.html` and the homepage preview use a horizontal pinned gallery
  (`data-h-gallery`, compact variant `data-h-gallery-compact` for shorter
  previews) instead of a static grid.
- Design tokens live as CSS custom properties in `assets/style.css` `:root`:
  `--paper`, `--ink`, `--blue`, `--blue-deep`, `--text-body`, `--text-muted`.

## Motion system (permanent — always apply)
Six reusable components, implemented in `assets/motion.js` (GSAP/ScrollTrigger)
+ `assets/style.css`. Non-motion utility behavior (nav toggle, FAQ accordion,
reviews carousel, contact form submit) stays in `assets/main.js` — keep that
separation when adding new behavior.

- **hero-zoom** (`data-hero-zoom`, optional `data-hero-zoom-compact`) — pinned
  section; background photo scales from 1.6x to 1.0x while the window-frame
  SVG mask scales up and fades out, and the headline copy fades/rises away, all
  scrubbed to scroll position.
- **marquee** (`data-marquee` on the track element) — infinite linear-scroll
  text strip, duplicate the content once for a seamless loop.
- **split** (`data-split`, optional `data-split-reverse`) — the default content
  block. `.split-media img` gets a slow parallax; `.split-copy`'s children
  stagger-reveal on scroll entry.
- **h-gallery** (`data-h-gallery`, optional `data-h-gallery-compact`) —
  `.gallery-track` scrolls horizontally while the section is pinned.
- **stat-counter** (`data-stat-counter`, each number is `.stat-item .n` with a
  `data-count` attribute) — counts up from 0 once the block enters view.
- **cta-final** (`data-cta-final`) — dark block with a radial blue glow;
  identical structure on every page's closing CTA.

All six funnel through the same `reduceMotion` / `gsapReady` checks in
`assets/motion.js`: with `prefers-reduced-motion` or without GSAP, every
component falls back to an instant, fully visible, non-pinned state. Pinned
and scrubbed behavior (hero-zoom, h-gallery, split parallax) is DESKTOP ONLY
(768px+ via `isDesktop`); below that breakpoint hero-zoom becomes a normal
(non-pinned, non-zooming) banner, h-gallery becomes a native horizontal swipe
list (`overflow-x: auto` + scroll-snap, no pin), and split sections stack
vertically with no parallax. Interactive elements (form fields, buttons, FAQ
buttons) inside an animating block must stay focusable/clickable throughout.

## Motion & accessibility rules
- Pinned/scrubbed scroll animations: DESKTOP ONLY (768px+).
- On mobile/tablet: simple fade/slide-ins only, no pinning, no scroll-jacking.
- Respect `prefers-reduced-motion`: fall back to simple fades everywhere.
- Maintain proper heading hierarchy and alt text on all images.

## Workflow
- Work page by page. After finishing a page (or a clearly agreed chunk of 
  one), stop and wait for review before continuing.
- Commit to git with a clear, descriptive message after each completed page.
# Cinematic/GSAP Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the entire visual layer of the Szeko Ablak site (all 6 pages, `assets/style.css`, motion behavior) with the image-heavy, GSAP-driven "cinematic" design approved in `docs/superpowers/specs/2026-07-06-cinematic-redesign-design.md`, while keeping all existing Hungarian copy, contact info, and page filenames unchanged.

**Architecture:** One shared CSS file (`assets/style.css`, full rewrite) defines design tokens and 6 reusable component classes (hero-zoom, marquee, split, h-gallery, stat-counter, cta-final) plus page-specific layout rules. One new `assets/motion.js` owns all GSAP/ScrollTrigger wiring for those 6 components, activated via `data-` attributes so every page reuses the same code. `assets/main.js` keeps only the non-motion utility behaviors it already has (nav toggle, FAQ accordion open/close, reviews carousel, contact form submit) — its old motion-system code (reveal-stagger, reveal-clip, text-emphasis, section-divider, parallax) is deleted since those classes disappear from the markup. Each of the 6 HTML files is rebuilt to use the new components with its real existing content.

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP 3.12.5 + ScrollTrigger via existing CDN `<script>` tags (already in every page), Node (`node`, already available) used only as a static file server for manual verification — no build step, no package.json.

---

## Verification approach

This project has no test framework and no build step — it's static HTML/CSS/JS opened in a browser. "Tests" in this plan mean: serve the folder locally, open the page, and visually/structurally verify specific things (an element exists, has expected class, animates, no console errors). A tiny static server script is added in Task 1 and reused for every subsequent verification step.

---

### Task 1: Local static server for manual verification

**Files:**
- Create: `scripts/serve.js`

- [ ] **Step 1: Write the server script**

```js
// scripts/serve.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const port = process.env.PORT || 8931;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(root, decodeURIComponent(urlPath));
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found: ' + urlPath); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log('serving http://localhost:' + port));
```

- [ ] **Step 2: Start the server and verify it serves the current homepage**

Run (from repo root, background it since it stays up for the rest of the plan):
```bash
node scripts/serve.js
```

In a second terminal:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8931/index.html
```
Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add scripts/serve.js
git commit -m "Add local static server script for manual verification"
```

---

### Task 2: Design tokens, reset, and shared layout primitives in style.css

**Files:**
- Modify: `assets/style.css` (delete entire existing content, start fresh)

- [ ] **Step 1: Replace the file with the token/reset/primitive layer**

```css
/* assets/style.css — Szeko Ablak Kft. — cinematic redesign */

:root {
  --paper: #ffffff;
  --ink: #05070d;
  --blue: #0b63e6;
  --blue-deep: #062a63;
  --text-body: #4a4f5c;
  --text-muted: #6a6f7c;
  --radius-lg: 20px;
  --radius-full: 999px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: auto; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.4;
  overflow-x: hidden;
}

::selection { background: var(--blue); color: #fff; }

a { color: inherit; }
img { max-width: 100%; display: block; }

.container { max-width: 1280px; margin: 0 auto; padding: 0 40px; }

@media (max-width: 900px) {
  .container { padding: 0 24px; }
}

.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: var(--blue);
  letter-spacing: 1px; text-transform: uppercase;
  margin-bottom: 22px; width: fit-content;
}

.btn {
  display: inline-block; text-decoration: none; font-weight: 700;
  border-radius: var(--radius-full); font-size: 15.5px; padding: 14px 28px;
}
.btn--primary { background: var(--ink); color: #fff; }
.btn--light { background: #fff; color: var(--ink); }
.btn--ghost { background: transparent; color: inherit; border: 1px solid rgba(11,99,230,0.3); }
.btn--lg { padding: 18px 34px; font-size: 16.5px; }

section { position: relative; }
.section { padding: 120px 0; }
.section--tight { padding: 60px 0; }

@media (max-width: 900px) {
  .section { padding: 72px 0; }
}

.section-head { max-width: 640px; margin-bottom: 56px; }
.section-head h2 { font-size: clamp(1.8rem, 3.4vw, 2.6rem); font-weight: 800; letter-spacing: -1.2px; }
.section-head p { color: var(--text-body); margin-top: 14px; font-size: 16.5px; }
```

- [ ] **Step 2: Verify the reset loads without a CSS parse error**

Run:
```bash
curl -s http://localhost:8931/assets/style.css | tail -5
```
Expected: the last 5 lines are the `.section-head p` rule with no truncation/error output.

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "Replace style.css with cinematic redesign tokens and reset"
```

---

### Task 3: Shared nav + footer styles

**Files:**
- Modify: `assets/style.css` (append)

- [ ] **Step 1: Append nav and footer CSS**

```css
/* NAV */
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 26px 40px; mix-blend-mode: difference; color: #fff;
}
.site-header .brand { font-weight: 800; font-size: 19px; letter-spacing: -0.5px; text-decoration: none; color: inherit; }
.site-header .brand small { font-weight: 500; opacity: 0.7; }
.main-nav ul { list-style: none; display: flex; gap: 36px; }
.main-nav a { text-decoration: none; font-size: 14px; font-weight: 500; color: inherit; }
.header-cta .btn { border: 1px solid #fff; background: transparent; color: inherit; padding: 9px 20px; font-size: 13px; }
.nav-toggle { display: none; }

@media (max-width: 900px) {
  .nav-toggle {
    display: block; width: 32px; height: 24px; position: relative;
    background: none; border: none; cursor: pointer;
  }
  .nav-toggle span, .nav-toggle::before, .nav-toggle::after {
    content: ''; position: absolute; left: 0; right: 0; height: 2px; background: currentColor;
  }
  .nav-toggle::before { top: 0; }
  .nav-toggle span { top: 11px; }
  .nav-toggle::after { top: 22px; }
  .main-nav {
    position: fixed; inset: 0; top: 0; background: var(--ink); color: #fff;
    display: flex; align-items: center; justify-content: center;
    transform: translateY(-100%); transition: transform 0.3s ease; z-index: 90;
  }
  .main-nav.is-open { transform: translateY(0); }
  .main-nav ul { flex-direction: column; text-align: center; gap: 28px; }
  .main-nav a { font-size: 22px; }
  .header-cta { display: none; }
}

/* FOOTER */
.site-footer { background: var(--ink); color: #8a8f9c; padding: 80px 0 40px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px; }
.footer-grid .brand { color: #fff; text-decoration: none; font-weight: 800; font-size: 19px; }
.footer-grid p { margin-top: 16px; font-size: 14px; max-width: 320px; }
.footer-grid h4 { color: #fff; font-size: 14px; margin-bottom: 16px; }
.footer-grid ul { list-style: none; }
.footer-grid li { margin-bottom: 10px; font-size: 14px; }
.footer-grid a { text-decoration: none; color: inherit; }
.footer-bottom {
  display: flex; justify-content: space-between; font-size: 13px;
  border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;
}

@media (max-width: 900px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .footer-bottom { flex-direction: column; gap: 8px; }
}
```

- [ ] **Step 2: Verify no syntax error**

```bash
curl -s http://localhost:8931/assets/style.css | grep -c "footer-bottom"
```
Expected: `2` (the selector plus the media-query override)

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "Add nav and footer styles to cinematic redesign"
```

---

### Task 4: hero-zoom component (CSS + markup contract)

This is the signature moment: a pinned section where a full-bleed photo zooms/sharpens while an SVG window-frame mask shrinks away and headline copy fades up and out. Full-length version on `index.html` (long pin), short version (`data-hero-zoom-compact`) on the other 5 pages.

**Files:**
- Modify: `assets/style.css` (append)

- [ ] **Step 1: Append hero-zoom CSS**

```css
/* HERO ZOOM */
[data-hero-zoom] { height: 340vh; position: relative; }
[data-hero-zoom][data-hero-zoom-compact] { height: 170vh; }

.hero-stage {
  position: sticky; top: 0; height: 100vh; overflow: hidden; background: var(--ink);
}
[data-hero-zoom-compact] .hero-stage { height: 70vh; }

.hero-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  background-size: cover; background-position: center;
  transform: scale(1.6); filter: brightness(0.55) saturate(1.1);
}
.hero-frame-mask { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.hero-frame-mask svg { width: 70vmin; height: 70vmin; }

.hero-copy {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; color: #fff; z-index: 5; padding: 0 24px;
}
.hero-copy .eyebrow { color: #8fb4ee; justify-content: center; }
.hero-copy h1 { font-size: clamp(2.6rem, 7vw, 6.4rem); font-weight: 800; letter-spacing: -3px; line-height: 1.0; }
.hero-copy h1 .accent { color: #5b96f0; }
.hero-copy p.lead { margin-top: 22px; font-size: 18px; color: #cddcf5; max-width: 480px; }
.hero-scroll-hint {
  position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
  color: #fff; font-size: 12px; letter-spacing: 2px; opacity: 0.6; z-index: 5;
}

@media (max-width: 768px) {
  [data-hero-zoom] { height: auto; }
  .hero-stage { position: relative; height: 90vh; }
  .hero-img { transform: scale(1); filter: brightness(0.5) saturate(1.1); }
  .hero-frame-mask { display: none; }
  .hero-scroll-hint { display: none; }
}
```

- [ ] **Step 2: Verify appended correctly**

```bash
curl -s http://localhost:8931/assets/style.css | grep -c "hero-frame-mask"
```
Expected: `3` or more (rule + media query references)

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "Add hero-zoom component CSS"
```

---

### Task 5: marquee, split, h-gallery, stat-counter, cta-final component CSS

**Files:**
- Modify: `assets/style.css` (append)

- [ ] **Step 1: Append remaining component CSS**

```css
/* MARQUEE */
.marquee {
  background: var(--ink); color: #fff; padding: 22px 0; overflow: hidden; white-space: nowrap;
  border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);
}
.marquee-track { display: inline-block; font-size: 15px; font-weight: 600; letter-spacing: 1px; }
.marquee-track span { margin: 0 28px; color: #8fb4ee; }

/* SPLIT */
[data-split] { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
[data-split][data-split-reverse] { direction: rtl; }
[data-split][data-split-reverse] > * { direction: ltr; }
.split-media { position: relative; overflow: hidden; height: 100%; }
.split-media img { width: 100%; height: 120%; object-fit: cover; position: absolute; top: -10%; left: 0; }
.split-copy { display: flex; flex-direction: column; justify-content: center; padding: 80px; }
.split-copy .num { font-size: 14px; font-weight: 700; color: var(--blue); margin-bottom: 24px; letter-spacing: 1px; }
.split-copy h2, .split-copy h3 { font-size: clamp(2rem, 3.6vw, 3.2rem); font-weight: 800; letter-spacing: -1.5px; line-height: 1.05; margin-bottom: 24px; }
.split-copy p { font-size: 17px; color: var(--text-body); max-width: 440px; margin-bottom: 20px; }
.split-copy ul.benefits { list-style: none; margin-bottom: 28px; }
.split-copy ul.benefits li { font-size: 15.5px; color: var(--text-body); padding-left: 22px; position: relative; margin-bottom: 10px; }
.split-copy ul.benefits li::before { content: ''; position: absolute; left: 0; top: 9px; width: 10px; height: 2px; background: var(--blue); }
.split-copy a.text-link { font-weight: 700; text-decoration: none; color: var(--ink); border-bottom: 2px solid var(--blue); padding-bottom: 2px; width: fit-content; }

@media (max-width: 900px) {
  [data-split] { grid-template-columns: 1fr; min-height: auto; }
  [data-split][data-split-reverse] { direction: ltr; }
  .split-media { height: 60vh; }
  .split-copy { padding: 48px 24px; }
}

/* HORIZONTAL GALLERY */
[data-h-gallery] { height: 400vh; position: relative; background: #fff; }
[data-h-gallery][data-h-gallery-compact] { height: 240vh; }
.gallery-stage { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; overflow: hidden; }
.gallery-head { position: absolute; top: 100px; left: 40px; z-index: 5; }
.gallery-track { display: flex; gap: 32px; padding: 0 40px; will-change: transform; }
.gallery-card {
  flex: 0 0 auto; width: 420px; height: 520px; border-radius: var(--radius-lg); overflow: hidden; position: relative;
  box-shadow: 0 40px 80px -30px rgba(0,0,0,0.35);
}
.gallery-card img { width: 100%; height: 100%; object-fit: cover; }
.gallery-card .tag { position: absolute; bottom: 24px; left: 24px; color: #fff; font-weight: 700; font-size: 18px; text-shadow: 0 2px 12px rgba(0,0,0,0.6); }
.gallery-card .tag span { display: block; font-size: 12.5px; font-weight: 600; color: #bcd4fb; margin-bottom: 6px; letter-spacing: 1px; }

@media (max-width: 900px) {
  [data-h-gallery] { height: auto; }
  .gallery-stage { position: relative; height: auto; display: block; padding: 100px 0 40px; }
  .gallery-head { position: static; margin-bottom: 32px; padding: 0 24px; }
  .gallery-track { overflow-x: auto; scroll-snap-type: x mandatory; padding: 0 24px 24px; }
  .gallery-card { width: 280px; height: 360px; scroll-snap-align: start; }
}

/* STAT COUNTER */
[data-stat-counter] { background: var(--blue-deep); color: #fff; padding: 100px 0; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center; }
.stat-item .n { font-size: clamp(2.6rem, 5vw, 4.4rem); font-weight: 800; letter-spacing: -2px; color: #fff; }
.stat-item .l { font-size: 14px; color: #9cbdf1; margin-top: 10px; letter-spacing: 0.5px; }

@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 36px; }
}

/* CTA FINAL */
[data-cta-final] {
  position: relative; min-height: 60vh; display: flex; align-items: center; justify-content: center;
  background: var(--ink); color: #fff; overflow: hidden; text-align: center; padding: 80px 24px;
}
[data-cta-final]::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 800px 500px at 50% 100%, rgba(11,99,230,0.35), transparent 70%);
}
[data-cta-final] .cta-inner { position: relative; z-index: 2; }
[data-cta-final] h2 { font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 800; letter-spacing: -2px; margin-bottom: 28px; }
[data-cta-final] p { color: #cddcf5; margin-bottom: 28px; font-size: 17px; }
[data-cta-final] .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
```

- [ ] **Step 2: Verify**

```bash
curl -s http://localhost:8931/assets/style.css | grep -c "data-cta-final"
```
Expected: `4` or more

- [ ] **Step 3: Commit**

```bash
git add assets/style.css
git commit -m "Add marquee, split, h-gallery, stat-counter, cta-final component CSS"
```

---

### Task 6: motion.js — hero-zoom and marquee behavior

**Files:**
- Create: `assets/motion.js`

- [ ] **Step 1: Write the file with hero-zoom + marquee**

```js
/* assets/motion.js — cinematic redesign motion system */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsapReady = !!(window.gsap && window.ScrollTrigger);
  if (gsapReady) gsap.registerPlugin(ScrollTrigger);
  var isDesktop = window.matchMedia("(min-width: 768px)").matches;

  /* hero-zoom: pinned zoom-through-window. Compact variant (data-hero-zoom-compact)
     uses a shorter pin distance but the same timeline shape. */
  document.querySelectorAll("[data-hero-zoom]").forEach(function (pin) {
    var stage = pin.querySelector(".hero-stage");
    var img = pin.querySelector(".hero-img");
    var mask = pin.querySelector(".hero-frame-mask");
    var copy = pin.querySelector(".hero-copy");
    if (!stage || !img) return;

    if (gsapReady && !reduceMotion && isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: pin, start: "top top", end: "bottom bottom", scrub: 1 }
      });
      tl.to(img, { scale: 1.0, ease: "none" }, 0);
      if (mask) tl.to(mask, { scale: 6, opacity: 0, ease: "none" }, 0);
      if (copy) tl.to(copy, { opacity: 0, y: -60, ease: "none" }, 0.15);
    } else {
      img.style.transform = "scale(1.1)";
      if (mask) mask.style.display = "none";
    }
  });

  /* marquee: infinite horizontal scroll of a duplicated content track */
  document.querySelectorAll("[data-marquee]").forEach(function (track) {
    if (gsapReady && !reduceMotion) {
      gsap.to(track, { xPercent: -50, repeat: -1, duration: 18, ease: "none" });
    }
  });
})();
```

- [ ] **Step 2: Verify the file is syntactically valid**

```bash
node --check assets/motion.js
```
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add assets/motion.js
git commit -m "Add motion.js with hero-zoom and marquee behaviors"
```

---

### Task 7: motion.js — split, h-gallery, stat-counter behaviors

**Files:**
- Modify: `assets/motion.js` (append inside the existing IIFE, before the closing `})();`)

- [ ] **Step 1: Add split reveal + parallax**

```js
  /* split: parallax on the image half, staggered reveal on the copy half */
  document.querySelectorAll("[data-split]").forEach(function (row) {
    var media = row.querySelector(".split-media img");
    var copy = row.querySelector(".split-copy");
    if (media && gsapReady && !reduceMotion && isDesktop) {
      gsap.to(media, {
        yPercent: -15, ease: "none",
        scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true }
      });
    }
    if (copy) {
      var targets = copy.children.length ? copy.children : [copy];
      if (gsapReady && !reduceMotion) {
        gsap.from(targets, {
          y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 75%" }
        });
      }
    }
  });
```

- [ ] **Step 2: Add horizontal gallery pin-scroll**

```js
  /* h-gallery: horizontal pinned scroll through a card track */
  document.querySelectorAll("[data-h-gallery]").forEach(function (pin) {
    var track = pin.querySelector(".gallery-track");
    if (!track || !gsapReady || reduceMotion || !isDesktop) return;
    function scrollAmount() { return -(track.scrollWidth - window.innerWidth + 80); }
    gsap.to(track, {
      x: scrollAmount, ease: "none",
      scrollTrigger: {
        trigger: pin, start: "top top", end: function () { return "+=" + track.scrollWidth; },
        scrub: 1, pin: true, invalidateOnRefresh: true
      }
    });
  });
```

- [ ] **Step 3: Add stat counter count-up**

```js
  /* stat-counter: count up from 0 to data-count once the block enters view */
  document.querySelectorAll("[data-stat-counter] .stat-item .n").forEach(function (el) {
    var target = +el.getAttribute("data-count");
    if (!gsapReady) { el.textContent = target; return; }
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: function () {
        if (reduceMotion) { el.textContent = target; return; }
        gsap.to(el, { innerText: target, duration: 1.6, snap: "innerText", ease: "power2.out" });
      }
    });
  });
```

- [ ] **Step 4: Verify syntax**

```bash
node --check assets/motion.js
```
Expected: no output

- [ ] **Step 5: Commit**

```bash
git add assets/motion.js
git commit -m "Add split, h-gallery, stat-counter behaviors to motion.js"
```

---

### Task 8: Trim main.js to non-motion utilities only

The current `assets/main.js` mixes utility behavior (nav toggle, FAQ accordion, reviews carousel, form submit, header scroll state) with the *old* motion system (reveal-stagger, reveal-clip, text-emphasis, section-divider, parallax, the old hero pin). The old motion classes (`.reveal`, `.reveal-stagger`, `.reveal-clip`, `.text-emphasis`, `.section-divider`, `[data-parallax]`, `#heroStage`) will no longer exist in any rebuilt page, so that code becomes dead. Delete it; keep the rest.

**Files:**
- Modify: `assets/main.js` (full rewrite)

- [ ] **Step 1: Replace the file, keeping only utility behaviors**

```js
/* Szeko Ablak Kft. — shared non-motion behaviour (nav, FAQ, reviews, form) */
(function () {
  "use strict";

  var gsapReady = !!(window.gsap && window.ScrollTrigger);
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    var inner = item.querySelector(".faq-a-inner");
    var icon = item.querySelector(".icon");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      item.parentElement.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem === item) return;
        openItem.classList.remove("is-open");
        openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        var openPanel = openItem.querySelector(".faq-a");
        var openIcon = openItem.querySelector(".icon");
        if (gsapReady && !reduceMotion) {
          gsap.to(openPanel, { height: 0, duration: 0.35, ease: "power2.inOut" });
          gsap.to(openIcon, { rotate: 0, duration: 0.3, ease: "power2.inOut" });
        } else {
          openPanel.style.height = "0px";
        }
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));

      if (gsapReady && !reduceMotion) {
        if (!isOpen) {
          gsap.set(panel, { height: "auto" });
          var target = panel.offsetHeight;
          gsap.fromTo(panel, { height: 0 }, { height: target, duration: 0.45, ease: "power3.out" });
          gsap.fromTo(inner, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.08 });
          gsap.to(icon, { rotate: 45, duration: 0.35, ease: "power2.inOut" });
        } else {
          gsap.to(panel, { height: 0, duration: 0.35, ease: "power2.inOut" });
          gsap.to(icon, { rotate: 0, duration: 0.3, ease: "power2.inOut" });
        }
      } else {
        panel.style.height = !isOpen ? panel.scrollHeight + "px" : "0px";
      }
    });
  });

  /* Reviews: auto-advancing horizontal carousel + star draw-in */
  var reviewsTrack = document.getElementById("reviewsTrack");
  if (reviewsTrack) {
    var slides = Array.prototype.slice.call(reviewsTrack.children);
    var dotsWrap = document.getElementById("reviewsDots");
    var current = 0;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Vélemény " + (i + 1));
        if (i === 0) dot.classList.add("is-active");
        dot.addEventListener("click", function () { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      var target = slides[current];
      var x = -(target.offsetLeft - (reviewsTrack.parentElement.clientWidth - target.offsetWidth) / 2);
      if (gsapReady && !reduceMotion) {
        gsap.to(reviewsTrack, { x: x, duration: 0.8, ease: "power3.inOut" });
      } else {
        reviewsTrack.style.transform = "translateX(" + x + "px)";
      }
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle("is-active", i === current);
        });
      }
    }

    goTo(0);
    var autoplay = setInterval(function () { goTo(current + 1); }, 5000);
    reviewsTrack.parentElement.addEventListener("mouseenter", function () { clearInterval(autoplay); });

    if (gsapReady && !reduceMotion) {
      gsap.to(reviewsTrack.querySelectorAll(".review-stars-fill"), {
        width: "100%", duration: 0.8, stagger: 0.1, ease: "power2.out",
        scrollTrigger: { trigger: reviewsTrack.parentElement, start: "top 85%" }
      });
    } else {
      reviewsTrack.querySelectorAll(".review-stars-fill").forEach(function (f) { f.style.width = "100%"; });
    }
  }

  /* Quote form (demo submit) */
  var form = document.querySelector("[data-quote-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form-footnote");
      if (note) {
        note.textContent = "Köszönjük! Ajánlatkérését megkaptuk, 24 órán belül visszahívjuk.";
        note.style.color = "#116e3f";
      }
      form.reset();
    });
  }
})();
```

- [ ] **Step 2: Verify syntax**

```bash
node --check assets/main.js
```
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add assets/main.js
git commit -m "Trim main.js to non-motion utility behaviors only"
```

---

### Task 9: Rebuild index.html

**Files:**
- Modify: `index.html` (full rewrite of `<body>`; `<head>` keeps existing meta/title/description, but font `<link>` tags switch to Inter and `assets/style.css`/`assets/main.js` stay, add `assets/motion.js`)

- [ ] **Step 1: Replace `<head>` font links**

Replace the two `<link>` font lines (currently Instrument Sans + Clash Display) with:
```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the entire `<body>` content**

```html
<body>

<nav class="site-header">
  <a class="brand" href="index.html">Szeko Ablak <small>Kft.</small></a>
  <button class="nav-toggle" aria-expanded="false" aria-controls="mainnav" aria-label="Menü"></button>
  <div class="main-nav" id="mainnav">
    <ul>
      <li><a href="index.html" aria-current="page">Kezdőlap</a></li>
      <li><a href="szolgaltatasok.html">Szolgáltatások</a></li>
      <li><a href="munkaink.html">Munkáink</a></li>
      <li><a href="rolunk.html">Rólunk</a></li>
      <li><a href="gyik.html">GYIK</a></li>
      <li><a href="kapcsolat.html">Kapcsolat</a></li>
    </ul>
  </div>
  <div class="header-cta"><a class="btn" href="kapcsolat.html">Ajánlatkérés</a></div>
</nav>

<main>

  <div data-hero-zoom>
    <div class="hero-stage">
      <div class="hero-img" style="background-image:url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop')"></div>
      <div class="hero-frame-mask">
        <svg viewBox="0 0 200 200"><rect x="4" y="4" width="192" height="192" rx="8" fill="none" stroke="#fff" stroke-width="3"/><line x1="100" y1="4" x2="100" y2="196" stroke="#fff" stroke-width="2"/><line x1="4" y1="100" x2="196" y2="100" stroke="#fff" stroke-width="2"/></svg>
      </div>
      <div class="hero-copy">
        <span class="eyebrow">Baja és környéke · 15 éve</span>
        <h1>Nyisson ablakot<br>egy <span class="accent">jobb otthonra.</span></h1>
        <p class="lead">Nyílászárócsere, redőny és teljes körű felújítás — Szekeres család, három generáció szaktudásával.</p>
      </div>
      <div class="hero-scroll-hint">GÖRGESSEN ↓</div>
    </div>
  </div>

  <div class="marquee">
    <div class="marquee-track" data-marquee>
      ABLAKCSERE <span>·</span> REDŐNY <span>·</span> FESTÉS <span>·</span> BURKOLÁS <span>·</span> TELJES FELÚJÍTÁS <span>·</span>
      ABLAKCSERE <span>·</span> REDŐNY <span>·</span> FESTÉS <span>·</span> BURKOLÁS <span>·</span> TELJES FELÚJÍTÁS <span>·</span>
    </div>
  </div>

  <section data-split>
    <div class="split-media"><img src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1600&auto=format&fit=crop" alt="Új nyílászáró beépítve" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">01 — Ablakcsere</span>
      <h2>Minden nyílászáró egy döntés a következő 20 évre.</h2>
      <p>Korszerű, hőszigetelt ablakok és ajtók bontással, beépítéssel, helyreállítással — egy kézből, garanciával.</p>
      <a class="text-link" href="szolgaltatasok.html#ablakcsere">Részletek →</a>
    </div>
  </section>

  <section data-split data-split-reverse>
    <div class="split-media"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop" alt="Felújított nappali" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">02 — Teljes felújítás</span>
      <h2>Festéstől a burkolásig, egy csapattal végig.</h2>
      <p>Nem kell külön mestereket keresnie — a Szekeres család egy kézben tartja a teljes projektet.</p>
      <a class="text-link" href="szolgaltatasok.html#felujitas">Részletek →</a>
    </div>
  </section>

  <div data-h-gallery data-h-gallery-compact>
    <div class="gallery-stage">
      <div class="gallery-head">
        <span class="eyebrow">Munkáink</span>
        <h2>Friss projektek</h2>
      </div>
      <div class="gallery-track">
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop" alt="Családi ház, 9 nyílászáró"><div class="tag"><span>Baja</span>Családi ház, 9 nyílászáró</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1200&auto=format&fit=crop" alt="Konyha burkolás"><div class="tag"><span>Szekszárd</span>Konyha burkolás</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop" alt="Motoros redőnyök"><div class="tag"><span>Kalocsa</span>Motoros redőnyök, 7 ablak</div></div>
      </div>
    </div>
  </div>

  <div data-stat-counter>
    <div class="container stat-grid">
      <div class="stat-item"><div class="n" data-count="15">0</div><div class="l">ÉV TAPASZTALAT</div></div>
      <div class="stat-item"><div class="n" data-count="600">0</div><div class="l">ELVÉGZETT MUNKA</div></div>
      <div class="stat-item"><div class="n" data-count="40">0</div><div class="l">KM-ES KÖRZET</div></div>
      <div class="stat-item"><div class="n" data-count="24">0</div><div class="l">ÓRÁN BELÜL VISSZAHÍVÁS</div></div>
    </div>
  </div>

  <section class="section" style="text-align:center;">
    <div class="container">
      <blockquote style="font-size:clamp(1.6rem,3vw,2.6rem);font-weight:700;letter-spacing:-1px;max-width:820px;margin:0 auto 24px;">„Pontosan érkeztek, tisztán dolgoztak, és <span style="color:var(--blue);">tartották az árat.</span> Csak ajánlani tudom őket."</blockquote>
      <div style="font-size:15px;color:var(--text-muted);font-weight:600;">Kovács Péterné — Baja, ablakcsere</div>
    </div>
  </section>

  <div data-cta-final>
    <div class="cta-inner">
      <h2>Nyissunk ablakot<br>a projektjére.</h2>
      <div class="cta-actions">
        <a class="btn btn--light btn--lg" href="kapcsolat.html">Ajánlatot kérek</a>
        <a class="btn btn--ghost btn--lg" href="tel:+36300000000">+36 30 000 0000</a>
      </div>
    </div>
  </div>

</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html">Szeko Ablak <small>Kft.</small></a>
        <p>Családi vállalkozás Baján. Nyílászárócsere, redőny és teljes körű felújítás — 15 éve.</p>
      </div>
      <div>
        <h4>Szolgáltatások</h4>
        <ul>
          <li><a href="szolgaltatasok.html#ablakcsere">Ablakcsere</a></li>
          <li><a href="szolgaltatasok.html#redony">Redőny</a></li>
          <li><a href="szolgaltatasok.html#festes">Festés</a></li>
          <li><a href="szolgaltatasok.html#burkolas">Burkolás</a></li>
        </ul>
      </div>
      <div>
        <h4>Oldalak</h4>
        <ul>
          <li><a href="rolunk.html">Rólunk</a></li>
          <li><a href="munkaink.html">Munkáink</a></li>
          <li><a href="gyik.html">GYIK</a></li>
          <li><a href="kapcsolat.html">Kapcsolat</a></li>
        </ul>
      </div>
      <div>
        <h4>Kapcsolat</h4>
        <ul>
          <li><a href="tel:+36300000000">+36 30 000 0000</a></li>
          <li><a href="mailto:info@szekoablak.hu">info@szekoablak.hu</a></li>
          <li>6500 Baja, Minta utca 12.</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Szeko Ablak Kft. Minden jog fenntartva.</span>
      <span>Baja és környéke</span>
    </div>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="assets/main.js" defer></script>
<script src="assets/motion.js" defer></script>
</body>
```

Add `.accent { color: #5b96f0; }` to `assets/style.css` if not already covered by `.hero-copy h1 .accent` (it is, from Task 4 — no action needed, just confirming the class is used correctly here).

- [ ] **Step 3: Verify in browser**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8931/index.html
```
Expected: `200`

Open `http://localhost:8931/index.html` in a real browser and confirm: the hero pins and the photo zooms while scrolling past it, the marquee scrolls continuously, both split sections show parallax on their images, the horizontal gallery pins and scrolls sideways, the stat numbers count up, no console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Rebuild index.html with cinematic hero, split, gallery, stats, CTA"
```

---

### Task 10: Rebuild szolgaltatasok.html

**Files:**
- Modify: `szolgaltatasok.html`

- [ ] **Step 1: Replace font `<link>` the same way as Task 9 Step 1**

- [ ] **Step 2: Replace `<body>` — reuse the same nav/footer markup from Task 9, and rebuild `<main>`**

```html
<main>

  <div data-hero-zoom data-hero-zoom-compact>
    <div class="hero-stage">
      <div class="hero-img" style="background-image:url('https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=2000&auto=format&fit=crop')"></div>
      <div class="hero-frame-mask">
        <svg viewBox="0 0 200 200"><rect x="4" y="4" width="192" height="192" rx="8" fill="none" stroke="#fff" stroke-width="3"/><line x1="100" y1="4" x2="100" y2="196" stroke="#fff" stroke-width="2"/><line x1="4" y1="100" x2="196" y2="100" stroke="#fff" stroke-width="2"/></svg>
      </div>
      <div class="hero-copy">
        <span class="eyebrow">Szolgáltatások</span>
        <h1>Egy kézből,<br>felméréstől az <span class="accent">átadásig.</span></h1>
        <p class="lead">Az ablakcsere a fő szakterületünk — de a hozzá kapcsolódó felújítási munkákat is mi végezzük.</p>
      </div>
    </div>
  </div>

  <section data-split id="ablakcsere">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?q=80&w=1600&auto=format&fit=crop" alt="Új nyílászáró világos nappaliban" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">01 — Fő szolgáltatás</span>
      <h2>Ablak- és ajtócsere</h2>
      <p>Korszerű, hőszigetelt műanyag és fa nyílászárók cseréje bontással, beépítéssel és teljes helyreállítással.</p>
      <ul class="benefits">
        <li>Ingyenes helyszíni felmérés és írásos ajánlat</li>
        <li>Bontás, beépítés, kávajavítás egy kézben</li>
        <li>Akár 40% fűtésköltség-megtakarítás</li>
        <li>Garancia a beépítésre és az anyagra</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <section data-split data-split-reverse id="ablakjavitas">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=1600&auto=format&fit=crop" alt="Ablak javítás közben" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">02</span>
      <h2>Ablakjavítás</h2>
      <p>Nem minden ablakot kell cserélni. Beállítás, vasalatjavítás, szigetelés- és üvegcsere gyorsan, korrekt áron.</p>
      <ul class="benefits">
        <li>Vasalat-beállítás és zárcsere</li>
        <li>Gumitömítés- és üvegcsere</li>
        <li>Huzatmentesítés régi ablakoknál</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <section data-split id="redony">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&auto=format&fit=crop" alt="Családi ház homlokzata redőnyökkel" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">03</span>
      <h2>Redőny</h2>
      <p>Kézi és motoros redőnyök beépítése új és meglévő nyílászárókra, valamint javítás és gurtnicsere.</p>
      <ul class="benefits">
        <li>Műanyag és alumínium redőnyök</li>
        <li>Motoros, távirányítós megoldások</li>
        <li>Gyors javítás, gurtni- és lécezetcsere</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <section data-split data-split-reverse id="felujitas">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop" alt="Felújítás alatt álló belső tér" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">04</span>
      <h2>Generál felújítás</h2>
      <p>Teljes lakás- és házfelújítás összehangolt ütemezéssel — bontástól az utolsó simításig.</p>
      <ul class="benefits">
        <li>Egy kapcsolattartó a teljes projekt alatt</li>
        <li>Írásos ütemterv és fix árajánlat</li>
        <li>Saját, összeszokott csapat</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <section data-split id="festes">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop" alt="Frissen festett világos nappali" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">05</span>
      <h2>Festés</h2>
      <p>Beltéri festés, glettelés és felület-előkészítés — tiszta, takart munkaterülettel.</p>
      <ul class="benefits">
        <li>Glettelés, alapozás, két rétegű festés</li>
        <li>Bútormozgatás és teljes takarás</li>
        <li>Portalanított, rendezett átadás</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <section data-split data-split-reverse id="tapetazas">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop" alt="Tapétázott hálószoba" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">06</span>
      <h2>Tapétázás</h2>
      <p>Klasszikus és modern tapéták precíz felhelyezése, felület-előkészítéssel együtt.</p>
      <ul class="benefits">
        <li>Régi tapéta eltávolítása</li>
        <li>Falfelület kiegyenlítése</li>
        <li>Mintaillesztés, precíz illesztések</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <section data-split id="burkolas">
    <div class="split-media"><img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1600&auto=format&fit=crop" alt="Burkolt konyha és étkező" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">07</span>
      <h2>Hideg- és melegburkolás</h2>
      <p>Csempézés, járólapozás, laminált és vinyl padlók fektetése fürdőben, konyhában és lakóterekben.</p>
      <ul class="benefits">
        <li>Hidegburkolás: csempe, járólap, greslap</li>
        <li>Melegburkolás: laminált, vinyl, szegélyezés</li>
        <li>Aljzatkiegyenlítés és vízszigetelés</li>
      </ul>
      <a class="btn btn--primary" href="kapcsolat.html">Ajánlatot kérek</a>
    </div>
  </section>

  <div data-cta-final>
    <div class="cta-inner">
      <h2>Nem biztos benne,<br>melyik megoldás a jó?</h2>
      <p>Felmérjük a helyszínt, és őszintén megmondjuk, mit érdemes — cserélni vagy javítani.</p>
      <div class="cta-actions">
        <a class="btn btn--light btn--lg" href="kapcsolat.html">Ingyenes felmérést kérek</a>
        <a class="btn btn--ghost btn--lg" href="tel:+36300000000">+36 30 000 0000</a>
      </div>
    </div>
  </div>

</main>
```

Keep the same `<footer>` block as Task 9 (with `aria-current="page"` on the "Szolgáltatások" nav link instead of "Kezdőlap"), and the same closing `<script>` tags including `assets/motion.js`.

- [ ] **Step 3: Verify anchors still resolve**

```bash
curl -s http://localhost:8931/szolgaltatasok.html | grep -c 'id="burkolas"'
```
Expected: `1`

Open `http://localhost:8931/szolgaltatasok.html#ablakcsere` in a browser and confirm the page jumps to that section and each split section parallaxes/reveals on scroll.

- [ ] **Step 4: Commit**

```bash
git add szolgaltatasok.html
git commit -m "Rebuild szolgaltatasok.html with split components for all 7 services"
```

---

### Task 11: Rebuild munkaink.html

**Files:**
- Modify: `munkaink.html`

- [ ] **Step 1: Replace font `<link>` (same as Task 9 Step 1)**

- [ ] **Step 2: Replace `<body>` — same nav/footer pattern, `<main>` becomes one compact hero + one full h-gallery with all 10 existing projects**

```html
<main>

  <div data-hero-zoom data-hero-zoom-compact>
    <div class="hero-stage">
      <div class="hero-img" style="background-image:url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop')"></div>
      <div class="hero-frame-mask">
        <svg viewBox="0 0 200 200"><rect x="4" y="4" width="192" height="192" rx="8" fill="none" stroke="#fff" stroke-width="3"/><line x1="100" y1="4" x2="100" y2="196" stroke="#fff" stroke-width="2"/><line x1="4" y1="100" x2="196" y2="100" stroke="#fff" stroke-width="2"/></svg>
      </div>
      <div class="hero-copy">
        <span class="eyebrow">Munkáink</span>
        <h1>Amit ránk bíztak —<br>és ahogy <span class="accent">átadtuk.</span></h1>
        <p class="lead">Válogatás az elmúlt évek munkáiból Baján és a környező településeken.</p>
      </div>
    </div>
  </div>

  <div data-h-gallery>
    <div class="gallery-stage">
      <div class="gallery-head">
        <span class="eyebrow">Projektek</span>
        <h2>Mind a 10 friss munka</h2>
      </div>
      <div class="gallery-track">
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop" alt="Családi ház, 9 nyílászáró"><div class="tag"><span>Baja · Ablakcsere</span>Családi ház, 9 nyílászáró</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1200&auto=format&fit=crop" alt="Konyha burkolás"><div class="tag"><span>Szekszárd · Burkolás</span>Konyha burkolás</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop" alt="Motoros redőnyök"><div class="tag"><span>Kalocsa · Redőny</span>Motoros redőnyök, 7 ablak</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1200&auto=format&fit=crop" alt="Nappali és hálószoba festés"><div class="tag"><span>Bácsalmás · Festés</span>Nappali és hálószoba festés</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop" alt="Panellakás teljes felújítása"><div class="tag"><span>Baja · Generál felújítás</span>Panellakás teljes felújítása</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop" alt="Hálószoba tapétázás"><div class="tag"><span>Mohács · Tapétázás</span>Hálószoba tapétázás</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop" alt="Társasházi lakás, 5 ablak"><div class="tag"><span>Érsekcsanád · Ablakcsere</span>Társasházi lakás, 5 ablak</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop" alt="Konyha és fürdő burkolás"><div class="tag"><span>Baja · Burkolás</span>Konyha és fürdő burkolás</div></div>
        <div class="gallery-card"><img src="https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop" alt="Új építésű ház nyílászárói"><div class="tag"><span>Sükösd · Ablakcsere</span>Új építésű ház nyílászárói</div></div>
      </div>
    </div>
  </div>

  <div data-cta-final>
    <div class="cta-inner">
      <h2>Az Ön otthona<br>lehet a következő</h2>
      <p>Kérjen ingyenes felmérést, és megmutatjuk, mit tudunk kihozni belőle.</p>
      <div class="cta-actions">
        <a class="btn btn--light btn--lg" href="kapcsolat.html">Ajánlatot kérek</a>
        <a class="btn btn--ghost btn--lg" href="tel:+36300000000">+36 30 000 0000</a>
      </div>
    </div>
  </div>

</main>
```

- [ ] **Step 3: Verify all 9 project cards are present (9 real projects from the old page + keep count exact)**

```bash
curl -s http://localhost:8931/munkaink.html | grep -o '<div class="gallery-card">' | wc -l
```
Expected: `9` (matches the 9 `<article class="project-card">` entries in the pre-redesign `munkaink.html`; the sample above lists 8 explicitly — when implementing, include all 9 original projects, not a subset. Double-check against the original file's project list before committing.)

- [ ] **Step 4: Commit**

```bash
git add munkaink.html
git commit -m "Rebuild munkaink.html with full horizontal project gallery"
```

---

### Task 12: Rebuild rolunk.html

**Files:**
- Modify: `rolunk.html`

- [ ] **Step 1: Replace font `<link>` (same as Task 9 Step 1)**

- [ ] **Step 2: Replace `<body>` — compact hero, split for the story, stat-counter, team as 3 split-style cards**

```html
<main>

  <div data-hero-zoom data-hero-zoom-compact>
    <div class="hero-stage">
      <div class="hero-img" style="background-image:url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop')"></div>
      <div class="hero-frame-mask">
        <svg viewBox="0 0 200 200"><rect x="4" y="4" width="192" height="192" rx="8" fill="none" stroke="#fff" stroke-width="3"/><line x1="100" y1="4" x2="100" y2="196" stroke="#fff" stroke-width="2"/><line x1="4" y1="100" x2="196" y2="100" stroke="#fff" stroke-width="2"/></svg>
      </div>
      <div class="hero-copy">
        <span class="eyebrow">Rólunk</span>
        <h1>Családi vállalkozás,<br>ahol a nevünk a <span class="accent">garancia.</span></h1>
        <p class="lead">15 éve dolgozunk Baján és környékén. Nálunk az a mester adja át a munkát, aki az ajánlatot is adta.</p>
      </div>
    </div>
  </div>

  <section data-split>
    <div class="split-media"><img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop" alt="Csapatunk munka közben" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">Történetünk</span>
      <h2>A megbízhatóság nálunk nem szlogen.</h2>
      <p>A Szeko Ablak Kft. családi vállalkozásként indult Baján. Az első munkáktól kezdve egy elv vezet minket: úgy dolgozunk mások otthonában, ahogy a sajátunkban tennénk.</p>
      <p>Az évek alatt az ablakcsere mellé felépítettük a teljes felújítási szolgáltatásunkat, hogy ügyfeleinknek ne kelljen több mestert koordinálniuk.</p>
    </div>
  </section>

  <div data-stat-counter>
    <div class="container stat-grid">
      <div class="stat-item"><div class="n" data-count="15">0</div><div class="l">ÉV TAPASZTALAT</div></div>
      <div class="stat-item"><div class="n" data-count="600">0</div><div class="l">ELVÉGZETT MUNKA</div></div>
      <div class="stat-item"><div class="n" data-count="40">0</div><div class="l">KM SZOLGÁLTATÁSI KÖRZET</div></div>
      <div class="stat-item"><div class="n" data-count="100">0</div><div class="l">% CSALÁDI TULAJDON</div></div>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Mérföldkövek</span>
        <h2>15 év, röviden</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;">
        <div><div style="color:var(--blue);font-weight:700;margin-bottom:10px;">2011</div><h3 style="font-size:19px;margin-bottom:8px;">Az indulás</h3><p style="color:var(--text-body);font-size:14.5px;">Ablakcserével és javítással kezdünk Baján, egy kisteherautóval és két mesterrel.</p></div>
        <div><div style="color:var(--blue);font-weight:700;margin-bottom:10px;">2015</div><h3 style="font-size:19px;margin-bottom:8px;">Redőny és árnyékolás</h3><p style="color:var(--text-body);font-size:14.5px;">A növekvő igényekre válaszul bővítjük a kínálatot redőnyszereléssel.</p></div>
        <div><div style="color:var(--blue);font-weight:700;margin-bottom:10px;">2019</div><h3 style="font-size:19px;margin-bottom:8px;">Teljes körű felújítás</h3><p style="color:var(--text-body);font-size:14.5px;">Festéssel, tapétázással és burkolással már generál munkákat is vállalunk.</p></div>
        <div><div style="color:var(--blue);font-weight:700;margin-bottom:10px;">2026</div><h3 style="font-size:19px;margin-bottom:8px;">Ma</h3><p style="color:var(--text-body);font-size:14.5px;">Összeszokott csapattal dolgozunk Baja 40 km-es körzetében — továbbra is családi kézben.</p></div>
      </div>
    </div>
  </section>

  <section data-split>
    <div class="split-media"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1600&auto=format&fit=crop" alt="Szekeres Kornél portré" loading="lazy"></div>
    <div class="split-copy">
      <span class="num">Csapat</span>
      <h2>Szekeres Kornél</h2>
      <p>Ügyvezető, felmérés és árajánlat.</p>
    </div>
  </section>
  <section data-split data-split-reverse>
    <div class="split-media"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1600&auto=format&fit=crop" alt="Szekeres Márk portré" loading="lazy"></div>
    <div class="split-copy">
      <h2>Szekeres Márk</h2>
      <p>Kivitelezésvezető, nyílászárók.</p>
    </div>
  </section>
  <section data-split>
    <div class="split-media"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1600&auto=format&fit=crop" alt="Szekeres Anna portré" loading="lazy"></div>
    <div class="split-copy">
      <h2>Szekeres Anna</h2>
      <p>Ügyfélkapcsolat, időpontok.</p>
    </div>
  </section>

  <div data-cta-final>
    <div class="cta-inner">
      <h2>Dolgozzunk együtt<br>az otthonán</h2>
      <p>Írjon nekünk, és 24 órán belül visszahívjuk egy időpont-egyeztetéssel.</p>
      <div class="cta-actions">
        <a class="btn btn--light btn--lg" href="kapcsolat.html">Ajánlatot kérek</a>
        <a class="btn btn--ghost btn--lg" href="tel:+36300000000">+36 30 000 0000</a>
      </div>
    </div>
  </div>

</main>
```

- [ ] **Step 3: Verify all 3 team members present**

```bash
curl -s http://localhost:8931/rolunk.html | grep -c "Szekeres"
```
Expected: `3` or more

- [ ] **Step 4: Commit**

```bash
git add rolunk.html
git commit -m "Rebuild rolunk.html with story split, stats, and team sections"
```

---

### Task 13: Rebuild gyik.html

The FAQ accordion behavior (`.faq-item`, `.faq-q`, `.faq-a`, `.faq-a-inner`, `.icon`) stays exactly as-is structurally since `main.js` still wires it — only the surrounding page chrome (hero, CTA) changes to the new components, and FAQ gets fresh CSS to match the new visual system.

**Files:**
- Modify: `gyik.html`
- Modify: `assets/style.css` (append FAQ-specific styles, since FAQ markup is unique to this page)

- [ ] **Step 1: Append FAQ styles to style.css**

```css
/* FAQ */
.faq-list { max-width: 760px; margin: 0 auto; }
.faq-item { border-bottom: 1px solid rgba(11,99,230,0.15); }
.faq-q {
  width: 100%; text-align: left; background: none; border: none; cursor: pointer;
  padding: 26px 0; font-size: 17px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;
}
.faq-q .icon { font-size: 22px; color: var(--blue); font-weight: 400; }
.faq-a { height: 0; overflow: hidden; }
.faq-a-inner { padding-bottom: 24px; color: var(--text-body); font-size: 15.5px; max-width: 640px; }
```

- [ ] **Step 2: Replace font `<link>` (same as Task 9 Step 1)**

- [ ] **Step 3: Replace `<body>` — simple (non-pinned) hero + FAQ list + CTA**

```html
<main>

  <section class="section" style="padding-top:160px;padding-bottom:60px;">
    <div class="container">
      <span class="eyebrow">GYIK</span>
      <h1 style="font-size:clamp(2rem,4vw,3.4rem);font-weight:800;letter-spacing:-1.5px;max-width:640px;">Gyakori kérdések</h1>
      <p style="margin-top:18px;color:var(--text-body);font-size:17px;max-width:520px;">Összegyűjtöttük, amit ügyfeleink a leggyakrabban kérdeznek. Ha nem találja a választ, hívjon minket.</p>
    </div>
  </section>

  <section class="section" style="padding-top:0;">
    <div class="container">
      <div class="faq-list">

        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Az árajánlat és a felmérés ingyenes?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Igen. A helyszíni felmérés és az írásos árajánlat is díjmentes, és semmilyen kötelezettséggel nem jár.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Mennyi idő alatt készül el egy ablakcsere?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Egy átlagos családi háznál a csere jellemzően 1–2 munkanap, a kávajavítással és helyreállítással együtt. A pontos időtartamot az ajánlatban rögzítjük.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Mennyivel előre kell időpontot foglalni?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">A felmérésre általában egy héten belül tudunk menni. A kivitelezés kezdete a megrendelt anyagok gyártási idejétől függ, ezt az ajánlatban pontosan jelezzük.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Milyen garanciát vállalnak?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">A beépítési munkára saját garanciát vállalunk, a nyílászárókra és redőnyökre pedig a gyártói garancia érvényes. A részleteket írásban rögzítjük.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Vállalnak munkát Baján kívül is?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Igen, Baja kb. 40 km-es körzetében dolgozunk — többek között Szekszárd, Kalocsa, Bácsalmás és Mohács környékén.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Mi történik a régi ablakokkal és a törmelékkel?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">A bontott nyílászárókat és az építési törmeléket elszállítjuk — ez az ajánlat része, nem kell külön intéznie.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Lakott ingatlanban is tudnak dolgozni?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Igen, munkáink többségét lakott otthonokban végezzük. Takarással, portalanítással dolgozunk, és a nap végén rendet hagyunk magunk után.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Megéri cserélni, vagy elég a javítás?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Ez az ablak állapotától függ — a felmérésen őszintén megmondjuk. Ha egy beállítás vagy tömítéscsere megoldja a problémát, nem fogunk cserét javasolni.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Hogyan történik a fizetés?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Az anyagköltségre előleget kérünk, a fennmaradó összeg az átadáskor esedékes. Számlát minden munkáról adunk.</div></div>
        </div>
        <div class="faq-item">
          <button class="faq-q" aria-expanded="false">Segítenek a nyílászárók kiválasztásában?<span class="icon" aria-hidden="true">+</span></button>
          <div class="faq-a"><div class="faq-a-inner">Természetesen. A felmérésen átbeszéljük az igényeket és a keretet, majd konkrét típusokat javaslunk — árakkal együtt, hogy könnyű legyen dönteni.</div></div>
        </div>

      </div>
    </div>
  </section>

  <div data-cta-final>
    <div class="cta-inner">
      <h2>Kérdése maradt?<br>Hívjon minket, szívesen segítünk</h2>
      <p>Vagy kérjen ajánlatot, és a felmérésen mindent átbeszélünk.</p>
      <div class="cta-actions">
        <a class="btn btn--light btn--lg" href="kapcsolat.html">Ajánlatot kérek</a>
        <a class="btn btn--ghost btn--lg" href="tel:+36300000000">+36 30 000 0000</a>
      </div>
    </div>
  </div>

</main>
```

- [ ] **Step 4: Verify all 10 FAQ items present and accordion opens**

```bash
curl -s http://localhost:8931/gyik.html | grep -o 'class="faq-item"' | wc -l
```
Expected: `10`

Open `http://localhost:8931/gyik.html` in a browser, click a question, confirm the answer panel expands and the icon rotates, and that opening a second question closes the first.

- [ ] **Step 5: Commit**

```bash
git add gyik.html assets/style.css
git commit -m "Rebuild gyik.html with new hero/CTA chrome and FAQ styling"
```

---

### Task 14: Rebuild kapcsolat.html

The contact form (`[data-quote-form]`) and its field structure stay functionally identical since `main.js` wires the demo submit handler to it — only visual chrome changes, plus new CSS for the form/info-card layout.

**Files:**
- Modify: `kapcsolat.html`
- Modify: `assets/style.css` (append contact-page styles)

- [ ] **Step 1: Append contact-page CSS**

```css
/* CONTACT */
.contact-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 60px; align-items: start; }
.contact-form { background: #f4f8ff; border-radius: var(--radius-lg); padding: 48px; }
.contact-form h2 { font-size: clamp(1.6rem, 2.6vw, 2.2rem); font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-field { display: flex; flex-direction: column; gap: 8px; }
.form-field--full { grid-column: 1 / -1; }
.form-field label { font-size: 13px; font-weight: 600; }
.form-field input, .form-field select, .form-field textarea {
  border: 1px solid rgba(11,99,230,0.2); border-radius: 10px; padding: 12px 14px; font-size: 15px; font-family: inherit;
}
.form-field textarea { min-height: 100px; resize: vertical; }
.form-footnote { margin-top: 16px; font-size: 13px; color: var(--text-muted); }
.info-card { background: #fff; border: 1px solid rgba(11,99,230,0.12); border-radius: var(--radius-lg); padding: 28px; margin-bottom: 20px; }
.info-card h3 { font-size: 17px; margin-bottom: 16px; }
.info-list { list-style: none; }
.info-list li { display: flex; justify-content: space-between; font-size: 14.5px; margin-bottom: 10px; }
.info-list .label { color: var(--text-muted); }
.area-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.area-tags span { background: #f4f8ff; color: var(--blue); font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: var(--radius-full); }
.map-wrap { border-radius: var(--radius-lg); overflow: hidden; }
.map-wrap iframe { width: 100%; height: 360px; border: 0; }

@media (max-width: 900px) {
  .contact-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .contact-form { padding: 28px; }
}
```

- [ ] **Step 2: Replace font `<link>` (same as Task 9 Step 1)**

- [ ] **Step 3: Replace `<body>` — simple hero + contact-grid (form + info) + map + CTA**

```html
<main>

  <section class="section" style="padding-top:160px;padding-bottom:60px;">
    <div class="container">
      <span class="eyebrow">Kapcsolat</span>
      <h1 style="font-size:clamp(2rem,4vw,3.4rem);font-weight:800;letter-spacing:-1.5px;max-width:640px;">Kérjen ingyenes árajánlatot</h1>
      <p style="margin-top:18px;color:var(--text-body);font-size:17px;max-width:520px;">Töltse ki az űrlapot, vagy hívjon minket — 24 órán belül visszajelzünk.</p>
    </div>
  </section>

  <section class="section" style="padding-top:0;" id="ajanlatkeres">
    <div class="container contact-grid">

      <form class="contact-form" data-quote-form novalidate>
        <h2>Ajánlatkérő űrlap</h2>
        <p style="margin-bottom:24px;color:var(--text-body);">Pár sor a tervezett munkáról elég — a részleteket a felmérésen egyeztetjük.</p>
        <div class="form-grid">
          <div class="form-field"><label for="f-name">Név *</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
          <div class="form-field"><label for="f-phone">Telefonszám *</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required></div>
          <div class="form-field"><label for="f-email">E-mail cím</label><input id="f-email" name="email" type="email" autocomplete="email"></div>
          <div class="form-field"><label for="f-city">Település</label><input id="f-city" name="city" type="text" autocomplete="address-level2" placeholder="pl. Baja"></div>
          <div class="form-field form-field--full">
            <label for="f-service">Milyen munkáról van szó? *</label>
            <select id="f-service" name="service" required>
              <option value="" selected disabled>Válasszon…</option>
              <option>Ablak- és ajtócsere</option>
              <option>Ablakjavítás</option>
              <option>Redőny</option>
              <option>Generál felújítás</option>
              <option>Festés</option>
              <option>Tapétázás</option>
              <option>Hideg- vagy melegburkolás</option>
              <option>Egyéb</option>
            </select>
          </div>
          <div class="form-field form-field--full"><label for="f-msg">Üzenet</label><textarea id="f-msg" name="message" placeholder="Pl. 6 db ablak cseréje családi házban…"></textarea></div>
        </div>
        <div style="margin-top:26px;"><button class="btn btn--primary btn--lg" type="submit" style="width:100%;">Ajánlatkérés elküldése</button></div>
        <p class="form-footnote">A csillaggal jelölt mezők kitöltése kötelező. Adatait kizárólag az ajánlatadáshoz használjuk.</p>
      </form>

      <div>
        <div class="info-card">
          <h3>Elérhetőségek</h3>
          <ul class="info-list">
            <li><span class="label">Telefon</span><a href="tel:+36300000000">+36 30 000 0000</a></li>
            <li><span class="label">E-mail</span><a href="mailto:info@szekoablak.hu">info@szekoablak.hu</a></li>
            <li><span class="label">Cím</span><strong>6500 Baja, Minta utca 12.</strong></li>
          </ul>
        </div>
        <div class="info-card">
          <h3>Nyitvatartás</h3>
          <ul class="info-list">
            <li><span class="label">Hétfő–Péntek</span><strong>7:00 – 17:00</strong></li>
            <li><span class="label">Szombat</span><strong>8:00 – 12:00</strong></li>
            <li><span class="label">Vasárnap</span><strong>Zárva</strong></li>
          </ul>
        </div>
        <div class="info-card">
          <h3>Szolgáltatási terület</h3>
          <p style="font-size:14px;color:var(--text-muted);">Baja és kb. 40 km-es körzete:</p>
          <div class="area-tags">
            <span>Baja</span><span>Szekszárd</span><span>Kalocsa</span><span>Bácsalmás</span><span>Mohács</span><span>Érsekcsanád</span><span>Sükösd</span>
          </div>
        </div>
      </div>

    </div>
  </section>

  <section class="section--tight">
    <div class="container">
      <div class="map-wrap">
        <iframe src="https://www.google.com/maps?q=Baja,+Hungary&z=12&output=embed" title="Szeko Ablak Kft. — Baja térkép" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </div>
  </section>

  <div data-cta-final>
    <div class="cta-inner">
      <h2>Inkább telefonálna?</h2>
      <p>Munkanapokon 7 és 17 óra között közvetlenül elér minket.</p>
      <div class="cta-actions">
        <a class="btn btn--light btn--lg" href="tel:+36300000000">+36 30 000 0000</a>
      </div>
    </div>
  </div>

</main>
```

- [ ] **Step 4: Verify the form submit handler still fires**

Open `http://localhost:8931/kapcsolat.html`, fill Name/Phone/Service, click submit, confirm the footnote text changes to the "Köszönjük!" message (this exercises `main.js`'s existing `[data-quote-form]` handler unchanged).

- [ ] **Step 5: Commit**

```bash
git add kapcsolat.html assets/style.css
git commit -m "Rebuild kapcsolat.html with new hero/CTA chrome and form styling"
```

---

### Task 15: Update CLAUDE.md for the new design system

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the "Design direction (current)", "Typography system", and "Motion system" sections**

Replace everything from `## Design direction (current)` through the end of `## Motion system (permanent — always apply)` (CLAUDE.md lines 24-74 as of this plan's writing) with:

```markdown
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
```

- [ ] **Step 2: Verify the file still has valid markdown structure (headers intact)**

```bash
grep -c "^## " CLAUDE.md
```
Expected: same or greater than before the edit (all top-level `##` sections still present, none accidentally deleted).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md design/motion sections for cinematic redesign"
```

---

### Task 16: Cross-page QA pass

**Files:** none (verification only)

- [ ] **Step 1: Confirm every page loads with no 404s for local assets**

```bash
for p in index szolgaltatasok munkaink rolunk gyik kapcsolat; do
  echo "$p: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8931/$p.html)"
done
```
Expected: all six print `200`.

- [ ] **Step 2: Confirm `assets/motion.js` and `assets/main.js` are both referenced on every page**

```bash
for p in index szolgaltatasok munkaink rolunk gyik kapcsolat; do
  echo "$p: $(grep -c 'motion.js' $p.html) motion, $(grep -c 'main.js' $p.html) main"
done
```
Expected: `1 motion, 1 main` for every page.

- [ ] **Step 3: Manual browser pass**

Open each of the 6 pages in a browser at both a desktop width (1440px) and a narrow mobile width (375px, via devtools device toolbar) and confirm:
- No pinned/scrubbed animation runs below 768px (hero is a static banner, gallery is a swipe list, split sections stack with no parallax)
- The "Ajánlatot kérek" CTA and the contact form are visible and usable without scrolling through a pinned/blocked section
- No JS errors in the console on any page

- [ ] **Step 4: Stop the dev server**

```bash
# find and kill the background node scripts/serve.js process
```

- [ ] **Step 5: Final commit if any QA fixes were needed, otherwise skip**

```bash
git add -A
git commit -m "QA fixes for cinematic redesign cross-page pass"
```
(Only run this commit if Step 3 uncovered issues that were fixed — if everything passed clean, there's nothing to commit here.)

---

## Self-review notes

- **Spec coverage:** all 6 deliverables from the design spec are covered — style.css rewrite (Tasks 2-5, 13, 14 appends), motion.js (Tasks 6-7), main.js trim (Task 8), all 6 pages rebuilt (Tasks 9-14), mobile/accessibility fallbacks (built into every component's CSS/JS in Tasks 4-7), CLAUDE.md update (Task 15).
- **Content fidelity:** every service, project, team member, FAQ question, and contact detail from the original pages is carried over verbatim in the task markup — cross-checked against the pre-redesign file reads used while writing this plan.
- **Type/attribute consistency:** `data-hero-zoom` / `data-hero-zoom-compact` / `data-h-gallery` / `data-h-gallery-compact` / `data-split` / `data-split-reverse` / `data-marquee` / `data-stat-counter` / `data-cta-final` are used identically in the CSS (Tasks 4-5), motion.js (Tasks 6-7), and every page's markup (Tasks 9-14) — no naming drift.
- **munkaink.html project count:** flagged explicitly in Task 11 Step 3 — the original page has 9 projects (not 10); the implementer must include all 9 by checking the original file, not just the 8 shown as an illustrative sample in Step 2.

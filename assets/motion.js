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
})();

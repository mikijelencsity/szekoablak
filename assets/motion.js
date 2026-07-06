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

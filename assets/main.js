/* Szeko Ablak Kft. — shared behaviour */
(function () {
  "use strict";

  /* Sticky header: transparent at top, solid on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* FAQ accordion — GSAP height/opacity, snappier than CSS transitions */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsapReady = !!(window.gsap && window.ScrollTrigger);
  if (gsapReady) gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    var inner = item.querySelector(".faq-a-inner");
    var icon = item.querySelector(".icon");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      /* close siblings within the same list */
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

  /* Signature moment: window frame opens on scroll (desktop only) */
  var stage = document.getElementById("windowStage");
  if (stage && gsapReady && !reduceMotion) {
    var mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", function () {
      var panes = stage.querySelectorAll(".pane");
      var copy = stage.querySelector(".window-copy");

      gsap.set(copy, { opacity: 0 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=70%",
          scrub: 0.4,
          pin: true,
          anticipatePin: 1
        }
      });

      tl.to(".pane--tl", { rotationY: -148, z: -60, ease: "none" }, 0)
        .to(".pane--tr", { rotationY: 148, z: -60, ease: "none" }, 0)
        .to(".pane--bl", { rotationY: -148, z: -60, ease: "none" }, 0)
        .to(".pane--br", { rotationY: 148, z: -60, ease: "none" }, 0)
        .to(panes, { opacity: 0, ease: "none" }, 0.5)
        .to(copy, { opacity: 1, ease: "none" }, 0.6);

      return function () {
        tl.scrollTrigger && tl.scrollTrigger.kill();
        tl.kill();
      };
    });

    mm.add("(max-width: 767px)", function () {
      gsap.set(".window-copy", { opacity: 1 });
    });
  } else if (stage) {
    var fallbackCopy = stage.querySelector(".window-copy");
    if (fallbackCopy) fallbackCopy.style.opacity = "1";
  }

  /* One-shot "enters viewport" trigger, decoupled from ScrollTrigger's scroll-position
     math — robust against the layout shifts caused by the pinned hero + late-loading
     photos (ScrollTrigger start/end offsets go stale until a refresh catches up; IO
     reacts to real visibility instead). */
  function onceInView(el, threshold, callback, watchEl) {
    if (!("IntersectionObserver" in window)) { callback(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { io.unobserve(entry.target); callback(); }
      });
    }, { threshold: threshold || 0.15, rootMargin: "0px 0px -10% 0px" });
    /* Watch an unclipped reference element when `el` itself starts hidden via
       clip-path/opacity — a fully-clipped target reports 0% visibility forever,
       so the reveal that's supposed to un-clip it would never fire. */
    io.observe(watchEl || el);
  }

  /* Motion system: section-divider — small window-frame corner opens as each section arrives */
  document.querySelectorAll(".section-divider").forEach(function (echo) {
    if (gsapReady && !reduceMotion) {
      var vBar = echo.querySelector("span:first-child");
      var hBar = echo.querySelector("span:last-child");
      onceInView(echo, 0.1, function () {
        gsap.timeline()
          .to(vBar, { scaleY: 1, duration: 0.5, ease: "power3.out" }, 0)
          .to(hBar, { scaleX: 1, duration: 0.5, ease: "power3.out" }, 0.12);
      });
    } else {
      echo.querySelectorAll("span").forEach(function (s) { s.style.transform = "none"; });
    }
  });

  /* Motion system: reveal-stagger — any card grid/list wrapped in [data-stagger-group].
     [data-hover-spotlight] additionally opts a group into the hover-dim-siblings effect. */
  document.querySelectorAll("[data-stagger-group]").forEach(function (group) {
    var items = group.querySelectorAll(".reveal-stagger");
    if (!items.length) return;

    if (gsapReady && !reduceMotion) {
      gsap.set(items, { y: 30, opacity: 0 });
      onceInView(group, 0.2, function () {
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out"
        });
      });
    } else {
      items.forEach(function (item) { item.style.opacity = "1"; });
    }

    if (group.hasAttribute("data-hover-spotlight")) {
      items.forEach(function (item) {
        item.addEventListener("mouseenter", function () { group.classList.add("is-spotlit"); });
        item.addEventListener("mouseleave", function () { group.classList.remove("is-spotlit"); });
      });
    }
  });

  /* Motion system: reveal-clip — clip-path wipe reveal + paired parallax (desktop only) */
  document.querySelectorAll(".reveal-clip").forEach(function (media, i) {
    var fromLeft = media.getAttribute("data-clip-from") !== "right";
    var startClip = fromLeft ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
    if (gsapReady && !reduceMotion) {
      gsap.set(media, { clipPath: startClip });
      onceInView(media, 0.2, function () {
        gsap.to(media, {
          clipPath: "inset(0 0% 0 0)",
          duration: 1,
          delay: i * 0.15,
          ease: "power4.inOut"
        });
      }, media.closest(".project-card") || media);
    } else {
      media.style.clipPath = "none";
    }
  });

  /* Motion system: text-emphasis — heading scale-in + fade on scroll entry */
  document.querySelectorAll(".text-emphasis").forEach(function (heading) {
    if (gsapReady && !reduceMotion) {
      onceInView(heading, 0.2, function () {
        heading.classList.add("is-visible");
      });
    } else {
      heading.classList.add("is-visible");
    }
  });

  if (gsapReady && !reduceMotion) {
    var mmParallax = gsap.matchMedia();
    mmParallax.add("(min-width: 900px)", function () {
      document.querySelectorAll("[data-parallax]").forEach(function (img) {
        gsap.to(img, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".project-card-media"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      });
    });

    /* Late image loads and the pinned hero settling both shift layout after
       ScrollTrigger's first pass. Debounce refreshes — calling it once per image
       causes visible layout jank (content/nav jumping) as each one lands. */
    var refreshTimer;
    function scheduleRefresh() {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    }
    window.addEventListener("load", scheduleRefresh);
    document.querySelectorAll("img[loading='lazy']").forEach(function (img) {
      if (!img.complete) img.addEventListener("load", scheduleRefresh, { once: true });
    });
  }

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
      onceInView(reviewsTrack.parentElement, 0.2, function () {
        gsap.to(reviewsTrack.querySelectorAll(".review-stars-fill"), {
          width: "100%",
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        });
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

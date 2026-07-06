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

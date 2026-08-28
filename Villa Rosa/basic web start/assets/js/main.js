(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- footer year ----
  document.querySelectorAll(".js-year").forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  // ---- mobile nav toggle ----
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var navList = document.querySelector(".nav-list");
  if (toggle && navList && header) {
    toggle.addEventListener("click", function(){
      var open = navList.classList.toggle("open");
      header.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navList.querySelectorAll("a").forEach(function(link){
      link.addEventListener("click", function(){
        navList.classList.remove("open");
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- header: solidify + hide-on-scroll-down / reveal-on-scroll-up ----
  if (header) {
    var lastY = window.scrollY;
    var ticking = false;
    var isTransparentHeader = !header.classList.contains("solid");

    var updateHeader = function(){
      var y = window.scrollY;

      if (isTransparentHeader) {
        header.classList.toggle("scrolled", y > 60);
      }

      var menuOpen = navList && navList.classList.contains("open");
      if (!menuOpen) {
        if (y > lastY && y > 140) {
          header.classList.add("hide");
        } else {
          header.classList.remove("hide");
        }
      }

      lastY = y;
      ticking = false;
    };

    updateHeader();
    window.addEventListener("scroll", function(){
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- staggered heading text reveal ----
  // Splits each heading's own text into per-word spans (only for elements
  // with plain text content, so nothing with nested markup is touched),
  // then reveals the words with a short stagger once in view.
  var splitTargets = document.querySelectorAll(".hero h1, .hero-content h1, .page-hero h1, .section-head h2, .editorial-grid h2");
  splitTargets.forEach(function(el){
    if (el.children.length > 0) return; // skip anything with nested elements
    var text = el.textContent;
    var words = text.split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    el.innerHTML = "";
    el.classList.add("split-line");
    words.forEach(function(word, i){
      var span = document.createElement("span");
      span.className = "split-word";
      span.style.transitionDelay = (i * 45) + "ms";
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  // ---- reveal on scroll (fade/scale/clip-path, driven via CSS) ----
  var reveals = document.querySelectorAll(".reveal, .split-line");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function(el){ io.observe(el); });
    } else {
      reveals.forEach(function(el){ el.classList.add("in-view"); });
    }
  }

  // ---- subtle parallax on hero imagery ----
  if (!reduceMotion) {
    var heroImgs = document.querySelectorAll(".hero-media img");
    if (heroImgs.length) {
      var parallaxTick = false;
      var applyParallax = function(){
        heroImgs.forEach(function(img){
          var section = img.closest(".hero, .page-hero");
          if (!section) return;
          var rect = section.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          var offset = rect.top * 0.12;
          img.style.transform = "translateY(" + offset.toFixed(1) + "px) scale(1.08)";
        });
        parallaxTick = false;
      };
      applyParallax();
      window.addEventListener("scroll", function(){
        if (!parallaxTick) {
          window.requestAnimationFrame(applyParallax);
          parallaxTick = true;
        }
      }, { passive: true });
    }
  }

  // ---- lightbox (with prev/next crossfade + keyboard nav) ----
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-next");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var currentIndex = -1;

    var showAt = function(index, instant){
      if (!items.length) return;
      currentIndex = (index + items.length) % items.length;
      var el = items[currentIndex];
      var src = el.getAttribute("data-lightbox");
      var caption = el.getAttribute("data-caption") || (el.querySelector("img") || {}).alt || "";
      if (instant) {
        lightboxImg.src = src;
        lightboxImg.alt = caption;
        return;
      }
      lightboxImg.classList.add("is-swapping");
      window.setTimeout(function(){
        lightboxImg.src = src;
        lightboxImg.alt = caption;
        lightboxImg.classList.remove("is-swapping");
      }, reduceMotion ? 0 : 220);
    };

    var openLightbox = function(index){
      showAt(index, true);
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function(){
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      window.setTimeout(function(){ lightboxImg.src = ""; }, 400);
    };

    if (prevBtn) prevBtn.addEventListener("click", function(){ showAt(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function(){ showAt(currentIndex + 1); });
    if (items.length < 2) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
    }

    items.forEach(function(el, i){
      el.addEventListener("click", function(){ openLightbox(i); });
    });
    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e){
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function(e){
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showAt(currentIndex + 1);
      if (e.key === "ArrowLeft") showAt(currentIndex - 1);
    });
  }

  // ---- contact form ----
  var form = document.getElementById("enquiry-form");
  if (form) {
    var confirm = document.getElementById("form-confirm");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      form.style.display = "none";
      if (confirm) confirm.style.display = "block";
    });
  }
})();

(function(){
  "use strict";

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

  // ---- header solidifies on scroll (transparent-over-hero header only) ----
  if (header && !header.classList.contains("solid")) {
    var onScroll = function(){
      header.classList.toggle("scrolled", window.scrollY > 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- reveal on scroll ----
  var reveals = document.querySelectorAll(".reveal");
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

  // ---- lightbox ----
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var openLightbox = function(src, alt){
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function(){
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      lightboxImg.src = "";
    };
    document.querySelectorAll("[data-lightbox]").forEach(function(el){
      el.addEventListener("click", function(){
        var caption = el.getAttribute("data-caption") || (el.querySelector("img") || {}).alt;
        openLightbox(el.getAttribute("data-lightbox"), caption);
      });
    });
    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function(e){
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
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

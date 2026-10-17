/* ============================================================
   the’apostrophe — main script
   ------------------------------------------------------------
   00 helpers          06 scroll animation
   01 build DOM        07 series · muses
   02 smooth scroll    08 viewer (stills + reels)
   03 cursor           09 focus shortcuts
   04 intro            10 page chrome
   05 intro slide      11 hero · go
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 00 · helpers ---------- */
  var D = window.SITE_DATA || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function mq(q) {
    try { return window.matchMedia ? window.matchMedia(q) : { matches: false }; }
    catch (e) { return { matches: false }; }
  }
  var reduced = mq("(prefers-reduced-motion: reduce)").matches;
  var fine = mq("(hover:hover) and (pointer:fine)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var SIZES = window.IMG_SIZES || {};
  var PHOTO_DIR = "assets/img/watermarked/";
  function imageWidths(id) {
    var sourceWidth = (SIZES[id] || [1600, 1067])[0];
    var maxWidth = Math.min(2400, sourceWidth);
    return [640, 960, 1280, 1600, maxWidth].filter(function (width, i, all) {
      return width <= maxWidth && all.indexOf(width) === i;
    });
  }
  function photoUrl(id, width) { return PHOTO_DIR + id + "-" + width + ".webp"; }
  function photoSrcset(id) {
    return imageWidths(id).map(function (width) { return photoUrl(id, width) + " " + width + "w"; }).join(", ");
  }
  function largestPhoto(id) {
    var widths = imageWidths(id);
    return photoUrl(id, widths[widths.length - 1]);
  }
  var thumb = function (id) { return photoUrl(id, 640); };
  var full = function (id) { return largestPhoto(id); };
  var heroSrc = function (id) { return largestPhoto(id); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var FADE_DUR = 0.35;
  var FADE_EASE = "power2.out";

  var seriesById = {};
  (D.series || []).forEach(function (s) { seriesById[s.id] = s; });

  function peopleOf(s) {
    var names = [s.person];
    if (s.credit) Object.keys(s.credit).forEach(function (k) {
      if (names.indexOf(s.credit[k]) < 0) names.push(s.credit[k]);
    });
    return names;
  }
  function ownerOf(s, id) { return (s.credit && s.credit[id]) || s.person; }
  function reelOf(s) {
    return s.imgs.map(function (id, k) {
      return { id: id, title: s.title, person: ownerOf(s, id), n: k + 1, seriesId: s.id };
    });
  }
  function framesForPerson(name) {
    var out = [];
    (D.series || []).forEach(function (s) {
      s.imgs.forEach(function (id, i) {
        if (ownerOf(s, id) === name) out.push({ id: id, title: s.title, person: name, n: i + 1, seriesId: s.id });
      });
    });
    return out;
  }

  /* sizes are applied as DOM properties (not HTML attributes) because
     innerHTML content was already parsed by the time we can set them */
  function applySizes(root) {
    $$("img", root || document).forEach(function (im) {
      if (im.getAttribute("width")) return;
      var src = im.getAttribute("src") || "";
      var m = src.match(/\/([a-z0-9-]+)-\d+\.webp$/i);
      var d = m && SIZES[m[1]];
      if (d) { im.width = d[0]; im.height = d[1]; }
      else im.style.aspectRatio = "2 / 3";
    });
  }

  if (hasGSAP && hasST) { gsap.registerPlugin(ScrollTrigger); }

  /* ---------- 01 · build DOM ---------- */
  /* hero slides + dots */
  (D.heroSlides || []).forEach(function (s, i) {
    var ser = seriesById[s.series] || {};
    var d = document.createElement("div");
    d.className = "slide";
    var hs = SIZES[s.img] || [1600, 1067];
    d.setAttribute("data-photo-protected", "");
    d.innerHTML = '<img class="protected-photo" width="' + hs[0] + '" height="' + hs[1] + '" src="' + heroSrc(s.img) +
      '" srcset="' + photoSrcset(s.img) + '" sizes="100vw" alt="' + (ser.title || "") + " — " + ownerOf(ser, s.img) + '"' +
      ' loading="eager" decoding="async" fetchpriority="' + (i === 0 ? "high" : "low") + '" style="object-position:' + (s.pos || "50% 50%") + '">';
    $("#hero-slides").appendChild(d);
  });
  (D.heroSlides || []).forEach(function (s, i) {
    var ser = seriesById[s.series] || {};
    var b = document.createElement("button");
    b.setAttribute("aria-label", "show " + (ser.title || "slide " + (i + 1)));
    b.innerHTML = "<i></i>";
    b.addEventListener("click", function () { heroShow(i, true); });
    $("#slide-dots").appendChild(b);
  });

  /* series blocks */
  (D.series || []).forEach(function (s, i) {
    var art = document.createElement("article");
    art.className = "series-block";
    art.id = "series-" + s.id;
    art.innerHTML =
      '<div class="series-meta" data-reveal>' +
        '<span class="idx">' + pad(i + 1) + " / ’</span>" +
        "<h3>" + s.title + "</h3>" +
        '<div class="who">featuring <b>' + peopleOf(s).join('<span class="dot">·</span>') + "</b></div>" +
        '<div class="cnt">' + s.imgs.length + " frames</div>" +
        '<button class="play-series" data-play="' + s.id + '"><i></i>play this series</button>' +
      "</div>" +
      '<div><div class="strip-wrap"><div class="strip" data-strip tabindex="0" role="list" aria-label="' + s.title + ' — drag or use the arrow keys">' +
        s.imgs.map(function (id, k) {
          var frameSize = SIZES[id] || [1200, 1600];
          return '<figure data-photo-protected data-full="' + id + '" data-series="' + s.id + '" data-cursor="drag" role="listitem">' +
            '<img class="protected-photo" src="' + thumb(id) + '" srcset="' + photoSrcset(id) + '"' +
            ' sizes="(max-width:620px) 100vw, 50vw" width="' + frameSize[0] + '" height="' + frameSize[1] + '"' +
            ' alt="' + s.title + " — frame " + (k + 1) + '" loading="lazy" decoding="async">' +
            '<span class="fnum">' + pad(k + 1) + " / " + pad(s.imgs.length) + "</span></figure>";
        }).join("") +
      '</div><div class="strip-track"><i></i></div>' +
      '<div class="pager"><button class="pg prev" aria-label="previous frame">←</button>' +
      '<span class="pg-count"><b>01</b> / ' + pad(s.imgs.length) + '</span>' +
      '<button class="pg next" aria-label="next frame">→</button></div>' +
      '</div></div>';
    $("#series-list").appendChild(art);
  });

  /* muses — full-frame photographs, names only; click to open their reel. */
  (D.persons || []).forEach(function (p) {
    var frames = framesForPerson(p.name);
    var sz = SIZES[p.img] || [1200, 1600];
    var c = document.createElement("button");
    c.type = "button";
    c.className = "person-card";
    c.setAttribute("data-reveal", "");
    c.setAttribute("data-cursor", "plain");
    c.setAttribute("aria-label", "see every frame with " + p.name + " — " + frames.length + " in total");
    c.innerHTML =
      '<span class="person-photo" data-photo-protected>' +
        '<img class="person-full protected-photo" width="' + sz[0] + '" height="' + sz[1] + '"' +
        ' src="' + thumb(p.img) + '" srcset="' + photoSrcset(p.img) + '"' +
        ' sizes="(max-width:420px) 100vw, (max-width:680px) 48vw, (max-width:1000px) 32vw, 20vw"' +
        ' alt="' + p.name + ' — full portrait" loading="lazy" decoding="async">' +
      '</span>' +
      '<span class="pc-name"><b>' + p.name + '</b></span>';
    c.addEventListener("click", function () { openReel(frames, p.name + " — every frame"); });
    $("#person-grid").appendChild(c);
  });

  /* about */
  var A = D.about || {};
  function formatAboutCopy(text) {
    return String(text || "")
      .replace(/the’apostrophe/g, "<em>the’apostrophe</em>")
      .replace(/Waimeer Chowdhury/g, '<span class="about-name">Waimeer Chowdhury</span>')
      .replace(/\(Umair\)/g, '<span class="about-name">(Umair)</span>');
  }
  var aboutLead = $("#about-lead");
  if (aboutLead) {
    if (A.lead) {
      aboutLead.innerHTML = formatAboutCopy(A.lead);
      aboutLead.hidden = false;
    } else {
      aboutLead.innerHTML = "";
      aboutLead.hidden = true;
    }
  }
  $("#about-body").innerHTML = (A.paragraphs || []).map(function (p) {
    return "<p data-reveal>" + formatAboutCopy(p) + "</p>";
  }).join("");
  $("#about-sign").textContent = A.signoff || "";
  if (A.portrait && A.portrait.img) {
    var pimg = $("#about-portrait-img");
    var psz = SIZES[A.portrait.img] || [1067, 1600];
    if (pimg) {
      pimg.width = psz[0]; pimg.height = psz[1];
      pimg.classList.add("protected-photo");
      pimg.closest(".about-portrait").setAttribute("data-photo-protected", "");
      pimg.style.objectPosition = A.portrait.pos || "50% 50%";
      pimg.setAttribute("srcset", photoSrcset(A.portrait.img));
      pimg.setAttribute("sizes", "(max-width:860px) 80vw, 360px");
      pimg.src = thumb(A.portrait.img);
      pimg.alt = D.brand && D.brand.owner ? D.brand.owner + " — portrait" : "Photographer portrait";
    }
  }
  $("#about-stats").innerHTML = (A.stats || []).map(function (s) {
    return '<div><b data-count="' + s.n + '">' + s.n + "</b><span>" + s.label + "</span></div>";
  }).join("");

  /* contact */
  var C = D.contact || {};
  var emailLink = $("#c-email");
  $(".val", emailLink).textContent = C.email;
  $("#c-mail").href = "mailto:" + C.email;
  /* desktop (mouse): clicking the email copies the address instead of opening mail */
  emailLink.addEventListener("click", function (e) {
    if (!fine) return;
    e.preventDefault();
    var hint = $(".hint", emailLink);
    var done = function () {
      hint.textContent = "copied ’";
      clearTimeout(emailLink._t);
      emailLink._t = setTimeout(function () { hint.textContent = "send an email ’"; }, 1600);
    };
    var fallback = function () {
      var ta = document.createElement("textarea");
      ta.value = C.email;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (err) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(C.email).then(done, fallback);
    } else {
      fallback();
    }
  });
  $("#c-ig .val").textContent = C.instagram;
  $("#c-ig").href = C.instagramUrl || "https://www.instagram.com/" + String(C.instagram).replace(/^@/, "");
  $("#c-loc .val").textContent = C.location;

  applySizes();

  /* Best-effort friction only: direct SVG/PNG URLs, screenshots, and tools still work. */
  function isProtectedAssetTarget(target) {
    return !!(target && target.closest && target.closest(
      "[data-photo-protected], img.protected-photo, img.js-logo-wordmark, img.js-logo-icon"
    ));
  }
  document.addEventListener("contextmenu", function (e) {
    if (isProtectedAssetTarget(e.target)) e.preventDefault();
  });
  document.addEventListener("dragstart", function (e) {
    if (isProtectedAssetTarget(e.target)) e.preventDefault();
  });

  /* ---------- 02 · smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduced) {
    try {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, touchMultiplier: 1.6 });
      if (hasST) lenis.on("scroll", ScrollTrigger.update);
      if (hasGSAP) { gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
      lenis.stop();
    } catch (e) { lenis = null; }
  }
  function goTo(target) {
    var el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -10, duration: 1.1 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $$("a[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return;
      e.preventDefault();
      closeMenu();
      goTo(href);
    });
  });
  $$("#markers button").forEach(function (b) {
    b.addEventListener("click", function () { goTo("#" + b.dataset.goto); });
  });

  /* ---------- 03 · cursor ---------- */
  if (fine && hasGSAP) {
    var cur = $("#cursor"), ring = $("#cursor-ring"), trail = $("#cursor-trail");
    var mx = innerWidth / 2, my = innerHeight / 2;
    var rx = mx, ry = my, dx = mx, dy = my, lastX = mx, lastSpawn = 0;
    addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
      dx += (mx - dx) * 0.42; dy += (my - dy) * 0.42;
      var vel = Math.max(-26, Math.min(26, (mx - lastX) * 0.55));
      lastX += (mx - lastX) * 0.28;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      var hot = document.body.classList.contains("c-hover") || document.body.classList.contains("c-drag") || document.body.classList.contains("c-view");
      cur.style.transform = "translate(" + dx + "px," + dy + "px) translate(-50%,-50%) rotate(" + (hot ? 0 : vel) + "deg)";
      if (!hot && Math.abs(vel) > 9 && performance.now() - lastSpawn > 55) {
        lastSpawn = performance.now();
        var p = document.createElement("span");
        p.className = "p";
        p.textContent = "’";
        p.style.left = dx + "px"; p.style.top = dy + "px";
        trail.appendChild(p);
        gsap.to(p, {
          opacity: 0, duration: FADE_DUR, ease: FADE_EASE,
          onComplete: function () { p.remove(); }
        });
        while (trail.childElementCount > 16) trail.removeChild(trail.firstChild);
      }
      requestAnimationFrame(loop);
    })();

    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      var view = t.closest && t.closest("[data-cursor='view']");
      var drag = t.closest && t.closest("[data-cursor='drag']");
      var plain = t.closest && t.closest("[data-cursor='plain']");
      var hov = t.closest && t.closest("a,button,input");
      document.body.classList.toggle("c-view", !!view);
      document.body.classList.toggle("c-drag", !!drag && !view);
      document.body.classList.toggle("c-hover", !view && !drag && !plain && !!hov);
      var g = cur.firstElementChild;
      if (g) g.textContent = view ? "view" : drag ? "drag" : "’";
    });
    document.addEventListener("mouseleave", function () { document.body.classList.add("c-hide"); });
    document.addEventListener("mouseenter", function () { document.body.classList.remove("c-hide"); });
  } else {
    ["#cursor", "#cursor-ring"].forEach(function (s) {
      var el = $(s); if (el) el.style.display = "none";
    });
  }

  /* ---------- 04 · signature intro (2.5s max) ---------- */
  var intro = $("#intro");
  var transitioned = false;
  if (intro) intro.addEventListener("animationend", function (e) {
    if (e.animationName === "intro-slide-up") intro.style.display = "none";
  });

  function runIntro() {
    if (!hasGSAP || reduced) { reveal(); return; }
    /* Signature intro completes within 2.5s max; page chrome fades in at 1.25s over 350ms. */
    setTimeout(enterSite, 1250);
  }

  function skipIntro() {
    if (transitioned) return;
    if (intro) { intro.style.animation = "none"; intro.style.display = "none"; }
    enterSite();
  }

  function heroEntrance() {
    gsap.fromTo(
      ["#hero .hero-title", "#hero .hero-sub", "#hero .hero-controls", "#hero .hero-meta", "#hero .hero-index", "#hero .scroll-hint", "#hero .hero-spot"],
      { opacity: 0 },
      { opacity: 1, duration: FADE_DUR, ease: FADE_EASE }
    );
    heroShow(0);
  }

  function reveal() {
    document.body.classList.remove("is-intro");
    if (intro) { intro.style.display = "none"; intro.style.animation = "none"; }
    if (lenis) lenis.start();
    ["#hero .hero-title", "#hero .hero-sub", "#hero .hero-controls", "#hero .hero-meta", "#hero .hero-index", "#hero .scroll-hint", "#hero .hero-spot"]
      .forEach(function (selector) { var el = $(selector); if (el) el.style.opacity = 1; });
    var heroMark = $("#hero .hero-mark"); if (heroMark) { heroMark.style.transform = "none"; heroMark.style.opacity = 0; }
    var heroFullLogo = $("#hero .hero-full-logo"); if (heroFullLogo) { heroFullLogo.style.transform = "none"; heroFullLogo.style.opacity = 1; }
    $$("[data-reveal]").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    var nav = $("#nav"); if (nav) { nav.style.transform = "none"; nav.style.opacity = 1; }
    var navLogo = $("#nav .brand-logo"); if (navLogo) navLogo.style.opacity = 1;
    transitioned = true;
    heroShow(0);
    beginScrollAnimation();
  }

  function enterSite() {
    if (transitioned) return;
    transitioned = true;
    document.body.classList.remove("is-intro");
    if (!hasGSAP || reduced) { reveal(); return; }
    if (lenis) lenis.start();
    heroShow(0);
    heroEntrance();
    gsap.to("#nav", { opacity: 1, duration: FADE_DUR, ease: FADE_EASE });
    beginScrollAnimation();
    setTimeout(function () { if (hasST) ScrollTrigger.refresh(); }, 450);
  }

  ["click", "keydown", "wheel"].forEach(function (evt) {
    addEventListener(evt, function () { if (!transitioned) skipIntro(); }, { passive: true });
  });

  /* ---------- 06 · scroll animation (300-400ms opacity fades only, no photo zoom/parallax) ---------- */
  var scrollStarted = false;
  function beginScrollAnimation() {
    if (scrollStarted) return;
    scrollStarted = true;
    var navLogo = $("#nav .brand-logo");

    if (reduced || !hasST) {
      $$("[data-reveal]").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
      if (navLogo) navLogo.style.opacity = 1;
      return;
    }

    gsap.fromTo("#scroll-progress i", { scaleX: 0 }, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.35 }
    });

    $$("[data-reveal]").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1, duration: FADE_DUR, ease: FADE_EASE,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* As the hero leaves the viewport, its icon separates from the lockup,
       travels into the fixed navigation, then hands off to the nav icon. */
    var heroEl = $("#hero"), heroTitle = $("#hero .hero-title");
    var heroMark = $("#hero .hero-mark"), heroFullLogo = $("#hero .hero-full-logo");
    var navEl = $("#nav");
    if (heroEl && heroTitle && heroMark && heroFullLogo && navEl && navLogo) {
      gsap.set(navLogo, { opacity: 0 });
      function logoMergeMetrics(progress) {
        var heroRect = heroEl.getBoundingClientRect();
        var navRect = navLogo.getBoundingClientRect();
        var navX = parseFloat(gsap.getProperty(navEl, "x")) || 0;
        var navY = parseFloat(gsap.getProperty(navEl, "y")) || 0;
        var width = heroMark.offsetWidth || 1;
        var height = heroMark.offsetHeight || 1;
        var scale = navRect.width / width;
        var startX = heroRect.left + heroTitle.offsetLeft + heroMark.offsetLeft;
        var startY = heroRect.top + (window.scrollY || document.documentElement.scrollTop || 0) +
          heroTitle.offsetTop + heroMark.offsetTop;
        var travel = heroEl.offsetHeight * progress;
        return {
          x: navRect.left - navX - (startX + (1 - scale) * width / 2),
          y: navRect.top - navY - (startY - travel + (1 - scale) * height / 2),
          scale: scale
        };
      }
      var mergeTl = gsap.timeline({
        scrollTrigger: {
          /* A short scrub keeps the motion tied to every scroll frame while
             filtering abrupt wheel/touch deltas. */
          trigger: heroEl, start: "top top", end: "bottom top", scrub: 0.08, invalidateOnRefresh: true
        }
      });
      /* All visual layers begin at progress zero, so the handoff responds on
         the first scroll movement rather than waiting until the hero is half gone. */
      mergeTl.to(heroMark, {
        x: function () { return logoMergeMetrics(0.88).x; },
        y: function () { return logoMergeMetrics(0.88).y; },
        scale: function () { return logoMergeMetrics(0.88).scale; },
        transformOrigin: "50% 50%", duration: 0.88, ease: "none"
      }, 0)
        .to(heroFullLogo, { opacity: 0, duration: 0.48, ease: "none" }, 0)
        .to(heroMark, { opacity: 1, duration: 0.18, ease: "none" }, 0)
        .to(heroMark, { y: function () { return logoMergeMetrics(1).y; }, duration: 0.12, ease: "none" }, 0.88)
        .to(heroMark, { opacity: 0, duration: 0.12, ease: "none" }, 0.88)
        .to(navLogo, { opacity: 1, duration: 0.12, ease: "none" }, 0.88);
    } else if (navLogo) {
      navLogo.style.opacity = 1;
    }

    [["hero", "#hero"], ["series", "#series"], ["muses", "#muses"], ["about", "#about"], ["contact", "#contact"]]
      .forEach(function (pair) {
        var sec = $(pair[1]);
        if (!sec) return;
        /* The last section can never scroll its top up to 45% on shorter screens
           (the footer sits below it), so it activates at the page bottom instead. */
        var isLast = pair[0] === "contact";
        ScrollTrigger.create({
          trigger: sec,
          start: isLast ? function () {
            var top = sec.getBoundingClientRect().top + scrollY - innerHeight * 0.45;
            return Math.max(0, Math.min(top, ScrollTrigger.maxScroll(window) - 2));
          } : "top 45%",
          end: isLast ? "max" : "bottom 45%",
          onToggle: function (self) {
            if (!self.isActive) return;
            $$("#markers button").forEach(function (b) { b.classList.toggle("on", b.dataset.goto === pair[0]); });
            $$("#nav [data-nav]").forEach(function (a) { a.classList.toggle("on", a.dataset.nav === pair[0]); });
          }
        });
      });

    $$(".series-block").forEach(function (block) {
      var strip = $(".strip", block);
      if (!strip) return;
      gsap.fromTo(strip, { opacity: 0 }, {
        opacity: 1, duration: FADE_DUR, ease: FADE_EASE,
        scrollTrigger: { trigger: block, start: "top 88%", once: true }
      });
    });
  }

  /* nav backdrop */
  addEventListener("scroll", function () {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    var nav = $("#nav");
    if (nav) nav.classList.toggle("solid", y > 60);
  }, { passive: true });

  /* strips: drag with momentum, snap, progress
     Touch and pen pan natively (see the .strip snap rules in style.css), so the
     gesture is driven by exactly one scroller instead of the browser and this
     script pulling against each other — that fight was the mobile jitter.
     Geometry is measured once per gesture/resize/frame-load rather than read
     back on every event, and each move is applied once per animation frame. */
  $$("[data-strip]").forEach(function (strip) {
    var track = $(".strip-track i", strip.parentNode);
    var wrap = strip.parentNode;
    var countEl = $(".pg-count b", wrap);
    var down = false, sx = 0, sl = 0, lx = 0, lt = 0, vel = 0, moved = 0, mom = null;
    var figs = $$("figure", strip);
    var frame = 0, pending = 0, card = -1, touchX = 0, rt = null;
    /* cached geometry: refreshed on init, resize, frame load, gesture start */
    var lefts = [], maxScroll = 0, barSpan = 0;

    function clamp(x) { return Math.max(0, Math.min(maxScroll, x)); }
    function setBar(x) {
      if (!track) return;
      var at = x === undefined ? strip.scrollLeft : x;
      track.style.left = (maxScroll > 0 ? clamp(at) / maxScroll : 0) * barSpan + "%";
    }
    function measure() {
      lefts = figs.map(function (f) { return f.offsetLeft - 2; });
      maxScroll = Math.max(0, strip.scrollWidth - strip.clientWidth);
      var w = strip.scrollWidth ? Math.max(12, (strip.clientWidth / strip.scrollWidth) * 100) : 100;
      barSpan = 100 - w;
      if (track) track.style.width = w + "%";
      setBar();
    }
    /* which card is closest to a scroll offset (defaults to the current one) */
    function nearest(x) {
      var at = x === undefined ? strip.scrollLeft : x;
      var i = 0, bd = Infinity;
      for (var k = 0; k < lefts.length; k++) {
        var d = Math.abs(lefts[k] - at);
        if (d < bd) { bd = d; i = k; }
      }
      return i;
    }
    function paint(x) {
      var i = nearest(x);
      if (i === card) return;
      card = i;
      if (countEl) countEl.textContent = pad(i + 1);
    }
    function glide(target, dur, ease) {
      if (mom) { mom.kill(); mom = null; }
      if (!hasGSAP) { strip.scrollLeft = target; paint(target); return; }
      mom = gsap.to(strip, {
        scrollLeft: target, duration: dur, ease: ease, overwrite: true,
        onComplete: function () { mom = null; paint(); }
      });
    }
    function goCard(i) {
      i = Math.max(0, Math.min(figs.length - 1, i));
      if (!figs[i]) return;
      if (!lefts.length) measure();
      glide(clamp(lefts[i]), FADE_DUR, FADE_EASE);
    }
    var pager = $(".pager", wrap);
    if (pager) {
      var pb = $(".pg.prev", pager), nb = $(".pg.next", pager);
      if (pb) pb.addEventListener("click", function () { goCard(nearest() - 1); });
      if (nb) nb.addEventListener("click", function () { goCard(nearest() + 1); });
    }
    strip.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); goCard(nearest() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); goCard(nearest() - 1); }
    });
    strip.addEventListener("scroll", function () {
      var x = strip.scrollLeft;
      setBar(x); paint(x);
    }, { passive: true });
    /* lazy frames landing change the card offsets, so re-measure then */
    strip.addEventListener("load", measure, true);
    addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { measure(); paint(); }, 140);
    });
    setTimeout(function () { measure(); paint(); }, 80);
    setTimeout(function () { measure(); paint(); }, 900);

    /* touch / pen: native pan owns the gesture; we only watch it so a flick
       does not open the viewer and so no leftover tween fights the finger */
    strip.addEventListener("touchstart", function (e) {
      moved = 0; vel = 0;
      touchX = e.touches && e.touches.length ? e.touches[0].clientX : 0;
      if (mom) { mom.kill(); mom = null; }
      measure();
    }, { passive: true });
    strip.addEventListener("touchmove", function (e) {
      if (moved || !e.touches || !e.touches.length) return;
      if (Math.abs(e.touches[0].clientX - touchX) > 8) moved = 1;
    }, { passive: true });

    /* mouse / trackpad: scripted drag, batched to one write per frame */
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (mom) { mom.kill(); mom = null; }
      measure();
      down = true; moved = 0; vel = 0;
      sx = e.clientX; sl = strip.scrollLeft; lx = e.clientX; lt = performance.now();
    });
    function dragFrame() {
      frame = 0;
      strip.scrollLeft = sl - pending;
    }
    strip.addEventListener("pointermove", function (e) {
      if (!down || e.pointerType !== "mouse") return;
      var d = e.clientX - sx;
      if (!moved) {
        if (Math.abs(d) <= 5) return;
        moved = 1;
        if (strip.setPointerCapture) { try { strip.setPointerCapture(e.pointerId); } catch (err) { } }
      }
      pending = d;
      if (!frame) frame = requestAnimationFrame(dragFrame);
      var t = performance.now(), dt = t - lt;
      if (dt >= 8) {
        /* eased so one spiky sample does not decide the flick */
        vel += ((e.clientX - lx) / dt - vel) * 0.6;
        lx = e.clientX; lt = t;
      }
    });
    function release(cancelled) {
      if (!down) return;
      down = false;
      if (frame) { cancelAnimationFrame(frame); frame = 0; dragFrame(); }
      if (!moved || !lefts.length) return;
      var from = strip.scrollLeft;
      var flick = !cancelled && Math.abs(vel) > 0.25;
      var target = clamp(lefts[nearest(flick ? clamp(from - vel * 220) : from)]);
      vel = 0;
      if (Math.abs(target - from) <= 0.5) { strip.scrollLeft = target; paint(target); return; }
      /* momentum and snap are one continuous deceleration: no second kick */
      glide(
        target,
        flick ? Math.max(FADE_DUR, Math.min(0.85, Math.abs(target - from) / 1500 + 0.18)) : FADE_DUR,
        flick ? "power3.out" : FADE_EASE
      );
    }
    strip.addEventListener("pointerup", function () { release(false); });
    strip.addEventListener("pointercancel", function () { release(true); });
    strip.addEventListener("click", function (e) {
      var f = e.target.closest("figure");
      if (!f || moved) return;
      var s = seriesById[f.dataset.series];
      openViewer(reelOf(s), s.imgs.indexOf(f.dataset.full), "reel", s.title);
    });
  });

  /* play a series full screen */
  $$("[data-play]").forEach(function (b) {
    b.addEventListener("click", function () {
      var s = seriesById[b.dataset.play];
      openReel(reelOf(s), s.title);
    });
  });

  /* ---------- 08 · viewer ---------- */
  var viewer = $("#viewer"), vFrame = $("#v-frame"), vRail = $("#v-rail");
  var layers = [];
  for (var li = 0; li < 2; li++) {
    var lay = document.createElement("img");
    lay.alt = ""; lay.decoding = "async"; lay.className = "protected-photo";
    lay.style.width = "100%"; lay.style.height = "100%";
    vFrame.appendChild(lay);
    layers.push(lay);
  }
  var V = { list: [], idx: 0, mode: "still", playing: false, layer: 0, token: 0, pb: null, open: false };

  function buildRail() {
    vRail.innerHTML = V.list.map(function (it, i) {
      return '<button data-photo-protected data-i="' + i + '" aria-label="frame ' + (i + 1) + '"><img class="protected-photo" src="' + thumb(it.id) +
        '" srcset="' + photoSrcset(it.id) + '" sizes="66px" alt="" loading="lazy" decoding="async"></button>';
    }).join("");
    $$("button", vRail).forEach(function (b) {
      b.addEventListener("click", function () { V.idx = +b.dataset.i; vRender(); });
    });
  }

  function vRender() {
    var it = V.list[V.idx];
    if (!it) return;
    var nextLayer = 1 - V.layer, el = layers[nextLayer], prev = layers[V.layer];
    var myToken = ++V.token;
    var reel = V.mode === "reel";
    var img = new Image();
    img.decoding = "async";
    img.sizes = "100vw";
    img.srcset = photoSrcset(it.id);
    img.onload = function () {
      if (myToken !== V.token) return;
      el.classList.add("protected-photo");
      el.sizes = "100vw";
      el.srcset = photoSrcset(it.id);
      el.src = img.currentSrc || img.src;
      if (img.naturalWidth) { el.width = img.naturalWidth; el.height = img.naturalHeight; }
      else { var sz = SIZES[it.id]; if (sz) { el.width = sz[0]; el.height = sz[1]; } }
      if (!hasGSAP) { el.style.opacity = 1; prev.style.opacity = 0; V.layer = nextLayer; return; }
      gsap.set(el, { opacity: 0, scale: 1 });
      gsap.to(el, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE });
      gsap.to(prev, { opacity: 0, duration: FADE_DUR, ease: FADE_EASE });
      V.layer = nextLayer;
      if (V.pb) { V.pb.kill(); V.pb = null; }
      gsap.set("#v-progress", { scaleX: 0 });
      if (reel && V.playing) {
        var dur = 4.2;
        V.pb = gsap.fromTo("#v-progress", { scaleX: 0 }, {
          scaleX: 1, duration: dur, ease: "none", onComplete: function () { vStep(1); }
        });
      }
    };
    img.src = full(it.id);

    $("#v-count").textContent = pad(V.idx + 1) + " / " + pad(V.list.length);
    $("#v-who").textContent = it.person;
    $("#v-sub").textContent = it.title + " · frame " + pad(it.n);
    $$("button", vRail).forEach(function (b, i) { b.classList.toggle("on", i === V.idx); });
    var on = $("button.on", vRail);
    if (on && on.scrollIntoView) { try { on.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" }); } catch (e) { } }
    var next = V.list[(V.idx + 1) % V.list.length];
    if (next && next !== it) {
      var pre = new Image();
      pre.decoding = "async";
      pre.sizes = Math.min(window.innerWidth || 1280, 1280) + "px";
      pre.srcset = photoSrcset(next.id);
      pre.src = thumb(next.id);
    }
  }
  function vStep(d) { V.idx = (V.idx + d + V.list.length) % V.list.length; vRender(); }
  function vPlay(on) {
    V.playing = !!on && V.mode === "reel";
    var b = $("#v-play");
    b.classList.toggle("playing", V.playing);
    $(".pp", b).textContent = V.playing ? "❙❙" : "▶";
    if (V.mode === "reel") vRender();
    else if (V.pb) { V.pb.kill(); V.pb = null; }
  }
  function openViewer(list, idx, mode, title) {
    if (!list || !list.length) return;
    V.list = list;
    V.idx = Math.max(0, Math.min(idx || 0, list.length - 1));
    V.mode = mode === "reel" ? "reel" : "still";
    V.open = true;
    viewer.classList.toggle("still", V.mode === "still");
    viewer.classList.add("open");
    $("#v-title").textContent = title || "";
    buildRail();
    if (V.mode === "reel") { V.playing = true; $("#v-play").classList.add("playing"); $("#v-play .pp").textContent = "❙❙"; }
    else { V.playing = false; $("#v-play").classList.remove("playing"); $("#v-play .pp").textContent = "▶"; }
    vRender();
    document.body.classList.add("is-locked");
    document.documentElement.classList.add("is-locked");
    if (lenis) lenis.stop();
    if (hasGSAP) gsap.fromTo([".v-top", ".v-bottom"], { opacity: 0 }, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE });
  }
  function openReel(list, title) { openViewer(list, 0, "reel", title); }
  function closeViewer() {
    V.open = false; V.playing = false;
    if (V.pb) { V.pb.kill(); V.pb = null; }
    viewer.classList.remove("open");
    document.body.classList.remove("is-locked");
    document.documentElement.classList.remove("is-locked");
    if (lenis) lenis.start();
  }
  $("#v-close").addEventListener("click", closeViewer);
  $("#v-prev").addEventListener("click", function () { vStep(-1); });
  $("#v-next").addEventListener("click", function () { vStep(1); });
  $("#v-play").addEventListener("click", function () { vPlay(!V.playing); });
  viewer.addEventListener("click", function (e) {
    if (e.target.closest("button") || e.target.closest(".v-rail")) return;
    if (V.mode === "reel") vStep(1);
    else closeViewer();
  });
  addEventListener("keydown", function (e) {
    if (!V.open) return;
    if (e.key === "Escape") closeViewer();
    else if (e.key === "ArrowRight") vStep(1);
    else if (e.key === "ArrowLeft") vStep(-1);
    else if (e.key === " ") { e.preventDefault(); vPlay(!V.playing); }
  });
  (function swipe() {
    var stage = $(".v-stage"), sx = 0, sy = 0, dn = false;
    function hold(on) {
      /* keep an autoplay advance from landing in the middle of a swipe */
      if (!V.pb) return;
      if (on) V.pb.pause(); else V.pb.resume();
    }
    stage.addEventListener("pointerdown", function (e) { dn = true; sx = e.clientX; sy = e.clientY; hold(true); });
    stage.addEventListener("pointercancel", function () { if (!dn) return; dn = false; hold(false); });
    stage.addEventListener("pointerup", function (e) {
      if (!dn) return;
      dn = false;
      hold(false);
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) vStep(dx < 0 ? 1 : -1);
    });
  })();

  /* ---------- 09 · focus shortcuts ---------- */
  addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("focus-mode")) {
      toggleFocus(false);
      return;
    }
    if (V.open || e.shiftKey || (e.key !== "f" && e.key !== "F")) return;
    var active = document.activeElement;
    if (active && /input|textarea|select/i.test(active.tagName || "")) return;
    toggleFocus();
  });

  /* ---------- 10 · page chrome ---------- */
  var menu = $("#menu"), menuBtn = $("#menu-btn");
  function openMenu() {
    menu.classList.add("open");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    document.documentElement.classList.add("is-locked");
    if (lenis) lenis.stop();
  }
  function closeMenu() {
    if (!menu.classList.contains("open")) return;
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    document.documentElement.classList.remove("is-locked");
    if (lenis) lenis.start();
  }
  menuBtn.addEventListener("click", function () {
    if (menu.classList.contains("open")) closeMenu(); else openMenu();
  });

  /* hero spotlight follows the pointer */
  if (fine && hasGSAP) {
    var spot = $("#hero-spot"), heroEl = $("#hero");
    heroEl.addEventListener("mousemove", function (e) {
      var r = heroEl.getBoundingClientRect();
      gsap.to(spot, { x: e.clientX - r.left, y: e.clientY - r.top, duration: 0.22, ease: FADE_EASE, overwrite: "auto" });
    });
  }

  /* hero swipe — a slide never changes while a finger is still on the glass,
     so the autoplay cannot swap frames mid-gesture and read as a stutter */
  var heroDrag = false;
  (function heroSwipe() {
    var heroEl = $("#hero"), sx = 0, sy = 0, dn = false;
    function end(e) {
      if (!dn) return;
      dn = false; heroDrag = false;
      if (e.type === "pointercancel") return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) heroShow(heroCur + (dx < 0 ? 1 : -1), true);
    }
    heroEl.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button")) return;
      dn = true; heroDrag = true; sx = e.clientX; sy = e.clientY;
    });
    addEventListener("pointerup", end);
    addEventListener("pointercancel", end);
  })();

  /* focus mode — hide every piece of chrome, leave only the pictures */
  function toggleFocus(on) {
    var active = on === undefined ? !document.body.classList.contains("focus-mode") : !!on;
    document.body.classList.toggle("focus-mode", active);
  }
  var focusBtn = $("#focus-btn"), focusExit = $("#focus-exit");
  if (focusBtn) focusBtn.addEventListener("click", function () { toggleFocus(); });
  if (focusExit) focusExit.addEventListener("click", function () { toggleFocus(false); });

  /* ---------- 11 · hero slideshow ---------- */
  var slides = $$("#hero .slide"), dotBtns = $$("#slide-dots button");
  var heroCur = -1, heroTimer = null, dotTween = null;
  var HOLD = 5200;

  function heroShow(i) {
    if (!slides.length) return;
    i = (i + slides.length) % slides.length;
    if (i === heroCur) return;
    var prev = heroCur;
    heroCur = i;
    if (!hasGSAP) {
      slides.forEach(function (el, k) { el.style.opacity = k === i ? 1 : 0; });
      return;
    }
    slides.forEach(function (el, k) {
      if (k === i) {
        gsap.set(el, { zIndex: 2 });
        if (prev < 0) gsap.set(el, { opacity: 1 });
        else gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE, overwrite: "auto" });
      } else if (k === prev) {
        gsap.set(el, { zIndex: 1 });
        gsap.to(el, { opacity: 0, duration: FADE_DUR, ease: FADE_EASE, overwrite: "auto" });
      } else {
        gsap.set(el, { opacity: 0, zIndex: 0 });
      }
    });
    var s = D.heroSlides[i], ser = seriesById[s.series] || {};
    var capS = $("#cap-series");
    var capW = $("#cap-who");
    capS.textContent = ser.title || "";
    capW.textContent = "featuring " + peopleOf(ser).join(" · ");
    $("#hero-index").textContent = pad(i + 1) + " / " + pad(slides.length);
    gsap.fromTo([capS, capW], { opacity: 0 }, { opacity: 1, duration: FADE_DUR, ease: FADE_EASE, overwrite: "auto" });

    if (dotTween) { dotTween.kill(); dotTween = null; }
    dotBtns.forEach(function (b, k) {
      var bar = $("i", b);
      b.classList.toggle("on", k === i);
      gsap.set(bar, { scaleX: k === i ? 0 : k < i ? 1 : 0 });
      if (k === i) dotTween = gsap.to(bar, { scaleX: 1, duration: HOLD / 1000, ease: "none", onComplete: nextSlide });
    });
    if (heroTimer) clearTimeout(heroTimer);
    heroTimer = setTimeout(nextSlide, HOLD + 400);
  }
  function nextSlide() {
    if (V.open) return;
    /* a drag in progress wins: hold the advance until the finger lifts */
    if (heroDrag) { heroTimer = setTimeout(nextSlide, 320); return; }
    heroShow(heroCur + 1);
  }

  $("#hero-open").addEventListener("click", function () {
    var s = D.heroSlides[heroCur], ser = seriesById[s.series];
    openReel(reelOf(ser), ser.title);
  });
  document.addEventListener("visibilitychange", function () {
    if (heroTimer) clearTimeout(heroTimer);
    if (!document.hidden) heroTimer = setTimeout(nextSlide, HOLD);
  });
  addEventListener("keydown", function (e) {
    if (V.open || !transitioned) return;
    var ae = document.activeElement;
    if (ae && /input|textarea|select/i.test(ae.tagName || "")) return;
    if (ae && ae.classList && ae.classList.contains("strip")) return;
    if (e.key === "ArrowRight") heroShow(heroCur + 1);
    if (e.key === "ArrowLeft") heroShow(heroCur - 1);
  });

  /* ---------- go ---------- */
  if (lenis) lenis.stop();
  runIntro();
  addEventListener("load", function () { if (hasST) ScrollTrigger.refresh(); });
  setTimeout(function () { if (hasST && transitioned) ScrollTrigger.refresh(); }, 1500);
  /* Hard fail-open at 2.5s max: the intro can never block the portfolio past 2.5s. */
  setTimeout(function () {
    if (!intro || getComputedStyle(intro).display === "none" || getComputedStyle(intro).visibility === "hidden") return;
    if (hasGSAP) {
      gsap.killTweensOf(intro);
      gsap.killTweensOf(["#nav", "#hero .hero-title", "#hero .hero-mark", "#hero .hero-full-logo", "#hero .hero-sub",
        "#hero .hero-controls", "#hero .hero-meta", "#hero .hero-index", "#hero .scroll-hint", "#hero .hero-spot"]);
    }
    reveal();
  }, 2500);
})();

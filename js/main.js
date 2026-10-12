/* theapostrophe — main script */
(function () {
  "use strict";
  const D = window.SITE_DATA;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const thumbSrc = (id) => `assets/img/thumb/${id}.jpg`;
  const fullSrc = (id) => `assets/img/full/${id}.jpg`;
  const seriesById = {};
  D.series.forEach((s) => (seriesById[s.id] = s));

  gsap.registerPlugin(ScrollTrigger);
  const SILK = "power4.inOut";
  const OUT = "power3.out";

  /* ============ build DOM ============ */
  // hero slides
  const heroStage = $("#hero-slides");
  D.heroSlides.forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "slide";
    d.innerHTML = `<img src="${fullSrc(s.img)}" alt="${s.series} — ${s.who}" ${i > 0 ? 'loading="lazy"' : ""} decoding="async">`;
    heroStage.appendChild(d);
  });
  const dotsWrap = $("#slide-dots");
  D.heroSlides.forEach((s, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Show " + s.series);
    b.innerHTML = "<i></i>";
    b.addEventListener("click", () => showSlide(i, true));
    dotsWrap.appendChild(b);
  });

  // work grid (every frame, grouped order)
  const workGrid = $("#work-grid");
  const WORK = [];
  D.series.forEach((s) => {
    s.imgs.forEach((id, n) => {
      WORK.push({ id, series: s.id, title: s.title, person: s.person, n: n + 1 });
    });
  });
  WORK.forEach((w, i) => {
    const a = document.createElement("figure");
    a.className = "work-item";
    a.dataset.series = w.series;
    a.dataset.index = i;
    a.setAttribute("data-cursor", "view");
    a.innerHTML = `
      <img src="${thumbSrc(w.id)}" alt="${w.title} ${w.n} — ${w.person}" loading="lazy" decoding="async">
      <span class="wi-mark">’</span>
      <figcaption class="wi-cap"><span class="t">${w.title} · ${String(w.n).padStart(2, "0")}</span><span class="p">${w.person}</span></figcaption>`;
    a.addEventListener("click", () => openLightbox(i));
    workGrid.appendChild(a);
  });

  // series blocks
  const seriesWrap = $("#series-list");
  D.series.forEach((s, i) => {
    const b = document.createElement("article");
    b.className = "series-block";
    b.innerHTML = `
      <div class="series-meta" data-reveal>
        <span class="idx">${String(i + 1).padStart(2, "0")} / ’</span>
        <h3>${s.title}</h3>
        <div class="who">featuring <b>${s.person}</b></div>
        <p>${s.blurb}</p>
        <div class="cnt">${s.imgs.length} frames — drag →</div>
      </div>
      <div>
        <div class="strip" data-strip>
          ${s.imgs.map((id) => `<figure data-cursor="view" data-full="${id}" data-series="${s.id}"><img src="${thumbSrc(id)}" alt="${s.title}" loading="lazy" decoding="async"></figure>`).join("")}
        </div>
      </div>`;
    seriesWrap.appendChild(b);
  });

  // persons
  const personGrid = $("#person-grid");
  D.persons.forEach((p) => {
    const c = document.createElement("div");
    c.className = "person-card";
    c.setAttribute("data-reveal", "");
    c.innerHTML = `
      ${p.owner ? '<span class="owner-tag">the owner</span>' : ""}
      <img src="${thumbSrc(p.img)}" alt="${p.name}" loading="lazy" decoding="async">
      <div class="pc-name"><b>${p.name}</b><span>${p.note}</span></div>`;
    personGrid.appendChild(c);
  });

  // marquee content
  const marq = $("#marquee-track");
  const words = ["personal", "events", "studio", "street", "film", "golden hour", "night", "portrait"];
  marq.innerHTML = (words.map((w) => `<span>${w} <b>’</b></span>`).join("")).repeat(4);

  // contact values
  $("#c-email .val").textContent = D.contact.email;
  $("#c-email").href = "mailto:" + D.contact.email;
  $("#c-ig .val").textContent = D.contact.instagram;
  $("#c-ig").href = "https://instagram.com/" + D.contact.instagram.replace("@", "");
  $("#c-loc .val").textContent = D.contact.location;

  /* ============ smooth scroll (lenis) ============ */
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  document.body.classList.add("is-intro");
  $$("a[data-scroll]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const t = $(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -64, duration: 1.4 });
      else t.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ============ custom cursor ============ */
  const cur = $("#cursor"), curDot = $("#cursor-dot"), glyph = $("#cursor .glyph");
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, dx = mx, dy = my, lastX = mx;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  function curLoop() {
    cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
    dx += (mx - dx) * 0.4; dy += (my - dy) * 0.4;
    const vel = Math.max(-24, Math.min(24, (mx - lastX) * 0.6)); lastX += (mx - lastX) * 0.3;
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-58%) rotate(${cur.classList.contains("is-view") ? 0 : vel}deg)`;
    curDot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    requestAnimationFrame(curLoop);
  }
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) requestAnimationFrame(curLoop);
  document.addEventListener("mouseover", (e) => {
    const view = e.target.closest("[data-cursor='view']");
    const hov = e.target.closest("a,button,.chips button");
    if (view) { cur.classList.add("is-view"); glyph.textContent = "view"; }
    else if (hov) { cur.classList.add("is-hover"); glyph.textContent = "’"; }
    else { cur.classList.remove("is-hover", "is-view"); glyph.textContent = "’"; }
    curDot.classList.toggle("is-hover", !!(view || hov));
  });

  /* ============ intro ============ */
  const intro = $("#intro");
  const counterEl = $("#intro-count");
  const heroImgs = D.heroSlides.map((s) => fullSrc(s.img));
  let loaded = 0;
  const loadPromises = heroImgs.map(
    (src) =>
      new Promise((res) => {
        const im = new Image();
        im.onload = im.onerror = () => { loaded++; counterEl.textContent = String(Math.round((loaded / heroImgs.length) * 100)).padStart(3, "0") + " %"; res(); };
        im.src = src;
      })
  );
  const assetsReady = Promise.all(loadPromises);
  const minWait = new Promise((r) => setTimeout(r, reduced ? 200 : 2600));

  function runIntro() {
    const tl = gsap.timeline({ defaults: { ease: SILK } });
    if (reduced) {
      tl.set(intro, { display: "none" }).add(startSite);
      return;
    }
    tl.to("#intro svg.apos-draw path.stroke", { strokeDashoffset: 0, duration: 1.1, stagger: 0.12 })
      .to("#intro svg.apos-draw path.fillable", { fillOpacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.35")
      .to("#intro .brass-line", { scaleX: 1, duration: 0.9 }, "-=0.5")
      .to("#intro .intro-brand .w", { y: "0%", duration: 1.05, stagger: 0.055 }, "-=0.55")
      .to("#intro .intro-tag", { opacity: 1, y: 0, duration: 0.7, ease: OUT }, "-=0.5")
      .to("#intro .intro-hint", { opacity: 1, duration: 0.5 }, "-=0.4");
    Promise.all([assetsReady, minWait]).then(() => {
      tl.to({}, { duration: 0.35 })
        .to("#intro .intro-brand .w", { y: "-115%", duration: 0.7, stagger: 0.035 })
        .to(["#intro svg", "#intro .intro-tag", "#intro .brass-line", "#intro .intro-hint", "#intro .intro-count"], { opacity: 0, duration: 0.4 }, "<")
        .to(intro, { yPercent: -100, duration: 1.15, onStart: startSite })
        .set(intro, { display: "none" });
    });
  }

  let siteStarted = false;
  function startSite() {
    if (siteStarted) return;
    siteStarted = true;
    document.body.classList.remove("is-intro");
    if (lenis) lenis.start();
    gsap.to("#nav", { y: 0, duration: 1, ease: OUT });
    // hero entrance
    const htl = gsap.timeline({ defaults: { ease: SILK } });
    htl.to("#hero .hero-title .row>span", { y: "0%", duration: 1.25, stagger: 0.12 })
      .to("#hero .hero-sub", { opacity: 1, duration: 0.9, ease: OUT }, "-=0.7")
      .to(["#hero .hero-meta", "#hero .slide-dots", "#hero .scroll-hint"], { opacity: 1, duration: 0.9, ease: OUT, stagger: 0.12 }, "-=0.6");
    startShow();
    ScrollTrigger.refresh();
  }

  /* ============ hero slideshow ============ */
  const slides = $$("#hero .slide");
  const dotBtns = $$("#slide-dots button");
  const capSeries = $("#cap-series"), capWho = $("#cap-who");
  let curSlide = -1, showTimer = null, barTween = null;
  const HOLD = 4600;
  function showSlide(i, user) {
    i = (i + slides.length) % slides.length;
    if (i === curSlide) return;
    const prev = curSlide;
    curSlide = i;
    const s = D.heroSlides[i];
    slides.forEach((el, k) => {
      if (k === i) {
        gsap.set(el, { opacity: 1, zIndex: 2 });
        gsap.fromTo(el.querySelector("img"), { scale: 1.14 }, { scale: 1, duration: HOLD / 1000 + 1.4, ease: "power1.out", overwrite: "auto" });
      } else if (k === prev) {
        gsap.set(el, { zIndex: 1 });
        gsap.to(el, { opacity: 0, duration: 1.3, ease: "power2.inOut", overwrite: "auto" });
      } else gsap.set(el, { opacity: 0, zIndex: 0 });
    });
    // caption swap
    gsap.fromTo(capSeries, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: SILK });
    capSeries.textContent = s.series;
    capWho.textContent = "featuring " + s.who;
    // dots
    if (barTween) barTween.kill();
    dotBtns.forEach((b, k) => {
      const bar = b.querySelector("i");
      gsap.set(bar, { scaleX: k === i ? 0 : k < i ? 1 : 0 });
      if (k === i) barTween = gsap.to(bar, { scaleX: 1, duration: HOLD / 1000, ease: "none" });
    });
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => showSlide(curSlide + 1), HOLD);
  }
  function startShow() { showSlide(0); }

  /* ============ scroll reveals ============ */
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: OUT,
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });
  // work items staggered batch
  ScrollTrigger.batch(".work-item", {
    start: "top 92%",
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: OUT, stagger: 0.07, overwrite: "auto" })
  });
  // hero parallax
  gsap.to("#hero .hero-title", {
    yPercent: -34, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ============ filters ============ */
  const chips = $$("#chips button");
  chips.forEach((ch) => {
    ch.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("on", c === ch));
      const f = ch.dataset.filter;
      $$(".work-item").forEach((it) => {
        const show = f === "all" || it.dataset.series === f;
        it.classList.toggle("hidden", !show);
        if (show) gsap.fromTo(it, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: OUT, overwrite: "auto" });
      });
      ScrollTrigger.refresh();
    });
  });

  /* ============ strip drag ============ */
  $$("[data-strip]").forEach((strip) => {
    let down = false, startX = 0, startL = 0, moved = 0;
    strip.addEventListener("pointerdown", (e) => { down = true; startX = e.clientX; startL = strip.scrollLeft; });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const d = e.clientX - startX;
      if (Math.abs(d) > 6) moved = 1;
      strip.scrollLeft = startL - d;
    });
    addEventListener("pointerup", () => { down = false; setTimeout(() => (moved = 0), 0); });
    // lightbox from strips
    strip.querySelectorAll("figure").forEach((f) => {
      f.addEventListener("click", () => {
        if (moved) return;
        const s = seriesById[f.dataset.series];
        const idx = s.imgs.indexOf(f.dataset.full);
        openLightboxList(
          s.imgs.map((id, k) => ({ id, title: s.title, person: s.person, n: k + 1 })),
          idx
        );
      });
    });
  });

  /* ============ lightbox ============ */
  const lb = $("#lightbox"), lbImg = $("#lb-img"), lbTitle = $("#lb-title"), lbWho = $("#lb-who"), lbCount = $("#lb-count");
  let lbList = [], lbIdx = 0;
  function openLightbox(workIndex) {
    const visible = $$(".work-item").filter((it) => !it.classList.contains("hidden")).map((it) => WORK[+it.dataset.index]);
    const pos = visible.findIndex((w) => WORK.indexOf(w) === workIndex);
    openLightboxList(visible.map((w) => ({ id: w.id, title: w.title, person: w.person, n: w.n })), Math.max(0, pos));
  }
  function openLightboxList(list, idx) {
    lbList = list; lbIdx = idx;
    renderLb();
    lb.classList.add("open");
    if (lenis) lenis.stop();
  }
  function renderLb() {
    const it = lbList[lbIdx];
    lbImg.style.opacity = 0;
    const pre = new Image();
    pre.onload = () => { lbImg.src = pre.src; gsap.to(lbImg, { opacity: 1, duration: 0.5 }); };
    pre.src = fullSrc(it.id);
    lbTitle.textContent = `${it.title} · ${String(it.n).padStart(2, "0")}`;
    lbWho.textContent = it.person;
    lbCount.textContent = `${lbIdx + 1} / ${lbList.length}`;
    // preload neighbours
    [lbIdx + 1, lbIdx - 1].forEach((k) => { const n = lbList[(k + lbList.length) % lbList.length]; if (n) new Image().src = fullSrc(n.id); });
  }
  function closeLb() { lb.classList.remove("open"); if (lenis) lenis.start(); }
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb-prev").addEventListener("click", () => { lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; renderLb(); });
  $("#lb-next").addEventListener("click", () => { lbIdx = (lbIdx + 1) % lbList.length; renderLb(); });
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") { lbIdx = (lbIdx - 1 + lbList.length) % lbList.length; renderLb(); }
    if (e.key === "ArrowRight") { lbIdx = (lbIdx + 1) % lbList.length; renderLb(); }
  });

  /* ============ go ============ */
  runIntro();
})();

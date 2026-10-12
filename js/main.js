/* ============================================================
   THEAPOSTROPHE — interactions
   ============================================================ */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- intro: lens opens on the wordmark ---------- */
  const pre = $('.preloader');
  const introTimers = [];
  let introDone = false;
  const finishIntro = () => {
    if (introDone) return;
    introDone = true;
    introTimers.splice(0).forEach(clearTimeout);
    pre.classList.add('open');
    document.body.classList.add('ready');
    setTimeout(() => pre.remove(), 1000);
  };
  const at = (fn, ms) => introTimers.push(setTimeout(fn, ms));
  $$('[data-letters]').forEach(el => {
    const txt = el.textContent;
    el.textContent = '';
    [...txt].forEach((ch, i) => {
      const sp = document.createElement('span');
      sp.className = 'ch'; sp.textContent = ch;
      sp.style.setProperty('--i', i + (el.classList.contains('iw2') ? 7 : 0));
      el.appendChild(sp);
    });
  });
  $('.intro-skip').addEventListener('click', finishIntro);
  // Play the intro once per tab; reloads go straight to the site.
  let seen = false;
  try { seen = sessionStorage.getItem('eh-intro-seen') === '1'; sessionStorage.setItem('eh-intro-seen', '1'); } catch (e) {}
  if (reduce || seen) {
    pre.classList.add('skip');
    finishIntro();
  } else {
    pre.classList.add('s1');                              // lens ring draws
    at(() => pre.classList.add('s2'), 500);              // sun rises
    at(() => pre.classList.add('s3'), 900);              // wordmark rises
    at(finishIntro, 3400);                                // lens opens
  }

  /* ---------- custom cursor ---------- */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('cursor-on');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    const hoverSel = 'a, button, .filter, [data-magnetic]';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(hoverSel);
      document.body.classList.toggle('cursor-hover', !!t);
      const view = e.target.closest('[data-cursor="view"]');
      document.body.classList.toggle('cursor-view', !!view);
    });
  }

  /* ---------- nav: scrolled / hidden / progress ---------- */
  const nav = $('.nav'), progress = $('.progress');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 60);
    nav.classList.toggle('hidden', y > 420 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    parallax();
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  menuBtn.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

  /* ---------- nav: sliding pill + letter roll ---------- */
  const pill = $('.nav-pill');
  const activeLink = () => $('.nav-links a.active');
  const movePill = a => {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  $$('.nav-links a').forEach(a => {
    a.addEventListener('mouseenter', () => movePill(a));
    a.addEventListener('focus', () => movePill(a));
  });
  $('.nav-links').addEventListener('mouseleave', () => movePill(activeLink()));
  addEventListener('resize', () => movePill(activeLink()));
  $$('[data-roll]').forEach(el => {
    const txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    [...txt].forEach((c, i) => {
      const cell = document.createElement('span');
      cell.className = 'lc'; cell.setAttribute('aria-hidden', 'true'); cell.style.setProperty('--i', i);
      for (let k = 0; k < 2; k++) {
        const s = document.createElement('span');
        s.textContent = c === ' ' ? '\u00a0' : c;
        cell.appendChild(s);
      }
      el.appendChild(cell);
    });
    el.classList.add('roll');
  });

  /* ---------- active nav link ---------- */
  const secs = ['work', 'series', 'about', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  const links = $$('.nav-links a[data-link]');
  const linkObs = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.dataset.link === en.target.id));
      movePill(activeLink());
    }
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => linkObs.observe(s));

  /* ---------- scramble decode ---------- */
  const glyphs = '█▓▒░<>/\\*+=—THEAPOSTROPHE';
  function scramble(el) {
    const final = el.dataset.text;
    if (reduce) { el.textContent = final; return; }
    let frame = 0;
    const queue = [...final].map((ch, i) => ({ ch, start: i * 2, end: i * 2 + 12 }));
    (function run() {
      let out = '', done = 0;
      queue.forEach(q => {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start) out += glyphs[Math.floor(Math.random() * glyphs.length)];
        else out += ' ';
      });
      el.textContent = out;
      if (done < queue.length) { frame++; requestAnimationFrame(run); }
    })();
  }
  $$('[data-scramble]').forEach(el => {
    el.dataset.text = el.textContent.trim();
    new IntersectionObserver((es, o) => es.forEach(en => {
      if (en.isIntersecting) { scramble(en.target); o.unobserve(en.target); }
    }), { threshold: .6 }).observe(el);
  });

  /* ---------- reveal on scroll ---------- */
  const ro = new IntersectionObserver((es, o) => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => ro.observe(el));

  /* ---------- statement word reveal ---------- */
  $$('.statement p').forEach(p => {
    const words = p.textContent.trim().split(/\s+/);
    const hl = ['light', 'ember', 'white'];
    p.innerHTML = words.map(w =>
      `<span class="w${hl.includes(w.replace(/[^A-Za-z]/g, '').toLowerCase()) ? ' hl' : ''}">${w}</span>`).join(' ');
    const ws = $$('.w', p);
    const so = new IntersectionObserver((es, o) => es.forEach(en => {
      if (!en.isIntersecting) return;
      ws.forEach((w, i) => setTimeout(() => w.classList.add('in'), i * 55));
      o.disconnect();
    }), { threshold: .3 });
    so.observe(p);
  });

  /* ---------- hero slideshow ---------- */
  const slides = $$('.hero-slide');
  const heroCount = $('.hero-count b');
  let si = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[si].classList.remove('active');
      si = (si + 1) % slides.length;
      slides[si].classList.add('active');
      if (heroCount) heroCount.textContent = String(si + 1).padStart(2, '0');
    }, 5200);
  }

  /* ---------- gallery: series groups, filter tabs, series covers ---------- */
  const tiles = $$('.tile');
  const groups = $$('.group');
  const filters = $$('.filter');
  const setFilter = (cat) => {
    filters.forEach(b => b.classList.toggle('active', b.dataset.filter === cat));
    groups.forEach(g => g.classList.toggle('is-hidden', cat !== 'all' && g.dataset.group !== cat));
  };
  filters.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));
  $$('[data-go]').forEach(card => {
    const go = () => { setFilter(card.dataset.go); $('#work').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('.lb-stage img'),
    lbTitle = $('.lb-bottom h3'), lbMeta = $('.lb-bottom p'), lbCount = $('.lb-count');
  let list = [], li = 0;
  const visible = () => tiles.filter(t => !t.closest('.group').classList.contains('is-hidden'));
  function show(i) {
    li = (i + list.length) % list.length;
    const t = list[li];
    lbImg.classList.remove('shown');
    const img = new Image();
    img.onload = () => {
      lbImg.src = img.src;
      requestAnimationFrame(() => lbImg.classList.add('shown'));
    };
    img.src = t.querySelector('img').dataset.full;
    lbImg.alt = t.querySelector('img').alt;
    lbTitle.textContent = t.querySelector('h3').textContent;
    lbMeta.textContent = t.querySelector('.tile-cap p').textContent;
    lbCount.textContent = `${String(li + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
  }
  tiles.forEach(t => t.addEventListener('click', () => {
    list = visible();
    show(list.indexOf(t));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }));
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  $('.lb-close').addEventListener('click', closeLb);
  $('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(li - 1); });
  $('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(li + 1); });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(li - 1);
    if (e.key === 'ArrowRight') show(li + 1);
  });
  /* swipe */
  let tx = null;
  lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(li + (dx < 0 ? 1 : -1));
    tx = null;
  }, { passive: true });

  /* ---------- series rail: drag to scroll ---------- */
  const rail = $('.rail');
  let down = false, startX = 0, startL = 0;
  rail.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    down = true; startX = e.clientX; startL = rail.scrollLeft;
    rail.classList.add('dragging');
  });
  addEventListener('pointerup', () => { down = false; rail.classList.remove('dragging'); });
  addEventListener('pointermove', e => {
    if (!down) return;
    rail.scrollLeft = startL - (e.clientX - startX);
  });

  /* ---------- 3D tilt on series cards ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.series-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${py * -7}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- counters ---------- */
  $$('.stat b').forEach(el => {
    const target = +el.dataset.count;
    new IntersectionObserver((es, o) => es.forEach(en => {
      if (!en.isIntersecting) return;
      o.disconnect();
      if (reduce) { el.textContent = target; return; }
      const t0 = performance.now(), dur = 1600;
      (function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }), { threshold: .6 }).observe(el);
  });

  /* ---------- parallax ---------- */
  const pxEls = $$('[data-parallax]');
  function parallax() {
    if (reduce) return;
    pxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translateY(${c * -(+el.dataset.parallax) * 100}px) scale(1.08)`;
    });
  }
  parallax();

  /* ---------- magnetic ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .22}px, ${y * .28}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        setTimeout(() => el.style.transition = '', 500);
      });
    });
  }
  /* ---------- work tiles: reveal on enter ---------- */
  const tileObs = new IntersectionObserver((es, o) => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
  }), { threshold: .08, rootMargin: '0px 0px -4% 0px' });
  tiles.forEach((t, i) => {
    t.style.setProperty('--d', `${(i % 3) * 90}ms`);
    if (reduce) t.classList.add('in'); else tileObs.observe(t);
  });

  /* ---------- split headings: letters rise, hover wave ---------- */
  $$('[data-split]').forEach(el => {
    if (reduce) { el.classList.add('in'); return; }
    let k = 0;
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'wd';
          [...part].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'ch'; s.style.setProperty('--i', k++); s.textContent = ch;
            w.appendChild(s);
          });
          frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el);
    el.classList.add('split');
    el.addEventListener('mouseenter', () => { el.classList.remove('wave'); void el.offsetWidth; el.classList.add('wave'); });
    new IntersectionObserver((es, o) => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
    }), { threshold: .4 }).observe(el);
  });

  /* ---------- about list stagger index ---------- */
  $$('[data-stagger] span').forEach((s, i) => s.style.setProperty('--i', i));

  /* ---------- series cards: cursor spotlight ---------- */
  $$('.series-card').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
})();

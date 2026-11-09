(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const IMG = 'assets/img/p/g/';

  const wall = document.querySelector('.p-shero__wall');
  if (wall) {
    const ph = wall.dataset.photos.split(',').map(s => s.trim());
    const cols = innerWidth < 760 ? 3 : 4, per = 6;
    for (let c = 0; c < cols; c++) {
      const col = document.createElement('div'); col.className = 'p-shero__col';
      for (let r = 0; r < per; r++) {
        const im = new Image(); im.alt = ''; im.decoding = 'async';
        im.src = IMG + ph[(c * 3 + r * 5) % ph.length] + '.webp';
        col.appendChild(im);
      }
      wall.appendChild(col);
    }
  }

  document.querySelectorAll('.p-h2, .p-statement, .p-shero__en, .p-cta__t, .p-dark__quote').forEach(el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p, i) => `<span class="ln" style="--i:${i}"><span class="ln-i">${p.trim()}</span></span>`).join('');
    el.classList.remove('rv'); el.classList.add('lines');
  });
  const hero = document.querySelector('.p-shero');
  if (hero) {
    const en = hero.querySelector('.p-shero__en');
    en.classList.remove('lines');
    requestAnimationFrame(() => setTimeout(() => { hero.classList.add('is-in'); en.classList.add('is-in'); }, 150));
  }

  document.querySelectorAll('.p-row__fig, .p-dark__fig').forEach(el => el.classList.add('cv'));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv, .cv, .lines').forEach(el => io.observe(el));

  const header = document.getElementById('pHeader');
  const menuBtn = document.getElementById('pMenuBtn');
  const menu = document.getElementById('pMenu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    menu.setAttribute('aria-hidden', !open);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const ctaBgs = [...document.querySelectorAll('.p-cta__bg')];
  let mx = 0, my = 0, smx = 0, smy = 0;
  if (fine && !reduce) addEventListener('mousemove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  function frame() {
    const y = scrollY, vh = innerHeight;
    header.classList.toggle('is-light', !hero || y > hero.offsetHeight - 90);
    if (!reduce) {
      smx += (mx - smx) * .06; smy += (my - smy) * .06;
      if (wall && y < vh * 1.2) {
        wall.style.setProperty('--mx', (smx * -26).toFixed(1) + 'px');
        wall.style.setProperty('--my', (smy * -18).toFixed(1) + 'px');
        wall.style.setProperty('--sy', (y * .35).toFixed(1) + 'px');
      }
      ctaBgs.forEach(b => {
        const r = b.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) b.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -.12).toFixed(1) + 'px');
      });
      requestAnimationFrame(frame);
    }
  }
  frame();
  if (reduce) addEventListener('scroll', frame, { passive: true });

  const vids = [...document.querySelectorAll('video[data-src]')];
  const small = matchMedia('(max-width: 760px)').matches;
  const FADE = .9;
  vids.forEach(v => {
    if (reduce) { v.poster = v.dataset.end || v.poster; return; }
    v.addEventListener('timeupdate', () => { if (v.duration && v.duration - v.currentTime < FADE) v.classList.add('is-fade'); });
    v.addEventListener('ended', () => {
      v.currentTime = 0;
      const p = v.play(); if (p && p.catch) p.catch(() => {});
      setTimeout(() => v.classList.remove('is-fade'), 250);
    });
    const vio = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) {
        if (!v.src) { v.src = small ? v.dataset.src.replace('.mp4', '_m.mp4') : v.dataset.src; }
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else if (v.src) v.pause();
    }), { rootMargin: '200px 0px', threshold: .01 });
    vio.observe(v);
  });

  if (fine && !reduce) {
    const cur = document.createElement('div'); cur.className = 'p-cursor'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="p-cursor__t">VIEW</span>';
    document.body.appendChild(cur);
    let cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('mouseover', e => {
      const t = e.target;
      cur.classList.toggle('is-view', !!t.closest('.p-biz a'));
      cur.classList.toggle('is-link', !t.closest('.p-biz a') && !!t.closest('a, button'));
      cur.classList.toggle('is-dark', !!t.closest('.p-dark, .p-menu, .p-shero, .p-cta, .p-formcard'));
    });
    const loop = () => {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, to = +el.dataset.count;
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const tick = now => {
      const k = clamp((now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString('ja-JP');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
})();

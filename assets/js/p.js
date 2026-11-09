(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const backOut = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const IMG = 'assets/img/p/g/';

  const catchEl = document.getElementById('pCatch');
  [...catchEl.children].forEach((c, i) => {
    c.innerHTML = `<span class="ln-i">${c.innerHTML}</span>`;
    c.classList.add('ln'); c.style.setProperty('--i', i);
  });
  document.querySelectorAll('.p-h2, .p-statement').forEach(el => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p, i) => `<span class="ln" style="--i:${i}"><span class="ln-i">${p.trim()}</span></span>`).join('');
    el.classList.remove('rv'); el.classList.add('lines');
  });

  const CENTER_L = 'room_24', CENTER_R = 'step4';
  const POOL = ['w01', 'w03', 'w08', 'w09', 'w13', 'w14', 'w15', 'w17', 'w19', 'w31', 'w32', 'w36', 'w37',
                'w38', 'w43', 'step1', 'step3', 'step5', 'ai_hero', 'hv1', 'hv3', 'biz2', 'room_12', 'room_13', 'expand', 'hero'];
  const wall = document.getElementById('pWall');
  const veil = document.getElementById('pVeil');
  const TW = 440, TH = 420, ROWN = 7;
  const COLS = [-4, -3, -2, -1, 0, 1, 2, 3];
  const SHIFT = { '-4': .3, '-3': -.22, '-2': .42, '-1': 0, '0': 0, '1': .38, '2': -.26, '3': .2 };
  const DIR = { '-4': 1, '-3': -1, '-2': 1, '-1': -1, '0': 1, '1': -1, '2': 1, '3': -1 };
  const tiles = [];
  let n = 0;
  for (const k of COLS) for (let r = -3; r <= 3; r++) {
    let name;
    if (r === 0 && k === -1) name = CENTER_L;
    else if (r === 0 && k === 0) name = CENTER_R;
    else name = POOL[(n * 11) % POOL.length];
    n++;
    const d = document.createElement('div');
    d.className = 'p-tile';
    d.style.width = TW + 'px'; d.style.height = TH + 'px';
    const im = new Image();
    im.src = IMG + name + '.webp'; im.alt = ''; im.decoding = 'async';
    if (name === 'step4') im.style.objectPosition = '40% 50%';
    d.appendChild(im); wall.appendChild(d);
    tiles.push({ el: d, k, r });
  }
  const colOff = {}; COLS.forEach(k => colOff[k] = 0);
  function place(g, bend) {
    const P = ROWN * (TH + g);
    const curved = Math.abs(bend) > .002;
    for (const t of tiles) {
      const x = g / 2 + t.k * (TW + g);
      const base = -TH / 2 + SHIFT[t.k] * TH;
      let y = base + t.r * (TH + g) + colOff[t.k];
      const lo = base - 3.5 * (TH + g);
      y = ((y - lo) % P + P) % P + lo;
      let tf = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      if (curved) {
        const cx = x + TW / 2, cy = y + TH / 2;
        const z = bend * (cx * cx / 5200 + cy * cy / 9000);
        tf += ` translateZ(${z.toFixed(1)}px) rotateY(${(-bend * cx / 2600).toFixed(4)}rad) rotateX(${(bend * cy / 5200).toFixed(4)}rad)`;
      }
      t.el.style.transform = tf;
    }
  }

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

  let mx = 0, my = 0, smx = 0, smy = 0;
  if (fine && !reduce) addEventListener('mousemove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  const service = document.getElementById('service');
  const cards = [...document.querySelectorAll('.p-card')];
  const PAR = [-.12, .07, -.18, .02];

  const ZOOM_K = 0, ZOOM_R = 1;
  const zoomTile = tiles.find(t => t.k === ZOOM_K && t.r === ZOOM_R);
  zoomTile.el.querySelector('img').src = IMG + 'expand.webp';
  let KF = [], CALM = null;
  function measure() {
    const vw = innerWidth, vh = innerHeight, mob = vw < 760;
    const top = id => document.getElementById(id).getBoundingClientRect().top + scrollY;
    const s0 = mob ? Math.max(vw / TW, vh / TH) * 1.02 : Math.max(vw / (2 * TW + 3), vh / TH) * 1.015;
    const G = 24;
    const S = o => Object.assign({ s: 1, rx: 0, ry: 0, rz: 0, bend: 0, veil: 0, tx: 0, ty: 0, g: G, drift: 1, dyn: 1 }, o);
    const hero = S({ s: s0, tx: mob ? (TW / 2 + 1.5) * s0 : 0, g: 3, drift: 0, dyn: 0 });
    const wallA = S({ s: mob ? .52 : .9, rx: 9, ry: -15, rz: -5, bend: .55, veil: .42 });
    CALM = S({ s: mob ? .46 : .78, veil: .87, dyn: .55 });
    const wallB = S({ s: mob ? .66 : 1.1, rx: -11, ry: 17, rz: 4, bend: .85, veil: .5 });
    const zx = G / 2 + ZOOM_K * (TW + G) + TW / 2;
    const zy = -TH / 2 + SHIFT[ZOOM_K] * TH + ZOOM_R * (TH + G) + TH / 2;
    const sc = Math.max(vw / TW, vh / TH) * 1.06;
    const zoom = S({ s: sc, tx: -zx * sc, ty: -zy * sc, drift: 0, dyn: 0 });
    const M = top('mission'), A = top('approach'), D = top('philosophy');
    KF = [[0, hero], [vh * 1.05, wallA], [M - vh * .55, wallA], [M + vh * .15, CALM],
          [A - vh * .7, CALM], [A + vh * .05, wallB], [D - vh * 1.3, wallB], [D - vh * .55, zoom]];
    for (let i = 1; i < KF.length; i++) KF[i][0] = Math.max(KF[i][0], KF[i - 1][0] + 60);
  }
  function stateAt(y) {
    if (y <= KF[0][0]) return KF[0][1];
    for (let i = 0; i < KF.length - 1; i++) {
      const [ya, A] = KF[i], [yb, B] = KF[i + 1];
      if (y < yb) {
        const t = ease(clamp((y - ya) / (yb - ya))), o = {};
        for (const key in A) o[key] = A[key] + (B[key] - A[key]) * t;
        return o;
      }
    }
    return KF[KF.length - 1][1];
  }
  measure();
  addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.body);

  let last = performance.now();
  let ys = scrollY, lastYs = ys, vel = 0;
  function frame(now) {
    const dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
    const vw = innerWidth, vh = innerHeight, y = scrollY;
    const mob = vw < 760;
    ys = reduce ? y : ys + (y - ys) * (1 - Math.exp(-dt * 7));
    const v = (ys - lastYs) / dt; lastYs = ys;
    vel += (v - vel) * Math.min(1, dt * 6);
    const st = reduce ? KF[1][1] : stateAt(ys);
    for (const k of COLS) {
      if (!reduce && st.drift > .6) colOff[k] += DIR[k] * 16 * dt * st.drift;
      else colOff[k] *= Math.exp(-dt * 4);
    }
    const vk = reduce ? 0 : clamp(vel / 2600, -1, 1) * st.dyn;
    place(st.g, st.bend + vk * .5);
    smx += (mx - smx) * Math.min(1, dt * 3); smy += (my - smy) * Math.min(1, dt * 3);
    const rx = st.rx - smy * 2.4 * st.dyn + vk * 8, ry = st.ry + smx * 3.4 * st.dyn;
    wall.style.transform =
      `translate3d(${st.tx.toFixed(1)}px,${st.ty.toFixed(1)}px,0) perspective(1700px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${st.rz.toFixed(3)}deg) scale(${st.s.toFixed(4)})`;
    veil.style.opacity = st.veil.toFixed(3);
    const e = reduce ? 1 : ease(clamp(y / (vh * 1.05)));
    root.style.setProperty('--p', e.toFixed(4));
    header.classList.toggle('is-light', y > vh * .55);
    if (!mob && !reduce) {
      const r = service.getBoundingClientRect();
      if (r.bottom > -200 && r.top < vh + 200) {
        const c = r.top + r.height / 2 - vh / 2;
        cards.forEach((el, i) => { el.style.translate = `0 ${(c * PAR[i]).toFixed(1)}px`; });
      }
    } else cards.forEach(el => { el.style.translate = ''; });
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce) { frame(performance.now()); addEventListener('scroll', () => frame(performance.now()), { passive: true }); addEventListener('resize', () => { measure(); frame(performance.now()); }); }
  else requestAnimationFrame(frame);

  document.querySelectorAll('.p-card__img, .p-slide__img, .p-dark__fig, .p-row__fig').forEach(el => el.classList.add('cv'));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv, .cv, .lines').forEach(el => io.observe(el));

  const showCatch = () => setTimeout(() => catchEl.classList.add('is-in'), 120);
  const openAt = new URLSearchParams(location.search).get('openAt');
  let skipOpen = reduce || scrollY > 5 || location.hash;
  try { if (sessionStorage.getItem('pOpenSeen')) skipOpen = true; sessionStorage.setItem('pOpenSeen', '1'); } catch (_) { /* 保存できない環境でも再生だけはする */ }
  if (openAt !== null) skipOpen = false;
  if (skipOpen) showCatch();
  else {
    root.classList.add('is-opening');
    const vw = innerWidth, vh = innerHeight, NS = 'http://www.w3.org/2000/svg';
    const ov = document.createElement('div'); ov.className = 'p-open'; ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = `<svg width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}"><defs><linearGradient id="pGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d79c"/><stop offset=".5" stop-color="#b6a069"/><stop offset="1" stop-color="#8c7841"/></linearGradient>
      <mask id="pOpenMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${vw}" height="${vh}"><rect width="${vw}" height="${vh}" fill="#fff"/><g id="pHoles"></g></mask></defs>
      <rect width="${vw}" height="${vh}" fill="#fff" mask="url(#pOpenMask)"/><g id="pFills"></g></svg>`;
    document.body.appendChild(ov);
    const holesG = ov.querySelector('#pHoles'), fillsG = ov.querySelector('#pFills');
    const a = clamp(Math.min(vw, vh) * .055, 26, 54), gap = a * .42, tot = 3 * a + 2 * gap;
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      const hole = document.createElementNS(NS, 'rect'); hole.setAttribute('fill', '#000'); holesG.appendChild(hole);
      const fill = document.createElementNS(NS, 'rect'); fill.setAttribute('fill', i === 8 ? 'url(#pGold)' : '#1c3461'); fillsG.appendChild(fill);
      cells.push({ r, c, hole, fill,
        sx: vw / 2 - tot / 2 + c * (a + gap), sy: vh / 2 - tot / 2 + r * (a + gap),
        ex: c * vw / 3 - (c === 0 ? 2 : 0), ey: r * vh / 3 - (r === 0 ? 2 : 0) });
    }
    const T_POP = 70, T_DIA = 1000, T_WIN = 1380, T_EXP = 1650, T_END = 2750;
    let t0 = null, done = false;
    const finish = () => {
      if (done) return; done = true;
      ov.classList.add('is-out'); root.classList.remove('is-opening'); showCatch();
      setTimeout(() => ov.remove(), 700);
    };
    const step = now => {
      if (done) return;
      if (t0 === null) t0 = now;
      const t = openAt !== null ? +openAt : now - t0;
      const ex = ease(clamp((t - T_EXP) / (T_END - T_EXP - 150)));
      cells.forEach((cl, i) => {
        const pop = backOut(clamp((t - i * T_POP) / 380));
        let w = a + (vw / 3 + 2 - a) * ex, h = a + (vh / 3 + 2 - a) * ex;
        let x = cl.sx + (cl.ex - cl.sx) * ex, y = cl.sy + (cl.ey - cl.sy) * ex;
        let rot = 0, k = pop;
        if (i === 8) {
          const dm = easeOut(clamp((t - T_DIA) / 360));
          rot = 45 * (1 - dm); k *= .72 + .28 * dm;
        }
        const cw = w * k, ch = h * k, cx = x + w / 2, cy = y + h / 2;
        for (const el of [cl.hole, cl.fill]) {
          el.setAttribute('x', (cx - cw / 2).toFixed(1)); el.setAttribute('y', (cy - ch / 2).toFixed(1));
          el.setAttribute('width', Math.max(0, cw).toFixed(1)); el.setAttribute('height', Math.max(0, ch).toFixed(1));
          el.setAttribute('transform', rot ? `rotate(${rot.toFixed(2)} ${cx.toFixed(1)} ${cy.toFixed(1)})` : '');
        }
        cl.fill.setAttribute('opacity', (1 - easeOut(clamp((t - T_WIN - i * 25) / 300))).toFixed(3));
      });
      if (openAt !== null) return;
      if (t >= T_END) finish(); else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    if (openAt === null) ['click', 'wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, finish, { once: true, passive: true }));
  }

  const slider = document.getElementById('pSlider');
  const arrows = document.querySelectorAll('.p-arrow');
  const stepW = () => { const c = slider.querySelector('.p-slide'); return c ? c.offsetWidth + 22 : 300; };
  arrows.forEach(b => b.addEventListener('click', () => slider.scrollBy({ left: stepW() * +b.dataset.dir, behavior: 'smooth' })));
  const upd = () => {
    const max = slider.scrollWidth - slider.clientWidth - 2;
    arrows[0].disabled = slider.scrollLeft <= 2;
    arrows[1].disabled = slider.scrollLeft >= max;
  };
  slider.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();

  const ring = document.getElementById('pRing');
  const RING = ['w01', 'hv1', 'w37', 'step3', 'w09', 'room_12', 'w14', 'step5', 'w32', 'ai_hero', 'w31', 'room_13', 'w38', 'hv4'];
  const buildRing = () => {
    ring.innerHTML = '';
    const w = innerWidth < 760 ? 140 : 250, gp = innerWidth < 760 ? 12 : 18;
    const th = 360 / RING.length;
    const R = (w + gp) / (2 * Math.tan(Math.PI / RING.length));
    ring.style.setProperty('--R', R.toFixed(1) + 'px');
    RING.forEach((name, i) => {
      const d = document.createElement('div');
      d.className = 'p-ring__t';
      d.style.transform = `rotateY(${i * th}deg) translateZ(${R}px)`;
      const im = new Image(); im.src = IMG + name + '.webp'; im.alt = ''; im.loading = 'lazy';
      d.appendChild(im); ring.appendChild(d);
    });
  };
  buildRing();
  let rw = innerWidth;
  addEventListener('resize', () => { if ((rw < 760) !== (innerWidth < 760)) buildRing(); rw = innerWidth; });

  if (fine && !reduce) {
    const cur = document.createElement('div'); cur.className = 'p-cursor'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="p-cursor__t">VIEW</span>';
    document.body.appendChild(cur);
    let cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    document.addEventListener('mouseover', e => {
      const t = e.target;
      cur.classList.toggle('is-view', !!t.closest('.p-card, .p-slide'));
      cur.classList.toggle('is-link', !t.closest('.p-card, .p-slide') && !!t.closest('a, button'));
      cur.classList.toggle('is-dark', !!t.closest('.p-dark, .p-menu, .p-hero'));
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

(() => {
  const sec = document.getElementById('story');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobQ = matchMedia('(max-width: 760px)');
  const frame = document.getElementById('pStoryFrame');
  const vids = [...frame.querySelectorAll('video')];
  const lis = [...document.querySelectorAll('#pStoryCh li')];
  const bars = lis.map(li => li.querySelector('.bar i'));
  const cap = document.getElementById('pStoryCap');
  const EN = ['Planning', 'Sales', 'Operation', 'Education'];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let cur = -1, loaded = false, visible = false;

  if (reduce) vids.forEach((v, i) => { v.poster = `assets/video/story${i + 1}_end.webp`; });

  function load() {
    if (loaded || reduce) return;
    loaded = true;
    const suf = mobQ.matches ? '_m' : '';
    vids.forEach((v, i) => { v.preload = i === 0 ? 'auto' : 'metadata'; v.src = `assets/video/story${i + 1}${suf}.mp4`; });
    play();
  }
  function play() {
    if (reduce || !loaded || !visible || cur < 0) return;
    const v = vids[cur];
    v.preload = 'auto';
    try { v.currentTime = 0; } catch (e) { /* 読み込み前 */ }
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }
  function set(i, force) {
    if (i === cur && !force) return;
    cur = i;
    vids.forEach((v, k) => {
      v.classList.toggle('is-on', k === i);
      if (k !== i && loaded) {
        v.pause();
        setTimeout(() => { if (k !== cur) { try { v.currentTime = 0; } catch (e) { /* 読み込み前 */ } } }, 800);
      }
    });
    lis.forEach((li, k) => li.classList.toggle('is-on', k === i));
    bars.forEach((b, k) => { b.style.transform = `scaleX(${k < i || (reduce && k === i) ? 1 : 0})`; });
    cap.querySelector('.no').textContent = '0' + (i + 1);
    cap.querySelector('.en').textContent = EN[i];
    play();
  }

  (function tick() {
    if (visible && loaded && cur >= 0) {
      const v = vids[cur];
      if (v.duration) bars[cur].style.transform = `scaleX(${clamp(v.currentTime / v.duration).toFixed(3)})`;
    }
    requestAnimationFrame(tick);
  })();

  vids.forEach((v, k) => v.addEventListener('ended', () => { if (k === cur) set((cur + 1) % 4, true); }));

  function onScroll() {
    if (reduce || mobQ.matches) { frame.style.removeProperty('--sp'); return; }
    const r = frame.getBoundingClientRect(), vh = innerHeight;
    frame.style.setProperty('--sp', clamp((r.top - vh * .3) / (vh * .6)).toFixed(3));
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  lis.forEach((li, i) => li.querySelector('button').addEventListener('click', () => set(i, true)));

  new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) load(); }), { rootMargin: '100% 0px' }).observe(sec);
  new IntersectionObserver(es => es.forEach(en => {
    visible = en.isIntersecting;
    if (visible) play(); else if (loaded) vids.forEach(v => v.pause());
  }), { threshold: .2 }).observe(frame);

  set(0, true);
  onScroll();
})();

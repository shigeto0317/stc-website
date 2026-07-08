// ST CONSULTING corporate site

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const navToggle = document.getElementById("navToggle");
  const globalNav = document.getElementById("globalNav");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 現在ページのナビを強調
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".global-nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").split("#")[0];
    if (href === currentPage) a.classList.add("is-current");
  });

  // ヘッダー：スクロールで白背景に切り替え＋下スクロールで隠す
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    if (!prefersReduced && !globalNav.classList.contains("is-open")) {
      if (y > 320 && y > lastY + 4) {
        header.classList.add("is-hidden");
      } else if (y < lastY - 4 || y <= 320) {
        header.classList.remove("is-hidden");
      }
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // モバイルメニュー開閉
  navToggle.addEventListener("click", () => {
    const open = globalNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
  });

  // メニュー内リンクを押したら閉じる
  globalNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      globalNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // ヒーローの見出しを1文字ずつ立ち上げる
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle && !prefersReduced) {
    const nodes = Array.from(heroTitle.childNodes);
    heroTitle.textContent = "";
    let i = 0;
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const ch of node.textContent) {
          const span = document.createElement("span");
          span.className = "char";
          span.textContent = ch;
          span.style.animationDelay = `${0.3 + i * 0.075}s`;
          heroTitle.appendChild(span);
          i += 1;
        }
      } else {
        heroTitle.appendChild(node.cloneNode(false));
      }
    });
  }

  // スクロール連動のフェードイン
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // 実績数値のカウントアップ
  const statValues = document.querySelectorAll(".stat-value");
  const fmt = (n) => n.toLocaleString("ja-JP");

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (prefersReduced || !Number.isFinite(target)) {
      el.textContent = fmt(target);
      return;
    }
    const duration = 2200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // 後半をゆっくり
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0";
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const statIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statValues.forEach((el) => statIo.observe(el));
  }

  // パララックス（ロゴ透かし・背景の英字・ヒーロー本文の退場）
  const heroLogo = document.querySelector(".hero-logo-bg");
  const heroInner = document.querySelector(".hero-inner");
  const ghosts = document.querySelectorAll(".ghost");
  if (!prefersReduced) {
    let ticking = false;
    const parallax = () => {
      const y = window.scrollY;
      if (heroLogo) {
        heroLogo.style.transform = `translateY(calc(-50% + ${y * 0.32}px))`;
      }
      if (heroInner) {
        heroInner.style.transform = `translateY(${y * 0.22}px)`;
        heroInner.style.opacity = String(Math.max(0, 1 - y / 640));
      }
      ghosts.forEach((g) => {
        const rect = g.parentElement.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) * 0.16;
        g.style.transform = `translateY(${progress}px)`;
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(parallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    parallax();
  }

  // 金の粒子（ヒーロー・下層ページタイトル帯・CTA帯に散らす）
  if (!prefersReduced) {
    document.querySelectorAll(".hero, .page-hero, .cta-band, .section-contact").forEach((host) => {
      const layer = document.createElement("div");
      layer.className = "particle-layer";
      const count = host.classList.contains("hero") ? 38 : 20;
      for (let n = 0; n < count; n += 1) {
        const s = document.createElement("span");
        const size = 2 + Math.random() * 3.5;
        s.style.width = `${size}px`;
        s.style.height = `${size}px`;
        s.style.left = `${Math.random() * 100}%`;
        s.style.animationDuration = `${6 + Math.random() * 10}s`;
        s.style.animationDelay = `${-Math.random() * 14}s`;
        s.style.setProperty("--dx", `${Math.random() * 120 - 60}px`);
        layer.appendChild(s);
      }
      host.appendChild(layer);
    });
  }

  // ページ遷移フェード（サイト内リンクのみ）
  if (!prefersReduced) {
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || a.target === "_blank") return;
        // 同一ページ内アンカーは対象外
        const [file, hash] = href.split("#");
        if (file === currentPage && hash) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => { location.href = href; }, 320);
      });
    });
  }

  // スポットライト演出（トップページのヒーローのみ）
  var spotHero = document.querySelector(".hero");
  var spotDark = document.querySelector(".spot-dark");
  if (spotHero && spotDark && !prefersReduced) {
    var spotX = null;
    var spotT = 0;
    var setSpot = function (x, y) {
      spotDark.style.setProperty("--mx", x + "px");
      spotDark.style.setProperty("--my", y + "px");
    };
    spotHero.addEventListener("mousemove", function (e) {
      var r = spotHero.getBoundingClientRect();
      spotX = e.clientX - r.left;
      setSpot(e.clientX - r.left, e.clientY - r.top);
    });
    // マウスが動くまでは光がゆっくり巡回する
    (function spotOrbit() {
      if (spotX === null) {
        spotT += 0.006;
        var r = spotHero.getBoundingClientRect();
        setSpot(
          r.width * (0.5 + 0.33 * Math.cos(spotT)),
          r.height * (0.45 + 0.28 * Math.sin(spotT * 1.3))
        );
      }
      requestAnimationFrame(spotOrbit);
    })();
  }

  // 戻る/進むでキャッシュ復元されたときにフェード状態を解除
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-leaving");
  });

  // お問い合わせフォーム：URL未設定の間は案内を表示
  const contactBtn = document.getElementById("contactFormBtn");
  if (contactBtn && contactBtn.getAttribute("href") === "#") {
    contactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert("お問い合わせフォームは現在準備中です。");
    });
  }
});

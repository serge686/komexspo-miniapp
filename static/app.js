const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const screen = document.getElementById("screen");
const btnBack = document.getElementById("btnBack");

const state = {
  page: "home",
  history: ["home"]
};

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function go(page) {
  if (state.page !== page) {
    state.history.push(page);
  }
  state.page = page;
  render();
  updateBack();
}

function back() {
  if (state.history.length > 1) {
    state.history.pop();
    state.page = state.history[state.history.length - 1];
    render();
    updateBack();
  }
}

function updateBack() {
  if (!btnBack) return;
  btnBack.style.display = state.history.length > 1 ? "inline-flex" : "none";
}

if (btnBack) {
  btnBack.addEventListener("click", back);
}

function renderHome() {
  return `
    <section class="hero hero-parallax" id="hero">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>

      <div class="hero-shine-bg"></div>

      <div class="hero-inner">
        <div class="hero-text" data-parallax="text">
          <div class="hero-badge reveal reveal-1">KomExpo Mini App</div>

          <h1 class="hero-title reveal reveal-2">
            Добро пожаловать в
            <span class="hero-title-gradient">KomExpo</span>
          </h1>

          <p class="hero-subtitle reveal reveal-3">
            Современное Mini App пространство для быстрого доступа к сервисам,
            информации и возможностям выставки — красиво, удобно и в одном месте.
          </p>

          <div class="hero-actions reveal reveal-4">
            <button class="hero-btn hero-btn-primary shine-btn" onclick="go('catalog')">
              <span class="btn-text">Start</span>
              <span class="btn-shine"></span>
            </button>

            <button class="hero-btn hero-btn-secondary" onclick="go('about')">
              Подробнее
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCatalog() {
  return `
    <section class="page-card">
      <h2 class="page-title">Каталог</h2>
      <p class="page-text">Здесь будет каталог разделов, участников или сервисов.</p>
    </section>
  `;
}

function renderAbout() {
  return `
    <section class="page-card">
      <h2 class="page-title">О проекте</h2>
      <p class="page-text">
        KomExpo Mini App — это удобный цифровой интерфейс для навигации,
        информации и быстрых действий внутри проекта.
      </p>
    </section>
  `;
}

function attachHeroEffects() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const text = hero.querySelector('[data-parallax="text"]');
  const orb1 = hero.querySelector(".hero-orb-1");
  const orb2 = hero.querySelector(".hero-orb-2");
  const orb3 = hero.querySelector(".hero-orb-3");

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    if (text) {
      text.style.transform = `translate3d(${currentX * 10}px, ${currentY * 10}px, 0)`;
    }

    if (orb1) {
      orb1.style.transform = `translate3d(${currentX * 18}px, ${currentY * 18}px, 0) scale(1.02)`;
    }

    if (orb2) {
      orb2.style.transform = `translate3d(${currentX * -22}px, ${currentY * -22}px, 0) scale(1.04)`;
    }

    if (orb3) {
      orb3.style.transform = `translate3d(${currentX * 14}px, ${currentY * -14}px, 0) scale(1.03)`;
    }

    rafId = requestAnimationFrame(animate);
  }

  function handleMove(e) {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    targetX = (x - 0.5) * 2;
    targetY = (y - 0.5) * 2;
  }

  function resetMove() {
    targetX = 0;
    targetY = 0;
  }

  hero.addEventListener("mousemove", handleMove);
  hero.addEventListener("mouseleave", resetMove);

  if (rafId) cancelAnimationFrame(rafId);
  animate();
}

function render() {
  if (state.page === "home") {
    screen.innerHTML = renderHome();
    attachHeroEffects();
    return;
  }

  if (state.page === "catalog") {
    screen.innerHTML = renderCatalog();
    return;
  }

  if (state.page === "about") {
    screen.innerHTML = renderAbout();
    return;
  }

  screen.innerHTML = renderHome();
  attachHeroEffects();
}

render();
updateBack();
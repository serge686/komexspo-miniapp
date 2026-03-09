const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const screen = document.getElementById("screen");
const btnBack = document.getElementById("btnBack");

const state = {
  page: "home",
  history: ["home"]
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setActiveTab() {
  qsa(".tab[data-go]").forEach((tab) => {
    const isActive = tab.dataset.go === state.page;
    tab.classList.toggle("is-active", isActive);
  });
}

function updateBack() {
  const show = state.history.length > 1 || state.page !== "home";

  if (btnBack) {
    btnBack.style.display = show ? "inline-flex" : "none";
  }

  if (tg?.BackButton) {
    if (show) tg.BackButton.show();
    else tg.BackButton.hide();
  }
}

function updateMainButton() {
  if (!tg?.MainButton) return;

  if (state.page === "packages") {
    tg.MainButton.setText("Оставить заявку");
    tg.MainButton.show();
    return;
  }

  if (state.page === "home") {
    tg.MainButton.setText("Оставить заявку");
    tg.MainButton.show();
    return;
  }

  tg.MainButton.hide();
}

function go(page) {
  if (state.page !== page) {
    state.history.push(page);
    state.page = page;
  }

  render();
  updateBack();
  updateMainButton();
  setActiveTab();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function back() {
  if (state.history.length > 1) {
    state.history.pop();
    state.page = state.history[state.history.length - 1];
  } else {
    state.page = "home";
  }

  render();
  updateBack();
  updateMainButton();
  setActiveTab();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function handleLeadAction() {
  if (state.page !== "home") {
    go("home");
    setTimeout(() => scrollToSection("contact-form"), 120);
    return;
  }

  scrollToSection("contact-form");
}

function openExternal(url) {
  if (!url) return;

  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function sendMail(email) {
  if (!email) return;
  window.location.href = `mailto:${email}`;
}

function bindActions() {
  qsa("[data-go]").forEach((el) => {
    el.addEventListener("click", () => {
      const page = el.dataset.go;
      if (page) go(page);
    });
  });

  qsa("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.scroll;
      if (target) scrollToSection(target);
    });
  });

  qsa("[data-link]").forEach((el) => {
    el.addEventListener("click", () => {
      openExternal(el.dataset.link);
    });
  });

  qsa("[data-mail]").forEach((el) => {
    el.addEventListener("click", () => {
      sendMail(el.dataset.mail);
    });
  });

  qsa("[data-lead]").forEach((el) => {
    el.addEventListener("click", handleLeadAction);
  });
}

function renderHome() {
  return `
    <div class="page page-home">
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-text">
            Закрываем вакансии быстрее: AI-рекрутер, точный сорсинг и HR-автоматизация — без ручной рутины.
          </p>
        </div>

        <div class="hero-cta">
          <button class="btn btn-primary" data-lead>Оставить заявку</button>
          <button class="btn btn-secondary" data-go="packages">Пакеты</button>
        </div>
      </section>

      <section class="cards-preview">
        <button class="info-card" type="button" data-scroll="ai-recruiter">
          <h3>AI-рекрутер: скорость найма</h3>
          <p>Отвечаем, квалифицируем, назначаем интервью — 24/7</p>
        </button>

        <button class="info-card" type="button" data-scroll="sourcing">
          <h3>Сорсинг + скрининг: точное попадание</h3>
          <p>Поиск, фильтр, shortlist — меньше “мимо”, больше релеванта</p>
        </button>

        <button class="info-card" type="button" data-scroll="hr-automation">
          <h3>HR-автоматизация: минус рутина</h3>
          <p>Онбординг, база знаний, helpdesk — процессы на автопилоте</p>
        </button>
      </section>

      <nav class="section-nav" aria-label="Секции">
        <button class="chip" type="button" data-scroll="ai-recruiter">AI-рекрутер</button>
        <button class="chip" type="button" data-scroll="sourcing">Сорсинг</button>
        <button class="chip" type="button" data-scroll="hr-automation">HR-автоматизация</button>
        <button class="chip" type="button" data-scroll="contacts">Контакты</button>
      </nav>

      <section id="ai-recruiter" class="content-section">
        <h2>AI-рекрутер</h2>
        <p>
          Держим найм в движении: ответы кандидату за минуты, квалификация и интервью без провалов.
        </p>
        <ul class="feature-list">
          <li>Быстрый контакт с кандидатами и первичный скрининг</li>
          <li>Назначение интервью и напоминания</li>
          <li>Контроль статусов и воронки</li>
          <li>Меньше потерь кандидатов из-за тишины</li>
        </ul>
      </section>

      <section id="sourcing" class="content-section">
        <h2>Сорсинг + скрининг</h2>
        <p>
          Находим и отбираем сильных кандидатов: меньше шума, больше точности в shortlist.
        </p>
        <ul class="feature-list">
          <li>Поиск кандидатов по профилю и требованиям</li>
          <li>Автоскрининг резюме и первичные вопросы</li>
          <li>Shortlist с аргументацией почему подходит</li>
          <li>Экономия времени рекрутера и нанимающего</li>
        </ul>
      </section>

      <section id="hr-automation" class="content-section">
        <h2>HR-автоматизация</h2>
        <p>
          Убираем рутину из HR-процессов и ускоряем внутренние операции команды.
        </p>
        <ul class="feature-list">
          <li>Онбординг новых сотрудников</li>
          <li>FAQ, база знаний и HR-helpdesk</li>
          <li>Автоматизация типовых запросов</li>
          <li>Единая точка коммуникации для команды</li>
        </ul>
      </section>

      <section id="contacts" class="content-section contacts-section">
        <h2>Контакты</h2>
        <div class="contact-card">
          <div class="contact-row">
            <strong>KomExpo</strong>
          </div>
          <div class="contact-row">
            <span>Email</span>
            <button class="link-btn" type="button" data-mail="info@komexpo.de">info@komexpo.de</button>
          </div>
          <div class="contact-row">
            <span>Сайт</span>
            <button class="link-btn" type="button" data-link="https://komexspo-miniapp.onrender.com">Открыть</button>
          </div>
          <div class="contact-row">
            <span>GitHub</span>
            <button class="link-btn" type="button" data-link="https://github.com/serge686/komexspo-miniapp">Репозиторий</button>
          </div>
        </div>
      </section>

      <section id="contact-form" class="content-section final-cta">
        <h2>Оставить заявку</h2>
        <p>Выберите удобный способ связи.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" type="button" data-mail="info@komexpo.de">Написать на email</button>
          <button class="btn btn-secondary" type="button" data-go="packages">Смотреть пакеты</button>
        </div>
      </section>
    </div>
  `;
}

function renderPackages() {
  return `
    <div class="page page-packages">
      <section class="page-head">
        <h1>Пакеты</h1>
        <p>Выберите формат подключения под ваш текущий объём найма.</p>
      </section>

      <section class="packages-list">
        <div class="package-card">
          <h3>Start</h3>
          <p>Для точечных вакансий и быстрого запуска.</p>
        </div>

        <div class="package-card">
          <h3>Growth</h3>
          <p>Для постоянного потока подбора и shortlist-кандидатов.</p>
        </div>

        <div class="package-card">
          <h3>Scale</h3>
          <p>Для команд, которым нужны HR-автоматизация и AI-рекрутер 24/7.</p>
        </div>
      </section>

      <section class="content-section final-cta">
        <h2>Обсудить подключение</h2>
        <p>Вернёмся на главную и откроем блок заявки.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" type="button" data-lead>Оставить заявку</button>
          <button class="btn btn-secondary" type="button" data-go="home">На главную</button>
        </div>
      </section>
    </div>
  `;
}

function render() {
  if (!screen) return;

  switch (state.page) {
    case "packages":
      screen.innerHTML = renderPackages();
      break;
    case "home":
    default:
      screen.innerHTML = renderHome();
      break;
  }

  bindActions();
}

if (btnBack) {
  btnBack.addEventListener("click", back);
}

if (tg?.BackButton) {
  tg.BackButton.onClick(back);
}

if (tg?.MainButton) {
  tg.MainButton.onClick(handleLeadAction);
  tg.MainButton.setParams({
    is_visible: true,
    text: "Оставить заявку"
  });
}

render();
updateBack();
updateMainButton();
setActiveTab();const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

const screen = document.getElementById("screen");
const btnBack = document.getElementById("btnBack");

const state = {
  page: "home",
  history: ["home"]
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setActiveTab() {
  qsa(".tab[data-go]").forEach((tab) => {
    const isActive = tab.dataset.go === state.page;
    tab.classList.toggle("is-active", isActive);
  });
}

function updateBack() {
  const show = state.history.length > 1 || state.page !== "home";

  if (btnBack) {
    btnBack.style.display = show ? "inline-flex" : "none";
  }

  if (tg?.BackButton) {
    if (show) tg.BackButton.show();
    else tg.BackButton.hide();
  }
}

function updateMainButton() {
  if (!tg?.MainButton) return;

  if (state.page === "packages") {
    tg.MainButton.setText("Оставить заявку");
    tg.MainButton.show();
    return;
  }

  if (state.page === "home") {
    tg.MainButton.setText("Оставить заявку");
    tg.MainButton.show();
    return;
  }

  tg.MainButton.hide();
}

function go(page) {
  if (state.page !== page) {
    state.history.push(page);
    state.page = page;
  }

  render();
  updateBack();
  updateMainButton();
  setActiveTab();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function back() {
  if (state.history.length > 1) {
    state.history.pop();
    state.page = state.history[state.history.length - 1];
  } else {
    state.page = "home";
  }

  render();
  updateBack();
  updateMainButton();
  setActiveTab();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function handleLeadAction() {
  if (state.page !== "home") {
    go("home");
    setTimeout(() => scrollToSection("contact-form"), 120);
    return;
  }

  scrollToSection("contact-form");
}

function openExternal(url) {
  if (!url) return;

  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function sendMail(email) {
  if (!email) return;
  window.location.href = `mailto:${email}`;
}

function bindActions() {
  qsa("[data-go]").forEach((el) => {
    el.addEventListener("click", () => {
      const page = el.dataset.go;
      if (page) go(page);
    });
  });

  qsa("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.scroll;
      if (target) scrollToSection(target);
    });
  });

  qsa("[data-link]").forEach((el) => {
    el.addEventListener("click", () => {
      openExternal(el.dataset.link);
    });
  });

  qsa("[data-mail]").forEach((el) => {
    el.addEventListener("click", () => {
      sendMail(el.dataset.mail);
    });
  });

  qsa("[data-lead]").forEach((el) => {
    el.addEventListener("click", handleLeadAction);
  });
}

function renderHome() {
  return `
    <div class="page page-home">
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-text">
            Закрываем вакансии быстрее: AI-рекрутер, точный сорсинг и HR-автоматизация — без ручной рутины.
          </p>
        </div>

        <div class="hero-cta">
          <button class="btn btn-primary" data-lead>Оставить заявку</button>
          <button class="btn btn-secondary" data-go="packages">Пакеты</button>
        </div>
      </section>

      <section class="cards-preview">
        <button class="info-card" type="button" data-scroll="ai-recruiter">
          <h3>AI-рекрутер: скорость найма</h3>
          <p>Отвечаем, квалифицируем, назначаем интервью — 24/7</p>
        </button>

        <button class="info-card" type="button" data-scroll="sourcing">
          <h3>Сорсинг + скрининг: точное попадание</h3>
          <p>Поиск, фильтр, shortlist — меньше “мимо”, больше релеванта</p>
        </button>

        <button class="info-card" type="button" data-scroll="hr-automation">
          <h3>HR-автоматизация: минус рутина</h3>
          <p>Онбординг, база знаний, helpdesk — процессы на автопилоте</p>
        </button>
      </section>

      <nav class="section-nav" aria-label="Секции">
        <button class="chip" type="button" data-scroll="ai-recruiter">AI-рекрутер</button>
        <button class="chip" type="button" data-scroll="sourcing">Сорсинг</button>
        <button class="chip" type="button" data-scroll="hr-automation">HR-автоматизация</button>
        <button class="chip" type="button" data-scroll="contacts">Контакты</button>
      </nav>

      <section id="ai-recruiter" class="content-section">
        <h2>AI-рекрутер</h2>
        <p>
          Держим найм в движении: ответы кандидату за минуты, квалификация и интервью без провалов.
        </p>
        <ul class="feature-list">
          <li>Быстрый контакт с кандидатами и первичный скрининг</li>
          <li>Назначение интервью и напоминания</li>
          <li>Контроль статусов и воронки</li>
          <li>Меньше потерь кандидатов из-за тишины</li>
        </ul>
      </section>

      <section id="sourcing" class="content-section">
        <h2>Сорсинг + скрининг</h2>
        <p>
          Находим и отбираем сильных кандидатов: меньше шума, больше точности в shortlist.
        </p>
        <ul class="feature-list">
          <li>Поиск кандидатов по профилю и требованиям</li>
          <li>Автоскрининг резюме и первичные вопросы</li>
          <li>Shortlist с аргументацией почему подходит</li>
          <li>Экономия времени рекрутера и нанимающего</li>
        </ul>
      </section>

      <section id="hr-automation" class="content-section">
        <h2>HR-автоматизация</h2>
        <p>
          Убираем рутину из HR-процессов и ускоряем внутренние операции команды.
        </p>
        <ul class="feature-list">
          <li>Онбординг новых сотрудников</li>
          <li>FAQ, база знаний и HR-helpdesk</li>
          <li>Автоматизация типовых запросов</li>
          <li>Единая точка коммуникации для команды</li>
        </ul>
      </section>

      <section id="contacts" class="content-section contacts-section">
        <h2>Контакты</h2>
        <div class="contact-card">
          <div class="contact-row">
            <strong>KomExpo</strong>
          </div>
          <div class="contact-row">
            <span>Email</span>
            <button class="link-btn" type="button" data-mail="info@komexpo.de">info@komexpo.de</button>
          </div>
          <div class="contact-row">
            <span>Сайт</span>
            <button class="link-btn" type="button" data-link="https://komexspo-miniapp.onrender.com">Открыть</button>
          </div>
          <div class="contact-row">
            <span>GitHub</span>
            <button class="link-btn" type="button" data-link="https://github.com/serge686/komexspo-miniapp">Репозиторий</button>
          </div>
        </div>
      </section>

      <section id="contact-form" class="content-section final-cta">
        <h2>Оставить заявку</h2>
        <p>Выберите удобный способ связи.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" type="button" data-mail="info@komexpo.de">Написать на email</button>
          <button class="btn btn-secondary" type="button" data-go="packages">Смотреть пакеты</button>
        </div>
      </section>
    </div>
  `;
}

function renderPackages() {
  return `
    <div class="page page-packages">
      <section class="page-head">
        <h1>Пакеты</h1>
        <p>Выберите формат подключения под ваш текущий объём найма.</p>
      </section>

      <section class="packages-list">
        <div class="package-card">
          <h3>Start</h3>
          <p>Для точечных вакансий и быстрого запуска.</p>
        </div>

        <div class="package-card">
          <h3>Growth</h3>
          <p>Для постоянного потока подбора и shortlist-кандидатов.</p>
        </div>

        <div class="package-card">
          <h3>Scale</h3>
          <p>Для команд, которым нужны HR-автоматизация и AI-рекрутер 24/7.</p>
        </div>
      </section>

      <section class="content-section final-cta">
        <h2>Обсудить подключение</h2>
        <p>Вернёмся на главную и откроем блок заявки.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" type="button" data-lead>Оставить заявку</button>
          <button class="btn btn-secondary" type="button" data-go="home">На главную</button>
        </div>
      </section>
    </div>
  `;
}

function render() {
  if (!screen) return;

  switch (state.page) {
    case "packages":
      screen.innerHTML = renderPackages();
      break;
    case "home":
    default:
      screen.innerHTML = renderHome();
      break;
  }

  bindActions();
}

if (btnBack) {
  btnBack.addEventListener("click", back);
}

if (tg?.BackButton) {
  tg.BackButton.onClick(back);
}

if (tg?.MainButton) {
  tg.MainButton.onClick(handleLeadAction);
  tg.MainButton.setParams({
    is_visible: true,
    text: "Оставить заявку"
  });
}

render();
updateBack();
updateMainButton();
setActiveTab();
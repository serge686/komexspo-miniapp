// static/app.js

const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const screen = document.getElementById("screen");
const btnBack = document.getElementById("btnBack");

const state = {
  page: "home",
  history: ["home"],
};

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

/* ---------- NAV ---------- */
function go(page) {
  if (state.page !== page) state.history.push(page);
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
    return;
  }
  if (tg?.close) tg.close();
  else go("home");
}

function updateBack() {
  if (!btnBack) return;
  btnBack.style.visibility = (state.page === "home") ? "hidden" : "visible";
}

/* ---------- Tabs ---------- */
qsa(".tab").forEach(btn => {
  btn.addEventListener("click", () => go(btn.dataset.go));
});
if (btnBack) btnBack.addEventListener("click", back);

/* ---------- Helpers ---------- */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openLink(url) {
  if (tg?.openLink) tg.openLink(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}

/* ---------- Minimal contacts (centered) ---------- */
function contactBlock() {
  return `
    <section class="contact-minimal" id="contact">
      <div class="contact-title">Как с нами связаться</div>
      <div class="contact-text">
        Напишите удобным способом — ответим быстро и подскажем оптимальное решение.
      </div>

      <div class="contact-links">
        <button class="contact-link" type="button" id="contactTg">Telegram</button>
        <span class="contact-dot">•</span>
        <button class="contact-link" type="button" id="contactWa">WhatsApp</button>
        <span class="contact-dot">•</span>
        <button class="contact-link" type="button" id="contactMail">Email</button>
      </div>

      <div class="actions contact-actions">
        <button class="btn primary" type="button" id="contactBtnLead">Оставить заявку</button>
        <button class="btn" type="button" id="contactBtnTop">Наверх</button>
      </div>
    </section>
  `;
}

function bindContacts() {
  // 👉 подставь реальные ссылки
  const tgLink = "https://t.me/AI_KomExpo_bot";
  const waLink = "https://wa.me/"; // например: https://wa.me/79990001122
  const email = "mailto:info@komexspo.ru";

  const a = qs("#contactTg");
  const b = qs("#contactWa");
  const c = qs("#contactMail");
  const lead = qs("#contactBtnLead");
  const top = qs("#contactBtnTop");

  if (a) a.onclick = () => openLink(tgLink);
  if (b) b.onclick = () => openLink(waLink);
  if (c) c.onclick = () => openLink(email);

  if (lead) lead.onclick = () => go("lead");
  if (top) top.onclick = () => scrollToId("top");
}

/* ---------- Render ---------- */
function render() {
  if (state.page === "home") homeScreen();
  if (state.page === "packages") packagesScreen();
  if (state.page === "cases") casesScreen();
  if (state.page === "lead") leadScreen();

  qsa(".tab").forEach(t => t.classList.remove("active"));
  const active = qs(`.tab[data-go="${state.page}"]`);
  if (active) active.classList.add("active");
}

/* ---------- HOME ---------- */
function homeScreen() {
  screen.innerHTML = `
    <div id="top"></div>

    <div class="hero-pill">AI HR-агентство</div>

    <h1 class="h1">
      AI-рекрутинг<br>
      <span class="accent">и HR-автоматизация</span>
    </h1>

    <p class="lead">
      Закрываем вакансии быстрее: AI-рекрутер, точный сорсинг и HR-автоматизация — без ручной рутины.
    </p>

    <div class="actions">
      <button class="btn primary" type="button" id="btnLead">Оставить заявку</button>
      <button class="btn" type="button" id="btnPackages">Пакеты</button>
    </div>

    <div class="cards" id="services">
      <button class="cardbtn" type="button" id="card1">
        <div class="card">
          <b>AI-рекрутер: скорость найма</b>
          <small>Отвечаем, квалифицируем, назначаем интервью — 24/7</small>
        </div>
      </button>

      <button class="cardbtn" type="button" id="card2">
        <div class="card">
          <b>Сорсинг + скрининг: точное попадание</b>
          <small>Поиск, фильтр, shortlist — меньше “мимо”, больше релеванта</small>
        </div>
      </button>

      <button class="cardbtn" type="button" id="card3">
        <div class="card">
          <b>HR-автоматизация: минус рутина</b>
          <small>Онбординг, база знаний, helpdesk — процессы на автопилоте</small>
        </div>
      </button>
    </div>

    <!-- Секции, куда скроллим -->
    <section class="detail" id="sec-recruiter">
      <h2 class="section-title">AI-рекрутер</h2>
      <p class="lead">
        Держим найм в движении: ответы кандидату за минуты, квалификация и интервью без “провалов”.
      </p>
      <div class="bullets">
        • Быстрый контакт с кандидатом и первичный скрининг<br>
        • Назначение интервью + напоминания<br>
        • Контроль статусов и воронки<br>
        • Меньше потерь кандидатов из-за “тишины”
      </div>
      <div class="actions">
        <button class="btn primary" type="button" id="secRecLead">Оставить заявку</button>
        <button class="btn" type="button" id="secRecPackages">Пакеты</button>
      </div>
    </section>

    <section class="detail" id="sec-sourcing">
      <h2 class="section-title">Сорсинг + скрининг</h2>
      <p class="lead">
        Находим и отбираем сильных: меньше шума, больше точных кандидатов в shortlist.
      </p>
      <div class="bullets">
        • Поиск кандидатов по профилю и требованиям<br>
        • Автоскрининг резюме и первичные вопросы<br>
        • Shortlist с аргументацией “почему подходит”<br>
        • Экономия времени рекрутера и нанимающего
      </div>
      <div class="actions">
        <button class="btn primary" type="button" id="secSorLead">Оставить заявку</button>
        <button class="btn" type="button" id="secSorPackages">Пакеты</button>
      </div>
    </section>

    <section class="detail" id="sec-automation">
      <h2 class="section-title">HR-автоматизация</h2>
      <p class="lead">
        Снимаем HR-рутину: онбординг, база знаний, helpdesk и маршрутизация запросов — прозрачно и измеримо.
      </p>
      <div class="bullets">
        • Онбординг-сценарии с контролем прогресса<br>
        • FAQ/база знаний и шаблоны документов<br>
        • HR-helpdesk: ответы 24/7 + маршрутизация<br>
        • Аналитика обращений и точки потерь
      </div>
      <div class="actions">
        <button class="btn primary" type="button" id="secHrLead">Оставить заявку</button>
        <button class="btn" type="button" id="secHrPackages">Пакеты</button>
      </div>
    </section>

    ${contactBlock()}
  `;

  qs("#btnLead").onclick = () => go("lead");
  qs("#btnPackages").onclick = () => go("packages");

  // Скролл с карточек → к секциям
  qs("#card1").onclick = () => scrollToId("sec-recruiter");
  qs("#card2").onclick = () => scrollToId("sec-sourcing");
  qs("#card3").onclick = () => scrollToId("sec-automation");

  // CTA в секциях
  qs("#secRecLead").onclick = () => go("lead");
  qs("#secRecPackages").onclick = () => go("packages");
  qs("#secSorLead").onclick = () => go("lead");
  qs("#secSorPackages").onclick = () => go("packages");
  qs("#secHrLead").onclick = () => go("lead");
  qs("#secHrPackages").onclick = () => go("packages");

  bindContacts();
}

/* ---------- PACKAGES ---------- */
function packagesScreen() {
  screen.innerHTML = `
    <div id="top"></div>

    <h2 class="section-title">Пакеты решений</h2>

    <div class="cards two">
      <div class="card">
        <b>Start</b>
        <small>до 3 вакансий</small>
        <div class="bullets">
          • AI-рекрутер<br>
          • Скрининг кандидатов
        </div>
      </div>

      <div class="card">
        <b>Growth</b>
        <small>до 10 вакансий</small>
        <div class="bullets">
          • AI-рекрутер<br>
          • Сорсинг кандидатов<br>
          • HR-автоматизация
        </div>
      </div>

      <div class="card">
        <b>Scale</b>
        <small>массовый найм</small>
        <div class="bullets">
          • Полная автоматизация<br>
          • AI-скрининг<br>
          • HR-helpdesk
        </div>
      </div>
    </div>

    ${contactBlock()}
  `;
  bindContacts();
}

/* ---------- CASES ---------- */
function casesScreen() {
  screen.innerHTML = `
    <div id="top"></div>

    <h2 class="section-title">Кейсы</h2>

    <div class="cards">
      <div class="card">
        <b>IT компания</b>
        <small>12 вакансий за 21 день</small>
      </div>

      <div class="card">
        <b>Retail сеть</b>
        <small>массовый найм 120 сотрудников</small>
      </div>

      <div class="card">
        <b>SaaS стартап</b>
        <small>AI-рекрутинг + HR helpdesk</small>
      </div>
    </div>

    ${contactBlock()}
  `;
  bindContacts();
}

/* ---------- LEAD ---------- */
function leadScreen() {
  const user = tg?.initDataUnsafe?.user;
  const name = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "";

  screen.innerHTML = `
    <div id="top"></div>

    <h2 class="section-title">Заявка</h2>

    <p class="lead">
      Оставьте контакт и вводные. Telegram-данные подставим автоматически.
    </p>

    <form class="form" autocomplete="on">
      <div class="field">
        <label>Ф.И.О.</label>
        <input class="input" id="name" value="${name}" />
      </div>

      <div class="field">
        <label>Телефон</label>
        <input class="input" id="phone" placeholder="+7..." inputmode="tel" />
      </div>

      <div class="field">
        <label>Компания</label>
        <input class="input" id="company" />
      </div>

      <div class="field">
        <label>Объём найма (в месяц)</label>
        <input class="input" id="hiring_volume" />
      </div>

      <div class="field">
        <label>Тип вакансий</label>
        <input class="input" id="vacancies" />
      </div>

      <div class="field">
        <label>Способ связи</label>
        <select class="select" id="contact">
          <option>Telegram</option>
          <option>Телефон</option>
          <option>WhatsApp</option>
          <option>Email</option>
        </select>
      </div>

      <div class="field">
        <label>Комментарий</label>
        <textarea class="input" id="comment"
          placeholder="Например: срочно закрыть 5 продавцов, нужен сорсинг + скрининг и автоматизация ответов"></textarea>
      </div>

      <div class="row">
        <label class="checkbox">
          <input type="checkbox" id="agree">
          Согласен(на) на обработку персональных данных
        </label>
      </div>

      <div class="row">
        <button type="button" class="btn primary" id="sendLead">Отправить</button>
      </div>
    </form>

    ${contactBlock()}
  `;

  bindLead();
  bindContacts();
}

function formatPhone(input) {
  input.addEventListener("input", () => {
    let x = input.value.replace(/\D/g, "");
    if (x.startsWith("8")) x = "7" + x.slice(1);

    if (x.startsWith("7")) {
      x = x.slice(1);
      let formatted = "+7";
      if (x.length > 0) formatted += " (" + x.slice(0, 3);
      if (x.length >= 3) formatted += ") " + x.slice(3, 6);
      if (x.length >= 6) formatted += "-" + x.slice(6, 8);
      if (x.length >= 8) formatted += "-" + x.slice(8, 10);
      input.value = formatted;
    }
  });
}

function bindLead() {
  const phoneInput = qs("#phone");
  if (phoneInput) formatPhone(phoneInput);

  const send = qs("#sendLead");
  if (!send) return;

  send.onclick = () => {
    if (!qs("#agree")?.checked) {
      alert("Нужно согласие на обработку данных");
      return;
    }

    const data = {
      name: qs("#name")?.value || "",
      phone: qs("#phone")?.value || "",
      company: qs("#company")?.value || "",
      hiring_volume: qs("#hiring_volume")?.value || "",
      vacancies: qs("#vacancies")?.value || "",
      contact: qs("#contact")?.value || "",
      comment: qs("#comment")?.value || "",
      telegram_user: tg?.initDataUnsafe?.user || null,
    };

    console.log("lead", data);

    if (tg?.sendData) tg.sendData(JSON.stringify(data));
    alert("Заявка отправлена!");
    go("home");
  };
}

/* ---------- INIT ---------- */
render();
updateBack();
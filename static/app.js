const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.("secondary_bg_color");
  tg.enableClosingConfirmation?.();
}

const screen = document.getElementById("screen");
const btnBack = document.getElementById("btnBack");
const btnMenu = document.getElementById("btnMenu");
const bottomNav = document.getElementById("bottomNav");

const quizSteps = [
  {
    id: "industry",
    title: "Отрасль",
    caption: "Где сейчас нужен найм или автоматизация?",
    options: ["IT / Digital", "Продажи", "Поддержка / Call-center", "Логистика / Операции", "Другое"],
  },
  {
    id: "team_size",
    title: "Размер команды",
    caption: "Это помогает подобрать формат запуска.",
    options: ["1–10", "11–50", "51–200", "200+"],
  },
  {
    id: "hiring_volume",
    title: "Вакансий в месяц",
    caption: "Сколько ролей нужно закрывать регулярно?",
    options: ["1–3", "4–10", "11–25", "25+"],
  },
  {
    id: "roles",
    title: "Какие роли закрываете",
    caption: "Выберите приоритетную группу.",
    options: ["Массовый найм", "Точечный middle/senior", "Продажи / support", "Смешанный поток"],
  },
  {
    id: "urgency",
    title: "Срочность запуска",
    caption: "Когда нужен результат?",
    options: ["Сразу", "В течение 2 недель", "В течение месяца", "Пока изучаем"],
  },
  {
    id: "priority_metric",
    title: "Главный KPI",
    caption: "Что важнее всего в проекте?",
    options: ["Скорость закрытия", "Снижение нагрузки HR", "Качество скрининга", "Онбординг и база знаний"],
  },
];

const services = [
  {
    id: "recruiting_turnkey",
    title: "AI-рекрутинг под ключ",
    label: "Флагманский пакет",
    description: "Запускаем AI-рекрутера, автоматизируем отклики, скрининг и доведение до интервью.",
    includes: ["Карта воронки найма", "AI-скрининг кандидатов", "Назначение интервью", "Еженедельная аналитика"],
  },
  {
    id: "sourcing_screening",
    title: "Сорсинг + скрининг",
    label: "Быстрый старт",
    description: "Для компаний, которым нужно быстро расширить поток релевантных кандидатов без увеличения HR-штата.",
    includes: ["Автопоиск кандидатов", "Фильтрация анкет", "Шаблоны коммуникации", "Кандидаты в CRM"],
  },
  {
    id: "onboarding_knowledge",
    title: "Онбординг + база знаний",
    label: "Для роста команды",
    description: "Автоматизируем адаптацию, ответы на типовые вопросы и выдачу материалов новым сотрудникам.",
    includes: ["Сценарии онбординга", "HR-helpdesk", "FAQ и материалы", "Контроль прохождения этапов"],
  },
  {
    id: "hr_helpdesk",
    title: "HR-helpdesk",
    label: "Поддержка 24/7",
    description: "AI-ассистент для сотрудников и HR-команды: отпуска, регламенты, ответы и сбор обращений.",
    includes: ["Чат-ассистент", "Маршрутизация вопросов", "Логи обращений", "Снижение нагрузки HR"],
  },
];

const cases = [
  {
    title: "Массовый найм в продажах",
    result: "Сократили время первого контакта с кандидатом до нескольких минут.",
  },
  {
    title: "HR-автоматизация поддержки",
    result: "Убрали ручные ответы на типовые вопросы и разгрузили HR-команду.",
  },
  {
    title: "Онбординг сети филиалов",
    result: "Собрали единый сценарий адаптации и контроль прохождения этапов.",
  },
];

const state = {
  page: new URLSearchParams(window.location.search).get("screen") || "home",
  history: [new URLSearchParams(window.location.search).get("screen") || "home"],
  events: [],
  quiz: {
    step: 0,
    answers: {},
    completed: false,
    result: null,
  },
  lead: {
    package_id: "",
  },
  sending: false,
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function track(name, payload = {}) {
  state.events.push({
    name,
    payload,
    ts: new Date().toISOString(),
  });
}

function go(page) {
  if (state.page !== page) {
    state.history.push(page);
    state.page = page;
  }
  render();
  updateBack();
  updateNav();
}

function back() {
  if (state.history.length > 1) {
    state.history.pop();
    state.page = state.history[state.history.length - 1] || "home";
    render();
    updateBack();
    updateNav();
  }
}

function updateBack() {
  if (!btnBack) return;
  btnBack.style.visibility = state.history.length > 1 ? "visible" : "hidden";
}

function updateNav() {
  qsa(".nav-btn", bottomNav).forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.page === state.page);
  });
}

function getTelegramUser() {
  const user = tg?.initDataUnsafe?.user || {};
  return {
    id: user.id || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    username: user.username || "",
  };
}

function getFullNameFromTelegram() {
  const user = getTelegramUser();
  return [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
}

function getQuizAnswer(id) {
  return state.quiz.answers[id] || "";
}

function computeQuizResult() {
  const hiring = getQuizAnswer("hiring_volume");
  const roles = getQuizAnswer("roles");
  const urgency = getQuizAnswer("urgency");
  const metric = getQuizAnswer("priority_metric");

  let title = "AI-рекрутинг под ключ";
  let format = "Под ключ";
  let rolesOut = ["AI-рекрутер", "Сорсинг-ассистент", "AI-скрининг"];
  let summary = "Подходит для компаний, где важны скорость найма, поток кандидатов и контроль воронки.";

  if (metric === "Онбординг и база знаний") {
    title = "Онбординг + HR-helpdesk";
    format = "Под ключ + база знаний";
    rolesOut = ["AI-onboarding", "HR-helpdesk", "Knowledge bot"];
    summary = "Фокус на адаптации, ответах сотрудникам и снижении нагрузки HR-команды.";
  } else if (roles === "Массовый найм" || hiring === "25+") {
    title = "Массовый найм и автоскрининг";
    format = "Под ключ";
    rolesOut = ["AI-рекрутер", "Скрининг-бот", "Интервью-координатор"];
    summary = "Для большого входящего потока, массового найма и быстрого вывода кандидатов на интервью.";
  } else if (roles === "Точечный middle/senior") {
    title = "Сорсинг + точечный скрининг";
    format = "Оператор в штат + обучение";
    rolesOut = ["AI-сорсер", "Research assistant", "Скрининг-ассистент"];
    summary = "Для аккуратного поиска и квалификации специалистов под сложные роли.";
  } else if (urgency === "Сразу") {
    title = "Быстрый запуск AI HR-воронки";
    format = "Экспресс-аудит + запуск";
    rolesOut = ["AI-рекрутер", "Интервью-координатор", "HR-аналитик"];
    summary = "Подходит, когда важно быстро стартовать и показать первые результаты в ближайшие недели.";
  }

  return { title, format, roles: rolesOut, summary };
}

function answerQuiz(value) {
  const step = quizSteps[state.quiz.step];
  if (!step) return;
  state.quiz.answers[step.id] = value;
  if (state.quiz.step < quizSteps.length - 1) {
    state.quiz.step += 1;
  } else {
    state.quiz.completed = true;
    state.quiz.result = computeQuizResult();
    track("quiz_completed", { result: state.quiz.result.title });
  }
  render();
}

function resetQuiz() {
  state.quiz.step = 0;
  state.quiz.answers = {};
  state.quiz.completed = false;
  state.quiz.result = null;
  render();
}

function openLead(prefill = {}) {
  if (prefill.package_id) {
    state.lead.package_id = prefill.package_id;
  }
  go("lead");
}

function renderHero() {
  return `
    <section class="hero glass reveal-host" id="heroScene">
      <div class="hero__orb hero__orb--a"></div>
      <div class="hero__orb hero__orb--b"></div>
      <div class="hero__orb hero__orb--c"></div>
      <div class="hero__grid"></div>
      <div class="hero__content" data-parallax>
        <span class="hero__badge reveal reveal--1">AI HR-агентство • КОМЭКСПО</span>
        <h1 class="hero__title reveal reveal--2">
          Нанимайте быстрее с <span>AI-рекрутингом</span> и HR-автоматизацией под ключ
        </h1>
        <p class="hero__text reveal reveal--3">
          Отклики, скрининг, назначение интервью, онбординг, HR-helpdesk и аналитика —
          в одном Telegram Mini App для быстрой квалификации заявки и презентации решения.
        </p>
        <div class="hero__actions reveal reveal--4">
          <button class="btn btn--primary btn--shine" type="button" onclick="go('quiz')">
            <span>Start</span>
          </button>
          <button class="btn btn--ghost" type="button" onclick="go('services')">Пакеты</button>
          <button class="btn btn--soft" type="button" onclick="go('lead')">Консультация</button>
        </div>
        <ul class="hero__features reveal reveal--5">
          <li>AI-рекрутер</li>
          <li>Сорсинг и скрининг</li>
          <li>Онбординг</li>
          <li>HR-helpdesk</li>
          <li>CRM / Telegram уведомления</li>
        </ul>
      </div>
    </section>
  `;
}

function renderHome() {
  return `
    ${renderHero()}

    <section class="section-block glass section-block--compact">
      <div class="section-head">
        <div>
          <span class="section-kicker">Что получает бизнес</span>
          <h2>Главные автоматизации</h2>
        </div>
      </div>
      <div class="cards-grid">
        <article class="info-card">
          <strong>Отклики и ответы</strong>
          <p>Автоматическая первичная коммуникация с кандидатами и фильтрация запросов.</p>
        </article>
        <article class="info-card">
          <strong>Скрининг</strong>
          <p>Предварительная оценка кандидатов, сбор ответов и передача только релевантных профилей.</p>
        </article>
        <article class="info-card">
          <strong>Интервью</strong>
          <p>Назначение слотов, напоминания и синхронизация следующих шагов.</p>
        </article>
        <article class="info-card">
          <strong>Онбординг и отчеты</strong>
          <p>Адаптация, база знаний, контроль этапов и наглядная аналитика.</p>
        </article>
      </div>
    </section>

    <section class="section-block glass section-cta">
      <div>
        <span class="section-kicker">Быстрый путь</span>
        <h2>Пройдите квиз за 2–3 минуты и получите формат внедрения</h2>
        <p>Подбор ролей, пакета и следующего шага: консультация, аудит или запуск под ключ.</p>
      </div>
      <div class="stack-actions">
        <button class="btn btn--primary" type="button" onclick="go('quiz')">Подобрать решение</button>
        <button class="btn btn--ghost" type="button" onclick="go('lead')">Оставить заявку</button>
      </div>
    </section>
  `;
}

function renderQuiz() {
  if (state.quiz.completed && state.quiz.result) {
    const result = state.quiz.result;
    return `
      <section class="section-block glass">
        <div class="section-head">
          <div>
            <span class="section-kicker">Результат квиза</span>
            <h2>${result.title}</h2>
          </div>
          <span class="pill pill--ok">Готово</span>
        </div>

        <p class="result-summary">${result.summary}</p>

        <div class="result-panel">
          <div>
            <span class="muted-label">Формат</span>
            <strong>${result.format}</strong>
          </div>
          <div>
            <span class="muted-label">Рекомендуемые роли</span>
            <div class="tag-row">
              ${result.roles.map((item) => `<span class="tag">${item}</span>`).join("")}
            </div>
          </div>
        </div>

        <div class="stack-actions">
          <button class="btn btn--primary" type="button" onclick="openLead({ package_id: '${result.title}' })">Перейти к заявке</button>
          <button class="btn btn--ghost" type="button" onclick="resetQuiz()">Пройти заново</button>
        </div>
      </section>
    `;
  }

  const step = quizSteps[state.quiz.step];
  const progress = Math.round(((state.quiz.step + 1) / quizSteps.length) * 100);
  track("start_quiz", { step: state.quiz.step + 1 });

  return `
    <section class="section-block glass">
      <div class="section-head">
        <div>
          <span class="section-kicker">Подбор решения</span>
          <h2>${step.title}</h2>
          <p>${step.caption}</p>
        </div>
        <span class="pill">${state.quiz.step + 1}/${quizSteps.length}</span>
      </div>

      <div class="progress">
        <span style="width:${progress}%"></span>
      </div>

      <div class="option-list">
        ${step.options
          .map(
            (option) => `
              <button class="option-card" type="button" onclick="answerQuiz('${option.replace(/'/g, "\\'")}')">
                <strong>${option}</strong>
                <span>Выбрать</span>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderServices() {
  return `
    <section class="section-block glass">
      <div class="section-head">
        <div>
          <span class="section-kicker">Услуги / пакеты</span>
          <h2>Готовые форматы запуска</h2>
        </div>
      </div>

      <div class="service-list">
        ${services
          .map(
            (service) => `
            <article class="service-card">
              <div class="service-card__top">
                <span class="pill">${service.label}</span>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
              </div>
              <ul>
                ${service.includes.map((item) => `<li>${item}</li>`).join("")}
              </ul>
              <button class="btn btn--soft" type="button" onclick="openLead({ package_id: '${service.title}' })">Оставить заявку</button>
            </article>
          `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCases() {
  return `
    <section class="section-block glass">
      <div class="section-head">
        <div>
          <span class="section-kicker">Кейсы</span>
          <h2>Типовые сценарии внедрения</h2>
        </div>
      </div>
      <div class="cards-grid">
        ${cases
          .map(
            (item) => `
            <article class="info-card info-card--case">
              <strong>${item.title}</strong>
              <p>${item.result}</p>
            </article>
          `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderLead() {
  const tgName = getFullNameFromTelegram();
  const result = state.quiz.result;
  const packageValue = state.lead.package_id || result?.title || "";

  return `
    <section class="section-block glass">
      <div class="section-head">
        <div>
          <span class="section-kicker">Форма заявки</span>
          <h2>Оставьте вводные — и менеджер свяжется с вами</h2>
          <p>Telegram-данные подставим автоматически, а ответы квиза прикрепим к заявке.</p>
        </div>
      </div>

      <form class="lead-form" id="leadForm">
        <label>
          <span>Имя</span>
          <input name="name" placeholder="Ваше имя" value="${escapeHtml(tgName)}" required>
        </label>
        <label>
          <span>Телефон</span>
          <input name="phone" placeholder="+7 999 123-45-67" required>
        </label>
        <label>
          <span>Компания</span>
          <input name="company" placeholder="Название компании" required>
        </label>
        <label>
          <span>Объем найма</span>
          <input name="hiring_volume" placeholder="Например: 8 вакансий/мес" value="${escapeHtml(getQuizAnswer("hiring_volume"))}">
        </label>
        <label>
          <span>Тип вакансий</span>
          <input name="vacancy_types" placeholder="Продажи, support, middle/senior" value="${escapeHtml(getQuizAnswer("roles"))}">
        </label>
        <label>
          <span>Срочность</span>
          <input name="urgency" placeholder="Сразу / в течение месяца" value="${escapeHtml(getQuizAnswer("urgency"))}">
        </label>
        <label>
          <span>Бюджет</span>
          <input name="budget" placeholder="Например: до 300 000 ₽">
        </label>
        <label>
          <span>Способ связи</span>
          <select name="contact_method">
            <option value="telegram">Telegram</option>
            <option value="phone">Телефон</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label>
          <span>Выбранный пакет / рекомендация</span>
          <input name="result_title" value="${escapeHtml(packageValue)}" readonly>
        </label>
        <label>
          <span>Комментарий</span>
          <textarea name="comment" rows="4" placeholder="Опишите задачу, процессы или целевые роли"></textarea>
        </label>
        <label class="checkbox-row">
          <input type="checkbox" name="consent" required>
          <span>Согласен на обработку персональных данных и ознакомлен с <a href="${window.APP_CONFIG.policyUrl}" target="_blank" rel="noreferrer">политикой</a>.</span>
        </label>
        <button class="btn btn--primary" type="submit">Отправить заявку</button>
        <div id="formStatus" class="form-status"></div>
      </form>
    </section>
  `;
}

function renderThankYou() {
  return `
    <section class="section-block glass section-thanks">
      <span class="pill pill--ok">Спасибо</span>
      <h2>Заявка отправлена</h2>
      <p>Менеджер КОМЭКСПО получил вводные и свяжется удобным для вас способом.</p>
      <div class="stack-actions">
        <button class="btn btn--primary" type="button" onclick="window.open('https://t.me/${getTelegramUser().username || ''}', '_blank')">Написать менеджеру</button>
        <button class="btn btn--ghost" type="button" onclick="go('home')">На главную</button>
      </div>
    </section>
  `;
}

function render() {
  switch (state.page) {
    case "quiz":
      screen.innerHTML = renderQuiz();
      break;
    case "services":
      screen.innerHTML = renderServices();
      break;
    case "cases":
      screen.innerHTML = renderCases();
      break;
    case "lead":
      screen.innerHTML = renderLead();
      break;
    case "thanks":
      screen.innerHTML = renderThankYou();
      break;
    case "home":
    default:
      screen.innerHTML = renderHome();
      track("open_app", { page: state.page });
  }
  attachParallax();
  bindLeadForm();
}

function attachParallax() {
  const hero = document.getElementById("heroScene");
  if (!hero) return;

  const target = hero.querySelector("[data-parallax]");
  const orbs = qsa(".hero__orb", hero);
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  function onMove(event) {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tx = x;
    ty = y;
  }

  function reset() {
    tx = 0;
    ty = 0;
  }

  function loop() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    if (target) {
      target.style.transform = `translate3d(${cx * 12}px, ${cy * 12}px, 0)`;
    }
    orbs.forEach((orb, index) => {
      const factor = (index + 1) * 10;
      orb.style.transform = `translate3d(${cx * factor}px, ${cy * factor * -0.7}px, 0)`;
    });
    requestAnimationFrame(loop);
  }

  hero.onmousemove = onMove;
  hero.onmouseleave = reset;
  requestAnimationFrame(loop);
}

function bindLeadForm() {
  const form = document.getElementById("leadForm");
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.sending) return;

    const status = document.getElementById("formStatus");
    const fd = new FormData(form);
    const telegramUser = getTelegramUser();
    const lead = {
      name: (fd.get("name") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      company: (fd.get("company") || "").toString().trim(),
      hiring_volume: (fd.get("hiring_volume") || "").toString().trim(),
      vacancy_types: (fd.get("vacancy_types") || "").toString().trim(),
      urgency: (fd.get("urgency") || "").toString().trim(),
      budget: (fd.get("budget") || "").toString().trim(),
      contact_method: (fd.get("contact_method") || "telegram").toString(),
      comment: (fd.get("comment") || "").toString().trim(),
      consent: Boolean(fd.get("consent")),
      telegram: telegramUser,
      result: state.quiz.result || { title: (fd.get("result_title") || "").toString().trim() },
      quiz_answers: quizSteps.map((step) => ({ question: step.title, answer: state.quiz.answers[step.id] || "" })).filter((item) => item.answer),
    };

    state.sending = true;
    status.textContent = "Отправляем заявку...";
    status.className = "form-status is-loading";
    track("lead_submit", { package: lead.result?.title || "" });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData: tg?.initData || "",
          lead,
          events: state.events,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "lead_error");
      }

      track("lead_success", {});
      state.sending = false;
      status.textContent = "";
      go("thanks");
    } catch (error) {
      console.error(error);
      state.sending = false;
      track("lead_error", { message: error.message || "unknown" });
      status.textContent = "Не удалось отправить заявку. Проверьте данные и попробуйте еще раз.";
      status.className = "form-status is-error";
    }
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

btnBack?.addEventListener("click", back);
btnMenu?.addEventListener("click", () => go("services"));
qsa(".nav-btn", bottomNav).forEach((btn) => {
  btn.addEventListener("click", () => go(btn.dataset.page));
});

window.go = go;
window.answerQuiz = answerQuiz;
window.resetQuiz = resetQuiz;
window.openLead = openLead;

render();
updateBack();
updateNav();

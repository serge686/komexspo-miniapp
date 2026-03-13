const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand();
  tg.ready?.();
}

const screen = document.getElementById("screen");
const tabs = Array.from(document.querySelectorAll("[data-scroll]"));
const qrFab = document.getElementById("qrFab");
const qrPopover = document.getElementById("qrPopover");
const qrClose = document.getElementById("qrClose");

const quizState = {
  step: 0,
  answers: {}
};

const quizSteps = [
  {
    key: "team",
    title: "Сколько сотрудников участвует в найме?",
    options: ["1–3 человека", "4–10 человек", "10+ человек"]
  },
  {
    key: "tasks",
    title: "Что хотите автоматизировать в первую очередь?",
    options: ["Поиск и сортировку кандидатов", "Коммуникацию с кандидатами", "HR-аналитику и отчёты"]
  },
  {
    key: "speed",
    title: "Какая сейчас главная боль?",
    options: ["Долго закрываем вакансии", "Много рутины у HR", "Нет прозрачной аналитики"]
  }
];

function renderApp() {
  screen.innerHTML = `
    <section class="section hero-section" id="hero">
      <div class="hero-card" id="heroCard">
        <div class="hero-orb hero-orb--one"></div>
        <div class="hero-orb hero-orb--two"></div>
        <div class="hero-content">
          <div class="hero-badge reveal delay-1">Telegram Mini App</div>
          <h1 class="hero-title reveal delay-2">AI HR агентство <span>КОМЭКСПО</span></h1>
          <p class="hero-subtitle reveal delay-3">Подбор AI-решений для HR, рекрутинга и найма — в одном удобном mini app.</p>
          <div class="hero-actions reveal delay-4">
            <button class="hero-btn hero-btn-primary" data-scroll-btn="quiz" type="button">
              <span class="hero-btn__text">Начнем?</span>
              <span class="hero-btn__shine"></span>
            </button>
            <button class="hero-btn hero-btn-secondary" data-scroll-btn="packages" type="button">Посмотреть пакеты</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="quiz">
      <div class="section-head">
        <div class="section-kicker">Подбор решения</div>
        <h2 class="section-title">Мини-тест</h2>
      </div>
      <div class="quiz-wrap" id="quizWrap"></div>
    </section>

    <section class="section" id="packages">
      <div class="section-head">
        <div class="section-kicker">Пакеты</div>
        <h2 class="section-title">Форматы внедрения</h2>
      </div>
      <div class="cards-grid">
        <article class="info-card">
          <h3>Старт</h3>
          <p>Базовый аудит HR-процессов, карта автоматизации и первый сценарий AI-ассистента.</p>
        </article>
        <article class="info-card">
          <h3>Рост</h3>
          <p>Автоворонка подбора, скрининг кандидатов и аналитика по откликам и источникам.</p>
        </article>
        <article class="info-card">
          <h3>Партнерство</h3>
          <p>Комплексное внедрение AI HR-системы, сопровождение команды и оптимизация найма.</p>
        </article>
      </div>
    </section>

    <section class="section" id="cases">
      <div class="section-head">
        <div class="section-kicker">Кейсы</div>
        <h2 class="section-title">Что получает бизнес</h2>
      </div>
      <div class="cards-grid cases-grid">
        <article class="info-card soft">
          <h3>Быстрее найм</h3>
          <p>Меньше ручной сортировки и быстрее первичный контакт с кандидатами.</p>
        </article>
        <article class="info-card soft">
          <h3>Прозрачность</h3>
          <p>Вся воронка подбора и показатели HR в одной понятной системе.</p>
        </article>
        <article class="info-card soft">
          <h3>Масштабирование</h3>
          <p>Одинаковое качество работы HR-процессов даже при росте команды.</p>
        </article>
      </div>
    </section>

    <section class="section" id="lead">
      <div class="section-head">
        <div class="section-kicker">Заявка</div>
        <h2 class="section-title">Оставьте контакты</h2>
      </div>
      <form class="lead-card" id="leadForm">
        <label class="field">
          <span>Ваше имя</span>
          <input name="name" type="text" placeholder="Как к вам обращаться" required />
        </label>
        <label class="field">
          <span>Телефон</span>
          <input name="phone" type="tel" placeholder="+7 900 000-00-00" required />
        </label>
        <label class="field">
          <span>Telegram</span>
          <input name="telegram" type="text" placeholder="@username" />
        </label>
        <button class="hero-btn hero-btn-primary full" type="submit">
          <span class="hero-btn__text">Отправить заявку</span>
          <span class="hero-btn__shine"></span>
        </button>
        <p class="form-note" id="formNote">Мы свяжемся с вами и предложим подходящий сценарий внедрения.</p>
      </form>
    </section>
  `;

  bindScrollButtons();
  bindQuiz();
  bindLeadForm();
  bindHeroParallax();
  updateActiveTab();
}

function bindScrollButtons() {
  document.querySelectorAll("[data-scroll-btn]").forEach((btn) => {
    btn.addEventListener("click", () => smoothScrollTo(btn.dataset.scrollBtn));
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => smoothScrollTo(tab.dataset.scroll));
  });
}

function smoothScrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindQuiz() {
  renderQuizStep();
}

function renderQuizStep() {
  const wrap = document.getElementById("quizWrap");
  if (!wrap) return;

  if (quizState.step >= quizSteps.length) {
    wrap.innerHTML = `
      <div class="quiz-card done">
        <div class="quiz-progress">Готово</div>
        <h3>Рекомендуем начать с аудита и AI-воронки подбора</h3>
        <p>По вашим ответам подойдёт сценарий с быстрым внедрением автоматизации откликов и аналитики кандидатов.</p>
        <button class="hero-btn hero-btn-primary" type="button" data-scroll-btn="lead">
          <span class="hero-btn__text">Получить консультацию</span>
          <span class="hero-btn__shine"></span>
        </button>
      </div>
    `;
    bindScrollButtons();
    return;
  }

  const step = quizSteps[quizState.step];
  wrap.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-progress">Шаг ${quizState.step + 1} из ${quizSteps.length}</div>
      <h3>${step.title}</h3>
      <div class="quiz-options">
        ${step.options.map((option) => `
          <button class="quiz-option" type="button" data-option="${option}">${option}</button>
        `).join("")}
      </div>
    </div>
  `;

  wrap.querySelectorAll(".quiz-option").forEach((button) => {
    button.addEventListener("click", () => {
      quizState.answers[step.key] = button.dataset.option;
      quizState.step += 1;
      renderQuizStep();
    });
  });
}

function bindLeadForm() {
  const form = document.getElementById("leadForm");
  const note = document.getElementById("formNote");
  if (!form || !note) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      telegram: formData.get("telegram"),
      quiz_answers: quizState.answers
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("bad_response");
      form.reset();
      note.textContent = "Спасибо! Заявка отправлена, мы скоро свяжемся с вами.";
    } catch (error) {
      note.textContent = "Не удалось отправить заявку. Напишите нам в Telegram — @komexpo.";
    }
  });
}

function bindHeroParallax() {
  const hero = document.getElementById("heroCard");
  if (!hero) return;

  let rafId = null;
  let tx = 0;
  let ty = 0;
  let cx = 0;
  let cy = 0;

  const animate = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    hero.style.transform = `translate3d(${cx * 10}px, ${cy * 8}px, 0)`;
    rafId = requestAnimationFrame(animate);
  };

  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  hero.addEventListener("mouseleave", () => {
    tx = 0;
    ty = 0;
  });

  if (rafId) cancelAnimationFrame(rafId);
  animate();
}

function updateActiveTab() {
  const sections = ["hero", "quiz", "packages", "cases", "lead"].map((id) => document.getElementById(id));
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.scroll === visible.target.id);
    });
  }, { threshold: 0.35 });

  sections.forEach((section) => section && observer.observe(section));
}

function bindQr() {
  if (!qrFab || !qrPopover || !qrClose) return;

  const close = () => qrPopover.hidden = true;
  const open = () => qrPopover.hidden = false;

  qrFab.addEventListener("click", () => {
    if (qrPopover.hidden) open(); else close();
  });
  qrClose.addEventListener("click", close);
  document.addEventListener("click", (event) => {
    if (qrPopover.hidden) return;
    if (qrPopover.contains(event.target) || qrFab.contains(event.target)) return;
    close();
  });
}

renderApp();
bindQr();

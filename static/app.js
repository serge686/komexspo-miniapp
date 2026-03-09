const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const screen = document.getElementById('screen');
const btnBack = document.getElementById('btnBack');
const tabs = Array.from(document.querySelectorAll('.tab[data-go]'));

const state = {
  quiz: {
    step: 0,
    answers: {}
  }
};

const quizSteps = [
  {
    key: 'company_size',
    title: 'Сколько человек в вашей компании?',
    options: ['1–10', '11–50', '51–200', '200+']
  },
  {
    key: 'hiring_volume',
    title: 'Какой у вас объём найма?',
    options: ['1–2 вакансии', '3–10 вакансий', 'Потоковый найм', 'Только планируем']
  },
  {
    key: 'vacancy_types',
    title: 'Какие роли чаще всего закрываете?',
    options: ['Продажи', 'Линейный персонал', 'IT / digital', 'Смешанный найм']
  },
  {
    key: 'pain',
    title: 'Что сейчас болит сильнее всего?',
    options: ['Мало откликов', 'Долго закрываем вакансии', 'Рекрутинг хаотичный', 'Нет аналитики']
  }
];

function getQuizResult() {
  const volume = state.quiz.answers.hiring_volume || '';
  const pain = state.quiz.answers.pain || '';

  if (volume.includes('Потоковый') || pain.includes('хаотичный')) {
    return 'Вам подойдёт пакет «HR AI System» с автоматизацией воронки и аналитикой.';
  }

  if (pain.includes('Долго') || pain.includes('откликов')) {
    return 'Вам подойдёт пакет «AI Recruiter» для ускорения подбора и усиления откликов.';
  }

  return 'Рекомендуем старт с AI-аудита и пилотного сценария под ваш найм.';
}

function renderHome() {
  return `
    <section class="page-section section-home" id="home" data-section="home">
      <section class="hero" id="hero">
        <div class="hero-orb orb-one"></div>
        <div class="hero-orb orb-two"></div>
        <div class="hero-content" data-parallax>
          <div class="hero-badge">AI HR агентство КОМЭКСПО</div>
          <h1 class="hero-title">Подбор AI-решений для найма и HR-процессов</h1>
          <p class="hero-text">Быстрый мини-квиз, понятные пакеты и сценарии внедрения — в одном Telegram Mini App.</p>
          <div class="hero-actions">
            <button class="cta-btn shine" data-scroll="quiz" type="button">Начнем?</button>
            <button class="ghost-btn shine-soft" data-scroll="packages" type="button">Смотреть пакеты</button>
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderQuiz() {
  const step = quizSteps[state.quiz.step];
  const progress = Math.round((state.quiz.step / quizSteps.length) * 100);

  if (!step) {
    return `
      <section class="page-section page-section-narrow section-quiz" id="quiz" data-section="quiz">
        <div class="quiz-wrap centered-screen scroll-centered">
          <div class="quiz-card card-soft result-card">
            <span class="section-eyebrow">Подбор решения</span>
            <h2 class="section-title">Результат готов</h2>
            <p class="section-text">${getQuizResult()}</p>
            <div class="stack-actions">
              <button class="cta-btn shine" data-scroll="lead" type="button">Оставить заявку</button>
              <button class="ghost-btn shine-soft" data-action="restart-quiz" type="button">Пройти заново</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  const options = step.options.map((option) => `
    <button class="answer-btn shine-soft" data-answer="${option}" type="button">${option}</button>
  `).join('');

  return `
    <section class="page-section page-section-narrow section-quiz" id="quiz" data-section="quiz">
      <div class="quiz-wrap centered-screen scroll-centered">
        <div class="quiz-card card-soft">
          <div class="quiz-progress"><span style="width:${progress}%"></span></div>
          <span class="section-eyebrow">Шаг ${state.quiz.step + 1} из ${quizSteps.length}</span>
          <h2 class="section-title">${step.title}</h2>
          <div class="answers-grid">${options}</div>
        </div>
      </div>
    </section>
  `;
}

function renderPackages() {
  return `
    <section class="page-section" id="packages" data-section="packages">
      <div class="section-head">
        <span class="section-eyebrow">Пакеты</span>
        <h2 class="section-title section-title-md">Готовые форматы внедрения</h2>
      </div>
      <section class="content-grid">
        <article class="card-soft">
          <span class="section-eyebrow">Пакет 01</span>
          <h3 class="card-title">AI Audit</h3>
          <p class="section-text">Диагностика найма, карта точек автоматизации и приоритеты внедрения.</p>
        </article>
        <article class="card-soft">
          <span class="section-eyebrow">Пакет 02</span>
          <h3 class="card-title">AI Recruiter</h3>
          <p class="section-text">AI-скрипты, фильтрация кандидатов, ускорение отклика и маршрутизация лидов.</p>
        </article>
        <article class="card-soft">
          <span class="section-eyebrow">Пакет 03</span>
          <h3 class="card-title">HR AI System</h3>
          <p class="section-text">Полная HR-воронка: аналитика, сценарии, автокоммуникации и интеграции.</p>
        </article>
      </section>
    </section>
  `;
}

function renderCases() {
  return `
    <section class="page-section" id="cases" data-section="cases">
      <div class="section-head">
        <span class="section-eyebrow">Кейсы</span>
        <h2 class="section-title section-title-md">Что уже можно получить</h2>
      </div>
      <section class="content-grid cases-grid">
        <article class="card-soft">
          <span class="section-eyebrow">Кейс</span>
          <h3 class="card-title">Сократили время найма на 37%</h3>
          <p class="section-text">Автоматизировали первичный отбор и коммуникацию по входящим откликам.</p>
        </article>
        <article class="card-soft">
          <span class="section-eyebrow">Кейс</span>
          <h3 class="card-title">Упорядочили потоковый найм</h3>
          <p class="section-text">Собрали единую AI-систему под линейный персонал и контроль конверсий.</p>
        </article>
      </section>
    </section>
  `;
}

function renderLead() {
  return `
    <section class="page-section page-section-narrow" id="lead" data-section="lead">
      <div class="lead-wrap scroll-centered">
        <form class="lead-card card-soft" id="leadForm">
          <span class="section-eyebrow">Заявка</span>
          <h2 class="section-title section-title-md">Обсудим решение под ваш бизнес</h2>
          <p class="section-text">Оставьте контакты, и мы свяжемся с вами по Telegram или телефону.</p>

          <label class="field">
            <span>Имя</span>
            <input name="name" type="text" placeholder="Ваше имя" required />
          </label>

          <label class="field">
            <span>Телефон</span>
            <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" required />
          </label>

          <label class="field">
            <span>Компания</span>
            <input name="company" type="text" placeholder="Название компании" />
          </label>

          <label class="field">
            <span>Комментарий</span>
            <textarea name="comment" rows="4" placeholder="Коротко опишите задачу"></textarea>
          </label>

          <button class="cta-btn shine" type="submit">Отправить заявку</button>
          <div id="leadSuccess" class="lead-success" hidden>Спасибо, заявка отправлена.</div>
        </form>
      </div>
    </section>
  `;
}

function renderPage() {
  screen.innerHTML = `
    <div class="scroll-layout">
      ${renderHome()}
      ${renderQuiz()}
      ${renderPackages()}
      ${renderCases()}
      ${renderLead()}
    </div>
  `;
}

function attachHeroEffects() {
  const hero = document.getElementById('hero');
  if (!hero || window.innerWidth < 800) return;

  const target = hero.querySelector('[data-parallax]');
  const orbOne = hero.querySelector('.orb-one');
  const orbTwo = hero.querySelector('.orb-two');

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let frame;

  const move = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    if (target) target.style.transform = `translate3d(${currentX * 10}px, ${currentY * 10}px, 0)`;
    if (orbOne) orbOne.style.transform = `translate3d(${currentX * 16}px, ${currentY * 16}px, 0)`;
    if (orbTwo) orbTwo.style.transform = `translate3d(${currentX * -18}px, ${currentY * -18}px, 0)`;
    frame = requestAnimationFrame(move);
  };

  const onMove = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    targetX = x * 2;
    targetY = y * 2;
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
  };

  hero.addEventListener('mousemove', onMove, { passive: true });
  hero.addEventListener('mouseleave', onLeave, { passive: true });
  frame = requestAnimationFrame(move);

  hero.cleanupParallax = () => {
    cancelAnimationFrame(frame);
    hero.removeEventListener('mousemove', onMove);
    hero.removeEventListener('mouseleave', onLeave);
  };
}

function updateTabs(activeId) {
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.go === activeId);
  });
}

function scrollToSection(sectionId) {
  const node = document.getElementById(sectionId);
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateTabs(sectionId);
}

function observeSections() {
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      updateTabs(visible.target.id);
    }
  }, {
    threshold: [0.2, 0.45, 0.7],
    rootMargin: '-12% 0px -45% 0px'
  });

  sections.forEach((section) => observer.observe(section));
}

async function submitLead(form) {
  const formData = new FormData(form);
  const payload = {
    initData: tg?.initData || '',
    lead: {
      name: formData.get('name') || '',
      phone: formData.get('phone') || '',
      company: formData.get('company') || '',
      comment: formData.get('comment') || '',
      result: getQuizResult(),
      hiring_volume: state.quiz.answers.hiring_volume || '',
      vacancy_types: state.quiz.answers.vacancy_types || '',
      contact_method: 'telegram/phone'
    },
    events: [
      { name: 'lead_submit', ts: Date.now() }
    ]
  };

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('request_failed');
    const success = document.getElementById('leadSuccess');
    form.reset();
    if (success) success.hidden = false;
    scrollToSection('lead');
  } catch (error) {
    alert('Не удалось отправить заявку. Попробуйте еще раз.');
  }
}

function cleanupDynamicEffects() {
  const hero = document.getElementById('hero');
  if (hero?.cleanupParallax) hero.cleanupParallax();
}

function rerenderQuizSection(scrollAfterRender = true) {
  const nextQuiz = document.getElementById('quiz');
  if (!nextQuiz) return;
  nextQuiz.outerHTML = renderQuiz();
  if (scrollAfterRender) {
    requestAnimationFrame(() => scrollToSection('quiz'));
  }
}

btnBack?.setAttribute('hidden', 'hidden');

document.addEventListener('click', (event) => {
  const navTarget = event.target.closest('[data-go]');
  if (navTarget) {
    scrollToSection(navTarget.dataset.go);
    return;
  }

  const scrollTarget = event.target.closest('[data-scroll]');
  if (scrollTarget) {
    scrollToSection(scrollTarget.dataset.scroll);
    return;
  }

  const answerBtn = event.target.closest('[data-answer]');
  if (answerBtn) {
    const step = quizSteps[state.quiz.step];
    state.quiz.answers[step.key] = answerBtn.dataset.answer;
    state.quiz.step += 1;
    rerenderQuizSection();
    return;
  }

  const restartBtn = event.target.closest('[data-action="restart-quiz"]');
  if (restartBtn) {
    state.quiz.step = 0;
    state.quiz.answers = {};
    rerenderQuizSection();
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('#leadForm');
  if (!form) return;
  event.preventDefault();
  submitLead(form);
});

const qualityBadge = document.getElementById('qualityBadge');
qualityBadge?.addEventListener('click', () => {
  window.open('https://getcourse.ru', '_blank', 'noopener,noreferrer');
});

cleanupDynamicEffects();
renderPage();
attachHeroEffects();
observeSections();
updateTabs('home');
window.go = scrollToSection;

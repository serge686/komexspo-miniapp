const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const screen = document.getElementById('screen');
const btnBack = document.getElementById('btnBack');
const tabs = Array.from(document.querySelectorAll('.tab[data-go]'));

const state = {
  page: 'home',
  history: ['home'],
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

function go(page) {
  if (state.page !== page) {
    state.history.push(page);
  }
  state.page = page;
  render();
  updateBack();
  updateTabs();
}

function back() {
  if (state.history.length > 1) {
    state.history.pop();
    state.page = state.history[state.history.length - 1];
    render();
    updateBack();
    updateTabs();
  }
}

function updateBack() {
  btnBack.style.visibility = state.history.length > 1 ? 'visible' : 'hidden';
}

function updateTabs() {
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.go === state.page);
  });
}

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
    <section class="hero" id="hero">
      <div class="hero-orb orb-one"></div>
      <div class="hero-orb orb-two"></div>
      <div class="hero-content" data-parallax>
        <div class="hero-badge">AI HR агентство КОМЭКСПО</div>
        <h1 class="hero-title">Подбор AI-решений для найма и HR-процессов</h1>
        <p class="hero-text">Быстрый мини-квиз, понятные пакеты и сценарии внедрения — в одном Telegram Mini App.</p>
        <div class="hero-actions">
          <button class="cta-btn shine" data-go="quiz" type="button">Начнем?</button>
          <button class="ghost-btn shine-soft" data-go="packages" type="button">Смотреть пакеты</button>
        </div>
      </div>
    </section>
  `;
}

function renderQuiz() {
  const step = quizSteps[state.quiz.step];
  const progress = Math.round(((state.quiz.step) / quizSteps.length) * 100);

  if (!step) {
    return `
      <section class="quiz-wrap centered-screen">
        <div class="quiz-card card-soft result-card">
          <span class="section-eyebrow">Подбор решения</span>
          <h2 class="section-title">Результат готов</h2>
          <p class="section-text">${getQuizResult()}</p>
          <div class="stack-actions">
            <button class="cta-btn shine" data-go="lead" type="button">Оставить заявку</button>
            <button class="ghost-btn shine-soft" data-action="restart-quiz" type="button">Пройти заново</button>
          </div>
        </div>
      </section>
    `;
  }

  const options = step.options.map((option) => `
    <button class="answer-btn shine-soft" data-answer="${option}" type="button">${option}</button>
  `).join('');

  return `
    <section class="quiz-wrap centered-screen">
      <div class="quiz-card card-soft">
        <div class="quiz-progress"><span style="width:${progress}%"></span></div>
        <span class="section-eyebrow">Шаг ${state.quiz.step + 1} из ${quizSteps.length}</span>
        <h2 class="section-title">${step.title}</h2>
        <div class="answers-grid">${options}</div>
      </div>
    </section>
  `;
}

function renderPackages() {
  return `
    <section class="content-grid">
      <article class="card-soft">
        <span class="section-eyebrow">Пакет 01</span>
        <h2 class="section-title">AI Audit</h2>
        <p class="section-text">Диагностика найма, карта точек автоматизации и приоритеты внедрения.</p>
      </article>
      <article class="card-soft">
        <span class="section-eyebrow">Пакет 02</span>
        <h2 class="section-title">AI Recruiter</h2>
        <p class="section-text">AI-скрипты, фильтрация кандидатов, ускорение отклика и маршрутизация лидов.</p>
      </article>
      <article class="card-soft">
        <span class="section-eyebrow">Пакет 03</span>
        <h2 class="section-title">HR AI System</h2>
        <p class="section-text">Полная HR-воронка: аналитика, сценарии, автокоммуникации и интеграции.</p>
      </article>
    </section>
  `;
}

function renderCases() {
  return `
    <section class="content-grid cases-grid">
      <article class="card-soft">
        <span class="section-eyebrow">Кейс</span>
        <h2 class="section-title">Сократили время найма на 37%</h2>
        <p class="section-text">Автоматизировали первичный отбор и коммуникацию по входящим откликам.</p>
      </article>
      <article class="card-soft">
        <span class="section-eyebrow">Кейс</span>
        <h2 class="section-title">Упорядочили потоковый найм</h2>
        <p class="section-text">Собрали единую AI-систему под линейный персонал и контроль конверсий.</p>
      </article>
    </section>
  `;
}

function renderLead() {
  return `
    <section class="lead-wrap centered-screen">
      <form class="lead-card card-soft" id="leadForm">
        <span class="section-eyebrow">Заявка</span>
        <h2 class="section-title">Обсудим решение под ваш бизнес</h2>
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
      </form>
    </section>
  `;
}

function renderThanks() {
  return `
    <section class="centered-screen">
      <div class="card-soft result-card">
        <span class="section-eyebrow">Готово</span>
        <h2 class="section-title">Спасибо, заявка отправлена</h2>
        <p class="section-text">Мы свяжемся с вами в ближайшее время и предложим оптимальный AI HR-сценарий.</p>
        <button class="ghost-btn shine-soft" data-go="home" type="button">На главную</button>
      </div>
    </section>
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
    state.page = 'thanks';
    state.history.push('thanks');
    render();
    updateBack();
    updateTabs();
  } catch (error) {
    alert('Не удалось отправить заявку. Попробуйте еще раз.');
  }
}

function cleanupDynamicEffects() {
  const hero = document.getElementById('hero');
  if (hero?.cleanupParallax) hero.cleanupParallax();
}

function render() {
  cleanupDynamicEffects();

  switch (state.page) {
    case 'home':
      screen.innerHTML = renderHome();
      attachHeroEffects();
      break;
    case 'quiz':
      screen.innerHTML = renderQuiz();
      break;
    case 'packages':
      screen.innerHTML = renderPackages();
      break;
    case 'cases':
      screen.innerHTML = renderCases();
      break;
    case 'lead':
      screen.innerHTML = renderLead();
      break;
    case 'thanks':
      screen.innerHTML = renderThanks();
      break;
    default:
      state.page = 'home';
      screen.innerHTML = renderHome();
      attachHeroEffects();
  }
}

btnBack?.addEventListener('click', back);

document.addEventListener('click', (event) => {
  const navTarget = event.target.closest('[data-go]');
  if (navTarget) {
    go(navTarget.dataset.go);
    return;
  }

  const answerBtn = event.target.closest('[data-answer]');
  if (answerBtn) {
    const step = quizSteps[state.quiz.step];
    state.quiz.answers[step.key] = answerBtn.dataset.answer;
    state.quiz.step += 1;
    render();
    return;
  }

  const restartBtn = event.target.closest('[data-action="restart-quiz"]');
  if (restartBtn) {
    state.quiz.step = 0;
    state.quiz.answers = {};
    go('quiz');
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

render();
updateBack();
updateTabs();
window.go = go;

(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }

  const state = {
    screen: "home",
    history: [],
    events: [],
    quiz: {
      industry: "",
      team_size: "",
      hires_per_month: "",
      roles: "",
      urgency: "",
      channels: "",
      metric_priority: ""
    },
    packagePicked: "",
    resultText: ""
  };

  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => [...document.querySelectorAll(sel)];

  function track(name, data = {}) {
    state.events.push({ name, data, ts: Date.now() });
  }

  function escapeHtml(s){ return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
  function escapeAttr(s){ return escapeHtml(s).replaceAll('"',"&quot;"); }

  function getTgUser() {
    try { return tg?.initDataUnsafe?.user || null; } catch { return null; }
  }

  /* =========================
     URL / History helpers
  ========================== */

  function currentUrlScreen() {
    try {
      const p = new URLSearchParams(location.search);
      return p.get("screen") || "home";
    } catch {
      return "home";
    }
  }

  function buildUrlForScreen(screen) {
    const url = new URL(location.href);
    url.searchParams.set("screen", screen);
    return url.toString();
  }

  function pushBrowserState(screen) {
    try {
      history.pushState({ screen }, "", buildUrlForScreen(screen));
    } catch {}
  }
  function replaceBrowserState(screen) {
    try {
      history.replaceState({ screen }, "", buildUrlForScreen(screen));
    } catch {}
  }

  /* =========================
     Back UI sync
  ========================== */

  function syncBackUI() {
    const canGoBack = (state.history.length > 0) || (state.screen !== "home");

    const btn = qs("#btnBack");
    if (btn) btn.style.visibility = canGoBack ? "visible" : "hidden";

    if (tg?.BackButton) {
      if (canGoBack) tg.BackButton.show();
      else tg.BackButton.hide();
    }
  }

  /* =========================
     Navigation
  ========================== */

  function setScreen(next, pushHistory = true) {
    if (!next) next = "home";
    if (state.screen === next) {
      syncBackUI();
      render();
      return;
    }

    if (pushHistory) state.history.push(state.screen);

    state.screen = next;

    if (pushHistory) pushBrowserState(next);
    else replaceBrowserState(next);

    syncBackUI();
    render();
  }

  function goBack() {
    const prev = state.history.pop();
    if (prev) {
      state.screen = prev;
      try { history.back(); } catch {}
      syncBackUI();
      render();
      return;
    }

    if (state.screen !== "home") {
      state.screen = "home";
      try { history.back(); } catch {}
      syncBackUI();
      render();
      return;
    }

    tg?.close?.();
  }

  /* =========================
     UI builders
  ========================== */

  function inputField(label, id, value="") {
    return `
      <div class="field">
        <label>${label}</label>
        <input class="input" id="${id}" value="${escapeAttr(value)}" />
      </div>
    `;
  }

  function selectField(label, key, options) {
    const v = state.quiz[key] || "";
    return `
      <div class="field">
        <label>${label}</label>
        <select class="select" id="q_${key}">
          <option value="">— выбрать —</option>
          ${options.map(o => `<option ${v===o?"selected":""} value="${escapeAttr(o)}">${o}</option>`).join("")}
        </select>
      </div>
    `;
  }

  function homeScreen() {
    track("open_app");
    return `
      <div class="hero-pill">Группа компаний КОМЭКСПО</div>
      <div class="h1">
        AI HR-агентство<br/>
        <span class="accent">найм и HR-автоматизация</span><br/>
        под ключ
      </div>
      <div class="lead">
        Покажем ценность и быстро подберём решение: AI-рекрутер, сорсинг, скрининг,
        онбординг, HR-helpdesk. Оставьте заявку — и менеджер свяжется с вами.
      </div>

      <div class="actions">
        <button class="btn primary" id="goQuiz">Подобрать решение (2–3 мин)</button>
        <button class="btn ghost" id="goPackages">Пакеты</button>
        <button class="btn" id="goLead">Оставить заявку</button>
      </div>

      <div class="cards">
        <button class="card cardbtn" id="openAiRecruiter" type="button">
          <b>AI-рекрутер</b><small>Отклики, ответы, назначение интервью</small>
        </button>

        <button class="card cardbtn" id="openSourcing" type="button">
          <b>Сорсинг + скрининг</b><small>Подбор, фильтрация, shortlist</small>
        </button>

        <button class="card cardbtn" id="openHrAuto" type="button">
          <b>HR-автоматизация</b><small>Онбординг, база знаний, helpdesk</small>
        </button>
      </div>
    `;
  }

  function aiRecruiterScreen() {
    return `
      <div class="section-title">AI-рекрутер (ТЗ / MVP)</div>
      <div class="lead">
        В этом разделе — требования из ТЗ: цель, KPI, сценарии, MVP, интеграции и приёмка.
      </div>

      <div class="card" style="margin-top:12px">
        <b>1. Общие сведения</b>
        <small>
          <b>Название проекта:</b> Telegram Mini App «AI HR-агентство — найм и HR-автоматизация под ключ».<br/>
          <b>Заказчик:</b> AI-агентство «КОМЭКСПО».<br/><br/>
          <b>Цель проекта:</b><br/>
          • Показать ценность услуги «AI HR-агентство» и решения (AI-рекрутер, сорсинг, скрининг, онбординг, HR-helpdesk).<br/>
          • Собрать и квалифицировать заявку (вакансии/объём найма, срочность, бюджет, процессы).<br/>
          • Дать быстрый путь: консультация / аудит / подбор пакета / запись на встречу.<br/>
          • Передать лид в CRM/таблицу и уведомить менеджера.
        </small>
      </div>

      <div class="card" style="margin-top:12px">
        <b>1.4. KPI</b>
        <small>
          • Конверсия в заявку: задаёт заказчик.<br/>
          • Доля квалифицированных заявок: ≥ 60%.<br/>
          • Время до заявки: ≤ 2 минуты.<br/>
          • Доля записей на встречу: задаёт заказчик.
        </small>
      </div>

      <div class="card" style="margin-top:12px">
        <b>2. ЦА и сценарии</b>
        <small>
          <b>Пользователи:</b> собственник/CEO, HRD/HR-менеджер, руководитель продаж/поддержки, операционный директор.<br/><br/>
          <b>User Stories:</b><br/>
          1) Быстро понять, что входит в услугу и какие задачи закрывает.<br/>
          2) Выбрать задачу и получить рекомендацию ролей/пакета.<br/>
          3) Оставить заявку с вводными по вакансиям и срокам.<br/>
          4) Записаться на консультацию/аудит.<br/>
          5) Менеджеру получить лид с контекстом и быстро взять в работу.
        </small>
      </div>

      <div class="card" style="margin-top:12px">
        <b>3. Функциональные требования (MVP)</b>
        <small>
          <b>Навигация:</b> запуск из бота. Разделы: Главная, Подбор решения (Квиз), Услуги/Пакеты, Кейсы, Заявка.<br/><br/>
          <b>Главная:</b> оффер + список автоматизаций: отклики/ответы, скрининг, назначение интервью, онбординг, отчёты и контроль.
          CTA: Подобрать решение / Пакеты / Консультация / Заявка.<br/><br/>
          <b>Квиз (2–3 минуты):</b> 6–10 вопросов: отрасль, размер команды, вакансии/мес, роли, срочность, каналы, приоритет метрик.
          Результат: 1–3 роли + формат (под ключ / обучение / оператор в штат) + кнопка к заявке.<br/><br/>
          <b>Услуги/Пакеты:</b> AI-рекрутинг под ключ, сорсинг+скрининг, онбординг+база знаний, HR-helpdesk, аудит HR (опц.).
          Описание 2–4 строки, «что входит» 3–6 пунктов, CTA «Оставить заявку».<br/><br/>
          <b>Форма заявки:</b> Ф.И.О., телефон, компания, объём найма, тип вакансий, способ связи; автоподстановка Telegram-данных; передача квиза/пакета; согласие на ПДн.
          Экран «Спасибо» + «Написать менеджеру».
        </small>
      </div>

      <div class="card" style="margin-top:12px">
        <b>4. Интеграции, безопасность, аналитика</b>
        <small>
          • CRM (Bitrix24) + резерв в таблицу/webhook; уведомления менеджеру в Telegram.<br/>
          • События аналитики: open_app, start_quiz, quiz_completed, lead_submit, lead_success/lead_error.<br/>
          • Валидация initData, антиспам, логирование ошибок.
        </small>
      </div>

      <div class="card" style="margin-top:12px">
        <b>5. Приёмка</b>
        <small>
          MVP выполнен, если:<br/>
          1) Мини-ап работает на iOS/Android.<br/>
          2) Квиз и заявка отрабатывают, данные уходят в CRM/таблицу, есть уведомление менеджеру.<br/>
          3) Нет критических ошибок Telegram WebApp.
        </small>
      </div>

      <div class="card" style="margin-top:12px">
        <b>6. Данные для согласования</b>
        <small>
          • Ответственный со стороны заказчика: [ФИО] / [должность]<br/>
          • Контакт в Telegram: [@username]<br/>
          • Телефон: [+7 …]<br/>
          • Куда отправлять заявки: [CRM / таблица / чат]<br/>
          • Чат для уведомлений менеджерам: [ссылка/ID чата]<br/>
          • Ссылка на политику/согласие: [URL]<br/>
          • Согласование дизайна/контента: [кто утверждает и срок]
        </small>
      </div>

      <div class="row" style="margin-top:14px;">
        <button class="btn primary" id="aiToQuiz">Подобрать решение</button>
        <button class="btn" id="aiToLead">Оставить заявку</button>
      </div>
    `;
  }

  function quizScreen() {
    return `
      <div class="section-title">Квиз (2–3 минуты)</div>
      <div class="lead">Ответьте на 7 вопросов — покажем 1–3 роли/формата и предложим следующий шаг.</div>

      <div class="form">
        ${selectField("Отрасль", "industry", ["IT/Диджитал","E-commerce","Производство","Логистика","Ритейл","Услуги","Другое"])}
        ${selectField("Размер команды", "team_size", ["1–10","11–50","51–200","200+"])}
        ${selectField("Вакансий в месяц", "hires_per_month", ["1–3","4–10","11–30","30+"])}
        ${selectField("Тип ролей", "roles", ["Продажи","Поддержка","IT","Операционка","Топ-менеджмент","Смешанные"])}
        ${selectField("Срочность", "urgency", ["Нужно вчера","1–2 недели","В течение месяца","Планово"])}
        ${selectField("Каналы", "channels", ["HH/джоб-борды","LinkedIn/соцсети","Рефералы","Холодный поиск","Смешанные"])}
        ${selectField("Приоритет метрик", "metric_priority", ["Скорость найма","Качество кандидатов","Стоимость найма","Снижение нагрузки HR"])}
      </div>

      <div class="row">
        <button class="btn primary" id="quizDone">Показать рекомендацию</button>
        <button class="btn" id="quizToLead">Сразу к заявке</button>
      </div>

      ${state.resultText ? `<div class="card" style="margin-top:12px"><b>Рекомендация</b><small>${escapeHtml(state.resultText)}</small></div>` : ``}
    `;
  }

  function packagesScreen() {
    const items = [
      { key:"AI-рекрутинг под ключ", desc:"Полный цикл найма: от отклика до оффера.", bullets:["Скрининг + интервью","Воронка и отчёты","Назначение встреч","Контроль SLA"] },
      { key:"Сорсинг + скрининг", desc:"Ускоряем поток релевантных кандидатов.", bullets:["Поиск/пулы","Предскрининг","Shortlist","Авто-коммуникации"] },
      { key:"Онбординг + база знаний", desc:"Быстрый вход новичков и снижение ошибок.", bullets:["Сценарии онбординга","FAQ/база знаний","Контроль прогресса","Шаблоны документов"] },
      { key:"HR-Helpdesk", desc:"Снижение нагрузки HR и поддержки.", bullets:["Ответы 24/7","Маршрутизация запросов","Категоризация","Статистика"] },
      { key:"Аудит HR (опц.)", desc:"Разбор процессов и план автоматизации.", bullets:["Карта процессов","Точки потерь","План внедрения","Быстрые победы"] },
    ];

    return `
      <div class="section-title">Услуги / Пакеты</div>
      <div class="lead">Выберите пакет — добавим в заявку, менеджер предложит комплектацию и бюджет.</div>

      <div class="cards two">
        ${items.map(it => `
          <div class="card">
            <b>${it.key}</b>
            <small>${it.desc}</small>
            <div class="bullets">
              ${it.bullets.map(b => `• ${b}`).join("<br/>")}
            </div>
            <div class="row" style="margin-top:12px;">
              <button class="btn primary pickPack" data-pack="${escapeAttr(it.key)}">Оставить заявку</button>
              <button class="btn ghost pickPack" data-pack="${escapeAttr(it.key)}">Выбрать</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function casesScreen() {
    const demos = [
      {t:"Сорсинг + скрининг (E-commerce)", d:"Сократили time-to-hire, стабилизировали воронку кандидатов."},
      {t:"HR-Helpdesk (Ритейл)", d:"Снизили нагрузку HR на типовых вопросах, ускорили ответы сотрудникам."},
      {t:"Онбординг (Производство)", d:"Быстрее вывод новичков на план, меньше ошибок в первые недели."},
    ];

    return `
      <div class="section-title">Кейсы</div>
      <div class="lead">Короткие демо-примеры. В заявке укажите отрасль — покажем релевантные кейсы.</div>

      <div class="cards">
        ${demos.map(x => `
          <div class="card">
            <b>${x.t}</b>
            <small>${x.d}</small>
          </div>
        `).join("")}
      </div>

      <div class="row" style="margin-top:14px;">
        <button class="btn primary" id="casesToLead">Запросить консультацию</button>
        <button class="btn" id="casesToQuiz">Подобрать решение</button>
      </div>
    `;
  }

  function leadScreen() {
    const user = getTgUser();
    const nameFromTg = user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "";

    return `
      <div class="section-title">Заявка</div>
      <div class="lead">Оставьте контакт и вводные. Telegram-данные подставим автоматически.</div>

      <div class="form">
        ${inputField("Ф.И.О.", "name", nameFromTg)}
        ${inputField("Телефон", "phone", "")}
        ${inputField("Компания", "company", "")}
        ${inputField("Объём найма (в месяц)", "hiring_volume", "")}
        ${inputField("Тип вакансий", "vacancy_types", state.quiz.roles || "")}
        <div class="field">
          <label>Способ связи</label>
          <select class="select" id="contact_method">
            ${["Telegram","WhatsApp","Звонок","Email"].map(o => `<option value="${escapeAttr(o)}">${o}</option>`).join("")}
          </select>
        </div>

        <div class="field full">
          <label>Комментарий</label>
          <textarea class="input" id="comment" placeholder="Например: срочно закрыть 5 продаж, нужна автоматизация скрининга..."></textarea>
        </div>
      </div>

      <div class="row">
        <label class="checkbox">
          <input type="checkbox" id="pdn" />
          Согласен(на) на обработку персональных данных
        </label>
      </div>

      <div class="row">
        <button class="btn primary" id="sendLead">Отправить</button>
        <button class="btn" id="fillFromQuiz">Подтянуть из квиза</button>
      </div>

      <div class="card" style="margin-top:12px">
        <b>Что отправим менеджеру</b>
        <small>
          • Выбранный пакет: ${escapeHtml(state.packagePicked || "не выбран")}<br/>
          • Результат квиза: ${escapeHtml(state.resultText || "нет")}<br/>
          • Telegram: ${escapeHtml(user?.username ? "@"+user.username : "—")}
        </small>
      </div>
    `;
  }

  function thanksScreen() {
    return `
      <div class="hero-pill">Готово</div>
      <div class="h1">Спасибо!<br/><span class="accent">Мы получили заявку</span></div>
      <div class="lead">Менеджер свяжется с вами. Если нужно быстрее — нажмите «Написать менеджеру».</div>
      <div class="actions">
        <button class="btn primary" id="writeManager">Написать менеджеру</button>
        <button class="btn" id="toHome">На главную</button>
      </div>
    `;
  }

  function buildRecommendation() {
    const q = state.quiz;
    let roles = [];
    let format = "под ключ";

    if (q.hires_per_month === "11–30" || q.hires_per_month === "30+") roles.push("Сорсинг + скрининг");
    if (q.roles === "Смешанные" || q.roles === "Операционка") roles.push("AI-рекрутинг под ключ");
    if (q.urgency === "Нужно вчера") roles.push("AI-рекрутер (быстрые коммуникации)");
    if (q.metric_priority === "Снижение нагрузки HR") roles.push("HR-Helpdesk");

    roles = [...new Set(roles)].slice(0,3);
    if (q.team_size === "1–10") format = "обучение / оператор в штат";
    if (q.team_size === "200+") format = "под ключ + интеграции + SLA";

    if (!roles.length) roles = ["AI-рекрутинг под ключ", "Сорсинг + скрининг"];
    state.resultText = `Рекомендуем: ${roles.join(", ")}. Формат: ${format}. Следующий шаг — заявка/консультация.`;
  }

  async function submitLead() {
    const pdn = qs("#pdn")?.checked;
    if (!pdn) return toast("Нужно согласие на ПДн");

    const lead = {
      name: qs("#name")?.value?.trim() || "",
      phone: qs("#phone")?.value?.trim() || "",
      company: qs("#company")?.value?.trim() || "",
      hiring_volume: qs("#hiring_volume")?.value?.trim() || "",
      vacancy_types: qs("#vacancy_types")?.value?.trim() || "",
      contact_method: qs("#contact_method")?.value?.trim() || "",
      comment: qs("#comment")?.value?.trim() || "",
      package: state.packagePicked || "",
      quiz: state.quiz,
      result: state.resultText || ""
    };

    if (!lead.phone && !(getTgUser()?.username)) {
      return toast("Укажи телефон или username Telegram");
    }

    track("lead_submit", { lead });

    const payload = {
      initData: tg?.initData || "",
      lead,
      events: state.events
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());

      track("lead_success");
      tg?.HapticFeedback?.notificationOccurred("success");
      setScreen("thanks");
    } catch (e) {
      track("lead_error", { error: String(e) });
      tg?.HapticFeedback?.notificationOccurred("error");
      toast("Ошибка отправки. Попробуй ещё раз.");
    }
  }

  function toast(text) {
    if (tg?.showPopup) tg.showPopup({ title: "КОМЭКСПО", message: text, buttons: [{type:"ok"}] });
    else alert(text);
  }

  function render() {
    const root = qs("#screen");
    if (!root) {
      console.error("No #screen element. Нужно <main id='screen'> в index.html");
      return;
    }

    syncBackUI();
    qsa(".tab").forEach(b => b.classList.toggle("active", b.dataset.go === state.screen));

    switch (state.screen) {
      case "home": root.innerHTML = homeScreen(); break;
      case "ai_recruiter": root.innerHTML = aiRecruiterScreen(); break;
      case "quiz": root.innerHTML = quizScreen(); break;
      case "packages": root.innerHTML = packagesScreen(); break;
      case "cases": root.innerHTML = casesScreen(); break;
      case "lead": root.innerHTML = leadScreen(); break;
      case "thanks": root.innerHTML = thanksScreen(); break;
      default: state.screen = "home"; root.innerHTML = homeScreen();
    }

    bind();
  }

  function bind() {
    // HOME
    qs("#goQuiz") && (qs("#goQuiz").onclick = () => { track("start_quiz"); setScreen("quiz"); });
    qs("#goPackages") && (qs("#goPackages").onclick = () => setScreen("packages"));
    qs("#goLead") && (qs("#goLead").onclick = () => setScreen("lead"));

    // cards on home
    qs("#openAiRecruiter") && (qs("#openAiRecruiter").onclick = () => setScreen("ai_recruiter"));
    qs("#openSourcing") && (qs("#openSourcing").onclick = () => setScreen("packages"));
    qs("#openHrAuto") && (qs("#openHrAuto").onclick = () => setScreen("packages"));

    // ai recruiter screen
    qs("#aiToQuiz") && (qs("#aiToQuiz").onclick = () => setScreen("quiz"));
    qs("#aiToLead") && (qs("#aiToLead").onclick = () => setScreen("lead"));

    // QUIZ
    qsa("select[id^='q_']").forEach(sel => {
      sel.onchange = () => {
        const key = sel.id.replace("q_", "");
        state.quiz[key] = sel.value;
      };
    });
    qs("#quizDone") && (qs("#quizDone").onclick = () => { buildRecommendation(); track("quiz_completed", { quiz: state.quiz, result: state.resultText }); render(); });
    qs("#quizToLead") && (qs("#quizToLead").onclick = () => setScreen("lead"));

    // PACKAGES
    qsa(".pickPack").forEach(btn => {
      btn.onclick = () => {
        state.packagePicked = btn.dataset.pack || "";
        track("pick_package", { pack: state.packagePicked });
        setScreen("lead");
      };
    });

    // CASES
    qs("#casesToLead") && (qs("#casesToLead").onclick = () => setScreen("lead"));
    qs("#casesToQuiz") && (qs("#casesToQuiz").onclick = () => setScreen("quiz"));

    // LEAD
    qs("#fillFromQuiz") && (qs("#fillFromQuiz").onclick = () => {
      const v = qs("#vacancy_types");
      if (v && state.quiz.roles) v.value = state.quiz.roles;
    });
    qs("#sendLead") && (qs("#sendLead").onclick = submitLead);

    // THANKS
    qs("#toHome") && (qs("#toHome").onclick = () => setScreen("home"));
    qs("#writeManager") && (qs("#writeManager").onclick = () => {
      const manager = "komexspo"; // поменяй на реальный @username
      tg?.openTelegramLink?.(`https://t.me/${manager}`);
    });
  }

  /* =========================
     Boot
  ========================== */

  document.addEventListener("DOMContentLoaded", () => {
    const s = currentUrlScreen();
    state.screen = s;

    replaceBrowserState(state.screen);

    qs("#btnBack")?.addEventListener("click", goBack);
    qsa(".tab").forEach(btn => btn.addEventListener("click", () => setScreen(btn.dataset.go)));

    tg?.BackButton?.onClick(goBack);

    window.addEventListener("popstate", (e) => {
      const screen = e?.state?.screen || currentUrlScreen() || "home";
      state.screen = screen;

      if (state.screen === "home") state.history = [];

      syncBackUI();
      render();
    });

    syncBackUI();
    render();
  });
})();
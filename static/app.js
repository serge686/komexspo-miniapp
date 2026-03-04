(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }

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

  function track(name, data = {}) {
    state.events.push({ name, data, ts: Date.now() });
  }

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return [...document.querySelectorAll(sel)]; }

  function setScreen(next, pushHistory = true) {
    if (pushHistory) state.history.push(state.screen);
    state.screen = next;
    render();
  }

  function back() {
    const prev = state.history.pop();
    if (prev) {
      state.screen = prev;
      render();
    } else {
      setScreen("home", false);
    }
  }

  // Deep link ?screen=quiz
  (function initFromQuery(){
    const p = new URLSearchParams(location.search);
    const s = p.get("screen");
    if (s) state.screen = s;
  })();

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
        <div class="card"><b>AI-рекрутер</b><small>Отклики, ответы, назначение интервью</small></div>
        <div class="card"><b>Сорсинг + скрининг</b><small>Подбор, фильтрация, shortlist</small></div>
        <div class="card"><b>HR-автоматизация</b><small>Онбординг, база знаний, helpdesk</small></div>
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

      <div class="cards" style="grid-template-columns: repeat(2, minmax(0,1fr));">
        ${items.map(it => `
          <div class="card">
            <b>${it.key}</b>
            <small>${it.desc}</small>
            <div style="margin-top:10px; color:#3b3b44; font-size:13px;">
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
    return `
      <div class="section-title">Заявка</div>
      <div class="lead">Оставьте контакт и вводные. Telegram-данные подставим автоматически.</div>

      <div class="form">
        ${inputField("Имя", "name", user?.first_name ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}` : "")}
        ${inputField("Телефон", "phone", "")}
        ${inputField("Компания", "company", "")}
        ${inputField("Объём найма (в месяц)", "hiring_volume", "")}
        ${inputField("Тип вакансий", "vacancy_types", state.quiz.roles || "")}
        ${selectLeadField("Способ связи", "contact_method", ["Telegram","WhatsApp","Звонок","Email"])}
        <div class="field" style="grid-column:1/-1;">
          <label>Комментарий</label>
          <textarea class="input" id="comment" placeholder="Например: срочно закрыть 5 sales, нужна автоматизация скрининга..."></textarea>
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

  function selectLeadField(label, id, options) {
    return `
      <div class="field">
        <label>${label}</label>
        <select class="select" id="${id}">
          ${options.map(o => `<option value="${escapeAttr(o)}">${o}</option>`).join("")}
        </select>
      </div>
    `;
  }

  function getTgUser() {
    try { return tg?.initDataUnsafe?.user || null; } catch { return null; }
  }

  function buildRecommendation() {
    const q = state.quiz;
    let roles = [];
    let format = "под ключ";

    const hires = q.hires_per_month;
    const urgent = q.urgency;

    if (hires === "11–30" || hires === "30+") roles.push("Сорсинг + скрининг");
    if (q.roles === "Смешанные" || q.roles === "Операционка") roles.push("AI-рекрутинг под ключ");
    if (urgent === "Нужно вчера") roles.push("AI-рекрутер (быстрые коммуникации)");
    if (q.metric_priority === "Снижение нагрузки HR") roles.push("HR-Helpdesk");

    roles = [...new Set(roles)].slice(0,3);
    if (q.team_size === "1–10") format = "обучение / оператор в штат";
    if (q.team_size === "200+") format = "под ключ + интеграции + SLA";

    if (!roles.length) roles = ["AI-рекрутинг под ключ", "Сорсинг + скрининг"];
    state.resultText = `Рекомендуем: ${roles.join(", ")}. Формат: ${format}. Следующий шаг — заявка/консультация.`;
  }

  function render() {
    const root = qs("#screen");
    if (!root) {
      console.error("No #screen element. Fix templates/index.html (need <main id='screen'>).");
      return;
    }

    const s = state.screen;

    if (s === "home") root.innerHTML = homeScreen();
    if (s === "quiz") root.innerHTML = quizScreen();
    if (s === "packages") root.innerHTML = packagesScreen();
    if (s === "cases") root.innerHTML = casesScreen();
    if (s === "lead") root.innerHTML = leadScreen();
    if (s === "thanks") root.innerHTML = thanksScreen();

    bind();
  }

  function bind() {
    const goQuiz = qs("#goQuiz"); if (goQuiz) goQuiz.onclick = () => { track("start_quiz"); setScreen("quiz"); };
    const goPackages = qs("#goPackages"); if (goPackages) goPackages.onclick = () => setScreen("packages");
    const goLead = qs("#goLead"); if (goLead) goLead.onclick = () => setScreen("lead");

    qsa("select[id^='q_']").forEach(sel => {
      sel.onchange = () => {
        const key = sel.id.replace("q_", "");
        state.quiz[key] = sel.value;
      };
    });

    const quizDone = qs("#quizDone");
    if (quizDone) quizDone.onclick = () => {
      buildRecommendation();
      track("quiz_completed", { quiz: state.quiz, result: state.resultText });
      render();
    };

    const quizToLead = qs("#quizToLead");
    if (quizToLead) quizToLead.onclick = () => setScreen("lead");

    qsa(".pickPack").forEach(btn => {
      btn.onclick = () => {
        state.packagePicked = btn.dataset.pack || "";
        track("pick_package", { pack: state.packagePicked });
        setScreen("lead");
      };
    });

    const casesToLead = qs("#casesToLead"); if (casesToLead) casesToLead.onclick = () => setScreen("lead");
    const casesToQuiz = qs("#casesToQuiz"); if (casesToQuiz) casesToQuiz.onclick = () => setScreen("quiz");

    const fillFromQuiz = qs("#fillFromQuiz");
    if (fillFromQuiz) fillFromQuiz.onclick = () => {
      const v = qs("#vacancy_types");
      if (state.quiz.roles && v) v.value = state.quiz.roles;
    };

    const sendLead = qs("#sendLead");
    if (sendLead) sendLead.onclick = submitLead;

    const toHome = qs("#toHome"); if (toHome) toHome.onclick = () => setScreen("home");
    const writeManager = qs("#writeManager");
    if (writeManager) writeManager.onclick = () => {
      const manager = "komexspo"; // поменяй на реальный @username
      if (tg) tg.openTelegramLink(`https://t.me/${manager}`);
      else window.open(`https://t.me/${manager}`, "_blank");
    };
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
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
      setScreen("thanks");
    } catch (e) {
      track("lead_error", { error: String(e) });
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("error");
      toast("Ошибка отправки. Попробуй ещё раз.");
    }
  }

  function toast(text) {
    if (tg?.showPopup) {
      tg.showPopup({ title: "КОМЭКСПО", message: text, buttons: [{type:"ok"}] });
    } else {
      alert(text);
    }
  }

  function escapeHtml(s){ return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
  function escapeAttr(s){ return escapeHtml(s).replaceAll('"',"&quot;"); }

  document.addEventListener("DOMContentLoaded", () => {
    const btnBack = qs("#btnBack");
    if (btnBack) btnBack.addEventListener("click", back);

    qsa(".tab").forEach(btn => {
      btn.addEventListener("click", () => setScreen(btn.dataset.go));
    });

    render();
  });
})();
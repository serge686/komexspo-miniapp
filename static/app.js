// static/app.js
(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }

  const screen = document.getElementById("screen");

  const state = {
    page: "home",
  };

  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => [...document.querySelectorAll(sel)];

  /* ---------------- NAVIGATION ---------------- */

  function setActiveTab() {
    qsa(".tab").forEach((t) => t.classList.toggle("active", t.dataset.go === state.page));
  }

  function go(page) {
    state.page = page || "home";
    render();
  }

  qsa(".tab").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });

  /* ---------------- BACK BUTTON (fix) ---------------- */

  function syncBack() {
    const btn = qs("#btnBack");
    const show = state.page !== "home";

    if (btn) btn.style.visibility = show ? "visible" : "hidden";

    if (tg?.BackButton) {
      if (show) tg.BackButton.show();
      else tg.BackButton.hide();
    }
  }

  function back() {
    if (state.page !== "home") go("home");
    else tg?.close?.();
  }

  qs("#btnBack")?.addEventListener("click", back);
  tg?.BackButton?.onClick(back);

  /* ---------------- RENDER ---------------- */

  function render() {
    if (!screen) return;

    if (state.page === "home") homeScreen();
    else if (state.page === "packages") packagesScreen();
    else if (state.page === "cases") casesScreen();
    else if (state.page === "lead") leadScreen();
    else homeScreen();

    setActiveTab();
    syncBack();
  }

  /* ---------------- HOME ---------------- */

  function homeScreen() {
    screen.innerHTML = `
      <div class="hero-pill">AI HR-агентство</div>

      <div class="h1">
        AI-рекрутинг<br/>
        <span class="accent">и HR-автоматизация</span>
      </div>

      <div class="lead">
        Закрываем вакансии быстрее с помощью AI-рекрутера,
        сорсинга кандидатов и автоматизации HR-процессов.
      </div>

      <div class="actions">
        <button class="btn primary" id="btnLead" type="button">Оставить заявку</button>
        <button class="btn" id="btnPackages" type="button">Пакеты</button>
      </div>

      <div class="cards">
        <button class="cardbtn" id="card1" type="button">
          <div class="card">
            <b>AI-рекрутер</b>
            <small>Отклики, ответы, назначение интервью</small>
          </div>
        </button>

        <button class="cardbtn" id="card2" type="button">
          <div class="card">
            <b>Сорсинг + скрининг</b>
            <small>Подбор, фильтрация, shortlist</small>
          </div>
        </button>

        <button class="cardbtn" id="card3" type="button">
          <div class="card">
            <b>HR-автоматизация</b>
            <small>Онбординг, база знаний, helpdesk</small>
          </div>
        </button>
      </div>
    `;

    qs("#btnLead")?.addEventListener("click", () => go("lead"));
    qs("#btnPackages")?.addEventListener("click", () => go("packages"));

    // пока карточки ведут в пакеты/заявку — можно поменять позже
    qs("#card1")?.addEventListener("click", () => go("lead"));
    qs("#card2")?.addEventListener("click", () => go("packages"));
    qs("#card3")?.addEventListener("click", () => go("packages"));
  }

  /* ---------------- PACKAGES ---------------- */

  function packagesScreen() {
    screen.innerHTML = `
      <div class="section-title">Пакеты решений</div>

      <div class="cards two">
        <div class="card">
          <b>Start</b>
          <small>до 3 вакансий</small>
          <div class="bullets">
            • AI-рекрутер<br/>
            • Скрининг кандидатов
          </div>
        </div>

        <div class="card">
          <b>Growth</b>
          <small>до 10 вакансий</small>
          <div class="bullets">
            • AI-рекрутер<br/>
            • Сорсинг кандидатов<br/>
            • HR-автоматизация
          </div>
        </div>

        <div class="card">
          <b>Scale</b>
          <small>массовый найм</small>
          <div class="bullets">
            • Полная автоматизация<br/>
            • AI-скрининг<br/>
            • HR-helpdesk
          </div>
        </div>
      </div>

      <div class="row" style="margin-top:14px;">
        <button class="btn primary" id="pkToLead" type="button">Оставить заявку</button>
      </div>
    `;

    qs("#pkToLead")?.addEventListener("click", () => go("lead"));
  }

  /* ---------------- CASES ---------------- */

  function casesScreen() {
    screen.innerHTML = `
      <div class="section-title">Кейсы</div>

      <div class="cards">
        <div class="card">
          <b>IT компания</b>
          <small>Закрыли 12 вакансий за 21 день</small>
        </div>

        <div class="card">
          <b>Retail сеть</b>
          <small>Автоматизация найма 120 сотрудников</small>
        </div>

        <div class="card">
          <b>SaaS стартап</b>
          <small>AI-рекрутинг + HR Helpdesk</small>
        </div>
      </div>

      <div class="row" style="margin-top:14px;">
        <button class="btn primary" id="csToLead" type="button">Запросить консультацию</button>
      </div>
    `;

    qs("#csToLead")?.addEventListener("click", () => go("lead"));
  }

  /* ---------------- LEAD FORM ---------------- */

  function escapeAttr(s) {
    return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  function leadScreen() {
    const user = tg?.initDataUnsafe?.user;
    const name = user ? `${user.first_name || ""}${user.last_name ? " " + user.last_name : ""}`.trim() : "";

    screen.innerHTML = `
      <div class="section-title">Заявка</div>

      <div class="lead">
        Оставьте контакт и вводные. Telegram-данные подставим автоматически.
      </div>

      <form class="form" id="leadForm" autocomplete="on">
        <div class="field">
          <label>Ф.И.О.</label>
          <input class="input" id="name" value="${escapeAttr(name)}" />
        </div>

        <div class="field">
          <label>Телефон</label>
          <input class="input" id="phone" inputmode="tel" placeholder="+7..." />
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
            <option value="Telegram">Telegram</option>
            <option value="Телефон">Телефон</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>

        <div class="field full">
          <label>Комментарий</label>
          <textarea class="input" id="comment" rows="4"
            placeholder="Например: срочно закрыть 5 продаж, нужна автоматизация скрининга"></textarea>
        </div>

        <div class="row" style="justify-content:flex-start;">
          <label class="checkbox">
            <input type="checkbox" id="agree" />
            Согласен(на) на обработку персональных данных
          </label>
        </div>

        <div class="row">
          <button type="button" class="btn primary" id="sendLead">Отправить</button>
        </div>
      </form>
    `;

    bindLead();
  }

  /* ---------------- PHONE FORMAT ---------------- */

  function formatPhone(input) {
    if (!input) return;

    input.addEventListener("input", () => {
      let x = input.value.replace(/\D/g, "");
      if (!x) return;

      if (x.startsWith("8")) x = "7" + x.slice(1);

      // если пользователь только начал ввод — помогаем начать с +7
      if (!x.startsWith("7")) return;

      x = x.slice(1); // после 7

      let formatted = "+7";
      if (x.length > 0) formatted += " (" + x.slice(0, 3);
      if (x.length >= 3) formatted += ") " + x.slice(3, 6);
      if (x.length >= 6) formatted += "-" + x.slice(6, 8);
      if (x.length >= 8) formatted += "-" + x.slice(8, 10);

      input.value = formatted;
    });
  }

  /* ---------------- SUBMIT ---------------- */

  function bindLead() {
    const phoneInput = qs("#phone");
    formatPhone(phoneInput);

    qs("#sendLead")?.addEventListener("click", () => {
      if (!qs("#agree")?.checked) {
        alert("Нужно согласие на обработку данных");
        return;
      }

      const data = {
        name: qs("#name")?.value?.trim() || "",
        phone: qs("#phone")?.value?.trim() || "",
        company: qs("#company")?.value?.trim() || "",
        hiring_volume: qs("#hiring_volume")?.value?.trim() || "",
        vacancies: qs("#vacancies")?.value?.trim() || "",
        contact: qs("#contact")?.value?.trim() || "",
        comment: qs("#comment")?.value?.trim() || "",
        telegram_user: tg?.initDataUnsafe?.user || null,
      };

      console.log("lead", data);

      try {
        tg?.sendData?.(JSON.stringify(data));
        alert("Заявка отправлена!");
        go("home");
      } catch (e) {
        console.error(e);
        alert("Не удалось отправить. Попробуйте ещё раз.");
      }
    });
  }

  /* ---------------- INIT ---------------- */

  render();
})();
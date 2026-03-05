const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready?.();
  tg.expand?.();
}

const screen = document.getElementById("screen");

const state = {
  page: "home",
  quiz: {}
};

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function go(page){
  state.page = page;
  render();
}

// tabs navigation
qsa(".tab").forEach(btn => {
  btn.onclick = () => go(btn.dataset.go);
});

// back button (top left)
function goBack(){
  // простая логика: если не home — вернуться на home, иначе закрыть миниапп
  if (state.page !== "home") go("home");
  else tg?.close?.();
}
qs("#btnBack")?.addEventListener("click", goBack);

// helper: smooth scroll внутри контейнера screen
function smoothScrollToId(id){
  const el = document.getElementById(id);
  if (!el) return;

  // подсветка секции (приятный UX)
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), 900);

  // плавный скролл в рамках #screen
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------------- RENDER ---------------- */

function render(){
  if(state.page === "home") homeScreen();
  if(state.page === "packages") packagesScreen();
  if(state.page === "cases") casesScreen();
  if(state.page === "lead") leadScreen();

  qsa(".tab").forEach(t => t.classList.remove("active"));
  const active = qs(`.tab[data-go="${state.page}"]`);
  if(active) active.classList.add("active");
}

/* ---------------- HOME ---------------- */

function homeScreen(){
  screen.innerHTML = `
    <div class="hero-pill">AI HR-агентство</div>

    <h1 class="h1">
      AI-рекрутинг<br>
      <span class="accent">и HR-автоматизация</span>
    </h1>

    <p class="lead">
      Закрываем вакансии быстрее: AI-коммуникации, сорсинг кандидатов,
      скрининг и автоматизация HR-процессов — под ключ.
    </p>

    <div class="actions">
      <button class="btn primary" id="btnLead" type="button">Оставить заявку</button>
      <button class="btn" id="btnPackages" type="button">Пакеты</button>
    </div>

    <!-- кликабельные карточки (СКРОЛЛ ВНИЗ) -->
    <div class="cards">
      <button class="cardbtn" id="card_ai" type="button" aria-label="AI-рекрутер — перейти к описанию">
        <div class="card">
          <b>AI-рекрутер</b>
          <small>Ускоряем найм: отклик → контакт → интервью. Без потерь лидов.</small>
        </div>
      </button>

      <button class="cardbtn" id="card_sourcing" type="button" aria-label="Сорсинг + скрининг — перейти к описанию">
        <div class="card">
          <b>Сорсинг + скрининг</b>
          <small>Даем поток «живых» кандидатов и чистый shortlist — быстро.</small>
        </div>
      </button>

      <button class="cardbtn" id="card_hr" type="button" aria-label="HR-автоматизация — перейти к описанию">
        <div class="card">
          <b>HR-автоматизация</b>
          <small>Онбординг, база знаний, helpdesk — меньше рутины, больше контроля.</small>
        </div>
      </button>
    </div>

    <!-- секции ниже: сюда скроллим -->
    <div class="home-sections">

      <section class="card section" id="sec_ai">
        <div class="section-title">AI-рекрутер</div>
        <div class="lead" style="margin:0 auto; max-width:680px;">
          Включаем AI-коммуникации и «доводим» кандидата до интервью:
          быстрее ответы, меньше срывов, больше конверсии в встречу.
        </div>
        <div class="bullets" style="margin-top:10px;">
          • Автоответы и догрев кандидатов<br/>
          • Назначение интервью + напоминания<br/>
          • Скрининг по чек-листу и фиксация результатов<br/>
          • Контроль SLA и прозрачная воронка
        </div>
        <div class="row" style="margin-top:12px;">
          <button class="btn primary" id="ai_to_lead" type="button">Запросить внедрение</button>
          <button class="btn" id="ai_to_packages" type="button">Смотреть пакеты</button>
        </div>
      </section>

      <section class="card section" id="sec_sourcing">
        <div class="section-title">Сорсинг + скрининг</div>
        <div class="lead" style="margin:0 auto; max-width:680px;">
          Стабильный поток релевантных кандидатов: расширяем каналы,
          отсекаем нерелевант, выдаём shortlist, готовый к интервью.
        </div>
        <div class="bullets" style="margin-top:10px;">
          • Поиск/пулы: HH, соцсети, рефералы, холодный поиск<br/>
          • Предскрининг: мотивация, ожидания, соответствие роли<br/>
          • Shortlist и приоритизация кандидатов<br/>
          • Авто-коммуникации и сопровождение до интервью
        </div>
        <div class="row" style="margin-top:12px;">
          <button class="btn primary" id="sourcing_to_lead" type="button">Получить shortlist</button>
          <button class="btn" id="sourcing_to_cases" type="button">Смотреть кейсы</button>
        </div>
      </section>

      <section class="card section" id="sec_hr">
        <div class="section-title">HR-автоматизация</div>
        <div class="lead" style="margin:0 auto; max-width:680px;">
          Снимаем HR-рутину: онбординг новичков, база знаний, helpdesk,
          маршрутизация вопросов и аналитика нагрузки.
        </div>
        <div class="bullets" style="margin-top:10px;">
          • Онбординг-сценарии с контролем прогресса<br/>
          • FAQ/база знаний и шаблоны документов<br/>
          • HR-helpdesk: ответы 24/7 + маршрутизация запросов<br/>
          • Статистика, категории обращений, точки потерь
        </div>
        <div class="row" style="margin-top:12px;">
          <button class="btn primary" id="hr_to_lead" type="button">Аудит процессов</button>
          <button class="btn" id="hr_to_packages" type="button">Пакеты</button>
        </div>
      </section>

    </div>
  `;

  // hero buttons
  qs("#btnLead").onclick = ()=>go("lead");
  qs("#btnPackages").onclick = ()=>go("packages");

  // scroll from cards to sections
  qs("#card_ai").onclick = ()=>smoothScrollToId("sec_ai");
  qs("#card_sourcing").onclick = ()=>smoothScrollToId("sec_sourcing");
  qs("#card_hr").onclick = ()=>smoothScrollToId("sec_hr");

  // section CTAs
  qs("#ai_to_lead").onclick = ()=>go("lead");
  qs("#ai_to_packages").onclick = ()=>go("packages");

  qs("#sourcing_to_lead").onclick = ()=>go("lead");
  qs("#sourcing_to_cases").onclick = ()=>go("cases");

  qs("#hr_to_lead").onclick = ()=>go("lead");
  qs("#hr_to_packages").onclick = ()=>go("packages");

  // маленький UX: при открытии home — наверх
  screen.scrollTo({ top: 0, behavior: "auto" });
}

/* ---------------- PACKAGES ---------------- */

function packagesScreen(){
  screen.innerHTML = `
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
  `;
}

/* ---------------- CASES ---------------- */

function casesScreen(){
  screen.innerHTML = `
    <h2 class="section-title">Кейсы</h2>

    <div class="cards">
      <div class="card">
        <b>IT компания</b>
        <small>закрыли 12 вакансий за 21 день</small>
      </div>

      <div class="card">
        <b>Retail сеть</b>
        <small>автоматизация найма 120 сотрудников</small>
      </div>

      <div class="card">
        <b>SaaS стартап</b>
        <small>AI-рекрутинг + HR helpdesk</small>
      </div>
    </div>
  `;
}

/* ---------------- LEAD FORM ---------------- */

function leadScreen(){
  const user = tg?.initDataUnsafe?.user;
  const name = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "";

  screen.innerHTML = `
    <h2 class="section-title">Заявка</h2>

    <p class="lead">
      Оставьте контакт и вводные. Telegram-данные подставим автоматически.
    </p>

    <form class="form" onsubmit="return false;">
      <div class="field">
        <label>Ф.И.О.</label>
        <input class="input" id="name" value="${escapeHtml(name)}" />
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
          placeholder="Например: нужно закрыть 5 продаж за 2 недели, нужен скрининг и назначение интервью"></textarea>
      </div>

      <div class="row" style="justify-content:flex-start;">
        <label class="checkbox">
          <input type="checkbox" id="agree">
          Согласен(на) на обработку персональных данных
        </label>
      </div>

      <div class="row" style="justify-content:flex-start;">
        <button type="button" class="btn primary" id="sendLead">Отправить</button>
      </div>
    </form>
  `;

  bindLead();
}

function escapeHtml(s){
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

/* ---------------- PHONE FORMAT ---------------- */

function formatPhone(input){
  input.addEventListener("input", () => {
    let x = input.value.replace(/\D/g,"");
    if (x.startsWith("8")) x = "7" + x.slice(1);

    if (!x.startsWith("7")) {
      // если человек начал вводить не с 7 — не ломаем ввод
      if (input.value.startsWith("+")) return;
      return;
    }

    x = x.slice(1);
    let formatted = "+7";
    if (x.length > 0) formatted += " (" + x.slice(0,3);
    if (x.length >= 3) formatted += ") " + x.slice(3,6);
    if (x.length >= 6) formatted += "-" + x.slice(6,8);
    if (x.length >= 8) formatted += "-" + x.slice(8,10);
    input.value = formatted;
  });
}

/* ---------------- SUBMIT ---------------- */

function bindLead(){
  const phoneInput = qs("#phone");
  if (phoneInput) formatPhone(phoneInput);

  qs("#sendLead").onclick = () => {
    if(!qs("#agree").checked){
      tg?.showPopup
        ? tg.showPopup({ title:"КОМЭКСПО", message:"Нужно согласие на обработку данных", buttons:[{type:"ok"}] })
        : alert("Нужно согласие на обработку данных");
      return;
    }

    const data = {
      name: qs("#name").value,
      phone: qs("#phone").value,
      company: qs("#company").value,
      hiring_volume: qs("#hiring_volume").value,
      vacancies: qs("#vacancies").value,
      contact: qs("#contact").value,
      comment: qs("#comment").value,
      telegram_user: tg?.initDataUnsafe?.user || null
    };

    // отправка в бота (как у тебя)
    tg?.sendData?.(JSON.stringify(data));
    tg?.HapticFeedback?.notificationOccurred?.("success");

    tg?.showPopup
      ? tg.showPopup({ title:"КОМЭКСПО", message:"Заявка отправлена! Мы свяжемся с вами.", buttons:[{type:"ok"}] })
      : alert("Заявка отправлена!");
  };
}

/* ---------------- INIT ---------------- */
render();
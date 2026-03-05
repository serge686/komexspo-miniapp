const tg = window.Telegram.WebApp;
tg.expand();

const screen = document.getElementById("screen");

const state = {
  page: "home",
  quiz: {}
};

function qs(id){
  return document.querySelector(id);
}

/* ---------------- NAVIGATION ---------------- */

function go(page){
  state.page = page;
  render();
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.onclick = () => go(btn.dataset.go);
});

/* ---------------- RENDER ---------------- */

function render(){

  if(state.page === "home") homeScreen();
  if(state.page === "packages") packagesScreen();
  if(state.page === "cases") casesScreen();
  if(state.page === "lead") leadScreen();

  document.querySelectorAll(".tab").forEach(t=>{
    t.classList.remove("active");
  });

  const active = document.querySelector(`.tab[data-go="${state.page}"]`);
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
Закрываем вакансии быстрее с помощью AI-рекрутера,
сорсинга кандидатов и автоматизации HR-процессов.
</p>

<div class="actions">
<button class="btn primary" id="btnLead">Оставить заявку</button>
<button class="btn" id="btnPackages">Пакеты</button>
</div>

<div class="cards">

<button class="cardbtn" id="card1">
<div class="card">
<b>AI-рекрутер</b>
<small>Отклики, ответы, назначение интервью</small>
</div>
</button>

<button class="cardbtn" id="card2">
<div class="card">
<b>Сорсинг + скрининг</b>
<small>Подбор, фильтрация, shortlist</small>
</div>
</button>

<button class="cardbtn" id="card3">
<div class="card">
<b>HR-автоматизация</b>
<small>Онбординг, база знаний, helpdesk</small>
</div>
</button>

</div>
`;

qs("#btnLead").onclick = ()=>go("lead");
qs("#btnPackages").onclick = ()=>go("packages");

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

const user = tg.initDataUnsafe?.user;

const name = user
  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
  : "";

screen.innerHTML = `

<h2 class="section-title">Заявка</h2>

<p class="lead">
Оставьте контакт и вводные. Telegram-данные подставим автоматически.
</p>

<form class="form">

<div class="field">
<label>Ф.И.О.</label>
<input class="input" id="name" value="${name}" />
</div>

<div class="field">
<label>Телефон</label>
<input class="input" id="phone" placeholder="+7..." />
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
</select>
</div>

<div class="field full">
<label>Комментарий</label>
<textarea class="input" id="comment"
placeholder="Например: срочно закрыть 5 продаж, нужна автоматизация скрининга"></textarea>
</div>

<div class="row">
<label class="checkbox">
<input type="checkbox" id="agree">
Согласен(на) на обработку персональных данных
</label>
</div>

<div class="row">
<button type="button" class="btn primary" id="sendLead">
Отправить
</button>
</div>

</form>

`;

bindLead();

}

/* ---------------- PHONE FORMAT ---------------- */

function formatPhone(input){

input.addEventListener("input", e => {

let x = input.value.replace(/\D/g,"");

if(x.startsWith("8")) x = "7" + x.slice(1);

if(x.startsWith("7")){

x = x.slice(1);

let formatted = "+7";

if(x.length>0) formatted += " (" + x.slice(0,3);
if(x.length>=3) formatted += ") " + x.slice(3,6);
if(x.length>=6) formatted += "-" + x.slice(6,8);
if(x.length>=8) formatted += "-" + x.slice(8,10);

input.value = formatted;

}

});

}

/* ---------------- SUBMIT ---------------- */

function bindLead(){

const phoneInput = qs("#phone");
formatPhone(phoneInput);

qs("#sendLead").onclick = ()=>{

if(!qs("#agree").checked){
alert("Нужно согласие на обработку данных");
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

telegram_user: tg.initDataUnsafe?.user || null

};

console.log("lead", data);

tg.sendData(JSON.stringify(data));

alert("Заявка отправлена!");

};

}

/* ---------------- INIT ---------------- */

render();
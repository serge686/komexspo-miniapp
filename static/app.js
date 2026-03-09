const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const screen = document.getElementById("screen");
const btnBack = document.getElementById("btnBack");

const state = {
  page: "home",
  history: ["home"]
};

function go(page){
  if (state.page !== page) {
    state.history.push(page);
  }

  state.page = page;
  render();
  updateBack();
}

function back(){
  if (state.history.length > 1) {
    state.history.pop();
    state.page = state.history[state.history.length - 1];
    render();
    updateBack();
  }
}

function updateBack(){
  if (!btnBack) return;
  btnBack.style.display = state.history.length > 1 ? "inline-flex" : "none";
}

btnBack.addEventListener("click", back);


function renderHome(){
  return `
    <div class="hero">

      <h2 class="hero-title">
        AI HR агентство
      </h2>

      <p class="hero-text">
        Подбор AI решений для вашего бизнеса
      </p>

      <button class="btn-primary" onclick="go('quiz')">
        Начнем?
      </button>

    </div>
  `;
}


function renderQuiz(){
  return `
    <div class="quiz-page">

      <div class="quiz-card">

        <h2>Подбор AI решения</h2>

        <p>
        Ответьте на несколько вопросов и мы подберем решение для вашего бизнеса
        </p>

        <button class="btn-primary">
          Начать тест
        </button>

      </div>

    </div>
  `;
}


function render(){

  if(state.page === "home"){
    screen.innerHTML = renderHome();
    return;
  }

  if(state.page === "quiz"){
    screen.innerHTML = renderQuiz();
    return;
  }

}

render();
updateBack();
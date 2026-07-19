const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = '메뉴 열기';
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.querySelector('.sr-only').textContent = opening ? '메뉴 닫기' : '메뉴 열기';
  nav.classList.toggle('open', opening);
  document.body.classList.toggle('menu-open', opening);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 40);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: '-35% 0px -55%', threshold: 0 }
);
sections.forEach((section) => sectionObserver.observe(section));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const duration = 1300;
      const startTime = performance.now();
      const formatter = new Intl.NumberFormat('ko-KR');
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = formatter.format(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(element);
    });
  },
  { threshold: 0.7 }
);
document.querySelectorAll('[data-count]').forEach((counter) => counterObserver.observe(counter));

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const speciesCards = [...document.querySelectorAll('[data-category]')];
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    speciesCards.forEach((card) => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

const quizQuestions = [
  {
    question: '독도 주변 바닷속에서 여러 생물의 은신처가 되는 생태계는 무엇일까요?',
    answers: ['모래사막', '대형 해조류가 만든 해조 숲', '민물 습지'],
    correct: 1,
    note: '대황·감태 같은 대형 해조류는 물고기와 무척추동물의 먹이와 은신처가 됩니다.'
  },
  {
    question: '독도가 철새에게 생태적으로 중요한 가장 큰 이유는 무엇일까요?',
    answers: ['이동 중 쉬어 가는 피난처이기 때문에', '넓은 논이 있기 때문에', '겨울에도 눈이 오지 않기 때문에'],
    correct: 0,
    note: '바다 한가운데 있는 독도는 긴 이동을 하는 철새에게 귀중한 중간 휴식처입니다.'
  },
  {
    question: '2020년 조사에서 독도 주변 해역에 가장 많은 종이 확인된 분류는 무엇일까요?',
    answers: ['어류', '산호류', '암반무척추동물'],
    correct: 2,
    note: '345종 가운데 암반무척추동물이 215종으로 가장 큰 비중을 차지했습니다.'
  }
];

const quiz = document.querySelector('[data-quiz]');
const quizContent = quiz.querySelector('[data-quiz-content]');
const questionNumber = quiz.querySelector('[data-question-number]');
const progress = quiz.querySelector('[data-progress]');
const feedback = quiz.querySelector('[data-feedback]');
const nextButton = quiz.querySelector('[data-next]');
let currentQuestion = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  const item = quizQuestions[currentQuestion];
  answered = false;
  questionNumber.textContent = String(currentQuestion + 1);
  progress.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
  feedback.textContent = '';
  nextButton.disabled = true;
  nextButton.innerHTML = currentQuestion === quizQuestions.length - 1
    ? '결과 보기 <span aria-hidden="true">→</span>'
    : '다음 문제 <span aria-hidden="true">→</span>';
  quizContent.innerHTML = `
    <h3>${item.question}</h3>
    <div class="answer-list">
      ${item.answers.map((answer, index) => `<button class="answer-button" type="button" data-answer="${index}"><span>${String.fromCharCode(65 + index)}</span>${answer}</button>`).join('')}
    </div>`;
  quizContent.querySelectorAll('[data-answer]').forEach((button) => {
    button.addEventListener('click', () => selectAnswer(Number(button.dataset.answer)));
  });
}

function selectAnswer(selected) {
  if (answered) return;
  answered = true;
  const item = quizQuestions[currentQuestion];
  const buttons = [...quizContent.querySelectorAll('[data-answer]')];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.correct) button.classList.add('correct');
    if (index === selected && selected !== item.correct) button.classList.add('wrong');
  });
  if (selected === item.correct) score += 1;
  feedback.textContent = `${selected === item.correct ? '정답입니다. ' : '아쉬워요. '}${item.note}`;
  nextButton.disabled = false;
}

function showResult() {
  const message = score === 3 ? '독도 생태 탐사대장' : score === 2 ? '꼼꼼한 생태 관찰자' : '호기심 많은 첫 탐사자';
  quiz.querySelector('.quiz-progress').style.visibility = 'hidden';
  quizContent.innerHTML = `<div class="quiz-result"><div><strong>${score}/3</strong><h3>${message}</h3><p>관찰이 깊어질수록 지켜야 할 이유도 선명해집니다.</p><button type="button" data-restart>다시 풀기</button></div></div>`;
  feedback.textContent = '';
  nextButton.hidden = true;
  quizContent.querySelector('[data-restart]').addEventListener('click', restartQuiz);
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  quiz.querySelector('.quiz-progress').style.visibility = 'visible';
  nextButton.hidden = false;
  renderQuestion();
}

nextButton.addEventListener('click', () => {
  if (!answered) return;
  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion += 1;
    renderQuestion();
  } else {
    showResult();
  }
});
renderQuestion();

/* ============================================
   Quiz Engine — 爆文體質檢測器
   Cynical Coffee × MSI Visual
   ============================================ */

const QUIZ_DATA = {
  questions: [
    {
      id: 1,
      text: "早上醒來，你的第一個念頭是什麼？",
      options: [
        { letter: "A", text: "今天要發什麼內容才能獲得更多讚！", score: 4 },
        { letter: "B", text: "等一下先查一下昨天那篇的互動數據", score: 3 },
        { letter: "C", text: "好累，再睡五分鐘", score: 2 },
        { letter: "D", text: "為什麼要起床，生存毫無意義", score: 1 }
      ]
    },
    {
      id: 2,
      text: "你喝了一杯讓你感動到掉淚的咖啡，你會怎麼做？",
      options: [
        { letter: "A", text: "立刻拍照、修圖、加文字、設好排程、發出三個平台同步上傳", score: 4 },
        { letter: "B", text: "拍一張照，想一個有深度的標題，發 IG 限時動態", score: 3 },
        { letter: "C", text: "傳給閨蜜說「好好喝」", score: 2 },
        { letter: "D", text: "把感動留給自己，人生本就孤獨", score: 1 }
      ]
    },
    {
      id: 3,
      text: "朋友的貼文只有 3 個讚，你的反應是什麼？",
      options: [
        { letter: "A", text: "偷偷幫他分析演算法失誤在哪並給出優化建議", score: 4 },
        { letter: "B", text: "給他一個讚，順便學習他的失敗案例", score: 3 },
        { letter: "C", text: "留個愛心表情，完全沒在意", score: 2 },
        { letter: "D", text: "表示理解，這個世界從來不懂真正的藝術", score: 1 }
      ]
    },
    {
      id: 4,
      text: "你的理想咖啡是？",
      options: [
        { letter: "A", text: "拍起來最好看的那杯，不管好不好喝", score: 4 },
        { letter: "B", text: "手沖單品，能聊出三段故事的那種", score: 3 },
        { letter: "C", text: "大杯冰拿鐵加糖，便宜又實在", score: 2 },
        { letter: "D", text: "超苦的黑咖啡，就像人生", score: 1 }
      ]
    },
    {
      id: 5,
      text: "你發了一篇自認寫得很好的文章，結果只有 5 個讚。你的下一步是？",
      options: [
        { letter: "A", text: "研究競品爆文格式，重新包裝再發一次", score: 4 },
        { letter: "B", text: "加個吸睛的開頭重新編輯，再觀察一天", score: 3 },
        { letter: "C", text: "算了，下次再說", score: 2 },
        { letter: "D", text: "確認了世界不值得我花心思", score: 1 }
      ]
    },
    {
      id: 6,
      text: "看到別人的爆文突破十萬觸及，你的內心OS？",
      options: [
        { letter: "A", text: "截圖存檔，拆解他的鉤子策略，今晚就複製", score: 4 },
        { letter: "B", text: "欣賞一下，順手追蹤，說不定有合作機會", score: 3 },
        { letter: "C", text: "雙擊螢幕，繼續滑", score: 2 },
        { letter: "D", text: "群眾永遠只愛膚淺的東西", score: 1 }
      ]
    },
    {
      id: 7,
      text: "如果你是一款咖啡，你會是？",
      options: [
        { letter: "A", text: "網美拿鐵 — 顏色好看、熱度夠高、打卡必備", score: 4 },
        { letter: "B", text: "精品手沖 — 有故事、有深度、小眾但有質感", score: 3 },
        { letter: "C", text: "便利商店美式 — 沒什麼特色但堪用", score: 2 },
        { letter: "D", text: "黑到底的義式濃縮 — 大家接受不了就算了", score: 1 }
      ]
    },
    {
      id: 8,
      text: "週末你會怎麼過？",
      options: [
        { letter: "A", text: "提前準備一週內容，研究下週爆文議題", score: 4 },
        { letter: "B", text: "去一家新開咖啡館，感受靈感，也許可以寫點什麼", score: 3 },
        { letter: "C", text: "在家耍廢追劇，偶爾滑一下社群", score: 2 },
        { letter: "D", text: "拒絕社交，手機調靜音，遠離人類", score: 1 }
      ]
    }
  ],

  results: [
    {
      minScore: 28,
      emoji: "🔥",
      name: "爆文新星",
      nameEn: "VIRAL STAR",
      desc: "你天生就是為了流量而生。對演算法的敏感度超越大多數人，能精準抓住受眾心理，把每一杯咖啡都變成一個值得傳播的故事。厭世咖啡的開店詔書，大概就是你寫的。",
      traits: ["流量嗅覺靈敏", "內容策略型", "執行力爆表", "社群天才"],
      scorePercent: 100
    },
    {
      minScore: 20,
      emoji: "⚡",
      name: "潛力股",
      nameEn: "RISING FORCE",
      desc: "你有獨到的觀察力和說故事的才華，只差一個觸發點就會全面爆發。現在你需要的不是更多咖啡因，而是更多發文。來厭世咖啡坐坐，也許下一篇爆文就在這裡誕生。",
      traits: ["創意豐富", "觀察敏銳", "潛力無限", "需要更多練習"],
      scorePercent: 72
    },
    {
      minScore: 12,
      emoji: "☕",
      name: "佛系路人",
      nameEn: "ZEN DRIFTER",
      desc: "你對社群媒體的態度就像對待一杯涼掉的咖啡——偶爾想起，也不太在乎。生活是自己的，熱度是別人的。在厭世咖啡，我們欣賞你這種不裝的真實。",
      traits: ["真實不做作", "不被流量綁架", "活在當下", "咖啡優先"],
      scorePercent: 42
    },
    {
      minScore: 0,
      emoji: "🌑",
      name: "厭世咖啡人",
      nameEn: "CYNICAL SOUL",
      desc: "你與我們的品牌靈魂高度吻合。不是每個人都能承受世界的喧囂，而你選擇了最誠實的方式——把一切濾掉，只留下最濃的苦味。你的沉默，就是最好的爆文。",
      traits: ["反演算法美學", "真實的黑暗面", "沉默的力量", "厭世本尊"],
      scorePercent: 20
    }
  ]
};

// ── State ──
let currentQ = 0;
let answers  = [];
let selected = null;

// ── DOM refs ──
const quizSection    = document.getElementById('quiz-section');
const resultSection  = document.getElementById('result-section');
const progressFill   = document.getElementById('progress-fill');
const progressText   = document.getElementById('progress-text');
const qNumber        = document.getElementById('q-number');
const qText          = document.getElementById('q-text');
const optionsWrap    = document.getElementById('options-wrap');
const btnNext        = document.getElementById('btn-next');

// Result DOM
const resultEmoji    = document.getElementById('result-emoji');
const resultName     = document.getElementById('result-name');
const resultNameEn   = document.getElementById('result-name-en');
const resultDesc     = document.getElementById('result-desc');
const scoreFill      = document.getElementById('score-fill');
const traitsWrap     = document.getElementById('traits-wrap');

// ── Init ──
function initQuiz() {
  currentQ = 0;
  answers  = [];
  selected = null;
  quizSection.style.display  = 'block';
  resultSection.style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const total = QUIZ_DATA.questions.length;
  const q     = QUIZ_DATA.questions[currentQ];

  // Progress
  const pct = Math.round((currentQ / total) * 100);
  progressFill.style.width = pct + '%';
  progressText.textContent  = `${currentQ + 1} / ${total}`;
  const progressBar = document.querySelector('.quiz-progress-wrap[role="progressbar"]');
  if (progressBar) progressBar.setAttribute('aria-valuenow', pct);

  // Question
  qNumber.textContent = `QUESTION ${String(currentQ + 1).padStart(2, '0')}`;
  qText.textContent   = q.text;

  // Options
  optionsWrap.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className    = 'quiz-option';
    btn.dataset.score = opt.score;
    btn.dataset.idx   = idx;
    btn.innerHTML = `
      <span class="option-letter">${opt.letter}</span>
      <span class="option-text">${opt.text}</span>
    `;
    btn.addEventListener('click', () => selectOption(btn, q.options));
    optionsWrap.appendChild(btn);
  });

  // Reset next button
  selected = null;
  btnNext.classList.remove('active');
  btnNext.disabled = true;
  btnNext.setAttribute('aria-disabled', 'true');

  // Animate in
  const card = document.querySelector('.quiz-card');
  card.style.opacity   = '0';
  card.style.transform = 'translateY(12px)';
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    card.style.opacity    = '1';
    card.style.transform  = 'translateY(0)';
  });
}

function selectOption(btn, options) {
  // Deselect all
  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selected = parseInt(btn.dataset.score, 10);
  btnNext.classList.add('active');
  btnNext.disabled = false;
  btnNext.setAttribute('aria-disabled', 'false');
}

function nextQuestion() {
  if (selected === null) return;
  answers.push(selected);

  const total = QUIZ_DATA.questions.length;
  if (currentQ < total - 1) {
    currentQ++;
    renderQuestion();
  } else {
    // Final progress fill
    progressFill.style.width = '100%';
    progressText.textContent  = `${total} / ${total}`;
    setTimeout(showResult, 400);
  }
}

function showResult() {
  const totalScore = answers.reduce((a, b) => a + b, 0);
  const result = QUIZ_DATA.results.find(r => totalScore >= r.minScore);

  quizSection.style.display   = 'none';
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Populate result
  resultEmoji.textContent  = result.emoji;
  resultName.textContent   = result.name;
  resultNameEn.textContent = result.nameEn;
  resultDesc.textContent   = result.desc;

  // Animate score bar
  scoreFill.style.width = '0%';
  setTimeout(() => {
    scoreFill.style.width = result.scorePercent + '%';
  }, 300);

  // Traits
  traitsWrap.innerHTML = '';
  result.traits.forEach(t => {
    const span = document.createElement('span');
    span.className   = 'trait-tag';
    span.textContent = t;
    traitsWrap.appendChild(span);
  });
}

// ── Event listeners ──
btnNext.addEventListener('click', nextQuestion);

document.getElementById('btn-restart').addEventListener('click', () => {
  initQuiz();
  document.getElementById('quiz-anchor').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.hero-cta').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('quiz-anchor').scrollIntoView({ behavior: 'smooth' });
});

// ── Intersection Observer for fade-in elements ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Start ──
initQuiz();

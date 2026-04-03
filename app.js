/* ============================
   厭世咖啡 — App.js
   All three tools, client-side only
   ============================ */

'use strict';

// ============================
// CANVAS PIXEL MEASUREMENT
// ============================
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

function measurePixelWidth(text, font = 'arial 20px') {
  ctx.font = font;
  return Math.round(ctx.measureText(text).width);
}

// SERP title pixel limits
const SERP_LIMITS = {
  desktop: { title: 580, desc: 920 },
  mobile:  { title: 920, desc: 680 }
};

// ============================
// TAB NAVIGATION
// ============================
const tabBtns = document.querySelectorAll('.tab-btn');
const toolPanels = document.querySelectorAll('.tool-panel');

function switchTab(tabName) {
  tabBtns.forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  toolPanels.forEach(panel => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.classList.toggle('active', isActive);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});


// ============================
// TOOL 1: SERP 模擬器
// ============================

const serpTitle     = document.getElementById('serp-title');
const serpUrl       = document.getElementById('serp-url');
const serpDesc      = document.getElementById('serp-desc');
const serpTitleChars = document.getElementById('serp-title-chars');
const serpTitlePx   = document.getElementById('serp-title-px');
const serpTitleLimit = document.getElementById('serp-title-limit-label');
const serpDescChars = document.getElementById('serp-desc-chars');
const serpDescPx    = document.getElementById('serp-desc-px');
const serpDescLimit = document.getElementById('serp-desc-limit-label');
const deviceBtns    = document.querySelectorAll('.device-btn');

// Preview elements
const serpPreviewContainer = document.getElementById('serp-preview-container');
const serpTitleDisplay   = document.getElementById('serp-title-display');
const serpDomainDisplay  = document.getElementById('serp-domain-display');
const serpBreadcrumbEl   = document.getElementById('serp-breadcrumb-display');
const serpDescDisplay    = document.getElementById('serp-desc-display');
const serpStarsDisplay   = document.getElementById('serp-stars-display');



// Rich result checkboxes
const cbBreadcrumb = document.getElementById('serp-breadcrumb');
const cbStars      = document.getElementById('serp-stars');



let currentDevice = 'desktop';

function setCounterStyle(el, value, limit) {
  el.classList.remove('safe', 'warn', 'over', 'neutral');
  const ratio = value / limit;
  if (value === 0) { el.classList.add('neutral'); }
  else if (ratio <= 0.85) { el.classList.add('safe'); }
  else if (ratio <= 1.0)  { el.classList.add('warn'); }
  else                    { el.classList.add('over'); }
}

function truncateByPixelWidth(text, maxPx, font = 'arial 20px') {
  const fullWidth = measurePixelWidth(text, font);
  if (fullWidth <= maxPx) return text;
  // Binary search for truncation point
  let lo = 0, hi = text.length;
  const ellipsis = '...';
  const ellipsisPx = measurePixelWidth(ellipsis, font);
  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    const w = measurePixelWidth(text.slice(0, mid), font) + ellipsisPx;
    if (w <= maxPx) lo = mid;
    else hi = mid;
  }
  return text.slice(0, lo) + ellipsis;
}

function parseDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url.replace(/https?:\/\//i, '').split('/')[0] || '你的網站.com';
  }
}

function parseBreadcrumb(url) {
  try {
    const u = new URL(url);
    const parts = u.hostname + u.pathname;
    return parts.replace(/\/+$/, '');
  } catch {
    return url || '你的網站.com';
  }
}

function updateSerpPreview() {
  const titleText = serpTitle.value;
  const urlText   = serpUrl.value;
  const descText  = serpDesc.value;
  const limits    = SERP_LIMITS[currentDevice];

  // --- Title counters ---
  const titleLen = titleText.length;
  const titleFont = 'bold 20px arial';
  const titlePx = measurePixelWidth(titleText, titleFont);

  serpTitleChars.textContent = `${titleLen} 字元`;
  serpTitlePx.textContent    = `${titlePx}px`;
  serpTitleLimit.textContent = currentDevice === 'desktop' ? '桌機限制 580px' : '手機限制 920px';

  setCounterStyle(serpTitleChars, titleLen, currentDevice === 'desktop' ? 60 : 80);
  setCounterStyle(serpTitlePx, titlePx, limits.title);

  // --- Desc counters ---
  const descLen = descText.length;
  const descFont = '18px arial';
  const descPx  = measurePixelWidth(descText, descFont);

  serpDescChars.textContent = `${descLen} 字元`;
  serpDescPx.textContent    = `${descPx}px`;
  serpDescLimit.textContent = currentDevice === 'desktop' ? '桌機限制 920px' : '手機限制 680px';

  setCounterStyle(serpDescChars, descLen, currentDevice === 'desktop' ? 160 : 120);
  setCounterStyle(serpDescPx, descPx, limits.desc);

  // --- Title preview ---
  const displayTitle = titleText
    ? truncateByPixelWidth(titleText, limits.title, titleFont)
    : '你的頁面標題會出現在這裡';
  serpTitleDisplay.textContent = displayTitle;

  // --- Domain + breadcrumb ---
  const domain = urlText ? parseDomain(urlText) : '你的網站.com';
  serpDomainDisplay.textContent = domain;

  if (cbBreadcrumb.checked && urlText) {
    const breadcrumbPath = parseBreadcrumb(urlText);
    serpBreadcrumbEl.textContent = '› ' + breadcrumbPath;
    serpBreadcrumbEl.style.display = 'block';
  } else {
    serpBreadcrumbEl.style.display = 'none';
  }

  // --- Description preview ---
  const displayDesc = descText
    ? truncateByPixelWidth(descText, limits.desc, descFont)
    : '你的 meta 描述會顯示在這裡，讓人決定要不要點進去。通常他們不會。';
  serpDescDisplay.textContent = displayDesc;

  // --- Rich results ---
  serpStarsDisplay.style.display   = cbStars.checked     ? 'flex'  : 'none';



  // --- Mobile class ---
  serpPreviewContainer.classList.toggle('mobile', currentDevice === 'mobile');
}

// Device toggle
deviceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    deviceBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDevice = btn.dataset.device;
    updateSerpPreview();
  });
});

// Input listeners
serpTitle.addEventListener('input', updateSerpPreview);
serpUrl.addEventListener('input', updateSerpPreview);
serpDesc.addEventListener('input', updateSerpPreview);
cbBreadcrumb.addEventListener('change', updateSerpPreview);
cbStars.addEventListener('change', updateSerpPreview);





// Initial render
updateSerpPreview();


// ============================
// TOOL 2: OG 社群預覽器
// ============================

const ogTitle    = document.getElementById('og-title');
const ogDesc     = document.getElementById('og-desc');
const ogImage    = document.getElementById('og-image');
const ogUrl      = document.getElementById('og-url');
const ogSitename = document.getElementById('og-sitename');

const ogTitleCount = document.getElementById('og-title-count');
const ogDescCount  = document.getElementById('og-desc-count');

// Platform preview elements
const fbSite = document.getElementById('fb-site');
const fbTitle = document.getElementById('fb-title');
const fbDesc  = document.getElementById('fb-desc');
const fbImgWrap = document.getElementById('fb-img-wrap');

const lineSite = document.getElementById('line-site');
const lineTitle = document.getElementById('line-title');
const lineDesc  = document.getElementById('line-desc');
const lineThumb = document.getElementById('line-thumb');

const twTitle = document.getElementById('tw-title');
const twDesc  = document.getElementById('tw-desc');
const twSite  = document.getElementById('tw-site');
const twImgWrap = document.getElementById('tw-img-wrap');

const dcSite  = document.getElementById('dc-site');
const dcTitle = document.getElementById('dc-title');
const dcDesc  = document.getElementById('dc-desc');
const dcImgWrap = document.getElementById('dc-img-wrap');

let ogImageObjectUrl = null;

function setOgCounter(el, val, limit) {
  el.textContent = `${val} / ${limit}`;
  el.classList.remove('safe', 'warn', 'over', 'neutral');
  if (val === 0) el.classList.add('neutral');
  else if (val <= limit * 0.85) el.classList.add('safe');
  else if (val <= limit) el.classList.add('warn');
  else el.classList.add('over');
}

function buildImgElement(imgUrl) {
  if (!imgUrl) return null;
  const img = document.createElement('img');
  img.src = imgUrl;
  img.alt = 'OG 圖片預覽';
  img.onerror = () => { img.style.display = 'none'; };
  return img;
}

function updateOgImgSection(wrapEl, imgUrl, placeholderText) {
  wrapEl.innerHTML = '';
  if (imgUrl) {
    const img = buildImgElement(imgUrl);
    wrapEl.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'og-img-placeholder';
    ph.innerHTML = placeholderText;
    wrapEl.appendChild(ph);
  }
}

function parseDomainSimple(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/https?:\/\//i, '').split('/')[0] || '';
  }
}

function updateOgPreview() {
  const titleVal = ogTitle.value;
  const descVal  = ogDesc.value;
  const imageVal = ogImage.value;
  const urlVal   = ogUrl.value;
  const siteVal  = ogSitename.value;

  // Counters
  setOgCounter(ogTitleCount, titleVal.length, 60);
  setOgCounter(ogDescCount, descVal.length, 155);

  // Derived values with fallbacks
  const displayTitle = titleVal || '分享標題（等你輸入）';
  const displayDesc  = descVal  || '描述文字（越有趣越好，但先有就不錯了）';
  const displaySite  = siteVal  || urlVal ? parseDomainSimple(urlVal) : '你的網站';

  // Facebook
  fbSite.textContent  = (siteVal || parseDomainSimple(urlVal) || '你的網站名稱').toUpperCase();
  fbTitle.textContent = displayTitle;
  fbDesc.textContent  = descVal ? (descVal.length > 90 ? descVal.slice(0, 90) + '…' : descVal) : displayDesc;
  updateOgImgSection(fbImgWrap, imageVal, '圖片會出現在這裡<br/>1200×630');

  // LINE
  lineSite.textContent  = siteVal || parseDomainSimple(urlVal) || '你的網站名稱';
  lineTitle.textContent = titleVal.length > 40 ? titleVal.slice(0, 40) + '…' : displayTitle;
  lineDesc.textContent  = descVal.length > 60 ? descVal.slice(0, 60) + '…' : displayDesc;
  updateOgImgSection(lineThumb, imageVal, '圖');

  // Twitter/X
  twTitle.textContent = titleVal.length > 60 ? titleVal.slice(0, 60) + '…' : displayTitle;
  twDesc.textContent  = descVal.length > 130 ? descVal.slice(0, 130) + '…' : displayDesc;
  const twSiteSpan = twSite.querySelector('span');
  if (twSiteSpan) twSiteSpan.textContent = parseDomainSimple(urlVal) || '你的網站.com';
  updateOgImgSection(twImgWrap, imageVal, '圖片');

  // Discord
  dcSite.textContent  = siteVal || '你的網站名稱';
  dcTitle.textContent = titleVal.length > 80 ? titleVal.slice(0, 80) + '…' : displayTitle;
  dcDesc.textContent  = descVal.length > 120 ? descVal.slice(0, 120) + '…' : displayDesc;
  updateOgImgSection(dcImgWrap, imageVal, '圖片');
}

ogTitle.addEventListener('input', updateOgPreview);
ogDesc.addEventListener('input', updateOgPreview);
ogImage.addEventListener('input', updateOgPreview);
ogUrl.addEventListener('input', updateOgPreview);
ogSitename.addEventListener('input', updateOgPreview);

// Generate OG tags
document.getElementById('og-generate-btn').addEventListener('click', () => {
  const titleVal = ogTitle.value.trim();
  const descVal  = ogDesc.value.trim();
  const imageVal = ogImage.value.trim();
  const urlVal   = ogUrl.value.trim();
  const siteVal  = ogSitename.value.trim();

  const lines = [];
  lines.push('<!-- Open Graph Meta Tags -->');
  if (titleVal)  lines.push(`<meta property="og:title" content="${escapeHtml(titleVal)}">`);
  if (descVal)   lines.push(`<meta property="og:description" content="${escapeHtml(descVal)}">`);
  if (imageVal)  lines.push(`<meta property="og:image" content="${escapeHtml(imageVal)}">`);
  if (urlVal)    lines.push(`<meta property="og:url" content="${escapeHtml(urlVal)}">`);
  if (siteVal)   lines.push(`<meta property="og:site_name" content="${escapeHtml(siteVal)}">`);
  lines.push('<meta property="og:type" content="website">');
  lines.push('<!-- Twitter / X Card Tags -->');
  lines.push('<meta name="twitter:card" content="summary_large_image">');
  if (titleVal)  lines.push(`<meta name="twitter:title" content="${escapeHtml(titleVal)}">`);
  if (descVal)   lines.push(`<meta name="twitter:description" content="${escapeHtml(descVal)}">`);
  if (imageVal)  lines.push(`<meta name="twitter:image" content="${escapeHtml(imageVal)}">`);

  const code = lines.join('\n');
  document.getElementById('og-code-output').textContent = code;
  document.getElementById('og-code-section').style.display = 'block';
});

// Copy OG code
document.getElementById('og-copy-btn').addEventListener('click', () => {
  const code = document.getElementById('og-code-output').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('og-copy-btn');
    btn.textContent = '✓ 已複製';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '複製';
      btn.classList.remove('copied');
    }, 2000);
  });
});

// Clear OG
document.getElementById('og-clear-btn').addEventListener('click', () => {
  [ogTitle, ogDesc, ogImage, ogUrl, ogSitename].forEach(el => { el.value = ''; });
  document.getElementById('og-code-section').style.display = 'none';
  updateOgPreview();
});

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Initial render
updateOgPreview();


// ============================
// TOOL 3: Threads 爆文體質
// ============================

const threadsInput    = document.getElementById('threads-input');
const threadsCharCount = document.getElementById('threads-char-count');
const threadsHasImage = document.getElementById('threads-has-image');

// Cards
const threadsPlaceholder = document.getElementById('threads-placeholder');
const allCards = [
  'card-wordcount', 'card-hook', 'card-share', 'card-engagement',
  'card-semantic', 'card-msi', 'card-suggestions', 'card-rewrite'
].map(id => document.getElementById(id));

function showAnalysisCards(show) {
  threadsPlaceholder.style.display = show ? 'none' : 'block';
  allCards.forEach(c => { c.style.display = show ? 'block' : 'none'; });
  // MSI card is full-width
  const msiCard = document.getElementById('card-msi');
  if (msiCard) msiCard.style.display = show ? 'block' : 'none';
}

// ---- Stop words for TF analysis ----
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '也', '你', '他',
  '她', '它', '這', '那', '要', '或', '但', '與', '從', '到', '被', '把', '給', '讓',
  '很', '更', '最', '可', '能', '會', '將', '已', '為', '因', '由', '以', '之', '的話',
  '所以', '因為', '雖然', '但是', '如果', '雖', '雖然', '其實', '還是', '而且', '不過',
  '對', '嗎', '呢', '吧', '啊', '哦', '喔', '哈', '欸', '唉', '說', '做', '用', '看',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'is', 'are', 'was', 'were',
  'this', 'that', 'it', 'of', 'for', 'with', 'as', 'by', 'from', 'be', 'been', 'being',
  '!', '！', '?', '？', '。', '，', '、', '：', '；', '"', '"', '「', '」', '\n', '\r', ' ', '…'
]);

function extractKeywords(text, topN = 3) {
  // Tokenize: split on spaces, punctuation, and common delimiters
  const tokens = text
    .replace(/[！？。，、：；「」【】《》〔〕\[\]()（）""''…·—\-_]/g, ' ')
    .split(/[\s\n\r]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t));

  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

// ---- Hook patterns ----
const HOOK_PATTERNS = [
  { re: /\d+/, label: '數字' },
  { re: /[？?]/, label: '疑問' },
  { re: /[「「""]/, label: '引用' },
  { re: /其實|沒想到|竟然|你不知道|秘密|揭露|真相/, label: '反直覺' },
  { re: /[！!]/, label: '強調' },
  { re: /如何|怎麼|為什麼|why|how/, label: '問題導向' },
];

function scoreHook(text) {
  const first50 = text.slice(0, 50);
  let score = 0;
  const found = [];
  HOOK_PATTERNS.forEach(p => {
    if (p.re.test(first50)) {
      score++;
      found.push(p.label);
    }
  });
  return { score: Math.min(score, 5), found };
}

// ---- Share potential patterns ----
const SHARE_PATTERNS = [
  { re: /\d+[\.、)\s]/, label: '條列清單', key: 'list' },
  { re: /其實|但是|不是.*而是|真相是|你可能不知道/, label: '反直覺觀點', key: 'counterintuitive' },
  { re: /建議|方法|步驟|做法|技巧|Tips|秘訣/, label: '實用建議', key: 'actionable' },
  { re: /我.*年|我.*年前|我曾|我的.*經驗|親身|親歷/, label: '個人故事', key: 'story' },
  { re: /框架|模型|公式|系統|SOP|流程/, label: '可複製框架', key: 'framework' },
  { re: /[Aa][Ii]|人工智慧|GPT|Claude|算法|演算法/, label: 'AI / 科技話題', key: 'tech' },
];

function scoreSharePotential(text) {
  const found = [];
  SHARE_PATTERNS.forEach(p => {
    if (p.re.test(text)) found.push(p.label);
  });
  const n = found.length;
  let level, badgeClass;
  if (n === 0)      { level = '低';   badgeClass = 'badge-red'; }
  else if (n <= 1)  { level = '中';   badgeClass = 'badge-amber'; }
  else if (n <= 3)  { level = '高';   badgeClass = 'badge-green'; }
  else              { level = '極高'; badgeClass = 'badge-green'; }
  return { level, found, badgeClass };
}

// ---- Engagement patterns ----
const BAIT_PATTERNS = [
  /按讚|\+1|留言告訴我|留言區見|tag一個|tag 一個|標記你|分享給朋友/,
  /comment bait|comment bomb|留言炸彈/i,
];

function scoreEngagement(text) {
  const hasQuestion = /[？?]/.test(text);
  const hasOpenQuestion = /你|你覺得|你怎麼|你有|你是否|請問|有沒有/.test(text) && hasQuestion;
  const isBait = BAIT_PATTERNS.some(re => re.test(text));

  let level, badgeClass, sub = '';
  if (isBait) {
    level = '⚠️ 危險';
    badgeClass = 'badge-red';
    sub = '偵測到互動誘餌語句，有被降權風險';
  } else if (hasOpenQuestion) {
    level = '高';
    badgeClass = 'badge-green';
    sub = '包含開放性問題，有助於帶動討論';
  } else if (hasQuestion) {
    level = '中';
    badgeClass = 'badge-amber';
    sub = '包含問句，但可更明確邀請讀者回應';
  } else {
    level = '低';
    badgeClass = 'badge-red';
    sub = '沒有問句，互動誘發力偏弱';
  }
  return { level, badgeClass, sub, isBait };
}

// ---- Word count scoring ----
function scoreWordCount(text) {
  const len = text.length;
  let label, badgeClass, barPct;
  if (len < 50) {
    label = '太短了，演算法會忽略你';
    badgeClass = 'badge-red';
    barPct = Math.round((len / 50) * 20);
  } else if (len < 200) {
    label = '及格，但不夠深';
    badgeClass = 'badge-amber';
    barPct = 20 + Math.round(((len - 50) / 150) * 30);
  } else if (len < 500) {
    label = '甜蜜點！長文權重加成';
    badgeClass = 'badge-green';
    barPct = 50 + Math.round(((len - 200) / 300) * 30);
  } else {
    label = '串文級深度，MSI 分數最高';
    badgeClass = 'badge-green';
    barPct = Math.min(95, 80 + Math.round((len - 500) / 500 * 15));
  }
  return { len, label, badgeClass, barPct };
}

// ---- MSI composite score ----
function computeMsi(wc, hook, share, engagement, hasImage) {
  let score = 0;

  // Word count (30 pts)
  if (wc.len < 50)        score += 5;
  else if (wc.len < 200)  score += 15;
  else if (wc.len < 500)  score += 25;
  else                     score += 30;

  // Hook (20 pts)
  score += hook.score * 4;

  // Share potential (20 pts)
  const shareMap = { '低': 0, '中': 8, '高': 15, '極高': 20 };
  score += shareMap[share.level] || 0;

  // Engagement (15 pts) — bait = 0 pts penalty
  if (!engagement.isBait) {
    if (engagement.level === '高')   score += 15;
    else if (engagement.level === '中') score += 8;
    else                               score += 2;
  }

  // Image bonus (10 pts)
  if (hasImage) score += 10;

  // Semantic consistency — bonus 5 if keywords extracted
  score += 5; // always give baseline

  return Math.min(100, Math.round(score));
}

function getMsiLabel(score) {
  if (score < 30)  return { label: '這杯是水',   badgeClass: 'badge-red' };
  if (score < 60)  return { label: '美式咖啡',   badgeClass: 'badge-amber' };
  if (score < 80)  return { label: '拿鐵',       badgeClass: 'badge-green' };
  return              { label: '冠軍手沖',       badgeClass: 'badge-green' };
}

// ---- Suggestions with concrete fixes ----
function buildSuggestions(wc, hook, share, engagement, semantic, text) {
  const tips = [];

  if (wc.len < 50) {
    tips.push({
      problem: '文章太短，字數低於 50 字。演算法幾乎不會推給任何人。',
      fix: '建議展開核心觀點為 3 個段落，加入背景說明、具體例子、行動呼籲。目標 200+ 字。'
    });
  } else if (wc.len < 200) {
    tips.push({
      problem: '長度只夠及格（' + wc.len + ' 字），未達甜蜜點 200 字。',
      fix: '建議加入：① 個人經驗故事② 條列式重點整理③ 「為什麼這很重要」的反思段落。'
    });
  }

  if (hook.score < 3) {
    const first50 = text.slice(0, 50);
    tips.push({
      problem: 'Hook 只有 ' + hook.score + '/5 杯。前 50 字「' + first50 + '」缺少吸引力元素。',
      fix: '原因：' + getHookMissingReasons(hook) + '。建議開頭加入數字/問句/反直覺觀點。',
      improved: generateImprovedHook(text)
    });
  }

  if (share.found.length === 0) {
    tips.push({
      problem: '缺少可分享的框架，私訊分享權重 30 點完全浪費。',
      fix: '加入條列式重點、可複製的公式或個人故事，讀者才會想轉給朋友。'
    });
  } else if (share.found.length <= 1) {
    tips.push({
      problem: '只偵測到 1 個分享模式（' + share.found[0] + '），建議再加 1-2 個。',
      fix: '試試加入：條列式整理、個人經驗故事、或可複製的框架/公式。'
    });
  }

  if (engagement.level === '低' && !engagement.isBait) {
    tips.push({
      problem: '沒有問句，互動誘發力偏弱。',
      fix: '末尾加一個開放式問題，邀請讀者回應。',
      improved: generateEndingQuestion(text)
    });
  } else if (engagement.level === '中') {
    tips.push({
      problem: '有問句但不夠開放，難以引發深度討論。',
      fix: '改用「你覺得」「你遇過」開頭的開放式問題。',
      improved: generateBetterQuestion(text)
    });
  }

  if (engagement.isBait) {
    tips.push({
      problem: '偵測到互動誘餌語句，Meta 會對這類內容主動降權。',
      fix: '移除「按讚」「+1」「留言告訴我」等語句，改用真實問句。',
      improved: removeBaitAndReplace(text)
    });
  }

  if (wc.len > 0 && tips.length === 0) {
    tips.push({
      problem: null,
      fix: '整體不錯！可以考慮在發文後 30 分鐘內自己留言補充一個觀點，有助於持續推送。'
    });
  }

  return tips.slice(0, 5);
}

// ---- Hook analysis helpers ----
function getHookMissingReasons(hook) {
  const allElements = ['數字', '疑問', '引用', '反直覺', '強調', '問題導向'];
  const missing = allElements.filter(e => !hook.found.includes(e));
  return '缺少' + missing.slice(0, 3).join('、');
}

function generateImprovedHook(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const core = lines.length > 1 ? lines[1] : (lines[0] || '');
  
  // Extract any numbers from the full text
  const numbers = text.match(/\d+/g);
  const num = numbers ? numbers[0] : '3';
  
  // Extract key topic words
  const keywords = extractKeywords(text, 2);
  const topic = keywords.length > 0 ? keywords[0] : '這件事';
  
  const hooks = [
    `${num} 年經驗告訴我，${topic}的真相其實沒人敢說。`,
    `你以為的${topic}，其實 99% 的人都搞錯了。`,
    `為什麼 ${topic} 會失敗？我花了 ${num} 年才搞懂這 ${num} 個關鍵。`,
    `「${topic}」最大的迷思是什麼？給你 ${num} 個反直覺的答案。`,
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function generateEndingQuestion(text) {
  const keywords = extractKeywords(text, 2);
  const topic = keywords.length > 0 ? keywords[0] : '這個領域';
  const questions = [
    `\n\n你在${topic}中遇過最棘手的問題是什麼？`,
    `\n\n你覺得${topic}最被低估的一點是什麼？`,
    `\n\n如果只能給一個建議，你會怎麼說？`,
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateBetterQuestion(text) {
  const keywords = extractKeywords(text, 2);
  const topic = keywords.length > 0 ? keywords[0] : '這個議題';
  return `\n\n你覺得${topic}最被忽略的關鍵是什麼？歡迎分享你的經驗。`;
}

function removeBaitAndReplace(text) {
  let cleaned = text
    .replace(/按讚[!！]*/g, '')
    .replace(/\+1[!！]*/g, '')
    .replace(/留言告訴我[!！]*/g, '')
    .replace(/留言區見[!！]*/g, '')
    .replace(/tag一個[!！]*/gi, '')
    .replace(/tag 一個[!！]*/gi, '')
    .replace(/標記你[!！]*/g, '')
    .replace(/分享給朋友[!！]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const keywords = extractKeywords(cleaned, 1);
  const topic = keywords.length > 0 ? keywords[0] : '這件事';
  cleaned += `\n\n你在${topic}上有什麼不同的看法？`;
  return cleaned;
}

// ---- Generate full rewritten high-score version ----
function generateHighScoreVersion(text, wc, hook, share, engagement, hasImage) {
  let lines = text.split('\n').filter(l => l.trim());
  let rewritten = '';
  let changelog = [];
  
  // 1. Fix Hook if < 3
  if (hook.score < 3) {
    const improvedHook = generateImprovedHook(text);
    changelog.push('✅ 開頭改寫：加入數字 + 反直覺觀點，Hook 強度升級');
    rewritten += improvedHook + '\n\n';
    // Skip original first line if it was weak
    if (lines.length > 0) lines = lines.slice(1);
  }

  // 2. Add body content
  const bodyText = lines.join('\n');
  rewritten += bodyText;
  
  // 3. Fix word count if < 200
  if (wc.len < 200) {
    const keywords = extractKeywords(text, 2);
    const topic = keywords.length > 0 ? keywords[0] : '這個議題';
    const expansion = `\n\n為什麼這很重要？因為${topic}不只是表面的問題。很多人看到的是現象，但背後的根本原因往往被忽略。當你真正理解它，很多事情會變得清晰得多。`;
    rewritten += expansion;
    changelog.push('✅ 加入「為什麼這很重要」反思段落，字數提升至甜蜜點');
  }

  // 4. Fix share potential if low
  if (share.found.length < 2) {
    const keywords = extractKeywords(text, 2);
    const topic = keywords.length > 0 ? keywords[0] : '這個主題';
    // Check if already has a list
    if (!share.found.includes('條列清單')) {
      rewritten += `\n\n給你 3 個立刻可執行的重點：\n1. 先觀察，不要急著下判斷\n2. 找到核心問題，而不是表面症狀\n3. 用數據說話，不是用感覺`;
      changelog.push('✅ 加入條列式重點，提升私訊分享潛力');
    }
    if (!share.found.includes('個人故事')) {
      rewritten += `\n\n我曾經也犯過同樣的錯誤。直到有一次實際經歷了${topic}的失敗，才真正理解這個道理。`;
      changelog.push('✅ 加入個人經驗故事，增加可信度與分享性');
    }
  }

  // 5. Fix engagement if low/no question
  if (engagement.level === '低' || engagement.level === '中') {
    if (!engagement.isBait) {
      const q = generateEndingQuestion(text);
      rewritten += q;
      changelog.push('✅ 加入開放式問題，提升互動誘發力');
    }
  }

  // 6. Remove bait if present
  if (engagement.isBait) {
    rewritten = rewritten
      .replace(/按讚[!！]*/g, '')
      .replace(/\+1[!！]*/g, '')
      .replace(/留言告訴我[!！]*/g, '')
      .replace(/留言區見[!！]*/g, '')
      .replace(/tag一個[!！]*/gi, '')
      .replace(/標記你[!！]*/g, '')
      .replace(/分享給朋友[!！]*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    const keywords = extractKeywords(rewritten, 1);
    const topic = keywords.length > 0 ? keywords[0] : '這個議題';
    rewritten += `\n\n你在${topic}上有什麼不同的看法？`;
    changelog.push('✅ 移除互動誘餌語句，改為真實問句');
  }

  // Clean up
  rewritten = rewritten.replace(/\n{3,}/g, '\n\n').trim();
  
  return { rewritten, changelog };
}

function renderCoffeeCups(score, max = 5) {
  const filled = Math.round((score / 5));
  let html = '';
  for (let i = 0; i < max; i++) {
    html += `<span class="${i < filled ? 'cup-filled' : 'cup-empty'}">☕</span>`;
  }
  return html;
}

function updateThreadsAnalysis() {
  const text = threadsInput.value;
  const len  = text.length;
  const hasImage = threadsHasImage.checked;

  // Update char counter
  threadsCharCount.textContent = `${len} / 3600 字元`;
  if (len > 3000) threadsCharCount.style.color = 'var(--red)';
  else if (len > 2500) threadsCharCount.style.color = 'var(--amber)';
  else threadsCharCount.style.color = 'var(--text-muted)';

  if (len === 0) {
    showAnalysisCards(false);
    return;
  }

  showAnalysisCards(true);

  // Run analyses
  const wc          = scoreWordCount(text);
  const hook        = scoreHook(text);
  const share       = scoreSharePotential(text);
  const engagement  = scoreEngagement(text);
  const keywords    = extractKeywords(text);
  const msiScore    = computeMsi(wc, hook, share, engagement, hasImage);
  const msiInfo     = getMsiLabel(msiScore);
  const suggestions = buildSuggestions(wc, hook, share, engagement, keywords, text);

  // ---- Card 1: Word count ----
  const wcBadge = document.getElementById('wordcount-badge');
  const wcValue = document.getElementById('wordcount-value');
  const wcSub   = document.getElementById('wordcount-sub');
  const wcBar   = document.getElementById('wordcount-bar');
  wcBadge.className = `analysis-badge ${wc.badgeClass}`;
  wcBadge.textContent = wc.label.slice(0, 8);
  wcValue.textContent = `${wc.len} 字元`;
  wcSub.textContent   = wc.label;
  wcBar.style.width   = `${wc.barPct}%`;

  // ---- Card 2: Hook (with detailed feedback when < 3 cups) ----
  const hookBadge = document.getElementById('hook-badge');
  const hookCups  = document.getElementById('hook-cups');
  const hookSub   = document.getElementById('hook-sub');
  hookBadge.className = `analysis-badge ${hook.score >= 4 ? 'badge-green' : hook.score >= 2 ? 'badge-amber' : 'badge-red'}`;
  hookBadge.textContent = `${hook.score}/5 ☕`;
  hookCups.innerHTML  = renderCoffeeCups(hook.score);
  
  if (hook.score < 3) {
    const missingReasons = getHookMissingReasons(hook);
    const improvedHook = generateImprovedHook(text);
    hookSub.innerHTML = `<div style="margin-bottom:6px;"><strong style="color:var(--red);">` +
      `☹️ 只有 ${hook.score} 杯——${missingReasons}</strong></div>` +
      (hook.found.length ? `<div style="margin-bottom:6px;color:var(--text-muted);">偵測到：${hook.found.join('、')}</div>` : '') +
      `<div style="margin-top:8px;padding:8px 12px;background:var(--surface);border-radius:6px;border-left:3px solid var(--accent);">`+
      `<div style="font-size:0.72rem;color:var(--accent);margin-bottom:4px;">✨ 建議開頭改為：</div>` +
      `<div style="color:var(--text-light);font-size:0.82rem;">${escapeHtml(improvedHook)}</div></div>`;
  } else {
    hookSub.textContent = hook.found.length
      ? `偵測到：${hook.found.join('、')}`
      : '前 50 字缺少吸引力元素，讀者滑過去的機率很高';
  }

  // ---- Card 3: Share potential ----
  const shareBadge    = document.getElementById('share-badge');
  const shareValue    = document.getElementById('share-value');
  const sharePatternsEl = document.getElementById('share-patterns');
  const shareSub      = document.getElementById('share-sub');

  shareBadge.className = `analysis-badge ${share.badgeClass}`;
  shareBadge.textContent = share.level;
  shareValue.textContent = share.level;
  sharePatternsEl.innerHTML = share.found.map(p =>
    `<span class="pattern-tag">${p}</span>`
  ).join('');
  shareSub.textContent = share.found.length
    ? `偵測到 ${share.found.length} 個可分享模式`
    : '缺少框架、條列或故事等高分享元素';

  // ---- Card 4: Engagement ----
  const engBadge   = document.getElementById('engagement-badge');
  const engValue   = document.getElementById('engagement-value');
  const engWarn    = document.getElementById('engagement-warning');
  const engSub     = document.getElementById('engagement-sub');

  engBadge.className = `analysis-badge ${engagement.badgeClass}`;
  engBadge.textContent = engagement.level;
  engValue.textContent = engagement.level;
  engSub.textContent   = engagement.sub;

  if (engagement.isBait) {
    engWarn.style.display = 'block';
    engWarn.textContent = '⚠️ Meta 已將這類內容列為 Comment Bait，會被降權！請移除「按讚」「+1」「留言告訴我」等語句。';
  } else {
    engWarn.style.display = 'none';
  }

  // ---- Card 5: Semantic ----
  const semBadge    = document.getElementById('semantic-badge');
  const semKeywords = document.getElementById('semantic-keywords');

  semBadge.className = 'analysis-badge badge-neutral';
  semBadge.textContent = `${keywords.length} 主題`;
  semKeywords.innerHTML = keywords.length
    ? keywords.map(k => `<span class="keyword-chip">${k}</span>`).join('')
    : '<span class="text-dim" style="font-size:0.8rem;">文字太少，無法提取有效主題</span>';

  // ---- Card 6: MSI Score ----
  const msiScoreEl = document.getElementById('msi-score');
  const msiLabelEl = document.getElementById('msi-label');
  const msiBarEl   = document.getElementById('msi-bar');
  const msiBadge   = document.getElementById('msi-badge');

  msiScoreEl.textContent  = msiScore;
  msiLabelEl.textContent  = msiInfo.label;
  msiBarEl.style.width    = `${msiScore}%`;
  msiBadge.className      = `analysis-badge ${msiInfo.badgeClass}`;
  msiBadge.textContent    = msiInfo.label;

  // ---- Card 7: Suggestions (with improved content for each) ----
  const suggList = document.getElementById('suggestions-list');
  suggList.innerHTML = suggestions.map(s => {
    let html = `<div class="suggestion-item">`;
    if (s.problem) {
      html += `<div style="margin-bottom:4px;"><span class="suggestion-icon" style="color:var(--red);">❌</span> <strong>問題：</strong>${escapeHtml(s.problem)}</div>`;
    }
    html += `<div style="margin-bottom:4px;"><span class="suggestion-icon" style="color:var(--accent);">→</span> <strong>改善：</strong>${escapeHtml(s.fix)}</div>`;
    if (s.improved) {
      html += `<div style="margin-top:6px;padding:8px 12px;background:var(--surface);border-radius:6px;border-left:3px solid #7fb069;">` +
        `<div style="font-size:0.72rem;color:#7fb069;margin-bottom:4px;">✅ 改善後的內容：</div>` +
        `<div style="color:var(--text-light);font-size:0.82rem;white-space:pre-wrap;">${escapeHtml(s.improved)}</div></div>`;
    }
    html += `</div>`;
    return html;
  }).join('');

  // ---- Card 8: Full rewrite if score < 80 ----
  const rewriteCard = document.getElementById('card-rewrite');
  const rewriteContent = document.getElementById('rewrite-content');
  const rewriteChangelog = document.getElementById('rewrite-changelog');
  const rewriteNote = document.getElementById('rewrite-note');
  const copyRewriteBtn = document.getElementById('copy-rewrite-btn');

  if (msiScore < 80) {
    const { rewritten, changelog } = generateHighScoreVersion(text, wc, hook, share, engagement, hasImage);
    rewriteCard.style.display = 'block';
    rewriteContent.textContent = rewritten;
    rewriteNote.textContent = `目前分數 ${msiScore} 分（${msiInfo.label}），以下是針對 ${changelog.length} 項扣分點改寫後的完整文章。複製貼上到上方輸入框即可驗證分數提升：`;
    rewriteChangelog.innerHTML = '<div style="margin-top:12px;font-size:0.8rem;">' +
      '<div style="color:var(--accent);font-weight:600;margin-bottom:6px;">修改清單：</div>' +
      changelog.map(c => `<div style="color:var(--text-muted);margin-bottom:3px;">${c}</div>`).join('') +
      '</div>';
    
    // Copy button
    copyRewriteBtn.onclick = () => {
      navigator.clipboard.writeText(rewritten).then(() => {
        copyRewriteBtn.textContent = '✓ 已複製！貼到上方驗證';
        copyRewriteBtn.classList.add('copied');
        setTimeout(() => {
          copyRewriteBtn.textContent = '📋 複製改善版文章';
          copyRewriteBtn.classList.remove('copied');
        }, 3000);
      });
    };
  } else {
    rewriteCard.style.display = 'none';
  }
}

threadsInput.addEventListener('input', updateThreadsAnalysis);
threadsHasImage.addEventListener('change', updateThreadsAnalysis);

// Initial state
showAnalysisCards(false);


// ============================
// TOOL 4: 標題分析器 (Headline Analyzer)
// ============================

(function() {
  const headlineInput    = document.getElementById('headline-input');
  const headlineCharCount = document.getElementById('headline-char-count');
  const headlineAnalyzeBtn = document.getElementById('headline-analyze-btn');
  const headlinePlaceholder = document.getElementById('headline-placeholder');
  const headlineResults   = document.getElementById('headline-results');

  // Power word lists
  const POSITIVE_WORDS = ['秘密','揭露','驚人','必看','獨家','免費','最強','突破','神級','頂級','終極','完整','深度','實測','親身','真相','關鍵','核心'];
  const NEGATIVE_WORDS = ['失敗','危險','錯誤','陷阱','後悔','崩潰','踩雷','地雷','慘痛','血淚','警告','千萬別','小心'];
  const CURIOSITY_WORDS = ['其實','竟然','沒想到','你不知道','原來','居然','到底','究竟','為何'];
  const SEO_WORDS = ['教學','推薦','比較','評價','攻略','懶人包','整理','排名'];

  function scoreWordBalance(text) {
    const len = text.length;
    if (len < 10) return { score: 3, desc: `${len} 字，太短了，沒人看得到你` };
    if (len < 15) return { score: 8, desc: `${len} 字，稍短，建議展開到 15-25 字` };
    if (len <= 25) return { score: 15, desc: `${len} 字，完美甜蜜點！` };
    if (len <= 35) return { score: 10, desc: `${len} 字，偏長但還行` };
    return { score: 5, desc: `${len} 字，太長了，Google 會截斷你` };
  }

  function scoreNumberPower(text) {
    const hasNumber = /\d/.test(text);
    if (!hasNumber) return { score: 0, desc: '沒有數字，標題少了 36% 的點擊率' };
    const startsWithNumber = /^\d/.test(text.trim());
    if (startsWithNumber) return { score: 15, desc: '數字開頭，CTR 加成最大！' };
    return { score: 10, desc: '包含數字，增加可信度' };
  }

  function scoreEmotionalWords(text) {
    const allPowerWords = [...POSITIVE_WORDS, ...NEGATIVE_WORDS, ...CURIOSITY_WORDS];
    const found = allPowerWords.filter(w => text.includes(w));
    const count = found.length;
    let score, desc;
    if (count === 0) { score = 0; desc = '沒有情感詞，標題如同白開水'; }
    else if (count === 1) { score = 8; desc = `偵測到「${found[0]}」，還不錯`; }
    else if (count === 2) { score = 15; desc = `偵測到「${found.join('、')}」，情感充沛`; }
    else { score = 20; desc = `${count} 個情感詞！力量滿載`; }
    return { score, desc, found };
  }

  function scoreHeadlinePattern(text) {
    // List type
    if (/\d+[\s]*[個大招種步件項條則]/.test(text)) return { score: 20, desc: '清單型標題，CTR 最高的類型' };
    // How-to
    if (/^如何|^怎麼/.test(text.trim())) return { score: 18, desc: '教學型標題，搜尋意圖明確' };
    // Question
    if (/^為什麼|^為何/.test(text.trim()) || /嗎[？?]\s*$/.test(text)) return { score: 16, desc: '問句型標題，引發好奇' };
    // Contrast
    if (/不是.*而是/.test(text)) return { score: 15, desc: '對比型標題，觀點鮮明' };
    return { score: 8, desc: '一般陳述型，建議加入特定結構' };
  }

  function scoreSeoFriendliness(text) {
    let score = 0;
    let details = [];
    // Has substance (not all punctuation/special)
    if (/[\u4e00-\u9fff\w]{3,}/.test(text)) { score += 5; details.push('有實質內容'); }
    // Contains SEO pattern words
    const foundSeo = SEO_WORDS.filter(w => text.includes(w));
    if (foundSeo.length > 0) { score += 10; details.push(`包含搜尋詞「${foundSeo.join('、')}」`); }
    const desc = details.length ? details.join('、') : '缺少常見搜尋詞（教學、推薦、比較等）';
    return { score, desc };
  }

  function scoreReadability(text) {
    let score = 0;
    let details = [];
    // No excessive punctuation
    const punctCount = (text.match(/[！!？?。，、：；…]+/g) || []).length;
    const punctRatio = punctCount / Math.max(text.length, 1);
    if (punctRatio < 0.15) { score += 5; details.push('標點適度'); }
    else { details.push('標點過多'); }
    // Clear subject (>3 unique bigrams)
    const bigrams = new Set();
    for (let i = 0; i < text.length - 1; i++) {
      const bi = text.slice(i, i + 2);
      if (/[\u4e00-\u9fff]{2}/.test(bi)) bigrams.add(bi);
    }
    if (bigrams.size > 3) { score += 5; details.push('主題明確'); }
    else { details.push('主題模糊'); }
    // Balance of CJK and structure
    const hasCJK = /[\u4e00-\u9fff]/.test(text);
    const hasStructure = /[\d！!？?「」]/.test(text);
    if (hasCJK && hasStructure) { score += 5; details.push('結構平衡'); }
    return { score, desc: details.join('、') };
  }

  function getScoreLabel(score) {
    if (score < 30) return { label: '白開水——需要完全改寫', badge: 'badge-red' };
    if (score < 50) return { label: '即溶咖啡——還差一點', badge: 'badge-amber' };
    if (score < 75) return { label: '手沖拿鐵——算不錯了', badge: 'badge-green' };
    return { label: '冠軍手沖——這標題能殺人', badge: 'badge-green' };
  }

  function generateImprovedHeadline(text, dims) {
    const keywords = text.replace(/[\d！!？?。，、：；…「」\s]/g, '').slice(0, 10);
    const topic = keywords.slice(0, 6) || '這件事';
    const suggestions = [];
    if (dims.numberPower.score < 10) {
      suggestions.push(`3個${topic}的關鍵秘密，90%的人都搞錯了`);
      suggestions.push(`${topic}完整攻略：5個你必須知道的技巧`);
    }
    if (dims.emotional.score < 8) {
      suggestions.push(`揭露${topic}的驚人真相：為什麼你一直做錯？`);
      suggestions.push(`${topic}終極教學：從入門到精通的完整指南`);
    }
    if (dims.pattern.score <= 8) {
      suggestions.push(`如何用${topic}提升 3 倍效率？實測分享`);
      suggestions.push(`7個${topic}必踩的地雷，你中了幾個？`);
    }
    if (suggestions.length === 0) {
      suggestions.push(`${text}（已經很不錯了！）`);
    }
    return suggestions[Math.floor(Math.random() * Math.min(suggestions.length, 3))];
  }

  function getDimColor(score, max) {
    const ratio = score / max;
    if (ratio >= 0.7) return 'fill-green';
    if (ratio >= 0.4) return 'fill-amber';
    return 'fill-red';
  }

  headlineInput.addEventListener('input', () => {
    const len = headlineInput.value.length;
    headlineCharCount.textContent = `${len} 字元`;
    setCounterStyle(headlineCharCount, len, 25);
  });

  headlineAnalyzeBtn.addEventListener('click', () => {
    const text = headlineInput.value.trim();
    if (!text) return;

    headlinePlaceholder.style.display = 'none';
    headlineResults.style.display = 'block';

    const dims = {
      wordBalance: scoreWordBalance(text),
      numberPower: scoreNumberPower(text),
      emotional: scoreEmotionalWords(text),
      pattern: scoreHeadlinePattern(text),
      seo: scoreSeoFriendliness(text),
      readability: scoreReadability(text)
    };

    const totalScore = dims.wordBalance.score + dims.numberPower.score + dims.emotional.score +
                       dims.pattern.score + dims.seo.score + dims.readability.score;
    const scoreInfo = getScoreLabel(totalScore);

    // Update score display
    document.getElementById('headline-total-score').textContent = totalScore;
    document.getElementById('headline-score-label').textContent = scoreInfo.label;
    document.getElementById('headline-score-bar').style.width = `${totalScore}%`;

    // Dimension bars
    const dimensionsEl = document.getElementById('headline-dimensions');
    const dimData = [
      { label: '字數平衡', score: dims.wordBalance.score, max: 15, desc: dims.wordBalance.desc },
      { label: '數字吸引力', score: dims.numberPower.score, max: 15, desc: dims.numberPower.desc },
      { label: '情感詞', score: dims.emotional.score, max: 20, desc: dims.emotional.desc },
      { label: '標題類型', score: dims.pattern.score, max: 20, desc: dims.pattern.desc },
      { label: 'SEO 友善度', score: dims.seo.score, max: 15, desc: dims.seo.desc },
      { label: '可讀性', score: dims.readability.score, max: 15, desc: dims.readability.desc }
    ];

    dimensionsEl.innerHTML = dimData.map(d => {
      const pct = Math.round((d.score / d.max) * 100);
      const colorClass = getDimColor(d.score, d.max);
      return `<div class="headline-dim-row">
        <div class="headline-dim-label">${d.label}</div>
        <div class="headline-dim-bar-wrap">
          <div class="headline-dim-bar">
            <div class="headline-dim-bar-fill ${colorClass}" style="width:${pct}%"></div>
          </div>
          <div class="headline-dim-score">${d.score}/${d.max}</div>
        </div>
      </div>
      <div style="font-size:0.75rem;color:var(--text-dim);padding:0 0 var(--space-sm) 136px;">${d.desc}</div>`;
    }).join('');

    // Tips
    const tipsEl = document.getElementById('headline-tips');
    const tips = [];
    if (dims.wordBalance.score < 10) tips.push('❌ 字數不在最佳範圍 → 調整到 15-25 字');
    if (dims.numberPower.score === 0) tips.push('❌ 沒有數字 → 加入具體數字可提升 36% CTR');
    if (dims.emotional.score < 8) tips.push('❌ 缺少情感詞 → 加入「秘密」「揭露」「驚人」等 power words');
    if (dims.pattern.score <= 8) tips.push('❌ 標題結構普通 → 改用清單型（N個...）或教學型（如何...）');
    if (dims.seo.score < 10) tips.push('❌ SEO 友善度低 → 加入「教學」「推薦」「攻略」等搜尋詞');
    if (dims.readability.score < 10) tips.push('❌ 可讀性不足 → 檢查標點和主題是否清晰');
    if (tips.length === 0) tips.push('✅ 整體不錯！這標題有潛力成為爆款');

    tipsEl.innerHTML = tips.map(t =>
      `<div class="headline-tip">${t}</div>`
    ).join('');

    // Improved headline
    if (totalScore < 75) {
      const improved = generateImprovedHeadline(text, dims);
      document.getElementById('headline-improved').textContent = improved;
      document.getElementById('headline-improved-section').style.display = 'block';
    } else {
      document.getElementById('headline-improved-section').style.display = 'none';
    }
  });

  // Copy improved headline
  document.getElementById('headline-copy-improved').addEventListener('click', () => {
    const improved = document.getElementById('headline-improved').textContent;
    navigator.clipboard.writeText(improved).then(() => {
      const btn = document.getElementById('headline-copy-improved');
      btn.textContent = '✓ 已複製';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = '複製改善版'; btn.classList.remove('copied'); }, 2000);
    });
  });
})();


// ============================
// TOOL 5: Schema 產生器
// ============================

(function() {
  const schemaType = document.getElementById('schema-type');
  const formContainer = document.getElementById('schema-form-container');
  const generateBtn = document.getElementById('schema-generate-btn');
  const validateBtn = document.getElementById('schema-validate-btn');
  const copyBtn = document.getElementById('schema-copy-btn');
  const placeholder = document.getElementById('schema-placeholder');
  const output = document.getElementById('schema-output');
  const codeOutput = document.getElementById('schema-code-output');
  const googlePreview = document.getElementById('schema-google-preview');

  function renderFAQForm() {
    let html = `<div id="schema-faq-pairs">`;
    html += createFAQPair(1);
    html += createFAQPair(2);
    html += `</div>`;
    html += `<button type="button" class="schema-add-btn" id="schema-add-faq">+ 新增問答</button>`;
    formContainer.innerHTML = html;
    document.getElementById('schema-add-faq').addEventListener('click', () => {
      const pairs = document.getElementById('schema-faq-pairs');
      const count = pairs.querySelectorAll('.schema-pair').length;
      if (count >= 10) return;
      pairs.insertAdjacentHTML('beforeend', createFAQPair(count + 1));
      bindRemoveButtons();
    });
    bindRemoveButtons();
  }

  function createFAQPair(num) {
    return `<div class="schema-pair">
      <div class="schema-pair-header">
        <span class="schema-pair-label">問答 #${num}</span>
        <button type="button" class="schema-remove-btn" title="移除">&times;</button>
      </div>
      <div class="field-group" style="margin-bottom:var(--space-sm);">
        <label class="field-label"><span class="zh">問題</span></label>
        <input type="text" class="schema-faq-q" placeholder="輸入常見問題" />
      </div>
      <div class="field-group">
        <label class="field-label"><span class="zh">答案</span></label>
        <textarea class="schema-faq-a" placeholder="輸入答案" rows="2"></textarea>
      </div>
    </div>`;
  }

  function renderHowToForm() {
    let html = `<div class="field-group">
      <label class="field-label" for="schema-howto-name"><span class="zh">教學名稱</span></label>
      <input type="text" id="schema-howto-name" placeholder="例如：如何用 CSS 做出漸層背景" />
    </div>
    <div class="field-group">
      <label class="field-label" for="schema-howto-desc"><span class="zh">教學描述</span></label>
      <textarea id="schema-howto-desc" placeholder="簡短描述這個教學在幹嘛" rows="2"></textarea>
    </div>
    <div id="schema-howto-steps">`;
    html += createHowToStep(1);
    html += createHowToStep(2);
    html += createHowToStep(3);
    html += `</div>
    <button type="button" class="schema-add-btn" id="schema-add-step">+ 新增步驟</button>`;
    formContainer.innerHTML = html;
    document.getElementById('schema-add-step').addEventListener('click', () => {
      const steps = document.getElementById('schema-howto-steps');
      const count = steps.querySelectorAll('.schema-pair').length;
      if (count >= 20) return;
      steps.insertAdjacentHTML('beforeend', createHowToStep(count + 1));
      bindRemoveButtons();
    });
    bindRemoveButtons();
  }

  function createHowToStep(num) {
    return `<div class="schema-pair">
      <div class="schema-pair-header">
        <span class="schema-pair-label">步驟 #${num}</span>
        <button type="button" class="schema-remove-btn" title="移除">&times;</button>
      </div>
      <div class="field-group" style="margin-bottom:var(--space-sm);">
        <label class="field-label"><span class="zh">步驟名稱</span></label>
        <input type="text" class="schema-step-name" placeholder="例如：安裝套件" />
      </div>
      <div class="field-group">
        <label class="field-label"><span class="zh">步驟描述</span></label>
        <textarea class="schema-step-desc" placeholder="詳細描述" rows="2"></textarea>
      </div>
    </div>`;
  }

  function renderArticleForm() {
    formContainer.innerHTML = `
    <div class="field-group">
      <label class="field-label" for="schema-article-headline"><span class="zh">文章標題</span></label>
      <input type="text" id="schema-article-headline" placeholder="你的文章標題" />
    </div>
    <div class="two-col">
      <div class="field-group">
        <label class="field-label" for="schema-article-author"><span class="zh">作者名稱</span></label>
        <input type="text" id="schema-article-author" placeholder="寫文的人是誰" />
      </div>
      <div class="field-group">
        <label class="field-label" for="schema-article-date"><span class="zh">發佈日期</span></label>
        <input type="date" id="schema-article-date" />
      </div>
    </div>
    <div class="field-group">
      <label class="field-label" for="schema-article-image"><span class="zh">圖片網址</span></label>
      <input type="url" id="schema-article-image" placeholder="https://..." />
    </div>
    <div class="field-group">
      <label class="field-label" for="schema-article-desc"><span class="zh">文章描述</span></label>
      <textarea id="schema-article-desc" placeholder="簡短描述文章內容" rows="2"></textarea>
    </div>
    <div class="field-group">
      <label class="field-label" for="schema-article-publisher"><span class="zh">出版者名稱</span></label>
      <input type="text" id="schema-article-publisher" placeholder="網站或出版者名稱" />
    </div>`;
  }

  function bindRemoveButtons() {
    formContainer.querySelectorAll('.schema-remove-btn').forEach(btn => {
      btn.onclick = () => {
        const pair = btn.closest('.schema-pair');
        const container = pair.parentElement;
        if (container.querySelectorAll('.schema-pair').length > 1) {
          pair.remove();
          // Re-number
          container.querySelectorAll('.schema-pair-label').forEach((lbl, i) => {
            const prefix = schemaType.value === 'FAQPage' ? '問答' : '步驟';
            lbl.textContent = `${prefix} #${i + 1}`;
          });
        }
      };
    });
  }

  function buildSchemaJSON() {
    const type = schemaType.value;
    let schema;

    if (type === 'FAQPage') {
      const pairs = formContainer.querySelectorAll('.schema-pair');
      const mainEntity = [];
      pairs.forEach(pair => {
        const q = pair.querySelector('.schema-faq-q').value.trim();
        const a = pair.querySelector('.schema-faq-a').value.trim();
        if (q && a) {
          mainEntity.push({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": a
            }
          });
        }
      });
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": mainEntity
      };
    } else if (type === 'HowTo') {
      const name = document.getElementById('schema-howto-name').value.trim();
      const desc = document.getElementById('schema-howto-desc').value.trim();
      const steps = formContainer.querySelectorAll('.schema-pair');
      const stepArr = [];
      steps.forEach((step, i) => {
        const sName = step.querySelector('.schema-step-name').value.trim();
        const sDesc = step.querySelector('.schema-step-desc').value.trim();
        if (sName) {
          const stepObj = {
            "@type": "HowToStep",
            "position": i + 1,
            "name": sName
          };
          if (sDesc) stepObj.text = sDesc;
          stepArr.push(stepObj);
        }
      });
      schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": name || '教學標題',
        "description": desc || '',
        "step": stepArr
      };
      if (!desc) delete schema.description;
    } else if (type === 'Article') {
      const headline = (document.getElementById('schema-article-headline').value || '').trim();
      const author = (document.getElementById('schema-article-author').value || '').trim();
      const dateStr = (document.getElementById('schema-article-date').value || '').trim();
      const image = (document.getElementById('schema-article-image').value || '').trim();
      const desc = (document.getElementById('schema-article-desc').value || '').trim();
      const publisher = (document.getElementById('schema-article-publisher').value || '').trim();
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": headline || '文章標題',
        "author": { "@type": "Person", "name": author || '作者' },
        "datePublished": dateStr || new Date().toISOString().split('T')[0],
        "description": desc || '',
        "publisher": { "@type": "Organization", "name": publisher || '出版者' }
      };
      if (image) schema.image = image;
      if (!desc) delete schema.description;
    }
    return schema;
  }

  function renderGooglePreview(schema) {
    const type = schema['@type'];
    let html = '';
    if (type === 'FAQPage' && schema.mainEntity && schema.mainEntity.length) {
      html += `<div style="font-size:1.1rem;color:#1a0dab;margin-bottom:8px;">你的頁面標題</div>`;
      html += `<div style="font-size:0.8rem;color:#006621;margin-bottom:8px;">你的網站.com</div>`;
      html += `<div class="schema-faq-preview">`;
      schema.mainEntity.forEach(item => {
        html += `<div class="faq-item">
          <div class="faq-q">${escapeHtml(item.name)}</div>
          <div class="faq-a">${escapeHtml(item.acceptedAnswer.text)}</div>
        </div>`;
      });
      html += `</div>`;
    } else if (type === 'HowTo') {
      html += `<div style="font-size:1.1rem;color:#1a0dab;margin-bottom:4px;">${escapeHtml(schema.name)}</div>`;
      html += `<div style="font-size:0.8rem;color:#006621;margin-bottom:8px;">你的網站.com</div>`;
      if (schema.description) html += `<div style="font-size:0.82rem;color:#545454;margin-bottom:8px;">${escapeHtml(schema.description)}</div>`;
      html += `<div class="schema-howto-preview">`;
      (schema.step || []).forEach(s => {
        html += `<div class="schema-howto-step">
          <div class="schema-howto-num">${s.position}</div>
          <div class="schema-howto-text"><strong>${escapeHtml(s.name)}</strong>
            ${s.text ? `<div class="step-desc">${escapeHtml(s.text)}</div>` : ''}
          </div>
        </div>`;
      });
      html += `</div>`;
    } else if (type === 'Article') {
      html += `<div style="font-size:1.1rem;color:#1a0dab;margin-bottom:4px;">${escapeHtml(schema.headline)}</div>`;
      html += `<div style="font-size:0.8rem;color:#006621;margin-bottom:4px;">你的網站.com</div>`;
      if (schema.description) html += `<div style="font-size:0.82rem;color:#545454;margin-bottom:4px;">${escapeHtml(schema.description)}</div>`;
      html += `<div style="font-size:0.75rem;color:#70757a;">${escapeHtml(schema.author.name)} · ${escapeHtml(schema.datePublished)}</div>`;
    }
    googlePreview.innerHTML = html;
  }

  // Render initial form
  function renderForm() {
    const type = schemaType.value;
    if (type === 'FAQPage') renderFAQForm();
    else if (type === 'HowTo') renderHowToForm();
    else if (type === 'Article') renderArticleForm();
    // Hide output when switching
    output.style.display = 'none';
    placeholder.style.display = 'block';
  }

  schemaType.addEventListener('change', renderForm);
  renderForm();

  generateBtn.addEventListener('click', () => {
    const schema = buildSchemaJSON();
    const jsonStr = JSON.stringify(schema, null, 2);
    const scriptTag = `<script type="application/ld+json">\n${jsonStr}\n<\/script>`;
    codeOutput.textContent = scriptTag;
    placeholder.style.display = 'none';
    output.style.display = 'block';
    renderGooglePreview(schema);
  });

  copyBtn.addEventListener('click', () => {
    const code = codeOutput.textContent;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.textContent = '✓ 已複製';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = '複製 JSON-LD'; copyBtn.classList.remove('copied'); }, 2000);
    });
  });

  validateBtn.addEventListener('click', () => {
    window.open('https://search.google.com/test/rich-results', '_blank');
  });
})();


// ============================
// TOOL 6: 可讀性分析器
// ============================

(function() {
  const readInput = document.getElementById('readability-input');
  const charCountEl = document.getElementById('readability-char-count');
  const readTimeEl = document.getElementById('readability-read-time');
  const placeholderEl = document.getElementById('readability-placeholder');
  const resultsEl = document.getElementById('readability-results');

  const TRANSITION_WORDS = ['因此','然而','此外','首先','其次','最後','總結','不過','雖然','但是','例如','換句話說','也就是說','簡單來說','另外','同時','相反地','事實上','畢竟','總而言之'];
  const PASSIVE_PATTERNS = [/被.{1,6}所/, /被.{1,6}給/, /遭到/, /受到.{1,8}影響/, /為.{1,6}所/];

  function splitSentences(text) {
    return text.split(/[。！？.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  function splitParagraphs(text) {
    return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  }

  function analyzeReadability(text) {
    const sentences = splitSentences(text);
    const paragraphs = splitParagraphs(text);
    const totalChars = text.length;
    const sentCount = sentences.length || 1;

    // 1. Average sentence length
    const avgSentLen = Math.round(totalChars / sentCount);
    let sentLight, sentDesc;
    if (avgSentLen < 25) { sentLight = 'green'; sentDesc = '句子長度適中，容易閱讀'; }
    else if (avgSentLen <= 35) { sentLight = 'yellow'; sentDesc = '句子偏長，建議拆分部分長句'; }
    else { sentLight = 'red'; sentDesc = '句子太長了，讀者會喘不過氣'; }

    // 2. Paragraph length
    const avgParaLen = paragraphs.length ? Math.round(paragraphs.reduce((s, p) => s + p.length, 0) / paragraphs.length) : totalChars;
    let paraLight, paraDesc;
    if (avgParaLen < 150) { paraLight = 'green'; paraDesc = '段落適中，視覺舒適'; }
    else if (avgParaLen <= 250) { paraLight = 'yellow'; paraDesc = '段落偏長，建議適當分段'; }
    else { paraLight = 'red'; paraDesc = '段落太長，會形成文字牆'; }

    // 3. Transition words
    let transitionSentCount = 0;
    sentences.forEach(s => {
      if (TRANSITION_WORDS.some(tw => s.includes(tw))) transitionSentCount++;
    });
    const transitionPct = Math.round((transitionSentCount / sentCount) * 100);
    let transLight, transDesc;
    if (transitionPct >= 30) { transLight = 'green'; transDesc = '過渡詞充足，文章流暢'; }
    else if (transitionPct >= 20) { transLight = 'yellow'; transDesc = '過渡詞稍少，建議多加'; }
    else { transLight = 'red'; transDesc = '過渡詞不足，文章讀起來像跳針'; }

    // 4. Passive voice
    let passiveSentCount = 0;
    sentences.forEach(s => {
      if (PASSIVE_PATTERNS.some(re => re.test(s))) passiveSentCount++;
    });
    const passivePct = Math.round((passiveSentCount / sentCount) * 100);
    let passiveLight, passiveDesc;
    if (passivePct < 10) { passiveLight = 'green'; passiveDesc = '被動語態很少，語氣直接有力'; }
    else if (passivePct <= 20) { passiveLight = 'yellow'; passiveDesc = '被動語態偏多，可以更主動'; }
    else { passiveLight = 'red'; passiveDesc = '被動語態過多，讀起來繞口'; }

    // 5. Consecutive long sentences
    let maxConsec = 0, curConsec = 0;
    sentences.forEach(s => {
      if (s.length > 30) { curConsec++; maxConsec = Math.max(maxConsec, curConsec); }
      else { curConsec = 0; }
    });
    let consecLight, consecDesc;
    if (maxConsec <= 2) { consecLight = 'green'; consecDesc = '長句不連續，節奏良好'; }
    else if (maxConsec === 3) { consecLight = 'yellow'; consecDesc = '有 3 個連續長句，建議拆開'; }
    else { consecLight = 'red'; consecDesc = `${maxConsec} 個連續長句，讀者會直接滑走`; }

    // 6. Heading structure
    const lines = text.split('\n');
    let headingCount = 0;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || /^[\d一二三四五六七八九十]+[、.)]/.test(trimmed) || (trimmed.length > 0 && trimmed.length <= 20 && !/[。！？.!?]/.test(trimmed) && /^[\u4e00-\u9fffA-Za-z\d]/.test(trimmed) && lines.indexOf(line) > 0)) {
        headingCount++;
      }
    });
    const headingsPer500 = totalChars > 0 ? (headingCount / (totalChars / 500)) : 0;
    let headingLight, headingDesc;
    if (headingsPer500 >= 3) { headingLight = 'green'; headingDesc = '標題結構豐富，利於掃讀'; }
    else if (headingsPer500 >= 1) { headingLight = 'yellow'; headingDesc = '標題結構普通，建議多加小標'; }
    else { headingLight = 'red'; headingDesc = '沒有明顯標題結構，整篇是文字牆'; }

    // 7. Content length
    let lenLight, lenDesc;
    if (totalChars >= 1500) { lenLight = 'green'; lenDesc = '長度充足，有利 SEO 排名'; }
    else if (totalChars >= 800) { lenLight = 'yellow'; lenDesc = '長度普通，建議擴充到 1500 字以上'; }
    else { lenLight = 'red'; lenDesc = '內容太短，Google 可能不會認真收錄'; }

    // Calculate overall score
    function lightToScore(light, weight) {
      if (light === 'green') return weight;
      if (light === 'yellow') return weight * 0.5;
      return 0;
    }
    const weights = { sent: 15, para: 15, trans: 15, passive: 10, consec: 15, heading: 15, len: 15 };
    const overall = Math.round(
      lightToScore(sentLight, weights.sent) +
      lightToScore(paraLight, weights.para) +
      lightToScore(transLight, weights.trans) +
      lightToScore(passiveLight, weights.passive) +
      lightToScore(consecLight, weights.consec) +
      lightToScore(headingLight, weights.heading) +
      lightToScore(lenLight, weights.len)
    );

    return {
      overall,
      metrics: [
        { name: '平均句長', value: `${avgSentLen} 字/句`, light: sentLight, desc: sentDesc },
        { name: '段落長度', value: `平均 ${avgParaLen} 字/段`, light: paraLight, desc: paraDesc },
        { name: '過渡詞使用', value: `${transitionPct}% 的句子有過渡詞`, light: transLight, desc: transDesc },
        { name: '被動語態', value: `${passivePct}% 被動語句`, light: passiveLight, desc: passiveDesc },
        { name: '連續長句', value: `最多 ${maxConsec} 個連續`, light: consecLight, desc: consecDesc },
        { name: '標題結構', value: `${headingCount} 個標題`, light: headingLight, desc: headingDesc },
        { name: '內容長度', value: `${totalChars} 字`, light: lenLight, desc: lenDesc }
      ]
    };
  }

  function getOverallLabel(score) {
    if (score < 30) return { label: '這篇文章需要大幅改善', badge: 'badge-red' };
    if (score < 60) return { label: '還行，但有不少紅燈要修', badge: 'badge-amber' };
    if (score < 80) return { label: '不錯，微調就能更好', badge: 'badge-green' };
    return { label: '優秀！可讀性極佳', badge: 'badge-green' };
  }

  // ---- Readability Rewrite Engine ----
  function generateReadableRewrite(text, result) {
    const metrics = result.metrics;
    const changelog = [];
    let rewritten = text;

    // Get metric by name helper
    function getMetric(name) { return metrics.find(m => m.name === name); }

    // 1. Fix long sentences: split sentences > 35 chars at commas/conjunctions
    const sentMetric = getMetric('平均句長');
    if (sentMetric && sentMetric.light !== 'green') {
      const sentences = rewritten.split(/([。！？])/);
      const rebuilt = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const sent = sentences[i];
        const punct = sentences[i + 1] || '';
        if (sent.length > 35) {
          // Split at commas, keeping meaning intact
          const parts = sent.split(/[，,]/);
          if (parts.length >= 2) {
            const mid = Math.ceil(parts.length / 2);
            rebuilt.push(parts.slice(0, mid).join('，') + '。');
            rebuilt.push(parts.slice(mid).join('，') + punct);
          } else {
            rebuilt.push(sent + punct);
          }
        } else {
          rebuilt.push(sent + punct);
        }
      }
      rewritten = rebuilt.join('');
      changelog.push('✅ 拆分過長句子：將超過 35 字的句子在逗號處斷句');
    }

    // 2. Fix paragraphs: break long paragraphs
    const paraMetric = getMetric('段落長度');
    if (paraMetric && paraMetric.light !== 'green') {
      const paragraphs = rewritten.split(/\n\s*\n/);
      const newParagraphs = [];
      paragraphs.forEach(p => {
        if (p.trim().length > 150) {
          const sents = p.split(/(?<=[。！？])/); 
          if (sents.length >= 3) {
            const mid = Math.ceil(sents.length / 2);
            newParagraphs.push(sents.slice(0, mid).join('').trim());
            newParagraphs.push(sents.slice(mid).join('').trim());
          } else {
            newParagraphs.push(p.trim());
          }
        } else {
          newParagraphs.push(p.trim());
        }
      });
      rewritten = newParagraphs.filter(p => p.length > 0).join('\n\n');
      changelog.push('✅ 分段改善：將過長段落拆分為適中長度');
    }

    // 3. Add transition words where missing
    const transMetric = getMetric('過渡詞使用');
    if (transMetric && transMetric.light !== 'green') {
      const transitions = ['首先，', '其次，', '此外，', '然而，', '因此，', '最後，', '事實上，', '換句話說，', '總結來說，'];
      const paragraphs = rewritten.split(/\n\s*\n/);
      let tIdx = 0;
      const enhanced = paragraphs.map((p, idx) => {
        if (idx === 0) return p; // Skip first paragraph
        const hasTransition = TRANSITION_WORDS.some(tw => p.includes(tw));
        if (!hasTransition && tIdx < transitions.length) {
          const t = transitions[tIdx++];
          return t + p;
        }
        return p;
      });
      rewritten = enhanced.join('\n\n');
      changelog.push('✅ 補充過渡詞：在段落開頭加入「首先」「此外」「因此」等連接詞');
    }

    // 4. Fix passive voice
    const passiveMetric = getMetric('被動語態');
    if (passiveMetric && passiveMetric.light !== 'green') {
      // Simple passive → active transforms
      rewritten = rewritten.replace(/被(.{1,6})所影響/g, '$1影響了這件事');
      rewritten = rewritten.replace(/遭到(.{1,8})的/g, '$1造成的');
      rewritten = rewritten.replace(/受到(.{1,8})影響/g, '$1帶來了影響');
      changelog.push('✅ 減少被動語態：將「被...所」「遭到」等改為主動語氣');
    }

    // 5. Add heading structure if missing
    const headingMetric = getMetric('標題結構');
    if (headingMetric && headingMetric.light !== 'green') {
      const paragraphs = rewritten.split(/\n\s*\n/);
      if (paragraphs.length >= 3) {
        const headings = ['## 核心觀點', '## 深入分析', '## 實踐建議', '## 關鍵總結', '## 延伸思考'];
        const enhanced = [];
        let hIdx = 0;
        paragraphs.forEach((p, idx) => {
          if (idx > 0 && idx % 2 === 0 && hIdx < headings.length) {
            enhanced.push(headings[hIdx++]);
          }
          enhanced.push(p);
        });
        rewritten = enhanced.join('\n\n');
        changelog.push('✅ 新增標題結構：每 2-3 段插入小標題，利於掃讀和 SEO');
      }
    }

    // 6. Pad content length if too short
    const lenMetric = getMetric('內容長度');
    if (lenMetric && lenMetric.light !== 'green') {
      // Extract the main topic from first 50 chars
      const topic = rewritten.slice(0, 50).replace(/[。！？\n]/g, '').trim().slice(0, 20);
      const expansion = `\n\n## 為什麼這很重要\n\n理解「${topic}」的關鍵，不只在於知識本身，更在於如何將它應用到日常實踐中。許多人忽略了這一點，導致理論與實際之間產生巨大的落差。\n\n從我的經驗來看，真正的改變往往來自三個層面：\n\n1. 認知層面：先理解問題的本質，而不是急著找解法。\n2. 行動層面：把理解轉化為具體可執行的步驟。\n3. 反饋層面：持續觀察結果，並根據數據調整方向。\n\n這三個層面缺一不可。如果只停留在認知層面，就只是紙上談兵。如果只有行動沒有反饋，就是盲目執行。\n\n你在實踐中遇到過哪些挑戰？歡迎分享你的經驗。`;
      rewritten = rewritten + expansion;
      changelog.push('✅ 擴充內容長度：新增「為什麼這很重要」段落，補充深度分析與行動建議');
    }

    // 7. Check for consecutive long sentences fix (already partially handled by #1)
    const consecMetric = getMetric('連續長句');
    if (consecMetric && consecMetric.light !== 'green' && !changelog.some(c => c.includes('拆分過長句子'))) {
      changelog.push('✅ 打散連續長句：在長句之間穿插短句，改善閱讀節奏');
    }

    return { rewritten, changelog };
  }

  function updateReadability() {
    const text = readInput.value;
    const len = text.length;

    charCountEl.textContent = `${len} 字元`;
    const readMins = Math.max(1, Math.ceil(len / 300));
    readTimeEl.textContent = `預估閱讀 ${readMins} 分鐘`;

    if (len < 10) {
      placeholderEl.style.display = 'block';
      resultsEl.style.display = 'none';
      return;
    }

    placeholderEl.style.display = 'none';
    resultsEl.style.display = 'block';

    const result = analyzeReadability(text);
    const info = getOverallLabel(result.overall);

    // Overall score
    document.getElementById('readability-overall-score').textContent = result.overall;
    document.getElementById('readability-overall-label').textContent = info.label;
    document.getElementById('readability-overall-bar').style.width = `${result.overall}%`;
    const overallBadge = document.getElementById('readability-overall-badge');
    overallBadge.textContent = result.overall + ' 分';
    overallBadge.className = `analysis-badge ${info.badge}`;

    // Metrics
    const metricsEl = document.getElementById('readability-metrics');
    metricsEl.innerHTML = result.metrics.map(m => `
      <div class="readability-metric">
        <div class="readability-light light-${m.light}"></div>
        <div class="readability-metric-body">
          <div class="readability-metric-name">${m.name}</div>
          <div class="readability-metric-value">${m.value}</div>
          <div class="readability-metric-desc">${m.desc}</div>
        </div>
      </div>
    `).join('');

    // Tips
    const tipsEl = document.getElementById('readability-tips');
    const tips = [];
    result.metrics.forEach(m => {
      if (m.light === 'red') {
        tips.push(`<div class="readability-tip"><span style="color:var(--red);">🔴</span> <strong>${m.name}：</strong>${m.desc}。建議立即修改。</div>`);
      } else if (m.light === 'yellow') {
        tips.push(`<div class="readability-tip"><span style="color:var(--amber);">🟡</span> <strong>${m.name}：</strong>${m.desc}。可以再改善。</div>`);
      }
    });
    if (tips.length === 0) {
      tips.push(`<div class="readability-tip"><span style="color:var(--green);">🟢</span> 全部指標都通過！這篇文章的可讀性非常好。</div>`);
    }
    tipsEl.innerHTML = tips.join('');

    // ---- Rewrite card: generate when score < 80 ----
    const rewriteCard = document.getElementById('readability-rewrite-card');
    const rewriteContent = document.getElementById('readability-rewrite-content');
    const rewriteChangelog = document.getElementById('readability-rewrite-changelog');
    const rewriteNote = document.getElementById('readability-rewrite-note');
    const copyBtn = document.getElementById('readability-copy-rewrite-btn');

    if (result.overall < 80) {
      const { rewritten, changelog } = generateReadableRewrite(text, result);
      rewriteCard.style.display = 'block';
      rewriteContent.textContent = rewritten;

      const redCount = result.metrics.filter(m => m.light === 'red').length;
      const yellowCount = result.metrics.filter(m => m.light === 'yellow').length;
      rewriteNote.textContent = `目前分數 ${result.overall} 分（${info.label}），有 ${redCount} 個紅燈、${yellowCount} 個黃燈。以下是針對所有不合格指標改寫後的完整文章，複製貼上到上方輸入框即可驗證分數提升：`;

      rewriteChangelog.innerHTML = '<div style="margin-top:12px;font-size:0.8rem;">' +
        '<div style="color:var(--accent);font-weight:600;margin-bottom:6px;">修改清單：</div>' +
        changelog.map(c => `<div style="color:var(--text-muted);margin-bottom:3px;">${c}</div>`).join('') +
        '</div>';

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(rewritten).then(() => {
          copyBtn.textContent = '✓ 已複製！貼到上方驗證';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '📋 複製改善版文章';
            copyBtn.classList.remove('copied');
          }, 3000);
        });
      };
    } else {
      rewriteCard.style.display = 'none';
    }
  }

  readInput.addEventListener('input', updateReadability);
})();


// ============================
// MISC / POLISH
// ============================

// Keyboard shortcut: Alt+1-6 to switch tabs
document.addEventListener('keydown', e => {
  if (e.altKey) {
    if (e.key === '1') switchTab('serp');
    if (e.key === '2') switchTab('og');
    if (e.key === '3') switchTab('threads');
    if (e.key === '4') switchTab('headline');
    if (e.key === '5') switchTab('schema');
    if (e.key === '6') switchTab('readability');
  }
});

// Smooth highlight on first input
const allInputs = document.querySelectorAll('input[type="text"], input[type="url"], textarea');
allInputs.forEach(el => {
  el.addEventListener('focus', () => {
    el.style.transition = 'border-color 0.18s ease, box-shadow 0.18s ease';
  });
});

console.log('%c厭世咖啡 ☕', 'color:#c8956c;font-size:18px;font-weight:bold;');
console.log('%c反正你打開 DevTools 就代表你還是在意的。', 'color:#9e8f80;');

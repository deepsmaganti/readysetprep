/* =========================================================================
   READYSETPREP — ISEE Practice, All Levels
   -------------------------------------------------------------------------
   All app logic lives here. Test content lives in data.js — see the header
   comment there for how to add a new test. Nothing in this file should
   need to change just because a test was added.
   ========================================================================= */

/* ---------------- Flatten helpers ---------------- */
function isEssaySection(sec){ return !!sec.prompt && !sec.questions && !sec.passages; }
function flattenSection(sec){
  if(isEssaySection(sec)) return null;
  if(sec.questions){ return sec.questions.map(q => ({...q, passage:null})); }
  const out = [];
  (sec.passages||[]).forEach(p=>{ p.questions.forEach(q=> out.push({...q, passage:p})); });
  return out;
}
const FLAT_BY_TEST = {};
LEVEL_IDS.forEach(lid=>{
  FLAT_BY_TEST[lid] = {};
  Object.keys(TESTS[lid]).forEach(tid=>{
    FLAT_BY_TEST[lid][tid] = {};
    LEVELS[lid].sectionOrder.forEach(sid=>{
      const sec = TESTS[lid][tid].sections[sid];
      FLAT_BY_TEST[lid][tid][sid] = sec ? flattenSection(sec) : null;
    });
  });
});

/* ---------------- Scoring helpers ---------------- */
function pctOf(correct, total){ return total ? Math.round((correct/total)*100) : 0; }
/* NOTE: This is a PRACTICE ESTIMATE, not an official ERB stanine. Real ISEE
   stanines are norm-referenced by grade and calculated from scaled scores
   using ERB's national test-taking population — data this site has no
   access to. Bands are shown in full in the results screen. Only shown
   after a FULL test is completed — a single section isn't a large enough
   sample for even a rough estimate. */
const STANINE_BANDS = [
  { min:96, max:100, stanine:9 },
  { min:90, max:95,  stanine:8 },
  { min:83, max:89,  stanine:7 },
  { min:75, max:82,  stanine:6 },
  { min:65, max:74,  stanine:5 },
  { min:55, max:64,  stanine:4 },
  { min:45, max:54,  stanine:3 },
  { min:35, max:44,  stanine:2 },
  { min:0,  max:34,  stanine:1 },
];
function stanineFromPercent(pct){
  for(const b of STANINE_BANDS){ if(pct>=b.min) return b.stanine; }
  return 1;
}

/* ---------------- Persistent storage ----------------
   Uses the browser's own localStorage — this site is meant to be hosted
   and visited directly (e.g. GitHub Pages), not just previewed inside
   Claude. Progress is per-browser/per-device only; no account system. */
const LS_PREFIX = 'readysetprep:';
function storageSafeSet(key, value){
  try{ localStorage.setItem(LS_PREFIX+key, JSON.stringify(value)); return true; }catch(e){ return false; }
}
function storageSafeGet(key){
  try{ const raw = localStorage.getItem(LS_PREFIX+key); return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
}
function storageSafeRemove(key){
  try{ localStorage.removeItem(LS_PREFIX+key); }catch(e){}
}

/* ---------------- App state ---------------- */
function firstTestId(levelId){ const ids = Object.keys(TESTS[levelId]); return ids.length ? ids[0] : null; }

const state = {
  screen:'home', studentName:'',
  levelId: 'primary',
  testId: firstTestId('primary'),
  minutes:{}, selectedSections:{}, mode:'timed', activeSections:[],
  sectionIdx:0, qIdx:0, answers:{}, flags:{}, timeRemaining:0, timeElapsed:0, timerId:null,
  audioPlays:{}, scriptShown:{}, history:[], essayText:'', inProgress:false
};
function ensureMinutesFor(levelId, testId){
  if(!testId) return;
  state.minutes[levelId] = state.minutes[levelId] || {};
  if(state.minutes[levelId][testId]) return;
  const m = {};
  LEVELS[levelId].sectionOrder.forEach(sid=>{
    const sec = TESTS[levelId][testId].sections[sid];
    if(sec) m[sid] = sec.defaultMinutes;
  });
  state.minutes[levelId][testId] = m;
}
function ensureSelectedFor(levelId, testId){
  if(!testId) return;
  state.selectedSections[levelId] = state.selectedSections[levelId] || {};
  if(state.selectedSections[levelId][testId]) return;
  const s = {};
  LEVELS[levelId].sectionOrder.forEach(sid=>{ if(TESTS[levelId][testId].sections[sid]) s[sid] = true; });
  state.selectedSections[levelId][testId] = s;
}
ensureMinutesFor(state.levelId, state.testId);
ensureSelectedFor(state.levelId, state.testId);

function currentLevel(){ return LEVELS[state.levelId]; }
function currentTest(){ return state.testId ? TESTS[state.levelId][state.testId] : null; }
function currentFlat(){ return state.testId ? FLAT_BY_TEST[state.levelId][state.testId] : null; }
function currentMinutes(){ return (state.minutes[state.levelId] && state.minutes[state.levelId][state.testId]) || {}; }
function currentSelected(){ return (state.selectedSections[state.levelId] && state.selectedSections[state.levelId][state.testId]) || {}; }
function sectionOrder(){ return currentLevel().sectionOrder.filter(id => currentTest() && currentTest().sections[id]); }
function isFullTest(){
  const full = sectionOrder();
  return state.activeSections.length === full.length && full.every(id => state.activeSections.includes(id));
}
function levelHasTests(levelId){ return Object.keys(TESTS[levelId]).length > 0; }

const ACTIVE_SCREENS = ['sectionIntro','question','essay','sectionReview'];
function loadSaved(){
  const name = storageSafeGet('studentName'); if(name) state.studentName = name;
  const mins = storageSafeGet('minutes'); if(mins) state.minutes = mins;
  const hist = storageSafeGet('history'); if(hist) state.history = hist;
  render();
}

/* Session autosave/resume — lets someone close the tab mid-test and pick
   back up later, similar to the reference site. */
function saveSession(){
  if(!ACTIVE_SCREENS.includes(state.screen)) return;
  storageSafeSet('session', {
    screen: state.screen, levelId: state.levelId, testId: state.testId, mode: state.mode,
    activeSections: state.activeSections, sectionIdx: state.sectionIdx, qIdx: state.qIdx,
    answers: state.answers, flags: state.flags, timeRemaining: state.timeRemaining,
    timeElapsed: state.timeElapsed, audioPlays: state.audioPlays, essayText: state.essayText,
    studentName: state.studentName, savedAt: new Date().toISOString()
  });
}
function loadSessionPreview(){ return storageSafeGet('session'); }
function resumeSession(){
  const s = loadSessionPreview(); if(!s) return;
  Object.assign(state, s);
  ensureMinutesFor(state.levelId, state.testId);
  ensureSelectedFor(state.levelId, state.testId);
  if(state.screen==='question' || state.screen==='essay'){ startTimer(); }
  render();
}
function clearSession(){ storageSafeRemove('session'); goHome(); }

/* ---------------- Navigation / flow ---------------- */
function goHome(){ stopTimer(); state.screen='home'; render(); }
function goSettings(){ state.screen='settings'; render(); }
function chooseLevel(levelId){
  state.levelId = levelId; state.testId = firstTestId(levelId);
  ensureMinutesFor(state.levelId, state.testId); ensureSelectedFor(state.levelId, state.testId);
  render();
}
function chooseTest(testId){ state.testId = testId; ensureMinutesFor(state.levelId, state.testId); ensureSelectedFor(state.levelId, state.testId); render(); }
function setMode(m){ state.mode = m; render(); }
function toggleSectionSelected(secId){
  const sel = currentSelected();
  const onCount = Object.values(sel).filter(Boolean).length;
  if(sel[secId] && onCount<=1) return;
  sel[secId] = !sel[secId]; render();
}
function selectAllSections(){ const sel = currentSelected(); sectionOrder().forEach(id=> sel[id]=true); render(); }

function startPractice(){
  if(!state.testId) return;
  state.activeSections = sectionOrder().filter(id => currentSelected()[id]);
  if(state.activeSections.length===0) return;
  state.sectionIdx=0; state.answers={}; state.flags={}; state.audioPlays={}; state.scriptShown={}; state.essayText='';
  enterSectionIntro(0);
}
function retakeSameSession(){
  state.sectionIdx=0; state.answers={}; state.flags={}; state.audioPlays={}; state.scriptShown={}; state.essayText='';
  enterSectionIntro(0);
}
function enterSectionIntro(idx){ state.sectionIdx=idx; state.screen='sectionIntro'; saveSession(); render(); }
function beginSection(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  state.qIdx=0; state.essayText='';
  if(state.mode==='timed'){ state.timeRemaining = currentMinutes()[secId]*60; } else { state.timeElapsed = 0; }
  state.screen = isEssaySection(sec) ? 'essay' : 'question';
  startTimer(); saveSession(); render();
}
function startTimer(){
  stopTimer();
  state.timerId=setInterval(()=>{
    if(state.mode==='timed'){
      state.timeRemaining--; updateTimerBadge();
      if(state.timeRemaining<=0){ stopTimer(); finishSection(); }
    } else { state.timeElapsed++; updateTimerBadge(); }
    saveSession();
  },1000);
}
function stopTimer(){ if(state.timerId){ clearInterval(state.timerId); state.timerId=null; } }
function currentSectionFlat(){ return currentFlat()[state.activeSections[state.sectionIdx]]; }
function selectChoice(choiceIdx){ const q = currentSectionFlat()[state.qIdx]; state.answers[q.id]=choiceIdx; saveSession(); render(); }
function toggleFlag(){ const q = currentSectionFlat()[state.qIdx]; state.flags[q.id] = !state.flags[q.id]; saveSession(); render(); }
function jumpToQuestion(idx){ state.qIdx = idx; state.screen='question'; saveSession(); render(); }
function nextQuestion(){
  const flat=currentSectionFlat();
  if(state.qIdx<flat.length-1){ state.qIdx++; saveSession(); render(); }
  else { state.screen='sectionReview'; saveSession(); render(); }
}
function prevQuestion(){ if(state.qIdx>0){ state.qIdx--; saveSession(); render(); } }
function returnToQuestions(){ state.screen='question'; saveSession(); render(); }
function submitSection(){
  const flat = currentSectionFlat();
  const missing = flat.filter(q=> state.answers[q.id]===undefined);
  if(missing.length && !confirm(`There are ${missing.length} unanswered question${missing.length===1?'':'s'}. Submit this section anyway?`)) return;
  stopTimer(); finishSection();
}
function finishEssay(){ stopTimer(); finishSection(); }
function finishSection(){ state.screen='sectionBreak'; saveSession(); render(); }
function nextSectionOrResults(){ if(state.sectionIdx<state.activeSections.length-1){ enterSectionIntro(state.sectionIdx+1); } else { finishExpedition(); } }
function finishExpedition(){
  const summary = computeSummary();
  state.history.unshift({
    date:new Date().toISOString(), name: state.studentName||'Student',
    levelLabel: currentLevel().label, testLabel: currentTest().label,
    mode: state.mode, sections: state.activeSections.map(id=>currentTest().sections[id].shortName),
    isFull: isFullTest(), ...summary
  });
  state.history = state.history.slice(0,15);
  storageSafeSet('history', state.history);
  storageSafeRemove('session');
  state.screen='results'; render();
}
function computeSummary(){
  const perSection={}; let totalCorrect=0, totalQ=0;
  state.activeSections.forEach(id=>{
    const sec = currentTest().sections[id];
    if(isEssaySection(sec)){
      const words = state.essayText.trim() ? state.essayText.trim().split(/\s+/).length : 0;
      perSection[id] = { isEssay:true, words }; return;
    }
    const flat=currentFlat()[id]; let correct=0;
    flat.forEach(q=>{ if(state.answers[q.id]===q.correct) correct++; });
    const pct = pctOf(correct, flat.length);
    perSection[id]={ correct, total:flat.length, pct, stanine: stanineFromPercent(pct) };
    totalCorrect+=correct; totalQ+=flat.length;
  });
  const overallPct = pctOf(totalCorrect, totalQ);
  return { perSection, totalCorrect, totalQ, overallPct, overallStanine: stanineFromPercent(overallPct) };
}
function playPassage(passageId, text){
  state.audioPlays[passageId]=(state.audioPlays[passageId]||0)+1;
  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate=0.92; utter.pitch=1.05;
    window.speechSynthesis.speak(utter);
  }
  saveSession(); render();
}
function toggleScript(passageId){ state.scriptShown[passageId] = !state.scriptShown[passageId]; render(); }
function updateSetting(section, minutes){ currentMinutes()[section]=Math.max(1, Math.min(90, parseInt(minutes)||1)); }
function saveSettingsAndHome(){ storageSafeSet('minutes', state.minutes); storageSafeSet('studentName', state.studentName); goHome(); }
function fmtTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m}:${s.toString().padStart(2,'0')}`; }
function updateTimerBadge(){
  const el=document.getElementById('timerBadge'); if(!el) return;
  el.classList.remove('warn');
  if(state.mode==='timed'){ el.textContent=fmtTime(Math.max(0,state.timeRemaining)); if(state.timeRemaining<=60) el.classList.add('warn'); }
  else { el.textContent=fmtTime(state.timeElapsed)+' elapsed'; }
}

/* ---------------- Small visual helpers ---------------- */
const TOOL_ICONS = { 'ruler':'📏','scale':'⚖️','thermometer':'🌡️','clock':'🕒','measuring cup':'🥤','measuring tape':'📐' };
function toolIconFor(text){ const key = text.trim().toLowerCase(); return TOOL_ICONS[key] || null; }

/* Arrow shapes reused for triangle-direction choices (missing puzzle piece,
   reflection questions) — an asymmetric arrow makes "which way does this
   point" much clearer than a plain triangle. */
const ARROW_PATHS = {
  right: 'M12 20 H50 V8 L78 30 L50 52 V40 H12 Z',
  left:  'M78 20 H40 V8 L12 30 L40 52 V40 H78 Z',
  up:    'M35 52 V30 H20 L45 7 L70 30 H55 V52 Z',
  down:  'M35 8 V30 H20 L45 53 L70 30 H55 V8 Z',
};
function arrowSVG(direction, w, h){
  w = w||74; h = h||50;
  return `<svg viewBox="0 0 90 60" width="${w}" height="${h}"><path d="${ARROW_PATHS[direction]}" fill="#d9e3f6" stroke="#344054" stroke-width="3"/></svg>`;
}

/* ---------------- Figure rendering ---------------- */
function renderFigure(fig){
  if(!fig) return '';
  let inner='';
  if(fig.type==='table'){
    inner = `<div class="mini-table"><table><tr>${fig.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr><tr>${fig.values.map(v=>`<td>${v}</td>`).join('')}</tr></table></div>`;
  } else if(fig.type==='grid'){
    inner = `<div class="number-grid">${fig.rows.flat().map(c=>`<span class="${c==='?'?'mystery':''}">${c}</span>`).join('')}</div>`;
  } else if(fig.type==='bars'){
    const maxV = Math.max(...fig.values);
    inner = `<div class="bar-chart" aria-label="Bar chart">${fig.labels.map((l,i)=>`
      <div class="bar-col"><div class="bar" style="height:${Math.round((fig.values[i]/maxV)*80+10)}%"><b>${fig.values[i]}</b></div><span>${esc(l)}</span></div>`).join('')}</div>`;
  } else if(fig.type==='baseten'){
    inner = `<div class="base-ten" aria-label="${fig.hundreds} hundreds, ${fig.tens} tens, ${fig.ones} ones">
      <div class="hundreds">${Array(fig.hundreds).fill('<span class="hundred"></span>').join('')}</div>
      <div class="tens">${Array(fig.tens).fill('<span class="ten"></span>').join('')}</div>
      <div class="ones">${Array(fig.ones).fill('<span class="one"></span>').join('')}</div>
    </div>`;
  } else if(fig.type==='conecyl'){
    inner = `<div class="svg-wrap"><svg viewBox="0 0 320 160" role="img" aria-label="A cone and a cylinder">
      <ellipse cx="75" cy="120" rx="50" ry="16" fill="#e8eef8" stroke="#344054" stroke-width="3"/>
      <path d="M25 120 L75 28 L125 120" fill="#f6f8fc" stroke="#344054" stroke-width="3"/>
      <text x="75" y="151" text-anchor="middle">cone</text>
      <ellipse cx="235" cy="42" rx="45" ry="15" fill="#e8eef8" stroke="#344054" stroke-width="3"/>
      <path d="M190 42 V118 M280 42 V118" stroke="#344054" stroke-width="3"/>
      <ellipse cx="235" cy="118" rx="45" ry="15" fill="#f6f8fc" stroke="#344054" stroke-width="3"/>
      <text x="235" y="151" text-anchor="middle">cylinder</text>
    </svg></div>`;
  } else if(fig.type==='dotgroups'){
    inner = fig.groups.map(g=>`<div style="margin-bottom:10px;"><b style="font-size:13px;">Group ${g.label}</b>
      <div class="cherry-row">${Array(g.count).fill('<span class="single-cherry"></span>').join('')}<small style="width:100%;color:var(--muted);">${g.count} cherries</small></div></div>`).join('');
  } else if(fig.type==='marbles'){
    const arr=[]; for(let i=0;i<fig.green;i++) arr.push('g'); for(let i=0;i<fig.red;i++) arr.push('r');
    inner = `<div class="marble-bag"><div class="bag-label">Bag of marbles</div><div class="marbles">${arr.map(c=>`<span class="${c==='g'?'green':'red'}"></span>`).join('')}</div></div>`;
  } else if(fig.type==='ruler'){
    const pct = v => Math.round((v/fig.max)*100);
    inner = `<div class="ruler-wrap">
      <div class="pencil-line" style="margin-left:${pct(fig.start)}%; width:${pct(fig.end-fig.start)}%;"></div>
      <div class="ticks" style="grid-template-columns:repeat(${fig.max+1},1fr);">
        ${Array.from({length:fig.max+1}).map((_,i)=>`<div class="tick"><i></i><b>${i}</b></div>`).join('')}
      </div>
    </div>`;
  } else if(fig.type==='puzzlesquare'){
    inner = `<div class="svg-wrap"><svg viewBox="0 0 260 190" role="img" aria-label="A square puzzle with a triangular piece missing">
      <rect x="35" y="15" width="160" height="160" fill="white" stroke="#344054" stroke-width="4"/>
      <path d="M35 15 L195 15 L115 95 Z" fill="#cddaf2" stroke="#344054" stroke-width="2"/>
      <path d="M35 15 L115 95 L35 175 Z" fill="#e7edf8" stroke="#344054" stroke-width="2"/>
      <path d="M35 175 L115 95 L195 175 Z" fill="#b8c9e8" stroke="#344054" stroke-width="2"/>
      <path d="M195 15 L195 175 L115 95 Z" fill="white" stroke="#d92d20" stroke-width="3" stroke-dasharray="7 5"/>
      <text x="215" y="98" font-size="14" fill="#d92d20">missing</text>
    </svg></div>`;
  } else if(fig.type==='reflect-v'){
    inner = `<div class="svg-wrap"><svg viewBox="0 0 420 180" role="img" aria-label="A shape to the left of a vertical fold line">
      <line x1="210" y1="10" x2="210" y2="170" stroke="#667085" stroke-width="3" stroke-dasharray="7 7"/>
      <path d="M55 58 H120 V35 L175 90 L120 145 V122 H55 Z" fill="#bfd0ee" stroke="#344054" stroke-width="3"/>
      <text x="95" y="165" font-size="14">original</text>
      <text x="222" y="25" font-size="13">flip across this line</text>
    </svg></div>`;
  } else if(fig.type==='reflect-h'){
    inner = `<div class="svg-wrap"><svg viewBox="0 0 420 190" role="img" aria-label="Top half of a design above a horizontal fold line">
      <line x1="20" y1="105" x2="400" y2="105" stroke="#667085" stroke-width="3" stroke-dasharray="7 7"/>
      <path d="M120 95 Q145 35 170 95 Q195 35 220 95 Q245 35 270 95" fill="none" stroke="#344054" stroke-width="6"/>
      <circle cx="155" cy="63" r="6" fill="#344054"/><circle cx="235" cy="63" r="6" fill="#344054"/>
      <text x="25" y="96" font-size="14">top half</text>
    </svg></div>`;
  }
  return `<div class="visual">${inner}</div>`;
}

/* ---------------- Rendering ---------------- */
function render(){
  const app=document.getElementById('app');
  app.innerHTML = body();
  if(state.screen==='question' || state.screen==='essay') updateTimerBadge();
  window.scrollTo({top:0, behavior:'auto'});
}
function esc(s){ const d=document.createElement('div'); d.innerText=String(s); return d.innerHTML; }
function topbar(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = secId ? currentTest().sections[secId] : null;
  return `<header class="topbar"><div class="topbar-inner">
    <div class="brand">ReadySetPrep</div>
    <div class="section-title">${sec ? esc(sec.name) : ''}</div>
    <div class="timer ${state.mode==='timed' && state.timeRemaining<=60 ? 'warn':''}" id="timerBadge">${state.screen==='question'||state.screen==='essay' ? (state.mode==='timed'?fmtTime(state.timeRemaining):fmtTime(state.timeElapsed)+' elapsed') : 'Review'}</div>
  </div></header>`;
}

function body(){
  switch(state.screen){
    case 'home': return homeScreen();
    case 'settings': return settingsScreen();
    case 'sectionIntro': return topbar() + `<main class="container">` + sectionIntroScreen() + `</main>`;
    case 'question': return topbar() + `<main class="container">` + questionScreen() + `</main>`;
    case 'essay': return topbar() + `<main class="container">` + essayScreen() + `</main>`;
    case 'sectionReview': return topbar() + `<main class="container">` + sectionReviewScreen() + `</main>`;
    case 'sectionBreak': return `<main class="container">` + sectionBreakScreen() + `</main>`;
    case 'results': return `<main class="container">` + resultsScreen() + `</main>`;
    case 'review': return `<main class="container">` + reviewScreen() + `</main>`;
    default: return '';
  }
}

function homeScreen(){
  const level = currentLevel();
  const test = currentTest();
  const flat = currentFlat();
  const mins = currentMinutes();
  const sel = currentSelected();
  const savedSession = loadSessionPreview();

  return `<main class="container"><section class="card hero">
    <span class="badge">Interactive browser practice</span>
    <h1>ReadySetPrep — ISEE Practice</h1>
    <p>Choose a level, pick timed or untimed, then take a full test or practice just the sections you want. You can jump between questions, flag anything for review, and check your work in a review screen before submitting each section.</p>

    <div class="log-title" style="font-weight:800; margin:20px 0 8px;">Choose a level</div>
    <div class="level-picker">
      ${LEVEL_IDS.map(lid=>{
        const l = LEVELS[lid]; const active = lid===state.levelId; const has = levelHasTests(lid);
        return `<div class="level-card ${active?'active':''}" onclick="chooseLevel('${lid}')">
          <div class="icon">${l.icon}</div><h4>${esc(l.label)}</h4><p>${esc(l.subtitle)}</p>
          <p style="margin-top:4px; ${has?'color:var(--ok);font-weight:700;':''}">${has ? Object.keys(TESTS[lid]).length+' test'+(Object.keys(TESTS[lid]).length>1?'s':'') : 'No tests yet'}</p>
        </div>`;
      }).join('')}
    </div>

    ${test ? `
    ${levelHasTests(state.levelId) && Object.keys(TESTS[state.levelId]).length>1 ? `
    <div class="log-title" style="font-weight:800; margin:20px 0 8px;">Choose a test</div>
    <div class="mode-grid">
      ${Object.keys(TESTS[state.levelId]).map(tid=>{
        const tt = TESTS[state.levelId][tid]; const active = tid===state.testId;
        return `<div class="mode-card ${active?'selected':''}" onclick="chooseTest('${tid}')"><h3>${esc(tt.label)}</h3><p>Tap to select</p></div>`;
      }).join('')}
    </div>` : ''}

    <div class="log-title" style="font-weight:800; margin:20px 0 8px;">Choose how to practice</div>
    <div class="mode-grid">
      <div class="mode-card ${state.mode==='timed'?'selected':''}" onclick="setMode('timed')"><span class="badge">Realistic practice</span><h3>Timed</h3><p>Uses the official ISEE section time limits.</p></div>
      <div class="mode-card ${state.mode==='untimed'?'selected':''}" onclick="setMode('untimed')"><span class="badge">No clock</span><h3>Untimed</h3><p>Practice at your own pace, no pressure.</p></div>
    </div>

    <div class="log-title" style="font-weight:800; margin:20px 0 8px;">Which sections?</div>
    <div class="mode-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
      ${sectionOrder().map(id=>`<div class="mode-card ${sel[id]?'selected':''}" style="padding:14px;" onclick="toggleSectionSelected('${id}')"><h3 style="font-size:15px;">${test.sections[id].icon} ${test.sections[id].shortName}</h3><p>${mins[id]} min${flat[id]?` · ${flat[id].length}q`:''}</p></div>`).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" onclick="selectAllSections()">Select all sections</button>

    <div class="input-row"><label for="studentName">Student name</label><input id="studentName" value="${esc(state.studentName)}" oninput="state.studentName=this.value" placeholder="e.g. Aashvi"></div>

    <div class="action-row">
      <button class="btn btn-primary" onclick="startPractice()">Start${isSelectedFull(sel)?' full test':' selected sections'} →</button>
      ${savedSession ? `<button class="btn btn-secondary" onclick="resumeSession()">Resume saved test</button><button class="btn btn-danger" onclick="if(confirm('Clear the saved test and its answers?')) clearSession();">Clear saved test</button>` : ''}
    </div>
    <p class="footer-note">Works best in Chrome. Progress and audio use this device's browser only — see the privacy notice below.</p>
    ` : `
    <div class="empty-state">
      <div class="icon">🗂️</div>
      <p>No practice tests loaded yet for ${esc(level.label)} Level. Send over a workbook in the same pattern as the Primary test and it'll show up here.</p>
    </div>`}
  </section>

  <section class="card" style="margin-top:18px;">
    <div class="log-title" style="font-weight:800; margin-bottom:8px;">Past attempts</div>
    ${state.history.length===0 ? `<div class="empty-log">No attempts yet — your first one will show up here.</div>` :
      state.history.map(h=>`<div class="log-entry"><span>${new Date(h.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} — ${esc(h.name)} · ${esc(h.levelLabel||'')} ${esc(h.testLabel||'')} · <span class="badge">${h.mode||'timed'}</span>${!h.isFull && h.totalQ ? ' <span class="badge">section</span>' : ''}</span><span class="log-stamp">${h.totalQ ? h.overallPct+'%' : ''} ${h.totalQ && h.isFull ? ' · stanine '+h.overallStanine : ''}</span></div>`).join('')}
  </section>
  ${state.levelId==='primary' && test ? `<div class="note" style="margin-top:18px;">📌 A heads-up: 4 math questions in Test #2 (the cherry-sharing group, the missing puzzle piece, and the two reflection/symmetry questions) use original diagrams rebuilt to match the workbook's answer key, since their source images weren't available as text. Worth double-checking those four against the printed workbook.</div>` : ''}
  <div class="footer-links"><a href="privacy.html">Privacy notice</a></div>
  </main>`;
}
function isSelectedFull(sel){ return sectionOrder().every(id=>sel[id]); }

function settingsScreen(){
  const test = currentTest(); const mins = currentMinutes(); const level = currentLevel();
  return `<main class="container"><section class="card">
    <h1 style="font-size:24px;">Settings</h1>
    <div class="input-row"><label>Student name</label><input value="${esc(state.studentName)}" oninput="state.studentName=this.value" placeholder="e.g. Aashvi"></div>
    ${test ? `<p class="footer-note">Time limits for ${esc(level.label)} · ${esc(test.label)} — used in Timed mode only.</p>
    ${sectionOrder().map(id=>{
      const sec = test.sections[id];
      return `<div class="input-row"><label style="min-width:200px;">${sec.name}</label><input type="number" min="1" max="90" value="${mins[id]}" style="max-width:90px;" oninput="updateSetting('${id}', this.value)"> min</div>`;
    }).join('')}` : `<p class="footer-note">No test loaded for ${esc(level.label)} Level yet.</p>`}
    <div class="action-row"><button class="btn btn-secondary" onclick="goHome()">Cancel</button><button class="btn btn-primary" onclick="saveSettingsAndHome()">Save</button></div>
  </section></main>`;
}

function sectionIntroScreen(){
  const secId = state.activeSections[state.sectionIdx]; const sec = currentTest().sections[secId];
  const mins = currentMinutes(); const flat = currentFlat()[secId];
  return `<section class="card section-intro">
    <span class="badge">${state.activeSections.length<sectionOrder().length ? 'Section practice' : `Section ${state.sectionIdx+1} of ${state.activeSections.length}`}</span>
    <h1>${sec.name}</h1>
    <div class="section-list">
      <div><b>Questions</b><span>${flat ? flat.length : '1 prompt'}</span></div>
      <div><b>Timing</b><span>${state.mode==='timed' ? mins[secId]+' minutes' : 'Untimed'}</span></div>
    </div>
    <div class="note">${sec.instructions.join(' ')}</div>
    <div class="action-row"><button class="btn btn-primary" onclick="beginSection()">Begin ${sec.shortName}</button><button class="btn btn-secondary" onclick="goHome()">Back to start</button></div>
  </section>`;
}

function palette(flat, secId){
  const answered = flat.filter(q=>state.answers[q.id]!==undefined).length;
  const pct = Math.round(answered/flat.length*100);
  return `<b>${answered} of ${flat.length} answered</b>
    <div class="progress-track" style="margin-top:10px;"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="q-palette">${flat.map((q,i)=>`<button class="q-dot ${state.answers[q.id]!==undefined?'answered':''} ${state.flags[q.id]?'flagged':''} ${i===state.qIdx?'current':''}" onclick="jumpToQuestion(${i})">${i+1}</button>`).join('')}</div>
    <div class="palette-legend">Green = answered<br>★ = flagged for review</div>`;
}

function questionScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const flat = currentSectionFlat();
  const q = flat[state.qIdx];
  const selected = state.answers[q.id];
  const flagged = !!state.flags[q.id];
  const letters = ['A','B','C','D'];
  const secMeta = currentTest().sections[secId];

  let passageHtml = '';
  if(q.passage){
    if(secId==='auditory'){
      const plays = state.audioPlays[q.passage.id]||0;
      const shown = state.scriptShown[q.passage.id];
      passageHtml = `<section class="card audio-panel passage-card">
        <div class="audio-icon">🔊</div><h2>Listen to the passage</h2>
        <div class="audio-controls">
          <button class="btn btn-primary" ${plays>=2?'disabled':''} onclick="playPassage('${q.passage.id}', \`${q.passage.text.replace(/`/g,"'")}\`)">${plays===0?'▶ Play passage':'▶ Play again'}</button>
        </div>
        <div class="play-count">${plays>=2 ? "You've used both plays for this story." : `Plays remaining: ${2-plays}`}</div>
        <div style="margin-top:14px;"><button class="btn btn-secondary btn-sm" onclick="toggleScript('${q.passage.id}')">${shown?'Hide script':'Or, have an adult read it instead'}</button></div>
        ${shown ? `<div class="script-box"><h5>Parent / teacher script — don't let the student read this</h5>${esc(q.passage.text)}</div>` : ''}
      </section>`;
    } else {
      passageHtml = `<section class="card passage-card"><h2>${esc(q.passage.title)}</h2><div class="passage-text">${esc(q.passage.text)}</div></section>`;
    }
  }

  const figureHtml = q.figure ? renderFigure(q.figure) : '';
  const approxNote = q.approximated ? `<div class="note" style="margin-bottom:16px;">⚠️ Recreated diagram — verify against the printed workbook.</div>` : '';

  let choicesHtml;
  if(q.choiceRender==='triangle'){
    choicesHtml = q.choices.map((dir,i)=>`
      <div class="choice ${selected===i?'selected':''}" onclick="selectChoice(${i})" role="button" tabindex="0">
        <span class="choice-letter">${letters[i]}</span><div class="choice-content">${arrowSVG(dir)}</div>
      </div>`).join('');
  } else {
    choicesHtml = q.choices.map((c,i)=>{
      const icon = toolIconFor(c);
      return `<div class="choice ${selected===i?'selected':''}" onclick="selectChoice(${i})" role="button" tabindex="0">
        <span class="choice-letter">${letters[i]}</span><div class="choice-content">${icon ? `<div class="tool-choice"><span>${icon}</span><b>${esc(c)}</b></div>` : esc(c)}</div>
      </div>`;
    }).join('');
  }

  const questionCard = `<section class="card question-card">
    <div class="question-meta"><span>Question ${state.qIdx+1}</span><span>${state.qIdx+1} of ${flat.length}</span></div>
    <div class="question-prompt">${esc(q.prompt)}</div>
    ${figureHtml}${approxNote}
    <div class="choices">${choicesHtml}</div>
    <div class="nav-row">
      <div class="nav-left">
        <button class="btn btn-secondary" ${state.qIdx===0?'disabled':''} onclick="prevQuestion()">← Previous</button>
        <button class="btn btn-secondary flag-btn ${flagged?'flagged':''}" onclick="toggleFlag()">${flagged?'★ Flagged':'☆ Flag for review'}</button>
      </div>
      <div class="nav-right">
        <button class="btn btn-secondary" onclick="state.screen='sectionReview'; saveSession(); render();">Review section</button>
        <button class="btn btn-primary" onclick="nextQuestion()">${state.qIdx===flat.length-1?'Finish section':'Next →'}</button>
      </div>
    </div>
  </section>`;

  if(passageHtml){
    return `<div class="passage-layout">${passageHtml}${questionCard}</div>`;
  }
  return `<div class="test-layout"><aside class="card sidebar">${palette(flat, secId)}</aside>${questionCard}</div>`;
}

function sectionReviewScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  const flat = currentSectionFlat();
  const missing = flat.filter(q=>state.answers[q.id]===undefined);
  const flagged = flat.filter(q=>state.flags[q.id]);
  return `<section class="card section-intro">
    <h1>Review ${sec.name}</h1>
    <div class="review-grid">
      <div class="score-box"><span>Answered</span><b>${flat.length-missing.length}/${flat.length}</b></div>
      <div class="score-box"><span>Not answered</span><b>${missing.length}</b></div>
      <div class="score-box"><span>Flagged</span><b>${flagged.length}</b></div>
    </div>
    ${missing.length ? `<div class="note"><b>Not answered:</b> question${missing.length===1?'':'s'} ${missing.map(q=>flat.indexOf(q)+1).join(', ')}</div>` : `<div class="success-note">Every question has an answer.</div>`}
    ${flagged.length ? `<p style="margin-top:12px;"><b>Flagged for review:</b> question${flagged.length===1?'':'s'} ${flagged.map(q=>flat.indexOf(q)+1).join(', ')}</p>` : ''}
    <div class="q-palette" style="max-width:520px; margin-top:16px;">${flat.map((q,i)=>`<button class="q-dot ${state.answers[q.id]!==undefined?'answered':''} ${state.flags[q.id]?'flagged':''}" onclick="jumpToQuestion(${i})">${i+1}</button>`).join('')}</div>
    <div class="action-row"><button class="btn btn-secondary" onclick="returnToQuestions()">Return to questions</button><button class="btn btn-primary" onclick="submitSection()">Submit section</button></div>
  </section>`;
}

function essayScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  const wordCount = state.essayText.trim() ? state.essayText.trim().split(/\s+/).length : 0;
  return `<section class="card">
    <span class="essay-tag">Not scored — sent to schools as a writing sample</span>
    <h1 style="font-size:22px;">${sec.name}</h1>
    <div class="note" style="margin:14px 0;"><b>Prompt:</b> ${esc(sec.prompt)}</div>
    <textarea class="essay-textarea" placeholder="Start writing here..." oninput="state.essayText=this.value; document.getElementById('wordCount').textContent=(this.value.trim()?this.value.trim().split(/\\s+/).length:0)+' words'; saveSession();">${esc(state.essayText)}</textarea>
    <div class="essay-meta"><span id="wordCount">${wordCount} words</span><span>Aim for a clear beginning, middle, and end.</span></div>
    <div class="action-row"><button class="btn btn-primary btn-block" onclick="finishEssay()">Finish essay →</button></div>
  </section>`;
}

function sectionBreakScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  const isLast = state.sectionIdx===state.activeSections.length-1;
  let progressLine;
  if(isEssaySection(sec)){
    const words = state.essayText.trim() ? state.essayText.trim().split(/\s+/).length : 0;
    progressLine = `You wrote ${words} words. This section isn't scored.`;
  } else {
    const flat = currentFlat()[secId];
    let correct=0; flat.forEach(q=>{ if(state.answers[q.id]===q.correct) correct++; });
    progressLine = `You got ${correct} out of ${flat.length} correct (${pctOf(correct,flat.length)}%).`;
  }
  return `<section class="card" style="text-align:center;">
    <span class="badge">Section complete</span>
    <h1>${sec.name} done!</h1>
    <p style="color:var(--muted);">${progressLine}</p>
    ${!isLast ? `<p>Take a short break, then continue to <b>${currentTest().sections[state.activeSections[state.sectionIdx+1]].name}</b>.</p>` : `<p>That's the whole session — nice work!</p>`}
    <button class="btn btn-primary" style="margin-top:14px;" onclick="nextSectionOrResults()">${isLast?'See results →':'Continue →'}</button>
  </section>`;
}

function resultsScreen(){
  const s = computeSummary();
  const test = currentTest(); const level = currentLevel();
  const fullTest = isFullTest();
  return `<section class="card">
    <span class="badge">Completed</span>
    <h1>${state.studentName ? esc(state.studentName) : 'Student'}'s Results</h1>
    <p class="footer-note">${esc(level.label)} · ${esc(test.label)} · ${state.mode==='timed'?'Timed':'Untimed'}${!fullTest && s.totalQ ? ' · Section practice' : ''}</p>
    ${s.totalQ ? `
    <div class="score-hero-stats">
      <div class="score-stat"><div class="big">${s.totalCorrect}/${s.totalQ}</div><div class="lbl">correct</div></div>
      <div class="score-stat"><div class="big">${s.overallPct}%</div><div class="lbl">percentage</div></div>
      ${fullTest ? `<div class="score-stat"><div class="big">${s.overallStanine}</div><div class="lbl">practice stanine (est.)</div></div>` : ''}
    </div>
    ${fullTest ? `
    <div class="success-note">This is a practice-only estimate based on percent correct on this custom test. It is not an official ISEE stanine — official stanines are norm-referenced by grade using ERB's national test-taking population.
    <details class="stanine-details"><summary>Show practice stanine bands</summary>
      <div class="stanine-band-table">${STANINE_BANDS.slice().reverse().map(b=>`<div class="stanine-band-row ${b.stanine===s.overallStanine?'current':''}"><span>Stanine ${b.stanine}</span><span>${b.min}${b.max<100?'–'+b.max:'+'}%</span></div>`).join('')}</div>
    </details></div>` : `<p class="footer-note">Practice stanine only appears after a full test — this was section practice, so percentage is the fairer signal here.</p>`}
    <div class="review-grid" style="margin-top:18px;">${state.activeSections.map(id=>{
      const sec = test.sections[id]; const p = s.perSection[id];
      if(p.isEssay) return `<div class="score-box"><span>${sec.shortName}</span><b>${p.words}</b><span>words · not scored</span></div>`;
      return `<div class="score-box"><span>${sec.shortName}</span><b>${p.correct}/${p.total}</b><span>${p.pct}%${fullTest?' · stanine '+p.stanine:''}</span></div>`;
    }).join('')}</div>
    ` : `<p style="margin-top:10px;">This session was writing practice only — nothing to score.</p>`}
    <div class="action-row">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print results</button>
      <button class="btn btn-secondary" onclick="state.screen='review'; render();">📋 Review answers</button>
      <button class="btn btn-secondary" onclick="retakeSameSession()">🔁 Retake this session</button>
      <button class="btn btn-ghost" onclick="goHome()">🏠 Back to start</button>
    </div>
  </section>`;
}

function reviewScreen(){
  const test = currentTest(); const flat = currentFlat();
  let review = '';
  state.activeSections.forEach(id=>{
    const sec = test.sections[id];
    if(isEssaySection(sec)){
      review += `<article class="review-item skipped"><h3>${sec.icon} ${sec.name}</h3>
        <div class="answer-line">Prompt: ${esc(sec.prompt)}</div>
        <p style="white-space:pre-wrap;">${esc(state.essayText) || '<em>Nothing written this time.</em>'}</p></article>`;
      return;
    }
    flat[id].forEach((q,i)=>{
      const given = state.answers[q.id];
      const ok = given===q.correct;
      const correctLabel = q.choiceRender==='triangle' ? `the ${q.choices[q.correct]}-pointing option` : esc(q.choices[q.correct]);
      const givenLabel = q.choiceRender==='triangle' ? (given!==undefined?`the ${q.choices[given]}-pointing option`:'—') : (given!==undefined?esc(q.choices[given]):'—');
      review += `<article class="review-item ${given===undefined?'skipped':(ok?'correct':'incorrect')}">
        <h3>${sec.icon} ${sec.shortName} ${i+1}: ${esc(q.prompt)}</h3>
        <div class="answer-line ${ok?'good':'bad'}">Your answer: ${givenLabel}${given!==undefined?(ok?' ✓':' ✗'):''}</div>
        ${!ok?`<div class="answer-line good">Correct answer: ${correctLabel}</div>`:''}
        ${q.explanation?`<p>${esc(q.explanation)}</p>`:''}
        ${q.approximated?`<p class="footer-note">⚠️ Recreated diagram — verify against the printed workbook.</p>`:''}
      </article>`;
    });
  });
  return `<section class="card">
    <h1 style="font-size:24px;">Answer review</h1>
    ${review}
    <div class="action-row"><button class="btn btn-primary btn-block" onclick="state.screen='results'; render();">← Back to results</button></div>
  </section>`;
}

loadSaved();

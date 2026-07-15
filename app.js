
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
   access to. This function maps raw percent-correct on this practice
   workbook onto a transparent 9-band scale (shown to the user in full in
   the results screen) purely to track practice trends over time. Always
   labeled "practice stanine estimate" in the UI, and only shown after a
   FULL test is completed — not after single-section practice, where a
   percentage alone is a more honest signal. */
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
   Uses the browser's own localStorage, since this site is meant to be
   hosted and visited directly (e.g. GitHub Pages) rather than only
   previewed inside Claude. Progress is saved per-browser/per-device only —
   there's no account system or central server. Wrapped in try/catch since
   some browsers restrict storage in private/incognito modes. */
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
  minutes:{},            // minutes[levelId][testId][sectionId]
  selectedSections:{},   // selectedSections[levelId][testId][sectionId] = bool
  mode: 'timed',         // 'timed' | 'untimed'
  activeSections: [],    // section ids included in the CURRENT attempt, in order
  sectionIdx:0, qIdx:0, answers:{}, timeRemaining:0, timeElapsed:0, timerId:null,
  audioPlays:{}, scriptShown:{}, history:[], essayText:''
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
  LEVELS[levelId].sectionOrder.forEach(sid=>{
    if(TESTS[levelId][testId].sections[sid]) s[sid] = true;
  });
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

async function loadSaved(){
  const name = await storageSafeGet('studentName'); if(name) state.studentName = name;
  const mins = await storageSafeGet('minutes'); if(mins) state.minutes = mins;
  const hist = await storageSafeGet('history'); if(hist) state.history = hist;
  ensureMinutesFor(state.levelId, state.testId);
  ensureSelectedFor(state.levelId, state.testId);
  render();
}

/* ---------------- Navigation / flow ---------------- */
function goHome(){ stopTimer(); state.screen='home'; render(); }
function goSettings(){ state.screen='settings'; render(); }
function chooseLevel(levelId){
  state.levelId = levelId;
  state.testId = firstTestId(levelId);
  ensureMinutesFor(state.levelId, state.testId);
  ensureSelectedFor(state.levelId, state.testId);
  render();
}
function chooseTest(testId){ state.testId = testId; ensureMinutesFor(state.levelId, state.testId); ensureSelectedFor(state.levelId, state.testId); render(); }
function setMode(m){ state.mode = m; render(); }
function toggleSectionSelected(secId){
  const sel = currentSelected();
  const onCount = Object.values(sel).filter(Boolean).length;
  if(sel[secId] && onCount<=1) return; // keep at least one section selected
  sel[secId] = !sel[secId];
  render();
}
function selectAllSections(){
  const sel = currentSelected();
  sectionOrder().forEach(id=> sel[id]=true);
  render();
}

function startPractice(){
  if(!state.testId) return;
  state.activeSections = sectionOrder().filter(id => currentSelected()[id]);
  if(state.activeSections.length===0) return;
  state.sectionIdx=0; state.answers={}; state.audioPlays={}; state.scriptShown={}; state.essayText='';
  enterSectionIntro(0);
}
function retakeSameSession(){
  state.sectionIdx=0; state.answers={}; state.audioPlays={}; state.scriptShown={}; state.essayText='';
  enterSectionIntro(0);
}
function enterSectionIntro(idx){ state.sectionIdx=idx; state.screen='sectionIntro'; render(); }
function beginSection(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  state.qIdx=0; state.essayText='';
  if(state.mode==='timed'){ state.timeRemaining = currentMinutes()[secId]*60; } else { state.timeElapsed = 0; }
  state.screen = isEssaySection(sec) ? 'essay' : 'question';
  startTimer(); render();
}
function startTimer(){
  stopTimer();
  state.timerId=setInterval(()=>{
    if(state.mode==='timed'){
      state.timeRemaining--; updateTimerBadge();
      if(state.timeRemaining<=0){ stopTimer(); finishSection(); }
    } else {
      state.timeElapsed++; updateTimerBadge();
    }
  },1000);
}
function stopTimer(){ if(state.timerId){ clearInterval(state.timerId); state.timerId=null; } }
function currentSectionFlat(){ return currentFlat()[state.activeSections[state.sectionIdx]]; }
function selectChoice(choiceIdx){ const q = currentSectionFlat()[state.qIdx]; state.answers[q.id]=choiceIdx; render(); }
function nextQuestion(){ const flat=currentSectionFlat(); if(state.qIdx<flat.length-1){ state.qIdx++; render(); } else { stopTimer(); finishSection(); } }
function prevQuestion(){ if(state.qIdx>0){ state.qIdx--; render(); } }
function finishEssay(){ stopTimer(); finishSection(); }
function finishSection(){ state.screen='sectionBreak'; render(); }
function nextSectionOrResults(){ if(state.sectionIdx<state.activeSections.length-1){ enterSectionIntro(state.sectionIdx+1); } else { finishExpedition(); } }
async function finishExpedition(){
  const summary = computeSummary();
  state.history.unshift({
    date:new Date().toISOString(), name: state.studentName||'Explorer',
    levelLabel: currentLevel().label, testLabel: currentTest().label,
    mode: state.mode, sections: state.activeSections.map(id=>currentTest().sections[id].shortName),
    isFull: isFullTest(),
    ...summary
  });
  state.history = state.history.slice(0,15);
  storageSafeSet('history', state.history);
  state.screen='results'; render();
}
function computeSummary(){
  const perSection={}; let totalCorrect=0, totalQ=0;
  state.activeSections.forEach(id=>{
    const sec = currentTest().sections[id];
    if(isEssaySection(sec)){
      const words = state.essayText.trim() ? state.essayText.trim().split(/\s+/).length : 0;
      perSection[id] = { isEssay:true, words };
      return;
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
  render();
}
function toggleScript(passageId){ state.scriptShown[passageId] = !state.scriptShown[passageId]; render(); }
function updateSetting(section, minutes){ currentMinutes()[section]=Math.max(1, Math.min(90, parseInt(minutes)||1)); }
async function saveSettingsAndHome(){ await storageSafeSet('minutes', state.minutes); await storageSafeSet('studentName', state.studentName); goHome(); }
function fmtTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m}:${s.toString().padStart(2,'0')}`; }
function updateTimerBadge(){
  const el=document.getElementById('timerBadge'); if(!el) return;
  el.classList.remove('warn','danger');
  if(state.mode==='timed'){
    el.textContent=fmtTime(Math.max(0,state.timeRemaining));
    if(state.timeRemaining<=15) el.classList.add('danger'); else if(state.timeRemaining<=60) el.classList.add('warn');
  } else {
    el.textContent=fmtTime(state.timeElapsed)+' elapsed';
  }
}

/* ---------------- Figure rendering ---------------- */
function renderFigure(fig){
  if(!fig) return '';
  let inner='';
  if(fig.type==='table'){
    inner = `<table class="fig-table"><tr>${fig.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr><tr>${fig.values.map(v=>`<td>${v}</td>`).join('')}</tr></table>`;
  } else if(fig.type==='grid'){
    inner = `<table class="fig-table">${fig.rows.map(r=>`<tr>${r.map(c=>`<td class="${c==='?'?'qmark':''}">${c}</td>`).join('')}</tr>`).join('')}</table>`;
  } else if(fig.type==='bars'){
    const maxV = Math.max(...fig.values);
    inner = `<div class="bars-wrap">${fig.labels.map((l,i)=>`
      <div class="bar-col">
        <div class="bar-val">${fig.values[i]}</div>
        <div class="bar" style="height:${(fig.values[i]/maxV)*90+10}px;"></div>
        <div class="bar-label">${esc(l)}</div>
      </div>`).join('')}</div>`;
  } else if(fig.type==='baseten'){
    inner = `<div class="baseten-wrap">
      <div class="baseten-group">${Array(fig.hundreds).fill('<div class="bt-flat"></div>').join('')}</div>
      <div class="baseten-group">${Array(fig.tens).fill('<div class="bt-rod"></div>').join('')}</div>
      <div class="baseten-group">${Array(fig.ones).fill('<div class="bt-cube"></div>').join('')}</div>
    </div>`;
  } else if(fig.type==='conecyl'){
    inner = `<div class="cone-cyl"><svg width="180" height="90" viewBox="0 0 180 90">
      <ellipse cx="35" cy="72" rx="25" ry="7" fill="none" stroke="var(--fern)" stroke-width="2.5"/>
      <polygon points="35,10 10,72 60,72" fill="var(--fern-light)" stroke="var(--fern)" stroke-width="2.5"/>
      <rect x="100" y="18" width="50" height="54" fill="var(--fern-light)" stroke="var(--fern)" stroke-width="2.5"/>
      <ellipse cx="125" cy="18" rx="25" ry="7" fill="var(--fern-light)" stroke="var(--fern)" stroke-width="2.5"/>
      <ellipse cx="125" cy="72" rx="25" ry="7" fill="none" stroke="var(--fern)" stroke-width="2.5"/>
    </svg></div>`;
  } else if(fig.type==='dotgroups'){
    inner = `<div class="dotgroups-wrap">${fig.groups.map(g=>`
      <div class="dotgroup"><div class="letter">Group ${g.label}</div>
      <div class="dots">${Array(g.count).fill('🍒').join(' ')}</div></div>`).join('')}</div>`;
  } else if(fig.type==='marbles'){
    const arr=[]; for(let i=0;i<fig.green;i++) arr.push('g'); for(let i=0;i<fig.red;i++) arr.push('r');
    inner = `<div class="marbles-wrap">${arr.map(c=>`<div class="marble ${c}"></div>`).join('')}</div>`;
  } else if(fig.type==='ruler'){
    const scale = 280/fig.max;
    const ticks = [];
    for(let i=0;i<=fig.max;i++){ ticks.push(`<line x1="${20+i*scale}" y1="24" x2="${20+i*scale}" y2="32" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="${20+i*scale}" y="46" font-size="10" text-anchor="middle" fill="var(--ink-soft)">${i}</text>`); }
    inner = `<svg width="320" height="55" viewBox="0 0 320 55">
      <line x1="20" y1="28" x2="${20+fig.max*scale}" y2="28" stroke="var(--ink-soft)" stroke-width="1.5"/>
      ${ticks.join('')}
      <line x1="${20+fig.start*scale}" y1="16" x2="${20+fig.end*scale}" y2="16" stroke="var(--coral)" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  } else if(fig.type==='puzzlesquare'){
    inner = `<svg width="130" height="130" viewBox="0 0 120 120">
      <polygon points="0,0 120,0 60,60" fill="var(--fern-light)" stroke="var(--fern)" stroke-width="2"/>
      <polygon points="0,120 120,120 60,60" fill="var(--fern-light)" stroke="var(--fern)" stroke-width="2"/>
      <polygon points="0,0 0,120 60,60" fill="var(--fern-light)" stroke="var(--fern)" stroke-width="2"/>
      <polygon points="120,0 120,120 60,60" fill="none" stroke="var(--coral)" stroke-width="2.5" stroke-dasharray="5,4"/>
      <text x="92" y="65" font-size="20" text-anchor="middle" fill="var(--coral-deep)" font-weight="bold">?</text>
    </svg>`;
  } else if(fig.type==='reflect-v'){
    inner = `<div style="display:flex; align-items:center; justify-content:center; gap:0;">
      <div class="tri-frame">${triangleHTML('right',48,'var(--fern)')}</div>
      <div style="width:2px; height:70px; background:repeating-linear-gradient(to bottom, var(--coral) 0 6px, transparent 6px 12px); margin:0 14px;"></div>
      <div class="tri-frame" style="border:2px dashed var(--sky-deep); background:transparent;"><span style="font-size:22px; color:var(--ink-soft);">?</span></div>
    </div>`;
  } else if(fig.type==='reflect-h'){
    inner = `<div style="display:flex; flex-direction:column; align-items:center; gap:0;">
      <div class="tri-frame">${triangleHTML('up',48,'var(--fern)')}</div>
      <div style="height:2px; width:70px; background:repeating-linear-gradient(to right, var(--coral) 0 6px, transparent 6px 12px); margin:14px 0;"></div>
      <div class="tri-frame" style="border:2px dashed var(--sky-deep); background:transparent;"><span style="font-size:22px; color:var(--ink-soft);">?</span></div>
    </div>`;
  }
  const centered = (fig.type==='puzzlesquare' || fig.type==='conecyl');
  return `<div class="figure-box"><div style="${centered?'display:flex;justify-content:center;':''}">${inner}</div></div>`;
}

function triangleHTML(direction, size, color){
  size = size||50; color = color||'var(--fern)';
  const half = size/2;
  let style = `display:inline-block;width:0;height:0;`;
  if(direction==='up') style += `border-left:${half}px solid transparent;border-right:${half}px solid transparent;border-bottom:${size}px solid ${color};`;
  if(direction==='down') style += `border-left:${half}px solid transparent;border-right:${half}px solid transparent;border-top:${size}px solid ${color};`;
  if(direction==='left') style += `border-top:${half}px solid transparent;border-bottom:${half}px solid transparent;border-right:${size}px solid ${color};`;
  if(direction==='right') style += `border-top:${half}px solid transparent;border-bottom:${half}px solid transparent;border-left:${size}px solid ${color};`;
  return `<span style="${style}"></span>`;
}

/* ---------------- Rendering ---------------- */
function render(){
  const app=document.getElementById('app');
  app.innerHTML = header() + body();
  if(state.screen==='question' || state.screen==='essay') updateTimerBadge();
  window.scrollTo({top:0, behavior:'auto'});
}
function header(){
  return `<div class="topbar">
    <div class="brand"><div class="brand-mark">🧭</div>
      <div class="brand-text"><h1>ReadySetPrep</h1><span>ISEE PRACTICE · ALL LEVELS</span></div>
    </div>
    ${state.screen==='home' ? `<button class="student-pill" onclick="goSettings()">⚙️ ${state.studentName ? esc(state.studentName) : 'Set up'}</button>` : ''}
  </div>`;
}
function esc(s){ const d=document.createElement('div'); d.innerText=String(s); return d.innerHTML; }

function body(){
  switch(state.screen){
    case 'home': return homeScreen();
    case 'settings': return settingsScreen();
    case 'sectionIntro': return sectionIntroScreen();
    case 'question': return questionScreen();
    case 'essay': return essayScreen();
    case 'sectionBreak': return sectionBreakScreen();
    case 'results': return resultsScreen();
    case 'review': return reviewScreen();
    default: return '';
  }
}

function homeScreen(){
  const level = currentLevel();
  const test = currentTest();
  const flat = currentFlat();
  const mins = currentMinutes();
  const sel = currentSelected();

  let heroHtml;
  if(test){
    const included = sectionOrder().filter(id=>sel[id]);
    const totalMin = included.reduce((a,id)=> a + (mins[id]||0), 0);
    const totalQ = included.reduce((a,id)=>{ const f=flat[id]; return a + (f ? f.length : 0); }, 0);
    const isFull = included.length === sectionOrder().length;
    heroHtml = `
    <div class="hero">
      <h2>${state.studentName ? esc(state.studentName)+"'s" : 'Ready for an'} expedition?</h2>
      <p>${esc(level.label)} Level · ${esc(test.label)} — ${isFull ? 'full test' : included.map(id=>test.sections[id].shortName).join(' + ')}, ${totalQ} scored questions${state.mode==='timed' ? `, about ${totalMin} minutes` : ', untimed'}.</p>

      <div class="mode-toggle">
        <button class="mode-btn ${state.mode==='timed'?'active':''}" onclick="setMode('timed')">⏱ Timed<span class="sub">Official ISEE time limits</span></button>
        <button class="mode-btn ${state.mode==='untimed'?'active':''}" onclick="setMode('untimed')">✏️ Untimed<span class="sub">No pressure — practice at your own pace</span></button>
      </div>

      <div class="log-title" style="color:rgba(255,255,255,0.85);">Which sections?</div>
      <div class="section-chips">
        ${sectionOrder().map(id=>`<button class="chip ${sel[id]?'active':''}" onclick="toggleSectionSelected('${id}')">${test.sections[id].icon} ${test.sections[id].shortName}</button>`).join('')}
        <button class="chip-select-all" onclick="selectAllSections()">Select all</button>
      </div>

      <div class="trailmap">
        ${sectionOrder().map((id,i)=>{
          const sec = test.sections[id];
          const f = flat[id];
          return `<div class="waypoint" style="${sel[id]?'':'opacity:0.4;'}"><div class="dot">${sec.icon}</div><div class="label">${sec.shortName}</div><div class="sub">${mins[id]} min${f?` · ${f.length}q`:''}</div></div>
          ${i<sectionOrder().length-1?'<div class="trail-line"></div>':''}`;
        }).join('')}
      </div>
      <button class="btn btn-primary btn-lg" onclick="startPractice()">${isFull ? "Start today's expedition" : 'Start selected sections'} →</button>
    </div>`;
  } else {
    heroHtml = `
    <div class="hero">
      <h2>${esc(level.label)} Level</h2>
      <p>${esc(level.subtitle)} — no practice tests loaded yet for this level.</p>
      <div class="empty-state" style="color:var(--paper);">
        <div class="icon">🗺️</div>
        <p style="color:rgba(255,255,255,0.85);">Send over a ${esc(level.label)} Level workbook in the same pattern as the Primary test, and it'll show up here as a new expedition. Expected sections: ${level.sectionOrder.map(id=>sectionLabelGuess(id)).join(', ')}.</p>
      </div>
    </div>`;
  }

  return `
  ${heroHtml}

  <div class="card">
    <div class="log-title">Choose a level</div>
    <div class="level-picker">
      ${LEVEL_IDS.map(lid=>{
        const l = LEVELS[lid]; const active = lid===state.levelId; const has = levelHasTests(lid);
        return `<div class="level-card ${active?'active':''}" onclick="chooseLevel('${lid}')">
          <div class="icon">${l.icon}</div><h4>${esc(l.label)}</h4><p>${esc(l.subtitle)}</p>
          <p style="margin-top:4px; ${has?'color:var(--fern-deep);font-weight:700;':''}">${has ? Object.keys(TESTS[lid]).length+' test'+(Object.keys(TESTS[lid]).length>1?'s':'') : 'No tests yet'}</p>
        </div>`;
      }).join('')}
    </div>
  </div>

  ${levelHasTests(state.levelId) ? `
  <div class="card">
    <div class="log-title">${esc(level.label)} Level practice tests</div>
    <div class="test-picker">
      ${Object.keys(TESTS[state.levelId]).map(tid=>{
        const tt = TESTS[state.levelId][tid]; const f = FLAT_BY_TEST[state.levelId][tid];
        const q = LEVELS[state.levelId].sectionOrder.filter(id=>tt.sections[id]).reduce((a,id)=> a + (f[id] ? f[id].length : 0), 0);
        const active = tid===state.testId;
        return `<div class="test-card ${active?'active':''}">
          <div><h4>${esc(tt.label)}</h4><p>${q} scored questions${LEVELS[state.levelId].sectionOrder.some(id=>tt.sections[id] && isEssaySection(tt.sections[id]))?' + essay':''} · can be retaken any time</p></div>
          ${active ? `<span class="test-card-badge">Selected</span>` : `<button class="btn btn-ghost btn-sm" onclick="chooseTest('${tid}')">Select</button>`}
        </div>`;
      }).join('')}
    </div>
  </div>` : ''}

  <div class="card">
    <div class="log-title">Past expeditions</div>
    ${state.history.length===0 ? `<div class="empty-log">No expeditions yet — your first one will show up here as a journal stamp.</div>` :
      state.history.map(h=>`<div class="log-entry"><span>${new Date(h.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} — ${esc(h.name)} · ${esc(h.levelLabel||'')} ${esc(h.testLabel||'')} · <span class="mode-pill">${h.mode||'timed'}</span>${!h.isFull && h.totalQ ? ' <span class="mode-pill">section</span>' : ''}</span><span class="stamp">${h.totalQ ? h.overallPct+'%' : ''} ${h.totalQ && h.isFull ? '<span class="stanine-badge" title="Practice stanine estimate — full test only">'+h.overallStanine+'</span>' : ''}</span></div>`).join('')}
  </div>
  ${state.levelId==='primary' && test ? `<div class="callout">📌 A heads-up: 4 math questions in Test #2 (the cherry-sharing group, the missing puzzle piece, and the two reflection/symmetry questions) use original diagrams rebuilt to match the workbook's answer key, since their source images weren't available as text. Worth double-checking those four against the printed workbook.</div>` : ''}
  <div class="footer-links"><a href="privacy.html">Privacy notice</a></div>
  `;
}
function sectionLabelGuess(id){
  const names = { auditory:'Auditory Comprehension', reading: (state.levelId==='primary') ? 'Reading' : 'Reading Comprehension', math:'Mathematics', verbal:'Verbal Reasoning', quantitative:'Quantitative Reasoning', mathAch:'Mathematics Achievement', essay:'Essay' };
  return names[id] || id;
}

function settingsScreen(){
  const test = currentTest();
  const mins = currentMinutes();
  const level = currentLevel();
  if(!test){
    return `<div class="card">
      <h2 style="margin-bottom:16px;">Parent setup</h2>
      <div class="settings-row"><div><label>Explorer's name</label><span class="hint">Shown on the trailhead and score log</span></div>
        <input class="text-input" style="width:160px;" value="${esc(state.studentName)}" oninput="state.studentName=this.value" placeholder="e.g. Aashvi"></div>
      <p class="hint" style="margin-top:14px;">No ${esc(level.label)} Level test is loaded yet, so there's nothing to time here. Add a test, then time limits will show up in this screen.</p>
      <div class="nav-row"><button class="btn btn-ghost" onclick="goHome()">Cancel</button><button class="btn btn-primary" onclick="saveSettingsAndHome()">Save</button></div>
    </div>`;
  }
  return `<div class="card">
    <h2 style="margin-bottom:16px;">Parent setup</h2>
    <div class="settings-row"><div><label>Explorer's name</label><span class="hint">Shown on the trailhead and score log</span></div>
      <input class="text-input" style="width:160px;" value="${esc(state.studentName)}" oninput="state.studentName=this.value" placeholder="e.g. Aashvi"></div>
    <div class="settings-row"><div><label>Time limits for</label><span class="hint">${esc(level.label)} · ${esc(test.label)} — used in Timed mode only</span></div></div>
    ${sectionOrder().map(id=>{
      const sec = test.sections[id];
      return `<div class="settings-row"><div><label>${sec.name} time limit</label><span class="hint">Official ISEE timing: ${sec.defaultMinutes} minutes</span></div>
      <input class="num-input" type="number" min="1" max="90" value="${mins[id]}" oninput="updateSetting('${id}', this.value)"> min</div>`;
    }).join('')}
    <div class="nav-row"><button class="btn btn-ghost" onclick="goHome()">Cancel</button><button class="btn btn-primary" onclick="saveSettingsAndHome()">Save</button></div>
  </div>`;
}

function sectionIntroScreen(){
  const secId = state.activeSections[state.sectionIdx]; const sec = currentTest().sections[secId];
  const mins = currentMinutes();
  const flat = currentFlat()[secId];
  return `<div class="card">
    <div class="intro-icon">${sec.icon}</div>
    <span class="mode-pill">${state.mode==='timed'?'⏱ Timed':'✏️ Untimed'}</span>
    <h2>${sec.name}</h2>
    <p style="color:var(--ink-soft); margin-top:4px;">Section ${state.sectionIdx+1} of ${state.activeSections.length} · ${state.mode==='timed' ? mins[secId]+' minutes' : 'no time limit'}${flat?` · ${flat.length} questions`:' · unscored writing sample'}</p>
    <ul class="intro-list">${sec.instructions.map(t=>`<li>${t}</li>`).join('')}</ul>
    <div class="nav-row"><button class="btn btn-ghost" onclick="goHome()">Back to trailhead</button><button class="btn btn-primary btn-lg" onclick="beginSection()">Begin ${sec.shortName} →</button></div>
  </div>`;
}

function questionScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const flat = currentSectionFlat();
  const q = flat[state.qIdx];
  const selected = state.answers[q.id];
  const letters = ['A','B','C','D'];
  const secMeta = currentTest().sections[secId];

  let passageHtml = '';
  if(q.passage){
    if(secId==='auditory'){
      const plays = state.audioPlays[q.passage.id]||0;
      const shown = state.scriptShown[q.passage.id];
      passageHtml = `<div class="listen-box">
        <button class="btn btn-primary" ${plays>=2?'disabled':''} onclick="playPassage('${q.passage.id}', \`${q.passage.text.replace(/`/g,"'")}\`)">🔊 ${plays===0?'Play the story':'Play again'}</button>
        <p class="hint">${plays>=2 ? "You've used both plays for this story." : `Plays remaining: ${2-plays}`}</p>
        <div class="script-reveal"><button class="btn btn-ghost btn-sm" onclick="toggleScript('${q.passage.id}')">${shown?'Hide':'Or, have an adult read it instead →'}</button></div>
        ${shown ? `<div class="script-box"><h5>Parent / teacher script — don't let the student read this</h5>${esc(q.passage.text)}</div>` : ''}
      </div>`;
    } else {
      passageHtml = `<div class="passage-box"><h4>${esc(q.passage.title)}</h4>${esc(q.passage.text).split('\n\n').map(p=>`<p>${p}</p>`).join('')}</div>`;
    }
  }

  const hasVisiblePassage = !!(q.passage && secId !== 'auditory');
  const figureHtml = q.figure ? renderFigure(q.figure) : '';
  const approxNote = q.approximated ? `<div class="figure-note flag">⚠️ Recreated diagram — verify against the printed workbook.</div>` : '';

  let choicesHtml;
  if(q.choiceRender==='triangle'){
    choicesHtml = q.choices.map((dir,i)=>`
      <button class="choice-btn triangle-choice ${selected===i?'selected':''}" onclick="selectChoice(${i})">
        <span class="choice-letter">${letters[i]}</span><span class="tri-frame">${triangleHTML(dir,40)}</span>
      </button>`).join('');
  } else {
    choicesHtml = q.choices.map((c,i)=>`
      <button class="choice-btn ${selected===i?'selected':''}" onclick="selectChoice(${i})">
        <span class="choice-letter">${letters[i]}</span><span>${esc(c)}</span>
      </button>`).join('');
  }

  const questionAndChoices = `
      ${figureHtml}${approxNote}
      <div class="question-prompt">${esc(q.prompt)}</div>
      <div class="choices">${choicesHtml}</div>`;

  const bodyHtml = hasVisiblePassage
    ? `<div class="question-split">
        <div class="q-col"><div class="passage-scroll">${passageHtml}</div></div>
        <div class="c-col">${questionAndChoices}</div>
      </div>`
    : `${passageHtml}
      <div class="question-split">
        <div class="q-col"><div class="question-prompt">${esc(q.prompt)}</div>${figureHtml}${approxNote}</div>
        <div class="c-col"><div class="choices">${choicesHtml}</div></div>
      </div>`;

  return `
  <div class="test-topbar">
    <div class="section-chip">${secMeta.icon} ${secMeta.name} — Q${state.qIdx+1} of ${flat.length}</div>
    <div class="timer-badge mono ${state.mode==='untimed'?'':''}" id="timerBadge">${state.mode==='timed'?fmtTime(state.timeRemaining):fmtTime(state.timeElapsed)+' elapsed'}</div>
  </div>
  <div class="trail-progress">
    ${flat.map((qq,i)=>`${i>0?'<div class="trail-seg"></div>':''}<div class="trail-dot-wrap"><div class="trail-dot ${i===state.qIdx?'current':(state.answers[qq.id]!==undefined?'answered':'')}"></div></div>`).join('')}
  </div>
  <div class="card">
    ${bodyHtml}
    <div class="nav-row">
      <button class="btn btn-ghost" ${state.qIdx===0?'disabled':''} onclick="prevQuestion()">← Back</button>
      <button class="btn btn-primary" onclick="nextQuestion()">${state.qIdx===flat.length-1?'Finish section':'Next'} →</button>
    </div>
  </div>`;
}

function essayScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  const wordCount = state.essayText.trim() ? state.essayText.trim().split(/\s+/).length : 0;
  return `
  <div class="test-topbar">
    <div class="section-chip">${sec.icon} ${sec.name}</div>
    <div class="timer-badge mono" id="timerBadge">${state.mode==='timed'?fmtTime(state.timeRemaining):fmtTime(state.timeElapsed)+' elapsed'}</div>
  </div>
  <div class="card">
    <span class="essay-tag">Not scored — sent to schools as a writing sample</span>
    <div class="passage-box"><h4>Prompt</h4><p>${esc(sec.prompt)}</p></div>
    <textarea class="essay-textarea" placeholder="Start writing here..." oninput="state.essayText=this.value; document.getElementById('wordCount').textContent=(this.value.trim()?this.value.trim().split(/\\s+/).length:0)+' words';">${esc(state.essayText)}</textarea>
    <div class="essay-meta"><span id="wordCount">${wordCount} words</span><span>Aim for a clear beginning, middle, and end.</span></div>
    <div class="nav-row"><button class="btn btn-primary btn-block" onclick="finishEssay()">Finish essay →</button></div>
  </div>`;
}

function sectionBreakScreen(){
  const secId = state.activeSections[state.sectionIdx];
  const sec = currentTest().sections[secId];
  const isLast = state.sectionIdx===state.activeSections.length-1;
  let progressLine;
  if(isEssaySection(sec)){
    const words = state.essayText.trim() ? state.essayText.trim().split(/\s+/).length : 0;
    progressLine = `You wrote ${words} words. Nice work — this section isn't scored.`;
  } else {
    const flat = currentFlat()[secId];
    let correct=0; flat.forEach(q=>{ if(state.answers[q.id]===q.correct) correct++; });
    progressLine = `You got ${correct} out of ${flat.length} correct (${pctOf(correct,flat.length)}%).`;
  }
  return `<div class="card" style="text-align:center;">
    <div class="intro-icon" style="margin:0 auto 14px;">🏕️</div>
    <h2>${sec.name} complete!</h2>
    <p style="color:var(--ink-soft); margin:8px 0 0;">${progressLine}</p>
    ${!isLast ? `<p style="margin-top:4px;">Take a short break, then continue to <strong>${currentTest().sections[state.activeSections[state.sectionIdx+1]].name}</strong>.</p>` : `<p style="margin-top:4px;">That's the whole session — nice work!</p>`}
    <button class="btn btn-primary btn-lg" style="margin-top:18px;" onclick="nextSectionOrResults()">${isLast?'See my basecamp report →':'Continue →'}</button>
  </div>`;
}

function resultsScreen(){
  const s = computeSummary();
  const test = currentTest();
  const level = currentLevel();
  const fullTest = isFullTest();
  return `
  <div class="hero"><h2>Basecamp report</h2>
    <p>${state.studentName ? esc(state.studentName) : 'Explorer'} finished ${esc(level.label)} · ${esc(test.label)} <span class="mode-pill" style="background:rgba(255,255,255,0.2); color:var(--paper);">${state.mode==='timed'?'⏱ Timed':'✏️ Untimed'}</span>${!fullTest && s.totalQ ? ` <span class="mode-pill" style="background:rgba(255,255,255,0.2); color:var(--paper);">Section practice</span>` : ''}</p>
    ${s.totalQ ? `
    <div class="score-hero-stats">
      <div class="score-stat"><div class="big">${s.totalCorrect}/${s.totalQ}</div><div class="lbl">correct</div></div>
      <div class="score-stat"><div class="big">${s.overallPct}%</div><div class="lbl">percentage</div></div>
      ${fullTest ? `<div class="score-stat"><div class="big">${s.overallStanine}<span class="stanine-badge" style="width:22px;height:22px;font-size:12px;vertical-align:middle;">≈</span></div><div class="lbl">practice stanine (est.)</div></div>` : ''}
    </div>
    ${fullTest ? `
    <p class="disclaimer-small" style="color:rgba(255,255,255,0.8);">Practice stanine is an estimate from percent correct on this practice test, not an official ERB score — the real ISEE stanine is norm-referenced by grade using ERB's national test-taking population, which this site can't replicate. Shown only after a full test, since a single section isn't a reliable enough sample.</p>
    <details class="stanine-details"><summary>Show practice stanine bands</summary>
      <div class="stanine-band-table">
        ${STANINE_BANDS.slice().reverse().map(b=>`<div class="stanine-band-row ${b.stanine===s.overallStanine?'current':''}"><span>Stanine ${b.stanine}</span><span>${b.min}${b.max<100?'–'+b.max:'+'}%</span></div>`).join('')}
      </div>
    </details>` : `<p class="disclaimer-small" style="color:rgba(255,255,255,0.8);">Practice stanine only appears after a full test — this was section practice, so percentage is the fairer signal here.</p>`}
    ` : `<p style="margin-top:10px;">This session was writing practice only — nothing to score.</p>`}
  </div>
  <div class="stamp-grid">${state.activeSections.map(id=>{
    const sec = test.sections[id];
    const p = s.perSection[id];
    if(p.isEssay){
      return `<div class="stamp-card"><div class="icon">${sec.icon}</div><h4>${sec.name}</h4><div class="score">${p.words}</div><div class="score-label">words · not scored</div></div>`;
    }
    return `<div class="stamp-card"><div class="icon">${sec.icon}</div><h4>${sec.name}</h4><div class="score">${p.correct}/${p.total}</div><div class="score-label">${p.pct}%${fullTest?' · stanine '+p.stanine:''}</div></div>`;
  }).join('')}
  </div>
  <div class="card">
    <div class="retake-row">
      <button class="btn btn-secondary" onclick="state.screen='review'; render();">📋 Review answers &amp; explanations</button>
      <button class="btn btn-secondary" onclick="window.print()">🖨️ Print results</button>
      <button class="btn btn-primary" onclick="retakeSameSession()">🔁 Retake this session</button>
      <button class="btn btn-ghost" onclick="goHome()">🏠 Back to trailhead</button>
    </div>
  </div>`;
}

function reviewScreen(){
  const test = currentTest();
  const flat = currentFlat();
  return `<div class="card">
    <h2 style="margin-bottom:6px;">Review answers</h2>
    <p style="color:var(--ink-soft); margin-top:0;">Green means correct, coral means it needs another look. Explanations are from the workbook's answer key.</p>
    ${state.activeSections.map(id=>{
      const sec = test.sections[id];
      if(isEssaySection(sec)){
        return `<h3 style="margin:22px 0 6px; color:var(--fern-deep); font-size:17px;">${sec.icon} ${sec.name}</h3>
        <div class="review-item"><span class="review-tag skipped">Not scored</span>
        <div class="rq">Prompt: ${esc(sec.prompt)}</div>
        <div style="font-size:14px; color:var(--ink-soft); white-space:pre-wrap;">${esc(state.essayText) || '<em>Nothing written this time.</em>'}</div></div>`;
      }
      return `<h3 style="margin:22px 0 6px; color:var(--fern-deep); font-size:17px;">${sec.icon} ${sec.name}</h3>
      ${flat[id].map((q,i)=>{
        const given = state.answers[q.id];
        const tag = given===undefined ? '<span class="review-tag skipped">Skipped</span>' : given===q.correct ? '<span class="review-tag right">Correct</span>' : '<span class="review-tag wrong">Try again</span>';
        const correctLabel = q.choiceRender==='triangle' ? `the ${q.choices[q.correct]}-pointing option` : esc(q.choices[q.correct]);
        const givenLabel = q.choiceRender==='triangle' ? (given!==undefined?`the ${q.choices[given]}-pointing option`:'') : (given!==undefined?esc(q.choices[given]):'');
        return `<div class="review-item">
          ${tag}${q.approximated?' <span class="review-tag skipped">Recreated diagram</span>':''}
          <div class="rq">${i+1}. ${esc(q.prompt)}</div>
          <div style="font-size:14px; color:var(--ink-soft);">Correct answer: <strong>${correctLabel}</strong>${given!==undefined && given!==q.correct ? ` · Your answer: ${givenLabel}` : ''}</div>
          ${q.explanation ? `<div class="review-explain">${esc(q.explanation)}</div>` : ''}
        </div>`;
      }).join('')}`;
    }).join('')}
    <div class="nav-row"><button class="btn btn-primary btn-block" onclick="state.screen='results'; render();">← Back to report</button></div>
  </div>`;
}

loadSaved();

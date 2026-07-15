const RSP=window.ReadySetPrep;
const LEVEL_STORAGE_KEY='readysetprep:selected-level';
const TEST_STORAGE_KEY='readysetprep:selected-test';
const STUDENT_STORAGE_KEY='readysetprep:student-name';
const HISTORY_STORAGE_KEY='readysetprep:completed-tests';
let selectedLevelId=localStorage.getItem(LEVEL_STORAGE_KEY)||'primary2';
let selectedTestId=localStorage.getItem(TEST_STORAGE_KEY)||null;
let TEST=null,state=null,timerId=null,speechPaused=false;

function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Could not load ${src}`));document.head.appendChild(s);});}
async function boot(){
  for(const file of (window.READYSETPREP_TEST_FILES||[])){try{await loadScript(file)}catch(e){console.error(e)}}
  if(!RSP.levels[selectedLevelId]) selectedLevelId='primary2';
  chooseDefaultTest(false);render();
}
function testsForLevel(id=selectedLevelId){return RSP.getTestsForLevel(id)}
function chooseDefaultTest(shouldRender=true){
  const tests=testsForLevel();
  if(!tests.length){TEST=null;selectedTestId=null;state=null;if(shouldRender)render();return;}
  if(!selectedTestId||!tests.some(t=>t.id===selectedTestId)) selectedTestId=tests[0].id;
  TEST=RSP.getTest(selectedTestId);localStorage.setItem(TEST_STORAGE_KEY,selectedTestId);state=loadState()||freshState();if(shouldRender)render();
}
function selectLevel(id){stopTimer();stopAudio();selectedLevelId=id;selectedTestId=null;localStorage.setItem(LEVEL_STORAGE_KEY,id);chooseDefaultTest();}
function selectTest(id){stopTimer();stopAudio();selectedTestId=id;TEST=RSP.getTest(id);localStorage.setItem(TEST_STORAGE_KEY,id);state=loadState()||freshState();home();}
function storageKey(){return `readysetprep:test:${TEST?.id||'none'}`}
function sectionMap(factory){const out={};(TEST?.sections||[]).forEach(s=>out[s.id]=factory(s));return out}

function makeAttemptId(){return `${Date.now()}-${Math.random().toString(36).slice(2,10)}`}
function loadCompletedTests(){try{const x=JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY));return Array.isArray(x)?x:[]}catch(e){return[]}}
function saveCompletedTests(items){try{localStorage.setItem(HISTORY_STORAGE_KEY,JSON.stringify(items))}catch(e){}}
function buildAttemptRecord(){
  const active=(state.activeSectionIds||[]).map(sectionById).filter(Boolean);
  const sectionScores=[];
  let totalCorrect=0,totalQuestions=0;
  active.forEach(sec=>{
    if(sec.type==='essay'){
      sectionScores.push({id:sec.id,label:sec.shortLabel||sec.label,isEssay:true,words:state.essayWords?.[sec.id]||0});
      return;
    }
    const total=flattenSection(sec).length;
    const correct=sectionScore(sec.id);
    const pct=total?Math.round(correct/total*100):0;
    sectionScores.push({id:sec.id,label:sec.shortLabel||sec.label,correct,total,pct});
    totalCorrect+=correct;
    totalQuestions+=total;
  });
  const overallPct=totalQuestions?Math.round(totalCorrect/totalQuestions*100):0;
  const full=isFullTest();
  return {
    attemptId:state.attemptId||makeAttemptId(),
    completedAt:state.completedAt||new Date().toISOString(),
    student:state.student||'Student',
    levelId:selectedLevelId,
    levelLabel:RSP.levels[selectedLevelId]?.label||selectedLevelId,
    testId:TEST.id,
    testLabel:TEST.label||TEST.title,
    testTitle:TEST.title,
    mode:state.sectionPractice?'section':(state.timed?'timed':'untimed'),
    modeLabel:state.sectionPractice?'Section practice':(state.timed?'Timed full test':'Untimed full test'),
    sectionPractice:state.sectionPractice||null,
    sections:active.map(sec=>sec.shortLabel||sec.label),
    isFull:full,
    totalCorrect,
    totalQuestions,
    overallPct,
    stanine:full?estimatedStanine(overallPct):null,
    sectionScores
  };
}
function logCompletedAttempt(){
  if(!state||!TEST||state.historyLogged)return;
  const record=buildAttemptRecord();
  const history=loadCompletedTests();
  if(!history.some(x=>x.attemptId===record.attemptId))history.unshift(record);
  saveCompletedTests(history);
  state.attemptId=record.attemptId;
  state.completedAt=record.completedAt;
  state.historyLogged=true;
  save();
}
function completedTestsPanel(){
  const history=loadCompletedTests();
  if(!history.length)return `<section class="card completed-log-card"><div class="completed-log-header"><div><span class="badge history-badge">Progress log</span><h2>Completed tests</h2><p>Finished tests and section practices will appear here.</p></div></div><div class="completed-empty">No completed tests yet.</div></section>`;
  const rows=history.map(item=>{
    const when=new Date(item.completedAt);
    const dateText=Number.isNaN(when.getTime())?item.completedAt:when.toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
    const scoreText=item.totalQuestions?`${item.totalCorrect}/${item.totalQuestions} · ${item.overallPct}%`:'Unscored';
    const sectionDetails=(item.sectionScores||[]).map(s=>s.isEssay
      ? `<span>${escapeHtml(s.label)}: ${s.words} words</span>`
      : `<span>${escapeHtml(s.label)}: ${s.correct}/${s.total} (${s.pct}%)</span>`).join('');
    return `<article class="completed-row">
      <div class="completed-main">
        <div class="completed-title"><strong>${escapeHtml(item.student)}</strong><span>${escapeHtml(item.levelLabel)} · ${escapeHtml(item.testLabel||item.testTitle)}</span></div>
        <div class="completed-meta">${escapeHtml(item.modeLabel)} · ${escapeHtml(dateText)}</div>
      </div>
      <div class="completed-score"><strong>${scoreText}</strong>${item.stanine?`<span class="history-stanine">Stanine ${item.stanine}</span>`:''}</div>
      <details class="completed-details"><summary>Section details</summary><div>${sectionDetails||'<span>No scored sections.</span>'}</div></details>
    </article>`;
  }).join('');
  return `<section class="card completed-log-card">
    <div class="completed-log-header">
      <div><span class="badge history-badge">Progress log</span><h2>Completed tests</h2><p>${history.length} completed attempt${history.length===1?'':'s'} saved in this browser.</p></div>
      <div class="completed-actions"><button class="btn btn-secondary" onclick="exportCompletedTests()">Export CSV</button><button class="btn btn-danger" onclick="clearCompletedTests()">Clear log</button></div>
    </div>
    <div class="completed-list">${rows}</div>
  </section>`;
}
function csvCell(value){const s=String(value??'');return `"${s.replace(/"/g,'""')}"`}
function exportCompletedTests(){
  const history=loadCompletedTests();
  if(!history.length){alert('There are no completed tests to export.');return}
  const header=['Completed','Student','Level','Test','Mode','Sections','Correct','Questions','Percent','Practice Stanine'];
  const lines=[header.map(csvCell).join(',')];
  history.forEach(x=>lines.push([
    x.completedAt,x.student,x.levelLabel,x.testLabel||x.testTitle,x.modeLabel,(x.sections||[]).join(' | '),
    x.totalCorrect,x.totalQuestions,x.overallPct,x.stanine||''
  ].map(csvCell).join(',')));
  const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='readysetprep-completed-tests.csv';document.body.appendChild(a);a.click();a.remove();
  URL.revokeObjectURL(url);
}
function clearCompletedTests(){
  if(!confirm('Clear the completed-test log from this browser?'))return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  home();
}

function freshState(){return {screen:'home',mode:null,timed:false,sectionPractice:null,student:localStorage.getItem(STUDENT_STORAGE_KEY)||'',attemptId:makeAttemptId(),historyLogged:false,completedAt:null,activeSectionIds:[],sectionIndex:0,qIndex:0,answers:sectionMap(()=>({})),flags:sectionMap(()=>({})),eliminations:sectionMap(()=>({})),timeLeft:sectionMap(s=>s.minutes*60),audioPlays:sectionMap(()=>0),started:false,completed:false,sectionSubmitted:sectionMap(()=>false),essayText:sectionMap(()=>''),essayWords:sectionMap(()=>0)}}
function normalizeState(s){if(!s)return s;const fresh=freshState();for(const k of ['answers','flags','eliminations','timeLeft','audioPlays','sectionSubmitted','essayText','essayWords']){s[k]=s[k]||fresh[k];for(const sid of Object.keys(fresh[k]))if(s[k][sid]===undefined)s[k][sid]=fresh[k][sid]}s.activeSectionIds=s.activeSectionIds||[];s.attemptId=s.attemptId||makeAttemptId();s.historyLogged=!!s.historyLogged;s.completedAt=s.completedAt||null;return s}
function save(){if(!TEST||!state)return;try{localStorage.setItem(storageKey(),JSON.stringify(state));if(state.student)localStorage.setItem(STUDENT_STORAGE_KEY,state.student)}catch(e){}}
function loadState(){if(!TEST)return null;try{const s=JSON.parse(localStorage.getItem(storageKey()));return normalizeState(s)}catch(e){return null}}
function clearSavedTest(){if(TEST)localStorage.removeItem(storageKey())}
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtTime(s){s=Math.max(0,s);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function sectionById(id){return TEST.sections.find(s=>s.id===id)}
function scoredSections(){return TEST.sections.filter(s=>s.type!=='essay')}
function flattenSection(sec){if(sec.type==='essay')return[];if(sec.passages){const out=[];sec.passages.forEach(p=>(p.questions||[]).forEach(q=>out.push({...q,passageTitle:p.title,passageText:p.text})));return out}return sec.questions||[]}
function currentSectionId(){return state.sectionPractice||state.activeSectionIds[state.sectionIndex]}
function currentSection(){return sectionById(currentSectionId())}
function currentQuestions(){return flattenSection(currentSection())}
function totalAnswered(sid){return Object.keys(state.answers[sid]||{}).length}
function sectionScore(sid){const qs=flattenSection(sectionById(sid));return qs.reduce((n,q)=>n+(state.answers[sid]?.[q.num]===q.answer?1:0),0)}
function stopTimer(){if(timerId){clearInterval(timerId);timerId=null}}
function startTimer(){stopTimer();if(!state?.timed||!['test','audio','essay'].includes(state.screen))return;const sid=currentSectionId();timerId=setInterval(()=>{state.timeLeft[sid]--;const t=document.querySelector('.timer');if(t){t.textContent=fmtTime(state.timeLeft[sid]);t.classList.toggle('warn',state.timeLeft[sid]<=60)}if(state.timeLeft[sid]<=0){stopTimer();finishSection(true)}save()},1000)}
function stopAudio(){if('speechSynthesis'in window)speechSynthesis.cancel();speechPaused=false}
function playAudio(){const sec=currentSection(),sid=sec.id;text=sec.passage?.text||'';state.audioPlays[sid]=(state.audioPlays[sid]||0)+1;save();if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=1.03;speechSynthesis.speak(u)}const el=document.getElementById('playCount');if(el)el.textContent=`Played ${state.audioPlays[sid]} time${state.audioPlays[sid]===1?'':'s'}`}
function pauseAudio(){if(!('speechSynthesis'in window))return;if(speechSynthesis.speaking){speechSynthesis.paused?speechSynthesis.resume():speechSynthesis.pause()}}
function levelCards(){return RSP.levelOrder.map(id=>{const l=RSP.levels[id],count=testsForLevel(id).length;return `<button class="level-card ${id===selectedLevelId?'active':''}" data-level="${id}" style="--level-accent:${l.accent};--level-soft:${l.soft}"><span class="level-dot">${l.short}</span><strong>${l.label}</strong><small>${count?`${count} test${count===1?'':'s'}`:l.subtitle}</small></button>`}).join('')}
function bindLevelCards(){document.querySelectorAll('[data-level]').forEach(x=>x.onclick=()=>selectLevel(x.dataset.level))}
function home(){stopTimer();stopAudio();const level=RSP.levels[selectedLevelId],tests=testsForLevel(),historyHtml=completedTestsPanel();
 if(!tests.length){const bp=level.blueprint.map(x=>`<div class="blueprint-item"><b>${x[0]}</b><span>${x[3]?'Unscored writing sample':`${x[1]} questions`} · ${x[2]} minutes</span></div>`).join('');document.getElementById('app').innerHTML=`<main class="container"><section class="card hero home-hero"><div class="site-brand-row"><div class="site-mark">R</div><div><div class="site-name">ReadySetPrep</div><div class="site-tagline">ISEE practice for every level</div></div></div><div class="level-heading">Choose an ISEE level</div><div class="level-picker">${levelCards()}</div><div class="level-overview" style="border-top:5px solid ${level.accent}"><span class="badge" style="background:${level.soft};color:${level.accent}">${level.subtitle}</span><h2>${level.label} Level</h2><p>This level is ready for test files. Add a test file and one manifest entry to publish it.</p><div class="blueprint-grid">${bp}</div><div class="coming-soon"><b>No tests published yet.</b> Use <code>test-template.js</code> to add the first one.</div></div><div class="home-footer"><button class="btn btn-secondary" id="availableTest">Open Primary 2</button><a href="privacy.html">Privacy notice</a></div></section>${historyHtml}</main>`;bindLevelCards();document.getElementById('availableTest').onclick=()=>selectLevel('primary2');return}
 const saved=loadState();const fullQ=scoredSections().reduce((n,s)=>n+flattenSection(s).length,0),fullMin=TEST.sections.reduce((n,s)=>n+s.minutes,0);
 document.getElementById('app').innerHTML=`<main class="container"><section class="card hero home-hero"><div class="site-brand-row"><div class="site-mark">R</div><div><div class="site-name">ReadySetPrep</div><div class="site-tagline">ISEE practice for every level</div></div></div><div class="level-heading">Choose an ISEE level</div><div class="level-picker">${levelCards()}</div><div class="test-selector-row"><div class="test-selector-copy"><h1>${escapeHtml(TEST.title)}</h1><p>${escapeHtml(TEST.description||'Choose a practice mode below.')}</p><span class="test-count-pill">${tests.length} test${tests.length===1?'':'s'} available at this level</span></div><div class="test-select-wrap"><label for="testSelect">Practice test</label><select class="test-select" id="testSelect">${tests.map(t=>`<option value="${t.id}" ${t.id===TEST.id?'selected':''}>${escapeHtml(t.label)}</option>`).join('')}</select></div></div><div class="mode-grid"><div class="mode-card timed-card" data-mode="timed"><span class="badge">Realistic practice</span><h3>Timed Full Test</h3><p>${fullMin} total minutes · ${fullQ} scored questions.</p></div><div class="mode-card untimed-card" data-mode="untimed"><span class="badge" style="background:var(--green-soft);color:var(--green)">No clock</span><h3>Untimed Full Test</h3><p>Complete every section at your own pace.</p></div><div class="mode-card section-card" data-mode="section"><span class="badge" style="background:var(--purple-soft);color:var(--purple)">Focused practice</span><h3>Untimed by Section</h3><p>Choose one section to practice.</p></div></div><div id="sectionChooser" class="hidden"><label><b>Choose a section:</b></label><div class="mode-grid">${TEST.sections.map((s,i)=>`<div class="mode-card section-choice ${i%3===0?'timed-card':i%3===1?'untimed-card':'section-card'}" data-section="${s.id}"><h3>${escapeHtml(s.shortLabel||s.label)}</h3><p>${s.type==='essay'?'Writing sample':`${flattenSection(s).length} questions`}</p></div>`).join('')}</div></div><div class="input-row"><label for="studentName">Student name</label><input id="studentName" value="${escapeHtml(state?.student||'')}" /></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button id="startBtn" class="btn btn-primary" disabled>Start</button>${saved?'<button id="resumeBtn" class="btn btn-secondary">Resume saved test</button><button id="clearBtn" class="btn btn-danger">Clear saved test</button>':''}</div><div class="home-footer"><p class="footer-note">Progress is saved in this browser. A practice stanine estimate appears after a completed full test.</p><a href="privacy.html">Privacy notice</a></div></section>${historyHtml}</main>`;
 bindLevelCards();document.getElementById('testSelect').onchange=e=>selectTest(e.target.value);let chosenMode=null,chosenSection=null;document.querySelectorAll('[data-mode]').forEach(el=>el.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');chosenMode=el.dataset.mode;document.getElementById('sectionChooser').classList.toggle('hidden',chosenMode!=='section');if(chosenMode!=='section')chosenSection=null;updateStart()});document.querySelectorAll('[data-section]').forEach(el=>el.onclick=()=>{document.querySelectorAll('[data-section]').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');chosenSection=el.dataset.section;updateStart()});function updateStart(){document.getElementById('startBtn').disabled=!chosenMode||(chosenMode==='section'&&!chosenSection)}
 document.getElementById('startBtn').onclick=()=>{const student=document.getElementById('studentName').value.trim()||'Student';state=freshState();state.student=student;state.mode=chosenMode;state.timed=chosenMode==='timed';state.sectionPractice=chosenMode==='section'?chosenSection:null;state.activeSectionIds=state.sectionPractice?[state.sectionPractice]:TEST.sections.map(s=>s.id);state.started=true;state.screen='intro';save();render()};if(saved){document.getElementById('resumeBtn').onclick=()=>{state=normalizeState(saved);state.screen=state.completed?'results':(state.screen==='home'?'intro':state.screen);render()};document.getElementById('clearBtn').onclick=()=>{if(confirm('Clear the saved test and all answers?')){clearSavedTest();state=freshState();home()}}}
}
function goHome(){stopTimer();stopAudio();if(state){state.screen='home';save()}home()}
function currentIndex(){return state.activeSectionIds.indexOf(currentSectionId())}
function intro(){const sec=currentSection(),qs=flattenSection(sec);document.getElementById('app').innerHTML=`<button class="home-floating" onclick="goHome()">⌂ Home</button><main class="container"><section class="card section-intro"><span class="badge">Section ${state.sectionIndex+1} of ${state.activeSectionIds.length}</span><h1>${escapeHtml(sec.label)}</h1><p>${state.timed?`${sec.minutes} minutes`:'Untimed'} · ${sec.type==='essay'?'unscored writing sample':`${qs.length} questions`}</p><div class="section-list"><div><span>Mode</span><b>${state.timed?'Timed':'Untimed'}</b></div><div><span>Navigation</span><b>Previous, Next, Review</b></div><div><span>Tools</span><b>Flag and eliminate choices</b></div></div><button class="btn btn-primary" id="beginSection">Begin section</button><button class="btn btn-ghost" id="backHome">Back to home</button></section>${historyHtml}</main>`;document.getElementById('beginSection').onclick=()=>{state.qIndex=0;state.screen=sec.type==='auditory'?'audio':sec.type==='essay'?'essay':'test';save();render()};document.getElementById('backHome').onclick=goHome}
function topbar(sec){return `<header class="topbar"><div class="topbar-inner"><button class="topbar-home" onclick="goHome()">⌂ Home</button><div class="brand">ReadySetPrep · ${escapeHtml(RSP.levels[TEST.levelId].label)}</div><div class="section-title">${escapeHtml(sec.label)}</div><div class="timer ${state.timed&&state.timeLeft[sec.id]<=60?'warn':''}">${state.timed?fmtTime(state.timeLeft[sec.id]):'Untimed'}</div></div></header>`}
function audioScreen(){const sec=currentSection(),sid=sec.id;document.getElementById('app').innerHTML=`${topbar(sec)}<main class="container"><div class="passage-layout"><section class="card audio-panel passage-card"><div class="audio-icon">🔊</div><h1>Listen to the passage</h1><p>You may listen while reading and replay it as many times as needed.</p><div class="audio-controls"><button class="btn btn-primary" id="playAudio">▶ Play passage</button><button class="btn btn-secondary" id="pauseAudio">⏸ Pause / Resume</button><button class="btn btn-secondary" id="stopAudio">■ Stop</button></div><div class="play-count" id="playCount">Played ${state.audioPlays[sid]||0} time${state.audioPlays[sid]===1?'':'s'}</div><div style="margin-top:24px"><button class="btn btn-primary" id="beginQuestions">Begin Questions</button></div></section><section class="card"><span class="badge">Auditory Passage</span><h2 style="margin-top:14px">${escapeHtml(sec.passage.title||'Passage')}</h2><div class="passage-text">${escapeHtml(sec.passage.text)}</div></section></div></main>`;document.getElementById('playAudio').onclick=playAudio;document.getElementById('pauseAudio').onclick=pauseAudio;document.getElementById('stopAudio').onclick=stopAudio;document.getElementById('beginQuestions').onclick=()=>{stopAudio();state.screen='test';save();render()};startTimer()}
function sidebar(sec,qs){const pct=Math.round(totalAnswered(sec.id)/Math.max(1,qs.length)*100);return `<b>${totalAnswered(sec.id)} of ${qs.length} answered</b><div class="progress-track" style="margin-top:10px"><div class="progress-fill" style="width:${pct}%"></div></div><div class="q-palette">${qs.map((q,i)=>`<button class="q-dot ${state.answers[sec.id]?.[q.num]?'answered':''} ${state.flags[sec.id]?.[q.num]?'flagged':''} ${i===state.qIndex?'current':''}" data-jump="${i}">${q.num}</button>`).join('')}</div><p class="palette-note">Green = answered · ★ = flagged</p>`}
function renderTest(){const sec=currentSection(),qs=currentQuestions(),item=qs[state.qIndex],sid=sec.id,ans=state.answers[sid]?.[item.num],flag=!!state.flags[sid]?.[item.num],eliminated=state.eliminations[sid]?.[item.num]||[];let sourceContext='';if(sec.type==='reading')sourceContext=`<span class="source-label">Reading passage</span><h2 style="margin:0 0 12px">${escapeHtml(item.passageTitle)}</h2><div class="passage-text">${escapeHtml(item.passageText)}</div>`;else if(sec.type==='auditory')sourceContext=`<span class="source-label">Auditory passage</span><div class="audio-controls" style="justify-content:flex-start;margin:0 0 15px"><button class="btn btn-secondary" id="replayAudio">🔊 Play passage again</button><span class="play-count" id="playCount">Played ${state.audioPlays[sid]||0} time${state.audioPlays[sid]===1?'':'s'}</span></div><h2 style="margin:0 0 12px">${escapeHtml(sec.passage.title||'Passage')}</h2><div class="passage-text">${escapeHtml(sec.passage.text)}</div>`;else sourceContext=`<span class="source-label">${escapeHtml(sec.label)} question</span>`;const choices=item.choices.map(c=>{const gone=eliminated.includes(c.label);return `<div class="choice-shell ${gone?'eliminated':''}"><div class="choice ${ans===c.label?'selected':''}" data-choice="${c.label}" role="button" tabindex="0"><span class="choice-letter">${c.label}</span><div class="choice-content">${c.html||escapeHtml(c.text)}</div></div><button class="eliminate-btn" data-eliminate="${c.label}" title="${gone?'Restore':'Eliminate'} answer ${c.label}">×</button></div>`}).join('');document.getElementById('app').innerHTML=`${topbar(sec)}<main class="container"><div class="question-workspace"><section class="card source-panel"><div class="question-meta"><span>Question ${item.num}</span><span>${state.qIndex+1} of ${qs.length}</span></div><div class="source-question">${item.prompt}</div>${item.visual?`<div class="visual">${item.visual}</div>`:''}${sourceContext}<div class="source-tools">${sidebar(sec,qs)}</div></section><section class="card answer-panel"><div class="answer-heading"><div><span class="source-label">Answer choices</span><h2>Select the best answer</h2></div></div><p class="elimination-help">Use the <b>×</b> mark to eliminate an answer choice.</p><div class="choices">${choices}</div><div class="nav-row"><div class="nav-left"><button class="btn btn-secondary" id="prevBtn" ${state.qIndex===0?'disabled':''}>← Previous</button><button class="btn btn-secondary flag-btn ${flag?'flagged':''}" id="flagBtn">${flag?'★ Flagged':'☆ Flag for review'}</button></div><div class="nav-right"><button class="btn btn-secondary" id="reviewBtn">Review section</button><button class="btn btn-primary" id="nextBtn">${state.qIndex===qs.length-1?'Finish section':'Next →'}</button></div></div></section></div></main>`;bindQuestionEvents(sec,qs,item);startTimer()}
function bindQuestionEvents(sec,qs,item){const sid=sec.id;document.querySelectorAll('[data-choice]').forEach(el=>{const choose=()=>{const label=el.dataset.choice;state.eliminations[sid][item.num]=(state.eliminations[sid][item.num]||[]).filter(x=>x!==label);state.answers[sid][item.num]=label;save();renderTest()};el.onclick=choose;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}}});document.querySelectorAll('[data-eliminate]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const label=btn.dataset.eliminate,current=state.eliminations[sid][item.num]||[];if(current.includes(label))state.eliminations[sid][item.num]=current.filter(x=>x!==label);else{state.eliminations[sid][item.num]=[...current,label];if(state.answers[sid][item.num]===label)delete state.answers[sid][item.num]}save();renderTest()});document.querySelectorAll('[data-jump]').forEach(el=>el.onclick=()=>{state.qIndex=Number(el.dataset.jump);save();renderTest()});document.getElementById('prevBtn').onclick=()=>{if(state.qIndex>0){state.qIndex--;save();renderTest()}};document.getElementById('flagBtn').onclick=()=>{state.flags[sid][item.num]=!state.flags[sid][item.num];save();renderTest()};document.getElementById('reviewBtn').onclick=()=>{state.screen='sectionReview';save();render()};document.getElementById('nextBtn').onclick=()=>{if(state.qIndex<qs.length-1){state.qIndex++;save();renderTest()}else{state.screen='sectionReview';save();render()}};const replay=document.getElementById('replayAudio');if(replay)replay.onclick=playAudio}
function sectionReview(){stopTimer();const sec=currentSection(),qs=currentQuestions();document.getElementById('app').innerHTML=`${topbar(sec)}<main class="container"><section class="card"><span class="badge">Section review</span><h1>${escapeHtml(sec.label)}</h1><p>Select a question to return to it. Unanswered questions are outlined.</p><div class="q-palette" style="grid-template-columns:repeat(8,1fr);margin:20px 0">${qs.map((q,i)=>`<button class="q-dot ${state.answers[sec.id]?.[q.num]?'answered':''} ${state.flags[sec.id]?.[q.num]?'flagged':''}" data-jump="${i}">${q.num}</button>`).join('')}</div><div class="nav-row"><button class="btn btn-secondary" id="returnQ">Return to questions</button><button class="btn btn-primary" id="submitSection">Submit section</button></div></section></main>`;document.querySelectorAll('[data-jump]').forEach(x=>x.onclick=()=>{state.qIndex=Number(x.dataset.jump);state.screen='test';save();render()});document.getElementById('returnQ').onclick=()=>{state.screen='test';save();render()};document.getElementById('submitSection').onclick=()=>finishSection(false)}
function essayScreen(){const sec=currentSection(),sid=sec.id,text=state.essayText[sid]||'',words=text.trim()?text.trim().split(/\s+/).length:0;document.getElementById('app').innerHTML=`${topbar(sec)}<main class="container"><section class="card section-intro"><span class="badge">Unscored writing sample</span><h1>${escapeHtml(sec.label)}</h1><div class="passage-text" style="margin:16px 0">${escapeHtml(sec.prompt||'Write a response to the prompt.')}</div><textarea class="essay-area" id="essayArea" placeholder="Start writing here...">${escapeHtml(text)}</textarea><div class="essay-meta"><span id="wordCount">${words} words</span><span>Aim for a clear beginning, middle, and end.</span></div><div class="nav-row"><button class="btn btn-secondary" onclick="goHome()">Save and return home</button><button class="btn btn-primary" id="finishEssay">Finish essay</button></div></section></main>`;const area=document.getElementById('essayArea');area.oninput=()=>{state.essayText[sid]=area.value;state.essayWords[sid]=area.value.trim()?area.value.trim().split(/\s+/).length:0;document.getElementById('wordCount').textContent=`${state.essayWords[sid]} words`;save()};document.getElementById('finishEssay').onclick=()=>finishSection(false);startTimer()}
function finishSection(){stopTimer();stopAudio();const sid=currentSectionId();state.sectionSubmitted[sid]=true;if(state.sectionIndex<state.activeSectionIds.length-1){state.sectionIndex++;state.qIndex=0;state.screen='intro'}else{state.completed=true;state.screen='results';state.completedAt=state.completedAt||new Date().toISOString();logCompletedAttempt()}save();render()}
function estimatedStanine(p){if(p>=96)return 9;if(p>=90)return 8;if(p>=83)return 7;if(p>=75)return 6;if(p>=65)return 5;if(p>=55)return 4;if(p>=45)return 3;if(p>=35)return 2;return 1}
function isFullTest(){return !state.sectionPractice&&state.activeSectionIds.length===TEST.sections.length&&TEST.sections.every(s=>state.activeSectionIds.includes(s.id))}
function results(){stopTimer();stopAudio();if(state.completed&&!state.historyLogged)logCompletedAttempt();const active=state.activeSectionIds.map(sectionById),scores=[];let total=0,max=0;active.forEach(sec=>{if(sec.type==='essay'){scores.push({sec,essay:true,words:state.essayWords[sec.id]||0});return}const t=flattenSection(sec).length,s=sectionScore(sec.id);scores.push({sec,score:s,total:t,pct:Math.round(s/t*100)});total+=s;max+=t});const pct=max?Math.round(total/max*100):0,full=isFullTest(),stanine=full?estimatedStanine(pct):null;let review='';active.forEach(sec=>{if(sec.type==='essay')return;flattenSection(sec).forEach(q=>{const ua=state.answers[sec.id]?.[q.num]||'—',ok=ua===q.answer;review+=`<article class="review-item ${ok?'correct':'incorrect'}"><h3>${escapeHtml(sec.shortLabel||sec.label)} ${q.num}: ${escapeHtml(q.prompt)}</h3><div class="answer-line ${ok?'good':'bad'}">Your answer: ${ua}${ok?' ✓':' ✗'}</div>${!ok?`<div class="answer-line good">Correct answer: ${q.answer}</div>`:''}<p>${escapeHtml(q.explanation||'')}</p></article>`})});document.getElementById('app').innerHTML=`<button class="home-floating" onclick="goHome()">⌂ Home</button><main class="container"><section class="card"><span class="badge">Completed</span><h1>${escapeHtml(state.student)}’s Results</h1><div class="review-grid">${scores.map(x=>x.essay?`<div class="score-box"><span>${escapeHtml(x.sec.shortLabel||x.sec.label)}</span><b>${x.words}</b><small>words · unscored</small></div>`:`<div class="score-box"><span>${escapeHtml(x.sec.shortLabel||x.sec.label)}</span><b>${x.score}/${x.total}</b><small>${x.pct}%</small></div>`).join('')}<div class="score-box"><span>Total scored</span><b>${total}/${max}</b><small>${pct}%</small></div>${full?`<div class="score-box"><span>Estimated Practice Stanine</span><b>${stanine}</b><small>Unofficial practice estimate</small></div>`:''}</div>${full?'<div class="success-note"><b>Practice estimate only:</b> Official ISEE stanines use grade-level norms and scaled scores.</div>':''}<div class="result-actions" style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0"><button class="btn btn-primary" onclick="window.print()">Print results</button><button class="btn btn-secondary" id="retake">Retake test</button><button class="btn btn-secondary" onclick="goHome()">Back to home</button></div><h2>Answer review</h2>${review}</section></main>`;document.getElementById('retake').onclick=()=>{const student=state.student;clearSavedTest();state=freshState();state.student=student;home()}}
function render(){if(!TEST||!state){home();return}switch(state.screen){case'home':home();break;case'intro':intro();break;case'audio':audioScreen();break;case'test':renderTest();break;case'sectionReview':sectionReview();break;case'essay':essayScreen();break;case'results':results();break;default:home()}}
boot();

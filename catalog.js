(function(){
  const registry = {};
  const levels = {
    primary2:{label:'Primary 2',short:'P2',subtitle:'Applying to Grade 2',accent:'#d95f4f',soft:'#fff0ed',blueprint:[['Auditory Comprehension',6,7],['Reading',18,20],['Mathematics',24,26]]},
    primary3:{label:'Primary 3',short:'P3',subtitle:'Applying to Grade 3',accent:'#3056a3',soft:'#e9effb',blueprint:[['Reading',24,28],['Mathematics',24,26]]},
    primary4:{label:'Primary 4',short:'P4',subtitle:'Applying to Grade 4',accent:'#b7791f',soft:'#fff7df',blueprint:[['Reading',28,30],['Mathematics',28,30]]},
    lower:{label:'Lower',short:'L',subtitle:'Applying to Grades 5–6',accent:'#0f8a83',soft:'#e7f7f5',blueprint:[['Verbal Reasoning',34,20],['Quantitative Reasoning',38,35],['Reading Comprehension',25,25],['Mathematics Achievement',30,30],['Essay',1,30,true]]},
    middle:{label:'Middle',short:'M',subtitle:'Applying to Grades 7–8',accent:'#7455c3',soft:'#f0ebff',blueprint:[['Verbal Reasoning',40,20],['Quantitative Reasoning',37,35],['Reading Comprehension',36,35],['Mathematics Achievement',47,40],['Essay',1,30,true]]},
    upper:{label:'Upper',short:'U',subtitle:'Applying to Grades 9–12',accent:'#4f63c6',soft:'#edf0ff',blueprint:[['Verbal Reasoning',40,20],['Quantitative Reasoning',37,35],['Reading Comprehension',36,35],['Mathematics Achievement',47,40],['Essay',1,30,true]]}
  };
  function validateTest(test){
    const errors=[];
    if(!test || typeof test!=='object') errors.push('Test must be an object.');
    if(!test?.id) errors.push('Missing test.id.');
    if(!test?.levelId || !levels[test.levelId]) errors.push('Missing or invalid test.levelId.');
    if(!test?.title) errors.push('Missing test.title.');
    if(!Array.isArray(test?.sections) || !test.sections.length) errors.push('Test must have at least one section.');
    (test?.sections||[]).forEach((s,i)=>{
      if(!s.id) errors.push(`Section ${i+1} is missing id.`);
      if(!s.label) errors.push(`Section ${i+1} is missing label.`);
      if(!s.type) errors.push(`Section ${i+1} is missing type.`);
      if(!Number.isFinite(s.minutes)) errors.push(`Section ${i+1} is missing minutes.`);
    });
    return errors;
  }
  function registerTest(test){
    const errors=validateTest(test);
    if(errors.length){console.error('ReadySetPrep test registration failed:',errors,test);return false;}
    registry[test.id]=test;return true;
  }
  function getTest(id){return registry[id]||null;}
  function getTestsForLevel(levelId){return Object.values(registry).filter(t=>t.levelId===levelId).sort((a,b)=>(a.order||999)-(b.order||999)||a.label.localeCompare(b.label));}
  window.ReadySetPrep={levels,levelOrder:['primary2','primary3','primary4','lower','middle','upper'],registerTest,getTest,getTestsForLevel,validateTest};
})();

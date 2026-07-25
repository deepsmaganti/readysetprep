(function(){
  'use strict';

  const cfg=window.RSP_SUPABASE_CONFIG||{};
  const configured=
    typeof cfg.url==='string' &&
    typeof cfg.publishableKey==='string' &&
    cfg.url.startsWith('https://') &&
    !cfg.url.includes('YOUR_SUPABASE') &&
    cfg.publishableKey.length>20 &&
    !cfg.publishableKey.includes('YOUR_SUPABASE');

  const client=configured && window.supabase
    ? window.supabase.createClient(cfg.url,cfg.publishableKey,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
      })
    : null;

  const ACTIVE_USER='readysetprep:active-user-id';
  const ACTIVE_STUDENT='readysetprep:active-student-id';
  const ACTIVE_STUDENT_NAME='readysetprep:active-student-name';
  const ACTIVE_STUDENT_LEVEL='readysetprep:active-student-level';
  const SCOPE_PREFIX='rsp:student:';
  const META_PREFIX='rsp:meta:';
  const LEGACY_MIGRATED='readysetprep:legacy-migrated-to-student';

  const rawGet=key=>Storage.prototype.getItem.call(window.localStorage,key);
  const rawSet=(key,value)=>Storage.prototype.setItem.call(window.localStorage,key,String(value));
  const rawRemove=key=>Storage.prototype.removeItem.call(window.localStorage,key);
  const rawKey=index=>Storage.prototype.key.call(window.localStorage,index);

  let syncReady=false;
  const pendingSync=new Map();

  function isTrackedStateKey(key){
    return typeof key==='string' && (
      key.startsWith('readysetprep_') ||
      key.startsWith('readysetprep:assessments:') ||
      key==='readysetprep:concept-practice-progress' ||
      key==='readysetprep:primary2-full-passage-progress:v1'
    );
  }

  function activeUserId(){return rawGet(ACTIVE_USER)||''}
  function activeStudentId(){return rawGet(ACTIVE_STUDENT)||''}
  function activeStudentName(){return rawGet(ACTIVE_STUDENT_NAME)||''}
  function activeStudentLevel(){return rawGet(ACTIVE_STUDENT_LEVEL)||'primary2'}

  function scopeKey(key,userId=activeUserId(),studentId=activeStudentId()){
    return `${SCOPE_PREFIX}${userId}:${studentId}:${key}`;
  }
  function metaKey(key,userId=activeUserId(),studentId=activeStudentId()){
    return `${META_PREFIX}${userId}:${studentId}:${key}`;
  }

  function localValueToJson(value){
    try{return JSON.parse(value)}
    catch(error){return value}
  }
  function cloudValueToLocal(value){
    return typeof value==='string'?value:JSON.stringify(value);
  }

  function scheduleSync(key,value){
    if(!syncReady || !client || !isTrackedStateKey(key))return;
    const userId=activeUserId();
    const studentId=activeStudentId();
    if(!userId||!studentId)return;

    const prior=pendingSync.get(key);
    if(prior){
      prior.value=value;
      return;
    }

    const record={value,timer:null};
    const important=
      key.startsWith('readysetprep:assessments:') ||
      key==='readysetprep:concept-practice-progress' ||
      key==='readysetprep:primary2-full-passage-progress:v1';
    record.timer=setTimeout(async()=>{
      pendingSync.delete(key);
      const currentUser=activeUserId();
      const currentStudent=activeStudentId();
      if(currentUser!==userId||currentStudent!==studentId)return;
      try{
        const {error}=await client.from('student_state').upsert({
          user_id:userId,
          student_id:studentId,
          state_key:key,
          state_value:localValueToJson(record.value),
          updated_at:new Date().toISOString()
        },{onConflict:'student_id,state_key'});
        if(error)console.warn('ReadySetPrep cloud sync failed:',error.message);
      }catch(error){
        console.warn('ReadySetPrep cloud sync failed:',error);
      }
    },important?120:3500);
    pendingSync.set(key,record);
  }

  function scheduleDelete(key){
    if(!syncReady || !client || !isTrackedStateKey(key))return;
    const userId=activeUserId();
    const studentId=activeStudentId();
    if(!userId||!studentId)return;
    setTimeout(async()=>{
      try{
        const {error}=await client.from('student_state')
          .delete()
          .eq('user_id',userId)
          .eq('student_id',studentId)
          .eq('state_key',key);
        if(error)console.warn('ReadySetPrep cloud delete failed:',error.message);
      }catch(error){
        console.warn('ReadySetPrep cloud delete failed:',error);
      }
    },50);
  }

  window.RSPStorage={
    getItem(key){
      if(isTrackedStateKey(key) && activeUserId() && activeStudentId()){
        return rawGet(scopeKey(key));
      }
      return rawGet(key);
    },
    setItem(key,value){
      if(isTrackedStateKey(key) && activeUserId() && activeStudentId()){
        rawSet(scopeKey(key),value);
        if(syncReady){
          rawSet(metaKey(key),new Date().toISOString());
          scheduleSync(key,String(value));
        }
        return;
      }
      rawSet(key,value);
    },
    removeItem(key){
      if(isTrackedStateKey(key) && activeUserId() && activeStudentId()){
        rawRemove(scopeKey(key));
        rawRemove(metaKey(key));
        scheduleDelete(key);
        return;
      }
      rawRemove(key);
    }
  };

  function showConfigurationMessage(){
    document.body.classList.remove('rsp-cloud-protected');
    document.body.innerHTML=`<main style="max-width:720px;margin:60px auto;padding:24px;font-family:Inter,system-ui,sans-serif">
      <section style="background:#fff;border:1px solid #d8dee8;border-radius:18px;padding:28px">
        <h1 style="margin-top:0">ReadySetPrep account setup required</h1>
        <p>Supabase has not been configured for this deployment yet.</p>
        <p>Update <b>supabase-config.js</b> with the Supabase project URL and publishable key, then redeploy.</p>
        <a href="index.html">Return home</a>
      </section>
    </main>`;
  }

  async function getUser(){
    if(!client)return null;
    try{
      const {data,error}=await client.auth.getUser();
      if(error)return null;
      return data.user||null;
    }catch(error){
      return null;
    }
  }

  async function ensureProfile(user,displayName=''){
    if(!client||!user)return;
    const name=(displayName||user.user_metadata?.display_name||user.email?.split('@')[0]||'Parent').trim();
    const {error}=await client.from('profiles').upsert({
      user_id:user.id,
      display_name:name,
      updated_at:new Date().toISOString()
    },{onConflict:'user_id'});
    if(error)console.warn('Profile update failed:',error.message);
  }

  function setActiveUser(user){
    const previous=activeUserId();
    rawSet(ACTIVE_USER,user.id);
    if(previous && previous!==user.id)clearActiveStudent();
  }

  function clearActiveStudent(){
    rawRemove(ACTIVE_STUDENT);
    rawRemove(ACTIVE_STUDENT_NAME);
    rawRemove(ACTIVE_STUDENT_LEVEL);
  }

  async function signIn(email,password){
    if(!client)throw new Error('Supabase is not configured.');
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(data.user){
      setActiveUser(data.user);
      await ensureProfile(data.user);
    }
    return data;
  }

  async function signUp(email,password,displayName){
    if(!client)throw new Error('Supabase is not configured.');
    const redirectTo=new URL('login.html',window.location.href).href;
    const {data,error}=await client.auth.signUp({
      email,password,
      options:{
        data:{display_name:displayName},
        emailRedirectTo:redirectTo
      }
    });
    if(error)throw error;
    if(data.user && data.session){
      setActiveUser(data.user);
      await ensureProfile(data.user,displayName);
    }
    return data;
  }

  async function signOut(){
    if(client){
      try{await client.auth.signOut()}catch(error){}
    }
    clearActiveStudent();
    rawRemove(ACTIVE_USER);
    rawRemove('readysetprep:user:v1');
  }

  async function loadProfile(){
    const user=await getUser();
    if(!user)return null;
    setActiveUser(user);
    const {data,error}=await client.from('profiles')
      .select('display_name')
      .eq('user_id',user.id)
      .maybeSingle();
    if(error)console.warn('Profile load failed:',error.message);
    return {
      user,
      displayName:data?.display_name||user.user_metadata?.display_name||user.email?.split('@')[0]||'Parent'
    };
  }

  async function listStudents(){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    setActiveUser(user);
    const {data,error}=await client.from('students')
      .select('id,user_id,name,level,created_at')
      .eq('user_id',user.id)
      .order('created_at',{ascending:true});
    if(error)throw error;
    return data||[];
  }

  async function addStudent(name,level){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    const cleanName=String(name||'').trim().slice(0,60);
    if(cleanName.length<1)throw new Error('Enter a student name.');
    const allowed=['primary2','primary3','primary4','lower','middle','upper'];
    if(!allowed.includes(level))throw new Error('Choose a valid level.');
    const {data,error}=await client.from('students')
      .insert({user_id:user.id,name:cleanName,level})
      .select('id,user_id,name,level,created_at')
      .single();
    if(error)throw error;
    return data;
  }

  async function updateStudent(studentId,changes){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    const patch={};
    if(changes.name!==undefined)patch.name=String(changes.name).trim().slice(0,60);
    if(changes.level!==undefined)patch.level=changes.level;
    patch.updated_at=new Date().toISOString();
    const {data,error}=await client.from('students')
      .update(patch)
      .eq('user_id',user.id)
      .eq('id',studentId)
      .select('id,user_id,name,level,created_at')
      .single();
    if(error)throw error;
    return data;
  }

  async function deleteStudent(studentId){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    const {error}=await client.from('students')
      .delete()
      .eq('user_id',user.id)
      .eq('id',studentId);
    if(error)throw error;
    if(activeStudentId()===studentId)clearActiveStudent();
  }

  function scopedLocalKeys(userId,studentId){
    const prefix=`${SCOPE_PREFIX}${userId}:${studentId}:`;
    const items=[];
    for(let i=0;i<window.localStorage.length;i++){
      const key=rawKey(i);
      if(key&&key.startsWith(prefix)){
        items.push({originalKey:key.slice(prefix.length),scopedKey:key});
      }
    }
    return items;
  }

  function legacyTrackedKeys(){
    const items=[];
    for(let i=0;i<window.localStorage.length;i++){
      const key=rawKey(i);
      if(key && isTrackedStateKey(key) && !key.startsWith(SCOPE_PREFIX)){
        const value=rawGet(key);
        if(value!==null)items.push({key,value});
      }
    }
    return items;
  }

  async function hydrateStudentState(studentId,{migrateLegacy=true}={}){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');

    const {data,error}=await client.from('student_state')
      .select('state_key,state_value,updated_at')
      .eq('user_id',user.id)
      .eq('student_id',studentId);
    if(error)throw error;

    const rows=data||[];
    const cloudKeys=new Set(rows.map(row=>row.state_key));
    const localItems=scopedLocalKeys(user.id,studentId);
    const localKeys=new Set(localItems.map(item=>item.originalKey));
    let changed=false;
    const upload=[];

    if(rows.length===0 && localItems.length===0 && migrateLegacy && !rawGet(LEGACY_MIGRATED)){
      const legacyItems=legacyTrackedKeys();
      for(const item of legacyItems){
        rawSet(scopeKey(item.key,user.id,studentId),item.value);
        rawSet(metaKey(item.key,user.id,studentId),new Date().toISOString());
        upload.push({
          user_id:user.id,
          student_id:studentId,
          state_key:item.key,
          state_value:localValueToJson(item.value),
          updated_at:new Date().toISOString()
        });
        changed=true;
      }
      if(legacyItems.length)rawSet(LEGACY_MIGRATED,studentId);
    }

    for(const row of rows){
      const sKey=scopeKey(row.state_key,user.id,studentId);
      const mKey=metaKey(row.state_key,user.id,studentId);
      const local=rawGet(sKey);
      const localUpdated=Date.parse(rawGet(mKey)||'')||0;
      const cloudUpdated=Date.parse(row.updated_at||'')||0;

      if(local!==null && localUpdated>cloudUpdated+1000){
        upload.push({
          user_id:user.id,
          student_id:studentId,
          state_key:row.state_key,
          state_value:localValueToJson(local),
          updated_at:new Date(localUpdated).toISOString()
        });
      }else{
        const next=cloudValueToLocal(row.state_value);
        if(local!==next){
          rawSet(sKey,next);
          changed=true;
        }
        rawSet(mKey,row.updated_at||new Date().toISOString());
      }
    }

    for(const item of localItems){
      if(!cloudKeys.has(item.originalKey)){
        const value=rawGet(item.scopedKey);
        if(value!==null){
          upload.push({
            user_id:user.id,
            student_id:studentId,
            state_key:item.originalKey,
            state_value:localValueToJson(value),
            updated_at:rawGet(metaKey(item.originalKey,user.id,studentId))||new Date().toISOString()
          });
        }
      }
    }

    if(upload.length){
      const {error:upsertError}=await client.from('student_state')
        .upsert(upload,{onConflict:'student_id,state_key'});
      if(upsertError)console.warn('Initial cloud sync failed:',upsertError.message);
    }

    return changed;
  }

  async function selectStudent(student){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    if(student.user_id && student.user_id!==user.id)throw new Error('Student account mismatch.');
    setActiveUser(user);
    rawSet(ACTIVE_STUDENT,student.id);
    rawSet(ACTIVE_STUDENT_NAME,student.name);
    rawSet(ACTIVE_STUDENT_LEVEL,student.level||'primary2');
    rawSet('readysetprep:selected-level',student.level||'primary2');
    await hydrateStudentState(student.id,{migrateLegacy:true});
    syncReady=true;
  }

  async function activeStudentRecord(){
    const user=await getUser();
    const studentId=activeStudentId();
    if(!user||!studentId)return null;
    const {data,error}=await client.from('students')
      .select('id,user_id,name,level,created_at')
      .eq('user_id',user.id)
      .eq('id',studentId)
      .maybeSingle();
    if(error)return null;
    return data||null;
  }

  function injectStudentBadge(student){
    if(document.getElementById('rspStudentBadge'))return;
    const badge=document.createElement('div');
    badge.id='rspStudentBadge';
    badge.innerHTML=`<span>Student: <b></b></span><a href="students.html">Switch</a>`;
    badge.querySelector('b').textContent=student.name;
    document.body.appendChild(badge);
  }

  async function guardStudentPage(){
    if(!configured){
      showConfigurationMessage();
      return false;
    }

    const user=await getUser();
    if(!user){
      location.replace(`login.html?next=${encodeURIComponent(location.pathname.split('/').pop()+location.search)}`);
      return false;
    }
    setActiveUser(user);

    const student=await activeStudentRecord();
    if(!student){
      clearActiveStudent();
      location.replace('students.html');
      return false;
    }

    rawSet(ACTIVE_STUDENT_NAME,student.name);
    rawSet(ACTIVE_STUDENT_LEVEL,student.level||'primary2');

    const changed=await hydrateStudentState(student.id,{migrateLegacy:false});
    const reloadKey=`rsp:hydrated:${user.id}:${student.id}:${location.pathname}`;
    const alreadyReloaded=sessionStorage.getItem(reloadKey)==='1';

    if(changed && !alreadyReloaded){
      sessionStorage.setItem(reloadKey,'1');
      location.reload();
      return false;
    }

    sessionStorage.removeItem(reloadKey);
    syncReady=true;
    document.body.classList.remove('rsp-cloud-protected');
    injectStudentBadge(student);
    return true;
  }

  async function requireUser(){
    if(!configured){
      showConfigurationMessage();
      return null;
    }
    const user=await getUser();
    if(!user){
      location.replace('login.html');
      return null;
    }
    setActiveUser(user);
    return user;
  }

  function progressUrl(){
    return activeStudentLevel()==='lower'
      ? 'lower-tests.html?view=history'
      : 'primary-tests.html?view=history';
  }

  window.RSPCloud={
    configured,
    client,
    getUser,
    signIn,
    signUp,
    signOut,
    ensureProfile,
    loadProfile,
    listStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    selectStudent,
    hydrateStudentState,
    guardStudentPage,
    requireUser,
    clearActiveStudent,
    activeUserId,
    activeStudentId,
    activeStudentName,
    activeStudentLevel,
    activeStudentRecord,
    progressUrl,
    showConfigurationMessage
  };

  const css=document.createElement('style');
  css.textContent=`
    #rspStudentBadge{
      position:fixed;right:16px;bottom:16px;z-index:9999;
      display:flex;align-items:center;gap:10px;
      padding:9px 12px;border:1px solid #d8dee8;border-radius:999px;
      background:#fff;box-shadow:0 8px 24px rgba(16,24,40,.14);
      color:#344054;font:700 12px/1.2 Inter,system-ui,sans-serif
    }
    #rspStudentBadge a{color:#315fba;text-decoration:none;font-weight:900}
    @media(max-width:600px){#rspStudentBadge{right:10px;bottom:10px}}
  `;
  document.head.appendChild(css);
})();
(function(){
  'use strict';

  const cfg=window.RSP_CONFIG||{};
  const authConfigured=
    typeof cfg.supabaseUrl==='string' &&
    typeof cfg.supabasePublishableKey==='string' &&
    cfg.supabaseUrl.startsWith('https://') &&
    !cfg.supabaseUrl.includes('YOUR_SUPABASE') &&
    cfg.supabasePublishableKey.length>20 &&
    !cfg.supabasePublishableKey.includes('YOUR_SUPABASE');

  const apiConfigured=
    typeof cfg.apiBaseUrl==='string' &&
    cfg.apiBaseUrl.startsWith('https://') &&
    !cfg.apiBaseUrl.includes('YOUR_');

  const configured=authConfigured&&apiConfigured;

  const client=authConfigured&&window.supabase
    ? window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{
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

  function clearActiveStudent(){
    rawRemove(ACTIVE_STUDENT);
    rawRemove(ACTIVE_STUDENT_NAME);
    rawRemove(ACTIVE_STUDENT_LEVEL);
  }
  function clearActiveAccount(){
    clearActiveStudent();
    rawRemove(ACTIVE_USER);
  }
  function setActiveUser(user){
    const previous=activeUserId();
    rawSet(ACTIVE_USER,user.id);
    if(previous&&previous!==user.id)clearActiveStudent();
  }

  async function getSession(){
    if(!client)return null;
    try{
      const {data,error}=await client.auth.getSession();
      if(error)return null;
      return data.session||null;
    }catch(error){
      return null;
    }
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

  async function apiRequest(path,{method='GET',body,auth=true}={}){
    if(!apiConfigured)throw new Error('ReadySetPrep cloud API is not configured.');
    const headers={'Accept':'application/json'};

    if(body!==undefined)headers['Content-Type']='application/json';

    if(auth){
      const session=await getSession();
      if(!session?.access_token)throw new Error('Please log in again.');
      headers['Authorization']=`Bearer ${session.access_token}`;
    }

    const response=await fetch(`${cfg.apiBaseUrl.replace(/\/$/,'')}${path}`,{
      method,
      headers,
      body:body===undefined?undefined:JSON.stringify(body)
    });

    const result=await response.json().catch(()=>({}));
    if(!response.ok){
      const error=new Error(result.error||`ReadySetPrep API error (${response.status}).`);
      error.status=response.status;
      throw error;
    }
    return result;
  }

  function scheduleSync(key,value){
    if(!syncReady||!configured||!isTrackedStateKey(key))return;
    const userId=activeUserId();
    const studentId=activeStudentId();
    if(!userId||!studentId)return;

    const existing=pendingSync.get(key);
    if(existing){
      existing.value=value;
      return;
    }

    const important=
      key.startsWith('readysetprep:assessments:') ||
      key==='readysetprep:concept-practice-progress' ||
      key==='readysetprep:primary2-full-passage-progress:v1';

    const record={value,timer:null};
    record.timer=setTimeout(async()=>{
      pendingSync.delete(key);
      if(activeUserId()!==userId||activeStudentId()!==studentId)return;
      const updatedAt=new Date().toISOString();
      try{
        await apiRequest('/student-state/upsert',{
          method:'POST',
          body:{
            student_id:studentId,
            items:[{
              state_key:key,
              state_value:localValueToJson(record.value),
              updated_at:updatedAt
            }]
          }
        });
        rawSet(metaKey(key,userId,studentId),updatedAt);
      }catch(error){
        console.warn('ReadySetPrep D1 sync failed:',error.message||error);
      }
    },important?120:3500);
    pendingSync.set(key,record);
  }

  function scheduleDelete(key){
    if(!syncReady||!configured||!isTrackedStateKey(key))return;
    const userId=activeUserId();
    const studentId=activeStudentId();
    if(!userId||!studentId)return;
    setTimeout(async()=>{
      try{
        await apiRequest('/student-state/delete',{
          method:'POST',
          body:{student_id:studentId,state_key:key}
        });
      }catch(error){
        console.warn('ReadySetPrep D1 delete failed:',error.message||error);
      }
    },50);
  }

  window.RSPStorage={
    getItem(key){
      if(isTrackedStateKey(key)&&activeUserId()&&activeStudentId()){
        return rawGet(scopeKey(key));
      }
      return rawGet(key);
    },
    setItem(key,value){
      if(isTrackedStateKey(key)&&activeUserId()&&activeStudentId()){
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
      if(isTrackedStateKey(key)&&activeUserId()&&activeStudentId()){
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
        <p>Guest practice is available, but account syncing has not been fully configured.</p>
        <p>Configure Supabase Auth and the separate Cloudflare D1 API in <b>supabase-config.js</b>.</p>
        <p><a href="practice.html">Continue as guest</a> · <a href="index.html">Return home</a></p>
      </section>
    </main>`;
  }

  async function ensureProfile(user,displayName=''){
    if(!configured||!user)return;
    const name=(displayName||user.user_metadata?.display_name||user.email?.split('@')[0]||'Parent').trim();
    await apiRequest('/profile',{
      method:'PUT',
      body:{display_name:name}
    });
  }

  async function signIn(email,password){
    if(!client)throw new Error('Supabase authentication is not configured.');
    if(!apiConfigured)throw new Error('ReadySetPrep cloud API is not configured.');
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error)throw error;
    if(data.user){
      setActiveUser(data.user);
      await ensureProfile(data.user);
    }
    return data;
  }

  async function signUp(email,password,displayName){
    if(!client)throw new Error('Supabase authentication is not configured.');
    if(!apiConfigured)throw new Error('ReadySetPrep cloud API is not configured.');
    const redirectTo=new URL('login.html',window.location.href).href;
    const {data,error}=await client.auth.signUp({
      email,password,
      options:{
        data:{display_name:displayName},
        emailRedirectTo:redirectTo
      }
    });
    if(error)throw error;
    if(data.user&&data.session){
      setActiveUser(data.user);
      await ensureProfile(data.user,displayName);
    }
    return data;
  }

  async function signOut(){
    if(client){
      try{await client.auth.signOut()}catch(error){}
    }
    clearActiveAccount();
  }

  async function loadProfile(){
    const user=await getUser();
    if(!user)return null;
    setActiveUser(user);
    const result=await apiRequest('/profile');
    return {
      user,
      displayName:result.profile?.display_name||
        user.user_metadata?.display_name||
        user.email?.split('@')[0]||
        'Parent'
    };
  }

  async function listStudents(){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    setActiveUser(user);
    const result=await apiRequest('/students');
    return result.students||[];
  }

  async function addStudent(name,level){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    const result=await apiRequest('/students',{
      method:'POST',
      body:{name,level}
    });
    return result.student;
  }

  async function updateStudent(studentId,changes){
    const result=await apiRequest(`/students/${encodeURIComponent(studentId)}`,{
      method:'PATCH',
      body:changes
    });
    return result.student;
  }

  async function deleteStudent(studentId){
    await apiRequest(`/students/${encodeURIComponent(studentId)}`,{method:'DELETE'});
    if(activeStudentId()===studentId)clearActiveStudent();
  }

  async function activeStudentRecord(){
    const user=await getUser();
    const studentId=activeStudentId();
    if(!user||!studentId)return null;
    try{
      const result=await apiRequest(`/students/${encodeURIComponent(studentId)}`);
      return result.student||null;
    }catch(error){
      if(error.status===404)return null;
      throw error;
    }
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
      if(key&&isTrackedStateKey(key)&&!key.startsWith(SCOPE_PREFIX)){
        const value=rawGet(key);
        if(value!==null)items.push({key,value});
      }
    }
    return items;
  }

  async function upsertStateItems(studentId,items){
    if(!items.length)return;
    await apiRequest('/student-state/upsert',{
      method:'POST',
      body:{student_id:studentId,items}
    });
  }

  async function hydrateStudentState(studentId,{migrateLegacy=true}={}){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');

    const result=await apiRequest(`/student-state?student_id=${encodeURIComponent(studentId)}`);
    const rows=result.items||[];
    const cloudKeys=new Set(rows.map(row=>row.state_key));
    const localItems=scopedLocalKeys(user.id,studentId);
    let changed=false;
    const upload=[];

    if(rows.length===0&&localItems.length===0&&migrateLegacy&&!rawGet(LEGACY_MIGRATED)){
      const legacyItems=legacyTrackedKeys();
      for(const item of legacyItems){
        const now=new Date().toISOString();
        rawSet(scopeKey(item.key,user.id,studentId),item.value);
        rawSet(metaKey(item.key,user.id,studentId),now);
        upload.push({
          state_key:item.key,
          state_value:localValueToJson(item.value),
          updated_at:now
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

      if(local!==null&&localUpdated>cloudUpdated+1000){
        upload.push({
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
            state_key:item.originalKey,
            state_value:localValueToJson(value),
            updated_at:rawGet(metaKey(item.originalKey,user.id,studentId))||new Date().toISOString()
          });
        }
      }
    }

    await upsertStateItems(studentId,upload);
    return changed;
  }

  async function selectStudent(student){
    const user=await getUser();
    if(!user)throw new Error('Not signed in.');
    if(student.user_id&&student.user_id!==user.id)throw new Error('Student account mismatch.');

    setActiveUser(user);
    rawSet(ACTIVE_STUDENT,student.id);
    rawSet(ACTIVE_STUDENT_NAME,student.name);
    rawSet(ACTIVE_STUDENT_LEVEL,student.level||'primary2');
    rawSet('readysetprep:selected-level',student.level||'primary2');

    await hydrateStudentState(student.id,{migrateLegacy:true});
    syncReady=true;
  }

  function injectStudentBadge(student){
    if(document.getElementById('rspStudentBadge'))return;
    const badge=document.createElement('div');
    badge.id='rspStudentBadge';
    badge.innerHTML=`<span>Student: <b></b></span><a href="students.html">Switch</a>`;
    badge.querySelector('b').textContent=student.name;
    document.body.appendChild(badge);
  }

  function injectGuestBadge(){
    if(document.getElementById('rspStudentBadge'))return;
    const badge=document.createElement('div');
    badge.id='rspStudentBadge';
    badge.innerHTML='<span><b>Guest practice</b></span><a href="login.html">Log in</a>';
    document.body.appendChild(badge);
  }

  async function guardStudentPage(){
    // Guest mode is always available, even if account services are not configured.
    if(!configured){
      clearActiveAccount();
      syncReady=false;
      document.body.classList.remove('rsp-cloud-protected');
      injectGuestBadge();
      return true;
    }

    const user=await getUser();
    if(!user){
      clearActiveAccount();
      syncReady=false;
      document.body.classList.remove('rsp-cloud-protected');
      injectGuestBadge();
      return true;
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
    const reloadKey=`rsp:d1-hydrated:${user.id}:${student.id}:${location.pathname}`;
    const alreadyReloaded=sessionStorage.getItem(reloadKey)==='1';

    if(changed&&!alreadyReloaded){
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

  async function sendContact(payload){
    return apiRequest('/contact',{
      method:'POST',
      body:payload,
      auth:false
    });
  }

  function progressUrl(){
    return activeStudentLevel()==='lower'
      ?'lower-tests.html?view=history'
      :'primary-tests.html?view=history';
  }

  window.RSPCloud={
    configured,
    authConfigured,
    apiConfigured,
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
    clearActiveAccount,
    activeUserId,
    activeStudentId,
    activeStudentName,
    activeStudentLevel,
    activeStudentRecord,
    isGuest:()=>!activeUserId()||!activeStudentId(),
    progressUrl,
    sendContact,
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
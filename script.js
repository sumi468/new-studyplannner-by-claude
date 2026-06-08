{l:'1陁E,s:'08:40',e:'09:25'},{l:'2陁E,s:'09:35',e:'10:20'},
  {l:'3陁E,s:'10:30',e:'11:15'},{l:'4陁E,s:'11:25',e:'12:10'},
  {l:'5陁E,s:'12:55',e:'13:40'},{l:'6陁E,s:'13:50',e:'14:35'},
  {l:'7陁E,s:'14:45',e:'15:30'},
];
const SAT_MAX=4;
const DN=['日','朁E,'火','水','木','釁E,'圁E];
const DAYS_WD=[{d:1,l:'朁E},{d:2,l:'火'},{d:3,l:'水'},{d:4,l:'木'},{d:5,l:'釁E},{d:6,l:'圁E}];
const JP_HOL={
  '2025-01-01':'允E��','2025-01-13':'成人の日','2025-02-11':'建国記念の日','2025-02-23':'天皁E��生日','2025-02-24':'振替休日','2025-03-20':'春刁E�E日','2025-04-29':'昭和�E日','2025-05-03':'憲法記念日','2025-05-04':'みどり�E日','2025-05-05':'こども�E日','2025-05-06':'振替休日','2025-07-21':'海の日','2025-08-11':'山の日','2025-09-15':'敬老�E日','2025-09-23':'秋�Eの日','2025-10-13':'スポ�EチE�E日','2025-11-03':'斁E��の日','2025-11-23':'勤労感謝�E日','2025-11-24':'振替休日','2025-12-23':'天皁E��生日',
  '2026-01-01':'允E��','2026-01-12':'成人の日','2026-02-11':'建国記念の日','2026-02-23':'天皁E��生日','2026-03-20':'春刁E�E日','2026-04-29':'昭和�E日','2026-05-03':'憲法記念日','2026-05-04':'みどり�E日','2026-05-05':'こども�E日','2026-05-06':'振替休日','2026-07-20':'海の日','2026-08-11':'山の日','2026-09-21':'敬老�E日','2026-09-22':'国民�E休日','2026-09-23':'秋�Eの日','2026-10-12':'スポ�EチE�E日','2026-11-03':'斁E��の日','2026-11-23':'勤労感謝�E日'
};

// ── Supabase 設宁E─────────────────────────────────────────
// ▼ ご�E身のSupabaseプロジェクチERLとanon keyに置き換えてください
const SUPA_URL = 'https://ymuemcvdatfblrzzrgyc.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdWVtY3ZkYXRmYmxyenpyZ3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTA3MjQsImV4cCI6MjA5NTI4NjcyNH0.HnEHYmdDfVNYTFsyeFrjvbIpYrZpbO-s6pCd2x1JGv0'; // SupabaseダチE��ュボ�Eド�ESettings→API→anon keyを貼めE
let _sb = null;
try {
  _sb = supabase.createClient(SUPA_URL, SUPA_ANON, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
} catch(e) { console.warn('Supabase init failed (placeholder keys):', e.message); }

let _sbUser = null; // ログイン中ユーザー
let _authTab = 'login';

// ── Auth UI ────────────────────────────────────────────────
function openAuth(){ const ov=document.getElementById('auth-overlay');ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open')); }
function closeAuth(){
  const ov=document.getElementById('auth-overlay');
  ov.style.opacity='0';
  setTimeout(()=>{
    ov.style.display='none';ov.style.opacity='';ov.classList.remove('open');
    // フォームをリセチE��
    document.getElementById('auth-form-body').style.display='';
    document.getElementById('auth-sent-panel').classList.remove('visible');
  },250);
}
function closeBgAuth(e){if(e.target===document.getElementById('auth-overlay'))closeAuth();}
function openGmail(){
  const ua=navigator.userAgent;
  if(/Android/i.test(ua)){
    // AndroidのGmailアプリスキームを試みめE    const t=setTimeout(()=>window.open('https://mail.google.com/mail/u/0/#inbox','_blank','noopener'),600);
    window.location.href='googlegmail://';
    window.addEventListener('blur',()=>clearTimeout(t),{once:true});
  } else {
    window.open('https://mail.google.com/mail/u/0/#inbox','_blank','noopener');
  }
}
function openAppleMail(){
  // iOS Mail.app を開く！Eailto: ではなぁEmessage:// スキームを使用�E�E  window.location.href='message://';
}
function switchAuthTab(tab){
  _authTab=tab;
  document.getElementById('auth-tab-login').classList.toggle('active',tab==='login');
  document.getElementById('auth-tab-signup').classList.toggle('active',tab==='signup');
  document.getElementById('auth-submit-btn').textContent=tab==='login'?'ログイン':'アカウントを作�E';
  document.getElementById('auth-err').textContent='';
}
async function doAuth(){
  if(!_sb){document.getElementById('auth-err').textContent='Supabaseの設定が忁E��です！EEADME参�E�E�E;return;}
  const email=document.getElementById('auth-email').value.trim();
  const password=document.getElementById('auth-password').value;
  const btn=document.getElementById('auth-submit-btn');
  if(!email||!password){document.getElementById('auth-err').textContent='メールとパスワードを入力してください';return;}
  btn.disabled=true;btn.textContent='処琁E��...';
  document.getElementById('auth-err').textContent='';
  let err;
  if(_authTab==='login'){
    ({error:err}=await _sb.auth.signInWithPassword({email,password}));
  } else {
    ({error:err}=await _sb.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+window.location.pathname}}));
  }
  btn.disabled=false;
  switchAuthTab(_authTab);
  if(err){document.getElementById('auth-err').textContent=_authErrMsg(err.message);return;}
  if(_authTab==='signup'){
    // 送信後UIに刁E��替ぁE    document.getElementById('auth-sent-email-label').textContent=email;
    document.getElementById('auth-form-body').style.display='none';
    document.getElementById('auth-sent-panel').classList.add('visible');
    return;
  }
  closeAuth();
}
function _authErrMsg(m){
  if(m.includes('Invalid login'))return 'メールまた�Eパスワードが違いまぁE;
  if(m.includes('Email not confirmed'))return 'メールアドレスを確認してください';
  if(m.includes('already registered'))return 'こ�Eメールアドレスはすでに登録済みでぁE;
  if(m.includes('Password should'))return 'パスワード�E6斁E��以上にしてください';
  return m;
}
async function doLogout(){
  if(!_sb)return;
  await _sb.auth.signOut();
  _sbUser=null;
  if(currentTab==='settings')buildSettings();
}

// ── Supabase チE�Eタ同期 ─────────────────────────────────────
async function syncToCloud(){
  if(!_sbUser||!_sb)return {ok:false,msg:'未ログイン'};
  const uid=_sbUser.id;
  const payload={
    user_id:uid, classes:JSON.stringify(classes), routines:JSON.stringify(routines),
    tasks:JSON.stringify(tasks), tests:JSON.stringify(tests), holidays:JSON.stringify(holidays),
    updated_at:new Date().toISOString()
  };
  const {error}=await _sb.from('planner_data').upsert(payload,{onConflict:'user_id'});
  if(error){console.error('[NEXA sync] upsert error:',error.code,error.message,error.details);}
  return {ok:!error, msg:error?`${error.code}: ${error.message}`:null};
}
async function syncFromCloud(){
  if(!_sbUser||!_sb)return false;
  const {data,error}=await _sb.from('planner_data').select('*').eq('user_id',_sbUser.id).single();
  if(error){console.error('[NEXA sync] select error:',error.code,error.message);return false;}
  if(!data)return false;
  try{
    classes=JSON.parse(data.classes||'[]');
    routines=JSON.parse(data.routines||'[]');
    tasks=JSON.parse(data.tasks||'[]');
    tests=JSON.parse(data.tests||'[]');
    holidays=JSON.parse(data.holidays||'[]');
    sv(); // ローカルにも保孁E    if(currentTab==='today')buildToday();
    else if(currentTab==='school')buildTT();
    else if(currentTab==='routine')buildRoutineList();
    else if(currentTab==='task')buildTaskList();
    updateCal();
    return true;
  }catch(e){console.error('[NEXA sync] parse error:',e);return false;}
}
async function doSync(){
  const btn=document.querySelector('.acct-sync-btn');
  if(btn){btn.classList.add('syncing');}
  const {ok,msg}=await syncToCloud();
  if(btn){
    btn.classList.remove('syncing');
    btn.querySelector('span').textContent=ok?'同期完亁E:'同期失敁E;
    if(!ok&&msg){
      const statusEl=document.querySelector('.acct-status');
      if(statusEl){const prev=statusEl.innerHTML;statusEl.innerHTML=`<span style="color:#fca5a5;font-size:10px">${msg}</span>`;setTimeout(()=>{statusEl.innerHTML=prev;},5000);}
    }
  }
  setTimeout(()=>{if(btn)btn.querySelector('span').textContent='クラウド同朁E;},2000);
}

// ── ログイン状態�E購読 ─────────────────────────────────────
async function initAuth(){
  if(!_sb)return;
  const code=new URLSearchParams(window.location.search).get('code');
  if(code){
    await _sb.auth.exchangeCodeForSession(code);
    window.history.replaceState({},'',window.location.pathname);
  }
  const {data:{session}}=await _sb.auth.getSession();
  if(session){_sbUser=session.user;await syncFromCloud();}
  _sb.auth.onAuthStateChange((_event,session)=>{
    _sbUser=session?.user||null;
    if(_event==='PASSWORD_RECOVERY'){showNewPasswordForm();return;}
    if(_sbUser)syncFromCloud();
    if(currentTab==='settings')buildSettings();
  });
}

function showResetForm(){
  document.getElementById('auth-form-body').style.display='none';
  document.getElementById('auth-sent-panel').classList.remove('visible');
  document.getElementById('auth-reset-newpw-wrap').style.display='none';
  document.getElementById('auth-reset-email').style.display='';
  document.getElementById('auth-reset-title').textContent='パスワードをリセチE��';
  document.getElementById('auth-reset-body').textContent='メールアドレスを�E力してください。リセチE��リンクを送信します、E;
  document.getElementById('auth-reset-btn').textContent='送信する';
  document.getElementById('auth-reset-err').textContent='';
  document.getElementById('auth-reset-panel').classList.add('visible');
  const ov=document.getElementById('auth-overlay');ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}
function showNewPasswordForm(){
  document.getElementById('auth-form-body').style.display='none';
  document.getElementById('auth-sent-panel').classList.remove('visible');
  document.getElementById('auth-reset-email').style.display='none';
  document.getElementById('auth-reset-newpw-wrap').style.display='';
  document.getElementById('auth-reset-title').textContent='新しいパスワードを設宁E;
  document.getElementById('auth-reset-body').textContent='新しいパスワードを入力してください、E;
  document.getElementById('auth-reset-btn').textContent='パスワードを変更する';
  document.getElementById('auth-reset-err').textContent='';
  document.getElementById('auth-reset-panel').classList.add('visible');
  const ov=document.getElementById('auth-overlay');ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}
async function doReset(){
  if(!_sb)return;
  const btn=document.getElementById('auth-reset-btn');
  const errEl=document.getElementById('auth-reset-err');
  errEl.textContent='';
  // 新パスワード設定モーチE  if(document.getElementById('auth-reset-newpw-wrap').style.display!=='none'){
    const pw=document.getElementById('auth-reset-newpw').value;
    if(!pw||pw.length<6){errEl.textContent='パスワード�E6斁E��以上にしてください';return;}
    btn.disabled=true;btn.textContent='処琁E��...';
    const {error}=await _sb.auth.updateUser({password:pw});
    btn.disabled=false;
    if(error){errEl.textContent=error.message;btn.textContent='パスワードを変更する';return;}
    document.getElementById('auth-reset-title').textContent='変更完亁E;
    document.getElementById('auth-reset-body').textContent='パスワードを変更しました。このまま続けて利用できます、E;
    document.getElementById('auth-reset-newpw-wrap').style.display='none';
    btn.style.display='none';
    return;
  }
  // メール送信モーチE  const email=document.getElementById('auth-reset-email').value.trim();
  if(!email){errEl.textContent='メールアドレスを�E力してください';return;}
  btn.disabled=true;btn.textContent='送信中...';
  const {error}=await _sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});
  btn.disabled=false;
  if(error){errEl.textContent=error.message;btn.textContent='送信する';return;}
  document.getElementById('auth-reset-title').textContent='メールを送信しました';
  document.getElementById('auth-reset-body').textContent='受信トレイを確認し、リンクを開ぁE��ください。迷惑メールフォルダもご確認ください、E;
  document.getElementById('auth-reset-email').style.display='none';
  btn.style.display='none';
}

// ── sv() をクラウド同期対応に上書ぁE───────────────────────

let classes=JSON.parse(localStorage.getItem('sp_cl')||'[]');
let routines=JSON.parse(localStorage.getItem('sp_rt')||'[]');
let tasks=JSON.parse(localStorage.getItem('sp_tk')||'[]');
let tests=JSON.parse(localStorage.getItem('sp_te')||'[]');
let holidays=JSON.parse(localStorage.getItem('sp_hol')||'[]');
let vacations=JSON.parse(localStorage.getItem('sp_vac')||'[]');
let sfDay=1,sfPeriod=0;

// ================================================================
// ⑭ NEXA Subject Color System
// ================================================================
const SUBJECT_COLORS = {
  math:    { bg:'#EFF6FF', border:'rgba(59,130,246,.22)',  accent:'#2563EB', text:'#1e3a8a', time:'#3b82f6' },
  english: { bg:'#F5F3FF', border:'rgba(124,58,237,.20)',  accent:'#7c3aed', text:'#3b0764', time:'#8b5cf6' },
  japanese:{ bg:'#FFF7ED', border:'rgba(234,88,12,.20)',   accent:'#ea580c', text:'#7c2d12', time:'#f97316' },
  science: { bg:'#F0FDF4', border:'rgba(22,163,74,.20)',   accent:'#16a34a', text:'#14532d', time:'#22c55e' },
  social:  { bg:'#FFFBEB', border:'rgba(217,119,6,.22)',   accent:'#d97706', text:'#78350f', time:'#f59e0b' },
  info:    { bg:'#ECFEFF', border:'rgba(8,145,178,.20)',   accent:'#0891b2', text:'#164e63', time:'#06b6d4' },
  art:     { bg:'#FDF2F8', border:'rgba(219,39,119,.18)',  accent:'#db2777', text:'#831843', time:'#ec4899' },
  pe:      { bg:'#FFF1F2', border:'rgba(225,29,72,.20)',   accent:'#e11d48', text:'#881337', time:'#f43f5e' },
  home:    { bg:'#FFF5F0', border:'rgba(251,113,133,.25)', accent:'#fb7185', text:'#9f1239', time:'#fda4af' },
  inquiry: { bg:'#EEF2FF', border:'rgba(99,102,241,.20)',  accent:'#6366f1', text:'#312e81', time:'#818cf8' },
  hr:      { bg:'#F8FAFC', border:'rgba(100,116,139,.18)', accent:'#64748b', text:'#1e293b', time:'#94a3b8' },
  default: { bg:'#F6F8FC', border:'rgba(100,116,139,.15)', accent:'#475569', text:'#1e293b', time:'#94a3b8' },
};

// キーワード�EカチE��リ ルール
const SUBJECT_RULES = [
  { cat:'math',    words:['数学','算数','数II','数III','数A','数B','数C','統訁E,'微刁E,'積�E','線形','代数','ベクトル'] },
  { cat:'english', words:['英誁E,'英会話','英斁E,'リーチE��ング','ライチE��ング','リスニング','スピ�Eキング','コミュニケーション英','論理表現','英表','英語表現'] },
  { cat:'japanese',words:['国誁E,'現代斁E,'現代の国誁E,'言語文匁E,'古典','古斁E,'漢斁E,'小諁E,'論理国誁E,'斁E��国誁E,'現国','古典探究'] },
  { cat:'science', words:['琁E��E,'物琁E,'化学','生物','地学','科学','実騁E] },
  { cat:'social',  words:['社企E,'歴史','地琁E,'公氁E,'政治','経渁E,'公共','倫琁E,'日本史','世界史','地琁E��究','地歴','現社'] },
  { cat:'info',    words:['惁E��','プログラム','コンピュータ','ICT','チE�Eタ','AI','DX','惁E��I','惁E��II'] },
  { cat:'art',     words:['美衁E,'芸衁E,'音楽','書遁E,'工芸','チE��イン','アーチE,'図工','鑑賁E] },
  { cat:'pe',      words:['体育','保健体育','スポ�EチE,'武遁E,'ダンス','体操','保健'] },
  { cat:'home',    words:['家庭','家庭基礁E,'家庭総合','調琁E,'被朁E,'家政','生活','フ�Eドデザイン'] },
  { cat:'inquiry', words:['探究','総合','プロジェクチE,'課題研究','探究学翁E,'ゼチE,'卒業研究','SSH','SGH'] },
  { cat:'hr',      words:['ホ�Eムルーム','HR','進路','LHR','学活','朝礼','終礼','ガイダンス','キャリア'] },
];

// ユーザーカスタム�E�封E��皁E��localStorageで永続化�E�Elet subjectColorOverrides = {};
try { subjectColorOverrides = JSON.parse(localStorage.getItem('nexa_sub_colors') || '{}'); } catch(e) {}

// ハッシュベ�Eス安定色生�E�E�カチE��リ不�E科目用�E�Efunction _hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  const palette = [
    { bg:'#EFF6FF', border:'rgba(59,130,246,.20)',  accent:'#3b82f6', text:'#1e3a8a', time:'#60a5fa' },
    { bg:'#F5F3FF', border:'rgba(124,58,237,.18)',  accent:'#7c3aed', text:'#3b0764', time:'#a78bfa' },
    { bg:'#FFF7ED', border:'rgba(234,88,12,.18)',   accent:'#ea580c', text:'#7c2d12', time:'#fb923c' },
    { bg:'#F0FDF4', border:'rgba(22,163,74,.18)',   accent:'#16a34a', text:'#14532d', time:'#4ade80' },
    { bg:'#FFFBEB', border:'rgba(217,119,6,.18)',   accent:'#d97706', text:'#78350f', time:'#fbbf24' },
    { bg:'#ECFEFF', border:'rgba(8,145,178,.18)',   accent:'#0891b2', text:'#164e63', time:'#22d3ee' },
    { bg:'#FDF2F8', border:'rgba(219,39,119,.15)',  accent:'#db2777', text:'#831843', time:'#f472b6' },
    { bg:'#FFF1F2', border:'rgba(225,29,72,.16)',   accent:'#e11d48', text:'#881337', time:'#fb7185' },
    { bg:'#EEF2FF', border:'rgba(99,102,241,.18)',  accent:'#6366f1', text:'#312e81', time:'#a5b4fc' },
    { bg:'#F0FDFA', border:'rgba(13,148,136,.18)',  accent:'#0d9488', text:'#134e4a', time:'#2dd4bf' },
    { bg:'#FFF5F0', border:'rgba(251,113,133,.22)', accent:'#fb7185', text:'#9f1239', time:'#fda4af' },
    { bg:'#F8FAFC', border:'rgba(100,116,139,.15)', accent:'#64748b', text:'#1e293b', time:'#94a3b8' },
  ];
  return palette[Math.abs(h) % palette.length];
}

// メイン�E�科目名�Eカラート�Eクン
function getSubjectColor(subName) {
  if (!subName) return SUBJECT_COLORS.default;
  if (subjectColorOverrides[subName]) {
    return SUBJECT_COLORS[subjectColorOverrides[subName]] || SUBJECT_COLORS.default;
  }
  for (const rule of SUBJECT_RULES) {
    if (rule.words.some(w => subName.includes(w))) return SUBJECT_COLORS[rule.cat];
  }
  return _hashColor(subName);
}

// CSS変数斁E���E生�E
function subColorStyle(subName) {
  const c = getSubjectColor(subName);
  return `--sub-bg:${c.bg};--sub-border:${c.border};--sub-accent:${c.accent};--sub-text:${c.text};--sub-time:${c.time};`;
}

// 封E��用�E�ユーザーが科目カチE��リをカスタム設定する関数
function setSubjectColorOverride(subName, category) {
  if (!subName) return;
  if (category) subjectColorOverrides[subName] = category;
  else delete subjectColorOverrides[subName];
  try { localStorage.setItem('nexa_sub_colors', JSON.stringify(subjectColorOverrides)); } catch(e) {}
  buildTT();
  if (currentTab === 'today') buildToday();
}
// ================================================================


function sv(){
  try{localStorage.setItem('sp_cl',JSON.stringify(classes))}catch(e){}
  try{localStorage.setItem('sp_rt',JSON.stringify(routines))}catch(e){}
  try{localStorage.setItem('sp_tk',JSON.stringify(tasks))}catch(e){}
  try{localStorage.setItem('sp_te',JSON.stringify(tests))}catch(e){}
  try{localStorage.setItem('sp_hol',JSON.stringify(holidays))}catch(e){}
  try{localStorage.setItem('sp_vac',JSON.stringify(vacations))}catch(e){}
  if(_sbUser)syncToCloud().catch(()=>{}); // クラウドにも反映�E�失敗�E静音�E�E}

let currentTab='today',calMode='week',prevTabIdx=0;
let _autoScrollToday=true; // 起動時のみ自動スクロール
let selDS=toDS(new Date()),selDow=new Date().getDay();
let weekOff=0,monthOff=0,schoolOpen=false;

function toDS(d){return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
function z(n){return String(n).padStart(2,'0')}
function tm(t){const[h,m]=t.split(':').map(Number);return h*60+m}
function mt(m){return z(Math.floor(m/60))+':'+z(m%60)}
function isHol(ds){return !!JP_HOL[ds]||holidays.some(h=>h.date===ds)}
function holN(ds){const c=holidays.find(h=>h.date===ds);return c?c.name||'休校日':JP_HOL[ds]||'祝日'}
function isOff(ds){const d=new Date(ds+'T00:00:00');return d.getDay()===0||isHol(ds)}

function setMode(m){
  calMode=m;
  document.getElementById('mode-week').classList.toggle('active',m==='week');
  document.getElementById('mode-month').classList.toggle('active',m==='month');
  if(m==='month'){const p=selDS.split('-');document.getElementById('page-big').textContent=`${p[0]}年${parseInt(p[1])}朁E;document.getElementById('page-small').textContent='月間表示';}
  updateCal();
}
function prevPeriod(){calMode==='week'?weekOff--:monthOff--;updateCal();}
function nextPeriod(){calMode==='week'?weekOff++:monthOff++;updateCal();}
function updateCal(){calMode==='week'?buildWeek():buildMonth();}

function buildWeek(){
  const now=new Date();
  const base=new Date(now);base.setDate(now.getDate()-((now.getDay()+6)%7)+weekOff*7);
  let h='';
  for(let i=0;i<7;i++){
    const d=new Date(base);d.setDate(base.getDate()+i);
    const dd=d.getDay(),ds=toDS(d);
    const isSel=ds===selDS,isToday=d.toDateString()===now.toDateString();
    const hol=isHol(ds),isSun=dd===0,isSat=dd===6;
    let cls='wd';
    if(isSel)cls+=' active';if(isToday)cls+=' today-dot';
    if(isSun||hol)cls+=' hol';else if(isSat)cls+=' sat';
    h+=`<div class="${cls}" onclick="selDay(${dd},'${ds}')"><div class="wd-label">${DN[dd]}</div><div class="wd-num">${d.getDate()}</div>${hol?`<div class="hol-label">${holN(ds)}</div>`:''}</div>`;
  }
  document.getElementById('cal-area').innerHTML=`<div class="week-strip">${h}</div>`;
}

function buildMonth(){
  const now=new Date();
  const base=new Date(now.getFullYear(),now.getMonth()+monthOff,1);
  const yr=base.getFullYear(),mo=base.getMonth();
  document.getElementById('page-big').textContent=`${yr}年${mo+1}朁E;
  document.getElementById('page-small').textContent='月間表示';
  const fd=(base.getDay()+6)%7,dim=new Date(yr,mo+1,0).getDate(),pdim=new Date(yr,mo,0).getDate();
  let h=`<div class="month-grid"><div class="month-header">`;
  ['朁E,'火','水','木','釁E,'圁E,'日'].forEach((d,i)=>{h+=`<div style="color:${i===5?'#2563eb':i===6?'#dc2626':'var(--muted)'};font-size:11px;text-align:center">${d}</div>`;});
  h+='</div><div class="month-days">';
  for(let i=0;i<fd;i++)h+=`<div class="mc other-month"><span class="mc-num" style="font-size:12px">${pdim-fd+1+i}</span></div>`;
  for(let d=1;d<=dim;d++){
    const ds=`${yr}-${z(mo+1)}-${z(d)}`;
    const date=new Date(yr,mo,d),dow=date.getDay();
    const isToday=ds===toDS(now),isSel=ds===selDS;
    const hol=isHol(ds),isSun=dow===0,isSat=dow===6;
    let cls='mc';
    if(isSel)cls+=' active';if(isToday)cls+=' today-dot';
    if(isSun||hol)cls+=' hol';else if(isSat)cls+=' sat';
    const tDot=tests.some(t=>ds>=t.start&&ds<=t.end);
    const cDot=classes.some(c=>c.day==dow);
    h+=`<div class="${cls}" onclick="selDayM('${ds}',${dow})"><span class="mc-num" style="font-size:12px">${d}</span>${(cDot||tDot)?`<div style="display:flex;gap:2px">${cDot?`<div class="mc-dot" style="background:var(--acc)"></div>`:''}${tDot?`<div class="mc-dot" style="background:#dc2626"></div>`:''}</div>`:''}</div>`;
  }
  const rem=(fd+dim)%7===0?0:7-(fd+dim)%7;
  for(let i=1;i<=rem;i++)h+=`<div class="mc other-month"><span class="mc-num" style="font-size:12px">${i}</span></div>`;
  h+='</div></div>';
  document.getElementById('cal-area').innerHTML=h;
}

function selDay(dd,ds){selDow=dd;selDS=ds;updateCal();fadeDateTo(ds);closeSchool();if(currentTab==='today')buildToday();}
function selDayM(ds,dow){
  selDow=dow;selDS=ds;
  const now=new Date(),sel=new Date(ds+'T00:00:00');
  const diff=Math.round((sel-now)/86400000);
  const nd=(now.getDay()+6)%7,sd=(dow+6)%7;
  weekOff=Math.floor((diff+nd-sd)/7);
  calMode='week';
  document.getElementById('mode-week').classList.add('active');
  document.getElementById('mode-month').classList.remove('active');
  buildWeek();fadeDateTo(ds);if(currentTab==='today')buildToday();
}
function fadeDateTo(ds){
  const pg=document.getElementById('page-big');
  pg.style.opacity='0';pg.style.transform='translateY(4px)';
  setTimeout(()=>{const p=ds.split('-');pg.textContent=`${parseInt(p[1])}朁E{parseInt(p[2])}日`;pg.style.opacity='1';pg.style.transform='none';},120);
  if(currentTab==='today')document.getElementById('page-small').textContent='今日';
}

function setTab(t,label,idx){
  const dir=idx>prevTabIdx?'slide-left':'slide-right';prevTabIdx=idx;
  currentTab=t;
  document.querySelectorAll('.bnav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('bnav-'+t).classList.add('active');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active','slide-left','slide-right'));
  const vEl=document.getElementById('view-'+t);
  requestAnimationFrame(()=>{vEl.classList.add('active');if(t!=='today')vEl.classList.add(dir);setTimeout(()=>vEl.classList.remove('slide-left','slide-right'),350);});
  if(t!=='today'){
    document.getElementById('page-small').textContent=label;
    const pg=document.getElementById('page-big');pg.style.opacity='0';setTimeout(()=>{pg.textContent='';pg.style.opacity='1';},120);
  } else {document.getElementById('page-small').textContent='今日';fadeDateTo(selDS);}
  closeSchool();
  if(t==='today'){buildToday();updateCal();}
  else if(t==='school')buildTT();
  else if(t==='routine')buildRoutineList();
  else if(t==='task')buildTaskList();
  else if(t==='settings')buildSettings();
}

let todaySegment='today'; // 'today' | 'schedule'

function buildToday(){
  const dow=selDow,isSat=dow===6,off=isOff(selDS);
  const now=new Date();
  const isToday2=(selDS===toDS(now));

  let inner='';

  // ⑪ 長期休暇バナー
  const vac=getVacation(selDS);
  if(vac){
    inner+=`<div class="vac-banner"><div class="vac-banner-icon">🌴</div><div><div class="vac-banner-title">${vac.name}期間中</div><div class="vac-banner-sub">${vac.start} 、E${vac.end}</div></div></div>`;
    if(todaySegment==='schedule'){
      document.getElementById('today-inner').innerHTML=inner;return;
    }
  }

  {
    // ── 今日ビュー ──
    if(off){
      const reason=dow===0?'日曜日':holN(selDS);
      inner+=`<div class="off-banner"><div style="font-size:28px">🏖�E�E/div><div><div style="font-size:15px;font-weight:700;color:#991b1b">${reason}</div><div style="font-size:12px;color:#b91c1c;margin-top:2px">学校はお休みです！E/div></div></div>`;
    }

    // ⑥ 【今日の時間割】カード（タチE�Eで時間割タブへ移動！E    const maxP=isSat?SAT_MAX:PERIODS.length;
    const dayClasses=(!off&&dow>=1&&dow<=6)?classes.filter(c=>c.day==dow&&c.period<maxP):[];
    if(dayClasses.length>0){
      const subLabel=`${dayClasses.length}科目`;
      inner+=`<div class="today-tt-card" onclick="setTab('school','時間割',1)">
        <div class="today-tt-card-left"><div class="today-tt-card-icon"><i class="ti ti-school"></i></div><div><div class="today-tt-card-title">今日の時間割</div><div class="today-tt-card-sub">${subLabel} · タチE�Eして確誁E/div></div></div>
        <i class="ti ti-chevron-right" style="color:var(--muted);font-size:16px;flex-shrink:0"></i>
      </div>`;
    }

    // タイムライン�E�ルーチE��ーン�E�タスクのみ�E�E    const events=[];
    routines.forEach(r=>events.push({time:r.time,end:mt(tm(r.time)+r.dur),title:r.name,type:'routine'}));
    tasks.filter(t=>!t.done).forEach(t=>events.push({time:t.time,end:mt(tm(t.time)+30),title:t.text,type:'todo'}));
    const START_H=4,END_H=22;
    const nowMin=now.getHours()*60+now.getMinutes();
    let tl=`<div class="timeline-wrap">`;
    for(let h=START_H;h<=END_H;h++){
      const hMin=h*60;
      const blocksHere=events.filter(e=>tm(e.time)>=hMin&&tm(e.time)<hMin+60);
      let nowLine='';
      if(isToday2&&nowMin>=hMin&&nowMin<hMin+60){
        const pct=((nowMin-hMin)/60)*100;
        nowLine=`<div class="tl-now-line" style="top:${pct}%"><div class="tl-now-dot"></div></div>`;
      }
      const bHtml=blocksHere.map(e=>`<div class="ev ev-${e.type}"><div class="ev-title">${e.title}</div><div class="ev-time">${e.time}  E${e.end}</div></div>`).join('');
      tl+=`<div class="tl-row"><div class="tl-label">${z(h)}:00</div><div class="tl-track" style="position:relative">${nowLine}${bHtml}</div></div>`;
    }
    tl+=`</div>`;
    inner+=tl;

    const t0=new Date();t0.setHours(0,0,0,0);
    const up=tests.slice().sort((a,b)=>a.start.localeCompare(b.start)).filter(t=>{const e=new Date(t.end);e.setHours(0,0,0,0);return e>=t0;}).slice(0,4);
    if(up.length){
      inner+=`<div class="sec-title">チE��トまでの日数</div><div class="cd-grid">`+up.map(t=>{
        const ds=new Date(t.start);ds.setHours(0,0,0,0);
        const de=new Date(t.end);de.setHours(0,0,0,0);
        const dfs=Math.round((ds-t0)/86400000),dfe=Math.round((de-t0)/86400000);
        const ongoing=dfs<=0&&dfe>=0;
        const span=t.start===t.end?t.start:`${t.start}、E{t.end}`;
        return`<div class="cd-card"><div style="font-size:13px;font-weight:600;margin-bottom:5px">${t.sub}</div><div class="cd-num ${dfs<=3&&!ongoing?'urgent':''}">${ongoing?'中':dfs<=0?'0':dfs}</div><div style="font-size:11px;color:var(--muted);margin-top:4px">${ongoing?'🔥 実施中':dfs===0?'今日から�E�E:dfs+'日征E}</div><div style="font-size:10px;color:var(--muted);margin-top:2px">${span}</div></div>`;
      }).join('')+'</div>';
    }
    inner+=`<button class="print-btn" onclick="doPrint()"><i class="ti ti-printer"></i> 今日の予定を印刷する</button>`;

  }

  document.getElementById('today-inner').innerHTML=inner;
  if(isToday2&&_autoScrollToday){
    _autoScrollToday=false;
    setTimeout(()=>{
      const cont=document.querySelector('.content');
      const rows=document.querySelectorAll('.tl-row');
      if(rows.length>0){const rowH=rows[0].offsetHeight||56;cont.scrollTop=rowH*Math.max(0,now.getHours()-4-1);}
    },100);
  }
}



function toggleSchool(){const panel=document.getElementById('school-panel');if(!panel)return;schoolOpen=!schoolOpen;panel.classList.toggle('open',schoolOpen);const arrow=document.getElementById('school-toggle-arrow');if(arrow)arrow.classList.toggle('open',schoolOpen);}
function closeSchool(){schoolOpen=false;const p=document.getElementById('school-panel');if(p)p.classList.remove('open');const arrow=document.getElementById('school-toggle-arrow');if(arrow)arrow.classList.remove('open');}

function buildTT(){
  const now=new Date(),td=now.getDay();
  // ⑦ 今日の授業カーチE  (function buildTodayCard(){
    const ds=toDS(now),isSat=td===6,off=isOff(ds);
    const maxP=isSat?SAT_MAX:PERIODS.length;
    const todayC=(!off&&td>=1&&td<=6)?classes.filter(c=>c.day==td&&c.period<maxP).sort((a,b)=>a.period-b.period):[];
    let cardHtml='';
    if(todayC.length>0){
      const rows=todayC.map(c=>{
        const sc=getSubjectColor(c.sub);
        return `<div class="today-card-row"><span class="today-card-period" style="color:${sc.accent}">${PERIODS[c.period].l}</span><span class="today-card-sub" style="color:${sc.text}">${c.sub}</span></div>`;
      }).join('');
      cardHtml=`<div class="today-class-card"><div class="today-class-card-title">今日の授業</div><div class="today-class-card-list">${rows}</div></div>`;
    } else if(!off&&td>=1&&td<=6){
      cardHtml=`<div class="today-class-card today-class-card-empty"><div class="today-class-card-title">今日の授業</div><div style="font-size:13px;color:var(--muted);margin-top:6px">授業はありません</div></div>`;
    } else {
      cardHtml=`<div class="today-class-card today-class-card-empty"><div class="today-class-card-title">今日の授業</div><div style="font-size:13px;color:var(--muted);margin-top:6px">${td===0?'日曜日':holN(ds)}のためお休み</div></div>`;
    }
    const existing=document.getElementById('tt-today-card');
    if(existing)existing.outerHTML=cardHtml;
    else{
      const schoolView=document.getElementById('view-school');
      const ttWrap=schoolView.querySelector('.tt-wrap');
      const cardDiv=document.createElement('div');
      cardDiv.id='tt-today-card';
      cardDiv.innerHTML=cardHtml;
      schoolView.insertBefore(cardDiv,ttWrap);
    }
  })();
  // ヘッダー衁E  let h='<div class="tt-head tt-head-empty"></div>';
  DAYS_WD.forEach(({d,l})=>{
    h+=`<div class="tt-head ${d===td?'tcol':''}">${l}${d===6?'<div style="font-size:7px;margin-top:1px;opacity:.7">、E陁E/div>':''}</div>`;
  });
  // 時限衁E  PERIODS.forEach((p,pi)=>{
    h+=`<div class="tt-time-cell"><div class="t-limit">${pi+1}</div><div class="t-range">${p.s}</div></div>`;
    DAYS_WD.forEach(({d})=>{
      const satOff=d===6&&pi>=SAT_MAX;
      const c=classes.find(c=>c.day==d&&c.period==pi);
      const idx=c?classes.indexOf(c):-1;
      let cellContent='';
      if(!satOff&&c){
        // ⑭ カラーシスチE��適用
        const cs=subColorStyle(c.sub);
        cellContent=`<div class="tt-item" style="${cs}" onclick="askDelClass(${idx})"><div class="tt-item-name">${c.sub}</div><div class="tt-item-time">${p.s} E{p.e}</div></div>`;
      }
      h+=`<div class="tt-cell ${d===td?'tcol':''} ${satOff?'off':''}">${cellContent}</div>`;
    });
  });
  document.getElementById('tt-grid').innerHTML=h;
  // iPad以上：サイドパネルを生戁E  buildTTSide();
}

function buildTTSide(){
  const el=document.getElementById('tt-school-side');
  if(!el)return;
  const now=new Date(),td=now.getDay(),ds=toDS(now);
  const isSat=td===6,off=isOff(ds);
  const maxP=isSat?SAT_MAX:PERIODS.length;
  const todayC=(!off&&td>=1&&td<=6)?classes.filter(c=>c.day==td&&c.period<maxP):[];
  // 今日の授業
  let todayHtml=todayC.length
    ?todayC.map(c=>{const p=PERIODS[c.period];return`<div class="tt-side-row"><div class="tt-side-period">${p.l}</div><div class="tt-side-body"><div class="tt-side-sub">${c.sub}</div><div class="tt-side-time">${p.s} E{p.e}</div></div></div>`;}).join('')
    :'<div class="tt-side-empty">今日の授業なぁE/div>';
  // 直近テスト（上佁E件�E�E  const t0=new Date();t0.setHours(0,0,0,0);
  const upTests=tests.slice().sort((a,b)=>a.start.localeCompare(b.start)).filter(t=>{const e=new Date(t.end);e.setHours(0,0,0,0);return e>=t0;}).slice(0,3);
  let testHtml=upTests.length
    ?upTests.map(t=>{const ds2=new Date(t.start);ds2.setHours(0,0,0,0);const df=Math.round((ds2-t0)/86400000);return`<div class="tt-side-row"><div class="tt-side-period" style="color:#DC2626">${df<=0?'中':df+'日'}</div><div class="tt-side-body"><div class="tt-side-sub">${t.sub}</div><div class="tt-side-time">${t.start}、E{t.end}</div></div></div>`;}).join('')
    :'<div class="tt-side-empty">予定なぁE/div>';
  el.innerHTML=`
    <div class="tt-side-sec">今日の授業</div>${todayHtml}
    <div class="tt-side-sec" style="margin-top:10px">チE��チE/div>${testHtml}
  `;
}

function buildRoutineList(){
  const el=document.getElementById('routine-card');
  if(!routines.length){el.innerHTML='<div class="empty-state">ルーチE��ーンがありません<br><span style="opacity:.6;font-size:12px">設定から追加できまぁE/span></div>';return;}
  el.innerHTML=routines.map((r,i)=>`<div class="card-row"><div class="dot" style="background:#059669"></div><div style="flex:1"><div style="font-size:14px;font-weight:600">${r.name}</div><div style="font-size:12px;color:var(--muted)">${r.time} · ${r.dur}刁E/div></div><span class="pill pill-green">${r.time}</span><button class="del-btn" onclick="delRoutine(${i})">削除</button></div>`).join('');
}

function buildTaskList(){
  const el=document.getElementById('task-card');
  if(!tasks.length){el.innerHTML='<div class="empty-state">タスクがありません<br><span style="opacity:.6;font-size:12px">右上�E�E�から追加できまぁE/span></div>';return;}
  el.innerHTML=tasks.map((t,i)=>`<div class="card-row"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${i})" style="accent-color:var(--acc);width:16px;height:16px;flex-shrink:0;cursor:pointer"><div style="flex:1;${t.done?'opacity:.4;text-decoration:line-through':''}"><div style="font-size:14px">${t.text}</div></div><span class="pill pill-amber">${t.time}</span><button class="del-btn" onclick="delTask(${i})">削除</button></div>`).join('');
}

function buildSettings(){
  const el=document.getElementById('settings-inner');
  const clList=classes.length?classes.map((c,i)=>{const p=PERIODS[c.period];return`<div class="reg-item"><div class="dot" style="background:#4f46e5"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${c.sub}</div><div style="font-size:11px;color:var(--muted)">${DN[c.day]}曁E${p.l} ${p.s} E{p.e}</div></div><button class="del-btn" onclick="delClass(${i});buildSettings()">削除</button></div>`;}).join(''):`<div class="empty-reg">まだ登録されてぁE��せん</div>`;
  const rtList=routines.length?routines.map((r,i)=>`<div class="reg-item"><div class="dot" style="background:#059669"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${r.name}</div><div style="font-size:11px;color:var(--muted)">${r.time} · ${r.dur}刁E/div></div><button class="del-btn" onclick="delRoutine(${i});buildSettings()">削除</button></div>`).join(''):`<div class="empty-reg">まだ登録されてぁE��せん</div>`;
  const teList=tests.length?tests.map((t,i)=>{const t0=new Date();t0.setHours(0,0,0,0);const ds=new Date(t.start);ds.setHours(0,0,0,0);const df=Math.round((ds-t0)/86400000);return`<div class="reg-item"><div class="dot" style="background:#dc2626"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${t.sub}</div><div style="font-size:11px;color:var(--muted)">${t.start}、E{t.end} · ${df<=0?'実施中/終亁E:df+'日征E}</div></div><button class="del-btn" onclick="delTest(${i});buildSettings()">削除</button></div>`;}).join(''):`<div class="empty-reg">まだ登録されてぁE��せん</div>`;
  const holList=holidays.length?holidays.map((h,i)=>`<div class="reg-item"><div class="dot" style="background:#f97316"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${h.name||'休校日'}</div><div style="font-size:11px;color:var(--muted)">${h.date}</div></div><button class="del-btn" onclick="delHoliday(${i});buildSettings()">削除</button></div>`).join(''):`<div class="empty-reg">まだ登録されてぁE��せん</div>`;
  const vacList=vacations.length?vacations.map((v,i)=>`<div class="reg-item"><div class="dot" style="background:#7c3aed"></div><div style="flex:1"><div style="font-size:13px;font-weight:600">${v.name}</div><div style="font-size:11px;color:var(--muted)">${v.start}、E{v.end}</div></div><button class="del-btn" onclick="delVacation(${i});buildSettings()">削除</button></div>`).join(''):`<div class="empty-reg">まだ登録されてぁE��せん</div>`;
  const dayBtns=DAYS_WD.map(({d,l})=>`<button class="day-btn${sfDay===d?' sel':''}" onclick="sfSelectDay(${d})">${l}</button>`).join('');
  const maxP=(sfDay===6)?SAT_MAX:PERIODS.length;
  const periodBtns=PERIODS.slice(0,maxP).map((p,i)=>`<button class="period-btn${sfPeriod===i?' sel':''}" onclick="sfSelectPeriod(${i})"><div class="pb-limit">${p.l}</div><div class="pb-time">${p.s}</div><div class="pb-time"> E{p.e}</div></button>`).join('');
  // アカウントカーチE  let acctHtml='';
  if(_sbUser){
    acctHtml=`<div class="acct-card"><div class="acct-avatar">👤</div><div class="acct-email">${_sbUser.email}</div><div class="acct-status">ログイン中 <span class="sync-badge sync-ok">クラウド同期ON</span></div><div class="acct-btns"><button class="acct-sync-btn" onclick="doSync()"><i class="ti ti-refresh"></i><span>クラウド同朁E/span></button><button class="acct-out-btn" onclick="doLogout()">ログアウチE/button></div></div>`;
  } else {
    acctHtml=`<div class="acct-login-btn" onclick="openAuth()"><div style="display:flex;align-items:center;gap:12px"><div style="width:36px;height:36px;border-radius:10px;background:var(--acc-soft);display:flex;align-items:center;justify-content:center;color:var(--acc);font-size:18px"><i class="ti ti-user"></i></div><div><div style="font-size:14px;font-weight:600;color:var(--text)">ログイン / アカウント登録</div><div style="font-size:11px;color:var(--muted);margin-top:1px">チE��イス間でチE�Eタを同朁E/div></div></div><div style="display:flex;align-items:center;gap:6px"><span class="sync-badge sync-off">未ログイン</span><i class="ti ti-chevron-right" style="color:var(--muted);font-size:16px"></i></div></div>`;
  }
  el.innerHTML=acctHtml+`
    <div class="settings-card">
      <div class="settings-card-header"><i class="ti ti-layout-grid"></i><div class="settings-card-header-text">時間割を追加</div></div>
      <div class="settings-card-body">
        <span class="sf-label">曜日を選ぶ</span><div class="day-grid">${dayBtns}</div>
        <span class="sf-label">時限を選ぶ</span><div class="period-grid">${periodBtns}</div>
        <span class="sf-label">科目吁E/span><input class="sf-input" type="text" id="sf-sub" placeholder="侁E 数学" />
        <button class="sf-btn" onclick="addClass2()"><i class="ti ti-plus"></i>追加する</button>
        <div class="reg-list" id="sf-class-list">${clList}</div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header"><i class="ti ti-refresh"></i><div class="settings-card-header-text">ルーチE��ーンを追加</div></div>
      <div class="settings-card-body">
        <span class="sf-label">名前</span><input class="sf-input" type="text" id="sf-rt-name" placeholder="侁E 朝�E単語帳" />
        <div class="sf-row2"><div><span class="sf-label">開始時刻</span><input class="sf-input" type="time" id="sf-rt-time" value="07:00" /></div><div><span class="sf-label">時間�E��E�E�E/span><input class="sf-input" type="number" id="sf-rt-dur" value="30" min="5" max="180" /></div></div>
        <button class="sf-btn" onclick="addRoutine2()"><i class="ti ti-plus"></i>追加する</button>
        <div class="reg-list">${rtList}</div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header"><i class="ti ti-clock"></i><div class="settings-card-header-text">チE��ト期間を追加</div></div>
      <div class="settings-card-body">
        <span class="sf-label">科目名（空欄OK�E�E/span><input class="sf-input" type="text" id="sf-test-sub" placeholder="侁E 中間テスチE />
        <div class="sf-row2"><div><span class="sf-label">開始日</span><input class="sf-input" type="date" id="sf-test-start" /></div><div><span class="sf-label">終亁E��</span><input class="sf-input" type="date" id="sf-test-end" /></div></div>
        <button class="sf-btn" onclick="addTest2()"><i class="ti ti-plus"></i>追加する</button>
        <div class="reg-list">${teList}</div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header"><i class="ti ti-beach"></i><div class="settings-card-header-text">休校日を追加</div></div>
      <div class="settings-card-body">
        <span class="sf-label">日仁E/span><input class="sf-input" type="date" id="sf-hol-date" />
        <span class="sf-label">名称�E�任意！E/span><input class="sf-input" type="text" id="sf-hol-name" placeholder="侁E 遠足" />
        <button class="sf-btn" onclick="addHoliday2()"><i class="ti ti-plus"></i>追加する</button>
        <div class="reg-list">${holList}</div>
      </div>
    </div>
    <div class="settings-card">
      <div class="settings-card-header"><i class="ti ti-sun"></i><div class="settings-card-header-text">長期休暇を追加</div></div>
      <div class="settings-card-body">
        <span class="sf-label">名称</span>
        <div class="vacation-presets">
          <button class="vac-preset-btn" onclick="sfVacPreset('夏休み')">夏休み</button>
          <button class="vac-preset-btn" onclick="sfVacPreset('冬休み')">冬休み</button>
          <button class="vac-preset-btn" onclick="sfVacPreset('春休み')">春休み</button>
        </div>
        <input class="sf-input" type="text" id="sf-vac-name" placeholder="侁E 夏休み" style="margin-top:6px"/>
        <div class="sf-row2"><div><span class="sf-label">開始日</span><input class="sf-input" type="date" id="sf-vac-start" /></div><div><span class="sf-label">終亁E��</span><input class="sf-input" type="date" id="sf-vac-end" /></div></div>
        <button class="sf-btn" onclick="addVacation2()"><i class="ti ti-plus"></i>追加する</button>
        <div class="reg-list">${vacList}</div>
      </div>
    </div>`;
  // ① 時間割一覧アコーチE��オンを後から追加
  const clCard=el.querySelector('.settings-card');
  if(clCard){
    const clListWrap=document.createElement('div');
    clListWrap.className='sf-accordion-wrap';
    clListWrap.innerHTML=`<button class="sf-accordion-btn" onclick="sfToggleClassList(this)" type="button"><i class="ti ti-list" style="font-size:14px"></i>時間割一覧を見る<i class="ti ti-chevron-down sf-acc-arrow" style="font-size:13px;margin-left:auto"></i></button><div class="sf-accordion-body" id="sf-class-list-wrap">${clList}</div>`;
    const sfBtn=clCard.querySelector('.sf-btn');
    if(sfBtn){sfBtn.after(clListWrap);}
    // 既存�Ereg-listを削除�E�アコーチE��オンに移した�E�E    const oldList=clCard.querySelector('#sf-class-list');if(oldList)oldList.remove();
  }
  // ④ 科目名欁E��既存データを反映
  setTimeout(sfLoadExisting,10);
}

// ⑪ 長期休暇ヘルパ�E
function isInVacation(ds){return vacations.some(v=>ds>=v.start&&ds<=v.end);}
function getVacation(ds){return vacations.find(v=>ds>=v.start&&ds<=v.end);}
function addVacation2(){
  const name=(document.getElementById('sf-vac-name').value||'').trim();
  const start=document.getElementById('sf-vac-start').value;
  const end=document.getElementById('sf-vac-end').value||start;
  if(!name||!start)return;
  vacations.push({name,start,end});vacations.sort((a,b)=>a.start.localeCompare(b.start));sv();buildSettings();if(currentTab==='today')buildToday();
}
function delVacation(i){vacations.splice(i,1);sv();buildSettings();if(currentTab==='today')buildToday();}
function sfVacPreset(name){const inp=document.getElementById('sf-vac-name');if(inp)inp.value=name;}
// ⑪ 長期休暇のCSS用プリセチE��
function vacation_presets_css_dummy(){}

// ① sfToggleClassList 関数追加
function sfToggleClassList(btn){
  const body=document.getElementById('sf-class-list-wrap');
  if(!body)return;
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  btn.classList.toggle('open',!isOpen);
}

// ③④ 曜日・時限選択：�Eタンのみ更新�E��E体�E描画しなぁE��Efunction sfSelectDay(d){
  sfDay=d;
  // 曜日ボタンのみ更新
  document.querySelectorAll('.day-btn').forEach((btn,i)=>{
    btn.classList.toggle('sel',DAYS_WD[i]&&DAYS_WD[i].d===d);
  });
  // 時限グリチE��を�E描画�E�曜日が変わると最大時限も変わるためE��E  const maxP=(sfDay===6)?SAT_MAX:PERIODS.length;
  const pg=document.querySelector('.period-grid');
  if(pg){pg.innerHTML=PERIODS.slice(0,maxP).map((p,i)=>`<button class="period-btn${sfPeriod<maxP&&sfPeriod===i?' sel':''}" onclick="sfSelectPeriod(${i})"><div class="pb-limit">${p.l}</div><div class="pb-time">${p.s}</div><div class="pb-time"> E{p.e}</div></button>`).join('');}
  if(sfPeriod>=maxP)sfPeriod=0;
  // ④ 既存データを読み直して科目名欁E��反映
  sfLoadExisting();
}
function sfSelectPeriod(i){
  sfPeriod=i;
  // 時限ボタンのみ更新
  document.querySelectorAll('.period-btn').forEach((btn,j)=>{
    btn.classList.toggle('sel',j===i);
  });
  // ④ 既存データを読み直して科目名欁E��反映
  sfLoadExisting();
}
function sfLoadExisting(){
  // ④ セル刁E��時に保存済み科目を正しく表示
  const inp=document.getElementById('sf-sub');
  if(!inp)return;
  const ex=classes.find(c=>c.day==sfDay&&c.period==sfPeriod);
  inp.value=ex?ex.sub:'';
}

function addClass2(){
  const sub=(document.getElementById('sf-sub').value||'').trim();
  if(!sub)return;
  if(sfDay===6&&sfPeriod>=SAT_MAX){alert('土曜は4限まででぁE);return;}
  const ex=classes.find(c=>c.day==sfDay&&c.period==sfPeriod);
  if(ex)ex.sub=sub;else classes.push({day:sfDay,period:sfPeriod,sub});
  sv();buildSettings();buildTT();if(currentTab==='today')buildToday();
  // 入力欁E��保持
  const inp=document.getElementById('sf-sub');if(inp){inp.value=sub;inp.focus();}
}
function addRoutine2(){
  const name=(document.getElementById('sf-rt-name').value||'').trim();
  const time=document.getElementById('sf-rt-time').value;
  const dur=parseInt(document.getElementById('sf-rt-dur').value)||30;
  if(!name)return;routines.push({name,time,dur});sv();buildSettings();buildRoutineList();if(currentTab==='today')buildToday();
}
function addTest2(){
  const sub=(document.getElementById('sf-test-sub').value||'').trim();
  const start=document.getElementById('sf-test-start').value;
  const end=document.getElementById('sf-test-end').value||start;
  if(!start)return;tests.push({sub:sub||'チE��ト期閁E,start,end});tests.sort((a,b)=>a.start.localeCompare(b.start));sv();buildSettings();if(currentTab==='today')buildToday();
}
function addHoliday2(){
  const date=document.getElementById('sf-hol-date').value;
  const name=(document.getElementById('sf-hol-name').value||'').trim();
  if(!date)return;
  if(holidays.find(h=>h.date===date)){alert('すでに登録されてぁE��ぁE);return;}
  holidays.push({date,name});holidays.sort((a,b)=>a.date.localeCompare(b.date));sv();buildSettings();updateCal();if(currentTab==='today')buildToday();
}
function openDrawer(){const ov=document.getElementById('drawer-overlay');ov.classList.add('open');ov.style.display='flex';setTimeout(()=>document.getElementById('dw-text').focus(),200);}
function closeDrawer(){const ov=document.getElementById('drawer-overlay');ov.style.opacity='0';setTimeout(()=>{ov.style.display='none';ov.style.opacity='';ov.classList.remove('open');},180);}
function closeBg(e){if(e.target===document.getElementById('drawer-overlay'))closeDrawer();}
function addTaskD(){
  const text=(document.getElementById('dw-text').value||'').trim();
  const time=document.getElementById('dw-time').value;
  if(!text)return;tasks.push({text,time,done:false});document.getElementById('dw-text').value='';
  sv();closeDrawer();if(currentTab==='task')buildTaskList();if(currentTab==='today')buildToday();
}
function delClass(i){classes.splice(i,1);sv();buildTT();if(currentTab==='today')buildToday();}
let _pendingDelIdx=-1;
function askDelClass(i){
  _pendingDelIdx=i;
  const c=classes[i];if(!c)return;
  const p=PERIODS[c.period];
  document.getElementById('cm-title').textContent='授業を削除しますか�E�E;
  document.getElementById('cm-sub').textContent=`${DN[c.day]}曁E${p.l}�E�E{p.s} E{p.e}�E�\n${c.sub}`;
  const ov=document.getElementById('confirm-overlay');
  ov.classList.add('open');ov.style.display='flex';
}
function closeConfirm(){
  const ov=document.getElementById('confirm-overlay');
  ov.style.opacity='0';
  setTimeout(()=>{ov.style.display='none';ov.style.opacity='';ov.classList.remove('open');_pendingDelIdx=-1;},200);
}
function confirmDelClass(){
  if(_pendingDelIdx<0)return;
  delClass(_pendingDelIdx);
  closeConfirm();
}
function closeBgConfirm(e){if(e.target===document.getElementById('confirm-overlay'))closeConfirm();}
function delRoutine(i){routines.splice(i,1);sv();buildRoutineList();}
function delTask(i){tasks.splice(i,1);sv();buildTaskList();}
function delTest(i){tests.splice(i,1);sv();if(currentTab==='today')buildToday();}
function toggleTask(i){tasks[i].done=!tasks[i].done;sv();buildTaskList();}
function delHoliday(i){holidays.splice(i,1);sv();updateCal();if(currentTab==='today')buildToday();}
function doPrint(){
  const dow=selDow,isSat=dow===6,off=isOff(selDS);
  const p=selDS.split('-');
  const dl=`${p[0]}年${parseInt(p[1])}朁E{parseInt(p[2])}日�E�E{DN[dow]}�E�`;
  const maxP=isSat?SAT_MAX:PERIODS.length;
  const dc=(!off&&dow>=1&&dow<=6)?classes.filter(c=>c.day==dow&&c.period<maxP):[];
  const cR=dc.map(c=>{const pp=PERIODS[c.period];return`<div class="print-row"><div class="print-period-label">${pp.l}</div><div class="print-time">${pp.s} E{pp.e}</div><div class="print-subject">${c.sub}</div></div>`;}).join('')||'<div class="print-row" style="color:#999;font-size:13px">�E�授業なし！E/div>';
  const rR=routines.map(r=>`<div class="print-routine-row"><div class="print-routine-time">${r.time}</div><div class="print-routine-name">${r.name}</div><div class="print-routine-dur">${r.dur}刁E/div></div>`).join('')||'<div class="print-row" style="color:#999;font-size:13px">�E�なし！E/div>';
  const tR=tasks.filter(t=>!t.done).map(t=>`<div class="print-task-row"><div class="print-routine-time">${t.time}</div><div class="print-routine-name">□ ${t.text}</div></div>`).join('')||'<div class="print-row" style="color:#999;font-size:13px">�E�なし！E/div>';
  const t0=new Date();t0.setHours(0,0,0,0);
  const up=tests.filter(t=>{const e=new Date(t.end);e.setHours(0,0,0,0);return e>=t0;}).slice(0,5);
  const teR=up.map(t=>{const ds=new Date(t.start);ds.setHours(0,0,0,0);const df=Math.round((ds-t0)/86400000);return`<div class="print-row"><span style="font-weight:600">${t.sub}</span><span>${t.start}、E{t.end}</span><span>${df<=0?'実施中':df+'日征E}</span></div>`;}).join('')||'<div class="print-row">�E�なし！E/div>';
  const pa=document.getElementById('print-area');
  pa.innerHTML=`<div class="print-header"><div class="print-header-brand" style="font-family:'Manrope',sans-serif;font-weight:800;letter-spacing:-.5px">NEXA</div><div class="print-header-date">${dl}</div></div><div class="print-section"><h3>時間割</h3>${cR}</div><div class="print-section"><h3>ルーチE��ーン</h3>${rR}</div><div class="print-section"><h3>タスク</h3>${tR}</div><div class="print-section"><h3>チE��チE/h3>${teR}</div><div style="margin-top:28px;font-size:9px;color:#ccc;text-align:right;letter-spacing:.02em">${new Date().toLocaleString('ja-JP')}</div>`;
  pa.style.display='block';window.print();setTimeout(()=>{pa.style.display='none';},500);
}
const now=new Date();
selDow=now.getDay();selDS=toDS(now);
document.getElementById('page-big').textContent=`${now.getMonth()+1}朁E{now.getDate()}日`;
buildWeek();buildToday();
initAuth(); // Supabase セチE��ョン復允E
// === NEXA Splash ===
(function(){
  const splash = document.getElementById('nexa-splash');
  if(!splash) return;
  // 800ms、E200ms 表示後フェードアウチE  const delay = 900 + Math.random()*300;
  setTimeout(()=>{
    splash.classList.add('fade-out');
    setTimeout(()=>{ splash.style.display='none'; }, 500);
  }, delay);
})();

</script>
</body>
</html>

/**
 * 1. 共通ユーティリティ・データモデル定義モジュール (utils.js)
 */

// グローバル状態管理オブジェクト
let db = {
  classes: [],
  routines: [],
  tasks: [],
  tests: [],
  colors: {}
};

// 選択状態
let selDow = 1;     // 選択中の曜日（1:月〜6:土、0:日、7:フリー）
let selDS = '';     // 選択中の日付文字列（YYYY-MM-DD）

// 同期状態管理
let isSyncing = false;
let hasUnsyncedChanges = false;

// Supabase接続クライアント（app.jsで初期化）
let supabaseClient = null;

/**
 * ローカルストレージからのデータ読み込み
 */
function loadLocalData() {
  const localData = localStorage.getItem('nexa_storage_data');
  if (localData) {
    try {
      db = JSON.parse(localData);
      // 必要なプロパティが欠落している場合のデフォルト初期化
      if (!db.classes) db.classes = [];
      if (!db.routines) db.routines = [];
      if (!db.tasks) db.tasks = [];
      if (!db.tests) db.tests = [];
      if (!db.colors) db.colors = {};
    } catch (e) {
      console.error('ローカルデータの解析に失敗しました。初期化します。', e);
      initDefaultData();
    }
  } else {
    initDefaultData();
  }
}

/**
 * ローカルストレージへのデータ保存
 */
function saveLocalData() {
  localStorage.setItem('nexa_storage_data', JSON.stringify(db));
  hasUnsyncedChanges = true;
  updateSyncStatusIndicator();
}

/**
 * 初期デフォルトデータのセットアップ
 */
function initDefaultData() {
  db = {
    classes: [],
    routines: [],
    tasks: [],
    tests: [],
    colors: {
      '数学': '#ef4444',
      '英語': '#2563ff',
      '理科': '#10b981',
      '社会': '#f59e0b',
      '国語': '#ec4899'
    }
  };
  localStorage.setItem('nexa_storage_data', JSON.stringify(db));
}

/**
 * 日付オブジェクトを YYYY-MM-DD 文字列に変換
 * @param {Date} date 
 * @returns {string} YYYY-MM-DD
 */
function toDS(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * ユニークなIDの生成 (UUID代替)
 * @returns {string}
 */
function generateUUID() {
  return 'idx_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * 文字列のハッシュ値を生成（簡易重複検知・データ変更判定用）
 */
function getHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * 科目名に応じたカスタムカラー、またはデフォルトカラーの取得
 * @param {string} subjectName 
 * @returns {string} HEXカラーコード
 */
function getSubjectColor(subjectName) {
  if (!subjectName) return '#64748b';
  // 完全一致を最優先
  if (db.colors && db.colors[subjectName]) {
    return db.colors[subjectName];
  }
  // 部分一致の走査
  for (const key in db.colors) {
    if (subjectName.includes(key)) {
      return db.colors[key];
    }
  }
  return '#64748b'; // マッチしない場合のデフォルト（グレー）
}

/**
 * 共通確認ダイアログの表示
 * @param {string} title 
 * @param {string} message 
 * @param {function} onConfirm 
 */
function showConfirmDialog(title, message, onConfirm) {
  const overlay = document.getElementById('global-confirm-dialog');
  const titleEl = document.getElementById('confirm-dialog-title');
  const msgEl = document.getElementById('confirm-dialog-message');
  const btnOk = document.getElementById('btn-confirm-ok');
  const btnCancel = document.getElementById('btn-confirm-cancel');

  titleEl.textContent = title;
  msgEl.textContent = message;

  overlay.classList.add('open');

  const close = () => {
    overlay.classList.remove('open');
    btnOk.onclick = null;
    btnCancel.onclick = null;
  };

  btnOk.onclick = () => {
    onConfirm();
    close();
  };

  btnCancel.onclick = close;
}
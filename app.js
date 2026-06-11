/**
 * 8. アプリケーション統合エントリー・同期コアエンジンモジュール (app.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNexaAppShell();
});

/**
 * アプリケーション全体の初期化
 */
function initNexaAppShell() {
  // 1. データロード
  loadLocalData();

  // 2. 状態初期化
  const now = new Date();
  selDow = now.getDay();
  selDS = toDS(now);

  // 上部日付表示更新
  document.getElementById('page-big').textContent = `${now.getMonth() + 1}月${now.getDate()}日`;

  // 3. Supabase初期化（環境変数が埋め込まれているか確認）
  initSupabaseConnection();

  // 4. 各種コンポーネントモジュール起動
  if (typeof initScheduleModule === 'function') initScheduleModule();
  if (typeof initRoutineModule === 'function') initRoutineModule();
  if (typeof initTasksModule === 'function') initTasksModule();
  if (typeof initCalendarModule === 'function') initCalendarModule();
  if (typeof initSettingsModule === 'function') initSettingsModule();

  // 5. グローバルイベント設定
  setupGlobalAppEventHandlers();

  // 6. サービスワーカー登録と通知パーミッション
  registerNexaPWA();
  requestNotificationPermission();

  // 7. 定期的なバックグラウンド自動同期タイマーの開始 (5分おき)
  setInterval(() => {
    if (hasUnsyncedChanges) {
      executeCloudPushSync();
    }
  }, 5000 * 60);
}

/**
 * Supabaseへの接続初期化
 */
function initSupabaseConnection() {
  // GitHub環境構築時に環境変数、または直接ここに文字列を補完可能
  const SUPABASE_URL = window.ENV_SUPABASE_URL || ""; 
  const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || "";

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      executeCloudPullAndMergeSync(); // 初回起動時データ復元マージ
    } catch (e) {
      console.error("Supabase初期化エラー:", e);
      updateCloudBadgeStatus(false);
    }
  } else {
    console.log("Supabaseの認証情報が設定されていません。スタンドアロンローカルモードで動作します。");
    updateCloudBadgeStatus(false);
  }
}

/**
 * 画面タブ切り替え制御の構築
 */
function setupGlobalAppEventHandlers() {
  const navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
  const panels = document.querySelectorAll('.tab-content-wrapper .tab-panel');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) targetPanel.classList.add('active');

      // ページタイトル文言の動的変更
      const titleMap = {
        schedule: '時間割',
        routine: 'ルーティーン',
        tasks: 'タスク',
        calendar: 'カレンダー',
        settings: '設定'
      };
      document.getElementById('page-title').textContent = titleMap[targetTab] || 'NEXA';
    });
  });

  // 手動同期ボタン
  document.getElementById('btn-manual-sync').addEventListener('click', () => {
    if (!supabaseClient) {
      showToastNotification('Supabaseが未設定のため同期できません', 'warning');
      return;
    }
    executeCloudPushSync();
  });

  // 設定画面内の手動Pull/Pushへのアタッチ
  document.getElementById('btn-settings-force-pull').addEventListener('click', () => {
    if (!supabaseClient) return showToastNotification('Supabase未設定', 'danger');
    showConfirmDialog('クラウドから復元', 'ローカルのデータが上書きマージされます。よろしいですか？', () => {
      executeCloudPullAndMergeSync(true);
    });
  });

  document.getElementById('btn-settings-force-push').addEventListener('click', () => {
    if (!supabaseClient) return showToastNotification('Supabase未設定', 'danger');
    executeCloudPushSync();
  });

  // 印刷トリガー
  document.getElementById('btn-print-trigger').addEventListener('click', () => {
    triggerPrintEngine();
  });

  // モーダル枠外クリックで閉じる共通処理
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const openModal = document.querySelector('.modal-overlay.open');
      if (openModal) openModal.classList.remove('open');
    });
  });
}

/**
 * 同期ステータスドット/バッジの表記更新
 */
function updateSyncStatusIndicator() {
  const dot = document.getElementById('sync-status-dot');
  if (!dot) return;

  dot.className = 'sync-badge';
  if (isSyncing) {
    dot.classList.add('syncing');
  } else if (hasUnsyncedChanges) {
    dot.classList.add('unsynced'); // 赤
  } else {
    dot.classList.add('synced'); // 緑
  }
}

function updateCloudBadgeStatus(isConnected) {
  const badge = document.getElementById('cloud-connection-badge');
  if (!badge) return;
  if (isConnected) {
    badge.textContent = "接続済み";
    badge.className = "connection-status-badge connected";
  } else {
    badge.textContent = "未接続";
    badge.className = "connection-status-badge disconnected";
  }
}

/**
 * クラウドへのデータ同期転送 (Push)
 */
async function executeCloudPushSync() {
  if (!supabaseClient || isSyncing) return;

  isSyncing = true;
  updateSyncStatusIndicator();

  try {
    // ユーザー固定セッションのダミーキー(通常はauth連携だが、今回は単一データストアとして設計)
    const deviceKey = localStorage.getItem('nexa_device_uid') || generateUUID();
    localStorage.setItem('nexa_device_uid', deviceKey);

    const payload = {
      id: deviceKey,
      raw_data: JSON.stringify(db),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('nexa_user_data')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;

    hasUnsyncedChanges = false;
    showToastNotification('クラウドと同期しました', 'success');
    updateCloudBadgeStatus(true);
  } catch (err) {
    console.error('Push同期失敗:', err);
    showToastNotification('同期に失敗しました（オフライン保留）', 'warning');
  } finally {
    isSyncing = false;
    updateSyncStatusIndicator();
  }
}

/**
 * クラウドからのデータ取得とインテリジェントマージ (Pull)
 */
async function executeCloudPullAndMergeSync(forceAlert = false) {
  if (!supabaseClient) return;
  
  const deviceKey = localStorage.getItem('nexa_device_uid');
  if (!deviceKey) return;

  try {
    const { data, error } = await supabaseClient
      .from('nexa_user_data')
      .select('raw_data')
      .eq('id', deviceKey)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116はデータなしコード

    if (data && data.raw_data) {
      const cloudDb = JSON.parse(data.raw_data);
      
      // IDベースの差分相互マージロジック
      db.classes = mergeArraysById(db.classes, cloudDb.classes || []);
      db.routines = mergeArraysById(db.routines, cloudDb.routines || []);
      db.tasks = mergeArraysById(db.tasks, cloudDb.tasks || []);
      db.tests = mergeArraysById(db.tests, cloudDb.tests || []);
      db.colors = { ...cloudDb.colors, ...db.colors }; // 色設定のブレンド

      localStorage.setItem('nexa_storage_data', JSON.stringify(db));
      
      // 画面各種再描画
      if (typeof renderScheduleGrid === 'function') renderScheduleGrid();
      if (typeof renderRoutineList === 'function') renderRoutineList();
      if (typeof renderStandardTasks === 'function') renderStandardTasks();
      if (typeof renderTestTasks === 'function') renderTestTasks();
      if (typeof calculateOverallTaskProgress === 'function') calculateOverallTaskProgress();
      if (typeof renderCalendarView === 'function') renderCalendarView();

      updateCloudBadgeStatus(true);
      if (forceAlert) showToastNotification('データをクラウドから復元統合しました', 'success');
    }
  } catch (err) {
    console.error('Pull同期失敗:', err);
    updateCloudBadgeStatus(false);
  }
}

/**
 * ID重複を排除する配列マージロジック
 */
function mergeArraysById(localArr, cloudArr) {
  const map = new Map();
  cloudArr.forEach(item => { if(item.id) map.set(item.id, item); });
  localArr.forEach(item => { if(item.id) map.set(item.id, item); }); // ローカル側での変更・最新状態を上書き優先
  return Array.from(map.values());
}

/**
 * 印刷エンジンの動的レンダリング構築
 */
function triggerPrintEngine() {
  const dowJa = ['日', '月', '火', '水', '木', '金', '土'];
  const displayDateStr = `${calCurrentDate.getMonth()+1}月${calCurrentDate.getDate()}日 (${dowJa[selDow]})`;

  // 時間割
  const filteredClasses = db.classes.filter(c => parseInt(c.dow) === selDow);
  filteredClasses.sort((a, b) => a.start.localeCompare(b.start));
  const classRowsHtml = filteredClasses.map(c => `
    <div class="print-row">
      <span style="font-weight:600; width:120px; display:inline-block;">${c.start}〜${c.end}</span>
      <span style="font-weight:700;">${c.sub}</span>
      <span style="color:#666; margin-left:12px;">${c.room || ''} ${c.teacher || ''}</span>
    </div>
  `).join('') || '<div class="print-row">（授業なし）</div>';

  // ルーティーン
  const routineRowsHtml = db.routines.filter(r => r.days.includes(selDow)).map(r => `
    <div class="print-row">
      <span style="width:120px; display:inline-block;">${r.start || '--:--'}〜${r.end || '--:--'}</span>
      <span>${r.sub}</span>
      <span>[ ${r.done ? '完了' : '未'} ]</span>
    </div>
  `).join('') || '<div class="print-row">（なし）</div>';

  // 通常タスク・テスト
  const taskRowsHtml = db.tasks.filter(t => t.start === selDS).map(t => `
    <div class="print-row"><span>${t.sub}</span><span>[期限日]</span></div>
  `).join('') || '<div class="print-row">（なし）</div>';

  const testRowsHtml = db.tests.filter(t => t.start === selDS).map(t => `
    <div class="print-row"><span style="color:red; font-weight:700;">${t.sub}</span><span>${t.time || ''}</span></div>
  `).join('') || '<div class="print-row">（なし）</div>';

  const printArea = document.getElementById('print-area');
  if (!printArea) return;

  printArea.innerHTML = `
    <div class="print-header">
      <div class="print-header-brand">NEXA Student Dashboard</div>
      <div class="print-header-date">対象日: ${displayDateStr}</div>
    </div>
    <div class="print-section">
      <h3>📅 時間割枠</h3>
      ${classRowsHtml}
    </div>
    <div class="print-section">
      <h3>🔄 今日のルーティーン</h3>
      ${routineRowsHtml}
    </div>
    <div class="print-section">
      <h3>📋 提出期限タスク</h3>
      ${taskRowsHtml}
    </div>
    <div class="print-section">
      <h3>📝 実施テスト・小テスト</h3>
      ${testRowsHtml}
    </div>
    <div style="margin-top:40px; font-size:10px; color:#aaa; text-align:right;">
      出力日時: ${new Date().toLocaleString('ja-JP')}
    </div>
  `;

  // 印刷実行
  printArea.style.display = 'block';
  window.print();
  setTimeout(() => {
    printArea.style.display = 'none';
  }, 600);
}

/**
 * Service Workerの登録
 */
function registerNexaPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => {
          console.log('NEXA ServiceWorker 正常登録完了:', reg.scope);
        })
        .catch(err => {
          console.error('NEXA ServiceWorker 登録失敗:', err);
        });
    });
  }
}
/**
 * 2. 設定・テーマ・インポートエクスポートモジュール (settings.js)
 */

function initSettingsModule() {
  setupThemeEngine();
  renderSubjectColorSettings();
  setupDataManagementHandlers();
}

/**
 * 外観テーマエンジンの初期化と制御
 */
function setupThemeEngine() {
  const savedTheme = localStorage.getItem('nexa_theme') || 'system';
  applyTheme(savedTheme);

  const themeButtons = document.querySelectorAll('#settings-theme-switcher .btn-theme-toggle');
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-theme') === savedTheme) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      localStorage.setItem('nexa_theme', theme);
      applyTheme(theme);
    });
  });
}

function applyTheme(theme) {
  let targetTheme = theme;
  if (theme === 'system') {
    targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', targetTheme);
}

/**
 * 科目カスタムカラー一覧のレンダリング
 */
function renderSubjectColorSettings() {
  const container = document.getElementById('settings-subject-colors-grid');
  if (!container) return;
  container.innerHTML = '';

  const defaultSubjects = ['数学', '英語', '理科', '社会', '国語'];
  
  // 登録済みの全科目をマージしてリスト化
  const activeSubjects = new Set(defaultSubjects);
  db.classes.forEach(c => { if (c.sub) activeSubjects.add(c.sub); });
  db.tasks.forEach(t => { if (t.sub) activeSubjects.add(t.sub); });
  db.tests.forEach(t => { if (t.sub) activeSubjects.add(t.sub); });

  activeSubjects.forEach(sub => {
    const color = getSubjectColor(sub);
    const cell = document.createElement('div');
    cell.className = 'color-picker-cell';
    cell.innerHTML = `
      <span>${sub}</span>
      <input type="color" value="${color}" data-subject="${sub}" />
    `;
    
    cell.querySelector('input').addEventListener('change', (e) => {
      const newColor = e.target.value;
      db.colors[sub] = newColor;
      saveLocalData();
      showToastNotification(`${sub}の色を更新しました`, 'success');
      
      // 関係各所の再描画リクエスト
      if (typeof renderScheduleGrid === 'function') renderScheduleGrid();
      if (typeof renderStandardTasks === 'function') renderStandardTasks();
      if (typeof renderTestTasks === 'function') renderTestTasks();
    });

    container.appendChild(cell);
  });
}

/**
 * バックアップ、インポート、アプリケーションリセットの各種ハンドラ設定
 */
function setupDataManagementHandlers() {
  // エクスポート
  document.getElementById('btn-data-export').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `nexa_backup_${toDS(new Date())}.json`);
    dlAnchorElem.click();
    showToastNotification('データをエクスポートしました', 'success');
  });

  // インポート
  document.getElementById('file-data-import').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData && (importedData.classes || importedData.routines || importedData.tasks)) {
          showConfirmDialog(
            'データのインポート',
            '既存のデータは上書きされます。よろしいですか？',
            () => {
              db = {
                classes: importedData.classes || [],
                routines: importedData.routines || [],
                tasks: importedData.tasks || [],
                tests: importedData.tests || [],
                colors: importedData.colors || db.colors
              };
              saveLocalData();
              showToastNotification('データを正常にインポートしました', 'success');
              location.reload(); // 全画面強制再ロード
            }
          );
        } else {
          showToastNotification('無効なJSONファイル構造です', 'danger');
        }
      } catch (err) {
        showToastNotification('ファイルの読み込みに失敗しました', 'danger');
      }
    };
    reader.readAsText(file);
  });

  // アプリケーションリセット
  document.getElementById('btn-app-reset').addEventListener('click', () => {
    showConfirmDialog(
      'アプリケーションのリセット',
      'すべてのローカルデータが消去され初期状態に戻ります。この操作は取り消せません。',
      () => {
        localStorage.clear();
        initDefaultData();
        showToastNotification('アプリを初期化しました', 'warning');
        setTimeout(() => location.reload(), 1000);
      }
    );
  });
}
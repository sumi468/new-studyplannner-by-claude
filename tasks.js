/**
 * 4. 通常タスク・テスト管理モジュール (tasks.js)
 */

function initTasksModule() {
  setupTasksFormHandlers();
  renderStandardTasks();
  renderTestTasks();
  calculateOverallTaskProgress();
}

/**
 * タスク・テスト進捗ダッシュボード指標の計算とUI反映
 */
function calculateOverallTaskProgress() {
  const totalTasks = db.tasks.length;
  const completedTasks = db.tasks.filter(t => t.done).length;
  const totalTests = db.tests.length;
  const completedTests = db.tests.filter(t => t.done).length;

  const totalCount = totalTasks + totalTests;
  const completedCount = completedTasks + completedTests;

  let pct = 0;
  if (totalCount > 0) {
    pct = Math.round((completedCount / totalCount) * 100);
  }

  // テキスト数値更新
  document.getElementById('task-completed-ratio-text').textContent = `${completedCount} / ${totalCount}`;
  document.getElementById('task-completed-pct-text').textContent = `${pct}%`;

  // 円形プログレスバー(SVG)のアニメーション制御
  const circle = document.getElementById('dashboard-progress-circle');
  if (circle) {
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (pct / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }
}

/**
 * 通常タスクのレンダリング
 */
function renderStandardTasks() {
  const container = document.getElementById('standard-tasks-container');
  if (!container) return;
  container.innerHTML = '';

  // 期限が近い順にソート
  const sortedTasks = [...db.tasks].sort((a, b) => new Date(a.start) - new Date(b.start));

  if (sortedTasks.length === 0) {
    container.innerHTML = '<p class="settings-desc" style="text-align:center; padding:20px;">登録されたタスクはありません</p>';
    return;
  }

  sortedTasks.forEach(task => {
    const color = getSubjectColor(task.sub);
    const isOverdue = new Date(task.start) < new Date().setHours(0,0,0,0) && !task.done;
    
    const row = document.createElement('div');
    row.className = `item-row ${task.done ? 'completed' : ''}`;
    row.innerHTML = `
      <div class="item-checkbox" data-id="${task.id}">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="item-content">
        <span class="item-title">${task.sub}</span>
        <div class="item-meta">
          <span class="${isOverdue ? 'task-badge-alert' : ''}">
            <i class="fa-solid fa-calendar-day"></i> 期限: ${task.start} ${isOverdue ? '(期限切れ)' : ''}
          </span>
          ${task.memo ? `<span><i class="fa-solid fa-sticky-note"></i> ${task.memo}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-item-action btn-edit" data-id="${task.id}"><i class="fa-solid fa-pen"></i></button>
      </div>
    `;

    // チェックボックスイベント
    row.querySelector('.item-checkbox').addEventListener('click', () => {
      task.done = !task.done;
      saveLocalData();
      renderStandardTasks();
      calculateOverallTaskProgress();
      if (typeof renderCalendarView === 'function') renderCalendarView();
    });

    // 編集イベント
    row.querySelector('.btn-edit').addEventListener('click', () => {
      openTaskEditorModal(task);
    });

    container.appendChild(row);
  });
}

/**
 * テスト予定のレンダリング
 */
function renderTestTasks() {
  const container = document.getElementById('test-tasks-container');
  if (!container) return;
  container.innerHTML = '';

  const sortedTests = [...db.tests].sort((a, b) => new Date(a.start) - new Date(b.start));

  if (sortedTests.length === 0) {
    container.innerHTML = '<p class="settings-desc" style="text-align:center; padding:20px;">登録されたテスト予定はありません</p>';
    return;
  }

  sortedTests.forEach(test => {
    const isOverdue = new Date(test.start) < new Date().setHours(0,0,0,0) && !test.done;

    const row = document.createElement('div');
    row.className = `item-row ${test.done ? 'completed' : ''}`;
    row.innerHTML = `
      <div class="item-checkbox" data-id="${test.id}">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="item-content">
        <span class="item-title" style="color:var(--color-danger); font-weight:700;">${test.sub}</span>
        <div class="item-meta">
          <span><i class="fa-solid fa-calendar-alt"></i> 実施日: ${test.start} ${test.time ? test.time : ''}</span>
          ${test.memo ? `<span><i class="fa-solid fa-clipboard-list"></i> 範囲: ${test.memo}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-item-action btn-edit" data-id="${test.id}"><i class="fa-solid fa-pen"></i></button>
      </div>
    `;

    row.querySelector('.item-checkbox').addEventListener('click', () => {
      test.done = !test.done;
      saveLocalData();
      renderTestTasks();
      calculateOverallTaskProgress();
      if (typeof renderCalendarView === 'function') renderCalendarView();
    });

    row.querySelector('.btn-edit').addEventListener('click', () => {
      openTestEditorModal(test);
    });

    container.appendChild(row);
  });
}

/**
 * モーダル操作ロジック群
 */
function openTaskEditorModal(task = null) {
  const modal = document.getElementById('modal-task-editor');
  const form = document.getElementById('form-task-editor');
  const btnDelete = document.getElementById('btn-task-delete');

  form.reset();

  if (task) {
    document.getElementById('task-modal-title').textContent = 'タスクの編集';
    document.getElementById('input-task-id').value = task.id;
    document.getElementById('input-task-sub').value = task.sub;
    document.getElementById('input-task-start').value = task.start;
    document.getElementById('input-task-memo').value = task.memo || '';
    btnDelete.style.display = 'block';
    btnDelete.onclick = () => {
      showConfirmDialog('タスクの削除', 'このタスクを削除してもよろしいですか？', () => {
        db.tasks = db.tasks.filter(t => t.id !== task.id);
        saveLocalData();
        modal.classList.remove('open');
        renderStandardTasks();
        calculateOverallTaskProgress();
        if (typeof renderCalendarView === 'function') renderCalendarView();
        showToastNotification('タスクを削除しました', 'warning');
      });
    };
  } else {
    document.getElementById('task-modal-title').textContent = 'タスクの追加';
    document.getElementById('input-task-id').value = '';
    document.getElementById('input-task-start').value = toDS(new Date());
    btnDelete.style.display = 'none';
  }

  modal.classList.add('open');
}

function openTestEditorModal(test = null) {
  const modal = document.getElementById('modal-test-editor');
  const form = document.getElementById('form-test-editor');
  const btnDelete = document.getElementById('btn-test-delete');

  form.reset();

  if (test) {
    document.getElementById('test-modal-title').textContent = 'テスト予定の編集';
    document.getElementById('input-test-id').value = test.id;
    document.getElementById('input-test-sub').value = test.sub;
    document.getElementById('input-test-start').value = test.start;
    document.getElementById('input-test-time').value = test.time || '';
    document.getElementById('input-test-memo').value = test.memo || '';
    btnDelete.style.display = 'block';
    btnDelete.onclick = () => {
      showConfirmDialog('テスト予定の削除', 'このテスト予定を削除してもよろしいですか？', () => {
        db.tests = db.tests.filter(t => t.id !== test.id);
        saveLocalData();
        modal.classList.remove('open');
        renderTestTasks();
        calculateOverallTaskProgress();
        if (typeof renderCalendarView === 'function') renderCalendarView();
        showToastNotification('テスト予定を削除しました', 'warning');
      });
    };
  } else {
    document.getElementById('test-modal-title').textContent = 'テスト予定の追加';
    document.getElementById('input-test-id').value = '';
    document.getElementById('input-test-start').value = toDS(new Date());
    btnDelete.style.display = 'none';
  }

  modal.classList.add('open');
}

function setupTasksFormHandlers() {
  // トリガーボタン
  document.getElementById('btn-create-task').addEventListener('click', () => openTaskEditorModal());
  document.getElementById('btn-create-test').addEventListener('click', () => openTestEditorModal());

  // 通常タスク保存
  document.getElementById('form-task-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-task-id').value;
    const sub = document.getElementById('input-task-sub').value.trim();
    const start = document.getElementById('input-task-start').value;
    const memo = document.getElementById('input-task-memo').value.trim();

    if (!sub || !start) return;

    if (id) {
      // 更新
      const task = db.tasks.find(t => t.id === id);
      if (task) {
        task.sub = sub;
        task.start = start;
        task.memo = memo;
      }
    } else {
      // 新規作成
      db.tasks.push({ id: generateUUID(), sub, start, end: start, memo, done: false });
    }

    saveLocalData();
    document.getElementById('modal-task-editor').classList.remove('open');
    renderStandardTasks();
    calculateOverallTaskProgress();
    if (typeof renderCalendarView === 'function') renderCalendarView();
    showToastNotification('タスクを保存しました', 'success');
  });

  // テスト保存
  document.getElementById('form-test-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-test-id').value;
    const sub = document.getElementById('input-test-sub').value.trim();
    const start = document.getElementById('input-test-start').value;
    const time = document.getElementById('input-test-time').value;
    const memo = document.getElementById('input-test-memo').value.trim();

    if (!sub || !start) return;

    if (id) {
      const test = db.tests.find(t => t.id === id);
      if (test) {
        test.sub = sub;
        test.start = start;
        test.time = time;
        test.memo = memo;
      }
    } else {
      db.tests.push({ id: generateUUID(), sub, start, end: start, time, memo, done: false });
    }

    saveLocalData();
    document.getElementById('modal-test-editor').classList.remove('open');
    renderTestTasks();
    calculateOverallTaskProgress();
    if (typeof renderCalendarView === 'function') renderCalendarView();
    showToastNotification('テスト予定を保存しました', 'success');
  });
}
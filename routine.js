/**
 * 5. ルーティーン管理モジュール (routine.js)
 */

let activeRoutineFilter = 'all'; // 'all' | 'today'

function initRoutineModule() {
  setupRoutineHandlers();
  renderRoutineList();
}

/**
 * ルーティーンアイテムのレンダリング
 */
function renderRoutineList() {
  const container = document.getElementById('routine-items-container');
  if (!container) return;
  container.innerHTML = '';

  const currentDayOfWeek = new Date().getDay(); // 0:日〜6:土

  let displayList = db.routines;

  // フィルター処理
  if (activeRoutineFilter === 'today') {
    displayList = db.routines.filter(r => r.days && r.days.includes(currentDayOfWeek));
  }

  // 時間順にソート
  displayList = [...displayList].sort((a, b) => (a.start || '23:59').localeCompare(b.start || '23:59'));

  if (displayList.length === 0) {
    container.innerHTML = '<p class="settings-desc" style="text-align:center; padding:20px;">該当するルーティーンはありません</p>';
    return;
  }

  const dowLabels = ['日', '月', '火', '水', '木', '金', '土'];

  displayList.forEach(routine => {
    // 曜日チップ文字列生成
    const daysStr = routine.days && routine.days.length === 7 ? '毎日' : 
                    routine.days ? routine.days.map(d => dowLabels[d]).join(', ') : '未設定';

    const row = document.createElement('div');
    row.className = `item-row ${routine.done ? 'completed' : ''}`;
    row.innerHTML = `
      <div class="item-checkbox">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="item-content">
        <span class="item-title">${routine.sub}</span>
        <div class="item-meta">
          <span><i class="fa-solid fa-clock"></i> ${routine.start || '--:--'} 〜 ${routine.end || '--:--'}</span>
          <span><i class="fa-solid fa-repeat"></i> 実施: ${daysStr}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-item-action btn-edit"><i class="fa-solid fa-pen"></i></button>
      </div>
    `;

    // トグル完了イベント
    row.querySelector('.item-checkbox').addEventListener('click', () => {
      routine.done = !routine.done;
      saveLocalData();
      renderRoutineList();
    });

    // 編集イベント
    row.querySelector('.btn-edit').addEventListener('click', () => {
      openRoutineEditorModal(routine);
    });

    container.appendChild(row);
  });
}

/**
 * ルーティーン編集モーダルオープン
 */
function openRoutineEditorModal(routine = null) {
  const modal = document.getElementById('modal-routine-editor');
  const form = document.getElementById('form-routine-editor');
  const btnDelete = document.getElementById('btn-routine-delete');

  form.reset();

  // 曜日チェックボックスの全初期化
  const chks = form.querySelectorAll('.chk-routine-day');
  chks.forEach(c => c.checked = false);

  if (routine) {
    document.getElementById('routine-modal-title').textContent = 'ルーティーンの編集';
    document.getElementById('input-routine-id').value = routine.id;
    document.getElementById('input-routine-sub').value = routine.sub;
    document.getElementById('input-routine-start').value = routine.start || '';
    document.getElementById('input-routine-end').value = routine.end || '';
    
    if (routine.days) {
      chks.forEach(chk => {
        if (routine.days.includes(parseInt(chk.value))) {
          chk.checked = true;
        }
      });
    }
    
    btnDelete.style.display = 'block';
    btnDelete.onclick = () => {
      showConfirmDialog('ルーティーンの削除', 'このルーティーン項目を削除しますか？', () => {
        db.routines = db.routines.filter(r => r.id !== routine.id);
        saveLocalData();
        modal.classList.remove('open');
        renderRoutineList();
        showToastNotification('ルーティーンを削除しました', 'warning');
      });
    };
  } else {
    document.getElementById('routine-modal-title').textContent = 'ルーティーンの追加';
    document.getElementById('input-routine-id').value = '';
    chks.forEach(c => { if(c.value !== "0" && c.value !== "6") c.checked = true; }); // 平日デフォルト
    btnDelete.style.display = 'none';
  }

  modal.classList.add('open');
}

/**
 * ハンドラ設定
 */
function setupRoutineHandlers() {
  // 追加ボタン
  document.getElementById('btn-add-routine').addEventListener('click', () => openRoutineEditorModal());

  // フィルターチップ切り替え
  const chips = document.querySelectorAll('.routine-filter-group .filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeRoutineFilter = chip.getAttribute('data-filter');
      renderRoutineList();
    });
  });

  // 全進捗一括リセット
  document.getElementById('btn-routine-reset-all').addEventListener('click', () => {
    showConfirmDialog(
      'ルーティーン進捗のリセット',
      'すべてのルーティーンの今日の進捗チェックを未完了に戻します。よろしいですか？',
      () => {
        db.routines.forEach(r => r.done = false);
        saveLocalData();
        renderRoutineList();
        showToastNotification('進捗をリセットしました', 'success');
      }
    );
  });

  // フォーム送信
  document.getElementById('form-routine-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-routine-id').value;
    const sub = document.getElementById('input-routine-sub').value.trim();
    const start = document.getElementById('input-routine-start').value;
    const end = document.getElementById('input-routine-end').value;

    const checkedDays = [];
    document.querySelectorAll('.chk-routine-day:checked').forEach(chk => {
      checkedDays.push(parseInt(chk.value));
    });

    if (!sub) return;
    if (checkedDays.length === 0) {
      showToastNotification('実施曜日を少なくとも1つ選択してください', 'danger');
      return;
    }

    if (id) {
      const routine = db.routines.find(r => r.id === id);
      if (routine) {
        routine.sub = sub;
        routine.start = start;
        routine.end = end;
        routine.days = checkedDays;
      }
    } else {
      db.routines.push({
        id: generateUUID(),
        sub,
        start,
        end,
        days: checkedDays,
        done: false
      });
    }

    saveLocalData();
    document.getElementById('modal-routine-editor').classList.remove('open');
    renderRoutineList();
    showToastNotification('ルーティーンを保存しました', 'success');
  });
}
/**
 * 6. 時間割枠管理モジュール (schedule.js)
 */

function initScheduleModule() {
  setupScheduleDOWChips();
  setupScheduleFormHandlers();
  renderScheduleGrid();
}

/**
 * 曜日選択チップの初期化と制御
 */
function setupScheduleDOWChips() {
  const container = document.getElementById('schedule-dow-container');
  if (!container) return;

  const chips = container.querySelectorAll('.dow-chip');
  chips.forEach(chip => {
    const dowAttr = parseInt(chip.getAttribute('data-dow'));
    if (dowAttr === selDow) {
      chip.classList.add('active');
    }

    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selDow = dowAttr;
      renderScheduleGrid();
    });
  });
}

/**
 * 現在選択されている曜日の時間割カード描画
 */
function renderScheduleGrid() {
  const container = document.getElementById('schedule-cards-grid');
  if (!container) return;
  container.innerHTML = '';

  // 現在の曜日にマッチするデータを抽出し、開始時間順ソート
  const filteredClasses = db.classes.filter(c => parseInt(c.dow) === selDow);
  filteredClasses.sort((a, b) => a.start.localeCompare(b.start));

  if (filteredClasses.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
        <i class="fa-solid fa-border-none" style="font-size: 32px; margin-bottom: 12px; display:block;"></i>
        この曜日のコマは登録されていません。
      </div>
    `;
    return;
  }

  const now = new Date();
  const currentDow = now.getDay();
  const currentTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  filteredClasses.forEach(cls => {
    const color = getSubjectColor(cls.sub);
    
    // 現在実施中のコマかどうかを判定
    let isActiveNow = false;
    if (selDow === currentDow) {
      if (currentTimeStr >= cls.start && currentTimeStr <= cls.end) {
        isActiveNow = true;
      }
    }

    const card = document.createElement('div');
    card.className = `class-card ${isActiveNow ? 'active-class' : ''}`;
    card.innerHTML = `
      <span class="class-badge" style="background-color: ${color}">${cls.sub}</span>
      <span class="class-time"><i class="fa-regular fa-clock"></i> ${cls.start} 〜 ${cls.end}</span>
      <div class="class-subject">${cls.sub}</div>
      <div class="class-meta-row">
        ${cls.room ? `<span class="class-meta-item"><i class="fa-solid fa-location-dot"></i> ${cls.room}</span>` : ''}
        ${cls.teacher ? `<span class="class-meta-item"><i class="fa-solid fa-user"></i> ${cls.teacher}</span>` : ''}
      </div>
      ${cls.memo ? `<div class="settings-desc-sm" style="margin-top:4px; border-top:1px dashed var(--border-color); padding-top:6px;"><i class="fa-solid fa-pen-clip"></i> ${cls.memo}</div>` : ''}
      <button class="btn-item-action btn-card-edit" style="position:absolute; top:12px; right:12px;"><i class="fa-solid fa-ellipsis-vertical"></i></button>
    `;

    // カード内編集クリック
    card.querySelector('.btn-card-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      openClassEditorModal(cls);
    });

    container.appendChild(card);
  });
}

/**
 * コマ編集モーダルオープン
 */
function openClassEditorModal(cls = null) {
  const modal = document.getElementById('modal-class-editor');
  const form = document.getElementById('form-class-editor');
  const btnDelete = document.getElementById('btn-class-delete');

  form.reset();

  if (cls) {
    document.getElementById('class-modal-title').textContent = 'コマの編集';
    document.getElementById('input-class-id').value = cls.id;
    document.getElementById('input-class-dow').value = cls.dow;
    document.getElementById('input-class-sub').value = cls.sub;
    document.getElementById('input-class-start').value = cls.start;
    document.getElementById('input-class-end').value = cls.end;
    document.getElementById('input-class-room').value = cls.room || '';
    document.getElementById('input-class-teacher').value = cls.teacher || '';
    document.getElementById('input-class-memo').value = cls.memo || '';
    
    btnDelete.style.display = 'block';
    btnDelete.onclick = () => {
      showConfirmDialog('コマの削除', 'この時間割のコマを削除しますか？', () => {
        db.classes = db.classes.filter(c => c.id !== cls.id);
        saveLocalData();
        modal.classList.remove('open');
        renderScheduleGrid();
        showToastNotification('コマを削除しました', 'warning');
      });
    };
  } else {
    document.getElementById('class-modal-title').textContent = '新規コマの追加';
    document.getElementById('input-class-id').value = '';
    document.getElementById('input-class-dow').value = selDow; // 現在選択中の曜日を自動適用
    document.getElementById('input-class-start').value = '09:00';
    document.getElementById('input-class-end').value = '10:30';
    btnDelete.style.display = 'none';
  }

  modal.classList.add('open');
}

/**
 * フォーム保存イベントの設定
 */
function setupScheduleFormHandlers() {
  document.getElementById('btn-add-class').addEventListener('click', () => openClassEditorModal());

  document.getElementById('form-class-editor').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-class-id').value;
    const dow = parseInt(document.getElementById('input-class-dow').value);
    const sub = document.getElementById('input-class-sub').value.trim();
    const start = document.getElementById('input-class-start').value;
    const end = document.getElementById('input-class-end').value;
    const room = document.getElementById('input-class-room').value.trim();
    const teacher = document.getElementById('input-class-teacher').value.trim();
    const memo = document.getElementById('input-class-memo').value.trim();

    if (!sub || !start || !end) return;
    if (start >= end) {
      showToastNotification('終了時間は開始時間より後に設定してください', 'danger');
      return;
    }

    if (id) {
      // 既存編集
      const target = db.classes.find(c => c.id === id);
      if (target) {
        target.sub = sub;
        target.start = start;
        target.end = end;
        target.room = room;
        target.teacher = teacher;
        target.memo = memo;
      }
    } else {
      // 新規作成
      db.classes.push({
        id: generateUUID(),
        dow, sub, start, end, room, teacher, memo
      });
    }

    saveLocalData();
    document.getElementById('modal-class-editor').classList.remove('open');
    renderScheduleGrid();
    
    // 設定のカラーピッカーも追従再生成
    if (typeof renderSubjectColorSettings === 'function') renderSubjectColorSettings();
    
    showToastNotification('時間割を保存しました', 'success');
  });
}
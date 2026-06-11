/**
 * 7. カレンダー・アジェンダ連携モジュール (calendar.js)
 */

let calCurrentDate = new Date(); // カレンダー表示基準月

function initCalendarModule() {
  setupCalendarNav();
  renderCalendarView();
}

/**
 * ナビゲーションボタンの設定
 */
function setupCalendarNav() {
  document.getElementById('btn-cal-prev').addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderCalendarView();
  });
  document.getElementById('btn-cal-next').addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderCalendarView();
  });
}

/**
 * カレンダー本体のレンダリング
 */
function renderCalendarView() {
  const container = document.getElementById('calendar-days-container');
  if (!container) return;
  container.innerHTML = '';

  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();

  // タイトル表示
  document.getElementById('calendar-month-year-title').textContent = `${year}年 ${month + 1}月`;

  // 月の初日と総日数の計算
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  const todayDS = toDS(new Date());

  // 前月の余白セル
  for (let i = firstDayIndex; i > 0; i--) {
    const dayNum = prevTotalDays - i + 1;
    const cell = createDayCell(year, month - 1, dayNum, true);
    container.appendChild(cell);
  }

  // 当月のメインセル
  for (let day = 1; day <= totalDays; day++) {
    const cell = createDayCell(year, month, day, false);
    container.appendChild(cell);
  }

  // 翌月の余白セル (6行 42セルに固定合わせ)
  const remainingCells = 42 - container.children.length;
  for (let i = 1; i <= remainingCells; i++) {
    const cell = createDayCell(year, month + 1, i, true);
    container.appendChild(cell);
  }

  // 初回ロード時などに選択日付アジェンダを自動更新
  renderAgendaList();
}

/**
 * 日付シングルセルの生成
 */
function createDayCell(year, month, day, isOtherMonth) {
  // オーバーフロー・アンダーフロー調整した正規日付オブジェクト
  const targetDate = new Date(year, month, day);
  const dateStr = toDS(targetDate);
  const dow = targetDate.getDay();

  const cell = document.createElement('div');
  cell.className = 'cal-day-cell';
  if (isOtherMonth) cell.classList.add('other-month');
  
  if (dateStr === toDS(new Date())) {
    cell.classList.add('today-cell');
  }
  if (dateStr === selDS) {
    cell.classList.add('selected-cell');
  }

  cell.innerHTML = `<span class="day-num-text">${targetDate.getDate()}</span>`;

  // イベントドットの付与
  const dotContainer = document.createElement('div');
  dotContainer.className = 'cal-dot-container';

  const hasClass = db.classes.some(c => parseInt(c.dow) === dow);
  const hasTask = db.tasks.some(t => t.start === dateStr && !t.done);
  const hasTest = db.tests.some(t => t.start === dateStr && !t.done);

  if (hasClass) dotContainer.innerHTML += '<span class="cal-dot dot-class"></span>';
  if (hasTask) dotContainer.innerHTML += '<span class="cal-dot dot-task"></span>';
  if (hasTest) dotContainer.innerHTML += '<span class="cal-dot dot-test"></span>';
  
  cell.appendChild(dotContainer);

  // クリックイベント
  cell.addEventListener('click', () => {
    selDS = dateStr;
    // セル選択クラス反転
    document.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('selected-cell'));
    cell.classList.add('selected-cell');
    
    renderAgendaList();
  });

  return cell;
}

/**
 * 選択日のアジェンダリスト（右側パネル）レンダリング
 */
function renderAgendaList() {
  const classListContainer = document.getElementById('agenda-classes-list');
  const deadlineListContainer = document.getElementById('agenda-deadlines-list');
  
  if (!classListContainer || !deadlineListContainer) return;

  classListContainer.innerHTML = '';
  deadlineListContainer.innerHTML = '';

  const tDate = selDS ? new Date(selDS) : new Date();
  const dow = tDate.getDay();
  const dateStr = toDS(tDate);

  const dowJa = ['日', '月', '火', '水', '木', '金', '土'];
  document.getElementById('agenda-selected-date-text').textContent = `${tDate.getMonth() + 1}月${tDate.getDate()}日 (${dowJa[dow]}) の予定`;

  // 1. 時間割枠
  const dayClasses = db.classes.filter(c => parseInt(c.dow) === dow);
  dayClasses.sort((a, b) => a.start.localeCompare(b.start));

  if (dayClasses.length === 0) {
    classListContainer.innerHTML = '<p class="settings-desc">授業・コマはありません</p>';
  } else {
    dayClasses.forEach(c => {
      const item = document.createElement('div');
      item.className = 'agenda-item';
      item.style.borderLeftColor = getSubjectColor(c.sub);
      item.innerHTML = `
        <div class="agenda-item-title">${c.sub}</div>
        <div class="agenda-item-time">${c.start} 〜 ${c.end} ${c.room ? ` | ${c.room}` : ''}</div>
      `;
      classListContainer.appendChild(item);
    });
  }

  // 2. タスク・テスト期限
  const dayTasks = db.tasks.filter(t => t.start === dateStr);
  const dayTests = db.tests.filter(t => t.start === dateStr);

  if (dayTasks.length === 0 && dayTests.length === 0) {
    deadlineListContainer.innerHTML = '<p class="settings-desc">期限タスクやテストはありません</p>';
  } else {
    dayTests.forEach(t => {
      const item = document.createElement('div');
      item.className = 'agenda-item';
      item.style.borderLeftColor = 'var(--color-danger)';
      item.innerHTML = `
        <div class="agenda-item-title" style="color:var(--color-danger); font-weight:700;"><i class="fa-solid fa-file-invoice"></i> [テスト] ${t.sub}</div>
        <div class="agenda-item-time">${t.time ? `${t.time}〜 ` : ''}${t.done ? '✅ 完了済' : '⏳ 未完了'}</div>
      `;
      deadlineListContainer.appendChild(item);
    });

    dayTasks.forEach(t => {
      const item = document.createElement('div');
      item.className = 'agenda-item';
      item.style.borderLeftColor = 'var(--color-warning)';
      item.innerHTML = `
        <div class="agenda-item-title"><i class="fa-solid fa-list-check"></i> ${t.sub}</div>
        <div class="agenda-item-time">${t.done ? '✅ 完了済' : '⏳ 未完了'}</div>
      `;
      deadlineListContainer.appendChild(item);
    });
  }
}
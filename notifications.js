/**
 * 3. トースト通知およびプッシュ通知モジュール (notifications.js)
 */

/**
 * アプリ内カスタムトースト通知の表示
 * @param {string} message メッセージ本文
 * @param {string} type 'success' | 'danger' | 'warning' | 'info'
 */
function showToastNotification(message, type = 'info') {
  const container = document.getElementById('toast-notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-alert ${type}`;
  
  let iconHtml = '<i class="fa-solid fa-info-circle"></i>';
  if (type === 'success') iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'danger') iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
  if (type === 'warning') iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';

  toast.innerHTML = `${iconHtml}<span>${message}</span>`;
  container.appendChild(toast);

  // 3.5秒後に自動消去
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * PWA Web Push通知のパーミッション要求
 */
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('このブラウザはデスクトップ通知をサポートしていません。');
    return;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      showToastNotification('通知が許可されました', 'success');
    }
  }
}

/**
 * システムプッシュ通知のトリガー (ServiceWorker経由)
 * @param {string} title 
 * @param {object} options 
 */
function triggerLocalSystemNotification(title, options = {}) {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || 'data:image/png;base64,...',
        badge: options.badge || 'data:image/png;base64,...',
        ...options
      });
    });
  }
}
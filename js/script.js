// 暫存活動資料的陣列（重整網頁會恢復預設值）
let activities = [
  {
    id: 1,
    name: '校園園遊會',
    date: '2026-11-10',
    location: '學校操場'
  }
];

const form = document.getElementById('activity-form');
const listContainer = document.getElementById('activity-list');

// 渲染活動清單卡片
function renderActivities() {
  listContainer.innerHTML = '';

  if (activities.length === 0) {
    listContainer.innerHTML = '<p>目前沒有可報名的活動。</p>';
    return;
  }

  activities.forEach(activity => {
    const card = document.createElement('div');
    card.className = 'activity-card';
    card.innerHTML = `
      <div>
        <h3>${activity.name}</h3>
        <p><strong>日期：</strong>${activity.date}</p>
        <p><strong>地點：</strong>${activity.location}</p>
      </div>
      <button class="btn apply-btn" onclick="handleApply(${activity.id}, '${activity.name}')">我要報名</button>
    `;
    listContainer.appendChild(card);
  });
}

// 處理新增活動
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('act-name').value.trim();
  const date = document.getElementById('act-date').value;
  const location = document.getElementById('act-location').value.trim();

  if (!name || !date || !location) return;

  const newActivity = {
    id: Date.now(), // 簡單使用時間戳記作為唯一 ID
    name,
    date,
    location
  };

  activities.push(newActivity);
  renderActivities();

  // 清空表單欄位
  form.reset();
});

// 暫時的報名按鈕點擊處理（留給後續整合組員功能）
function handleApply(id, name) {
  alert(`你點擊了報名「${name}」（活動 ID: ${id}），後續報名表單即將開放！`);
}

// 初始載入渲染
renderActivities();
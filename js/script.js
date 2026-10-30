// 活動資料（每筆活動包含 registrations 存放報名名單）
let activities = [
  {
    id: 1,
    name: '校園園遊會',
    date: '2026-11-10',
    location: '學校操場',
    registrations: []
  }
];

const form = document.getElementById('activity-form');
const listContainer = document.getElementById('activity-list');

// 彈窗相關元素
const modal = document.getElementById('signup-modal');
const modalTitle = document.getElementById('modal-title');
const signupForm = document.getElementById('signup-form');
const signupActIdInput = document.getElementById('signup-act-id');
const cancelBtn = document.getElementById('cancel-btn');

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
        <p><strong>已報名人數：</strong>${activity.registrations.length} 人</p>
      </div>
      <button class="btn apply-btn" onclick="openModal(${activity.id})">我要報名</button>
    `;
    listContainer.appendChild(card);
  });
}

// 新增活動事件
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('act-name').value.trim();
  const date = document.getElementById('act-date').value;
  const location = document.getElementById('act-location').value.trim();

  if (!name || !date || !location) return;

  const newActivity = {
    id: Date.now(),
    name,
    date,
    location,
    registrations: []
  };

  activities.push(newActivity);
  renderActivities();
  form.reset();
});

// 開啟報名彈窗
function openModal(activityId) {
  const activity = activities.find(a => a.id === activityId);
  if (!activity) return;

  modalTitle.textContent = `報名：${activity.name}`;
  signupActIdInput.value = activity.id;
  modal.classList.remove('hidden');
}

// 關閉報名彈窗
function closeModal() {
  modal.classList.add('hidden');
  signupForm.reset();
}

cancelBtn.addEventListener('click', closeModal);

// 送出報名表單
signupForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const actId = Number(signupActIdInput.value);
  const userName = document.getElementById('user-name').value.trim();
  const userPhone = document.getElementById('user-phone').value.trim();

  const activity = activities.find(a => a.id === actId);
  if (activity) {
    activity.registrations.push({
      name: userName,
      phone: userPhone,
      signupAt: new Date().toLocaleDateString()
    });

    alert(`報名成功！\n活動：${activity.name}\n姓名：${userName}`);
    closeModal();
    renderActivities(); // 更新畫面上的已報名人數
  }
});

// 初始渲染
renderActivities();
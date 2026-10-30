const form = document.getElementById('activity-form');
const listContainer = document.getElementById('activity-list');
const modal = document.getElementById('signup-modal');
const modalTitle = document.getElementById('modal-title');
const signupForm = document.getElementById('signup-form');
const signupActIdInput = document.getElementById('signup-act-id');
const cancelBtn = document.getElementById('cancel-btn');
let activities = [];

async function api(path, options = {}) {
  let response;
  try { response = await fetch(path, options); }
  catch { throw new Error('無法連線到後端，請確認 Flask 已啟動'); }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '操作失敗');
  return data;
}

async function loadActivities() {
  try {
    activities = await api('/api/activities');
    renderActivities();
  } catch (error) {
    listContainer.textContent = error.message;
  }
}

function renderActivities() {
  listContainer.replaceChildren();
  if (!activities.length) {
    listContainer.textContent = '目前沒有可報名的活動。';
    return;
  }
  for (const activity of activities) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = activity.name;
    details.appendChild(title);
    for (const [label, value] of [['日期', activity.date], ['地點', activity.location], ['已報名人數', `${activity.registration_count} 人`]]) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}：`;
      p.append(strong, document.createTextNode(value));
      details.appendChild(p);
    }
    const apply = document.createElement('button');
    apply.className = 'btn apply-btn';
    apply.textContent = '我要報名';
    apply.addEventListener('click', () => openModal(activity.id));
    const view = document.createElement('button');
    view.className = 'btn apply-btn';
    view.textContent = '查看報名名單';
    view.addEventListener('click', () => showRegistrations(activity));
    card.append(details, apply, document.createTextNode(' '), view);
    listContainer.appendChild(card);
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const name = document.getElementById('act-name').value.trim();
  const date = document.getElementById('act-date').value;
  const location = document.getElementById('act-location').value.trim();
  try {
    await api('/api/activities', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,date,location})});
    form.reset();
    await loadActivities();
  } catch (error) { alert(error.message); }
});

function openModal(id) {
  const activity = activities.find(item => item.id === id);
  if (!activity) return;
  modalTitle.textContent = `報名：${activity.name}`;
  signupActIdInput.value = id;
  modal.classList.remove('hidden');
}
function closeModal() { modal.classList.add('hidden'); signupForm.reset(); }
cancelBtn.addEventListener('click', closeModal);

signupForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = Number(signupActIdInput.value);
  const name = document.getElementById('user-name').value.trim();
  const phone = document.getElementById('user-phone').value.trim();
  try {
    await api(`/api/activities/${id}/registrations`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,phone})});
    alert('報名成功！');
    closeModal();
    await loadActivities();
  } catch (error) { alert(error.message); }
});

async function showRegistrations(activity) {
  try {
    const registrations = await api(`/api/activities/${activity.id}/registrations`);
    const lines = registrations.map((r, i) => `${i + 1}. ${r.name}　${r.phone}`);
    alert(`活動：${activity.name}\n報名名單：\n${lines.join('\n') || '目前尚無報名'}`);
  } catch (error) { alert(error.message); }
}
loadActivities();

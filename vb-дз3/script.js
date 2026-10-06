const API_BASE = 'https://inai-col1.fishrungames.com';


const NONLOCAL_WHEN_RESIDENT = true;

const form = document.getElementById('request-form');
const studentInput = document.getElementById('student-id');
const buildingInput = document.getElementById('building-number');
const roomInput = document.getElementById('room-number');
const submitBtn = document.getElementById('submit-btn');
const formError = document.getElementById('form-error');
const resultBox = document.getElementById('result');
const checksList = document.getElementById('checks');
const verdictBox = document.getElementById('verdict');


async function getJson(path) {
  try {
    const response = await fetch(`${API_BASE}${path}`);
    if (response.status === 404) {
      return { ok: false, error: 'не найдено' };
    }
    if (!response.ok) {
      return { ok: false, error: `ошибка сервера (${response.status})` };
    }
    return { ok: true, data: await response.json() };
  } catch (e) {
    return { ok: false, error: 'нет связи с сервером' };
  }
}

const fetchStudent = (id) => getJson(`/students/${id}`);
const fetchBuilding = (num) => getJson(`/buildings/${num}`);
const fetchRoom = (num) => getJson(`/rooms/${num}`);


function checkStudent(res, studentId) {
  if (!res.ok) {
    return { passed: false, text: `Студент №${studentId}: ${res.error}.` };
  }
  const { name, resident } = res.data;
  const isNonLocal = NONLOCAL_WHEN_RESIDENT ? resident === true : resident === false;
  return isNonLocal
    ? { passed: true, text: `${name} — иногородний студент.` }
    : { passed: false, text: `${name} — не иногородний, заселение невозможно.` };
}

function checkBuilding(res, buildingNumber) {
  if (!res.ok) {
    return { passed: false, text: `Корпус №${buildingNumber}: ${res.error}.` };
  }
  return res.data.forStudents
    ? { passed: true, text: `Корпус №${buildingNumber} предназначен для студентов.` }
    : { passed: false, text: `Корпус №${buildingNumber} не предназначен для студентов.` };
}

function checkRoom(res, roomNumber) {
  if (!res.ok) {
    return { passed: false, text: `Комната №${roomNumber}: ${res.error}.` };
  }
  return res.data.available
    ? { passed: true, text: `Комната №${roomNumber} свободна.` }
    : { passed: false, text: `Комната №${roomNumber} занята.` };
}

// ===== Отрисовка =====
function renderChecks(items) {
  checksList.innerHTML = '';
  items.forEach(({ label, passed, text }) => {
    const li = document.createElement('li');
    li.className = passed === null ? 'wait' : passed ? 'pass' : 'fail';

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = passed === null ? '…' : passed ? '✓' : '✗';

    const content = document.createElement('span');
    content.textContent = `${label}: ${text}`;

    li.append(icon, content);
    checksList.appendChild(li);
  });
}

function renderVerdict(allPassed) {
  verdictBox.className = 'verdict ' + (allPassed ? 'ok' : 'denied');
  verdictBox.textContent = allPassed
    ? 'Заявка одобрена: заселение возможно'
    : 'Отказ: заявка не может быть одобрена';
}

// ===== Основная логика =====
async function handleSubmit(event) {
  event.preventDefault();
  formError.textContent = '';

  const studentId = studentInput.value.trim();
  const buildingNumber = buildingInput.value.trim();
  const roomNumber = roomInput.value.trim();

  // Валидация формы
  if (!studentId || !buildingNumber || !roomNumber) {
    formError.textContent = 'Заполните все поля.';
    return;
  }
  if ([studentId, buildingNumber, roomNumber].some((v) => !/^\d+$/.test(v))) {
    formError.textContent = 'Допустимы только целые положительные числа.';
    return;
  }

  submitBtn.disabled = true;
  resultBox.hidden = false;
  verdictBox.className = 'verdict';
  verdictBox.textContent = 'Проверяем...';
  renderChecks([
    { label: '1. Иногородний', passed: null, text: 'проверка...' },
    { label: '2. Корпус для студентов', passed: null, text: 'проверка...' },
    { label: '3. Комната свободна', passed: null, text: 'проверка...' },
  ]);

  // Три запроса идут параллельно и ждём все сразу
  const [studentRes, buildingRes, roomRes] = await Promise.all([
    fetchStudent(studentId),
    fetchBuilding(buildingNumber),
    fetchRoom(roomNumber),
  ]);

  const checks = [
    { label: '1. Иногородний', ...checkStudent(studentRes, studentId) },
    { label: '2. Корпус для студентов', ...checkBuilding(buildingRes, buildingNumber) },
    { label: '3. Комната свободна', ...checkRoom(roomRes, roomNumber) },
  ];

  renderChecks(checks);
  renderVerdict(checks.every((c) => c.passed));
  submitBtn.disabled = false;
}

form.addEventListener('submit', handleSubmit);
const API_URL = "https://inai-col1.fishrungames.com";

const form = document.getElementById("request-form");
const result = document.getElementById("result");

function isOutOfTown(student) {
  return !student.resident;
}

async function getJson(path, notFoundText) {
  const response = await fetch(API_URL + path);
  if (response.status === 404) throw new Error(notFoundText);
  if (!response.ok) throw new Error("Ошибка сервера " + response.status);
  return response.json();
}

function showResult(checks) {
  result.innerHTML = "";

  const allPassed = checks.every((c) => c.passed);

  const verdict = document.createElement("p");
  verdict.className = "verdict " + (allPassed ? "ok" : "fail");
  verdict.textContent = allPassed
    ? "Всё в порядке: заявку можно одобрить"
    : "Отказ: заявку нельзя одобрить";

  const ul = document.createElement("ul");
  ul.className = "checks";
  checks.forEach((c) => {
    const li = document.createElement("li");
    li.className = c.passed ? "pass" : "fail";
    li.textContent = c.text;
    ul.append(li);
  });

  result.append(verdict, ul);
}

function showError(text) {
  result.innerHTML = "";
  const p = document.createElement("p");
  p.className = "verdict fail";
  p.textContent = text;
  result.append(p);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const studentId = document.getElementById("student-id").value;
  const buildingNumber = document.getElementById("building-number").value;
  const roomNumber = document.getElementById("room-number").value;

  const button = form.querySelector("button");
  button.disabled = true;
  result.textContent = "Проверяем...";

  try {
    const [student, building, room] = await Promise.all([
      getJson(`/students/${studentId}`, `Студент с ID ${studentId} не найден`),
      getJson(`/buildings/${buildingNumber}`, `Корпус ${buildingNumber} не найден`),
      getJson(`/rooms/${roomNumber}`, `Комната ${roomNumber} не найдена`),
    ]);

    const checks = [
      {
        passed: isOutOfTown(student),
        text: isOutOfTown(student)
          ? `${student.name} — иногородний студент`
          : `${student.name} — не иногородний, заселение не положено`,
      },
      {
        passed: building.forStudents,
        text: building.forStudents
          ? `Корпус ${building.building_number} предназначен для студентов`
          : `Корпус ${building.building_number} не предназначен для студентов`,
      },
      {
        passed: room.available,
        text: room.available
          ? `Комната ${room.room_number} свободна`
          : `Комната ${room.room_number} занята`,
      },
    ];

    showResult(checks);
  } catch (error) {
    showError(error.message);
  } finally {
    button.disabled = false;
  }
});
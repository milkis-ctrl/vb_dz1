const API_URL = "https://inai-col1.fishrungames.com";

const form = document.getElementById("ad-form");
const list = document.getElementById("ads-list");
const message = document.getElementById("message");


function showMessage(text, type) {
  message.textContent = text;
  message.className = type;
}

function createCard(ad) {
  const card = document.createElement("article");
  card.className = "ad";


  const imageHtml = ad.image_url
  ? `<img src="${API_URL}${ad.image_url}" alt="${ad.title}">`
  : `<img src="https://picsum.photos/400/300" alt="Нет фото">`;

  card.innerHTML = `
    ${imageHtml}
    <div class="ad-body">
      <h3></h3>
      <p></p>
      <span class="price">${ad.price.toLocaleString("ru-RU")} ₽</span>
    </div>
  `;


  card.querySelector("h3").textContent = ad.title;
  card.querySelector("p").textContent = ad.description;
  return card;
}

async function loadAds() {
  try {
    const response = await fetch(`${API_URL}/ads`);
    if (!response.ok) throw new Error("Ошибка " + response.status);

    const data = await response.json();
    list.innerHTML = "";

    if (data.items.length === 0) {
      list.textContent = "Пока нет объявлений. Подайте первое.";
      return;
    }

    data.items.forEach((ad) => list.append(createCard(ad)));
  } catch (error) {
    list.textContent = "Не удалось загрузить объявления: " + error.message;
  }
}


form.addEventListener("submit", async (event) => {
  event.preventDefault(); 

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("image", document.getElementById("image").files[0]);

  const button = form.querySelector("button");
  button.disabled = true;
  showMessage("Отправляем...", "");

  try {
    const response = await fetch(`${API_URL}/ads`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Ошибка " + response.status);

    showMessage("Объявление опубликовано", "ok");
    form.reset();
    loadAds(); 
  } catch (error) {
    showMessage("Не получилось отправить: " + error.message, "error");
  } finally {
    button.disabled = false;
  }
});

loadAds();
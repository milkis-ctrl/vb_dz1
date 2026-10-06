const API_BASE = 'https://inai-col1.fishrungames.com';
const ADS_URL = `${API_BASE}/ads`;
const PAGE_LIMIT = 30;
const CURRENCY = 'сом';

const state = {
  page: 1,
  total: 0,
  limit: PAGE_LIMIT,
};

const form = document.getElementById('ad-form');
const submitBtn = document.getElementById('submit-btn');
const formMessage = document.getElementById('form-message');
const imageInput = document.getElementById('image');
const preview = document.getElementById('preview');

const adsContainer = document.getElementById('ads');
const listStatus = document.getElementById('list-status');
const totalBadge = document.getElementById('total');
const refreshBtn = document.getElementById('refresh-btn');

const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

function setMessage(el, text, type = '') {
  el.textContent = text;
  el.className = 'message' + (type ? ` ${type}` : '');
}

function formatPrice(price) {
  const number = Number(price);
  if (Number.isNaN(number)) return '';
  return `${number.toLocaleString('ru-RU')} ${CURRENCY}`;
}

function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return API_BASE + path; 
}


async function loadAds(page = state.page) {
  setMessage(listStatus, 'Загрузка...');
  try {
    const response = await fetch(`${ADS_URL}?page=${page}&limit=${state.limit}`);
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    const data = await response.json();

    state.page = data.page ?? page;
    state.total = data.total ?? data.items.length;
    state.limit = data.limit ?? state.limit;

    renderAds(data.items);
    renderPagination();
    setMessage(listStatus, data.items.length ? '' : 'Объявлений пока нет.');
  } catch (error) {
    adsContainer.innerHTML = '';
    setMessage(listStatus, `Не удалось загрузить объявления. ${error.message}`, 'error');
  }
}

function renderAds(items) {
  adsContainer.innerHTML = '';
  totalBadge.textContent = state.total;

  items.forEach((ad) => {
    adsContainer.appendChild(createAdCard(ad));
  });
}

function createAdCard(ad) {
  const card = document.createElement('article');
  card.className = 'ad-card';

  const imageUrl = buildImageUrl(ad.image_url);
  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'ad-image';
    img.src = imageUrl;
    img.alt = ad.title;
    img.loading = 'lazy';
    
    img.addEventListener('error', () => {
      img.replaceWith(createNoImage());
    });
    card.appendChild(img);
  } else {
    card.appendChild(createNoImage());
  }

  const body = document.createElement('div');
  body.className = 'ad-body';

  const title = document.createElement('h3');
  title.className = 'ad-title';
  title.textContent = ad.title;

  const desc = document.createElement('p');
  desc.className = 'ad-desc';
  desc.textContent = ad.description;

  const price = document.createElement('div');
  price.className = 'ad-price';
  price.textContent = formatPrice(ad.price);

  body.append(title, desc, price);
  card.appendChild(body);
  return card;
}

function createNoImage() {
  const div = document.createElement('div');
  div.className = 'ad-no-image';
  div.textContent = 'Нет фото';
  return div;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.total / state.limit));
  pagination.hidden = totalPages <= 1;
  pageInfo.textContent = `Страница ${state.page} из ${totalPages}`;
  prevBtn.disabled = state.page <= 1;
  nextBtn.disabled = state.page >= totalPages;
}

async function submitAd(event) {
  event.preventDefault();

  const title = form.title.value.trim();
  const description = form.description.value.trim();
  const price = form.price.value;
  const image = form.image.files[0];

  // Валидация на клиенте
  if (!title || !description) {
    return setMessage(formMessage, 'Заполните заголовок и описание.', 'error');
  }
  if (price === '' || Number(price) < 0) {
    return setMessage(formMessage, 'Введите корректную цену.', 'error');
  }
  if (!image) {
    return setMessage(formMessage, 'Выберите изображение.', 'error');
  }

 
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('price', price);
  formData.append('image', image);

  submitBtn.disabled = true;
  setMessage(formMessage, 'Отправка...');

  try {
    const response = await fetch(ADS_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    await response.json(); 

    setMessage(formMessage, 'Объявление опубликовано!', 'success');
    form.reset();
    preview.hidden = true;
    loadAds(1); 
  } catch (error) {
    setMessage(formMessage, `Не удалось отправить. ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }
});


form.addEventListener('submit', submitAd);
refreshBtn.addEventListener('click', () => loadAds(state.page));
prevBtn.addEventListener('click', () => loadAds(state.page - 1));
nextBtn.addEventListener('click', () => loadAds(state.page + 1));

// ===== Старт =====
loadAds(1);
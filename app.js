/* ==========================================================================
   HALLOWEEN SPOOKY GIFT GENERATOR SPA - APP LOGIC
   ========================================================================== */

// Database of Spooky Halloween Treats & Gift Items
const SPOOKY_ITEMS = [
  { name: 'Шоколадні гарбузики з горіховим праліне', price: 230, icon: '🎃' },
  { name: 'Цукерки "Очні яблука" в марципані', price: 190, icon: '👁️' },
  { name: 'Еліксир "Кривава М’ята" у скляній колбі', price: 280, icon: '🧪' },
  { name: 'Ароматична свічка "Гарбузове Лате & Кориця"', price: 320, icon: '🕯️' },
  { name: 'Керамічна чаша-череп для напоїв', price: 450, icon: '💀' },
  { name: 'Чорні маршмеллоу "Летючі Кажани"', price: 160, icon: '🦇' },
  { name: 'Цукрова вата "Павутиння Жаху"', price: 140, icon: '🕸️' },
  { name: 'Амулет-кулон "Чорний Павук"', price: 340, icon: '🕷️' },
  { name: 'Міні-набір карт Таро & Чорний Аметист', price: 490, icon: '🔮' },
  { name: 'Печиво "Вугілля з рідким шоколадом"', price: 210, icon: '🖤' },
  { name: 'Магічна паличка-карамель зі смаком вишні', price: 150, icon: '🪄' }
];

const SPOOKY_BOXES = [
  { name: 'Чорний Гарбузовий Бокс із кажанами', price: 150, icon: '🎃' },
  { name: 'Дерев’яна скриня Зачарованого Лiсу', price: 250, icon: '🪵' },
  { name: 'Оксамитова містична коробка (Night Purple)', price: 220, icon: '🔮' }
];

const STORAGE_KEY = 'spookyGiftForm';
const CARDS_COUNT = 3;

const VARIANT_NAMES = ['Класичний', 'Затишний', 'Таємничий'];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('spookySearchForm');
  const results = document.getElementById('results');

  restoreForm(form);

  // Browser validates required/min/max/step natively (HTML + CSS only),
  // so "submit" fires only for valid data.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveForm(form);
    renderResults(results, readForm(form));
  });

  // Delegated clicks for regenerate / copy buttons
  results.addEventListener('click', (e) => {
    const regen = e.target.closest('.btn-regenerate');
    const copy = e.target.closest('.btn-copy');
    if (regen) {
      form.requestSubmit();
    } else if (copy) {
      copyCard(copy);
    }
  });
});

function readForm(form) {
  return {
    recipient: form.elements.recipient.value,
    occasion: form.elements.occasion.value,
    budget: Number(form.elements.budget.value)
  };
}

function saveForm(form) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readForm(form)));
  } catch (_) { /* storage may be unavailable */ }
}

function restoreForm(form) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return;
    form.elements.recipient.value = saved.recipient || '';
    form.elements.occasion.value = saved.occasion || '';
    form.elements.budget.value = saved.budget || '';
  } catch (_) { /* ignore broken data */ }
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildSpookyComposition(recipient, occasion, maxBudget, box, variantIndex) {
  let remainingBudget = maxBudget - box.price;
  const selectedItems = [];
  let currentCost = box.price;

  for (const item of shuffle(SPOOKY_ITEMS)) {
    if (selectedItems.length >= 4) break;
    if (item.price <= remainingBudget) {
      selectedItems.push(item);
      remainingBudget -= item.price;
      currentCost += item.price;
    }
  }

  const titleTemplates = {
    'Вампір / Дракула': 'Містичний Бокс «Нічний Вампір» 🧛‍♂️',
    'Гарбузовий Король': 'Королівський Сет «Pumpkin King» 🎃',
    'Відьмочка / Чаклунка': 'Чаклунський Бокс «Зілля & Чари» 🧙‍♀️',
    'Привид / Дух': 'Загадковий Набір «Ghostly Touch» 👻',
    'Зомбі-Друг': 'Драйвовий Сет «Zombie Apocalypse» 🧟',
    'Вовкулака': 'Дикий Бокс «Full Moon Special» 🐺',
    'Магічний Колега': 'Офісний Сет «Magic Working Hours» 🧹',
    'Маленький Монстрик': 'Солодкий Набір «Trick or Treat!» 🍬'
  };

  return {
    recipient,
    occasion,
    maxBudget,
    box,
    variant: VARIANT_NAMES[variantIndex] || `Варіант ${variantIndex + 1}`,
    title: titleTemplates[recipient] || 'Хелловінський Подарунковий Бокс 🎃',
    items: selectedItems,
    totalPrice: currentCost,
    left: maxBudget - currentCost,
    tip: `Зачаровано спеціально для «${recipient}» на подію «${occasion}». Усі інгредієнти безпечні для смертних!`
  };
}

function renderResults(container, { recipient, occasion, budget }) {
  const boxes = shuffle(SPOOKY_BOXES).slice(0, CARDS_COUNT);
  const cards = boxes.map((box, i) => buildSpookyComposition(recipient, occasion, budget, box, i));

  container.innerHTML = `
    <div class="cards-row">${cards.map(renderCard).join('')}</div>
    <div class="results-footer">
      <button type="button" class="btn-regenerate">🔄 Згенерувати інші бокси</button>
    </div>
  `;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function renderCard(data) {
  const percent = Math.min(100, Math.round((data.totalPrice / data.maxBudget) * 100));
  const rows = [data.box, ...data.items].map((item) => `
    <li class="gift-item-row">
      <span class="gift-item-name"><span aria-hidden="true">${item.icon}</span><span>${escapeHtml(item.name)}</span></span>
      <span class="gift-item-cost">${item.price} ₴</span>
    </li>`).join('');

  const plain = [
    `${data.title} (${data.variant})`,
    ...[data.box, ...data.items].map((it) => `- ${it.name} — ${it.price} ₴`),
    `Разом: ${data.totalPrice} ₴`
  ].join('\n');

  return `
    <article class="gift-card" data-copy="${escapeHtml(plain)}">
      <div class="card-top-header">
        <span class="card-tag">🎃 ${escapeHtml(data.occasion)} • Для: ${escapeHtml(data.recipient)}</span>
        <h3 class="card-title">${escapeHtml(data.title)}</h3>
        <p class="card-variant">Варіант: ${escapeHtml(data.variant)}</p>
        <div class="card-price-badge">
          <span class="price-label">Вартість закляття:</span>
          <span class="price-value">${data.totalPrice} ₴</span>
        </div>
        <div class="budget-bar" role="img" aria-label="Використано ${percent}% бюджету"><span style="width:${percent}%"></span></div>
        <p class="budget-left">Залишок бюджету: ${data.left} ₴</p>
      </div>

      <div class="items-list-title">🦇 Склад боксу:</div>
      <ul class="gift-composition-list">${rows}</ul>

      <div class="card-tip-box"><span aria-hidden="true">🔮</span><div>${escapeHtml(data.tip)}</div></div>

      <div class="card-actions">
        <button type="button" class="btn-copy">📋 Скопіювати список</button>
      </div>
    </article>`;
}

async function copyCard(button) {
  const text = button.closest('.gift-card').dataset.copy;
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '✅ Скопійовано';
  } catch (_) {
    button.textContent = '⚠️ Не вдалося скопіювати';
  }
  setTimeout(() => { button.textContent = original; }, 1800);
}


/* ==========================================================================
   LOAD SETTINGS SAVED FROM THE SEPARATE ADMIN PAGE
   ========================================================================== */
(function () {
  'use strict';
  const KEY = 'spookyAdminData';
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function replaceContents(target, source) {
    target.splice.apply(target, [0, target.length].concat(clone(source)));
  }
  function fillSelect(select, items) {
    if (!select || !Array.isArray(items)) return;
    while (select.options.length > 1) select.remove(1);
    items.forEach(function (item) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });
  }
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!data || !Array.isArray(data.recipients) || !Array.isArray(data.occasions) ||
        !Array.isArray(data.items) || !Array.isArray(data.boxes)) return;
    fillSelect(document.getElementById('recipientSelect'), data.recipients);
    fillSelect(document.getElementById('occasionSelect'), data.occasions);
    replaceContents(SPOOKY_ITEMS, data.items);
    replaceContents(SPOOKY_BOXES, data.boxes);
    const budget = document.getElementById('budgetInput');
    const hint = document.getElementById('budgetHint');
    const error = document.querySelector('.err-range');
    if (budget && data.min > 0 && data.max > data.min) {
      budget.min = data.min; budget.max = data.max;
      if (hint) hint.textContent = 'Мінімум ' + data.min + ' ₴, крок 10 ₴.';
      if (error) error.textContent = 'Бюджет має бути від ' + data.min + ' до ' + data.max + ' ₴ (крок 10).';
    }
  } catch (_) { /* Ignore unavailable or invalid saved settings. */ }
})();

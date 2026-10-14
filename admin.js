(() => {
  'use strict';
  const KEY = 'spookyAdminData';
  const AUTH = 'spookyAdminAuth';
  const PASSWORD = 'admin123'; // Demo password only; not secure authentication.
  const MIN_BOXES = 3;
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));

  const defaults = {
    recipients: [
      { value: 'Вампір / Дракула', label: '🧛‍♂️ Вампір / Дракула' },
      { value: 'Гарбузовий Король', label: '🎃 Гарбузовий Король' },
      { value: 'Відьмочка / Чаклунка', label: '🧙‍♀️ Відьмочка / Чаклунка' },
      { value: 'Привид / Дух', label: '👻 Привид / Дух' },
      { value: 'Зомбі-Друг', label: '🧟 Зомбі-Друг' },
      { value: 'Вовкулака', label: '🐺 Вовкулака' },
      { value: 'Магічний Колега', label: '🧹 Магічний Колега' },
      { value: 'Маленький Монстрик', label: '🍬 Маленький Монстрик (Дитина)' }
    ],
    occasions: [
      { value: 'Ніч Хелловіна (31 Жовтня)', label: '🎃 Ніч Хелловіна (31 Жовтня)' },
      { value: 'Відьомський Шабаш', label: '🔮 Відьомський Шабаш' },
      { value: 'Костюмована Вечірка', label: '👻 Костюмована Вечірка' },
      { value: 'Trick or Treat!', label: '🍬 Trick or Treat! (Солодощі)' },
      { value: 'Повня та Містика', label: '🌕 Повня та Містичний вечір' }
    ],
    items: [
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
    ],
    boxes: [
      { name: 'Чорний Гарбузовий Бокс із кажанами', price: 150, icon: '🎃' },
      { name: 'Дерев’яна скриня Зачарованого Лiсу', price: 250, icon: '🪵' },
      { name: 'Оксамитова містична коробка (Night Purple)', price: 220, icon: '🔮' }
    ],
    min: 300,
    max: 100000
  };

  let data = load();
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && Array.isArray(saved.recipients) && Array.isArray(saved.occasions) &&
          Array.isArray(saved.items) && Array.isArray(saved.boxes) &&
          saved.items.length && saved.boxes.length && saved.min > 0 && saved.max > saved.min) return saved;
    } catch (_) {}
    return clone(defaults);
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {} }
  function say(message) { $('adminMsg').textContent = message; }

  let editing = null; // { key, index } — рядок, який зараз редагується
  const isEditing = (key, index) => editing && editing.key === key && editing.index === index;
  function commit(message) { editing = null; save(); renderAdmin(); say(message); }
  function startEdit(key, index) { editing = { key, index }; renderAdmin(); say(''); }
  function cancelEdit() { editing = null; renderAdmin(); say(''); }

  function actionButton(text, name, onClick, extraClass) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'admin-del' + (extraClass ? ' ' + extraClass : '');
    button.textContent = text;
    button.setAttribute('aria-label', name);
    button.addEventListener('click', onClick);
    return button;
  }
  function textInput(value, placeholder, extraClass, maxLength) {
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'form-input ' + (extraClass || '');
    input.value = value; input.placeholder = placeholder; input.maxLength = maxLength || 80;
    input.setAttribute('aria-label', placeholder);
    return input;
  }
  function onEnterEsc(input, save) {
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') save();
      else if (event.key === 'Escape') cancelEdit();
    });
  }

  function renderOptionList(id, key) {
    const list = $(id); list.textContent = '';
    data[key].forEach((item, index) => {
      const li = document.createElement('li');
      if (isEditing(key, index)) {
        li.className = 'admin-editing';
        const label = textInput(item.label, 'Назва у списку (з емодзі)', '', 60);
        const value = textInput(item.value, 'Текст у картці результату', '', 60);
        const apply = () => {
          const l = label.value.trim(), v = value.value.trim();
          if (!l || !v) return say('Заповніть обидва поля.');
          if (data[key].some((other, i) => i !== index && other.value.toLowerCase() === v.toLowerCase()))
            return say('Такий варіант уже є.');
          item.label = l; item.value = v; commit('Збережено.');
        };
        [label, value].forEach(input => onEnterEsc(input, apply));
        li.append(label, value,
          actionButton('✓', 'Зберегти', apply, 'admin-ok'),
          actionButton('↩', 'Скасувати', cancelEdit));
        list.appendChild(li);
        label.focus();
        return;
      }
      const span = document.createElement('span');
      span.className = 'admin-item-name'; span.textContent = item.label;
      li.append(span,
        actionButton('✏️', 'Редагувати: ' + item.label, () => startEdit(key, index)),
        actionButton('✕', 'Видалити: ' + item.label, () => {
          if (data[key].length <= 1) return say('Має лишитися хоча б один варіант.');
          data[key].splice(index, 1); commit('Видалено.');
        }));
      list.appendChild(li);
    });
  }
  function renderCatalog(id, key, minimum) {
    const list = $(id); list.textContent = '';
    data[key].forEach((item, index) => {
      const li = document.createElement('li');
      if (isEditing(key, index)) {
        li.className = 'admin-editing';
        const icon = textInput(item.icon, 'Іконка', 'admin-icon', 4);
        const name = textInput(item.name, 'Назва', '', 80);
        const price = document.createElement('input');
        price.type = 'number'; price.min = '10'; price.step = '10';
        price.className = 'form-input admin-price-edit'; price.value = item.price;
        price.setAttribute('aria-label', 'Ціна');
        const apply = () => {
          const n = name.value.trim(), p = Math.round(Number(price.value));
          if (!n) return say('Введіть назву.');
          if (!(p >= 10)) return say('Ціна має бути від 10 ₴.');
          item.icon = icon.value.trim() || item.icon; item.name = n; item.price = p;
          commit('Збережено.');
        };
        [icon, name, price].forEach(input => onEnterEsc(input, apply));
        li.append(icon, name, price,
          actionButton('✓', 'Зберегти', apply, 'admin-ok'),
          actionButton('↩', 'Скасувати', cancelEdit));
        list.appendChild(li);
        name.focus();
        return;
      }
      const span = document.createElement('span');
      span.className = 'admin-item-name'; span.textContent = item.icon + ' ' + item.name;
      const price = document.createElement('input');
      price.type = 'number'; price.min = '10'; price.step = '10';
      price.className = 'form-input admin-price-edit'; price.value = item.price;
      price.setAttribute('aria-label', 'Ціна: ' + item.name);
      price.addEventListener('change', () => {
        const value = Math.round(Number(price.value));
        if (!(value >= 10)) { price.value = item.price; return say('Ціна має бути від 10 ₴.'); }
        item.price = value; commit('Ціну оновлено.');
      });
      li.append(span, price,
        actionButton('✏️', 'Редагувати: ' + item.name, () => startEdit(key, index)),
        actionButton('✕', 'Видалити: ' + item.name, () => {
          if (data[key].length <= minimum) return say('Мінімум позицій у цьому списку: ' + minimum + '.');
          data[key].splice(index, 1); commit('Видалено.');
        }));
      list.appendChild(li);
    });
  }
  function renderAdmin() {
    renderOptionList('adminRecipients', 'recipients');
    renderOptionList('adminOccasions', 'occasions');
    renderCatalog('adminItems', 'items', 1);
    renderCatalog('adminBoxes', 'boxes', MIN_BOXES);
    $('adminMin').value = data.min; $('adminMax').value = data.max;
  }
  function addOption(inputId, key) {
    const input = $(inputId), label = input.value.trim();
    if (!label) return say('Введіть назву.');
    if (data[key].some(item => item.value.toLowerCase() === label.toLowerCase())) return say('Такий варіант уже є.');
    data[key].push({ value: label, label }); input.value = ''; commit('Додано: ' + label);
  }
  function addCatalog(key, iconId, nameId, priceId, fallbackIcon) {
    const name = $(nameId).value.trim();
    const price = Math.round(Number($(priceId).value));
    const icon = $(iconId).value.trim() || fallbackIcon;
    if (!name) return say('Введіть назву.');
    if (!(price >= 10)) return say('Ціна має бути від 10 ₴.');
    data[key].push({ name, price, icon });
    $(nameId).value = ''; $(priceId).value = ''; $(iconId).value = '';
    commit('Додано: ' + name);
  }
  function setAuth(ok) {
    $('adminLogin').hidden = ok; $('adminPanel').hidden = !ok;
    try { ok ? sessionStorage.setItem(AUTH, '1') : sessionStorage.removeItem(AUTH); } catch (_) {}
    if (ok) renderAdmin();
  }
  function login() {
    if ($('adminPass').value === PASSWORD) {
      $('adminPass').value = ''; $('adminLoginMsg').textContent = ''; setAuth(true);
    } else $('adminLoginMsg').textContent = 'Невірний пароль.';
  }

  $('adminLoginBtn').addEventListener('click', login);
  $('adminPass').addEventListener('keydown', event => { if (event.key === 'Enter') login(); });
  $('addRecipientBtn').addEventListener('click', () => addOption('newRecipient', 'recipients'));
  $('addOccasionBtn').addEventListener('click', () => addOption('newOccasion', 'occasions'));
  $('addItemBtn').addEventListener('click', () => addCatalog('items', 'newItemIcon', 'newItemName', 'newItemPrice', '🎁'));
  $('addBoxBtn').addEventListener('click', () => addCatalog('boxes', 'newBoxIcon', 'newBoxName', 'newBoxPrice', '📦'));
  $('saveBudgetBtn').addEventListener('click', () => {
    const min = Math.round(Number($('adminMin').value));
    const max = Math.round(Number($('adminMax').value));
    if (!(min >= 10) || !(max > min)) return say('Максимум має бути більшим за мінімум.');
    data.min = min; data.max = max; commit('Ліміти бюджету збережено.');
  });
  $('adminResetBtn').addEventListener('click', () => { data = clone(defaults); commit('Скинуто до початкових значень.'); });
  $('adminLogoutBtn').addEventListener('click', () => setAuth(false));
  try { if (sessionStorage.getItem(AUTH)) setAuth(true); } catch (_) {}
})();

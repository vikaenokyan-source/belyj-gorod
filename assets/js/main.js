(() => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const WA = '79269269222';
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
  const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- шапка ---------- */
  const bar = $('#bar');
  const hero = $('.hero');
  const onScroll = () => bar.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - 120);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#burger');
  const nav = $('#nav');
  const toggleNav = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    bar.classList.toggle('is-solid', open || window.scrollY > hero.offsetHeight - 120);
  };
  burger.addEventListener('click', () => toggleNav(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => toggleNav(false)));

  /* ---------- первый экран: слайды и стрелки ---------- */
  const slides = $$('.hero__slide');
  const bars = $$('.hero__progress i');
  let slide = 0;
  let timer;
  const show = (i) => {
    slides[slide].classList.remove('is-on');
    bars[slide].classList.remove('is-on');
    slide = (i + slides.length) % slides.length;
    slides[slide].classList.add('is-on');
    void bars[slide].offsetWidth; // перезапуск полоски прогресса
    bars[slide].classList.add('is-on');
    clearInterval(timer);
    timer = setInterval(() => show(slide + 1), 6000);
  };
  timer = setInterval(() => show(slide + 1), 6000);
  $('#heroPrev').addEventListener('click', () => show(slide - 1));
  $('#heroNext').addEventListener('click', () => show(slide + 1));

  // если в assets/video есть hero.mp4 — показываем видео вместо слайдов
  const heroVideo = $('.hero__video');
  heroVideo.addEventListener('canplay', () => {
    heroVideo.play();
    hero.classList.add('has-video');
    clearInterval(timer);
  }, { once: true });
  heroVideo.src = heroVideo.dataset.src;

  // тарелка чуть поворачивается при прокрутке
  const plate = $('.hero__plate');
  window.addEventListener('scroll', () => {
    const y = Math.min(window.scrollY, 900);
    plate.style.translate = `0 ${y * -0.12}px`;
    plate.style.rotate = `${y * 0.04}deg`;
  }, { passive: true });

  /* ---------- часы ---------- */
  const day = new Date().getDay(); // 0 — воскресенье
  $('#todayHours').textContent = day === 5 || day === 6 ? 'Сегодня до 03:00' : 'Сегодня до 00:00';
  $('#year').textContent = new Date().getFullYear();

  /* ---------- появление ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const observe = (root = document) => $$('.rise:not(.is-in)', root).forEach((el) => io.observe(el));
  observe();

  /* ---------- меню ---------- */
  const MENU = window.MENU || [];
  const chips = $('#menuChips');
  const list = $('#menuList');
  const board = $('#menuBoard');

  const openCategory = (i) => {
    const cat = MENU[i];
    $$('.chip', chips).forEach((c, k) => {
      c.classList.toggle('is-on', k === i);
      c.setAttribute('aria-selected', k === i);
    });
    $('#menuTitle').textContent = cat.category;
    list.innerHTML = cat.items.map((d, k) => `
      <article class="dish" style="animation-delay:${k * 35}ms">
        <h4>${escape(d.name)}</h4>
        ${d.price ? `<span class="dish__price">${fmt(d.price)} ₽</span>` : '<span class="dish__price dish__price--ask">уточняйте</span>'}
        <span class="dish__w">${escape(d.weight || '')}</span>
        ${d.desc ? `<p>${escape(d.desc)}</p>` : ''}
      </article>`).join('');
  };
  const openByName = (name, scroll) => {
    const i = MENU.findIndex((c) => c.category === name);
    if (i < 0) return;
    openCategory(i);
    if (scroll) board.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  chips.innerHTML = MENU.map((c, i) => `<button class="chip" role="tab" data-i="${i}">${escape(c.category)}<sup>${c.items.length}</sup></button>`).join('');
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('.chip');
    if (c) openCategory(+c.dataset.i);
  });
  openByName('Шашлык & Гриль');
  if (!list.innerHTML && MENU.length) openCategory(0);

  $$('.podium').forEach((p) => p.addEventListener('click', () => openByName(p.dataset.cat, true)));
  $$('[data-cat-link]').forEach((a) => a.addEventListener('click', () => openByName(a.dataset.catLink)));

  /* ---------- наборы ---------- */
  const sets = MENU.find((c) => c.category === 'Наборы на компанию');
  if (sets) {
    $('#setsList').innerHTML = sets.items.map((s) =>
      `<li><b>${escape(s.name.replace('Набор ', ''))}</b><small>${escape(s.weight)}</small><em>${fmt(s.price)} ₽</em></li>`).join('');
  }

  /* ---------- поводы ---------- */
  const EVENTS = {
    wedding: {
      img: 'assets/img/wed-boho.webp',
      title: 'Свадьба, о которой будут вспоминать',
      text: 'Президиум с живыми цветами, троны для молодожёнов, арка и выездная регистрация прямо в ресторане. Ведущий, DJ, первый танец в тяжёлом дыму и лезгинка до утра.',
      list: ['Оформление зала и президиума', 'Свадебная арка и выездная церемония', 'Ведущий и DJ', 'Шоу-программа и национальные танцы'],
    },
    birthday: {
      img: 'assets/img/banq-2.webp',
      title: 'Юбилей и день рождения',
      text: 'Скидка до 30% на весь счёт за три дня до и после дня рождения. Шах-плов с огнём, торт, поздравление от команды и танцпол для всех поколений.',
      list: ['Скидка именинникам до 30%', 'Шах-плов с огненной подачей', 'Музыка по заказу и живой вокал', 'Отдельный малый зал за портьерой'],
    },
    corporate: {
      img: 'assets/img/party-1.webp',
      title: 'Корпоратив без забот',
      text: 'Банкетное меню от 3000 ₽ на гостя, анимация и DJ, проектор и экраны для презентаций. Оплата по безналичному расчёту для юрлиц.',
      list: ['Меню от 3000 ₽ на гостя', 'Проектор и 2 экрана', 'Ведущий, DJ, анимация', 'Безналичный расчёт'],
    },
    family: {
      img: 'assets/img/banq-4.webp',
      title: 'Семейный праздник',
      text: 'Крестины, помолвки, встречи родни и памятные обеды. Сервируем стол по-кавказски щедро, есть детское меню и халяльные блюда.',
      list: ['Детское меню', 'Халяльная кухня', 'Свадебный фуршет и помолвка', 'Поминальные обеды'],
    },
  };
  const eventCard = $('#eventCard');
  $$('.occasion').forEach((o) => o.addEventListener('click', () => {
    if (o.classList.contains('is-on')) return;
    $$('.occasion').forEach((x) => {
      x.classList.toggle('is-on', x === o);
      x.setAttribute('aria-selected', x === o);
    });
    const ev = EVENTS[o.dataset.event];
    eventCard.classList.add('is-switching');
    setTimeout(() => {
      $('#eventImg').src = ev.img;
      $('#eventTitle').textContent = ev.title;
      $('#eventText').textContent = ev.text;
      $('#eventList').innerHTML = ev.list.map((l) => `<li>${escape(l)}</li>`).join('');
      eventCard.classList.remove('is-switching');
    }, 300);
  }));

  /* ---------- калькулятор ---------- */
  const guests = $('#guests');
  const calc = () => {
    const g = +guests.value;
    const pkgInput = $('input[name="pkg"]:checked');
    const pkg = +pkgInput.value;
    const pkgName = $('b', pkgInput.nextElementSibling).textContent;
    const extras = $$('.toggles input:checked');
    const total = g * pkg + extras.reduce((s, x) => s + +x.value, 0);
    $('#guestsOut').textContent = g;
    guests.style.setProperty('--p', ((g - guests.min) / (guests.max - guests.min)) * 100 + '%');
    $('#calcTotal').textContent = fmt(total) + ' ₽';
    $('#calcPer').textContent = `≈ ${fmt(Math.round(total / g))} ₽ на гостя`;
    const msg = `Здравствуйте! Хочу заказать банкет в «Белом городе».\nГостей: ${g}\nМеню: ${pkgName} (${fmt(pkg)} ₽/гость)` +
      (extras.length ? `\nДополнительно: ${extras.map((x) => x.dataset.name).join(', ')}` : '') +
      `\nОриентировочно: ${fmt(total)} ₽`;
    $('#calcSend').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  };
  const step = (d) => {
    guests.value = Math.min(+guests.max, Math.max(+guests.min, +guests.value + d));
    calc();
  };
  $('#guestsMinus').addEventListener('click', () => step(-5));
  $('#guestsPlus').addEventListener('click', () => step(5));
  $('#calc').addEventListener('input', calc);
  calc();

  /* ---------- галерея ---------- */
  // [файл, раздел, подпись, размер плитки]
  const G = [
    ['hall-wide', 'interior', 'Банкетный зал', 'big'], ['f-pork-neck', 'food', 'Шашлык из свиной шейки'], ['show-tanoura', 'party', 'Шоу танура', 'tall'],
    ['f-caprese', 'food', 'Капрезе'], ['wed-boho', 'party', 'Свадебный президиум', 'big'], ['hall-chandelier', 'interior', 'Хрустальные люстры', 'tall'],
    ['f-assorti', 'food', 'Ассорти с мангала'], ['show-lezginka', 'party', 'Лезгинка'], ['f-greek', 'food', 'Греческий салат'],
    ['hall-teal', 'interior', 'Вечерний свет', 'big'], ['f-lamb-chops', 'food', 'Каре ягнёнка'], ['wed-balloons', 'party', 'Оформление шарами', 'tall'],
    ['f-fish', 'food', 'Рыбное блюдо', 'tall'], ['banq-1', 'party', 'Банкетный стол'], ['f-shrimp-salad', 'food', 'Салат с креветками'],
    ['hall-4', 'interior', 'Зал', 'tall'], ['show-plov-fire', 'party', 'Шах-плов с огнём', 'big'], ['f-salmon-salad', 'food', 'Салат с сёмгой'],
    ['wed-presidium-2', 'party', 'Президиум'], ['f-lulya', 'food', 'Люля-кебаб'], ['hall-5', 'interior', 'Зал', 'tall'],
    ['f-pig', 'food', 'Молочный поросёнок', 'big'], ['show-dancer', 'party', 'Национальный танец', 'tall'], ['f-chicken', 'food', 'Курица на мангале'],
    ['wed-decor', 'party', 'Декор', 'tall'], ['f-sach', 'food', 'Садж', 'tall'], ['hall-7', 'interior', 'Сервировка'],
    ['f-basturma', 'food', 'Бастурма'], ['party-2', 'party', 'Праздник', 'big'], ['f-tartare', 'food', 'Закуска'],
    ['bar-man', 'interior', 'Бар'], ['f-steak', 'food', 'Мясо на углях'], ['banq-2', 'party', 'Фуршет', 'tall'],
    ['f-lentil-soup', 'food', 'Чечевичный суп'], ['hall-2', 'interior', 'Зал', 'tall'], ['f-fish-2', 'food', 'Рыба на банкете', 'tall'],
    ['show-wedding-dance', 'party', 'Первый танец', 'tall'], ['f-salad-veg', 'food', 'Овощной салат'], ['wed-night', 'party', 'Свадебная зона', 'tall'],
    ['drink-aperol', 'food', 'Апероль', 'tall'], ['banq-5', 'party', 'Банкет', 'big'], ['f-liver', 'food', 'Печень ягнёнка'],
    ['wed-boho-2', 'party', 'Свадебный декор', 'tall'], ['hall-6', 'interior', 'Сервировка зала', 'tall'], ['f-ribs', 'food', 'Рёбрышки на мангале'],
    ['wed-table-2', 'party', 'Банкетный стол', 'tall'], ['f-carving', 'food', 'Подача у стола', 'tall'], ['f-fruits', 'food', 'Фруктовая композиция', 'tall'],
  ];
  const mosaic = $('#mosaic');
  const more = $('#galleryMore');
  const STEP = 12;
  let filter = 'all';
  let shown = STEP;
  let current = [];

  const renderGallery = () => {
    const items = G.filter((g) => filter === 'all' || g[1] === filter);
    current = items.slice(0, shown);
    mosaic.innerHTML = current.map(([f, , alt, size], i) =>
      `<figure data-i="${i}" class="${size ? 'is-' + size : ''}" style="animation-delay:${(i % STEP) * 45}ms"><img src="assets/img/${f}.webp" alt="${escape(alt)}" loading="lazy"></figure>`).join('');
    more.hidden = shown >= items.length;
  };
  $$('.gallery__head .chip').forEach((c) => c.addEventListener('click', () => {
    $$('.gallery__head .chip').forEach((x) => x.classList.toggle('is-on', x === c));
    filter = c.dataset.filter;
    shown = STEP;
    renderGallery();
  }));
  more.addEventListener('click', () => { shown += STEP; renderGallery(); });
  renderGallery();

  /* ---------- просмотр фото ---------- */
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  let lbIndex = 0;
  const openLb = (i) => {
    lbIndex = (i + current.length) % current.length;
    lbImg.src = `assets/img/${current[lbIndex][0]}.webp`;
    lbImg.alt = current[lbIndex][2];
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
  };
  const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); };
  mosaic.addEventListener('click', (e) => {
    const f = e.target.closest('figure');
    if (f) openLb(+f.dataset.i);
  });
  $('.lightbox__close', lb).addEventListener('click', closeLb);
  $('.lightbox__prev', lb).addEventListener('click', () => openLb(lbIndex - 1));
  $('.lightbox__next', lb).addEventListener('click', () => openLb(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIndex - 1);
    if (e.key === 'ArrowRight') openLb(lbIndex + 1);
  });

  /* ---------- отзывы ---------- */
  const quotes = $$('.quote');
  const qDots = $('#qDots');
  qDots.innerHTML = quotes.map((_, i) => `<i class="${i ? '' : 'is-on'}"></i>`).join('');
  let q = 0;
  let qTimer;
  const showQuote = (i) => {
    quotes[q].classList.remove('is-on');
    qDots.children[q].classList.remove('is-on');
    q = (i + quotes.length) % quotes.length;
    quotes[q].classList.add('is-on');
    qDots.children[q].classList.add('is-on');
    clearInterval(qTimer);
    qTimer = setInterval(() => showQuote(q + 1), 9000);
  };
  qTimer = setInterval(() => showQuote(q + 1), 9000);
  $('#qPrev').addEventListener('click', () => showQuote(q - 1));
  $('#qNext').addEventListener('click', () => showQuote(q + 1));

  /* ---------- бронь ---------- */
  const form = $('#bookingForm');
  const timeSelect = $('#timeSelect');
  for (let h = 11; h <= 23; h++) {
    ['00', '30'].forEach((m) => timeSelect.add(new Option(`${h}:${m}`, `${h}:${m}`, false, h === 19 && m === '00')));
  }
  const dateInput = form.elements.date;
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = iso(new Date());
  dateInput.value = iso(new Date());

  const phone = form.elements.phone;
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    phone.value = '+7' + (p[0] ? ` (${p[0]}` : '') + (p[0].length === 3 ? ')' : '') + (p[1] ? ` ${p[1]}` : '') + (p[2] ? `-${p[2]}` : '') + (p[3] ? `-${p[3]}` : '');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    let ok = true;
    [f.name, f.phone, f.date].forEach((el) => {
      const bad = el === f.phone ? el.value.replace(/\D/g, '').length < 11 : !el.value.trim();
      el.closest('.field').classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const date = new Date(f.date.value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
    const msg = `Здравствуйте! Хочу забронировать стол в «Белом городе».\n` +
      `Имя: ${f.name.value.trim()}\nТелефон: ${f.phone.value}\nДата: ${date}, ${f.time.value}\n` +
      `Гостей: ${f.guests.value}\nПовод: ${f.occasion.value}` + (f.comment.value.trim() ? `\nПожелания: ${f.comment.value.trim()}` : '');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- активный пункт меню ---------- */
  const navLinks = $$('.bar__nav a[href^="#"]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });
})();

(() => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const WA = '79269269222';
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

  /* ---------- header ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#burger');
  const nav = $('#nav');
  const toggleNav = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleNav(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => toggleNav(false)));

  /* ---------- hero slideshow ---------- */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dots span');
  let slide = 0;
  setInterval(() => {
    slides[slide].classList.remove('is-active');
    dots[slide].classList.remove('is-active');
    slide = (slide + 1) % slides.length;
    slides[slide].classList.add('is-active');
    dots[slide].classList.add('is-active');
  }, 6000);

  // если в assets/video есть hero.mp4 — показываем видео вместо слайдов
  const heroVideo = $('.hero__video');
  heroVideo.addEventListener('canplay', () => {
    heroVideo.play();
    heroVideo.closest('.hero').classList.add('has-video');
  }, { once: true });
  heroVideo.src = heroVideo.dataset.src;

  /* ---------- today hours ---------- */
  const day = new Date().getDay(); // 0 — воскресенье
  $('#todayHours').textContent = day === 5 || day === 6 ? '11:00 — 03:00' : '11:00 — 00:00';
  $('#year').textContent = new Date().getFullYear();

  /* ---------- reveal & counters ---------- */
  const countUp = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const observe = (root = document) => $$('.reveal:not(.is-visible), .rating', root).forEach((el) => io.observe(el));
  observe();

  /* ---------- menu ---------- */
  const MENU = window.MENU || [];
  const tabs = $('#menuTabs');
  const list = $('#menuList');
  const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const renderCategory = (i) => {
    const cat = MENU[i];
    $$('.menu-tab', tabs).forEach((t, k) => {
      t.classList.toggle('is-active', k === i);
      t.setAttribute('aria-selected', k === i);
    });
    list.innerHTML = `<h3 class="menu-list__title">${escape(cat.category)}</h3>` + cat.items.map((d, k) => `
      <div class="dish" style="animation-delay:${k * 40}ms">
        <div class="dish__top">
          <span class="dish__name">${escape(d.name)}</span>
          <span class="dish__dots"></span>
          ${d.weight ? `<span class="dish__weight">${escape(d.weight)}</span>` : ''}
          ${d.price ? `<span class="dish__price">${fmt(d.price)} ₽</span>` : '<span class="dish__price dish__price--ask">уточняйте</span>'}
        </div>
        ${d.desc ? `<p class="dish__desc">${escape(d.desc)}</p>` : ''}
      </div>`).join('');
  };

  tabs.innerHTML = MENU.map((c, i) => `<button class="menu-tab" role="tab" data-i="${i}">${escape(c.category)}<sup>${c.items.length}</sup></button>`).join('');
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.menu-tab');
    if (b) renderCategory(+b.dataset.i);
  });
  const shashlik = MENU.findIndex((c) => c.category === 'Шашлык & Гриль');
  if (MENU.length) renderCategory(shashlik > -1 ? shashlik : 0);

  $$('.menu-cat').forEach((b) => b.addEventListener('click', () => {
    const i = MENU.findIndex((c) => c.category === b.dataset.jump);
    if (i < 0) return;
    renderCategory(i);
    $('.menu-board').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  /* ---------- sets ---------- */
  const sets = MENU.find((c) => c.category === 'Наборы на компанию');
  if (sets) {
    $('#setsList').innerHTML = sets.items.map((s) => `
      <li class="reveal"><b>${escape(s.name.replace('Набор ', ''))}</b><span></span><small>${escape(s.weight)}</small><em>${fmt(s.price)} ₽</em></li>`).join('');
    observe($('#setsList'));
  }

  /* ---------- events ---------- */
  const EVENTS = {
    wedding: {
      img: 'assets/img/wed-presidium.webp',
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
  $$('.events-tab').forEach((tab) => tab.addEventListener('click', () => {
    if (tab.classList.contains('is-active')) return;
    $$('.events-tab').forEach((t) => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    const ev = EVENTS[tab.dataset.event];
    eventCard.classList.add('is-switching');
    setTimeout(() => {
      $('#eventImg').src = ev.img;
      $('#eventTitle').textContent = ev.title;
      $('#eventText').textContent = ev.text;
      $('#eventList').innerHTML = ev.list.map((l) => `<li>${escape(l)}</li>`).join('');
      eventCard.classList.remove('is-switching');
    }, 300);
  }));

  /* ---------- banquet calculator ---------- */
  const guests = $('#guests');
  const calc = () => {
    const g = +guests.value;
    const pkg = +$('input[name="pkg"]:checked').value;
    const pkgName = $('input[name="pkg"]:checked + span b').textContent;
    const extras = $$('.extras input:checked');
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
  $('.calc').addEventListener('input', calc);
  calc();

  /* ---------- gallery ---------- */
  const G = [
    ['hall-wide', 'interior', 'Банкетный зал'], ['f-pork-neck', 'food', 'Шашлык из свиной шейки'], ['wed-boho', 'party', 'Свадебный президиум'],
    ['hall-chandelier', 'interior', 'Хрустальные люстры'], ['f-caprese', 'food', 'Капрезе'], ['show-lezginka', 'party', 'Лезгинка'],
    ['f-assorti', 'food', 'Ассорти с мангала'], ['wed-balloons', 'party', 'Оформление шарами'], ['hall-3', 'interior', 'Сервировка'],
    ['f-greek', 'food', 'Греческий салат'], ['show-tanoura', 'party', 'Шоу танура'], ['f-lamb-chops', 'food', 'Каре ягнёнка'],
    ['hall-teal', 'interior', 'Вечерний свет'], ['f-fish', 'food', 'Рыбное блюдо'], ['banq-1', 'party', 'Банкетный стол'],
    ['f-shrimp-salad', 'food', 'Салат с креветками'], ['hall-4', 'interior', 'Зал'], ['show-plov-fire', 'party', 'Шах-плов с огнём'],
    ['f-salmon-salad', 'food', 'Салат с сёмгой'], ['wed-presidium-2', 'party', 'Президиум'], ['f-lulya', 'food', 'Люля-кебаб'],
    ['hall-5', 'interior', 'Зал'], ['f-pig', 'food', 'Молочный поросёнок'], ['show-dancer', 'party', 'Национальный танец'],
    ['f-chicken', 'food', 'Курица на мангале'], ['wed-decor', 'party', 'Декор'], ['f-sach', 'food', 'Садж'],
    ['hall-7', 'interior', 'Сервировка'], ['f-basturma', 'food', 'Бастурма'], ['party-2', 'party', 'Праздник'],
    ['f-tartare', 'food', 'Закуска'], ['bar-man', 'interior', 'Бар'], ['f-steak', 'food', 'Мясо на углях'],
    ['banq-2', 'party', 'Фуршет'], ['f-lentil-soup', 'food', 'Чечевичный суп'], ['hall-2', 'interior', 'Зал'],
    ['f-fish-2', 'food', 'Рыба на банкете'], ['show-wedding-dance', 'party', 'Первый танец'], ['f-salad-veg', 'food', 'Овощной салат'],
    ['wed-night', 'party', 'Свадебная зона'], ['drink-aperol', 'food', 'Апероль'], ['banq-5', 'party', 'Банкет'],
    ['f-liver', 'food', 'Печень ягнёнка'], ['wed-boho-2', 'party', 'Свадебный декор'], ['hall-6', 'interior', 'Сервировка зала'],
    ['f-ribs', 'food', 'Рёбрышки на мангале'], ['wed-table-2', 'party', 'Банкетный стол'], ['f-carving', 'food', 'Подача у стола'],
    ['f-fruits', 'food', 'Фруктовая композиция'],
  ];
  const masonry = $('#masonry');
  const more = $('#galleryMore');
  const STEP = 12;
  let filter = 'all';
  let shown = STEP;
  let current = [];

  const renderGallery = () => {
    const items = G.filter((g) => filter === 'all' || g[1] === filter);
    current = items.slice(0, shown);
    masonry.innerHTML = current.map(([f, , alt], i) =>
      `<figure data-i="${i}" style="animation-delay:${(i % STEP) * 50}ms"><img src="assets/img/${f}.webp" alt="${escape(alt)}" loading="lazy"></figure>`).join('');
    more.hidden = shown >= items.length;
  };
  $$('.gallery-filters .chip').forEach((c) => c.addEventListener('click', () => {
    $$('.gallery-filters .chip').forEach((x) => x.classList.toggle('is-active', x === c));
    filter = c.dataset.filter;
    shown = STEP;
    renderGallery();
  }));
  more.addEventListener('click', () => { shown += STEP; renderGallery(); });
  renderGallery();

  /* ---------- lightbox ---------- */
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
  masonry.addEventListener('click', (e) => {
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

  /* ---------- reviews slider ---------- */
  const track = $('#reviewsTrack');
  const step = () => track.firstElementChild.getBoundingClientRect().width + 24;
  $('#revPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#revNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

  /* ---------- booking form ---------- */
  const form = $('#bookingForm');
  const timeSelect = $('#timeSelect');
  for (let h = 11; h <= 23; h++) {
    ['00', '30'].forEach((m) => timeSelect.add(new Option(`${h}:${m}`, `${h}:${m}`, false, h === 19 && m === '00')));
  }
  const dateInput = form.elements.date;
  const today = new Date();
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = iso(today);
  dateInput.value = iso(today);

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
      el.closest('.field').classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    const date = new Date(f.date.value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
    const msg = `Здравствуйте! Хочу забронировать стол в «Белом городе».\n` +
      `Имя: ${f.name.value.trim()}\nТелефон: ${f.phone.value}\nДата: ${date}, ${f.time.value}\n` +
      `Гостей: ${f.guests.value}\nПовод: ${f.occasion.value}` + (f.comment.value.trim() ? `\nПожелания: ${f.comment.value.trim()}` : '');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- active nav link ---------- */
  const navLinks = $$('.nav a[href^="#"]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) spy.observe(s); });
})();

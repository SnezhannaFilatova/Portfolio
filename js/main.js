(function () {
  'use strict';

  /* ===== EXPERIENCE DRAG SLIDER =====
     split = ширина левой (education) панели в процентах (0..100).
     50 = по центру, 100 = education на весь экран, 0 = work на весь экран.
     Единое правило порога (50% пути от центра к краю) работает и при
     развороте из центра, и при возврате из полностью развёрнутого состояния. */
  const experienceSlider = document.querySelector('.experience__slider');
  const experienceHandle = document.querySelector('.experience__toggle');
  const experiencePanels = document.querySelectorAll('.experience__panel');

  if (experienceSlider && experienceHandle && experiencePanels.length === 2) {
    const [leftPanel, rightPanel] = experiencePanels;
    const HANDLE_WIDTH = 80; // должно совпадать с шириной .experience__toggle в CSS
    const VISIBLE_MARGIN = 16; // отступ от края экрана, чтобы ручка не прилипала к границе
    const SNAP_LOW = 25;  // 50 - 50% пути до 0
    const SNAP_HIGH = 75; // 50 + 50% пути до 100
    const REVEAL_THRESHOLD = 65; // с какой ширины панели показываем карточки

    const leftDetails = leftPanel.querySelector('.experience__details');
    const rightDetails = rightPanel.querySelector('.experience__details');

    let split = 50;
    let dragging = false;
    let startX = 0;
    let startSplit = 50;

    function applySplit(value, sliderWidth, applyState = true) {
      leftPanel.style.width = `${value}%`;
      rightPanel.style.width = `${100 - value}%`;

      // центр ручки должен стоять ровно на границе панелей — вычитаем половину
      // её собственной ширины, иначе на месте границы оказывается левый край ручки
      const centerPx = Math.min(
        Math.max((value / 100) * sliderWidth, HANDLE_WIDTH / 2 + VISIBLE_MARGIN),
        sliderWidth - HANDLE_WIDTH / 2 - VISIBLE_MARGIN
      );
      experienceHandle.style.left = `${centerPx - HANDLE_WIDTH / 2}px`;

      if (applyState) {

        const leftIsFull = value === 100;
        const rightIsFull = value === 0;
    
        leftPanel.classList.toggle('is-full', leftIsFull);
        rightPanel.classList.toggle('is-full', rightIsFull);
    
        leftPanel.classList.toggle('is-collapsed', rightIsFull);
        rightPanel.classList.toggle('is-collapsed', leftIsFull);
    
        if (leftDetails)
            leftDetails.classList.toggle('is-expanded', leftIsFull);
    
        if (rightDetails)
            rightDetails.classList.toggle('is-expanded', rightIsFull);
    
    } else {
    
        leftPanel.classList.remove('is-full');
        rightPanel.classList.remove('is-full');
        leftPanel.classList.remove('is-collapsed');
        rightPanel.classList.remove('is-collapsed');
    
        if (leftDetails)
            leftDetails.classList.remove('is-expanded');
    
        if (rightDetails)
            rightDetails.classList.remove('is-expanded');
    
    }
    }

    function render(value) {
      const sliderWidth = experienceSlider.getBoundingClientRect().width;
      applySplit(value, sliderWidth);
    }

    function snapTo(value) {
      split = value;
      experienceSlider.classList.add('is-snapping');
      render(split);
      window.setTimeout(() => {
        experienceSlider.classList.remove('is-snapping');
      }, 500);
    }

    function onPointerDown(e) {
      dragging = true;
      startX = e.clientX;
      startSplit = split;
      experienceSlider.classList.remove('is-snapping');
      experienceHandle.classList.add('is-dragging');
      experienceHandle.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const sliderWidth = experienceSlider.getBoundingClientRect().width;
      const deltaPercent = ((e.clientX - startX) / sliderWidth) * 100;
      split = Math.min(Math.max(startSplit + deltaPercent, 0), 100);
      applySplit(split, sliderWidth, false);
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      experienceHandle.classList.remove('is-dragging');

      if (split >= SNAP_HIGH) {
        snapTo(100);
      } else if (split <= SNAP_LOW) {
        snapTo(0);
      } else {
        snapTo(50);
      }
    }

    experienceHandle.addEventListener('pointerdown', onPointerDown);
    experienceHandle.addEventListener('pointermove', onPointerMove);
    experienceHandle.addEventListener('pointerup', onPointerUp);
    experienceHandle.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('resize', () => render(split));

    // начальная раскладка
    render(split);
  }

  /* ===== HERO NAV LABELS ===== */
  const heroNavLinks = document.querySelectorAll('.hero__nav a');
  heroNavLinks.forEach((link, index) => {
    const targets = ['#about', '#projects', '#experience', '#hero'];
    if (targets[index]) {
      link.setAttribute('href', targets[index]);
      link.textContent = ['Обо мне', 'Проекты', 'Опыт', 'Главная'][index];
    }
  });

  /* ===== HERO SPHERES PARALLAX ===== */
  const spheres = document.querySelectorAll('.hero__sphere');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    spheres.forEach((sphere, index) => {
      const speed = (index + 1) * 0.3;
      sphere.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
    });
  });

  /* ===== SCROLL REVEAL ===== */
  const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.about__card, .projects__card, .experience__panel').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
  });

  /* ===== PROJECTS DATA =====
     Порядок в массиве соответствует data-category на карточках (0..5)
     в index.html. Замените cover/gallery на реальные пути к изображениям. */
  const categories = [
    {
      title: 'Печатная продукция',
      description: 'Полиграфия для бизнеса: сувенирная продукция, деловая документация, рекламные материалы и каталоги.',
      projects: [
        {
          title: 'Кружка',
          description: 'Подарочная кружка с фирменным принтом компании — часть сувенирной линейки для партнёров и клиентов.',
          tools: ['Adobe Photoshop'],
          cover: 'src/img/projects/print/mug.png',
          gallery: ['src/img/projects/print/mug.png']
        },
        {
          title: 'Календарь',
          description: 'Настенный календарь на 12 листов с индивидуальной раскадровкой для каждого месяца, выполнен в фирменной чёрно-жёлтой палитре.',
          tools: ['Adobe Photoshop', 'Adobe InDesign'],
          cover: 'src/img/projects/print/calendar.jpg',
          gallery: ['src/img/projects/print/calendar.jpg']
        },
        {
          title: 'Документация',
          description: 'Комплект деловой документации компании: фирменный бланк, конверт, визитки и папка — в едином брендированном стиле.',
          tools: ['Adobe Photoshop', 'Adobe InDesign'],
          cover: 'src/img/projects/print/documents.png',
          gallery: ['src/img/projects/print/documents.png']
        },
        {
          title: 'Открытки',
          description: 'Серия рекламных открыток с фотографиями и характеристиками промышленных насосов — для презентаций и рассылки клиентам.',
          tools: ['Adobe Photoshop', 'Adobe InDesign'],
          cover: 'src/img/projects/print/postcards.png',
          gallery: ['src/img/projects/print/postcards.png']
        },
        {
          title: 'Каталог',
          description: 'Каталог промышленных насосов Goliath: обложка, развороты с техническими характеристиками и схемами конструкции.',
          tools: ['Adobe Photoshop', 'Adobe InDesign'],
          cover: 'src/img/projects/print/catalog.png',
          gallery: ['src/img/projects/print/catalog.png']
        }
      ]
    },
    {
      title: 'Логотипы',
      description: 'Разработка логотипов и фирменного стиля: от эскиза до готового брендбука.',
      projects: [
        {
          title: 'Логотип бренда спортивной одежды',
          description: 'Разработка знака и брендбука для бренда спортивной одежды PHEEY: цветовые версии логотипа, правила использования и типографика.',
          tools: ['Illustrator', 'Брендбук'],
          cover: 'src/img/projects/logos/pheey-brandbook.png',
          gallery: ['src/img/projects/logos/pheey-brandbook.png']
        },
        {
          title: 'Логотип поставщика насосного оборудования',
          description: 'Разработка фирменного стиля для компании GTH: логотип, цветовая палитра и типографика в индустриальной эстетике.',
          tools: ['Illustrator', 'Фирменный стиль'],
          cover: 'src/img/projects/logos/gth-palette.png',
          gallery: [
            'src/img/projects/logos/gth-palette.png',
            'src/img/projects/logos/gth-typography.png'
          ]
        }
      ]
    },
    {
      title: 'Презентации',
      description: 'Слайд-дизайн для питчей, коммерческих предложений и корпоративных презентаций.',
      projects: [
        {
          title: 'Приветственная презентация ГК ММК',
          description: 'Презентация о группе компаний ММК для новых сотрудников и партнёров: ключевые показатели, продукция и инвестиционная привлекательность компании.',
          tools: ['Figma', 'PowerPoint'],
          cover: 'src/img/projects/presentations/mmk-presentation.png',
          gallery: ['src/img/projects/presentations/mmk-presentation.png']
        },
        {
          title: 'Презентация для Министерства ЖКХ Московской области',
          description: 'Инфографическая презентация региональной программы капитального ремонта многоквартирных домов: этапы, состав работ и бюджет программы.',
          tools: ['Figma', 'PowerPoint'],
          cover: 'src/img/projects/presentations/zhkh-presentation.png',
          gallery: ['src/img/projects/presentations/zhkh-presentation.png']
        }
      ]
    },
    {
      title: 'Соцсети',
      description: 'Контент и оформление для социальных сетей.',
      projects: [
        {
          title: 'Серия постов в соцсетях',
          description: 'Пример оформления серии постов в социальных сетях в едином стиле.',
          tools: ['Photoshop', 'Figma'],
          cover: 'src/img/projects/social/post-1.png',
          gallery: [
            'src/img/projects/social/post-1.png',
            'src/img/projects/social/post-2.png'
          ]
        }
      ]
    },
    {
      title: 'Сайты',
      description: 'UX/UI дизайн и вёрстка сайтов и посадочных страниц.',
      projects: [
        {
          title: 'Лендинг поставщика насосного оборудования',
          description: 'Рекламный лендинг для компании-поставщика насосного оборудования.',
          tools: ['Figma', 'HTML', 'CSS'],
          cover: 'src/img/projects/web/pump-landing.png',
          gallery: ['src/img/projects/web/pump-landing.png']
        },
        {
          title: 'Лендинг digital-компании',
          description: 'Лендинг с акцентом на чистоту интерфейса, визуальную иерархию и конверсию.',
          tools: ['Figma', 'UX/UI'],
          cover: 'src/img/projects/web/digital-landing.png',
          gallery: ['src/img/projects/web/digital-landing.png']
        },
        {
          title: 'Редизайн лендинга',
          description: 'Редизайн существующего лендинга.',
          tools: ['Figma'],
          cover: 'src/img/projects/web/landing-redesign.png',
          gallery: ['src/img/projects/web/landing-redesign.png']
        }
      ]
    },
    {
      title: 'Упаковка',
      description: 'Дизайн упаковки и этикеток для продукции.',
      projects: [
        {
          title: 'Этикетки для косметики',
          description: 'Разработка этикеток для косметической продукции.',
          tools: ['Illustrator', 'Photoshop'],
          cover: 'src/img/projects/package/cosmetics-labels.png',
          gallery: ['src/img/projects/package/cosmetics-labels.png']
        }
      ]
    }
  ];

  /* ===== PROJECTS MODAL ===== */
  const modal = document.getElementById('projectsModal');
  const categoryTitle = document.getElementById('categoryTitle');
  const categoryDescription = document.getElementById('categoryDescription');
  const categoryCount = document.getElementById('categoryCount');
  const categoryCases = document.getElementById('categoryCases');
  const cards = document.querySelectorAll('.project-card');
  const closeBtn = document.querySelector('.projects-modal__close');
  const backdrop = document.querySelector('.projects-modal__backdrop');

  function renderCategory(index) {
    const category = categories[index];
    if (!category) return;

    categoryTitle.textContent = category.title;
    categoryDescription.textContent = category.description;
    categoryCount.textContent = `${category.projects.length} ${pluralizeWorks(category.projects.length)}`;
    categoryCases.innerHTML = '';

    category.projects.forEach((project, i) => {
      const caseEl = document.createElement('article');
      caseEl.className = 'project-case';

      const gallery = project.gallery && project.gallery.length ? project.gallery : [project.cover];
      const galleryHtml = gallery
        .map((src) => `<img src="${src}" alt="${project.title}">`)
        .join('');

      const counterHtml = category.projects.length > 1
        ? `<span class="project-case__counter">Работа ${i + 1} из ${category.projects.length}</span>`
        : '';

      caseEl.innerHTML = `
        <div class="project-case__info">
          ${counterHtml}
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-case__tools">
            ${project.tools.map((tool) => `<span>${tool}</span>`).join('')}
          </div>
        </div>
        <div class="project-case__gallery">${galleryHtml}</div>
      `;
      categoryCases.appendChild(caseEl);
      caseEl.querySelectorAll('img').forEach((img) => {
        img.addEventListener('load', updateScrollHint);
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
      });
    });

    updateScrollHint();
  }

  /* ===== IMAGE LIGHTBOX ===== */
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('imageLightboxImg');
  const lightboxClose = document.querySelector('.image-lightbox__close');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
  }

  if (lightbox) lightbox.addEventListener('click', closeLightbox);
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  function pluralizeWorks(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'работа';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'работы';
    return 'работ';
  }

  const modalContent = document.querySelector('.projects-modal__content');
  const scrollHint = document.querySelector('.projects-modal__scroll-hint');

  function updateScrollHint() {
    if (!modalContent || !scrollHint) return;
    // wait a frame so layout (images) has settled before measuring
    requestAnimationFrame(() => {
      const canScroll = modalContent.scrollHeight - modalContent.clientHeight > 40;
      const atBottom = modalContent.scrollTop + modalContent.clientHeight >= modalContent.scrollHeight - 40;
      scrollHint.classList.toggle('is-visible', canScroll && !atBottom);
    });
  }

  if (modalContent) {
    modalContent.addEventListener('scroll', updateScrollHint);
  }
  window.addEventListener('resize', updateScrollHint);

  function openModal(index) {
    renderCategory(index);
    if (modalContent) modalContent.scrollTop = 0;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const index = Number(card.dataset.category);
      openModal(index);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();

/* ===============================
   Theme toggle (dark / light)
   =============================== */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');

  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');

  root.setAttribute('data-theme', initial);

  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
})();

/* ===============================
   Footer year
   =============================== */
(function () {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===============================
   Image Carousel
   Usage: <div class="carousel"
                data-images='["images/a.png","images/b.png"]'
                data-alts='["Alt A","Alt B"]'></div>
   =============================== */
(function initCarousel() {
  const AUTOPLAY_MS = 0; // e.g. 4000 开启 4 秒自动播放；0 表示关闭

  function build(root, sources, alts) {
    if (!sources || !sources.length) return;

    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Project screenshots');

    // slides
    const slides = sources.map((src, i) => {
      const img = new Image();
      img.className = 'slide' + (i === 0 ? ' active' : '');
      img.src = src;
      img.alt = (alts && alts[i]) || `Slide ${i + 1}`;
      img.loading = 'lazy';
      root.appendChild(img);
      return img;
    });

    // controls
    const prev = document.createElement('button');
    prev.className = 'nav prev';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.textContent = '‹';

    const next = document.createElement('button');
    next.className = 'nav next';
    next.setAttribute('aria-label', 'Next slide');
    next.textContent = '›';

    root.append(prev, next);

    // dots
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';
    const dots = sources.map((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.dataset.i = i;
      dotsWrap.appendChild(b);
      return b;
    });
    root.appendChild(dotsWrap);

    // state + helpers
    let i = 0;
    let timer = null;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('active', k === i));
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
    };

    // events
    prev.addEventListener('click', () => show(i - 1));
    next.addEventListener('click', () => show(i + 1));
    dots.forEach((d, idx) => d.addEventListener('click', () => show(idx)));

    // keyboard (仅当鼠标在轮播上时响应)
    document.addEventListener('keydown', (e) => {
      if (!root.matches(':hover')) return;
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });

    // touch swipe
    let startX = null;
    root.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    root.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    // autoplay (可选)
    if (AUTOPLAY_MS > 0) {
      const start = () => (timer = setInterval(() => show(i + 1), AUTOPLAY_MS));
      const stop = () => timer && clearInterval(timer);
      start();
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('touchstart', stop, { passive: true });
      root.addEventListener('touchend', start, { passive: true });
    }
  }

  // init all carousels on the page
  document.querySelectorAll('.carousel').forEach((el) => {
    try {
      const imgs = JSON.parse(el.getAttribute('data-images') || '[]');
      const alts = JSON.parse(el.getAttribute('data-alts') || '[]');
      if (imgs.length) build(el, imgs, alts);
    } catch (err) {
      console.error('Carousel init failed:', err);
    }
  });
})();
/* ===============================
   Tag icons via Simple Icons CDN
   =============================== */
(function addTagIcons() {
  // 关键词到 Simple Icons 的 slug 与品牌色（hex）的映射
  const MAP = {
    'javascript':      ['javascript','F7DF1E'],
    'typescript':      ['typescript','3178C6'],
    'python':          ['python','3776AB'],
    'react':           ['react','61DAFB'],
    'next.js':         ['nextdotjs','000000'],
    'node':            ['nodedotjs','339933'],
    'express':         ['express','000000'],
    'django':          ['django','092E20'],
    'mongodb':         ['mongodb','47A248'],
    'postgres':        ['postgresql','4169E1'],
    'sql':             ['postgresql','4169E1'], // 泛指时用 PG 图标
    'pandas':          ['pandas','150458'],
    'databricks':      ['databricks','FF3621'],
    'openai':          ['openai','000000'],
    'beautifulsoup':   null,                     // 没有官方品牌，跳过
    'yelp api':        ['yelp','FF1A1A'],
    'heroku':          ['heroku','430098'],
    'aws s3':          ['amazons3','FF9900'],
    's3':              ['amazons3','FF9900'],
    'vercel':          ['vercel','000000'],
    'netlify':         ['netlify','00C7B7'],
    'github':          ['github','181717'],
    'docker':          ['docker','2496ED'],
    'figma':           ['figma','F24E1E'],
    'neon':            ['neon','00E599'],        // Neon serverless Postgres
  };

  // 归一化函数：统一小写、去多余空格和斜杠
  const norm = (s) => s.toLowerCase().replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ').trim();

  document.querySelectorAll('.tags .tag').forEach(tag => {
    const label = norm(tag.textContent || '');
    // 直接命中；或用一些常见别名再匹配一次
    let hit = MAP[label];
    if (!hit) {
      // 别名与模糊匹配
      const aliases = {
        'js':'javascript',
        'ts':'typescript',
        'node.js':'node',
        'mongodb atlas':'mongodb',
        'postgresql':'postgres',
        'github pages':'github',
        'oauth':'auth0',   // 如果你真有 Auth0 标签可加映射
      };
      const ali = aliases[label];
      if (ali && MAP[ali]) hit = MAP[ali];
    }
    if (!hit) return; // 没映射就跳过

    const [slug, color] = hit;
    const img = new Image();
    img.className = 'ico';
    img.alt = '';
    img.setAttribute('aria-hidden','true');
    img.src = color
      ? `https://cdn.simpleicons.org/${slug}/${color}`
      : `https://cdn.simpleicons.org/${slug}`;
    tag.classList.add('has-icon');
    tag.prepend(img);
  });
})();

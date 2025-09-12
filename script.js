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



// // 年份
// document.getElementById('year').textContent = new Date().getFullYear();

// // 主题切换
// const toggle = document.getElementById('theme-toggle');
// const root = document.documentElement;
// if (localStorage.theme === 'light') document.body.classList.add('light');
// toggle.addEventListener('click', () => {
//   document.body.classList.toggle('light');
//   localStorage.theme = document.body.classList.contains('light') ? 'light' : 'dark';
// });

// // 轮播初始化
// function buildCarousel(rootEl, images, alts) {
//   if (!images?.length) { rootEl.textContent = '[ Project Screenshot Placeholder ]'; return; }
//   const slides = images.map((src, i) => {
//     const img = new Image(); img.src = src; img.alt = alts?.[i] || `Slide ${i+1}`;
//     img.loading = 'lazy'; img.className = i===0 ? 'active' : ''; rootEl.appendChild(img); return img;
//   });
//   const prev = document.createElement('button'); prev.className='nav prev'; prev.textContent='‹';
//   const next = document.createElement('button'); next.className='nav next'; next.textContent='›';
//   rootEl.append(prev, next);
//   const dotsWrap = document.createElement('div'); dotsWrap.className='dots';
//   const dots = images.map((_, i)=>{const b=document.createElement('button'); b.className='dot'+(i===0?' active':''); b.dataset.i=i; dotsWrap.appendChild(b); return b;});
//   rootEl.appendChild(dotsWrap);
//   let idx = 0;
//   const show = n => { idx=(n+slides.length)%slides.length;
//     slides.forEach((s,i)=>s.classList.toggle('active', i===idx));
//     dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
//   };
//   prev.onclick = ()=>show(idx-1);
//   next.onclick = ()=>show(idx+1);
//   dots.forEach((d,i)=>d.onclick=()=>show(i));
//   // swipe
//   let x0=null; rootEl.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
//   rootEl.addEventListener('touchend',e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) show(idx+(dx<0?1:-1)); x0=null; },{passive:true});
// }
// document.querySelectorAll('.carousel').forEach(c=>{
//   const imgs = JSON.parse(c.getAttribute('data-images')||'[]');
//   const alts = JSON.parse(c.getAttribute('data-alts')||'[]');
//   buildCarousel(c, imgs, alts);
// });


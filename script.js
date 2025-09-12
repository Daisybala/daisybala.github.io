// 年份
document.getElementById('year').textContent = new Date().getFullYear();

// 主题切换
const toggle = document.getElementById('theme-toggle');
const root = document.documentElement;
if (localStorage.theme === 'light') document.body.classList.add('light');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.theme = document.body.classList.contains('light') ? 'light' : 'dark';
});

// 轮播初始化
function buildCarousel(rootEl, images, alts) {
  if (!images?.length) { rootEl.textContent = '[ Project Screenshot Placeholder ]'; return; }
  const slides = images.map((src, i) => {
    const img = new Image(); img.src = src; img.alt = alts?.[i] || `Slide ${i+1}`;
    img.loading = 'lazy'; img.className = i===0 ? 'active' : ''; rootEl.appendChild(img); return img;
  });
  const prev = document.createElement('button'); prev.className='nav prev'; prev.textContent='‹';
  const next = document.createElement('button'); next.className='nav next'; next.textContent='›';
  rootEl.append(prev, next);
  const dotsWrap = document.createElement('div'); dotsWrap.className='dots';
  const dots = images.map((_, i)=>{const b=document.createElement('button'); b.className='dot'+(i===0?' active':''); b.dataset.i=i; dotsWrap.appendChild(b); return b;});
  rootEl.appendChild(dotsWrap);
  let idx = 0;
  const show = n => { idx=(n+slides.length)%slides.length;
    slides.forEach((s,i)=>s.classList.toggle('active', i===idx));
    dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
  };
  prev.onclick = ()=>show(idx-1);
  next.onclick = ()=>show(idx+1);
  dots.forEach((d,i)=>d.onclick=()=>show(i));
  // swipe
  let x0=null; rootEl.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
  rootEl.addEventListener('touchend',e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) show(idx+(dx<0?1:-1)); x0=null; },{passive:true});
}
document.querySelectorAll('.carousel').forEach(c=>{
  const imgs = JSON.parse(c.getAttribute('data-images')||'[]');
  const alts = JSON.parse(c.getAttribute('data-alts')||'[]');
  buildCarousel(c, imgs, alts);
});


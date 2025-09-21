// script.js — 完整交互（mega menu / 轮播 / Tab <-> Sidebar 联动 / 回到顶部 / 动画）
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 轮播（如果页面有） ---------- */
    const slides = document.querySelectorAll('.carousel .slide');
    const dotsContainer = document.querySelector('.caro-dots');
    const leftBtn = document.querySelector('.caro-arrow.left');
    const rightBtn = document.querySelector('.caro-arrow.right');
    let idx = 0, interval, delay = 4000;
    if (slides.length) {
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.dataset.index = i;
        if (i === 0) btn.classList.add('active');
        dotsContainer.appendChild(btn);
      });
      const dots = dotsContainer.querySelectorAll('button');
      const show = (i) => {
        slides.forEach((s,k)=>{ s.classList.toggle('active', k===i); s.setAttribute('aria-hidden', k===i ? 'false' : 'true'); });
        dots.forEach((d,k)=> d.classList.toggle('active', k===i));
        idx = i;
      };
      const next = ()=> show((idx+1)%slides.length);
      const prev = ()=> show((idx-1+slides.length)%slides.length);
      const start = ()=> { interval = setInterval(next, delay); };
      const stop = ()=> { clearInterval(interval); };
      rightBtn?.addEventListener('click', ()=>{ next(); stop(); start(); });
      leftBtn?.addEventListener('click', ()=>{ prev(); stop(); start(); });
      dots.forEach(d => d.addEventListener('click', ()=> { show(+d.dataset.index); stop(); start(); }));
      const viewport = document.querySelector('.caro-viewport');
      viewport?.addEventListener('mouseenter', stop);
      viewport?.addEventListener('mouseleave', start);
      show(0); start();
    }
  
    /* ---------- mega menu 行为（案例 & 产品） ---------- */
    const header = document.getElementById('siteHeader');
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dd => {
      const menu = dd.dataset.menu;
      dd.addEventListener('mouseenter', () => {
        if (window.innerWidth > 900) {
          header.classList.add('expanded');
          header.setAttribute('data-active', menu);
        }
      });
    });
    header?.addEventListener('mouseleave', () => {
      if (window.innerWidth > 900) {
        header.classList.remove('expanded');
        header.removeAttribute('data-active');
      }
    });
    // mobile: 点击切换
    document.querySelectorAll('.dropdown .dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          const parent = toggle.closest('.dropdown');
          const menu = parent?.dataset.menu || '';
          const isOpen = header.classList.toggle('expanded');
          if (isOpen) header.setAttribute('data-active', menu);
          else header.removeAttribute('data-active');
        }
      });
    });
  
    /* ---------- 回到顶部 ---------- */
    const backBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) backBtn?.classList.add('show'); else backBtn?.classList.remove('show');
    });
    backBtn?.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));
  
    /* ---------- 表单提交 ---------- */
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        alert('已提交，感谢您的留言！我们会尽快与您联系。');
        form.reset();
      });
    }
  
    /* ---------- 滚动进入动画 ---------- */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.case-card, .product-card, .section-title, .stat-card')
      .forEach(el => observer.observe(el));
  
    /* ---------- 移动端主菜单 ---------- */
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.main-nav');
    mobileBtn?.addEventListener('click', () => {
      nav.classList.toggle('open');
      mobileBtn.classList.toggle('open');
      if (!nav.classList.contains('open')) header.classList.remove('expanded');
    });
  
    /* ---------- Sidebar 树形 + Tab 联动 ---------- */
    const sidebarToggles = document.querySelectorAll('.sidebar-toggle');
    sidebarToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // 切换子列表显示
        const li = btn.parentElement;
        li.classList.toggle('open');
  
        // 如果该按钮携带 data-tab，切换 Tab
        const tabName = btn.dataset.tab;
        if (tabName) activateTab(tabName);
      });
    });
  
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
  
    function activateTab(tabName) {
      if (!tabName) return;
      tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
      tabPanels.forEach(p => p.classList.toggle('active', p.id === tabName));
  
      // 同步展开 Sidebar 对应分组
      document.querySelectorAll('.sidebar-tree > li').forEach(li => li.classList.remove('open'));
      // 展开包含对应 data-tab 的 parent li
      document.querySelectorAll(`.sidebar-toggle[data-tab="${tabName}"]`).forEach(t => {
        const li = t.parentElement;
        if (li) li.classList.add('open');
      });
    }
  
    // Tab 按钮点击也触发 Sidebar 同步
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        activateTab(tabName);
        // 滚动到顶部正文位置（让用户看到卡片）
        const y = (document.querySelector('.cases-content')?.getBoundingClientRect().top || 200) + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  
    // 三级目录点击：切 Tab + 平滑滚动到卡片
    document.querySelectorAll('.sub-list a').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        const tabName = link.dataset.tab || link.closest('.cases-sidebar')?.querySelector('.sidebar-toggle')?.dataset.tab;
        if (tabName) activateTab(tabName);
  
        if (href.startsWith('#')) {
          e.preventDefault();
          const id = href.slice(1);
          // 等待 tab 面板显示后再滚动
          setTimeout(() => {
            const target = document.getElementById(id);
            if (target) {
              // 计算一个合适的偏移（避开固定导航）
              const rect = target.getBoundingClientRect();
              const offsetTop = rect.top + window.scrollY - (window.innerWidth > 900 ? 100 : 80);
              window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              // 用视觉 focus（可选）
              target.setAttribute('tabindex', '-1');
              target.focus({ preventScroll: true });
              setTimeout(()=> target.removeAttribute('tabindex'), 1500);
            }
          }, 220);
        }
      });
    });
  
  });
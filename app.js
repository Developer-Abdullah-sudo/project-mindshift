/* ============================================================
   PROJECT MINDSHIFT – MAIN JAVASCRIPT
   ============================================================ */

'use strict';

/* ============================================================
   1. PARTICLE SYSTEM
   ============================================================ */
(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H, animId;

  const CONFIG = {
    count:     80,
    minR:      1,
    maxR:      2.5,
    speed:     0.4,
    lineRange: 130,
    colors:    ['rgba(26,108,246,', 'rgba(6,200,200,', 'rgba(139,92,246,']
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomParticle() {
    const c = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  CONFIG.minR + Math.random() * (CONFIG.maxR - CONFIG.minR),
      vx: (Math.random() - 0.5) * CONFIG.speed,
      vy: (Math.random() - 0.5) * CONFIG.speed,
      alpha: 0.2 + Math.random() * 0.5,
      color: c
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) particles.push(randomParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.lineRange) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(26,108,246,${0.06 * (1 - dist / CONFIG.lineRange)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });
  }

  function update() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); init(); });
  resize();
  init();
  loop();
})();


/* ============================================================
   2. NAVBAR – SCROLL EFFECT + MOBILE TOGGLE
   ============================================================ */
(function() {
  const nav    = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  if (!nav) return;

  // Scroll shrink
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });
  }

  // Back to top
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   3. SCROLL REVEAL
   ============================================================ */
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ============================================================
   4. COUNTER ANIMATION (stats)
   ============================================================ */
(function() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1800;
      const start  = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();


/* ============================================================
   5. ANIMATED PROGRESS BARS (research findings)
   ============================================================ */
(function() {
  const bars = document.querySelectorAll('.bar-fill[data-width]');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const bar   = e.target;
      const width = bar.dataset.width + '%';
      requestAnimationFrame(() => { bar.style.width = width; });
      io.unobserve(bar);
    });
  }, { threshold: 0.4 });

  bars.forEach(b => io.observe(b));
})();


/* ============================================================
   6. TABS (Our Actions)
   ============================================================ */
(function() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById('panel-' + target)?.classList.add('active');
    });
  });
})();


/* ============================================================
   7. GALLERY FILTER
   ============================================================ */
(function() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach(item => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });
})();


/* ============================================================
   8. CANVAS CHART (Survey Overview)
   ============================================================ */
(function() {
  const canvasEl = document.getElementById('surveyChart');
  if (!canvasEl) return;

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      drawChart(canvasEl);
      io.unobserve(canvasEl);
    }
  }, { threshold: 0.3 });
  io.observe(canvasEl);

  function drawChart(c) {
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W   = c.parentElement.clientWidth - 2; // account for border
    const H   = 300;
    c.width   = W * dpr;
    c.height  = H * dpr;
    c.style.width  = W + 'px';
    c.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const data = [
      { label: 'Poor Quality Materials', value: 80,  color: '#1a6cf6' },
      { label: 'Lacking Core Textbooks', value: 65,  color: '#06c8c8' },
      { label: 'Poor Study Environment', value: 71,  color: '#8b5cf6' },
      { label: 'Overcrowded Classrooms', value: 58,  color: '#f59e0b' },
      { label: 'Cannot Afford Books',    value: 83,  color: '#ef4444' },
      { label: 'Dropout Risk',           value: 42,  color: '#10b981' },
    ];

    const pad    = { top: 20, right: 20, bottom: 60, left: 50 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top  - pad.bottom;
    const barW   = Math.min(60, (chartW / data.length) * 0.55);
    const gap    = (chartW - barW * data.length) / (data.length + 1);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (chartH / 4) * i;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth   = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle   = 'rgba(148,163,184,0.6)';
      ctx.font        = '11px Inter, sans-serif';
      ctx.textAlign   = 'right';
      ctx.fillText(i * 25 + '%', pad.left - 8, y + 4);
    }

    // Animate bars
    let progress = 0;
    const dur    = 1200;
    const start  = performance.now();

    function animate(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      ctx.clearRect(pad.left, pad.top, chartW, chartH + 40);

      // Re-draw grid
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + chartH - (chartH / 4) * i;
        ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
        ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
        ctx.fillStyle = 'rgba(148,163,184,0.6)'; ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(i * 25 + '%', pad.left - 8, y + 4);
      }

      data.forEach((d, i) => {
        const x    = pad.left + gap + i * (barW + gap);
        const h    = (d.value / 100) * chartH * ease;
        const y    = pad.top + chartH - h;

        // Gradient bar
        const grd = ctx.createLinearGradient(x, pad.top, x, pad.top + chartH);
        grd.addColorStop(0, d.color);
        grd.addColorStop(1, d.color + '55');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, [4, 4, 0, 0]);
        ctx.fill();

        // Value label
        if (ease > 0.8) {
          ctx.fillStyle   = '#e2e8f0';
          ctx.font        = 'bold 12px Outfit, sans-serif';
          ctx.textAlign   = 'center';
          ctx.fillText(d.value + '%', x + barW / 2, y - 6);
        }

        // X label
        ctx.fillStyle = 'rgba(148,163,184,0.8)';
        ctx.font      = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const maxW    = barW + gap - 4;
        const words   = d.label.split(' ');
        let  line     = '';
        let  lineY    = pad.top + chartH + 14;
        words.forEach(word => {
          const test = line ? line + ' ' + word : word;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x + barW / 2, lineY);
            line  = word;
            lineY += 13;
          } else {
            line = test;
          }
        });
        ctx.fillText(line, x + barW / 2, lineY);
      });

      if (t < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
})();


/* ============================================================
   9. CONTACT FORM (mock submit)
   ============================================================ */
(function() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled    = false;
      success.style.display = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }, 1200);
  });
})();


/* ============================================================
   10. ACTIVE NAV HIGHLIGHT on scroll
   ============================================================ */
(function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + e.target.id) {
            a.style.color = 'var(--teal)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();


/* ============================================================
   11. SMOOTH STAGGER for cards
   ============================================================ */
(function() {
  document.querySelectorAll('.findings-grid, .about-cards, .solutions-grid, .blog-grid, .docs-grid, .team-grid').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = (i * 0.1) + 's';
    });
  });
})();

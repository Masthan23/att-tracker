/**
 * Dashverse ambient background — constellation + subtle brand wash (1.jpg).
 * pointer-events: none via CSS. Respects prefers-reduced-motion.
 */
(function () {
  var canvas = document.getElementById('dvCanvas');
  if (!canvas || !canvas.getContext) return;

  var palette = canvas.getAttribute('data-palette') || 'studio';

  var ctx = canvas.getContext('2d');
  var pts = [];
  var raf = 0;
  var w = 0;
  var h = 0;
  var img = new Image();
  img.decoding = 'async';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function theme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function colors() {
    if (palette === 'emerald') {
      if (theme() === 'light') {
        return {
          nodeA: 'rgba(52, 211, 153, 0.75)',
          nodeB: 'rgba(20, 184, 166, 0.55)',
          wash: 'rgba(236, 253, 245, 0.05)'
        };
      }
      return {
        nodeA: 'rgba(52, 211, 153, 0.85)',
        nodeB: 'rgba(45, 212, 191, 0.65)',
        wash: 'rgba(2, 44, 34, 0.07)'
      };
    }
    if (theme() === 'light') {
      return {
        nodeA: 'rgba(6, 182, 212, 0.75)',
        nodeB: 'rgba(192, 38, 211, 0.55)',
        wash: 'rgba(250, 232, 255, 0.04)'
      };
    }
    return {
      nodeA: 'rgba(34, 211, 238, 0.85)',
      nodeB: 'rgba(192, 38, 211, 0.7)',
      wash: 'rgba(12, 6, 32, 0.06)'
    };
  }

  function countParticles() {
    var area = Math.max(window.innerWidth * window.innerHeight, 1);
    return Math.min(110, Math.max(42, Math.floor(area / 22000)));
  }

  function initPts() {
    var n = countParticles();
    pts = [];
    for (var i = 0; i < n; i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.00035,
        vy: (Math.random() - 0.5) * 0.00035,
        z: Math.random(),
        ph: Math.random() * Math.PI * 2
      });
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var t0 = performance.now();

  function frame(t) {
    var c = colors();
    var dt = reduced ? 0 : Math.min(0.05, (t - t0) / 1000);
    t0 = t;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.wash;
    ctx.fillRect(0, 0, w, h);

    var i, j, dx, dy, d2, maxD2 = 0.045;
    if (!reduced) {
      for (i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx * (60 * dt * 10);
        p.y += p.vy * (60 * dt * 10);
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        p.ph += dt * (0.4 + p.z);
      }
    }
    ctx.lineWidth = 0.6;
    for (i = 0; i < pts.length; i++) {
      for (j = i + 1; j < pts.length; j++) {
        dx = pts[i].x - pts[j].x;
        dy = pts[i].y - pts[j].y;
        d2 = dx * dx + dy * dy;
        if (d2 < maxD2) {
          var a = (1 - d2 / maxD2) * 0.55;
          if (palette === 'emerald') {
            ctx.strokeStyle = theme() === 'light'
              ? 'rgba(16, 185, 129, ' + (a * 0.2) + ')'
              : 'rgba(52, 211, 153, ' + (a * 0.24) + ')';
          } else {
            ctx.strokeStyle = theme() === 'light'
              ? 'rgba(192, 38, 211, ' + (a * 0.18) + ')'
              : 'rgba(232, 121, 249, ' + (a * 0.22) + ')';
          }
          ctx.beginPath();
          ctx.moveTo(pts[i].x * w, pts[i].y * h);
          ctx.lineTo(pts[j].x * w, pts[j].y * h);
          ctx.stroke();
        }
      }
    }

    for (i = 0; i < pts.length; i++) {
      var p2 = pts[i];
      var r = 1.1 + p2.z * 2.2 + 0.35 * Math.sin(p2.ph);
      var g = ctx.createRadialGradient(p2.x * w, p2.y * h, 0, p2.x * w, p2.y * h, r * 3);
      g.addColorStop(0, c.nodeA);
      g.addColorStop(0.45, c.nodeB);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p2.x * w, p2.y * h, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (img.complete && img.naturalWidth) {
      ctx.save();
      ctx.globalAlpha = theme() === 'light' ? 0.045 : 0.07;
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;
      var scale = Math.max(w / iw, h / ih) * 1.15;
      var sw = iw * scale;
      var sh = ih * scale;
      var ox = (w - sw) / 2 + (reduced ? 0 : Math.sin(t * 0.00015) * 18);
      var oy = (h - sh) / 2 + (reduced ? 0 : Math.cos(t * 0.00012) * 14);
      ctx.filter = reduced ? 'blur(64px) saturate(1.1)' : 'blur(48px) saturate(1.2)';
      ctx.drawImage(img, ox, oy, sw, sh);
      ctx.restore();
    }

    if (!reduced) raf = requestAnimationFrame(frame);
  }

  function boot() {
    cancelAnimationFrame(raf);
    resize();
    initPts();
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }

  img.onload = function () { boot(); };
  img.onerror = function () { boot(); };
  img.src = '1.jpg';

  window.addEventListener('resize', boot);

  boot();
})();

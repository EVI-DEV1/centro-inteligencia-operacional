(function () {
  'use strict';
  const T = window.T;
  const cena = (T.cena = T.cena || {});

  cena.particulas = function (canvas, opts = {}) {
    if (T.mov.reduzido) return { destruir() {} };
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let dpr = 1;
    let pts = [];
    const quantidade = opts.quantidade || 90;
    const semear = () => {
      pts = Array.from({ length: quantidade }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        v: 6 + Math.random() * 16,
        r: Math.random() < 0.12 ? 1.4 : 0.8,
        fase: Math.random() * Math.PI * 2,
        cor: i % 7 === 0 ? '145,112,247' : i % 3 === 0 ? '53,208,238' : '125,176,255',
      }));
    };
    const medir = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      semear();
    };
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    medir();
    let parar = null;
    const passo = (t, dt) => {
      ctx.clearRect(0, 0, w, h);
      const k = dt / 1000;
      for (const p of pts) {
        p.y -= p.v * k;
        p.x += Math.sin(t / 2600 + p.fase) * 0.08;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        const brilho = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t / 900 + p.fase));
        const fade = Math.min(1, p.y / (h * 0.35));
        ctx.fillStyle = `rgba(${p.cor},${(brilho * fade).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting && !parar) parar = T.mov.laco(passo);
      else if (!e[0].isIntersecting && parar) {
        parar();
        parar = null;
      }
    });
    io.observe(canvas);
    return {
      destruir() {
        parar && parar();
        io.disconnect();
        ro.disconnect();
      },
    };
  };
})();

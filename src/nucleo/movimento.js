(function () {
  'use strict';
  const T = window.T;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mov = (T.mov = { reduzido: mq.matches });
  mq.addEventListener('change', (e) => {
    mov.reduzido = e.matches;
    T.emit('movimento', e.matches);
  });

  const tarefas = new Set();
  let rodando = false;
  let ultimo = 0;
  function quadro(t) {
    if (!tarefas.size || document.hidden) {
      rodando = false;
      return;
    }
    const dt = Math.min(64, t - (ultimo || t));
    ultimo = t;
    for (const fn of tarefas) {
      try {
        fn(t, dt);
      } catch (e) {
        console.error('[torre] tarefa de animação falhou', e);
        tarefas.delete(fn);
      }
    }
    requestAnimationFrame(quadro);
  }
  mov.laco = (fn) => {
    tarefas.add(fn);
    if (!rodando && !document.hidden) {
      rodando = true;
      ultimo = 0;
      requestAnimationFrame(quadro);
    }
    return () => tarefas.delete(fn);
  };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && tarefas.size && !rodando) {
      rodando = true;
      ultimo = 0;
      requestAnimationFrame(quadro);
    }
  });

  mov.numero = function (valor, formatar, opts = {}) {
    const texto = formatar(valor);
    const el = T.h('span', { class: ['rolo', opts.classe], 'aria-label': texto });
    const chars = [...texto];
    chars.forEach((ch, i) => {
      if (/\d/.test(ch)) {
        const col = T.h('span', { class: 'rolo-col', 'aria-hidden': 'true' });
        const fita = T.h('span', { class: 'rolo-fita' });
        for (let d = 0; d <= 9; d++) fita.appendChild(T.h('span', null, String(d)));
        col.appendChild(fita);
        col.dataset.alvo = ch;
        col.style.setProperty('--i', String(chars.length - i));
        el.appendChild(col);
      } else el.appendChild(T.h('span', { class: 'rolo-sep', 'aria-hidden': 'true' }, ch));
    });
    const acionar = () => {
      T.$$('.rolo-col', el).forEach((c) => c.style.setProperty('--d', c.dataset.alvo));
      el.classList.add('rolou');
    };
    if (mov.reduzido || opts.imediato) acionar();
    else el._acionar = acionar;
    return el;
  };
  mov.acionarRolos = (raiz) => T.$$('.rolo', raiz).forEach((r) => r._acionar && (r._acionar(), (r._acionar = null)));

  let io = null;
  mov.revelar = function (raiz) {
    if (mov.reduzido || !('IntersectionObserver' in window)) {
      T.$$('[data-revela]', raiz).forEach((el) => el.classList.add('revelado'));
      mov.acionarRolos(raiz);
      return;
    }
    io =
      io ||
      new IntersectionObserver(
        (entradas) => {
          for (const e of entradas) {
            if (!e.isIntersecting) continue;
            e.target.classList.add('revelado');
            mov.acionarRolos(e.target);
            T.emit('revelado', e.target);
            io.unobserve(e.target);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      );
    T.$$('[data-revela]', raiz).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) {
        el.classList.add('revelado');
        requestAnimationFrame(() => mov.acionarRolos(el));
      } else {
        el.classList.add('pre-revela');
        io.observe(el);
      }
    });
  };

  mov.saida = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  mov.animar = function (dur, passo, fim) {
    if (mov.reduzido) {
      passo(1);
      fim && fim();
      return () => {};
    }
    const t0 = performance.now();
    const parar = mov.laco((t) => {
      const k = T.clamp((t - t0) / dur, 0, 1);
      passo(mov.saida(k), k);
      if (k >= 1) {
        parar();
        fim && fim();
      }
    });
    return parar;
  };
})();

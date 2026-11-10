(function () {
  'use strict';
  const T = window.T;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mov = (T.mov = { reduzido: mq.matches });
  mq.addEventListener('change', (e) => {
    mov.reduzido = e.matches;
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
        console.error('[ops] tarefa de animação falhou', e);
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

  let io = null;
  mov.revelar = function (raiz) {
    if (mov.reduzido || !('IntersectionObserver' in window)) {
      T.$$('[data-revela]', raiz).forEach((el) => el.classList.add('revelado'));
      return;
    }
    io =
      io ||
      new IntersectionObserver(
        (entradas) => {
          for (const e of entradas) {
            if (!e.isIntersecting) continue;
            e.target.classList.add('revelado');
            io.unobserve(e.target);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
      );
    T.$$('[data-revela]', raiz).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) {
        el.classList.add('revelado');
      } else {
        el.classList.add('pre-revela');
        io.observe(el);
      }
    });
  };

})();

(function () {
  'use strict';
  const T = window.T;

  const dica = T.h('div', { class: 'dica', role: 'tooltip', 'aria-hidden': 'true' });
  let dono = null;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(dica));

  function posicionar(x, y) {
    const r = dica.getBoundingClientRect();
    const m = 14;
    let px = x + m;
    let py = y + m;
    if (px + r.width > window.innerWidth - 8) px = x - r.width - m;
    if (py + r.height > window.innerHeight - 8) py = y - r.height - m;
    dica.style.transform = `translate(${Math.max(8, px)}px, ${Math.max(8, py)}px)`;
  }

  T.dica = {
    mostrar(conteudo, x, y, alvo) {
      dono = alvo || null;
      T.limpar(dica);
      if (typeof conteudo === 'string') dica.textContent = conteudo;
      else dica.appendChild(conteudo);
      dica.classList.add('visivel');
      dica.setAttribute('aria-hidden', 'false');
      posicionar(x, y);
    },
    mover(x, y) {
      if (dica.classList.contains('visivel')) posicionar(x, y);
    },
    esconder(alvo) {
      if (alvo && dono && alvo !== dono) return;
      dica.classList.remove('visivel');
      dica.setAttribute('aria-hidden', 'true');
      dono = null;
    },
    bloco(linhas, titulo) {
      return T.h(
        'div',
        { class: 'dica-bloco' },
        titulo ? T.h('div', { class: 'dica-titulo' }, titulo) : null,
        linhas.map((l) =>
          T.h(
            'div',
            { class: 'dica-linha' },
            l.cor ? T.h('i', { class: 'dica-chave', style: { '--c': l.cor }, 'data-forma': l.forma || 'linha' }) : null,
            T.h('b', null, l.valor),
            T.h('span', null, l.rotulo)
          )
        )
      );
    },
    ligar(el, conteudoFn) {
      el.addEventListener('pointerenter', (e) => T.dica.mostrar(conteudoFn(), e.clientX, e.clientY, el));
      el.addEventListener('pointermove', (e) => T.dica.mover(e.clientX, e.clientY));
      el.addEventListener('pointerleave', () => T.dica.esconder(el));
      el.addEventListener('focus', () => {
        const r = el.getBoundingClientRect();
        T.dica.mostrar(conteudoFn(), r.left + r.width / 2, r.top, el);
      });
      el.addEventListener('blur', () => T.dica.esconder(el));
    },
  };

  document.addEventListener(
    'pointerover',
    (e) => {
      if (dono && !dono.contains(e.target) && e.target !== dono) T.dica.esconder();
    },
    true
  );
  window.addEventListener('scroll', () => T.dica.esconder(), { passive: true });
})();

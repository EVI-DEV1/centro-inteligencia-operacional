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

  const painel = T.h('aside', { class: 'explicador', 'aria-hidden': 'true', 'aria-labelledby': 'explicador-titulo', tabindex: '-1' });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(painel));
  let retorno = null;

  T.explicar = function (chave) {
    const item = (T.explicacoes || {})[chave];
    if (!item) return;
    retorno = document.activeElement;
    T.limpar(painel);
    const proveniencia = T.vivo && !item.naoMedido ? T.vivo.linhaProveniencia(item.chave) : null;
    const marcador = T.vivo && item.chave ? T.vivo.marcador(item.chave) : null;
    const partes = [
      T.h(
        'div',
        { class: 'explicador-topo' },
        T.h('span', { class: 'leitura' }, item.onde || 'Métrica'),
        T.h('button', { class: 'botao-icone', 'aria-label': 'Fechar explicação', onclick: T.fecharExplicador }, T.icone('fechar'))
      ),
      T.h('h2', { id: 'explicador-titulo', class: 'explicador-titulo' }, item.titulo),
      item.valor ? T.h('div', { class: 'explicador-valor num' }, item.valor, marcador) : null,
      proveniencia,
      secao('O que é', item.oque),
      secao('Por que importa', item.porque),
      secao(T.vivo && T.vivo.ativo ? `O que o livro mostrava em ${T.vivo.dataLivro()}` : 'O que os dados mostram', item.mostra),
      item.naoE ? secao('O que não é', item.naoE) : null,
      T.h(
        'div',
        { class: 'explicador-rodape' },
        T.h('span', { class: 'leitura' }, `Livro, p. ${[].concat(item.p).join(', ')}`),
        item.rota
          ? T.h('a', { href: `#/${item.rota}${item.alvo ? `?alvo=${item.alvo}` : ''}`, class: 'link-seta', onclick: T.fecharExplicador }, 'Ver no capítulo', T.icone('seta'))
          : null
      ),
    ];
    painel.append(...partes.filter(Boolean));
    T.numerosNaLeitura(painel);
    painel.classList.add('aberto');
    painel.setAttribute('aria-hidden', 'false');
    painel.focus({ preventScroll: true });
  };
  function secao(titulo, texto) {
    if (!texto) return null;
    return T.h('section', { class: 'explicador-secao' }, T.h('h3', null, titulo), T.h('p', null, texto));
  }
  T.fecharExplicador = function () {
    if (!painel.classList.contains('aberto')) return;
    painel.classList.remove('aberto');
    painel.setAttribute('aria-hidden', 'true');
    if (retorno && document.contains(retorno)) retorno.focus({ preventScroll: true });
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') T.fecharExplicador();
    if ((e.key === 'Enter' || e.key === ' ') && e.target instanceof Element) {
      const alvo = e.target.closest('[data-explica]');
      if (alvo && alvo === e.target && !/^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(alvo.tagName)) {
        e.preventDefault();
        T.explicar(alvo.dataset.explica);
      }
    }
  });
  document.addEventListener('click', (e) => {
    const alvo = e.target.closest('[data-explica]');
    if (alvo) {
      e.preventDefault();
      T.explicar(alvo.dataset.explica);
    } else if (painel.classList.contains('aberto') && !painel.contains(e.target)) T.fecharExplicador();
  });
})();

(function () {
  'use strict';
  const T = window.T;
  const P = {
    pilotos: '<circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6"/><path d="M17.8 4.2a5.4 5.4 0 0 1 0 6.6M19.9 2.6a8 8 0 0 1 0 9.8"/>',
    controladores: '<path d="M9 21l1.4-10h3.2L15 21"/><path d="M7 11h10l-1.6-4H8.6z"/><path d="M12 7V3.5"/><path d="M9.2 3.6c1.7-1.2 3.9-1.2 5.6 0"/><path d="M8 17.5h8"/>',
    central: '<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H11l-4.2 3.3V16h-.3a2 2 0 0 1-2-2z"/><path d="M9 10.2h.01M12 10.2h.01M15 10.2h.01"/>',
    passageiros: '<path d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2"/>',
    operacao: '<path d="M12 3.2l7.5 4.1v9.4L12 20.8l-7.5-4.1V7.3z"/><path d="M4.8 7.5L12 11.6l7.2-4.1M12 11.6v9"/><path d="M8.3 5.3l7.3 4.1"/>',
    atendimento: '<path d="M5 13.5V12a7 7 0 0 1 14 0v1.5"/><rect x="3.6" y="13" width="3.8" height="5.6" rx="1.4"/><rect x="16.6" y="13" width="3.8" height="5.6" rx="1.4"/><path d="M18.5 18.6c0 1.6-1.6 2.4-4.3 2.4"/>',
    alcance: '<circle cx="12" cy="12" r="1.6"/><path d="M8.3 15.7a5.2 5.2 0 0 1 0-7.4M15.7 8.3a5.2 5.2 0 0 1 0 7.4M5.5 18.5a9.2 9.2 0 0 1 0-13M18.5 5.5a9.2 9.2 0 0 1 0 13"/>',
    plano: '<path d="M4 20L10.5 4h3L20 20"/><path d="M12 5.5v2.5M12 11v2.5M12 16.5V19"/><path d="M6.5 14h11"/>',
    decisao: '<path d="M12 3.5l2.4 5 5.4.7-4 3.8 1 5.4L12 15.8l-4.8 2.6 1-5.4-4-3.8 5.4-.7z"/>',
    visao: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/><path d="M12 12l5.8-5.8"/><circle cx="12" cy="12" r="1.1"/>',
    agir: '<path d="M8.4 3.5h7.2l4.9 4.9v7.2l-4.9 4.9H8.4l-4.9-4.9V8.4z"/><path d="M12 7.8v5.2M12 16.2h.01"/>',
    atencao: '<path d="M12 4.2l8.8 15.3H3.2z"/><path d="M12 10v4.2M12 17h.01"/>',
    firme: '<circle cx="12" cy="12" r="8.4"/><path d="M8.2 12.3l2.6 2.6 5-5.2"/>',
    'nao-medido': '<circle cx="12" cy="12" r="8.4" stroke-dasharray="2.2 2.6"/><path d="M8.8 12h6.4"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    seta: '<path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5"/>',
    voltar: '<path d="M19 12H6M11 6.5L5.5 12l5.5 5.5"/>',
    olho: '<path d="M2.8 12s3.4-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.4 6.2-9.2 6.2S2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
    'olho-fechado': '<path d="M4 4l16 16"/><path d="M9.9 6.1A9.6 9.6 0 0 1 12 5.8c5.8 0 9.2 6.2 9.2 6.2a16 16 0 0 1-2.9 3.6M6.5 7.4A15.6 15.6 0 0 0 2.8 12s3.4 6.2 9.2 6.2a9 9 0 0 0 4.1-1"/>',
    explorar: '<path d="M5 3.8l13.4 6.1-5.9 1.8-2.1 6.1z"/><path d="M12.6 11.8l5.6 5.6"/>',
    apresentar: '<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.6"/><path d="M10.4 7.8v5.1l4.3-2.55z"/><path d="M9 20h6M12 16v4"/>',
    telao: '<rect x="2.8" y="4" width="18.4" height="12" rx="1.2"/><path d="M6 8.5h5M6 11.5h8.5M16.5 8.5h1.5"/><path d="M8 20h8"/>',
    sensor: '<path d="M4 18h2.5l2.2-7 3.1 11 3.2-17 2.3 13H20"/>',
    alvo: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1"/>',
    cadeado: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="1.6"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><path d="M12 14.2v2.2"/>',
    lote: '<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>',
    relogio: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3.2 2"/>',
    info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.2M12 7.8h.01"/>',
    anterior: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
    proximo: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
    pausa: '<path d="M9 5.5v13M15 5.5v13"/>',
    tocar: '<path d="M7.5 5.2v13.6L18.5 12z"/>',
    tabela: '<rect x="3.8" y="4.8" width="16.4" height="14.4" rx="1.4"/><path d="M3.8 9.6h16.4M3.8 14.4h16.4M9.6 4.8v14.4"/>',
    livro: '<path d="M4.5 5.2c2.6-.9 5.2-.6 7.5 1 2.3-1.6 4.9-1.9 7.5-1v13.3c-2.6-.9-5.2-.6-7.5 1-2.3-1.6-4.9-1.9-7.5-1z"/><path d="M12 6.2v13.3"/>',
    conferencia: '<path d="M9 4.5h6M9.8 4.5v4.2L5.3 17.6A1.6 1.6 0 0 0 6.7 20h10.6a1.6 1.6 0 0 0 1.4-2.4l-4.5-8.9V4.5"/><path d="M7.4 14h9.2"/>',
    ponto_cego: '<path d="M3 12s3.3-6 9-6c1.4 0 2.6.3 3.7.8M21 12s-3.3 6-9 6c-1.4 0-2.6-.3-3.7-.8"/><path d="M4 20L20 4" stroke-dasharray="2 2.4"/>',
    pergunta: '<circle cx="12" cy="12" r="8.4"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .8-1 1.5v.6M12 16.9h.01"/>',
    congelado: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.6L12 7l2.5-2.4M9.5 19.4L12 17l2.5 2.4"/>',
    etiqueta: '<path d="M3.8 12.4V4.8a1 1 0 0 1 1-1h7.6l7.8 7.8a1.4 1.4 0 0 1 0 2l-5.8 5.8a1.4 1.4 0 0 1-2 0z"/><circle cx="8.3" cy="8.3" r="1.5"/>',
    expandir: '<path d="M4 9.5V4h5.5M20 14.5V20h-5.5"/><path d="M4 4l6.2 6.2M20 20l-6.2-6.2"/>',
    reduzir: '<path d="M10 4v6H4M14 20v-6h6"/><path d="M10 10L4 4M14 14l6 6"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    busca: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4.5 19.5h15"/>',
    upload: '<path d="M12 15.5v-11M7 9l5-5 5 5"/><path d="M4.5 19.5h15"/>',
    sino: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    filtro: '<path d="M4 5.5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2z"/>',
    painel: '<rect x="3.8" y="3.8" width="7" height="8.5" rx="1.6"/><rect x="13.2" y="3.8" width="7" height="5" rx="1.6"/><rect x="13.2" y="11.2" width="7" height="9" rx="1.6"/><rect x="3.8" y="14.7" width="7" height="5.5" rx="1.6"/>',
    dados: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6M4.5 12v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/>',
    planilha: '<path d="M6.5 3.5h8l4 4v13h-12z"/><path d="M14.5 3.5v4h4M9 12h6M9 15h6M9 18h4"/>',
    pdf: '<path d="M6.5 3.5h8l4 4v13h-12z"/><path d="M14.5 3.5v4h4"/><path d="M8.6 17v-4h1.4a1.2 1.2 0 0 1 0 2.4H8.6M13 13v4h.8a2 2 0 0 0 0-4z"/>',
    raio: '<path d="M13 3L5.5 13.5H12L11 21l7.5-10.5H12z"/>',
    comando: '<path d="M9 6.5a2.5 2.5 0 1 0-2.5 2.5H9zM15 6.5a2.5 2.5 0 1 1 2.5 2.5H15zM9 17.5a2.5 2.5 0 1 1-2.5-2.5H9zM15 17.5a2.5 2.5 0 1 0 2.5-2.5H15z"/><rect x="9" y="9" width="6" height="6"/>',
    conector: '<path d="M9 7V3.5M15 7V3.5"/><path d="M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0z"/><path d="M12 16v4.5"/>',
    tendencia: '<path d="M3.5 17l5.5-5.5 4 4 7.5-7.5"/><path d="M15 8h5.5v5.5"/>',
    lixo: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  };
  T.icone = function (nome, attrs) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = P[nome] || P.info;
    if (attrs) for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
    return svg;
  };
  T.iconePath = (nome) => P[nome] || P.info;
})();

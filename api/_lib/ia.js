// Resumo executivo opcional com IA (Claude). Só roda se ANTHROPIC_API_KEY estiver configurada.
// A IA NÃO calcula nada: recebe os insights já calculados (com números, períodos e fontes) e só redige
// um resumo curto, sem acrescentar números novos. Sem chave, a interface usa só os insights calculados.
import { config } from './config.js';
import { buscar } from './http.js';

export async function resumoIA(insights, nomeCliente) {
  if (!config.anthropic.chave || !insights.length) return null;
  const base = insights.map((i) => ({ fato: i.fato, hipotese: i.hipotese, recomendacao: i.recomendacao, periodo: i.periodo, fontes: i.fontes }));
  try {
    const r = await buscar(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: { 'x-api-key': config.anthropic.chave, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: config.anthropic.modelo,
          max_tokens: 400,
          system:
            'Você escreve resumos executivos em português do Brasil para gestores de marketing. Use SOMENTE os fatos fornecidos; não invente números, causas ou dados. Separe claramente o que é fato, o que é hipótese e o que é recomendação. Máximo de 5 frases.',
          messages: [{ role: 'user', content: `Cliente: ${nomeCliente}. Insights calculados (JSON):\n${JSON.stringify(base)}` }],
        }),
      },
      { tentativas: 2, limiteMs: 25000 }
    );
    if (!r.ok) return null;
    const d = await r.json();
    const texto = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    return texto ? { texto, modelo: config.anthropic.modelo, geradoEm: new Date().toISOString() } : null;
  } catch {
    return null;
  }
}

// Uma única função serverless para toda a API do OPS Intelligence (cabe no limite de funções do plano Hobby
// da Vercel). O vercel.json reescreve /api/<rota> para /api/ops?r=<rota>.
import { executar, json, ErroHttp } from './_lib/http.js';
import { rotas } from './_lib/rotas.js';

export default async function handler(req, res) {
  await executar(req, res, async () => {
    const url = new URL(req.url, 'http://local');
    const nome = (url.searchParams.get('r') || url.pathname.replace(/^\/api\/?/, '')).replace(/^\/+|\/+$/g, '');
    const r = rotas[nome];
    if (!r) throw new ErroHttp(404, `Rota inexistente: ${nome || '(vazia)'}`);
    const fn = r[req.method];
    if (!fn) throw new ErroHttp(405, 'Método não permitido');
    const params = Object.fromEntries(url.searchParams);
    const saida = await fn(req, params, res);
    if (saida !== undefined && !res.headersSent) json(res, saida.__status || 200, saida.__status ? saida.corpo : saida);
  });
}

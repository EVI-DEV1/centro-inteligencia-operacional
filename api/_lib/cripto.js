// Tokens das integrações ficam cifrados no banco (AES-256-GCM) e só são abertos dentro da função.
import crypto from 'node:crypto';
import { config } from './config.js';
import { ErroHttp } from './http.js';

const chave = () => {
  const k = config.chaveCifra ? Buffer.from(config.chaveCifra, 'base64') : null;
  if (!k || k.length !== 32) throw new ErroHttp(503, 'OPS_CHAVE_CIFRA ausente ou inválida (precisa de 32 bytes em base64).');
  return k;
};

export function cifrar(texto) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chave(), iv);
  const dado = Buffer.concat([c.update(String(texto), 'utf8'), c.final()]);
  return ['v1', iv.toString('base64'), c.getAuthTag().toString('base64'), dado.toString('base64')].join('.');
}

export function decifrar(pacote) {
  const [v, iv, tag, dado] = String(pacote || '').split('.');
  if (v !== 'v1') throw new ErroHttp(500, 'Credencial em formato desconhecido');
  const d = crypto.createDecipheriv('aes-256-gcm', chave(), Buffer.from(iv, 'base64'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(dado, 'base64')), d.final()]).toString('utf8');
}

/** Hash estável de telefone/contato para contar contatos únicos sem guardar o número (LGPD). */
export const hashContato = (v) => crypto.createHmac('sha256', chave()).update(String(v).replace(/\D/g, '')).digest('hex').slice(0, 32);

/** Confere a assinatura X-Hub-Signature-256 dos webhooks da Meta. */
export function assinaturaMetaValida(corpoBruto, assinatura, segredo) {
  if (!segredo || !assinatura || !assinatura.startsWith('sha256=')) return false;
  const esperado = crypto.createHmac('sha256', segredo).update(corpoBruto).digest('hex');
  const a = Buffer.from(assinatura.slice(7), 'hex');
  const b = Buffer.from(esperado, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

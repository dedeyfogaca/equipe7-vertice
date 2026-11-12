// Feedback dos usuários de teste (RF32, RN27).
//
// Desde 12/11/2026 o feedback é respondido dentro do próprio Vértice, na
// página /feedback, e as respostas vão para a tabela feedback do banco. Só
// quem está na tabela equipe lê as respostas, na tela "Respostas do feedback".
//
// O formulário do Google continua só como reserva, para quando o sistema roda
// sem banco (a demonstração local, sem o arquivo .env).
import { supabase, temBanco } from './supabase.js';

export const LINK_FEEDBACK = 'https://forms.gle/QpAtRSGux4XKd67T6';

export const temFormularioFeedback = () => temBanco || /^https:\/\//.test(LINK_FEEDBACK);

export const NOTAS = [
  { valor: 1, rotulo: 'Muito ruim' },
  { valor: 2, rotulo: 'Ruim' },
  { valor: 3, rotulo: 'Ok' },
  { valor: 4, rotulo: 'Bom' },
  { valor: 5, rotulo: 'Ótimo' },
];

export const PERGUNTAS_ABERTAS = [
  { campo: 'funcionou', titulo: 'O que funcionou bem?', dica: 'Uma tela, um detalhe, algo que te ajudou.' },
  { campo: 'travou', titulo: 'O que travou ou confundiu?', dica: 'Um erro, um botão que você não achou, algo que demorou.' },
  { campo: 'faltou', titulo: 'O que faltou?', dica: 'O que faria você usar o Vértice todo dia.' },
];

export const LIMITE_TEXTO = 1000;
export const LIMITE_CONTATO = 120;

export const ORIGENS = {
  visitante: 'Visitante',
  demonstracao: 'Demonstração',
  conta: 'Com conta',
};

// Um envio por navegador a cada 2 minutos (o banco ainda limita o total por
// minuto). O registro é só uma conveniência deste navegador.
const CHAVE_ENVIO = 'vertice:feedback-enviado';
const INTERVALO = 2 * 60 * 1000;

export function enviouHaPouco(agora = Date.now()) {
  try {
    const ultimo = Number(localStorage.getItem(CHAVE_ENVIO));
    return Number.isFinite(ultimo) && ultimo > 0 && agora - ultimo < INTERVALO;
  } catch {
    return false;
  }
}

function marcarEnvio() {
  try {
    localStorage.setItem(CHAVE_ENVIO, String(Date.now()));
  } catch {
    /* sem armazenamento, sem trava: o banco ainda limita */
  }
}

export function validarFeedback({ nota, contato, ...textos }) {
  const erros = {};
  if (!NOTAS.some((n) => n.valor === nota)) erros.nota = 'Escolha uma nota de 1 a 5.';
  for (const { campo } of PERGUNTAS_ABERTAS) {
    if ((textos[campo] ?? '').length > LIMITE_TEXTO) erros[campo] = `Use até ${LIMITE_TEXTO} caracteres.`;
  }
  if ((contato ?? '').length > LIMITE_CONTATO) erros.contato = `Use até ${LIMITE_CONTATO} caracteres.`;
  return erros;
}

const vazio = (v) => (v ?? '').trim() || null;

/** Grava a resposta. Sem "select" depois: quem envia não lê a tabela (RN27). */
export async function enviarFeedback({ nota, funcionou, travou, faltou, contato, origem }) {
  if (!supabase) throw new Error('Sem banco configurado.');
  const { error } = await supabase.from('feedback').insert({
    nota,
    funcionou: vazio(funcionou),
    travou: vazio(travou),
    faltou: vazio(faltou),
    contato: vazio(contato),
    origem,
  });
  if (error) {
    throw new Error(/Muitas respostas/.test(error.message) ? error.message : 'Não foi possível enviar agora. Tente de novo em instantes.');
  }
  marcarEnvio();
}

export async function ehDaEquipe() {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('eh_equipe');
  return !error && data === true;
}

const daLinha = (l) => ({
  id: l.id_feedback,
  nota: l.nota,
  funcionou: l.funcionou ?? '',
  travou: l.travou ?? '',
  faltou: l.faltou ?? '',
  contato: l.contato ?? '',
  origem: l.origem,
  lida: Boolean(l.lida),
  dataEnvio: l.data_envio,
});

export async function listarFeedback() {
  const { data, error } = await supabase.from('feedback').select('*').order('data_envio', { ascending: false });
  if (error) throw new Error('Não foi possível carregar as respostas.');
  return (data ?? []).map(daLinha).sort((a, b) => (a.dataEnvio < b.dataEnvio ? 1 : -1));
}

export async function marcarFeedback(id, lida) {
  const { error } = await supabase.from('feedback').update({ lida }).eq('id_feedback', id);
  if (error) throw new Error('Não foi possível marcar a resposta.');
}

export async function excluirFeedback(id) {
  const { error } = await supabase.from('feedback').delete().eq('id_feedback', id);
  if (error) throw new Error('Não foi possível excluir a resposta.');
}

/** Resumo das respostas: total, média, quantas por nota e não lidas. */
export function resumirFeedback(lista) {
  const porNota = [1, 2, 3, 4, 5].map((n) => lista.filter((r) => r.nota === n).length);
  const total = lista.length;
  const media = total ? lista.reduce((s, r) => s + r.nota, 0) / total : 0;
  return { total, media, porNota, naoLidas: lista.filter((r) => !r.lida).length };
}

const celula = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/** CSV com separador ";" (abre direto no Excel em português). */
export function feedbackEmCsv(lista) {
  const cab = ['Data', 'Nota', 'O que funcionou', 'O que travou', 'O que faltou', 'Contato', 'Origem', 'Lida'];
  const linhas = lista.map((r) =>
    [
      new Date(r.dataEnvio).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      r.nota,
      r.funcionou,
      r.travou,
      r.faltou,
      r.contato,
      ORIGENS[r.origem] ?? r.origem,
      r.lida ? 'Sim' : 'Não',
    ]
      .map(celula)
      .join(';')
  );
  return '﻿' + [cab.map(celula).join(';'), ...linhas].join('\r\n');
}

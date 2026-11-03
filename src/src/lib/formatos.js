// Textos de data e de situação usados pelas telas. Ficam aqui para a lista,
// o painel e o calendário escreverem "Sex, 30/10" do mesmo jeito.

import { STATUS } from './constants.js';
import { dataLocal, diasRestantes } from './datas.js';
import { diaLocal } from './gamificacao.js';
import { SITUACAO, situacaoDaAtividade } from './situacoes.js';

export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DIAS_LONGOS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
export const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const doisDigitos = (n) => String(n).padStart(2, '0');

export function capitalizar(texto) {
  return texto ? texto[0].toUpperCase() + texto.slice(1) : '';
}

/** '2026-10-30' -> '30/10' */
export function ddmm(iso) {
  const d = dataLocal(iso);
  return d ? `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}` : '';
}

/** Título do mês no calendário: 'Outubro de 2026' (o "de" em minúscula — D04). */
export function tituloMes(ano, mes) {
  return `${capitalizar(MESES[mes])} de ${ano}`;
}

/** 'Quarta-feira, 28 de outubro' */
export function diaPorExtenso(data = new Date()) {
  return `${DIAS_LONGOS[data.getDay()]}, ${data.getDate()} de ${MESES[data.getMonth()]}`;
}

/** '28 de outubro' */
export function diaEMes(data) {
  return `${data.getDate()} de ${MESES[data.getMonth()]}`;
}

export function saudacao(data = new Date()) {
  const hora = data.getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Etiqueta curta do prazo nas listas: 'Hoje', 'Amanhã', 'Sex, 30/10',
 * '26/10 · atrasada' ou 'Concluída 21/10'.
 */
export function etiquetaPrazo(atividade) {
  if (atividade.status === STATUS.CONCLUIDO) {
    const dia = diaLocal(atividade.dataConclusao);
    return dia ? `Concluída ${ddmm(dia)}` : 'Concluída';
  }
  const dias = diasRestantes(atividade.prazo);
  if (dias === null) return 'Sem prazo';
  if (dias < 0) return `${ddmm(atividade.prazo)} · atrasada`;
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  const d = dataLocal(atividade.prazo);
  return `${DIAS_CURTOS[d.getDay()]}, ${ddmm(atividade.prazo)}`;
}

// Tom do selo (Badge) e rótulo de cada situação.
export const TOM_SITUACAO = {
  [SITUACAO.A_FAZER]: 'afazer',
  [SITUACAO.FAZENDO]: 'fazendo',
  [SITUACAO.CONCLUIDAS]: 'concluido',
  [SITUACAO.ATRASADAS]: 'atrasada',
};

export const ROTULO_SITUACAO = {
  [SITUACAO.A_FAZER]: 'A fazer',
  [SITUACAO.FAZENDO]: 'Fazendo',
  [SITUACAO.CONCLUIDAS]: 'Concluída',
  [SITUACAO.ATRASADAS]: 'Atrasada',
};

export function tomDaAtividade(atividade) {
  return TOM_SITUACAO[situacaoDaAtividade(atividade)];
}

export function rotuloSituacao(atividade) {
  return ROTULO_SITUACAO[situacaoDaAtividade(atividade)];
}

/** Ordena por prazo (sem prazo no fim). */
export function porPrazo(a, b) {
  if (!a.prazo && !b.prazo) return 0;
  if (!a.prazo) return 1;
  if (!b.prazo) return -1;
  return a.prazo.localeCompare(b.prazo);
}

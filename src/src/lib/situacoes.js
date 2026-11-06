// Situações da atividade (RN04, RN05 e RN16).
//
// "A fazer", "Fazendo", "Concluídas" e "Atrasadas" não são contadores: são
// filtros. Clicar numa delas filtra a lista. Por isso a regra mora aqui, e
// não na tela. O Painel conta e a lista de Atividades filtra usando
// exatamente o mesmo predicado.
//
// Repare que "atrasada" não é um status: é um cruzamento de prazo com status
// (RN05). Uma atividade atrasada também está "a fazer" ou "fazendo", e por
// isso aparece nas duas contagens.

import { STATUS } from './constants.js';
import { diasRestantes } from './datas.js';

export const SITUACAO = {
  TODAS: 'todas',
  A_FAZER: 'afazer',
  FAZENDO: 'fazendo',
  CONCLUIDAS: 'concluidas',
  ATRASADAS: 'atrasadas',
};

export const SITUACAO_OPCOES = [
  { valor: SITUACAO.A_FAZER, rotulo: 'A fazer', tom: 'afazer' },
  { valor: SITUACAO.FAZENDO, rotulo: 'Fazendo', tom: 'fazendo' },
  { valor: SITUACAO.CONCLUIDAS, rotulo: 'Concluídas', tom: 'concluido' },
  { valor: SITUACAO.ATRASADAS, rotulo: 'Atrasadas', tom: 'atrasada' },
];

/** RN05: atrasada é prazo no passado com status diferente de concluído. */
export function estaAtrasada(atividade) {
  if (!atividade || atividade.status === STATUS.CONCLUIDO) return false;
  const dias = diasRestantes(atividade.prazo);
  return dias !== null && dias < 0;
}

/** A atividade pertence à situação? `todas` aceita qualquer uma. */
export function naSituacao(atividade, situacao) {
  switch (situacao) {
    case SITUACAO.A_FAZER:
      return atividade.status === STATUS.A_FAZER;
    case SITUACAO.FAZENDO:
      return atividade.status === STATUS.FAZENDO;
    case SITUACAO.CONCLUIDAS:
      return atividade.status === STATUS.CONCLUIDO;
    case SITUACAO.ATRASADAS:
      return estaAtrasada(atividade);
    default:
      return true;
  }
}

/**
 * A situação que representa a atividade, quando é preciso escolher uma só:
 * na cor da barra do cartão, no ponto do calendário.
 *
 * A ordem importa: atraso vem antes do status, porque é o que precisa ser
 * visto primeiro. Uma atrasada também está "a fazer" ou "fazendo", e nas
 * contagens ela aparece nas duas; aqui, não.
 */
export function situacaoDaAtividade(atividade) {
  if (atividade?.status === STATUS.CONCLUIDO) return SITUACAO.CONCLUIDAS;
  if (estaAtrasada(atividade)) return SITUACAO.ATRASADAS;
  if (atividade?.status === STATUS.FAZENDO) return SITUACAO.FAZENDO;
  return SITUACAO.A_FAZER;
}

/** Quantas atividades em cada situação. */
export function contarPorSituacao(atividades = []) {
  return SITUACAO_OPCOES.reduce((conta, { valor }) => {
    conta[valor] = atividades.filter((a) => naSituacao(a, valor)).length;
    return conta;
  }, {});
}

export function ehSituacaoValida(valor) {
  return valor === SITUACAO.TODAS || SITUACAO_OPCOES.some((o) => o.valor === valor);
}

// Cálculo de progresso (RN08 e RN14).
//
// É o coração do Vértice: o que distingue medir avanço de riscar itens de uma
// lista. O progresso não conta atividades, soma pesos.
//
// As duas armadilhas que este módulo existe para evitar:
//
// 1. O progresso da disciplina NÃO é a média dos percentuais dos conteúdos.
//    É a razão entre pesos somados. Um conteúdo que vale 20 pontos de peso
//    pesa mais que um de 4, e a média trataria os dois como iguais.
//
// 2. Conteúdo sem atividade fica FORA do cálculo. Não é 0%: é ausente.
//    Tratá-lo como 0% derrubaria o progresso da disciplina indevidamente.
//
// Por isso `null` é um retorno legítimo aqui, e significa "não há o que
// medir". Quem chama precisa distinguir isso de zero.

import { normalizarPeso, STATUS } from './constants.js';

function somarPeso(atividades) {
  return atividades.reduce((soma, a) => soma + normalizarPeso(a.peso), 0);
}

function resumir(pesoConcluido, pesoTotal, { total, concluidas }) {
  const fracao = pesoTotal > 0 ? pesoConcluido / pesoTotal : 0;
  return {
    pesoConcluido,
    pesoTotal,
    // Fração exata: é ela que deve ser usada para compor outros cálculos.
    fracao,
    // Percentual arredondado, só para exibir. Arredondar antes de compor
    // acumularia erro.
    percentual: Math.round(fracao * 100),
    total,
    concluidas,
  };
}

/**
 * RN08: progresso de um conteúdo.
 *
 * progresso = soma(peso das atividades CONCLUÍDAS) / soma(peso de TODAS)
 *
 * @param {Array} atividades atividades do conteúdo
 * @returns resumo do progresso, ou `null` se o conteúdo não tem atividade
 */
export function progressoDoConteudo(atividades = []) {
  if (atividades.length === 0) return null;

  const concluidas = atividades.filter((a) => a.status === STATUS.CONCLUIDO);

  return resumir(somarPeso(concluidas), somarPeso(atividades), {
    total: atividades.length,
    concluidas: concluidas.length,
  });
}

/**
 * O progresso que o conteúdo teria SEM esta atividade contar como concluída.
 *
 * Serve ao retorno da conclusão (RF15): para mostrar "antes → depois" não é
 * preciso guardar histórico nenhum. Basta recalcular o conteúdo fingindo que
 * esta atividade ainda não foi concluída: o peso dela continua no total,
 * porque ela sempre existiu; o que muda é o lado de cima da razão.
 *
 * @param {Array} atividades atividades do conteúdo
 * @param {string} atividadeId a que acabou de ser concluída
 */
export function progressoAntesDe(atividades = [], atividadeId) {
  return progressoDoConteudo(
    atividades.map((a) =>
      a.id === atividadeId ? { ...a, status: STATUS.A_FAZER } : a
    )
  );
}

/**
 * RN14: progresso de uma disciplina.
 *
 * progresso = soma(peso concluído de TODOS os conteúdos)
 *           / soma(peso total de TODOS os conteúdos)
 *
 * Recebe as atividades já agrupadas por conteúdo para deixar visível que a
 * agregação é feita sobre os conteúdos, mas somando peso, não tirando média
 * de percentual.
 *
 * @param {Array<Array>} atividadesPorConteudo uma lista de atividades por conteúdo
 * @returns resumo do progresso, ou `null` se nenhum conteúdo tem atividade
 */
export function progressoDaDisciplina(atividadesPorConteudo = []) {
  const parciais = atividadesPorConteudo.map(progressoDoConteudo).filter(Boolean);

  if (parciais.length === 0) return null;

  const pesoConcluido = parciais.reduce((soma, p) => soma + p.pesoConcluido, 0);
  const pesoTotal = parciais.reduce((soma, p) => soma + p.pesoTotal, 0);

  return resumir(pesoConcluido, pesoTotal, {
    total: parciais.reduce((soma, p) => soma + p.total, 0),
    concluidas: parciais.reduce((soma, p) => soma + p.concluidas, 0),
  });
}

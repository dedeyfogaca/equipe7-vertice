// Quem pode o quê numa atividade (RN07 e RN20).
//
// `quem` descreve a pessoa da sessão: `{ membroId, organizador }`. O
// `organizador` já vem resolvido pela sessão (inclui o grupo ainda vazio, em
// que quem está montando o grupo pode tudo).

import { STATUS } from './constants.js';

/** A pessoa da sessão é a responsável pela atividade? */
export function ehResponsavel(atividade, quem) {
  return Boolean(quem?.membroId) && atividade?.responsavelId === quem.membroId;
}

// RN20 — só o responsável muda o status da atividade: conclui, reabre ou
// marca como "fazendo". Nem o organizador conclui pelos outros, porque a
// experiência e a ofensiva são de quem fez (RN10, RN11).
export function podeMudarStatus(atividade, quem) {
  return ehResponsavel(atividade, quem);
}

// RN07 — o organizador edita e exclui qualquer atividade do grupo (para
// corrigir um dado ou trocar o responsável); o participante, só as que estão
// sob a responsabilidade dele.
export function podeEditarAtividade(atividade, quem) {
  return Boolean(quem?.organizador) || ehResponsavel(atividade, quem);
}

export function podeExcluirAtividade(atividade, quem) {
  return podeEditarAtividade(atividade, quem);
}

/**
 * RN20 no formulário: o status que vai ser gravado. Quem não é o responsável
 * (o escolhido no próprio formulário) não decide o status — a atividade nova
 * começa em "a fazer" e a editada continua como estava.
 */
export function statusAoSalvar({ statusEscolhido, statusAtual, responsavelId, quem }) {
  const original = statusAtual || STATUS.A_FAZER;
  if (!ehResponsavel({ responsavelId }, quem)) return original;
  return statusEscolhido || original;
}

// Quem pode o quê numa atividade (RN07 e RN20).
//
// `quem` descreve a pessoa da sessão: `{ membroId, organizador }`. O
// `organizador` já vem resolvido pela sessão (inclui o grupo ainda vazio, em
// que quem está montando o grupo pode tudo).

import { STATUS } from './constants.js';

// Com o espaço pessoal (revisão de 11/11/2026), a mesma tela mostra
// atividades de grupos diferentes: quem chama monta o `quem` do grupo da
// atividade (ver hooks/usePermissoes.js).

/** A pessoa da sessão é a responsável pela atividade? */
export function ehResponsavel(atividade, quem) {
  return Boolean(quem?.membroId) && atividade?.responsavelId === quem.membroId;
}

// RN20: só o responsável muda o status da atividade: conclui, reabre ou
// marca como "fazendo". Nem o organizador conclui pelos outros, porque a
// experiência e a ofensiva são de quem fez (RN10, RN11).
export function podeMudarStatus(atividade, quem) {
  return ehResponsavel(atividade, quem);
}

// RN07: o organizador edita e exclui qualquer atividade do grupo (para
// corrigir um dado ou trocar o responsável); o participante, só as que estão
// sob a responsabilidade dele.
export function podeEditarAtividade(atividade, quem) {
  return Boolean(quem?.organizador) || ehResponsavel(atividade, quem);
}

export function podeExcluirAtividade(atividade, quem) {
  return podeEditarAtividade(atividade, quem);
}

// RN06: atividade "A definir" fica visível para o grupo todo, e qualquer
// integrante pode assumir. Só depois de assumida ela pode ser iniciada e
// concluída (RN20).
export function podeAssumir(atividade, quem) {
  return Boolean(quem?.membroId) && Boolean(atividade) && !atividade.responsavelId;
}

/**
 * RN20 no formulário: o status que vai ser gravado. Quem não é o responsável
 * (o escolhido no próprio formulário) não decide o status: a atividade nova
 * começa em "a fazer" e a editada continua como estava.
 */
export function statusAoSalvar({ statusEscolhido, statusAtual, responsavelId, quem }) {
  const original = statusAtual || STATUS.A_FAZER;
  if (!responsavelId) return STATUS.A_FAZER;
  if (!ehResponsavel({ responsavelId }, quem)) return original;
  return statusEscolhido || original;
}

// RF31: qualquer membro cadastra evento. Edita e exclui quem cadastrou, ou o
// organizador (para corrigir ou tirar um evento que ficou para trás).
export function podeEditarEvento(evento, quem) {
  return Boolean(quem?.organizador) || (Boolean(quem?.membroId) && evento?.criadoPor === quem.membroId);
}

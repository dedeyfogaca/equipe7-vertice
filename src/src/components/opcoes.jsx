import { Crown, House, SignalHigh, SignalLow, SignalMedium, UserRound } from 'lucide-react';

import { Avatar } from './ui/avatar-membro.jsx';
import { AvatarGrupo } from './ui/avatar-grupo.jsx';
import { IconeOpcao, PontoCor } from './ui/selecao.jsx';
import {
  PERFIL,
  PERFIL_OPCOES,
  PRIORIDADE,
  PRIORIDADE_OPCOES,
  STATUS,
  STATUS_OPCOES,
} from '../lib/constants.js';
import { cn } from '../lib/utils.js';

// Opções das listas de escolha, cada uma com o marcador visual do sistema:
// a cor da disciplina, a foto do membro, a cor da situação, o ícone da
// prioridade e do perfil.

/** Disciplinas com o quadradinho da cor, como no "Progresso por disciplina". */
export function opcoesDisciplinas(disciplinas) {
  return disciplinas.map((d) => ({ valor: d.id, rotulo: d.nome, icone: <PontoCor cor={d.cor} /> }));
}

// RN06: o responsável pode ficar "A definir". A lista de escolha não aceita
// valor vazio como opção, então "A definir" tem um valor próprio, que o
// formulário troca por vazio ao salvar.
export const A_DEFINIR = 'a-definir';
export const OPCAO_A_DEFINIR = {
  valor: A_DEFINIR,
  rotulo: 'A definir',
  icone: (
    <span
      aria-hidden="true"
      className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-dashed border-borda-forte text-apagado"
    >
      <UserRound className="size-3" />
    </span>
  ),
};

/** Grupos (e o espaço pessoal) com a foto ou as iniciais. */
export function opcoesGrupos(grupos) {
  return grupos.map((g) => ({
    valor: g.id,
    rotulo: g.pessoal ? 'Pessoal' : g.nome,
    icone: g.pessoal ? <IconeOpcao icone={House} /> : <AvatarGrupo grupo={g} tamanho={22} tom="neutro" />,
  }));
}

/** Membros com a foto (ou o avatar sorteado). Quem está usando vem marcado. */
export function opcoesMembros(membros, { voceId } = {}) {
  return membros.map((m) => ({
    valor: m.id,
    rotulo: m.id === voceId ? `${m.nome} (você)` : m.nome,
    icone: <Avatar membro={m} tamanho={22} decorativo />,
  }));
}

const COR_STATUS = {
  [STATUS.A_FAZER]: 'bg-afazer',
  [STATUS.FAZENDO]: 'bg-fazendo',
  [STATUS.CONCLUIDO]: 'bg-concluido',
};

/** Ponto redondo na cor da situação (a mesma dos cartões de situação). */
export function PontoStatus({ status, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('size-2.5 shrink-0 rounded-full', COR_STATUS[status] ?? 'bg-borda-forte', className)}
    />
  );
}

export const OPCOES_STATUS = STATUS_OPCOES.map((o) => ({
  ...o,
  icone: <PontoStatus status={o.valor} />,
}));

const ICONE_PRIORIDADE = {
  [PRIORIDADE.BAIXA]: { icone: SignalLow, cor: 'text-sutil' },
  [PRIORIDADE.MEDIA]: { icone: SignalMedium, cor: 'text-fazendo' },
  [PRIORIDADE.ALTA]: { icone: SignalHigh, cor: 'text-atrasada' },
};

export const OPCOES_PRIORIDADE = PRIORIDADE_OPCOES.map((o) => ({
  ...o,
  icone: <IconeOpcao icone={ICONE_PRIORIDADE[o.valor].icone} className={ICONE_PRIORIDADE[o.valor].cor} />,
}));

export const OPCOES_PERFIL = PERFIL_OPCOES.map((o) => ({
  ...o,
  icone: (
    <IconeOpcao
      icone={o.valor === PERFIL.ORGANIZADOR ? Crown : UserRound}
      className={o.valor === PERFIL.ORGANIZADOR ? 'text-primaria-texto' : undefined}
    />
  ),
  detalhe: o.valor === PERFIL.ORGANIZADOR ? 'Gerencia o grupo' : 'Cuida das próprias atividades',
}));

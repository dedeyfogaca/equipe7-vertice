import { Link } from 'react-router-dom';
import {
  BookCheck,
  CalendarCheck,
  Flame,
  Footprints,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTitulo } from '../hooks/useTitulo.js';
import { Avatar } from '../components/ui/avatar-membro.jsx';
import { Button } from '../components/ui/botao.jsx';
import { Badge, Card, EmptyState, PageHeader, Rotulo } from '../components/ui/basicos.jsx';
import { CONQUISTAS, diaLocal } from '../lib/gamificacao.js';
import { formatarData } from '../lib/datas.js';
import { cn, plural } from '../lib/utils.js';

// Experiência (RN10), ofensiva (RN11) e conquistas (RN12): as suas e o
// ranking do grupo.

const ICONES = {
  PRIMEIRO_PASSO: Footprints,
  CONTEUDO_DOMINADO: BookCheck,
  DISCIPLINA_FECHADA: GraduationCap,
  SEMANA_CHEIA: Flame,
  MES_CHEIO: CalendarCheck,
  MEIO_MILHAR: Sparkles,
};

function Estatistica({ rotulo, valor, destaque = false }) {
  return (
    <Card
      className={cn(
        'flex flex-col gap-1.5 p-[18px]',
        destaque && 'border-gam/30 bg-gam/[0.08]'
      )}
    >
      <Rotulo className={destaque ? 'text-gam-texto' : undefined}>{rotulo}</Rotulo>
      <span
        className={cn(
          'text-[28px] font-semibold leading-tight tracking-[-0.03em]',
          destaque ? 'text-gam-texto' : 'text-forte'
        )}
      >
        {valor}
      </span>
    </Card>
  );
}

export default function Conquistas() {
  useTitulo('Conquistas');
  const { grupoAtivo, membroAtivo } = useAuth();

  // Grupo de uma versão anterior que ainda não tem membro nenhum: não há de
  // quem mostrar experiência, ofensiva e conquistas (UC09, fluxo 1A).
  if (!membroAtivo) {
    return (
      <>
        <PageHeader titulo="Conquistas" subtitulo="Experiência, ofensiva e marcos: os seus e os do grupo." />
        <Card>
          <EmptyState
            icone={Users}
            titulo="O grupo ainda não tem membros"
            descricao="Experiência, ofensiva e conquistas são de cada membro. Cadastre o primeiro: ele entra como organizador do grupo."
          >
            <Button asChild>
              <Link to="/membros">Abrir membros</Link>
            </Button>
          </EmptyState>
        </Card>
      </>
    );
  }

  return <ConquistasDoMembro grupoId={grupoAtivo.id} membroAtivo={membroAtivo} />;
}

function ConquistasDoMembro({ grupoId, membroAtivo }) {
  const { rankingDoGrupo, conquistasDoMembro } = useData();

  const ranking = rankingDoGrupo(grupoId);
  const minha = ranking.find((l) => l.membro.id === membroAtivo.id);
  const xp = minha?.xp ?? 0;
  const ofensiva = minha?.ofensiva ?? 0;
  const concluidas = minha?.concluidas ?? 0;
  const obtidas = new Map(conquistasDoMembro(membroAtivo.id).map((c) => [c.codigo, c]));

  // O quanto falta para cada marco que ainda não foi atingido.
  const andamento = (conquista) => {
    const medidas = {
      atividades_concluidas: { atual: concluidas, unidade: (n) => plural(n, 'atividade') },
      ofensiva_dias: { atual: ofensiva, unidade: (n) => plural(n, 'dia') },
      experiencia_total: { atual: xp, unidade: (n) => `${n} XP` },
    };
    const medida = medidas[conquista.criterio];
    if (!medida) return null;
    const atual = Math.min(medida.atual, conquista.valor);
    return {
      fracao: atual / conquista.valor,
      texto: `${atual} de ${medida.unidade(conquista.valor)}`,
    };
  };

  return (
    <>
      <PageHeader titulo="Conquistas" subtitulo="Experiência, ofensiva e marcos: os seus e os do grupo." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Estatistica rotulo="Experiência" valor={`${xp} XP`} destaque />
        <Estatistica rotulo="Ofensiva" valor={plural(ofensiva, 'dia')} />
        <Estatistica rotulo="Concluídas" valor={concluidas} />
        <Estatistica
          rotulo="Posição no grupo"
          valor={minha ? `${minha.posicao}º de ${ranking.length}` : 'sem posição'}
        />
      </div>

      <section aria-labelledby="t-conquistas" className="mt-10">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="t-conquistas" className="text-[19px] font-semibold tracking-[-0.02em] text-forte">
            Suas conquistas
          </h2>
          <span className="text-sm text-sutil">
            {obtidas.size} de {CONQUISTAS.length}
          </span>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CONQUISTAS.map((conquista) => {
            const obtida = obtidas.get(conquista.codigo);
            const Icone = ICONES[conquista.codigo] ?? Sparkles;
            const falta = obtida ? null : andamento(conquista);
            return (
              <Card
                as="li"
                key={conquista.codigo}
                className={cn('flex gap-4 p-5', obtida ? 'border-gam/35' : 'border-dashed shadow-none')}
              >
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                    obtida ? 'bg-gam/15 text-gam' : 'bg-superficie-3 text-apagado'
                  )}
                >
                  <Icone className="size-6" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className={cn('text-base font-semibold', obtida ? 'text-forte' : 'text-suave')}>
                    {conquista.nome}
                  </h3>
                  <p className="text-sm leading-snug text-sutil">{conquista.descricao}</p>
                  {obtida ? (
                    <p className="mt-1 text-[13px] font-medium text-gam-texto">
                      Conquistada em {formatarData(diaLocal(obtida.obtidaEm))}
                    </p>
                  ) : falta ? (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-superficie-3">
                        <span className="block h-full rounded-full bg-gam" style={{ width: `${falta.fracao * 100}%` }} />
                      </span>
                      <span className="text-[12px] text-sutil">{falta.texto}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-[13px] text-apagado">Ainda não conquistada</p>
                  )}
                </div>
              </Card>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="t-ranking" className="mt-10">
        <h2 id="t-ranking" className="mb-4 text-[19px] font-semibold tracking-[-0.02em] text-forte">
          Ranking do grupo
        </h2>
        <Card className="overflow-hidden">
          <div
            aria-hidden="true"
            className="hidden grid-cols-[48px_minmax(0,1fr)_96px_96px_96px_96px] gap-3 border-b border-divisor px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil md:grid"
          >
            <span>#</span>
            <span>Membro</span>
            <span className="text-right">Concluídas</span>
            <span className="text-right">Ofensiva</span>
            <span className="text-right">Conquistas</span>
            <span className="text-right">XP</span>
          </div>
          <ol className="divide-y divide-divisor">
            {ranking.map((linha) => {
              const eu = linha.membro.id === membroAtivo.id;
              return (
                <li
                  key={linha.membro.id}
                  className={cn(
                    'grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 md:grid-cols-[48px_minmax(0,1fr)_96px_96px_96px_96px]',
                    eu && 'bg-primaria-barra/[0.05]'
                  )}
                >
                  <span className="numero text-[15px] font-bold text-suave">{linha.posicao}º</span>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar membro={linha.membro} tamanho={36} decorativo />
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-semibold text-forte">{linha.membro.nome}</span>
                        {eu && <Badge tom="contorno">Você</Badge>}
                      </span>
                      <span className="text-[13px] text-sutil md:hidden">
                        {plural(linha.concluidas, 'concluída')} · {plural(linha.ofensiva, 'dia')} de ofensiva
                      </span>
                    </span>
                  </span>
                  <span className="numero hidden text-right text-texto md:block">{linha.concluidas}</span>
                  <span className="numero hidden text-right text-texto md:block">{linha.ofensiva}</span>
                  <span className="numero hidden text-right text-texto md:block">{linha.conquistas.length}</span>
                  <span className="numero text-right font-bold text-gam-texto">{linha.xp} XP</span>
                </li>
              );
            })}
          </ol>
        </Card>
        <p className="mt-3 text-[13px] text-sutil">
          Cada atividade concluída vale peso × 10 de experiência para o responsável. Empate em XP mantém a
          ordem alfabética.
        </p>
      </section>
    </>
  );
}

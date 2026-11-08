import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Compass, LayoutDashboard, ListChecks, Trophy, Users, X } from 'lucide-react';

import { useData } from '../../context/DataContext.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { Button } from '../ui/botao.jsx';
import { cn } from '../../lib/utils.js';

// Tutorial opcional (pedido da equipe): um passeio rápido pelas telas.
// Não abre sozinho: o painel convida na primeira visita, e o menu da conta
// deixa abrir de novo quando quiser.

const CHAVE = 'tutorialVisto';
const TutorialContext = createContext(null);

function passos(comConta) {
  return [
    {
      icone: LayoutDashboard,
      titulo: 'Painel',
      texto: 'O resumo do grupo: o que vence logo, o progresso de cada disciplina, os próximos eventos e o seu ritmo.',
      rota: '/painel',
    },
    {
      icone: BookOpen,
      titulo: 'Disciplinas e conteúdos',
      texto:
        'Cada disciplina pode ser dividida em conteúdos. O progresso soma o peso das atividades concluídas, então uma entrega grande conta mais que uma pequena. Abra uma disciplina para ver a evolução dia a dia.',
      rota: '/disciplinas',
    },
    {
      icone: ListChecks,
      titulo: 'Atividades',
      texto: 'Toda atividade tem responsável, prazo e peso de 1 a 5. Só o responsável muda o status, e concluir mostra quanto o conteúdo avançou.',
      rota: '/atividades',
    },
    {
      icone: CalendarDays,
      titulo: 'Calendário e eventos',
      texto: 'Prazos, provas, reuniões e palestras no mesmo calendário, com os feriados nacionais marcados.',
      rota: '/calendario',
    },
    {
      icone: Users,
      titulo: 'Membros',
      texto: comConta
        ? 'O organizador gerencia o grupo e chama a turma pelo botão Convidar, com um link ou um código.'
        : 'O organizador cadastra os membros e decide quem também organiza. Cada um pode editar o próprio perfil.',
      rota: '/membros',
    },
    {
      icone: Trophy,
      titulo: 'Conquistas',
      texto: 'Concluir atividades dá experiência, mantém a ofensiva de dias seguidos e desbloqueia conquistas.',
      rota: '/conquistas',
    },
  ];
}

function lerVisto() {
  try {
    return localStorage.getItem(CHAVE) === 'sim';
  } catch {
    return true;
  }
}

export function TutorialProvider({ children }) {
  const { modo } = useData();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);
  const [visto, setVisto] = useState(lerVisto);
  const lista = useMemo(() => passos(modo === 'conta'), [modo]);

  const marcarVisto = useCallback(() => {
    try {
      localStorage.setItem(CHAVE, 'sim');
    } catch {
      /* sem armazenamento, o convite volta na próxima visita */
    }
    setVisto(true);
  }, []);

  const abrirTutorial = useCallback(() => {
    setPasso(0);
    setAberto(true);
    marcarVisto();
  }, [marcarVisto]);

  const atual = lista[passo];
  const Icone = atual.icone;
  const ultimo = passo === lista.length - 1;

  const valor = useMemo(() => ({ visto, abrirTutorial, dispensar: marcarVisto }), [visto, abrirTutorial, marcarVisto]);

  return (
    <TutorialContext.Provider value={valor}>
      {children}
      <Dialogo
        aberto={aberto}
        aoMudar={setAberto}
        titulo="Conheça o Vértice"
        descricao={`Passo ${passo + 1} de ${lista.length}`}
        largura={480}
        rodape={
          <>
            {passo > 0 && (
              <Button variante="secundaria" onClick={() => setPasso((p) => p - 1)}>
                <ArrowLeft aria-hidden="true" />
                Anterior
              </Button>
            )}
            {ultimo ? (
              <Button onClick={() => setAberto(false)}>Terminar</Button>
            ) : (
              <Button onClick={() => setPasso((p) => p + 1)}>
                Próximo
                <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primaria-barra/10 text-primaria-texto">
              <Icone className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-forte">{atual.titulo}</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-texto">{atual.texto}</p>
          <Button
            variante="link"
            className="self-start"
            onClick={() => {
              setAberto(false);
              navigate(atual.rota);
            }}
          >
            Abrir esta tela
          </Button>
          <div className="flex justify-center gap-1.5" aria-hidden="true">
            {lista.map((p, i) => (
              <span key={p.titulo} className={cn('h-1.5 rounded-full transition-all', i === passo ? 'w-5 bg-primaria' : 'w-1.5 bg-borda')} />
            ))}
          </div>
        </div>
      </Dialogo>
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial precisa ser usado dentro de <TutorialProvider>.');
  return ctx;
}

/** Convite discreto no painel, só até a pessoa abrir ou dispensar. */
export function ConviteTutorial() {
  const { visto, abrirTutorial, dispensar } = useTutorial();
  if (visto) return null;
  return (
    <section
      aria-label="Tutorial"
      className="flex flex-col gap-3 rounded-2xl border border-primaria-barra/30 bg-primaria-barra/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <Compass className="size-5 shrink-0 text-primaria-texto" aria-hidden="true" />
        <p className="text-[14px] text-texto">
          <strong className="font-semibold text-forte">Primeira vez por aqui?</strong> Veja em um minuto o que dá para fazer.
        </p>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button tamanho="sm" onClick={abrirTutorial}>
          Ver tutorial
        </Button>
        <Button variante="fantasma" tamanho="icone-sm" aria-label="Dispensar o tutorial" onClick={dispensar}>
          <X />
        </Button>
      </div>
    </section>
  );
}

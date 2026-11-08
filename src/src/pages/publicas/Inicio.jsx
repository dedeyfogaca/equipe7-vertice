import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { temBanco } from '../../lib/supabase.js';
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  Check,
  ChartColumn,
  Copy,
  Layers,
  Link2,
  PenLine,
  Plus,
  Trophy,
} from 'lucide-react';

import { useTitulo } from '../../hooks/useTitulo.js';
import { LayoutPublico } from '../../components/layout/LayoutPublico.jsx';
import { Contador, Revelar, usePonteiro, useVisivel } from '../../components/publicas/movimento.jsx';
import { SecaoFeedback } from '../../components/feedback/SecaoFeedback.jsx';
import { Button } from '../../components/ui/botao.jsx';
import { Badge } from '../../components/ui/basicos.jsx';
import { cn, corComAlfa } from '../../lib/utils.js';
import avatarAndrey from '../../assets/avatar-andrey.webp';
import avatarMatheus from '../../assets/avatar-matheus.webp';

// Página inicial (pública). Apresenta o Vértice para quem ainda não usa.
//
// Desde 06/11/2026 ela se mexe: o topo entra em cascata e acende em volta do
// mouse, a prévia inclina com o ponteiro e as barras enchem quando aparecem,
// e cada cartão de funcionalidade mostra uma demonstração curta ao passar o
// mouse (no celular, quando o cartão aparece na tela).

const PASSOS = [
  { titulo: 'Crie o grupo', texto: 'Dê um nome ao grupo e cadastre quem estuda com você.' },
  { titulo: 'Monte as disciplinas', texto: 'Cada uma com a sua cor. Conteúdos, só se o grupo quiser.' },
  { titulo: 'Cadastre as atividades', texto: 'Com prazo, peso e responsável. Provas e palestras viram eventos.' },
  { titulo: 'Conclua e acompanhe', texto: 'A barra da disciplina sobe na hora, e a experiência também.' },
];

const PERGUNTAS = [
  {
    pergunta: 'Como eu entro num grupo?',
    resposta:
      'Com a sua conta, de e-mail ou do Google. Quem organiza o grupo manda um link ou um código de convite, e quem recebe cai direto no grupo certo.',
  },
  {
    pergunta: 'Como o progresso é calculado?',
    resposta:
      'Pelo peso. Uma disciplina com 6 pontos de atividades, das quais 3 já concluídas, está em 50%. Atividade fácil e atividade difícil não valem a mesma coisa.',
  },
  {
    pergunta: 'Preciso dividir as disciplinas em conteúdos?',
    resposta:
      'Não. A atividade fica direto na disciplina. Os conteúdos (como "SQL" dentro de Banco de Dados) são opcionais, para quem quer ver o progresso por assunto.',
  },
  {
    pergunta: 'Dá para marcar prova e palestra?',
    resposta:
      'Dá. Prova, palestra, apresentação e reunião entram como eventos do grupo, com dia, horário e local, e aparecem no calendário junto com as entregas.',
  },
  {
    pergunta: 'Funciona no celular?',
    resposta: 'Sim. O Vértice abre no navegador do celular, do tablet ou do computador, sem instalar nada.',
  },
  {
    pergunta: 'Onde ficam os dados do grupo?',
    resposta:
      'Num banco de dados na nuvem. Cada pessoa entra com a própria conta, de qualquer aparelho, e o grupo inteiro vê as mesmas disciplinas, atividades e eventos.',
  },
  {
    pergunta: 'Dá para testar sem criar conta?',
    resposta:
      'Dá. Na tela de entrar, "Experimentar sem conta" abre um grupo de exemplo já preenchido. Nesse modo, os dados ficam só no seu navegador.',
  },
];

const PREVIA_DISCIPLINAS = [
  { nome: 'Banco de Dados', cor: '#3b82f6', pct: 50 },
  { nome: 'Engenharia de Software', cor: '#f97316', pct: 72 },
  { nome: 'Front-End', cor: '#14b8a6', pct: 35 },
];

/** Junta duas refs (a do movimento do mouse e a da entrada na tela). */
function useRefs(...refs) {
  return useCallback(
    (el) =>
      refs.forEach((ref) => {
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}

// Etiqueta da prévia, no mesmo desenho das etiquetas do calendário.
function EtiquetaPrevia({ cor, children, visivel, atraso }) {
  return (
    <span
      className={cn(
        'rounded-[7px] border-l-[3px] px-2.5 py-1 text-[13px] font-medium text-texto transition-[opacity,translate] duration-500',
        visivel ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'
      )}
      style={{ borderLeftColor: cor, background: corComAlfa(cor, 'var(--alfa-etiqueta)'), transitionDelay: `${atraso}ms` }}
    >
      {children}
    </span>
  );
}

function Previa() {
  const ponteiro = usePonteiro();
  const [refVisivel, visivel] = useVisivel({ threshold: 0.25 });
  const ref = useRefs(ponteiro, refVisivel);
  // Passar o mouse no "Atividade concluída" repete o +30 XP.
  const [repeticao, setRepeticao] = useState(0);

  return (
    <section aria-label="Prévia do sistema" className="mx-auto max-w-[1120px] px-6 pb-24 pt-6">
      <div
        ref={ref}
        className="inclinar brilho-ponteiro entrada rounded-[28px] border border-borda bg-superficie p-3 shadow-[0_40px_120px_-48px_rgb(16_24_40/0.35)] dark:shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)]"
        style={{ '--atraso': '420ms' }}
      >
        <div className="grid gap-5 rounded-[20px] border border-borda bg-fundo p-5 sm:p-7 md:grid-cols-2">
          <div className="flex flex-col gap-[18px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-sutil">
                Progresso por disciplina
              </span>
              <span className="text-[13px] text-apagado">Turma de ADS</span>
            </div>
            {PREVIA_DISCIPLINAS.map((d, i) => (
              <div
                key={d.nome}
                className="-mx-2 flex flex-col gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-superficie-2"
              >
                <div className="flex justify-between gap-3 text-[15px]">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-[3px]" style={{ background: d.cor }} />
                    {d.nome}
                  </span>
                  <Contador valor={d.pct} ativo={visivel} sufixo="%" className="numero font-bold" />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-superficie-3">
                  <div
                    className="h-2 origin-left rounded-full transition-[scale] duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
                    style={{
                      width: `${d.pct}%`,
                      background: d.cor,
                      scale: visivel ? '1 1' : '0 1',
                      transitionDelay: `${150 + i * 120}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3.5">
            <div
              onPointerEnter={() => setRepeticao((n) => n + 1)}
              className="relative flex items-center gap-3.5 rounded-2xl border border-borda-forte bg-superficie px-[18px] py-4 transition-colors hover:border-concluido/40"
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl bg-concluido-bg transition-[scale] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  visivel ? 'scale-100' : 'scale-50'
                )}
                style={{ transitionDelay: '500ms' }}
              >
                <Check className="size-5 text-concluido" strokeWidth={2.4} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="text-[15px] font-semibold">Atividade concluída</strong>
                <span className="text-[13px] text-sutil">Modelagem foi de 0% para 75%</span>
              </span>
              <span className="numero font-bold text-gam">+30 XP</span>
              {repeticao > 0 && (
                <span
                  key={repeticao}
                  aria-hidden="true"
                  className="xp-sobe numero pointer-events-none absolute -top-3 right-5 rounded-full bg-gam/15 px-2 py-0.5 text-[12px] font-bold text-gam"
                >
                  +30 XP
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5 rounded-2xl border border-borda px-[18px] py-4 transition-colors hover:border-borda-forte">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil">Ofensiva</span>
                <span className="text-[28px] font-semibold tracking-[-0.03em]">
                  <Contador valor={6} ativo={visivel} duracao={700} /> dias
                </span>
              </div>
              <div className="flex flex-col gap-1.5 rounded-2xl border border-borda px-[18px] py-4 transition-colors hover:border-gam/40">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil">Experiência</span>
                <span className="text-[28px] font-semibold tracking-[-0.03em] text-gam">
                  <Contador valor={420} ativo={visivel} duracao={1300} /> XP
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-borda px-[18px] py-3.5">
              <span className="mr-1 text-[13px] text-sutil">Esta semana</span>
              <EtiquetaPrevia cor="#3b82f6" visivel={visivel} atraso={700}>
                Qua · Normalizar tabelas
              </EtiquetaPrevia>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[7px] border border-borda-forte bg-superficie px-2 py-1 text-[13px] font-semibold text-forte transition-[opacity,translate] duration-500',
                  visivel ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'
                )}
                style={{ transitionDelay: '820ms' }}
              >
                <PenLine className="size-3.5 text-[#3b82f6]" aria-hidden="true" />
                Qui · Prova de BD
              </span>
              <EtiquetaPrevia cor="#f97316" visivel={visivel} atraso={940}>
                Sex · Casos de teste
              </EtiquetaPrevia>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- Demonstrações dos cartões de funcionalidade -----
// Cada uma tem um estado parado e um "em ação" (variante `demo:`).

function MolduraDemo({ children, className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex h-[92px] flex-col justify-center gap-2.5 rounded-2xl border border-borda bg-fundo px-4', className)}
    >
      {children}
    </div>
  );
}

function DemoPeso() {
  const blocos = [
    { peso: 5, cor: '#3b82f6' },
    { peso: 3, cor: '#3b82f6' },
    { peso: 2, cor: '#3b82f6' },
  ];
  return (
    <MolduraDemo>
      <div className="flex gap-1.5">
        {blocos.map((b, i) => (
          <span key={i} className="h-3 overflow-hidden rounded-full bg-superficie-3" style={{ flexGrow: b.peso }}>
            <span
              className="block h-full origin-left scale-x-0 rounded-full transition-[scale] duration-500 ease-out demo:scale-x-100"
              style={{ background: b.cor, transitionDelay: `${i * 160}ms` }}
            />
          </span>
        ))}
      </div>
      <div className="relative flex justify-between text-[12px] text-sutil">
        <span>Pesos 5 + 3 + 2</span>
        <span className="relative">
          <span className="numero transition-opacity duration-300 demo:opacity-0">0 de 10</span>
          <span className="numero absolute right-0 top-0 whitespace-nowrap font-semibold text-forte opacity-0 transition-opacity delay-300 duration-300 demo:opacity-100">
            10 de 10
          </span>
        </span>
      </div>
    </MolduraDemo>
  );
}

function DemoCalendario() {
  const marcados = { 1: '#f59e0b', 3: '#3b82f6', 5: '#ec4899' };
  return (
    <MolduraDemo className="px-3">
      <div className="grid grid-cols-7 gap-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-apagado">{d}</span>
            <span className="relative flex h-9 w-full items-start justify-center rounded-md bg-superficie-2 pt-1 text-[10px] text-sutil">
              {12 + i}
              {marcados[i] && (
                <span
                  className="absolute inset-x-1 bottom-1 h-1.5 translate-y-1 rounded-full opacity-0 transition-[opacity,translate] duration-300 demo:translate-y-0 demo:opacity-100"
                  style={{ background: marcados[i], transitionDelay: `${i * 70}ms` }}
                />
              )}
            </span>
          </span>
        ))}
      </div>
    </MolduraDemo>
  );
}

function DemoEvento() {
  return (
    <MolduraDemo>
      <div className="flex items-center gap-3 rounded-xl border border-borda-forte bg-superficie px-3 py-2 transition-[translate,opacity] duration-500 ease-out translate-x-2 opacity-70 demo:translate-x-0 demo:opacity-100">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#3b82f6]/15 text-[#3b82f6]">
          <PenLine className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold text-forte">Prova de BD</span>
          <span className="text-[11px] text-sutil">Qui, 19:00 · Sala 204</span>
        </span>
        <span className="numero scale-75 rounded-full bg-primaria-barra/12 px-2 py-0.5 text-[11px] font-semibold text-primaria-texto opacity-0 transition-[scale,opacity] delay-200 duration-300 demo:scale-100 demo:opacity-100">
          em 2 dias
        </span>
      </div>
    </MolduraDemo>
  );
}

function DemoExperiencia() {
  return (
    <MolduraDemo className="flex-row items-center justify-between">
      <span className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gam/15 text-gam transition-[rotate,scale] duration-500 demo:-rotate-6 demo:scale-110">
          <Trophy className="size-5" />
        </span>
        <span className="relative text-[22px] font-semibold tracking-[-0.03em] text-gam">
          <span className="numero transition-opacity duration-200 demo:opacity-0">120</span>
          <span className="numero absolute left-0 top-0 opacity-0 transition-opacity delay-300 duration-200 demo:opacity-100">
            150
          </span>
          <span className="numero"> XP</span>
        </span>
      </span>
      <span className="numero translate-y-2 rounded-full bg-gam/15 px-2.5 py-1 text-[12px] font-bold text-gam opacity-0 transition-[opacity,translate] duration-500 demo:-translate-y-1 demo:opacity-100">
        +30
      </span>
    </MolduraDemo>
  );
}

function DemoConteudo() {
  return (
    <MolduraDemo>
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-borda-forte bg-superficie px-2.5 py-1 font-medium text-forte">
          <span className="size-2 rounded-[2px] bg-[#3b82f6]" />
          Banco de Dados
        </span>
        <span className="text-apagado">›</span>
        <span className="rounded-full border border-dashed border-borda-forte px-2.5 py-1 text-apagado transition-[border-color,color,translate] duration-300 demo:translate-x-0.5 demo:border-solid demo:border-primaria-barra/60 demo:text-forte">
          SQL
        </span>
      </div>
      <span className="text-[12px] text-sutil">
        Conteúdo <span className="transition-colors duration-300 demo:text-primaria-texto">se quiser</span>
      </span>
    </MolduraDemo>
  );
}

function DemoConvite() {
  return (
    <MolduraDemo>
      <div className="flex items-center gap-2 rounded-xl border border-borda bg-superficie px-3 py-2">
        <Link2 className="size-4 shrink-0 text-sutil" />
        <span className="numero min-w-0 flex-1 truncate text-[12px] text-texto">vertice.app/convite/7KQ2</span>
        <span className="relative size-4 shrink-0">
          <Copy className="absolute inset-0 size-4 text-sutil transition-[opacity,scale] duration-200 demo:scale-50 demo:opacity-0" />
          <Check className="absolute inset-0 size-4 scale-50 text-concluido opacity-0 transition-[opacity,scale] delay-150 duration-200 demo:scale-100 demo:opacity-100" />
        </span>
      </div>
      <span className="text-[12px] text-sutil">Quem recebe entra com Google ou e-mail.</span>
    </MolduraDemo>
  );
}

const FUNCIONALIDADES = [
  {
    icone: ChartColumn,
    titulo: 'Progresso por peso',
    texto: 'Cada atividade vale de 1 a 5. O progresso é o peso concluído sobre o total, não uma contagem de itens.',
    demo: DemoPeso,
  },
  {
    icone: CalendarDays,
    titulo: 'Calendário do grupo',
    texto: 'As entregas do mês num só lugar, cada uma na cor da sua disciplina, com os feriados marcados.',
    demo: DemoCalendario,
  },
  {
    icone: CalendarClock,
    titulo: 'Provas e eventos',
    texto: 'Prova, palestra, apresentação, reunião: com dia, horário e local, direto no calendário de todo mundo.',
    demo: DemoEvento,
  },
  {
    icone: Trophy,
    titulo: 'Experiência e conquistas',
    texto: 'Concluir rende experiência. Estudar em dias seguidos mantém a ofensiva, e os marcos viram conquistas.',
    demo: DemoExperiencia,
    gam: true,
  },
  {
    icone: Layers,
    titulo: 'Do jeito do grupo',
    texto: 'A atividade fica na disciplina. Quer ver por assunto? Divida em conteúdos. Não quer? Não precisa.',
    demo: DemoConteudo,
  },
  {
    icone: Link2,
    titulo: 'Grupo por convite',
    texto: 'O organizador manda um link ou código, e quem recebe já cai no grupo certo.',
    demo: DemoConvite,
    // Sem o banco configurado, o convite não existe: o cartão avisa.
    emBreve: !temBanco,
  },
];

function CartaoFuncionalidade({ icone: Icone, titulo, texto, demo: Demo, gam, emBreve, atraso }) {
  const ponteiro = usePonteiro();
  const [refVisivel, visivel] = useVisivel();
  const ref = useRefs(ponteiro, refVisivel);

  return (
    <article
      ref={ref}
      data-revelar={visivel ? 'sim' : 'nao'}
      style={{ '--atraso': `${atraso}ms` }}
      className="revelar brilho-ponteiro group flex flex-col gap-4 rounded-[22px] border border-borda bg-superficie p-6 transition-[border-color,box-shadow] duration-300 hover:border-borda-forte hover:shadow-[0_24px_60px_-36px_rgb(0_0_0/0.6)]"
    >
      <Demo />
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2.5">
          <Icone
            className={cn('size-[19px] shrink-0', gam ? 'text-gam' : 'text-primaria')}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-forte">{titulo}</h3>
          {emBreve && (
            <Badge tom="contorno" className="ml-auto">
              Em breve
            </Badge>
          )}
        </div>
        <p className="text-[15px] leading-relaxed text-sutil">{texto}</p>
      </div>
    </article>
  );
}

function CabecalhoSecao({ rotulo, titulo, centro = false }) {
  return (
    <Revelar
      className={centro ? 'flex flex-col items-center gap-3.5 text-center' : 'flex max-w-[720px] flex-col gap-3.5'}
    >
      <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-primaria">{rotulo}</span>
      <h2 className="text-[clamp(32px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.04em] text-forte">
        {titulo}
      </h2>
    </Revelar>
  );
}

// Os quatro passos, ligados por uma linha que enche quando a seção aparece.
function Passos() {
  const [ref, visivel] = useVisivel({ threshold: 0.3 });
  return (
    <div ref={ref} className="relative">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-px bg-borda-forte lg:block" />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 hidden h-px origin-left bg-primaria-barra transition-[scale] duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)] lg:block"
        style={{ scale: visivel ? '1 1' : '0 1' }}
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map(({ titulo, texto }, i) => (
          <li
            key={titulo}
            className={cn(
              'group flex flex-col gap-2.5 border-t border-borda-forte pt-5 transition-[opacity,translate] duration-700 lg:border-t-0',
              visivel ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            )}
            style={{ transitionDelay: `${200 + i * 260}ms` }}
          >
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  'numero flex size-7 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-500',
                  visivel ? 'border-primaria-barra bg-primaria-barra/12 text-primaria-texto' : 'border-borda-forte text-sutil'
                )}
                style={{ transitionDelay: `${300 + i * 260}ms` }}
              >
                {i + 1}
              </span>
            </span>
            <strong className="text-[19px] font-semibold tracking-[-0.02em] text-forte transition-colors group-hover:text-primaria-texto">
              {titulo}
            </strong>
            <span className="text-[15px] leading-relaxed text-sutil">{texto}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Rosto da equipe no círculo: a ilustração é de meio corpo (600 × 600), então
// o círculo mostra só a cabeça e os ombros, alinhados pelo topo, com a cabeça
// inteira. `centroX` é onde fica o meio do rosto na imagem original.
const LADO_ROSTO = 96;
const RECORTE_ROSTO = 400;
function RostoEquipe({ foto, alt, centroX, fundo, className }) {
  const escala = LADO_ROSTO / RECORTE_ROSTO;
  return (
    <span
      className={cn(
        'relative block size-24 shrink-0 overflow-hidden rounded-full border-[3px] border-superficie transition-[translate,rotate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        fundo,
        className
      )}
    >
      <img
        src={foto}
        alt={alt}
        width={600 * escala}
        height={600 * escala}
        className="absolute max-w-none"
        style={{ left: -(centroX - RECORTE_ROSTO / 2) * escala - 3, top: 25 * escala - 3 }}
      />
    </span>
  );
}

function Topo() {
  const ref = usePonteiro();
  return (
    <section
      ref={ref}
      className="grade-ponteiro mx-auto flex max-w-[1200px] flex-col items-center gap-7 px-6 pb-12 pt-20 text-center sm:pt-24"
    >
      <span
        className="entrada inline-flex items-center gap-2 rounded-full border border-borda bg-fundo/60 px-3.5 py-[7px] text-[12px] font-semibold uppercase tracking-[0.14em] text-sutil backdrop-blur-sm"
        style={{ '--atraso': '0ms' }}
      >
        <span aria-hidden="true" className="relative flex size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-primaria opacity-60 [animation-duration:2.4s]" />
          <span className="relative size-1.5 rounded-full bg-primaria" />
        </span>
        Para grupos de estudo
      </span>
      <h1
        className="entrada max-w-[980px] text-[clamp(42px,6.4vw,88px)] font-semibold leading-[1.02] tracking-[-0.045em] text-forte"
        style={{ '--atraso': '80ms' }}
      >
        Veja o quanto você já <span className="sublinhado-progresso text-primaria">avançou</span> em cada matéria.
      </h1>
      <p
        className="entrada max-w-[640px] text-[17px] leading-relaxed text-suave sm:text-[19px]"
        style={{ '--atraso': '180ms' }}
      >
        Organize disciplinas, atividades e provas com o seu grupo. Cada entrega concluída move a barra de progresso,
        e você enxerga quanto da matéria já cobriu, não só o que falta.
      </p>
      <div className="entrada mt-1 flex flex-wrap justify-center gap-3" style={{ '--atraso': '260ms' }}>
        <Button asChild variante="contraste" tamanho="lg" className="group">
          <Link to="/entrar">
            Começar agora
            <ArrowRight aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variante="secundaria" tamanho="lg">
          <a href="#como-funciona">Ver como funciona</a>
        </Button>
      </div>
      <p className="entrada text-sm text-apagado" style={{ '--atraso': '340ms' }}>
        Sem instalar nada: funciona no navegador do celular e do computador.
      </p>
    </section>
  );
}

export default function Inicio() {
  useTitulo(null);

  return (
    <LayoutPublico>
      <div className="bg-[radial-gradient(60%_42%_at_50%_0%,rgb(8_145_178/0.12),transparent_72%)] dark:bg-[radial-gradient(60%_42%_at_50%_0%,rgb(34_211_238/0.13),transparent_72%)]">
        <Topo />
        <Previa />
      </div>

      <section id="funcionalidades" className="mx-auto flex max-w-[1200px] scroll-mt-20 flex-col gap-10 px-6 py-16">
        <CabecalhoSecao rotulo="Funcionalidades" titulo="Tudo o que o grupo precisa para estudar com rumo." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONALIDADES.map((f, i) => (
            <CartaoFuncionalidade key={f.titulo} {...f} atraso={(i % 3) * 90} />
          ))}
        </div>
      </section>

      <section id="como-funciona" className="mx-auto flex max-w-[1200px] scroll-mt-20 flex-col gap-10 px-6 py-16">
        <CabecalhoSecao rotulo="Como funciona" titulo="Quatro passos, e a barra começa a andar." />
        <Passos />
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <Revelar className="group flex flex-wrap items-center gap-8 rounded-[28px] border border-borda bg-superficie p-7 transition-colors hover:border-borda-forte sm:p-10">
          <div className="flex">
            <RostoEquipe
              foto={avatarAndrey}
              alt="Avatar do Andrey"
              centroX={270}
              fundo="bg-[#cdeff6] dark:bg-[#0e2a33]"
              className="group-hover:-translate-x-1 group-hover:-rotate-3"
            />
            <RostoEquipe
              foto={avatarMatheus}
              alt="Avatar do Matheus"
              centroX={300}
              fundo="bg-[#e0efc9] dark:bg-[#18240f]"
              className="-ml-[18px] group-hover:translate-x-1 group-hover:rotate-3"
            />
          </div>
          <div className="flex min-w-[260px] flex-1 flex-col gap-2.5">
            <h2 className="text-[clamp(26px,3vw,36px)] font-semibold leading-[1.1] tracking-[-0.035em] text-forte">
              Feito por estudantes, para estudantes.
            </h2>
            <p className="text-base leading-relaxed text-sutil">
              O Vértice nasceu de um problema nosso: muita entrega, pouca noção de quanto já tínhamos avançado.
            </p>
          </div>
          <Button asChild variante="secundaria" className="group/botao">
            <Link to="/sobre">
              Conheça nossa história
              <ArrowRight aria-hidden="true" className="transition-transform duration-300 group-hover/botao:translate-x-1" />
            </Link>
          </Button>
        </Revelar>
      </section>

      <SecaoFeedback />

      <section id="perguntas" className="mx-auto flex max-w-[860px] scroll-mt-20 flex-col gap-8 px-6 py-16">
        <CabecalhoSecao rotulo="Perguntas" titulo="Antes de começar" centro />
        <div className="flex flex-col gap-2.5">
          {PERGUNTAS.map(({ pergunta, resposta }, i) => (
            <Revelar
              as="details"
              key={pergunta}
              atraso={i * 60}
              open={i === 0}
              className="group/pergunta rounded-[18px] border border-borda bg-superficie px-6 py-5 transition-colors hover:border-borda-forte"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-forte [&::-webkit-details-marker]:hidden">
                {pergunta}
                <Plus
                  aria-hidden="true"
                  className="size-5 shrink-0 text-sutil transition-transform duration-300 group-open/pergunta:rotate-45"
                />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-sutil">{resposta}</p>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-16">
        <Revelar className="group relative flex flex-col items-center gap-5 overflow-hidden rounded-[32px] bg-primaria px-6 py-16 text-center text-primaria-fg sm:px-10">
          {/* Reflexo que atravessa o bloco ao passar o mouse. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 transition-[translate,opacity] duration-[1100ms] ease-out group-hover:translate-x-[420%] group-hover:opacity-100"
          />
          <h2 className="relative text-[clamp(32px,4.4vw,56px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Comece hoje com o seu grupo.
          </h2>
          <p className="relative max-w-[520px] text-[17px] leading-relaxed text-primaria-fg/80">
            Crie o grupo, cadastre as disciplinas e veja a primeira barra subir ainda nesta semana.
          </p>
          <Link
            to="/entrar"
            className="group/cta relative inline-flex items-center gap-2 rounded-full bg-white px-[26px] py-[15px] text-base font-semibold text-[#0b1220] shadow-[0_12px_30px_-12px_rgb(4_18_26/0.6)] transition-transform hover:-translate-y-px focus-visible:outline-white dark:bg-[#04121a] dark:text-white dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_30px_-12px_rgb(4_18_26/0.8)] dark:focus-visible:outline-[#04121a]"
          >
            Criar meu grupo
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden="true" />
          </Link>
        </Revelar>
      </section>
    </LayoutPublico>
  );
}

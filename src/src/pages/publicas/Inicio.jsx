import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, ChartColumn, Link2, Plus, Trophy } from 'lucide-react';

import { useTitulo } from '../../hooks/useTitulo.js';
import { LayoutPublico } from '../../components/layout/LayoutPublico.jsx';
import { Button } from '../../components/ui/botao.jsx';
import { Badge } from '../../components/ui/basicos.jsx';
import { cn, corComAlfa } from '../../lib/utils.js';
import avatarAndrey from '../../assets/avatar-andrey.webp';
import avatarMatheus from '../../assets/avatar-matheus.webp';

// Página inicial (pública). Apresenta o Vértice para quem ainda não usa.

const FUNCIONALIDADES = [
  {
    icone: ChartColumn,
    titulo: 'Progresso por peso',
    texto: 'Cada atividade vale de 1 a 5. O progresso é o peso concluído sobre o total, e não uma contagem de itens.',
  },
  {
    icone: CalendarDays,
    titulo: 'Calendário do grupo',
    texto: 'Todas as entregas do mês num só lugar, cada uma na cor da sua disciplina, com os feriados marcados.',
  },
  {
    icone: Trophy,
    titulo: 'Experiência e conquistas',
    texto: 'Concluir rende experiência. Estudar em dias seguidos mantém a ofensiva, e os marcos viram conquistas.',
    gam: true,
  },
  {
    icone: Link2,
    titulo: 'Grupo por convite',
    texto: 'O organizador envia um link ou código. Quem recebe entra com Google ou e-mail e já cai no grupo.',
    emBreve: true,
  },
];

const PASSOS = [
  { titulo: 'Crie o grupo', texto: 'Dê um nome ao grupo e cadastre quem estuda com você.' },
  { titulo: 'Monte as disciplinas', texto: 'Cada disciplina com a sua cor e os seus conteúdos.' },
  { titulo: 'Cadastre as atividades', texto: 'Com conteúdo, prazo, peso e responsável.' },
  { titulo: 'Conclua e acompanhe', texto: 'O progresso do conteúdo e da disciplina sobe na hora.' },
];

const PERGUNTAS = [
  {
    pergunta: 'Como eu entro num grupo?',
    resposta:
      'Quem cria o grupo cadastra as outras pessoas, e cada uma escolhe o próprio nome ao entrar. Na próxima versão chegam o convite por link ou código e o login com Google ou e-mail.',
  },
  {
    pergunta: 'Como o progresso é calculado?',
    resposta:
      'Pelo peso. Uma disciplina com 6 pontos de atividades, das quais 3 já concluídas, está em 50%. Conteúdo sem atividade fica fora da conta.',
  },
  {
    pergunta: 'Toda atividade precisa de responsável?',
    resposta:
      'Sim. Toda atividade tem uma pessoa responsável: é ela quem marca a atividade como concluída e quem recebe a experiência por isso.',
  },
  {
    pergunta: 'Funciona no celular?',
    resposta: 'Sim. O Vértice abre no navegador do celular, do tablet ou do computador, sem instalar nada.',
  },
  {
    pergunta: 'Onde ficam os dados do grupo?',
    resposta:
      'Por enquanto, no navegador do aparelho em que o grupo usa o sistema. Na próxima versão eles passam para um banco de dados na nuvem, e cada pessoa acessa do próprio aparelho.',
  },
];

const PREVIA_DISCIPLINAS = [
  { nome: 'Banco de Dados', cor: '#3b82f6', pct: 50 },
  { nome: 'Engenharia de Software', cor: '#f97316', pct: 72 },
  { nome: 'Front-End', cor: '#14b8a6', pct: 35 },
];

// Etiqueta da prévia, no mesmo desenho das etiquetas do calendário.
function EtiquetaPrevia({ cor, children }) {
  return (
    <span
      className="rounded-[7px] border-l-[3px] px-2.5 py-1 text-[13px] font-medium text-texto"
      style={{ borderLeftColor: cor, background: corComAlfa(cor, 'var(--alfa-etiqueta)') }}
    >
      {children}
    </span>
  );
}

function Previa() {
  return (
    <section aria-label="Prévia do sistema" className="mx-auto max-w-[1120px] px-6 pb-24 pt-6">
      <div className="rounded-[28px] border border-borda bg-superficie p-3 shadow-[0_40px_120px_-48px_rgb(16_24_40/0.35)] dark:shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)]">
        <div className="grid gap-5 rounded-[20px] border border-borda bg-fundo p-5 sm:p-7 md:grid-cols-2">
          <div className="flex flex-col gap-[18px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-sutil">
                Progresso por disciplina
              </span>
              <span className="text-[13px] text-apagado">Turma de ADS</span>
            </div>
            {PREVIA_DISCIPLINAS.map((d) => (
              <div key={d.nome} className="flex flex-col gap-2">
                <div className="flex justify-between gap-3 text-[15px]">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-[3px]" style={{ background: d.cor }} />
                    {d.nome}
                  </span>
                  <span className="numero font-bold">{d.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-superficie-3">
                  <div className="h-2 rounded-full" style={{ width: `${d.pct}%`, background: d.cor }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3.5 rounded-2xl border border-borda-forte bg-superficie px-[18px] py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-concluido-bg">
                <Check className="size-5 text-concluido" strokeWidth={2.4} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <strong className="text-[15px] font-semibold">Atividade concluída</strong>
                <span className="text-[13px] text-sutil">Modelagem foi de 0% para 75%</span>
              </span>
              <span className="numero font-bold text-gam">+30 XP</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5 rounded-2xl border border-borda px-[18px] py-4">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil">Ofensiva</span>
                <span className="text-[28px] font-semibold tracking-[-0.03em]">6 dias</span>
              </div>
              <div className="flex flex-col gap-1.5 rounded-2xl border border-borda px-[18px] py-4">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil">Experiência</span>
                <span className="text-[28px] font-semibold tracking-[-0.03em] text-gam">420 XP</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-borda px-[18px] py-3.5">
              <span className="mr-1 text-[13px] text-sutil">Esta semana</span>
              <EtiquetaPrevia cor="#3b82f6">Qua · Normalizar tabelas</EtiquetaPrevia>
              <EtiquetaPrevia cor="#f97316">Sex · Casos de teste</EtiquetaPrevia>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CabecalhoSecao({ rotulo, titulo, centro = false }) {
  return (
    <div className={centro ? 'flex flex-col items-center gap-3.5 text-center' : 'flex max-w-[720px] flex-col gap-3.5'}>
      <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-primaria">{rotulo}</span>
      <h2 className="text-[clamp(32px,4vw,52px)] font-semibold leading-[1.05] tracking-[-0.04em] text-forte">
        {titulo}
      </h2>
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
      className={cn('relative block size-24 shrink-0 overflow-hidden rounded-full border-[3px] border-superficie', fundo, className)}
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

export default function Inicio() {
  useTitulo(null);

  return (
    <LayoutPublico>
      <div className="bg-[radial-gradient(60%_42%_at_50%_0%,rgb(8_145_178/0.12),transparent_72%)] dark:bg-[radial-gradient(60%_42%_at_50%_0%,rgb(34_211_238/0.13),transparent_72%)]">
        <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-7 px-6 pb-12 pt-20 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-borda px-3.5 py-[7px] text-[12px] font-semibold uppercase tracking-[0.14em] text-sutil">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primaria" />
            Para grupos de estudo
          </span>
          <h1 className="max-w-[980px] text-[clamp(42px,6.4vw,88px)] font-semibold leading-[1.02] tracking-[-0.045em] text-forte">
            Veja o quanto você já <span className="text-primaria">avançou</span> em cada matéria.
          </h1>
          <p className="max-w-[640px] text-[17px] leading-relaxed text-suave sm:text-[19px]">
            Organize disciplinas, conteúdos e atividades com o seu grupo. Cada entrega concluída move a barra de
            progresso, e você enxerga quanto da matéria já cobriu, não só o que falta.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            <Button asChild variante="contraste" tamanho="lg">
              <Link to="/entrar">
                Começar agora
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variante="secundaria" tamanho="lg">
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </div>
          <p className="text-sm text-apagado">Sem instalar nada: funciona no navegador do celular e do computador.</p>
        </section>

        <Previa />
      </div>

      <section id="funcionalidades" className="mx-auto flex max-w-[1200px] scroll-mt-20 flex-col gap-10 px-6 py-16">
        <CabecalhoSecao rotulo="Funcionalidades" titulo="Tudo o que o grupo precisa para estudar com rumo." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FUNCIONALIDADES.map(({ icone: Icone, titulo, texto, gam, emBreve }) => (
            <article
              key={titulo}
              className="flex flex-col gap-3.5 rounded-[22px] border border-borda bg-superficie p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={
                    gam
                      ? 'flex size-11 items-center justify-center rounded-[14px] bg-gam/15 text-gam'
                      : 'flex size-11 items-center justify-center rounded-[14px] bg-primaria/12 text-primaria'
                  }
                >
                  <Icone className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
                </span>
                {emBreve && <Badge tom="contorno">Em breve</Badge>}
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-forte">{titulo}</h3>
              <p className="text-[15px] leading-relaxed text-sutil">{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="mx-auto flex max-w-[1200px] scroll-mt-20 flex-col gap-10 px-6 py-16">
        <CabecalhoSecao rotulo="Como funciona" titulo="Quatro passos, e a barra começa a andar." />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map(({ titulo, texto }, i) => (
            <li key={titulo} className="flex flex-col gap-2.5 border-t border-borda-forte pt-5">
              <span className="numero text-sm text-primaria">{String(i + 1).padStart(2, '0')}</span>
              <strong className="text-[19px] font-semibold tracking-[-0.02em] text-forte">{titulo}</strong>
              <span className="text-[15px] leading-relaxed text-sutil">{texto}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-wrap items-center gap-8 rounded-[28px] border border-borda bg-superficie p-7 sm:p-10">
          <div className="flex">
            <RostoEquipe foto={avatarAndrey} alt="Avatar do Andrey" centroX={270} fundo="bg-[#cdeff6] dark:bg-[#0e2a33]" />
            <RostoEquipe
              foto={avatarMatheus}
              alt="Avatar do Matheus"
              centroX={300}
              fundo="bg-[#e0efc9] dark:bg-[#18240f]"
              className="-ml-[18px]"
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
          <Button asChild variante="secundaria">
            <Link to="/sobre">
              Conheça nossa história
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <section id="perguntas" className="mx-auto flex max-w-[860px] scroll-mt-20 flex-col gap-8 px-6 py-16">
        <CabecalhoSecao rotulo="Perguntas" titulo="Antes de começar" centro />
        <div className="flex flex-col gap-2.5">
          {PERGUNTAS.map(({ pergunta, resposta }, i) => (
            <details
              key={pergunta}
              open={i === 0}
              className="group rounded-[18px] border border-borda bg-superficie px-6 py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-forte [&::-webkit-details-marker]:hidden">
                {pergunta}
                <Plus
                  aria-hidden="true"
                  className="size-5 shrink-0 text-sutil transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-sutil">{resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-16">
        <div className="flex flex-col items-center gap-5 rounded-[32px] bg-primaria px-6 py-16 text-center text-primaria-fg sm:px-10">
          <h2 className="text-[clamp(32px,4.4vw,56px)] font-semibold leading-[1.02] tracking-[-0.045em]">
            Comece hoje com o seu grupo.
          </h2>
          <p className="max-w-[520px] text-[17px] leading-relaxed text-primaria-fg/80">
            Crie o grupo, cadastre as disciplinas e veja a primeira barra subir ainda nesta semana.
          </p>
          <Link
            to="/entrar"
            className="inline-flex items-center gap-2 rounded-full bg-white px-[26px] py-[15px] text-base font-semibold text-[#0b1220] shadow-[0_12px_30px_-12px_rgb(4_18_26/0.6)] transition-transform hover:-translate-y-px focus-visible:outline-white dark:bg-[#04121a] dark:text-white dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_12px_30px_-12px_rgb(4_18_26/0.8)] dark:focus-visible:outline-[#04121a]"
          >
            Criar meu grupo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </LayoutPublico>
  );
}

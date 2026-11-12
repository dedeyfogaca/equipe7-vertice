import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  ListChecks,
  Plus,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFeriados } from '../hooks/useFeriados.js';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Badge, Card, EmptyState, Rotulo } from '../components/ui/basicos.jsx';
import { Interruptor, Label } from '../components/ui/campos.jsx';
import { IconeOpcao, SelectRico } from '../components/ui/selecao.jsx';
import { opcoesDisciplinas, opcoesGrupos } from '../components/opcoes.jsx';
import { LinhaAtividade } from '../components/atividades/LinhaAtividade.jsx';
import { ProximosFeriados } from '../components/ProximosFeriados.jsx';
import { CartaoEvento } from '../components/eventos/CartaoEvento.jsx';
import { fimDoEvento, horarioDoEvento, iconeDoEvento } from '../components/eventos/tipos.jsx';
import { useEventos } from '../components/eventos/useEventos.jsx';
import { rotuloTipoEvento } from '../lib/constants.js';
import { STATUS } from '../lib/constants.js';
import { dataLocal, hojeISO, paraISO } from '../lib/datas.js';
import {
  DIAS_CURTOS,
  DIAS_LONGOS,
  MESES,
  ddmm,
  diaEMes,
  rotuloSituacao,
  tituloMes,
  tomDaAtividade,
} from '../lib/formatos.js';
import { estaAtrasada, situacaoDaAtividade, SITUACAO } from '../lib/situacoes.js';
import { cn, corComAlfa, plural, primeiroNome } from '../lib/utils.js';

// Calendário do grupo (RF20): as entregas de cada dia, na cor da disciplina,
// e os eventos (RF31: prova, palestra, reunião), como numa agenda. Três jeitos
// de ver (mês, semana e lista) e um painel com o dia escolhido. Trocar de mês
// (ou de semana) passa a página para o lado, pelos botões ou deslizando o
// dedo no celular.
//
// Filtros (revisão de 11/11/2026, as pessoas ficavam perdidas com a fileira
// de botões das disciplinas): uma barra só, com rótulos, para escolher o que
// aparece (atividades, eventos, feriados), a disciplina e "só as minhas"; ao
// lado, quanto está aparecendo e o atalho para limpar. O evento de vários
// dias aparece em todos os dias dele.

const VISOES = [
  { valor: 'mes', rotulo: 'Mês' },
  { valor: 'semana', rotulo: 'Semana' },
  { valor: 'lista', rotulo: 'Lista' },
];

// Dentro do dia, o que precisa de atenção vem primeiro.
const ORDEM_SITUACAO = {
  [SITUACAO.ATRASADAS]: 0,
  [SITUACAO.FAZENDO]: 1,
  [SITUACAO.A_FAZER]: 2,
  [SITUACAO.CONCLUIDAS]: 3,
};

function somarDias(data, dias) {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

function inicioDaSemana(data) {
  return somarDias(data, -data.getDay());
}

function primeiroDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

// Os dias do evento (o de vários dias aparece em cada um, até 62 dias).
function diasDoEvento(evento) {
  const dias = [];
  const fim = fimDoEvento(evento);
  for (let d = dataLocal(evento.data); d && paraISO(d) <= fim && dias.length < 62; d = somarDias(d, 1)) {
    dias.push(paraISO(d));
  }
  return dias;
}

/** Botão de ligar e desligar da barra de filtros. */
function Chip({ ligado, aoMudar, icone: Icone, children }) {
  return (
    <button
      type="button"
      aria-pressed={ligado}
      onClick={() => aoMudar(!ligado)}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
        ligado
          ? 'border-primaria-barra/50 bg-primaria-barra/10 text-forte'
          : 'border-borda bg-superficie text-sutil hover:border-borda-forte hover:text-texto'
      )}
    >
      {ligado ? (
        <Check className="size-3.5 text-primaria-texto" strokeWidth={2.6} aria-hidden="true" />
      ) : (
        <Icone className="size-3.5" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

const ANIMACAO = { proximo: 'animate-mes-proximo', anterior: 'animate-mes-anterior' };

// Deslizar o dedo para o lado troca a página do calendário. Só conta o gesto
// claramente horizontal, para não brigar com a rolagem da tela.
function useDeslizar(aoDeslizar) {
  const inicio = useRef(null);
  return {
    onTouchStart: (evento) => {
      const toque = evento.touches[0];
      inicio.current = evento.touches.length === 1 ? { x: toque.clientX, y: toque.clientY } : null;
    },
    onTouchEnd: (evento) => {
      const comeco = inicio.current;
      inicio.current = null;
      const toque = evento.changedTouches[0];
      if (!comeco || !toque) return;
      const dx = toque.clientX - comeco.x;
      const dy = toque.clientY - comeco.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) aoDeslizar(dx < 0 ? 1 : -1);
    },
  };
}

/** Etiqueta da entrega no quadro do mês e da semana. */
function Etiqueta({ item, inteira = false }) {
  const { atividade, disciplina } = item;
  const cor = disciplina?.cor || '#64748b';
  const concluida = atividade.status === STATUS.CONCLUIDO;
  return (
    <span
      className={cn(
        'block rounded-[7px] border-l-[3px] px-2 py-1 text-left text-[12px] font-medium leading-snug',
        inteira ? 'break-words' : 'truncate',
        concluida ? 'text-sutil' : 'text-texto',
        estaAtrasada(atividade) && 'ring-1 ring-inset ring-atrasada/55'
      )}
      style={{
        borderLeftColor: cor,
        background: corComAlfa(cor, concluida ? 'calc(var(--alfa-etiqueta) / 2)' : 'var(--alfa-etiqueta)'),
      }}
    >
      {atividade.titulo}
    </span>
  );
}

/** Etiqueta do evento: contorno em vez de faixa, com o ícone (e a hora, na semana). */
function EtiquetaEvento({ item, inteira = false }) {
  const { evento, disciplina, continuacao } = item;
  // Nos dias seguintes de um evento de vários dias, o ícone é o do período.
  const Icone = continuacao ? CalendarRange : iconeDoEvento(evento.tipo);
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-[7px] border border-borda-forte bg-superficie px-1.5 py-[3px] text-left text-[12px] font-semibold leading-snug text-forte',
        inteira ? 'items-start' : 'min-w-0'
      )}
    >
      <Icone
        aria-hidden="true"
        className="size-3.5 shrink-0"
        style={{ color: disciplina?.cor || 'var(--primaria-texto)' }}
        strokeWidth={2.2}
      />
      <span className={cn('min-w-0', inteira ? 'break-words' : 'truncate')}>
        {inteira && evento.horaInicio && !continuacao && (
          <span className="numero font-medium text-sutil">{evento.horaInicio} </span>
        )}
        {evento.titulo}
      </span>
    </span>
  );
}

function CartaoDoDia({ item, membros }) {
  const { atividade, disciplina, conteudo } = item;
  const responsavel = membros.find((m) => m.id === atividade.responsavelId);
  return (
    <li className="relative flex gap-3 rounded-2xl border border-borda p-3.5 transition-colors hover:border-borda-forte">
      <span
        aria-hidden="true"
        className="w-1 shrink-0 rounded-full"
        style={{ background: disciplina?.cor || 'var(--borda-forte)' }}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          to={`/atividade/${atividade.id}`}
          className="text-[15px] font-semibold text-forte after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:text-primaria-texto"
        >
          {atividade.titulo}
        </Link>
        <span className="text-[13px] text-sutil">
          {item.grupo ? `${item.grupo.nome}${disciplina ? ' · ' : ''}` : ''}
          {disciplina?.nome}
          {conteudo ? ` › ${conteudo.nome}` : ''}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge tom={tomDaAtividade(atividade)}>{rotuloSituacao(atividade)}</Badge>
          <Badge tom="neutro">Peso {atividade.peso}</Badge>
          {responsavel ? (
            <Badge tom="neutro">
              {primeiroNome(responsavel.nome)}
              {responsavel.saiuEm ? ' (saiu)' : ''}
            </Badge>
          ) : (
            !item.pessoal && <Badge tom="neutro">A definir</Badge>
          )}
        </span>
      </span>
    </li>
  );
}

export default function Calendario() {
  useTitulo('Calendário');
  const { grupoAtivo, membroAtivo, noEspacoPessoal } = useAuth();
  const { atividadesDoEspaco, disciplinasDoEspaco, eventosDoEspaco, trilhaDaAtividade, membros, grupos, meusMembros } =
    useData();
  const { novoEvento, menuDoEvento, janelas } = useEventos();

  // RF34: no espaço pessoal, as atividades que estão com a pessoa e os
  // eventos de todos os grupos dela.
  const atividades = atividadesDoEspaco(grupoAtivo.id);
  const disciplinas = disciplinasDoEspaco(grupoAtivo.id);
  const eventos = eventosDoEspaco(grupoAtivo.id);
  const espacos = noEspacoPessoal
    ? grupos.filter((g) => g.id === grupoAtivo.id || meusMembros.some((m) => m.grupoId === g.id && !g.pessoal))
    : [];
  const grupoDe = (item) =>
    item.grupoId !== grupoAtivo.id ? grupos.find((g) => g.id === item.grupoId && !g.pessoal) || null : null;

  const hoje = hojeISO();
  const [selecionado, setSelecionado] = useState(hoje);
  const [mesVisivel, setMesVisivel] = useState(() => primeiroDoMes(new Date()));
  const [visao, setVisao] = useState('mes');
  // Filtros: o que aparece, a disciplina, só as minhas (no grupo) e onde
  // (no espaço pessoal).
  const [mostrar, setMostrar] = useState({ atividades: true, eventos: true, feriados: true });
  const [fDisciplina, setFDisciplina] = useState('todas');
  const [soMinhas, setSoMinhas] = useState(false);
  const [fOnde, setFOnde] = useState('todos');
  const alternar = (chave) => (ligado) => setMostrar((atual) => ({ ...atual, [chave]: ligado }));
  const filtroAtivo =
    !mostrar.atividades || !mostrar.eventos || !mostrar.feriados || fDisciplina !== 'todas' || soMinhas || fOnde !== 'todos';
  const limparFiltros = () => {
    setMostrar({ atividades: true, eventos: true, feriados: true });
    setFDisciplina('todas');
    setSoMinhas(false);
    setFOnde('todos');
  };
  // Para que lado a última troca de página andou (decide a animação).
  const [direcao, setDirecao] = useState(null);
  const painelRef = useRef(null);

  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();
  const dataSelecionada = dataLocal(selecionado);

  // As entregas que passam nos filtros, por dia.
  const porDia = useMemo(() => {
    const mapa = new Map();
    if (!mostrar.atividades) return mapa;
    atividades.forEach((atividade) => {
      if (!atividade.prazo) return;
      const { conteudo, disciplina } = trilhaDaAtividade(atividade);
      if (fDisciplina !== 'todas' && disciplina?.id !== fDisciplina) return;
      if (soMinhas && atividade.responsavelId !== membroAtivo?.id) return;
      if (fOnde !== 'todos' && atividade.grupoId !== fOnde) return;
      const grupo = grupoDe(atividade);
      const pessoal = grupos.find((g) => g.id === atividade.grupoId)?.pessoal;
      if (!mapa.has(atividade.prazo)) mapa.set(atividade.prazo, []);
      mapa.get(atividade.prazo).push({ atividade, conteudo, disciplina, grupo, pessoal });
    });
    mapa.forEach((lista) =>
      lista.sort(
        (a, b) =>
          ORDEM_SITUACAO[situacaoDaAtividade(a.atividade)] - ORDEM_SITUACAO[situacaoDaAtividade(b.atividade)] ||
          a.atividade.titulo.localeCompare(b.atividade.titulo, 'pt-BR')
      )
    );
    return mapa;
    // grupoDe e grupos mudam junto com as atividades e o espaço
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atividades, trilhaDaAtividade, mostrar.atividades, fDisciplina, soMinhas, fOnde, membroAtivo]);

  // Eventos por dia (já em ordem de horário). O de vários dias entra em cada
  // um deles; nos seguintes ao primeiro, como continuação.
  const eventosPorDia = useMemo(() => {
    const mapa = new Map();
    if (!mostrar.eventos) return mapa;
    eventos.forEach((evento) => {
      if (fDisciplina !== 'todas' && evento.disciplinaId !== fDisciplina) return;
      if (fOnde !== 'todos' && evento.grupoId !== fOnde) return;
      const disciplina = disciplinas.find((d) => d.id === evento.disciplinaId) || null;
      const grupo = grupoDe(evento);
      diasDoEvento(evento).forEach((iso) => {
        if (!mapa.has(iso)) mapa.set(iso, []);
        mapa.get(iso).push({ evento, disciplina, grupo, continuacao: iso !== evento.data });
      });
    });
    // No dia, o que começa ali vem antes da continuação.
    mapa.forEach((lista) => lista.sort((a, b) => Number(a.continuacao) - Number(b.continuacao)));
    return mapa;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos, disciplinas, mostrar.eventos, fDisciplina, fOnde]);

  // Quadro do mês: semanas completas, de domingo a sábado.
  const celulas = useMemo(() => {
    const inicio = inicioDaSemana(mesVisivel);
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const semanas = Math.ceil((mesVisivel.getDay() + ultimoDia) / 7);
    return Array.from({ length: semanas * 7 }, (_, i) => somarDias(inicio, i));
  }, [mesVisivel, ano, mes]);

  const diasDaSemana = useMemo(() => {
    const inicio = inicioDaSemana(dataSelecionada || new Date());
    return Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
  }, [dataSelecionada]);

  // Feriados dos anos que aparecem na tela, mais o ano que vem.
  const anos = useMemo(() => {
    const atual = new Date().getFullYear();
    return [
      ...new Set([atual, atual + 1, celulas[0].getFullYear(), celulas[celulas.length - 1].getFullYear(), ano]),
    ];
  }, [celulas, ano]);
  const { feriados, carregando, erro, feriadoEm: feriadoDoDia } = useFeriados(anos);
  // Com os feriados desligados no filtro, o quadro não os marca.
  const feriadoEm = (iso) => (mostrar.feriados ? feriadoDoDia(iso) : null);

  const escolherDia = (iso, { rolar = false } = {}) => {
    // Na semana, a página só vira quando a semana muda (escolher outro dia da
    // mesma semana não anima nada).
    if (visao === 'semana') {
      const de = paraISO(inicioDaSemana(dataSelecionada));
      const para = paraISO(inicioDaSemana(dataLocal(iso)));
      if (de !== para) setDirecao(para > de ? 'proximo' : 'anterior');
    }
    setSelecionado(iso);
    const data = dataLocal(iso);
    if (data && (data.getMonth() !== mes || data.getFullYear() !== ano)) {
      if (visao !== 'semana') setDirecao(data > mesVisivel ? 'proximo' : 'anterior');
      setMesVisivel(primeiroDoMes(data));
    }
    // No celular o painel do dia fica embaixo do quadro: leva a pessoa até ele.
    if (rolar && window.matchMedia('(max-width: 639px)').matches) {
      requestAnimationFrame(() => painelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const mudarMes = (passo) => {
    const novo = new Date(ano, mes + passo, 1);
    setDirecao(passo > 0 ? 'proximo' : 'anterior');
    setMesVisivel(novo);
    const hojeData = new Date();
    const temHoje = hojeData.getMonth() === novo.getMonth() && hojeData.getFullYear() === novo.getFullYear();
    setSelecionado(temHoje ? hoje : paraISO(novo));
  };

  const navegar = (passo) => {
    if (visao === 'semana') {
      escolherDia(paraISO(somarDias(dataSelecionada, passo * 7)));
    } else {
      mudarMes(passo);
    }
  };

  const irParaHoje = () => {
    const mesDeHoje = primeiroDoMes(new Date());
    if (visao === 'semana') {
      const de = paraISO(inicioDaSemana(dataSelecionada));
      const para = paraISO(inicioDaSemana(new Date()));
      if (de !== para) setDirecao(para > de ? 'proximo' : 'anterior');
    } else if (mesDeHoje.getTime() !== mesVisivel.getTime()) {
      setDirecao(mesDeHoje > mesVisivel ? 'proximo' : 'anterior');
    }
    setMesVisivel(mesDeHoje);
    setSelecionado(hoje);
  };

  const deslizar = useDeslizar(navegar);
  const animacao = ANIMACAO[direcao] ?? '';

  const doSelecionado = porDia.get(selecionado) || [];
  const eventosDoSelecionado = eventosPorDia.get(selecionado) || [];
  const feriadoSelecionado = feriadoEm(selecionado);

  // Lista do mês: os dias com entrega ou evento.
  const doMesEmLista = useMemo(() => {
    const prefixo = `${ano}-${String(mes + 1).padStart(2, '0')}-`;
    const dias = new Set([...porDia.keys(), ...eventosPorDia.keys()].filter((iso) => iso.startsWith(prefixo)));
    return [...dias].sort().map((iso) => [iso, porDia.get(iso) || [], eventosPorDia.get(iso) || []]);
  }, [porDia, eventosPorDia, ano, mes]);

  // Quanto está aparecendo (no mês, ou na semana), para a pessoa se situar.
  const resumo = useMemo(() => {
    const dentro =
      visao === 'semana'
        ? (iso) => iso >= paraISO(diasDaSemana[0]) && iso <= paraISO(diasDaSemana[6])
        : (iso) => iso.startsWith(`${ano}-${String(mes + 1).padStart(2, '0')}-`);
    let entregas = 0;
    porDia.forEach((lista, iso) => {
      if (dentro(iso)) entregas += lista.length;
    });
    const idsEventos = new Set();
    eventosPorDia.forEach((lista, iso) => {
      if (dentro(iso)) lista.forEach(({ evento }) => idsEventos.add(evento.id));
    });
    const quando = visao === 'semana' ? 'nesta semana' : `em ${MESES[mes]}`;
    return `${plural(entregas, 'entrega')} e ${plural(idsEventos.size, 'evento')} ${quando}`;
  }, [porDia, eventosPorDia, visao, diasDaSemana, ano, mes]);

  const semanaTexto =
    visao === 'semana'
      ? `Semana de ${ddmm(paraISO(diasDaSemana[0]))} a ${ddmm(paraISO(diasDaSemana[6]))}`
      : null;
  const rotuloAnterior = visao === 'semana' ? 'Semana anterior' : 'Mês anterior';
  const rotuloProximo = visao === 'semana' ? 'Próxima semana' : 'Próximo mês';
  const tituloAtual = visao === 'semana' && dataSelecionada
    ? tituloMes(dataSelecionada.getFullYear(), dataSelecionada.getMonth())
    : tituloMes(ano, mes);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <h1
              aria-live="polite"
              className="text-[clamp(26px,2.8vw,38px)] font-semibold leading-[1.1] tracking-[-0.04em] text-forte"
            >
              {tituloAtual}
            </h1>
            {semanaTexto && <span className="text-sm text-sutil">{semanaTexto}</span>}
          </div>
          <div className="flex gap-1.5">
            <Button variante="secundaria" tamanho="icone" className="size-[38px]" aria-label={rotuloAnterior} onClick={() => navegar(-1)}>
              <ChevronLeft />
            </Button>
            <Button variante="secundaria" tamanho="icone" className="size-[38px]" aria-label={rotuloProximo} onClick={() => navegar(1)}>
              <ChevronRight />
            </Button>
            <Button variante="secundaria" tamanho="sm" className="h-[38px]" onClick={irParaHoje}>
              Hoje
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div role="group" aria-label="Visualização" className="flex rounded-full border border-borda bg-superficie p-1">
            {VISOES.map(({ valor, rotulo }) => (
              <button
                key={valor}
                type="button"
                aria-pressed={visao === valor}
                onClick={() => {
                  setVisao(valor);
                  setDirecao(null);
                }}
                className={cn(
                  'rounded-full px-4 py-2 text-sm transition-colors',
                  visao === valor
                    ? 'bg-superficie-3 font-semibold text-forte'
                    : 'font-medium text-sutil hover:text-texto'
                )}
              >
                {rotulo}
              </button>
            ))}
          </div>
          <Button variante="secundaria" onClick={() => novoEvento(selecionado)}>
            <CalendarPlus aria-hidden="true" />
            Novo evento
          </Button>
          <Button asChild>
            <Link to={`/atividade/nova?prazo=${selecionado}`}>
              <Plus aria-hidden="true" />
              Nova atividade
            </Link>
          </Button>
        </div>
      </header>

      {/* Filtros: o que aparece, de qual disciplina e de quem. */}
      <Card
        as="section"
        aria-label="Filtros do calendário"
        className="flex flex-col gap-3 p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div role="group" aria-labelledby="f-mostrar" className="flex flex-wrap items-center gap-2">
            <Rotulo id="f-mostrar" className="mr-0.5">
              Mostrar
            </Rotulo>
            <Chip ligado={mostrar.atividades} aoMudar={alternar('atividades')} icone={ListChecks}>
              Atividades
            </Chip>
            <Chip ligado={mostrar.eventos} aoMudar={alternar('eventos')} icone={CalendarClock}>
              Eventos
            </Chip>
            <Chip ligado={mostrar.feriados} aoMudar={alternar('feriados')} icone={CalendarDays}>
              Feriados
            </Chip>
          </div>
          {disciplinas.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="f-cal-disc" className="shrink-0">
                Disciplina
              </Label>
              <SelectRico
                id="f-cal-disc"
                valor={fDisciplina}
                aoMudar={setFDisciplina}
                className="h-9 w-[210px] text-[14px]"
                opcoes={[{ valor: 'todas', rotulo: 'Todas', icone: <IconeOpcao icone={Layers} /> }, ...opcoesDisciplinas(disciplinas)]}
              />
            </div>
          )}
          {noEspacoPessoal
            ? espacos.length > 1 && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="f-cal-onde" className="shrink-0">
                    Onde
                  </Label>
                  <SelectRico
                    id="f-cal-onde"
                    valor={fOnde}
                    aoMudar={setFOnde}
                    className="h-9 w-[210px] text-[14px]"
                    opcoes={[{ valor: 'todos', rotulo: 'Tudo', icone: <IconeOpcao icone={Layers} /> }, ...opcoesGrupos(espacos)]}
                  />
                </div>
              )
            : membroAtivo && (
                <label htmlFor="f-cal-minhas" className="flex cursor-pointer items-center gap-2.5 text-[14px] font-medium text-texto">
                  <Interruptor id="f-cal-minhas" ligado={soMinhas} aoMudar={setSoMinhas} />
                  Só as minhas atividades
                </label>
              )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-divisor pt-3 xl:justify-end xl:border-0 xl:pt-0">
          <p className="text-[13px] text-sutil" role="status">
            {resumo}
          </p>
          {filtroAtivo && (
            <Button variante="fantasma" tamanho="sm" onClick={limparFiltros}>
              <X aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </div>
      </Card>

      {/* Na semana, cada coluna já mostra o dia inteiro: o painel do dia sai
          para as colunas ganharem largura. */}
      <div className={cn('grid items-start gap-5', visao !== 'semana' && 'xl:grid-cols-[minmax(0,1fr)_320px]')}>
        <div className="min-w-0">
          {visao === 'mes' && (
            <div className="overflow-hidden rounded-[22px] border border-borda bg-superficie shadow-cartao">
              <div className="grid grid-cols-7 border-b border-borda" aria-hidden="true">
                {DIAS_CURTOS.map((d) => (
                  <span
                    key={d}
                    className="px-1.5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-sutil sm:px-3 sm:text-[12px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div
                key={`mes-${ano}-${mes}`}
                className={cn('grid grid-cols-7', animacao)}
                {...deslizar}
              >
                {celulas.map((data, i) => {
                  const iso = paraISO(data);
                  const doMes = data.getMonth() === mes;
                  const itens = porDia.get(iso) || [];
                  const doDia = eventosPorDia.get(iso) || [];
                  const feriado = feriadoEm(iso);
                  const ehHoje = iso === hoje;
                  const ehSelecionado = iso === selecionado;
                  const ultimaLinha = i >= celulas.length - 7;
                  // Cabem três etiquetas: os eventos primeiro, depois as entregas.
                  const vagasEntregas = Math.max(0, 3 - doDia.length);
                  const sobra = Math.max(0, doDia.length - 3) + Math.max(0, itens.length - vagasEntregas);
                  const rotulo = [
                    diaEMes(data),
                    ehHoje ? 'hoje' : null,
                    plural(itens.length, 'entrega'),
                    doDia.length > 0 ? plural(doDia.length, 'evento') : null,
                    feriado ? `feriado: ${feriado.name}` : null,
                  ]
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => escolherDia(iso, { rolar: true })}
                      aria-pressed={ehSelecionado}
                      aria-current={ehHoje ? 'date' : undefined}
                      aria-label={rotulo}
                      className={cn(
                        'flex min-h-[68px] min-w-0 flex-col items-stretch gap-1 p-1.5 text-left transition-colors sm:min-h-[128px] sm:p-2',
                        i % 7 < 6 && 'border-r border-divisor',
                        !ultimaLinha && 'border-b border-divisor',
                        !doMes && 'bg-fundo',
                        ehSelecionado
                          ? 'bg-primaria-barra/[0.07] ring-2 ring-inset ring-primaria-barra/55'
                          : 'hover:bg-superficie-2'
                      )}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            'numero inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                            ehHoje ? 'bg-primaria text-primaria-fg' : doMes ? 'text-texto' : 'text-apagado opacity-60'
                          )}
                        >
                          {data.getDate()}
                        </span>
                        {feriado && (
                          <>
                            <span className="hidden truncate text-[11px] font-semibold text-feriado sm:block">
                              Feriado
                            </span>
                            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-feriado sm:hidden" />
                          </>
                        )}
                      </span>
                      <span className="hidden flex-col gap-1 sm:flex">
                        {doDia.slice(0, 3).map((item) => (
                          <EtiquetaEvento key={item.evento.id} item={item} />
                        ))}
                        {itens.slice(0, vagasEntregas).map((item) => (
                          <Etiqueta key={item.atividade.id} item={item} />
                        ))}
                        {sobra > 0 && <span className="pl-1 text-[12px] text-sutil">+{sobra} mais</span>}
                      </span>
                      {itens.length + doDia.length > 0 && (
                        <span aria-hidden="true" className="flex flex-wrap gap-1 px-1 sm:hidden">
                          {doDia.slice(0, 2).map((item) => (
                            <span
                              key={item.evento.id}
                              className="size-1.5 rounded-full ring-[1.5px] ring-inset"
                              style={{ '--tw-ring-color': item.disciplina?.cor || 'var(--primaria-texto)' }}
                            />
                          ))}
                          {itens.slice(0, 4).map((item) => (
                            <span
                              key={item.atividade.id}
                              className="size-1.5 rounded-full"
                              style={{ background: item.disciplina?.cor || 'var(--sutil)' }}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {visao === 'semana' && (
            <div className="overflow-hidden md:rounded-[22px]">
            <div
              key={`semana-${paraISO(diasDaSemana[0])}`}
              {...deslizar}
              className={cn(
                'grid gap-3 md:grid-cols-7 md:gap-0 md:overflow-hidden md:rounded-[22px] md:border md:border-borda md:bg-superficie md:shadow-cartao',
                animacao
              )}
            >
              {diasDaSemana.map((data, i) => {
                const iso = paraISO(data);
                const itens = porDia.get(iso) || [];
                const doDia = eventosPorDia.get(iso) || [];
                const feriado = feriadoEm(iso);
                const ehHoje = iso === hoje;
                const ehSelecionado = iso === selecionado;
                return (
                  <section
                    key={iso}
                    aria-label={`${DIAS_LONGOS[data.getDay()]}, ${diaEMes(data)}`}
                    className={cn(
                      'min-w-0 rounded-2xl border border-borda bg-superficie p-3 md:rounded-none md:border-0 md:p-2.5',
                      i < 6 && 'md:border-r md:border-divisor',
                      ehSelecionado && 'md:bg-primaria-barra/[0.05]'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => escolherDia(iso)}
                      aria-pressed={ehSelecionado}
                      className="mb-2 flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-superficie-2"
                    >
                      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil">
                        {DIAS_CURTOS[data.getDay()]}
                      </span>
                      <span
                        className={cn(
                          'numero inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                          ehHoje ? 'bg-primaria text-primaria-fg' : 'text-texto'
                        )}
                      >
                        {data.getDate()}
                      </span>
                      <span className="sr-only">
                        {plural(itens.length, 'entrega')}
                        {doDia.length > 0 ? `, ${plural(doDia.length, 'evento')}` : ''}
                      </span>
                    </button>
                    {feriado && (
                      <p className="mb-2 px-1 text-[11px] font-semibold leading-snug text-feriado">{feriado.name}</p>
                    )}
                    <ul className="flex flex-col gap-1.5 md:min-h-[320px]">
                      {doDia.map((item) => (
                        <li key={item.evento.id} title={`${rotuloTipoEvento(item.evento.tipo)}, ${horarioDoEvento(item.evento)}`}>
                          <EtiquetaEvento item={item} inteira />
                        </li>
                      ))}
                      {itens.length === 0 ? (
                        doDia.length === 0 && <li className="px-1 text-[12px] text-apagado">Nada marcado</li>
                      ) : (
                        itens.map((item) => (
                          <li key={item.atividade.id}>
                            <Link to={`/atividade/${item.atividade.id}`} className="block rounded-[7px] hover:brightness-110">
                              <Etiqueta item={item} inteira />
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </section>
                );
              })}
            </div>
            </div>
          )}

          {visao === 'lista' &&
            (doMesEmLista.length === 0 ? (
              <Card>
                <EmptyState
                  icone={CalendarDays}
                  titulo={`Nada marcado em ${MESES[mes]}`}
                  descricao="As atividades aparecem aqui no dia do prazo, na cor da disciplina, junto com os eventos do grupo."
                />
              </Card>
            ) : (
              <div key={`lista-${ano}-${mes}`} className={cn('flex flex-col gap-5', animacao)}>
                {doMesEmLista.map(([iso, itens, doDia]) => {
                  const data = dataLocal(iso);
                  const feriado = feriadoEm(iso);
                  return (
                    <section key={iso} aria-labelledby={`dia-${iso}`}>
                      <h2
                        id={`dia-${iso}`}
                        className="mb-2.5 flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-sutil"
                      >
                        {DIAS_CURTOS[data.getDay()]}, {ddmm(iso)}
                        {iso === hoje && <Badge tom="primaria">Hoje</Badge>}
                        {feriado && <Badge tom="feriado">{feriado.name}</Badge>}
                      </h2>
                      {doDia.length > 0 && (
                        <ul className={cn('flex flex-col gap-2', itens.length > 0 && 'mb-2.5')}>
                          {doDia.map(({ evento, disciplina }) => (
                            <li key={evento.id}>
                              <CartaoEvento
                                evento={evento}
                                disciplina={disciplina}
                                grupo={grupoDe(evento)}
                                compacto
                                mostrarDia={false}
                                acoes={menuDoEvento(evento)}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                      {itens.length > 0 && (
                        <Card className="overflow-hidden">
                          <ul className="divide-y divide-divisor">
                            {itens.map(({ atividade }) => (
                              <LinhaAtividade key={atividade.id} atividade={atividade} />
                            ))}
                          </ul>
                        </Card>
                      )}
                    </section>
                  );
                })}
              </div>
            ))}
        </div>

        {visao !== 'semana' && (
        <Card
          as="aside"
          ref={painelRef}
          aria-labelledby="t-dia"
          className="flex scroll-mt-20 flex-col gap-4 p-[22px]"
        >
          <div className="flex flex-col gap-1">
            <Rotulo>
              {dataSelecionada ? DIAS_LONGOS[dataSelecionada.getDay()] : ''}
              {selecionado === hoje ? ' · hoje' : ''}
            </Rotulo>
            <h2 id="t-dia" className="text-[26px] font-semibold tracking-[-0.03em] text-forte">
              {dataSelecionada ? diaEMes(dataSelecionada) : ''}
            </h2>
          </div>
          {feriadoSelecionado && (
            <p className="rounded-[14px] bg-feriado/10 px-3.5 py-2.5 text-sm text-feriado">
              Feriado nacional: {feriadoSelecionado.name}
            </p>
          )}
          {eventosDoSelecionado.length > 0 && (
            <ul aria-label="Eventos do dia" className="flex flex-col gap-2">
              {eventosDoSelecionado.map(({ evento, disciplina }) => (
                <li key={evento.id}>
                  <CartaoEvento
                    evento={evento}
                    disciplina={disciplina}
                    grupo={grupoDe(evento)}
                    compacto
                    mostrarDia={false}
                    acoes={menuDoEvento(evento)}
                  />
                </li>
              ))}
            </ul>
          )}
          {doSelecionado.length === 0 ? (
            eventosDoSelecionado.length === 0 && (
              <p className="text-[15px] leading-relaxed text-sutil">Nada marcado neste dia.</p>
            )
          ) : (
            <ul aria-label="Entregas do dia" className="flex flex-col gap-2.5">
              {doSelecionado.map((item) => (
                <CartaoDoDia key={item.atividade.id} item={item} membros={membros} />
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/atividade/nova?prazo=${selecionado}`}
              aria-label="Nova atividade neste dia"
              className="flex items-center justify-center gap-1.5 rounded-full border border-dashed border-borda-forte px-2 py-3 text-[13px] font-medium text-suave transition-colors hover:border-primaria-barra hover:text-primaria-texto"
            >
              <Plus className="size-4 shrink-0" aria-hidden="true" />
              Atividade
            </Link>
            <button
              type="button"
              onClick={() => novoEvento(selecionado)}
              aria-label="Novo evento neste dia"
              className="flex items-center justify-center gap-1.5 rounded-full border border-dashed border-borda-forte px-2 py-3 text-[13px] font-medium text-suave transition-colors hover:border-primaria-barra hover:text-primaria-texto"
            >
              <CalendarPlus className="size-4 shrink-0" aria-hidden="true" />
              Evento
            </button>
          </div>
          <div className="border-t border-divisor pt-4">
            <ProximosFeriados feriados={feriados} carregando={carregando} erro={erro} />
          </div>
        </Card>
        )}
      </div>
      {janelas}
    </div>
  );
}

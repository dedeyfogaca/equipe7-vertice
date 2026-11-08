import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, CalendarPlus, ListPlus, Plus, Search } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFeriados } from '../hooks/useFeriados.js';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Aviso, Card, EmptyState, TituloCartao } from '../components/ui/basicos.jsx';
import { BarraProgresso } from '../components/ui/progresso.jsx';
import { CartoesSituacao } from '../components/atividades/CartoesSituacao.jsx';
import { LinhaAtividade } from '../components/atividades/LinhaAtividade.jsx';
import { SeuRitmo } from '../components/gamificacao/SeuRitmo.jsx';
import { ProximosFeriados } from '../components/ProximosFeriados.jsx';
import { ConviteTutorial } from '../components/tutorial/Tutorial.jsx';
import { CartaoEvento } from '../components/eventos/CartaoEvento.jsx';
import { eventoFuturo } from '../components/eventos/tipos.jsx';
import { STATUS } from '../lib/constants.js';
import { anoDaData, formatarData } from '../lib/datas.js';
import { diaPorExtenso, porPrazo, saudacao } from '../lib/formatos.js';
import { contarPorSituacao, naSituacao, SITUACAO } from '../lib/situacoes.js';
import { primeiroNome } from '../lib/utils.js';

const TITULOS = {
  [SITUACAO.A_FAZER]: 'A fazer',
  [SITUACAO.FAZENDO]: 'Fazendo',
  [SITUACAO.CONCLUIDAS]: 'Concluídas',
  [SITUACAO.ATRASADAS]: 'Atrasadas',
};

const LIMITE_LISTA = 8;

// Primeiros passos: disciplina, depois atividade. Conteúdo é opcional.
function PrimeirosPassos({ temDisciplinas }) {
  if (!temDisciplinas) {
    return (
      <EmptyState
        icone={BookOpen}
        titulo="Comece pelas disciplinas"
        descricao="Toda atividade é de uma disciplina. É por ela que o Vértice mede o quanto o grupo avançou, em vez de só contar itens feitos."
      >
        <Button asChild>
          <Link to="/disciplinas">Cadastrar disciplinas</Link>
        </Button>
      </EmptyState>
    );
  }
  return (
    <EmptyState
      icone={ListPlus}
      titulo="Nenhuma atividade ainda"
      descricao="As disciplinas estão prontas. Agora é cadastrar a primeira atividade."
    >
      <Button asChild>
        <Link to="/atividade/nova">
          <Plus aria-hidden="true" />
          Nova atividade
        </Link>
      </Button>
    </EmptyState>
  );
}

export default function Painel() {
  useTitulo('Painel');
  const navigate = useNavigate();
  const { grupoAtivo, membroAtivo } = useAuth();
  const { atividadesDoGrupo, disciplinasDoGrupo, eventosDoGrupo, progressoDaDisciplina } = useData();

  const atividades = atividadesDoGrupo(grupoAtivo.id);
  const disciplinas = disciplinasDoGrupo(grupoAtivo.id);
  const proximosEventos = eventosDoGrupo(grupoAtivo.id).filter(eventoFuturo).slice(0, 3);

  // As situações filtram a lista aqui mesmo. Sem filtro, a lista mostra as
  // próximas entregas (o que ainda não foi concluído, por prazo).
  const [filtro, setFiltro] = useState(null);
  const contagem = useMemo(() => contarPorSituacao(atividades), [atividades]);

  const { lista, total } = useMemo(() => {
    if (!filtro) {
      const pendentes = atividades.filter((a) => a.status !== STATUS.CONCLUIDO).sort(porPrazo);
      return { lista: pendentes.slice(0, LIMITE_LISTA), total: pendentes.length };
    }
    const daSituacao = atividades.filter((a) => naSituacao(a, filtro));
    if (filtro === SITUACAO.CONCLUIDAS) {
      daSituacao.sort((a, b) => String(b.dataConclusao || '').localeCompare(String(a.dataConclusao || '')));
    } else {
      daSituacao.sort(porPrazo);
    }
    return { lista: daSituacao.slice(0, LIMITE_LISTA), total: daSituacao.length };
  }, [atividades, filtro]);

  // Feriados do ano atual, do próximo e dos anos dos prazos (RF21).
  const anos = useMemo(() => {
    const atual = new Date().getFullYear();
    const conjunto = new Set([atual, atual + 1]);
    atividades.forEach((a) => {
      const ano = anoDaData(a.prazo);
      if (ano) conjunto.add(ano);
    });
    return Array.from(conjunto);
  }, [atividades]);
  const { feriados, carregando, erro, feriadoEm } = useFeriados(anos);

  // Entregas que caem em feriado e ainda não foram feitas.
  const emFeriado = useMemo(
    () =>
      atividades
        .filter((a) => a.status !== STATUS.CONCLUIDO && feriadoEm(a.prazo))
        .sort(porPrazo)
        .map((a) => ({ atividade: a, feriado: feriadoEm(a.prazo) })),
    [atividades, feriadoEm]
  );

  const [busca, setBusca] = useState('');
  const buscar = (evento) => {
    evento.preventDefault();
    const termo = busca.trim();
    navigate(termo ? `/atividades?busca=${encodeURIComponent(termo)}` : '/atividades');
  };

  const escolherSituacao = (valor) => setFiltro((atual) => (atual === valor ? null : valor));
  const tituloLista = filtro ? TITULOS[filtro] : 'Próximas entregas';

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-sutil">{diaPorExtenso()}</span>
          <h1 className="text-[clamp(28px,3vw,40px)] font-semibold leading-[1.08] tracking-[-0.04em] text-forte">
            {saudacao()}
            {membroAtivo ? `, ${primeiroNome(membroAtivo.nome)}` : ''}
          </h1>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto">
          <form role="search" onSubmit={buscar} className="flex-1 sm:flex-none">
            <label className="flex h-11 items-center gap-2 rounded-full border border-borda bg-superficie px-3.5 text-sutil shadow-cartao transition-[border-color,box-shadow] focus-within:border-primaria-barra focus-within:ring-4 focus-within:ring-primaria-barra/15 sm:w-[280px]">
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span className="sr-only">Buscar atividades</span>
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar atividade, disciplina..."
                className="min-w-0 flex-1 bg-transparent text-sm text-texto outline-none placeholder:text-apagado"
              />
            </label>
          </form>
          <Button asChild>
            <Link to="/atividade/nova">
              <Plus aria-hidden="true" />
              Nova atividade
            </Link>
          </Button>
        </div>
      </header>

      <ConviteTutorial />

      <CartoesSituacao contagem={contagem} ativa={filtro} aoEscolher={escolherSituacao} />

      {emFeriado.length > 0 && (
        <Aviso icone={CalendarDays} tom="alerta">
          <strong className="font-semibold">Atenção aos feriados.</strong>{' '}
          {emFeriado.map(({ atividade, feriado }, i) => (
            <span key={atividade.id}>
              {i > 0 && ' '}
              <Link to={`/atividade/${atividade.id}`} className="font-medium underline underline-offset-2">
                {atividade.titulo}
              </Link>{' '}
              vence em {formatarData(atividade.prazo)}, feriado de {feriado.name}.
            </span>
          ))}
        </Aviso>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card as="section" aria-labelledby="t-entregas" className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5 sm:px-[22px]">
            <TituloCartao id="t-entregas">{tituloLista}</TituloCartao>
            {filtro ? (
              <Link
                to={`/atividades?situacao=${filtro}`}
                className="text-sm font-medium text-primaria-texto hover:underline"
              >
                Ver {total > LIMITE_LISTA ? `todas (${total})` : 'na lista'}
              </Link>
            ) : (
              <Link to="/calendario" className="text-sm font-medium text-primaria-texto hover:underline">
                Ver no calendário
              </Link>
            )}
          </div>

          {atividades.length === 0 ? (
            <PrimeirosPassos temDisciplinas={disciplinas.length > 0} />
          ) : lista.length === 0 ? (
            <p className="px-5 pb-6 pt-2 text-[15px] text-sutil sm:px-[22px]">
              {filtro
                ? 'Nenhuma atividade nesta situação.'
                : 'Nada pendente. Todas as atividades do grupo estão concluídas.'}
            </p>
          ) : (
            <ul className="divide-y divide-divisor border-t border-divisor">
              {lista.map((atividade) => (
                <LinhaAtividade key={atividade.id} atividade={atividade} feriado={feriadoEm(atividade.prazo)} />
              ))}
            </ul>
          )}
          {!filtro && total > LIMITE_LISTA && (
            <div className="border-t border-divisor px-5 py-3 text-center sm:px-[22px]">
              <Link to="/atividades" className="text-sm font-medium text-primaria-texto hover:underline">
                Ver as {total} pendentes
              </Link>
            </div>
          )}
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card as="section" aria-labelledby="t-eventos" className="flex flex-col gap-3.5 p-[22px]">
            <div className="flex items-center justify-between gap-3">
              <TituloCartao id="t-eventos">Próximos eventos</TituloCartao>
              <Link to="/eventos" className="text-sm font-medium text-primaria-texto hover:underline">
                Ver todos
              </Link>
            </div>
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-sutil">
                Nenhuma prova ou palestra marcada.{' '}
                <Link to="/eventos?novo=" className="inline-flex items-center gap-1 font-medium text-primaria-texto hover:underline">
                  <CalendarPlus className="size-3.5" aria-hidden="true" />
                  Cadastrar evento
                </Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {proximosEventos.map((evento) => (
                  <li key={evento.id}>
                    <CartaoEvento
                      evento={evento}
                      compacto
                      disciplina={disciplinas.find((d) => d.id === evento.disciplinaId)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card as="section" aria-labelledby="t-progresso" className="flex flex-col gap-4 p-[22px]">
            <TituloCartao id="t-progresso">Progresso por disciplina</TituloCartao>
            {disciplinas.length === 0 ? (
              <p className="text-sm text-sutil">
                Nenhuma disciplina ainda.{' '}
                <Link to="/disciplinas" className="font-medium text-primaria-texto hover:underline">
                  Cadastrar
                </Link>
              </p>
            ) : (
              disciplinas.map((disciplina) => (
                <Link
                  key={disciplina.id}
                  to={`/disciplina/${disciplina.id}`}
                  className="-mx-2 rounded-xl px-2 py-1 transition-colors hover:bg-superficie-2"
                >
                  <BarraProgresso
                    rotulo={disciplina.nome}
                    marcador
                    cor={disciplina.cor}
                    tamanho="sm"
                    progresso={progressoDaDisciplina(disciplina.id)}
                  />
                </Link>
              ))
            )}
          </Card>

          {membroAtivo && <SeuRitmo membroId={membroAtivo.id} />}

          <Card as="section" aria-label="Feriados" className="p-[22px]">
            <ProximosFeriados feriados={feriados} carregando={carregando} erro={erro} />
          </Card>
        </div>
      </div>
    </div>
  );
}

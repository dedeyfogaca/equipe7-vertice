import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowDownAZ,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  History,
  Layers,
  ListPlus,
  Plus,
  Search,
  SearchX,
  SlidersHorizontal,
  UserCog,
  Users,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFeriados } from '../hooks/useFeriados.js';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Card, EmptyState, PageHeader } from '../components/ui/basicos.jsx';
import { Input, Label } from '../components/ui/campos.jsx';
import { IconeOpcao, SelectRico } from '../components/ui/selecao.jsx';
import { AnelPeso } from '../components/ui/progresso.jsx';
import { A_DEFINIR, OPCAO_A_DEFINIR, opcoesDisciplinas, opcoesGrupos, opcoesMembros } from '../components/opcoes.jsx';
import { CartoesSituacao } from '../components/atividades/CartoesSituacao.jsx';
import { LinhaAtividade } from '../components/atividades/LinhaAtividade.jsx';
import { useAlternarConclusao } from '../components/atividades/useAlternarConclusao.jsx';
import { STATUS } from '../lib/constants.js';
import { anoDaData, diasRestantes } from '../lib/datas.js';
import { porPrazo } from '../lib/formatos.js';
import { contarPorSituacao, ehSituacaoValida, naSituacao, SITUACAO } from '../lib/situacoes.js';
import { cn, plural } from '../lib/utils.js';

// Cada ordem com o símbolo do que ela usa: o calendário do prazo, o relógio
// do cadastro, o anel do peso (o mesmo das listas) e o A–Z do título.
const ORDENS = [
  { valor: 'prazo', rotulo: 'Prazo', icone: <IconeOpcao icone={CalendarDays} /> },
  { valor: 'recentes', rotulo: 'Mais recentes', icone: <IconeOpcao icone={History} /> },
  { valor: 'peso', rotulo: 'Maior peso', icone: <AnelPeso peso={5} tamanho={18} decorativo /> },
  { valor: 'titulo', rotulo: 'Título (A–Z)', icone: <IconeOpcao icone={ArrowDownAZ} /> },
];

const PRAZOS = [
  { valor: 'todos', rotulo: 'Todos', icone: <IconeOpcao icone={CalendarDays} /> },
  { valor: 'semana', rotulo: 'Próximos 7 dias', icone: <IconeOpcao icone={CalendarClock} /> },
  { valor: 'mes', rotulo: 'Próximos 30 dias', icone: <IconeOpcao icone={CalendarRange} /> },
];

// Na ordem por prazo, o que ainda está pendente vem antes do que já foi
// concluído.
function pendentesPrimeiro(a, b) {
  const feitaA = a.status === STATUS.CONCLUIDO ? 1 : 0;
  const feitaB = b.status === STATUS.CONCLUIDO ? 1 : 0;
  return feitaA - feitaB || porPrazo(a, b);
}

export default function Atividades() {
  useTitulo('Atividades');
  const { grupoAtivo, membroAtivo, noEspacoPessoal, ehOrganizador } = useAuth();
  const {
    atividadesDoEspaco,
    membrosDoGrupo,
    disciplinasDoEspaco,
    disciplinasDoGrupo,
    trilhaDaAtividade,
    grupos,
    meusMembros,
    definirResponsavel,
  } = useData();
  const alternarConclusao = useAlternarConclusao();

  // RF34: no espaço pessoal, as pessoais e as dos grupos que estão com a pessoa.
  const atividades = atividadesDoEspaco(grupoAtivo.id);
  const membros = membrosDoGrupo(grupoAtivo.id);
  const disciplinas = disciplinasDoEspaco(grupoAtivo.id);
  // No espaço pessoal, o filtro de responsável vira "onde": pessoal ou um dos grupos.
  const espacos = noEspacoPessoal
    ? grupos.filter((g) => g.id === grupoAtivo.id || meusMembros.some((m) => m.grupoId === g.id && !g.pessoal))
    : [];

  const anos = useMemo(() => {
    const conjunto = new Set([new Date().getFullYear()]);
    atividades.forEach((a) => {
      const ano = anoDaData(a.prazo);
      if (ano) conjunto.add(ano);
    });
    return Array.from(conjunto);
  }, [atividades]);
  const { feriadoEm } = useFeriados(anos);

  // Situação, busca e disciplina moram no endereço: o Painel liga direto
  // para "/atividades?situacao=atrasadas", e a lista filtrada pode ser
  // guardada e compartilhada.
  const [params, setParams] = useSearchParams();
  const bruta = params.get('situacao');
  const situacao = ehSituacaoValida(bruta) ? bruta : SITUACAO.TODAS;
  const busca = params.get('busca') ?? '';
  const fDisciplina = disciplinas.some((d) => d.id === params.get('disciplina'))
    ? params.get('disciplina')
    : 'todas';

  const mudarParametro = (chave, valor, vazio) => {
    const proximos = new URLSearchParams(params);
    if (!valor || valor === vazio) proximos.delete(chave);
    else proximos.set(chave, valor);
    setParams(proximos, { replace: true });
  };

  // Clicar na situação já ativa volta para "todas".
  const escolherSituacao = (valor) =>
    mudarParametro('situacao', valor === situacao ? SITUACAO.TODAS : valor, SITUACAO.TODAS);

  const [fResponsavel, setFResponsavel] = useState('todos');
  const [fPrazo, setFPrazo] = useState('todos');
  const [ordem, setOrdem] = useState('prazo');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const extrasAtivos = [fDisciplina !== 'todas', fResponsavel !== 'todos', fPrazo !== 'todos'].filter(Boolean).length;

  const contagem = useMemo(() => contarPorSituacao(atividades), [atividades]);

  const filtradas = useMemo(() => {
    let lista = atividades.filter((a) => naSituacao(a, situacao));

    if (fDisciplina !== 'todas') {
      lista = lista.filter((a) => trilhaDaAtividade(a).disciplina?.id === fDisciplina);
    }

    if (fResponsavel === A_DEFINIR) {
      lista = lista.filter((a) => !a.responsavelId);
    } else if (fResponsavel !== 'todos') {
      lista = lista.filter((a) => (noEspacoPessoal ? a.grupoId : a.responsavelId) === fResponsavel);
    }

    const termo = busca.trim().toLowerCase();
    if (termo) {
      // A busca casa também pelo nome da disciplina e do conteúdo.
      lista = lista.filter((a) => {
        const { conteudo, disciplina } = trilhaDaAtividade(a);
        return (
          a.titulo.toLowerCase().includes(termo) ||
          (a.descricao || '').toLowerCase().includes(termo) ||
          (disciplina?.nome || '').toLowerCase().includes(termo) ||
          (conteudo?.nome || '').toLowerCase().includes(termo)
        );
      });
    }

    if (fPrazo === 'semana') {
      lista = lista.filter((a) => {
        const dias = diasRestantes(a.prazo);
        return dias !== null && dias >= 0 && dias <= 7;
      });
    } else if (fPrazo === 'mes') {
      lista = lista.filter((a) => {
        const dias = diasRestantes(a.prazo);
        return dias !== null && dias >= 0 && dias <= 30;
      });
    }

    const ordenada = [...lista];
    if (ordem === 'prazo') ordenada.sort(pendentesPrimeiro);
    else if (ordem === 'recentes') ordenada.sort((a, b) => (b.criadaEm || '').localeCompare(a.criadaEm || ''));
    else if (ordem === 'peso') ordenada.sort((a, b) => b.peso - a.peso || porPrazo(a, b));
    else if (ordem === 'titulo') ordenada.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
    return ordenada;
  }, [atividades, situacao, fDisciplina, fResponsavel, fPrazo, busca, ordem, trilhaDaAtividade, noEspacoPessoal]);

  const semAtividades = atividades.length === 0;
  // No espaço pessoal a disciplina é opcional (RN24): dá para começar direto.
  const semDisciplinas = !noEspacoPessoal && disciplinasDoGrupo(grupoAtivo.id).length === 0;

  // RF37: trocar o responsável de várias atividades de uma vez (organizador).
  const loteDisponivel = !noEspacoPessoal && ehOrganizador && membros.length > 0;
  const [selecionando, setSelecionando] = useState(false);
  const [marcadas, setMarcadas] = useState(() => new Set());
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const marcar = (id) =>
    setMarcadas((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  const visiveisMarcadas = filtradas.filter((a) => marcadas.has(a.id));
  const todasMarcadas = filtradas.length > 0 && visiveisMarcadas.length === filtradas.length;
  const fecharSelecao = () => {
    setSelecionando(false);
    setMarcadas(new Set());
    setNovoResponsavel('');
  };
  const aplicarResponsavel = () => {
    if (!novoResponsavel || visiveisMarcadas.length === 0) return;
    const ids = visiveisMarcadas.map((a) => a.id);
    const responsavelId = novoResponsavel === A_DEFINIR ? '' : novoResponsavel;
    const mudaram = definirResponsavel(ids, responsavelId);
    const ficaram = ids.length - mudaram;
    const quem = responsavelId ? membros.find((m) => m.id === responsavelId)?.nome : 'A definir';
    toast.success(mudaram === 1 ? '1 atividade mudou de responsável' : `${mudaram} atividades mudaram de responsável`, {
      description:
        ficaram > 0
          ? `Agora com ${quem}. ${plural(ficaram, 'atividade')} ficou como estava: concluída${responsavelId ? '' : ' ou já começada'}, ou já com essa pessoa.`
          : `Agora com ${quem}.`,
    });
    fecharSelecao();
  };
  const temFiltro =
    situacao !== SITUACAO.TODAS ||
    busca.trim() !== '' ||
    fDisciplina !== 'todas' ||
    fResponsavel !== 'todos' ||
    fPrazo !== 'todos';

  const limparFiltros = () => {
    setParams(new URLSearchParams(), { replace: true });
    setFResponsavel('todos');
    setFPrazo('todos');
  };

  return (
    <>
      <PageHeader
        titulo="Atividades"
        subtitulo={
          noEspacoPessoal
            ? 'As suas e as dos grupos que estão com você. Clique numa situação para filtrar.'
            : 'Clique numa situação para filtrar.'
        }
        acoes={
          <>
            {loteDisponivel && !semAtividades && (
              <Button variante="secundaria" onClick={() => (selecionando ? fecharSelecao() : setSelecionando(true))}>
                <CheckSquare aria-hidden="true" />
                {selecionando ? 'Cancelar seleção' : 'Selecionar'}
              </Button>
            )}
            {!semDisciplinas && (
              <Button variante="secundaria" asChild>
                <Link to="/atividades/lote">
                  <ListPlus aria-hidden="true" />
                  Várias de uma vez
                </Link>
              </Button>
            )}
            <Button asChild>
              <Link to="/atividade/nova">
                <Plus aria-hidden="true" />
                Nova atividade
              </Link>
            </Button>
          </>
        }
      />

      {semAtividades ? (
        <Card>
          {/* O vazio orienta pela cadeia: convidar a criar uma atividade
              antes de existir conteúdo levaria a pessoa a um formulário que
              ela não consegue preencher. */}
          {semDisciplinas ? (
            <EmptyState
              icone={BookOpen}
              titulo="Comece pelas disciplinas"
              descricao="Toda atividade é de uma disciplina. É por ela que o Vértice mede o quanto o grupo avançou, em vez de só contar itens feitos."
            >
              <Button asChild>
                <Link to="/disciplinas">Cadastrar uma disciplina</Link>
              </Button>
            </EmptyState>
          ) : (
            <EmptyState
              icone={ListPlus}
              titulo="Nenhuma atividade ainda"
              descricao={
                noEspacoPessoal
                  ? 'Cadastre o que você precisa fazer, da faculdade ou do dia a dia. Aqui a disciplina é opcional. As atividades dos seus grupos que estiverem com você também aparecem aqui.'
                  : 'As disciplinas e os conteúdos já estão prontos. Agora é pendurar a primeira atividade num deles.'
              }
            >
              <Button asChild>
                <Link to="/atividade/nova">
                  <Plus aria-hidden="true" />
                  Nova atividade
                </Link>
              </Button>
            </EmptyState>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          <CartoesSituacao contagem={contagem} ativa={situacao} aoEscolher={escolherSituacao} />

          <Card className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="busca">Buscar</Label>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sutil"
                  />
                  <Input
                    id="busca"
                    type="search"
                    className="pl-10"
                    placeholder="Título, disciplina ou conteúdo"
                    value={busca}
                    onChange={(e) => mudarParametro('busca', e.target.value, '')}
                  />
                </div>
                {/* No celular, os outros filtros ficam recolhidos. */}
                <Button
                  variante="secundaria"
                  tamanho="icone"
                  className="relative size-11 sm:hidden"
                  aria-label="Mais filtros"
                  aria-expanded={filtrosAbertos}
                  aria-controls="filtros-extras"
                  onClick={() => setFiltrosAbertos((v) => !v)}
                >
                  <SlidersHorizontal />
                  {extrasAtivos > 0 && (
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primaria text-[11px] font-bold text-primaria-fg">
                      {extrasAtivos}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <div id="filtros-extras" className={cn('contents', !filtrosAbertos && 'max-sm:hidden')}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="f-disc">Disciplina</Label>
              <SelectRico
                id="f-disc"
                valor={fDisciplina}
                aoMudar={(valor) => mudarParametro('disciplina', valor, 'todas')}
                opcoes={[
                  { valor: 'todas', rotulo: 'Todas', icone: <IconeOpcao icone={Layers} /> },
                  ...opcoesDisciplinas(disciplinas),
                ]}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="f-resp">{noEspacoPessoal ? 'Onde' : 'Responsável'}</Label>
              <SelectRico
                id="f-resp"
                valor={fResponsavel}
                aoMudar={setFResponsavel}
                opcoes={
                  noEspacoPessoal
                    ? [{ valor: 'todos', rotulo: 'Tudo', icone: <IconeOpcao icone={Layers} /> }, ...opcoesGrupos(espacos)]
                    : [
                        { valor: 'todos', rotulo: 'Todos', icone: <IconeOpcao icone={Users} /> },
                        OPCAO_A_DEFINIR,
                        ...opcoesMembros(membros, { voceId: membroAtivo?.id }),
                      ]
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="f-prazo">Prazo</Label>
              <SelectRico id="f-prazo" valor={fPrazo} aoMudar={setFPrazo} opcoes={PRAZOS} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="f-ordem">Ordenar por</Label>
              <SelectRico id="f-ordem" valor={ordem} aoMudar={setOrdem} opcoes={ORDENS} />
            </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-sutil" role="status">
              {filtradas.length === 1
                ? '1 atividade encontrada'
                : `${filtradas.length} atividades encontradas`}
            </p>
            {temFiltro && (
              <Button variante="fantasma" tamanho="sm" onClick={limparFiltros}>
                <X aria-hidden="true" />
                Limpar filtros
              </Button>
            )}
          </div>

          {filtradas.length === 0 ? (
            <Card>
              <EmptyState
                icone={SearchX}
                titulo="Nada encontrado"
                descricao="Nenhuma atividade bate com os filtros escolhidos. Tente afrouxar a busca."
              />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              {selecionando && (
                <div className="flex items-center gap-3 border-b border-divisor bg-superficie-2/60 px-4 py-2.5 sm:px-5">
                  <input
                    type="checkbox"
                    checked={todasMarcadas}
                    onChange={() => setMarcadas(todasMarcadas ? new Set() : new Set(filtradas.map((a) => a.id)))}
                    aria-label="Selecionar todas as atividades da lista"
                    className="size-[22px] shrink-0 cursor-pointer rounded-md accent-primaria-barra"
                  />
                  <span className="text-[13px] font-medium text-sutil">
                    {todasMarcadas ? 'Desmarcar todas' : 'Marcar todas as da lista'}
                  </span>
                </div>
              )}
              <ul className="divide-y divide-divisor" aria-label={plural(filtradas.length, 'atividade')}>
                {filtradas.map((atividade) => (
                  <LinhaAtividade
                    key={atividade.id}
                    atividade={atividade}
                    feriado={feriadoEm(atividade.prazo)}
                    aoAlternar={alternarConclusao}
                    selecao={selecionando ? { marcada: marcadas.has(atividade.id), aoMarcar: marcar } : undefined}
                  />
                ))}
              </ul>
            </Card>
          )}

          {/* Barra das ações em lote (RF37): fica presa no pé da tela. */}
          {selecionando && (
            <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-borda bg-superficie p-3 shadow-flutuante sm:flex-row sm:items-center sm:p-3.5">
              <p className="flex items-center gap-2 px-1 text-[14px] font-semibold text-forte" role="status">
                <UserCog className="size-4 text-primaria-texto" aria-hidden="true" />
                {visiveisMarcadas.length === 1 ? '1 selecionada' : `${visiveisMarcadas.length} selecionadas`}
              </p>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Label htmlFor="lote-resp" className="sm:sr-only">
                  Novo responsável
                </Label>
                <SelectRico
                  id="lote-resp"
                  valor={novoResponsavel}
                  aoMudar={setNovoResponsavel}
                  placeholder="Passar para..."
                  className="sm:w-[260px]"
                  opcoes={[OPCAO_A_DEFINIR, ...opcoesMembros(membros, { voceId: membroAtivo?.id })]}
                />
                <Button onClick={aplicarResponsavel} disabled={!novoResponsavel || visiveisMarcadas.length === 0}>
                  Trocar responsável
                </Button>
                <Button variante="fantasma" onClick={fecharSelecao}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDownAZ,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  History,
  Layers,
  ListPlus,
  Plus,
  Search,
  SearchX,
  SlidersHorizontal,
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
import { opcoesDisciplinas, opcoesMembros } from '../components/opcoes.jsx';
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
  const { grupoAtivo, membroAtivo } = useAuth();
  const { atividadesDoGrupo, membrosDoGrupo, disciplinasDoGrupo, trilhaDaAtividade } =
    useData();
  const alternarConclusao = useAlternarConclusao();

  const atividades = atividadesDoGrupo(grupoAtivo.id);
  const membros = membrosDoGrupo(grupoAtivo.id);
  const disciplinas = disciplinasDoGrupo(grupoAtivo.id);

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

    if (fResponsavel !== 'todos') {
      lista = lista.filter((a) => a.responsavelId === fResponsavel);
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
  }, [atividades, situacao, fDisciplina, fResponsavel, fPrazo, busca, ordem, trilhaDaAtividade]);

  const semAtividades = atividades.length === 0;
  const semDisciplinas = disciplinasDoGrupo(grupoAtivo.id).length === 0;
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
        subtitulo="Clique numa situação para filtrar."
        acoes={
          <Button asChild>
            <Link to="/atividade/nova">
              <Plus aria-hidden="true" />
              Nova atividade
            </Link>
          </Button>
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
              descricao="As disciplinas e os conteúdos já estão prontos. Agora é pendurar a primeira atividade num deles."
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
              <Label htmlFor="f-resp">Responsável</Label>
              <SelectRico
                id="f-resp"
                valor={fResponsavel}
                aoMudar={setFResponsavel}
                opcoes={[
                  { valor: 'todos', rotulo: 'Todos', icone: <IconeOpcao icone={Users} /> },
                  ...opcoesMembros(membros, { voceId: membroAtivo?.id }),
                ]}
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
              <ul className="divide-y divide-divisor" aria-label={plural(filtradas.length, 'atividade')}>
                {filtradas.map((atividade) => (
                  <LinhaAtividade
                    key={atividade.id}
                    atividade={atividade}
                    feriado={feriadoEm(atividade.prazo)}
                    aoAlternar={alternarConclusao}
                  />
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

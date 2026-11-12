import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Annoyed, Check, Download, Frown, Inbox, Laugh, Lock, Meh, RotateCcw, Search, Smile, Trash2 } from 'lucide-react';

import { useTitulo } from '../hooks/useTitulo.js';
import { useEquipe } from '../components/feedback/useEquipe.js';
import { Badge, Card, EmptyState, PageHeader } from '../components/ui/basicos.jsx';
import { Button } from '../components/ui/botao.jsx';
import { Input } from '../components/ui/campos.jsx';
import { Confirmacao } from '../components/ui/dialogo.jsx';
import { SelectRico } from '../components/ui/selecao.jsx';
import {
  NOTAS,
  ORIGENS,
  PERGUNTAS_ABERTAS,
  excluirFeedback,
  feedbackEmCsv,
  listarFeedback,
  marcarFeedback,
  resumirFeedback,
} from '../lib/feedback.js';
import { cn, plural } from '../lib/utils.js';

// Respostas do feedback (RF32, RN27): só para as contas da equipe. Resumo
// (quantas, média, notas), filtros, marcar como lida, excluir e baixar em
// planilha (CSV).

const ROSTOS = { 1: Frown, 2: Annoyed, 3: Meh, 4: Smile, 5: Laugh };
const COR_NOTA = {
  1: 'text-atrasada',
  2: 'text-atrasada',
  3: 'text-fazendo',
  4: 'text-concluido',
  5: 'text-concluido',
};
const PERIODOS = [
  { valor: 'tudo', rotulo: 'Desde o início' },
  { valor: '7', rotulo: 'Últimos 7 dias' },
  { valor: '30', rotulo: 'Últimos 30 dias' },
];

const quando = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function Numero({ rotulo, valor, detalhe }) {
  return (
    <div className="flex flex-col justify-center gap-1.5 px-5 py-6">
      <span className="text-sm text-sutil">{rotulo}</span>
      <span className="numero text-[34px] font-semibold leading-none tracking-[-0.03em] text-forte">{valor}</span>
      {detalhe && <span className="text-[13px] text-apagado">{detalhe}</span>}
    </div>
  );
}

function Distribuicao({ porNota, total, filtro, aoFiltrar }) {
  const maior = Math.max(1, ...porNota);
  return (
    <Card className="flex flex-col gap-3 p-5">
      <span className="text-sm text-sutil">Notas</span>
      <ul className="flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((n) => {
          const Rosto = ROSTOS[n];
          const qtd = porNota[n - 1];
          const ativo = filtro === String(n);
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => aoFiltrar(ativo ? 'todas' : String(n))}
                aria-pressed={ativo}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-superficie-3',
                  ativo && 'bg-superficie-3'
                )}
              >
                <Rosto className={cn('size-5 shrink-0', COR_NOTA[n])} aria-hidden="true" />
                <span className="w-[86px] shrink-0 text-sm text-suave">{NOTAS[n - 1].rotulo}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-superficie-3">
                  <span
                    className="block h-full rounded-full bg-primaria transition-[width] duration-500"
                    style={{ width: `${(qtd / maior) * 100}%` }}
                  />
                </span>
                <span className="numero w-[76px] shrink-0 whitespace-nowrap text-right text-sm text-texto">
                  {qtd}
                  <span className="text-apagado"> · {total ? Math.round((qtd / total) * 100) : 0}%</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function CartaoResposta({ resposta, aoMarcar, aoExcluir }) {
  const Rosto = ROSTOS[resposta.nota];
  const textos = PERGUNTAS_ABERTAS.filter(({ campo }) => resposta[campo]);
  return (
    <Card as="li" data-resposta="" className={cn('flex flex-col gap-4 p-5', !resposta.lida && 'border-primaria/40')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={cn('flex items-center gap-2 font-semibold', COR_NOTA[resposta.nota])}>
          <Rosto className="size-5" aria-hidden="true" />
          {resposta.nota} · {NOTAS[resposta.nota - 1].rotulo}
        </span>
        <span className="numero text-sm text-apagado">{quando(resposta.dataEnvio)}</span>
        <Badge tom="contorno">{ORIGENS[resposta.origem] ?? resposta.origem}</Badge>
        {!resposta.lida && <Badge tom="primaria">Nova</Badge>}
        <div className="ml-auto flex items-center gap-1">
          <Button variante="fantasma" tamanho="sm" onClick={() => aoMarcar(resposta)}>
            {resposta.lida ? <RotateCcw aria-hidden="true" /> : <Check aria-hidden="true" />}
            {resposta.lida ? 'Marcar como nova' : 'Marcar como lida'}
          </Button>
          <Button variante="fantasma" tamanho="icone-sm" aria-label="Excluir resposta" onClick={() => aoExcluir(resposta)}>
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
      {textos.length > 0 ? (
        <dl className="grid gap-3 sm:grid-cols-3">
          {textos.map(({ campo, titulo }) => (
            <div key={campo} className="flex flex-col gap-1 rounded-xl bg-superficie-2 px-4 py-3">
              <dt className="text-[13px] font-semibold text-suave">{titulo}</dt>
              <dd className="whitespace-pre-wrap text-[15px] leading-relaxed text-texto">{resposta[campo]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-apagado">Só a nota, sem comentário.</p>
      )}
      {resposta.contato && (
        <p className="text-sm text-sutil">
          Contato: <span className="font-semibold text-texto">{resposta.contato}</span>
        </p>
      )}
    </Card>
  );
}

export default function FeedbackRespostas() {
  useTitulo('Respostas do feedback');
  const equipe = useEquipe();
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState('tudo');
  const [nota, setNota] = useState('todas');
  const [soNovas, setSoNovas] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  useEffect(() => {
    if (!equipe) return;
    listarFeedback().then(setLista, (e) => setErro(e.message));
  }, [equipe]);

  const filtradas = useMemo(() => {
    if (!lista) return [];
    const limite = periodo === 'tudo' ? null : Date.now() - Number(periodo) * 86400000;
    const termo = busca.trim().toLowerCase();
    return lista.filter(
      (r) =>
        (!limite || new Date(r.dataEnvio).getTime() >= limite) &&
        (nota === 'todas' || r.nota === Number(nota)) &&
        (!soNovas || !r.lida) &&
        (!termo || [r.funcionou, r.travou, r.faltou, r.contato].some((t) => t.toLowerCase().includes(termo)))
    );
  }, [lista, busca, periodo, nota, soNovas]);

  if (equipe === null) return null;
  if (!equipe) {
    return (
      <Card>
        <EmptyState
          icone={Lock}
          titulo="Só a equipe vê as respostas"
          descricao="As respostas do feedback são anônimas e ficam com a equipe do Vértice. Quer contar como foi? Responda você também."
        >
          <Button asChild>
            <Link to="/feedback">Enviar feedback</Link>
          </Button>
        </EmptyState>
      </Card>
    );
  }

  const resumo = resumirFeedback(lista ?? []);
  const resumoFiltrado = resumirFeedback(filtradas);
  const filtrando = busca || periodo !== 'tudo' || nota !== 'todas' || soNovas;

  const marcar = async (r) => {
    try {
      await marcarFeedback(r.id, !r.lida);
      setLista((l) => l.map((x) => (x.id === r.id ? { ...x, lida: !r.lida } : x)));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const marcarTodas = async () => {
    const novas = filtradas.filter((r) => !r.lida);
    try {
      await Promise.all(novas.map((r) => marcarFeedback(r.id, true)));
      const ids = new Set(novas.map((r) => r.id));
      setLista((l) => l.map((x) => (ids.has(x.id) ? { ...x, lida: true } : x)));
      toast.success(`${plural(novas.length, 'resposta')} marcada${novas.length === 1 ? '' : 's'} como lida${novas.length === 1 ? '' : 's'}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const excluir = async () => {
    const r = excluindo;
    setExcluindo(null);
    try {
      await excluirFeedback(r.id);
      setLista((l) => l.filter((x) => x.id !== r.id));
      toast.success('Resposta excluída');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const baixar = () => {
    const blob = new Blob([feedbackEmCsv(filtradas)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `feedback-vertice-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        titulo="Respostas do feedback"
        subtitulo="O que os usuários de teste contaram. As respostas são anônimas, a não ser quando a pessoa deixa contato."
        acoes={
          <>
            {resumoFiltrado.naoLidas > 0 && (
              <Button variante="secundaria" onClick={marcarTodas}>
                <Check aria-hidden="true" />
                Marcar {resumoFiltrado.naoLidas === 1 ? 'a nova' : `as ${resumoFiltrado.naoLidas} novas`} como lidas
              </Button>
            )}
            <Button variante="secundaria" onClick={baixar} disabled={!filtradas.length}>
              <Download aria-hidden="true" />
              Baixar planilha
            </Button>
          </>
        }
      />

      {erro && <p role="alert" className="mb-4 text-sm font-semibold text-perigo">{erro}</p>}

      {lista && lista.length === 0 ? (
        <Card>
          <EmptyState
            icone={Inbox}
            titulo="Nenhuma resposta ainda"
            descricao="Quando alguém responder em /feedback, a resposta aparece aqui. O link fica na página inicial e no menu da conta."
          />
        </Card>
      ) : (
        lista && (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Card className="grid grid-cols-3 divide-x divide-divisor">
              <Numero rotulo="Respostas" valor={resumo.total} detalhe={`${plural(resumo.naoLidas, 'nova', 'novas')}`} />
              <Numero
                rotulo="Nota média"
                valor={resumo.media.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                detalhe="de 5"
              />
              <Numero
                rotulo="Com comentário"
                valor={lista.filter((r) => PERGUNTAS_ABERTAS.some(({ campo }) => r[campo])).length}
                detalhe={`${lista.filter((r) => r.contato).length} com contato`}
              />
              </Card>
              <Distribuicao porNota={resumo.porNota} total={resumo.total} filtro={nota} aoFiltrar={setNota} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-apagado" aria-hidden="true" />
                <Input
                  id="f-fb-busca"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar nos comentários"
                  aria-label="Buscar nos comentários"
                  className="h-10 pl-10"
                />
              </div>
              <SelectRico
                id="f-fb-periodo"
                valor={periodo}
                aoMudar={setPeriodo}
                className="h-10 w-[190px]"
                opcoes={PERIODOS}
              />
              <SelectRico
                id="f-fb-nota"
                valor={nota}
                aoMudar={setNota}
                className="h-10 w-[170px]"
                opcoes={[{ valor: 'todas', rotulo: 'Todas as notas' }, ...NOTAS.map((n) => ({ valor: String(n.valor), rotulo: `${n.valor} · ${n.rotulo}` }))]}
              />
              <Button
                variante={soNovas ? 'primaria' : 'secundaria'}
                aria-pressed={soNovas}
                onClick={() => setSoNovas((v) => !v)}
                className="h-10"
              >
                Só as novas
              </Button>
              {filtrando && (
                <Button
                  variante="link"
                  onClick={() => {
                    setBusca('');
                    setPeriodo('tudo');
                    setNota('todas');
                    setSoNovas(false);
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>

            <p className="text-sm text-sutil" aria-live="polite">
              {filtrando
                ? `${plural(filtradas.length, 'resposta')} de ${resumo.total}, nota média ${resumoFiltrado.media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`
                : `${plural(filtradas.length, 'resposta')}, da mais recente para a mais antiga`}
            </p>

            {filtradas.length === 0 ? (
              <Card>
                <EmptyState icone={Search} titulo="Nenhuma resposta com esses filtros" />
              </Card>
            ) : (
              <ul className="flex flex-col gap-3">
                {filtradas.map((r) => (
                  <CartaoResposta key={r.id} resposta={r} aoMarcar={marcar} aoExcluir={setExcluindo} />
                ))}
              </ul>
            )}
          </div>
        )
      )}

      <Confirmacao
        aberto={Boolean(excluindo)}
        titulo="Excluir esta resposta?"
        mensagem="Ela some da lista e da planilha. Não dá para desfazer."
        textoConfirmar="Excluir"
        perigo
        onConfirmar={excluir}
        onCancelar={() => setExcluindo(null)}
      />
    </div>
  );
}

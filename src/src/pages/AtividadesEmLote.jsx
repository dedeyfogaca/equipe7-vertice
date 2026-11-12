import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CircleSlash, ClipboardList, Plus, Trash2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Card, PageHeader } from '../components/ui/basicos.jsx';
import { Field, Input, Label, Textarea } from '../components/ui/campos.jsx';
import { CampoData } from '../components/ui/campo-data.jsx';
import { IconeOpcao, SelectRico } from '../components/ui/selecao.jsx';
import { AnelPeso } from '../components/ui/progresso.jsx';
import { A_DEFINIR, OPCAO_A_DEFINIR, opcoesDisciplinas, opcoesGrupos, opcoesMembros } from '../components/opcoes.jsx';
import { PESO } from '../lib/constants.js';
import { validarAtividade } from '../lib/validacao.js';
import { cn, plural } from '../lib/utils.js';

// RF37: várias atividades de uma vez (feedback dos testes, 11/11/2026: "faria
// muita diferença criar atividades em lote, principalmente quando o grupo tem
// muitas entregas"). Uma linha por atividade, com o essencial: título,
// disciplina, prazo, peso e responsável. O resto (descrição, conteúdo,
// prioridade) se completa depois, na edição de cada uma.
//
// A lista de títulos pode ser colada de uma vez (uma por linha), e a linha
// "Para todas" aplica a mesma disciplina, prazo ou responsável em todas.

const SEM_DISCIPLINA = '__sem-disciplina__';
const OPCOES_PESO = Array.from({ length: PESO.MAXIMO }, (_, i) => ({
  valor: String(i + 1),
  rotulo: String(i + 1),
  icone: <AnelPeso peso={i + 1} tamanho={18} decorativo />,
}));

const linhaVazia = (base = {}) => ({
  chave: Math.random().toString(36).slice(2),
  titulo: '',
  disciplinaId: '',
  prazo: '',
  peso: String(PESO.PADRAO),
  responsavelId: '',
  ...base,
});

export default function AtividadesEmLote() {
  useTitulo('Várias atividades');
  const navigate = useNavigate();
  const { grupoAtivo } = useAuth();
  const { grupos, meusMembros, membrosDoGrupo, disciplinasDoGrupo, ehPessoal, meuMembroEm, criarAtividades } =
    useData();

  const espacos = grupos.filter((g) => meusMembros.some((m) => m.grupoId === g.id));
  const [onde, setOnde] = useState(grupoAtivo.id);
  const pessoal = ehPessoal(onde);
  const membros = membrosDoGrupo(onde);
  const disciplinas = disciplinasDoGrupo(onde);
  const eu = meuMembroEm(onde);

  const [linhas, setLinhas] = useState(() => [linhaVazia(), linhaVazia(), linhaVazia()]);
  const [erros, setErros] = useState({});
  const [colando, setColando] = useState(false);
  const [texto, setTexto] = useState('');

  const mudar = (chave, campo, valor) => {
    setLinhas((atual) => atual.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)));
    setErros((atual) => {
      if (!atual[chave]?.[campo]) return atual;
      const { [campo]: _removido, ...resto } = atual[chave];
      return { ...atual, [chave]: resto };
    });
  };
  const paraTodas = (campo, valor) => {
    setLinhas((atual) => atual.map((l) => ({ ...l, [campo]: valor })));
    setErros({});
  };
  const remover = (chave) => setLinhas((atual) => (atual.length > 1 ? atual.filter((l) => l.chave !== chave) : atual));
  const trocarOnde = (valor) => {
    setOnde(valor);
    setLinhas((atual) => atual.map((l) => ({ ...l, disciplinaId: '', responsavelId: '' })));
    setErros({});
  };

  // Uma linha por título colado. As linhas em branco que já existiam saem.
  const usarLista = () => {
    const titulos = texto
      .split(/\r?\n/)
      .map((t) => t.replace(/^\s*[-*•\d.)]+\s*/, '').trim())
      .filter(Boolean);
    if (titulos.length === 0) return;
    setLinhas((atual) => [...atual.filter((l) => l.titulo.trim()), ...titulos.map((titulo) => linhaVazia({ titulo }))]);
    setTexto('');
    setColando(false);
    toast.success(`${plural(titulos.length, 'linha')} pronta${titulos.length === 1 ? '' : 's'}`, {
      description: pessoal
        ? 'Agora escolha a disciplina e o prazo de cada uma (ou de todas, na linha de cima).'
        : 'Agora escolha a disciplina, o prazo e quem faz cada uma (ou todas, na linha de cima).',
    });
  };

  const preenchidas = linhas.filter((l) => l.titulo.trim());

  const salvar = () => {
    if (preenchidas.length === 0) {
      setErros({ [linhas[0].chave]: { titulo: 'Escreva pelo menos um título.' } });
      document.getElementById(`titulo-${linhas[0].chave}`)?.focus();
      return;
    }
    const novosErros = {};
    preenchidas.forEach((l) => {
      const e = validarAtividade(
        { ...l, responsavelId: pessoal ? eu?.id : l.responsavelId },
        { membros, disciplinas, pessoal }
      );
      if (Object.keys(e).length > 0) novosErros[l.chave] = e;
    });
    setErros(novosErros);
    const primeira = preenchidas.find((l) => novosErros[l.chave]);
    if (primeira) {
      const campo = ['titulo', 'disciplinaId', 'prazo', 'peso'].find((c) => novosErros[primeira.chave][c]);
      document.getElementById(`${campo}-${primeira.chave}`)?.focus();
      return;
    }
    const criadas = criarAtividades(
      preenchidas.map((l) => ({
        titulo: l.titulo,
        grupoId: onde,
        disciplinaId: l.disciplinaId,
        prazo: l.prazo,
        peso: Number(l.peso) || PESO.PADRAO,
        responsavelId: pessoal ? eu?.id : l.responsavelId,
      }))
    );
    toast.success(criadas.length === 1 ? '1 atividade criada' : `${criadas.length} atividades criadas`, {
      description: pessoal ? 'No seu espaço pessoal.' : `Em ${grupos.find((g) => g.id === onde)?.nome}.`,
    });
    navigate('/atividades');
  };

  const opcoesDisciplina = [
    ...(pessoal ? [{ valor: SEM_DISCIPLINA, rotulo: 'Sem disciplina', icone: <IconeOpcao icone={CircleSlash} /> }] : []),
    ...opcoesDisciplinas(disciplinas),
  ];
  // RF37, RF38: num grupo, cada linha escolhe quem faz ou fica "A definir".
  // No espaço pessoal, tudo fica com a pessoa (RN24): a coluna continua à
  // vista, travada em "você", para ficar claro onde se escolhe outra pessoa.
  const opcoesResponsavel = pessoal
    ? opcoesMembros(eu ? [eu] : [], { voceId: eu?.id })
    : [OPCAO_A_DEFINIR, ...opcoesMembros(membros, { voceId: eu?.id })];
  const valorResponsavel = (id) => (pessoal ? eu?.id || '' : id || A_DEFINIR);
  const temGrupos = espacos.some((g) => !ehPessoal(g.id));
  // Colunas da tabela (no celular, cada linha vira um cartão).
  const colunas = 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,150px)_96px_minmax(0,1.2fr)_40px]';

  return (
    <>
      <Link
        to="/atividades"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-sutil hover:text-primaria-texto"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Atividades
      </Link>
      <PageHeader
        titulo="Várias atividades de uma vez"
        subtitulo="Uma linha por atividade. Linha sem título é ignorada. Descrição, conteúdo e prioridade você completa depois, se quiser."
        acoes={
          <Button variante="secundaria" onClick={() => setColando((v) => !v)} aria-expanded={colando}>
            <ClipboardList aria-hidden="true" />
            Colar uma lista
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        {colando && (
          <Card className="flex flex-col gap-3 p-5">
            <Field
              id="lista-colada"
              label="Títulos, um por linha"
              dica="Marcadores do começo da linha (-, *, 1.) saem sozinhos."
            >
              <Textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={'Lista 1 de exercícios\nResumo do capítulo 3\nSlides do seminário'}
                autoFocus
              />
            </Field>
            <div className="flex justify-end gap-2.5">
              <Button variante="fantasma" onClick={() => setColando(false)}>
                Cancelar
              </Button>
              <Button onClick={usarLista} disabled={!texto.trim()}>
                Criar as linhas
              </Button>
            </div>
          </Card>
        )}

        <Card className="flex flex-col gap-4 p-4 sm:p-5">
          {espacos.length > 1 && (
            <div className="flex flex-col gap-2 sm:max-w-[360px]">
              <Label htmlFor="lote-onde">Onde</Label>
              <SelectRico id="lote-onde" valor={onde} aoMudar={trocarOnde} opcoes={opcoesGrupos(espacos)} />
              {pessoal && temGrupos && (
                <p className="text-[13px] leading-relaxed text-sutil">
                  No espaço pessoal, as atividades ficam com você. Para escolher o responsável ou deixar “A definir”,
                  escolha um grupo aqui.
                </p>
              )}
            </div>
          )}

          {/* Para todas: a mesma escolha em todas as linhas. */}
          <div className={cn('grid gap-3 rounded-2xl border border-dashed border-borda p-3 lg:items-end', colunas)}>
            <p className="self-center text-[13px] font-semibold text-suave">Para todas as linhas</p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todas-disc" className="lg:sr-only">
                Disciplina de todas
              </Label>
              <SelectRico
                id="todas-disc"
                valor=""
                aoMudar={(v) => paraTodas('disciplinaId', v === SEM_DISCIPLINA ? '' : v)}
                opcoes={opcoesDisciplina}
                placeholder="Disciplina"
                disabled={disciplinas.length === 0}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todas-prazo" className="lg:sr-only">
                Prazo de todas
              </Label>
              <CampoData id="todas-prazo" valor="" aoMudar={(v) => paraTodas('prazo', v)} placeholder="Prazo" curto />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todas-peso" className="lg:sr-only">
                Peso de todas
              </Label>
              <SelectRico id="todas-peso" valor="" aoMudar={(v) => paraTodas('peso', v)} opcoes={OPCOES_PESO} placeholder="Peso" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todas-resp" className="lg:sr-only">
                Responsável de todas
              </Label>
              <SelectRico
                id="todas-resp"
                valor={pessoal ? valorResponsavel('') : ''}
                aoMudar={(v) => paraTodas('responsavelId', v === A_DEFINIR ? '' : v)}
                opcoes={opcoesResponsavel}
                placeholder="Responsável"
                disabled={pessoal}
              />
            </div>
          </div>

          {/* Cabeçalho das colunas (só no computador). */}
          <div className={cn('hidden gap-3 px-3 lg:grid', colunas)} aria-hidden="true">
            {['Título *', pessoal ? 'Disciplina' : 'Disciplina *', 'Prazo *', 'Peso', 'Responsável', ''].map(
              (t, i) => (
                <span key={i} className="text-[13px] font-semibold tracking-wide text-suave">
                  {t}
                </span>
              )
            )}
          </div>

          <ol className="flex flex-col gap-3">
            {linhas.map((linha, indice) => {
              const e = erros[linha.chave] || {};
              const n = indice + 1;
              return (
                <li
                  key={linha.chave}
                  className={cn(
                    'grid gap-3 rounded-2xl border border-borda bg-superficie-2/50 p-3 lg:items-start',
                    colunas,
                    Object.keys(e).length > 0 && 'border-perigo/50'
                  )}
                >
                  <Field id={`titulo-${linha.chave}`} label={`Título da linha ${n}`} erro={e.titulo} className="[&>label]:lg:sr-only">
                    <Input
                      value={linha.titulo}
                      onChange={(ev) => mudar(linha.chave, 'titulo', ev.target.value)}
                      placeholder="Ex.: Lista 2 de exercícios"
                      autoComplete="off"
                    />
                  </Field>
                  <Field
                    id={`disciplinaId-${linha.chave}`}
                    label={`Disciplina da linha ${n}`}
                    erro={e.disciplinaId}
                    className="[&>label]:lg:sr-only"
                  >
                    <SelectRico
                      valor={linha.disciplinaId || (pessoal ? SEM_DISCIPLINA : '')}
                      aoMudar={(v) => mudar(linha.chave, 'disciplinaId', v === SEM_DISCIPLINA ? '' : v)}
                      opcoes={opcoesDisciplina}
                      placeholder={disciplinas.length === 0 ? 'Sem disciplinas' : 'Selecione'}
                      disabled={disciplinas.length === 0}
                    />
                  </Field>
                  <Field id={`prazo-${linha.chave}`} label={`Prazo da linha ${n}`} erro={e.prazo} className="[&>label]:lg:sr-only">
                    <CampoData valor={linha.prazo} aoMudar={(v) => mudar(linha.chave, 'prazo', v)} placeholder="Prazo" curto />
                  </Field>
                  <Field id={`peso-${linha.chave}`} label={`Peso da linha ${n}`} erro={e.peso} className="[&>label]:lg:sr-only">
                    <SelectRico valor={linha.peso} aoMudar={(v) => mudar(linha.chave, 'peso', v)} opcoes={OPCOES_PESO} />
                  </Field>
                  <Field
                    id={`responsavelId-${linha.chave}`}
                    label={`Responsável da linha ${n}`}
                    erro={e.responsavelId}
                    className="[&>label]:lg:sr-only"
                  >
                    <SelectRico
                      valor={valorResponsavel(linha.responsavelId)}
                      aoMudar={(v) => mudar(linha.chave, 'responsavelId', v === A_DEFINIR ? '' : v)}
                      opcoes={opcoesResponsavel}
                      disabled={pessoal}
                    />
                  </Field>
                  <Button
                    variante="fantasma"
                    tamanho="icone"
                    className="justify-self-end lg:mt-0.5"
                    aria-label={`Tirar a linha ${n}`}
                    title="Tirar a linha"
                    onClick={() => remover(linha.chave)}
                    disabled={linhas.length === 1}
                  >
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divisor pt-4">
            <Button variante="secundaria" onClick={() => setLinhas((atual) => [...atual, linhaVazia()])}>
              <Plus aria-hidden="true" />
              Mais uma linha
            </Button>
            <div className="flex items-center gap-2.5">
              <Button variante="fantasma" asChild>
                <Link to="/atividades">Cancelar</Link>
              </Button>
              <Button onClick={salvar}>
                {preenchidas.length > 1 ? `Criar ${preenchidas.length} atividades` : 'Criar atividade'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

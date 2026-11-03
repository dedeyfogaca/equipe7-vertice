import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, CalendarDays, CircleHelp, Layers, Lock, Plus, Sparkles } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFeriados } from '../hooks/useFeriados.js';
import { usePermissoes } from '../hooks/usePermissoes.js';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Card, EmptyState, PageHeader } from '../components/ui/basicos.jsx';
import { Field, Input, Textarea } from '../components/ui/campos.jsx';
import { CampoData } from '../components/ui/campo-data.jsx';
import { IconeOpcao, SelectRico } from '../components/ui/selecao.jsx';
import { SeletorPeso } from '../components/atividades/SeletorPeso.jsx';
import { FormConteudo } from '../components/disciplinas/FormConteudo.jsx';
import {
  OPCOES_PRIORIDADE,
  OPCOES_STATUS,
  opcoesDisciplinas,
  opcoesMembros,
} from '../components/opcoes.jsx';
import { normalizarPeso, PESO } from '../lib/constants.js';
import { anoDaData, dataValida, ehFimDeSemana } from '../lib/datas.js';
import { XP_POR_PESO } from '../lib/gamificacao.js';
import { statusAoSalvar } from '../lib/permissoes.js';
import { semErros, validarAtividade } from '../lib/validacao.js';
import { primeiroNome, semErroEm } from '../lib/utils.js';

// Valor especial da lista de conteúdos: abre o cadastro de conteúdo na hora.
const NOVO_CONTEUDO = '__novo-conteudo__';

export default function AtividadeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { grupoAtivo, membroAtivo, ehOrganizador } = useAuth();
  const { quem, podeEditar } = usePermissoes();
  const {
    obterAtividade,
    criarAtividade,
    atualizarAtividade,
    criarConteudo,
    membrosDoGrupo,
    disciplinasDoGrupo,
    conteudosDoGrupo,
    conteudosDaDisciplina,
  } = useData();

  const edicao = Boolean(id);
  useTitulo(edicao ? 'Editar atividade' : 'Nova atividade');

  const membros = membrosDoGrupo(grupoAtivo.id);
  const disciplinas = disciplinasDoGrupo(grupoAtivo.id);
  const conteudosDoGrupoAtivo = conteudosDoGrupo(grupoAtivo.id);
  const existente = edicao ? obterAtividade(id) : null;
  // RN01 — atividade de outro grupo é tratada como inexistente.
  const atividade =
    existente && conteudosDoGrupoAtivo.some((c) => c.id === existente.conteudoId) ? existente : null;

  // Valores que chegam pelo endereço: o calendário manda o dia
  // (?prazo=2026-10-30) e a disciplina manda o conteúdo (?conteudo=...).
  const conteudoInicial = conteudosDoGrupoAtivo.find((c) => c.id === params.get('conteudo'));
  const disciplinaInicial =
    conteudoInicial?.disciplinaId ??
    (disciplinas.some((d) => d.id === params.get('disciplina')) ? params.get('disciplina') : '');
  const prazoInicial = dataValida(params.get('prazo')) ? params.get('prazo') : '';

  // Na criação, tudo começa vazio — só com os exemplos dos campos. O que é
  // obrigatório é cobrado ao salvar; o que é opcional pode ficar em branco.
  const [form, setForm] = useState(() => {
    if (atividade) {
      return {
        titulo: atividade.titulo || '',
        descricao: atividade.descricao || '',
        conteudoId: atividade.conteudoId || '',
        prazo: atividade.prazo || '',
        peso: normalizarPeso(atividade.peso),
        responsavelId: atividade.responsavelId || '',
        status: atividade.status || '',
        prioridade: atividade.prioridade || '',
      };
    }
    return {
      titulo: '',
      descricao: '',
      conteudoId: conteudoInicial?.id ?? '',
      prazo: prazoInicial,
      peso: '',
      responsavelId: '',
      status: '',
      prioridade: '',
    };
  });
  const [erros, setErros] = useState({});
  const [criandoConteudo, setCriandoConteudo] = useState(false);

  // A disciplina não é gravada na atividade: ela só filtra a lista de
  // conteúdos. Na edição, vem de volta pela cadeia.
  const [disciplinaId, setDisciplinaId] = useState(() => {
    if (atividade) {
      return conteudosDoGrupoAtivo.find((c) => c.id === atividade.conteudoId)?.disciplinaId ?? '';
    }
    return disciplinaInicial;
  });

  const anos = useMemo(
    () => Array.from(new Set([new Date().getFullYear(), anoDaData(form.prazo)].filter(Boolean))),
    [form.prazo]
  );
  const { feriadoEm } = useFeriados(anos);

  const mudar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => semErroEm(atual, campo));
  };
  const atualizarCampo = (campo) => (evento) => mudar(campo, evento.target.value);

  // Trocar de disciplina invalida o conteúdo escolhido antes.
  const trocarDisciplina = (valor) => {
    setDisciplinaId(valor);
    setForm((atual) => ({ ...atual, conteudoId: '' }));
  };

  // RN20 — o status é de quem é responsável. Passar a atividade para outra
  // pessoa devolve o status ao que era (ou ao vazio, na criação).
  const statusOriginal = atividade?.status || '';
  const trocarResponsavel = (valor) => {
    setForm((atual) => ({
      ...atual,
      responsavelId: valor,
      status: membroAtivo && valor === membroAtivo.id ? atual.status : statusOriginal,
    }));
    setErros((atual) => semErroEm(atual, 'responsavelId'));
  };

  const voltar = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(edicao ? `/atividade/${id}` : '/atividades');
  };

  if (edicao && !atividade) {
    return (
      <Card>
        <EmptyState
          icone={CircleHelp}
          titulo="Atividade não encontrada"
          descricao="Essa atividade não existe mais ou o endereço está errado."
        >
          <Button asChild>
            <Link to="/atividades">Voltar para as atividades</Link>
          </Button>
        </EmptyState>
      </Card>
    );
  }

  // RN07 — o participante edita só as atividades dele.
  if (edicao && !podeEditar(atividade)) {
    const dono = membros.find((m) => m.id === atividade.responsavelId);
    return (
      <Card>
        <EmptyState
          icone={Lock}
          titulo="Você não pode editar esta atividade"
          descricao={`Quem edita é ${dono ? primeiroNome(dono.nome) : 'o responsável'}, a pessoa responsável por ela, ou o organizador do grupo.`}
        >
          <Button asChild>
            <Link to={`/atividade/${atividade.id}`}>Voltar para a atividade</Link>
          </Button>
        </EmptyState>
      </Card>
    );
  }

  // RN13 — sem disciplina não há onde pendurar a atividade.
  if (disciplinas.length === 0) {
    return (
      <>
        <PageHeader titulo="Nova atividade" />
        <Card>
          <EmptyState
            icone={BookOpen}
            titulo="Cadastre as disciplinas primeiro"
            descricao="Toda atividade pertence a um conteúdo, e o conteúdo a uma disciplina. É essa cadeia que permite medir o progresso."
          >
            <Button asChild>
              <Link to="/disciplinas">Ir para Disciplinas</Link>
            </Button>
          </EmptyState>
        </Card>
      </>
    );
  }

  // Sem conteúdo nenhum, só quem pode cadastrar conteúdo segue (RN07): o
  // organizador cria o conteúdo aqui mesmo, sem sair do formulário.
  if (conteudosDoGrupoAtivo.length === 0 && !ehOrganizador) {
    return (
      <>
        <PageHeader titulo="Nova atividade" />
        <Card>
          <EmptyState
            icone={Layers}
            titulo="Ainda não há conteúdos"
            descricao="A atividade fica dentro de um conteúdo da disciplina. Peça ao organizador do grupo para cadastrar o primeiro."
          >
            <Button asChild>
              <Link to="/disciplinas">Ver as disciplinas</Link>
            </Button>
          </EmptyState>
        </Card>
      </>
    );
  }

  const responsavelEhVoce = Boolean(membroAtivo) && form.responsavelId === membroAtivo.id;
  const responsavel = membros.find((m) => m.id === form.responsavelId);
  const disciplinaEscolhida = disciplinas.find((d) => d.id === disciplinaId);
  const conteudosDaEscolhida = disciplinaId ? conteudosDaDisciplina(disciplinaId) : [];

  const enviar = (evento) => {
    evento.preventDefault();
    const novosErros = validarAtividade(form, { membros, conteudos: conteudosDoGrupoAtivo });
    setErros(novosErros);
    if (!semErros(novosErros)) {
      // Leva o foco ao primeiro campo com erro.
      const primeiro = ['titulo', 'conteudoId', 'prazo', 'responsavelId', 'peso'].find((c) => novosErros[c]);
      const alvo = primeiro === 'conteudoId' && !disciplinaId ? 'disciplinaId' : primeiro;
      const elemento = document.getElementById(alvo);
      (elemento?.getAttribute('role') === 'radiogroup' ? elemento.querySelector('[tabindex="0"]') : elemento)?.focus();
      return;
    }

    const dados = {
      ...form,
      peso: form.peso === '' ? PESO.PADRAO : form.peso,
      status: statusAoSalvar({
        statusEscolhido: form.status,
        statusAtual: statusOriginal,
        responsavelId: form.responsavelId,
        quem,
      }),
    };

    if (edicao) {
      atualizarAtividade(id, dados);
      toast.success('Alterações salvas', { description: dados.titulo.trim() });
      navigate(`/atividade/${id}`);
    } else {
      // Sem grupoId: o grupo da atividade vem do conteúdo escolhido.
      const nova = criarAtividade(dados);
      toast.success('Atividade criada', { description: nova.titulo });
      navigate(`/atividade/${nova.id}`, { replace: true });
    }
  };

  // RN13 + RN07 — o conteúdo novo nasce na disciplina escolhida e já fica
  // selecionado. O que estava preenchido no formulário continua lá.
  const salvarConteudo = (dados) => {
    const novo = criarConteudo({ ...dados, disciplinaId });
    mudar('conteudoId', novo.id);
    setCriandoConteudo(false);
    toast.success('Conteúdo cadastrado', { description: `${novo.nome}, em ${disciplinaEscolhida?.nome}` });
  };

  // Dica do prazo: feriado (BrasilAPI) ou fim de semana.
  const feriadoNoPrazo = form.prazo ? feriadoEm(form.prazo) : null;
  let dicaPrazo;
  if (feriadoNoPrazo) {
    dicaPrazo = (
      <span className="inline-flex items-center gap-1.5 text-fazendo">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        Esse prazo cai no feriado: {feriadoNoPrazo.name}.
      </span>
    );
  } else if (ehFimDeSemana(form.prazo)) {
    dicaPrazo = (
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        Esse prazo cai num fim de semana.
      </span>
    );
  }

  let dicaConteudo;
  if (!disciplinaId) {
    dicaConteudo = 'Escolha a disciplina primeiro.';
  } else if (conteudosDaEscolhida.length === 0) {
    dicaConteudo = ehOrganizador ? (
      <>
        {disciplinaEscolhida?.nome} ainda não tem conteúdos.{' '}
        <button
          type="button"
          onClick={() => setCriandoConteudo(true)}
          className="font-medium text-primaria-texto hover:underline"
        >
          Criar o primeiro
        </button>
      </>
    ) : (
      `${disciplinaEscolhida?.nome} ainda não tem conteúdos. Peça ao organizador para cadastrar.`
    );
  }

  const opcoesConteudo = [
    ...conteudosDaEscolhida.map((c) => ({ valor: c.id, rotulo: c.nome })),
    ...(ehOrganizador && disciplinaId
      ? [{ valor: NOVO_CONTEUDO, rotulo: 'Criar novo conteúdo', icone: <IconeOpcao icone={Plus} className="text-primaria-texto" />, acao: true }]
      : []),
  ];

  let dicaStatus;
  if (responsavelEhVoce) {
    dicaStatus = edicao ? undefined : 'Opcional. Sem escolha, a atividade começa em A fazer.';
  } else if (responsavel) {
    dicaStatus = `Só ${primeiroNome(responsavel.nome)}, que é responsável, muda o status.`;
  } else {
    dicaStatus = 'Só o responsável muda o status. A atividade começa em A fazer.';
  }

  const pesoEfetivo = form.peso === '' ? PESO.PADRAO : normalizarPeso(form.peso);

  return (
    <>
      <PageHeader
        titulo={edicao ? 'Editar atividade' : 'Nova atividade'}
        subtitulo="Campos com * são obrigatórios."
      />

      <Card as="form" onSubmit={enviar} noValidate className="max-w-[860px] overflow-hidden">
        <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">
          <Field id="titulo" label="Título" obrigatorio erro={erros.titulo} className="md:col-span-2">
            <Input
              value={form.titulo}
              onChange={atualizarCampo('titulo')}
              placeholder="Ex.: Escrever a introdução do TCC"
              autoComplete="off"
              autoFocus={!edicao}
            />
          </Field>

          <Field
            id="descricao"
            label="Descrição"
            dica="Opcional. Detalhes do que precisa ser feito."
            className="md:col-span-2"
          >
            <Textarea
              value={form.descricao}
              onChange={atualizarCampo('descricao')}
              placeholder="Anote o que for útil para o grupo."
            />
          </Field>

          {/* RN13 — a atividade pertence a exatamente um conteúdo. A
              disciplina aqui só filtra a lista de conteúdos. */}
          <Field id="disciplinaId" label="Disciplina" obrigatorio>
            <SelectRico
              valor={disciplinaId}
              aoMudar={trocarDisciplina}
              opcoes={opcoesDisciplinas(disciplinas)}
              placeholder="Selecione a disciplina"
            />
          </Field>
          <Field id="conteudoId" label="Conteúdo" obrigatorio erro={erros.conteudoId} dica={dicaConteudo}>
            <SelectRico
              valor={form.conteudoId}
              aoMudar={(valor) => mudar('conteudoId', valor)}
              aoAcionar={() => setTimeout(() => setCriandoConteudo(true), 0)}
              opcoes={opcoesConteudo}
              placeholder="Selecione o conteúdo"
              disabled={!disciplinaId || opcoesConteudo.length === 0}
            />
          </Field>

          {/* RN09 — o peso diz quanto a atividade vale no progresso do
              conteúdo. Não é urgência: isso é a prioridade. */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <span id="peso-rotulo" className="text-[13px] font-semibold tracking-wide text-suave">
              Peso
            </span>
            <SeletorPeso
              valor={form.peso}
              aoEscolher={(peso) => mudar('peso', peso)}
              descritoPor="peso-dica"
            />
            {erros.peso && <p className="text-[13px] font-medium text-perigo">{erros.peso}</p>}
            <p id="peso-dica" className="text-[13px] leading-snug text-sutil">
              Opcional: sem escolha, vale {PESO.PADRAO}. Quanto esta atividade pesa no progresso do conteúdo — não
              é urgência, isso é a prioridade.
            </p>
          </div>

          <Field id="prazo" label="Prazo" obrigatorio erro={erros.prazo} dica={dicaPrazo}>
            <CampoData valor={form.prazo} aoMudar={(valor) => mudar('prazo', valor)} />
          </Field>

          {/* RN06 — toda atividade tem responsável (revisão de 28/10/2026).
              É ele quem recebe a experiência na conclusão (RN10). */}
          <Field
            id="responsavelId"
            label="Responsável"
            obrigatorio
            erro={erros.responsavelId}
            dica={
              membros.length > 0 ? (
                'Quem faz a atividade, conclui e recebe a experiência.'
              ) : (
                <>
                  O grupo ainda não tem membros.{' '}
                  <Link to="/membros" className="font-medium text-primaria-texto hover:underline">
                    Cadastre o primeiro
                  </Link>{' '}
                  para poder escolher o responsável.
                </>
              )
            }
          >
            <SelectRico
              valor={form.responsavelId}
              aoMudar={trocarResponsavel}
              opcoes={opcoesMembros(membros, { voceId: membroAtivo?.id })}
              placeholder="Selecione o responsável"
              disabled={membros.length === 0}
            />
          </Field>

          {/* RN20 — só o responsável mexe no status. */}
          <Field id="status" label="Status" dica={dicaStatus}>
            <SelectRico
              valor={form.status}
              aoMudar={(valor) => mudar('status', valor)}
              opcoes={OPCOES_STATUS}
              placeholder="Selecione o status"
              disabled={!responsavelEhVoce}
            />
          </Field>
          <Field id="prioridade" label="Prioridade" dica="Opcional.">
            <SelectRico
              valor={form.prioridade}
              aoMudar={(valor) => mudar('prioridade', valor)}
              opcoes={OPCOES_PRIORIDADE}
              placeholder="Selecione a prioridade"
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divisor bg-superficie-2 px-5 py-4 sm:px-7">
          <p className="flex items-center gap-2 text-[13px] text-sutil">
            <Sparkles className="size-4 shrink-0 text-gam" aria-hidden="true" />
            <span>
              Ao concluir, vale{' '}
              <strong className="numero font-bold text-gam-texto">{pesoEfetivo * XP_POR_PESO} XP</strong>
              {responsavel ? ` para ${primeiroNome(responsavel.nome)}` : ''}.
            </span>
          </p>
          <div className="flex gap-2.5">
            <Button variante="secundaria" onClick={voltar}>
              Cancelar
            </Button>
            <Button type="submit">{edicao ? 'Salvar alterações' : 'Criar atividade'}</Button>
          </div>
        </div>
      </Card>

      {/* Fora do <form> da atividade: o envio do formulário do conteúdo não
          pode chegar até ele. */}
      {criandoConteudo && disciplinaEscolhida && (
        <FormConteudo
          aberto
          aoMudar={(abrir) => !abrir && setCriandoConteudo(false)}
          disciplina={disciplinaEscolhida}
          conteudos={conteudosDaEscolhida}
          aoSalvar={salvarConteudo}
        />
      )}
    </>
  );
}

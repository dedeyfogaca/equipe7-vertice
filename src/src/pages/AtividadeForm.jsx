import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, CalendarDays, CircleHelp, CircleSlash, Lock, Plus, Sparkles } from 'lucide-react';

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
  A_DEFINIR,
  OPCAO_A_DEFINIR,
  OPCOES_PRIORIDADE,
  OPCOES_STATUS,
  opcoesDisciplinas,
  opcoesGrupos,
  opcoesMembros,
} from '../components/opcoes.jsx';
import { normalizarPeso, PESO } from '../lib/constants.js';
import { anoDaData, dataValida, ehFimDeSemana } from '../lib/datas.js';
import { XP_POR_PESO } from '../lib/gamificacao.js';
import { statusAoSalvar } from '../lib/permissoes.js';
import { semErros, validarAtividade } from '../lib/validacao.js';
import { primeiroNome, semErroEm } from '../lib/utils.js';

// Valores especiais da lista de conteúdos: um abre o cadastro de conteúdo na
// hora; o outro é "sem conteúdo" (o conteúdo é opcional desde 06/11/2026).
const NOVO_CONTEUDO = '__novo-conteudo__';
const SEM_CONTEUDO = '__sem-conteudo__';

export default function AtividadeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { grupoAtivo, noEspacoPessoal } = useAuth();
  const { quemEm, podeEditar } = usePermissoes();
  const {
    obterAtividade,
    criarAtividade,
    atualizarAtividade,
    criarConteudo,
    membrosDoGrupo,
    disciplinasDoGrupo,
    conteudosDoGrupo,
    conteudosDaDisciplina,
    grupos,
    meusMembros,
    meuMembroEm,
    ehPessoal,
  } = useData();

  const edicao = Boolean(id);
  useTitulo(edicao ? 'Editar atividade' : 'Nova atividade');

  const existente = edicao ? obterAtividade(id) : null;
  // RN01: atividade de outro grupo é tratada como inexistente. No espaço
  // pessoal, também valem as dos grupos da pessoa (RF34).
  const atividade =
    existente && (existente.grupoId === grupoAtivo.id || (noEspacoPessoal && meuMembroEm(existente.grupoId)))
      ? existente
      : null;

  // RF34: onde a atividade vai morar. Do espaço pessoal ou de um grupo dá
  // para cadastrar em qualquer um dos dois, sem trocar de espaço (pedido da
  // equipe, 11/11/2026). Na edição, o lugar não muda.
  const espacos = grupos.filter((g) => meusMembros.some((m) => m.grupoId === g.id));
  const ondeInicial = espacos.some((g) => g.id === params.get('onde')) ? params.get('onde') : grupoAtivo.id;
  const [onde, setOnde] = useState(() => (atividade ? atividade.grupoId : ondeInicial));
  const pessoal = ehPessoal(onde);
  const quem = quemEm(onde);
  const euNoDestino = meuMembroEm(onde);
  const ehOrganizador = quem.organizador;

  const membros = membrosDoGrupo(onde);
  const disciplinas = disciplinasDoGrupo(onde);
  const conteudosDoGrupoAtivo = conteudosDoGrupo(onde);

  // Valores que chegam pelo endereço: o calendário manda o dia
  // (?prazo=2026-10-30) e a disciplina manda o conteúdo (?conteudo=...).
  const conteudoInicial = conteudosDoGrupoAtivo.find((c) => c.id === params.get('conteudo'));
  const disciplinaInicial =
    conteudoInicial?.disciplinaId ??
    (disciplinas.some((d) => d.id === params.get('disciplina')) ? params.get('disciplina') : '');
  const prazoInicial = dataValida(params.get('prazo')) ? params.get('prazo') : '';

  // Na criação, tudo começa vazio, só com os exemplos dos campos. O que é
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

  // A disciplina é obrigatória e também filtra a lista de conteúdos.
  const [disciplinaId, setDisciplinaId] = useState(() => (atividade ? atividade.disciplinaId || '' : disciplinaInicial));

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
    setErros((atual) => semErroEm(semErroEm(atual, 'disciplinaId'), 'conteudoId'));
  };

  // RN20: o status é de quem é responsável. Passar a atividade para outra
  // pessoa devolve o status ao que era (ou ao vazio, na criação). "A definir"
  // (RN06) fica sem responsável.
  const statusOriginal = atividade?.status || '';
  const trocarResponsavel = (bruto) => {
    const valor = bruto === A_DEFINIR ? '' : bruto;
    setForm((atual) => ({
      ...atual,
      responsavelId: valor,
      status: euNoDestino && valor === euNoDestino.id ? atual.status : statusOriginal,
    }));
    setErros((atual) => semErroEm(atual, 'responsavelId'));
  };

  // Trocar o lugar (na criação) zera o que é de cada grupo.
  const trocarOnde = (valor) => {
    setOnde(valor);
    setDisciplinaId('');
    setForm((atual) => ({ ...atual, conteudoId: '', responsavelId: '', status: '' }));
    setErros((atual) => semErroEm(semErroEm(atual, 'disciplinaId'), 'responsavelId'));
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

  // RN07: o participante edita só as atividades dele.
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

  // RN13: sem disciplina não há onde pendurar a atividade (no grupo; no
  // espaço pessoal ela é opcional, RN24).
  if (!pessoal && disciplinas.length === 0 && espacos.length <= 1) {
    return (
      <>
        <PageHeader titulo="Nova atividade" />
        <Card>
          <EmptyState
            icone={BookOpen}
            titulo="Cadastre as disciplinas primeiro"
            descricao="Toda atividade é de uma disciplina. É por ela que o Vértice mede o progresso do grupo."
          >
            <Button asChild>
              <Link to="/disciplinas">Ir para Disciplinas</Link>
            </Button>
          </EmptyState>
        </Card>
      </>
    );
  }

  // No espaço pessoal, a atividade é sempre da própria pessoa.
  const responsavelEhVoce = pessoal || (Boolean(euNoDestino) && form.responsavelId === euNoDestino.id);
  const responsavel = pessoal ? euNoDestino : membros.find((m) => m.id === form.responsavelId);
  const disciplinaEscolhida = disciplinas.find((d) => d.id === disciplinaId);
  const conteudosDaEscolhida = disciplinaId ? conteudosDaDisciplina(disciplinaId) : [];

  const enviar = (evento) => {
    evento.preventDefault();
    const novosErros = validarAtividade(
      { ...form, disciplinaId },
      { membros, conteudos: conteudosDoGrupoAtivo, disciplinas, pessoal }
    );
    setErros(novosErros);
    if (!semErros(novosErros)) {
      // Leva o foco ao primeiro campo com erro.
      const alvo = ['titulo', 'disciplinaId', 'conteudoId', 'prazo', 'responsavelId', 'peso'].find((c) => novosErros[c]);
      const elemento = document.getElementById(alvo);
      (elemento?.getAttribute('role') === 'radiogroup' ? elemento.querySelector('[tabindex="0"]') : elemento)?.focus();
      return;
    }

    const responsavelId = pessoal ? euNoDestino?.id || '' : form.responsavelId;
    const dados = {
      ...form,
      grupoId: onde,
      disciplinaId,
      responsavelId,
      peso: form.peso === '' ? PESO.PADRAO : form.peso,
      status: statusAoSalvar({
        statusEscolhido: form.status,
        statusAtual: statusOriginal,
        responsavelId,
        quem,
      }),
    };

    if (edicao) {
      atualizarAtividade(id, dados);
      toast.success('Alterações salvas', { description: dados.titulo.trim() });
      navigate(`/atividade/${id}`);
    } else {
      // Depois de criar, a pessoa volta para onde estava (a lista, o
      // calendário, a disciplina), e não para o detalhe: lá o botão de
      // concluir parecia o fim do cadastro (feedback dos testes, 11/11/2026).
      const nova = criarAtividade(dados);
      const fora = onde !== grupoAtivo.id && !noEspacoPessoal;
      toast.success('Atividade criada', {
        description: fora
          ? `${nova.titulo}, em ${pessoal ? 'Pessoal' : grupos.find((g) => g.id === onde)?.nome}`
          : nova.titulo,
        action: fora ? undefined : { label: 'Abrir', onClick: () => navigate(`/atividade/${nova.id}`) },
      });
      if (location.key !== 'default') navigate(-1);
      else navigate('/atividades', { replace: true });
    }
  };

  // RN13 + RN07: o conteúdo novo nasce na disciplina escolhida e já fica
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

  // O conteúdo é opcional: serve para quem quer ver o progresso por assunto
  // dentro da disciplina (ex.: "SQL" dentro de Banco de Dados).
  let dicaConteudo = 'Opcional. Separa a disciplina por assunto, se o grupo quiser.';
  if (!disciplinaId) {
    dicaConteudo = 'Opcional. Escolha a disciplina antes.';
  } else if (conteudosDaEscolhida.length === 0 && ehOrganizador) {
    dicaConteudo = (
      <>
        Opcional. {disciplinaEscolhida?.nome} ainda não tem conteúdos.{' '}
        <button
          type="button"
          onClick={() => setCriandoConteudo(true)}
          className="font-medium text-primaria-texto hover:underline"
        >
          Criar um
        </button>
      </>
    );
  }

  const opcoesConteudo = [
    { valor: SEM_CONTEUDO, rotulo: 'Sem conteúdo', icone: <IconeOpcao icone={CircleSlash} /> },
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
  } else if (!form.responsavelId) {
    dicaStatus = 'Fica em A fazer até alguém assumir a atividade.';
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
          {/* RF34: na criação, onde a atividade vai morar. */}
          {!edicao && espacos.length > 1 && (
            <Field
              id="onde"
              label="Onde"
              dica={
                pessoal
                  ? 'Só você vê. A disciplina é opcional.'
                  : 'O grupo todo vê. Atividade sua aparece também no seu espaço pessoal.'
              }
              className="md:col-span-2"
            >
              <SelectRico valor={onde} aoMudar={trocarOnde} opcoes={opcoesGrupos(espacos)} />
            </Field>
          )}

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
              placeholder={pessoal ? 'Anote o que for útil.' : 'Anote o que for útil para o grupo.'}
            />
          </Field>

          {/* RN13: a atividade pertence a uma disciplina; o conteúdo é
              opcional (revisão de 06/11/2026). No espaço pessoal, a
              disciplina também é (RN24). */}
          <Field
            id="disciplinaId"
            label="Disciplina"
            obrigatorio={!pessoal}
            erro={erros.disciplinaId}
            dica={
              disciplinas.length === 0 ? (
                pessoal ? (
                  'Opcional. Para separar por matéria, cadastre em Disciplinas.'
                ) : (
                  'Este grupo ainda não tem disciplinas. O organizador cadastra em Disciplinas.'
                )
              ) : pessoal ? (
                'Opcional.'
              ) : undefined
            }
          >
            <SelectRico
              valor={disciplinaId || (pessoal ? SEM_CONTEUDO : '')}
              aoMudar={(valor) => trocarDisciplina(valor === SEM_CONTEUDO ? '' : valor)}
              opcoes={[
                ...(pessoal ? [{ valor: SEM_CONTEUDO, rotulo: 'Sem disciplina', icone: <IconeOpcao icone={CircleSlash} /> }] : []),
                ...opcoesDisciplinas(disciplinas),
              ]}
              placeholder="Selecione a disciplina"
              disabled={disciplinas.length === 0}
            />
          </Field>
          <Field id="conteudoId" label="Conteúdo" erro={erros.conteudoId} dica={dicaConteudo}>
            <SelectRico
              valor={form.conteudoId || (disciplinaId ? SEM_CONTEUDO : '')}
              aoMudar={(valor) => mudar('conteudoId', valor === SEM_CONTEUDO ? '' : valor)}
              aoAcionar={() => setTimeout(() => setCriandoConteudo(true), 0)}
              opcoes={opcoesConteudo}
              placeholder="Sem conteúdo"
              disabled={!disciplinaId || opcoesConteudo.length === 1}
            />
          </Field>

          {/* RN09: o peso diz quanto a atividade vale no progresso. Não é
              urgência (isso é a prioridade). */}
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
              Opcional: sem escolha, vale {PESO.PADRAO}. É quanto esta atividade pesa no progresso da disciplina.
              Urgência é outra coisa (para isso existe a prioridade).
            </p>
          </div>

          <Field id="prazo" label="Prazo" obrigatorio erro={erros.prazo} dica={dicaPrazo}>
            <CampoData valor={form.prazo} aoMudar={(valor) => mudar('prazo', valor)} />
          </Field>

          {/* RN06 (revisada em 11/11/2026): o responsável pode ficar "A
              definir": o grupo todo vê a atividade e alguém assume. Quem faz
              conclui e recebe a experiência (RN10). No espaço pessoal, é
              sempre a própria pessoa. */}
          {!pessoal && (
            <Field
              id="responsavelId"
              label="Responsável"
              erro={erros.responsavelId}
              dica={
                membros.length > 0 ? (
                  form.responsavelId ? (
                    'Quem faz a atividade, conclui e recebe a experiência.'
                  ) : (
                    'A definir: o grupo todo vê e alguém assume depois.'
                  )
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
                valor={form.responsavelId || A_DEFINIR}
                aoMudar={trocarResponsavel}
                opcoes={[
                  ...(!statusOriginal || statusOriginal === 'a fazer' ? [OPCAO_A_DEFINIR] : []),
                  ...opcoesMembros(membros, { voceId: euNoDestino?.id }),
                ]}
                disabled={membros.length === 0}
              />
            </Field>
          )}

          {/* RN20: só o responsável mexe no status. */}
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
              {responsavelEhVoce ? ' para você' : responsavel ? ` para ${primeiroNome(responsavel.nome)}` : ''}.
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

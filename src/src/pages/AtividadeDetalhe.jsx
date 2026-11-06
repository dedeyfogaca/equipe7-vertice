import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, Check, CircleHelp, Lock, Pencil, Trash2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFeriados } from '../hooks/useFeriados.js';
import { usePermissoes } from '../hooks/usePermissoes.js';
import { useTitulo } from '../hooks/useTitulo.js';
import { Avatar } from '../components/ui/avatar-membro.jsx';
import { Badge, Card, EmptyState, Rotulo, TituloCartao } from '../components/ui/basicos.jsx';
import { Button } from '../components/ui/botao.jsx';
import { Confirmacao } from '../components/ui/dialogo.jsx';
import { SelectRico } from '../components/ui/selecao.jsx';
import { OPCOES_STATUS } from '../components/opcoes.jsx';
import { AnelPeso, BarraProgresso } from '../components/ui/progresso.jsx';
import { RetornoConclusao } from '../components/atividades/RetornoConclusao.jsx';
import {
  normalizarPeso,
  PESO,
  rotuloPerfil,
  rotuloPrioridade,
  STATUS,
} from '../lib/constants.js';
import { anoDaData, ehFimDeSemana, formatarDataExtensa, rotuloPrazo } from '../lib/datas.js';
import { diaLocal, xpPotencial } from '../lib/gamificacao.js';
import { capitalizar, rotuloSituacao, tomDaAtividade } from '../lib/formatos.js';
import { cn, primeiroNome } from '../lib/utils.js';

const COR_DO_TOM = {
  sucesso: 'text-concluido',
  alerta: 'text-fazendo',
  perigo: 'text-atrasada',
  neutro: 'text-sutil',
};

function Dado({ rotulo, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt>
        <Rotulo>{rotulo}</Rotulo>
      </dt>
      <dd className="text-[15px] text-texto">{children}</dd>
    </div>
  );
}

export default function AtividadeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { grupoAtivo } = useAuth();
  const { podeMudarStatus, podeEditar, podeExcluir: podeExcluirAtividade } = usePermissoes();
  const {
    obterAtividade,
    atualizarAtividade,
    removerAtividade,
    membrosDoGrupo,
    disciplinasDoGrupo,
    trilhaDaAtividade,
    progressoDoConteudo,
    progressoDaDisciplina,
    progressoAntesDe,
  } = useData();

  const existente = obterAtividade(id);
  // RN01: atividade de outro grupo é tratada como inexistente.
  const atividade =
    existente && disciplinasDoGrupo(grupoAtivo.id).some((d) => d.id === existente.disciplinaId) ? existente : null;
  useTitulo(atividade?.titulo ?? 'Atividade');

  const membros = membrosDoGrupo(grupoAtivo.id);
  const anos = useMemo(
    () => Array.from(new Set([new Date().getFullYear(), anoDaData(atividade?.prazo)].filter(Boolean))),
    [atividade?.prazo]
  );
  const { feriadoEm } = useFeriados(anos);
  const [confirmando, setConfirmando] = useState(false);

  if (!atividade) {
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

  const { conteudo, disciplina } = trilhaDaAtividade(atividade);
  const responsavel = membros.find((m) => m.id === atividade.responsavelId) || null;
  const concluida = atividade.status === STATUS.CONCLUIDO;
  // RN20: só o responsável conclui e muda o status. RN07: o organizador
  // edita e exclui qualquer atividade; o participante, só as dele.
  const podeStatus = podeMudarStatus(atividade);
  const podeEditarEsta = podeEditar(atividade);
  const podeExcluir = podeExcluirAtividade(atividade);
  const nomeResponsavel = responsavel ? primeiroNome(responsavel.nome) : 'o responsável';

  // RF15: o que a conclusão desta atividade fez com o conteúdo (ou com a
  // disciplina, quando ela não está em conteúdo nenhum).
  const depois = concluida
    ? conteudo
      ? progressoDoConteudo(conteudo.id)
      : progressoDaDisciplina(atividade.disciplinaId)
    : null;
  const antes = concluida ? progressoAntesDe(atividade) : null;

  const prazo = rotuloPrazo(atividade.prazo);
  const feriado = feriadoEm(atividade.prazo);
  const fimDeSemana = ehFimDeSemana(atividade.prazo);
  const xp = xpPotencial(atividade);

  const mudarStatus = (status) => atualizarAtividade(atividade.id, { status });

  const excluir = () => {
    removerAtividade(atividade.id);
    toast('Atividade excluída', { description: atividade.titulo });
    navigate('/atividades', { replace: true });
  };

  return (
    <>
      <Link
        to="/atividades"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-sutil hover:text-primaria-texto"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Atividades
      </Link>

      {concluida && (
        <RetornoConclusao
          atividade={atividade}
          conteudo={conteudo}
          disciplina={disciplina}
          antes={antes}
          depois={depois}
        />
      )}

      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="flex flex-wrap items-center gap-2 text-sm text-sutil">
            {disciplina && (
              <>
                <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: disciplina.cor }} />
                <Link to={`/disciplina/${disciplina.id}`} className="font-medium hover:text-primaria-texto">
                  {disciplina.nome}
                </Link>
                {conteudo && <span aria-hidden="true">›</span>}
              </>
            )}
            {conteudo && <span>{conteudo.nome}</span>}
          </p>
          <h1 className="text-[clamp(26px,3vw,36px)] font-semibold leading-[1.1] tracking-[-0.04em] text-forte">
            {atividade.titulo}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {!concluida && podeStatus && (
            <Button onClick={() => mudarStatus(STATUS.CONCLUIDO)}>
              <Check aria-hidden="true" />
              Concluir
            </Button>
          )}
          {podeEditarEsta && (
            <Button variante="secundaria" asChild>
              <Link to={`/atividade/${atividade.id}/editar`}>
                <Pencil aria-hidden="true" />
                Editar
              </Link>
            </Button>
          )}
          {podeExcluir && (
            <Button variante="perigo-contorno" onClick={() => setConfirmando(true)}>
              <Trash2 aria-hidden="true" />
              Excluir
            </Button>
          )}
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tom={tomDaAtividade(atividade)}>{rotuloSituacao(atividade)}</Badge>
        {atividade.prioridade && (
          <Badge tom="contorno">Prioridade {rotuloPrioridade(atividade.prioridade).toLowerCase()}</Badge>
        )}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card as="section" aria-labelledby="t-descricao" className="p-6">
            <TituloCartao id="t-descricao" className="mb-3">
              Descrição
            </TituloCartao>
            {atividade.descricao ? (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-texto">{atividade.descricao}</p>
            ) : (
              <p className="text-[15px] italic text-sutil">Sem descrição.</p>
            )}
          </Card>

          {/* Concluída, o retorno no topo já mostra a barra. */}
          {(conteudo || disciplina) && !concluida && (
            <Card as="section" aria-labelledby="t-conteudo" className="p-6">
              <TituloCartao id="t-conteudo" className="mb-4">
                Progresso de {(conteudo || disciplina).nome}
              </TituloCartao>
              <BarraProgresso
                progresso={conteudo ? progressoDoConteudo(conteudo.id) : progressoDaDisciplina(disciplina.id)}
                cor={disciplina?.cor}
              />
            </Card>
          )}
        </div>

        <Card as="aside" aria-label="Dados da atividade" className="p-5">
          <dl className="flex flex-col gap-5">
            <Dado rotulo="Status">
              {podeStatus ? (
                <SelectRico
                  aria-label="Mudar status"
                  valor={atividade.status}
                  aoMudar={mudarStatus}
                  opcoes={OPCOES_STATUS}
                />
              ) : (
                <span className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-2.5 font-medium text-forte">
                    {OPCOES_STATUS.find((o) => o.valor === atividade.status)?.icone}
                    {OPCOES_STATUS.find((o) => o.valor === atividade.status)?.rotulo ?? atividade.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-sutil">
                    <Lock className="size-3.5" aria-hidden="true" />
                    Só {nomeResponsavel} muda o status.
                  </span>
                </span>
              )}
            </Dado>

            <Dado rotulo="Responsável">
              <span className="flex items-center gap-2.5">
                <Avatar membro={responsavel} tamanho={34} decorativo />
                <span className="flex flex-col">
                  <span className="font-medium text-forte">{responsavel?.nome ?? 'Sem responsável'}</span>
                  {responsavel && (
                    <span className="text-[13px] text-sutil">{rotuloPerfil(responsavel.perfil)}</span>
                  )}
                </span>
              </span>
            </Dado>

            <Dado rotulo="Prazo">
              <span className="flex flex-col gap-1">
                <span>{capitalizar(formatarDataExtensa(atividade.prazo))}</span>
                {!concluida && atividade.prazo && (
                  <span className={cn('text-[13px] font-medium', COR_DO_TOM[prazo.tom])}>{prazo.texto}</span>
                )}
                {feriado && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-feriado">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Feriado: {feriado.name}
                  </span>
                )}
                {!feriado && fimDeSemana && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-sutil">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Cai num fim de semana
                  </span>
                )}
              </span>
            </Dado>

            {/* RN09: o peso é o que a atividade vale no progresso do conteúdo. */}
            <Dado rotulo="Peso">
              <span className="flex items-center gap-2.5">
                <AnelPeso peso={atividade.peso} tamanho={28} />
                <span>
                  {normalizarPeso(atividade.peso)} de {PESO.MAXIMO}
                </span>
              </span>
            </Dado>

            {/* RN10: xp = peso × 10, para o responsável, enquanto concluída. */}
            <Dado rotulo="Experiência">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="numero font-bold text-gam-texto">{xp} XP</span>
                <span className="text-[13px] text-sutil">
                  {concluida
                    ? `creditados a ${responsavel ? primeiroNome(responsavel.nome) : 'quem é responsável'}`
                    : 'ao concluir'}
                </span>
              </span>
            </Dado>

          </dl>
          {concluida && atividade.dataConclusao && (
            <p className="mt-5 border-t border-divisor pt-4 text-[13px] text-sutil">
              Concluída em {formatarDataExtensa(diaLocal(atividade.dataConclusao))}.
            </p>
          )}
        </Card>
      </div>

      <Confirmacao
        aberto={confirmando}
        titulo="Excluir atividade?"
        mensagem={`A atividade "${atividade.titulo}" será removida permanentemente. Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        onConfirmar={excluir}
        onCancelar={() => setConfirmando(false)}
      />
    </>
  );
}

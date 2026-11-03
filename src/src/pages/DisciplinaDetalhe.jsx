import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowDown, ArrowLeft, ArrowUp, Ellipsis, Layers, Lock, Pencil, Plus, Trash2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Aviso, Card, EmptyState } from '../components/ui/basicos.jsx';
import { Confirmacao } from '../components/ui/dialogo.jsx';
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz, MenuSeparador } from '../components/ui/flutuantes.jsx';
import { BarraProgresso } from '../components/ui/progresso.jsx';
import { FormConteudo } from '../components/disciplinas/FormConteudo.jsx';
import { FormDisciplina } from '../components/disciplinas/FormDisciplina.jsx';
import { LinhaAtividade } from '../components/atividades/LinhaAtividade.jsx';
import { porPrazo } from '../lib/formatos.js';
import { plural } from '../lib/utils.js';

export default function DisciplinaDetalhe() {
  const { id } = useParams();
  const { grupoAtivo, ehOrganizador } = useAuth();
  const {
    obterDisciplina,
    disciplinasDoGrupo,
    conteudosDaDisciplina,
    atividadesDoConteudo,
    atividadesDaDisciplina,
    criarConteudo,
    atualizarConteudo,
    removerConteudo,
    moverConteudo,
    atualizarDisciplina,
    progressoDoConteudo,
    progressoDaDisciplina,
  } = useData();

  const disciplina = obterDisciplina(id);
  useTitulo(disciplina?.nome ?? 'Disciplina');

  // `formConteudo`: null, {} (novo) ou { conteudo } (edição).
  const [formConteudo, setFormConteudo] = useState(null);
  const [editandoDisciplina, setEditandoDisciplina] = useState(false);
  const [removendo, setRemovendo] = useState(null);

  // RN01 — disciplina de outro grupo é tratada como inexistente: quem está
  // logado não pode enxergá-la nem pelo endereço direto.
  if (!disciplina || disciplina.grupoId !== grupoAtivo.id) {
    return (
      <Card>
        <EmptyState
          icone={Layers}
          titulo="Disciplina não encontrada"
          descricao="Essa disciplina não existe mais ou o endereço está errado."
        >
          <Button asChild>
            <Link to="/disciplinas">Voltar para as disciplinas</Link>
          </Button>
        </EmptyState>
      </Card>
    );
  }

  const conteudos = conteudosDaDisciplina(disciplina.id);
  const qtdAtividades = atividadesDaDisciplina(disciplina.id).length;

  const salvarConteudo = (dados) => {
    if (formConteudo?.conteudo) {
      atualizarConteudo(formConteudo.conteudo.id, dados);
      toast.success('Conteúdo atualizado', { description: dados.nome });
    } else {
      criarConteudo({ ...dados, disciplinaId: disciplina.id });
      toast.success('Conteúdo cadastrado', { description: dados.nome });
    }
    setFormConteudo(null);
  };

  const salvarDisciplina = (dados) => {
    atualizarDisciplina(disciplina.id, dados);
    toast.success('Disciplina atualizada', { description: dados.nome });
    setEditandoDisciplina(false);
  };

  const confirmarRemocao = () => {
    removerConteudo(removendo.id);
    toast('Conteúdo removido', { description: removendo.nome });
    setRemovendo(null);
  };

  const qtdRemovendo = removendo ? atividadesDoConteudo(removendo.id).length : 0;

  return (
    <>
      <Link
        to="/disciplinas"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-sutil hover:text-primaria-texto"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Disciplinas
      </Link>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="size-4 shrink-0 rounded-[5px]" style={{ background: disciplina.cor }} />
            <h1 className="text-[clamp(28px,3vw,38px)] font-semibold leading-[1.08] tracking-[-0.04em] text-forte">
              {disciplina.nome}
            </h1>
          </div>
          <p className="text-[15px] text-sutil">
            {plural(conteudos.length, 'conteúdo')} · {plural(qtdAtividades, 'atividade')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {ehOrganizador && (
            <>
              <Button variante="secundaria" onClick={() => setEditandoDisciplina(true)}>
                <Pencil aria-hidden="true" />
                Editar
              </Button>
              <Button variante="secundaria" onClick={() => setFormConteudo({})}>
                <Plus aria-hidden="true" />
                Novo conteúdo
              </Button>
            </>
          )}
          {conteudos.length > 0 && (
            <Button asChild>
              <Link to={`/atividade/nova?disciplina=${disciplina.id}`}>
                <Plus aria-hidden="true" />
                Nova atividade
              </Link>
            </Button>
          )}
        </div>
      </header>

      <Card className="mb-8 p-5 sm:p-6">
        <BarraProgresso
          rotulo="Progresso da disciplina"
          progresso={progressoDaDisciplina(disciplina.id)}
          cor={disciplina.cor}
        />
      </Card>

      {!ehOrganizador && (
        <Aviso icone={Lock} className="mb-5">
          Só o organizador do grupo cadastra, edita e reordena conteúdos.
        </Aviso>
      )}

      <section aria-labelledby="t-conteudos">
        <h2 id="t-conteudos" className="mb-3 text-[19px] font-semibold tracking-[-0.02em] text-forte">
          Conteúdos
        </h2>

        {conteudos.length === 0 ? (
          <Card>
            <EmptyState
              icone={Layers}
              titulo="Nenhum conteúdo ainda"
              descricao="Divida a disciplina nos assuntos que ela cobre. É o conteúdo que reúne as atividades e soma o peso delas."
            >
              {ehOrganizador && (
                <Button onClick={() => setFormConteudo({})}>
                  <Plus aria-hidden="true" />
                  Novo conteúdo
                </Button>
              )}
            </EmptyState>
          </Card>
        ) : (
          <ol className="flex flex-col gap-3">
            {conteudos.map((conteudo, indice) => {
              const atividades = [...atividadesDoConteudo(conteudo.id)].sort(porPrazo);
              const progresso = progressoDoConteudo(conteudo.id);
              return (
                <Card as="li" key={conteudo.id} className="overflow-hidden">
                  <div className="flex items-start gap-3 p-4 sm:p-5">
                    {ehOrganizador && (
                      <div className="-my-1 flex flex-col">
                        <Button
                          variante="fantasma"
                          tamanho="icone-sm"
                          aria-label={`Mover ${conteudo.nome} para cima`}
                          disabled={indice === 0}
                          onClick={() => moverConteudo(conteudo.id, 'cima')}
                        >
                          <ArrowUp />
                        </Button>
                        <Button
                          variante="fantasma"
                          tamanho="icone-sm"
                          aria-label={`Mover ${conteudo.nome} para baixo`}
                          disabled={indice === conteudos.length - 1}
                          onClick={() => moverConteudo(conteudo.id, 'baixo')}
                        >
                          <ArrowDown />
                        </Button>
                      </div>
                    )}
                    <span className="numero flex size-8 shrink-0 items-center justify-center rounded-lg bg-superficie-3 text-sm font-bold text-suave">
                      {indice + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-base font-semibold tracking-[-0.01em] text-forte">{conteudo.nome}</h3>
                        {progresso && (
                          <span className="numero shrink-0 text-sm font-bold text-forte">{progresso.percentual}%</span>
                        )}
                      </div>
                      {conteudo.descricao && <p className="mt-0.5 text-sm text-sutil">{conteudo.descricao}</p>}
                      <BarraProgresso
                        className="mt-3"
                        tamanho="sm"
                        cabecalho={false}
                        progresso={progresso}
                        cor={disciplina.cor}
                      />
                    </div>
                    <MenuRaiz>
                      <MenuGatilho asChild>
                        <Button variante="fantasma" tamanho="icone-sm" aria-label={`Ações de ${conteudo.nome}`}>
                          <Ellipsis />
                        </Button>
                      </MenuGatilho>
                      <MenuConteudo align="end" className="min-w-[200px]">
                        <MenuItem asChild>
                          <Link to={`/atividade/nova?conteudo=${conteudo.id}`}>
                            <Plus aria-hidden="true" />
                            Nova atividade aqui
                          </Link>
                        </MenuItem>
                        {ehOrganizador && (
                          <>
                            <MenuSeparador />
                            <MenuItem onSelect={() => setFormConteudo({ conteudo })}>
                              <Pencil aria-hidden="true" />
                              Editar
                            </MenuItem>
                            <MenuItem perigo onSelect={() => setRemovendo(conteudo)}>
                              <Trash2 aria-hidden="true" />
                              Remover
                            </MenuItem>
                          </>
                        )}
                      </MenuConteudo>
                    </MenuRaiz>
                  </div>
                  {atividades.length > 0 && (
                    <ul className="divide-y divide-divisor border-t border-divisor">
                      {atividades.map((atividade) => (
                        <LinhaAtividade key={atividade.id} atividade={atividade} />
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </ol>
        )}
      </section>

      {formConteudo && (
        <FormConteudo
          key={formConteudo.conteudo?.id ?? 'novo'}
          aberto
          aoMudar={(abrir) => !abrir && setFormConteudo(null)}
          conteudo={formConteudo.conteudo}
          disciplina={disciplina}
          conteudos={conteudos}
          aoSalvar={salvarConteudo}
        />
      )}

      {editandoDisciplina && (
        <FormDisciplina
          aberto
          aoMudar={(abrir) => !abrir && setEditandoDisciplina(false)}
          disciplina={disciplina}
          disciplinas={disciplinasDoGrupo(grupoAtivo.id)}
          aoSalvar={salvarDisciplina}
        />
      )}

      <Confirmacao
        aberto={Boolean(removendo)}
        titulo="Remover conteúdo?"
        mensagem={
          qtdRemovendo > 0
            ? `${removendo?.nome} será removido de ${disciplina.nome}, junto com ${plural(qtdRemovendo, 'atividade')}. Não dá para desfazer.`
            : `${removendo?.nome} será removido de ${disciplina.nome}.`
        }
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocao}
        onCancelar={() => setRemovendo(null)}
      />
    </>
  );
}

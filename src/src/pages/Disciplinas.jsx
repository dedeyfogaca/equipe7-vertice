import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, BookOpen, Ellipsis, Lock, Pencil, Plus, Trash2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Aviso, Card, EmptyState, PageHeader } from '../components/ui/basicos.jsx';
import { Confirmacao } from '../components/ui/dialogo.jsx';
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz } from '../components/ui/flutuantes.jsx';
import { BarraProgresso } from '../components/ui/progresso.jsx';
import { FormDisciplina } from '../components/disciplinas/FormDisciplina.jsx';
import { plural } from '../lib/utils.js';

export default function Disciplinas() {
  useTitulo('Disciplinas');
  const { grupoAtivo, ehOrganizador, noEspacoPessoal } = useAuth();
  const {
    disciplinasDoGrupo,
    conteudosDaDisciplina,
    conteudosDoGrupo,
    atividadesDaDisciplina,
    progressoDaDisciplina,
    progressoDoConteudo,
    criarDisciplina,
    atualizarDisciplina,
    removerDisciplina,
  } = useData();

  const disciplinas = disciplinasDoGrupo(grupoAtivo.id);
  const totalConteudos = conteudosDoGrupo(grupoAtivo.id).length;

  // `formulario`: null (fechado), {} (nova) ou { disciplina } (edição).
  const [formulario, setFormulario] = useState(null);
  const [removendo, setRemovendo] = useState(null);

  const salvar = (dados) => {
    if (formulario?.disciplina) {
      atualizarDisciplina(formulario.disciplina.id, dados);
      toast.success('Disciplina atualizada', { description: dados.nome });
    } else {
      criarDisciplina({ ...dados, grupoId: grupoAtivo.id });
      toast.success('Disciplina cadastrada', { description: dados.nome });
    }
    setFormulario(null);
  };

  const confirmarRemocao = () => {
    removerDisciplina(removendo.id);
    toast('Disciplina removida', { description: removendo.nome });
    setRemovendo(null);
  };

  // RN02: avisa o que vai junto antes de confirmar.
  const conteudosRemovendo = removendo ? conteudosDaDisciplina(removendo.id).length : 0;
  const atividadesRemovendo = removendo ? atividadesDaDisciplina(removendo.id).length : 0;
  const levaJunto = [
    atividadesRemovendo > 0 && plural(atividadesRemovendo, 'atividade'),
    conteudosRemovendo > 0 && plural(conteudosRemovendo, 'conteúdo'),
  ].filter(Boolean);
  const mensagemRemocao = !removendo
    ? ''
    : levaJunto.length === 0
      ? `${removendo.nome} será removida do grupo.`
      : `${removendo.nome} será removida do grupo, junto com ${levaJunto.join(' e ')}. Não dá para desfazer.`;

  return (
    <>
      <PageHeader
        titulo="Disciplinas"
        subtitulo={
          totalConteudos > 0
            ? `${plural(disciplinas.length, 'disciplina')} · ${plural(totalConteudos, 'conteúdo')}`
            : plural(disciplinas.length, 'disciplina')
        }
        acoes={
          ehOrganizador && (
            <Button onClick={() => setFormulario({})}>
              <Plus aria-hidden="true" />
              Nova disciplina
            </Button>
          )
        }
      />

      {/* RN07: quem gerencia disciplina é o organizador. */}
      {!ehOrganizador && (
        <Aviso icone={Lock}>
          Só o organizador do grupo cadastra e edita disciplinas e conteúdos. Você pode cadastrar
          atividades em qualquer uma delas.
        </Aviso>
      )}

      {disciplinas.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icone={BookOpen}
            titulo="Nenhuma disciplina ainda"
            descricao={
              noEspacoPessoal
                ? 'No seu espaço, a disciplina é opcional. Use para separar o que é só seu por matéria ou por área (Inglês, Academia, Casa) e ver o progresso de cada uma.'
                : 'Cadastre as disciplinas do semestre. Elas organizam as atividades e são a base do cálculo de progresso.'
            }
          >
            {ehOrganizador && (
              <Button onClick={() => setFormulario({})}>
                <Plus aria-hidden="true" />
                Nova disciplina
              </Button>
            )}
          </EmptyState>
        </Card>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 min-[1600px]:grid-cols-4">
          {disciplinas.map((disciplina) => {
            const conteudos = conteudosDaDisciplina(disciplina.id);
            const qtdAtividades = atividadesDaDisciplina(disciplina.id).length;
            return (
              <Card as="li" key={disciplina.id} className="flex flex-col overflow-hidden">
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-3 shrink-0 rounded-[4px]"
                      style={{ background: disciplina.cor }}
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-forte">
                        <Link to={`/disciplina/${disciplina.id}`} className="hover:text-primaria-texto">
                          {disciplina.nome}
                        </Link>
                      </h2>
                      <p className="text-[13px] text-sutil">
                        {plural(qtdAtividades, 'atividade')}
                        {conteudos.length > 0 && ` · ${plural(conteudos.length, 'conteúdo')}`}
                      </p>
                    </div>
                    {ehOrganizador && (
                      <MenuRaiz>
                        <MenuGatilho asChild>
                          <Button variante="fantasma" tamanho="icone-sm" aria-label={`Ações de ${disciplina.nome}`}>
                            <Ellipsis />
                          </Button>
                        </MenuGatilho>
                        <MenuConteudo align="end" className="min-w-[180px]">
                          <MenuItem onSelect={() => setFormulario({ disciplina })}>
                            <Pencil aria-hidden="true" />
                            Editar
                          </MenuItem>
                          <MenuItem perigo onSelect={() => setRemovendo(disciplina)}>
                            <Trash2 aria-hidden="true" />
                            Remover
                          </MenuItem>
                        </MenuConteudo>
                      </MenuRaiz>
                    )}
                  </div>

                  <BarraProgresso progresso={progressoDaDisciplina(disciplina.id)} cor={disciplina.cor} />

                  {conteudos.length > 0 ? (
                    <ul className="flex flex-col gap-2.5 border-t border-divisor pt-4">
                      {conteudos.map((conteudo) => {
                        const progresso = progressoDoConteudo(conteudo.id);
                        return (
                          <li key={conteudo.id} className="flex flex-col gap-1.5">
                            <span className="flex items-baseline justify-between gap-3 text-sm">
                              <span className="min-w-0 truncate text-texto">{conteudo.nome}</span>
                              <span className="numero shrink-0 text-[13px] text-sutil">
                                {progresso ? `${progresso.percentual}%` : 'sem atividade'}
                              </span>
                            </span>
                            <span aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-superficie-3">
                              <span
                                className="block h-full rounded-full"
                                style={{
                                  width: `${progresso ? Math.round(progresso.fracao * 1000) / 10 : 0}%`,
                                  background: disciplina.cor,
                                }}
                              />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
                <div className="border-t border-divisor px-5 py-3">
                  <Link
                    to={`/disciplina/${disciplina.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primaria-texto hover:underline"
                  >
                    Abrir disciplina
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </ul>
      )}

      {formulario && (
        <FormDisciplina
          key={formulario.disciplina?.id ?? 'nova'}
          aberto
          aoMudar={(abrir) => !abrir && setFormulario(null)}
          disciplina={formulario.disciplina}
          disciplinas={disciplinas}
          aoSalvar={salvar}
        />
      )}

      <Confirmacao
        aberto={Boolean(removendo)}
        titulo="Remover disciplina?"
        mensagem={mensagemRemocao}
        textoConfirmar="Remover"
        perigo
        onConfirmar={confirmarRemocao}
        onCancelar={() => setRemovendo(null)}
      />
    </>
  );
}

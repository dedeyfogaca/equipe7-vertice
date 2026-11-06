import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Ellipsis, Lock, Pencil, Trash2, UserPlus, Users } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useTitulo } from '../hooks/useTitulo.js';
import { Avatar } from '../components/ui/avatar-membro.jsx';
import { Aviso, Badge, Card, EmptyState, PageHeader } from '../components/ui/basicos.jsx';
import { Button } from '../components/ui/botao.jsx';
import { Field } from '../components/ui/campos.jsx';
import { SelectRico } from '../components/ui/selecao.jsx';
import { opcoesMembros } from '../components/opcoes.jsx';
import { Confirmacao } from '../components/ui/dialogo.jsx';
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz } from '../components/ui/flutuantes.jsx';
import { FormMembro } from '../components/membros/FormMembro.jsx';
import { PERFIL, rotuloPerfil } from '../lib/constants.js';
import { ultimoOrganizador } from '../lib/validacao.js';
import { plural, primeiroNome } from '../lib/utils.js';

function Numero({ rotulo, valor, className }) {
  return (
    <div className="flex flex-col-reverse items-center gap-0.5">
      <dt className="text-[12px] text-sutil">{rotulo}</dt>
      <dd className={className ?? 'numero text-lg font-bold text-forte'}>{valor}</dd>
    </div>
  );
}

export default function Membros() {
  useTitulo('Membros');
  const navigate = useNavigate();
  const { grupoAtivo, membroAtivo, ehOrganizador, identificar, sair } = useAuth();
  const {
    membrosDoGrupo,
    atividadesDoGrupo,
    rankingDoGrupo,
    criarMembro,
    atualizarMembro,
    removerMembro,
    removerGrupo,
  } = useData();

  const membros = membrosDoGrupo(grupoAtivo.id);
  const atividades = atividadesDoGrupo(grupoAtivo.id);
  const ranking = rankingDoGrupo(grupoAtivo.id);
  const dadosDe = useMemo(() => Object.fromEntries(ranking.map((l) => [l.membro.id, l])), [ranking]);

  const atividadesPorMembro = useMemo(() => {
    const mapa = {};
    atividades.forEach((a) => {
      if (a.responsavelId) mapa[a.responsavelId] = (mapa[a.responsavelId] || 0) + 1;
    });
    return mapa;
  }, [atividades]);

  // `formulario`: null, {} (novo), { membro } (edição) ou { membro, proprio }.
  const [formulario, setFormulario] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [excluindoGrupo, setExcluindoGrupo] = useState(false);

  const salvar = (dados) => {
    if (formulario?.membro) {
      atualizarMembro(formulario.membro.id, dados);
      toast.success(formulario.proprio ? 'Perfil atualizado' : 'Membro atualizado', { description: dados.nome });
    } else {
      const criado = criarMembro({ ...dados, grupoId: grupoAtivo.id });
      toast.success('Membro adicionado', { description: criado.nome });
      // Grupo antigo, ainda vazio: quem está montando é o primeiro membro.
      if (!membroAtivo && membros.length === 0) identificar(criado.id);
    }
    setFormulario(null);
  };

  const pedirRemocao = (membro) => {
    setNovoResponsavel('');
    setRemovendo(membro);
  };

  const qtdRemovendo = removendo ? atividadesPorMembro[removendo.id] || 0 : 0;
  const quemAssume = membros.filter((m) => m.id !== removendo?.id);

  // RN02 + RN06: as atividades do membro removido passam para quem a pessoa
  // escolher: nenhuma atividade fica sem responsável.
  const confirmarRemocao = () => {
    const assume = membros.find((m) => m.id === novoResponsavel);
    removerMembro(removendo.id, qtdRemovendo > 0 ? novoResponsavel : '');
    toast('Membro removido', {
      description:
        qtdRemovendo > 0 && assume
          ? `${plural(qtdRemovendo, 'atividade')} de ${primeiroNome(removendo.nome)} ${qtdRemovendo === 1 ? 'passou' : 'passaram'} para ${primeiroNome(assume.nome)}.`
          : removendo.nome,
    });
    setRemovendo(null);
  };

  // RN07 + RN02: só o organizador exclui o grupo, e o grupo leva tudo junto.
  const excluirGrupo = () => {
    const id = grupoAtivo.id;
    const nome = grupoAtivo.nome;
    setExcluindoGrupo(false);
    sair();
    removerGrupo(id);
    toast('Grupo excluído', { description: nome });
    navigate('/entrar', { replace: true });
  };

  // A página ocupa a altura toda da tela, para a exclusão do grupo ficar
  // sempre no pé dela, longe das ações do dia a dia.
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        titulo="Membros"
        subtitulo={`${plural(membros.length, 'pessoa')} no grupo`}
        acoes={
          ehOrganizador && (
            <Button onClick={() => setFormulario({})}>
              <UserPlus aria-hidden="true" />
              Adicionar membro
            </Button>
          )
        }
      />

      {!ehOrganizador && (
        <Aviso icone={Lock} className="mb-5">
          Só o organizador do grupo cadastra e edita membros. Você pode editar o seu próprio perfil.
        </Aviso>
      )}

      {membros.length === 0 ? (
        <Card>
          <EmptyState
            icone={Users}
            titulo="Nenhum membro ainda"
            descricao="Cadastre as pessoas do grupo. Depois elas poderão ser responsáveis pelas atividades."
          >
            {ehOrganizador && (
              <Button onClick={() => setFormulario({})}>
                <UserPlus aria-hidden="true" />
                Adicionar membro
              </Button>
            )}
          </EmptyState>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {membros.map((membro) => {
            const eu = membro.id === membroAtivo?.id;
            const dados = dadosDe[membro.id];
            const travado = ultimoOrganizador(membro.id, membros);
            const podeEditar = ehOrganizador || eu;
            return (
              <Card as="li" key={membro.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3.5">
                  <Avatar membro={membro} tamanho={56} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate text-base font-semibold text-forte">{membro.nome}</span>
                      {eu && <Badge tom="contorno">Você</Badge>}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-sutil">
                      <Badge tom={membro.perfil === PERFIL.ORGANIZADOR ? 'primaria' : 'neutro'}>
                        {rotuloPerfil(membro.perfil)}
                      </Badge>
                      {membro.funcao && <span className="truncate">{membro.funcao}</span>}
                    </p>
                    {membro.email && <p className="mt-1 truncate text-[13px] text-sutil">{membro.email}</p>}
                  </div>
                  {podeEditar && (
                    <MenuRaiz>
                      <MenuGatilho asChild>
                        <Button variante="fantasma" tamanho="icone-sm" aria-label={`Ações de ${membro.nome}`}>
                          <Ellipsis />
                        </Button>
                      </MenuGatilho>
                      <MenuConteudo align="end" className="min-w-[200px]">
                        <MenuItem
                          onSelect={() =>
                            setFormulario({ membro, proprio: eu && !ehOrganizador })
                          }
                        >
                          <Pencil aria-hidden="true" />
                          {eu && !ehOrganizador ? 'Editar meu perfil' : 'Editar'}
                        </MenuItem>
                        {ehOrganizador && (
                          // RN07: o último organizador não sai: o grupo
                          // ficaria sem ninguém para geri-lo.
                          <MenuItem
                            perigo
                            disabled={travado}
                            onSelect={() => pedirRemocao(membro)}
                            className="data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60"
                          >
                            <Trash2 aria-hidden="true" />
                            <span className="flex flex-col">
                              Remover
                              {travado && (
                                <span className="text-[12px] font-normal text-sutil">
                                  O grupo precisa de um organizador
                                </span>
                              )}
                            </span>
                          </MenuItem>
                        )}
                      </MenuConteudo>
                    </MenuRaiz>
                  )}
                </div>
                <dl className="mt-auto grid grid-cols-3 gap-2 rounded-2xl bg-superficie-2 px-2 py-3">
                  <Numero rotulo="experiência" valor={`${dados?.xp ?? 0} XP`} className="numero text-lg font-bold text-gam-texto" />
                  <Numero
                    rotulo={(atividadesPorMembro[membro.id] || 0) === 1 ? 'atividade' : 'atividades'}
                    valor={atividadesPorMembro[membro.id] || 0}
                  />
                  <Numero rotulo="de ofensiva" valor={plural(dados?.ofensiva ?? 0, 'dia')} />
                </dl>
              </Card>
            );
          })}
        </ul>
      )}

      {/* RN07: só o organizador exclui o grupo. Fica no pé da página. */}
      {ehOrganizador && (
        <div className="mt-auto pt-10">
        <section
          aria-labelledby="t-perigo"
          className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-perigo/30 p-5 sm:p-6"
        >
          <div className="max-w-xl">
            <h2 id="t-perigo" className="text-[17px] font-semibold tracking-[-0.02em] text-forte">
              Excluir o grupo
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-sutil">
              O grupo <strong className="font-semibold text-texto">{grupoAtivo.nome}</strong> sai com todos os
              seus membros, disciplinas, conteúdos, atividades e eventos. Não dá para desfazer.
            </p>
          </div>
          <Button variante="perigo-contorno" onClick={() => setExcluindoGrupo(true)}>
            <Trash2 aria-hidden="true" />
            Excluir grupo
          </Button>
        </section>
        </div>
      )}

      {formulario && (
        <FormMembro
          key={formulario.membro?.id ?? 'novo'}
          aberto
          aoMudar={(abrir) => !abrir && setFormulario(null)}
          membro={formulario.membro}
          membros={membros}
          proprioPerfil={Boolean(formulario.proprio)}
          aoSalvar={salvar}
        />
      )}

      <Confirmacao
        aberto={Boolean(removendo)}
        titulo="Remover membro?"
        mensagem={
          qtdRemovendo > 0
            ? `${removendo?.nome} é responsável por ${plural(qtdRemovendo, 'atividade')}. Toda atividade precisa de um responsável: escolha quem assume antes de remover.`
            : `${removendo?.nome} será removido do grupo.`
        }
        textoConfirmar="Remover"
        perigo
        podeConfirmar={qtdRemovendo === 0 || Boolean(novoResponsavel)}
        onConfirmar={confirmarRemocao}
        onCancelar={() => setRemovendo(null)}
      >
        {qtdRemovendo > 0 && (
          <Field id="novo-responsavel" label="Quem assume as atividades?" obrigatorio>
            <SelectRico
              valor={novoResponsavel}
              aoMudar={setNovoResponsavel}
              opcoes={opcoesMembros(quemAssume, { voceId: membroAtivo?.id })}
              placeholder="Selecione um membro"
            />
          </Field>
        )}
      </Confirmacao>

      <Confirmacao
        aberto={excluindoGrupo}
        titulo="Excluir o grupo?"
        mensagem={`O grupo "${grupoAtivo.nome}" será excluído com todos os seus membros, disciplinas, conteúdos, atividades e eventos. Essa ação não pode ser desfeita.`}
        textoConfirmar="Confirmar exclusão"
        perigo
        onConfirmar={excluirGrupo}
        onCancelar={() => setExcluindoGrupo(false)}
      />
    </div>
  );
}

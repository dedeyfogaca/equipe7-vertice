import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useTitulo } from '../../hooks/useTitulo.js';
import { BotaoTema } from '../../components/BotaoTema.jsx';
import { DICA_FOTO_GRUPO } from '../../components/grupos/FormGrupo.jsx';
import { RodapePublico } from '../../components/layout/LayoutPublico.jsx';
import { Avatar } from '../../components/ui/avatar-membro.jsx';
import { AvatarGrupo } from '../../components/ui/avatar-grupo.jsx';
import { Button } from '../../components/ui/botao.jsx';
import { Card, Rotulo } from '../../components/ui/basicos.jsx';
import { Field, Input } from '../../components/ui/campos.jsx';
import { CampoFoto } from '../../components/ui/editor-foto.jsx';
import { MarcaVertice } from '../../components/ui/marca.jsx';
import { useTransicaoGrupo } from '../../components/layout/TransicaoGrupo.jsx';
import { rotuloPerfil } from '../../lib/constants.js';
import { gerarDadosExemplo } from '../../lib/seed.js';
import { semErros, validarGrupo } from '../../lib/validacao.js';
import { plural, semErroEm } from '../../lib/utils.js';

// Tela de acesso, em dois passos: primeiro o grupo, depois quem você é
// dentro dele. Nenhum dos dois tem senha — são seleções. O login com Google
// e e-mail chega com o banco de dados, na próxima etapa do projeto.

const classeOpcao =
  'group flex w-full items-center gap-3 rounded-2xl border border-borda bg-superficie-2 p-3 text-left transition-colors hover:border-primaria-barra/60 hover:bg-superficie-3';

export default function Entrar() {
  const { autenticado, precisaIdentificar, grupoAtivo, membrosDoGrupoAtivo, entrar, identificar, sair } =
    useAuth();
  const { grupos, membros, criarGrupo, importarExemplo } = useData();
  const location = useLocation();
  const destino = location.state?.de || '/painel';
  useTitulo(precisaIdentificar ? 'Quem é você?' : 'Entrar');

  const [form, setForm] = useState({ nome: '', criador: '', descricao: '', foto: '' });
  const [erros, setErros] = useState({});
  const { abrirGrupo, emCurso } = useTransicaoGrupo();

  // Sessão completa: grupo escolhido e pessoa identificada. (Durante a
  // passagem para o painel, quem navega é a transição.)
  if (autenticado && !precisaIdentificar && !emCurso) {
    return <Navigate to={destino} replace />;
  }

  // A cortina cobre a tela de acesso; só então a sessão abre e o painel
  // monta por baixo (ver components/layout/TransicaoGrupo.jsx).
  const abrir = (nome, aoCobrir, para = destino) => abrirGrupo(nome, { aoCobrir, destino: para });

  const atualizarCampo = (campo) => (evento) => {
    const valor = evento.target.value;
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => semErroEm(atual, campo));
  };

  // Grupo com gente dentro: a pessoa ainda precisa dizer quem é (RN07).
  // Grupo vazio (dado antigo) entra direto — alguém tem que poder montá-lo.
  const entrarNoGrupo = (id) => {
    const temMembros = membros.some((m) => m.grupoId === id);
    if (temMembros) entrar(id);
    else abrir(grupos.find((g) => g.id === id)?.nome, () => entrar(id));
  };

  const escolherMembro = (id) => {
    abrir(grupoAtivo?.nome, () => identificar(id));
  };

  // RF01 — quem cria o grupo entra como o primeiro membro e organizador.
  const criar = (evento) => {
    evento.preventDefault();
    const novosErros = validarGrupo(form);
    setErros(novosErros);
    if (!semErros(novosErros)) {
      document.getElementById(novosErros.nome ? 'nome' : 'criador')?.focus();
      return;
    }
    const dados = form;
    abrir(
      dados.nome.trim(),
      () => {
        const { grupo, membro } = criarGrupo(dados);
        entrar(grupo.id, membro.id);
        toast.success('Grupo criado', { description: `Você é o organizador de ${grupo.nome}.` });
      },
      '/painel'
    );
  };

  const carregarExemplo = () => {
    const pacote = gerarDadosExemplo();
    importarExemplo(pacote);
    entrar(pacote.grupo.id);
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-fundo text-texto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgb(8_145_178/0.1),transparent_70%)] dark:bg-[radial-gradient(55%_45%_at_50%_0%,rgb(34_211_238/0.12),transparent_70%)]"
      />
      <header className="relative mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-6 py-5">
        <Link to="/" aria-label="Vértice, página inicial" className="rounded-lg">
          <MarcaVertice />
        </Link>
        <div className="flex items-center gap-1.5">
          <Link to="/" className="inline-flex items-center gap-1.5 px-2 text-sm font-medium text-suave hover:text-primaria">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar ao início
          </Link>
          <BotaoTema />
        </div>
      </header>

      <main id="conteudo" className="relative flex flex-1 justify-center px-4 pb-16 pt-6 sm:items-center sm:pt-2">
        <div className="w-full max-w-[460px]">
          <div className="mb-6 text-center">
            <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.04em] text-forte">
              {precisaIdentificar ? 'Quem é você?' : 'Acesse seu grupo'}
            </h1>
            <p className="mt-2 text-balance text-[15px] text-sutil">
              {precisaIdentificar
                ? 'Escolha o seu nome para entrar. É ele que decide o que você pode gerenciar.'
                : grupos.length > 0
                  ? 'Entre num grupo que já existe ou crie um novo.'
                  : 'Crie o grupo para começar. Depois é só cadastrar quem estuda com você.'}
            </p>
          </div>

          <Card className="p-6 shadow-flutuante sm:p-7">
            {precisaIdentificar ? (
              <>
                <p className="mb-3 text-sm text-sutil">
                  Em <strong className="font-semibold text-texto">{grupoAtivo?.nome}</strong>
                </p>
                <ul className="flex flex-col gap-2">
                  {membrosDoGrupoAtivo.map((membro) => (
                    <li key={membro.id}>
                      <button type="button" onClick={() => escolherMembro(membro.id)} className={classeOpcao}>
                        <Avatar membro={membro} tamanho={40} decorativo />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-semibold text-forte">{membro.nome}</span>
                          <span className="truncate text-[13px] text-sutil">
                            {rotuloPerfil(membro.perfil)}
                            {membro.funcao ? ` · ${membro.funcao}` : ''}
                          </span>
                        </span>
                        <ArrowRight
                          className="size-4 shrink-0 text-sutil transition-colors group-hover:text-primaria"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 text-center">
                  <Button variante="link" onClick={sair}>
                    Trocar de grupo
                  </Button>
                </div>
              </>
            ) : (
              <>
                {grupos.length > 0 && (
                  <>
                    <Rotulo as="h2" className="mb-3 block">
                      Seus grupos
                    </Rotulo>
                    <ul className="flex flex-col gap-2">
                      {grupos.map((grupo) => {
                        const qtd = membros.filter((m) => m.grupoId === grupo.id).length;
                        return (
                          <li key={grupo.id}>
                            <button type="button" onClick={() => entrarNoGrupo(grupo.id)} className={classeOpcao}>
                              <AvatarGrupo grupo={grupo} tamanho={40} tom="suave" />
                              <span className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate font-semibold text-forte">{grupo.nome}</span>
                                <span className="truncate text-[13px] text-sutil">
                                  {plural(qtd, 'membro')}
                                  {grupo.descricao ? ` · ${grupo.descricao}` : ''}
                                </span>
                              </span>
                              <ArrowRight
                                className="size-4 shrink-0 text-sutil transition-colors group-hover:text-primaria"
                                aria-hidden="true"
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="my-6 flex items-center gap-3 text-[13px] text-sutil before:h-px before:flex-1 before:bg-borda after:h-px after:flex-1 after:bg-borda">
                      ou crie um novo
                    </div>
                  </>
                )}

                <form onSubmit={criar} noValidate className="flex flex-col gap-4">
                  {grupos.length === 0 && (
                    <Rotulo as="h2" className="block">
                      Criar um grupo
                    </Rotulo>
                  )}
                  <Field id="nome" label="Nome do grupo" obrigatorio erro={erros.nome}>
                    <Input
                      value={form.nome}
                      onChange={atualizarCampo('nome')}
                      placeholder="Ex.: Trio do TCC"
                      autoComplete="off"
                    />
                  </Field>
                  <Field
                    id="criador"
                    label="Seu nome"
                    obrigatorio
                    erro={erros.criador}
                    dica="Você entra como organizador do grupo."
                  >
                    <Input
                      value={form.criador}
                      onChange={atualizarCampo('criador')}
                      placeholder="Ex.: Ana Souza"
                      autoComplete="name"
                    />
                  </Field>
                  <Field id="descricao" label="Descrição" dica="Opcional. Uma linha sobre o grupo.">
                    <Input
                      value={form.descricao}
                      onChange={atualizarCampo('descricao')}
                      placeholder="Ex.: Grupo de Front-End"
                      autoComplete="off"
                    />
                  </Field>
                  <CampoFoto
                    id="foto-grupo"
                    foto={form.foto}
                    aoMudar={(foto) => setForm((atual) => ({ ...atual, foto }))}
                    forma="quadrado"
                    rotulo="Foto do grupo"
                    dica={DICA_FOTO_GRUPO}
                    previa={<AvatarGrupo grupo={{ nome: form.nome || 'Novo grupo', foto: form.foto }} tamanho={56} />}
                  />
                  <Button type="submit" tamanho="lg" className="mt-1 w-full">
                    Criar grupo e entrar
                  </Button>
                </form>

                <div className="mt-5 text-center">
                  <Button variante="link" onClick={carregarExemplo}>
                    Carregar dados de exemplo
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>

      <RodapePublico />
    </div>
  );
}

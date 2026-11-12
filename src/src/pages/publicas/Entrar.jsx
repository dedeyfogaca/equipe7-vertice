import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, LogOut, Sparkles, UserRound, UsersRound } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useConta } from '../../context/ContaContext.jsx';
import { useTitulo } from '../../hooks/useTitulo.js';
import { BotaoTema } from '../../components/BotaoTema.jsx';
import { TelaCarregando } from '../../components/TelaCarregando.jsx';
import { PainelLogin } from '../../components/conta/PainelLogin.jsx';
import { EntrarComCodigo } from '../../components/conta/EntrarComCodigo.jsx';
import { DICA_FOTO_GRUPO } from '../../components/grupos/FormGrupo.jsx';
import { RodapePublico } from '../../components/layout/LayoutPublico.jsx';
import { Avatar } from '../../components/ui/avatar-membro.jsx';
import { AvatarGrupo } from '../../components/ui/avatar-grupo.jsx';
import { Button } from '../../components/ui/botao.jsx';
import { Card } from '../../components/ui/basicos.jsx';
import { Field, Input } from '../../components/ui/campos.jsx';
import { CampoFoto } from '../../components/ui/editor-foto.jsx';
import { MarcaVertice } from '../../components/ui/marca.jsx';
import { useTransicaoGrupo } from '../../components/layout/TransicaoGrupo.jsx';
import { rotuloPerfil } from '../../lib/constants.js';
import { gerarDadosExemplo, gerarExemploPessoal } from '../../lib/seed.js';
import { lerConvitePendente } from '../../lib/convite.js';
import { semErros, validarGrupo, validarPerfil } from '../../lib/validacao.js';
import { cn, plural, semErroEm } from '../../lib/utils.js';

// Tela de acesso.
//   * sem conta e fora da demonstração: login (RF27) ou "experimentar sem conta";
//   * com conta: a pessoa vai direto para o espaço pessoal (RF34), que o
//     banco cria no primeiro acesso. Os grupos, o convite e o grupo novo
//     ficam no seletor de espaço, dentro do sistema;
//   * demonstração, na primeira vez: o nome da pessoa, que cria o perfil e o
//     espaço pessoal deste navegador (com ou sem dados de exemplo);
//   * demonstração, num grupo antigo sem ninguém marcado: quem você é
//     dentro dele (seleção, sem senha).
//
// Se o espaço pessoal não abrir com conta (o banco ainda sem a atualização
// de 11/11), sobra o acesso antigo: os grupos da conta, o código de convite
// e o cadastro de um grupo novo, em duas colunas.

const classeOpcao =
  'group flex w-full items-center gap-3 rounded-2xl border border-borda bg-superficie-2 p-3 text-left transition-colors hover:border-primaria-barra/60 hover:bg-superficie-3';

export default function Entrar() {
  const { autenticado, precisaIdentificar, grupoAtivo, membrosDoGrupoAtivo, entrar, identificar, sair } =
    useAuth();
  const { grupos, membros, criarGrupo, importarExemplo, carregando, perfil, espacoPessoal, meuUsuarioId, criarEspacoPessoal } =
    useData();
  const { modo, temBanco, verificando, usuario, nomeDaConta, sairDaConta, sairDaDemonstracao } = useConta();
  const comConta = modo === 'conta';
  const location = useLocation();
  const destino = location.state?.de || '/painel';
  useTitulo(precisaIdentificar ? 'Quem é você?' : 'Entrar');
  // Demonstração sem perfil: a pessoa ainda não disse o nome.
  const primeiraVezNaDemo = modo === 'demo' && !espacoPessoal;
  // Dado antigo da demonstração: o membro marcado como a pessoa já tem nome.
  const [nomeDemo, setNomeDemo] = useState(
    () => membros.find((m) => m.usuarioId === meuUsuarioId)?.nome || ''
  );

  const [form, setForm] = useState({ nome: '', criador: '', descricao: '', foto: '' });
  const [erros, setErros] = useState({});
  const { abrirGrupo, emCurso } = useTransicaoGrupo();

  // Com conta, o "Seu nome" do grupo novo já vem com o nome da conta.
  useEffect(() => {
    if (nomeDaConta) setForm((atual) => (atual.criador ? atual : { ...atual, criador: nomeDaConta }));
  }, [nomeDaConta]);

  if (verificando || (comConta && carregando)) return <TelaCarregando />;

  // Sessão completa: grupo escolhido e pessoa identificada. (Durante a
  // passagem para o painel, quem navega é a transição.)
  if (autenticado && !precisaIdentificar && !primeiraVezNaDemo && !emCurso) {
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
  // Grupo vazio (dado antigo) entra direto: alguém tem que poder montá-lo.
  const entrarNoGrupo = (id) => {
    const temMembros = membros.some((m) => m.grupoId === id);
    if (temMembros && !comConta) entrar(id);
    else abrir(grupos.find((g) => g.id === id)?.nome, () => entrar(id));
  };

  const escolherMembro = (id) => {
    abrir(grupoAtivo?.nome, () => identificar(id));
  };

  // RF01: quem cria o grupo entra como o primeiro membro e organizador.
  const criar = (evento) => {
    evento.preventDefault();
    const novosErros = validarGrupo(form, { exigirCriador: !perfil });
    setErros(novosErros);
    if (!semErros(novosErros)) {
      document.getElementById(novosErros.nome ? 'nome' : 'criador')?.focus();
      return;
    }
    const dados = form;
    abrir(
      dados.nome.trim(),
      () => {
        const { grupo } = criarGrupo(dados);
        entrar(grupo.id);
        toast.success('Grupo criado', { description: `Você é o organizador de ${grupo.nome}.` });
      },
      '/painel'
    );
  };

  const carregarExemplo = () => {
    const pacote = gerarDadosExemplo({ usuarioId: meuUsuarioId });
    importarExemplo(pacote);
    entrar(pacote.grupo.id);
  };

  // RF34 na demonstração: o nome cria o perfil e o espaço pessoal. Com os
  // exemplos, entram também algumas atividades do dia a dia e o grupo de
  // exemplo, em que a pessoa é a organizadora.
  const comecarDemo = (comExemplos) => {
    const novosErros = validarPerfil({ nome: nomeDemo });
    setErros(novosErros);
    if (!semErros(novosErros)) {
      document.getElementById('nome-demo')?.focus();
      return;
    }
    abrir(
      'seu espaço',
      () => {
        const { grupo, membro } = criarEspacoPessoal({ nome: nomeDemo });
        if (comExemplos) {
          importarExemplo(gerarExemploPessoal({ grupoId: grupo.id, membroId: membro.id }));
          importarExemplo(gerarDadosExemplo({ usuarioId: meuUsuarioId }));
        }
        entrar(grupo.id);
      },
      '/painel'
    );
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
          {comConta && (
            <span className="mr-1 hidden max-w-[220px] truncate text-[13px] text-sutil sm:inline" title={usuario?.email}>
              {usuario?.email}
            </span>
          )}
          {comConta && (
            <Button variante="fantasma" tamanho="sm" onClick={sairDaConta}>
              <LogOut aria-hidden="true" />
              Sair da conta
            </Button>
          )}
          <Link to="/" className="inline-flex items-center gap-1.5 px-2 text-sm font-medium text-suave hover:text-primaria">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar ao início
          </Link>
          <BotaoTema />
        </div>
      </header>

      <main
        id="conteudo"
        className={cn(
          'relative mx-auto flex w-full flex-1 justify-center px-4 pb-16 pt-6',
          (precisaIdentificar || primeiraVezNaDemo) && modo
            ? 'max-w-[492px] sm:items-center sm:pt-2'
            : 'max-w-[1080px] lg:pt-10'
        )}
      >
        <div className="w-full">
          <div className="mb-7 text-center">
            <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.04em] text-forte">
              {!modo
                ? 'Entre no Vértice'
                : primeiraVezNaDemo
                  ? 'Como podemos te chamar?'
                  : precisaIdentificar
                    ? 'Quem é você?'
                    : 'Acesse seu grupo'}
            </h1>
            <p className="mt-2 text-balance text-[15px] text-sutil">
              {!modo
                ? 'Com a sua conta, o grupo inteiro vê as mesmas disciplinas, atividades e eventos.'
                : primeiraVezNaDemo
                  ? 'Você ganha um espaço pessoal para organizar o que é só seu. Os grupos vêm depois.'
                  : precisaIdentificar
                  ? 'Escolha o seu nome para entrar. É ele que decide o que você pode gerenciar.'
                  : comConta
                    ? 'Entre num grupo seu, use um código de convite ou crie um grupo novo.'
                    : 'Entre num grupo que já existe ou crie um novo.'}
            </p>
          </div>

          {modo === 'demo' && temBanco && !precisaIdentificar && (
            <div className="mb-5 flex flex-col items-start gap-3 rounded-2xl border border-borda bg-superficie px-4 py-3 text-[14px] text-sutil sm:flex-row sm:items-center sm:justify-between">
              <p>
                <strong className="font-semibold text-texto">Modo de demonstração.</strong>{' '}
                {lerConvitePendente()
                  ? 'Para aceitar o convite do seu grupo, entre com uma conta.'
                  : 'Os dados ficam só neste navegador.'}
              </p>
              <Button variante="secundaria" tamanho="sm" onClick={sairDaDemonstracao}>
                Entrar com conta
              </Button>
            </div>
          )}

          {!modo ? (
            <PainelLogin convite={Boolean(lerConvitePendente())} />
          ) : primeiraVezNaDemo ? (
            <Card className="p-6 shadow-flutuante sm:p-7">
              <form
                noValidate
                onSubmit={(evento) => {
                  evento.preventDefault();
                  comecarDemo(false);
                }}
                className="flex flex-col gap-4"
              >
                <Field id="nome-demo" label="Seu nome" obrigatorio erro={erros.nome}>
                  <Input
                    value={nomeDemo}
                    onChange={(evento) => {
                      setNomeDemo(evento.target.value);
                      setErros((atual) => semErroEm(atual, 'nome'));
                    }}
                    placeholder="Ex.: Ana Souza"
                    autoComplete="name"
                    autoFocus
                  />
                </Field>
                <Button type="submit" tamanho="lg" className="w-full">
                  <UserRound aria-hidden="true" />
                  Começar
                </Button>
                <Button type="button" variante="secundaria" className="w-full" onClick={() => comecarDemo(true)}>
                  <Sparkles aria-hidden="true" />
                  Começar com dados de exemplo
                </Button>
                <p className="text-center text-[13px] leading-relaxed text-sutil">
                  Com os exemplos, você ganha algumas atividades do dia a dia e um grupo de TCC pronto, em que você é o
                  organizador.
                </p>
              </form>
            </Card>
          ) : precisaIdentificar ? (
            <Card className="p-6 shadow-flutuante sm:p-7">
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
                        className="size-4 shrink-0 text-sutil transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primaria"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-5 text-center">
                <Button variante="link" onClick={sair}>
                  {espacoPessoal ? 'Voltar ao espaço pessoal' : 'Trocar de grupo'}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
              {/* Coluna 1: os grupos que já existem neste navegador. */}
              <Card as="section" aria-labelledby="t-seus-grupos" className="flex flex-col p-6 shadow-flutuante sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primaria-barra/10 text-primaria-texto">
                    <UsersRound className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col">
                    <h2 id="t-seus-grupos" className="text-[19px] font-semibold tracking-[-0.02em] text-forte">
                      Seus grupos
                    </h2>
                    <p className="text-[13px] text-sutil">
                      {grupos.length > 0
                        ? `${plural(grupos.length, 'grupo')} ${comConta ? 'na sua conta' : 'neste navegador'}`
                        : 'Nenhum grupo ainda'}
                    </p>
                  </div>
                </div>

                {grupos.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {grupos.map((grupo) => {
                      const qtd = membros.filter((m) => m.grupoId === grupo.id && !m.saiuEm).length;
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
                              className="size-4 shrink-0 text-sutil transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primaria"
                              aria-hidden="true"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-borda px-4 py-5 text-[14px] leading-relaxed text-sutil">
                    {comConta
                      ? 'Os grupos que você criar ou em que for convidado aparecem aqui.'
                      : 'Os grupos que você criar aparecem aqui. Quer só conhecer o sistema? Carregue um grupo de exemplo, com disciplinas, atividades e eventos prontos.'}
                  </p>
                )}

                <div className="mt-5 border-t border-divisor pt-4">
                  {comConta ? (
                    <EntrarComCodigo aoEntrar={(id, nome) => abrir(nome, () => entrar(id))} />
                  ) : (
                    <Button variante="secundaria" className="w-full" onClick={carregarExemplo}>
                      <Sparkles aria-hidden="true" />
                      Carregar dados de exemplo
                    </Button>
                  )}
                </div>
              </Card>

              {/* Coluna 2: criar um grupo novo. */}
              <Card as="section" aria-labelledby="t-criar-grupo" className="p-6 shadow-flutuante sm:p-7">
                <div className="mb-5 flex flex-col">
                  <h2 id="t-criar-grupo" className="text-[19px] font-semibold tracking-[-0.02em] text-forte">
                    Criar um grupo
                  </h2>
                  <p className="text-[13px] text-sutil">Você entra como organizador e chama o resto da turma depois.</p>
                </div>
                <form onSubmit={criar} noValidate className="flex flex-col gap-4">
                  <Field id="nome" label="Nome do grupo" obrigatorio erro={erros.nome}>
                    <Input
                      value={form.nome}
                      onChange={atualizarCampo('nome')}
                      placeholder="Ex.: Trio do TCC"
                      autoComplete="off"
                    />
                  </Field>
                  {!perfil && (
                    <Field id="criador" label="Seu nome" obrigatorio erro={erros.criador}>
                      <Input
                        value={form.criador}
                        onChange={atualizarCampo('criador')}
                        placeholder="Ex.: Ana Souza"
                        autoComplete="name"
                      />
                    </Field>
                  )}
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
              </Card>
            </div>
          )}
        </div>
      </main>

      <RodapePublico />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Compass,
  House,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquareText,
  Menu,
  Pencil,
  Plus,
  Sparkles,
  Ticket,
  TriangleAlert,
  Trophy,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useConta } from '../../context/ContaContext.jsx';
import { BotaoTema } from '../BotaoTema.jsx';
import { Avatar } from '../ui/avatar-membro.jsx';
import { AvatarGrupo } from '../ui/avatar-grupo.jsx';
import { Aviso } from '../ui/basicos.jsx';
import { Button } from '../ui/botao.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz, MenuRotulo, MenuSeparador } from '../ui/flutuantes.jsx';
import { MarcaVertice } from '../ui/marca.jsx';
import { FormGrupo } from '../grupos/FormGrupo.jsx';
import { EntrarComCodigo } from '../conta/EntrarComCodigo.jsx';
import { TutorialProvider, useTutorial } from '../tutorial/Tutorial.jsx';
import { obterConquista } from '../../lib/gamificacao.js';
import { rotuloPerfil } from '../../lib/constants.js';
import { LINK_FEEDBACK, temFormularioFeedback } from '../../lib/feedback.js';
import { entrarComCodigo, lerConvitePendente, limparConvitePendente } from '../../lib/convite.js';
import { gerarDadosExemplo } from '../../lib/seed.js';
import { cn, plural } from '../../lib/utils.js';

// Casca das telas internas: a barra no topo com as seções (no celular, um
// menu que desce do topo) e o conteúdo da página embaixo. Também é quem dá
// os avisos que valem para o sistema inteiro: conquista nova ou retirada,
// falha ao salvar e o convite guardado.
//
// O seletor à esquerda troca de espaço (RF34): o pessoal, onde a pessoa
// cai ao entrar, e os grupos dela. Dali também se cria um grupo e se entra
// com um código de convite, sem sair do sistema.

// `soGrupo`: a seção não existe no espaço pessoal (que só tem a própria pessoa).
const SECOES = [
  { para: '/painel', rotulo: 'Painel', icone: LayoutDashboard, prefixos: ['/painel'] },
  { para: '/calendario', rotulo: 'Calendário', icone: CalendarDays, prefixos: ['/calendario'] },
  { para: '/eventos', rotulo: 'Eventos', icone: CalendarClock, prefixos: ['/eventos'] },
  { para: '/disciplinas', rotulo: 'Disciplinas', icone: BookOpen, prefixos: ['/disciplina'] },
  { para: '/atividades', rotulo: 'Atividades', icone: ListChecks, prefixos: ['/atividade'] },
  { para: '/membros', rotulo: 'Membros', icone: Users, prefixos: ['/membros'], soGrupo: true },
  { para: '/conquistas', rotulo: 'Conquistas', icone: Trophy, prefixos: ['/conquistas'] },
];

function useSecoes() {
  const { noEspacoPessoal } = useAuth();
  return SECOES.filter((s) => !(noEspacoPessoal && s.soGrupo));
}

// Ao trocar de espaço, a pessoa continua na mesma seção. A tela de um item
// (uma atividade, uma disciplina) vira a lista, porque o item é do espaço
// anterior; Membros, que o espaço pessoal não tem, vira o painel.
function destinoAoTrocar(pathname, pessoal) {
  const secao = SECOES.find((s) => s.prefixos.some((p) => pathname.startsWith(p)));
  if (!secao || (pessoal && secao.soGrupo)) return '/painel';
  return secao.para;
}

// O "rosto" do espaço: a pessoa, no pessoal; a foto ou as iniciais, no grupo.
function IconeEspaco({ grupo, tamanho }) {
  const { meuMembroEm } = useData();
  if (grupo?.pessoal) return <Avatar membro={meuMembroEm(grupo.id)} tamanho={tamanho} decorativo />;
  return <AvatarGrupo grupo={grupo} tamanho={tamanho} />;
}

function SeletorGrupo({ compacto = false }) {
  const { grupoAtivo, membrosDoGrupoAtivo, ehOrganizador, noEspacoPessoal, espacoPessoal, entrar } = useAuth();
  const { grupos, membrosDoGrupo, atualizarGrupo, criarGrupo, importarExemplo, meuUsuarioId } = useData();
  const { modo } = useConta();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dialogo, setDialogo] = useState(null); // 'editar' | 'criar' | 'codigo'
  const outros = grupos.filter((g) => !g.pessoal);

  const trocar = (grupo) => {
    if (grupo.id === grupoAtivo.id) return;
    entrar(grupo.id);
    navigate(destinoAoTrocar(pathname, grupo.pessoal));
  };

  const salvarGrupo = (dados) => {
    atualizarGrupo(grupoAtivo.id, dados);
    toast.success('Grupo atualizado', { description: dados.nome });
    setDialogo(null);
  };

  const criar = (dados) => {
    const { grupo } = criarGrupo(dados);
    setDialogo(null);
    entrar(grupo.id);
    navigate('/painel');
    toast.success('Grupo criado', { description: `Você é o organizador de ${grupo.nome}. Chame a turma em Membros.` });
  };

  const carregarExemplo = () => {
    const pacote = gerarDadosExemplo({ usuarioId: meuUsuarioId });
    importarExemplo(pacote);
    entrar(pacote.grupo.id);
    navigate('/painel');
    toast.success('Grupo de exemplo carregado', { description: 'Você entrou como organizador do Trio do TCC.' });
  };

  const titulo = noEspacoPessoal ? 'Pessoal' : grupoAtivo.nome;
  const subtitulo = noEspacoPessoal ? 'Seu espaço' : plural(membrosDoGrupoAtivo.length, 'membro');

  return (
    <>
      <MenuRaiz>
        <MenuGatilho asChild>
          {compacto ? (
            // Na barra do topo: a foto (ou as iniciais) do espaço e o nome, que
            // só aparece quando há espaço.
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-left transition-colors hover:bg-superficie-3 data-[state=open]:bg-superficie-3"
            >
              <IconeEspaco grupo={grupoAtivo} tamanho={28} />
              <span className="hidden min-w-0 max-w-[200px] flex-col xl:flex">
                <span className="truncate text-sm font-semibold leading-tight text-forte">{titulo}</span>
                <span className="text-[12px] leading-tight text-sutil">{subtitulo}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-sutil" aria-hidden="true" />
              <span className="sr-only">Espaço atual: {titulo}. Trocar de espaço</span>
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-[14px] border border-borda bg-superficie-2 px-3 py-2.5 text-left transition-colors hover:border-borda-forte data-[state=open]:border-borda-forte"
            >
              <IconeEspaco grupo={grupoAtivo} tamanho={30} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-forte">{titulo}</span>
                <span className="text-[12px] text-sutil">{subtitulo}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-sutil" aria-hidden="true" />
              <span className="sr-only">Trocar de espaço</span>
            </button>
          )}
        </MenuGatilho>
        <MenuConteudo align="start" className={compacto ? 'w-[290px]' : 'w-[var(--radix-dropdown-menu-trigger-width)]'}>
          {espacoPessoal && (
            <MenuItem onSelect={() => trocar(espacoPessoal)}>
              <IconeEspaco grupo={espacoPessoal} tamanho={24} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">Pessoal</span>
                <span className="text-[12px] font-normal text-sutil">Suas atividades e as dos grupos</span>
              </span>
              {noEspacoPessoal && <Check className="!text-primaria-texto" aria-label="Espaço atual" />}
            </MenuItem>
          )}
          <MenuRotulo>Grupos</MenuRotulo>
          {outros.length === 0 && <p className="px-2.5 pb-2 text-[13px] text-sutil">Você ainda não está em nenhum grupo.</p>}
          {outros.map((grupo) => (
            <MenuItem key={grupo.id} onSelect={() => trocar(grupo)}>
              <AvatarGrupo grupo={grupo} tamanho={24} tom="neutro" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{grupo.nome}</span>
                <span className="text-[12px] font-normal text-sutil">
                  {plural(membrosDoGrupo(grupo.id).length, 'membro')}
                </span>
              </span>
              {grupo.id === grupoAtivo.id && <Check className="!text-primaria-texto" aria-label="Grupo atual" />}
            </MenuItem>
          ))}
          <MenuSeparador />
          {/* RN07: nome, descrição e foto do grupo são do organizador. */}
          {ehOrganizador && !noEspacoPessoal && (
            <MenuItem onSelect={() => setDialogo('editar')}>
              <Pencil aria-hidden="true" />
              Editar grupo
            </MenuItem>
          )}
          <MenuItem onSelect={() => setDialogo('criar')}>
            <Plus aria-hidden="true" />
            Criar grupo
          </MenuItem>
          {modo === 'conta' ? (
            <MenuItem onSelect={() => setDialogo('codigo')}>
              <Ticket aria-hidden="true" />
              Entrar com código de convite
            </MenuItem>
          ) : (
            <MenuItem onSelect={carregarExemplo}>
              <Sparkles aria-hidden="true" />
              Carregar grupo de exemplo
            </MenuItem>
          )}
        </MenuConteudo>
      </MenuRaiz>
      {dialogo === 'editar' && (
        <FormGrupo aberto aoMudar={(abrir) => !abrir && setDialogo(null)} grupo={grupoAtivo} aoSalvar={salvarGrupo} />
      )}
      {dialogo === 'criar' && <FormGrupo aberto aoMudar={(abrir) => !abrir && setDialogo(null)} aoSalvar={criar} />}
      {dialogo === 'codigo' && (
        <Dialogo
          aberto
          aoMudar={(abrir) => !abrir && setDialogo(null)}
          titulo="Entrar num grupo"
          descricao="Use o código de 8 letras e números que o organizador do grupo mandou."
          largura={460}
        >
          <EntrarComCodigo
            aoEntrar={(id, nome) => {
              setDialogo(null);
              entrar(id);
              navigate('/painel');
              toast.success('Você entrou no grupo', { description: nome });
            }}
          />
        </Dialogo>
      )}
    </>
  );
}

// Volta ao espaço pessoal (sem conta e sem espaço pessoal, à tela de acesso).
function useSairDoGrupo() {
  const { sair, espacoPessoal } = useAuth();
  const navigate = useNavigate();
  return () => {
    sair();
    navigate(espacoPessoal ? '/painel' : '/entrar');
  };
}

// Canto direito da barra: quem está usando, com o perfil e a saída do grupo.
// Feedback dos usuários de teste: abre o formulário anônimo em outra aba.
// Sem o link ainda, o item aparece desligado, como "em breve".
function ItemFeedback() {
  if (!temFormularioFeedback()) {
    return (
      <MenuItem disabled>
        <MessageSquareText aria-hidden="true" />
        Enviar feedback (em breve)
      </MenuItem>
    );
  }
  return (
    <MenuItem asChild>
      <a href={LINK_FEEDBACK} target="_blank" rel="noopener noreferrer">
        <MessageSquareText aria-hidden="true" />
        Enviar feedback
      </a>
    </MenuItem>
  );
}

// Quem está usando: no espaço pessoal, a pessoa; num grupo, com o perfil
// que ela tem lá (RN07).
function Identidade({ tamanho = 36 }) {
  const { membroAtivo, noEspacoPessoal } = useAuth();
  const { perfil } = useData();
  const nome = perfil?.nome || membroAtivo?.nome || 'Grupo sem membros';
  const detalhe = noEspacoPessoal
    ? 'Seu espaço pessoal'
    : membroAtivo
      ? rotuloPerfil(membroAtivo.perfil)
      : 'Cadastre o primeiro em Membros';
  return (
    <>
      <Avatar membro={membroAtivo} nome={membroAtivo ? undefined : '?'} tamanho={tamanho} decorativo />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-forte">{nome}</span>
        <span className="truncate text-[12px] text-sutil">{detalhe}</span>
      </span>
    </>
  );
}

function useSairDaConta() {
  const { sair } = useAuth();
  const { modo, sairDaConta, sairDaDemonstracao } = useConta();
  const navigate = useNavigate();
  return async () => {
    sair();
    if (modo === 'conta') await sairDaConta();
    else sairDaDemonstracao();
    navigate('/entrar');
  };
}

function MenuUsuario() {
  const { membroAtivo, noEspacoPessoal } = useAuth();
  const { modo, usuario, temBanco } = useConta();
  const { perfil } = useData();
  const sairDoGrupo = useSairDoGrupo();
  const sairDaConta = useSairDaConta();
  const navigate = useNavigate();
  const { abrirTutorial } = useTutorial();

  return (
    <MenuRaiz>
      <MenuGatilho asChild>
        <button
          type="button"
          aria-label={`Sua conta: ${perfil?.nome || membroAtivo?.nome || 'grupo sem membros'}`}
          className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-superficie-3 data-[state=open]:bg-superficie-3"
        >
          <Avatar membro={membroAtivo} nome={membroAtivo ? undefined : '?'} tamanho={32} decorativo />
          <ChevronDown className="size-4 text-sutil" aria-hidden="true" />
        </button>
      </MenuGatilho>
      <MenuConteudo align="end" className="w-[250px]">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Identidade />
        </div>
        {modo === 'conta' && <p className="truncate px-2.5 pb-2 text-[12px] text-sutil">{usuario?.email}</p>}
        <MenuSeparador />
        {perfil && (
          <MenuItem onSelect={() => navigate('/perfil')}>
            <UserRound aria-hidden="true" />
            Meu perfil
          </MenuItem>
        )}
        <MenuItem onSelect={abrirTutorial}>
          <Compass aria-hidden="true" />
          Tutorial
        </MenuItem>
        <ItemFeedback />
        {!noEspacoPessoal && (
          <MenuItem onSelect={sairDoGrupo}>
            <House aria-hidden="true" />
            Voltar ao espaço pessoal
          </MenuItem>
        )}
        {/* Sem banco configurado, só existe a demonstração: não há para onde sair. */}
        {temBanco && (
          <MenuItem onSelect={sairDaConta}>
            <LogOut aria-hidden="true" />
            {modo === 'conta' ? 'Sair da conta' : 'Sair da demonstração'}
          </MenuItem>
        )}
      </MenuConteudo>
    </MenuRaiz>
  );
}

function secaoAtiva(pathname, prefixos) {
  return prefixos.some((p) => pathname.startsWith(p));
}

// Barra do topo no computador: a marca e o grupo à esquerda, as seções no
// meio e, à direita, o tema e quem está usando.
function BarraTopo({ aoAbrirMenu, menuAberto }) {
  const { pathname } = useLocation();
  const secoes = useSecoes();

  return (
    <header className="sticky top-0 z-30 border-b border-borda bg-lateral/90 backdrop-blur-md">
      <div className={cn('mx-auto flex h-16 items-center gap-3', LARGURA, MARGEM)}>
        <Link to="/painel" aria-label="Vértice, ir para o painel" className="shrink-0 rounded-lg">
          <MarcaVertice tamanho={26} />
        </Link>
        <span aria-hidden="true" className="hidden h-6 w-px bg-borda lg:block" />
        <div className="hidden min-w-0 lg:block">
          <SeletorGrupo compacto />
        </div>

        <nav aria-label="Seções" className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {secoes.map(({ para, rotulo, icone: Icone, prefixos }) => {
            const ativa = secaoAtiva(pathname, prefixos);
            return (
              <Link
                key={para}
                to={para}
                aria-current={ativa ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-2.5 py-2 text-[14px] font-medium transition-colors xl:px-3',
                  ativa ? 'bg-primaria-barra/12 font-semibold text-forte' : 'text-suave hover:bg-superficie-3 hover:text-texto'
                )}
              >
                <Icone
                  aria-hidden="true"
                  className={cn('hidden size-[17px] shrink-0 xl:block', ativa ? 'text-primaria-texto' : 'text-sutil')}
                  strokeWidth={1.8}
                />
                {rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <BotaoTema />
          <MenuUsuario />
        </div>

        <Button
          variante="fantasma"
          tamanho="icone"
          className="ml-auto lg:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          onClick={aoAbrirMenu}
        >
          <Menu className="!size-5" />
        </Button>
      </div>
    </header>
  );
}

// No celular e no tablet, o menu desce do topo: o grupo, as seções, o tema e
// a saída.
function MenuCelular({ aberto, aoMudar }) {
  const { pathname } = useLocation();
  const { noEspacoPessoal } = useAuth();
  const { perfil } = useData();
  const { modo, temBanco } = useConta();
  const secoes = useSecoes();
  const sairDoGrupo = useSairDoGrupo();
  const sairDaConta = useSairDaConta();
  const navigate = useNavigate();
  const { abrirTutorial } = useTutorial();

  return (
    <DialogPrimitive.Root open={aberto} onOpenChange={aoMudar}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-surgir data-[state=closed]:animate-sumir lg:hidden" />
        <DialogPrimitive.Content className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto rounded-b-3xl border-b border-borda bg-lateral shadow-flutuante outline-none data-[state=open]:animate-menu-desce data-[state=closed]:animate-menu-sobe lg:hidden">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Seções do sistema, troca de grupo e tema.</DialogPrimitive.Description>
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <MarcaVertice tamanho={26} />
            <DialogPrimitive.Close asChild>
              <Button variante="fantasma" tamanho="icone" aria-label="Fechar menu">
                <X className="!size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6">
            <SeletorGrupo />
            <nav aria-label="Seções" className="grid grid-cols-2 gap-1.5">
              {secoes.map(({ para, rotulo, icone: Icone, prefixos }) => {
                const ativa = secaoAtiva(pathname, prefixos);
                return (
                  <Link
                    key={para}
                    to={para}
                    aria-current={ativa ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-3 text-[15px] font-medium transition-colors',
                      ativa ? 'bg-primaria-barra/12 font-semibold text-forte' : 'text-suave hover:bg-superficie-3 hover:text-texto'
                    )}
                  >
                    <Icone
                      aria-hidden="true"
                      className={cn('size-[18px] shrink-0', ativa ? 'text-primaria-texto' : 'text-sutil')}
                      strokeWidth={1.8}
                    />
                    {rotulo}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2.5 rounded-[14px] border border-borda p-3">
              <Identidade />
              <BotaoTema />
              {perfil && (
                <Button
                  variante="fantasma"
                  tamanho="icone"
                  aria-label="Meu perfil"
                  title="Meu perfil"
                  onClick={() => {
                    aoMudar(false);
                    navigate('/perfil');
                  }}
                >
                  <UserRound className="!size-[18px]" />
                </Button>
              )}
              <Button
                variante="fantasma"
                tamanho="icone"
                aria-label="Tutorial"
                title="Tutorial"
                onClick={() => {
                  aoMudar(false);
                  abrirTutorial();
                }}
              >
                <Compass className="!size-[18px]" />
              </Button>
              {temFormularioFeedback() && (
                <Button variante="fantasma" tamanho="icone" asChild>
                  <a href={LINK_FEEDBACK} target="_blank" rel="noopener noreferrer" aria-label="Enviar feedback (abre em outra aba)" title="Enviar feedback">
                    <MessageSquareText className="!size-[18px]" />
                  </a>
                </Button>
              )}
              {!noEspacoPessoal && (
                <Button
                  variante="fantasma"
                  tamanho="icone"
                  aria-label="Voltar ao espaço pessoal"
                  title="Voltar ao espaço pessoal"
                  onClick={sairDoGrupo}
                >
                  <House className="!size-[18px]" />
                </Button>
              )}
              {temBanco && (
                <Button
                  variante="fantasma"
                  tamanho="icone"
                  aria-label={modo === 'conta' ? 'Sair da conta' : 'Sair da demonstração'}
                  title={modo === 'conta' ? 'Sair da conta' : 'Sair da demonstração'}
                  onClick={sairDaConta}
                >
                  <LogOut className="!size-[18px]" />
                </Button>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Conquista nova vira aviso no canto. Ela pode ser de outra pessoa (uma
// atividade concluída que passou para ela), então o aviso diz de quem é.
// A retirada (RN12: desfez a conclusão) também avisa, para a pessoa não
// achar que perdeu a conquista por engano.
function useAvisoDeConquistas() {
  const {
    membros,
    meusMembros,
    novasConquistas,
    consumirNovasConquistas,
    conquistasRetiradas,
    consumirConquistasRetiradas,
  } = useData();

  useEffect(() => {
    if (novasConquistas.length === 0) return;
    novasConquistas.forEach(({ membroId, codigo }) => {
      const conquista = obterConquista(codigo);
      const membro = membros.find((m) => m.id === membroId);
      if (!conquista || !membro) return;
      const minha = meusMembros.some((m) => m.id === membroId);
      const quem = minha ? 'Você conquistou' : `${membro.nome} conquistou`;
      toast(`${quem}: ${conquista.nome}`, {
        description: conquista.descricao,
        icon: <Trophy className="size-4 text-gam" aria-hidden="true" />,
        duration: 6000,
      });
    });
    consumirNovasConquistas();
  }, [novasConquistas, consumirNovasConquistas, membros, meusMembros]);

  useEffect(() => {
    if (conquistasRetiradas.length === 0) return;
    conquistasRetiradas.forEach(({ codigo }) => {
      const conquista = obterConquista(codigo);
      if (!conquista) return;
      toast(`Conquista retirada: ${conquista.nome}`, {
        description: 'Ela saiu junto com a experiência da conclusão desfeita. Volta quando o marco for atingido de novo.',
        icon: <Trophy className="size-4 text-sutil" aria-hidden="true" />,
        duration: 6000,
      });
    });
    consumirConquistasRetiradas();
  }, [conquistasRetiradas, consumirConquistasRetiradas]);
}

// Convite aberto pelo link (/convite/CODIGO) antes de a pessoa entrar: com a
// conta aberta, ela entra no grupo sozinha (RF28). Sem conta, fica o aviso.
function useConvitePendente() {
  const { modo, usuario, sairDaDemonstracao } = useConta();
  const { recarregar, perfil } = useData();
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const visto = useRef(false);

  useEffect(() => {
    const codigo = lerConvitePendente();
    if (visto.current || !codigo) return;
    visto.current = true;
    if (modo !== 'conta') {
      toast('Você abriu um convite', {
        description: 'Para entrar no grupo do convite, entre com uma conta.',
        icon: <Ticket className="size-4 text-primaria-texto" aria-hidden="true" />,
        action: { label: 'Entrar com conta', onClick: sairDaDemonstracao },
        duration: 12000,
      });
      return;
    }
    limparConvitePendente();
    (async () => {
      try {
        const grupoId = await entrarComCodigo(codigo, perfil?.nome || usuario?.email?.split('@')[0] || 'Novo membro');
        const dados = await recarregar();
        entrar(grupoId);
        navigate('/painel');
        toast.success('Você entrou no grupo', { description: dados?.grupos.find((g) => g.id === grupoId)?.nome });
      } catch (erro) {
        toast.error('Não foi possível usar o convite', { description: erro.message });
      }
    })();
  }, [modo, usuario, perfil, recarregar, entrar, navigate, sairDaDemonstracao]);
}

// D02: o navegador recusou gravar. Avisa uma vez no canto; a faixa no topo
// fica enquanto o problema durar.
function useAvisoDeFalha(falhaGravacao) {
  const avisado = useRef(false);
  useEffect(() => {
    if (falhaGravacao && !avisado.current) {
      avisado.current = true;
      toast.error('Não foi possível salvar no navegador', {
        description: 'O que você cadastrar agora pode se perder ao recarregar a página.',
        duration: 8000,
      });
    }
    if (!falhaGravacao) avisado.current = false;
  }, [falhaGravacao]);
}

// Largura das telas: o conteúdo aproveita a tela do computador (pedido da
// equipe, 11/11/2026), com um limite para monitores muito largos.
const LARGURA = 'w-full max-w-[1680px]';
const MARGEM = 'px-4 sm:px-6 lg:px-8 2xl:px-12';

export function AppShell() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const { falhaGravacao } = useData();

  useAvisoDeConquistas();
  useAvisoDeFalha(falhaGravacao);
  useConvitePendente();

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  return (
    <TutorialProvider>
      <div className="min-h-dvh bg-fundo">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primaria focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primaria-fg"
        >
          Pular para o conteúdo
        </a>

        <BarraTopo menuAberto={menuAberto} aoAbrirMenu={() => setMenuAberto(true)} />
        <MenuCelular aberto={menuAberto} aoMudar={setMenuAberto} />

        {/* Coluna que ocupa a altura da tela: a página pode guardar algo para o
            pé dela (a exclusão do grupo, em Membros). */}
        <main
          id="conteudo"
          tabIndex={-1}
          className={cn('flex min-h-[calc(100dvh-4rem)] min-w-0 flex-col pb-16 pt-6 outline-none lg:pt-8', MARGEM)}
        >
          <div className={cn('mx-auto flex flex-1 flex-col', LARGURA)}>
            {falhaGravacao && (
              <Aviso tom="perigo" icone={TriangleAlert} className="mb-6">
                <strong className="font-semibold">Não foi possível salvar no navegador.</strong> O
                armazenamento está cheio ou bloqueado, e o que você cadastrar agora pode se perder ao
                recarregar a página.
              </Aviso>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </TutorialProvider>
  );
}

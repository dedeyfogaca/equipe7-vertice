import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronsUpDown,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Pencil,
  Plus,
  TriangleAlert,
  Trophy,
  Users,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { BotaoTema } from '../BotaoTema.jsx';
import { Avatar } from '../ui/avatar-membro.jsx';
import { AvatarGrupo } from '../ui/avatar-grupo.jsx';
import { Aviso } from '../ui/basicos.jsx';
import { Button } from '../ui/botao.jsx';
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz, MenuRotulo, MenuSeparador } from '../ui/flutuantes.jsx';
import { MarcaVertice } from '../ui/marca.jsx';
import { FormGrupo } from '../grupos/FormGrupo.jsx';
import { obterConquista } from '../../lib/gamificacao.js';
import { rotuloPerfil } from '../../lib/constants.js';
import { cn, plural } from '../../lib/utils.js';

// Casca das telas internas: a barra no topo com as seções (no celular, um
// menu que desce do topo) e o conteúdo da página embaixo. Também é quem dá os avisos que valem para
// o sistema inteiro — conquista nova e falha ao salvar.

const SECOES = [
  { para: '/painel', rotulo: 'Painel', icone: LayoutDashboard, prefixos: ['/painel'] },
  { para: '/calendario', rotulo: 'Calendário', icone: CalendarDays, prefixos: ['/calendario'] },
  { para: '/disciplinas', rotulo: 'Disciplinas', icone: BookOpen, prefixos: ['/disciplina'] },
  { para: '/atividades', rotulo: 'Atividades', icone: ListChecks, prefixos: ['/atividade'] },
  { para: '/membros', rotulo: 'Membros', icone: Users, prefixos: ['/membros'] },
  { para: '/conquistas', rotulo: 'Conquistas', icone: Trophy, prefixos: ['/conquistas'] },
];

function SeletorGrupo({ compacto = false }) {
  const { grupoAtivo, membrosDoGrupoAtivo, ehOrganizador, entrar, sair } = useAuth();
  const { grupos, membrosDoGrupo, atualizarGrupo } = useData();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);

  const trocar = (grupoId) => {
    if (grupoId === grupoAtivo.id) return;
    entrar(grupoId);
    navigate('/painel');
  };

  const outroGrupo = () => {
    sair();
    navigate('/entrar');
  };

  const salvarGrupo = (dados) => {
    atualizarGrupo(grupoAtivo.id, dados);
    toast.success('Grupo atualizado', { description: dados.nome });
    setEditando(false);
  };

  return (
    <>
      <MenuRaiz>
        <MenuGatilho asChild>
          {compacto ? (
            // Na barra do topo: a foto (ou as iniciais) do grupo e o nome, que
            // só aparece quando há espaço.
            <button
              type="button"
              className="flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-left transition-colors hover:bg-superficie-3 data-[state=open]:bg-superficie-3"
            >
              <AvatarGrupo grupo={grupoAtivo} tamanho={28} />
              <span className="hidden min-w-0 max-w-[180px] flex-col xl:flex">
                <span className="truncate text-sm font-semibold leading-tight text-forte">{grupoAtivo.nome}</span>
                <span className="text-[12px] leading-tight text-sutil">
                  {plural(membrosDoGrupoAtivo.length, 'membro')}
                </span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-sutil" aria-hidden="true" />
              <span className="sr-only">Grupo {grupoAtivo.nome}. Trocar de grupo</span>
            </button>
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-[14px] border border-borda bg-superficie-2 px-3 py-2.5 text-left transition-colors hover:border-borda-forte data-[state=open]:border-borda-forte"
            >
              <AvatarGrupo grupo={grupoAtivo} tamanho={30} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-forte">{grupoAtivo.nome}</span>
                <span className="text-[12px] text-sutil">{plural(membrosDoGrupoAtivo.length, 'membro')}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-sutil" aria-hidden="true" />
              <span className="sr-only">Trocar de grupo</span>
            </button>
          )}
        </MenuGatilho>
        <MenuConteudo align="start" className={compacto ? 'w-[280px]' : 'w-[var(--radix-dropdown-menu-trigger-width)]'}>
          <MenuRotulo>Seus grupos</MenuRotulo>
          {grupos.map((grupo) => (
            <MenuItem key={grupo.id} onSelect={() => trocar(grupo.id)}>
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
          {/* RN07 — nome, descrição e foto do grupo são do organizador. */}
          {ehOrganizador && (
            <MenuItem onSelect={() => setEditando(true)}>
              <Pencil aria-hidden="true" />
              Editar grupo
            </MenuItem>
          )}
          <MenuItem onSelect={outroGrupo}>
            <Plus aria-hidden="true" />
            Criar ou entrar em outro grupo
          </MenuItem>
        </MenuConteudo>
      </MenuRaiz>
      {editando && (
        <FormGrupo aberto aoMudar={(abrir) => !abrir && setEditando(false)} grupo={grupoAtivo} aoSalvar={salvarGrupo} />
      )}
    </>
  );
}

function useSairDoGrupo() {
  const { sair } = useAuth();
  const navigate = useNavigate();
  return () => {
    sair();
    navigate('/entrar');
  };
}

// Canto direito da barra: quem está usando, com o perfil e a saída do grupo.
function MenuUsuario() {
  const { membroAtivo } = useAuth();
  const sairDoGrupo = useSairDoGrupo();

  return (
    <MenuRaiz>
      <MenuGatilho asChild>
        <button
          type="button"
          aria-label={`Sua conta: ${membroAtivo?.nome ?? 'grupo sem membros'}`}
          className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-superficie-3 data-[state=open]:bg-superficie-3"
        >
          <Avatar membro={membroAtivo} nome={membroAtivo ? undefined : '?'} tamanho={32} decorativo />
          <ChevronDown className="size-4 text-sutil" aria-hidden="true" />
        </button>
      </MenuGatilho>
      <MenuConteudo align="end" className="w-[240px]">
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <Avatar membro={membroAtivo} nome={membroAtivo ? undefined : '?'} tamanho={36} decorativo />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-forte">{membroAtivo?.nome ?? 'Grupo sem membros'}</span>
            <span className="text-[12px] text-sutil">
              {membroAtivo ? rotuloPerfil(membroAtivo.perfil) : 'Cadastre o primeiro em Membros'}
            </span>
          </span>
        </div>
        <MenuSeparador />
        <MenuItem onSelect={sairDoGrupo}>
          <LogOut aria-hidden="true" />
          Sair do grupo
        </MenuItem>
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

  return (
    <header className="sticky top-0 z-30 border-b border-borda bg-lateral/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <Link to="/painel" aria-label="Vértice, ir para o painel" className="shrink-0 rounded-lg">
          <MarcaVertice tamanho={26} />
        </Link>
        <span aria-hidden="true" className="hidden h-6 w-px bg-borda lg:block" />
        <div className="hidden min-w-0 lg:block">
          <SeletorGrupo compacto />
        </div>

        <nav aria-label="Seções" className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {SECOES.map(({ para, rotulo, icone: Icone, prefixos }) => {
            const ativa = secaoAtiva(pathname, prefixos);
            return (
              <Link
                key={para}
                to={para}
                aria-current={ativa ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-medium transition-colors',
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
  const { membroAtivo } = useAuth();
  const sairDoGrupo = useSairDoGrupo();

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
              {SECOES.map(({ para, rotulo, icone: Icone, prefixos }) => {
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
              <Avatar membro={membroAtivo} nome={membroAtivo ? undefined : '?'} tamanho={36} decorativo />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-forte">{membroAtivo?.nome ?? 'Grupo sem membros'}</span>
                <span className="text-[12px] text-sutil">
                  {membroAtivo ? rotuloPerfil(membroAtivo.perfil) : 'Cadastre o primeiro'}
                </span>
              </span>
              <BotaoTema />
              <Button variante="fantasma" tamanho="icone" aria-label="Sair do grupo" title="Sair do grupo" onClick={sairDoGrupo}>
                <LogOut className="!size-[18px]" />
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Conquista nova vira aviso no canto. Ela pode ser de outra pessoa — uma
// atividade concluída que passou para ela —, então o aviso diz de quem é.
function useAvisoDeConquistas() {
  const { membroAtivo } = useAuth();
  const { membros, novasConquistas, consumirNovasConquistas } = useData();

  useEffect(() => {
    if (novasConquistas.length === 0) return;
    novasConquistas.forEach(({ membroId, codigo }) => {
      const conquista = obterConquista(codigo);
      const membro = membros.find((m) => m.id === membroId);
      if (!conquista || !membro) return;
      const quem = membroId === membroAtivo?.id ? 'Você conquistou' : `${membro.nome} conquistou`;
      toast(`${quem}: ${conquista.nome}`, {
        description: conquista.descricao,
        icon: <Trophy className="size-4 text-gam" aria-hidden="true" />,
        duration: 6000,
      });
    });
    consumirNovasConquistas();
  }, [novasConquistas, consumirNovasConquistas, membros, membroAtivo]);
}

// D02 — o navegador recusou gravar. Avisa uma vez no canto; a faixa no topo
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

export function AppShell() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();
  const { falhaGravacao } = useData();

  useAvisoDeConquistas();
  useAvisoDeFalha(falhaGravacao);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  return (
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
        className="flex min-h-[calc(100dvh-4rem)] min-w-0 flex-col px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-10 lg:pt-8"
      >
        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col">
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
  );
}

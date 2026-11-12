import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { BotaoTema } from '../BotaoTema.jsx';
import { Button } from '../ui/botao.jsx';
import { MarcaVertice, SimboloVertice } from '../ui/marca.jsx';
import { cn } from '../../lib/utils.js';

// Casca das páginas públicas (início, sobre nós): o menu do site no topo, com
// a troca de tema, e o rodapé com os créditos da equipe, o feedback e o
// Instagram.

const INSTAGRAM = 'https://www.instagram.com/go.vertice/';

const LINKS = [
  { para: '/#funcionalidades', rotulo: 'Funcionalidades' },
  { para: '/#como-funciona', rotulo: 'Como funciona' },
  { para: '/sobre', rotulo: 'Sobre nós' },
  { para: '/#perguntas', rotulo: 'Perguntas' },
  { para: '/#feedback', rotulo: 'Feedback' },
];

export function RodapePublico() {
  return (
    <footer className="border-t border-divisor">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-apagado">
        <span className="flex items-center gap-2.5 font-semibold text-suave">
          <SimboloVertice tamanho={20} className="text-primaria" />
          Vértice
        </span>
        <span>Equipe 7 · Andrey Fogaça e Matheus Saraiva Faustin · Imersão Profissional: Projeto de Software</span>
        <Link to="/feedback" className="font-semibold text-suave transition-colors hover:text-primaria">
          Enviar feedback
        </Link>
        <a
          href={INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram do Vértice, @go.vertice (abre em outra aba)"
          className="group rounded-lg transition-colors hover:text-primaria"
        >
          Instagram{' '}
          <span className="font-semibold text-suave transition-colors group-hover:text-primaria">@go.vertice</span>
        </a>
      </div>
    </footer>
  );
}

export function LayoutPublico({ children }) {
  const { pathname, hash } = useLocation();
  const { autenticado, precisaIdentificar, precisaPerfil } = useAuth();
  const logado = autenticado && !precisaIdentificar && !precisaPerfil;
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname, hash]);

  const atual = (para) => (para === '/sobre' ? pathname === '/sobre' : false);

  return (
    <div className="flex min-h-dvh flex-col bg-fundo text-texto">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primaria focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primaria-fg"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-30 border-b border-divisor bg-fundo/80 backdrop-blur-md">
        <nav aria-label="Principal" className="mx-auto flex max-w-[1200px] items-center gap-8 px-6 py-4">
          <Link to="/" aria-label="Vértice, página inicial" className="rounded-lg">
            <MarcaVertice />
          </Link>
          <div className="hidden flex-1 items-center gap-7 text-[15px] lg:flex">
            {LINKS.map(({ para, rotulo }) => (
              <Link
                key={para}
                to={para}
                aria-current={atual(para) ? 'page' : undefined}
                className={cn(
                  'transition-colors hover:text-primaria',
                  atual(para) ? 'font-semibold text-forte' : 'text-suave'
                )}
              >
                {rotulo}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <BotaoTema className="hidden sm:inline-flex" />
            {logado ? (
              <Button asChild tamanho="sm">
                <Link to="/painel">Ir para o painel</Link>
              </Button>
            ) : (
              <>
                <Button asChild variante="secundaria" tamanho="sm" className="hidden sm:inline-flex">
                  <Link to="/entrar">Entrar</Link>
                </Button>
                <Button asChild tamanho="sm">
                  <Link to="/entrar">Começar agora</Link>
                </Button>
              </>
            )}
            <Button
              variante="fantasma"
              tamanho="icone"
              className="lg:hidden"
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuAberto}
              aria-controls="menu-publico"
              onClick={() => setMenuAberto((v) => !v)}
            >
              {menuAberto ? <X className="!size-5" /> : <Menu className="!size-5" />}
            </Button>
          </div>
        </nav>
        {menuAberto && (
          <div id="menu-publico" className="border-t border-divisor px-6 pb-5 pt-3 lg:hidden">
            <ul className="flex flex-col">
              {LINKS.map(({ para, rotulo }) => (
                <li key={para}>
                  <Link
                    to={para}
                    onClick={() => setMenuAberto(false)}
                    className="block rounded-xl px-2 py-3 text-base text-suave hover:bg-superficie-2 hover:text-forte"
                  >
                    {rotulo}
                  </Link>
                </li>
              ))}
              {!logado && (
                <li>
                  <Link
                    to="/entrar"
                    className="block rounded-xl px-2 py-3 text-base text-suave hover:bg-superficie-2 hover:text-forte"
                  >
                    Entrar
                  </Link>
                </li>
              )}
              <li className="mt-1 border-t border-divisor pt-1">
                <BotaoTema
                  comTexto
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-3 text-left text-base text-suave hover:bg-superficie-2 hover:text-forte"
                />
              </li>
            </ul>
          </div>
        )}
      </header>

      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <RodapePublico />
    </div>
  );
}

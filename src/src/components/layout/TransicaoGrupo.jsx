import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { SimboloVertice } from '../ui/marca.jsx';

// Passagem da tela de acesso para o painel.
//
// 1. Uma cortina na cor do fundo cobre a tela de acesso, e a marca do
//    Vértice surge no centro, com o nome do grupo e um fio de progresso.
// 2. Com a tela coberta, a sessão é aberta e o painel monta por baixo.
// 3. A marca dá um terço de volta — o desenho tem três pontas, então para
//    exatamente como começou — enquanto o fio se completa.
// 4. A cortina se dissolve, e o conteúdo do painel assenta no lugar.
//
// Só transform e opacity são animados, pela Web Animations API: o navegador
// os executa fora da linha principal, então a animação não engasga enquanto
// o painel monta. Quem pede menos movimento no sistema vê só a cortina
// esmaecer, sem giro.

const TransicaoContext = createContext({ abrirGrupo: () => {}, emCurso: false });

const MARCA = 56; // largura da marca, em px
// Centro do triângulo dentro da marca: é o eixo do giro.
const CENTRO_X = ((50.18 + 2.5) / 105) * MARCA;
const CENTRO_Y = ((30.73 + 2.5) / 93) * Math.round(MARCA * 0.9);

const COBRIR = 260; // ms: a cortina cobre a tela de acesso
const GIRO = 820; // ms: a marca surge e dá um terço de volta
const REVELAR = 380; // ms: a cortina se dissolve sobre o painel
const SUAVE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const ASSENTAR = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

function Cortina({ nome, aoCobrir, aoTerminar }) {
  const cortina = useRef(null);
  const marca = useRef(null);
  const texto = useRef(null);
  const fio = useRef(null);

  useLayoutEffect(() => {
    const menosMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animacoes = [];
    const animar = (el, quadros, opcoes) => {
      if (!el?.animate) return null;
      const a = el.animate(quadros, { fill: 'both', ...opcoes });
      animacoes.push(a);
      return a;
    };
    const timers = [];
    const depois = (ms, fn) => timers.push(setTimeout(fn, ms));

    if (menosMovimento) {
      animar(cortina.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      animar(marca.current, [{ opacity: 1 }, { opacity: 1 }], { duration: 1 });
      animar(texto.current, [{ opacity: 1 }, { opacity: 1 }], { duration: 1 });
      depois(140, aoCobrir);
      depois(480, () => animar(cortina.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }));
      depois(680, aoTerminar);
    } else {
      animar(cortina.current, [{ opacity: 0 }, { opacity: 1 }], { duration: COBRIR, easing: 'ease-out' });
      animar(
        marca.current,
        [
          { opacity: 0, transform: 'scale(0.9) rotate(0deg)', easing: ASSENTAR },
          { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.3, easing: SUAVE },
          { opacity: 1, transform: 'scale(1) rotate(120deg)' },
        ],
        { duration: GIRO, delay: 60 }
      );
      animar(
        texto.current,
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 360, delay: 140, easing: ASSENTAR }
      );
      animar(fio.current, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
        duration: GIRO,
        delay: 60,
        easing: SUAVE,
      });
      depois(COBRIR + 20, aoCobrir);
      depois(GIRO + 60, () => {
        animar(cortina.current, [{ opacity: 1 }, { opacity: 0 }], { duration: REVELAR, easing: 'ease-in-out' });
        animar(
          marca.current,
          [{ transform: 'scale(1) rotate(120deg)' }, { transform: 'scale(1.06) rotate(120deg)' }],
          { duration: REVELAR, easing: ASSENTAR }
        );
        // O conteúdo do painel sobe alguns pixels enquanto a cortina some.
        animar(
          document.getElementById('conteudo'),
          [{ transform: 'translateY(12px)' }, { transform: 'translateY(0)' }],
          { duration: REVELAR + 120, easing: ASSENTAR, fill: 'none' }
        );
      });
      depois(GIRO + 60 + REVELAR, aoTerminar);
    }

    return () => {
      timers.forEach(clearTimeout);
      animacoes.forEach((a) => a.cancel());
    };
    // A cortina roda uma vez por abertura (a chave remonta o componente).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={cortina}
      data-transicao-grupo
      style={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-7 bg-fundo px-6 text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_45%,rgb(8_145_178/0.08),transparent_70%)] dark:bg-[radial-gradient(45%_40%_at_50%_45%,rgb(34_211_238/0.1),transparent_70%)]"
      />
      <div
        ref={marca}
        aria-hidden="true"
        className="relative text-primaria-barra will-change-transform"
        style={{ opacity: 0, transformOrigin: `${CENTRO_X}px ${CENTRO_Y}px` }}
      >
        <SimboloVertice tamanho={MARCA} />
      </div>
      <div ref={texto} style={{ opacity: 0 }} className="relative flex flex-col items-center gap-3">
        <span aria-hidden="true" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sutil">
          Abrindo
        </span>
        <p aria-hidden="true" className="text-balance text-[22px] font-semibold leading-tight tracking-[-0.03em] text-forte">
          {nome || 'o grupo'}
        </p>
        <span aria-hidden="true" className="mt-1 block h-0.5 w-16 overflow-hidden rounded-full bg-borda">
          <span ref={fio} className="block h-full w-full origin-left rounded-full bg-primaria-barra" style={{ transform: 'scaleX(0)' }} />
        </span>
        <p role="status" className="sr-only">
          {`Abrindo ${nome || 'o grupo'}…`}
        </p>
      </div>
    </div>
  );
}

export function TransicaoGrupoProvider({ children }) {
  const navigate = useNavigate();
  const [abrindo, setAbrindo] = useState(null);

  // `aoCobrir` abre a sessão. Roda só quando a tela de acesso já está
  // coberta, para ela não mudar de cara enquanto a cortina chega.
  const abrirGrupo = useCallback((nome, { aoCobrir, destino = '/painel' } = {}) => {
    setAbrindo({ nome, aoCobrir, destino, chave: Date.now() });
  }, []);

  const cobrir = useCallback(() => {
    if (!abrindo) return;
    // A sessão é gravada antes de o endereço mudar: quem recarregar a página
    // logo depois já cai no painel.
    flushSync(() => abrindo.aoCobrir?.());
    navigate(abrindo.destino, { replace: true });
  }, [abrindo, navigate]);
  const terminar = useCallback(() => setAbrindo(null), []);

  const valor = useMemo(() => ({ abrirGrupo, emCurso: Boolean(abrindo) }), [abrirGrupo, abrindo]);

  return (
    <TransicaoContext.Provider value={valor}>
      {children}
      {abrindo && <Cortina key={abrindo.chave} nome={abrindo.nome} aoCobrir={cobrir} aoTerminar={terminar} />}
    </TransicaoContext.Provider>
  );
}

export function useTransicaoGrupo() {
  return useContext(TransicaoContext);
}

import { createElement, useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/utils.js';

// Movimento das páginas públicas (revisão de 06/11/2026): o que aparece ao
// rolar, o que segue o mouse e os números que contam. Tudo é transform e
// opacity, e quem pede menos movimento no sistema vê as coisas paradas.

const menosMovimento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * `true` quando o elemento entra na tela (uma vez só). Sem
 * IntersectionObserver, ou para quem imprime a página, já começa visível.
 */
export function useVisivel(opcoes = { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || visivel) return undefined;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setVisivel(true);
        observador.disconnect();
      }
    }, opcoes);
    observador.observe(el);
    const imprimir = () => setVisivel(true);
    window.addEventListener('beforeprint', imprimir);
    return () => {
      observador.disconnect();
      window.removeEventListener('beforeprint', imprimir);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel]);

  return [ref, visivel];
}

/**
 * Bloco que sobe e aparece quando chega na tela. `atraso` (ms) escalona
 * blocos vizinhos.
 */
export function Revelar({ as = 'div', atraso = 0, className, style, children, ...resto }) {
  const [ref, visivel] = useVisivel();
  return createElement(
    as,
    {
      ref,
      'data-revelar': visivel ? 'sim' : 'nao',
      className: cn('revelar', className),
      style: { ...style, '--atraso': `${atraso}ms` },
      ...resto,
    },
    children
  );
}

/**
 * Liga a posição do mouse a variáveis CSS do elemento: `--mx`/`--my` (em px,
 * para o brilho que segue o ponteiro) e `--rx`/`--ry` (de -1 a 1, para
 * inclinar). Atualiza no máximo uma vez por quadro.
 */
export function usePonteiro() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia?.('(hover: hover)').matches) return undefined;
    let quadro = 0;
    let ultimo = null;

    const aplicar = () => {
      quadro = 0;
      if (!ultimo) return;
      const caixa = el.getBoundingClientRect();
      const x = ultimo.clientX - caixa.left;
      const y = ultimo.clientY - caixa.top;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      el.style.setProperty('--rx', ((x / caixa.width) * 2 - 1).toFixed(3));
      el.style.setProperty('--ry', ((y / caixa.height) * 2 - 1).toFixed(3));
    };
    const mover = (evento) => {
      ultimo = evento;
      el.dataset.ponteiro = 'dentro';
      if (!quadro) quadro = requestAnimationFrame(aplicar);
    };
    const sair = () => {
      ultimo = null;
      el.dataset.ponteiro = 'fora';
      el.style.setProperty('--rx', '0');
      el.style.setProperty('--ry', '0');
    };

    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerleave', sair);
    return () => {
      cancelAnimationFrame(quadro);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerleave', sair);
    };
  }, []);

  return ref;
}

/** Número que conta de 0 até `valor` quando `ativo` liga. */
export function Contador({ valor, ativo, duracao = 1100, sufixo = '', className }) {
  const [atual, setAtual] = useState(() => (menosMovimento() ? valor : 0));

  useEffect(() => {
    if (!ativo) return undefined;
    if (menosMovimento()) {
      setAtual(valor);
      return undefined;
    }
    let quadro;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - (1 - t) ** 3;
      setAtual(Math.round(valor * suave));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [ativo, valor, duracao]);

  return (
    <span className={className}>
      {atual}
      {sufixo}
    </span>
  );
}

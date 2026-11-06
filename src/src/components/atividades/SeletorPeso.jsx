import { useRef } from 'react';
import { PESO } from '../../lib/constants.js';
import { cn } from '../../lib/utils.js';

const VALORES = Array.from({ length: PESO.MAXIMO - PESO.MINIMO + 1 }, (_, i) => i + PESO.MINIMO);

// RN09: peso de 1 a 5, como grupo de rádio (setas do teclado mudam o valor).
// Pode começar sem nada escolhido: o campo é opcional, e sem escolha a
// atividade vale 1.
export function SeletorPeso({ id = 'peso', valor, aoEscolher, descritoPor }) {
  const botoes = useRef([]);
  const escolhido = VALORES.includes(Number(valor)) ? Number(valor) : null;

  const mover = (evento, indice) => {
    const passos = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (!(evento.key in passos)) return;
    evento.preventDefault();
    const proximo = Math.min(VALORES.length - 1, Math.max(0, indice + passos[evento.key]));
    aoEscolher(VALORES[proximo]);
    botoes.current[proximo]?.focus();
  };

  return (
    <div
      id={id}
      role="radiogroup"
      aria-labelledby={`${id}-rotulo`}
      aria-describedby={descritoPor}
      className="grid grid-cols-5 gap-1.5 rounded-2xl border border-borda bg-superficie-2 p-1.5"
    >
      {VALORES.map((n, indice) => {
        const marcado = n === escolhido;
        // Sem escolha, o primeiro botão é o que recebe o Tab.
        const focavel = escolhido === null ? indice === 0 : marcado;
        return (
          <button
            key={n}
            ref={(el) => (botoes.current[indice] = el)}
            type="button"
            role="radio"
            aria-checked={marcado}
            aria-label={`Peso ${n} de ${PESO.MAXIMO}`}
            tabIndex={focavel ? 0 : -1}
            onClick={() => aoEscolher(n)}
            onKeyDown={(e) => mover(e, indice)}
            className={cn(
              'numero h-10 rounded-xl text-[15px] font-semibold transition-colors',
              marcado
                ? 'bg-primaria text-primaria-fg shadow-botao'
                : escolhido !== null && n < escolhido
                  ? 'bg-primaria-barra/15 text-primaria-texto hover:bg-primaria-barra/20'
                  : 'text-sutil hover:bg-superficie-3 hover:text-texto'
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

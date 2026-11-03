import { useRef } from 'react';
import { Check } from 'lucide-react';
import { CORES_DISCIPLINA } from '../../lib/constants.js';
import { cn } from '../../lib/utils.js';

// Paleta da disciplina: 18 cores, escolhidas para continuar legíveis nos dois
// temas. Grupo de rádio de verdade: as setas do teclado andam entre as cores.
export function SeletorCor({ id = 'cor', valor, aoEscolher, erro }) {
  const botoes = useRef([]);
  const atual = CORES_DISCIPLINA.find((c) => c.valor === valor);
  const indiceAtual = Math.max(0, CORES_DISCIPLINA.findIndex((c) => c.valor === valor));

  const mover = (evento, indice) => {
    const passos = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let proximo = null;
    if (evento.key in passos) {
      proximo = (indice + passos[evento.key] + CORES_DISCIPLINA.length) % CORES_DISCIPLINA.length;
    } else if (evento.key === 'Home') {
      proximo = 0;
    } else if (evento.key === 'End') {
      proximo = CORES_DISCIPLINA.length - 1;
    }
    if (proximo === null) return;
    evento.preventDefault();
    aoEscolher(CORES_DISCIPLINA[proximo].valor);
    botoes.current[proximo]?.focus();
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span id={`${id}-rotulo`} className="text-[13px] font-semibold tracking-wide text-suave">
          Cor
        </span>
        <span className="text-[13px] text-sutil" aria-hidden="true">
          {atual?.rotulo}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-rotulo`}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className="grid grid-cols-6 gap-2 sm:grid-cols-9"
      >
        {CORES_DISCIPLINA.map(({ valor: cor, rotulo }, indice) => {
          const marcada = cor === valor;
          return (
            <button
              key={cor}
              ref={(el) => (botoes.current[indice] = el)}
              type="button"
              role="radio"
              aria-checked={marcada}
              aria-label={rotulo}
              title={rotulo}
              tabIndex={indice === indiceAtual ? 0 : -1}
              onClick={() => aoEscolher(cor)}
              onKeyDown={(e) => mover(e, indice)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-xl transition-transform hover:scale-[1.06] focus-visible:outline-offset-3',
                marcada && 'ring-2 ring-offset-2 ring-offset-superficie'
              )}
              style={{ background: cor, '--tw-ring-color': cor }}
            >
              {marcada && (
                <Check className="size-4 text-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.45)]" strokeWidth={3} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      {erro && (
        <p id={`${id}-erro`} className="text-[13px] font-medium text-perigo">
          {erro}
        </p>
      )}
    </div>
  );
}

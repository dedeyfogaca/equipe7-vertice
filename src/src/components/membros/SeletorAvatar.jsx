import { useRef } from 'react';
import { Shuffle } from 'lucide-react';

import { Button } from '../ui/botao.jsx';
import { ESTILOS_AVATAR, urlAvatar } from '../../lib/avatar.js';
import { cn } from '../../lib/utils.js';

/**
 * Escolha do avatar (RF19): os dois estilos lado a lado, todos desenhados com
 * a mesma semente, e o botão de sortear outra. É um grupo de rádio: as setas
 * do teclado trocam o estilo.
 */
export function SeletorAvatar({ semente, estilo, aoEscolherEstilo, aoSortear, temFoto }) {
  const botoes = useRef([]);
  const indiceAtual = Math.max(0, ESTILOS_AVATAR.findIndex((e) => e.id === estilo));

  const mover = (evento, indice) => {
    const passos = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(evento.key in passos)) return;
    evento.preventDefault();
    const proximo = (indice + passos[evento.key] + ESTILOS_AVATAR.length) % ESTILOS_AVATAR.length;
    aoEscolherEstilo(ESTILOS_AVATAR[proximo].id);
    botoes.current[proximo]?.focus();
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <span id="estilo-avatar-rotulo" className="text-sm font-semibold text-forte">
          Avatar
        </span>
        <Button variante="fantasma" tamanho="sm" onClick={aoSortear}>
          <Shuffle aria-hidden="true" />
          Sortear outro
        </Button>
      </div>
      <div
        id="estilo-avatar"
        role="radiogroup"
        aria-labelledby="estilo-avatar-rotulo"
        aria-describedby="estilo-avatar-dica"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-borda bg-superficie-2 p-1.5"
      >
        {ESTILOS_AVATAR.map((opcao, indice) => {
          const marcado = indice === indiceAtual;
          return (
            <button
              key={opcao.id}
              ref={(el) => (botoes.current[indice] = el)}
              type="button"
              role="radio"
              aria-checked={marcado}
              aria-label={`Estilo ${opcao.rotulo}`}
              data-estilo={opcao.id}
              tabIndex={marcado ? 0 : -1}
              onClick={() => aoEscolherEstilo(opcao.id)}
              onKeyDown={(e) => mover(e, indice)}
              className={cn(
                'flex min-w-0 items-center justify-center gap-3 rounded-xl px-2 py-2.5 text-[13px] font-medium transition-colors',
                marcado ? 'bg-superficie text-forte ring-2 ring-primaria-barra' : 'text-sutil hover:bg-superficie-3 hover:text-texto'
              )}
            >
              <img
                src={urlAvatar(semente, { estilo: opcao.id })}
                alt=""
                width="52"
                height="52"
                className="size-13 rounded-full"
              />
              <span className="max-w-full truncate">{opcao.rotulo}</span>
            </button>
          );
        })}
      </div>
      <p id="estilo-avatar-dica" className="text-[13px] text-sutil">
        {temFoto
          ? 'Enquanto houver foto, ela aparece no lugar do avatar.'
          : 'Escolha um estilo e sorteie até gostar. O avatar aparece onde não há foto.'}
      </p>
    </div>
  );
}

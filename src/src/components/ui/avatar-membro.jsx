import { useEffect, useState } from 'react';
import { iniciais, urlAvatar } from '../../lib/avatar.js';
import { cn } from '../../lib/utils.js';

/**
 * Foto do membro (enviada por ele), ou o avatar desenhado a partir da semente
 * e do estilo escolhidos, ou as iniciais quando a imagem não carrega (RN15).
 * A ordem é essa: a foto que a pessoa escolheu sempre vence.
 */
export function Avatar({ membro, nome, seed, estilo, foto, tamanho = 40, className, decorativo = false }) {
  const nomeFinal = membro?.nome ?? nome ?? '';
  const fotoFinal = membro?.foto ?? foto ?? '';
  const semente = membro?.avatar || seed || nomeFinal;
  const estiloFinal = membro?.estiloAvatar || estilo;
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [semente, estiloFinal, fotoFinal]);

  const origem = fotoFinal || urlAvatar(semente, { estilo: estiloFinal });
  const mostrarIniciais = falhou || !semente;

  return (
    <span
      role={decorativo ? undefined : 'img'}
      aria-hidden={decorativo ? 'true' : undefined}
      aria-label={decorativo ? undefined : nomeFinal || 'Membro'}
      title={nomeFinal || undefined}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-superficie-3 font-semibold text-suave ring-1 ring-borda',
        className
      )}
      style={{ width: tamanho, height: tamanho, fontSize: Math.max(10, Math.round(tamanho * 0.36)) }}
    >
      {mostrarIniciais ? (
        <span aria-hidden="true">{iniciais(nomeFinal)}</span>
      ) : (
        <img
          src={origem}
          alt=""
          className="size-full object-cover"
          onError={() => setFalhou(true)}
        />
      )}
    </span>
  );
}

import { useEffect, useState } from 'react';
import { iniciais } from '../../lib/avatar.js';
import { cn } from '../../lib/utils.js';

const TONS = {
  // Grupo em destaque (o grupo atual, no seletor da barra lateral).
  primaria: 'bg-primaria text-primaria-fg',
  // Grupo numa lista (tela de acesso).
  suave: 'bg-primaria/12 text-primaria-texto',
  // Grupo num menu.
  neutro: 'bg-superficie-3 text-suave',
};

/**
 * Foto do grupo, ou as iniciais do nome quando o grupo não tem foto (ou ela
 * não carrega). Quadrado de cantos arredondados, para não ser confundido com
 * o avatar redondo de um membro.
 */
export function AvatarGrupo({ grupo, tamanho = 40, tom = 'primaria', className, decorativo = true }) {
  const foto = grupo?.foto || '';
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [foto]);

  const comFoto = foto && !falhou;

  return (
    <span
      role={decorativo ? undefined : 'img'}
      aria-hidden={decorativo ? 'true' : undefined}
      aria-label={decorativo ? undefined : `Foto do grupo ${grupo?.nome ?? ''}`.trim()}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden font-bold',
        comFoto ? 'bg-superficie-3' : TONS[tom] ?? TONS.primaria,
        className
      )}
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: Math.round(tamanho * 0.3),
        fontSize: Math.max(10, Math.round(tamanho * 0.25 + 5)),
      }}
    >
      {comFoto ? (
        <img src={foto} alt="" className="size-full object-cover" onError={() => setFalhou(true)} />
      ) : (
        iniciais(grupo?.nome)
      )}
    </span>
  );
}

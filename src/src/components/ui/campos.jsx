import { Children, cloneElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../lib/utils.js';

// Campos de formulário. Texto e área de texto são os controles nativos. As
// listas de escolha (com cor, foto ou ícone) ficam em `selecao.jsx`, e a data
// em `campo-data.jsx`, todos com a mesma moldura daqui.

export const baseControle =
  'w-full rounded-xl border border-borda bg-superficie text-[15px] text-texto shadow-cartao outline-none transition-[border-color,box-shadow] placeholder:text-apagado hover:border-borda-forte focus-visible:border-primaria-barra focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primaria-barra/15 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-perigo aria-[invalid=true]:focus-visible:ring-perigo/15';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(baseControle, 'h-11 px-3.5', className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseControle, 'min-h-[104px] resize-y px-3.5 py-3 leading-relaxed', className)}
      {...props}
    />
  );
});

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-[13px] font-semibold tracking-wide text-suave', className)}
      {...props}
    />
  );
}

/**
 * Rótulo + controle + dica + erro, já ligados por id e aria-describedby.
 * O filho (o controle) recebe `id`, `aria-invalid` e `aria-describedby`.
 */
export function Field({ id, label, obrigatorio, dica, erro, className, children }) {
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  const descritores = [idErro, idDica].filter(Boolean).join(' ') || undefined;

  const filho = Children.only(children);
  const controle = isValidElement(filho)
    ? cloneElement(filho, {
        id: filho.props.id ?? id,
        'aria-invalid': erro ? true : undefined,
        'aria-describedby': descritores,
      })
    : filho;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {obrigatorio && (
            <span className="ml-0.5 text-primaria-texto" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {controle}
      {erro && (
        <p id={idErro} className="text-[13px] font-medium text-perigo">
          {erro}
        </p>
      )}
      {dica && (
        <p id={idDica} className="text-[13px] leading-snug text-sutil">
          {dica}
        </p>
      )}
    </div>
  );
}

/**
 * Liga e desliga (role="switch"). `ligado` e `aoMudar(boolean)`.
 */
export function Interruptor({ ligado, aoMudar, rotulo, id, className, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={ligado}
      aria-label={rotulo}
      disabled={disabled}
      onClick={() => aoMudar(!ligado)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primaria-barra/20 disabled:cursor-not-allowed disabled:opacity-60',
        ligado ? 'border-primaria-barra bg-primaria-barra' : 'border-borda-forte bg-superficie-3',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'block size-[18px] rounded-full bg-white shadow-cartao transition-transform',
          ligado ? 'translate-x-[22px]' : 'translate-x-[2px]'
        )}
      />
    </button>
  );
}

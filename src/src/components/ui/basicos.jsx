import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

// Peças pequenas e sem estado: cartão, selo, título de página, estado vazio.

export const Card = forwardRef(function Card({ className, as: Comp = 'div', ...props }, ref) {
  return (
    <Comp
      ref={ref}
      className={cn('rounded-[22px] border border-borda bg-superficie shadow-cartao', className)}
      {...props}
    />
  );
});

export function TituloCartao({ className, as: Comp = 'h2', ...props }) {
  return (
    <Comp
      className={cn('text-[17px] font-semibold tracking-[-0.02em] text-forte', className)}
      {...props}
    />
  );
}

export function Rotulo({ className, as: Comp = 'span', ...props }) {
  return (
    <Comp
      className={cn(
        'text-[12px] font-semibold uppercase tracking-[0.14em] text-sutil',
        className
      )}
      {...props}
    />
  );
}

const TONS = {
  neutro: 'bg-afazer-bg text-afazer',
  afazer: 'bg-afazer-bg text-afazer',
  fazendo: 'bg-fazendo-bg text-fazendo',
  concluido: 'bg-concluido-bg text-concluido',
  atrasada: 'bg-atrasada-bg text-atrasada',
  gam: 'bg-gam/10 text-gam-texto ring-1 ring-inset ring-gam/30',
  primaria: 'bg-primaria-barra/10 text-primaria-texto',
  feriado: 'bg-feriado/10 text-feriado',
  contorno: 'text-suave ring-1 ring-inset ring-borda-forte',
};

export function Badge({ tom = 'neutro', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none',
        TONS[tom] ?? TONS.neutro,
        className
      )}
      {...props}
    />
  );
}

export function PageHeader({ titulo, subtitulo, acoes, sobretitulo, children }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
      <div className="flex min-w-0 flex-col gap-1.5">
        {sobretitulo && <span className="text-sm text-sutil">{sobretitulo}</span>}
        <h1 className="text-[clamp(28px,3vw,38px)] font-semibold leading-[1.08] tracking-[-0.04em] text-forte">
          {titulo}
        </h1>
        {subtitulo && <p className="text-[15px] text-sutil">{subtitulo}</p>}
        {children}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2.5">{acoes}</div>}
    </header>
  );
}

export function EmptyState({ icone: Icone, titulo, descricao, children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-6 py-14 text-center',
        className
      )}
    >
      {Icone && (
        <span className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-primaria-barra/10 text-primaria-texto">
          <Icone className="size-6" aria-hidden="true" />
        </span>
      )}
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-forte">{titulo}</h2>
      {descricao && <p className="max-w-md text-[15px] leading-relaxed text-sutil">{descricao}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2.5">{children}</div>}
    </div>
  );
}

export function Aviso({ className, icone: Icone, children, tom = 'neutro' }) {
  const tons = {
    neutro: 'border-borda bg-superficie-2 text-suave',
    perigo: 'border-perigo/30 bg-perigo/10 text-perigo',
    alerta: 'border-fazendo/30 bg-fazendo-bg text-fazendo',
  };
  return (
    <div
      role={tom === 'perigo' ? 'alert' : undefined}
      className={cn(
        'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed',
        tons[tom],
        className
      )}
    >
      {Icone && <Icone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// Texto só para leitor de tela.
export function SoLeitor({ children }) {
  return <span className="sr-only">{children}</span>;
}

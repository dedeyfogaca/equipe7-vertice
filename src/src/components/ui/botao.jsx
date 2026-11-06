import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

// Botão do sistema. `asChild` deixa o estilo ir para o filho: é assim que um
// <Link> do React Router vira botão sem perder a navegação.
export const variantesBotao = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,color,box-shadow,filter,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variante: {
        primaria: 'bg-primaria text-primaria-fg shadow-botao hover:brightness-110',
        secundaria: 'border border-borda-forte bg-transparent text-texto hover:bg-superficie-3',
        fantasma: 'text-suave hover:bg-superficie-3 hover:text-texto',
        perigo: 'bg-perigo text-perigo-fg hover:brightness-110',
        'perigo-contorno': 'border border-perigo/40 text-perigo hover:bg-perigo/10',
        // Contraste máximo com o fundo: escura no tema claro, branca no
        // escuro. É o botão de destaque das páginas públicas.
        contraste:
          'bg-forte text-fundo shadow-[inset_0_-2px_0_rgb(0_0_0/0.08),0_1px_2px_rgb(16_24_40/0.2),0_12px_32px_-14px_rgb(11_18_32/0.55)] hover:opacity-90 dark:shadow-[inset_0_-2px_0_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.4),0_12px_32px_-14px_rgb(255_255_255/0.4)]',
        link: 'h-auto rounded-md px-0 text-primaria-texto underline-offset-4 hover:underline',
      },
      tamanho: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-[15px]',
        lg: 'h-[52px] px-6 text-base',
        icone: 'size-10 p-0',
        'icone-sm': 'size-8 p-0 [&_svg]:size-[15px]',
      },
    },
    compoundVariants: [{ variante: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variante: 'primaria', tamanho: 'md' },
  }
);

export const Button = forwardRef(function Button(
  { className, variante, tamanho, asChild = false, type, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(variantesBotao({ variante, tamanho }), className)}
      {...props}
    />
  );
});

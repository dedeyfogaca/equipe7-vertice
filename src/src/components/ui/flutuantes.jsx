import * as Menu from '@radix-ui/react-dropdown-menu';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils.js';

// Menus e dicas flutuantes (Radix): posicionamento, teclado e foco prontos.

export const MenuRaiz = Menu.Root;
export const MenuGatilho = Menu.Trigger;

export function MenuConteudo({ className, children, align = 'start', ...props }) {
  return (
    <Menu.Portal>
      <Menu.Content
        align={align}
        sideOffset={8}
        className={cn(
          'z-50 min-w-[220px] overflow-hidden rounded-2xl border border-borda bg-superficie p-1.5 text-texto shadow-flutuante data-[state=open]:animate-surgir',
          className
        )}
        {...props}
      >
        {children}
      </Menu.Content>
    </Menu.Portal>
  );
}

export function MenuItem({ className, perigo, ...props }) {
  return (
    <Menu.Item
      className={cn(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium outline-none transition-colors data-[highlighted]:bg-superficie-3 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-55 [&_svg]:size-4 [&_svg]:text-sutil',
        perigo && 'text-perigo [&_svg]:text-perigo',
        className
      )}
      {...props}
    />
  );
}

export function MenuRotulo({ className, ...props }) {
  return (
    <Menu.Label
      className={cn('px-3 pb-1.5 pt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-sutil', className)}
      {...props}
    />
  );
}

export function MenuSeparador() {
  return <Menu.Separator className="my-1.5 h-px bg-divisor" />;
}

export const ProvedorDicas = TooltipPrimitive.Provider;

/** Dica ao passar o mouse ou focar. `conteudo` é o texto da dica. */
export function Dica({ conteudo, children, lado = 'top' }) {
  if (!conteudo) return children;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={lado}
          sideOffset={8}
          className="z-50 max-w-[260px] rounded-xl border border-borda bg-superficie px-3 py-2 text-[13px] leading-snug text-texto shadow-flutuante data-[state=delayed-open]:animate-surgir"
        >
          {conteudo}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

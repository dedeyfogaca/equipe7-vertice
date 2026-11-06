import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as AlertPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Button } from './botao.jsx';

// Janelas sobrepostas (Radix): prendem o foco, fecham no Esc e devolvem o
// foco ao botão que as abriu (o que um <div> posicionado não faz sozinho).

const classeFundo =
  'fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-surgir data-[state=closed]:animate-sumir';
const classeJanela =
  'fixed left-1/2 top-1/2 z-50 flex max-h-[min(88dvh,760px)] w-[min(calc(100vw-32px),var(--largura,520px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-borda bg-superficie text-texto shadow-flutuante outline-none data-[state=open]:animate-subir data-[state=closed]:animate-sumir';

/**
 * Janela com título, conteúdo e rodapé. `aoAbrir` recebe o evento de foco
 * inicial do Radix: chame `preventDefault()` e foque outro elemento para não
 * começar pelo botão de fechar.
 */
export function Dialogo({ aberto, aoMudar, titulo, descricao, largura = 520, children, rodape, aoAbrir }) {
  return (
    <DialogPrimitive.Root open={aberto} onOpenChange={aoMudar}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={classeFundo} />
        <DialogPrimitive.Content
          className={classeJanela}
          style={{ '--largura': `${largura}px` }}
          onOpenAutoFocus={aoAbrir}
        >
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
            <div className="flex flex-col gap-1.5">
              <DialogPrimitive.Title className="text-xl font-semibold tracking-[-0.03em] text-forte">
                {titulo}
              </DialogPrimitive.Title>
              {descricao ? (
                <DialogPrimitive.Description className="text-sm leading-relaxed text-sutil">
                  {descricao}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">{titulo}</DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <Button variante="fantasma" tamanho="icone-sm" aria-label="Fechar">
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3">{children}</div>
          {rodape && (
            <div className="flex flex-wrap justify-end gap-2.5 border-t border-divisor bg-superficie-2 px-6 py-4">
              {rodape}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/**
 * Confirmação de ação destrutiva. `children` entra entre a mensagem e os
 * botões: é onde a remoção de membro pede quem assume as atividades.
 */
export function Confirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigo = false,
  podeConfirmar = true,
  onConfirmar,
  onCancelar,
  children,
}) {
  return (
    <AlertPrimitive.Root open={aberto} onOpenChange={(abrir) => !abrir && onCancelar?.()}>
      <AlertPrimitive.Portal>
        <AlertPrimitive.Overlay className={classeFundo} />
        <AlertPrimitive.Content className={cn(classeJanela, 'p-6')} style={{ '--largura': '460px' }}>
          <AlertPrimitive.Title className="text-xl font-semibold tracking-[-0.03em] text-forte">
            {titulo}
          </AlertPrimitive.Title>
          <AlertPrimitive.Description className="mt-2 text-[15px] leading-relaxed text-sutil">
            {mensagem}
          </AlertPrimitive.Description>
          {children && <div className="mt-5">{children}</div>}
          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <AlertPrimitive.Cancel asChild>
              <Button variante="secundaria">{textoCancelar}</Button>
            </AlertPrimitive.Cancel>
            <Button
              variante={perigo ? 'perigo' : 'primaria'}
              disabled={!podeConfirmar}
              onClick={onConfirmar}
            >
              {textoConfirmar}
            </Button>
          </div>
        </AlertPrimitive.Content>
      </AlertPrimitive.Portal>
    </AlertPrimitive.Root>
  );
}

export const FecharDialogo = DialogPrimitive.Close;

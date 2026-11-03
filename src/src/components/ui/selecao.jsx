import { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

import { baseControle } from './campos.jsx';
import { cn } from '../../lib/utils.js';

/**
 * Lista de escolha com a identidade do sistema: cada opção pode trazer a cor
 * da disciplina, a foto do membro ou um ícone, e o escolhido aparece igual
 * no campo. Teclado (setas, Enter, Esc, digitar a inicial) e leitor de tela
 * vêm prontos do Radix.
 *
 * - `opcoes`: [{ valor, rotulo, icone?, detalhe?, desabilitada?, acao? }].
 *   `icone` é um elemento (bolinha de cor, avatar, ícone). `detalhe` aparece
 *   só na lista, à direita. Opção com `acao: true` não vira o valor do campo:
 *   ela chama `aoAcionar` (é assim que o "Criar novo conteúdo" entra no fim
 *   da lista, alcançável pelo teclado como as outras).
 * - `valor` vazio mostra o `placeholder`.
 *
 * Dentro de `<Field>`, recebe `id`, `aria-invalid` e `aria-describedby`.
 */
export const SelectRico = forwardRef(function SelectRico(
  {
    id,
    valor,
    aoMudar,
    aoAcionar,
    opcoes,
    placeholder = 'Selecione',
    disabled,
    className,
    classeConteudo,
    ...rest
  },
  ref
) {
  const aoTrocar = (novo) => {
    const opcao = opcoes.find((o) => o.valor === novo);
    if (opcao?.acao) {
      aoAcionar?.(novo);
      return;
    }
    aoMudar?.(novo);
  };

  const comuns = opcoes.filter((o) => !o.acao);
  const acoes = opcoes.filter((o) => o.acao);

  return (
    <SelectPrimitive.Root value={valor ?? ''} onValueChange={aoTrocar} disabled={disabled}>
      <SelectPrimitive.Trigger
        ref={ref}
        id={id}
        className={cn(
          baseControle,
          // O Radix não deixa estilizar a caixa do valor direto (ignora o
          // className dela): o `[&>span]` a alcança pelo pai.
          'relative flex h-11 items-center pl-3.5 pr-10 text-left data-[placeholder]:text-apagado [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate',
          className
        )}
        {...rest}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-sutil"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            'z-50 max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[min(calc(100vw-24px),400px)] overflow-hidden rounded-2xl border border-borda bg-superficie text-texto shadow-flutuante data-[state=open]:animate-surgir',
            classeConteudo
          )}
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {comuns.map((opcao) => (
              <ItemRico key={opcao.valor} opcao={opcao} />
            ))}
            {acoes.length > 0 && (
              <>
                {comuns.length > 0 && <SelectPrimitive.Separator className="my-1.5 h-px bg-divisor" />}
                {acoes.map((opcao) => (
                  <ItemRico key={opcao.valor} opcao={opcao} />
                ))}
              </>
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
});

function ItemRico({ opcao }) {
  return (
    <SelectPrimitive.Item
      value={opcao.valor}
      disabled={opcao.desabilitada}
      textValue={opcao.rotulo}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl py-2.5 pl-3 pr-9 text-[14px] font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[highlighted]:bg-superficie-3 data-[disabled]:opacity-50 data-[state=checked]:text-forte [&>span:first-child]:min-w-0 [&>span:first-child]:flex-1',
        opcao.acao && 'text-primaria-texto data-[highlighted]:text-primaria-texto'
      )}
    >
      {/* O que está dentro do ItemText é o que aparece no campo depois de
          escolhido: o marcador e o nome. (O Radix também ignora o className
          do ItemText; o estilo vai na caixa de dentro.) */}
      <SelectPrimitive.ItemText>
        <span className="flex min-w-0 items-center gap-2.5">
          {opcao.icone}
          <span className="truncate">{opcao.rotulo}</span>
        </span>
      </SelectPrimitive.ItemText>
      {opcao.detalhe && <span className="ml-auto shrink-0 pl-2 text-[12px] font-normal text-sutil">{opcao.detalhe}</span>}
      <SelectPrimitive.ItemIndicator className="absolute right-3 top-1/2 -translate-y-1/2">
        <Check className="size-4 text-primaria-texto" aria-hidden="true" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

// ----- Marcadores usados nas opções -----

/** Quadradinho na cor da disciplina, como na legenda do calendário. */
export function PontoCor({ cor, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('size-2.5 shrink-0 rounded-[3px]', className)}
      style={{ background: cor || 'var(--borda-forte)' }}
    />
  );
}

/** Ícone do lucide no tamanho e na cor das opções. */
export function IconeOpcao({ icone: Icone, className }) {
  return <Icone aria-hidden="true" className={cn('size-4 shrink-0 text-sutil', className)} />;
}

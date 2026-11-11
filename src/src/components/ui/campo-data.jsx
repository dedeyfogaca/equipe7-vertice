import { useEffect, useMemo, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { useFeriados } from '../../hooks/useFeriados.js';
import { Button } from './botao.jsx';
import { baseControle } from './campos.jsx';
import { dataLocal, formatarData, formatarDataExtensa, hojeISO, paraISO } from '../../lib/datas.js';
import { capitalizar, DIAS_CURTOS, DIAS_LONGOS, MESES, tituloMes } from '../../lib/formatos.js';
import { cn } from '../../lib/utils.js';

/**
 * Campo de data com o calendário do próprio sistema, no lugar do seletor do
 * navegador (que muda de cara em cada aparelho). Mostra hoje, os fins de
 * semana e os feriados nacionais. Grava 'AAAA-MM-DD', como antes.
 *
 * Teclado, com o calendário aberto: setas andam um dia ou uma semana,
 * PageUp/PageDown trocam o mês, Home/End vão ao começo e ao fim da semana,
 * Enter escolhe e Esc fecha.
 *
 * Dentro de `<Field>`, recebe `id`, `aria-invalid` e `aria-describedby`.
 */
export function CampoData({
  id,
  valor,
  aoMudar,
  placeholder = 'Selecione a data',
  curto = false,
  className,
  ...rest
}) {
  const [aberto, setAberto] = useState(false);
  const selecionada = dataLocal(valor);

  return (
    <PopoverPrimitive.Root open={aberto} onOpenChange={setAberto}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          className={cn(baseControle, 'relative flex h-11 items-center gap-2.5 pl-3.5 pr-10 text-left', className)}
          {...rest}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-sutil" />
          {selecionada ? (
            <span className="min-w-0 flex-1 truncate">
              {curto ? formatarData(valor) : capitalizar(formatarDataExtensa(valor))}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate text-apagado">{placeholder}</span>
          )}
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-sutil"
          />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          aria-label="Escolher a data"
          className="z-50 w-[316px] max-w-[calc(100vw-24px)] rounded-2xl border border-borda bg-superficie p-3 text-texto shadow-flutuante outline-none data-[state=open]:animate-surgir"
          onOpenAutoFocus={(evento) => {
            // O foco vai para o dia escolhido (ou hoje), e não para o
            // primeiro botão do cabeçalho.
            evento.preventDefault();
            requestAnimationFrame(() =>
              document.querySelector('[data-campo-data] [data-foco="true"]')?.focus()
            );
          }}
        >
          <Calendario
            valor={selecionada ? valor : ''}
            aoEscolher={(iso) => {
              aoMudar(iso);
              setAberto(false);
            }}
            aoLimpar={() => {
              aoMudar('');
              setAberto(false);
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function somarDias(data, dias) {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

function primeiroDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}

// Mesmo dia em outro mês; o dia 31 vira o último dia do mês que não tem 31.
function somarMeses(data, meses) {
  const alvo = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimo = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  alvo.setDate(Math.min(data.getDate(), ultimo));
  return alvo;
}

function rotuloDoDia(data, { hoje, feriado, escolhido }) {
  return [
    `${data.getDate()} de ${MESES[data.getMonth()]} de ${data.getFullYear()}, ${DIAS_LONGOS[data.getDay()].toLowerCase()}`,
    hoje ? 'hoje' : null,
    feriado ? `feriado: ${feriado.name}` : null,
    escolhido ? 'escolhido' : null,
  ]
    .filter(Boolean)
    .join(', ');
}

function Calendario({ valor, aoEscolher, aoLimpar }) {
  const hoje = hojeISO();
  const inicial = dataLocal(valor) || dataLocal(hoje);
  const [mesVisivel, setMesVisivel] = useState(() => primeiroDoMes(inicial));
  const [foco, setFoco] = useState(() => paraISO(inicial));
  const [direcao, setDirecao] = useState(null);
  const precisaFocar = useRef(false);
  const grade = useRef(null);

  const ano = mesVisivel.getFullYear();
  const mes = mesVisivel.getMonth();
  const { feriadoEm } = useFeriados(useMemo(() => [ano], [ano]));

  // Sempre seis semanas: a janela não muda de altura de um mês para outro.
  const dias = useMemo(() => {
    const inicio = somarDias(mesVisivel, -mesVisivel.getDay());
    return Array.from({ length: 42 }, (_, i) => somarDias(inicio, i));
  }, [mesVisivel]);

  // Depois de andar pelo teclado, o foco acompanha o dia.
  useEffect(() => {
    if (!precisaFocar.current) return;
    precisaFocar.current = false;
    grade.current?.querySelector(`[data-dia="${foco}"]`)?.focus();
  }, [foco, mesVisivel]);

  const irParaMes = (novo, novoFoco) => {
    const alvo = primeiroDoMes(novo);
    if (alvo.getTime() !== mesVisivel.getTime()) {
      setDirecao(alvo > mesVisivel ? 'proximo' : 'anterior');
      setMesVisivel(alvo);
    }
    if (novoFoco) setFoco(novoFoco);
  };

  const trocarMes = (passo) => {
    const novoFoco = somarMeses(dataLocal(foco), passo);
    irParaMes(novoFoco, paraISO(novoFoco));
  };

  const moverFoco = (evento) => {
    const atual = dataLocal(foco);
    let destino = null;
    switch (evento.key) {
      case 'ArrowLeft':
        destino = somarDias(atual, -1);
        break;
      case 'ArrowRight':
        destino = somarDias(atual, 1);
        break;
      case 'ArrowUp':
        destino = somarDias(atual, -7);
        break;
      case 'ArrowDown':
        destino = somarDias(atual, 7);
        break;
      case 'PageUp':
        destino = somarMeses(atual, -1);
        break;
      case 'PageDown':
        destino = somarMeses(atual, 1);
        break;
      case 'Home':
        destino = somarDias(atual, -atual.getDay());
        break;
      case 'End':
        destino = somarDias(atual, 6 - atual.getDay());
        break;
      default:
        return;
    }
    evento.preventDefault();
    precisaFocar.current = true;
    irParaMes(destino, paraISO(destino));
  };

  const irParaHoje = () => {
    precisaFocar.current = true;
    irParaMes(dataLocal(hoje), hoje);
  };

  const animacao = direcao === 'proximo' ? 'animate-mes-proximo' : direcao === 'anterior' ? 'animate-mes-anterior' : '';

  return (
    <div data-campo-data className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 pl-1.5">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-forte" aria-live="polite">
          {tituloMes(ano, mes)}
        </span>
        <div className="flex gap-1">
          <Button variante="fantasma" tamanho="icone-sm" aria-label="Mês anterior" onClick={() => trocarMes(-1)}>
            <ChevronLeft />
          </Button>
          <Button variante="fantasma" tamanho="icone-sm" aria-label="Próximo mês" onClick={() => trocarMes(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7" aria-hidden="true">
        {DIAS_CURTOS.map((d, i) => (
          <span
            key={d}
            className={cn(
              'py-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em]',
              i === 0 || i === 6 ? 'text-apagado' : 'text-sutil'
            )}
          >
            {d}
          </span>
        ))}
      </div>

      {/* A grade troca de lado conforme o mês avança ou volta. */}
      <div className="overflow-hidden">
        <div
          key={`${ano}-${mes}`}
          ref={grade}
          role="group"
          aria-label={tituloMes(ano, mes)}
          onKeyDown={moverFoco}
          className={cn('grid grid-cols-7 gap-y-0.5', animacao)}
        >
          {dias.map((data) => {
            const iso = paraISO(data);
            const doMes = data.getMonth() === mes;
            const ehHoje = iso === hoje;
            const escolhido = iso === valor;
            const feriado = feriadoEm(iso);
            const fimDeSemana = data.getDay() === 0 || data.getDay() === 6;
            return (
              <button
                key={iso}
                type="button"
                data-dia={iso}
                data-foco={iso === foco ? 'true' : undefined}
                tabIndex={iso === foco ? 0 : -1}
                aria-pressed={escolhido}
                aria-label={rotuloDoDia(data, { hoje: ehHoje, feriado, escolhido })}
                title={feriado ? feriado.name : undefined}
                onClick={() => aoEscolher(iso)}
                onFocus={() => setFoco(iso)}
                className={cn(
                  'numero relative mx-auto flex size-10 items-center justify-center rounded-full text-[14px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primaria-barra',
                  escolhido
                    ? 'bg-primaria text-primaria-fg shadow-botao'
                    : cn(
                        'hover:bg-superficie-3',
                        ehHoje && 'text-primaria-texto ring-1 ring-inset ring-primaria-barra/60',
                        !ehHoje && (doMes ? (fimDeSemana ? 'text-sutil' : 'text-texto') : 'text-apagado opacity-50')
                      )
                )}
              >
                {data.getDate()}
                {feriado && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full',
                      escolhido ? 'bg-primaria-fg' : 'bg-feriado'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 border-t border-divisor pt-2.5">
        <Button variante="fantasma" tamanho="sm" className="h-8 px-3" onClick={irParaHoje}>
          Ir para hoje
        </Button>
        <span className="flex items-center gap-1.5 text-[12px] text-sutil">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-feriado" />
          Feriado
        </span>
        {valor ? (
          <Button variante="fantasma" tamanho="sm" className="h-8 px-3" onClick={aoLimpar}>
            Limpar
          </Button>
        ) : (
          <span className="w-[68px]" />
        )}
      </div>
    </div>
  );
}

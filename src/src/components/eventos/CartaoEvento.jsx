import { CalendarDays, Clock, MapPin } from 'lucide-react';

import { Badge } from '../ui/basicos.jsx';
import { horarioDoEvento, iconeDoEvento, quandoEvento } from './tipos.jsx';
import { rotuloTipoEvento } from '../../lib/constants.js';
import { dataLocal, diasRestantes } from '../../lib/datas.js';
import { DIAS_CURTOS, MESES, ddmm } from '../../lib/formatos.js';
import { cn, corComAlfa } from '../../lib/utils.js';

/** Bloco com o dia: 'QUA / 18 / nov'. */
function BlocoDia({ iso, cor }) {
  const data = dataLocal(iso);
  if (!data) return null;
  return (
    <span
      aria-hidden="true"
      className="flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl py-2 text-center"
      style={{ background: corComAlfa(cor, 'var(--alfa-etiqueta)') }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sutil">{DIAS_CURTOS[data.getDay()]}</span>
      <span className="numero text-[22px] font-bold leading-none tracking-[-0.03em] text-forte">{data.getDate()}</span>
      <span className="text-[11px] font-medium text-sutil">{MESES[data.getMonth()].slice(0, 3)}</span>
    </span>
  );
}

/**
 * Um evento do grupo (RF31). `compacto` é a versão do painel do dia e do
 * painel do grupo: sem o bloco do dia nem as observações (no compacto, o dia
 * vem escrito, a não ser com `mostrarDia={false}`, no painel do próprio
 * dia). `acoes` entra à direita (o menu de editar e excluir). `feriado`,
 * quando o evento cai num feriado nacional, aparece como aviso.
 */
export function CartaoEvento({ evento, disciplina, compacto = false, mostrarDia = true, feriado, acoes, className }) {
  const Icone = iconeDoEvento(evento.tipo);
  const cor = disciplina?.cor || '#06b6d4';
  const dias = diasRestantes(evento.data);
  const passou = dias !== null && dias < 0;
  const quando = quandoEvento(evento);

  return (
    <div
      data-evento={evento.id}
      className={cn(
        'flex gap-3.5 rounded-2xl border border-borda bg-superficie transition-colors hover:border-borda-forte',
        compacto ? 'p-3' : 'p-4',
        passou && 'opacity-70',
        className
      )}
    >
      {!compacto && mostrarDia && <BlocoDia iso={evento.data} cor={cor} />}
      {compacto && (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: corComAlfa(cor, 'var(--alfa-etiqueta)'), color: cor }}
        >
          <Icone className="size-[18px]" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className={cn('font-semibold tracking-[-0.01em] text-forte', compacto ? 'text-[15px]' : 'text-base')}>
            {evento.titulo}
          </h3>
          {!compacto && (
            <Badge tom="contorno">
              <Icone className="size-3.5" aria-hidden="true" />
              {rotuloTipoEvento(evento.tipo)}
            </Badge>
          )}
          {!compacto && quando && (
            <Badge tom={dias === 0 ? 'primaria' : dias === 1 ? 'fazendo' : 'neutro'}>{quando}</Badge>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-sutil">
          {compacto && mostrarDia && (
            <span className="inline-flex items-center gap-1.5 font-medium text-suave">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {DIAS_CURTOS[dataLocal(evento.data)?.getDay() ?? 0]}, {ddmm(evento.data)}
              {quando && <span className="font-normal text-sutil">({quando.toLowerCase()})</span>}
            </span>
          )}
          {compacto && !mostrarDia && <span className="font-medium text-suave">{rotuloTipoEvento(evento.tipo)}</span>}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {horarioDoEvento(evento)}
          </span>
          {evento.local && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {evento.local}
            </span>
          )}
          {disciplina && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: disciplina.cor }} />
              {disciplina.nome}
            </span>
          )}
        </p>
        {feriado && (
          <p className="text-[13px] font-medium text-feriado">Cai no feriado: {feriado.name}.</p>
        )}
        {!compacto && evento.descricao && (
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-texto">{evento.descricao}</p>
        )}
      </div>
      {acoes && <div className="-mr-1 -mt-1 shrink-0">{acoes}</div>}
    </div>
  );
}

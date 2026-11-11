import { CalendarDays, Mic, PenLine, Presentation, Users } from 'lucide-react';

import { IconeOpcao } from '../ui/selecao.jsx';
import { TIPO_EVENTO, TIPO_EVENTO_OPCOES } from '../../lib/constants.js';
import { diasEntre, diasRestantes } from '../../lib/datas.js';
import { ddmm } from '../../lib/formatos.js';

// Ícone de cada tipo de evento (RF31). O mesmo desenho aparece na lista de
// eventos, no calendário e no painel.
export const ICONE_EVENTO = {
  [TIPO_EVENTO.PROVA]: PenLine,
  [TIPO_EVENTO.APRESENTACAO]: Presentation,
  [TIPO_EVENTO.PALESTRA]: Mic,
  [TIPO_EVENTO.REUNIAO]: Users,
  [TIPO_EVENTO.OUTRO]: CalendarDays,
};

export function iconeDoEvento(tipo) {
  return ICONE_EVENTO[tipo] ?? CalendarDays;
}

export const OPCOES_TIPO_EVENTO = TIPO_EVENTO_OPCOES.map((o) => ({
  ...o,
  icone: <IconeOpcao icone={iconeDoEvento(o.valor)} />,
}));

// Evento de vários dias (revisão de 11/11/2026): `dataFim` é o último dia.
// Sem ela, o evento é de um dia só.
export function fimDoEvento(evento) {
  return evento?.dataFim && evento.dataFim > evento.data ? evento.dataFim : evento?.data;
}
export const eventoDeVariosDias = (evento) => fimDoEvento(evento) !== evento?.data;

/** O evento acontece (também) neste dia? */
export function eventoNoDia(evento, iso) {
  return Boolean(evento?.data) && evento.data <= iso && iso <= fimDoEvento(evento);
}

/** '18/11 a 20/11 (3 dias)', para o evento de vários dias. */
export function periodoDoEvento(evento) {
  if (!eventoDeVariosDias(evento)) return ddmm(evento.data);
  const dias = (diasEntre(evento.data, fimDoEvento(evento)) ?? 0) + 1;
  return `${ddmm(evento.data)} a ${ddmm(fimDoEvento(evento))} (${dias} dias)`;
}

/**
 * '19:00 às 20:40', '19:30' ou 'O dia todo'. Em vários dias, o início é do
 * primeiro dia e o fim, do último: 'Começa às 19:00, termina às 10:00'.
 */
export function horarioDoEvento(evento) {
  if (eventoDeVariosDias(evento)) {
    if (!evento?.horaInicio) return 'Os dias todos';
    return evento.horaFim ? `Começa às ${evento.horaInicio}, termina às ${evento.horaFim}` : `Começa às ${evento.horaInicio}`;
  }
  if (!evento?.horaInicio) return 'O dia todo';
  return evento.horaFim ? `${evento.horaInicio} às ${evento.horaFim}` : evento.horaInicio;
}

/** 'Hoje', 'Amanhã', 'Em 5 dias', 'Acontecendo', 'Foi ontem', 'Foi há 3 dias'. */
export function quandoEvento(evento) {
  const dias = diasRestantes(evento?.data);
  if (dias === null) return '';
  if (eventoDeVariosDias(evento)) {
    const ate = diasRestantes(fimDoEvento(evento));
    if (dias <= 0 && ate >= 0) return ate === 0 ? 'Último dia hoje' : 'Acontecendo';
    if (ate < 0) return ate === -1 ? 'Terminou ontem' : `Terminou há ${Math.abs(ate)} dias`;
  }
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  if (dias > 1) return `Em ${dias} dias`;
  if (dias === -1) return 'Foi ontem';
  return `Foi há ${Math.abs(dias)} dias`;
}

/** Evento ainda por acontecer ou acontecendo (hoje conta como por acontecer). */
export function eventoFuturo(evento) {
  const dias = diasRestantes(fimDoEvento(evento));
  return dias !== null && dias >= 0;
}

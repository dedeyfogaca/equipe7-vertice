import { CalendarDays, Mic, PenLine, Presentation, Users } from 'lucide-react';

import { IconeOpcao } from '../ui/selecao.jsx';
import { TIPO_EVENTO, TIPO_EVENTO_OPCOES } from '../../lib/constants.js';
import { diasRestantes } from '../../lib/datas.js';

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

/** '19:00 às 20:40', '19:30' ou 'O dia todo'. */
export function horarioDoEvento(evento) {
  if (!evento?.horaInicio) return 'O dia todo';
  return evento.horaFim ? `${evento.horaInicio} às ${evento.horaFim}` : evento.horaInicio;
}

/** 'Hoje', 'Amanhã', 'Em 5 dias', 'Foi ontem', 'Foi há 3 dias'. */
export function quandoEvento(evento) {
  const dias = diasRestantes(evento?.data);
  if (dias === null) return '';
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  if (dias > 1) return `Em ${dias} dias`;
  if (dias === -1) return 'Foi ontem';
  return `Foi há ${Math.abs(dias)} dias`;
}

/** Evento ainda por acontecer (hoje conta como por acontecer). */
export function eventoFuturo(evento) {
  const dias = diasRestantes(evento?.data);
  return dias !== null && dias >= 0;
}

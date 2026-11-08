// Histórico do progresso de uma disciplina (RF12): o percentual dia a dia.
//
// Com conta, o próprio banco tira uma fotografia do progresso a cada
// mudança nas atividades (tabela progresso_historico). No modo de
// demonstração não há banco: o histórico é reconstruído pelas datas de
// criação e de conclusão das atividades. Nos dois casos a regra do
// percentual é a mesma do RN14 (pesos somados).

import { normalizarPeso, STATUS } from './constants.js';
import { dataLocal, hojeISO, paraISO } from './datas.js';
import { diaLocal } from './gamificacao.js';

const MAX_DIAS = 60;

function diasEntre(inicio, fim) {
  const dias = [];
  const d = dataLocal(inicio);
  const ultimo = dataLocal(fim);
  if (!d || !ultimo) return dias;
  while (d <= ultimo) {
    dias.push(paraISO(d));
    d.setDate(d.getDate() + 1);
  }
  return dias.slice(-MAX_DIAS);
}

/** Demonstração: refaz o percentual de cada dia a partir das atividades. */
export function reconstruirHistorico(atividades = [], hoje = hojeISO()) {
  const comDia = atividades
    .map((a) => ({ a, criada: diaLocal(a.criadaEm) || hoje, concluida: a.status === STATUS.CONCLUIDO ? diaLocal(a.dataConclusao) : null }))
    .filter(({ criada }) => criada <= hoje);
  if (comDia.length === 0) return [];
  const inicio = comDia.reduce((min, x) => (x.criada < min ? x.criada : min), hoje);
  return diasEntre(inicio, hoje).map((dia) => {
    let total = 0;
    let feito = 0;
    comDia.forEach(({ a, criada, concluida }) => {
      if (criada > dia) return;
      const peso = normalizarPeso(a.peso);
      total += peso;
      if (concluida && concluida <= dia) feito += peso;
    });
    return { data: dia, percentual: total > 0 ? Math.round((100 * feito) / total) : 0 };
  });
}

/**
 * Com conta: as fotografias do banco só existem nos dias em que algo mudou.
 * Entre uma e outra o percentual é o da última, até hoje (que usa o valor
 * atual da tela, já que a gravação pode estar a caminho).
 */
export function completarHistorico(fotos = [], percentualDeHoje = null, hoje = hojeISO()) {
  const ordenadas = [...fotos].sort((x, y) => x.data.localeCompare(y.data));
  if (ordenadas.length === 0) return percentualDeHoje == null ? [] : [{ data: hoje, percentual: percentualDeHoje }];
  const porDia = new Map(ordenadas.map((f) => [f.data, Math.round(Number(f.percentual))]));
  const dias = diasEntre(ordenadas[0].data, hoje);
  // Janela cortada (mais de 60 dias): começa com a última foto antes dela.
  const anterior = ordenadas.filter((f) => f.data < dias[0]).pop();
  let atual = anterior ? Math.round(Number(anterior.percentual)) : 0;
  const serie = dias.map((dia) => {
    if (porDia.has(dia)) atual = porDia.get(dia);
    return { data: dia, percentual: atual };
  });
  if (percentualDeHoje != null && serie.length) serie[serie.length - 1].percentual = percentualDeHoje;
  return serie;
}

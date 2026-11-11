// Utilitários de data. O prazo das atividades é guardado como 'AAAA-MM-DD'
// (o formato que o campo de data entrega), e tratamos tudo no fuso local
// para evitar o clássico "pulo de um dia" causado pelo UTC.

export function paraISO(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hojeISO() {
  return paraISO(new Date());
}

// Converte 'AAAA-MM-DD' em Date no fuso local.
//
// Data que não existe ('2026-02-31') é recusada: o Date do JavaScript
// "transborda" para o mês seguinte em silêncio, e um prazo vindo pelo
// endereço (?prazo=) cairia num dia que ninguém escolheu.
export function dataLocal(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const partes = iso.split('-').map(Number);
  if (partes.length !== 3) return null;
  const [ano, mes, dia] = partes;
  if (!ano || !mes || !dia) return null;
  const d = new Date(ano, mes - 1, dia);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return d;
}

export function dataValida(iso) {
  return dataLocal(iso) !== null;
}

export function formatarData(iso) {
  const d = dataLocal(iso);
  return d ? d.toLocaleDateString('pt-BR') : 'Sem data';
}

export function formatarDataExtensa(iso) {
  const d = dataLocal(iso);
  if (!d) return 'Sem data';
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Diferença em dias entre hoje e o prazo (negativo = atrasada).
export function diasRestantes(iso) {
  const d = dataLocal(iso);
  if (!d) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const MS_DIA = 1000 * 60 * 60 * 24;
  return Math.round((d - hoje) / MS_DIA);
}

// Dias de `inicio` até `fim` (as duas em 'AAAA-MM-DD'); negativo se o fim vem antes.
export function diasEntre(inicio, fim) {
  const a = dataLocal(inicio);
  const b = dataLocal(fim);
  if (!a || !b) return null;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function ehFimDeSemana(iso) {
  const d = dataLocal(iso);
  if (!d) return false;
  const dia = d.getDay();
  return dia === 0 || dia === 6;
}

// Texto amigável sobre o prazo + um "tom" que define o setor de cor:
//   sucesso (verde)  = prazo tranquilo  (mais de 7 dias)
//   alerta  (amarelo) = está perto       (3 a 7 dias)
//   perigo  (vermelho) = muito perto      (até 2 dias) ou atrasada
//   neutro            = sem prazo
export function rotuloPrazo(iso) {
  const dias = diasRestantes(iso);
  if (dias === null) return { texto: 'Sem prazo', tom: 'neutro' };
  if (dias < 0) {
    const n = Math.abs(dias);
    return { texto: `Atrasada há ${n} dia${n > 1 ? 's' : ''}`, tom: 'perigo' };
  }
  if (dias === 0) return { texto: 'Vence hoje', tom: 'perigo' };
  if (dias === 1) return { texto: 'Vence amanhã', tom: 'perigo' };
  if (dias <= 2) return { texto: `Faltam ${dias} dias`, tom: 'perigo' };
  if (dias <= 7) return { texto: `Faltam ${dias} dias`, tom: 'alerta' };
  return { texto: `Faltam ${dias} dias`, tom: 'sucesso' };
}

export function anoDaData(iso) {
  const d = dataLocal(iso);
  return d ? d.getFullYear() : null;
}

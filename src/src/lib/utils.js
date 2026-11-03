import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Junta classes do Tailwind resolvendo conflitos: `cn('px-2', cond && 'px-4')`
// fica só com `px-4`. É o que permite um componente aceitar `className` sem
// brigar com o próprio estilo.
export function cn(...entradas) {
  return twMerge(clsx(entradas));
}

// Cor da disciplina com transparência, para fundos de etiqueta e barras
// suaves. Recebe '#rrggbb'. O `alfa` pode ser número ou expressão CSS
// ('var(--alfa-etiqueta)'), para a opacidade mudar com o tema.
export function corComAlfa(hex, alfa) {
  const valor = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex : '#64748b';
  const n = Number.parseInt(valor.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alfa})`;
}

// Tira o erro de um campo quando a pessoa volta a mexer nele. Devolve o
// mesmo objeto quando não havia erro ali, para o React não redesenhar à toa.
export function semErroEm(erros, campo) {
  if (!erros || !(campo in erros)) return erros;
  const { [campo]: _removido, ...resto } = erros;
  return resto;
}

// "Ana Souza" -> "Ana". Para a saudação do painel.
export function primeiroNome(nome) {
  return (nome || '').trim().split(/\s+/)[0] || '';
}

// Plural simples: plural(3, 'atividade') -> '3 atividades'.
export function plural(quantidade, singular, pluralForma = `${singular}s`) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralForma}`;
}

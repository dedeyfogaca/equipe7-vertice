// Avatares do membro, desenhados no próprio navegador com a biblioteca da
// DiceBear: nenhuma imagem vem de fora, então o avatar aparece também sem
// internet e em páginas que bloqueiam imagens externas.
//
// O avatar sai de uma semente ALEATÓRIA salva no cadastro (campo `avatar`),
// não do nome: se a pessoa não gostar, é só sortear outra. O estilo (campo
// `estiloAvatar`) é escolhido entre os dois abaixo. Dados antigos sem semente
// usam o nome como reserva; sem estilo, ou com um dos estilos que saíram em
// 06/11/2026, usam o estilo padrão.

import { createAvatar } from '@dicebear/core';
import * as croodlesNeutral from '@dicebear/croodles-neutral';
import * as notionists from '@dicebear/notionists';

// Estilos oferecidos. Os créditos de cada um (licença dos desenhos) estão no
// README de `src/`.
export const ESTILOS_AVATAR = [
  { id: 'croodles-neutral', rotulo: 'Rabisco', estilo: croodlesNeutral },
  { id: 'notionists', rotulo: 'Ilustrado', estilo: notionists },
];

export const ESTILO_AVATAR_PADRAO = 'croodles-neutral';

export function estiloAvatarValido(id) {
  return ESTILOS_AVATAR.some((e) => e.id === id);
}

// Fundos pastéis (a cor é escolhida pela semente), para os traços ficarem
// visíveis também no tema escuro.
const FUNDOS = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];

// Desenhar o SVG custa pouco, mas as listas mostram o mesmo avatar várias
// vezes: cada combinação de estilo e semente é desenhada uma vez só.
const cache = new Map();

function normalizarSemente(seed) {
  return (seed || 'membro').trim().toLowerCase() || 'membro';
}

/** Imagem do avatar como `data:` URI, pronta para o `src` de um <img>. */
export function urlAvatar(seed, { estilo = ESTILO_AVATAR_PADRAO } = {}) {
  const id = estiloAvatarValido(estilo) ? estilo : ESTILO_AVATAR_PADRAO;
  const semente = normalizarSemente(seed);
  const chave = `${id}:${semente}`;
  if (!cache.has(chave)) {
    const { estilo: desenho } = ESTILOS_AVATAR.find((e) => e.id === id);
    cache.set(chave, createAvatar(desenho, { seed: semente, backgroundColor: FUNDOS }).toDataUri());
  }
  return cache.get(chave);
}

// Sorteia uma semente nova (curta e aleatória) para o avatar.
export function novaSeedAvatar() {
  return Math.random().toString(36).slice(2, 10);
}

// Iniciais para o fallback (ex.: "Ana Souza" -> "AS").
export function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

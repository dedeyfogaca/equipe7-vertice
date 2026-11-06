// Verificação dos avatares (RF19, RN15).
//
// Roda com `npm run verificar`. Desde 01/11/2026 o avatar é desenhado no
// próprio sistema, com a biblioteca da DiceBear; desde 06/11/2026, em dois
// estilos (Croodles Neutral e Notionists). O que se
// confere: a mesma semente dá sempre o mesmo desenho, outra semente dá outro,
// cada estilo desenha diferente, e estilo desconhecido cai no padrão.

import {
  ESTILOS_AVATAR,
  ESTILO_AVATAR_PADRAO,
  estiloAvatarValido,
  iniciais,
  novaSeedAvatar,
  urlAvatar,
} from '../src/lib/avatar.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

console.log('Estilos oferecidos');
checar('são dois', ESTILOS_AVATAR.map((e) => e.id), ['croodles-neutral', 'notionists']);
checar('o padrão está entre eles', estiloAvatarValido(ESTILO_AVATAR_PADRAO), true);
checar('estilo inventado não vale', estiloAvatarValido('qualquer'), false);

console.log('Desenho');
const a = urlAvatar('abc123', { estilo: 'notionists' });
checar('é uma imagem SVG embutida, sem buscar nada fora', a.startsWith('data:image/svg+xml'), true);
checar('mesma semente e estilo, mesmo desenho', urlAvatar('abc123', { estilo: 'notionists' }) === a, true);
checar('a semente ignora maiúsculas e espaços nas pontas', urlAvatar('  ABC123 ', { estilo: 'notionists' }) === a, true);
checar('outra semente, outro desenho', urlAvatar('xyz789', { estilo: 'notionists' }) !== a, true);
const desenhos = new Set(ESTILOS_AVATAR.map((e) => urlAvatar('abc123', { estilo: e.id })));
checar('cada estilo desenha diferente', desenhos.size, 2);
checar('estilo que saiu (Aventura) usa o padrão', urlAvatar('abc123', { estilo: 'adventurer' }) === urlAvatar('abc123'), true);
checar('estilo desconhecido usa o padrão', urlAvatar('abc123', { estilo: 'qualquer' }) === urlAvatar('abc123'), true);
checar('sem semente ainda desenha', urlAvatar('').startsWith('data:image/svg+xml'), true);

console.log('Sorteio e iniciais');
const sementes = new Set(Array.from({ length: 50 }, () => novaSeedAvatar()));
checar('50 sorteios, 50 sementes diferentes', sementes.size, 50);
checar('iniciais de nome composto', iniciais('Ana Souza'), 'AS');

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
if (falhas) process.exit(1);

// Verificação do enquadramento da foto (RN19).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// O editor mostra a foto na tela, em pixels de tela; o recorte é feito na
// imagem original, em pixels da imagem. A conta que liga os dois é a que
// decide se o que a pessoa enquadrou é o que fica gravado — e se dá para
// arrastar a foto até sobrar canto vazio na moldura.

import { limitesDoArraste, recorteDaMoldura } from '../src/lib/foto.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const arredondar = ({ sx, sy, lado }) => ({
  sx: Math.round(sx),
  sy: Math.round(sy),
  lado: Math.round(lado),
});

// Foto deitada de 4000 × 3000, numa moldura de 280 px.
const deitada = { largura: 4000, altura: 3000, moldura: 280 };

console.log('\nSem mexer, o recorte é o quadrado do meio\n');

checar(
  'zoom 1, sem arrastar',
  arredondar(recorteDaMoldura({ ...deitada, zoom: 1, x: 0, y: 0 })),
  { sx: 500, sy: 0, lado: 3000 }
);

console.log('\nZoom aproxima em torno do centro\n');

checar(
  'zoom 2 pega metade do lado, no meio',
  arredondar(recorteDaMoldura({ ...deitada, zoom: 2, x: 0, y: 0 })),
  { sx: 1250, sy: 750, lado: 1500 }
);

console.log('\nArrastar a foto para a direita mostra o lado esquerdo dela\n');

// Na tela, 280 px valem 3000 px da foto (zoom 1): arrastar 70 px = 750 px.
checar(
  'arrastar 70 px para a direita',
  arredondar(recorteDaMoldura({ ...deitada, zoom: 1, x: 70, y: 0 })),
  { sx: -250, sy: 0, lado: 3000 }
);

console.log('\nOs limites impedem canto vazio\n');

const lim1 = limitesDoArraste({ ...deitada, zoom: 1 });
checar('zoom 1: só anda na horizontal, até ~46,7 px', [Math.round(lim1.x * 10) / 10, lim1.y], [46.7, 0]);
checar(
  'no limite, o recorte encosta na borda esquerda da foto',
  arredondar(recorteDaMoldura({ ...deitada, zoom: 1, x: lim1.x, y: 0 })),
  { sx: 0, sy: 0, lado: 3000 }
);

const lim2 = limitesDoArraste({ ...deitada, zoom: 2 });
checar('zoom 2: anda nos dois eixos', [Math.round(lim2.x * 10) / 10, lim2.y], [233.3, 140]);
checar(
  'no limite de baixo, o recorte encosta na borda de cima',
  arredondar(recorteDaMoldura({ ...deitada, zoom: 2, x: 0, y: lim2.y })),
  { sx: 1250, sy: 0, lado: 1500 }
);

console.log('\nFoto em pé funciona do mesmo jeito\n');

checar(
  '3000 × 4000, sem mexer',
  arredondar(recorteDaMoldura({ largura: 3000, altura: 4000, moldura: 280, zoom: 1, x: 0, y: 0 })),
  { sx: 0, sy: 500, lado: 3000 }
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

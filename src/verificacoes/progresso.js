// Verificação das regras de progresso (RN08 e RN14).
//
// Roda com `npm run verificar`, sem instalar nada: é JavaScript puro, no
// Node, chamando as mesmas funções que as telas chamam.
//
// Existe por causa de uma regra específica. O RN14 diz que o progresso da
// disciplina é a razão entre PESOS SOMADOS, e não a média dos percentuais
// dos conteúdos. As duas contas dão números diferentes, as duas parecem
// certas lendo o código, e a média é a que qualquer pessoa escreveria
// "simplificando". A verificação abaixo mostra as duas lado a lado.

import {
  progressoAntesDe,
  progressoDaDisciplina,
  progressoDoConteudo,
} from '../src/lib/progresso.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

// Atalho para montar atividade de teste: só peso e status importam aqui.
const atividade = (peso, concluida = false) => ({
  peso,
  status: concluida ? 'concluido' : 'a fazer',
});

console.log('\nRN08: progresso do conteúdo é razão de peso, não contagem\n');

// Uma única atividade concluída, mas ela sozinha vale mais que as outras quatro.
checar(
  '1 de 5 atividades concluídas, peso 5 de 9',
  progressoDoConteudo([
    atividade(5, true),
    atividade(1),
    atividade(1),
    atividade(1),
    atividade(1),
  ]).percentual,
  56
);

// O espelho: quase tudo concluído, mas o que falta é o que pesa.
checar(
  '4 de 5 atividades concluídas, peso 4 de 9',
  progressoDoConteudo([
    atividade(5),
    atividade(1, true),
    atividade(1, true),
    atividade(1, true),
    atividade(1, true),
  ]).percentual,
  44
);

checar('nada concluído', progressoDoConteudo([atividade(3), atividade(2)]).percentual, 0);
checar(
  'tudo concluído',
  progressoDoConteudo([atividade(3, true), atividade(2, true)]).percentual,
  100
);

console.log('\nRN08: conteúdo sem atividade é ausente, não 0%\n');

checar('conteúdo sem atividade devolve nulo', progressoDoConteudo([]), null);

console.log('\nRN14: progresso da disciplina é razão de pesos somados\n');

// O caso que o RN14 existe para evitar. Dois conteúdos muito diferentes:
// um grande quase pronto, um pequeno parado.
const conteudoGrande = [
  atividade(5, true),
  atividade(5, true),
  atividade(5, true),
  atividade(5),
]; // 15 de 20 -> 75%
const conteudoPequeno = [atividade(1)]; // 0 de 1 -> 0%

const disciplina = progressoDaDisciplina([conteudoGrande, conteudoPequeno]);

checar('pesos somados', [disciplina.pesoConcluido, disciplina.pesoTotal], [15, 21]);
checar('percentual pela razão de pesos', disciplina.percentual, 71);

const mediaDosPercentuais = Math.round((75 + 0) / 2);
checar(
  'a média dos percentuais daria outro número (por isso não se usa)',
  mediaDosPercentuais !== disciplina.percentual,
  true
);
console.log(`      média: ${mediaDosPercentuais}%   ·   correto: ${disciplina.percentual}%`);

console.log('\nRN14 + RN08: conteúdo vazio não derruba a disciplina\n');

checar(
  'conteúdo vazio fica fora da conta',
  progressoDaDisciplina([conteudoGrande, []]).percentual,
  75
);
checar('disciplina só com conteúdos vazios', progressoDaDisciplina([[], []]), null);
checar('disciplina sem nenhum conteúdo', progressoDaDisciplina([]), null);

console.log('\nRN09: peso ausente ou fora da faixa\n');

checar(
  'sem peso definido vale 1',
  progressoDoConteudo([{ status: 'concluido' }, { status: 'a fazer' }]).pesoTotal,
  2
);
checar(
  'peso acima da faixa é coagido para 5',
  progressoDoConteudo([{ peso: 99, status: 'concluido' }]).pesoTotal,
  5
);
checar(
  'peso abaixo da faixa é coagido para 1',
  progressoDoConteudo([{ peso: 0, status: 'concluido' }]).pesoTotal,
  1
);

console.log('\nRF15: o progresso antes da conclusão, para o retorno na tela\n');

// O "antes" é o mesmo conteúdo recalculado fingindo que a atividade ainda
// não foi concluída. O peso dela continua no total: ela sempre existiu.
const comId = (id, peso, concluida) => ({ id, ...atividade(peso, concluida) });
// Pesos dentro da faixa de propósito: 6 seria coagido para 5 (RN09) e a
// conta deixaria de ser óbvia.
const conteudoDela = [comId('x', 4, true), comId('y', 1, true), comId('z', 5)];

checar('depois: 5 de 10', progressoDoConteudo(conteudoDela).percentual, 50);
checar('antes de x: 1 de 10', progressoAntesDe(conteudoDela, 'x').percentual, 10);
checar(
  'o peso total nao muda: a atividade sempre existiu',
  progressoAntesDe(conteudoDela, 'x').pesoTotal,
  10
);
checar(
  'antes de uma que nao esta concluida nao muda nada',
  progressoAntesDe(conteudoDela, 'z').percentual,
  50
);
checar(
  'unica atividade do conteudo: de 0% para 100%',
  [
    progressoAntesDe([comId('so', 5, true)], 'so').percentual,
    progressoDoConteudo([comId('so', 5, true)]).percentual,
  ],
  [0, 100]
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

// Verificação das regras de experiência (RN10).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// O alvo aqui é o estorno. Concluir, desmarcar e concluir de novo não pode
// creditar duas vezes. É o bug clássico de quem guarda um contador e o
// incrementa a cada transição. A verificação percorre esse ciclo inteiro e
// confere o total em cada passo.

import {
  rankingDoGrupo,
  xpDaAtividade,
  xpDoGrupo,
  xpDoMembro,
  XP_POR_PESO,
} from '../src/lib/gamificacao.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const ANA = 'membro-ana';
const BRUNO = 'membro-bruno';

const atividade = (peso, status, responsavelId = ANA) => ({ peso, status, responsavelId });

console.log('\nRN10: xp = peso × 10, creditado ao responsável\n');

checar('peso 3 concluída vale 30', xpDaAtividade(atividade(3, 'concluido')), 30);
checar('constante bate com a regra', XP_POR_PESO, 10);
checar('peso 5 concluída vale 50', xpDaAtividade(atividade(5, 'concluido')), 50);

console.log('\nRN10: só conta quando está concluída\n');

checar('a fazer não credita', xpDaAtividade(atividade(3, 'a fazer')), 0);
checar('fazendo não credita', xpDaAtividade(atividade(3, 'fazendo')), 0);

console.log('\nRN10: atividade sem responsável não gera experiência\n');

checar('concluída sem responsável', xpDaAtividade(atividade(4, 'concluido', '')), 0);
checar(
  'e não entra no total do grupo',
  xpDoGrupo([atividade(4, 'concluido', ''), atividade(2, 'concluido', ANA)]),
  20
);

console.log('\nRN10: o estorno: concluir, desmarcar e concluir de novo\n');

// O ciclo inteiro, como acontece na tela: a pessoa conclui, se arrepende,
// desmarca e conclui de novo.
let umaAtividade = atividade(3, 'a fazer');
checar('1. antes de concluir', xpDoMembro(ANA, [umaAtividade]), 0);

umaAtividade = { ...umaAtividade, status: 'concluido' };
checar('2. ao concluir', xpDoMembro(ANA, [umaAtividade]), 30);

umaAtividade = { ...umaAtividade, status: 'fazendo' };
checar('3. ao reverter, estornou', xpDoMembro(ANA, [umaAtividade]), 0);

umaAtividade = { ...umaAtividade, status: 'concluido' };
checar('4. ao concluir de novo, NÃO dobrou', xpDoMembro(ANA, [umaAtividade]), 30);

umaAtividade = { ...umaAtividade, status: 'concluido' };
checar('5. concluir duas vezes seguidas não soma', xpDoMembro(ANA, [umaAtividade]), 30);

console.log('\nRN10: trocar o responsável leva a experiência junto\n');

const trocada = { peso: 4, status: 'concluido', responsavelId: BRUNO };
checar('quem era responsável antes fica sem', xpDoMembro(ANA, [trocada]), 0);
checar('quem é responsável agora recebe', xpDoMembro(BRUNO, [trocada]), 40);

console.log('\nExperiência do membro e ranking\n');

const membros = [
  { id: ANA, nome: 'Ana Souza' },
  { id: BRUNO, nome: 'Bruno Lima' },
  { id: 'membro-carla', nome: 'Carla Dias' },
];

const atividades = [
  atividade(5, 'concluido', ANA), // 50
  atividade(2, 'concluido', ANA), // 20
  atividade(3, 'a fazer', ANA), //  0
  atividade(5, 'concluido', BRUNO), // 50
  atividade(2, 'concluido', BRUNO), // 20
  atividade(4, 'concluido', ''), //  0, sem responsável
];

checar('Ana soma 70', xpDoMembro(ANA, atividades), 70);
checar('Bruno soma 70', xpDoMembro(BRUNO, atividades), 70);
checar('Carla, sem atividade, soma 0', xpDoMembro('membro-carla', atividades), 0);
checar('total do grupo ignora a sem responsável', xpDoGrupo(atividades), 140);

const ranking = rankingDoGrupo(membros, atividades);
checar(
  'empate compartilha a posição e a seguinte pula',
  ranking.map((l) => [l.membro.nome, l.xp, l.posicao]),
  [
    ['Ana Souza', 70, 1],
    ['Bruno Lima', 70, 1],
    ['Carla Dias', 0, 3],
  ]
);
checar('empate ordena por nome, para a lista não dançar', ranking[0].membro.nome, 'Ana Souza');
checar('conta as concluídas de cada um', ranking.map((l) => l.concluidas), [2, 2, 0]);

console.log('\nRN09: peso ausente ou fora da faixa também vale aqui\n');

checar('sem peso vale 1, logo 10 de xp', xpDaAtividade({ status: 'concluido', responsavelId: ANA }), 10);
checar(
  'peso acima da faixa é coagido para 5',
  xpDaAtividade({ peso: 99, status: 'concluido', responsavelId: ANA }),
  50
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

// Verificação da ofensiva (RN11).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// Ofensiva = dias seguidos, contados até hoje, em que o membro concluiu pelo
// menos uma atividade. O dia de hoje ainda está em aberto: sem conclusão
// hoje, a contagem parte de ontem, e só zera quando um dia termina vazio.

import { ofensivaDoMembro, ultimosDias } from '../src/lib/gamificacao.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

// "Hoje" fixo, de manhã: o teste não pode depender do relógio.
const HOJE = new Date(2026, 9, 28, 9, 30);

let contador = 0;
// Atividade concluída `diasAtras` dias antes de HOJE, no horário local dado.
function concluida(diasAtras, { membro = 'm1', hora = 15, minuto = 0 } = {}) {
  const d = new Date(HOJE);
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, minuto, 0, 0);
  contador += 1;
  return { id: `a${contador}`, responsavelId: membro, status: 'concluido', dataConclusao: d.toISOString() };
}

const ofensiva = (atividades) => ofensivaDoMembro('m1', atividades, HOJE);

console.log('\nContagem básica\n');

checar('nada concluído', ofensiva([]), 0);
checar('só hoje', ofensiva([concluida(0)]), 1);
checar('hoje, ontem e anteontem', ofensiva([concluida(0), concluida(1), concluida(2)]), 3);
checar('duas no mesmo dia contam um dia', ofensiva([concluida(0), concluida(0, { hora: 18 })]), 1);

console.log('\nHoje ainda está em aberto\n');

checar('ontem e anteontem, nada hoje: continua 2', ofensiva([concluida(1), concluida(2)]), 2);
checar('última conclusão há 2 dias: zerou', ofensiva([concluida(2), concluida(3)]), 0);

console.log('\nUm dia vazio quebra a sequência\n');

checar('hoje e anteontem: só 1', ofensiva([concluida(0), concluida(2)]), 1);
checar(
  '7 dias seguidos com um buraco antes',
  ofensiva([0, 1, 2, 3, 4, 5, 6, 8, 9].map((n) => concluida(n))),
  7
);

console.log('\nO que não entra na conta\n');

checar('conclusão de outra pessoa', ofensiva([concluida(0, { membro: 'm2' })]), 0);
checar(
  'atividade reaberta (sem data de conclusão)',
  ofensiva([{ id: 'x', responsavelId: 'm1', status: 'a fazer', dataConclusao: null }]),
  0
);
checar(
  'concluída perto da meia-noite fica no dia certo',
  ofensiva([concluida(1, { hora: 23, minuto: 50 }), concluida(0, { hora: 0, minuto: 10 })]),
  2
);

console.log('\nOs últimos 7 dias do painel\n');

const semana = ultimosDias('m1', [concluida(0), concluida(2)], 7, HOJE);
checar('são 7 dias', semana.length, 7);
checar('o último é hoje', semana[6].hoje && semana[6].iso, '2026-10-28');
checar('o primeiro é seis dias antes', semana[0].iso, '2026-10-22');
checar(
  'marca os dias com conclusão',
  semana.map((d) => d.concluiu),
  [false, false, false, false, true, false, true]
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

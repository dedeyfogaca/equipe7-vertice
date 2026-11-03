// Verificação das conquistas (RN12).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// Duas partes: (1) quando o marco de cada conquista é atingido e (2) a
// concessão — uma vez só por membro e sem revogar depois.

import { CONQUISTAS, conquistasAlcancadas, conquistasNovas } from '../src/lib/gamificacao.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const HOJE = new Date(2026, 9, 28, 9, 30);

let contador = 0;
function atividade({ membro = 'm1', conteudo = 'c1', peso = 1, concluida = true, diasAtras = 0, hora = 15 } = {}) {
  const d = new Date(HOJE);
  d.setDate(d.getDate() - diasAtras);
  d.setHours(hora, 0, 0, 0);
  contador += 1;
  return {
    id: `a${contador}`,
    responsavelId: membro,
    conteudoId: conteudo,
    peso,
    status: concluida ? 'concluido' : 'a fazer',
    dataConclusao: concluida ? d.toISOString() : null,
  };
}

const conteudos = [
  { id: 'c1', disciplinaId: 'd1' },
  { id: 'c2', disciplinaId: 'd1' },
  { id: 'c3', disciplinaId: 'd2' },
];

const alcancadas = (membro, atividades) =>
  conquistasAlcancadas(membro, { atividades, conteudos, hoje: HOJE });

console.log('\nO catálogo é o mesmo do script do banco\n');

checar(
  'seis conquistas, na ordem da carga inicial',
  CONQUISTAS.map((c) => c.codigo),
  ['PRIMEIRO_PASSO', 'CONTEUDO_DOMINADO', 'DISCIPLINA_FECHADA', 'SEMANA_CHEIA', 'MES_CHEIO', 'MEIO_MILHAR']
);

console.log('\nQuando cada marco é atingido\n');

checar('sem atividade, nada', alcancadas('m1', []), []);
checar(
  'pendente não conta',
  alcancadas('m1', [atividade({ concluida: false })]),
  []
);
checar(
  'a primeira conclusão dá o Primeiro Passo',
  alcancadas('m1', [atividade({ conteudo: 'c3' }), atividade({ conteudo: 'c3', concluida: false })]),
  ['PRIMEIRO_PASSO']
);

const conteudoFechado = [
  atividade({ membro: 'm2', conteudo: 'c1', diasAtras: 2 }),
  atividade({ membro: 'm1', conteudo: 'c1', diasAtras: 0 }),
  atividade({ membro: 'm2', conteudo: 'c2', concluida: false }),
];
checar(
  'quem fez a última conclusão do conteúdo leva o Conteúdo Dominado',
  alcancadas('m1', conteudoFechado),
  ['PRIMEIRO_PASSO', 'CONTEUDO_DOMINADO']
);
checar(
  'quem concluiu antes não leva',
  alcancadas('m2', conteudoFechado),
  ['PRIMEIRO_PASSO']
);

const disciplinaFechada = [
  atividade({ membro: 'm2', conteudo: 'c1', diasAtras: 3 }),
  atividade({ membro: 'm2', conteudo: 'c2', diasAtras: 2 }),
  atividade({ membro: 'm1', conteudo: 'c2', diasAtras: 1 }),
];
checar(
  'a última conclusão da disciplina dá a Disciplina Fechada',
  alcancadas('m1', disciplinaFechada),
  ['PRIMEIRO_PASSO', 'CONTEUDO_DOMINADO', 'DISCIPLINA_FECHADA']
);

const seisDias = [0, 1, 2, 3, 4, 5].map((n) => atividade({ conteudo: 'c3', diasAtras: n }));
const seteDias = [...seisDias, atividade({ conteudo: 'c3', diasAtras: 6 })];
const pendente = atividade({ conteudo: 'c3', concluida: false });
checar('6 dias seguidos ainda não é Semana Cheia', alcancadas('m1', [...seisDias, pendente]).includes('SEMANA_CHEIA'), false);
checar('7 dias seguidos é', alcancadas('m1', [...seteDias, pendente]).includes('SEMANA_CHEIA'), true);

const trintaDias = Array.from({ length: 30 }, (_, n) => atividade({ conteudo: 'c3', diasAtras: n }));
checar('30 dias seguidos é Mês Cheio', alcancadas('m1', [...trintaDias, pendente]).includes('MES_CHEIO'), true);

const quatrocentosENoventa = Array.from({ length: 49 }, () => atividade({ conteudo: 'c3', peso: 1 }));
checar('490 XP ainda não é Meio Milhar', alcancadas('m1', [...quatrocentosENoventa, pendente]).includes('MEIO_MILHAR'), false);
checar(
  '500 XP é',
  alcancadas('m1', [...quatrocentosENoventa, atividade({ conteudo: 'c3', peso: 1 }), pendente]).includes('MEIO_MILHAR'),
  true
);

console.log('\nConcessão: uma vez só e sem revogar\n');

const agora = '2026-10-28T12:00:00.000Z';
const primeira = conquistasNovas([], [{ membroId: 'm1', codigos: ['PRIMEIRO_PASSO'] }], agora);
checar('concede o que é novo', primeira, [{ membroId: 'm1', codigo: 'PRIMEIRO_PASSO', obtidaEm: agora }]);

checar(
  'não concede de novo o que já foi concedido',
  conquistasNovas(primeira, [{ membroId: 'm1', codigos: ['PRIMEIRO_PASSO'] }], agora),
  []
);
checar(
  'o marco deixou de valer (atividade reaberta): nada é retirado',
  conquistasNovas(primeira, [{ membroId: 'm1', codigos: [] }], agora),
  []
);
checar(
  'a mesma conquista para outra pessoa é outra concessão',
  conquistasNovas(primeira, [{ membroId: 'm2', codigos: ['PRIMEIRO_PASSO'] }], agora).length,
  1
);
checar(
  'código repetido na mesma rodada conta uma vez',
  conquistasNovas([], [{ membroId: 'm1', codigos: ['PRIMEIRO_PASSO', 'PRIMEIRO_PASSO'] }], agora).length,
  1
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

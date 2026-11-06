// Verificação do cadastro de atividade.
//
// Roda com `npm run verificar`, sem instalar nada.
//
// O alvo principal é o RN06 revisado em 28/10/2026: toda atividade tem um
// responsável, e ele é membro do grupo (RN03). Junto, as outras regras do
// formulário: disciplina e conteúdo (RN13), peso (RN09), título e prazo.

import { validarAtividade, validarEvento } from '../src/lib/validacao.js';
import { dataValida } from '../src/lib/datas.js';
import { gerarDadosExemplo } from '../src/lib/seed.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const membros = [
  { id: 'm1', nome: 'Ana' },
  { id: 'm2', nome: 'Bruno' },
];
const conteudos = [
  { id: 'c1', nome: 'Modelagem', disciplinaId: 'd1' },
  { id: 'c2', nome: 'Cinemática', disciplinaId: 'd2' },
];
const disciplinas = [
  { id: 'd1', nome: 'Banco de Dados' },
  { id: 'd2', nome: 'Física' },
];
const grupo = { membros, conteudos, disciplinas };

const valida = {
  titulo: 'Normalizar as tabelas',
  prazo: '2026-11-10',
  disciplinaId: 'd1',
  conteudoId: 'c1',
  responsavelId: 'm1',
  peso: 3,
  status: 'a fazer',
};

console.log('\nAtividade completa passa\n');

checar('sem erro nenhum', validarAtividade(valida, grupo), {});

console.log('\nRN06: toda atividade tem responsável\n');

checar(
  'sem responsável é barrada',
  validarAtividade({ ...valida, responsavelId: '' }, grupo).responsavelId,
  'Escolha o responsável pela atividade.'
);
checar(
  'responsável de outro grupo é barrado (RN03)',
  validarAtividade({ ...valida, responsavelId: 'm9' }, grupo).responsavelId,
  'O responsável escolhido não pertence ao grupo.'
);
checar(
  'qualquer membro do grupo serve',
  validarAtividade({ ...valida, responsavelId: 'm2' }, grupo).responsavelId,
  undefined
);

console.log('\nRN13: a atividade pertence a uma disciplina; o conteúdo é opcional\n');

checar(
  'sem conteúdo passa',
  validarAtividade({ ...valida, conteudoId: '' }, grupo),
  {}
);
checar(
  'sem disciplina é barrada',
  validarAtividade({ ...valida, disciplinaId: '', conteudoId: '' }, grupo).disciplinaId,
  'Escolha a disciplina da atividade.'
);
checar(
  'disciplina de outro grupo é barrada',
  validarAtividade({ ...valida, disciplinaId: 'd9', conteudoId: '' }, grupo).disciplinaId,
  'A disciplina escolhida não pertence a este grupo.'
);
checar(
  'conteúdo de outra disciplina é barrado',
  validarAtividade({ ...valida, conteudoId: 'c2' }, grupo).conteudoId,
  'Esse conteúdo é de outra disciplina.'
);
checar(
  'conteúdo de outro grupo é barrado',
  validarAtividade({ ...valida, conteudoId: 'c9' }, grupo).conteudoId,
  'O conteúdo escolhido não pertence a este grupo.'
);

console.log('\nRN09: peso inteiro de 1 a 5\n');

checar('peso 0', validarAtividade({ ...valida, peso: 0 }, grupo).peso, 'O peso vai de 1 a 5.');
checar('peso 6', validarAtividade({ ...valida, peso: 6 }, grupo).peso, 'O peso vai de 1 a 5.');
checar('peso 2,5', validarAtividade({ ...valida, peso: 2.5 }, grupo).peso, 'O peso vai de 1 a 5.');
checar('peso em branco vira 1, não é erro', validarAtividade({ ...valida, peso: '' }, grupo).peso, undefined);

console.log('\nTítulo e prazo\n');

checar(
  'título vazio',
  validarAtividade({ ...valida, titulo: '   ' }, grupo).titulo,
  'Informe um título para a atividade.'
);
checar(
  'título curto',
  validarAtividade({ ...valida, titulo: 'ab' }, grupo).titulo,
  'O título precisa ter pelo menos 3 caracteres.'
);
checar('sem prazo', validarAtividade({ ...valida, prazo: '' }, grupo).prazo, 'Defina um prazo de entrega.');
checar(
  'dia que não existe',
  validarAtividade({ ...valida, prazo: '2026-02-31' }, grupo).prazo,
  'O prazo informado não é uma data válida.'
);
checar('29 de fevereiro em ano bissexto existe', dataValida('2028-02-29'), true);
checar('e em ano comum, não', dataValida('2026-02-29'), false);

console.log('\nOs dados de exemplo seguem a regra\n');

const exemplo = gerarDadosExemplo();
const idsMembros = new Set(exemplo.membros.map((m) => m.id));
checar(
  'toda atividade de exemplo tem responsável do grupo',
  exemplo.atividades.every((a) => idsMembros.has(a.responsavelId)),
  true
);
checar(
  'e passa na validação',
  exemplo.atividades.filter(
    (a) =>
      Object.keys(
        validarAtividade(a, { membros: exemplo.membros, conteudos: exemplo.conteudos, disciplinas: exemplo.disciplinas })
      ).length > 0
  ).length,
  0
);
checar(
  'o primeiro membro do exemplo é o organizador (RN07)',
  exemplo.membros[0].perfil,
  'organizador'
);

checar('exemplo tem atividade sem conteúdo', exemplo.atividades.some((a) => !a.conteudoId && a.disciplinaId), true);

console.log('\nRF31: eventos\n');

const evento = { titulo: 'Prova de Cálculo', tipo: 'prova', data: '2026-11-20', horaInicio: '19:00', horaFim: '20:40' };
checar('evento completo passa', validarEvento(evento), {});
checar('sem horário vale o dia todo', validarEvento({ ...evento, horaInicio: '', horaFim: '' }), {});
checar('sem nome', validarEvento({ ...evento, titulo: ' ' }).titulo, 'Dê um nome ao evento.');
checar('tipo inventado', validarEvento({ ...evento, tipo: 'festa' }).tipo, 'Escolha o tipo do evento.');
checar('sem dia', validarEvento({ ...evento, data: '' }).data, 'Escolha o dia do evento.');
checar('dia que não existe', validarEvento({ ...evento, data: '2026-02-30' }).data, 'O dia informado não é uma data válida.');
checar('fim antes do início', validarEvento({ ...evento, horaFim: '18:00' }).horaFim, 'O fim precisa ser depois do início.');
checar('fim sem início', validarEvento({ ...evento, horaInicio: '' }).horaFim, 'Informe o início antes do fim.');
checar('horário inválido', validarEvento({ ...evento, horaInicio: '25:00', horaFim: '' }).horaInicio, 'Horário inválido.');
checar(
  'disciplina de outro grupo',
  validarEvento({ ...evento, disciplinaId: 'd9' }, { disciplinas }).disciplinaId,
  'A disciplina escolhida não pertence a este grupo.'
);
checar(
  'eventos de exemplo passam',
  exemplo.eventos.filter((e) => Object.keys(validarEvento(e, { disciplinas: exemplo.disciplinas })).length > 0).length,
  0
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

// Verificação do cadastro de atividade.
//
// Roda com `npm run verificar`, sem instalar nada.
//
// O alvo principal é o RN06 revisado em 28/10/2026: toda atividade tem um
// responsável, e ele é membro do grupo (RN03). Junto, as outras regras do
// formulário — conteúdo (RN13), peso (RN09), título e prazo.

import { validarAtividade } from '../src/lib/validacao.js';
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
const conteudos = [{ id: 'c1', nome: 'Modelagem' }];
const grupo = { membros, conteudos };

const valida = {
  titulo: 'Normalizar as tabelas',
  prazo: '2026-11-10',
  conteudoId: 'c1',
  responsavelId: 'm1',
  peso: 3,
  status: 'a fazer',
};

console.log('\nAtividade completa passa\n');

checar('sem erro nenhum', validarAtividade(valida, grupo), {});

console.log('\nRN06 — toda atividade tem responsável\n');

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

console.log('\nRN13 — a atividade pertence a um conteúdo do grupo\n');

checar(
  'sem conteúdo é barrada',
  validarAtividade({ ...valida, conteudoId: '' }, grupo).conteudoId,
  'Escolha o conteúdo a que a atividade pertence.'
);
checar(
  'conteúdo de outro grupo é barrado',
  validarAtividade({ ...valida, conteudoId: 'c9' }, grupo).conteudoId,
  'O conteúdo escolhido não pertence a este grupo.'
);

console.log('\nRN09 — peso inteiro de 1 a 5\n');

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
    (a) => Object.keys(validarAtividade(a, { membros: exemplo.membros, conteudos: exemplo.conteudos })).length > 0
  ).length,
  0
);
checar(
  'o primeiro membro do exemplo é o organizador (RN07)',
  exemplo.membros[0].perfil,
  'organizador'
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

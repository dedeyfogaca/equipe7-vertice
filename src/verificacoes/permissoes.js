// Verificação de quem pode mexer em cada atividade (RN07 e RN20).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// O alvo é o RN20, de 29/10/2026: cada pessoa conclui as próprias
// atividades, e ninguém (nem o organizador) muda o status da atividade de
// outra pessoa. Junto, o RN07: o participante edita e exclui só as suas; o
// organizador, qualquer uma do grupo.
//
// No fim, os eventos (RN21, de 03/11/2026): quem cadastrou e o organizador
// editam e excluem; os outros, não.

import {
  ehResponsavel,
  podeAssumir,
  podeEditarAtividade,
  podeEditarEvento,
  podeExcluirAtividade,
  podeMudarStatus,
  statusAoSalvar,
} from '../src/lib/permissoes.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const daAna = { id: 'a1', responsavelId: 'ana', status: 'a fazer' };
const doBruno = { id: 'a2', responsavelId: 'bruno', status: 'concluido' };

const ana = { membroId: 'ana', organizador: true }; // organizadora
const bruno = { membroId: 'bruno', organizador: false }; // participante
const carla = { membroId: 'carla', organizador: false }; // participante
const grupoVazio = { membroId: null, organizador: true }; // montando o grupo

console.log('\nRN20: só o responsável muda o status\n');

checar('Ana conclui a própria atividade', podeMudarStatus(daAna, ana), true);
checar('Bruno conclui a própria atividade', podeMudarStatus(doBruno, bruno), true);
checar('Bruno não conclui a da Ana', podeMudarStatus(daAna, bruno), false);
checar('nem a organizadora conclui a do Bruno', podeMudarStatus(doBruno, ana), false);
checar('ninguém da sessão, ninguém conclui', podeMudarStatus(daAna, grupoVazio), false);
checar('atividade sem responsável não tem quem conclua', podeMudarStatus({ responsavelId: '' }, ana), false);

console.log('\nRN07: editar e excluir\n');

checar('a organizadora edita a atividade do Bruno', podeEditarAtividade(doBruno, ana), true);
checar('a organizadora exclui a atividade do Bruno', podeExcluirAtividade(doBruno, ana), true);
checar('o Bruno edita a própria', podeEditarAtividade(doBruno, bruno), true);
checar('o Bruno exclui a própria', podeExcluirAtividade(doBruno, bruno), true);
checar('a Carla não edita a do Bruno', podeEditarAtividade(doBruno, carla), false);
checar('a Carla não exclui a do Bruno', podeExcluirAtividade(doBruno, carla), false);
checar('grupo vazio: quem monta edita (dado antigo)', podeEditarAtividade(daAna, grupoVazio), true);
checar('responsável é reconhecido', [ehResponsavel(daAna, ana), ehResponsavel(daAna, bruno)], [true, false]);

console.log('\nRN20 no formulário: o status que é gravado\n');

checar(
  'nova, para si mesmo: vale o status escolhido',
  statusAoSalvar({ statusEscolhido: 'fazendo', statusAtual: '', responsavelId: 'bruno', quem: bruno }),
  'fazendo'
);
checar(
  'nova, para si mesmo, sem escolher: começa em "a fazer"',
  statusAoSalvar({ statusEscolhido: '', statusAtual: '', responsavelId: 'bruno', quem: bruno }),
  'a fazer'
);
checar(
  'nova, para outra pessoa: começa em "a fazer", mesmo escolhendo "concluido"',
  statusAoSalvar({ statusEscolhido: 'concluido', statusAtual: '', responsavelId: 'carla', quem: bruno }),
  'a fazer'
);
checar(
  'edição da organizadora na atividade do Bruno: o status não muda',
  statusAoSalvar({ statusEscolhido: 'a fazer', statusAtual: 'concluido', responsavelId: 'bruno', quem: ana }),
  'concluido'
);
checar(
  'edição do próprio responsável: o status muda',
  statusAoSalvar({ statusEscolhido: 'a fazer', statusAtual: 'concluido', responsavelId: 'bruno', quem: bruno }),
  'a fazer'
);

console.log('\nEventos (RN21)\n');

const provaDoBruno = { id: 'e1', titulo: 'Prova de Banco de Dados', criadoPor: 'bruno' };
const semAutor = { id: 'e2', titulo: 'Palestra' };
checar('quem cadastrou edita o evento', podeEditarEvento(provaDoBruno, { membroId: 'bruno', organizador: false }), true);
checar('outro participante não edita', podeEditarEvento(provaDoBruno, { membroId: 'carla', organizador: false }), false);
checar('o organizador edita o evento de qualquer um', podeEditarEvento(provaDoBruno, { membroId: 'ana', organizador: true }), true);
checar('evento sem autor: só o organizador', [podeEditarEvento(semAutor, { membroId: 'carla', organizador: false }), podeEditarEvento(semAutor, { membroId: 'ana', organizador: true })], [false, true]);
checar('sem saber quem é, ninguém edita', podeEditarEvento(provaDoBruno, { membroId: null, organizador: false }), false);

console.log('\nRN06 (revisada em 11/11/2026): atividade "A definir"\n');

const aDefinir = { id: 'a9', responsavelId: '', status: 'a fazer' };
checar('qualquer membro pode assumir', [podeAssumir(aDefinir, bruno), podeAssumir(aDefinir, ana)], [true, true]);
checar('quem não é do grupo, não', podeAssumir(aDefinir, { membroId: null, organizador: false }), false);
checar('atividade com responsável não se assume', podeAssumir(daAna, bruno), false);
checar('ninguém muda o status antes de alguém assumir', [podeMudarStatus(aDefinir, ana), podeMudarStatus(aDefinir, bruno)], [false, false]);
checar('o participante não edita sem assumir; o organizador edita', [podeEditarAtividade(aDefinir, bruno), podeEditarAtividade(aDefinir, ana)], [false, true]);
checar(
  'salvar sem responsável grava "a fazer", mesmo com outro status escolhido',
  statusAoSalvar({ statusEscolhido: 'concluido', statusAtual: '', responsavelId: '', quem: ana }),
  'a fazer'
);

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

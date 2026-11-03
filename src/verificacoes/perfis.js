// Verificação da regra de perfis (RN07).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// O alvo é a trava do último organizador. Sem ela o grupo consegue se
// trancar para fora: rebaixe ou remova o único organizador e ninguém mais
// gerencia membros, disciplinas nem conteúdos — e não há como voltar atrás
// pela interface.

import { PERFIL } from '../src/lib/constants.js';
import { ultimoOrganizador, validarGrupo, validarMembro } from '../src/lib/validacao.js';

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const organizador = (id, nome) => ({ id, nome, perfil: PERFIL.ORGANIZADOR });
const participante = (id, nome) => ({ id, nome, perfil: PERFIL.PARTICIPANTE });

console.log('\nRN07 — o grupo não pode ficar sem organizador\n');

const soUm = [organizador('a', 'Ana'), participante('b', 'Bruno')];

checar('o único organizador é reconhecido', ultimoOrganizador('a', soUm), true);
checar('o participante não é o último organizador', ultimoOrganizador('b', soUm), false);

checar(
  'rebaixar o único organizador é barrado',
  validarMembro(
    { nome: 'Ana', perfil: PERFIL.PARTICIPANTE },
    { membros: soUm, ignorarId: 'a' }
  ).perfil,
  'O grupo precisa de pelo menos um organizador.'
);

checar(
  'mantê-lo organizador passa',
  validarMembro(
    { nome: 'Ana', perfil: PERFIL.ORGANIZADOR },
    { membros: soUm, ignorarId: 'a' }
  ).perfil,
  undefined
);

console.log('\nCom dois organizadores a trava sai do caminho\n');

const dois = [organizador('a', 'Ana'), organizador('b', 'Bruno'), participante('c', 'Carla')];

checar('nenhum dos dois é o último', [ultimoOrganizador('a', dois), ultimoOrganizador('b', dois)], [
  false,
  false,
]);

checar(
  'rebaixar um dos dois passa',
  validarMembro(
    { nome: 'Ana', perfil: PERFIL.PARTICIPANTE },
    { membros: dois, ignorarId: 'a' }
  ).perfil,
  undefined
);

console.log('\nA trava não atrapalha o resto da validação\n');

checar(
  'nome continua obrigatório',
  validarMembro({ nome: '', perfil: PERFIL.PARTICIPANTE }, { membros: dois, ignorarId: 'c' }).nome,
  'O nome do membro é obrigatório.'
);

checar(
  'e-mail invalido continua sendo apontado',
  validarMembro({ nome: 'Carla', email: 'nao-e-email' }, { membros: dois, ignorarId: 'c' }).email,
  'E-mail inválido.'
);

checar(
  'cadastrar membro novo nunca cai na trava',
  validarMembro({ nome: 'Novo', perfil: PERFIL.PARTICIPANTE }, { membros: soUm }).perfil,
  undefined
);

checar(
  'nome com mais de 80 caracteres é barrado',
  validarMembro({ nome: 'A'.repeat(81), perfil: PERFIL.PARTICIPANTE }, { membros: soUm }).nome,
  'O nome pode ter no máximo 80 caracteres.'
);

console.log('\nD01 — o primeiro membro de um grupo vazio é o organizador\n');

checar(
  'grupo vazio não aceita participante como primeiro',
  validarMembro({ nome: 'Ana', perfil: PERFIL.PARTICIPANTE }, { membros: [] }).perfil,
  'O primeiro membro do grupo precisa ser o organizador.'
);
checar(
  'grupo vazio aceita o organizador',
  validarMembro({ nome: 'Ana', perfil: PERFIL.ORGANIZADOR }, { membros: [] }).perfil,
  undefined
);

console.log('\nRF01 — quem cria o grupo informa o próprio nome\n');

checar(
  'sem nome do grupo',
  validarGrupo({ nome: '', criador: 'Ana' }).nome,
  'Dê um nome ao grupo.'
);
checar(
  'sem o nome de quem cria',
  validarGrupo({ nome: 'Trio do TCC', criador: '  ' }).criador,
  'Informe o seu nome.'
);
checar('com os dois, passa', validarGrupo({ nome: 'Trio do TCC', criador: 'Ana' }), {});

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

// Verificação da migração (dados salvos no navegador).
//
// Roda com `npm run verificar`, sem instalar nada.
//
// Existe por causa de um bug que chegou a ser gravado: a guarda de saída
// exigia que TUDO estivesse vazio para não migrar. Quem já tinha migrado mas
// perdeu o marcador de versão — limpeza parcial do armazenamento, outro
// perfil do navegador, falha silenciosa na gravação — caía adiante, a
// conversão não achava tarefa antiga nenhuma, montava uma lista vazia e
// gravava por cima. Três atividades viravam zero.
//
// Migração é o único código do sistema que pode destruir dado de alguém.
// Estas verificações existem para que nenhuma mudança futura reabra isso.

// `storage.js` fala com o localStorage; no Node ele não existe.
const memoria = new Map();
globalThis.localStorage = {
  getItem: (k) => (memoria.has(k) ? memoria.get(k) : null),
  setItem: (k, v) => memoria.set(k, String(v)),
  removeItem: (k) => memoria.delete(k),
  clear: () => memoria.clear(),
};

const { migrarDados, VERSAO_DADOS } = await import('../src/lib/migracao.js');

let falhas = 0;

function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  const marca = ok ? 'ok   ' : 'FALHA';
  const sufixo = ok ? '' : `   (esperado ${JSON.stringify(esperado)})`;
  console.log(`${marca} ${nome} -> ${JSON.stringify(real)}${sufixo}`);
}

const gravar = (chave, valor) => memoria.set(chave, JSON.stringify(valor));
const ler = (chave) => (memoria.has(chave) ? JSON.parse(memoria.get(chave)) : null);

const GRUPO = { id: 'g1', nome: 'Turma', descricao: '', criadoEm: '2026-01-01T00:00:00.000Z' };

function tarefaAntiga(id, disciplina, status, grupoId = 'g1') {
  return {
    id,
    titulo: `Tarefa ${id}`,
    descricao: '',
    disciplina,
    prazo: '2026-03-01',
    status,
    prioridade: '',
    responsavelId: 'm1',
    grupoId,
    criadaEm: '2026-01-01T00:00:00.000Z',
  };
}

function atividadeNova(id) {
  return {
    id,
    titulo: `Atividade ${id}`,
    descricao: '',
    conteudoId: 'c1',
    prazo: '2026-05-01',
    peso: 3,
    status: 'a fazer',
    prioridade: '',
    responsavelId: 'm1',
    criadaEm: '2026-01-01T00:00:00.000Z',
    dataConclusao: null,
  };
}

// Dados já no formato novo, como ficam depois de uma migração.
function montarJaMigrado() {
  memoria.clear();
  gravar('grupos', [GRUPO]);
  gravar('membros', [{ id: 'm1', nome: 'Alguém', grupoId: 'g1', perfil: 'organizador' }]);
  gravar('disciplinas', [{ id: 'd1', nome: 'Cálculo', cor: '#0ea5e9', grupoId: 'g1' }]);
  gravar('conteudos', [{ id: 'c1', nome: 'Geral', descricao: '', disciplinaId: 'd1', ordem: 0 }]);
  gravar('atividades', [atividadeNova('a1'), atividadeNova('a2'), atividadeNova('a3')]);
}

console.log('\nO cenário destrutivo: já migrado, mas sem o marcador de versão\n');

montarJaMigrado();
// O marcador NÃO é gravado — é exatamente esse o caso.
const semMarcador = migrarDados();

checar('não tenta migrar', semMarcador.migrou, false);
checar('e diz por quê', semMarcador.motivo, 'sem-tarefas-antigas');
checar('as atividades continuam lá', (ler('atividades') || []).length, 3);
checar('o marcador é gravado, para não repetir', ler('versaoDados'), VERSAO_DADOS);

console.log('\nCaminho normal: dados no formato antigo\n');

memoria.clear();
gravar('grupos', [GRUPO]);
gravar('membros', [
  { id: 'm1', nome: 'Primeiro', grupoId: 'g1' },
  { id: 'm2', nome: 'Segundo', grupoId: 'g1' },
]);
gravar('tarefas', [
  tarefaAntiga('t1', 'Física', 'concluido'),
  tarefaAntiga('t2', 'FÍSICA', 'a fazer'),
  tarefaAntiga('t3', '', 'fazendo'),
]);

const normal = migrarDados();

checar('migrou', normal.migrou, true);
checar('converteu as três', (ler('atividades') || []).length, 3);
checar(
  'nomes iguais viram uma disciplina só',
  (ler('disciplinas') || []).map((d) => d.nome),
  ['Física', 'Sem disciplina']
);
checar('a chave antiga é apagada', ler('tarefas'), null);
checar('RN09 — toda atividade ganha peso', (ler('atividades') || []).every((a) => a.peso === 1), true);
checar(
  'a concluída ganha data de conclusão',
  Boolean((ler('atividades') || []).find((a) => a.status === 'concluido').dataConclusao),
  true
);
checar(
  'RN07 — o primeiro membro vira organizador',
  (ler('membros') || []).map((m) => m.perfil),
  ['organizador', 'participante']
);
checar('atividade não guarda grupoId', (ler('atividades') || []).some((a) => 'grupoId' in a), false);

console.log('\nRodar de novo não duplica nada\n');

const denovo = migrarDados();
checar('a segunda passada não roda', denovo.migrou, false);
checar('e o motivo é o marcador', denovo.motivo, 'ja-migrado');
checar('as atividades continuam três', (ler('atividades') || []).length, 3);
checar('as disciplinas continuam duas', (ler('disciplinas') || []).length, 2);

console.log('\nTarefa órfã: o grupo dela não existe mais\n');

memoria.clear();
gravar('grupos', [GRUPO]);
gravar('membros', [{ id: 'm1', nome: 'Primeiro', grupoId: 'g1' }]);
gravar('tarefas', [
  tarefaAntiga('t1', 'Física', 'a fazer'),
  tarefaAntiga('t9', 'Química', 'a fazer', 'grupo-que-sumiu'),
]);

const comOrfa = migrarDados();

checar('converte o que dá', (ler('atividades') || []).length, 1);
checar('e conta as órfãs', comOrfa.orfas, 1);
checar(
  'a chave antiga NÃO é apagada — a órfã fica recuperável',
  (ler('tarefas') || []).length,
  2
);

console.log('\nÓrfã + marcador perdido: a segunda passada não pode duplicar id\n');

// Com órfã a chave antiga fica, de propósito. Se o marcador de versão se
// perder depois disso, a migração roda de novo sobre as MESMAS tarefas —
// e a atividade carrega o id da tarefa que a originou.
memoria.delete('versaoDados');
const segundaPassada = migrarDados();

const ids = (ler('atividades') || []).map((a) => a.id);
checar('rodou de novo, porque o marcador sumiu', segundaPassada.migrou, true);
checar('mas não repetiu o id', ids, ['t1']);
checar(
  'id repetido quebraria chave de lista e `find`',
  ids.length === new Set(ids).size,
  true
);

console.log('\nInstalação nova: nada gravado\n');

memoria.clear();
const zerado = migrarDados();
checar('não migra', zerado.migrou, false);
checar('marca a versão mesmo assim', ler('versaoDados'), VERSAO_DADOS);
checar('e não inventa coleção', ler('atividades'), null);

// ---------------------------------------------------------------------------
// Versão 2 — responsável obrigatório (RN06) e paleta de 18 cores
// ---------------------------------------------------------------------------

console.log('\nVersão 2: atividade sem responsável ganha um\n');

function montarVersao1() {
  memoria.clear();
  gravar('versaoDados', 1);
  gravar('grupos', [GRUPO, { ...GRUPO, id: 'g2', nome: 'Outro' }]);
  gravar('membros', [
    { id: 'm1', nome: 'Participante', grupoId: 'g1', perfil: 'participante' },
    { id: 'm2', nome: 'Organizadora', grupoId: 'g1', perfil: 'organizador' },
    { id: 'm9', nome: 'De outro grupo', grupoId: 'g2', perfil: 'organizador' },
  ]);
  gravar('disciplinas', [
    { id: 'd1', nome: 'Cálculo', cor: '#78716c', grupoId: 'g1' },
    { id: 'd2', nome: 'Física', cor: '#0ea5e9', grupoId: 'g1' },
    { id: 'd3', nome: 'Química', cor: 'vermelho', grupoId: 'g1' },
  ]);
  gravar('conteudos', [{ id: 'c1', nome: 'Geral', descricao: '', disciplinaId: 'd1', ordem: 0 }]);
  gravar('atividades', [
    { ...atividadeNova('a1'), responsavelId: '' },
    { ...atividadeNova('a2'), responsavelId: 'm1' },
    { ...atividadeNova('a3'), responsavelId: 'm9' },
    { ...atividadeNova('a4'), responsavelId: 'membro-removido' },
  ]);
}

montarVersao1();
const v2 = migrarDados();
const responsaveis = (ler('atividades') || []).map((a) => a.responsavelId);

checar('o passo 1 não roda de novo', v2.migrou, false);
checar('sem responsável vai para o organizador do grupo', responsaveis[0], 'm2');
checar('responsável válido continua o mesmo', responsaveis[1], 'm1');
checar('responsável de outro grupo é trocado (RN03)', responsaveis[2], 'm2');
checar('responsável que não existe mais é trocado', responsaveis[3], 'm2');
checar('conta quantas recebeu', v2.v2.responsaveisDefinidos, 3);
checar('nenhuma atividade fica sem responsável', responsaveis.every(Boolean), true);
checar('o marcador vai para 2', ler('versaoDados'), 2);

console.log('\nVersão 2: cores fora da paleta nova\n');

const cores = (ler('disciplinas') || []).map((d) => d.cor);
checar('a cor que saiu da paleta vira a equivalente', cores[0], '#a8a29e');
checar('cor da paleta continua a mesma', cores[1], '#0ea5e9');
checar('cor inválida vira a padrão', cores[2], '#3b82f6');
checar('conta quantas mudaram', v2.v2.coresAjustadas, 2);

console.log('\nVersão 2: grupo sem membro nenhum\n');

memoria.clear();
gravar('versaoDados', 1);
gravar('grupos', [GRUPO]);
gravar('membros', []);
gravar('disciplinas', [{ id: 'd1', nome: 'Cálculo', cor: '#3b82f6', grupoId: 'g1' }]);
gravar('conteudos', [{ id: 'c1', nome: 'Geral', descricao: '', disciplinaId: 'd1', ordem: 0 }]);
gravar('atividades', [{ ...atividadeNova('a1'), responsavelId: '' }]);
const semMembros = migrarDados();
checar('não inventa responsável', (ler('atividades') || [])[0].responsavelId, '');
checar('e não conta como definido', semMembros.v2.responsaveisDefinidos, 0);

console.log('\nVersão 2: nada a mudar, nada é regravado\n');

memoria.clear();
gravar('versaoDados', 1);
gravar('grupos', [GRUPO]);
gravar('membros', [{ id: 'm1', nome: 'Alguém', grupoId: 'g1', perfil: 'organizador' }]);
gravar('disciplinas', [{ id: 'd1', nome: 'Cálculo', cor: '#3b82f6', grupoId: 'g1' }]);
gravar('conteudos', [{ id: 'c1', nome: 'Geral', descricao: '', disciplinaId: 'd1', ordem: 0 }]);
gravar('atividades', [atividadeNova('a1')]);
const antes = memoria.get('atividades');
const limpo = migrarDados();
checar('resumo zerado', limpo.v2, { responsaveisDefinidos: 0, coresAjustadas: 0 });
checar('a coleção fica exatamente como estava', memoria.get('atividades') === antes, true);
checar('e a terceira passada nem roda', migrarDados().motivo, 'ja-migrado');

console.log(
  falhas === 0 ? '\nTodas as verificações passaram.\n' : `\n${falhas} verificação(ões) falharam.\n`
);

process.exit(falhas === 0 ? 0 : 1);

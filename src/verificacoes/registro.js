// Verificação da saída do grupo e do histórico (RF39, RF40, RN28, RN29), de
// 12/11/2026. Roda com `npm run verificar`, sem banco: confere quem pode
// sair, o texto de cada linha do histórico e, na demonstração, o que cada
// mudança nas coleções vira no histórico (o mesmo que os gatilhos do banco
// fazem com conta, conferido em 05-verificacoes.sql).

import {
  LIMITE_DEMO,
  atividadesQueFicamSemDono,
  filtrarRegistros,
  juntarRegistros,
  motivoParaNaoSair,
  nomeDoMembro,
  reconstruirRegistros,
  registrosDaMudanca,
  rotuloDoDia,
  textoDoRegistro,
} from '../src/lib/registro.js';

let falhas = 0;
function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome} -> ${JSON.stringify(real)}${ok ? '' : `   (esperado ${JSON.stringify(esperado)})`}`);
}

// ----- Quem pode sair (RN28)
const ana = { id: 'm1', nome: 'Ana', perfil: 'organizador' };
const bruno = { id: 'm2', nome: 'Bruno', perfil: 'participante' };
const carla = { id: 'm3', nome: 'Carla', perfil: 'organizador' };
checar('participante sai', motivoParaNaoSair([ana, bruno], bruno), '');
checar('a última organizadora não sai sem passar o cargo', motivoParaNaoSair([ana, bruno], ana), 'Antes de sair, torne outra pessoa organizadora do grupo.');
checar('com outra organizadora, sai', motivoParaNaoSair([ana, bruno, carla], ana), '');
checar('sozinha no grupo, a saída é excluir', motivoParaNaoSair([ana], ana), 'Você é a única pessoa do grupo. Para sair, exclua o grupo.');
checar('do espaço pessoal não se sai', motivoParaNaoSair([ana], ana, { pessoal: true }), 'O espaço pessoal é seu: não dá para sair dele.');
checar('quem não é do grupo não sai', motivoParaNaoSair([ana], null), 'Você não faz parte deste grupo.');
checar('só as abertas ficam "A definir"', atividadesQueFicamSemDono([
  { id: 'a', responsavelId: 'm2', status: 'a fazer' },
  { id: 'b', responsavelId: 'm2', status: 'fazendo' },
  { id: 'c', responsavelId: 'm2', status: 'concluido' },
  { id: 'd', responsavelId: 'm1', status: 'a fazer' },
], 'm2').map((a) => a.id), ['a', 'b']);
checar('quem saiu aparece marcado', [nomeDoMembro({ nome: 'Bruno', saiuEm: '2026-11-12' }), nomeDoMembro(bruno)], ['Bruno (saiu)', 'Bruno']);

// ----- Texto das linhas
const r = (acao, tipo, alvo = '', detalhe = '', autor = 'Ana') => ({ acao, tipo, alvo, detalhe, autor });
checar('criou a atividade', textoDoRegistro(r('criou', 'atividade', 'Slides')), 'Ana criou a atividade “Slides”');
checar('concluiu', textoDoRegistro(r('concluiu', 'atividade', 'Slides')), 'Ana concluiu “Slides”');
checar('desfez a conclusão', textoDoRegistro(r('reabriu', 'atividade', 'Slides')), 'Ana desfez a conclusão de “Slides”');
checar('passou para outra pessoa', textoDoRegistro(r('passou', 'atividade', 'Slides', 'Bruno')), 'Ana passou “Slides” para Bruno');
checar('deixou "A definir"', textoDoRegistro(r('passou', 'atividade', 'Slides', 'A definir')), 'Ana deixou “Slides” “A definir”');
checar('começou', textoDoRegistro(r('status', 'atividade', 'Slides', 'fazendo')), 'Ana começou “Slides”');
checar('saiu, com quantas ficaram "A definir"', [textoDoRegistro(r('saiu', 'membro', 'Ana', '2')), textoDoRegistro(r('saiu', 'membro', 'Ana', '1')), textoDoRegistro(r('saiu', 'membro', 'Ana'))], [
  'Ana saiu do grupo: 2 atividades ficaram “A definir”',
  'Ana saiu do grupo: 1 atividade ficou “A definir”',
  'Ana saiu do grupo',
]);
checar('mudou o perfil', textoDoRegistro(r('promoveu', 'membro', 'Bruno', 'organizador')), 'Ana mudou o perfil de Bruno para organizador');
checar('renomeou a disciplina', textoDoRegistro(r('editou', 'disciplina', 'Redes II', 'Redes')), 'Ana editou a disciplina “Redes II” (antes “Redes”)');
checar('conteúdo, com a disciplina', textoDoRegistro(r('criou', 'conteudo', 'TCP', 'Redes')), 'Ana criou o conteúdo “TCP” em Redes');
checar('sem autor (montado das datas), na passiva', [
  textoDoRegistro(r('criou', 'disciplina', 'Redes', '', '')),
  textoDoRegistro(r('criou', 'evento', 'Prova', '', '')),
  textoDoRegistro(r('concluiu', 'atividade', 'Slides', '', '')),
], ['Disciplina “Redes” criada', 'Evento “Prova” criado', 'Atividade “Slides” concluída']);

// ----- Demonstração: o que cada mudança vira
const AGORA = '2026-11-12T13:00:00.000Z';
const base = {
  grupos: [{ id: 'g1', nome: 'Trio', pessoal: false, criadoEm: '2026-11-01T12:00:00.000Z' }, { id: 'p1', nome: 'Pessoal', pessoal: true }],
  membros: [
    { id: 'm1', grupoId: 'g1', nome: 'Ana', perfil: 'organizador', usuarioId: 'demo' },
    { id: 'm2', grupoId: 'g1', nome: 'Bruno', perfil: 'participante', usuarioId: '' },
    { id: 'm9', grupoId: 'p1', nome: 'Ana', perfil: 'organizador', usuarioId: 'demo' },
  ],
  disciplinas: [{ id: 'd1', grupoId: 'g1', nome: 'Redes', cor: '#3b82f6', criadaEm: '2026-11-01T12:01:00.000Z' }],
  conteudos: [],
  atividades: [
    { id: 'a1', grupoId: 'g1', disciplinaId: 'd1', titulo: 'Lista 1', status: 'a fazer', responsavelId: 'm1', criadaEm: '2026-11-02T12:00:00.000Z' },
    { id: 'a2', grupoId: 'g1', disciplinaId: 'd1', titulo: 'Relatório', status: 'fazendo', responsavelId: 'm1', criadaEm: '2026-11-02T12:00:00.000Z' },
    { id: 'a3', grupoId: 'g1', disciplinaId: 'd1', titulo: 'Slides', status: 'a fazer', responsavelId: '', criadaEm: '2026-11-02T12:00:00.000Z' },
    { id: 'p', grupoId: 'p1', disciplinaId: '', titulo: 'Pessoal', status: 'a fazer', responsavelId: 'm9' },
  ],
  eventos: [],
  conquistas: [],
};
const autorEm = (g) => base.membros.find((m) => m.grupoId === g && m.usuarioId === 'demo');
const muda = (alterar) => {
  const depois = structuredClone(base);
  alterar(depois);
  return registrosDaMudanca(base, depois, { autorEm, agora: AGORA }).map(textoDoRegistro);
};
checar('concluir e assumir', muda((d) => {
  d.atividades[0].status = 'concluido';
  d.atividades[2].responsavelId = 'm1';
}), ['Ana concluiu “Lista 1”', 'Ana assumiu “Slides”']);
checar('passar para outra pessoa', muda((d) => { d.atividades[1].responsavelId = 'm2'; }), ['Ana passou “Relatório” para Bruno']);
checar('editar sem mudar status nem responsável', muda((d) => { d.atividades[0].prazo = '2026-11-20'; }), ['Ana editou a atividade “Lista 1”']);
checar('o espaço pessoal não entra no histórico', muda((d) => { d.atividades[3].status = 'concluido'; }), []);
checar('sair: uma linha só, com quantas ficaram "A definir"', muda((d) => {
  d.membros[0].saiuEm = AGORA;
  d.membros[0].perfil = 'participante';
  d.atividades[0].responsavelId = '';
  d.atividades[1].responsavelId = '';
  d.atividades[1].status = 'a fazer';
}), ['Ana saiu do grupo: 2 atividades ficaram “A definir”']);
checar('excluir a disciplina vira uma linha só', muda((d) => {
  d.disciplinas = [];
  d.atividades = d.atividades.filter((a) => a.disciplinaId !== 'd1');
}), ['Ana excluiu a disciplina “Redes”']);
checar('conquista ganha e perdida, no nome de quem', [
  muda((d) => { d.conquistas.push({ membroId: 'm2', codigo: 'PRIMEIRO_PASSO', obtidaEm: AGORA }); }),
], [['Bruno ganhou a conquista “Primeiro Passo”']]);
checar('cadastrar, mudar perfil e remover', muda((d) => {
  d.membros.push({ id: 'm3', grupoId: 'g1', nome: 'Carla', perfil: 'participante', usuarioId: '' });
  d.membros[1].perfil = 'organizador';
}), ['Ana mudou o perfil de Bruno para organizador', 'Ana cadastrou Carla no grupo']);
const novoGrupo = registrosDaMudanca({ ...base, grupos: [base.grupos[1]] }, base, { autorEm, agora: AGORA });
checar('grupo novo (ou o exemplo carregado): o histórico sai das datas', novoGrupo.map(textoDoRegistro), [
  'Ana criou o grupo', 'Disciplina “Redes” criada', 'Atividade “Lista 1” criada', 'Atividade “Relatório” criada', 'Atividade “Slides” criada',
]);
checar('a reconstrução usa a data de cada item', reconstruirRegistros(base, 'g1').map((x) => x.data.slice(0, 10)), ['2026-11-01', '2026-11-01', '2026-11-02', '2026-11-02', '2026-11-02']);

// ----- Guardar, filtrar e agrupar
const linhas = (n, grupoId, data) => Array.from({ length: n }, (_, i) => ({ id: `${grupoId}${i}`, grupoId, data, autorId: i % 2 ? 'm1' : 'm2', tipo: i % 3 ? 'atividade' : 'membro' }));
const juntas = juntarRegistros(linhas(3, 'g1', '2026-11-01'), linhas(2, 'g1', '2026-11-02'), ['g1']);
checar('da mais nova para a mais antiga', juntas.map((x) => x.data), ['2026-11-02', '2026-11-02', '2026-11-01', '2026-11-01', '2026-11-01']);
checar('no mesmo instante, a anotada depois vem antes', juntas.slice(0, 2).map((x) => x.id), ['g11', 'g10']);
checar('grupo excluído leva o histórico junto', juntarRegistros(linhas(2, 'g2', '2026-11-01'), [], ['g1']).length, 0);
checar('a demonstração guarda um limite por grupo', juntarRegistros(linhas(LIMITE_DEMO + 5, 'g1', '2026-11-01'), [], ['g1']).length, LIMITE_DEMO);
checar('filtro por pessoa e por tipo', filtrarRegistros(linhas(6, 'g1', 'x'), { pessoa: 'm1', tipo: 'atividade' }).map((x) => x.id), ['g11', 'g15']);
const hoje = new Date('2026-11-12T15:00:00Z');
checar('dias: Hoje, Ontem e a data', [rotuloDoDia('2026-11-12T12:00:00Z', hoje), rotuloDoDia('2026-11-11T12:00:00Z', hoje), rotuloDoDia('2026-11-05T12:00:00Z', hoje)], ['Hoje', 'Ontem', 'qui., 05/11']);

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
if (falhas) process.exit(1);

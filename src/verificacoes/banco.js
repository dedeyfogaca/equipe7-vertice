// Verificação da ligação com o banco (modo com conta) e da evolução (RF12).
//
// O que mais esconde erro na gravação é a ordem: um filho enviado antes do
// pai quebra a chave estrangeira, e excluir o filho de um pai que também está
// saindo dá "linha não encontrada". Aqui a diferença e a ordem são
// conferidas com um cliente falso, que só anota o que receberia.

import { COLECOES, aplicar, diferenca, mensagemDoErro, semMudancas } from '../src/lib/remoto.js';
import { completarHistorico, reconstruirHistorico } from '../src/lib/historico.js';
import { ehFotoNova, separarFotos } from '../src/lib/fotosRemotas.js';

let falhas = 0;
function checar(nome, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (!ok) falhas += 1;
  console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome} -> ${JSON.stringify(real)}${ok ? '' : `   (esperado ${JSON.stringify(esperado)})`}`);
}

// Cliente falso: anota "operação tabela" e responde como o banco.
function clienteFalso(recusar = null) {
  const log = [];
  const consulta = (tabela, op) => {
    const q = {
      eq: () => q,
      select: async () => (recusar === `${op} ${tabela}` ? { data: [], error: null } : { data: [{}], error: null }),
    };
    return q;
  };
  return {
    log,
    from: (tabela) => ({
      insert: async () => {
        log.push(`insert ${tabela}`);
        return { error: null };
      },
      update: () => {
        log.push(`update ${tabela}`);
        return consulta(tabela, 'update');
      },
      delete: () => {
        log.push(`delete ${tabela}`);
        return consulta(tabela, 'delete');
      },
    }),
  };
}

const grupo = { id: 'g1', nome: 'Trio', descricao: '', foto: '', criadoEm: '2026-11-01T12:00:00Z' };
const membro = { id: 'm1', grupoId: 'g1', usuarioId: 'u1', nome: 'Ana', funcao: '', email: '', avatar: 'x', estiloAvatar: 'notionists', foto: '', perfil: 'organizador' };
const disciplina = { id: 'd1', grupoId: 'g1', nome: 'BD', cor: '#3b82f6', criadaEm: '2026-11-01T12:00:00Z' };
const atividade = (id, extra = {}) => ({ id, disciplinaId: 'd1', conteudoId: '', responsavelId: 'm1', titulo: `A ${id}`, descricao: '', prazo: '2026-11-10', peso: 1, prioridade: '', status: 'a fazer', criadaEm: '2026-11-01T12:00:00Z', dataConclusao: null, ...extra });

console.log('\nDiferença entre o banco e a tela\n');
const vazio = { grupos: [], membros: [], disciplinas: [], atividades: [] };
const tudo = { grupos: [grupo], membros: [membro], disciplinas: [disciplina], atividades: [atividade('a1')] };
const novo = diferenca(vazio, tudo);
checar('grupo novo: tudo vira inserção', Object.values(novo).map((m) => m.inserir.length), [1, 1, 1, 1]);
checar('nada mudou, nada a enviar', semMudancas(diferenca(tudo, structuredClone(tudo))), true);
const concluida = { ...tudo, atividades: [atividade('a1', { status: 'concluido', dataConclusao: '2026-11-08T15:00:00Z' })] };
const mudou = diferenca(tudo, concluida);
checar('concluir é uma alteração só na atividade', [Object.keys(mudou), mudou.atividades.alterar.length], [['atividades'], 1]);

console.log('\nOrdem das gravações\n');
let c = clienteFalso();
await aplicar(c, novo);
checar('inserções do pai para o filho', c.log, ['insert grupo', 'insert membro', 'insert disciplina', 'insert atividade']);
c = clienteFalso();
await aplicar(c, diferenca(tudo, { ...vazio }));
checar('excluir o grupo manda só o grupo (o banco leva o resto em cascata)', c.log, ['delete grupo']);
c = clienteFalso();
await aplicar(c, diferenca(tudo, { ...tudo, atividades: [] }));
checar('excluir só a atividade', c.log, ['delete atividade']);

// Revisão de 11/11/2026: perfil da conta, espaço pessoal e atividade sem
// disciplina (que sai junto com o grupo, e não com a disciplina).
const pessoal = { id: 'p1', nome: 'Pessoal', descricao: '', foto: '', pessoal: true, criadoEm: '2026-11-11T12:00:00Z' };
const perfil = { id: 'u1', nome: 'Ana', avatar: 'x', estiloAvatar: 'notionists', foto: '', lembreteEmail: true, grupoPessoalId: 'p1' };
const comPerfil = { grupos: [grupo, pessoal], perfis: [perfil], membros: [membro], disciplinas: [disciplina], atividades: [atividade('a1', { grupoId: 'g1' }), atividade('a2', { grupoId: 'p1', disciplinaId: '' })] };
c = clienteFalso();
await aplicar(c, diferenca(comPerfil, { ...comPerfil, perfis: [{ ...perfil, nome: 'Ana Souza', lembreteEmail: false }] }));
checar('mudar o perfil é uma alteração no perfil', c.log, ['update perfil']);
const linha = (chave, obj) => COLECOES.find((col) => col.chave === chave).paraLinha(obj);
checar('a ligação com o espaço pessoal não vai na linha do perfil (é do banco)', 'id_grupo_pessoal' in linha('perfis', perfil), false);
checar('o perfil vai depois do grupo e antes dos membros', COLECOES.map((col) => col.chave).slice(0, 3), ['grupos', 'perfis', 'membros']);
c = clienteFalso();
await aplicar(c, diferenca(comPerfil, { ...comPerfil, grupos: [grupo], atividades: [atividade('a1', { grupoId: 'g1' })] }));
checar('a atividade sem disciplina sai junto com o grupo dela', c.log, ['delete grupo']);
const semResp = linha('atividades', atividade('a3', { grupoId: 'p1', responsavelId: '', disciplinaId: '' }));
checar('"A definir" e sem disciplina vão como nulo, com o grupo', [semResp.id_responsavel, semResp.id_disciplina, semResp.id_grupo], [null, null, 'p1']);
checar('evento de um dia só não grava o fim', linha('eventos', { id: 'e1', grupoId: 'g1', titulo: 'x', tipo: 'prova', data: '2026-11-20', dataFim: '2026-11-20' }).data_fim, null);

console.log('\nRecusa do banco\n');
c = clienteFalso('update atividade');
let erro = null;
try {
  await aplicar(c, mudou);
} catch (e) {
  erro = mensagemDoErro(e);
}
checar('update que não acha a linha vira recusa', erro, 'Você não tem permissão para essa alteração.');
checar('mensagem das regras do banco passa em português', mensagemDoErro({ message: 'Só o responsável muda o status da atividade.' }), 'Só o responsável muda o status da atividade.');
checar('nome repetido de disciplina', mensagemDoErro({ message: 'duplicate key value violates unique constraint "uk_disciplina_nome"' }), 'Este grupo já tem uma disciplina com esse nome.');
checar('sem internet', mensagemDoErro({ message: 'TypeError: Failed to fetch' }), 'Sem conexão com o servidor. Confira a internet e tente de novo.');
checar('erro desconhecido em inglês não aparece cru', mensagemDoErro({ message: 'something broke' }), 'Não foi possível salvar. Tente de novo.');
checar('"A definir" não conclui', mensagemDoErro({ message: 'new row for relation "atividade" violates check constraint "ck_atividade_a_definir"' }), 'Escolha quem vai fazer antes de mudar o status.');
checar(
  'banco sem a atualização de 11/11',
  mensagemDoErro({ code: 'PGRST202', message: 'Could not find the function public.garantir_espaco_pessoal without parameters' }),
  'O banco ainda não recebeu a atualização de 11/11. Rode o script de atualização no Supabase.'
);

console.log('\nFotos para o Storage\n');
const dataUrl = 'data:image/jpeg;base64,AAAA';
checar('foto do editor é foto nova', ehFotoNova(dataUrl), true);
checar('endereço do Storage não é', ehFotoNova('https://x.supabase.co/storage/v1/object/public/fotos/g1/a.jpg'), false);
const { semFotos, fotos } = separarFotos({ membros: [{ ...membro, foto: dataUrl }] }, { membros: [{ ...membro, foto: 'antiga.jpg' }] });
checar('a linha vai com a foto antiga', semFotos.membros[0].foto, 'antiga.jpg');
checar('a foto nova sobe na pasta do grupo', fotos.map((f) => [f.chave, f.pasta, f.prefixo]), [['membros', 'g1', 'membro']]);
const doPerfil = separarFotos({ perfis: [{ ...perfil, foto: dataUrl }] }, { perfis: [perfil] }).fotos;
checar('a foto do perfil sobe na pasta do espaço pessoal', doPerfil.map((f) => [f.chave, f.pasta, f.prefixo]), [['perfis', 'p1', 'perfil']]);

console.log('\nEvolução do progresso (RF12)\n');
const hist = reconstruirHistorico(
  [
    atividade('h1', { peso: 3, criadaEm: '2026-11-01T15:00:00', status: 'concluido', dataConclusao: '2026-11-03T15:00:00' }),
    atividade('h2', { peso: 1, criadaEm: '2026-11-01T15:00:00' }),
    atividade('h3', { peso: 4, criadaEm: '2026-11-04T15:00:00' }),
  ],
  '2026-11-05'
);
checar('um ponto por dia, do primeiro cadastro até hoje', hist.map((p) => p.data), ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05']);
checar('sobe na conclusão e cai quando entra atividade nova (peso, não contagem)', hist.map((p) => p.percentual), [0, 0, 75, 38, 38]);
const serie = completarHistorico([{ data: '2026-11-02', percentual: '20.00' }, { data: '2026-11-04', percentual: '50.00' }], 60, '2026-11-05');
checar('fotos do banco: repete o último valor nos dias sem mudança', serie.map((p) => p.percentual), [20, 20, 50, 60]);
checar('sem foto nenhuma, só hoje', completarHistorico([], 10, '2026-11-05'), [{ data: '2026-11-05', percentual: 10 }]);

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações passaram.');
if (falhas) process.exit(1);

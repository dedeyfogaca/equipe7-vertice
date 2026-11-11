// Ponte entre as coleções do sistema e as tabelas do banco (Supabase).
//
// O sistema continua trabalhando com as mesmas coleções de antes (grupos,
// membros, disciplinas...). Com conta, a cada mudança este módulo compara a
// coleção nova com a última versão que veio do banco e envia só a diferença:
// o que entrou vira insert, o que mudou vira update e o que saiu vira delete.
//
// A ordem importa por causa das chaves estrangeiras: inserções e alterações
// seguem do grupo para as conquistas (pai antes do filho) e as exclusões, ao
// contrário. Quando o pai sai, os filhos não são excluídos um a um: o banco
// já os leva junto (ON DELETE CASCADE).
//
// O perfil da conta (RF35) é criado pelo banco, no primeiro acesso
// (garantir_espaco_pessoal): o sistema só o lê e altera.

const vazio = (valor) => (valor === '' || valor === undefined ? null : valor);
const texto = (valor) => valor ?? '';
const hora = (valor) => (valor ? String(valor).slice(0, 5) : '');

export const COLECOES = [
  {
    chave: 'grupos',
    tabela: 'grupo',
    colunas: ['id_grupo'],
    idDe: (g) => g.id,
    paraLinha: (g) => ({
      id_grupo: g.id,
      nome: g.nome,
      descricao: vazio(g.descricao),
      foto: vazio(g.foto),
      pessoal: Boolean(g.pessoal),
      data_criacao: g.criadoEm,
    }),
    deLinha: (r) => ({
      id: r.id_grupo,
      nome: r.nome,
      descricao: texto(r.descricao),
      foto: texto(r.foto),
      pessoal: Boolean(r.pessoal),
      criadoEm: r.data_criacao,
    }),
  },
  {
    chave: 'perfis',
    tabela: 'perfil',
    colunas: ['id_usuario'],
    idDe: (p) => p.id,
    paraLinha: (p) => ({
      id_usuario: p.id,
      nome: p.nome,
      avatar: vazio(p.avatar),
      estilo_avatar: p.estiloAvatar,
      foto: vazio(p.foto),
      lembrete_email: Boolean(p.lembreteEmail),
    }),
    deLinha: (r) => ({
      id: r.id_usuario,
      nome: r.nome,
      avatar: texto(r.avatar),
      estiloAvatar: r.estilo_avatar,
      foto: texto(r.foto),
      lembreteEmail: Boolean(r.lembrete_email),
      grupoPessoalId: texto(r.id_grupo_pessoal),
    }),
  },
  {
    chave: 'membros',
    tabela: 'membro',
    colunas: ['id_membro'],
    pai: { chave: 'grupos', campo: 'grupoId' },
    idDe: (m) => m.id,
    paraLinha: (m) => ({
      id_membro: m.id,
      id_grupo: m.grupoId,
      id_usuario: vazio(m.usuarioId),
      nome: m.nome,
      funcao: vazio(m.funcao),
      email: vazio(m.email),
      avatar: vazio(m.avatar),
      estilo_avatar: m.estiloAvatar,
      foto: vazio(m.foto),
      perfil: m.perfil,
    }),
    deLinha: (r) => ({
      id: r.id_membro,
      grupoId: r.id_grupo,
      usuarioId: texto(r.id_usuario),
      nome: r.nome,
      funcao: texto(r.funcao),
      email: texto(r.email),
      avatar: texto(r.avatar),
      estiloAvatar: r.estilo_avatar,
      foto: texto(r.foto),
      perfil: r.perfil,
    }),
  },
  {
    chave: 'disciplinas',
    tabela: 'disciplina',
    colunas: ['id_disciplina'],
    pai: { chave: 'grupos', campo: 'grupoId' },
    idDe: (d) => d.id,
    paraLinha: (d) => ({
      id_disciplina: d.id,
      id_grupo: d.grupoId,
      nome: d.nome,
      cor: d.cor,
      data_criacao: d.criadaEm,
    }),
    deLinha: (r) => ({
      id: r.id_disciplina,
      grupoId: r.id_grupo,
      nome: r.nome,
      cor: r.cor,
      criadaEm: r.data_criacao,
    }),
  },
  {
    chave: 'conteudos',
    tabela: 'conteudo',
    colunas: ['id_conteudo'],
    pai: { chave: 'disciplinas', campo: 'disciplinaId' },
    idDe: (c) => c.id,
    paraLinha: (c) => ({
      id_conteudo: c.id,
      id_disciplina: c.disciplinaId,
      nome: c.nome,
      descricao: vazio(c.descricao),
      ordem: c.ordem ?? 0,
    }),
    deLinha: (r) => ({
      id: r.id_conteudo,
      disciplinaId: r.id_disciplina,
      nome: r.nome,
      descricao: texto(r.descricao),
      ordem: r.ordem,
    }),
  },
  {
    chave: 'atividades',
    tabela: 'atividade',
    colunas: ['id_atividade'],
    // sai junto com o grupo ou com a disciplina
    pai: [
      { chave: 'grupos', campo: 'grupoId' },
      { chave: 'disciplinas', campo: 'disciplinaId' },
    ],
    idDe: (a) => a.id,
    paraLinha: (a) => ({
      id_atividade: a.id,
      id_grupo: a.grupoId,
      id_disciplina: vazio(a.disciplinaId),
      id_conteudo: vazio(a.conteudoId),
      // vazio = "A definir" (RN06)
      id_responsavel: vazio(a.responsavelId),
      titulo: a.titulo,
      descricao: vazio(a.descricao),
      prazo: a.prazo,
      peso: a.peso,
      prioridade: vazio(a.prioridade),
      status: a.status,
      data_criacao: a.criadaEm,
      data_conclusao: a.dataConclusao || null,
    }),
    deLinha: (r) => ({
      id: r.id_atividade,
      grupoId: r.id_grupo,
      disciplinaId: texto(r.id_disciplina),
      conteudoId: texto(r.id_conteudo),
      responsavelId: texto(r.id_responsavel),
      titulo: r.titulo,
      descricao: texto(r.descricao),
      prazo: r.prazo,
      peso: r.peso,
      prioridade: texto(r.prioridade),
      status: r.status,
      criadaEm: r.data_criacao,
      dataConclusao: r.data_conclusao || null,
    }),
  },
  {
    chave: 'eventos',
    tabela: 'evento',
    colunas: ['id_evento'],
    pai: { chave: 'grupos', campo: 'grupoId' },
    idDe: (e) => e.id,
    paraLinha: (e) => ({
      id_evento: e.id,
      id_grupo: e.grupoId,
      id_disciplina: vazio(e.disciplinaId),
      id_criador: vazio(e.criadoPor),
      titulo: e.titulo,
      tipo: e.tipo,
      data_evento: e.data,
      data_fim: e.dataFim && e.dataFim !== e.data ? e.dataFim : null,
      hora_inicio: vazio(e.horaInicio),
      hora_fim: vazio(e.horaFim),
      local_evento: vazio(e.local),
      descricao: vazio(e.descricao),
      data_criacao: e.criadoEm,
    }),
    deLinha: (r) => ({
      id: r.id_evento,
      grupoId: r.id_grupo,
      disciplinaId: texto(r.id_disciplina),
      criadoPor: texto(r.id_criador),
      titulo: r.titulo,
      tipo: r.tipo,
      data: r.data_evento,
      dataFim: texto(r.data_fim),
      horaInicio: hora(r.hora_inicio),
      horaFim: hora(r.hora_fim),
      local: texto(r.local_evento),
      descricao: texto(r.descricao),
      criadoEm: r.data_criacao,
    }),
  },
  {
    chave: 'conquistas',
    tabela: 'membro_conquista',
    colunas: ['id_membro', 'codigo_conquista'],
    pai: { chave: 'membros', campo: 'membroId' },
    idDe: (c) => `${c.membroId}:${c.codigo}`,
    paraLinha: (c) => ({ id_membro: c.membroId, codigo_conquista: c.codigo, data_obtencao: c.obtidaEm }),
    deLinha: (r) => ({ membroId: r.id_membro, codigo: r.codigo_conquista, obtidaEm: r.data_obtencao }),
  },
];

/**
 * Cria, se ainda não existir, o espaço pessoal e o perfil da conta (RF34,
 * RF35). Devolve o id do espaço pessoal.
 */
export async function garantirEspacoPessoal(cliente) {
  const { data, error } = await cliente.rpc('garantir_espaco_pessoal');
  if (error) throw error;
  return data;
}

/** Lê tudo o que a conta pode ver (o banco já filtra pelos grupos dela, RN01). */
export async function carregarTudo(cliente) {
  const respostas = await Promise.all(COLECOES.map((c) => cliente.from(c.tabela).select('*')));
  const dados = {};
  respostas.forEach(({ data, error }, i) => {
    if (error) throw error;
    dados[COLECOES[i].chave] = (data || []).map(COLECOES[i].deLinha);
  });
  return dados;
}

/**
 * Diferença entre o que está no banco (`antes`) e o que o sistema tem agora
 * (`depois`), coleção por coleção.
 */
export function diferenca(antes, depois) {
  const mudancas = {};
  COLECOES.forEach((c) => {
    if (!(c.chave in depois)) return;
    const velhos = new Map((antes[c.chave] || []).map((o) => [c.idDe(o), o]));
    const novos = new Map(depois[c.chave].map((o) => [c.idDe(o), o]));
    const inserir = [];
    const alterar = [];
    const excluir = [];
    novos.forEach((obj, id) => {
      const velho = velhos.get(id);
      if (!velho) inserir.push(obj);
      else if (JSON.stringify(c.paraLinha(velho)) !== JSON.stringify(c.paraLinha(obj))) alterar.push(obj);
    });
    velhos.forEach((obj, id) => {
      if (!novos.has(id)) excluir.push(obj);
    });
    if (inserir.length || alterar.length || excluir.length) mudancas[c.chave] = { inserir, alterar, excluir };
  });
  return mudancas;
}

export const semMudancas = (mudancas) => Object.keys(mudancas).length === 0;

// Filtro de uma linha pela chave dela (uma coluna, ou duas nas conquistas).
function ondeChave(consulta, colecao, linha) {
  return colecao.colunas.reduce((q, coluna) => q.eq(coluna, linha[coluna]), consulta);
}

// Quando a política de acesso barra um update ou delete, o banco não dá
// erro: simplesmente não acha a linha. Por isso a resposta pede a chave de
// volta, e "nenhuma linha" vira recusa.
const RECUSA = { message: 'Você não tem permissão para essa alteração.', code: 'sem-permissao' };

/** Envia a diferença para o banco, na ordem das chaves estrangeiras. */
export async function aplicar(cliente, mudancas) {
  // 1. Inserções e alterações: do pai para o filho.
  for (const c of COLECOES) {
    const m = mudancas[c.chave];
    if (!m) continue;
    if (m.inserir.length) {
      const { error } = await cliente.from(c.tabela).insert(m.inserir.map(c.paraLinha));
      if (error) throw error;
    }
    for (const obj of m.alterar) {
      const linha = c.paraLinha(obj);
      const { data, error } = await ondeChave(cliente.from(c.tabela).update(linha), c, linha).select(c.colunas[0]);
      if (error) throw error;
      if (!data || data.length === 0) throw RECUSA;
    }
  }

  // 2. Exclusões: do filho para o pai, pulando quem sai junto com o pai.
  const saindo = {};
  COLECOES.forEach((c) => {
    saindo[c.chave] = new Set((mudancas[c.chave]?.excluir || []).map(c.idDe));
  });
  const paisDe = (c) => (Array.isArray(c.pai) ? c.pai : c.pai ? [c.pai] : []);
  for (const c of [...COLECOES].reverse()) {
    const m = mudancas[c.chave];
    if (!m) continue;
    for (const obj of m.excluir) {
      if (paisDe(c).some((p) => saindo[p.chave].has(obj[p.campo]))) continue;
      const linha = c.paraLinha(obj);
      const { data, error } = await ondeChave(cliente.from(c.tabela).delete(), c, linha).select(c.colunas[0]);
      if (error) throw error;
      if (!data || data.length === 0) throw RECUSA;
    }
  }
}

/** Mensagem do banco em texto para a pessoa. */
export function mensagemDoErro(erro) {
  const msg = erro?.message || '';
  if (/row-level security|sem-permissao/i.test(msg) || erro?.code === '42501' || erro?.code === 'sem-permissao') {
    return /Só |precisa/.test(msg) ? msg : 'Você não tem permissão para essa alteração.';
  }
  if (/uk_disciplina_nome/.test(msg)) return 'Este grupo já tem uma disciplina com esse nome.';
  if (/uk_conteudo_nome/.test(msg)) return 'Esta disciplina já tem um conteúdo com esse nome.';
  if (/atividade_id_responsavel_fkey/.test(msg)) return 'Passe as atividades desse membro para outra pessoa antes.';
  if (/ck_atividade_a_definir/.test(msg)) return 'Escolha quem vai fazer antes de mudar o status.';
  if (/garantir_espaco_pessoal|id_grupo|column .* does not exist|PGRST202/i.test(msg) || erro?.code === 'PGRST202') {
    return 'O banco ainda não recebeu a atualização de 11/11. Rode o script de atualização no Supabase.';
  }
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
  // As regras do próprio banco já respondem em português (ver o script de criação do banco).
  if (/[áéíóúãõç]/i.test(msg)) return msg;
  return 'Não foi possível salvar. Tente de novo.';
}

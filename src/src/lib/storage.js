// Camada fininha em cima do armazenamento do navegador (localStorage).
// A documentação pede para separar os dados por tipo (uma chave por coleção),
// em vez de jogar tudo num objeto só. Fica mais fácil de filtrar e atualizar.

export const CHAVES = {
  grupos: 'grupos',
  membros: 'membros',
  disciplinas: 'disciplinas',
  conteudos: 'conteudos',
  atividades: 'atividades',
  // RN12 — conquistas já concedidas ({ membroId, codigo, obtidaEm }). Espelha
  // a tabela `membro_conquista` do modelo lógico.
  conquistas: 'conquistasMembro',
  sessao: 'sessao',
  versao: 'versaoDados',
};

// Nome antigo da coleção, de quando a atividade se chamava "tarefa". Só a
// migração lê daqui, e o valor tem de continuar sendo literalmente 'tarefas':
// é a chave que existe no navegador de quem usou a versão antiga.
export const CHAVE_LEGADA_TAREFAS = 'tarefas';

// Lê uma coleção (sempre devolve array, mesmo se o JSON estiver corrompido).
export function lerColecao(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    const dados = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

// Devolve `true` quando gravou. Armazenamento cheio ou bloqueado não derruba
// a aplicação, mas também não pode passar em silêncio (defeito D02): quem
// chama recebe `false` e avisa a pessoa de que o cadastro pode se perder.
export function salvarColecao(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

// Sessão = o grupo e quem, dentro dele, está usando o sistema.
//
// O membro entrou por causa do RN07: sem saber quem é a pessoa não dá para
// comparar com o perfil dela. Continua sem senha — é seleção, como o grupo.
export function lerSessao() {
  try {
    const bruto = localStorage.getItem(CHAVES.sessao);
    if (!bruto) return null;
    const dados = JSON.parse(bruto);

    // Formato antigo: a sessão era só o id do grupo, numa string. Quem tinha
    // o sistema aberto continua dentro do grupo, e escolhe quem é depois.
    if (typeof dados === 'string') return { grupoId: dados, membroId: null };

    if (dados && typeof dados === 'object' && dados.grupoId) {
      return { grupoId: dados.grupoId, membroId: dados.membroId ?? null };
    }
    return null;
  } catch {
    return null;
  }
}

export function salvarSessao(sessao) {
  try {
    if (sessao?.grupoId) {
      localStorage.setItem(
        CHAVES.sessao,
        JSON.stringify({ grupoId: sessao.grupoId, membroId: sessao.membroId ?? null })
      );
    } else {
      localStorage.removeItem(CHAVES.sessao);
    }
  } catch {
    /* silencioso de propósito */
  }
}

export function removerChave(chave) {
  try {
    localStorage.removeItem(chave);
  } catch {
    /* silencioso de propósito */
  }
}

// Versão do formato dos dados gravados. É o que impede a migração de rodar
// duas vezes e duplicar disciplina.
export function lerVersaoDados() {
  try {
    const bruto = localStorage.getItem(CHAVES.versao);
    const versao = bruto ? Number(JSON.parse(bruto)) : 0;
    return Number.isFinite(versao) ? versao : 0;
  } catch {
    return 0;
  }
}

export function salvarVersaoDados(versao) {
  try {
    localStorage.setItem(CHAVES.versao, JSON.stringify(versao));
  } catch {
    /* silencioso de propósito */
  }
}

// Gera ids únicos. Usa crypto.randomUUID quando disponível (como sugere a doc),
// com um fallback simples para ambientes sem suporte.
export function novoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

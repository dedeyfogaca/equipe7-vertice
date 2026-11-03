// Experiência (RN10).
//
//   xp = peso × 10   ->   creditado ao responsável
//
// Três cláusulas que o cálculo precisa respeitar:
//
//   1. uma única vez por atividade;
//   2. estornada se o status deixar de ser 'concluido';
//   3. atividade sem responsável não gera experiência. Pelo RN06 toda
//      atividade tem responsável; a guarda vale para o dado antigo de um
//      grupo que não tinha membro nenhum quando a migração rodou.
//
// ## Por que a experiência é derivada, e não um contador
//
// O estorno é a parte que costuma faltar: concluir, desmarcar e concluir de
// novo não pode creditar duas vezes. Um contador guardado no membro, somado
// e subtraído a cada transição, é exatamente onde esse bug nasce — basta uma
// transição perdida para o número ficar errado para sempre, sem como saber.
//
// Aqui a experiência é uma projeção sobre as atividades: o registro da
// própria atividade é o que diz se o crédito está de pé. Concluída e com
// responsável, vale; deixou de estar concluída, deixou de valer. Creditar
// duas vezes é impossível, porque a atividade aparece uma vez só no conjunto.
//
// Isso também é o que o modelo de dados permite: a tabela `membro` do modelo
// lógico não tem campo de experiência. Guardar um total em algum lugar
// exigiria inventar estrutura que o banco não teria.
//
// Já as conquistas (RN12) são guardadas, e de propósito: uma conquista não é
// revogada por alterações posteriores, então ela não pode ser só uma
// projeção do estado atual. Ver `conquistasAlcancadas` no fim do arquivo.

import { normalizarPeso, STATUS } from './constants.js';
import { paraISO } from './datas.js';

// RN10 — cada ponto de peso vale 10 de experiência.
export const XP_POR_PESO = 10;

/**
 * Experiência que uma atividade credita neste momento.
 * Zero quando ela não está concluída (estorno) ou não tem responsável.
 */
export function xpDaAtividade(atividade) {
  if (!atividade) return 0;
  if (atividade.status !== STATUS.CONCLUIDO) return 0;
  if (!atividade.responsavelId) return 0;
  return normalizarPeso(atividade.peso) * XP_POR_PESO;
}

/**
 * Experiência que a atividade vale quando for concluída, independente do
 * status atual. Serve para a tela dizer quanto está em jogo.
 */
export function xpPotencial(atividade) {
  if (!atividade) return 0;
  return normalizarPeso(atividade.peso) * XP_POR_PESO;
}

/**
 * Experiência acumulada por um membro.
 *
 * @param {string} membroId
 * @param {Array} atividades atividades do grupo
 */
export function xpDoMembro(membroId, atividades = []) {
  if (!membroId) return 0;
  return atividades
    .filter((a) => a.responsavelId === membroId)
    .reduce((soma, a) => soma + xpDaAtividade(a), 0);
}

/**
 * Membros do grupo ordenados por experiência, do maior para o menor.
 * Empate mantém a ordem alfabética, para a lista não dançar a cada conclusão.
 *
 * A posição é compartilhada em caso de empate: dois primeiros lugares são
 * ambos 1, e o seguinte é 3.
 */
export function rankingDoGrupo(membros = [], atividades = []) {
  const linhas = membros
    .map((membro) => {
      const doMembro = atividades.filter((a) => a.responsavelId === membro.id);
      return {
        membro,
        xp: doMembro.reduce((soma, a) => soma + xpDaAtividade(a), 0),
        concluidas: doMembro.filter((a) => a.status === STATUS.CONCLUIDO).length,
      };
    })
    .sort((a, b) => b.xp - a.xp || a.membro.nome.localeCompare(b.membro.nome, 'pt-BR'));

  let posicao = 0;
  let xpAnterior = null;

  return linhas.map((linha, indice) => {
    if (linha.xp !== xpAnterior) {
      posicao = indice + 1;
      xpAnterior = linha.xp;
    }
    return { ...linha, posicao };
  });
}

/**
 * Experiência somada de um grupo inteiro. Atividade sem responsável não
 * entra, como manda o RN10.
 */
export function xpDoGrupo(atividades = []) {
  return atividades.reduce((soma, a) => soma + xpDaAtividade(a), 0);
}

// ---------------------------------------------------------------------------
// Ofensiva (RN11)
// ---------------------------------------------------------------------------
//
// Número de dias seguidos, contados até hoje, em que o membro concluiu ao
// menos uma atividade. Um dia inteiro sem conclusão zera a contagem.
//
// O dia de hoje ainda está em aberto: se a pessoa ainda não concluiu nada
// hoje, a ofensiva não cai para zero de manhã — a contagem parte de ontem.
// Ela só zera quando um dia termina sem conclusão.
//
// Como a experiência, a ofensiva é derivada das atividades (pela
// `dataConclusao`). Desfazer uma conclusão recalcula a ofensiva sozinho.

/** 'AAAA-MM-DD' local de um instante gravado (ISO com hora). */
export function diaLocal(instante) {
  if (!instante) return null;
  const d = new Date(instante);
  return Number.isNaN(d.getTime()) ? null : paraISO(d);
}

/** Dias (AAAA-MM-DD) em que o membro concluiu pelo menos uma atividade. */
export function diasComConclusao(membroId, atividades = []) {
  const dias = new Set();
  atividades.forEach((a) => {
    if (a.responsavelId !== membroId || a.status !== STATUS.CONCLUIDO) return;
    const dia = diaLocal(a.dataConclusao);
    if (dia) dias.add(dia);
  });
  return dias;
}

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

/** RN11 — ofensiva atual do membro, em dias. */
export function ofensivaDoMembro(membroId, atividades = [], hoje = new Date()) {
  if (!membroId) return 0;
  const dias = diasComConclusao(membroId, atividades);
  if (dias.size === 0) return 0;

  const cursor = inicioDoDia(hoje);
  if (!dias.has(paraISO(cursor))) cursor.setDate(cursor.getDate() - 1);

  let total = 0;
  while (dias.has(paraISO(cursor))) {
    total += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return total;
}

/** Os últimos `quantidade` dias, do mais antigo ao de hoje, marcando os com conclusão. */
export function ultimosDias(membroId, atividades = [], quantidade = 7, hoje = new Date()) {
  const dias = diasComConclusao(membroId, atividades);
  const base = inicioDoDia(hoje);
  return Array.from({ length: quantidade }, (_, i) => {
    const data = new Date(base);
    data.setDate(base.getDate() - (quantidade - 1 - i));
    const iso = paraISO(data);
    return { iso, data, concluiu: dias.has(iso), hoje: i === quantidade - 1 };
  });
}

// ---------------------------------------------------------------------------
// Conquistas (RN12)
// ---------------------------------------------------------------------------
//
// O catálogo é o mesmo da carga inicial do script do banco
// (`banco-de-dados/04-script-criacao.sql`).

export const CONQUISTAS = [
  {
    codigo: 'PRIMEIRO_PASSO',
    nome: 'Primeiro Passo',
    descricao: 'Conclua a sua primeira atividade.',
    criterio: 'atividades_concluidas',
    valor: 1,
  },
  {
    codigo: 'CONTEUDO_DOMINADO',
    nome: 'Conteúdo Dominado',
    descricao: 'Leve um conteúdo a 100% de progresso.',
    criterio: 'conteudo_completo',
    valor: 1,
  },
  {
    codigo: 'DISCIPLINA_FECHADA',
    nome: 'Disciplina Fechada',
    descricao: 'Leve uma disciplina a 100% de progresso.',
    criterio: 'disciplina_completa',
    valor: 1,
  },
  {
    codigo: 'SEMANA_CHEIA',
    nome: 'Semana Cheia',
    descricao: 'Conclua atividades por 7 dias seguidos.',
    criterio: 'ofensiva_dias',
    valor: 7,
  },
  {
    codigo: 'MES_CHEIO',
    nome: 'Mês Cheio',
    descricao: 'Conclua atividades por 30 dias seguidos.',
    criterio: 'ofensiva_dias',
    valor: 30,
  },
  {
    codigo: 'MEIO_MILHAR',
    nome: 'Meio Milhar',
    descricao: 'Acumule 500 pontos de experiência.',
    criterio: 'experiencia_total',
    valor: 500,
  },
];

export function obterConquista(codigo) {
  return CONQUISTAS.find((c) => c.codigo === codigo) || null;
}

// Quem "fechou" um conjunto de atividades: se todas estão concluídas, é o
// responsável pela última conclusão — foi ela que levou o conjunto a 100%.
function quemFechou(lista) {
  if (lista.length === 0) return null;
  if (!lista.every((a) => a.status === STATUS.CONCLUIDO)) return null;
  const ultima = [...lista].sort((a, b) =>
    String(b.dataConclusao || '').localeCompare(String(a.dataConclusao || ''))
  )[0];
  return ultima?.responsavelId || null;
}

/**
 * RN12 — o que conceder agora. Recebe as conquistas já concedidas
 * ([{ membroId, codigo }]) e os marcos atingidos neste momento
 * ([{ membroId, codigos }]) e devolve só as novas, com a data de hoje.
 *
 * Nunca devolve remoção: uma conquista concedida continua concedida mesmo
 * que o marco deixe de valer (a atividade foi reaberta, o conteúdo ganhou
 * atividade nova). E nunca concede a mesma duas vezes.
 */
export function conquistasNovas(jaConcedidas = [], alcancadas = [], agora = new Date().toISOString()) {
  const chaves = new Set(jaConcedidas.map((c) => `${c.membroId}:${c.codigo}`));
  const novas = [];
  alcancadas.forEach(({ membroId, codigos = [] }) => {
    codigos.forEach((codigo) => {
      const chave = `${membroId}:${codigo}`;
      if (chaves.has(chave)) return;
      chaves.add(chave);
      novas.push({ membroId, codigo, obtidaEm: agora });
    });
  });
  return novas;
}

/**
 * Códigos das conquistas cujo marco o membro atinge com o estado atual.
 *
 * Quem decide o que já foi concedido é quem chama (o armazenamento das
 * conquistas): esta função só responde "o marco está atingido agora?". Uma
 * conquista concedida não é retirada se o marco deixar de valer (RN12).
 *
 * @param {string} membroId
 * @param {{ atividades: Array, conteudos: Array, hoje?: Date }} contexto
 *   atividades e conteúdos do grupo do membro
 */
export function conquistasAlcancadas(membroId, { atividades = [], conteudos = [], hoje = new Date() } = {}) {
  if (!membroId) return [];

  const concluidas = atividades.filter(
    (a) => a.responsavelId === membroId && a.status === STATUS.CONCLUIDO
  ).length;
  const xp = xpDoMembro(membroId, atividades);
  const ofensiva = ofensivaDoMembro(membroId, atividades, hoje);

  const porConteudo = new Map();
  atividades.forEach((a) => {
    if (!porConteudo.has(a.conteudoId)) porConteudo.set(a.conteudoId, []);
    porConteudo.get(a.conteudoId).push(a);
  });
  const fechouConteudo = [...porConteudo.values()].some((lista) => quemFechou(lista) === membroId);

  const disciplinaDoConteudo = new Map(conteudos.map((c) => [c.id, c.disciplinaId]));
  const porDisciplina = new Map();
  atividades.forEach((a) => {
    const disciplinaId = disciplinaDoConteudo.get(a.conteudoId);
    if (!disciplinaId) return;
    if (!porDisciplina.has(disciplinaId)) porDisciplina.set(disciplinaId, []);
    porDisciplina.get(disciplinaId).push(a);
  });
  const fechouDisciplina = [...porDisciplina.values()].some(
    (lista) => quemFechou(lista) === membroId
  );

  return CONQUISTAS.filter((c) => {
    switch (c.criterio) {
      case 'atividades_concluidas':
        return concluidas >= c.valor;
      case 'conteudo_completo':
        return fechouConteudo;
      case 'disciplina_completa':
        return fechouDisciplina;
      case 'ofensiva_dias':
        return ofensiva >= c.valor;
      case 'experiencia_total':
        return xp >= c.valor;
      default:
        return false;
    }
  }).map((c) => c.codigo);
}

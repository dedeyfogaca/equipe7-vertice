// Histórico do grupo (RF40, RN29) e saída do grupo (RF39, RN28).
//
// Com conta, quem grava o histórico é o próprio banco (gatilhos na tabela
// `registro`). Na demonstração, este módulo faz o mesmo papel: compara as
// coleções antes e depois de cada mudança e anota o que aconteceu, com as
// mesmas ações e o mesmo texto. O espaço pessoal não tem histórico.
import { PERFIL, STATUS } from './constants.js';
import { obterConquista } from './gamificacao.js';
import { novoId } from './storage.js';

// Quantas linhas a demonstração guarda por grupo (as mais antigas saem).
export const LIMITE_DEMO = 400;

export const TIPOS_FILTRO = [
  { valor: 'atividade', rotulo: 'Atividades', tipos: ['atividade'] },
  { valor: 'pessoas', rotulo: 'Pessoas', tipos: ['membro', 'convite', 'grupo'] },
  { valor: 'estrutura', rotulo: 'Disciplinas e conteúdos', tipos: ['disciplina', 'conteudo'] },
  { valor: 'evento', rotulo: 'Eventos', tipos: ['evento'] },
  { valor: 'conquista', rotulo: 'Conquistas', tipos: ['conquista'] },
];

// ----- Saída do grupo (RN28) -----

/**
 * Por que a pessoa não pode sair do grupo agora (ou '' se pode). Recebe os
 * membros que estão no grupo e o cadastro dela.
 */
export function motivoParaNaoSair(membrosAtivos, eu, { pessoal = false } = {}) {
  if (pessoal) return 'O espaço pessoal é seu: não dá para sair dele.';
  if (!eu) return 'Você não faz parte deste grupo.';
  const outros = membrosAtivos.filter((m) => m.id !== eu.id);
  if (eu.perfil === PERFIL.ORGANIZADOR && !outros.some((m) => m.perfil === PERFIL.ORGANIZADOR)) {
    return outros.length > 0
      ? 'Antes de sair, torne outra pessoa organizadora do grupo.'
      : 'Você é a única pessoa do grupo. Para sair, exclua o grupo.';
  }
  return '';
}

/** As atividades em aberto que ficam "A definir" quando a pessoa sai. */
export const atividadesQueFicamSemDono = (atividades, membroId) =>
  atividades.filter((a) => a.responsavelId === membroId && a.status !== STATUS.CONCLUIDO);

/** Nome de quem saiu do grupo, marcado como tal. */
export const nomeDoMembro = (membro) => (membro ? (membro.saiuEm ? `${membro.nome} (saiu)` : membro.nome) : '');

// ----- Texto de cada linha -----

const TIPO = {
  atividade: { nome: 'a atividade', passivo: 'Atividade', fem: true },
  disciplina: { nome: 'a disciplina', passivo: 'Disciplina', fem: true },
  conteudo: { nome: 'o conteúdo', passivo: 'Conteúdo', fem: false },
  evento: { nome: 'o evento', passivo: 'Evento', fem: false },
  grupo: { nome: 'o grupo', passivo: 'Grupo', fem: false },
};

/**
 * O texto de uma linha do histórico, em partes, para a tela destacar quem
 * fez e o item: `autor` + `antes` + `alvo` (entre aspas se `aspas`) + `depois`.
 * Sem autor (linhas montadas com as datas antigas), a frase fica na passiva.
 */
export function fraseDoRegistro(r) {
  const t = TIPO[r.tipo] || { nome: '', passivo: '', fem: false };
  const fim = t.fem ? 'a' : 'o';
  const comAlvo = (antes, depois = '') => ({ antes, alvo: r.alvo || '', aspas: true, depois });
  const pessoa = (antes, depois = '') => ({ antes, alvo: r.alvo || '', aspas: false, depois });
  const so = (antes) => ({ antes, alvo: '', aspas: false, depois: '' });
  const ativa = (() => {
    switch (r.acao) {
      case 'criou':
        if (r.tipo === 'grupo') return so('criou o grupo');
        return comAlvo(`criou ${t.nome}`, r.tipo === 'conteudo' && r.detalhe ? `em ${r.detalhe}` : '');
      case 'editou':
        if (r.tipo === 'grupo') return so('editou o nome, a descrição ou a foto do grupo');
        return comAlvo(`editou ${t.nome}`, r.tipo === 'disciplina' && r.detalhe ? `(antes “${r.detalhe}”)` : '');
      case 'excluiu':
        return comAlvo(`excluiu ${t.nome}`);
      case 'concluiu':
        return comAlvo('concluiu');
      case 'reabriu':
        return comAlvo('desfez a conclusão de');
      case 'assumiu':
        return comAlvo('assumiu');
      case 'passou':
        return r.detalhe === 'A definir' ? comAlvo('deixou', '“A definir”') : comAlvo('passou', `para ${r.detalhe}`);
      case 'status':
        return r.detalhe === STATUS.FAZENDO ? comAlvo('começou') : comAlvo('voltou', 'para “a fazer”');
      case 'cadastrou':
        return pessoa('cadastrou', 'no grupo');
      case 'entrou':
        return so('entrou no grupo');
      case 'voltou':
        return so('voltou ao grupo');
      case 'saiu': {
        const n = Number(r.detalhe) || 0;
        const resto = n === 0 ? '' : n === 1 ? ': 1 atividade ficou “A definir”' : `: ${n} atividades ficaram “A definir”`;
        return so(`saiu do grupo${resto}`);
      }
      case 'removeu':
        return pessoa('removeu', 'do grupo');
      case 'promoveu':
        return pessoa('mudou o perfil de', `para ${r.detalhe === PERFIL.ORGANIZADOR ? 'organizador' : 'participante'}`);
      case 'gerou':
        return so('gerou um código de convite');
      case 'ganhou':
        return comAlvo('ganhou a conquista');
      case 'perdeu':
        return comAlvo('perdeu a conquista', '(a conclusão foi desfeita)');
      default:
        return so(r.acao);
    }
  })();
  if (r.autor) return { autor: r.autor, ...ativa };

  // Sem autor conhecido: a frase na passiva.
  switch (r.acao) {
    case 'criou':
      if (r.tipo === 'grupo') return { autor: '', antes: 'Grupo criado', alvo: '', aspas: false, depois: '' };
      return { autor: '', antes: t.passivo, alvo: r.alvo || '', aspas: true, depois: `criad${fim}${r.tipo === 'conteudo' && r.detalhe ? ` em ${r.detalhe}` : ''}` };
    case 'concluiu':
      return { autor: '', antes: 'Atividade', alvo: r.alvo || '', aspas: true, depois: 'concluída' };
    case 'cadastrou':
      return { autor: '', antes: '', alvo: r.alvo || '', aspas: false, depois: 'foi cadastrado no grupo' };
    case 'gerou':
      return { autor: '', antes: 'Código de convite gerado', alvo: '', aspas: false, depois: '' };
    default:
      return { autor: 'Alguém', ...ativa };
  }
}

/** A frase inteira, em texto corrido (leitor de tela, planilha, testes). */
export function textoDoRegistro(r) {
  const f = fraseDoRegistro(r);
  const alvo = f.alvo ? (f.aspas ? `“${f.alvo}”` : f.alvo) : '';
  return [f.autor, f.antes, alvo, f.depois].filter(Boolean).join(' ');
}

// ----- Demonstração: o histórico montado a partir das coleções -----

const porId = (lista) => new Map((lista || []).map((o) => [o.id, o]));
const chaveConquista = (c) => `${c.membroId}:${c.codigo}`;

function linha(grupoId, acao, tipo, alvo, { autor = null, detalhe = null, data } = {}) {
  return {
    id: novoId(),
    grupoId,
    data,
    autorId: autor?.id || '',
    autor: autor?.nome || '',
    acao,
    tipo,
    alvo: alvo || '',
    detalhe: detalhe ?? '',
  };
}

/**
 * O que já se sabe de um grupo pelas datas que a demonstração guarda: a
 * criação do grupo, das atividades e dos eventos, as conclusões e as
 * conquistas. É o mesmo que a atualização do banco monta com conta.
 */
export function reconstruirRegistros(dados, grupoId) {
  const grupo = (dados.grupos || []).find((g) => g.id === grupoId);
  if (!grupo || grupo.pessoal) return [];
  const membros = (dados.membros || []).filter((m) => m.grupoId === grupoId);
  const membro = porId(membros);
  const disciplinas = (dados.disciplinas || []).filter((d) => d.grupoId === grupoId);
  const atividades = (dados.atividades || []).filter((a) => a.grupoId === grupoId);
  const primeiraData = [grupo.criadoEm, ...atividades.map((a) => a.criadaEm)].filter(Boolean).sort()[0];

  const linhas = [];
  if (primeiraData) linhas.push(linha(grupoId, 'criou', 'grupo', grupo.nome, { autor: membros[0], data: grupo.criadoEm || primeiraData }));
  disciplinas.forEach((d) => d.criadaEm && linhas.push(linha(grupoId, 'criou', 'disciplina', d.nome, { data: d.criadaEm })));
  atividades.forEach((a) => {
    if (a.criadaEm) linhas.push(linha(grupoId, 'criou', 'atividade', a.titulo, { data: a.criadaEm }));
    if (a.status === STATUS.CONCLUIDO && a.dataConclusao) {
      linhas.push(linha(grupoId, 'concluiu', 'atividade', a.titulo, { autor: membro.get(a.responsavelId), data: a.dataConclusao }));
    }
  });
  (dados.eventos || [])
    .filter((e) => e.grupoId === grupoId && e.criadoEm)
    .forEach((e) => linhas.push(linha(grupoId, 'criou', 'evento', e.titulo, { autor: membro.get(e.criadoPor), data: e.criadoEm })));
  (dados.conquistas || [])
    .filter((c) => membro.has(c.membroId) && c.obtidaEm)
    .forEach((c) =>
      linhas.push(linha(grupoId, 'ganhou', 'conquista', obterConquista(c.codigo)?.nome || c.codigo, { autor: membro.get(c.membroId), data: c.obtidaEm }))
    );
  return linhas;
}

/**
 * As linhas novas do histórico entre duas versões das coleções. `autorEm`
 * devolve quem está usando o sistema dentro de um grupo (na demonstração,
 * a própria pessoa).
 */
export function registrosDaMudanca(antes, depois, { autorEm, agora = new Date().toISOString() }) {
  const novas = [];
  const gruposAntes = porId(antes.grupos);
  const gruposDepois = porId(depois.grupos);
  const valeGrupo = (id) => {
    const g = gruposDepois.get(id);
    return g && !g.pessoal;
  };
  // Grupo novo (criado agora ou carregado do exemplo): o histórico dele sai
  // inteiro das datas, como no banco.
  const novos = new Set();
  gruposDepois.forEach((g, id) => {
    if (!gruposAntes.has(id) && !g.pessoal) {
      novos.add(id);
      novas.push(...reconstruirRegistros(depois, id));
    }
  });
  const conta = (id) => valeGrupo(id) && !novos.has(id);
  const anota = (grupoId, acao, tipo, alvo, extra = {}) =>
    novas.push(linha(grupoId, acao, tipo, alvo, { autor: autorEm(grupoId), data: agora, ...extra }));

  // Membros (antes das atividades, para saber quem saiu agora).
  const membrosAntes = porId(antes.membros);
  const membrosDepois = porId(depois.membros);
  const sairam = new Set();
  membrosDepois.forEach((m, id) => {
    if (!conta(m.grupoId)) return;
    const velho = membrosAntes.get(id);
    if (!velho) {
      if (m.usuarioId && autorEm(m.grupoId)?.id === m.id) anota(m.grupoId, 'entrou', 'membro', m.nome, { autor: m });
      else anota(m.grupoId, 'cadastrou', 'membro', m.nome);
    } else if (velho.saiuEm && !m.saiuEm) {
      anota(m.grupoId, 'voltou', 'membro', m.nome, { autor: m });
    } else if (!velho.saiuEm && m.saiuEm) {
      sairam.add(id);
    } else if (velho.perfil !== m.perfil) {
      anota(m.grupoId, 'promoveu', 'membro', m.nome, { detalhe: m.perfil });
    }
  });
  membrosAntes.forEach((m, id) => {
    if (!membrosDepois.has(id) && conta(m.grupoId)) anota(m.grupoId, 'removeu', 'membro', m.nome);
  });

  // Disciplinas e conteúdos
  const discAntes = porId(antes.disciplinas);
  const discDepois = porId(depois.disciplinas);
  discDepois.forEach((d, id) => {
    if (!conta(d.grupoId)) return;
    const velha = discAntes.get(id);
    if (!velha) anota(d.grupoId, 'criou', 'disciplina', d.nome);
    else if (velha.nome !== d.nome || velha.cor !== d.cor) {
      anota(d.grupoId, 'editou', 'disciplina', d.nome, { detalhe: velha.nome !== d.nome ? velha.nome : '' });
    }
  });
  discAntes.forEach((d, id) => {
    if (!discDepois.has(id) && conta(d.grupoId)) anota(d.grupoId, 'excluiu', 'disciplina', d.nome);
  });
  const contAntes = porId(antes.conteudos);
  const contDepois = porId(depois.conteudos);
  contDepois.forEach((c, id) => {
    const d = discDepois.get(c.disciplinaId);
    if (!d || !conta(d.grupoId)) return;
    const velho = contAntes.get(id);
    if (!velho) anota(d.grupoId, 'criou', 'conteudo', c.nome, { detalhe: d.nome });
    else if (velho.nome !== c.nome || (velho.descricao || '') !== (c.descricao || '')) {
      anota(d.grupoId, 'editou', 'conteudo', c.nome, { detalhe: d.nome });
    }
  });
  contAntes.forEach((c, id) => {
    const d = discDepois.get(c.disciplinaId);
    // saiu junto com a disciplina: o que fica no histórico é a disciplina
    if (!contDepois.has(id) && d && conta(d.grupoId)) anota(d.grupoId, 'excluiu', 'conteudo', c.nome, { detalhe: d.nome });
  });

  // Atividades
  const ativAntes = porId(antes.atividades);
  const ativDepois = porId(depois.atividades);
  const soltas = new Map();
  ativDepois.forEach((a, id) => {
    if (!conta(a.grupoId)) return;
    const velha = ativAntes.get(id);
    if (!velha) return anota(a.grupoId, 'criou', 'atividade', a.titulo);
    if (sairam.has(velha.responsavelId) && !a.responsavelId) {
      soltas.set(velha.responsavelId, (soltas.get(velha.responsavelId) || 0) + 1);
      return undefined;
    }
    if (a.status === STATUS.CONCLUIDO && velha.status !== STATUS.CONCLUIDO) return anota(a.grupoId, 'concluiu', 'atividade', a.titulo);
    if (velha.status === STATUS.CONCLUIDO && a.status !== STATUS.CONCLUIDO) return anota(a.grupoId, 'reabriu', 'atividade', a.titulo);
    if ((velha.responsavelId || '') !== (a.responsavelId || '')) {
      if (!velha.responsavelId && autorEm(a.grupoId)?.id === a.responsavelId) return anota(a.grupoId, 'assumiu', 'atividade', a.titulo);
      return anota(a.grupoId, 'passou', 'atividade', a.titulo, {
        detalhe: membrosDepois.get(a.responsavelId)?.nome || 'A definir',
      });
    }
    if (velha.status !== a.status) return anota(a.grupoId, 'status', 'atividade', a.titulo, { detalhe: a.status });
    const campos = ['titulo', 'descricao', 'prazo', 'peso', 'prioridade', 'disciplinaId', 'conteudoId'];
    if (campos.some((c) => (velha[c] ?? '') !== (a[c] ?? ''))) return anota(a.grupoId, 'editou', 'atividade', a.titulo);
    return undefined;
  });
  ativAntes.forEach((a, id) => {
    if (ativDepois.has(id) || !conta(a.grupoId)) return;
    if (a.disciplinaId && !discDepois.has(a.disciplinaId)) return; // saiu junto com a disciplina
    anota(a.grupoId, 'excluiu', 'atividade', a.titulo);
  });
  sairam.forEach((id) => {
    const m = membrosDepois.get(id);
    const n = soltas.get(id) || 0;
    anota(m.grupoId, 'saiu', 'membro', m.nome, { autor: m, detalhe: n ? String(n) : '' });
  });

  // Eventos
  const evAntes = porId(antes.eventos);
  const evDepois = porId(depois.eventos);
  const camposEvento = ['titulo', 'tipo', 'data', 'dataFim', 'horaInicio', 'horaFim', 'local', 'disciplinaId', 'descricao'];
  evDepois.forEach((e, id) => {
    if (!conta(e.grupoId)) return;
    const velho = evAntes.get(id);
    if (!velho) anota(e.grupoId, 'criou', 'evento', e.titulo);
    else if (camposEvento.some((c) => (velho[c] ?? '') !== (e[c] ?? ''))) anota(e.grupoId, 'editou', 'evento', e.titulo);
  });
  evAntes.forEach((e, id) => {
    if (!evDepois.has(id) && conta(e.grupoId)) anota(e.grupoId, 'excluiu', 'evento', e.titulo);
  });

  // Conquistas (de quem continua no grupo)
  const cqAntes = new Map((antes.conquistas || []).map((c) => [chaveConquista(c), c]));
  const cqDepois = new Map((depois.conquistas || []).map((c) => [chaveConquista(c), c]));
  const nomeConquista = (c) => obterConquista(c.codigo)?.nome || c.codigo;
  cqDepois.forEach((c, k) => {
    const m = membrosDepois.get(c.membroId);
    if (!cqAntes.has(k) && m && conta(m.grupoId)) anota(m.grupoId, 'ganhou', 'conquista', nomeConquista(c), { autor: m });
  });
  cqAntes.forEach((c, k) => {
    const m = membrosDepois.get(c.membroId);
    if (!cqDepois.has(k) && m && conta(m.grupoId)) anota(m.grupoId, 'perdeu', 'conquista', nomeConquista(c), { autor: m });
  });

  // O grupo
  gruposDepois.forEach((g, id) => {
    const velho = gruposAntes.get(id);
    if (!velho || !conta(id)) return;
    if (velho.nome !== g.nome || (velho.descricao || '') !== (g.descricao || '') || (velho.foto || '') !== (g.foto || '')) {
      anota(id, 'editou', 'grupo', g.nome);
    }
  });
  return novas;
}

/** Junta as linhas novas, tira as de grupos que não existem e limita por grupo. */
export function juntarRegistros(atuais, novas, gruposExistentes) {
  const validos = new Set(gruposExistentes);
  // As atuais já vêm da mais nova para a mais antiga; as novas, na ordem em
  // que aconteceram. No mesmo instante, a que foi anotada depois vem antes.
  const todas = [...[...atuais].reverse(), ...novas]
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => validos.has(r.grupoId));
  const porGrupo = new Map();
  todas
    .sort((a, b) => (a.r.data < b.r.data ? 1 : a.r.data > b.r.data ? -1 : b.i - a.i))
    .map(({ r }) => r)
    .forEach((r) => {
      const lista = porGrupo.get(r.grupoId) || [];
      if (lista.length < LIMITE_DEMO) lista.push(r);
      porGrupo.set(r.grupoId, lista);
    });
  return [...porGrupo.values()].flat();
}

/** Filtra o histórico pela pessoa (autorId) e pelo tipo (TIPOS_FILTRO). */
export function filtrarRegistros(lista, { pessoa = '', tipo = '' } = {}) {
  const tipos = TIPOS_FILTRO.find((t) => t.valor === tipo)?.tipos;
  return lista.filter((r) => (!pessoa || r.autorId === pessoa) && (!tipos || tipos.includes(r.tipo)));
}

/** Rótulo do dia: "Hoje", "Ontem" ou a data. */
export function rotuloDoDia(dataIso, hoje = new Date()) {
  const d = new Date(dataIso);
  const chave = (x) => x.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const ontem = new Date(hoje.getTime() - 86400000);
  if (chave(d) === chave(hoje)) return 'Hoje';
  if (chave(d) === chave(ontem)) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: '2-digit' });
}

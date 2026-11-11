// Migração dos dados já gravados no navegador.
//
// Versão 1: o sistema saiu com `tarefa` guardando a disciplina como texto
// livre. O modelo alvo é outro: a atividade pertence a um conteúdo, o
// conteúdo a uma disciplina, e a disciplina a um grupo (RN13). Trocar a
// estrutura sem migrar apagaria o que quem já usa o sistema fez.
//
// Versão 2: toda atividade passou a ter responsável (RN06, revisão de
// 28/10/2026) e a paleta das disciplinas passou de 8 para 18 cores.
//
// Versão 3: o conteúdo virou opcional (revisão de 06/11/2026): a atividade
// passa a guardar a própria disciplina. E os avatares ficaram em dois estilos.
//
// Versão 4: espaço pessoal (revisão de 11/11/2026). A atividade passa a
// guardar o grupo, porque no espaço pessoal ela pode não ter disciplina. E
// quem a pessoa é dentro do grupo passa a ficar marcado no próprio membro
// (`usuarioId`), como acontece com conta.
//
// Cada passo roda uma vez só. O marcador de versão gravado é o que impede uma
// segunda passada de duplicar disciplina.

import {
  CHAVES,
  CHAVE_LEGADA_TAREFAS,
  USUARIO_DEMO,
  lerColecao,
  lerSessao,
  lerVersaoDados,
  novoId,
  removerChave,
  salvarColecao,
  salvarVersaoDados,
} from './storage.js';
import {
  COR_DISCIPLINA_PADRAO,
  CORES_DISCIPLINA,
  CORES_SUBSTITUIDAS,
  corDisciplinaValida,
  PERFIL,
  STATUS,
} from './constants.js';
import { ESTILO_AVATAR_PADRAO, estiloAvatarValido } from './avatar.js';

// Sobe de 1 em 1 a cada mudança de formato.
//   0 -> 1: tarefa com disciplina de texto vira atividade na cadeia
//   1 -> 2: responsável obrigatório e paleta de 18 cores
//   2 -> 3: disciplina na atividade, conteúdo opcional, dois estilos de avatar
//   3 -> 4: grupo na atividade e a pessoa marcada no membro (espaço pessoal)
export const VERSAO_DADOS = 4;

// Nome do conteúdo que recebe as atividades que já existiam. A pessoa
// renomeia ou divide depois; o importante é não deixar atividade solta.
const CONTEUDO_PADRAO = 'Geral';
const DESCRICAO_CONTEUDO_PADRAO = 'Recebeu as atividades que existiam antes das disciplinas.';

// Atividade sem disciplina escrita precisa de uma mesmo assim, porque não
// existe atividade fora da cadeia. O nome é explícito para a pessoa achar e
// arrumar.
const DISCIPLINA_SEM_NOME = 'Sem disciplina';

function comparavel(texto) {
  return (texto || '').trim().toLowerCase();
}

// A migração roda antes de qualquer tela montar, então não dá para pedir cor
// à pessoa: distribui as da paleta na ordem, repetindo se acabar.
function corPorIndice(indice) {
  return CORES_DISCIPLINA[indice % CORES_DISCIPLINA.length]?.valor ?? COR_DISCIPLINA_PADRAO;
}

/**
 * Converte as tarefas antigas de um grupo, criando as disciplinas e conteúdos
 * que faltarem. Devolve o que foi criado e as atividades já no formato novo.
 */
function migrarGrupo({ grupo, tarefas, disciplinas, conteudos }) {
  const disciplinasNovas = [];
  const conteudosNovos = [];
  const atividades = [];

  // Disciplinas que o grupo já tem, indexadas por nome, para a migração
  // aproveitar em vez de criar uma segunda com o mesmo nome.
  const porNome = new Map();
  disciplinas
    .filter((d) => d.grupoId === grupo.id)
    .forEach((d) => porNome.set(comparavel(d.nome), d));

  const totalExistentes = porNome.size;

  const acharOuCriarDisciplina = (nome) => {
    const chave = comparavel(nome);
    if (porNome.has(chave)) return porNome.get(chave);

    const disciplina = {
      id: novoId(),
      nome: nome.trim(),
      cor: corPorIndice(totalExistentes + disciplinasNovas.length),
      grupoId: grupo.id,
      criadaEm: grupo.criadoEm || new Date().toISOString(),
    };
    porNome.set(chave, disciplina);
    disciplinasNovas.push(disciplina);
    return disciplina;
  };

  // Conteúdo "Geral" de cada disciplina, criado sob demanda.
  const geralPorDisciplina = new Map();
  const acharOuCriarConteudoPadrao = (disciplina) => {
    if (geralPorDisciplina.has(disciplina.id)) {
      return geralPorDisciplina.get(disciplina.id);
    }

    const existente = conteudos.find(
      (c) => c.disciplinaId === disciplina.id && comparavel(c.nome) === comparavel(CONTEUDO_PADRAO)
    );
    if (existente) {
      geralPorDisciplina.set(disciplina.id, existente);
      return existente;
    }

    const irmaos = [...conteudos, ...conteudosNovos].filter(
      (c) => c.disciplinaId === disciplina.id
    );
    const conteudo = {
      id: novoId(),
      nome: CONTEUDO_PADRAO,
      descricao: DESCRICAO_CONTEUDO_PADRAO,
      disciplinaId: disciplina.id,
      ordem: irmaos.length,
    };
    geralPorDisciplina.set(disciplina.id, conteudo);
    conteudosNovos.push(conteudo);
    return conteudo;
  };

  tarefas.forEach((tarefa) => {
    const nomeDisciplina = (tarefa.disciplina || '').trim() || DISCIPLINA_SEM_NOME;
    const disciplina = acharOuCriarDisciplina(nomeDisciplina);
    const conteudo = acharOuCriarConteudoPadrao(disciplina);

    // `disciplina` (texto) e `grupoId` saem: o grupo agora chega pela cadeia
    // conteudo -> disciplina -> grupo, e guardá-lo aqui seria um dado
    // derivado com prazo de validade.
    const { disciplina: _texto, grupoId: _grupoId, ...resto } = tarefa;

    atividades.push({
      ...resto,
      conteudoId: conteudo.id,
      // RN09: toda atividade tem peso, e quem não tinha vale 1.
      peso: resto.peso ?? 1,
      // Data de conclusão estimada: o formato antigo não guardava quando a
      // atividade foi concluída, e `criadaEm` é o único instante que temos.
      // Daqui para a frente ela é gravada de verdade, na hora da conclusão.
      dataConclusao:
        resto.status === STATUS.CONCLUIDO
          ? resto.dataConclusao || resto.criadaEm || new Date().toISOString()
          : null,
    });
  });

  return { disciplinasNovas, conteudosNovos, atividades };
}

/**
 * Passo 0 -> 1: converte as tarefas antigas. Grava a versão 1 ao terminar.
 */
function migrarParaV1() {
  const grupos = lerColecao(CHAVES.grupos);
  const membros = lerColecao(CHAVES.membros);
  const disciplinas = lerColecao(CHAVES.disciplinas);
  const conteudos = lerColecao(CHAVES.conteudos);
  const tarefasAntigas = lerColecao(CHAVE_LEGADA_TAREFAS);

  // Não há tarefa no formato antigo: não existe nada para converter.
  // Dois casos caem aqui: instalação nova, e dados que JÁ foram migrados mas
  // perderam o marcador de versão (limpeza parcial do armazenamento, outro
  // perfil do navegador, falha silenciosa na gravação da versão).
  // Nos dois, seguir adiante gravaria `atividades` com a lista vazia montada
  // abaixo e apagaria tudo o que a pessoa tem.
  if (tarefasAntigas.length === 0) {
    salvarVersaoDados(1);
    return { migrou: false, motivo: 'sem-tarefas-antigas' };
  }

  const disciplinasFinais = [...disciplinas];
  const conteudosFinais = [...conteudos];
  const atividadesFinais = [];

  // Segunda linha de defesa: a migração ACRESCENTA ao que já existe, em vez
  // de gravar por cima. Mesmo que uma guarda falhe um dia, o pior caso passa
  // a ser dado duplicado (que se vê e se conserta), e não dado apagado.
  const atividadesExistentes = lerColecao(CHAVES.atividades);

  grupos.forEach((grupo) => {
    const tarefasDoGrupo = tarefasAntigas.filter((t) => t.grupoId === grupo.id);
    if (tarefasDoGrupo.length === 0) return;

    const resultado = migrarGrupo({
      grupo,
      tarefas: tarefasDoGrupo,
      disciplinas: disciplinasFinais,
      conteudos: conteudosFinais,
    });

    disciplinasFinais.push(...resultado.disciplinasNovas);
    conteudosFinais.push(...resultado.conteudosNovos);
    atividadesFinais.push(...resultado.atividades);
  });

  // RN07: o primeiro membro cadastrado no grupo vira organizador; os demais,
  // participantes. Quem já tem perfil gravado fica como está.
  const membrosFinais = membros.map((membro) => {
    if (membro.perfil) return membro;
    const primeiro = membros.find((m) => m.grupoId === membro.grupoId);
    return {
      ...membro,
      perfil: primeiro?.id === membro.id ? PERFIL.ORGANIZADOR : PERFIL.PARTICIPANTE,
    };
  });

  salvarColecao(CHAVES.membros, membrosFinais);
  salvarColecao(CHAVES.disciplinas, disciplinasFinais);
  salvarColecao(CHAVES.conteudos, conteudosFinais);
  // Junta por id: a atividade carrega o id da tarefa que a originou, então
  // reconverter a mesma tarefa duas vezes produziria duas linhas com o mesmo
  // id, e id repetido quebra chave de lista e faz `find` devolver só a
  // primeira. Indexar por id mantém a proteção do acréscimo e ainda deixa a
  // migração idempotente.
  const porId = new Map(
    [...atividadesExistentes, ...atividadesFinais].map((a) => [a.id, a])
  );
  salvarColecao(CHAVES.atividades, [...porId.values()]);

  // Tarefa antiga cujo grupo não existe mais. O `removerGrupo` antigo fazia
  // cascata, então órfã não deveria existir. Mas, se existir, ela não tem
  // onde morar no modelo novo, que exige a cadeia até o grupo.
  //
  // Em vez de sumir em silêncio, ela fica: a chave antiga só é apagada
  // quando tudo foi convertido. O que não coube continua no disco, e o
  // retorno diz quantas são.
  const orfas = tarefasAntigas.filter((t) => !grupos.some((g) => g.id === t.grupoId));

  if (orfas.length === 0) {
    // A chave antiga sai só depois de a nova estar gravada.
    removerChave(CHAVE_LEGADA_TAREFAS);
  }

  salvarVersaoDados(1);

  return {
    migrou: true,
    atividades: atividadesFinais.length,
    disciplinasCriadas: disciplinasFinais.length - disciplinas.length,
    conteudosCriados: conteudosFinais.length - conteudos.length,
    orfas: orfas.length,
  };
}

/**
 * Passo 1 -> 2.
 *
 * RN06 (revisada): toda atividade tem responsável. As que estavam sem um, ou
 * com um que não existe mais no grupo, passam para o organizador do grupo
 * (o primeiro, se houver mais de um), ou para o primeiro membro. Grupo sem
 * membro nenhum não tem a quem atribuir: a atividade fica como está, e o
 * formulário pede o responsável na próxima edição.
 *
 * Paleta: a cor que não existe na paleta nova vira a equivalente
 * (`CORES_SUBSTITUIDAS`), ou a cor padrão.
 *
 * Só grava a coleção que de fato mudou.
 */
function migrarParaV2() {
  const membros = lerColecao(CHAVES.membros);
  const disciplinas = lerColecao(CHAVES.disciplinas);
  const conteudos = lerColecao(CHAVES.conteudos);
  const atividades = lerColecao(CHAVES.atividades);

  const grupoDaDisciplina = new Map(disciplinas.map((d) => [d.id, d.grupoId]));
  const grupoDoConteudo = new Map(
    conteudos.map((c) => [c.id, grupoDaDisciplina.get(c.disciplinaId)])
  );

  const responsavelPadrao = (grupoId) => {
    const doGrupo = membros.filter((m) => m.grupoId === grupoId);
    return (doGrupo.find((m) => m.perfil === PERFIL.ORGANIZADOR) || doGrupo[0])?.id || '';
  };

  let responsaveisDefinidos = 0;
  const atividadesFinais = atividades.map((a) => {
    const grupoId = grupoDoConteudo.get(a.conteudoId);
    const valido = membros.some((m) => m.id === a.responsavelId && m.grupoId === grupoId);
    if (valido) return a;
    const novo = responsavelPadrao(grupoId);
    if (!novo) return a;
    responsaveisDefinidos += 1;
    return { ...a, responsavelId: novo };
  });

  let coresAjustadas = 0;
  const disciplinasFinais = disciplinas.map((d) => {
    if (corDisciplinaValida(d.cor)) return d;
    coresAjustadas += 1;
    return { ...d, cor: CORES_SUBSTITUIDAS[d.cor] ?? COR_DISCIPLINA_PADRAO };
  });

  if (responsaveisDefinidos > 0) salvarColecao(CHAVES.atividades, atividadesFinais);
  if (coresAjustadas > 0) salvarColecao(CHAVES.disciplinas, disciplinasFinais);

  return { responsaveisDefinidos, coresAjustadas };
}

/**
 * Passo 2 -> 3.
 *
 * - A atividade ganha `disciplinaId`, tirado do conteúdo dela. Daqui para a
 *   frente o conteúdo é opcional e a disciplina vem da própria atividade.
 * - O conteúdo "Geral" que a versão 1 criou só para não deixar atividade
 *   solta deixa de ser necessário: as atividades dele ficam direto na
 *   disciplina e ele sai. Um "Geral" criado pela pessoa (outra descrição,
 *   ou renomeado) fica.
 * - Membro com um dos estilos de avatar que saíram passa para o padrão.
 */
function migrarParaV3() {
  const membros = lerColecao(CHAVES.membros);
  const conteudos = lerColecao(CHAVES.conteudos);
  const atividades = lerColecao(CHAVES.atividades);

  const disciplinaDoConteudo = new Map(conteudos.map((c) => [c.id, c.disciplinaId]));
  const automaticos = new Set(
    conteudos
      .filter((c) => c.nome === CONTEUDO_PADRAO && c.descricao === DESCRICAO_CONTEUDO_PADRAO)
      .map((c) => c.id)
  );

  let atividadesAjustadas = 0;
  const atividadesFinais = atividades.map((a) => {
    const disciplinaId = a.disciplinaId || disciplinaDoConteudo.get(a.conteudoId) || '';
    const conteudoId = automaticos.has(a.conteudoId) ? '' : a.conteudoId || '';
    if (disciplinaId === a.disciplinaId && conteudoId === a.conteudoId) return a;
    atividadesAjustadas += 1;
    return { ...a, disciplinaId, conteudoId };
  });

  let avataresAjustados = 0;
  const membrosFinais = membros.map((m) => {
    if (!m.estiloAvatar || estiloAvatarValido(m.estiloAvatar)) return m;
    avataresAjustados += 1;
    return { ...m, estiloAvatar: ESTILO_AVATAR_PADRAO };
  });

  if (atividadesAjustadas > 0) salvarColecao(CHAVES.atividades, atividadesFinais);
  if (automaticos.size > 0) salvarColecao(CHAVES.conteudos, conteudos.filter((c) => !automaticos.has(c.id)));
  if (avataresAjustados > 0) salvarColecao(CHAVES.membros, membrosFinais);

  return { atividadesAjustadas, conteudosGeraisRemovidos: automaticos.size, avataresAjustados };
}

/**
 * Passo 3 -> 4.
 *
 * - A atividade ganha `grupoId`, o grupo da disciplina dela.
 * - O membro escolhido em "Quem é você?" na sessão aberta fica marcado como
 *   a pessoa da demonstração. Nos outros grupos, ela escolhe de novo ao
 *   entrar, e a escolha também fica marcada.
 */
function migrarParaV4() {
  const disciplinas = lerColecao(CHAVES.disciplinas);
  const grupoDaDisciplina = new Map(disciplinas.map((d) => [d.id, d.grupoId]));
  const atividades = lerColecao(CHAVES.atividades);

  let atividadesAjustadas = 0;
  const atividadesFinais = atividades.map((a) => {
    const grupoId = grupoDaDisciplina.get(a.disciplinaId);
    if (a.grupoId || !grupoId) return a;
    atividadesAjustadas += 1;
    return { ...a, grupoId };
  });

  const sessao = lerSessao(CHAVES.sessao);
  const membros = lerColecao(CHAVES.membros);
  let membroMarcado = false;
  const membrosFinais = membros.map((m) => {
    if (!sessao?.membroId || m.id !== sessao.membroId || m.usuarioId) return m;
    membroMarcado = true;
    return { ...m, usuarioId: USUARIO_DEMO };
  });

  if (atividadesAjustadas > 0) salvarColecao(CHAVES.atividades, atividadesFinais);
  if (membroMarcado) salvarColecao(CHAVES.membros, membrosFinais);
  return { atividadesAjustadas, membroMarcado };
}

/**
 * Executa os passos que ainda não rodaram. Chamada uma vez, antes de a
 * aplicação montar. Devolve um resumo do que mudou (útil em teste e no log):
 * os campos do passo 1 no topo e o resumo do passo 2 em `v2`.
 */
export function migrarDados() {
  const versao = lerVersaoDados();
  if (versao >= VERSAO_DADOS) {
    return { migrou: false, motivo: 'ja-migrado' };
  }

  const resultado = versao < 1 ? migrarParaV1() : { migrou: false, motivo: 'ja-migrado' };
  const v2 = versao < 2 ? migrarParaV2() : null;
  const v3 = versao < 3 ? migrarParaV3() : null;
  const v4 = migrarParaV4();
  salvarVersaoDados(VERSAO_DADOS);

  return { ...resultado, v2, v3, v4 };
}

// Validações dos formulários escritas em JavaScript puro.
// Cada função recebe os dados e devolve um objeto de erros { campo: mensagem }.
// Um objeto vazio significa "tudo certo".

import { corDisciplinaValida, PERFIL, PESO, STATUS, tipoEventoValido } from './constants.js';
import { dataValida } from './datas.js';

export function validarAtividade(dados, { membros = [], conteudos = [], disciplinas = [] } = {}) {
  const erros = {};

  const titulo = (dados.titulo || '').trim();
  if (!titulo) {
    erros.titulo = 'Informe um título para a atividade.';
  } else if (titulo.length < 3) {
    erros.titulo = 'O título precisa ter pelo menos 3 caracteres.';
  }

  if (!dados.prazo) {
    erros.prazo = 'Defina um prazo de entrega.';
  } else if (!dataValida(dados.prazo)) {
    erros.prazo = 'O prazo informado não é uma data válida.';
  }

  // RN06: toda atividade tem um responsável (revisão de 28/10/2026, a
  // pedido da professora). É ele quem recebe a experiência na conclusão
  // (RN10).
  //
  // RN03: e ele tem de ser membro do grupo da atividade.
  if (!dados.responsavelId) {
    erros.responsavelId = 'Escolha o responsável pela atividade.';
  } else if (membros.length > 0 && !membros.some((m) => m.id === dados.responsavelId)) {
    erros.responsavelId = 'O responsável escolhido não pertence ao grupo.';
  }

  // RN13 (revisada em 06/11/2026): a atividade pertence a uma disciplina do
  // grupo. O conteúdo é opcional; se vier, tem de ser daquela disciplina.
  if (!dados.disciplinaId) {
    erros.disciplinaId = 'Escolha a disciplina da atividade.';
  } else if (disciplinas.length > 0 && !disciplinas.some((d) => d.id === dados.disciplinaId)) {
    erros.disciplinaId = 'A disciplina escolhida não pertence a este grupo.';
  }

  if (dados.conteudoId) {
    const conteudo = conteudos.find((c) => c.id === dados.conteudoId);
    if (conteudos.length > 0 && !conteudo) {
      erros.conteudoId = 'O conteúdo escolhido não pertence a este grupo.';
    } else if (conteudo && dados.disciplinaId && conteudo.disciplinaId !== dados.disciplinaId) {
      erros.conteudoId = 'Esse conteúdo é de outra disciplina.';
    }
  }

  // RN09: peso é inteiro de 1 a 5. Campo opcional no formulário: em branco
  // vira 1, mas valor fora da faixa é erro, não arredondamento silencioso.
  if (dados.peso !== undefined && dados.peso !== null && dados.peso !== '') {
    const peso = Number(dados.peso);
    if (!Number.isInteger(peso) || peso < PESO.MINIMO || peso > PESO.MAXIMO) {
      erros.peso = `O peso vai de ${PESO.MINIMO} a ${PESO.MAXIMO}.`;
    }
  }

  const statusValidos = [STATUS.A_FAZER, STATUS.FAZENDO, STATUS.CONCLUIDO];
  if (dados.status && !statusValidos.includes(dados.status)) {
    erros.status = 'Status inválido.';
  }

  return erros;
}

// `membros` são os do grupo; `ignorarId` é o próprio membro em edição.
export function validarMembro(dados, { membros = [], ignorarId = null } = {}) {
  const erros = {};

  const nome = (dados.nome || '').trim();
  if (!nome) {
    erros.nome = 'O nome do membro é obrigatório.';
  } else if (nome.length > 80) {
    erros.nome = 'O nome pode ter no máximo 80 caracteres.';
  }

  const email = (dados.email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.email = 'E-mail inválido.';
  }

  // RN07: o grupo não pode ficar sem organizador. Sem ele ninguém mais
  // gerencia membros, disciplinas nem conteúdos, e o grupo trava.
  if (ignorarId && dados.perfil && dados.perfil !== PERFIL.ORGANIZADOR) {
    if (ultimoOrganizador(ignorarId, membros)) {
      erros.perfil = 'O grupo precisa de pelo menos um organizador.';
    }
  }

  // RN07: o primeiro membro de um grupo vazio é o organizador (defeito D01:
  // cadastrá-lo como participante deixava o grupo sem ninguém para gerenciar).
  const grupoVazio = membros.filter((m) => m.id !== ignorarId).length === 0;
  if (!ignorarId && grupoVazio && dados.perfil && dados.perfil !== PERFIL.ORGANIZADOR) {
    erros.perfil = 'O primeiro membro do grupo precisa ser o organizador.';
  }

  return erros;
}

/** RN07: mexer neste membro deixaria o grupo sem organizador? */
export function ultimoOrganizador(membroId, membros = []) {
  const organizadores = membros.filter((m) => m.perfil === PERFIL.ORGANIZADOR);
  return organizadores.length === 1 && organizadores[0].id === membroId;
}

// RN01 + modelo lógico: uma disciplina pertence a um grupo e o par
// (grupo, nome) é único. A comparação ignora maiúsculas/minúsculas porque a
// unique key do MySQL também ignora: "TCC" e "tcc" seriam a mesma linha lá.
// `disciplinas` já deve vir filtrada pelo grupo; `ignorarId` é a própria
// disciplina quando se está editando.
export function validarDisciplina(dados, { disciplinas = [], ignorarId = null } = {}) {
  const erros = {};

  const nome = (dados.nome || '').trim();
  if (!nome) {
    erros.nome = 'Informe o nome da disciplina.';
  } else if (nome.length < 2) {
    erros.nome = 'O nome precisa ter pelo menos 2 caracteres.';
  } else {
    const repetida = disciplinas.some(
      (d) => d.id !== ignorarId && (d.nome || '').trim().toLowerCase() === nome.toLowerCase()
    );
    if (repetida) {
      erros.nome = 'Este grupo já tem uma disciplina com esse nome.';
    }
  }

  if (dados.cor && !corDisciplinaValida(dados.cor)) {
    erros.cor = 'Escolha uma das cores disponíveis.';
  }

  return erros;
}

// RN13: o conteúdo pertence a exatamente uma disciplina, e o par
// (disciplina, nome) é único, como a unique key do modelo lógico. A
// comparação de nome ignora maiúsculas/minúsculas pelo mesmo motivo da
// disciplina: é assim que o MySQL vai comparar.
// `conteudos` já deve vir filtrada pela disciplina; `ignorarId` é o próprio
// conteúdo quando se está editando.
export function validarConteudo(dados, { conteudos = [], ignorarId = null } = {}) {
  const erros = {};

  const nome = (dados.nome || '').trim();
  if (!nome) {
    erros.nome = 'Informe o nome do conteúdo.';
  } else if (nome.length < 2) {
    erros.nome = 'O nome precisa ter pelo menos 2 caracteres.';
  } else {
    const repetido = conteudos.some(
      (c) => c.id !== ignorarId && (c.nome || '').trim().toLowerCase() === nome.toLowerCase()
    );
    if (repetido) {
      erros.nome = 'Esta disciplina já tem um conteúdo com esse nome.';
    }
  }

  if (!dados.disciplinaId) {
    erros.disciplinaId = 'O conteúdo precisa pertencer a uma disciplina.';
  }

  return erros;
}

// RF01: criar o grupo pede também o nome de quem cria: essa pessoa é o
// primeiro membro e o organizador (RN07). Assim o grupo nunca nasce sem
// ninguém para gerenciá-lo.
export function validarGrupo(dados, { exigirCriador = true } = {}) {
  const erros = {};
  if (!dados.nome || !dados.nome.trim()) {
    erros.nome = 'Dê um nome ao grupo.';
  }
  if (exigirCriador && (!dados.criador || !dados.criador.trim())) {
    erros.criador = 'Informe o seu nome.';
  }
  return erros;
}

// Atalho para checar se um objeto de erros está vazio.
export function semErros(erros) {
  return Object.keys(erros).length === 0;
}

// RF31: evento do grupo: título, tipo e dia são obrigatórios; horário é
// opcional (sem horário, vale o dia todo), mas se tiver fim, ele vem depois
// do início.
export function validarEvento(dados, { disciplinas = [] } = {}) {
  const erros = {};

  const titulo = (dados.titulo || '').trim();
  if (!titulo) {
    erros.titulo = 'Dê um nome ao evento.';
  } else if (titulo.length < 3) {
    erros.titulo = 'O nome precisa ter pelo menos 3 caracteres.';
  } else if (titulo.length > 80) {
    erros.titulo = 'O nome pode ter no máximo 80 caracteres.';
  }

  if (!tipoEventoValido(dados.tipo)) {
    erros.tipo = 'Escolha o tipo do evento.';
  }

  if (!dados.data) {
    erros.data = 'Escolha o dia do evento.';
  } else if (!dataValida(dados.data)) {
    erros.data = 'O dia informado não é uma data válida.';
  }

  const hora = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (dados.horaInicio && !hora.test(dados.horaInicio)) {
    erros.horaInicio = 'Horário inválido.';
  }
  if (dados.horaFim) {
    if (!dados.horaInicio) {
      erros.horaFim = 'Informe o início antes do fim.';
    } else if (!hora.test(dados.horaFim)) {
      erros.horaFim = 'Horário inválido.';
    } else if (dados.horaFim <= dados.horaInicio) {
      erros.horaFim = 'O fim precisa ser depois do início.';
    }
  }

  if (dados.disciplinaId && disciplinas.length > 0 && !disciplinas.some((d) => d.id === dados.disciplinaId)) {
    erros.disciplinaId = 'A disciplina escolhida não pertence a este grupo.';
  }

  if ((dados.local || '').trim().length > 80) {
    erros.local = 'O local pode ter no máximo 80 caracteres.';
  }

  return erros;
}

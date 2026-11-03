// Dados de exemplo, usados pelo botão "Carregar dados de exemplo" na tela de
// acesso. Servem para conhecer o sistema sem cadastrar tudo do zero.
// Os prazos e as conclusões são relativos a hoje, para o calendário, a
// ofensiva e o painel sempre parecerem realistas.

import { novoId } from './storage.js';
import { paraISO } from './datas.js';
import { novaSeedAvatar } from './avatar.js';
import { PERFIL, PRIORIDADE, STATUS } from './constants.js';

function emDias(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return paraISO(d);
}

// Instante completo, para os campos que guardam data e hora (`dataConclusao`).
// Fixado no meio da tarde, para o dia local nunca escorregar pelo fuso.
function emISO(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(15, 0, 0, 0);
  return d.toISOString();
}

export function gerarDadosExemplo() {
  const agora = new Date().toISOString();
  const grupoId = novoId();

  const grupo = {
    id: grupoId,
    nome: 'Trio do TCC',
    descricao: 'Grupo de exemplo para você conhecer o sistema.',
    foto: '',
    criadoEm: agora,
  };

  // RN07 — quem cria o grupo é o organizador; os demais, participantes.
  const ana = { id: novoId(), nome: 'Ana Souza', grupoId, funcao: 'Introdução e revisão', email: 'ana@exemplo.com', avatar: novaSeedAvatar(), estiloAvatar: 'adventurer', foto: '', perfil: PERFIL.ORGANIZADOR };
  const bruno = { id: novoId(), nome: 'Bruno Lima', grupoId, funcao: 'Desenvolvimento', email: '', avatar: novaSeedAvatar(), estiloAvatar: 'pixel-art', foto: '', perfil: PERFIL.PARTICIPANTE };
  const carla = { id: novoId(), nome: 'Carla Dias', grupoId, funcao: 'Slides e apresentação', email: 'carla@exemplo.com', avatar: novaSeedAvatar(), estiloAvatar: 'big-smile', foto: '', perfil: PERFIL.PARTICIPANTE };
  const membros = [ana, bruno, carla];

  const disciplinas = [
    { nome: 'TCC', cor: '#f59e0b' },
    { nome: 'Front-End', cor: '#14b8a6' },
    { nome: 'Banco de Dados', cor: '#3b82f6' },
    { nome: 'Metodologia', cor: '#ec4899' },
    { nome: 'Estatística', cor: '#f97316' },
  ].map(({ nome, cor }) => ({ id: novoId(), nome, cor, grupoId, criadaEm: agora }));

  const [tcc, frontEnd, banco, metodologia, estatistica] = disciplinas;

  // Conteúdos: a divisão de cada disciplina em assuntos. A `ordem` é a
  // sequência dentro da disciplina, contada do zero.
  const conteudos = [
    { disciplina: tcc, nome: 'Introdução', descricao: 'Contexto, problema e objetivos.' },
    { disciplina: tcc, nome: 'Referencial teórico', descricao: '' },
    { disciplina: tcc, nome: 'Apresentação', descricao: 'Slides e defesa.' },
    { disciplina: frontEnd, nome: 'Prototipação', descricao: 'Wireframes e telas.' },
    { disciplina: frontEnd, nome: 'Componentes', descricao: '' },
    { disciplina: banco, nome: 'Modelagem', descricao: 'Diagrama ER e normalização.' },
    { disciplina: banco, nome: 'SQL', descricao: 'Consultas e criação de tabelas.' },
    { disciplina: metodologia, nome: 'Normas ABNT', descricao: 'Formatação e citações.' },
    { disciplina: estatistica, nome: 'Probabilidade', descricao: '' },
  ].reduce((lista, { disciplina, nome, descricao }) => {
    const ordem = lista.filter((c) => c.disciplinaId === disciplina.id).length;
    return [...lista, { id: novoId(), nome, descricao, disciplinaId: disciplina.id, ordem }];
  }, []);

  const [introducao, referencial, apresentacao, prototipacao, componentes, modelagem, sql, normasAbnt, probabilidade] =
    conteudos;

  // Cada atividade pertence a um conteúdo (RN13), tem responsável (RN06) e um
  // peso de 1 a 5 (RN09). Os pesos variam de propósito — é a razão entre eles
  // que o progresso mede.
  const atividade = (dados) => ({
    id: novoId(),
    descricao: '',
    prioridade: '',
    criadaEm: agora,
    dataConclusao: null,
    ...dados,
  });

  const atividades = [
    atividade({ titulo: 'Escrever a introdução do TCC', descricao: 'Contextualizar o problema e apresentar os objetivos do trabalho.', conteudoId: introducao.id, prazo: emDias(-2), peso: 5, status: STATUS.FAZENDO, prioridade: PRIORIDADE.ALTA, responsavelId: ana.id }),
    atividade({ titulo: 'Fichamento do artigo base', descricao: 'Resumo e citações do artigo que sustenta o tema.', conteudoId: referencial.id, prazo: emDias(-4), peso: 2, status: STATUS.CONCLUIDO, prioridade: PRIORIDADE.MEDIA, responsavelId: ana.id, dataConclusao: emISO(-3) }),
    atividade({ titulo: 'Levantar os artigos de referência', descricao: 'Selecionar as fontes que sustentam o referencial.', conteudoId: referencial.id, prazo: emDias(8), peso: 3, status: STATUS.A_FAZER, prioridade: PRIORIDADE.MEDIA, responsavelId: ana.id }),
    atividade({ titulo: 'Preparar os slides da apresentação', conteudoId: apresentacao.id, prazo: emDias(12), peso: 3, status: STATUS.A_FAZER, prioridade: PRIORIDADE.BAIXA, responsavelId: carla.id }),
    atividade({ titulo: 'Montar protótipo das telas', descricao: 'Desenhar os wireframes das telas principais.', conteudoId: prototipacao.id, prazo: emDias(1), peso: 4, status: STATUS.A_FAZER, prioridade: PRIORIDADE.ALTA, responsavelId: bruno.id }),
    atividade({ titulo: 'Configurar o repositório no GitHub', descricao: 'Criar o repositório, escrever o README e fazer o primeiro commit.', conteudoId: componentes.id, prazo: emDias(-5), peso: 1, status: STATUS.CONCLUIDO, prioridade: PRIORIDADE.MEDIA, responsavelId: bruno.id, dataConclusao: emISO(-5) }),
    atividade({ titulo: 'Componentes do formulário', conteudoId: componentes.id, prazo: emDias(4), peso: 3, status: STATUS.FAZENDO, prioridade: PRIORIDADE.MEDIA, responsavelId: bruno.id }),
    atividade({ titulo: 'Modelar o diagrama ER', conteudoId: modelagem.id, prazo: emDias(-1), peso: 3, status: STATUS.CONCLUIDO, prioridade: PRIORIDADE.ALTA, responsavelId: ana.id, dataConclusao: emISO(-1) }),
    atividade({ titulo: 'Normalizar as tabelas até a 3FN', conteudoId: modelagem.id, prazo: emDias(3), peso: 2, status: STATUS.A_FAZER, prioridade: PRIORIDADE.MEDIA, responsavelId: bruno.id }),
    atividade({ titulo: 'Resolver a lista de SELECT', conteudoId: sql.id, prazo: emDias(6), peso: 2, status: STATUS.FAZENDO, responsavelId: carla.id }),
    atividade({ titulo: 'Revisar as referências bibliográficas', descricao: 'Conferir a formatação das referências no padrão ABNT.', conteudoId: normasAbnt.id, prazo: emDias(5), peso: 2, status: STATUS.A_FAZER, prioridade: PRIORIDADE.MEDIA, responsavelId: carla.id }),
    atividade({ titulo: 'Formatar as citações', conteudoId: normasAbnt.id, prazo: emDias(15), peso: 1, status: STATUS.A_FAZER, prioridade: PRIORIDADE.BAIXA, responsavelId: ana.id }),
    atividade({ titulo: 'Lista de probabilidade', conteudoId: probabilidade.id, prazo: emDias(-3), peso: 2, status: STATUS.CONCLUIDO, prioridade: PRIORIDADE.MEDIA, responsavelId: ana.id, dataConclusao: emISO(-2) }),
    atividade({ titulo: 'Exercícios de variância', conteudoId: probabilidade.id, prazo: emDias(10), peso: 1, status: STATUS.A_FAZER, responsavelId: bruno.id }),
  ];

  return { grupo, membros, disciplinas, conteudos, atividades };
}

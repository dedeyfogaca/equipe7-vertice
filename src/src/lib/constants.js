// Valores fixos do domínio, centralizados para não repetir strings soltas pelo código.

// Status possíveis de uma atividade (os valores guardados batem com o modelo de dados).
export const STATUS = {
  A_FAZER: 'a fazer',
  FAZENDO: 'fazendo',
  CONCLUIDO: 'concluido',
};

export const STATUS_OPCOES = [
  { valor: STATUS.A_FAZER, rotulo: 'A fazer' },
  { valor: STATUS.FAZENDO, rotulo: 'Fazendo' },
  { valor: STATUS.CONCLUIDO, rotulo: 'Concluído' },
];

export function rotuloStatus(valor) {
  return STATUS_OPCOES.find((o) => o.valor === valor)?.rotulo ?? valor;
}

// Prioridade é opcional no modelo, mas deixamos pronta a escala.
export const PRIORIDADE = {
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
};

export const PRIORIDADE_OPCOES = [
  { valor: PRIORIDADE.BAIXA, rotulo: 'Baixa' },
  { valor: PRIORIDADE.MEDIA, rotulo: 'Média' },
  { valor: PRIORIDADE.ALTA, rotulo: 'Alta' },
];

export function rotuloPrioridade(valor) {
  return PRIORIDADE_OPCOES.find((o) => o.valor === valor)?.rotulo ?? valor;
}

// Paleta das disciplinas (`disciplina.cor`). São 18 cores escolhidas para
// continuar legíveis nos dois temas, como barra, ponto e etiqueta do
// calendário. A pessoa escolhe da paleta, e não de um seletor livre: assim
// nenhuma disciplina nasce com uma cor que some no fundo.
//
// O violeta da gamificação (#7c3aed / #a78bfa) NÃO entra aqui: aquela cor é
// exclusiva de experiência, ofensiva e conquistas.
export const CORES_DISCIPLINA = [
  { valor: '#3b82f6', rotulo: 'Azul' },
  { valor: '#0ea5e9', rotulo: 'Céu' },
  { valor: '#06b6d4', rotulo: 'Ciano' },
  { valor: '#14b8a6', rotulo: 'Turquesa' },
  { valor: '#10b981', rotulo: 'Esmeralda' },
  { valor: '#22c55e', rotulo: 'Verde' },
  { valor: '#84cc16', rotulo: 'Lima' },
  { valor: '#eab308', rotulo: 'Amarelo' },
  { valor: '#f59e0b', rotulo: 'Âmbar' },
  { valor: '#f97316', rotulo: 'Laranja' },
  { valor: '#ef4444', rotulo: 'Vermelho' },
  { valor: '#fb7185', rotulo: 'Coral' },
  { valor: '#ec4899', rotulo: 'Rosa' },
  { valor: '#d946ef', rotulo: 'Fúcsia' },
  { valor: '#a855f7', rotulo: 'Roxo' },
  { valor: '#6366f1', rotulo: 'Índigo' },
  { valor: '#64748b', rotulo: 'Ardósia' },
  { valor: '#a8a29e', rotulo: 'Pedra' },
];

// Cores da paleta anterior (8 cores) que não existem na nova. A migração
// troca pela equivalente.
export const CORES_SUBSTITUIDAS = {
  '#78716c': '#a8a29e',
};

export const COR_DISCIPLINA_PADRAO = CORES_DISCIPLINA[0].valor;

export function corDisciplinaValida(valor) {
  return CORES_DISCIPLINA.some((c) => c.valor === valor);
}

export function rotuloCor(valor) {
  return CORES_DISCIPLINA.find((c) => c.valor === valor)?.rotulo ?? 'Cor';
}

// Sugere uma cor ainda não usada pelo grupo, para duas disciplinas novas não
// nascerem iguais. A ordem alterna famílias de cor (azul, laranja,
// turquesa...), para disciplinas cadastradas em sequência não ficarem todas
// azuladas. Se todas já estiverem em uso, volta para a primeira.
const ORDEM_SUGESTAO = [
  '#3b82f6', '#f97316', '#14b8a6', '#ec4899', '#eab308', '#a855f7',
  '#22c55e', '#ef4444', '#06b6d4', '#d946ef', '#84cc16', '#6366f1',
  '#f59e0b', '#0ea5e9', '#fb7185', '#10b981', '#64748b', '#a8a29e',
];

export function sugerirCorDisciplina(coresEmUso = []) {
  return ORDEM_SUGESTAO.find((c) => !coresEmUso.includes(c)) ?? ORDEM_SUGESTAO[0];
}

// RN07 — perfis dentro do grupo. Só o organizador gerencia membros,
// disciplinas e conteúdos e exclui o grupo; o participante cadastra e edita
// atividades.
export const PERFIL = {
  ORGANIZADOR: 'organizador',
  PARTICIPANTE: 'participante',
};

export const PERFIL_OPCOES = [
  { valor: PERFIL.ORGANIZADOR, rotulo: 'Organizador' },
  { valor: PERFIL.PARTICIPANTE, rotulo: 'Participante' },
];

export function rotuloPerfil(valor) {
  return PERFIL_OPCOES.find((o) => o.valor === valor)?.rotulo ?? valor;
}

// RN09 — o peso da atividade é um inteiro de 1 a 5. Sem peso definido, vale 1.
// É a razão entre pesos que dá o progresso (RN08/RN14): peso não é enfeite,
// é o que faz o Vértice medir avanço em vez de contar itens.
export const PESO = {
  MINIMO: 1,
  MAXIMO: 5,
  PADRAO: 1,
};

// Coage qualquer entrada para um peso válido. A validação que avisa a pessoa
// fica em `validacao.js`; aqui é a última linha de defesa do dado gravado.
export function normalizarPeso(valor) {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero)) return PESO.PADRAO;
  return Math.min(PESO.MAXIMO, Math.max(PESO.MINIMO, numero));
}

import { supabase } from './supabase.js';

// Convite para o grupo (RF28): um código de 8 letras e números, válido por
// 7 dias, que também vai num link (/convite/CODIGO). Sem letras e números
// que se confundem (I, O, 0, 1), para dar para ditar o código em voz alta.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CHAVE_PENDENTE = 'convitePendente';

export function novoCodigo() {
  const sorteio = new Uint32Array(8);
  crypto.getRandomValues(sorteio);
  return Array.from(sorteio, (n) => ALFABETO[n % ALFABETO.length]).join('');
}

export const linkDoConvite = (codigo) => `${window.location.origin}/convite/${codigo}`;

/** Gera um convite novo para o grupo (só o organizador consegue, RN07). */
export async function gerarConvite(grupoId, membroId) {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const codigo = novoCodigo();
    const { error } = await supabase.from('convite').insert({ id_grupo: grupoId, codigo, id_criador: membroId });
    if (!error) return codigo;
    if (!/duplicate key/.test(error.message)) throw error;
  }
  throw new Error('Não foi possível gerar o código agora. Tente de novo.');
}

/** Entra no grupo do convite com a conta logada. Devolve o id do grupo. */
export async function entrarComCodigo(codigo, nome) {
  const { data, error } = await supabase.rpc('entrar_com_codigo', { p_codigo: codigo, p_nome: nome });
  if (error) {
    const msg = /inválido|vencido/.test(error.message)
      ? 'Código de convite inválido ou vencido.'
      : 'Não foi possível usar o convite agora. Tente de novo.';
    throw new Error(msg);
  }
  return data;
}

// O link do convite pode ser aberto por quem ainda não entrou: o código fica
// guardado até a pessoa entrar na conta.
export function guardarConvitePendente(codigo) {
  try {
    sessionStorage.setItem(CHAVE_PENDENTE, codigo);
  } catch {
    /* sem armazenamento, a pessoa digita o código */
  }
}

export function lerConvitePendente() {
  try {
    return sessionStorage.getItem(CHAVE_PENDENTE) || '';
  } catch {
    return '';
  }
}

export function limparConvitePendente() {
  try {
    sessionStorage.removeItem(CHAVE_PENDENTE);
  } catch {
    /* idem */
  }
}

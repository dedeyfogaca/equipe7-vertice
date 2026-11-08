// Fotos no Storage do Supabase (RF24, RF29). O editor de foto entrega a
// imagem como `data:image/jpeg`; com conta, ela sobe para o bucket "fotos",
// numa pasta com o id do grupo, e o banco guarda só o endereço público.
//
// A subida acontece depois de a linha existir no banco: a regra do bucket só
// deixa gravar na pasta de um grupo de que a conta é membro, e um grupo
// recém-criado só tem membro depois da primeira gravação.

export const ehFotoNova = (foto) => typeof foto === 'string' && foto.startsWith('data:');

const COLECOES_COM_FOTO = {
  grupos: { prefixo: 'grupo', grupoDe: (o) => o.id },
  membros: { prefixo: 'membro', grupoDe: (o) => o.grupoId },
};

/**
 * Separa o pacote em duas partes: o que vai já para o banco (com a foto
 * antiga no lugar da nova) e a lista de fotos novas para subir depois.
 */
export function separarFotos(pacote, servidor) {
  const semFotos = { ...pacote };
  const fotos = [];
  Object.entries(COLECOES_COM_FOTO).forEach(([chave, cfg]) => {
    if (!pacote[chave]) return;
    const antes = new Map((servidor[chave] || []).map((o) => [o.id, o.foto || '']));
    semFotos[chave] = pacote[chave].map((o) => {
      if (!ehFotoNova(o.foto)) return o;
      fotos.push({ chave, id: o.id, dataUrl: o.foto, pasta: cfg.grupoDe(o), prefixo: cfg.prefixo });
      return { ...o, foto: antes.get(o.id) ?? '' };
    });
  });
  return { semFotos, fotos };
}

async function paraBlob(dataUrl) {
  const resposta = await fetch(dataUrl);
  return resposta.blob();
}

/** Sobe uma foto e devolve o endereço público dela. */
export async function subirFoto(cliente, { id, dataUrl, pasta, prefixo }) {
  const caminho = `${pasta}/${prefixo}-${id}-${Date.now()}.jpg`;
  const blob = await paraBlob(dataUrl);
  const { error } = await cliente.storage.from('fotos').upload(caminho, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return cliente.storage.from('fotos').getPublicUrl(caminho).data.publicUrl;
}

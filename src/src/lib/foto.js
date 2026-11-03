// Foto de perfil do membro e foto do grupo (RN19).
//
// A pessoa escolhe a imagem e enquadra no editor: arrasta para posicionar e
// usa o zoom. O que fica dentro da moldura é reduzido para 256 × 256 e gravado
// como JPEG. Uma foto de celular tem vários megabytes; o armazenamento do
// navegador tem poucos, e uma única foto sem redução já encheria o espaço do
// grupo inteiro (defeito D02). Reduzida, fica entre 10 e 30 KB.
//
// Quando o sistema passar a ter servidor, a mesma imagem reduzida vai para o
// armazenamento de arquivos, e o membro (ou o grupo) guarda só o endereço dela.

export const FOTO = {
  LADO: 256,
  QUALIDADE: 0.82,
  TAMANHO_MAXIMO_MB: 8,
  TIPOS: ['image/jpeg', 'image/png', 'image/webp'],
  // Quanto o editor deixa aproximar, além do enquadramento inicial.
  ZOOM_MAXIMO: 4,
};

/** Valida o arquivo antes de processar. Devolve a mensagem de erro, ou null. */
export function validarArquivoFoto(arquivo) {
  if (!arquivo) return 'Escolha uma imagem.';
  if (!FOTO.TIPOS.includes(arquivo.type)) {
    return 'Escolha uma imagem JPG, PNG ou WebP.';
  }
  if (arquivo.size > FOTO.TAMANHO_MAXIMO_MB * 1024 * 1024) {
    return `A imagem precisa ter no máximo ${FOTO.TAMANHO_MAXIMO_MB} MB.`;
  }
  return null;
}

/**
 * Abre o arquivo e espera a imagem ficar pronta para desenhar. A decodificação
 * acontece fora da linha principal do navegador (`decode()`), então uma foto
 * grande não congela a tela enquanto carrega.
 *
 * Devolve `{ imagem, url, largura, altura }`. Quem chama libera a `url` com
 * `URL.revokeObjectURL` quando terminar.
 */
export async function abrirFoto(arquivo) {
  const erro = validarArquivoFoto(arquivo);
  if (erro) throw new Error(erro);

  const url = URL.createObjectURL(arquivo);
  const imagem = new Image();
  imagem.decoding = 'async';
  imagem.src = url;
  try {
    await imagem.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error('Não foi possível ler essa imagem.');
  }
  if (!imagem.naturalWidth || !imagem.naturalHeight) {
    URL.revokeObjectURL(url);
    throw new Error('Não foi possível ler essa imagem.');
  }
  return { imagem, url, largura: imagem.naturalWidth, altura: imagem.naturalHeight };
}

/**
 * Enquadramento: dado o zoom e o deslocamento escolhidos no editor, qual
 * quadrado da imagem original fica dentro da moldura.
 *
 * - `moldura`: lado da moldura na tela, em pixels.
 * - `zoom`: 1 é o enquadramento inicial (o lado menor da foto cobre a
 *   moldura); 2 é o dobro disso.
 * - `x`, `y`: quanto o centro da foto foi arrastado em relação ao centro da
 *   moldura, em pixels de tela.
 *
 * Devolve `{ sx, sy, lado }` em pixels da imagem original.
 */
export function recorteDaMoldura({ largura, altura, moldura, zoom, x, y }) {
  const escala = (moldura / Math.min(largura, altura)) * zoom;
  const lado = moldura / escala;
  const centroX = largura / 2 - x / escala;
  const centroY = altura / 2 - y / escala;
  return { sx: centroX - lado / 2, sy: centroY - lado / 2, lado };
}

/**
 * Quanto a foto pode ser arrastada sem deixar canto vazio na moldura. Devolve
 * o deslocamento máximo em cada eixo, em pixels de tela.
 */
export function limitesDoArraste({ largura, altura, moldura, zoom }) {
  const escala = (moldura / Math.min(largura, altura)) * zoom;
  return {
    x: Math.max(0, (largura * escala - moldura) / 2),
    y: Math.max(0, (altura * escala - moldura) / 2),
  };
}

/** Recorta o quadrado escolhido e devolve a foto reduzida como `data:image/jpeg`. */
export function recortarFoto(imagem, { sx, sy, lado }) {
  let origem = imagem;
  let ox = sx;
  let oy = sy;
  let olado = lado;

  // Imagem muito maior que o resultado: reduz em duas etapas, para a foto
  // final não sair serrilhada.
  if (lado > FOTO.LADO * 4) {
    const meio = document.createElement('canvas');
    meio.width = FOTO.LADO * 2;
    meio.height = FOTO.LADO * 2;
    const ctxMeio = meio.getContext('2d');
    ctxMeio.imageSmoothingQuality = 'high';
    ctxMeio.drawImage(imagem, sx, sy, lado, lado, 0, 0, meio.width, meio.height);
    origem = meio;
    ox = 0;
    oy = 0;
    olado = meio.width;
  }

  const canvas = document.createElement('canvas');
  canvas.width = FOTO.LADO;
  canvas.height = FOTO.LADO;
  const ctx = canvas.getContext('2d');
  // Fundo branco: PNG com transparência não vira preto no JPEG.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, FOTO.LADO, FOTO.LADO);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(origem, ox, oy, olado, olado, 0, 0, FOTO.LADO, FOTO.LADO);
  return canvas.toDataURL('image/jpeg', FOTO.QUALIDADE);
}

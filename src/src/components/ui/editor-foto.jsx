import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Camera, LoaderCircle, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

import { Button } from './botao.jsx';
import { Dialogo } from './dialogo.jsx';
import {
  abrirFoto,
  FOTO,
  limitesDoArraste,
  recortarFoto,
  recorteDaMoldura,
  validarArquivoFoto,
} from '../../lib/foto.js';
import { cn } from '../../lib/utils.js';

// Espaço em volta da moldura, onde o resto da foto aparece escurecido.
const MARGEM = 22;

const limitarZoom = (z) => Math.min(FOTO.ZOOM_MAXIMO, Math.max(1, z));
const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Editor de foto (RN19): a pessoa arrasta para posicionar e aproxima com o
 * zoom — pela barra, pela rodinha do mouse, com dois dedos no celular ou pelo
 * teclado. Ao aplicar, o que está dentro da moldura vira a foto de 256 × 256.
 *
 * Leve de propósito: a imagem é decodificada fora da linha principal e o
 * movimento é só um `transform` (desenhado pela placa de vídeo). O recorte
 * acontece uma vez, no "Aplicar".
 *
 * `forma`: 'circulo' (membro) ou 'quadrado' (grupo) — só muda a moldura; a
 * foto gravada é sempre quadrada.
 */
export function EditorFoto({ arquivo, forma = 'circulo', aoCancelar, aoAplicar }) {
  const [foto, setFoto] = useState(null);
  const [erro, setErro] = useState('');
  const [area, setArea] = useState(0);
  const [quadro, setQuadro] = useState({ zoom: 1, x: 0, y: 0 });
  const [aplicando, setAplicando] = useState(false);

  // A área só existe depois que a janela (um portal) monta: o ref de função
  // avisa quando ela aparece, e os efeitos abaixo dependem dela.
  const [areaEl, setAreaEl] = useState(null);
  const areaAnterior = useRef(0);
  const ponteiros = useRef(new Map());
  const gesto = useRef(null);
  const moldura = Math.max(0, area - MARGEM * 2);

  // Os gestos leem o estado mais recente por aqui, sem recriar os ouvintes.
  const atual = useRef({});
  atual.current = { foto, moldura, quadro };

  useEffect(() => {
    let ativo = true;
    let url = null;
    setFoto(null);
    setErro('');
    setQuadro({ zoom: 1, x: 0, y: 0 });
    abrirFoto(arquivo)
      .then((aberta) => {
        url = aberta.url;
        if (ativo) setFoto(aberta);
        else URL.revokeObjectURL(aberta.url);
      })
      .catch((e) => {
        if (ativo) setErro(e.message || 'Não foi possível ler essa imagem.');
      });
    return () => {
      ativo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [arquivo]);

  // Mede a área antes de pintar e acompanha mudanças de tamanho (girar o
  // celular). O deslocamento acompanha a escala da moldura.
  useLayoutEffect(() => {
    const el = areaEl;
    if (!el) return undefined;
    const medir = () => {
      const lado = el.offsetWidth;
      const antes = areaAnterior.current;
      if (lado === antes) return;
      areaAnterior.current = lado;
      if (antes > MARGEM * 2 && lado > MARGEM * 2) {
        const razao = (lado - MARGEM * 2) / (antes - MARGEM * 2);
        setQuadro((q) => ({ ...q, x: q.x * razao, y: q.y * razao }));
      }
      setArea(lado);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [areaEl]);

  const limitar = (q) => {
    const { foto: f, moldura: m } = atual.current;
    if (!f || m <= 0) return q;
    const zoom = limitarZoom(q.zoom);
    const lim = limitesDoArraste({ largura: f.largura, altura: f.altura, moldura: m, zoom });
    return {
      zoom,
      x: Math.max(-lim.x, Math.min(lim.x, q.x)),
      y: Math.max(-lim.y, Math.min(lim.y, q.y)),
    };
  };

  // Zoom em torno do centro da moldura: o ponto da foto que está no meio
  // continua no meio.
  const zoomDe = (q, novo) => {
    const zoom = limitarZoom(novo);
    return limitar({ zoom, x: (q.x * zoom) / q.zoom, y: (q.y * zoom) / q.zoom });
  };
  const aplicarZoom = (novo) => setQuadro((q) => zoomDe(q, novo));

  // Rodinha do mouse. O ouvinte é nativo porque precisa cancelar a rolagem
  // da página (o do React é passivo).
  useEffect(() => {
    const el = areaEl;
    if (!el) return undefined;
    const aoRolar = (evento) => {
      if (!atual.current.foto) return;
      evento.preventDefault();
      setQuadro((q) => zoomDe(q, q.zoom * Math.exp(-evento.deltaY * 0.0015)));
    };
    el.addEventListener('wheel', aoRolar, { passive: false });
    return () => el.removeEventListener('wheel', aoRolar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaEl]);

  const iniciarGesto = () => {
    const pontos = [...ponteiros.current.values()];
    const q = atual.current.quadro;
    if (pontos.length === 1) gesto.current = { tipo: 'arrastar', inicio: pontos[0], quadro: q };
    else if (pontos.length >= 2) gesto.current = { tipo: 'pinca', distancia: distancia(pontos[0], pontos[1]), quadro: q };
    else gesto.current = null;
  };

  const aoApertar = (evento) => {
    if (!foto) return;
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
    ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    iniciarGesto();
  };

  const aoMover = (evento) => {
    if (!ponteiros.current.has(evento.pointerId)) return;
    ponteiros.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    const g = gesto.current;
    const pontos = [...ponteiros.current.values()];
    if (g?.tipo === 'arrastar' && pontos.length === 1) {
      setQuadro(
        limitar({
          ...g.quadro,
          x: g.quadro.x + (pontos[0].x - g.inicio.x),
          y: g.quadro.y + (pontos[0].y - g.inicio.y),
        })
      );
    } else if (g?.tipo === 'pinca' && pontos.length >= 2 && g.distancia > 0) {
      setQuadro(zoomDe(g.quadro, (g.quadro.zoom * distancia(pontos[0], pontos[1])) / g.distancia));
    }
  };

  const aoSoltar = (evento) => {
    ponteiros.current.delete(evento.pointerId);
    iniciarGesto();
  };

  const aoTeclar = (evento) => {
    if (!foto) return;
    const passo = evento.shiftKey ? 24 : 8;
    const movimentos = {
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
    };
    if (evento.key in movimentos) {
      evento.preventDefault();
      const [dx, dy] = movimentos[evento.key];
      setQuadro((q) => limitar({ ...q, x: q.x + dx, y: q.y + dy }));
    } else if (evento.key === '+' || evento.key === '=') {
      evento.preventDefault();
      setQuadro((q) => zoomDe(q, q.zoom + 0.1));
    } else if (evento.key === '-' || evento.key === '_') {
      evento.preventDefault();
      setQuadro((q) => zoomDe(q, q.zoom - 0.1));
    }
  };

  const aplicar = () => {
    if (!foto || moldura <= 0) return;
    setAplicando(true);
    // Um quadro de folga para o botão mostrar que está trabalhando.
    requestAnimationFrame(() => {
      try {
        const recorte = recorteDaMoldura({
          largura: foto.largura,
          altura: foto.altura,
          moldura,
          zoom: quadro.zoom,
          x: quadro.x,
          y: quadro.y,
        });
        aoAplicar(recortarFoto(foto.imagem, recorte));
      } catch {
        setErro('Não foi possível recortar essa imagem.');
        setAplicando(false);
      }
    });
  };

  const base = foto && moldura > 0 ? moldura / Math.min(foto.largura, foto.altura) : 0;

  return (
    <Dialogo
      aberto
      aoMudar={(abrir) => !abrir && aoCancelar()}
      titulo="Ajustar foto"
      descricao="Arraste para posicionar e use o zoom para enquadrar."
      largura={440}
      aoAbrir={(evento) => {
        // Começa pela área da foto: as setas e o + e − já funcionam.
        evento.preventDefault();
        document.querySelector('[data-area-foto]')?.focus();
      }}
      rodape={
        <>
          <Button variante="secundaria" onClick={aoCancelar}>
            Cancelar
          </Button>
          <Button onClick={aplicar} disabled={!foto || aplicando}>
            {aplicando && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            Aplicar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          ref={setAreaEl}
          data-area-foto
          tabIndex={0}
          role="group"
          aria-label="Enquadramento da foto"
          aria-describedby="editor-foto-dica"
          onPointerDown={aoApertar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoSoltar}
          onKeyDown={aoTeclar}
          className={cn(
            'relative mx-auto aspect-square w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl bg-superficie-3 outline-none focus-visible:ring-2 focus-visible:ring-primaria-barra',
            foto && 'cursor-grab active:cursor-grabbing'
          )}
        >
          {foto && base > 0 && (
            <img
              src={foto.url}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none will-change-transform"
              style={{
                width: foto.largura * base,
                height: foto.altura * base,
                transform: `translate(-50%, -50%) translate(${quadro.x}px, ${quadro.y}px) scale(${quadro.zoom})`,
              }}
            />
          )}
          <div
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute shadow-[0_0_0_9999px_rgb(0_0_0/0.55)] ring-2 ring-white/85',
              forma === 'circulo' ? 'rounded-full' : 'rounded-[22%]'
            )}
            style={{ inset: MARGEM }}
          />
          {!foto && !erro && (
            <span className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle className="size-7 animate-spin text-white" aria-label="Carregando a foto" />
            </span>
          )}
          {erro && (
            <p role="alert" className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm font-medium text-white">
              {erro}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variante="fantasma"
            tamanho="icone-sm"
            aria-label="Diminuir o zoom"
            disabled={!foto || quadro.zoom <= 1}
            onClick={() => aplicarZoom(quadro.zoom - 0.25)}
          >
            <ZoomOut />
          </Button>
          <input
            type="range"
            min={1}
            max={FOTO.ZOOM_MAXIMO}
            step={0.01}
            value={quadro.zoom}
            disabled={!foto}
            onChange={(e) => aplicarZoom(Number(e.target.value))}
            aria-label="Zoom"
            aria-valuetext={`${Math.round(quadro.zoom * 100)}%`}
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-primaria-barra disabled:cursor-not-allowed"
          />
          <Button
            variante="fantasma"
            tamanho="icone-sm"
            aria-label="Aumentar o zoom"
            disabled={!foto || quadro.zoom >= FOTO.ZOOM_MAXIMO}
            onClick={() => aplicarZoom(quadro.zoom + 0.25)}
          >
            <ZoomIn />
          </Button>
        </div>
        <p id="editor-foto-dica" className="text-[12px] leading-snug text-sutil">
          No computador, a rodinha do mouse também aproxima; no celular, use dois dedos. Pelo teclado, as setas
          movem a foto e + e − mudam o zoom.
        </p>
      </div>
    </Dialogo>
  );
}

/**
 * Bloco de foto dos formulários: prévia, "Enviar foto" / "Trocar foto",
 * "Remover foto" e o editor, que abre assim que a imagem é escolhida.
 *
 * - `previa`: o avatar que mostra a foto atual (membro ou grupo).
 * - `extra`: botão a mais quando não há foto (ex.: "Sortear avatar").
 */
export function CampoFoto({
  id = 'foto',
  foto,
  aoMudar,
  forma = 'circulo',
  previa,
  rotulo = 'Foto de perfil',
  dica,
  extra,
}) {
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');
  const entrada = useRef(null);

  const escolher = (evento) => {
    const escolhido = evento.target.files?.[0];
    // Limpa o campo para a mesma imagem poder ser escolhida de novo.
    evento.target.value = '';
    if (!escolhido) return;
    const problema = validarArquivoFoto(escolhido);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro('');
    setArquivo(escolhido);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-borda bg-superficie-2 p-4">
      {previa}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[13px] font-semibold tracking-wide text-suave">{rotulo}</span>
        <div className="flex flex-wrap gap-2">
          <Button
            variante="secundaria"
            tamanho="sm"
            onClick={() => entrada.current?.click()}
            aria-describedby={`${id}-dica`}
          >
            <Camera aria-hidden="true" />
            {foto ? 'Trocar foto' : 'Enviar foto'}
          </Button>
          {foto ? (
            <Button
              variante="fantasma"
              tamanho="sm"
              onClick={() => {
                aoMudar('');
                setErro('');
              }}
            >
              <Trash2 aria-hidden="true" />
              Remover foto
            </Button>
          ) : (
            extra
          )}
        </div>
        <p id={`${id}-dica`} className="text-[12px] leading-snug text-sutil">
          {dica ?? `JPG, PNG ou WebP, até ${FOTO.TAMANHO_MAXIMO_MB} MB. Você enquadra a foto antes de salvar.`}
        </p>
        {erro && (
          <p role="alert" className="text-[13px] font-medium text-perigo">
            {erro}
          </p>
        )}
      </div>
      <input
        ref={entrada}
        id={id}
        type="file"
        accept={FOTO.TIPOS.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={escolher}
      />
      {arquivo && (
        <EditorFoto
          arquivo={arquivo}
          forma={forma}
          aoCancelar={() => setArquivo(null)}
          aoAplicar={(nova) => {
            aoMudar(nova);
            setArquivo(null);
          }}
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { ddmm } from '../../lib/formatos.js';

// Linha do progresso da disciplina ao longo dos dias (RF12). Uma série só,
// na cor da disciplina; passar o mouse (ou o dedo) mostra o dia e o valor.
// O progresso muda aos saltos, quando uma atividade é concluída, por isso a
// linha anda em degraus. Para leitores de tela, a mesma série vai numa tabela.

const ALTURA = 180;
const M = { topo: 12, dir: 12, base: 26, esq: 40 };

export function GraficoProgresso({ pontos, cor, nome }) {
  const caixa = useRef(null);
  const [largura, setLargura] = useState(600);
  const [foco, setFoco] = useState(null);

  useEffect(() => {
    const el = caixa.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const obs = new ResizeObserver(([e]) => setLargura(Math.max(260, Math.round(e.contentRect.width))));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const n = pontos.length;
  const larg = largura - M.esq - M.dir;
  const alt = ALTURA - M.topo - M.base;
  const x = (i) => M.esq + (n <= 1 ? larg : (i / (n - 1)) * larg);
  const y = (v) => M.topo + alt - (v / 100) * alt;

  const caminho = useMemo(() => {
    if (n === 0) return '';
    let d = `M${x(0)},${y(pontos[0].percentual)}`;
    for (let i = 1; i < n; i++) d += `H${x(i)}V${y(pontos[i].percentual)}`;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pontos, largura]);

  const area = n ? `${caminho}V${y(0)}H${x(0)}Z` : '';

  const aoMover = (evento) => {
    const r = evento.currentTarget.getBoundingClientRect();
    const px = ((evento.clientX - r.left) / r.width) * largura;
    const i = n <= 1 ? 0 : Math.round(((px - M.esq) / larg) * (n - 1));
    setFoco(Math.min(n - 1, Math.max(0, i)));
  };

  const ponto = foco != null ? pontos[foco] : null;
  const primeiro = pontos[0];
  const ultimo = pontos[n - 1];

  return (
    <div ref={caixa} className="relative w-full">
      <svg
        width={largura}
        height={ALTURA}
        viewBox={`0 0 ${largura} ${ALTURA}`}
        className="block max-w-full touch-pan-y select-none"
        role="img"
        aria-label={`Progresso de ${nome} de ${ddmm(primeiro.data)} a ${ddmm(ultimo.data)}: de ${primeiro.percentual}% para ${ultimo.percentual}%.`}
        onPointerMove={aoMover}
        onPointerDown={aoMover}
        onPointerLeave={() => setFoco(null)}
      >
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={M.esq} x2={largura - M.dir} y1={y(v)} y2={y(v)} className="stroke-divisor" strokeWidth="1" />
            <text x={M.esq - 8} y={y(v)} dy="0.35em" textAnchor="end" className="fill-sutil text-[11px] tabular-nums">
              {v}%
            </text>
          </g>
        ))}
        <path d={area} fill={cor} opacity="0.1" />
        <path d={caminho} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" />
        <text x={M.esq} y={ALTURA - 6} className="fill-sutil text-[11px] tabular-nums">
          {ddmm(primeiro.data)}
        </text>
        {n > 1 && (
          <text x={largura - M.dir} y={ALTURA - 6} textAnchor="end" className="fill-sutil text-[11px] tabular-nums">
            {ddmm(ultimo.data)}
          </text>
        )}
        {ponto && (
          <g pointerEvents="none">
            <line x1={x(foco)} x2={x(foco)} y1={M.topo} y2={y(0)} className="stroke-borda" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(foco)} cy={y(ponto.percentual)} r="5" fill={cor} className="stroke-superficie" strokeWidth="2" />
          </g>
        )}
        <rect x={M.esq} y={M.topo} width={larg} height={alt} fill="transparent" />
      </svg>
      {ponto && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-borda bg-superficie px-2.5 py-1.5 text-[12px] shadow-cartao"
          style={{ left: `${(x(foco) / largura) * 100}%` }}
          aria-hidden="true"
        >
          <span className="text-sutil">{ddmm(ponto.data)}</span>{' '}
          <strong className="font-semibold tabular-nums text-forte">{ponto.percentual}%</strong>
        </div>
      )}
      <table className="sr-only">
        <caption>Progresso de {nome} por dia</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Progresso</th>
          </tr>
        </thead>
        <tbody>
          {pontos.map((p) => (
            <tr key={p.data}>
              <td>{ddmm(p.data)}</td>
              <td>{p.percentual}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

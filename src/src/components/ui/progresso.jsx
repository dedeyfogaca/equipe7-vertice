import { normalizarPeso, PESO } from '../../lib/constants.js';
import { cn } from '../../lib/utils.js';

/**
 * Barra de progresso (RN08/RN14). Sem atividade não há o que medir: o
 * progresso é `null` e a barra diz isso, em vez de mostrar 0% (que seria
 * outra coisa).
 */
export function BarraProgresso({
  progresso,
  cor,
  rotulo,
  marcador = false,
  detalhe = true,
  cabecalho = true,
  tamanho = 'md',
  className,
}) {
  // Quadradinho na cor da disciplina antes do nome, como na legenda do
  // calendário.
  const nome = rotulo && (
    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-texto">
      {marcador && cor && (
        <span aria-hidden="true" className="size-[9px] shrink-0 rounded-[3px]" style={{ background: cor }} />
      )}
      <span className="truncate">{rotulo}</span>
    </span>
  );

  if (!progresso) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {nome}
        <span className="text-[13px] text-sutil">Sem atividades (fica fora do cálculo)</span>
      </div>
    );
  }

  const { percentual, fracao, pesoConcluido, pesoTotal } = progresso;
  const texto = `${pesoConcluido} de ${pesoTotal} pontos de peso`;
  const altura = tamanho === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {cabecalho && (
        <div className="flex items-baseline justify-between gap-3">
          {nome || <span />}
          <span className="numero text-sm font-bold text-forte">{percentual}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentual}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo ? `${rotulo}: ${percentual}%, ${texto}` : `${percentual}%, ${texto}`}
        className={cn('w-full overflow-hidden rounded-full bg-superficie-3', altura)}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', !cor && 'bg-primaria-barra')}
          style={{ width: `${Math.round(fracao * 1000) / 10}%`, ...(cor ? { background: cor } : null) }}
        />
      </div>
      {detalhe && <span className="text-[12px] text-sutil">{texto}</span>}
    </div>
  );
}

const TAM = 24;
const RAIO = 9;
const PERIMETRO = 2 * Math.PI * RAIO;
const SEGMENTO = PERIMETRO / PESO.MAXIMO;
const FOLGA = 1.6;

/**
 * Peso da atividade em anel de cinco segmentos (RN09). `decorativo` quando o
 * anel só ilustra (o ícone de "Maior peso" na ordenação, por exemplo).
 */
export function AnelPeso({ peso, tamanho = 24, className, decorativo = false }) {
  const valor = normalizarPeso(peso);
  return (
    <svg
      viewBox={`0 0 ${TAM} ${TAM}`}
      width={tamanho}
      height={tamanho}
      role={decorativo ? undefined : 'img'}
      aria-hidden={decorativo ? 'true' : undefined}
      aria-label={decorativo ? undefined : `Peso ${valor} de ${PESO.MAXIMO}`}
      className={cn('shrink-0', className)}
    >
      <g transform={`rotate(-90 ${TAM / 2} ${TAM / 2})`}>
        {Array.from({ length: PESO.MAXIMO }, (_, i) => (
          <circle
            key={i}
            cx={TAM / 2}
            cy={TAM / 2}
            r={RAIO}
            fill="none"
            strokeWidth="2.8"
            strokeLinecap="butt"
            strokeDasharray={`${SEGMENTO - FOLGA} ${PERIMETRO - SEGMENTO + FOLGA}`}
            strokeDashoffset={-i * SEGMENTO}
            className={i < valor ? 'stroke-primaria-barra' : 'stroke-superficie-3'}
          />
        ))}
      </g>
      <text
        x={TAM / 2}
        y={TAM / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9.5"
        fontWeight="700"
        className="fill-suave numero"
      >
        {valor}
      </text>
    </svg>
  );
}

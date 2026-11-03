import { cn } from '../../lib/utils.js';

// Marca do Vértice: um triângulo de cantos arredondados apontando para baixo,
// com um anel em cada ponta. Desenhada num quadro de 100 de largura a partir
// da arte original (648 × 569), com o traço mais grosso para continuar
// legível em 24 px. Usa currentColor: a cor vem de quem usa.
//
// O desenho tem simetria de três pontas em torno do centro do triângulo
// (50,2; 30,7), e é em torno desse ponto que ele gira: ao passar o mouse
// sobre um elemento com a classe `marca-giro`, dá uma volta inteira, rápida
// (quem pede menos movimento não vê o giro). Ao abrir um grupo, a marca rola
// pela tela como uma roda — ver `layout/TransicaoGrupo.jsx`.
const CENTRO = '50.18px 30.73px';

export function SimboloVertice({ tamanho = 28, className }) {
  return (
    <svg
      width={tamanho}
      height={Math.round(tamanho * 0.9)}
      viewBox="-2.5 -2.5 105 93"
      fill="none"
      stroke="currentColor"
      overflow="visible"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <g
        className="simbolo-vertice"
        style={{ transformBox: 'view-box', transformOrigin: CENTRO }}
      >
        <path d="M21.33 14.08 L79.03 14.08 L50.18 64.03 Z" strokeWidth="7" strokeLinejoin="round" />
        <circle cx="4.87" cy="4.81" r="4.6" strokeWidth="5" />
        <circle cx="95.13" cy="4.81" r="4.6" strokeWidth="5" />
        <circle cx="50.17" cy="82.84" r="4.6" strokeWidth="5" />
      </g>
    </svg>
  );
}

export function MarcaVertice({ className, tamanho = 28 }) {
  return (
    <span
      className={cn('marca-giro inline-flex items-center gap-2.5 text-lg font-bold tracking-[-0.02em] text-forte', className)}
    >
      <SimboloVertice tamanho={tamanho} className="text-primaria-barra" />
      Vértice
    </span>
  );
}

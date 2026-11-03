import { Link } from 'react-router-dom';
import { Lock, Trophy } from 'lucide-react';

import { useData } from '../../context/DataContext.jsx';
import { Card, Rotulo, TituloCartao } from '../ui/basicos.jsx';
import { CONQUISTAS, obterConquista } from '../../lib/gamificacao.js';
import { DIAS_LONGOS, ddmm } from '../../lib/formatos.js';
import { paraISO } from '../../lib/datas.js';
import { cn, plural } from '../../lib/utils.js';

const INICIAIS_DIA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Selo de uma conquista: cheio quando obtida, tracejado quando ainda não. */
export function SeloConquista({ conquista, obtida }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium',
        obtida
          ? 'border border-gam/35 text-gam-texto'
          : 'border border-dashed border-borda-forte text-apagado'
      )}
    >
      {obtida ? (
        <Trophy className="size-3.5" aria-hidden="true" />
      ) : (
        <Lock className="size-3.5" aria-hidden="true" />
      )}
      {conquista.nome}
      {!obtida && <span className="sr-only">(ainda não conquistada)</span>}
    </span>
  );
}

/** RN10, RN11 e RN12 do membro: experiência, ofensiva e conquistas. */
export function SeuRitmo({ membroId, titulo = 'Seu ritmo' }) {
  const { ofensivaDoMembro, xpDoMembro, ultimosDiasDoMembro, conquistasDoMembro } = useData();
  const ofensiva = ofensivaDoMembro(membroId);
  const xp = xpDoMembro(membroId);
  const dias = ultimosDiasDoMembro(membroId, 7);
  const obtidas = conquistasDoMembro(membroId);
  const codigos = new Set(obtidas.map((c) => c.codigo));
  const ultimas = obtidas
    .slice(0, 2)
    .map((c) => obterConquista(c.codigo))
    .filter(Boolean);
  const proxima = CONQUISTAS.find((c) => !codigos.has(c.codigo));

  return (
    <Card as="section" aria-labelledby="t-ritmo" className="flex flex-col gap-4 p-[22px]">
      <div className="flex items-center justify-between gap-3">
        <TituloCartao id="t-ritmo">{titulo}</TituloCartao>
        <Link to="/conquistas" className="text-sm font-medium text-primaria-texto hover:underline">
          Ver conquistas
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-borda p-3.5">
          <Rotulo>Ofensiva</Rotulo>
          <span className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-forte">
            {plural(ofensiva, 'dia')}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-gam/30 bg-gam/[0.08] p-3.5">
          <Rotulo className="text-gam-texto">Experiência</Rotulo>
          <span className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-gam-texto">
            {xp} XP
          </span>
        </div>
      </div>

      <ol aria-label="Conclusões nos últimos 7 dias" className="grid grid-cols-7 gap-1.5">
        {dias.map((d) => (
          <li key={d.iso} className="flex flex-col items-center gap-1.5">
            <span
              aria-hidden="true"
              className={cn('text-[12px]', d.hoje ? 'font-bold text-forte' : 'text-sutil')}
            >
              {INICIAIS_DIA[d.data.getDay()]}
            </span>
            <span
              aria-hidden="true"
              className={cn('h-2 w-full rounded-full', d.concluiu ? 'bg-gam' : 'bg-superficie-3')}
            />
            <span className="sr-only">
              {DIAS_LONGOS[d.data.getDay()]}, {ddmm(paraISO(d.data))}
              {d.hoje ? ' (hoje)' : ''}: {d.concluiu ? 'com conclusão' : 'sem conclusão'}
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] text-sutil">
          {ultimas.length > 0 ? 'Últimas conquistas' : 'Próxima conquista'}
        </span>
        <div className="flex flex-wrap gap-2">
          {ultimas.map((c) => (
            <SeloConquista key={c.codigo} conquista={c} obtida />
          ))}
          {proxima && <SeloConquista conquista={proxima} obtida={false} />}
        </div>
      </div>
    </Card>
  );
}

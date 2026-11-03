import { SITUACAO } from '../../lib/situacoes.js';
import { cn } from '../../lib/utils.js';

// As quatro situações (RN04, RN05, RN16). Não são contadores: são filtros.
// Clicar numa liga o filtro; clicar de novo desliga. O Painel e a lista de
// Atividades usam a mesma peça, com a mesma contagem.
const SITUACOES = [
  { valor: SITUACAO.A_FAZER, rotulo: 'A fazer', cor: 'text-forte' },
  { valor: SITUACAO.FAZENDO, rotulo: 'Fazendo', cor: 'text-fazendo' },
  { valor: SITUACAO.CONCLUIDAS, rotulo: 'Concluídas', cor: 'text-concluido' },
  { valor: SITUACAO.ATRASADAS, rotulo: 'Atrasadas', cor: 'text-atrasada' },
];

export function CartoesSituacao({ contagem, ativa, aoEscolher, className }) {
  return (
    <div
      role="group"
      aria-label="Filtrar por situação"
      className={cn('grid grid-cols-2 gap-3 md:grid-cols-4', className)}
    >
      {SITUACOES.map(({ valor, rotulo, cor }) => {
        const ligado = ativa === valor;
        return (
          <button
            key={valor}
            type="button"
            aria-pressed={ligado}
            onClick={() => aoEscolher(valor)}
            className={cn(
              'flex flex-col items-start gap-1.5 rounded-[18px] border px-[18px] py-4 text-left transition-[border-color,background-color,box-shadow] duration-150',
              ligado
                ? 'border-primaria-barra bg-primaria-barra/[0.08] ring-[3px] ring-primaria-barra/15'
                : 'border-borda bg-superficie shadow-cartao hover:border-borda-forte'
            )}
          >
            <span className={cn('numero text-[30px] font-semibold leading-none tracking-[-0.03em]', cor)}>
              {contagem[valor] ?? 0}
            </span>
            <span className="text-[13px] font-medium text-suave">{rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}

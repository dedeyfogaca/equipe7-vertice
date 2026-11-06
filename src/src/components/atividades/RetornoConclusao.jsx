import { ArrowRight, Check } from 'lucide-react';
import { Card } from '../ui/basicos.jsx';
import { BarraProgresso } from '../ui/progresso.jsx';
import { xpDaAtividade } from '../../lib/gamificacao.js';

// RF15: concluir não risca um item. Move a barra do conteúdo (ou da
// disciplina, se a atividade não tem conteúdo) e credita experiência. Sem
// isto a pessoa conclui e não vê nada acontecer.
export function RetornoConclusao({ atividade, conteudo, disciplina, antes, depois }) {
  const xp = xpDaAtividade(atividade);
  const temBarras = Boolean(antes && depois);

  return (
    <Card as="section" aria-label="Retorno da conclusão" className="mb-6 overflow-hidden border-concluido/30">
      <div className="flex flex-wrap items-center gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-concluido-bg text-concluido">
          <Check className="size-5" strokeWidth={2.6} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-forte">Atividade concluída</p>
          <p className="text-[13px] text-sutil">
            {(conteudo || disciplina) && temBarras
              ? `${(conteudo || disciplina).nome} foi de ${antes.percentual}% para ${depois.percentual}%.`
              : 'O progresso foi atualizado.'}
          </p>
        </div>
        {xp > 0 && (
          <span className="numero text-lg font-bold text-gam-texto" aria-label={`Mais ${xp} pontos de experiência`}>
            +{xp} XP
          </span>
        )}
      </div>

      {temBarras && (
        <div className="grid gap-4 border-t border-divisor bg-superficie-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <BarraProgresso progresso={antes} rotulo="Antes" cor={disciplina?.cor} />
          <ArrowRight className="mx-auto hidden size-4 text-sutil sm:block" aria-hidden="true" />
          <BarraProgresso progresso={depois} rotulo="Depois" cor={disciplina?.cor} />
        </div>
      )}
    </Card>
  );
}

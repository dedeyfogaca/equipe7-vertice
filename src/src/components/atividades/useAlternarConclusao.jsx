import { useCallback } from 'react';
import { toast } from 'sonner';
import { useData } from '../../context/DataContext.jsx';
import { usePermissoes } from '../../hooks/usePermissoes.js';
import { STATUS } from '../../lib/constants.js';
import { xpPotencial } from '../../lib/gamificacao.js';

// Concluir direto da lista, com aviso e "Desfazer". Reabrir volta a
// atividade para "a fazer". Só vale para as atividades de quem está usando
// (RN20) — a lista nem mostra o botão nas dos outros, e aqui fica a segunda
// trava.
export function useAlternarConclusao() {
  const { atualizarAtividade } = useData();
  const { podeMudarStatus } = usePermissoes();

  return useCallback(
    (atividade) => {
      if (!podeMudarStatus(atividade)) {
        toast.error('Só o responsável muda o status desta atividade');
        return;
      }

      if (atividade.status === STATUS.CONCLUIDO) {
        atualizarAtividade(atividade.id, { status: STATUS.A_FAZER });
        toast('Atividade reaberta', { description: atividade.titulo });
        return;
      }

      const statusAnterior = atividade.status;
      atualizarAtividade(atividade.id, { status: STATUS.CONCLUIDO });

      toast.success('Atividade concluída', {
        description: `+${xpPotencial(atividade)} XP para você · ${atividade.titulo}`,
        action: {
          label: 'Desfazer',
          onClick: () => atualizarAtividade(atividade.id, { status: statusAnterior }),
        },
      });
    },
    [atualizarAtividade, podeMudarStatus]
  );
}

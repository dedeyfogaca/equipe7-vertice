import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ehResponsavel,
  podeEditarAtividade,
  podeExcluirAtividade,
  podeEditarEvento,
  podeMudarStatus,
} from '../lib/permissoes.js';

// As regras de `permissoes.js` já ligadas à pessoa da sessão.
export function usePermissoes() {
  const { membroAtivo, ehOrganizador } = useAuth();
  const membroId = membroAtivo?.id ?? null;

  return useMemo(() => {
    const quem = { membroId, organizador: ehOrganizador };
    return {
      quem,
      ehResponsavel: (atividade) => ehResponsavel(atividade, quem),
      podeMudarStatus: (atividade) => podeMudarStatus(atividade, quem),
      podeEditar: (atividade) => podeEditarAtividade(atividade, quem),
      podeExcluir: (atividade) => podeExcluirAtividade(atividade, quem),
      podeEditarEvento: (evento) => podeEditarEvento(evento, quem),
    };
  }, [membroId, ehOrganizador]);
}

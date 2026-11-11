import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { PERFIL } from '../lib/constants.js';
import {
  ehResponsavel,
  podeAssumir,
  podeEditarAtividade,
  podeExcluirAtividade,
  podeEditarEvento,
  podeMudarStatus,
} from '../lib/permissoes.js';

// As regras de `permissoes.js` já ligadas à pessoa da sessão.
//
// No espaço pessoal aparecem atividades e eventos de vários grupos (RF34):
// o `quem` de cada item é o membro da pessoa no grupo daquele item. No
// grupo aberto, vale a sessão (que já resolve o grupo ainda vazio).
export function usePermissoes() {
  const { grupoAtivo, membroAtivo, ehOrganizador } = useAuth();
  const { meuMembroEm } = useData();
  const membroId = membroAtivo?.id ?? null;
  const grupoId = grupoAtivo?.id ?? null;

  const quemEm = useCallback(
    (outroGrupoId) => {
      if (!outroGrupoId || outroGrupoId === grupoId) return { membroId, organizador: ehOrganizador };
      const meu = meuMembroEm(outroGrupoId);
      return { membroId: meu?.id ?? null, organizador: meu?.perfil === PERFIL.ORGANIZADOR };
    },
    [grupoId, membroId, ehOrganizador, meuMembroEm]
  );

  return useMemo(() => {
    const quem = { membroId, organizador: ehOrganizador };
    const de = (item) => quemEm(item?.grupoId);
    return {
      quem,
      quemEm,
      ehResponsavel: (atividade) => ehResponsavel(atividade, de(atividade)),
      podeMudarStatus: (atividade) => podeMudarStatus(atividade, de(atividade)),
      podeEditar: (atividade) => podeEditarAtividade(atividade, de(atividade)),
      podeExcluir: (atividade) => podeExcluirAtividade(atividade, de(atividade)),
      podeAssumir: (atividade) => podeAssumir(atividade, de(atividade)),
      podeEditarEvento: (evento) => podeEditarEvento(evento, de(evento)),
    };
  }, [membroId, ehOrganizador, quemEm]);
}

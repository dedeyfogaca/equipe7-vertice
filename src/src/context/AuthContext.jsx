import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { lerSessao, salvarSessao } from '../lib/storage.js';
import { PERFIL } from '../lib/constants.js';
import { useData } from './DataContext.jsx';

// Sessão: o grupo e quem, dentro dele, está usando o sistema.
//
// Continua sem senha: o acesso é seleção, como sempre foi. O membro entrou
// aqui por causa do RN07: "só o organizador exclui o grupo, gerencia membros,
// disciplinas e conteúdos". Sem saber quem é a pessoa, não há o que comparar
// com o perfil, e o campo `perfil` fica sendo enfeite.
//
// Um caso precisa de cuidado: o grupo recém-criado não tem membro nenhum, e
// alguém precisa poder cadastrar o primeiro. Nesse caso quem está lá é
// tratado como organizador. É o mesmo que a migração faz, dando
// `organizador` ao primeiro membro do grupo.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { grupos, membros } = useData();
  const [sessao, setSessao] = useState(() => lerSessao());

  useEffect(() => {
    salvarSessao(sessao);
  }, [sessao]);

  const grupoAtivo = useMemo(
    () => grupos.find((g) => g.id === sessao?.grupoId) || null,
    [grupos, sessao]
  );

  const membrosDoGrupoAtivo = useMemo(
    () => (grupoAtivo ? membros.filter((m) => m.grupoId === grupoAtivo.id) : []),
    [membros, grupoAtivo]
  );

  const membroAtivo = useMemo(
    () => membrosDoGrupoAtivo.find((m) => m.id === sessao?.membroId) || null,
    [membrosDoGrupoAtivo, sessao]
  );

  // Se a sessão aponta para um grupo que foi removido, encerramos o acesso.
  useEffect(() => {
    if (sessao?.grupoId && !grupos.some((g) => g.id === sessao.grupoId)) {
      setSessao(null);
    }
  }, [grupos, sessao]);

  // Se o membro da sessão foi removido, a pessoa volta a se identificar.
  useEffect(() => {
    if (sessao?.membroId && !membros.some((m) => m.id === sessao.membroId)) {
      setSessao((atual) => (atual ? { ...atual, membroId: null } : atual));
    }
  }, [membros, sessao]);

  // Grupo sem membro nenhum: quem está lá está montando o grupo.
  const grupoVazio = Boolean(grupoAtivo) && membrosDoGrupoAtivo.length === 0;

  // O grupo tem gente, mas ainda não sabemos quem é quem está usando.
  const precisaIdentificar = Boolean(grupoAtivo) && !grupoVazio && !membroAtivo;

  // RN07: quem pode gerenciar membros, disciplinas, conteúdos e excluir o
  // grupo. Enquanto o grupo está vazio, quem o criou pode tudo.
  const ehOrganizador = grupoVazio || membroAtivo?.perfil === PERFIL.ORGANIZADOR;

  const entrar = useCallback((grupoId, membroId = null) => {
    setSessao({ grupoId, membroId });
  }, []);

  const identificar = useCallback((membroId) => {
    setSessao((atual) => (atual ? { ...atual, membroId } : atual));
  }, []);

  const sair = useCallback(() => setSessao(null), []);

  const valor = useMemo(
    () => ({
      grupoId: sessao?.grupoId ?? null,
      grupoAtivo,
      membroAtivo,
      membrosDoGrupoAtivo,
      autenticado: Boolean(grupoAtivo),
      precisaIdentificar,
      ehOrganizador,
      entrar,
      identificar,
      sair,
    }),
    [
      sessao,
      grupoAtivo,
      membroAtivo,
      membrosDoGrupoAtivo,
      precisaIdentificar,
      ehOrganizador,
      entrar,
      identificar,
      sair,
    ]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}

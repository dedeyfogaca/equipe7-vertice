import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { lerSessao, salvarSessao } from '../lib/storage.js';
import { PERFIL } from '../lib/constants.js';
import { useData } from './DataContext.jsx';
import { useConta } from './ContaContext.jsx';

// Sessão: o espaço aberto (o pessoal ou um grupo) e quem, dentro dele, está
// usando o sistema.
//
// Desde a revisão de 11/11/2026 a pessoa tem um espaço pessoal (RF34): é
// nele que ela cai ao entrar e é para ele que volta ao sair de um grupo.
// Quem a pessoa é dentro de cada grupo fica marcado no próprio membro
// (`usuarioId`): com conta, é a conta; na demonstração, o usuário "demo".
//
// Na demonstração, um grupo antigo pode ter gente sem ninguém marcado: aí a
// pessoa diz quem é ("Quem é você?"), por causa do RN07: as telas mudam
// conforme o perfil. Um grupo sem membro nenhum (dado antigo) é tratado como
// recém-criado, e quem está lá pode tudo para montá-lo.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { grupos, membros, carregando, espacoPessoal, meuUsuarioId, vincularMembro } = useData();
  const { modo } = useConta();
  const comConta = modo === 'conta';
  // Cada modo guarda a própria sessão, para a demonstração e a conta não se misturarem.
  const chave = comConta ? 'sessaoConta' : 'sessao';
  const [sessao, setSessao] = useState(() => lerSessao(chave));

  useEffect(() => {
    salvarSessao(sessao, chave);
  }, [sessao, chave]);

  // O grupo da sessão; sem grupo escolhido, o espaço pessoal.
  const grupoAtivo = useMemo(
    () => grupos.find((g) => g.id === sessao?.grupoId) || espacoPessoal || null,
    [grupos, sessao, espacoPessoal]
  );
  const noEspacoPessoal = Boolean(grupoAtivo?.pessoal);

  const membrosDoGrupoAtivo = useMemo(
    () => (grupoAtivo ? membros.filter((m) => m.grupoId === grupoAtivo.id) : []),
    [membros, grupoAtivo]
  );

  const membroAtivo = useMemo(
    () => (meuUsuarioId ? membrosDoGrupoAtivo.find((m) => m.usuarioId === meuUsuarioId) : null) || null,
    [membrosDoGrupoAtivo, meuUsuarioId]
  );

  // Se a sessão aponta para um grupo que foi removido (ou de que a conta
  // saiu), volta para o espaço pessoal. Com conta, só depois de os dados chegarem.
  useEffect(() => {
    if (carregando) return;
    if (sessao?.grupoId && !grupos.some((g) => g.id === sessao.grupoId)) {
      setSessao(null);
    }
  }, [grupos, sessao, carregando]);

  // Grupo sem membro nenhum: quem está lá está montando o grupo (só existe
  // no modo de demonstração, com dados antigos).
  const grupoVazio = !comConta && Boolean(grupoAtivo) && membrosDoGrupoAtivo.length === 0;

  // O grupo tem gente, mas ninguém marcado como a pessoa (demonstração).
  const precisaIdentificar = !comConta && Boolean(grupoAtivo) && !grupoVazio && !membroAtivo;

  // Demonstração sem perfil (primeira vez, ou dados de antes da revisão de
  // 11/11): a pessoa diz o nome antes de entrar, e assim ganha o espaço
  // pessoal. Com conta, quem cria os dois é o banco.
  const precisaPerfil = modo === 'demo' && !espacoPessoal;

  // RN07: quem pode gerenciar membros, disciplinas, conteúdos e excluir o
  // grupo. Enquanto o grupo está vazio, quem o criou pode tudo.
  const ehOrganizador = grupoVazio || membroAtivo?.perfil === PERFIL.ORGANIZADOR;

  const entrar = useCallback((grupoId) => {
    setSessao({ grupoId, membroId: null });
  }, []);

  const identificar = useCallback((membroId) => vincularMembro(membroId), [vincularMembro]);

  // Sair do grupo = voltar para o espaço pessoal.
  const sair = useCallback(() => setSessao(null), []);

  const valor = useMemo(
    () => ({
      carregando,
      grupoId: grupoAtivo?.id ?? null,
      grupoAtivo,
      noEspacoPessoal,
      espacoPessoal,
      membroAtivo,
      membrosDoGrupoAtivo,
      autenticado: Boolean(grupoAtivo) && (!comConta || Boolean(membroAtivo)),
      precisaIdentificar,
      precisaPerfil,
      ehOrganizador,
      entrar,
      identificar,
      sair,
    }),
    [
      carregando,
      grupoAtivo,
      noEspacoPessoal,
      espacoPessoal,
      membroAtivo,
      membrosDoGrupoAtivo,
      comConta,
      precisaIdentificar,
      precisaPerfil,
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

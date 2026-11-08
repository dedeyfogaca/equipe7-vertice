import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, temBanco } from '../lib/supabase.js';

// Conta de quem usa o sistema (RF27) e o modo de uso.
//
// Dois modos:
//   * "conta": a pessoa entrou com e-mail e senha ou com o Google, e os dados
//     ficam no banco (Supabase), compartilhados com o grupo;
//   * "demo": sem conta, para conhecer o sistema. Tudo fica só neste
//     navegador, como era antes do banco.
// Sem o banco configurado (projeto rodando sem o .env), só existe o "demo".
const ContaContext = createContext(null);
const CHAVE_MODO = 'modo';

function lerModoDemo() {
  try {
    return localStorage.getItem(CHAVE_MODO) === 'demo';
  } catch {
    return false;
  }
}

export function ContaProvider({ children }) {
  // undefined: ainda conferindo se há sessão; null: sem conta.
  const [sessao, setSessao] = useState(temBanco ? undefined : null);
  const [demo, setDemo] = useState(() => !temBanco || lerModoDemo());

  useEffect(() => {
    if (!temBanco) return undefined;
    supabase.auth.getSession().then(({ data }) => setSessao(data.session ?? null));
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSessao(nova ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const usuario = sessao?.user ?? null;
  const modo = usuario ? 'conta' : demo ? 'demo' : null;

  const usarDemonstracao = useCallback(() => {
    try {
      localStorage.setItem(CHAVE_MODO, 'demo');
    } catch {
      /* sem armazenamento, o modo vale só até recarregar */
    }
    setDemo(true);
  }, []);

  const sairDaDemonstracao = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE_MODO);
    } catch {
      /* idem */
    }
    setDemo(false);
  }, []);

  const entrarComSenha = useCallback(async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) throw traduzirErroDeLogin(error);
  }, []);

  const cadastrar = useCallback(async (nome, email, senha) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    });
    if (error) throw traduzirErroDeLogin(error);
    // Com a confirmação de e-mail ligada no Supabase, a conta só entra depois
    // do clique no link; quem chamou avisa a pessoa.
    return { precisaConfirmar: !data.session };
  }, []);

  const entrarComGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/entrar` },
    });
    if (error) throw traduzirErroDeLogin(error);
  }, []);

  const sairDaConta = useCallback(async () => {
    await supabase.auth.signOut();
    sairDaDemonstracao();
  }, [sairDaDemonstracao]);

  const valor = useMemo(
    () => ({
      temBanco,
      verificando: sessao === undefined,
      usuario,
      nomeDaConta: usuario?.user_metadata?.nome || usuario?.user_metadata?.full_name || usuario?.user_metadata?.name || '',
      modo,
      usarDemonstracao,
      sairDaDemonstracao,
      entrarComSenha,
      cadastrar,
      entrarComGoogle,
      sairDaConta,
    }),
    [sessao, usuario, modo, usarDemonstracao, sairDaDemonstracao, entrarComSenha, cadastrar, entrarComGoogle, sairDaConta]
  );

  return <ContaContext.Provider value={valor}>{children}</ContaContext.Provider>;
}

export function useConta() {
  const ctx = useContext(ContaContext);
  if (!ctx) throw new Error('useConta precisa ser usado dentro de <ContaProvider>.');
  return ctx;
}

// As mensagens do Supabase vêm em inglês.
function traduzirErroDeLogin(erro) {
  const msg = erro?.message || '';
  let texto = 'Não foi possível entrar agora. Tente de novo.';
  if (/Invalid login credentials/i.test(msg)) texto = 'E-mail ou senha incorretos.';
  else if (/already registered|already exists/i.test(msg)) texto = 'Já existe uma conta com esse e-mail. Entre com ela.';
  else if (/Password should be at least/i.test(msg)) texto = 'A senha precisa ter pelo menos 6 caracteres.';
  else if (/valid email|invalid format|Unable to validate email/i.test(msg)) texto = 'E-mail inválido.';
  else if (/Email not confirmed/i.test(msg)) texto = 'Confirme o e-mail pelo link que enviamos antes de entrar.';
  else if (/rate limit|too many/i.test(msg)) texto = 'Muitas tentativas seguidas. Espere um pouco e tente de novo.';
  else if (/provider is not enabled/i.test(msg)) texto = 'O login com Google ainda não está ligado.';
  else if (/Failed to fetch|NetworkError/i.test(msg)) texto = 'Sem conexão com o servidor. Confira a internet.';
  const novo = new Error(texto);
  novo.original = erro;
  return novo;
}

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { useConta } from '../../context/ContaContext.jsx';
import { Button } from '../ui/botao.jsx';
import { Card } from '../ui/basicos.jsx';
import { Field, Input } from '../ui/campos.jsx';
import { cn } from '../../lib/utils.js';

// Login (RF27): e-mail e senha, ou a conta Google. Ao lado, o atalho para
// conhecer o sistema sem conta (modo de demonstração).

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function PainelLogin({ convite }) {
  const { entrarComSenha, cadastrar, entrarComGoogle, usarDemonstracao } = useConta();
  const [aba, setAba] = useState('entrar');
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');

  const campo = (nome) => (e) => {
    setForm((atual) => ({ ...atual, [nome]: e.target.value }));
    setErros((atual) => ({ ...atual, [nome]: undefined, geral: undefined }));
  };

  const validar = () => {
    const e = {};
    if (aba === 'cadastrar' && !form.nome.trim()) e.nome = 'Informe o seu nome.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = 'E-mail inválido.';
    if (form.senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    return e;
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) {
      document.getElementById(e.nome ? 'login-nome' : e.email ? 'login-email' : 'login-senha')?.focus();
      return;
    }
    setEnviando(true);
    try {
      if (aba === 'entrar') {
        await entrarComSenha(form.email, form.senha);
      } else {
        const { precisaConfirmar } = await cadastrar(form.nome, form.email, form.senha);
        if (precisaConfirmar) setAviso('Conta criada. Abra o link que enviamos para o seu e-mail e depois entre aqui.');
      }
    } catch (erro) {
      setErros({ geral: erro.message });
    } finally {
      setEnviando(false);
    }
  };

  const google = async () => {
    try {
      await entrarComGoogle();
    } catch (erro) {
      setErros({ geral: erro.message });
    }
  };

  const classeAba = (ativa) =>
    cn(
      'flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
      ativa ? 'bg-superficie text-forte shadow-cartao' : 'text-sutil hover:text-texto'
    );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
      <Card as="section" aria-labelledby="t-conta" className="p-6 shadow-flutuante sm:p-7">
        <h2 id="t-conta" className="text-[19px] font-semibold tracking-[-0.02em] text-forte">
          {aba === 'entrar' ? 'Entre na sua conta' : 'Crie a sua conta'}
        </h2>
        <p className="mb-5 text-[13px] text-sutil">
          {convite
            ? 'Entre para aceitar o convite do seu grupo.'
            : 'Os seus grupos ficam guardados na conta e abrem em qualquer aparelho.'}
        </p>

        <div role="tablist" aria-label="Entrar ou criar conta" className="mb-5 flex gap-1 rounded-2xl bg-superficie-2 p-1">
          <button type="button" role="tab" aria-selected={aba === 'entrar'} className={classeAba(aba === 'entrar')} onClick={() => setAba('entrar')}>
            Entrar
          </button>
          <button type="button" role="tab" aria-selected={aba === 'cadastrar'} className={classeAba(aba === 'cadastrar')} onClick={() => setAba('cadastrar')}>
            Criar conta
          </button>
        </div>

        <Button type="button" variante="secundaria" className="w-full" onClick={google}>
          <LogoGoogle />
          Continuar com o Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.12em] text-sutil" aria-hidden="true">
          <span className="h-px flex-1 bg-divisor" />
          ou com e-mail
          <span className="h-px flex-1 bg-divisor" />
        </div>

        <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
          {aba === 'cadastrar' && (
            <Field id="login-nome" label="Seu nome" obrigatorio erro={erros.nome}>
              <Input value={form.nome} onChange={campo('nome')} autoComplete="name" placeholder="Ex.: Ana Souza" />
            </Field>
          )}
          <Field id="login-email" label="E-mail" obrigatorio erro={erros.email}>
            <Input type="email" value={form.email} onChange={campo('email')} autoComplete="email" placeholder="voce@exemplo.com" />
          </Field>
          <Field id="login-senha" label="Senha" obrigatorio erro={erros.senha} dica={aba === 'cadastrar' ? 'Pelo menos 6 caracteres.' : undefined}>
            <Input
              type="password"
              value={form.senha}
              onChange={campo('senha')}
              autoComplete={aba === 'entrar' ? 'current-password' : 'new-password'}
            />
          </Field>
          {erros.geral && (
            <p role="alert" className="rounded-xl bg-perigo/10 px-3 py-2 text-[13px] font-medium text-perigo">
              {erros.geral}
            </p>
          )}
          {aviso && (
            <p role="status" className="rounded-xl bg-primaria-barra/10 px-3 py-2 text-[13px] font-medium text-primaria-texto">
              {aviso}
            </p>
          )}
          <Button type="submit" tamanho="lg" className="mt-1 w-full" disabled={enviando}>
            {enviando ? 'Aguarde…' : aba === 'entrar' ? 'Entrar' : 'Criar conta e entrar'}
          </Button>
        </form>
      </Card>

      <Card as="section" aria-labelledby="t-demo" className="flex flex-col p-6 shadow-flutuante sm:p-7">
        <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primaria-barra/10 text-primaria-texto">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <h2 id="t-demo" className="text-[19px] font-semibold tracking-[-0.02em] text-forte">
          Só quer conhecer?
        </h2>
        <p className="mt-1 text-[14px] leading-relaxed text-sutil">
          Experimente sem conta, com um grupo de exemplo cheio de disciplinas, atividades e eventos. Tudo funciona igual,
          mas os dados ficam só neste navegador.
        </p>
        <Button variante="secundaria" className="mt-5 w-full" onClick={usarDemonstracao}>
          Experimentar sem conta
        </Button>
      </Card>
    </div>
  );
}

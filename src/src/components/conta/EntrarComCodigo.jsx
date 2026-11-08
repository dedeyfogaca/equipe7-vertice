import { useEffect, useRef, useState } from 'react';
import { Ticket } from 'lucide-react';

import { useConta } from '../../context/ContaContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { Button } from '../ui/botao.jsx';
import { Field, Input } from '../ui/campos.jsx';
import { entrarComCodigo, limparConvitePendente, lerConvitePendente } from '../../lib/convite.js';

// "Tenho um código": entra no grupo de quem convidou (RF28). Se a pessoa
// chegou pelo link do convite, o código já vem preenchido e é usado sozinho.
export function EntrarComCodigo({ aoEntrar }) {
  const { nomeDaConta, usuario } = useConta();
  const { recarregar } = useData();
  const [codigo, setCodigo] = useState(() => lerConvitePendente());
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const automatico = useRef(Boolean(codigo));

  const usar = async (valor) => {
    const limpo = valor.replace(/\s/g, '').toUpperCase();
    if (limpo.length !== 8) {
      setErro('O código tem 8 letras e números.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const grupoId = await entrarComCodigo(limpo, nomeDaConta || usuario?.email?.split('@')[0] || 'Novo membro');
      limparConvitePendente();
      const dados = await recarregar();
      aoEntrar(grupoId, dados?.grupos.find((g) => g.id === grupoId)?.nome || 'Seu grupo');
    } catch (e) {
      limparConvitePendente();
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (automatico.current) {
      automatico.current = false;
      usar(codigo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        usar(codigo);
      }}
      noValidate
      className="flex flex-col gap-3"
    >
      <Field id="codigo-convite" label="Tenho um código de convite" erro={erro} dica="Peça o código ao organizador do grupo.">
        <Input
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value.toUpperCase());
            setErro('');
          }}
          placeholder="Ex.: K7M2QX9A"
          autoComplete="off"
          maxLength={10}
          className="font-mono tracking-[0.2em] placeholder:font-sans placeholder:tracking-normal"
        />
      </Field>
      <Button type="submit" variante="secundaria" className="w-full" disabled={enviando}>
        <Ticket aria-hidden="true" />
        {enviando ? 'Entrando…' : 'Entrar com o código'}
      </Button>
    </form>
  );
}

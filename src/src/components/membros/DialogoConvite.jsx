import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy, RefreshCw } from 'lucide-react';

import { Dialogo } from '../ui/dialogo.jsx';
import { Button } from '../ui/botao.jsx';
import { gerarConvite, linkDoConvite } from '../../lib/convite.js';
import { mensagemDoErro } from '../../lib/remoto.js';

// Convidar para o grupo (RF28): gera um código válido por 7 dias e mostra o
// código e o link para mandar à turma. Quem usa entra como participante;
// se o organizador já tinha cadastrado a pessoa com o mesmo e-mail da conta,
// o cadastro dela é que fica ligado à conta.
export function DialogoConvite({ aberto, aoMudar, grupoId, membroId }) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState('');

  const gerar = async () => {
    setGerando(true);
    setErro('');
    try {
      setCodigo(await gerarConvite(grupoId, membroId));
    } catch (e) {
      setErro(e instanceof Error && !e.code ? e.message : mensagemDoErro(e));
    } finally {
      setGerando(false);
    }
  };

  useEffect(() => {
    if (aberto && !codigo) gerar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const copiar = async (texto, qual) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(''), 1800);
    } catch {
      toast.error('Não deu para copiar', { description: 'Selecione o texto e copie à mão.' });
    }
  };

  const link = codigo ? linkDoConvite(codigo) : '';

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={aoMudar}
      titulo="Convidar para o grupo"
      descricao="Mande o link ou o código para quem vai entrar. Vale por 7 dias e serve para várias pessoas."
      rodape={
        <>
          <Button variante="secundaria" onClick={gerar} disabled={gerando}>
            <RefreshCw aria-hidden="true" />
            Gerar outro código
          </Button>
          <Button onClick={() => aoMudar(false)}>Pronto</Button>
        </>
      }
    >
      {erro ? (
        <p role="alert" className="rounded-xl bg-perigo/10 px-3 py-2 text-[13px] font-medium text-perigo">
          {erro}
        </p>
      ) : (
        <div className="flex flex-col gap-4" aria-busy={gerando}>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-sutil">Código</span>
            <div className="flex items-center gap-2">
              <output
                id="codigo-gerado"
                className="flex h-12 flex-1 items-center rounded-2xl border border-borda bg-superficie-2 px-4 font-mono text-xl font-semibold tracking-[0.25em] text-forte"
              >
                {gerando ? '········' : codigo}
              </output>
              <Button variante="secundaria" tamanho="icone" aria-label="Copiar código" disabled={!codigo} onClick={() => copiar(codigo, 'codigo')}>
                {copiado === 'codigo' ? <Check /> : <Copy />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-sutil">Link</span>
            <div className="flex items-center gap-2">
              <output className="flex h-12 min-w-0 flex-1 items-center truncate rounded-2xl border border-borda bg-superficie-2 px-4 text-sm text-texto">
                <span className="truncate">{gerando ? 'Gerando…' : link}</span>
              </output>
              <Button variante="secundaria" tamanho="icone" aria-label="Copiar link" disabled={!codigo} onClick={() => copiar(link, 'link')}>
                {copiado === 'link' ? <Check /> : <Copy />}
              </Button>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-sutil">
            Quem entrar pelo convite fica como participante. Para virar organizador, edite o perfil dele depois.
          </p>
        </div>
      )}
    </Dialogo>
  );
}

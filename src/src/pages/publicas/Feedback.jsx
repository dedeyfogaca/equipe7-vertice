import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Annoyed, ArrowLeft, ArrowRight, ArrowUpRight, Check, Frown, Laugh, Meh, Send, Smile } from 'lucide-react';

import { useConta } from '../../context/ContaContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTitulo } from '../../hooks/useTitulo.js';
import { LayoutPublico } from '../../components/layout/LayoutPublico.jsx';
import { Button } from '../../components/ui/botao.jsx';
import { Input, Textarea } from '../../components/ui/campos.jsx';
import { temBanco } from '../../lib/supabase.js';
import {
  LIMITE_CONTATO,
  LIMITE_TEXTO,
  LINK_FEEDBACK,
  NOTAS,
  PERGUNTAS_ABERTAS,
  enviarFeedback,
  enviouHaPouco,
  validarFeedback,
} from '../../lib/feedback.js';
import { cn } from '../../lib/utils.js';

// Feedback dos usuários de teste (RF32, RN27), dentro do Vértice desde
// 12/11/2026: uma pergunta por vez, sem cara de formulário. Qualquer pessoa
// responde, com ou sem conta, sem se identificar. As respostas vão para o
// banco, e só a equipe as lê (tela "Respostas do feedback").

const ROSTOS = { 1: Frown, 2: Annoyed, 3: Meh, 4: Smile, 5: Laugh };

// 0: nota; 1 a 3: perguntas abertas; 4: contato e envio
const TOTAL_PASSOS = 2 + PERGUNTAS_ABERTAS.length;

function Progresso({ passo }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: TOTAL_PASSOS }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-colors duration-300',
            i <= passo ? 'bg-primaria' : 'bg-superficie-3'
          )}
        />
      ))}
    </div>
  );
}

function Concluido({ titulo, texto, logado }) {
  return (
    <div className="flex animate-passo-avanca flex-col items-center gap-5 py-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primaria/15 text-primaria">
        <Check className="size-8" strokeWidth={2.4} aria-hidden="true" />
      </span>
      <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-tight tracking-[-0.03em] text-forte">{titulo}</h1>
      <p className="max-w-[440px] text-[17px] leading-relaxed text-sutil">{texto}</p>
      <Button asChild tamanho="lg" variante="contraste" className="mt-2">
        <Link to={logado ? '/painel' : '/'}>{logado ? 'Voltar ao Vértice' : 'Voltar ao início'}</Link>
      </Button>
    </div>
  );
}

export default function Feedback() {
  useTitulo('Feedback');
  const { modo } = useConta();
  const { autenticado, precisaIdentificar, precisaPerfil } = useAuth();
  const logado = autenticado && !precisaIdentificar && !precisaPerfil;
  const origem = modo === 'conta' ? 'conta' : modo === 'demo' ? 'demonstracao' : 'visitante';

  const [passo, setPasso] = useState(0);
  const [sentido, setSentido] = useState('avanca');
  const [resposta, setResposta] = useState({ nota: null, funcionou: '', travou: '', faltou: '', contato: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [recente] = useState(() => enviouHaPouco());
  const campo = useRef(null);

  useEffect(() => {
    if (passo > 0) campo.current?.focus();
  }, [passo]);

  const ir = (novo) => {
    setErro('');
    setSentido(novo > passo ? 'avanca' : 'volta');
    setPasso(novo);
  };

  const escolherNota = (nota) => {
    setResposta((r) => ({ ...r, nota }));
    setErro('');
    setSentido('avanca');
    // um respiro para a escolha aparecer antes de passar para a próxima
    window.setTimeout(() => setPasso((p) => (p === 0 ? 1 : p)), 260);
  };

  const enviar = async () => {
    const erros = validarFeedback(resposta);
    if (Object.keys(erros).length) {
      setErro(Object.values(erros)[0]);
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await enviarFeedback({ ...resposta, origem });
      setEnviado(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const aoTeclar = (evento) => {
    if (evento.key === 'Enter' && (evento.ctrlKey || evento.metaKey)) {
      evento.preventDefault();
      if (passo === TOTAL_PASSOS - 1) enviar();
      else ir(passo + 1);
    }
  };

  // na escolha da nota, as teclas de 1 a 5 também valem
  useEffect(() => {
    if (passo !== 0 || enviado || !temBanco) return undefined;
    const tecla = (e) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 5) escolherNota(n);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [passo, enviado]);

  let conteudo;
  if (!temBanco) {
    conteudo = (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-tight tracking-[-0.03em] text-forte">
          Conta pra gente como foi.
        </h1>
        <p className="text-[17px] leading-relaxed text-sutil">
          Esta cópia do Vértice roda sem banco de dados, então as respostas vão pelo formulário da equipe.
        </p>
        <Button asChild tamanho="lg">
          <a href={LINK_FEEDBACK} target="_blank" rel="noopener noreferrer">
            Responder o formulário
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(abre em outra aba)</span>
          </a>
        </Button>
      </div>
    );
  } else if (enviado) {
    conteudo = (
      <Concluido
        logado={logado}
        titulo="Valeu pelo feedback!"
        texto="Sua resposta chegou para a equipe. É com ela que a gente decide o que melhorar até a entrega final."
      />
    );
  } else if (recente) {
    conteudo = (
      <Concluido
        logado={logado}
        titulo="Você acabou de responder."
        texto="Obrigado! Se lembrar de mais alguma coisa, volte aqui daqui a alguns minutos para mandar outra resposta."
      />
    );
  } else {
    const aberta = PERGUNTAS_ABERTAS[passo - 1];
    const animacao = sentido === 'avanca' ? 'animate-passo-avanca' : 'animate-passo-volta';
    conteudo = (
      <div className="flex flex-col gap-8" onKeyDown={aoTeclar}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[13px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-primaria">Feedback · anônimo</span>
            <span className="numero text-apagado">
              {passo + 1} de {TOTAL_PASSOS}
            </span>
          </div>
          <Progresso passo={passo} />
        </div>

        <div key={passo} className={cn('flex flex-col gap-6', animacao)}>
          {passo === 0 && (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-tight tracking-[-0.03em] text-forte">
                  Como foi usar o Vértice?
                </h1>
                <p className="text-[17px] text-sutil">Leva uns dois minutos. Sem login e sem nome.</p>
              </div>
              <div role="radiogroup" aria-label="Nota de 1 a 5" className="grid grid-cols-5 gap-2 sm:gap-3">
                {NOTAS.map(({ valor, rotulo }) => {
                  const Rosto = ROSTOS[valor];
                  const marcada = resposta.nota === valor;
                  return (
                    <button
                      key={valor}
                      type="button"
                      role="radio"
                      aria-checked={marcada}
                      aria-label={`${valor}, ${rotulo}`}
                      onClick={() => escolherNota(valor)}
                      className={cn(
                        'group flex flex-col items-center gap-2 rounded-2xl border px-1 py-4 transition-[border-color,background-color,translate,color] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:py-5',
                        marcada
                          ? 'border-primaria bg-primaria/12 text-primaria'
                          : 'border-borda bg-superficie text-suave hover:border-borda-forte hover:text-texto'
                      )}
                    >
                      <Rosto
                        className={cn('size-8 transition-transform duration-200 sm:size-10', marcada ? 'scale-110' : 'group-hover:scale-105')}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-semibold sm:text-sm">{rotulo}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-apagado">Dica: as teclas de 1 a 5 também escolhem.</p>
            </>
          )}

          {aberta && (
            <div className="flex flex-col gap-3">
              <label htmlFor={`fb-${aberta.campo}`} className="text-[clamp(26px,3.6vw,36px)] font-semibold leading-tight tracking-[-0.03em] text-forte">
                {aberta.titulo}
              </label>
              <p className="text-[16px] text-sutil">{aberta.dica} Se não tiver nada, pode pular.</p>
              <Textarea
                ref={campo}
                id={`fb-${aberta.campo}`}
                rows={5}
                maxLength={LIMITE_TEXTO}
                value={resposta[aberta.campo]}
                onChange={(e) => setResposta((r) => ({ ...r, [aberta.campo]: e.target.value }))}
                placeholder="Escreva do seu jeito…"
                className="mt-1 text-[16px]"
              />
              <span className="numero self-end text-xs text-apagado">
                {resposta[aberta.campo].length}/{LIMITE_TEXTO}
              </span>
            </div>
          )}

          {passo === TOTAL_PASSOS - 1 && (
            <div className="flex flex-col gap-3">
              <label htmlFor="fb-contato" className="text-[clamp(26px,3.6vw,36px)] font-semibold leading-tight tracking-[-0.03em] text-forte">
                Quer que a gente responda?
              </label>
              <p className="text-[16px] text-sutil">
                Deixe um e-mail ou @ se quiser retorno. Em branco, a resposta continua anônima.
              </p>
              <Input
                ref={campo}
                id="fb-contato"
                maxLength={LIMITE_CONTATO}
                value={resposta.contato}
                onChange={(e) => setResposta((r) => ({ ...r, contato: e.target.value }))}
                placeholder="Opcional"
                className="mt-1 h-12 text-[16px]"
                autoComplete="email"
              />
            </div>
          )}
        </div>

        {erro && (
          <p role="alert" className="text-sm font-semibold text-perigo">
            {erro}
          </p>
        )}

        {passo > 0 && (
          <div className="flex items-center justify-between gap-3">
            <Button variante="fantasma" onClick={() => ir(passo - 1)}>
              <ArrowLeft aria-hidden="true" />
              Voltar
            </Button>
            {passo < TOTAL_PASSOS - 1 ? (
              <Button tamanho="lg" onClick={() => ir(passo + 1)}>
                {resposta[aberta?.campo]?.trim() ? 'Continuar' : 'Pular'}
                <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button tamanho="lg" onClick={enviar} disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar feedback'}
                <Send aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <LayoutPublico>
      <section className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-center px-6 py-14 sm:py-20">
        <div className="rounded-[28px] border border-borda bg-superficie p-6 shadow-[0_24px_60px_-40px_rgb(8_145_178/0.45)] sm:p-10">
          {conteudo}
        </div>
      </section>
    </LayoutPublico>
  );
}

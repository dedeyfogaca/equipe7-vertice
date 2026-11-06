import { ArrowUpRight, Lightbulb, MessageSquareText, ThumbsUp, TriangleAlert } from 'lucide-react';

import { Revelar } from '../publicas/movimento.jsx';
import { LINK_FEEDBACK, temFormularioFeedback } from '../../lib/feedback.js';
import { cn } from '../../lib/utils.js';

const PERGUNTAS = [
  { icone: ThumbsUp, texto: 'O que funcionou bem?' },
  { icone: TriangleAlert, texto: 'O que travou ou confundiu?' },
  { icone: Lightbulb, texto: 'O que faltou?' },
];

/** Botão que abre o formulário de feedback em outra aba (ou "em breve"). */
export function BotaoFeedback({ className, children = 'Responder o formulário' }) {
  if (!temFormularioFeedback()) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          'inline-flex h-[52px] cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-borda-forte px-6 text-base font-semibold text-sutil',
          className
        )}
      >
        Formulário em breve
      </span>
    );
  }
  return (
    <a
      href={LINK_FEEDBACK}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group/fb inline-flex h-[52px] items-center gap-2 rounded-full bg-primaria px-6 text-base font-semibold text-primaria-fg shadow-botao transition-[translate,filter] hover:-translate-y-px hover:brightness-105',
        className
      )}
    >
      {children}
      <ArrowUpRight
        aria-hidden="true"
        className="size-[18px] transition-transform duration-300 group-hover/fb:-translate-y-0.5 group-hover/fb:translate-x-0.5"
      />
      <span className="sr-only">(abre em outra aba)</span>
    </a>
  );
}

/**
 * Seção de feedback da página inicial: quem testa o Vértice responde um
 * formulário anônimo. É com essas respostas que a equipe decide o que
 * melhorar até a entrega final.
 */
export function SecaoFeedback() {
  return (
    <section id="feedback" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 py-16">
      <Revelar className="grid items-center gap-8 rounded-[28px] border border-borda bg-superficie p-7 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-primaria">
            <MessageSquareText className="size-4" aria-hidden="true" />
            Feedback
          </span>
          <h2 className="text-[clamp(30px,3.6vw,46px)] font-semibold leading-[1.05] tracking-[-0.04em] text-forte">
            Testou o Vértice? Conta pra gente.
          </h2>
          <p className="max-w-[520px] text-[17px] leading-relaxed text-sutil">
            O formulário é anônimo e leva uns dois minutos. Vale elogio, crítica, bug e ideia: é com as respostas
            que a gente decide o que melhorar até a entrega final.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <BotaoFeedback />
            <span className="text-sm text-apagado">Sem login e sem nome.</span>
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          {PERGUNTAS.map(({ icone: Icone, texto }, i) => (
            <li
              key={texto}
              className="group flex items-center gap-4 rounded-2xl border border-borda bg-fundo px-5 py-4 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-borda-forte"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primaria/12 text-primaria transition-[scale] duration-300 group-hover:scale-105">
                <Icone className="size-5" strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="text-[17px] font-medium text-forte">{texto}</span>
            </li>
          ))}
        </ul>
      </Revelar>
    </section>
  );
}

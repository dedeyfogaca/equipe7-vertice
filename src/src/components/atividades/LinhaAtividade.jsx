import { Link } from 'react-router-dom';
import { CalendarDays, Check, UserRound } from 'lucide-react';

import { useData } from '../../context/DataContext.jsx';
import { usePermissoes } from '../../hooks/usePermissoes.js';
import { Avatar } from '../ui/avatar-membro.jsx';
import { Badge } from '../ui/basicos.jsx';
import { Dica } from '../ui/flutuantes.jsx';
import { AnelPeso } from '../ui/progresso.jsx';
import { STATUS } from '../../lib/constants.js';
import { etiquetaPrazo, tomDaAtividade } from '../../lib/formatos.js';
import { cn, primeiroNome } from '../../lib/utils.js';

/**
 * Uma atividade numa lista: peso, cor da disciplina, título, trilha
 * (disciplina › conteúdo), prazo e responsável. A linha inteira leva ao
 * detalhe.
 *
 * Com `aoAlternar`, a linha ganha o botão de concluir na frente — ativo só
 * nas atividades de quem está usando (RN20). Nas dos outros, o círculo só
 * mostra a situação.
 */
export function LinhaAtividade({ atividade, feriado, aoAlternar, className }) {
  const { trilhaDaAtividade, membros } = useData();
  const { podeMudarStatus } = usePermissoes();
  const { conteudo, disciplina } = trilhaDaAtividade(atividade);
  const responsavel = membros.find((m) => m.id === atividade.responsavelId) || null;
  const concluida = atividade.status === STATUS.CONCLUIDO;
  const tom = tomDaAtividade(atividade);
  const etiqueta = etiquetaPrazo(atividade);
  const cor = disciplina?.cor || 'var(--borda-forte)';

  const selos = (
    <>
      {feriado && !concluida && (
        <Dica conteudo={`Feriado: ${feriado.name}`}>
          <Badge tom="feriado" className="relative z-10">
            <CalendarDays className="size-3" aria-hidden="true" />
            Feriado
          </Badge>
        </Dica>
      )}
      <Badge tom={tom}>{etiqueta}</Badge>
    </>
  );

  return (
    <li
      className={cn(
        'relative flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-superficie-2/70 sm:px-5',
        className
      )}
    >
      {aoAlternar && podeMudarStatus(atividade) ? (
        <button
          type="button"
          aria-pressed={concluida}
          aria-label={`Marcar ${atividade.titulo} como concluída`}
          onClick={() => aoAlternar(atividade)}
          className={cn(
            'relative z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            concluida
              ? 'border-concluido bg-concluido text-fundo'
              : 'border-borda-forte text-transparent hover:border-concluido hover:text-concluido'
          )}
        >
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </button>
      ) : aoAlternar ? (
        // Atividade de outra pessoa: o mesmo círculo, sem ação.
        <span
          role="img"
          aria-label={`${concluida ? 'Concluída' : 'Não concluída'}. Só ${responsavel ? primeiroNome(responsavel.nome) : 'o responsável'} muda o status.`}
          title={`Só ${responsavel ? primeiroNome(responsavel.nome) : 'o responsável'} muda o status`}
          className={cn(
            'relative z-10 flex size-[26px] shrink-0 cursor-not-allowed items-center justify-center rounded-full border-2',
            concluida ? 'border-concluido/50 bg-concluido/50 text-fundo' : 'border-dashed border-borda-forte'
          )}
        >
          {concluida && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
        </span>
      ) : (
        <AnelPeso peso={atividade.peso} />
      )}

      <span aria-hidden="true" className="h-9 w-1 shrink-0 rounded-full" style={{ background: cor }} />

      <div className="min-w-0 flex-1">
        <Link
          to={`/atividade/${atividade.id}`}
          className={cn(
            'block truncate text-[15px] font-semibold outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[""] hover:text-primaria-texto focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primaria-barra',
            concluida ? 'text-suave' : 'text-forte'
          )}
        >
          {atividade.titulo}
        </Link>
        <p className="mt-0.5 truncate text-[13px] text-sutil">
          {disciplina?.nome ?? 'Sem disciplina'} › {conteudo?.nome ?? 'Sem conteúdo'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">{selos}</div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">{selos}</div>

      {aoAlternar && <AnelPeso peso={atividade.peso} className="hidden md:block" />}

      {responsavel ? (
        <Avatar membro={responsavel} tamanho={30} className="relative z-10" />
      ) : (
        // Só acontece com dado antigo (RN06): um círculo vazio, e não um
        // avatar, para não parecer que existe um membro chamado assim (D03).
        <span
          role="img"
          aria-label="Sem responsável"
          title="Sem responsável"
          className="relative z-10 inline-flex size-[30px] shrink-0 items-center justify-center rounded-full border border-dashed border-borda-forte text-apagado"
        >
          <UserRound className="size-4" aria-hidden="true" />
        </span>
      )}
    </li>
  );
}

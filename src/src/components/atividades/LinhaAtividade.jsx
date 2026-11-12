import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarDays, Check, Hand, UserRound } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { usePermissoes } from '../../hooks/usePermissoes.js';
import { Avatar } from '../ui/avatar-membro.jsx';
import { Badge } from '../ui/basicos.jsx';
import { Dica } from '../ui/flutuantes.jsx';
import { AnelPeso } from '../ui/progresso.jsx';
import { STATUS } from '../../lib/constants.js';
import { nomeDoMembro } from '../../lib/registro.js';
import { etiquetaPrazo, tomDaAtividade } from '../../lib/formatos.js';
import { cn, primeiroNome } from '../../lib/utils.js';

// Onde a atividade está: no espaço pessoal aparecem também as dos grupos
// (RF34), e aí o nome do grupo vai na frente.
export function trilhaEmTexto({ grupo, disciplina, conteudo }, grupoAtivoId) {
  const doOutroEspaco = grupo && grupo.id !== grupoAtivoId && !grupo.pessoal;
  const partes = [doOutroEspaco ? grupo.nome : null, disciplina?.nome ?? (grupo?.pessoal ? null : 'Sem disciplina')]
    .filter(Boolean)
    .join(' · ');
  const texto = `${partes}${conteudo ? ` › ${conteudo.nome}` : ''}`;
  return texto || 'Pessoal';
}

/**
 * Uma atividade numa lista: peso, cor da disciplina, título, trilha
 * (grupo · disciplina › conteúdo), prazo e responsável. A linha inteira leva
 * ao detalhe.
 *
 * Com `aoAlternar`, a linha ganha o botão de concluir na frente, ativo só
 * nas atividades de quem está usando (RN20). Nas dos outros, o círculo só
 * mostra a situação. A atividade "A definir" (RN06) mostra o botão Assumir
 * no lugar do responsável.
 *
 * Com `selecao` ({ marcada, aoMarcar }), o círculo vira uma caixa de marcar,
 * para as ações em lote (RF37).
 */
export function LinhaAtividade({ atividade, feriado, aoAlternar, selecao, className }) {
  const { trilhaDaAtividade, membros, grupos, assumirAtividade } = useData();
  const { grupoAtivo } = useAuth();
  const { podeMudarStatus, podeAssumir } = usePermissoes();
  const { conteudo, disciplina } = trilhaDaAtividade(atividade);
  const grupo = grupos.find((g) => g.id === atividade.grupoId) || null;
  const responsavel = membros.find((m) => m.id === atividade.responsavelId) || null;
  const concluida = atividade.status === STATUS.CONCLUIDO;
  const tom = tomDaAtividade(atividade);
  const etiqueta = etiquetaPrazo(atividade);
  const cor = disciplina?.cor || 'var(--borda-forte)';
  const aDefinir = !atividade.responsavelId;

  const assumir = () => {
    if (assumirAtividade(atividade.id)) toast.success('Atividade assumida', { description: `${atividade.titulo} agora é sua.` });
  };

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
      {selecao ? (
        <input
          type="checkbox"
          checked={selecao.marcada}
          onChange={() => selecao.aoMarcar(atividade.id)}
          aria-label={`Selecionar ${atividade.titulo}`}
          className="relative z-10 size-[22px] shrink-0 cursor-pointer rounded-md accent-primaria-barra"
        />
      ) : aoAlternar && podeMudarStatus(atividade) ? (
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
        // Atividade de outra pessoa (ou "A definir"): o mesmo círculo, sem ação.
        <span
          role="img"
          aria-label={
            aDefinir
              ? 'Não concluída. Assuma a atividade para poder concluir.'
              : `${concluida ? 'Concluída' : 'Não concluída'}. Só ${responsavel ? primeiroNome(responsavel.nome) : 'o responsável'} muda o status.`
          }
          title={
            aDefinir
              ? 'Assuma a atividade para poder concluir'
              : `Só ${responsavel ? primeiroNome(responsavel.nome) : 'o responsável'} muda o status`
          }
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
          {trilhaEmTexto({ grupo, disciplina, conteudo }, grupoAtivo?.id)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">{selos}</div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">{selos}</div>

      {aoAlternar && <AnelPeso peso={atividade.peso} className="hidden md:block" />}

      {responsavel ? (
        <Avatar
          membro={{ ...responsavel, nome: nomeDoMembro(responsavel) }}
          tamanho={30}
          className={cn('relative z-10', responsavel.saiuEm && 'opacity-60 grayscale')}
        />
      ) : podeAssumir(atividade) && !selecao ? (
        <button
          type="button"
          onClick={assumir}
          className="relative z-10 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-primaria-barra/40 bg-primaria-barra/10 px-3 text-[13px] font-semibold text-primaria-texto transition-colors hover:bg-primaria-barra/20"
        >
          <Hand className="size-3.5" aria-hidden="true" />
          Assumir
        </button>
      ) : (
        // "A definir" (RN06): um círculo vazio, e não um avatar, para não
        // parecer que existe um membro chamado assim (D03).
        <span
          role="img"
          aria-label="Responsável a definir"
          title="Responsável a definir"
          className="relative z-10 inline-flex size-[30px] shrink-0 items-center justify-center rounded-full border border-dashed border-borda-forte text-apagado"
        >
          <UserRound className="size-4" aria-hidden="true" />
        </span>
      )}
    </li>
  );
}

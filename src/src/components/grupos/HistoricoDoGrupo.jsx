import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ListChecks, LoaderCircle, Ticket, Trophy, UserRound, Users } from 'lucide-react';

import { useData } from '../../context/DataContext.jsx';
import { Gaveta } from '../ui/dialogo.jsx';
import { Button } from '../ui/botao.jsx';
import { SelectRico } from '../ui/selecao.jsx';
import { TIPOS_FILTRO, filtrarRegistros, fraseDoRegistro, rotuloDoDia, textoDoRegistro } from '../../lib/registro.js';

// Histórico do grupo (RF40, RN29): tudo o que aconteceu no grupo, do mais
// novo para o mais antigo, com quem fez. Só leitura, para todos os membros.
// Abre num painel lateral, sem tirar a pessoa da página.

const ICONES = {
  atividade: ListChecks,
  membro: UserRound,
  disciplina: BookOpen,
  conteudo: BookOpen,
  evento: CalendarDays,
  conquista: Trophy,
  convite: Ticket,
  grupo: Users,
};

const POR_PAGINA = 40;
const TODAS = 'todas';

const hora = (iso) =>
  new Date(iso).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });

function Linha({ registro }) {
  const Icone = ICONES[registro.tipo] || ListChecks;
  const f = fraseDoRegistro(registro);
  return (
    <li className="flex gap-3 py-2.5" data-registro="">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-superficie-3 text-sutil">
        <Icone className="size-3.5" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-[14px] leading-snug text-texto">
        <span className="sr-only">{textoDoRegistro(registro)}</span>
        <span aria-hidden="true">
          {f.autor && <strong className="font-semibold text-forte">{f.autor} </strong>}
          {f.antes}
          {f.alvo && (
            <>
              {' '}
              <span className="font-medium text-forte">{f.aspas ? `“${f.alvo}”` : f.alvo}</span>
            </>
          )}
          {f.depois && ` ${f.depois}`}
        </span>
      </p>
      <time dateTime={registro.data} className="numero shrink-0 pt-0.5 text-[12px] text-apagado">
        {hora(registro.data)}
      </time>
    </li>
  );
}

export function HistoricoDoGrupo({ aberto, aoMudar, grupo }) {
  const { carregarHistorico, membrosDoGrupo, registros } = useData();
  const [itens, setItens] = useState([]);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [pessoa, setPessoa] = useState(TODAS);
  const [tipo, setTipo] = useState(TODAS);

  const carregar = useCallback(
    async (desde) => {
      setCarregando(true);
      setErro('');
      try {
        const pagina = await carregarHistorico(grupo.id, { desde, quantos: POR_PAGINA });
        setItens((atual) => (desde === 0 ? pagina.itens : [...atual, ...pagina.itens]));
        setTemMais(pagina.temMais);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    },
    [carregarHistorico, grupo.id]
  );

  // Ao abrir (e, na demonstração, a cada mudança no grupo), da primeira página.
  useEffect(() => {
    if (aberto) carregar(0);
  }, [aberto, carregar, registros]);

  const pessoas = useMemo(
    () => [
      { valor: TODAS, rotulo: 'Todas as pessoas' },
      ...membrosDoGrupo(grupo.id, { todos: true }).map((m) => ({
        valor: m.id,
        rotulo: m.saiuEm ? `${m.nome} (saiu)` : m.nome,
      })),
    ],
    [membrosDoGrupo, grupo.id]
  );

  const visiveis = filtrarRegistros(itens, {
    pessoa: pessoa === TODAS ? '' : pessoa,
    tipo: tipo === TODAS ? '' : tipo,
  });
  const dias = [];
  visiveis.forEach((r) => {
    const rotulo = rotuloDoDia(r.data);
    const ultimo = dias[dias.length - 1];
    if (ultimo?.rotulo === rotulo) ultimo.itens.push(r);
    else dias.push({ rotulo, itens: [r] });
  });
  const filtrando = pessoa !== TODAS || tipo !== TODAS;

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={aoMudar}
      titulo="Histórico do grupo"
      descricao={`Tudo o que aconteceu em ${grupo.nome}, com quem fez. Ninguém altera nem apaga.`}
      rodape={
        <p className="text-[12px] leading-relaxed text-apagado">
          O que aconteceu antes de 12/11/2026 foi montado com as datas guardadas: criações, conclusões e conquistas.
          Edições e exclusões dessa época não aparecem.
        </p>
      }
    >
      <div className="sticky top-[-16px] z-10 -mx-6 -mt-4 mb-2 flex flex-wrap gap-2 bg-superficie px-6 pb-3 pt-4">
        <SelectRico id="f-hist-pessoa" valor={pessoa} aoMudar={setPessoa} opcoes={pessoas} className="h-9 min-w-0 flex-1" />
        <SelectRico
          id="f-hist-tipo"
          valor={tipo}
          aoMudar={setTipo}
          opcoes={[{ valor: TODAS, rotulo: 'Tudo' }, ...TIPOS_FILTRO.map(({ valor, rotulo }) => ({ valor, rotulo }))]}
          className="h-9 min-w-0 flex-1"
        />
      </div>

      {erro && (
        <p role="alert" className="py-6 text-sm text-perigo">
          {erro}
        </p>
      )}

      {!erro && dias.length === 0 && !carregando && (
        <p className="py-10 text-center text-sm text-sutil">
          {filtrando ? 'Nada com esses filtros nas linhas carregadas.' : 'Nada por aqui ainda.'}
        </p>
      )}

      <div aria-live="polite">
        {dias.map((dia) => (
          <section key={dia.rotulo} aria-label={dia.rotulo} className="pb-2">
            <h3 className="sticky top-[38px] bg-superficie py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-apagado">
              {dia.rotulo}
            </h3>
            <ol className="divide-y divide-divisor">
              {dia.itens.map((r) => (
                <Linha key={r.id} registro={r} />
              ))}
            </ol>
          </section>
        ))}
      </div>

      {carregando && (
        <p className="flex items-center justify-center gap-2 py-6 text-sm text-sutil">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Carregando
        </p>
      )}
      {temMais && !carregando && (
        <div className="flex justify-center py-4">
          <Button variante="secundaria" tamanho="sm" onClick={() => carregar(itens.length)}>
            Carregar mais
          </Button>
        </div>
      )}
    </Gaveta>
  );
}

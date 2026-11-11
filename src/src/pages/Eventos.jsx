import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, CalendarPlus, Layers, Plus } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { useFeriados } from '../hooks/useFeriados.js';
import { useTitulo } from '../hooks/useTitulo.js';
import { Button } from '../components/ui/botao.jsx';
import { Card, EmptyState, PageHeader } from '../components/ui/basicos.jsx';
import { Label } from '../components/ui/campos.jsx';
import { IconeOpcao, SelectRico } from '../components/ui/selecao.jsx';
import { opcoesDisciplinas } from '../components/opcoes.jsx';
import { CartaoEvento } from '../components/eventos/CartaoEvento.jsx';
import { eventoFuturo, iconeDoEvento } from '../components/eventos/tipos.jsx';
import { useEventos } from '../components/eventos/useEventos.jsx';
import { TIPO_EVENTO_OPCOES } from '../lib/constants.js';
import { anoDaData, dataLocal, dataValida } from '../lib/datas.js';
import { tituloMes } from '../lib/formatos.js';
import { cn } from '../lib/utils.js';

// Eventos do grupo (RF31): provas, palestras, apresentações, reuniões. Não
// têm responsável nem peso, então não entram no progresso nem na
// experiência: servem para o grupo não esquecer do que tem dia marcado.
// No espaço pessoal (RF34), aparecem os da pessoa e os de todos os grupos
// dela, com o nome do grupo. O filtro por disciplina veio do feedback dos
// testes (11/11/2026).

const ABAS = [
  { valor: 'proximos', rotulo: 'Próximos' },
  { valor: 'passados', rotulo: 'Passados' },
];

export default function Eventos() {
  useTitulo('Eventos');
  const { grupoAtivo } = useAuth();
  const { eventosDoEspaco, disciplinasDoEspaco, grupos } = useData();
  const { novoEvento, menuDoEvento, janelas } = useEventos();
  const [params, setParams] = useSearchParams();

  const eventos = eventosDoEspaco(grupoAtivo.id);
  const disciplinas = disciplinasDoEspaco(grupoAtivo.id);
  const grupoDe = (evento) =>
    evento.grupoId !== grupoAtivo.id ? grupos.find((g) => g.id === evento.grupoId && !g.pessoal) : undefined;
  const [aba, setAba] = useState('proximos');
  // Evento que cai em feriado nacional ganha um aviso (BrasilAPI, RF21).
  const anos = useMemo(
    () => [...new Set([new Date().getFullYear(), ...eventos.map((e) => anoDaData(e.data)).filter(Boolean)])],
    [eventos]
  );
  const { feriadoEm } = useFeriados(anos);
  const [tipo, setTipo] = useState('todos');
  const [fDisciplina, setFDisciplina] = useState('todas');

  // `?novo=2026-11-20` (vindo do painel ou de um link) já abre o cadastro.
  useEffect(() => {
    const novo = params.get('novo');
    if (novo === null) return;
    novoEvento(dataValida(novo) ? novo : '');
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proximos = eventos.filter(eventoFuturo);
  const passados = eventos.filter((e) => !eventoFuturo(e)).reverse();
  const daAba = aba === 'proximos' ? proximos : passados;
  const filtrados = daAba.filter(
    (e) => (tipo === 'todos' || e.tipo === tipo) && (fDisciplina === 'todas' || e.disciplinaId === fDisciplina)
  );
  // Só as disciplinas que têm evento entram no filtro.
  const disciplinasComEvento = disciplinas.filter((d) => eventos.some((e) => e.disciplinaId === d.id));

  // Agrupados por mês, na ordem da aba.
  const porMes = useMemo(() => {
    const grupos = [];
    filtrados.forEach((evento) => {
      const data = dataLocal(evento.data);
      const chave = data ? `${data.getFullYear()}-${data.getMonth()}` : 'sem-data';
      let grupo = grupos.find((g) => g.chave === chave);
      if (!grupo) {
        grupo = { chave, titulo: data ? tituloMes(data.getFullYear(), data.getMonth()) : 'Sem data', eventos: [] };
        grupos.push(grupo);
      }
      grupo.eventos.push(evento);
    });
    return grupos;
  }, [filtrados]);

  const tiposUsados = TIPO_EVENTO_OPCOES.filter((o) => daAba.some((e) => e.tipo === o.valor));

  return (
    <>
      <PageHeader
        titulo="Eventos"
        subtitulo="Provas, palestras e tudo o que tem dia marcado. Aparecem também no calendário."
        acoes={
          <Button onClick={() => novoEvento()}>
            <Plus aria-hidden="true" />
            Novo evento
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Quando" className="flex rounded-full border border-borda bg-superficie p-1">
          {ABAS.map(({ valor, rotulo }) => {
            const quantidade = valor === 'proximos' ? proximos.length : passados.length;
            return (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={aba === valor}
                onClick={() => {
                  setAba(valor);
                  setTipo('todos');
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors',
                  aba === valor ? 'bg-superficie-3 font-semibold text-forte' : 'font-medium text-sutil hover:text-texto'
                )}
              >
                {rotulo}
                <span className="numero text-[12px] text-sutil">{quantidade}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
        {disciplinasComEvento.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="f-disc-evento" className="sr-only">
              Disciplina
            </Label>
            <SelectRico
              id="f-disc-evento"
              valor={fDisciplina}
              aoMudar={setFDisciplina}
              className="h-10 w-[220px]"
              opcoes={[
                { valor: 'todas', rotulo: 'Todas as disciplinas', icone: <IconeOpcao icone={Layers} /> },
                ...opcoesDisciplinas(disciplinasComEvento),
              ]}
            />
          </div>
        )}
        {tiposUsados.length > 1 && (
          <div role="group" aria-label="Tipo de evento" className="flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={tipo === 'todos'}
              onClick={() => setTipo('todos')}
              className={cn(
                'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                tipo === 'todos' ? 'bg-primaria-barra/12 text-forte' : 'text-sutil hover:bg-superficie-3 hover:text-texto'
              )}
            >
              Todos
            </button>
            {tiposUsados.map((opcao) => {
              const Icone = iconeDoEvento(opcao.valor);
              return (
                <button
                  key={opcao.valor}
                  type="button"
                  aria-pressed={tipo === opcao.valor}
                  onClick={() => setTipo(tipo === opcao.valor ? 'todos' : opcao.valor)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                    tipo === opcao.valor
                      ? 'bg-primaria-barra/12 text-forte'
                      : 'text-sutil hover:bg-superficie-3 hover:text-texto'
                  )}
                >
                  <Icone className="size-3.5" aria-hidden="true" />
                  {opcao.rotulo}
                </button>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <Card>
          {eventos.length > 0 && (tipo !== 'todos' || fDisciplina !== 'todas') ? (
            <EmptyState
              icone={CalendarDays}
              titulo="Nenhum evento com esses filtros"
              descricao="Troque a disciplina ou o tipo para ver os outros."
            >
              <Button
                variante="secundaria"
                onClick={() => {
                  setTipo('todos');
                  setFDisciplina('todas');
                }}
              >
                Limpar filtros
              </Button>
            </EmptyState>
          ) : eventos.length === 0 ? (
            <EmptyState
              icone={CalendarPlus}
              titulo="Nenhum evento ainda"
              descricao="Marcou prova? Tem palestra na semana que vem? Cadastre aqui e o grupo inteiro vê no calendário."
            >
              <Button onClick={() => novoEvento()}>
                <Plus aria-hidden="true" />
                Novo evento
              </Button>
            </EmptyState>
          ) : (
            <EmptyState
              icone={CalendarDays}
              titulo={aba === 'proximos' ? 'Nada marcado por enquanto' : 'Nenhum evento passado'}
              descricao={
                aba === 'proximos'
                  ? 'Os próximos eventos do grupo aparecem aqui, do mais perto ao mais longe.'
                  : 'Os eventos que já aconteceram ficam guardados aqui.'
              }
            />
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-7">
          {porMes.map((grupo) => (
            <section key={grupo.chave} aria-labelledby={`mes-${grupo.chave}`}>
              <h2
                id={`mes-${grupo.chave}`}
                className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-sutil"
              >
                {grupo.titulo}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {grupo.eventos.map((evento) => (
                  <li key={evento.id}>
                    <CartaoEvento
                      evento={evento}
                      disciplina={disciplinas.find((d) => d.id === evento.disciplinaId)}
                      grupo={grupoDe(evento)}
                      feriado={feriadoEm(evento.data)}
                      acoes={menuDoEvento(evento)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-[13px] text-sutil">
        Quer ver tudo junto com as entregas?{' '}
        <Link to="/calendario" className="font-medium text-primaria-texto hover:underline">
          Abrir o calendário
        </Link>
      </p>

      {janelas}
    </>
  );
}

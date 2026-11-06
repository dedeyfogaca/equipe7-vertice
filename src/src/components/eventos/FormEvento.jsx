import { useRef, useState } from 'react';
import { CircleSlash } from 'lucide-react';

import { Button } from '../ui/botao.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { Field, Input, Textarea } from '../ui/campos.jsx';
import { CampoData } from '../ui/campo-data.jsx';
import { IconeOpcao, SelectRico } from '../ui/selecao.jsx';
import { opcoesDisciplinas } from '../opcoes.jsx';
import { iconeDoEvento } from './tipos.jsx';
import { TIPO_EVENTO_OPCOES } from '../../lib/constants.js';
import { semErros, validarEvento } from '../../lib/validacao.js';
import { cn, semErroEm } from '../../lib/utils.js';

const SEM_DISCIPLINA = '__sem-disciplina__';

/**
 * Cadastro e edição de evento (RF31). Monte com `key` para reiniciar.
 * `dataInicial` vem do calendário, quando o evento nasce num dia escolhido.
 */
export function FormEvento({ aberto, aoMudar, evento, dataInicial = '', disciplinas, aoSalvar }) {
  const edicao = Boolean(evento);
  const [form, setForm] = useState(() => ({
    titulo: evento?.titulo ?? '',
    tipo: evento?.tipo ?? '',
    data: evento?.data ?? dataInicial,
    horaInicio: evento?.horaInicio ?? '',
    horaFim: evento?.horaFim ?? '',
    local: evento?.local ?? '',
    disciplinaId: evento?.disciplinaId ?? '',
    descricao: evento?.descricao ?? '',
  }));
  const [erros, setErros] = useState({});
  const tipos = useRef([]);

  const mudar = (campo, valor) => {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
      // Sem início não há fim: o campo do fim trava junto.
      ...(campo === 'horaInicio' && !valor ? { horaFim: '' } : {}),
    }));
    setErros((atual) => semErroEm(campo === 'horaInicio' ? semErroEm(atual, 'horaFim') : atual, campo));
  };

  const enviar = (e) => {
    e.preventDefault();
    const novosErros = validarEvento(form, { disciplinas });
    setErros(novosErros);
    if (!semErros(novosErros)) {
      const primeiro = ['titulo', 'tipo', 'data', 'horaInicio', 'horaFim', 'local'].find((c) => novosErros[c]);
      if (primeiro === 'tipo') tipos.current[0]?.focus();
      else document.getElementById(`evento-${primeiro}`)?.focus();
      return;
    }
    aoSalvar(form);
  };

  // Setas trocam o tipo, como num grupo de rádio.
  const indiceTipo = TIPO_EVENTO_OPCOES.findIndex((o) => o.valor === form.tipo);
  const moverTipo = (evento, indice) => {
    const passos = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(evento.key in passos)) return;
    evento.preventDefault();
    const proximo = (indice + passos[evento.key] + TIPO_EVENTO_OPCOES.length) % TIPO_EVENTO_OPCOES.length;
    mudar('tipo', TIPO_EVENTO_OPCOES[proximo].valor);
    tipos.current[proximo]?.focus();
  };

  const opcoesDisciplina = [
    { valor: SEM_DISCIPLINA, rotulo: 'Nenhuma', icone: <IconeOpcao icone={CircleSlash} /> },
    ...opcoesDisciplinas(disciplinas),
  ];

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={aoMudar}
      largura={600}
      titulo={edicao ? 'Editar evento' : 'Novo evento'}
      descricao="Prova, palestra, apresentação: o que tem dia marcado e o grupo precisa lembrar. Aparece no calendário."
      rodape={
        <>
          <Button variante="secundaria" onClick={() => aoMudar(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-evento">
            {edicao ? 'Salvar' : 'Cadastrar evento'}
          </Button>
        </>
      }
    >
      <form id="form-evento" onSubmit={enviar} noValidate className="grid gap-5 sm:grid-cols-2">
        <Field id="evento-titulo" label="Nome" obrigatorio erro={erros.titulo} className="sm:col-span-2">
          <Input
            value={form.titulo}
            onChange={(e) => mudar('titulo', e.target.value)}
            placeholder="Ex.: Prova de Banco de Dados"
            autoComplete="off"
            autoFocus
          />
        </Field>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <span id="evento-tipo-rotulo" className="text-[13px] font-semibold tracking-wide text-suave">
            Tipo
            <span className="ml-0.5 text-primaria-texto" aria-hidden="true">
              *
            </span>
          </span>
          <div
            role="radiogroup"
            aria-labelledby="evento-tipo-rotulo"
            aria-describedby={erros.tipo ? 'evento-tipo-erro' : undefined}
            className="flex flex-wrap gap-2"
          >
            {TIPO_EVENTO_OPCOES.map((opcao, indice) => {
              const Icone = iconeDoEvento(opcao.valor);
              const marcado = form.tipo === opcao.valor;
              return (
                <button
                  key={opcao.valor}
                  ref={(el) => (tipos.current[indice] = el)}
                  type="button"
                  role="radio"
                  aria-checked={marcado}
                  tabIndex={marcado || (indiceTipo === -1 && indice === 0) ? 0 : -1}
                  onClick={() => mudar('tipo', opcao.valor)}
                  onKeyDown={(e) => moverTipo(e, indice)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-[background-color,border-color,color]',
                    marcado
                      ? 'border-primaria-barra bg-primaria-barra/10 text-forte'
                      : 'border-borda text-suave hover:border-borda-forte hover:text-texto'
                  )}
                >
                  <Icone className={cn('size-4', marcado ? 'text-primaria-texto' : 'text-sutil')} aria-hidden="true" />
                  {opcao.rotulo}
                </button>
              );
            })}
          </div>
          {erros.tipo && (
            <p id="evento-tipo-erro" className="text-[13px] font-medium text-perigo">
              {erros.tipo}
            </p>
          )}
        </div>

        <Field id="evento-data" label="Dia" obrigatorio erro={erros.data} className="sm:col-span-2">
          <CampoData valor={form.data} aoMudar={(valor) => mudar('data', valor)} placeholder="Selecione o dia" />
        </Field>

        <Field id="evento-horaInicio" label="Começa às" erro={erros.horaInicio} dica="Opcional. Sem horário, vale o dia todo.">
          <Input type="time" value={form.horaInicio} onChange={(e) => mudar('horaInicio', e.target.value)} />
        </Field>
        <Field id="evento-horaFim" label="Termina às" erro={erros.horaFim} dica="Opcional.">
          <Input
            type="time"
            value={form.horaFim}
            onChange={(e) => mudar('horaFim', e.target.value)}
            disabled={!form.horaInicio}
          />
        </Field>

        <Field id="evento-local" label="Local" erro={erros.local} dica="Opcional.">
          <Input
            value={form.local}
            onChange={(e) => mudar('local', e.target.value)}
            placeholder="Ex.: Sala 204, Auditório, Meet"
            autoComplete="off"
          />
        </Field>
        <Field id="evento-disciplinaId" label="Disciplina" erro={erros.disciplinaId} dica="Opcional. Dá a cor do evento no calendário.">
          <SelectRico
            valor={form.disciplinaId || SEM_DISCIPLINA}
            aoMudar={(valor) => mudar('disciplinaId', valor === SEM_DISCIPLINA ? '' : valor)}
            opcoes={opcoesDisciplina}
          />
        </Field>

        <Field id="evento-descricao" label="Observações" dica="Opcional. O que cai na prova, o que levar." className="sm:col-span-2">
          <Textarea
            value={form.descricao}
            onChange={(e) => mudar('descricao', e.target.value)}
            className="min-h-[84px]"
          />
        </Field>
      </form>
    </Dialogo>
  );
}

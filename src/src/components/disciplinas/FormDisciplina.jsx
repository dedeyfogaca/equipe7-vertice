import { useState } from 'react';
import { Button } from '../ui/botao.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { Field, Input } from '../ui/campos.jsx';
import { SeletorCor } from './SeletorCor.jsx';
import { sugerirCorDisciplina } from '../../lib/constants.js';
import { semErros, validarDisciplina } from '../../lib/validacao.js';
import { corComAlfa, semErroEm } from '../../lib/utils.js';

/**
 * Cadastro e edição de disciplina, numa janela. `disciplina` vazio é
 * cadastro; preenchido é edição. Monte com `key` para reiniciar o formulário.
 */
export function FormDisciplina({ aberto, aoMudar, disciplina, disciplinas, aoSalvar }) {
  const edicao = Boolean(disciplina);
  const [nome, setNome] = useState(disciplina?.nome ?? '');
  // Cor sugerida: uma que o grupo ainda não usa (as disciplinas novas não
  // nascem todas iguais).
  const [cor, setCor] = useState(
    () => disciplina?.cor ?? sugerirCorDisciplina(disciplinas.map((d) => d.cor))
  );
  const [erros, setErros] = useState({});

  const enviar = (evento) => {
    evento.preventDefault();
    const dados = { nome, cor };
    const novosErros = validarDisciplina(dados, { disciplinas, ignorarId: disciplina?.id ?? null });
    setErros(novosErros);
    if (!semErros(novosErros)) return;
    aoSalvar({ nome: nome.trim(), cor });
  };

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={aoMudar}
      titulo={edicao ? 'Editar disciplina' : 'Nova disciplina'}
      descricao="A cor identifica a disciplina nas barras de progresso e no calendário."
      largura={540}
      rodape={
        <>
          <Button variante="secundaria" onClick={() => aoMudar(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-disciplina">
            {edicao ? 'Salvar' : 'Cadastrar'}
          </Button>
        </>
      }
    >
      <form id="form-disciplina" onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <Field id="nome-disciplina" label="Nome" obrigatorio erro={erros.nome}>
          <Input
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErros((atual) => semErroEm(atual, 'nome'));
            }}
            placeholder="Ex.: Banco de Dados"
            autoComplete="off"
            autoFocus
          />
        </Field>

        <SeletorCor id="cor-disciplina" valor={cor} aoEscolher={setCor} erro={erros.cor} />

        <div className="flex flex-col gap-2 rounded-2xl border border-borda bg-superficie-2 p-4">
          <span className="text-[12px] text-sutil">Assim ela aparece no calendário</span>
          <span
            className="block truncate rounded-[7px] border-l-[3px] px-2 py-1 text-[12px] font-medium text-texto"
            style={{ borderLeftColor: cor, background: corComAlfa(cor, 'var(--alfa-etiqueta)') }}
          >
            {nome.trim() || 'Nome da disciplina'}
          </span>
        </div>
      </form>
    </Dialogo>
  );
}

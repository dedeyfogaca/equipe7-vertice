import { useState } from 'react';
import { Button } from '../ui/botao.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { Field, Input, Textarea } from '../ui/campos.jsx';
import { semErros, validarConteudo } from '../../lib/validacao.js';
import { semErroEm } from '../../lib/utils.js';

/**
 * Cadastro e edição de conteúdo (RN13: pertence a exatamente uma
 * disciplina; é opcional para a atividade). Monte com `key` para reiniciar o formulário.
 */
export function FormConteudo({ aberto, aoMudar, conteudo, disciplina, conteudos, aoSalvar }) {
  const edicao = Boolean(conteudo);
  const [nome, setNome] = useState(conteudo?.nome ?? '');
  const [descricao, setDescricao] = useState(conteudo?.descricao ?? '');
  const [erros, setErros] = useState({});

  const enviar = (evento) => {
    evento.preventDefault();
    const dados = { nome, descricao, disciplinaId: disciplina.id };
    const novosErros = validarConteudo(dados, { conteudos, ignorarId: conteudo?.id ?? null });
    setErros(novosErros);
    if (!semErros(novosErros)) return;
    aoSalvar({ nome: nome.trim(), descricao: descricao.trim() });
  };

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={aoMudar}
      titulo={edicao ? 'Editar conteúdo' : 'Novo conteúdo'}
      descricao={`Um assunto de ${disciplina.nome}, como "SQL" ou "Modelagem". Opcional: serve para ver o progresso por assunto.`}
      rodape={
        <>
          <Button variante="secundaria" onClick={() => aoMudar(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-conteudo">
            {edicao ? 'Salvar' : 'Cadastrar'}
          </Button>
        </>
      }
    >
      <form id="form-conteudo" onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <Field id="nome-conteudo" label="Nome" obrigatorio erro={erros.nome}>
          <Input
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErros((atual) => semErroEm(atual, 'nome'));
            }}
            placeholder="Ex.: Normalização"
            autoComplete="off"
            autoFocus
          />
        </Field>
        <Field id="descricao-conteudo" label="Descrição" dica="Opcional. O que esse conteúdo cobre.">
          <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
      </form>
    </Dialogo>
  );
}

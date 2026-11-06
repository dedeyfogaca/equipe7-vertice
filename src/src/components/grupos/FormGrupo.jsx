import { useState } from 'react';
import { Button } from '../ui/botao.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { Field, Input } from '../ui/campos.jsx';
import { AvatarGrupo } from '../ui/avatar-grupo.jsx';
import { CampoFoto } from '../ui/editor-foto.jsx';
import { FOTO } from '../../lib/foto.js';
import { semErros, validarGrupo } from '../../lib/validacao.js';
import { semErroEm } from '../../lib/utils.js';

export const DICA_FOTO_GRUPO = `Opcional. JPG, PNG ou WebP, até ${FOTO.TAMANHO_MAXIMO_MB} MB. Sem foto, o grupo aparece com as iniciais do nome.`;

/**
 * Edição do grupo: nome, descrição e foto (RN07: só o organizador). Monte
 * com `key` para reiniciar o formulário.
 */
export function FormGrupo({ aberto, aoMudar, grupo, aoSalvar }) {
  const [form, setForm] = useState(() => ({
    nome: grupo?.nome ?? '',
    descricao: grupo?.descricao ?? '',
    foto: grupo?.foto ?? '',
  }));
  const [erros, setErros] = useState({});

  const atualizarCampo = (campo) => (evento) => {
    const valor = evento.target.value;
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => semErroEm(atual, campo));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const novosErros = validarGrupo(form, { exigirCriador: false });
    setErros(novosErros);
    if (!semErros(novosErros)) return;
    aoSalvar({ nome: form.nome.trim(), descricao: form.descricao.trim(), foto: form.foto });
  };

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={aoMudar}
      titulo="Editar grupo"
      descricao="O nome e a foto aparecem para todo o grupo."
      largura={540}
      rodape={
        <>
          <Button variante="secundaria" onClick={() => aoMudar(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-grupo">
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-grupo" onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <CampoFoto
          id="foto-grupo"
          foto={form.foto}
          aoMudar={(foto) => setForm((atual) => ({ ...atual, foto }))}
          forma="quadrado"
          rotulo="Foto do grupo"
          dica={DICA_FOTO_GRUPO}
          previa={<AvatarGrupo grupo={{ nome: form.nome || grupo?.nome, foto: form.foto }} tamanho={72} />}
        />
        <Field id="nome-grupo" label="Nome do grupo" obrigatorio erro={erros.nome}>
          <Input
            value={form.nome}
            onChange={atualizarCampo('nome')}
            placeholder="Ex.: Trio do TCC"
            autoComplete="off"
          />
        </Field>
        <Field id="descricao-grupo" label="Descrição" dica="Opcional. Uma linha sobre o grupo.">
          <Input
            value={form.descricao}
            onChange={atualizarCampo('descricao')}
            placeholder="Ex.: Grupo de Front-End"
            autoComplete="off"
          />
        </Field>
      </form>
    </Dialogo>
  );
}

import { useState } from 'react';
import { Avatar } from '../ui/avatar-membro.jsx';
import { Button } from '../ui/botao.jsx';
import { Dialogo } from '../ui/dialogo.jsx';
import { Field, Input } from '../ui/campos.jsx';
import { CampoFoto } from '../ui/editor-foto.jsx';
import { SelectRico } from '../ui/selecao.jsx';
import { SeletorAvatar } from './SeletorAvatar.jsx';
import { OPCOES_PERFIL } from '../opcoes.jsx';
import { ESTILO_AVATAR_PADRAO, novaSeedAvatar } from '../../lib/avatar.js';
import { PERFIL, rotuloPerfil } from '../../lib/constants.js';
import { FOTO } from '../../lib/foto.js';
import { semErros, validarMembro } from '../../lib/validacao.js';
import { semErroEm } from '../../lib/utils.js';

/**
 * Cadastro e edição de membro, com foto de perfil (RF02/RF19). A foto
 * escolhida passa pelo editor, onde a pessoa enquadra antes de salvar.
 *
 * - `membro` vazio: cadastro; preenchido: edição.
 * - `proprioPerfil`: o participante editando a si mesmo. Ele troca nome,
 *   foto e contato, mas não o perfil (RN07).
 *
 * Monte com `key` para reiniciar o formulário.
 */
export function FormMembro({ aberto, aoMudar, membro, membros, proprioPerfil = false, aoSalvar }) {
  const edicao = Boolean(membro);
  // RN07 — o primeiro membro de um grupo vazio é o organizador (D01).
  const primeiroDoGrupo = !edicao && membros.length === 0;

  const [form, setForm] = useState(() => ({
    nome: membro?.nome ?? '',
    funcao: membro?.funcao ?? '',
    email: membro?.email ?? '',
    // Membros antigos sem semente continuam com o avatar do nome.
    avatar: membro?.avatar || membro?.nome || novaSeedAvatar(),
    estiloAvatar: membro?.estiloAvatar || ESTILO_AVATAR_PADRAO,
    foto: membro?.foto ?? '',
    perfil: membro?.perfil ?? (primeiroDoGrupo ? PERFIL.ORGANIZADOR : PERFIL.PARTICIPANTE),
  }));
  const [erros, setErros] = useState({});

  const atualizarCampo = (campo) => (evento) => {
    const valor = evento.target.value;
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => semErroEm(atual, campo));
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const novosErros = validarMembro(form, { membros, ignorarId: membro?.id ?? null });
    setErros(novosErros);
    if (!semErros(novosErros)) return;
    aoSalvar({
      nome: form.nome.trim(),
      funcao: form.funcao.trim(),
      email: form.email.trim(),
      avatar: form.avatar,
      estiloAvatar: form.estiloAvatar,
      foto: form.foto,
      ...(proprioPerfil ? {} : { perfil: form.perfil }),
    });
  };

  const titulo = proprioPerfil ? 'Editar meu perfil' : edicao ? 'Editar membro' : 'Adicionar membro';

  return (
    <Dialogo
      aberto={aberto}
      aoMudar={aoMudar}
      titulo={titulo}
      descricao={
        proprioPerfil
          ? 'Seu nome e sua foto aparecem nas atividades em que você é responsável.'
          : 'Quem entra no grupo pode ser responsável pelas atividades.'
      }
      largura={560}
      rodape={
        <>
          <Button variante="secundaria" onClick={() => aoMudar(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="form-membro">
            {edicao ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <form id="form-membro" onSubmit={enviar} noValidate className="flex flex-col gap-5">
        <CampoFoto
          id="foto"
          foto={form.foto}
          aoMudar={(foto) => setForm((atual) => ({ ...atual, foto }))}
          previa={
            <Avatar nome={form.nome || 'Novo membro'} seed={form.avatar} estilo={form.estiloAvatar} foto={form.foto} tamanho={72} />
          }
          dica={`JPG, PNG ou WebP, até ${FOTO.TAMANHO_MAXIMO_MB} MB. Você enquadra a foto antes de salvar. Sem foto, vale o avatar.`}
        />

        <SeletorAvatar
          semente={form.avatar}
          estilo={form.estiloAvatar}
          temFoto={Boolean(form.foto)}
          aoEscolherEstilo={(estiloAvatar) => setForm((atual) => ({ ...atual, estiloAvatar }))}
          aoSortear={() => setForm((atual) => ({ ...atual, avatar: novaSeedAvatar() }))}
        />

        <Field id="nome-membro" label="Nome" obrigatorio erro={erros.nome}>
          <Input
            value={form.nome}
            onChange={atualizarCampo('nome')}
            placeholder="Ex.: Ana Souza"
            autoComplete="off"
            autoFocus
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="funcao" label="Função no grupo" dica="Opcional.">
            <Input value={form.funcao} onChange={atualizarCampo('funcao')} placeholder="Ex.: Introdução e revisão" />
          </Field>
          <Field id="email" label="E-mail" dica="Opcional." erro={erros.email}>
            <Input type="email" value={form.email} onChange={atualizarCampo('email')} placeholder="ana@exemplo.com" />
          </Field>
        </div>

        {/* RN07 — o perfil decide quem gerencia membros, disciplinas e
            conteúdos. O participante cadastra e edita atividades. */}
        {proprioPerfil ? (
          <p className="text-sm text-sutil">
            Perfil: <strong className="font-semibold text-texto">{rotuloPerfil(form.perfil)}</strong>. Só o
            organizador muda perfis.
          </p>
        ) : (
          <Field
            id="perfil"
            label="Perfil"
            erro={erros.perfil}
            dica={
              primeiroDoGrupo
                ? 'O primeiro membro do grupo é o organizador.'
                : 'O organizador gerencia membros, disciplinas e conteúdos.'
            }
          >
            <SelectRico
              valor={form.perfil}
              aoMudar={(perfil) => {
                setForm((atual) => ({ ...atual, perfil }));
                setErros((atual) => semErroEm(atual, 'perfil'));
              }}
              opcoes={OPCOES_PERFIL}
              disabled={primeiroDoGrupo}
            />
          </Field>
        )}
      </form>
    </Dialogo>
  );
}

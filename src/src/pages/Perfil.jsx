import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Save } from 'lucide-react';

import { useData } from '../context/DataContext.jsx';
import { useConta } from '../context/ContaContext.jsx';
import { useTitulo } from '../hooks/useTitulo.js';
import { Avatar } from '../components/ui/avatar-membro.jsx';
import { Card, PageHeader } from '../components/ui/basicos.jsx';
import { Button } from '../components/ui/botao.jsx';
import { Field, Input, Interruptor } from '../components/ui/campos.jsx';
import { CampoFoto } from '../components/ui/editor-foto.jsx';
import { SeletorAvatar } from '../components/membros/SeletorAvatar.jsx';
import { ESTILO_AVATAR_PADRAO, novaSeedAvatar } from '../lib/avatar.js';
import { FOTO } from '../lib/foto.js';
import { semErros, validarPerfil } from '../lib/validacao.js';
import { plural } from '../lib/utils.js';

// Meu perfil (RF35): o nome, o avatar e a foto da conta, que valem em todos
// os grupos de uma vez (pedido da equipe, 11/11/2026: antes a foto mudava só
// no grupo aberto). Com conta, também o lembrete diário por e-mail (RF36).
export default function Perfil() {
  useTitulo('Meu perfil');
  const { perfil, salvarPerfil, meusMembros, grupos } = useData();
  const { modo, usuario } = useConta();
  const comConta = modo === 'conta';

  const [form, setForm] = useState(() => ({
    nome: perfil?.nome ?? '',
    avatar: perfil?.avatar || perfil?.nome || novaSeedAvatar(),
    estiloAvatar: perfil?.estiloAvatar || ESTILO_AVATAR_PADRAO,
    foto: perfil?.foto ?? '',
    lembreteEmail: Boolean(perfil?.lembreteEmail),
  }));
  const [erros, setErros] = useState({});

  if (!perfil) return null;

  const gruposDaPessoa = meusMembros.filter((m) => grupos.some((g) => g.id === m.grupoId && !g.pessoal)).length;

  const enviar = (evento) => {
    evento.preventDefault();
    const novosErros = validarPerfil(form);
    setErros(novosErros);
    if (!semErros(novosErros)) {
      document.getElementById('nome-perfil')?.focus();
      return;
    }
    salvarPerfil({ ...form, nome: form.nome.trim() });
    toast.success('Perfil salvo', {
      description: gruposDaPessoa > 0 ? `Já vale no espaço pessoal e em ${plural(gruposDaPessoa, 'grupo')}.` : 'Já vale no seu espaço pessoal.',
    });
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        titulo="Meu perfil"
        subtitulo="O seu nome e a sua foto aparecem iguais em todos os grupos de que você participa."
      />

      <form onSubmit={enviar} noValidate className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-6">
        <Card className="flex flex-col gap-5 p-6 sm:p-7">
          <CampoFoto
            id="foto-perfil"
            foto={form.foto}
            aoMudar={(foto) => setForm((atual) => ({ ...atual, foto }))}
            previa={
              <Avatar nome={form.nome || 'Você'} seed={form.avatar} estilo={form.estiloAvatar} foto={form.foto} tamanho={72} />
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
          <Field id="nome-perfil" label="Nome" obrigatorio erro={erros.nome}>
            <Input
              value={form.nome}
              onChange={(evento) => {
                const nome = evento.target.value;
                setForm((atual) => ({ ...atual, nome }));
                setErros({});
              }}
              placeholder="Ex.: Ana Souza"
              autoComplete="name"
            />
          </Field>
          {comConta && (
            <p className="text-[13px] text-sutil">
              Conta: <strong className="font-semibold text-texto">{usuario?.email}</strong>
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          {comConta && (
            <Card className="flex flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primaria-barra/10 text-primaria-texto">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <label htmlFor="lembrete" className="text-[15px] font-semibold text-forte">
                      Lembrete por e-mail
                    </label>
                    <p className="text-[14px] leading-relaxed text-sutil">
                      Uma vez por dia, de manhã, as atividades que estão com você e vencem em até 2 dias ou já
                      venceram. Sem nada perto do prazo, nada chega.
                    </p>
                  </div>
                </div>
                <Interruptor
                  id="lembrete"
                  ligado={form.lembreteEmail}
                  aoMudar={(lembreteEmail) => setForm((atual) => ({ ...atual, lembreteEmail }))}
                />
              </div>
            </Card>
          )}
          <Button type="submit" tamanho="lg" className="w-full">
            <Save aria-hidden="true" />
            Salvar perfil
          </Button>
        </div>
      </form>
    </div>
  );
}

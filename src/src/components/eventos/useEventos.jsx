import { useState } from 'react';
import { toast } from 'sonner';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { usePermissoes } from '../../hooks/usePermissoes.js';
import { Button } from '../ui/botao.jsx';
import { Confirmacao } from '../ui/dialogo.jsx';
import { MenuConteudo, MenuGatilho, MenuItem, MenuRaiz } from '../ui/flutuantes.jsx';
import { FormEvento } from './FormEvento.jsx';
import { ddmm } from '../../lib/formatos.js';

/**
 * Cadastrar, editar e excluir eventos (RF31) de qualquer tela: a página de
 * eventos, o calendário e o painel usam o mesmo formulário e a mesma
 * confirmação. Devolve as ações e os elementos a renderizar (`janelas`).
 */
export function useEventos() {
  const { grupoAtivo } = useAuth();
  const { criarEvento, atualizarEvento, removerEvento, disciplinasDoGrupo, grupos, meusMembros, meuMembroEm } = useData();
  const { podeEditarEvento } = usePermissoes();

  // `formulario`: null, { data } (novo) ou { evento } (edição).
  const [formulario, setFormulario] = useState(null);
  const [removendo, setRemovendo] = useState(null);
  // RF34: o evento novo pode ir para o espaço pessoal ou para um dos grupos.
  const espacos = grupos.filter((g) => meusMembros.some((m) => m.grupoId === g.id));

  const salvar = (dados) => {
    if (formulario?.evento) {
      const { grupoId: _mesmoGrupo, ...resto } = dados;
      atualizarEvento(formulario.evento.id, resto);
      toast.success('Evento atualizado', { description: dados.titulo.trim() });
    } else {
      const grupoId = dados.grupoId || grupoAtivo.id;
      const novo = criarEvento({ ...dados, grupoId, criadoPor: meuMembroEm(grupoId)?.id ?? '' });
      const outro = grupoId !== grupoAtivo.id ? grupos.find((g) => g.id === grupoId) : null;
      toast.success('Evento cadastrado', {
        description: `${novo.titulo}, ${ddmm(novo.data)}${outro ? `, em ${outro.pessoal ? 'Pessoal' : outro.nome}` : ''}`,
      });
    }
    setFormulario(null);
  };

  const confirmarRemocao = () => {
    removerEvento(removendo.id);
    toast('Evento excluído', { description: removendo.titulo });
    setRemovendo(null);
  };

  /** Menu "..." do evento, só para quem pode mexer nele. */
  const menuDoEvento = (evento) =>
    podeEditarEvento(evento) ? (
      <MenuRaiz>
        <MenuGatilho asChild>
          <Button variante="fantasma" tamanho="icone-sm" aria-label={`Ações de ${evento.titulo}`}>
            <Ellipsis />
          </Button>
        </MenuGatilho>
        <MenuConteudo align="end" className="min-w-[180px]">
          <MenuItem onSelect={() => setFormulario({ evento })}>
            <Pencil aria-hidden="true" />
            Editar
          </MenuItem>
          <MenuItem perigo onSelect={() => setRemovendo(evento)}>
            <Trash2 aria-hidden="true" />
            Excluir
          </MenuItem>
        </MenuConteudo>
      </MenuRaiz>
    ) : null;

  const janelas = (
    <>
      {formulario && (
        <FormEvento
          key={formulario.evento?.id ?? `novo-${formulario.data ?? ''}`}
          aberto
          aoMudar={(abrir) => !abrir && setFormulario(null)}
          evento={formulario.evento}
          dataInicial={formulario.data}
          grupoInicial={grupoAtivo.id}
          espacos={espacos}
          disciplinasDe={disciplinasDoGrupo}
          aoSalvar={salvar}
        />
      )}
      <Confirmacao
        aberto={Boolean(removendo)}
        titulo="Excluir evento?"
        mensagem={removendo ? `${removendo.titulo} (${ddmm(removendo.data)}) sai do calendário.` : ''}
        textoConfirmar="Excluir"
        perigo
        onConfirmar={confirmarRemocao}
        onCancelar={() => setRemovendo(null)}
      />
    </>
  );

  return {
    novoEvento: (data = '') => setFormulario({ data }),
    editarEvento: (evento) => setFormulario({ evento }),
    menuDoEvento,
    janelas,
  };
}

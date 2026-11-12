import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../context/AuthContext.jsx';
import { useConta } from '../../context/ContaContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { Button } from '../ui/botao.jsx';
import { Confirmacao, Dialogo } from '../ui/dialogo.jsx';
import { atividadesQueFicamSemDono, motivoParaNaoSair } from '../../lib/registro.js';
import { plural } from '../../lib/utils.js';

// Sair do grupo (RF39, RN28), para qualquer membro. Antes de confirmar, diz
// o que acontece com as atividades. Quando a saída não é possível (último
// organizador, ou a pessoa está sozinha no grupo), explica o que fazer.
export function SairDoGrupo({ aberto, aoMudar }) {
  const { grupoAtivo, membroAtivo, membrosDoGrupoAtivo, noEspacoPessoal, sair } = useAuth();
  const { atividadesDoGrupo, sairDoGrupo } = useData();
  const { modo } = useConta();
  const navigate = useNavigate();
  const [saindo, setSaindo] = useState(false);

  if (!aberto || !grupoAtivo) return null;

  const motivo = motivoParaNaoSair(membrosDoGrupoAtivo, membroAtivo, { pessoal: noEspacoPessoal });
  const fechar = () => aoMudar(false);

  if (motivo) {
    const sozinho = /única pessoa/.test(motivo);
    return (
      <Dialogo
        aberto
        aoMudar={aoMudar}
        titulo="Ainda não dá para sair"
        descricao={motivo}
        largura={460}
        rodape={
          <>
            <Button variante="secundaria" onClick={fechar}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                fechar();
                navigate('/membros');
              }}
            >
              {sozinho ? 'Ir para Excluir o grupo' : 'Abrir Membros'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-sutil">
          {sozinho
            ? 'Sem ninguém, o grupo ficaria sem dono. A exclusão fica no pé da tela Membros.'
            : 'Em Membros, edite o perfil de alguém para organizador. Depois disso, a saída fica liberada.'}
        </p>
      </Dialogo>
    );
  }

  const soltas = atividadesQueFicamSemDono(atividadesDoGrupo(grupoAtivo.id), membroAtivo.id).length;
  const mensagem = [
    'Você deixa de ver o grupo e tudo o que está nele.',
    soltas > 0
      ? `${soltas === 1 ? 'A atividade em aberto que está com você fica' : `As ${soltas} atividades em aberto que estão com você ficam`} “A definir”, para alguém do grupo assumir.`
      : '',
    'As atividades concluídas e as conquistas continuam no seu nome.',
    modo === 'conta'
      ? 'Para voltar, peça um novo convite a quem organiza o grupo.'
      : 'Na demonstração, o grupo sai do seu seletor de espaço.',
  ]
    .filter(Boolean)
    .join(' ');

  const confirmar = async () => {
    setSaindo(true);
    try {
      const n = await sairDoGrupo(grupoAtivo.id);
      fechar();
      sair();
      navigate('/painel');
      toast.success(`Você saiu de ${grupoAtivo.nome}`, {
        description: n > 0 ? `${plural(n, 'atividade')} ${n === 1 ? 'ficou' : 'ficaram'} “A definir”.` : undefined,
      });
    } catch (e) {
      toast.error('Não foi possível sair do grupo', { description: e.message });
    } finally {
      setSaindo(false);
    }
  };

  return (
    <Confirmacao
      aberto
      titulo={`Sair de ${grupoAtivo.nome}?`}
      mensagem={mensagem}
      textoConfirmar={saindo ? 'Saindo…' : 'Sair do grupo'}
      perigo
      podeConfirmar={!saindo}
      onConfirmar={confirmar}
      onCancelar={fechar}
    />
  );
}

# 07 · Requisitos Não Funcionais

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2 (revisão da Entrega 1)

---

| ID | Descrição | Categoria | Prioridade | Dependência |
|---|---|---|---|---|
| **RNF01** | O sistema deve ser responsivo, adaptando o layout a telas de celular, tablet e computador. | Responsividade | Alta | Nenhuma |
| **RNF02** | O sistema deve preservar todos os dados cadastrados após o recarregamento ou fechamento da página. | Disponibilidade | Alta | Nenhuma |
| **RNF03** | O sistema deve apresentar mensagem de erro específica por campo sempre que um formulário for enviado com dados inválidos. | Usabilidade | Alta | RF02, RF03 |
| **RNF04** | O sistema deve responder às ações de busca, filtro e ordenação em até 1 segundo. | Desempenho | Alta | RF04 |
| **RNF05** | O sistema deve funcionar nas versões atuais dos navegadores Chrome, Firefox e Edge. | Compatibilidade | Média | Nenhuma |
| **RNF06** | O sistema deve manter padronização visual de cores, tipografia, botões e campos em todas as telas, e as animações devem respeitar a opção de reduzir movimento do sistema operacional. | Usabilidade | Média | Nenhuma |
| **RNF07** | O sistema deve exibir mensagem orientativa quando uma listagem não possuir registros. | Usabilidade | Média | RF04 |
| **RNF08** | O sistema deve recalcular e exibir o progresso, a experiência e a ofensiva em até 1 segundo após a alteração do status de uma atividade. | Desempenho | Alta | RF10, RF15, RF16 |
| **RNF09** | O sistema deve representar o progresso e o status com valor textual ou numérico além da cor, permitindo a leitura por usuários com daltonismo. | Acessibilidade | Média | RF10, RF11 |
| **RNF10** | O sistema deve permanecer utilizável quando um serviço externo estiver indisponível, substituindo o recurso afetado por alternativa local e informando o usuário quando a substituição for perceptível. | Disponibilidade | Alta | RF07, RF21 |

---

### Navegação

[⬅ Anterior: Requisitos Funcionais](06-requisitos-funcionais.md) · [Índice](../README.md) · [Próximo: Regras de Negócio ➡](08-regras-de-negocio.md)

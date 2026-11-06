# 08 · Regras de Negócio

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2 (revisão da Entrega 1), atualizado em 06/11/2026

---

| ID | Descrição | Prioridade | Dependência |
|---|---|---|---|
| **RN01** | Cada grupo enxerga exclusivamente as disciplinas, os conteúdos, os membros, as atividades e os eventos vinculados a ele. | Alta | RF01 |
| **RN02** | A exclusão de um grupo remove, em cascata, suas disciplinas, conteúdos, membros, atividades, eventos e conquistas; a exclusão de uma disciplina remove seus conteúdos e as suas atividades, e os eventos ligados a ela continuam no grupo, sem disciplina; a exclusão de um conteúdo mantém as atividades dele na disciplina, sem conteúdo; a exclusão de um membro responsável por atividades exige indicar outro membro do grupo, que passa a ser o responsável por elas. | Alta | RF01, RF02, RF13, RF14, RF31 |
| **RN03** | O responsável atribuído a uma atividade deve ser um membro do grupo ao qual a atividade pertence. | Alta | RF03 |
| **RN04** | O status de uma atividade deve ser obrigatoriamente um entre "a fazer", "fazendo" e "concluído"; toda atividade criada sem status definido inicia como "a fazer". | Alta | RF03 |
| **RN05** | Uma atividade é considerada atrasada quando seu prazo é anterior à data atual e seu status é diferente de "concluído". | Alta | RF03 |
| **RN06** | O título, a disciplina, o prazo e o responsável da atividade são obrigatórios; o título deve conter no mínimo 3 caracteres e o prazo deve corresponder a uma data válida. | Alta | RF03 |
| **RN07** | Apenas o estudante organizador pode editar e excluir o grupo, gerenciar seus membros, gerenciar disciplinas e conteúdos e editar ou excluir atividades de qualquer integrante; os demais integrantes podem cadastrar atividades, editar e excluir as atividades sob sua responsabilidade e editar o próprio perfil. Quem cria o grupo entra nele como organizador, o primeiro membro de um grupo sem membros é sempre organizador, e o último organizador não pode ser rebaixado nem removido. | Alta | RF01, RF02, RF13, RF30 |
| **RN08** | O progresso de um conteúdo corresponde à razão entre o peso das atividades concluídas e o peso total das atividades previstas; conteúdos sem atividades cadastradas não entram no cálculo. | Alta | RF10 |
| **RN09** | O peso de uma atividade deve ser um número inteiro entre 1 e 5; atividades criadas sem peso definido recebem peso 1. | Alta | RF03 |
| **RN10** | A conclusão de uma atividade credita ao responsável experiência equivalente ao peso da atividade multiplicado por 10. O crédito ocorre uma única vez por atividade e é estornado caso o status deixe de ser "concluído". | Alta | RF15 |
| **RN11** | A ofensiva de um estudante corresponde ao número de dias consecutivos, contados até a data atual, em que ele concluiu ao menos uma atividade. Um dia sem nenhuma conclusão zera a ofensiva; o dia atual fica em aberto até terminar, e a falta de conclusão nele ainda não zera a contagem. | Média | RF16 |
| **RN12** | Uma conquista é concedida uma única vez por estudante, no instante em que o marco correspondente é atingido, e não é revogada por alterações posteriores. | Média | RF17 |
| **RN13** | Toda atividade deve estar vinculada a exatamente uma disciplina do seu grupo e, se o grupo quiser, a um conteúdo dessa mesma disciplina; todo conteúdo pertence a exatamente uma disciplina. Excluir um conteúdo não exclui as suas atividades: elas continuam na disciplina, sem conteúdo. | Alta | RF03, RF14 |
| **RN14** | O progresso de uma disciplina corresponde à razão entre o peso das atividades concluídas da disciplina, estejam elas num conteúdo ou não, e o peso total dessas atividades; disciplinas sem atividades cadastradas não entram no cálculo. Essa razão é a forma de agregação prevista no RF11: conteúdos com mais peso pesam mais no resultado da disciplina. | Alta | RF11 |
| **RN15** | A semente do avatar é sorteada pelo sistema, e não derivada do nome, para que o membro possa trocar de avatar sem trocar de nome. O avatar é desenhado pelo próprio sistema a partir da semente e do estilo escolhido, sem depender de serviço externo. Quando o membro tem foto de perfil, a foto é exibida no lugar do avatar. Quando nenhuma das duas imagens puder ser exibida, o sistema exibe as iniciais do nome do membro. | Baixa | RF19, RF24 |
| **RN16** | A urgência do prazo de uma atividade não concluída é classificada pela quantidade de dias até a data atual: acima de sete dias é normal, de três a sete dias é próxima, e dois dias ou menos é crítica. Prazo anterior à data atual caracteriza atraso (RN05). | Média | RF04, RF22 |
| **RN17** | Os feriados nacionais são obtidos de serviço externo. Em caso de falha ou demora na fonte principal, o sistema consulta a fonte reserva; falhando as duas, reutiliza a última relação obtida com sucesso; não havendo nenhuma, omite a sinalização e informa que ela está indisponível. | Média | RF07, RF21 |
| **RN18** | A cor de uma disciplina deve ser uma das 18 cores da paleta do sistema. Ao cadastrar uma disciplina, o sistema sugere uma cor ainda não usada pelo grupo. | Média | RF13, RF25 |
| **RN19** | A foto de perfil e a foto do grupo devem ser imagens JPG, PNG ou WebP de até 8 MB. Antes de gravá-la, o sistema permite ajustar o enquadramento (posição e zoom de até 4 vezes, sem deixar área vazia na moldura) e reduz a área enquadrada para 256 × 256 pixels. Sem foto, o grupo é identificado pelas iniciais do seu nome. | Média | RF24, RF29 |
| **RN20** | Somente o responsável por uma atividade pode alterar o seu status, o que inclui concluí-la e reabri-la; nenhum outro integrante, nem o organizador, altera o status da atividade de outra pessoa. Uma atividade cadastrada para outro integrante inicia como "a fazer". | Alta | RF03, RF05, RF15 |
| **RN21** | Todo evento deve ter nome, tipo e dia. O horário de fim só pode ser informado junto com o de início e deve ser posterior a ele; sem horário, o evento vale para o dia todo. Qualquer integrante pode cadastrar eventos; editar e excluir um evento cabe a quem o cadastrou e ao organizador. O evento passa para a lista de passados no dia seguinte à sua data. | Média | RF31 |

---

## Marcos das conquistas (referência da RN12)

| Código | Conquista | Condição |
|---|---|---|
| `PRIMEIRO_PASSO` | Primeiro Passo | Concluir a primeira atividade |
| `CONTEUDO_DOMINADO` | Conteúdo Dominado | Levar um conteúdo a 100% de progresso |
| `DISCIPLINA_FECHADA` | Disciplina Fechada | Levar uma disciplina a 100% de progresso |
| `SEMANA_CHEIA` | Semana Cheia | Alcançar ofensiva de 7 dias |
| `MES_CHEIO` | Mês Cheio | Alcançar ofensiva de 30 dias |
| `MEIO_MILHAR` | Meio Milhar | Acumular 500 pontos de experiência |

---

### Navegação

[⬅ Anterior: Requisitos Não Funcionais](07-requisitos-nao-funcionais.md) · [Índice](../README.md) · [Próximo: Histórico de Alterações ➡](09-historico-de-alteracoes.md)

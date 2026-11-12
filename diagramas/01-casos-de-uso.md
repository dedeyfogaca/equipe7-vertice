# Diagrama de Casos de Uso

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Entrega 2 · Modelagem do Software · Equipe 7 · atualizado em 12/11/2026

---

O diagrama apresenta os atores do sistema e as funcionalidades que cada um utiliza. O retângulo delimita a fronteira do Vértice: o que está dentro é responsabilidade do sistema, o que está fora são os atores.

O **Estudante Organizador** herda todas as funcionalidades do **Estudante Participante** e acrescenta a gestão da estrutura do grupo.

Os cinco círculos tracejados à direita são **atores secundários**: nenhum deles inicia funcionalidade alguma, apenas respondem quando o sistema os consulta. O boneco palito fica reservado ao ator que é pessoa; serviço de software aparece como círculo, com o estereótipo «sistema externo». A **BrasilAPI** fornece os feriados nacionais e a **Nager.Date** é a fonte reserva, acionada quando a primeira falha ou demora (RN17). O **Supabase** confere a conta e guarda o convite, e o **Google** confirma quem entra com a conta Google. O Supabase também guarda os dados de todos os casos de uso quando o estudante usa conta; a ligação aparece só nos dois casos em que ele faz algo além de guardar, para o diagrama continuar legível.

O **Brevo**, que entrou em 11/11/2026, entrega o e-mail do lembrete diário (UC21). Quem inicia o UC21 é o agendamento do próprio banco, todo dia; o estudante é o ator principal porque é para ele que o caso existe, e ele o liga ou desliga em Meu perfil (UC18).

Até 01/11/2026 a **DiceBear** também aparecia aqui, ligada ao UC02, porque gerava as imagens de avatar pela internet. Desde então os avatares são desenhados pelo próprio sistema, com a biblioteca da DiceBear instalada junto com ele, e ela deixou de ser ator (RF19, RN15).

![Diagrama de casos de uso do Vértice](png/casos-de-uso.png)

> Desenho-fonte: [`svg/casos-de-uso.svg`](svg/casos-de-uso.svg) · Imagem para o documento: [`png/casos-de-uso.png`](png/casos-de-uso.png)

Entre os diagramas de modelagem, este é o único desenhado em SVG e não em Mermaid. O Mermaid não possui a forma de ator da UML (o boneco palito), e usar a mesma forma para a pessoa e para o serviço externo apagaria justamente a distinção que o diagrama precisa mostrar. O SVG é texto, fica versionado como os demais e usa a mesma paleta e a mesma tipografia dos outros diagramas, descritas na [identidade visual](00-identidade-visual.md).

---

## Correspondência entre casos de uso e requisitos

| Caso de uso | Requisitos atendidos | Ator principal |
|---|---|---|
| UC01 · Gerenciar grupo de estudo | RF01, RF09, RF26, RF29, RF32 | Estudante Organizador |
| UC02 · Gerenciar membros | RF02, RF19, RF24 | Estudante Organizador |
| UC16 · Convidar para o grupo | RF28 | Estudante Organizador |
| UC03 · Gerenciar disciplinas | RF13, RF25 | Estudante Organizador |
| UC04 · Gerenciar conteúdos | RF14 | Estudante Organizador |
| UC12 · Carregar dados de exemplo | RF20, RF33 | Estudante Organizador |
| UC15 · Entrar com conta | RF27 | Estudante Participante |
| UC17 · Usar o espaço pessoal | RF34 | Estudante Participante |
| UC18 · Editar o perfil | RF24, RF35 | Estudante Participante |
| UC22 · Sair do grupo | RF39 | Estudante Participante |
| UC05 · Cadastrar atividade | RF03, RF30 | Estudante Participante |
| UC20 · Cadastrar e alterar em lote | RF37 | Estudante Participante (a troca de responsável, o Organizador) |
| UC06 · Consultar atividades | RF04, RF05, RF07, RF22 | Estudante Participante |
| UC19 · Assumir atividade | RF38 | Estudante Participante |
| UC07 · Concluir atividade | RF05, RF15, RF16, RF17 | Estudante Participante |
| UC08 · Acompanhar progresso | RF06, RF07, RF10, RF11, RF12, RF21, RF22 | Estudante Participante |
| UC13 · Consultar calendário | RF07, RF23 | Estudante Participante |
| UC14 · Gerenciar eventos | RF31 | Estudante Participante |
| UC09 · Consultar painel de desempenho | RF18 | Estudante Participante |
| UC23 · Consultar o histórico do grupo | RF40 | Estudante Participante |
| UC21 · Receber lembrete por e-mail | RF36 | Estudante Participante |
| UC10 · Alternar tema | RF08 | Estudante Participante |
| UC11 · Encerrar sessão | RF09 | Estudante Participante |

Todos os quarenta requisitos funcionais aparecem em pelo menos um caso de uso. O tutorial (RF33) é oferecido no painel na primeira visita e fica ligado ao UC12 porque é ali que quem está conhecendo o sistema chega a ele.

| Ator secundário | Casos de uso | Requisito |
|---|---|---|
| BrasilAPI | UC06, UC08, UC13 | RF07, RF21, RF23 |
| Nager.Date | UC06, UC08, UC13 | RF07, RF21, RF23 |
| Supabase | UC15, UC16 | RF27, RF28 |
| Google | UC15 | RF27 |
| Brevo | UC21 | RF36 |

---

### Navegação

[Índice](../README.md) · [Especificação dos casos de uso](../docs/10-casos-de-uso.md) · [Próximo diagrama: Classes ➡](02-classes.md)

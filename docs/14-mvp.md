# 14 · Produto Mínimo Viável

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 3, atualizado em 08/11/2026

---

## O critério usado

O Vértice existe para responder uma pergunta: **o quanto o estudante já avançou em cada disciplina**. Tudo o que é preciso para responder isso do início ao fim é indispensável. Tudo o que torna a resposta mais rica, mas não a produz, é desejável.

Por esse critério, o MVP é o ciclo que vai de cadastrar a estrutura de estudo até ver a barra de progresso se mover, mais a experiência creditada na conclusão, que é o retorno imediato do esforço.

O que **não** entrou no MVP não entrou por ser menos importante, e sim por não ser necessário para o ciclo fechar. A ofensiva de dias consecutivos, por exemplo, só faz sentido depois de existirem várias conclusões ao longo do tempo: ela não tem o que medir numa primeira versão.

---

## Classificação dos requisitos

| Requisito | Classificação | No MVP? | Justificativa |
|---|---|---|---|
| **RF01**: Criar, selecionar e excluir grupos | Indispensável | Sim | É a porta de entrada. Sem grupo não existe nada mais |
| **RF02**: Gerenciar membros | Indispensável | Sim | A atividade precisa de responsável para creditar experiência |
| **RF13**: Gerenciar disciplinas | Indispensável | Sim | É a unidade em que o progresso é lido |
| **RF14**: Gerenciar conteúdos | Indispensável | Sim | É onde o progresso é calculado; sem ele não há onde ancorar a atividade |
| **RF03**: Cadastrar atividade com peso | Indispensável | Sim | O peso é o que transforma execução em medida |
| **RF04**: Listar com busca, filtros e ordenação | Indispensável | Sim | Com poucas atividades seria dispensável; com um semestre inteiro, não |
| **RF05**: Detalhe e alteração de status | Indispensável | Sim | É onde a conclusão acontece |
| **RF06**: Painel com totais e atrasadas | Indispensável | Sim | Primeira tela da sessão; é ela que responde "como estamos" |
| **RF10**: Progresso por conteúdo | Indispensável | Sim | O cálculo central do produto |
| **RF11**: Progresso por disciplina | Indispensável | Sim | A leitura que o estudante procura |
| **RF15**: Experiência por atividade concluída | Indispensável | Sim | Retorno imediato da conclusão. Sem ele, concluir não devolve nada ao estudante |
| **RF09**: Encerrar sessão | Indispensável | Sim | Trocar de grupo exige sair do atual |
| **RF19**: Avatar do membro | Indispensável | Sim | Já implementado. Identifica quem é quem nas listagens sem custo adicional |
| **RF20**: Carregar dados de exemplo | Indispensável | Sim | Já implementado. É como alguém conhece o sistema sem cadastrar nada antes |
| **RF08**: Tema claro e escuro | Indispensável | Sim | Já implementado e prototipado nos dois temas. Removê-lo do MVP custaria retrabalho para tirar algo que funciona |
| **RF16**: Ofensiva de dias consecutivos | Desejável | Não | Precisa de histórico de vários dias para ter o que mostrar |
| **RF17**: Conquistas por marcos | Desejável | Não | Depende de experiência e ofensiva já acumuladas |
| **RF18**: Painel de desempenho do grupo | Desejável | Não | Comparação entre integrantes; depende de RF16 e RF17 |
| **RF12**: Histórico de progresso ao longo do tempo | Desejável | Não | Só tem o que exibir depois de semanas de uso |
| **RF07**: Sinalizar prazo em feriado | Desejável | Não | Conveniência; a data continua visível sem isso |
| **RF21**: Relação dos próximos feriados | Desejável | Não | Mesma razão do RF07 |
| **RF22**: Sinalizar prazo em fim de semana | Desejável | Não | Mesma razão do RF07 |
| **RF23**: Calendário com as entregas nas cores das disciplinas | Desejável | Não | Outra forma de ver os prazos que a lista e o painel já mostram |
| **RF24**: Foto de perfil do membro | Desejável | Não | O avatar sorteado (RF19) já identifica cada membro |
| **RF25**: Paleta de cores das disciplinas | Desejável | Não | A cor ajuda a reconhecer a disciplina, mas o nome já a identifica |
| **RF26**: Páginas públicas de apresentação | Desejável | Não | Apresentam o produto e a equipe; não fazem parte do ciclo |
| **RF27**: Acesso com conta Google ou e-mail | Desejável | Não | Depende do banco de dados; sem ele, o acesso por seleção do grupo atende ao ciclo |
| **RF28**: Convite para o grupo por link ou código | Desejável | Não | Depende do acesso com conta (RF27) |
| **RF29**: Foto do grupo | Desejável | Não | As iniciais do nome já identificam o grupo |
| **RF30**: Criar conteúdo a partir do formulário de atividade | Desejável | Não | Atalho: o conteúdo pode ser cadastrado antes, na tela de disciplinas |
| Persistência em banco de dados | Desejável | Não | O modelo lógico já existe; a troca da camada de acesso para o PostgreSQL do Supabase está planejada para 27/11 |
| Notificações por e-mail ou push | Futura | Não | Exige servidor, que esta versão não tem |
| Exportação de relatórios | Futura | Não | Nenhum requisito do bimestre depende disso |
| Aplicativo móvel nativo | Futura | Não | A interface responsiva (RNF01) já cobre o uso em celular |

**Resumo:** 15 requisitos no MVP, 15 requisitos desejáveis, a persistência em banco de dados e 3 itens de escopo deixados para o futuro.

---

## O fluxo completo

O fluxo abaixo pode ser executado do início ao fim com o que está no MVP. É ele que será demonstrado na apresentação.

```
Entrar no grupo  →  Cadastrar disciplina  →  Cadastrar conteúdo
                                                     ↓
                                            Cadastrar atividade
                                            (conteúdo, peso, prazo, responsável)
                                                     ↓
                                            Concluir a atividade
                                                     ↓
                    Progresso do conteúdo sobe  →  Progresso da disciplina sobe
                                                     ↓
                                            Experiência creditada ao responsável
```

### O que participa de cada passo

| Passo | Requisitos | Caso de uso | Entidades | Tela |
|---|---|---|---|---|
| Entrar no grupo | RF01 | UC01 | `grupo` | Acesso |
| Cadastrar disciplina | RF13 | UC03 | `grupo`, `disciplina` | Disciplinas |
| Cadastrar conteúdo | RF14 | UC04 | `disciplina`, `conteudo` | Disciplinas |
| Cadastrar atividade | RF03 | UC05 | `atividade`, `conteudo`, `membro` | Nova atividade |
| Concluir a atividade | RF05, RF15 | UC07 | `atividade`, `membro` | Detalhe da atividade |
| Ver o progresso subir | RF06, RF10, RF11 | UC08 | `conteudo`, `disciplina`, `atividade` | Painel |

### Por que esse fluxo e não outro

Ele atravessa as três camadas do domínio (estrutura, execução e medida) e termina onde o produto entrega o seu valor. Um fluxo que parasse em "cadastrar atividade" demonstraria um gerenciador de tarefas. É o passo seguinte, a barra se movendo, que demonstra o Vértice.

O momento decisivo é a conclusão. Ali, uma ação isolada do estudante vira três coisas ao mesmo tempo: progresso no conteúdo, progresso na disciplina e experiência acumulada. É a única tela em que se vê, junto, o que o sistema faz com o que a pessoa fez.

---

## Situação da construção

As 24 tarefas do 1º bimestre no [backlog](12-backlog.md) estão concluídas. As 6 do caminho crítico (as que separavam um gerenciador de tarefas de um sistema que mede aprendizagem) foram executadas nesta ordem:

| Tarefa | O que entrou |
|---|---|
| T06, T07 | Disciplina e conteúdo como cadastros próprios, com tela e formulário |
| T13 | Vínculo obrigatório da atividade a um conteúdo (RN13); desde a revisão de 03/11, a atividade fica ligada direto à disciplina, e o conteúdo é opcional (T67) |
| T12 | Campo peso, escala de 1 a 5, padrão 1 (RN09) |
| T18, T19 | Progresso por conteúdo e por disciplina, por razão de pesos somados (RN08, RN14) |
| T21 | Crédito e estorno de experiência, `peso × 10` (RN10) |

As vinte e três regras de negócio estão implementadas. A **RN11** (ofensiva) e a **RN12** (conquistas), que ficaram fora do MVP, entraram para 06/11; a ofensiva usa a data de conclusão que a atividade já gravava.

A **T24**, que estava parcial, foi absorvida pela nova identidade visual (T27), aplicada a todas as telas.

### A migração dos dados

A troca de formato não podia apagar o que quem já usava o sistema tinha feito. A atividade guardava a disciplina como texto livre; o modelo alvo exige a cadeia atividade → conteúdo → disciplina → grupo.

A conversão cria uma disciplina para cada nome distinto que aparecia nas atividades, um conteúdo "Geral" dentro de cada uma para recebê-las, atribui peso 1 às que não tinham (RN09) e define o perfil dos membros (RN07). Roda uma vez só, controlada por um marcador de versão gravado junto com os dados.

A revisão de 28/10 acrescentou um segundo passo: a atividade sem responsável passa para o organizador do grupo (RN06), e a cor de disciplina que saiu da paleta vira a equivalente (RN18). Atividade antiga cujo grupo não existe mais não é convertida nem apagada, e a pessoa é avisada uma vez.

A revisão de 03/11 acrescentou o terceiro passo: cada atividade passa a guardar a sua disciplina (RN13); o conteúdo "Geral" criado automaticamente pelo primeiro passo sai, e as atividades dele ficam direto na disciplina; e o estilo de avatar que saiu da lista vira Rabisco (RN15). Nenhuma atividade é apagada.

## Recorte da entrega de 27/11/2026

Para 27/11 o manual pede o software funcionando e a apresentação de todos os integrantes. É a versão final: o que ficou de fora em 06/11, por depender do banco de dados, foi implementado, e o sistema passou a funcionar com conta, com os dados do grupo compartilhados entre os integrantes. Os 33 requisitos funcionais estão implementados.

### O que funciona e será demonstrado

| Passo da demonstração | Requisitos e regras | Testes |
|---|---|---|
| Criar a conta e entrar, com e-mail e senha ou com o Google | RF27, RNF11 | CT57 e CT58 |
| Criar o grupo, que vai para o banco com quem criou como organizador | RF01, RN07 | CT58 |
| Cadastrar disciplina e atividade, concluir e recarregar a página: tudo continua lá | RF03, RF13, RNF02 | CT59 |
| Gerar o convite em Membros e entrar no grupo pelo link, com outra conta, num segundo navegador | RF28, RN22 | CT60 e CT61 |
| Mostrar que o que um integrante faz aparece para o outro | RNF02 | CT63 |
| Mostrar a evolução do progresso da disciplina | RF12, RN23 | CT59 e CT68 |
| Trocar a foto de perfil, que vai para o armazenamento de arquivos | RF24, RN19 | CT66 |
| Sair da conta e mostrar o modo de demonstração, com o tutorial | RF09, RF20, RF33 | CT65 e CT67 |

Tudo o que foi demonstrado em 06/11 continua funcionando, agora também com conta: os casos CT01 a CT56 foram executados de novo sobre esta versão.

O sistema está publicado na Vercel, e o endereço está no [README](../README.md).

### O que fica fora desta versão

O que o [Escopo](05-escopo.md) já deixava de fora: banco de questões e simulados, ranking entre grupos, notificações por e-mail, aplicativo nativo, exportação de relatórios e integração com sistemas acadêmicos.

## Recorte da entrega de 20/10/2026

O manual do 2º bimestre pedia um recorte pequeno e demonstrável. Como o MVP já tinha sido construído no fim do 1º bimestre, o recorte daquela entrega foi **o fluxo completo do MVP**, já com testes executados e registrados.

### O que funcionava e foi demonstrado

| Passo da demonstração | Requisitos e regras | Testes |
|---|---|---|
| Criar o grupo e cadastrar os membros com perfil | RF01, RF02, RN07 | CT01 a CT04 |
| Cadastrar disciplina e conteúdos, com nomes únicos | RF13, RF14, RN01, RN13 | CT05 a CT07 |
| Cadastrar atividade com peso, recusando campos obrigatórios vazios | RF03, RN06, RN09, RN13 | CT08 a CT10 |
| Concluir a atividade e ver o progresso do conteúdo e da disciplina subir, com a experiência creditada | RF05, RF10, RF11, RF15, RN08, RN10, RN14 | CT11 a CT13 |
| Filtrar a lista e conferir os totais do painel | RF04, RF06, RN05 | CT14 e CT15 (o filtro por disciplina falta: CT29) |
| Fechar e reabrir o navegador sem perder nada | RNF02 | CT16 |
| Mostrar o que o participante não pode fazer | RN07 | CT17 a CT19 |

Também estavam funcionando e testados: encerramento de sessão (RF09), tema claro e escuro (RF08), dados de exemplo (RF20), exclusão em cascata (RN02), aviso de prazo em fim de semana (RF22) e o comportamento sem serviços externos (RNF10). Os testes citados acima são os do ciclo de 20/10, resumidos no [documento de testes](15-casos-de-teste.md#ciclo-de-2010). O que ficou pendente naquela data foi feito para 06/11.

## Recorte da entrega de 06/11/2026

Para 06/11 o manual pede o sistema parcialmente funcional, com fluxos integrados, regras de negócio e testes. O recorte desta entrega é **o sistema funcionando no navegador, com tudo o que não depende do banco de dados**: o fluxo do MVP, os requisitos desejáveis que ficaram de fora em 20/10, os pedidos da professora depois daquela entrega, a nova identidade visual e os ajustes de uso das revisões de 29/10, 01/11 e 03/11. Ficam para 27/11 o banco de dados, o acesso com conta e o convite para o grupo, que dependem um do outro, e o histórico de progresso.

### O que funciona e será demonstrado

| Passo da demonstração | Requisitos e regras | Testes |
|---|---|---|
| Abrir a página inicial, com o movimento ao rolar e ao passar o mouse, a seção de feedback e a página Sobre nós | RF26, RF32 | CT33, CT54 e CT56 |
| Criar o grupo, com foto: quem cria entra como organizador, e a marca do Vértice aparece enquanto o grupo abre | RF01, RF29, RN07, RN19 | CT01, CT02, CT40 e CT45 |
| Cadastrar membros com foto de perfil, enquadrada no editor, ou com o avatar num dos dois estilos | RF02, RF19, RF24, RN15, RN19 | CT03 a CT05, CT39 e CT47 |
| Cadastrar disciplinas com a paleta de cores e, se o grupo quiser, os conteúdos delas | RF13, RF14, RF25, RN13, RN18 | CT06 a CT08 e CT49 |
| Cadastrar atividades no formulário vazio, só com a disciplina ou também com o conteúdo, o prazo no calendário do campo e o responsável obrigatório | RF03, RN04, RN06, RN09, RN13 | CT09, CT10, CT44 e CT48 |
| Criar o conteúdo sem sair do cadastro da atividade | RF30, RN07, RN13 | CT41 |
| Concluir a atividade (só quem é responsável): progresso, experiência e conquista | RF05, RF10, RF11, RF15, RF17, RN08, RN10, RN12, RN14, RN20 | CT11, CT12 e CT42 |
| Cadastrar eventos do grupo (uma prova, uma palestra) e vê-los na página Eventos e no painel | RF31, RN21 | CT51 |
| Ver as entregas e os eventos no calendário, nas cores das disciplinas, trocar de mês com a animação e criar uma atividade ou um evento a partir de um dia | RF23, RF31 | CT15 a CT17, CT43 e CT52 |
| Ver o desempenho do grupo: experiência, ofensiva, conquistas e ranking | RF16, RF17, RF18, RN11 | CT18 |
| Remover um membro escolhendo quem assume as atividades dele | RF02, RN02 | CT23 |
| Filtrar a lista com a cor das disciplinas e a foto dos responsáveis, conferir o painel e os avisos de feriado e fim de semana | RF04, RF06, RF07, RF21, RF22 | CT13, CT14, CT29 e CT30 |

Também estão funcionando e testados: a barra de seções no topo, que no celular vira um menu que desce (RNF01, CT34 e CT46), perfis de organizador e participante (RN07, CT20 a CT22), encerramento de sessão (RF09, CT24), tema claro e escuro em todas as telas, inclusive as públicas (RF08, CT25), exclusão em cascata de disciplina e de grupo (RN02, CT26 e CT38), edição e exclusão de atividade (RF03, CT37), comportamento sem serviços externos (RNF10, CT27), dados de exemplo (RF20, CT28), aviso de falha de gravação (RNF02, CT32), uso no celular (RNF01, CT34) migração dos dados das versões anteriores (CT35, CT36 e CT50), a tela de acesso em duas colunas (CT53) e os textos sem travessão (CT55).

O sistema está publicado na Vercel, e o endereço está no [README](../README.md).

### O que fica para 27/11/2026

| O quê | Requisitos | Tarefas |
|---|---|---|
| Banco de dados PostgreSQL no Supabase, no lugar do armazenamento do navegador | RNF02, RN01 | T46, T47 |
| Acesso com conta Google ou e-mail | RF27 | T48 |
| Convite para o grupo por link ou código | RF28 | T49 |
| Fotos de perfil e dos grupos no armazenamento de arquivos | RF24, RF29 | T50 |
| Histórico de progresso | RF12 | T35 |
| Testes da versão final, incluindo Firefox e Edge | RNF05 | T51 |

### Em desenvolvimento

Na página inicial, o **grupo por convite** aparecia marcado como "Em breve": ele dependia do acesso com conta, que entrou para 27/11. Desde então o aviso só aparece quando o sistema roda sem o banco configurado.

---

### Navegação

[⬅ Anterior: Arquitetura](13-arquitetura.md) · [Índice](../README.md) · [Próximo: Protótipos ➡](../prototipos/01-telas-e-navegacao.md)

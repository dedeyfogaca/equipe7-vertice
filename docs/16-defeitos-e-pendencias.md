# 16 · Defeitos e Pendências

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · 2º bimestre · Entrega de 27/11/2026

---

Defeitos encontrados na execução dos [casos de teste](15-casos-de-teste.md). O ciclo de 20/10, executado em 19/10/2026 sobre o commit `c29279b`, encontrou os defeitos D01 a D07; o ciclo de 06/11, executado em 28/10/2026 e repetido por inteiro em 29/10/2026, em 01/11/2026 e em 06/11/2026, depois dos ajustes pedidos pela equipe, encontrou os defeitos D08 a D10. A rodada de 06/11, com a revisão de 03/11, não encontrou defeito novo. O ciclo de 27/11, executado em 08/11/2026 sobre a versão com o banco de dados, encontrou os defeitos D11 a D13, corrigidos no mesmo dia. Cada defeito tem forma de reproduzir, comportamento esperado e observado, responsável e situação. Depois da correção, o caso de teste ligado a ele é executado de novo e o resultado é atualizado aqui e no documento de testes.

Situações usadas: **Aberto**, **Em correção**, **Corrigido, aguardando reteste** e **Fechado**.

---

## Resumo

| ID | Defeito | Gravidade | Encontrado em | Responsável | Novo teste | Situação |
|---|---|---|---|---|---|---|
| D01 | Primeiro membro cadastrado como participante deixa o grupo sem organizador | Alta | CT26 de 20/10 | Matheus | CT02 e CT31 (aprovados) | Fechado |
| D02 | Falha de gravação no navegador não avisa o usuário | Média | CT27 de 20/10 | Andrey | CT32 (aprovado) | Fechado |
| D03 | Atividade sem responsável mostra um avatar "SR", como se fosse um membro | Baixa | CT20 de 20/10 | Andrey | CT23, CT31 e CT35 (aprovados) | Fechado |
| D04 | Título do calendário escrito "Outubro De 2026" | Baixa | CT24 de 20/10 | Andrey | CT15 (aprovado) | Fechado |
| D05 | Fundo da coluna da direita termina no meio da tela | Baixa | CT20 e CT24 de 20/10 | Andrey | Evidências das telas, como CT13 e CT14 | Fechado |
| D06 | Descrição do `package.json` ainda fala em "tarefas" | Baixa | Revisão de 20/10 | Matheus | Conferência de `src/package.json` | Fechado |
| D07 | Lista de atividades sem filtro por disciplina | Média | CT29 de 20/10 | Andrey | CT13 (aprovado) | Fechado |
| D08 | Telas e filtros atualizados um instante depois, após a atualização do React Router | Média | CT13, CT22 e CT33 de 06/11 | Matheus | CT13, CT22 e CT33 (aprovados) | Fechado |
| D09 | Tela de Conquistas em branco num grupo sem membros | Média | Revisão do UC09 em 28/10 | Andrey | CT31 (aprovado) | Fechado |
| D10 | Participante consegue excluir atividade de outro integrante | Média | Revisão do Doc. 04 em 28/10 | Andrey | CT21 e CT42 (aprovados) | Fechado |
| D11 | Com conta, as conquistas não eram gravadas no banco | Alta | CT59 de 27/11 | Matheus | CT59 (aprovado) | Fechado |
| D12 | A tela de login gravava coleções vazias no navegador | Baixa | CT58 de 27/11 | Matheus | CT58 (aprovado) | Fechado |
| D13 | Roteiro do CT30 escolhia um domingo que é feriado | Baixa | CT30 de 27/11 | Andrey | CT30 (aprovado) | Fechado |

Os defeitos D01 a D10 foram corrigidos até 28/10/2026 e testados de novo nas execuções completas do ciclo de 06/11. Os defeitos D11 a D13 foram corrigidos em 08/11/2026, e a execução completa do ciclo de 27/11 foi feita depois das correções.

---

## Detalhamento

### D13

**Roteiro do CT30 escolhia um domingo que é feriado**

- **Requisito afetado:** nenhum; o defeito era do roteiro de teste, não do sistema
- **Gravidade:** Baixa
- **Como reproduzir:** executar o CT30 entre 09/11 e 14/11/2026. O roteiro pega o próximo domingo, 15/11, que é feriado da Proclamação da República.
- **Esperado:** o roteiro testa o aviso de fim de semana num domingo comum.
- **Observado:** o formulário mostrou o aviso de feriado, que tem prioridade sobre o de fim de semana (o comportamento certo), e o roteiro, que esperava o aviso de fim de semana, reprovou o caso.
- **Correção:** o roteiro passou a pular os feriados ao escolher o sábado, o domingo e a segunda-feira do caso.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT30, aprovado

### D12

**A tela de login gravava coleções vazias no navegador**

- **Requisito afetado:** RNF02
- **Gravidade:** Baixa: não perdia dado, mas deixava no navegador, para quem nunca usou a demonstração, coleções vazias que não deviam existir
- **Como reproduzir:**
  1. Abrir o sistema num navegador limpo, com o banco configurado.
  2. Na tela de login, conferir o armazenamento do navegador.
- **Esperado:** antes de a pessoa entrar com a conta ou escolher a demonstração, nada é gravado no navegador.
- **Observado:** as coleções `grupos`, `membros` e as demais apareciam gravadas como listas vazias.
- **Causa:** sem conta e fora da demonstração, a camada de dados ficava no modo do navegador e gravava o estado inicial.
- **Correção:** a gravação no navegador só acontece no modo de demonstração.
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** CT58, aprovado

### D11

**Com conta, as conquistas não eram gravadas no banco**

- **Requisito afetado:** RF17, RN12
- **Gravidade:** Alta: a conquista aparecia na tela e sumia ao recarregar a página
- **Como reproduzir:**
  1. Entrar com a conta e criar um grupo.
  2. Cadastrar uma atividade e concluí-la: o aviso de conquista aparece.
  3. Recarregar a página e abrir Conquistas.
- **Esperado:** a conquista "Primeiro Passo" está gravada em `membro_conquista` e continua concedida.
- **Observado:** a tabela `membro_conquista` ficou vazia.
- **Causa:** no navegador, as conquistas ficam na coleção `conquistasMembro`; a camada de dados do banco procurava a coleção pelo nome `conquistas` e não achava o que enviar.
- **Correção:** a camada de dados traduz o nome da coleção, e o caso de teste passou a conferir a tabela no banco.
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** CT59, aprovado

### D01

**Primeiro membro cadastrado como participante deixa o grupo sem organizador**

- **Requisito afetado:** RN07, RF02
- **Gravidade:** Alta: o grupo trava e não há como desfazer pela interface
- **Como reproduzir:**
  1. Criar um grupo novo.
  2. Em Membros, cadastrar o primeiro membro com perfil **Participante**.
  3. Identificar-se como esse membro.
- **Esperado:** o sistema não deixa o grupo sem organizador. Pode recusar o cadastro ou tornar organizador o primeiro membro.
- **Observado:** o cadastro é aceito. O único membro é participante, e ninguém mais consegue adicionar membros, cadastrar disciplina ou conteúdo.
- **Causa:** a trava do último organizador em `lib/validacao.js` (`validarMembro`) só era verificada na edição de um membro, e não no cadastro.
- **Correção:** quem cria o grupo agora informa o próprio nome e entra nele como organizador (RF01), então um grupo novo não nasce vazio. No grupo antigo que ainda não tem membros, o formulário trava o perfil do primeiro membro em Organizador, e `validarMembro` recusa outro perfil. As verificações de `verificacoes/perfis.js` cobrem a trava do primeiro membro e o nome obrigatório de quem cria o grupo.
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** CT02 e CT31, aprovados

### D02

**Falha de gravação no navegador não avisa o usuário**

- **Requisito afetado:** RNF02
- **Gravidade:** Média: é raro acontecer, mas o usuário perde dados sem saber
- **Como reproduzir:**
  1. Com o armazenamento do navegador cheio ou bloqueado, cadastrar qualquer item.
  2. Recarregar a página.
- **Esperado:** o sistema avisa que o cadastro não pôde ser salvo.
- **Observado:** o item aparece na tela como salvo; ao recarregar, ele some.
- **Causa:** as funções de gravação em `lib/storage.js` capturavam o erro e não repassavam nada para a interface.
- **Correção:** `salvarColecao` passou a informar se a gravação deu certo. O `DataContext` acompanha a falha de cada coleção, mostra um aviso no canto e mantém uma faixa no topo da tela até a gravação voltar a funcionar.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT32, aprovado

### D03

**Atividade sem responsável mostra um avatar "SR"**

- **Requisito afetado:** RNF06
- **Gravidade:** Baixa
- **Como reproduzir:** cadastrar uma atividade sem responsável e abrir a lista de atividades.
- **Esperado:** a linha indica claramente que não há responsável.
- **Observado:** a linha mostrava um círculo com as letras "SR" (de "Sem responsável"), no mesmo formato do avatar de um membro.
- **Causa:** o texto "Sem responsável" era passado ao componente de avatar, que gerava as iniciais.
- **Correção:** o responsável passou a ser obrigatório (RN06), a remoção de membro passa as atividades para quem assume (RN02), e a migração atribui um responsável às atividades antigas. No único caso que ainda pode existir (atividade antiga de um grupo que não tinha nenhum membro), a linha mostra um círculo vazio com a indicação "Sem responsável", e não um avatar.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT23, CT31 e CT35, aprovados

### D04

**Título do calendário escrito "Outubro De 2026"**

- **Requisito afetado:** RNF06
- **Gravidade:** Baixa
- **Como reproduzir:** abrir o calendário e olhar o título do mês.
- **Esperado:** "Outubro de 2026".
- **Observado:** "Outubro De 2026".
- **Causa:** o estilo do título colocava em maiúscula a primeira letra de cada palavra.
- **Correção:** o calendário foi refeito como tela própria (RF23), e o título do mês é montado pelo sistema já com a grafia certa, sem transformação de maiúsculas.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT15, aprovado ("Outubro de 2026")

### D05

**Fundo da coluna da direita termina no meio da tela**

- **Requisito afetado:** RNF06
- **Gravidade:** Baixa
- **Como reproduzir:** abrir Atividades ou Painel no computador.
- **Esperado:** a coluna de filtros e do calendário ocupa a altura toda da tela.
- **Observado:** o fundo da coluna terminava logo abaixo do último bloco, e o resto ficava com outra cor.
- **Correção:** o layout de três colunas foi substituído pela nova identidade visual (T27): barra lateral com a altura toda da tela e conteúdo numa coluna só, com os filtros acima da lista. Em 01/11, a barra lateral deu lugar a uma barra no topo (T63), e o conteúdo continua ocupando a largura toda.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** visível nas evidências das telas do sistema, como CT13 e CT14

### D06

**Descrição do `package.json` ainda fala em "tarefas"**

- **Requisito afetado:** convenção de nomes do projeto (atividade, e não tarefa)
- **Gravidade:** Baixa
- **Como reproduzir:** abrir `src/package.json`.
- **Esperado:** descrição alinhada ao tema.
- **Observado:** "Sistema web para acompanhar tarefas e trabalhos escolares com foco em grupo."
- **Correção:** a descrição passou a ser "Vértice: plataforma de acompanhamento de aprendizagem para grupos de estudo."
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** conferência de `src/package.json`

### D07

**Lista de atividades sem filtro por disciplina**

- **Requisito afetado:** RF04
- **Gravidade:** Média: o requisito pede o filtro, e com muitas atividades a busca por texto não basta
- **Como reproduzir:** abrir Atividades e procurar o filtro por disciplina no painel de filtros.
- **Esperado:** uma lista de disciplinas do grupo para filtrar, como existe para responsável e prazo.
- **Observado:** só havia Buscar, Responsável, Prazo e Ordenar por.
- **Causa:** o filtro deixou de existir quando a disciplina passou a ser um cadastro próprio, e não foi refeito na lista.
- **Correção:** a lista ganhou o filtro "Disciplina", com as disciplinas do grupo ativo. Ele funciona junto com os demais filtros e fica gravado no endereço da página, como a situação e a busca.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT13, aprovado

### D08

**Telas e filtros atualizados um instante depois, após a atualização do React Router**

- **Requisito afetado:** RF04, RF09
- **Gravidade:** Média: sair do grupo e entrar de novo levava a pessoa a uma tela diferente da esperada
- **Como reproduzir** (com o React Router 7, antes da correção):
  1. Em Atividades, trocar os filtros em sequência.
  2. Em Membros, clicar em **Sair do grupo** e entrar de novo no grupo.
- **Esperado:** a lista acompanha cada filtro na hora; depois de entrar de novo, o sistema abre o painel.
- **Observado:** a contagem da lista ainda mostrava o resultado anterior logo depois da troca de filtro (CT13); depois de sair pela tela de Membros e entrar de novo, o sistema voltava para Membros, e não para o painel (CT22); a página Sobre nós chegava à tela depois do endereço já ter mudado (CT33).
- **Causa:** para eliminar as vulnerabilidades apontadas pelo `npm audit`, as dependências foram atualizadas, e o React Router passou da versão 6 para a 7. Na versão 7, cada troca de endereço vira uma transição do React e chega à tela um instante depois. Ao sair do grupo, a sessão era encerrada antes de a troca de endereço chegar à tela; nesse intervalo, a rota privada via a tela antiga sem sessão e guardava o endereço dela para depois do acesso.
- **Correção:** o roteador passou a atualizar o endereço na hora, como fazia na versão 6, com a opção `useTransitions={false}` do próprio React Router 7 (`src/main.jsx`). As dependências continuam atualizadas, sem vulnerabilidades.
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** CT13, CT22 e CT33, aprovados

### D09

**Tela de Conquistas em branco num grupo sem membros**

- **Requisito afetado:** RF18; UC09, fluxo alternativo 1A
- **Gravidade:** Média: a tela fica em branco, sem mensagem, e só volta ao trocar de tela
- **Como reproduzir:**
  1. Entrar num grupo de uma versão anterior que ainda não tem nenhum membro.
  2. Abrir Conquistas.
- **Esperado:** o sistema exibe mensagem orientativa e o atalho para a tela de membros, como prevê o fluxo 1A do UC09.
- **Observado:** a tela ficou em branco, e o console do navegador registrou o erro "Cannot read properties of null (reading 'id')". No mesmo grupo, o painel saudava com "Boa tarde," e uma vírgula solta, e o campo de responsável da nova atividade ficava vazio sem explicação.
- **Causa:** a tela de Conquistas procurava os números de quem está usando o sistema, e num grupo sem membros não há ninguém identificado.
- **Correção:** sem ninguém identificado, Conquistas mostra "O grupo ainda não tem membros", com o atalho para Membros; o painel cumprimenta sem nome; o campo de responsável explica que o grupo ainda não tem membros; e o cartão da barra lateral diz "Grupo sem membros".
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT31, aprovado

### D10

**Participante consegue excluir atividade de outro integrante**

- **Requisito afetado:** RN07; Doc. 04 (Perfis do usuário)
- **Gravidade:** Média: um participante podia apagar, sem querer, o trabalho registrado por outra pessoa
- **Como reproduzir:**
  1. Entrar no grupo como participante.
  2. Abrir uma atividade de outro integrante.
- **Esperado:** o Doc. 04 reserva ao organizador "excluir atividades de qualquer integrante"; o participante não exclui a atividade de outra pessoa.
- **Observado:** o botão **Excluir** aparecia em qualquer atividade, para qualquer perfil.
- **Causa:** a tela de detalhe da atividade não consultava o perfil de quem está usando.
- **Correção:** o organizador exclui qualquer atividade do grupo; o participante, só as atividades das quais é o responsável, como a RN07 passou a dizer de forma explícita. Em 29/10, a pedido da equipe, a edição passou a seguir a mesma regra, e a mudança de status ficou só com o responsável pela atividade (RN20).
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT21 e CT42, aprovados

---

## Pendências

Itens que não são defeito, mas ficam registrados para as próximas entregas.

| Item | Situação | Para quando |
|---|---|---|
| Conferir na versão publicada na Vercel os feriados reais da BrasilAPI | A fazer | 24/11/2026 |
| Conferir num celular de verdade o arraste e o gesto de pinça do editor de foto | A fazer | 24/11/2026 |
| Testar nos navegadores Firefox e Edge (RNF05) | A fazer (T51) | 26/11/2026 |
| Conferir no sistema publicado, com o projeto real do Supabase, o login com o Google, o convite entre duas contas e o envio de uma foto | A fazer | 24/11/2026 |
| Ler as respostas do formulário de feedback dos usuários de teste e transformar o que vier em tarefas | A fazer (T77) | 20/11/2026 |

---

## Pendências resolvidas

| Item | Como foi resolvido |
|---|---|
| Responsável no formulário de atividade (aberta em 17/09) | Em 20/10, a validação aceitava atividade sem responsável. Em 28/10, a pedido da professora, o responsável passou a ser obrigatório (RN06, T37). Verificado no CT09 e no CT10 |
| Rodapé com contato pessoal de um integrante (aberta em 17/09) | O rodapé mostra só a identificação da equipe e dos dois integrantes, além do Instagram do projeto, @go.vertice. Verificado no CT33 |
| T24: telas de detalhe e de acesso no desenho anterior | Refeitas na nova identidade visual (T27), junto com todas as outras telas |
| A migração de dados não avisava quando uma atividade antiga ficava sem grupo | A pessoa é avisada uma vez, na abertura em que a migração roda, e a atividade continua guardada (T33). Verificado no CT36 |
| Testar RF07 e RF21 | CT29, com as respostas da BrasilAPI simuladas no ambiente de teste |
| Conferir os avatares reais da DiceBear na versão publicada | Desde 01/11 os avatares são desenhados pelo próprio sistema, e não há mais serviço a conferir. Verificado no CT27 e no CT47 |
| Testar a responsividade (RNF01) | CT34, em tela de celular |
| Banco de dados no Supabase, acesso com conta Google ou e-mail, convite para o grupo e fotos no armazenamento de arquivos | Implementados para 27/11 (T46 a T50). Verificados do CT57 ao CT66 e nas 40 verificações do banco |
| Eventos no banco de dados | A tabela `evento` está no banco com as demais, com a regra de edição do RN21 no próprio banco. Verificado no CT63 e nas verificações do banco |
| Histórico de progresso (RF12) | Implementado para 27/11 (T35). Verificado no CT59 e no CT68 |

---

### Navegação

[⬅ Anterior: Casos de Teste](15-casos-de-teste.md) · [Índice](../README.md)

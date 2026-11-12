# 16 · Defeitos e Pendências

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · 2º bimestre · Entrega de 27/11/2026, atualizado em 12/11/2026

---

Defeitos encontrados na execução dos [casos de teste](15-casos-de-teste.md). O ciclo de 20/10, executado em 19/10/2026 sobre o commit `c29279b`, encontrou os defeitos D01 a D07; o ciclo de 06/11, executado em 28/10/2026 e repetido por inteiro em 29/10/2026, em 01/11/2026 e em 06/11/2026, depois dos ajustes pedidos pela equipe, encontrou os defeitos D08 a D10. A rodada de 06/11, com a revisão de 03/11, não encontrou defeito novo. O ciclo de 27/11, executado em 08/11/2026 sobre a versão com o banco de dados, encontrou os defeitos D11 a D13, corrigidos no mesmo dia. A conferência no sistema publicado, com o projeto real do Supabase, encontrou o D14. A execução completa de 11/11/2026, com a revisão de 11/11, encontrou os defeitos D15 a D18, corrigidos antes da execução final. Cada defeito tem forma de reproduzir, comportamento esperado e observado, responsável e situação. Depois da correção, o caso de teste ligado a ele é executado de novo e o resultado é atualizado aqui e no documento de testes.

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
| D14 | No projeto real do Supabase, o sistema não lia nem gravava nada, e as alterações se perdiam sem aviso | Alta | Conferência no sistema publicado em 08/11 | Matheus | CT57 a CT66 (aprovados) | Fechado |
| D15 | Na demonstração, quem já tinha dados de uma versão anterior entrava direto no grupo antigo, sem espaço pessoal | Média | CT85 de 11/11 | Andrey | CT85 (aprovado) | Fechado |
| D16 | No sistema sem banco configurado, "Sair da demonstração" levava a uma tela de login que não funciona | Baixa | CT24 de 11/11 | Andrey | CT24 e CT65 (aprovados) | Fechado |
| D17 | Roteiro do CT51 esperava nenhum evento em feriado, e o exemplo cai em 15/11 quando o teste roda em 11/11 | Baixa | CT51 de 11/11 | Andrey | CT51 (aprovado) | Fechado |
| D18 | Roteiros do CT59 e do CT64 não previam o espaço pessoal | Baixa | CT59 e CT64 de 11/11 | Matheus | CT59 e CT64 (aprovados) | Fechado |

Os defeitos D01 a D10 foram corrigidos até 28/10/2026 e testados de novo nas execuções completas do ciclo de 06/11. Os defeitos D11 a D13 foram corrigidos em 08/11/2026, e a execução completa do ciclo de 27/11 foi feita depois das correções. Os defeitos D15 a D18 foram corrigidos em 11/11/2026, e a execução completa de 11/11 foi refeita depois das correções.

---

## Detalhamento

### D18

**Roteiros do CT59 e do CT64 não previam o espaço pessoal**

- **Requisito afetado:** nenhum; o defeito era dos roteiros de teste, não do sistema
- **Gravidade:** Baixa
- **Como reproduzir:** executar o roteiro com conta (CT57 a CT66) sobre a versão de 11/11.
- **Esperado:** os dois casos conferem o que conferiam antes.
- **Observado:** o CT59 esperava voltar à tela de disciplinas depois de criar a atividade, mas o formulário foi aberto direto pelo endereço, sem tela anterior, e o sistema voltou para a lista de atividades, como previsto. O CT64 procurava o membro "Bruno Lima" pelo nome, e desde 11/11 cada conta tem também o membro do espaço pessoal, com o mesmo nome; a consulta do roteiro achou dois e parou.
- **Correção:** o CT59 passou a esperar a lista de atividades, e o CT64 passou a procurar o membro no grupo da atividade.
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** CT59 e CT64, aprovados

### D17

**Roteiro do CT51 esperava nenhum evento em feriado, e o exemplo cai em 15/11 quando o teste roda em 11/11**

- **Requisito afetado:** nenhum; o defeito era do roteiro de teste, como o D13
- **Gravidade:** Baixa
- **Como reproduzir:** executar o CT51 em 11/11/2026. Os eventos do exemplo são marcados em relação ao dia de hoje, e um deles cai em 15/11, feriado da Proclamação da República.
- **Esperado:** o roteiro confere o aviso de feriado em quantos eventos caírem num feriado.
- **Observado:** o cartão do evento mostrou o aviso de feriado (o comportamento certo), e o roteiro, que esperava nenhum, reprovou o caso.
- **Correção:** o roteiro passou a contar, nos próprios dados, quantos eventos caem em 15/11 e a esperar esse número de avisos.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT51, aprovado

### D16

**No sistema sem banco configurado, "Sair da demonstração" levava a uma tela de login que não funciona**

- **Requisito afetado:** RF09, RF20
- **Gravidade:** Baixa: só acontece rodando o sistema na própria máquina sem o `.env`; a versão publicada tem o banco
- **Como reproduzir:**
  1. Rodar o sistema sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
  2. Começar a demonstração e, no menu da conta, escolher "Sair da demonstração".
- **Esperado:** sem banco, só existe a demonstração, e não há para onde sair.
- **Observado:** o sistema saía da demonstração e mostrava a tela de login, que não tem banco para conferir a conta.
- **Correção:** o item "Sair da demonstração" só aparece quando o banco está configurado. Sem banco, o menu oferece "Voltar ao espaço pessoal" dentro dos grupos.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT24 (sem banco) e CT65 (com banco), aprovados

### D15

**Na demonstração, quem já tinha dados de uma versão anterior entrava direto no grupo antigo, sem espaço pessoal**

- **Requisito afetado:** RF34, RF20
- **Gravidade:** Média: a pessoa não via o espaço pessoal nem a tela Meu perfil até limpar os dados do navegador
- **Como reproduzir:**
  1. Ter, no navegador, dados da demonstração da versão anterior, com um grupo aberto.
  2. Abrir a versão de 11/11.
- **Esperado:** os dados antigos continuam, e a pessoa ganha o espaço pessoal, com o grupo antigo no seletor.
- **Observado:** a migração ligou o grupo às atividades e marcou a pessoa, mas o sistema abriu direto o grupo antigo, que estava na sessão, sem criar o espaço pessoal.
- **Correção:** enquanto a demonstração não tem espaço pessoal, as telas internas levam à tela do nome, já preenchido com o nome do membro marcado. Ao confirmar, o sistema cria o perfil e o espaço pessoal, e o grupo antigo continua como estava.
- **Responsável:** Andrey
- **Situação:** Fechado
- **Novo teste:** CT85, aprovado

### D14

**No projeto real do Supabase, o sistema não lia nem gravava nada, e as alterações se perdiam sem aviso**

- **Requisito afetado:** RNF02, RF28
- **Gravidade:** Alta: o grupo aparecia na tela, mas não ia para o banco
- **Como reproduzir:**
  1. Criar o banco no Supabase com o script da versão anterior.
  2. Entrar com a conta, criar um grupo e, em Membros, clicar em **Convidar**.
- **Esperado:** o grupo fica gravado no banco e o convite é gerado.
- **Observado:** "Você não tem permissão para essa alteração." no convite, e nenhuma linha na tabela `grupo`.
- **Causa:** o projeto do Supabase não dava às contas conectadas acesso às tabelas criadas pelo script; o banco local de teste dava esse acesso por padrão, e por isso os testes não pegaram. Sem a primeira leitura, a camada de dados descartava as alterações sem avisar.
- **Correção:** o script de criação passou a dar as permissões ele mesmo (a seção 7); o apoio para teste local deixou de dar acesso por padrão, para os testes reproduzirem o Supabase; e, se a primeira leitura falhar, toda alteração avisa que não foi salva.
- **Responsável:** Matheus
- **Situação:** Fechado
- **Novo teste:** CT57 a CT66, aprovados de novo com o banco local sem acesso por padrão

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
| Ler as respostas do feedback dos usuários de teste e transformar o que vier em tarefas | Em andamento (T77): os comentários recebidos até 11/11 entraram na revisão de 11/11; desde 12/11, as respostas chegam na tela Respostas do feedback | 20/11/2026 |
| Rodar a atualização do feedback (`08-atualizacao-feedback.sql`) no projeto real do Supabase e cadastrar as contas da equipe na tabela `equipe` | A fazer | Antes de publicar a versão de 12/11 |
| Conferir no sistema publicado o espaço pessoal de uma conta antiga, o perfil em dois grupos e um lembrete recebido de verdade | A fazer | 24/11/2026 |

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
| Notificações por e-mail (fora do escopo até 08/11) | O lembrete diário por e-mail entrou na revisão de 11/11 (RF36, T82). Verificado no CT80 e nas verificações do banco |
| Rodar a atualização de 11/11 no projeto real do Supabase | Rodada em 11/11, antes de publicar a versão de 11/11 |
| Ligar o lembrete por e-mail no projeto real | Ligado em 11/11: conta no Brevo, remetente confirmado, chave no Vault e agendamento diário. O primeiro e-mail chegou de verdade |

---

### Navegação

[⬅ Anterior: Casos de Teste](15-casos-de-teste.md) · [Índice](../README.md)

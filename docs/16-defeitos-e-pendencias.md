# 16 · Defeitos e Pendências

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Imersão Profissional: Projeto de Software · ADSIS4S · 2º bimestre · Entrega de 20/10/2026

---

Defeitos encontrados na execução dos [casos de teste](15-casos-de-teste.md) de 19/10/2026, sobre o commit `c29279b`. Cada defeito tem forma de reproduzir, comportamento esperado e observado, responsável e situação. Depois da correção, o caso de teste ligado a ele é executado de novo e o resultado é atualizado aqui e no documento de testes.

Situações usadas: **Aberto**, **Em correção**, **Corrigido — aguardando reteste** e **Fechado**.

---

## Resumo

| ID | Defeito | Gravidade | Teste | Responsável | Prazo | Situação |
|---|---|---|---|---|---|---|
| D01 | Primeiro membro cadastrado como participante deixa o grupo sem organizador | Alta | CT26 | Matheus | 30/10/2026 | Aberto |
| D02 | Falha de gravação no navegador não avisa o usuário | Média | CT27 | Andrey | 30/10/2026 | Aberto |
| D03 | Atividade sem responsável mostra um avatar "SR", como se fosse um membro | Baixa | CT20 | Andrey | 06/11/2026 | Aberto |
| D04 | Título do calendário escrito "Outubro De 2026" | Baixa | CT24 | Andrey | 06/11/2026 | Aberto |
| D05 | Fundo da coluna da direita termina no meio da tela | Baixa | CT20, CT24 | Andrey | 06/11/2026 | Aberto |
| D06 | Descrição do `package.json` ainda fala em "tarefas" | Baixa | — | Matheus | 06/11/2026 | Aberto |
| D07 | Lista de atividades sem filtro por disciplina | Média | CT29 | Andrey | 30/10/2026 | Aberto |

---

## Detalhamento

### D01

**Primeiro membro cadastrado como participante deixa o grupo sem organizador**

- **Requisito afetado:** RN07, RF02
- **Gravidade:** Alta — o grupo trava e não há como desfazer pela interface
- **Como reproduzir:**
  1. Criar um grupo novo.
  2. Em Membros, cadastrar o primeiro membro com perfil **Participante**.
  3. Identificar-se como esse membro.
- **Esperado:** o sistema não deixa o grupo sem organizador. Pode recusar o cadastro ou tornar organizador o primeiro membro.
- **Observado:** o cadastro é aceito. O único membro é participante, e ninguém mais consegue adicionar membros, cadastrar disciplina ou conteúdo.
- **Causa provável:** a trava do último organizador em `lib/validacao.js` (`validarMembro`) só é verificada na edição de um membro, e não no cadastro. Enquanto o grupo está vazio, quem o criou é tratado como organizador (`context/AuthContext.jsx`); essa condição deixa de valer assim que o primeiro membro é cadastrado.
- **Responsável:** Matheus
- **Situação:** Aberto
- **Reteste:** CT26

### D02

**Falha de gravação no navegador não avisa o usuário**

- **Requisito afetado:** RNF02
- **Gravidade:** Média — é raro acontecer, mas o usuário perde dados sem saber
- **Como reproduzir:**
  1. Com o armazenamento do navegador cheio ou bloqueado, cadastrar qualquer item.
  2. Recarregar a página.
- **Esperado:** o sistema avisa que o cadastro não pôde ser salvo.
- **Observado:** o item aparece na tela como salvo; ao recarregar, ele some.
- **Causa provável:** as funções de gravação em `lib/storage.js` capturam o erro e não repassam nada para a interface.
- **Responsável:** Andrey
- **Situação:** Aberto
- **Reteste:** CT27

### D03

**Atividade sem responsável mostra um avatar "SR"**

- **Requisito afetado:** RNF06
- **Gravidade:** Baixa
- **Como reproduzir:** cadastrar uma atividade sem responsável e abrir a lista de atividades.
- **Esperado:** o cartão indica claramente que não há responsável.
- **Observado:** o cartão mostra um círculo com as letras "SR" (de "Sem responsável"), no mesmo formato do avatar de um membro.
- **Causa provável:** `components/AtividadeCard.jsx` passa o texto "Sem responsável" para o componente de avatar, que gera as iniciais.
- **Responsável:** Andrey
- **Situação:** Aberto

### D04

**Título do calendário escrito "Outubro De 2026"**

- **Requisito afetado:** RNF06
- **Gravidade:** Baixa
- **Como reproduzir:** abrir o Painel e olhar o título do calendário.
- **Esperado:** "Outubro de 2026".
- **Observado:** "Outubro De 2026".
- **Causa provável:** o estilo do título em `components/CalendarioMes.jsx` coloca em maiúscula a primeira letra de cada palavra.
- **Responsável:** Andrey
- **Situação:** Aberto

### D05

**Fundo da coluna da direita termina no meio da tela**

- **Requisito afetado:** RNF06
- **Gravidade:** Baixa
- **Como reproduzir:** abrir Atividades ou Painel no computador.
- **Esperado:** a coluna de filtros e do calendário ocupa a altura toda da tela.
- **Observado:** o fundo da coluna termina logo abaixo do último bloco, e o resto fica com outra cor.
- **Responsável:** Andrey
- **Situação:** Aberto — será tratado junto com a nova identidade visual (T27)

### D06

**Descrição do `package.json` ainda fala em "tarefas"**

- **Requisito afetado:** convenção de nomes do projeto (atividade, e não tarefa)
- **Gravidade:** Baixa
- **Como reproduzir:** abrir `src/package.json`.
- **Esperado:** descrição alinhada ao tema, por exemplo "Plataforma de acompanhamento de aprendizagem para grupos de estudo".
- **Observado:** "Sistema web para acompanhar tarefas e trabalhos escolares com foco em grupo."
- **Responsável:** Matheus
- **Situação:** Aberto

### D07

**Lista de atividades sem filtro por disciplina**

- **Requisito afetado:** RF04
- **Gravidade:** Média — o requisito pede o filtro, e com muitas atividades a busca por texto não basta
- **Como reproduzir:** abrir Atividades e procurar o filtro por disciplina no painel de filtros.
- **Esperado:** uma lista de disciplinas do grupo para filtrar, como existe para responsável e prazo.
- **Observado:** só há Buscar, Responsável, Prazo e Ordenar por. O nome da disciplina pode ser digitado na busca, que também procura no título e no conteúdo.
- **Causa provável:** o filtro deixou de existir quando a disciplina passou a ser um cadastro próprio (antes era texto livre na atividade), e não foi refeito em `pages/Atividades.jsx`.
- **Responsável:** Andrey
- **Situação:** Aberto
- **Reteste:** CT29

---

## Pendências

Itens que não são defeito, mas ficam registrados para as próximas entregas.

| Item | Situação | Para quando |
|---|---|---|
| T24 — telas de detalhe e de acesso ainda no desenho anterior | Em andamento | Absorvida pela T27 (nova identidade visual) |
| Nova identidade visual do Vértice | Planejada como T27 | 06/11/2026 |
| A migração de dados não avisa quando uma atividade antiga não encontra conteúdo | A fazer | 06/11/2026 |
| Testar RF07 e RF21 com acesso à internet | A fazer | 06/11/2026 |
| Testar responsividade (RNF01) e os navegadores Firefox e Edge (RNF05) | A fazer | 06/11/2026 |
| Persistência em MySQL | Fora do bimestre | Versão futura |

---

## Pendências resolvidas desde o 1º bimestre

| Item | Como foi resolvido |
|---|---|
| Responsável obrigatório no formulário de atividade (aberta em 17/09) | A validação passou a aceitar atividade sem responsável, como RN06, RN10 e UC05-5A já previam. Verificado no CT10 |
| Rodapé com contato pessoal de um integrante (aberta em 17/09) | O rodapé passou a mostrar só a identificação da equipe e dos dois integrantes. Visível em todas as evidências |

---

### Navegação

[⬅ Anterior: Casos de Teste](15-casos-de-teste.md) · [Índice](../README.md)

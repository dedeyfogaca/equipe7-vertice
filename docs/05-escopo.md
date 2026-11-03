# 05 · Escopo

> **Vértice** — Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2 (revisão da Entrega 1), atualizado em 29/10/2026

---

## Incluído na primeira versão

**Estrutura do grupo**

- Criação, edição, seleção e exclusão de grupos de estudo, com foto do grupo
- Cadastro, edição e exclusão de membros do grupo, com foto de perfil enquadrada num editor
- Cadastro, edição e exclusão de disciplinas, com cor escolhida numa paleta
- Cadastro, edição e exclusão de conteúdos vinculados a uma disciplina
- Acesso com conta Google ou e-mail e entrada no grupo por convite, com link e código

**Atividades**

- Cadastro, edição e exclusão de atividades com título, descrição, conteúdo, prazo, peso, prioridade, status e responsável — toda atividade tem um responsável, e só ele altera o status
- Cadastro de conteúdo a partir do formulário de atividade, sem perder o que já foi preenchido
- Listagem de atividades com busca por texto, filtros por status, responsável, disciplina e prazo, e ordenação
- Página de detalhe da atividade com alteração rápida de status pelo responsável
- Sinalização de prazos que coincidem com feriados nacionais ou com fim de semana

**Acompanhamento e desempenho**

- Painel com totais por status, atividades atrasadas, próximas entregas e próximos feriados nacionais
- Calendário do mês, da semana ou em lista, com as entregas de cada dia nas cores das disciplinas e transição animada entre os meses
- Cálculo e exibição do progresso por conteúdo e por disciplina
- Registro e visualização do histórico de progresso ao longo do tempo
- Pontos de experiência atribuídos por atividade concluída, proporcionais ao peso
- Ofensiva de dias consecutivos com pelo menos uma atividade concluída
- Conquistas concedidas ao atingir marcos de progresso e de constância
- Painel de desempenho do grupo com experiência, ofensiva e conquistas por integrante

**Interface**

- Tema claro e escuro em todas as telas, inclusive as públicas
- Listas de escolha e campo de data com a identidade visual do sistema: cor da disciplina, foto do membro e calendário próprio
- Foto de perfil enviada pelo membro ou avatar sorteado e trocável, em cinco estilos de desenho
- Páginas públicas de apresentação: início e sobre a equipe
- Carga de dados de exemplo para conhecer o sistema sem cadastrar nada

---

## Não incluído nesta versão

- Banco de questões, simulados e correção objetiva
- Ranking competitivo entre grupos ou entre instituições
- Notificações por e-mail ou push
- Aplicativo móvel nativo
- Exportação de relatórios em PDF ou planilha
- Integração com sistemas acadêmicos institucionais

---

## Restrições

| Tipo | Restrição |
|---|---|
| **Prazo** | O planejamento e os protótipos foram concluídos no 1º bimestre, em 25/09/2026. No 2º bimestre, o sistema precisa estar parcialmente funcional em 06/11/2026 e concluído em 27/11/2026 |
| **Equipe** | Dois integrantes, ambos conciliando o projeto com as demais disciplinas do curso |
| **Tecnologia** | Interface em React 18 com Vite, Tailwind CSS e Radix UI; banco PostgreSQL no Supabase e hospedagem na Vercel |
| **Persistência** | Até a entrega de 06/11/2026 os dados ficam no navegador do usuário, seguindo a estrutura definida no modelo lógico do banco de dados. Isso restringe o acesso ao dispositivo utilizado e impede o compartilhamento automático entre integrantes. Para a entrega final, os dados passam para o banco PostgreSQL do Supabase, e as fotos de perfil e dos grupos para o armazenamento de arquivos dele |
| **Acesso** | Até a entrega de 06/11/2026 o acesso ocorre pela seleção do grupo, sem autenticação; a identificação do perfil depende da escolha do próprio usuário. Para a entrega final, o acesso passa a ser pela conta Google ou por e-mail, e o perfil fica vinculado à conta |
| **Integração** | O sistema depende de dois serviços externos gratuitos, sujeitos a indisponibilidade: **BrasilAPI** e **Nager.Date**, para os feriados nacionais. Nenhum deles tem contrato de nível de serviço, e por isso há alternativa local prevista (RNF10, RN17). Os avatares são desenhados pelo próprio sistema, com a biblioteca da **DiceBear**, e as fontes tipográficas são servidas junto com o sistema: nenhum dos dois depende de serviço externo. Na entrega final entram o **Supabase** (banco, autenticação e arquivos) e o login do **Google** |

---

### Navegação

[⬅ Anterior: Público-Alvo e Perfis do Usuário](04-publico-alvo-e-perfis-do-usuario.md) · [Índice](../README.md) · [Próximo: Requisitos Funcionais ➡](06-requisitos-funcionais.md)

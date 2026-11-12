# 05 · Escopo

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 2 (revisão da Entrega 1), atualizado em 12/11/2026

---

## Incluído na primeira versão

**Espaço pessoal e grupos**

- Espaço pessoal de cada pessoa, aberto ao entrar, com as tarefas e os eventos só dela e o que está com ela em todos os grupos
- Perfil da conta (nome, avatar e foto enquadrada num editor) que vale em todos os grupos
- Criação, edição, seleção e exclusão de grupos de estudo, com foto do grupo, pelo seletor de espaço, sem sair do sistema
- Cadastro, edição e exclusão de membros do grupo
- Cadastro, edição e exclusão de disciplinas, com cor escolhida numa paleta
- Cadastro, edição e exclusão de conteúdos vinculados a uma disciplina, opcionais, para quem quer separar a disciplina por assunto
- Acesso com conta Google ou com e-mail e senha, e entrada no grupo por convite, com link e código

**Atividades**

- Cadastro, edição e exclusão de atividades com título, descrição, disciplina, conteúdo opcional, prazo, peso, prioridade, status e responsável. Nos grupos, toda atividade tem uma disciplina; no espaço pessoal, a disciplina é opcional, para as tarefas do dia a dia. O responsável pode ficar "A definir" até alguém assumir, e só o responsável altera o status
- Cadastro de várias atividades de uma vez e troca do responsável de várias atividades pelo organizador
- Cadastro de conteúdo a partir do formulário de atividade, sem perder o que já foi preenchido
- Listagem de atividades com busca por texto, filtros por status, responsável, disciplina e prazo, e ordenação
- Página de detalhe da atividade com alteração de status pelo responsável e a opção de desfazer a conclusão
- Sinalização de prazos que coincidem com feriados nacionais ou com fim de semana

**Eventos**

- Cadastro, edição e exclusão de eventos, no espaço pessoal ou no grupo (prova, apresentação, palestra, reunião ou outro), de um dia ou de vários dias, com horário, local e disciplina opcionais
- Página de eventos com os próximos e os passados e o filtro por tipo e por disciplina, e os eventos no painel e no calendário

**Acompanhamento e desempenho**

- Painel com totais por status, atividades atrasadas, próximas entregas e próximos feriados nacionais
- Calendário do mês, da semana ou em lista, com as entregas e os eventos de cada dia, nas cores das disciplinas, a barra de filtros e transição animada entre os meses
- Lembrete diário por e-mail das atividades perto do prazo ou atrasadas, que pode ser desligado
- Cálculo e exibição do progresso por conteúdo e por disciplina
- Registro do histórico de progresso de cada disciplina e linha da evolução dia a dia
- Pontos de experiência atribuídos por atividade concluída, proporcionais ao peso
- Ofensiva de dias consecutivos com pelo menos uma atividade concluída
- Conquistas concedidas ao atingir marcos de progresso e de constância, e retiradas junto com a experiência quando a conclusão é desfeita
- Painel de desempenho do grupo com experiência, ofensiva e conquistas por integrante

**Interface**

- Tema claro e escuro em todas as telas, inclusive as públicas
- Listas de escolha e campo de data com a identidade visual do sistema: cor da disciplina, foto do membro e calendário próprio
- Foto de perfil enviada pelo membro ou avatar sorteado e trocável, em dois estilos de desenho
- Páginas públicas de apresentação: início, com elementos que reagem à rolagem e ao mouse, e sobre a equipe
- Feedback dos usuários de teste dentro do sistema, respondido sem conta e sem identificação, com as respostas lidas só pela equipe
- Saída do grupo pelo próprio membro, sem depender do organizador
- Histórico do grupo: cada ação, quem fez e quando, para todos os membros consultarem
- Modo de demonstração sem conta, em que a pessoa informa só o nome, com carga de dados de exemplo para conhecer o sistema sem cadastrar nada
- Tutorial opcional que apresenta as telas principais

---

## Não incluído nesta versão

- Banco de questões, simulados e correção objetiva
- Ranking competitivo entre grupos ou entre instituições
- Notificações push e e-mails além do lembrete diário (por exemplo, a cada mudança no grupo)
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
| **Persistência** | Com conta, os dados ficam no banco PostgreSQL do Supabase e as fotos de perfil e dos grupos no armazenamento de arquivos dele, e o grupo inteiro vê os mesmos dados. No modo de demonstração, sem conta, os dados ficam só no navegador do usuário, seguindo a mesma estrutura, e não são compartilhados. Até a entrega de 06/11/2026 esse era o único modo |
| **Acesso** | O acesso é pela conta Google ou por e-mail e senha, e o perfil fica vinculado à conta. No modo de demonstração não há autenticação: a pessoa informa o nome, e o espaço pessoal e os grupos ficam só naquele navegador |
| **Integração** | O sistema depende de dois serviços externos gratuitos, sujeitos a indisponibilidade: **BrasilAPI** e **Nager.Date**, para os feriados nacionais. Nenhum deles tem contrato de nível de serviço, e por isso há alternativa local prevista (RNF10, RN17). Os avatares são desenhados pelo próprio sistema, com a biblioteca da **DiceBear**, e as fontes tipográficas são servidas junto com o sistema: nenhum dos dois depende de serviço externo. O **Supabase** (banco, autenticação e arquivos) e o login do **Google** são serviços externos também; sem eles, o modo com conta fica indisponível, e o de demonstração continua funcionando. O lembrete por e-mail é enviado pelo **Brevo**, no plano gratuito (até 300 e-mails por dia); sem ele, o lembrete do dia não sai e o resto do sistema não muda |

---

### Navegação

[⬅ Anterior: Público-Alvo e Perfis do Usuário](04-publico-alvo-e-perfis-do-usuario.md) · [Índice](../README.md) · [Próximo: Requisitos Funcionais ➡](06-requisitos-funcionais.md)

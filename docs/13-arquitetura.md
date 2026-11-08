# 13 · Arquitetura e Tecnologias

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Documento de Visão e Requisitos · Imersão Profissional: Projeto de Software · ADSIS4S · Entrega 3, atualizada em 08/11/2026

---

O Vértice é uma aplicação web que roda no navegador e guarda os dados no **Supabase**: um banco PostgreSQL, o serviço de login e o armazenamento de arquivos, hospedados. Não há servidor de aplicação próprio: a interface e as regras de negócio rodam no navegador, e as regras que não podem depender da tela (quem enxerga cada grupo, quem pode alterar o quê) rodam no próprio banco. Sem conta, o sistema funciona no modo de demonstração, com os dados só no navegador, como era até a entrega de 06/11.

---

![Arquitetura do Vértice](../diagramas/png/arquitetura.png)

> Desenho-fonte: [`../diagramas/svg/arquitetura.svg`](../diagramas/svg/arquitetura.svg)

O desenho mostra os componentes que o sistema usa. À esquerda o estudante, que recebe o sistema da Vercel, onde ele está publicado; no meio a aplicação; embaixo o Supabase, onde ficam os dados com conta, e à esquerda o navegador, onde ficam os da demonstração. À direita, fora da fronteira, os serviços consultados que não guardam nada do grupo: os feriados e o login do Google, que só confirma quem é a pessoa.

Em 19/10/2026, no início do 2º bimestre, as escolhas da Entrega 3 foram conferidas com o código e confirmadas. Em 28/10/2026, com a nova identidade visual e os pedidos da professora, a camada de estilo, a tipografia e a hospedagem mudaram, e o banco de dados foi escolhido. Em 29/10/2026 entraram duas peças do Radix (a lista de escolha e a janela flutuante) para os filtros, as listas dos formulários e o calendário do campo de data. Em 03/11/2026 entraram os eventos, como mais uma coleção de dados, a versão 3 dos dados, que liga a atividade direto à disciplina, e o movimento da página inicial, feito só com CSS e com as APIs do próprio navegador, sem biblioteca nova. Em 08/11/2026 entraram o Supabase, com o banco, o login e as fotos, e a biblioteca dele para o navegador. As mudanças estão registradas no [Histórico de Alterações](09-historico-de-alteracoes.md).

---

## Camadas

| Camada | Tecnologia escolhida | Justificativa |
|---|---|---|
| **Interface** | React 18 com Vite | Stack que a equipe já domina. O Vite dá servidor de desenvolvimento rápido e build de produção com configuração mínima, o que importa num prazo de bimestre |
| **Roteamento** | React Router 7 | Rotas públicas e privadas sem biblioteca adicional. A rota privada é o que separa "fora da sessão" de "dentro da sessão" no mapa de navegação |
| **Estilo** | Tailwind CSS 4 | A nova identidade visual foi construída com classes utilitárias no próprio componente. Os tokens de cor dos temas claro e escuro ficam num arquivo só, `src/index.css`, e o Tailwind gera apenas as classes que as telas usam |
| **Componentes acessíveis** | Radix UI | Diálogos, confirmações, menus, dicas, listas de escolha e a janela do calendário do prazo já resolvem teclado, foco e leitor de tela, que são as partes mais fáceis de errar nesses componentes. A lista de escolha do Radix aceita conteúdo próprio em cada opção (a cor da disciplina, a foto do membro), o que o `select` nativo do navegador não permite |
| **Avatares** | DiceBear, como biblioteca | Dois estilos de desenho, gerados no próprio navegador a partir de uma semente. A imagem não é guardada: a semente e o estilo a reproduzem |
| **Ícones e avisos** | Lucide e Sonner | Ícones em SVG com o mesmo traço em todas as telas, e avisos curtos no canto da tela para retornos como "Atividade excluída" ou uma conquista nova |
| **Tipografia** | Inter Tight e JetBrains Mono, servidas junto com o sistema | A Inter Tight dá o texto e a JetBrains Mono entra nos números, para alinhar datas e percentuais. Os arquivos das fontes vão junto com o sistema, sem depender do Google Fonts |
| **Estado** | Context API | Suficiente para o volume de dados de um grupo de estudo. Uma biblioteca de estado externa resolveria um problema que o projeto não tem. Três contextos: a conta (`ContaContext`), os dados (`DataContext`) e a sessão do grupo (`AuthContext`) |
| **Banco de dados** | PostgreSQL no Supabase, com `@supabase/supabase-js` 2 | Recebe o modelo lógico como está e garante as regras de acesso no próprio banco, com regras de acesso por linha e gatilhos. Na demonstração, o armazenamento do navegador guarda a mesma estrutura |
| **Login** | Supabase Auth: e-mail e senha, e conta Google | A senha fica no serviço de autenticação, nunca no sistema. O banco reconhece a conta em cada consulta, e é isso que deixa as regras de acesso valerem fora das telas |
| **Arquivos** | Supabase Storage | As fotos de perfil e dos grupos ficam num bucket, numa pasta por grupo; o banco guarda só o endereço |
| **Servidor** | Não há servidor próprio | O Supabase dá banco, autenticação e armazenamento de arquivos sem que a equipe precise manter um servidor. A aplicação fala com ele direto do navegador, com a chave pública do projeto; o que ela pode fazer é limitado pelas regras do banco, não pela chave |
| **Hospedagem** | Vercel | Publicação gratuita de site estático, refeita a cada atualização no GitHub. O `vercel.json` manda qualquer endereço para o `index.html`, porque as rotas são resolvidas no navegador |

---

## Serviços externos

Serviços de terceiros, gratuitos e sem contrato de nível de serviço. Cada um tem alternativa prevista, porque nenhum deles pode derrubar a tela (RNF10).

| Serviço | Para quê | Se ficar indisponível |
|---|---|---|
| **BrasilAPI** | Feriados nacionais | O sistema consulta a fonte reserva (RN17) |
| **Nager.Date** | Fonte reserva dos feriados | O sistema reutiliza a última relação obtida; não havendo nenhuma, omite a sinalização e avisa |
| **Supabase** | Banco, login e fotos | O login avisa que não há conexão; uma gravação recusada é avisada e desfeita na tela; o modo de demonstração continua funcionando |
| **Google** | Login com a conta Google | O login por e-mail e senha continua funcionando |

Os serviços de feriados e o Google não recebem dado do grupo: o sistema pede, o serviço responde. O Supabase é diferente, porque guarda os dados, mas também não participa das regras do domínio: ele as executa como o script do banco manda. Os quatro aparecem como atores secundários no [diagrama de casos de uso](../diagramas/01-casos-de-uso.md) e não participantes do domínio.

Até 01/11/2026 os avatares também vinham de fora, do serviço da DiceBear. Desde então a mesma DiceBear entra como biblioteca, instalada junto com o sistema: o avatar é desenhado no próprio navegador, a partir de `membro.avatar` (a semente) e `membro.estilo_avatar` (um de dois estilos). O avatar aparece mesmo sem internet, e a página não pede imagem a nenhum outro endereço.

A foto de perfil e a do grupo são enquadradas num editor feito no próprio sistema, e a área enquadrada é recortada e reduzida no navegador antes de ser enviada ao armazenamento de arquivos (RN19). O editor não usa biblioteca: a imagem é decodificada fora da linha principal do navegador e o arraste e o zoom são só uma transformação de posição e escala, desenhada pela placa de vídeo, e por isso uma foto de celular não trava a tela.

---

## Onde ficam as regras de negócio

As regras não estão espalhadas pelas telas. Ficam em módulos próprios, consumidos por quem precisar:

| Regra | Onde vive | Requisito |
|---|---|---|
| Cálculo do progresso de conteúdo e de disciplina | `lib/progresso.js` | RN08, RN14 |
| Crédito e estorno de experiência, ofensiva e conquistas | `lib/gamificacao.js` | RN10, RN11, RN12 |
| Validação de título, disciplina, prazo, responsável, peso, vínculos, perfis e eventos | `lib/validacao.js` | RN03, RN06, RN07, RN09, RN13, RN21 |
| Quem muda o status, edita e exclui cada atividade, e quem edita cada evento | `lib/permissoes.js`, usado pelas telas por `hooks/usePermissoes.js` | RN07, RN20, RN21 |
| Paleta de cores das disciplinas | `lib/constants.js` | RN18 |
| Formato, enquadramento, recorte e redução das fotos | `lib/foto.js` | RN19 |
| Classificação de atraso e urgência do prazo | `lib/datas.js` e `lib/situacoes.js` | RN05, RN16 |
| Cadeia de obtenção dos feriados | `lib/feriados.js` | RN17 |
| Migração dos dados das versões anteriores (versão 3 desde 03/11: disciplina na atividade, conteúdo opcional e estilos de avatar) | `lib/migracao.js` | RN06, RN13, RN15, RN18 |
| Exclusão em cascata, troca de responsável, atividades que ficam sem conteúdo e isolamento por grupo | `context/DataContext.jsx` e, com conta, as chaves estrangeiras do banco | RN01, RN02, RN13 |
| Diferença entre a tela e o banco, ordem das gravações e mensagens das recusas | `lib/remoto.js` | RNF02 |
| Código, link e entrada pelo convite | `lib/convite.js` e a função `entrar_com_codigo` do banco | RN22 |
| Evolução do progresso | `lib/historico.js` e o gatilho `registrar_progresso` do banco | RN23 |
| Quem enxerga e altera cada linha, último organizador, status só pelo responsável | Script do banco: regras de acesso por linha e gatilhos `conferir_membro`, `conferir_atividade` e `conferir_evento` | RN01, RN07, RN20, RN21, RNF11 |

Concentrar o cálculo fora da tela é o que permite que a mesma regra alimente o painel, o calendário, a tela de disciplinas e o detalhe da atividade sem ser reescrita, e foi o que tornou a troca para o banco de dados uma mudança de camada, e não uma reescrita: as telas continuaram as mesmas.

**Por que algumas regras estão em dois lugares.** As regras de permissão (RN07, RN20, RN21) estão nas telas, para os botões sumirem para quem não pode usá-los, e no banco, para valerem mesmo para quem tentar chamar o banco por fora do sistema. As mensagens das regras do banco são escritas em português e mostradas como vieram.

---

## Ambiente de desenvolvimento

| Item | Versão ou valor |
|---|---|
| Node.js | 20 ou superior (executado e testado com 22.22.0) |
| npm | 10.9.4 |
| React | 18.3.1 |
| Vite | 6.4.5 |
| React Router | 7.18.5 |
| Tailwind CSS | 4.3.3 |
| Radix UI | diálogo 1.3.1, confirmação 1.2.1, menu 2.2.1, dica 1.4.1, lista de escolha 2.4.1 e janela flutuante 1.3.1 |
| DiceBear | núcleo 9.4.3 e os estilos Croodles Neutral e Notionists, todos 9.4.3 |
| Supabase | `@supabase/supabase-js` 2.119; banco PostgreSQL do Supabase (verificações locais no PostgreSQL 16) |
| Navegador | Chrome, Edge ou Firefox atuais |
| Variáveis de ambiente | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, com os nomes em `src/.env.example` e os valores fora do repositório. É a chave pública do projeto: o que ela permite é limitado pelas regras do banco. A chave secreta do Supabase nunca é usada pelo sistema. Sem as duas variáveis, o sistema abre só no modo de demonstração |
| Armazenamento inicial | Rodar `banco-de-dados/04-script-criacao.sql` no SQL Editor do Supabase: cria as tabelas, as regras de acesso, os gatilhos, o catálogo das conquistas e o bucket das fotos. As regras do banco podem ser conferidas num PostgreSQL local com `05-verificacoes.sql`. Na demonstração, "Carregar dados de exemplo" cria um grupo fictício |

As versões das bibliotecas são as fixadas no `package-lock.json`. Por isso a instalação usa `npm ci` quando se quer repetir exatamente o ambiente testado, e o `npm audit` não aponta nenhuma vulnerabilidade. Os comandos estão no [README](../README.md#como-rodar).

`node_modules/` e `dist/` ficam fora do versionamento, pelo `.gitignore`.

---

## Organização das pastas

Onde mexer para alterar cada parte do sistema. Os caminhos de código são relativos a `src/`.

| Para alterar | Onde |
|---|---|
| Telas do sistema | `src/pages/`, uma tela por arquivo |
| Páginas públicas: início, Sobre nós, acesso e 404 | `src/pages/publicas/`, com o movimento da página inicial em `src/components/publicas/movimento.jsx` |
| Eventos: cadastro, cartão e menu de ações | `src/components/eventos/` e a tela `src/pages/Eventos.jsx` |
| Link do formulário de feedback | `src/lib/feedback.js`, lido pela página inicial, pelo rodapé e pelo menu da conta |
| Peças de interface reaproveitadas | `src/components/`, com os componentes base em `src/components/ui/`, entre eles a lista de escolha (`selecao.jsx`), o campo de data (`campo-data.jsx`) e o editor de foto (`editor-foto.jsx`) |
| Barra do topo e layout das páginas públicas | `src/components/layout/` |
| Cores dos temas claro e escuro | `src/index.css` |
| Regras de negócio | `src/lib/`: progresso, gamificação, validação, permissões, datas, situações, foto e migração |
| Dados: leitura, gravação, exclusão em cascata | `src/context/DataContext.jsx`, com o banco em `src/lib/remoto.js` e a demonstração em `src/lib/storage.js` |
| Login e modo (com conta ou demonstração) | `src/context/ContaContext.jsx` e `src/components/conta/` |
| Convite | `src/lib/convite.js`, `src/components/membros/DialogoConvite.jsx` e `src/pages/publicas/Convite.jsx` |
| Tabelas, regras de acesso e gatilhos do banco | `banco-de-dados/04-script-criacao.sql`, na raiz do repositório |
| Sessão e perfil de quem está usando | `src/context/AuthContext.jsx` |
| Rotas | `src/App.jsx` e `src/routes/` |
| Serviços externos | `src/lib/feriados.js` e `src/lib/avatar.js` |
| Publicação na Vercel | `vercel.json` |
| Testes automatizados das regras | `verificacoes/`, que rodam com `npm run verificar` |
| Casos de teste e evidências | `docs/15-casos-de-teste.md` e `testes/` na raiz do repositório |

---

## Como a aplicação fala com o banco

A modelagem relacional da Entrega 2 não foi um exercício paralelo à implementação: o armazenamento do navegador sempre guardou os mesmos conjuntos de dados, com as mesmas chaves e os mesmos vínculos do modelo lógico. Por isso a troca pelo banco, para 27/11, mudou só a camada de acesso.

1. Ao entrar com a conta, a aplicação carrega tudo o que a conta pode ver. Quem filtra é o banco: as regras de acesso por linha devolvem só os grupos de que a conta é membro (RN01).
2. As telas continuam trabalhando com as coleções em memória, como antes. A cada alteração, a camada de dados compara o que está na tela com o que foi confirmado pelo banco e envia só a diferença: inserções e alterações do pai para o filho (grupo, membro, disciplina, conteúdo, atividade, evento, conquista), exclusões do filho para o pai, pulando o que o banco já apaga em cascata.
3. Se o banco recusa (uma regra de acesso, o último organizador, o status de outra pessoa), a tela avisa com a mensagem da regra e volta ao que está gravado.
4. Ao voltar para a aba, a aplicação recarrega o que o resto do grupo mudou nesse meio-tempo. Fechar a aba com uma alteração ainda a caminho pede confirmação.
5. As fotos sobem para o armazenamento de arquivos depois de a linha do grupo ou do membro existir, e o banco recebe o endereço.

| O que mudou em 27/11 | O que não mudou |
|---|---|
| A camada de acesso aos dados usa o banco, e não o armazenamento do navegador | O modelo conceitual e as entidades do modelo lógico; os identificadores passaram a ser UUID |
| O acesso é pela conta Google ou pelo e-mail, e a entrada no grupo é por convite | As regras de negócio e os cálculos de progresso, em `src/lib/` |
| As fotos de perfil e dos grupos vão para o armazenamento de arquivos | As telas e o mapa de navegação, com a tela de login e o convite a mais |
| Os dados são compartilhados entre os integrantes e entre dispositivos | A hospedagem na Vercel |

---|---|
| A camada de acesso aos dados passa a usar o banco, e não o armazenamento do navegador | O modelo conceitual, o modelo lógico e o dicionário de dados |
| O acesso passa a ser pela conta Google ou pelo e-mail, e a entrada no grupo por convite | As regras de negócio e os cálculos de progresso, em `src/lib/` |
| As fotos de perfil e dos grupos vão para o armazenamento de arquivos, e o membro e o grupo guardam só o endereço | As telas e o mapa de navegação |
| Os dados passam a ser compartilhados entre os integrantes e entre dispositivos | A hospedagem na Vercel |

---

### Navegação

[⬅ Anterior: Backlog](12-backlog.md) · [Índice](../README.md) · [Próximo: Produto Mínimo Viável ➡](14-mvp.md)

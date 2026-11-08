# Vértice

Plataforma de acompanhamento de aprendizagem.

O Vértice **mede o quanto o estudante avançou em cada disciplina**. Não é um
gerenciador de tarefas: toda atividade tem um **peso de 1 a 5**, e o progresso
é a razão entre o peso concluído e o peso total. Concluir uma atividade não
risca um item de uma lista: move uma barra e credita experiência a quem a fez.

Quem entra no sistema entra como um **grupo**. O grupo organiza suas
disciplinas e cadastra as atividades de cada uma (dividindo a disciplina em
conteúdos, se quiser), além dos **eventos** com dia marcado, como provas e
palestras.

O sistema funciona de dois jeitos:

- **Com conta** (e-mail e senha ou Google): os dados ficam num banco
  PostgreSQL no Supabase, e o grupo inteiro vê as mesmas disciplinas,
  atividades e eventos, de qualquer aparelho. A turma entra no grupo por um
  convite (link ou código).
- **Demonstração, sem conta**: para conhecer o sistema. Tudo fica no
  navegador, com um grupo de exemplo pronto.

> Front-end em **React + Vite**, com **Tailwind CSS** e **Radix UI**. Banco,
> login e fotos no **Supabase** (PostgreSQL, Auth e Storage).

---

## A hierarquia

Essa cadeia é a espinha do sistema, e o que permite medir progresso:

```
grupo ──▶ disciplina ──▶ atividade (peso 1–5, com responsável)
                 └──▶ conteúdo (opcional) ──┘
```

Uma atividade pertence a **exatamente uma** disciplina e tem um
**responsável**. O **conteúdo é opcional** (desde 06/11/2026): quem quer ver o
progresso por assunto divide a disciplina em conteúdos, como "SQL" e
"Modelagem" dentro de Banco de Dados, e põe a atividade num deles. Quem não
quer cadastra a atividade direto na disciplina.

O progresso soma peso:

- **progresso do conteúdo** = peso das atividades concluídas do conteúdo ÷
  peso de todas as atividades dele
- **progresso da disciplina** = peso concluído de todas as atividades da
  disciplina (com ou sem conteúdo) ÷ peso total delas

A segunda linha **não é a média dos percentuais dos conteúdos**. Um conteúdo
que vale 20 pontos de peso pesa mais que um de 4, e a média trataria os dois
como iguais. Conteúdo sem atividade nenhuma fica **fora** do cálculo, em vez de
contar como 0%.

Os **eventos** (prova, apresentação, palestra, reunião) não têm peso nem
responsável, então não entram no progresso: servem para o grupo ver no
calendário o que tem dia e hora marcados.

**Experiência:** cada ponto de peso vale 10 de experiência, creditada ao
responsável quando a atividade é concluída e estornada se ela deixar de estar.
Por isso **só o responsável muda o status** da atividade: ninguém conclui pelos
outros.

---

## Funcionalidades

- **Páginas públicas**: página inicial, "Sobre nós" com a história da equipe
  e página 404. A página inicial se mexe: o topo entra em cascata e acende em
  volta do mouse, a prévia do sistema inclina com o ponteiro, as barras
  enchem quando aparecem e cada funcionalidade mostra uma demonstração curta
  ao passar o mouse (no celular, quando aparece na tela). Quem pede menos
  movimento no sistema vê tudo parado.
- **Feedback** dos usuários de teste: seção na página inicial (com link no
  topo e no rodapé) e item no menu da conta, que abrem um formulário anônimo.
  O link fica em `src/lib/feedback.js`; enquanto está vazio, os botões
  aparecem como "em breve".
- **Login** com e-mail e senha ou com a conta Google. Ao lado, o botão
  **"Experimentar sem conta"** abre a demonstração.
- **Acesso ao grupo** em duas colunas: os grupos da conta (com o campo do
  **código de convite**) numa, a criação de um grupo novo na outra. Quem cria
  o grupo pode pôr uma **foto do grupo** e entra como organizador. Na
  demonstração, depois de escolher o grupo, a pessoa escolhe quem é dentro
  dele.
- **Convite para o grupo**: o organizador gera, em Membros, um código de 8
  letras e números e um link (`/convite/CODIGO`), válidos por 7 dias. Quem
  abre o link e entra com a conta cai direto no grupo, como participante. Se
  o organizador já tinha cadastrado a pessoa com o mesmo e-mail, a conta
  fica ligada a esse cadastro.
- **Tutorial** opcional: o painel convida na primeira visita, e o menu da
  conta abre de novo quando quiser.
- **Painel** com saudação, as quatro situações (a fazer, fazendo, concluídas,
  atrasadas) como filtro, próximas entregas, progresso por disciplina, o seu
  ritmo (experiência e ofensiva), os próximos eventos e os próximos feriados.
- **Calendário** do mês, da semana ou em lista, com as entregas de cada dia
  nas cores das disciplinas, os eventos do grupo e os feriados nacionais. A troca de mês (ou de
  semana) passa a página para o lado, pelos botões ou deslizando o dedo no
  celular. Um dia do calendário abre a criação de atividade (ou de evento)
  com a data já preenchida.
- **Eventos** do grupo: prova, apresentação, palestra, reunião ou outro, com
  dia, horário (opcional), local, disciplina (opcional) e observações. Têm
  página própria, com os próximos e os passados, e aparecem no calendário e
  no painel. Qualquer membro cadastra; edita e exclui quem cadastrou ou o
  organizador.
- **Disciplinas** por grupo, com cor escolhida numa **paleta de 18 cores**
  legíveis nos dois temas. Nome único dentro do grupo.
- **Conteúdos** (opcionais) dentro de cada disciplina, em ordem definida pelo
  grupo.
- **Atividades** de uma disciplina, com título, disciplina, prazo e
  responsável obrigatórios, além de conteúdo, descrição, peso de 1 a 5,
  prioridade e status. O
  formulário começa vazio: o que é obrigatório é cobrado ao salvar, e o que
  fica em branco assume o padrão (peso 1, status "a fazer"). O prazo é
  escolhido num calendário com a cara do sistema, que marca hoje, os fins de
  semana e os feriados. Se o conteúdo ainda não existe, o organizador o cria
  ali mesmo, sem perder o que já preencheu.
- **Lista de atividades** com busca (título, descrição, disciplina ou
  conteúdo), filtros por situação, disciplina, responsável e prazo, e
  ordenação. Cada filtro mostra o marcador do sistema: a cor da disciplina, a
  foto do responsável, o símbolo da ordem. Situação, busca e disciplina ficam
  no endereço da página.
- **Progresso** por conteúdo e por disciplina, calculado por peso, e a
  **evolução** da disciplina dia a dia, numa linha na tela da disciplina
  (com conta, a partir das fotografias que o próprio banco grava a cada
  mudança; na demonstração, reconstruída pelas datas das atividades).
- **Experiência, ofensiva e conquistas**: experiência por membro, dias
  seguidos com conclusão e seis conquistas, com ranking do grupo.
- **Marca do Vértice** que, ao abrir um grupo, aparece no centro com o nome
  dele e dá um terço de volta enquanto a tela se dissolve no painel; ao passar
  o mouse, dá uma volta rápida. As seções ficam numa **barra no topo** (no
  celular, num menu que desce do topo).
- **Membros** com **foto de perfil** ou **avatar**, em dois estilos de desenho
  à escolha (Croodles Neutral e Notionists), com sorteio. A foto passa por um **editor** em que a pessoa
  arrasta e dá zoom para enquadrar antes de salvar.
- **Perfis**: o **organizador** gerencia membros, disciplinas e conteúdos,
  edita o grupo (nome, descrição e foto), edita e exclui qualquer atividade e
  exclui o grupo; o **participante** cadastra atividades, edita e exclui as
  que estão sob a responsabilidade dele e edita o próprio perfil. **Só o
  responsável conclui ou muda o status** de uma atividade (nem o organizador
  conclui pelos outros). Ao remover um membro com atividades, o organizador
  escolhe quem as assume. A exclusão do grupo fica no pé da tela de Membros.
- **Feriados** da BrasilAPI, com aviso quando um prazo cai em feriado
  nacional ou em fim de semana.
- **Tema claro e escuro** em todas as telas, inclusive as públicas, com a
  escolha salva.
- **Aviso de falha de gravação** quando o banco recusa uma alteração (o
  sistema volta ao que está gravado) ou, na demonstração, quando o navegador
  não consegue guardar os dados. Fechar a aba com alteração a caminho do
  banco pede confirmação.
- **Migração automática** dos dados de quem usou as versões anteriores.
- Layout responsivo, do celular à tela larga.

---

## Tecnologias

| Camada | Ferramenta |
|--------|-----------|
| Biblioteca de interface | React 18.3 |
| Build e servidor de desenvolvimento | Vite 6.4 |
| Navegação | React Router 7.18 (rotas normais, dinâmicas e privadas) |
| Estilização | Tailwind CSS 4.3, com os tokens de cor em variáveis CSS (`src/index.css`) |
| Componentes acessíveis | Radix UI (diálogo, confirmação, menu, dica, lista de escolha, janela flutuante do calendário) |
| Ícones | Lucide |
| Avisos na tela | Sonner |
| Tipografia | Inter Tight para o texto e JetBrains Mono para números, servidas junto com o sistema (`@fontsource-variable`) |
| Estado | Context API + hooks |
| Banco de dados | PostgreSQL no [Supabase](https://supabase.com/), com regras de acesso por linha (RLS) e gatilhos para as regras de negócio |
| Login | Supabase Auth (e-mail e senha, Google) |
| Fotos | Supabase Storage (bucket `fotos`) |
| Cliente do banco | `@supabase/supabase-js` 2 |
| Demonstração | armazenamento do navegador (`localStorage`) |
| API externa | [BrasilAPI](https://brasilapi.com.br/) e [Nager.Date](https://date.nager.at/) (feriados) |
| Avatares | [DiceBear](https://www.dicebear.com/) como biblioteca (`@dicebear/core` 9.4.3 e dois estilos): o avatar é desenhado no próprio navegador, sem depender de serviço externo |
| Hospedagem | Vercel |

---

## Como rodar

Pré-requisitos: **Node.js 20 ou mais recente** e npm.

```bash
npm install        # instalar dependências
npm run dev        # rodar em desenvolvimento (abre em http://localhost:5173)
npm run build      # gerar a versão de produção em dist/
npm run preview    # pré-visualizar a versão de produção
npm run verificar  # conferir as regras de negócio
```

> Sem banco configurado, o sistema abre direto na demonstração. Na tela de
> acesso, clique em **"Carregar dados de exemplo"** para entrar com um grupo
> preenchido.

### Ligar o banco (Supabase)

1. Crie um projeto no Supabase (região São Paulo).
2. No **SQL Editor**, rode o script `banco-de-dados/04-script-criacao.sql`
   do repositório da equipe. Ele cria as tabelas, as regras de acesso, os
   gatilhos, o convite e o espaço das fotos, e pode ser rodado de novo (apaga
   e recria tudo).
3. Em **Authentication**, desligue *Confirm email* em *Sign In / Providers →
   Email* e, para o Google, ligue o provedor com o Client ID e o Client
   Secret criados no Google Cloud. Em *URL Configuration*, ponha o endereço
   do sistema em *Site URL* e em *Redirect URLs*.
4. Copie `.env.example` para `.env` e preencha com a *Project URL* e a chave
   *publishable* (ou *anon*) do projeto. Nunca use a chave *secret*: ela
   ignora as regras de acesso.

```bash
cp .env.example .env
```

Na Vercel, as mesmas duas variáveis (`VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`) vão em *Settings → Environment Variables*.

O `npm run verificar` roda as verificações de `verificacoes/`, em JavaScript
puro, sem biblioteca de teste instalada. São 240 conferências das regras que
mais escondem erro: progresso por razão de pesos (e não média de
percentuais), experiência que não pode ser creditada duas vezes, ofensiva,
conquistas que não podem ser revogadas, perfis, quem pode mudar o status de
cada atividade, validação da atividade, o enquadramento da foto, a migração
dos dados antigos, a ordem das gravações no banco e a evolução do progresso.

As regras do banco têm verificações próprias, em SQL
(`banco-de-dados/05-verificacoes.sql`), que rodam num PostgreSQL local.

---

## Publicação na Vercel

O projeto já vem pronto para a Vercel:

| Configuração | Valor |
|---|---|
| Framework | Vite (detectado sozinho) |
| Pasta raiz do projeto (*Root Directory*) | `src` (a pasta deste README no repositório da equipe) |
| Comando de build | `npm run build` |
| Pasta publicada | `dist` |

O `vercel.json` manda qualquer endereço para o `index.html`. Sem isso, abrir
direto um endereço como `/atividades` (ou o link de um convite) daria 404,
porque quem resolve as rotas é o React Router, no navegador.

---

## Estrutura do projeto

```
index.html                    # Página base; aplica o tema antes de o React montar
vercel.json                   # Rotas da Vercel (tudo para o index.html)
public/favicon.svg
src/
├── main.jsx                  # Ponto de entrada; roda a migração antes de montar
├── App.jsx                   # Mapa de rotas
├── index.css                 # Tailwind + tokens de cor dos temas claro e escuro
├── assets/                   # Avatares da equipe (página Sobre nós)
├── lib/                      # Regras de negócio, sem React
│   ├── supabase.js           # Cliente do banco (só existe com o .env)
│   ├── remoto.js             # Tabelas do banco ↔ coleções do sistema, diferença e gravação
│   ├── convite.js            # Código, link e entrada pelo convite
│   ├── fotosRemotas.js       # Fotos para o Storage
│   ├── historico.js          # Evolução do progresso (RF12)
│   ├── storage.js            # Armazenamento do navegador + geração de id
│   ├── constants.js          # Status, prioridade, peso, perfil, paleta de cores
│   ├── datas.js              # Datas locais, prazos, fim de semana
│   ├── formatos.js           # Textos de data e de prazo para as telas
│   ├── situacoes.js          # A fazer, fazendo, concluídas, atrasadas
│   ├── validacao.js          # Validações em JS puro
│   ├── permissoes.js         # Quem conclui, edita e exclui cada atividade
│   ├── progresso.js          # Progresso de conteúdo e de disciplina
│   ├── gamificacao.js        # Experiência, ofensiva e conquistas
│   ├── migracao.js           # Migração dos dados das versões anteriores
│   ├── foto.js               # Enquadramento, recorte e redução das fotos
│   ├── avatar.js             # Avatares nos dois estilos (DiceBear) + iniciais
│   ├── feriados.js           # BrasilAPI → Nager.Date → cache
│   ├── feedback.js           # Link do formulário anônimo de feedback
│   ├── seed.js               # Dados de exemplo
│   └── utils.js              # Classes, plural, primeiro nome
├── hooks/
│   ├── useFeriados.js
│   ├── usePermissoes.js      # As regras de permissoes.js ligadas à sessão
│   └── useTitulo.js          # Título da aba do navegador
├── context/
│   ├── TemaContext.jsx       # Tema claro/escuro
│   ├── ContaContext.jsx      # Conta (login) e modo: com conta ou demonstração
│   ├── DataContext.jsx       # Coleções + cadastro + seletores + conquistas + gravação no banco
│   └── AuthContext.jsx       # Sessão (grupo e membro)
├── routes/
│   └── ProtectedRoute.jsx    # Barra as rotas privadas sem sessão
├── components/
│   ├── conta/                # Login e entrada por código de convite
│   ├── tutorial/             # Tutorial opcional
│   ├── ui/                   # Componentes base: botão, cartão, campos, lista de escolha,
│   │                         # campo de data, editor de foto, diálogo, avatares...
│   ├── layout/               # Barra do topo, layout das páginas públicas e a passagem ao abrir o grupo
│   ├── atividades/           # Linha da lista, cartões de situação, peso, conclusão
│   ├── eventos/              # Cartão, formulário e tipos de evento
│   ├── feedback/             # Seção e botão do formulário de feedback
│   ├── publicas/             # Movimento das páginas públicas (aparecer ao rolar, mouse)
│   ├── disciplinas/          # Formulários, paleta de cores e gráfico da evolução
│   ├── grupos/               # Edição do grupo (nome, descrição e foto)
│   ├── membros/              # Formulário de membro (foto e avatar) e convite
│   ├── gamificacao/          # "Seu ritmo": experiência, ofensiva e conquistas
│   ├── opcoes.jsx            # Opções das listas: cor, foto, situação, prioridade, perfil
│   ├── Avisos.jsx            # Avisos na tela (Sonner)
│   ├── BotaoTema.jsx         # Troca de tema (sistema e páginas públicas)
│   ├── ProximosFeriados.jsx
│   ├── RolarParaTopo.jsx
│   └── SomenteOrganizador.jsx
└── pages/
    ├── publicas/             # Início, Sobre nós, Entrar, Convite, página 404
    ├── Painel.jsx
    ├── Calendario.jsx
    ├── Eventos.jsx           # Próximos e passados, com filtro por tipo
    ├── Disciplinas.jsx
    ├── DisciplinaDetalhe.jsx # Atividades, conteúdos (opcionais) e progresso
    ├── Atividades.jsx
    ├── AtividadeForm.jsx     # Criar e editar (mesmo componente)
    ├── AtividadeDetalhe.jsx
    ├── Membros.jsx
    └── Conquistas.jsx

verificacoes/                 # Verificação das regras de negócio (npm run verificar)
```

---

## Modelo de dados

Com conta, os dados ficam nas tabelas do banco (script em
`banco-de-dados/04-script-criacao.sql`). As telas trabalham sempre com as
mesmas coleções em memória; o `DataContext` carrega tudo o que a conta pode
ver e, a cada alteração, manda ao banco só a diferença, na ordem das chaves
estrangeiras (`lib/remoto.js`). Se o banco recusar, o sistema avisa e volta
ao que está gravado. Ao voltar para a aba, recarrega o que o resto do grupo
mudou.

**A segurança fica no banco.** Cada tabela tem regras de acesso por linha:
a conta só enxerga os grupos de que é membro (RN01), só o organizador
gerencia membros, disciplinas e conteúdos (RN07), só o responsável muda o
status da atividade (RN20) e o grupo nunca fica sem organizador. As mesmas
regras estão nas telas, mas quem garante é o banco, mesmo para quem tentar
chamar o banco por fora do sistema.

Na demonstração, as coleções do navegador guardam **as mesmas chaves e
vínculos** do modelo relacional.

Chaves: `grupos`, `membros`, `disciplinas`, `conteudos`, `atividades`,
`eventos`, `conquistasMembro`, `sessao`, `versaoDados`.

A `sessao` guarda o grupo e o membro que está usando o sistema. Ela não vem
do modelo relacional: é estado do navegador, e existe porque o perfil do RN07
precisa saber quem é a pessoa.

| Entidade | Campos |
|---|---|
| **grupo** | `id`, `nome`, `descricao`, `foto`, `criadoEm` |
| **membro** | `id`, `grupoId`, `nome`, `funcao`, `email`, `avatar`, `estiloAvatar`, `foto`, `perfil` |
| **disciplina** | `id`, `grupoId`, `nome`, `cor`, `criadaEm` (nome único no grupo, cor da paleta) |
| **conteudo** | `id`, `disciplinaId`, `nome`, `descricao`, `ordem` (nome único na disciplina) |
| **atividade** | `id`, `disciplinaId`, `conteudoId` (vazio quando não tem conteúdo), `responsavelId`, `titulo`, `descricao`, `prazo`, `peso`, `prioridade`, `status`, `criadaEm`, `dataConclusao` |
| **evento** | `id`, `grupoId`, `titulo`, `tipo`, `data`, `horaInicio`, `horaFim`, `local`, `disciplinaId` (opcional), `descricao`, `criadoPor`, `criadoEm` |
| **conquista do membro** | `membroId`, `codigo`, `obtidaEm` (espelha a tabela `membro_conquista`) |

Repare que **a atividade não guarda `grupoId`**: o grupo chega pela cadeia
`atividade → disciplina → grupo`. Guardá-lo ali seria um dado derivado com
prazo de validade. Todo seletor filtra por grupo atravessando essa cadeia, e
por isso cada grupo só enxerga o que é dele. Se a atividade tiver conteúdo,
ele é da mesma disciplina. O evento guarda o `grupoId` porque a disciplina
dele é opcional.

O `status` é gravado como `'a fazer'`, `'fazendo'` ou `'concluido'`.

A **foto** do membro e a do grupo passam pelo editor: o quadrado que a pessoa
enquadra é reduzido para 256 × 256 em JPEG (entre 5 e 30 KB) antes de ser
gravado. Sem foto, o membro tem o avatar desenhado a partir da semente
gravada em `avatar`, no estilo gravado em `estiloAvatar`, e o grupo mostra as
iniciais do nome.

A **experiência** e a **ofensiva** não são gravadas: são calculadas a partir
das atividades concluídas. As **conquistas** são gravadas, porque uma
conquista concedida não é retirada depois.

### Exclusão em cascata

- Grupo excluído remove disciplinas, conteúdos, atividades, eventos, membros
  e conquistas.
- Disciplina excluída remove seus conteúdos e atividades. Os eventos dela
  continuam, sem disciplina.
- **Conteúdo excluído não leva as atividades**: elas continuam na
  disciplina, sem conteúdo.
- **Membro excluído não leva as atividades junto**: antes de remover, o
  organizador escolhe quem assume as atividades dele.

### Migração

A migração roda **uma vez** ao abrir o sistema, com o número da versão dos
dados gravado em `versaoDados`.

- **Versão 1**: quem usou a primeira versão tinha as atividades gravadas
  como `tarefas`, com a disciplina em texto livre. A migração cria uma
  disciplina por nome distinto, um conteúdo "Geral" em cada uma, atribui
  peso 1, preenche a data de conclusão das já concluídas e define o perfil
  dos membros. A chave antiga só é apagada depois de a nova estar gravada.
- **Versão 2**: atividade sem responsável passa para o organizador do grupo,
  e a cor que saiu da paleta vira a equivalente. Atividade antiga cujo grupo
  não existe mais não é convertida nem apagada, e a pessoa é avisada.
- **Versão 3**: a atividade ganha a disciplina do próprio conteúdo. O
  conteúdo "Geral" que a versão 1 criou só para não deixar atividade solta
  sai, e as atividades dele ficam direto na disciplina. Membro com um dos
  estilos de avatar que saíram passa para o estilo padrão.

---

## Rotas

| Rota | Tela | Acesso |
|------|------|--------|
| `/` | Página inicial | pública |
| `/sobre` | Sobre nós | pública |
| `/entrar` | Login e acesso ao grupo (`/login` leva para cá) | pública |
| `/convite/:codigo` | Link do convite: guarda o código e leva ao acesso | pública |
| `/painel` | Painel | privada |
| `/calendario` | Calendário | privada |
| `/eventos` | Eventos do grupo (`?novo=` já abre o cadastro) | privada |
| `/disciplinas` | Disciplinas do grupo | privada |
| `/disciplina/:id` | Atividades, conteúdos e progresso da disciplina | privada |
| `/atividades` | Lista de atividades com filtros | privada |
| `/atividade/nova` | Formulário de nova atividade | privada |
| `/atividade/:id` | Detalhe da atividade | privada |
| `/atividade/:id/editar` | Formulário de edição | privada |
| `/membros` | Membros do grupo | privada |
| `/conquistas` | Experiência, ofensiva, conquistas e ranking | privada |
| `*` | Página 404 | pública |

As rotas privadas só abrem com uma sessão; sem ela, o sistema manda para
`/entrar` e, depois do acesso, volta para o endereço pedido.

---

## Mapeamento dos requisitos técnicos

| Requisito | Onde se resolve |
|-----------|-----------------|
| HTML5 semântico | `header`, `nav`, `main`, `section`, `aside`, `footer`, `dl`, `ol`, `form` nas telas |
| Box Model | Cartões, painéis e linhas da lista de atividades |
| Flexbox | Cabeçalhos, barra de filtros, linhas de atividade |
| Grid | Painel, calendário, grade de disciplinas e ranking |
| Media Queries | Classes responsivas do Tailwind: a barra do topo vira um menu que desce no celular, as grades viram coluna única |
| Estilização componentizada | Tailwind CSS + componentes de interface em `components/ui` |
| Componentização | Botão, cartão, campo, lista de escolha, campo de data, editor de foto, diálogo, avatar, barra de progresso, seletor de peso, paleta de cores |
| Validação em JS puro | `lib/validacao.js`, `lib/permissoes.js` e `lib/foto.js` |
| Eventos e listeners | Envio de formulários, filtros, troca de status, seleção por teclado na paleta, no peso e no calendário do prazo, arrastar e dar zoom na foto (mouse, dedos e teclado), deslizar o calendário no celular, Esc fecha diálogos |
| Armazenamento do navegador | `lib/storage.js` + `DataContext` |
| Fetch API + JSON | `lib/feriados.js` (BrasilAPI e Nager.Date) e o cliente do Supabase |
| Async/await | Login, gravação no banco, convite e envio das fotos |
| Props | A lista passa cada atividade à `LinhaAtividade` |
| useState | Formulários, filtros, coleções |
| useEffect | Persistência, busca dos feriados, concessão de conquistas |
| React Router | Rotas normais, dinâmicas (`/atividade/:id`) e privadas |
| Regras de negócio fora das telas | `lib/progresso.js`, `lib/gamificacao.js`, `lib/situacoes.js`, `lib/validacao.js`, `lib/datas.js` |

---

## Observações

- **Demonstração sem senha.** Sem conta, o acesso é a seleção de um grupo
  guardado no navegador, e quem está usando escolhe quem é dentro dele.
- **Serviços externos não derrubam a tela.** Os feriados seguem a cadeia
  BrasilAPI → Nager.Date → último resultado em cache, e somem em silêncio se
  tudo falhar. Nenhum desses serviços recebe dado do grupo. Os avatares não
  dependem de serviço: são desenhados no próprio navegador.
- **Falha de gravação não passa em silêncio.** Se o navegador recusar a
  gravação (armazenamento cheio ou bloqueado), o sistema avisa e mantém uma
  faixa no topo até a gravação voltar a funcionar.
- **Com conta, o perfil protege; na demonstração, só organiza.** Com conta,
  as regras de perfil valem no banco. Na demonstração, sem senha, quem quiser
  entra como outra pessoa: ali a regra evita a bagunça acidental, que é o
  problema real de um trabalho em grupo.
- **O grupo não fica sem organizador.** O último não pode ser rebaixado nem
  removido: sem ele ninguém mais gerencia nada e o grupo trava.

## Créditos dos avatares

Os desenhos dos avatares são gerados pela biblioteca da DiceBear, a partir de
estilos de outros autores:

| Estilo no sistema | Original | Autor | Licença |
|---|---|---|---|
| Rabisco | Croodles - Doodle your face (Croodles Neutral) | vijay verma | CC BY 4.0 |
| Ilustrado | Notionists | Zoish | CC0 1.0 |

Cada imagem gerada leva o crédito do seu estilo nos metadados do próprio SVG.

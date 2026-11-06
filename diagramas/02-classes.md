# Diagrama de Classes

> **Vértice** · Plataforma de Acompanhamento de Aprendizagem
> Entrega 2 · Modelagem do Software · Equipe 7 · atualizado em 06/11/2026

---

O diagrama apresenta as nove classes do domínio, seus atributos principais e os relacionamentos com cardinalidade. Os losangos preenchidos indicam **composição**: a existência da parte depende do todo, o que corresponde à cascata de exclusão descrita na RN02.

```mermaid
%%{init: {"theme": "base", "fontFamily": "Space Grotesk", "themeVariables": {"fontFamily": "Space Grotesk, Segoe UI, sans-serif", "fontSize": "14px", "primaryColor": "#F5F7FC", "primaryTextColor": "#0B1220", "primaryBorderColor": "#0891B2", "lineColor": "#5B6678", "classText": "#0B1220", "textColor": "#0B1220", "mainBkg": "#F5F7FC", "nodeBorder": "#0891B2", "edgeLabelBackground": "#FFFFFF", "titleColor": "#0E7490"}}}%%
classDiagram
    direction LR

    class Grupo {
        +String id
        +String nome
        +String descricao
        +String foto
        +Date criadoEm
        +progressoGeral() Decimal
    }

    class Membro {
        +String id
        +String nome
        +String funcao
        +String email
        +String avatar
        +String estiloAvatar
        +String foto
        +PerfilUsuario perfil
        +experienciaAcumulada() Integer
        +ofensivaAtual() Integer
        +ehOrganizador() Boolean
    }

    class Disciplina {
        +String id
        +String nome
        +String cor
        +Date criadaEm
        +progresso() Decimal
        +pesoTotal() Integer
        +pesoConcluido() Integer
    }

    class Conteudo {
        +String id
        +String nome
        +String descricao
        +Integer ordem
        +progresso() Decimal
        +pesoTotal() Integer
        +pesoConcluido() Integer
    }

    class Atividade {
        +String id
        +String titulo
        +String descricao
        +Date prazo
        +Integer peso
        +Prioridade prioridade
        +StatusAtividade status
        +Date criadaEm
        +Date concluidaEm
        +concluir() void
        +reabrir() void
        +podeMudarStatus(Membro) Boolean
        +estaAtrasada() Boolean
        +experienciaGerada() Integer
    }

    class Evento {
        +String id
        +String titulo
        +TipoEvento tipo
        +Date data
        +String horaInicio
        +String horaFim
        +String local
        +String descricao
        +eFuturo() Boolean
        +podeEditar(Membro) Boolean
    }

    class ProgressoHistorico {
        +String id
        +Date dataRegistro
        +Decimal percentual
    }

    class Conquista {
        +String id
        +String codigo
        +String nome
        +String descricao
        +String icone
        +CriterioConquista criterioTipo
        +Integer criterioValor
        +avaliar(Membro) Boolean
    }

    class MembroConquista {
        +Date obtidaEm
    }

    class StatusAtividade {
        <<enumeration>>
        A_FAZER
        FAZENDO
        CONCLUIDO
    }

    class Prioridade {
        <<enumeration>>
        BAIXA
        MEDIA
        ALTA
    }

    class PerfilUsuario {
        <<enumeration>>
        ORGANIZADOR
        PARTICIPANTE
    }

    class TipoEvento {
        <<enumeration>>
        PROVA
        APRESENTACAO
        PALESTRA
        REUNIAO
        OUTRO
    }

    class CriterioConquista {
        <<enumeration>>
        ATIVIDADES_CONCLUIDAS
        CONTEUDO_COMPLETO
        DISCIPLINA_COMPLETA
        OFENSIVA_DIAS
        EXPERIENCIA_TOTAL
    }

    Grupo "1" *-- "0..*" Membro : possui
    Grupo "1" *-- "0..*" Disciplina : organiza
    Disciplina "1" *-- "0..*" Conteudo : divide-se em
    Disciplina "1" *-- "0..*" Atividade : reune
    Conteudo "0..1" o-- "0..*" Atividade : agrupa
    Grupo "1" *-- "0..*" Evento : agenda
    Disciplina "0..1" -- "0..*" Evento : assunto de
    Membro "0..1" --> "0..*" Evento : cadastrou
    Disciplina "1" *-- "0..*" ProgressoHistorico : registra
    Membro "1" --> "0..*" Atividade : responsavel por
    Membro "1" -- "0..*" MembroConquista
    Conquista "1" -- "0..*" MembroConquista

    Atividade ..> StatusAtividade
    Atividade ..> Prioridade
    Membro ..> PerfilUsuario
    Conquista ..> CriterioConquista
    Evento ..> TipoEvento

    style Grupo fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Membro fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Disciplina fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Conteudo fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Atividade fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Evento fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style ProgressoHistorico fill:#F5F7FC,stroke:#CDD4E1,stroke-width:1.6px,color:#0B1220
    style Conquista fill:#F5F7FC,stroke:#CDD4E1,stroke-width:1.6px,color:#0B1220
    style MembroConquista fill:#EEF7DD,stroke:#4D7C0F,stroke-width:2.5px,color:#3F6212
    style StatusAtividade fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style Prioridade fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style PerfilUsuario fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style CriterioConquista fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style TipoEvento fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678

    style Grupo fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Membro fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Disciplina fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Conteudo fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Atividade fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style Evento fill:#E0F7FC,stroke:#0891B2,stroke-width:2px,color:#0B1220
    style ProgressoHistorico fill:#F5F7FC,stroke:#CDD4E1,stroke-width:1.6px,color:#0B1220
    style Conquista fill:#F5F7FC,stroke:#CDD4E1,stroke-width:1.6px,color:#0B1220
    style MembroConquista fill:#EEF7DD,stroke:#4D7C0F,stroke-width:2.5px,color:#3F6212
    style StatusAtividade fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style Prioridade fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style PerfilUsuario fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style CriterioConquista fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
    style TipoEvento fill:#EEF1F6,stroke:#64748B,stroke-width:1.4px,color:#5B6678
```

> Versão em imagem para inserir no documento: [`png/diagrama-de-classes.png`](png/diagrama-de-classes.png)

---

## Leitura dos relacionamentos

| Relacionamento | Cardinalidade | Leitura |
|---|---|---|
| Grupo e Membro | 1 : 0..N | Um grupo possui vários membros; cada membro pertence a exatamente um grupo |
| Grupo e Disciplina | 1 : 0..N | Um grupo organiza várias disciplinas; cada disciplina pertence a um único grupo |
| Disciplina e Conteúdo | 1 : 0..N | Uma disciplina divide-se em vários conteúdos; cada conteúdo pertence a uma única disciplina (RN13) |
| Disciplina e Atividade | 1 : 0..N | Uma disciplina reúne várias atividades; cada atividade pertence a exatamente uma disciplina (RN13) |
| Conteúdo e Atividade | 0..1 : 0..N | Um conteúdo agrupa várias atividades; a atividade pode estar em nenhum ou em um conteúdo, sempre da sua disciplina. Excluído o conteúdo, a atividade fica na disciplina (RN02, RN13) |
| Membro e Atividade | 1 : 0..N | Um membro pode ser responsável por várias atividades; toda atividade tem exatamente um responsável (RN06). Antes de um membro ser removido, as atividades dele passam para outro membro do grupo (RN02) |
| Grupo e Evento | 1 : 0..N | Um grupo agenda vários eventos; cada evento pertence a um único grupo (RF31) |
| Disciplina e Evento | 0..1 : 0..N | Um evento pode ser de uma disciplina; excluída a disciplina, o evento fica no grupo, sem disciplina (RN02) |
| Membro e Evento | 0..1 : 0..N | O evento guarda quem o cadastrou; ele e o organizador editam e excluem (RN21) |
| Disciplina e ProgressoHistorico | 1 : 0..N | Uma disciplina acumula vários registros de progresso ao longo do tempo (RF12) |
| Membro e Conquista | 0..N : 0..N | Um membro obtém várias conquistas e uma conquista é obtida por vários membros. A associação é resolvida pela classe associativa **MembroConquista**, que guarda a data de obtenção (RN12) |

---

## Observações de projeto

**Experiência e ofensiva são calculadas, não armazenadas.** `Membro.experienciaAcumulada()` soma `Atividade.experienciaGerada()` das atividades concluídas sob sua responsabilidade, e `Membro.ofensivaAtual()` percorre as datas em `Atividade.concluidaEm`. Guardar esses valores em atributos criaria uma segunda fonte de verdade que precisaria ser sincronizada a cada alteração de status, inclusive nas reversões previstas na RN10.

**O progresso também é calculado.** `Conteudo.progresso()` e `Disciplina.progresso()` aplicam diretamente as fórmulas da RN08 e da RN14. A classe **ProgressoHistorico** não duplica esse cálculo: ela guarda o resultado de um dia específico, porque a evolução ao longo do tempo (RF12) não pode ser reconstruída a partir do estado atual.

**A Conquista é um catálogo.** Ela não pertence a nenhum grupo: descreve o marco e o critério de avaliação. Quem liga o marco ao estudante é a classe associativa MembroConquista.

**A foto e o avatar convivem no Membro.** `foto` guarda a foto de perfil enviada pela pessoa e enquadrada no editor (RF24, RN19) e, quando existe, é ela que aparece; `avatar` guarda a semente do avatar sorteado e `estiloAvatar`, qual dos dois estilos de desenho (Rabisco ou Ilustrado) a pessoa escolheu; o avatar é usado quando não há foto e é desenhado pelo próprio sistema a partir dos dois (RF19, RN15).

**O grupo também tem foto.** `Grupo.foto` guarda a foto do grupo, enquadrada do mesmo jeito (RF29, RN19); sem ela, as telas mostram as iniciais do nome do grupo.

**Evento não é atividade.** A atividade é trabalho de alguém e entra no progresso; o evento é algo que acontece num dia, sem responsável, peso nem status. `Evento.eFuturo()` decide se ele aparece em Próximos ou em Passados, e `Evento.podeEditar(Membro)` é verdadeiro para quem o cadastrou e para o organizador (RN21).

**Só o responsável muda o status.** `Atividade.podeMudarStatus(Membro)` só é verdadeiro para o membro responsável pela atividade (RN20): é a ele que `concluir()` e `reabrir()` são oferecidos, porque é ele quem recebe a experiência (RN10).

---

### Navegação

[⬅ Anterior: Casos de Uso](01-casos-de-uso.md) · [Índice](../README.md) · [Próximo: Fluxo: Concluir Atividade ➡](03-atividade-concluir.md)

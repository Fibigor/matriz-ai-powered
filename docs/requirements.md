# Matriz — Requisitos e âmbito funcional

## 1. Origem, estado e convenções

Este documento responde aos exercícios 1, 2 e 4 da Ficha Prática Laboratorial 01. A ferramenta utilizada é o GitHub Copilot. Não existe implementação.

Fontes disponibilizadas: `01 - Introdução.pdf`, `02 - Mindset Engenharia IA.pdf`, `03 - Ficha Prática 01.pdf`, `04 - Arquiteturas e Prototipagem.pdf`, `05 - ADRs.pdf`, os anexos da pasta `06 - Anexos` e `07 - Ficha Prática 02.pdf`. A ficha 01 define a entrega; os materiais seguintes são contexto pedagógico, não requisitos aprovados.

Usam-se três estados:

- **Confirmado pelo enunciado:** informação explicitamente fornecida na ficha.
- **Âmbito proposto autorizado pelo autor:** funcionalidades que o autor aceitou documentar, sem confirmação pelo cliente.
- **Regra proposta:** detalhe operacional assumido para tornar a especificação verificável; exige revisão humana e validação com o cliente.

Só os factos F-01 a F-04 em [constraints.md](constraints.md) estão confirmados pelo enunciado. Os requisitos RF/RNF, as regras RN e as User Stories abaixo constituem uma proposta, não um levantamento validado pelo cliente.

## 2. Visão e objetivos

A Matriz destina-se a equipas que necessitam de organizar projetos, gerir tarefas e acompanhar o trabalho num ponto comum.

Objetivos propostos: identificar o trabalho de cada projeto, tornar visível quem é responsável por cada tarefa e apresentar o progresso sem depender de relatórios manuais. A conclusão do MVP será verificável pelos critérios das User Stories; não se presume qualquer melhoria percentual de produtividade.

## 3. Utilizadores e permissões propostas

Os perfis são relativos a cada projeto, não cargos globais. Uma pessoa pode gerir um projeto e ser membro de outro. “Participante” significa gestor ou membro desse projeto.

| Ação | Gestor do projeto | Membro do projeto | Pessoa sem participação |
|---|---|---|---|
| Consultar projeto, tarefas, participantes e progresso | Sim | Sim | Não |
| Criar tarefas e editar título/descrição | Sim | Sim | Não |
| Alterar estado de qualquer tarefa do projeto | Sim | Sim | Não |
| Atribuir, substituir ou retirar responsável | Sim | Não | Não |
| Adicionar ou remover membros | Sim | Não | Não |

Qualquer utilizador autenticado com conta ativa pode criar um projeto e torna-se o seu gestor. No MVP, o criador é o único gestor: não existe promoção de membros, transferência de gestão ou remoção do gestor. Contas são disponibilizadas previamente; registo público e administração de contas não fazem parte da aplicação nesta fase.

## 4. Requisitos funcionais e prioridades

**Must:** indispensável ao fluxo mínimo proposto. **Should:** melhoria a considerar depois do MVP. **Could:** possibilidade futura sem compromisso. Estas prioridades pertencem ao backlog; não são um campo de prioridade de tarefa.

| ID | Funcionalidade proposta | Justificação | Prioridade | História |
|---|---|---|---|---|
| RF-01 | Autenticar utilizadores com conta ativa e permitir terminar o acesso. | Identificar o autor das operações e restringir informação interna. | Must | US-01 |
| RF-02 | Criar projeto com nome e descrição opcional, tornando o criador gestor. | Disponibilizar o contexto onde o trabalho será organizado. | Must | US-02 |
| RF-03 | Consultar apenas os projetos em que se participa e os seus detalhes. | Encontrar o trabalho sem expor projetos alheios. | Must | US-03 |
| RF-04 | Adicionar contas ativas existentes como membros e remover membros elegíveis. | Permitir colaboração e controlar o acesso de cada equipa. | Must | US-04 |
| RF-05 | Criar e consultar tarefas pertencentes a um único projeto. | Registar unidades concretas de trabalho. | Must | US-05 |
| RF-06 | Editar título e descrição de uma tarefa sem mudar o seu projeto. | Corrigir e clarificar o trabalho registado. | Must | US-06 |
| RF-07 | Gerir um responsável opcional por tarefa, escolhido entre os participantes ativos. | Tornar explícita a responsabilidade sem impor atribuição na criação. | Must | US-07 |
| RF-08 | Alterar o estado de uma tarefa entre os três estados definidos. | Tornar visível a evolução do trabalho. | Must | US-08 |
| RF-09 | Consultar contagens por estado e percentagem concluída por projeto. | Acompanhar progresso com uma medida objetiva. | Must | US-09 |

## 5. Regras de negócio propostas

Todas estas regras dependem dos pressupostos de [constraints.md](constraints.md).

- **RN-01 — Acesso:** cada consulta e alteração exige conta ativa, autenticação válida e autorização para o projeto. Conhecer o identificador de uma tarefa não concede acesso. A autorização é verificada novamente em cada operação, incluindo após remoção de um membro.
- **RN-02 — Projeto:** o nome, depois de removidos espaços no início e no fim, tem entre 1 e 120 caracteres Unicode; a descrição é texto simples opcional com até 2 000 caracteres Unicode. Nomes repetidos são permitidos; projetos distintos mantêm identificadores distintos. Editar ou eliminar projetos não faz parte do MVP.
- **RN-03 — Participação:** o criador é o único gestor. Só o gestor adiciona ou remove membros. Adicionar novamente um membro não duplica a participação. Só podem ser adicionadas contas ativas existentes na organização, através de um identificador exato já conhecido pelo gestor; não existe pesquisa pública de contas.
- **RN-04 — Remoção:** o gestor não pode ser removido. Um membro responsável por pelo menos uma tarefa, mesmo concluída, não pode ser removido até o gestor substituir ou retirar todas essas atribuições. A recusa não altera dados. Uma remoção bem-sucedida retira o acesso desse membro nas operações seguintes.
- **RN-05 — Tarefa:** pertence sempre a um único projeto existente e autorizado; não pode ser transferida nem eliminada no MVP. O título, sem espaços nas extremidades, tem entre 1 e 200 caracteres Unicode; a descrição é texto simples opcional com até 2 000 caracteres Unicode. Títulos repetidos são permitidos. Uma nova tarefa começa em “Por fazer” e sem responsável.
- **RN-06 — Responsável:** uma tarefa tem zero ou um responsável. Só o gestor pode atribuir, substituir ou retirar essa pessoa, que deve ser participante ativo do mesmo projeto, incluindo o próprio gestor. Uma atribuição inválida preserva a anterior.
- **RN-07 — Estados:** os únicos estados são “Por fazer”, “Em curso” e “Concluída”. Qualquer participante pode passar de qualquer um destes estados para outro, incluindo reabrir uma tarefa concluída. Repetir o estado atual não cria outra tarefa nem altera as contagens. Não são exigidos responsável ou passagem por “Em curso” para concluir.
- **RN-08 — Progresso:** para todas as tarefas do projeto, apresentar total e contagem de cada estado. A percentagem é 100 vezes o número de tarefas concluídas dividido pelo total, arredondada ao inteiro mais próximo, com meios arredondados para cima. Sem tarefas, apresentar 0% e “Sem tarefas”. As contagens não dependem da página visível de resultados nem de uma seleção de tarefas. Esta medida conta tarefas; não mede esforço, tempo ou produtividade individual.
- **RN-09 — Consistência:** uma operação recusada ou falhada não pode deixar alterações parciais nem ser apresentada como sucesso. Depois de uma alteração bem-sucedida, uma nova consulta apresenta os dados persistidos e recalcula o progresso. Se outra pessoa tiver alterado a tarefa desde a versão consultada, recusar a edição desatualizada e pedir atualização dos dados, sem sobrepor silenciosamente a alteração mais recente.

Os limites de caracteres são propostas pedagógicas, não valores fornecidos pelo cliente. Para estes limites, “carácter Unicode” significa ponto de código, não byte; não se remove conteúdo interno nem se transforma o texto para o encurtar. A validação aplica-se ao nome/título após remoção dos espaços das extremidades e à descrição tal como introduzida.

## 6. Requisitos não funcionais propostos

| ID | Requisito e verificação esperada | Estado |
|---|---|---|
| RNF-01 | Negar leitura e escrita de projetos e tarefas a pessoas não autorizadas, também em acesso direto; não revelar título, participantes ou existência de um projeto alheio. Coberto por US-01, US-03 e US-04. | Proposta de segurança |
| RNF-02 | Manter alterações confirmadas numa nova sessão autorizada; não anunciar sucesso quando a gravação falha. Coberto por US-05 e US-06. | Proposta de integridade |
| RNF-03 | Identificar campos inválidos e explicar a ação possível; conservar o texto introduzido enquanto o utilizador corrige o formulário, sem o expor a terceiros. Coberto por US-02 e US-05. | Proposta de usabilidade |
| RNF-04 | Permitir os fluxos do MVP por teclado, com foco visível, campos identificados e estados compreensíveis sem depender apenas de cor. Validar cada fluxo com teclado e leitura dos respetivos rótulos/estados. | Proposta de acessibilidade |
| RNF-05 | Limitar os dados de perfil ao identificador e nome de apresentação necessários; não expor credenciais nem registar conteúdos de tarefas em logs por omissão. A identificação exata de contas para convites não implica uma listagem pública. Rever saídas, erros e registos com dados fictícios. | Proposta de privacidade |
| RNF-06 | Impedir sobreposição silenciosa de alterações concorrentes da mesma tarefa. Validar com duas sessões conforme US-06. | Proposta de colaboração |

Não se inventam metas de desempenho, disponibilidade ou escala. Volumes, latência máxima, recuperação de dados e contexto de acessibilidade devem ser acordados antes da validação operacional; ver Q-08 e Q-09 em `constraints.md`. Não se afirma conformidade legal nem com uma norma de acessibilidade sem avaliação própria.

## 7. Limites do MVP e evolução

O fluxo mínimo é: obter acesso com conta existente, criar projeto, adicionar um membro, criar tarefa, atribuí-la, atualizar o estado e consultar progresso. Ambos os participantes trabalham sobre a informação persistida do mesmo projeto.

| Funcionalidade futura | Justificação possível | Prioridade futura |
|---|---|---|
| Pesquisa e filtros de tarefas | Encontrar trabalho em projetos com mais tarefas. | Should |
| Comentários e notificações | Reduzir comunicação dispersa, se essa necessidade for confirmada. | Should |
| Datas-limite e prioridade por tarefa | Apoiar planeamento quando as regras forem clarificadas. | Should |
| Anexos, sprints e relatórios avançados | Apoiar equipas com processos mais complexos. | Could |
| Integrações, automações e funcionalidades de IA no produto | Ligar ferramentas existentes apenas perante uma necessidade demonstrada. | Could |
| Vários responsáveis, múltiplos gestores e transferência de gestão | Suportar outras formas de colaboração, se necessárias. | Could |

Também estão fora do MVP: registo público, gestão global de contas, eliminação/arquivo de projetos ou tarefas, mudança de tarefa entre projetos, hierarquias de tarefas, histórico de negócio consultável, aplicação móvel dedicada e edição em tempo real. Não há compromisso de entrega das funcionalidades futuras.

## 8. Exercício 1 — Prompt Engineering

### Parte A — Pedido simples

> Quero criar uma aplicação de gestão de projetos e tarefas chamada Matriz. Ajuda-me a desenvolver a aplicação.

**Resposta exploratória produzida nesta sessão para análise:** “Podemos começar por projetos e tarefas, utilizadores, um quadro de estados, comentários, notificações e um painel de progresso. Uma arquitetura monolítica com interface e persistência poderá ser um ponto de partida. Depois detalhamos e implementamos cada módulo.”

Esta resposta é um exemplo gerado para o exercício, não uma recomendação aprovada nem o registo de uma conversa independente.

Análise crítica:

- Sugere projetos, tarefas, utilizadores, quadro, comentários, notificações e painel; apenas as três necessidades gerais do enunciado estão confirmadas.
- Assume colaboração com contas, visualização em quadro e necessidade de comentários/notificações sem perguntar ao cliente.
- Propõe prematuramente uma arquitetura monolítica; não escolhe uma linguagem, framework ou base de dados. Mesmo sem uma stack concreta, a ordem das decisões é inadequada.
- Deveria primeiro clarificar perfis e permissões, acesso entre equipas, responsável único ou múltiplo, estados e transições, significado de progresso, prioridades, dados sensíveis e escala.

### Parte B — Pedido estruturado

```text
Goal:
Atua como analista de requisitos. Quero transformar o pedido inicial da Matriz
numa base de especificação clara e verificável, sem desenvolver a aplicação.

Context:
O cliente apenas disse: "Precisamos de uma aplicação onde as nossas equipas
possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho."
Não há funcionalidades detalhadas, regras, tecnologias ou prioridades aprovadas.

Constraints:
Não proponhas arquitetura, tecnologias ou código. Não inventes decisões do cliente.
Separa factos conhecidos, informação em falta e pressupostos que carecem de validação.
Não confundas funcionalidades habituais de ferramentas semelhantes com requisitos.

Task:
Analisa a descrição. Identifica lacunas e formula perguntas de clarificação,
priorizando as que alterem o âmbito, as permissões ou as regras de negócio.
Explica o impacto de cada pergunta. Não respondas em nome do cliente.

Validation:
A resposta deve conter factos rastreáveis ao enunciado, perguntas acionáveis
e eventuais hipóteses explicitamente marcadas; não deve escolher tecnologias,
implementar código nem apresentar hipóteses como requisitos confirmados.
```

**Resposta ao pedido estruturado nesta sessão:**

Factos: o produto chama-se Matriz, dirige-se a equipas e deve apoiar organização de projetos, gestão de tarefas e acompanhamento do progresso. Não há detalhe suficiente para fechar o MVP.

| Pergunta de clarificação | Impacto |
|---|---|
| Quem usa a aplicação e quem pode gerir projetos, acessos e tarefas? | Define atores e permissões. |
| É uma ferramenta interna? Uma pessoa pode aceder a todos os projetos? | Define fronteiras de privacidade e participação. |
| Como entram os utilizadores e quem disponibiliza as contas? | Delimita autenticação e administração. |
| Que informação mínima identifica um projeto e uma tarefa? | Define dados obrigatórios e validações. |
| Uma tarefa pertence a um só projeto e tem um ou vários responsáveis? | Define responsabilidade e regras de associação. |
| Que estados existem e é permitido reabrir trabalho concluído? | Define o fluxo de trabalho. |
| Progresso significa tarefas concluídas, esforço, horas ou outra medida? | Evita um indicador enganador. |
| Quais são as funcionalidades imprescindíveis e quais podem esperar? | Permite delimitar um MVP. |
| Que dados são sensíveis e quanto tempo devem ser conservados? | Define proteção e ciclo de vida da informação. |
| Quantas pessoas e tarefas se esperam, e que tempos de resposta são aceitáveis? | Permite definir requisitos não funcionais mensuráveis. |

Não se atribuem respostas ao cliente. As hipóteses usadas nos exercícios seguintes são registadas separadamente em `constraints.md`.

### Comparação e limitações

O pedido simples favorece uma resposta extensa mas mistura descoberta, desenho e implementação, introduzindo funcionalidades sem justificação. A estrutura Goal → Context → Constraints → Task → Validation delimita o papel da IA, torna explícitas as lacunas e permite rejeitar uma resposta que invente decisões.

Um prompt estruturado reduz ambiguidades, mas não garante correção nem substitui validação humana. Esta comparação foi elaborada numa sessão com os materiais já disponíveis, não em duas conversas novas e isoladas. Logo, não demonstra experimentalmente a influência exclusiva do prompt: contexto prévio e variabilidade do modelo podem influenciar o resultado. Para reproduzir literalmente a Parte A da ficha, executar os dois prompts em conversas novas, com a mesma ferramenta e contexto inicial, e comparar as respostas reais com esta grelha.

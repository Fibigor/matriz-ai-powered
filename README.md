# Matriz

Specification Pack de uma aplicação de gestão de projetos e tarefas para equipas de trabalho, elaborado na Ficha Prática Laboratorial 01 de AI-Powered Software Engineering.

## Problema e objetivos

O ponto de partida do cliente é: “Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho.”

A Matriz pretende centralizar o trabalho de cada projeto, tornar visíveis as tarefas e os seus responsáveis e permitir acompanhar o progresso através dos estados das tarefas. O objetivo desta fase é transformar aquele pedido numa especificação verificável, não implementar uma aplicação.

## MVP proposto

O autor do trabalho autorizou documentar este âmbito como proposta. Isso não equivale a validação pelo cliente:

- Acesso autenticado com contas previamente disponibilizadas.
- Criação e consulta de projetos, com perfis de gestor e membro por projeto.
- Adição e remoção de membros de um projeto.
- Criação, consulta e edição de tarefas de um projeto.
- Atribuição de zero ou um responsável por tarefa.
- Estados “Por fazer”, “Em curso” e “Concluída”.
- Contagens por estado e percentagem de tarefas concluídas por projeto.

Comentários, notificações, sprints, anexos, integrações e relatórios avançados ficam fora do MVP. As regras detalhadas são propostas sujeitas a validação; não são requisitos confirmados pelo cliente.

## Documentação

| Ficheiro | Conteúdo |
|---|---|
| [docs/requirements.md](docs/requirements.md) | Visão, utilizadores, requisitos, prioridades, âmbito e exercício de Prompt Engineering. |
| [docs/user-stories.md](docs/user-stories.md) | Nove User Stories, critérios Given / When / Then, exceções e rastreabilidade. |
| [docs/constraints.md](docs/constraints.md) | Factos, pressupostos, perguntas, segurança, decisões pendentes, revisão crítica e desafio complementar. |
| [AGENTS.md](AGENTS.md) | Instruções persistentes para agentes que trabalhem neste projeto. |

Leitura recomendada: requisitos, restrições e User Stories. Os agentes devem começar pelo `AGENTS.md`.

## Estado atual e próxima fase

Existe apenas documentação: não há código, dependências, instalação, comandos de execução ou testes da aplicação. Linguagem, framework, base de dados, arquitetura, autenticação e alojamento não foram escolhidos.

O repositório Git existente é a pasta de trabalho da Matriz; não é criado outro repositório nem uma pasta `matriz` dentro dele. Os cinco ficheiros seguem a estrutura pedida pela ficha.

A revisão humana das regras detalhadas e o commit da entrega estão pendentes. Não foi efetuado push. Antes da ficha 02, devem ser resolvidas as perguntas bloqueantes de `docs/constraints.md`; só depois devem ser escolhidas a arquitetura, a modelação dos dados, a API e a interface. Os exemplos da aula 02 não constituem decisões deste projeto.

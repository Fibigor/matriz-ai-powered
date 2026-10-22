# Matriz

Specification Pack e Architecture Pack de uma aplicação de gestão de projetos e tarefas para equipas de trabalho, elaborados nas Fichas Práticas Laboratoriais 01 e 02 de AI-Powered Software Engineering.

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
| [docs/architecture.md](docs/architecture.md) | Comparação de arquiteturas, monólito modular escolhido, componentes, fluxos e revisão crítica. |
| [docs/database.md](docs/database.md) | Entidades, cardinalidades, integridade e diagrama ER em Mermaid. |
| [openapi.yaml](openapi.yaml) | Contrato OpenAPI 3.1 parcial: listar e criar tarefas de um projeto. |
| [docs/ui/wireframe.png](docs/ui/wireframe.png) | Wireframe estático do projeto Alfa, com [fonte SVG](docs/ui/wireframe.svg). |

Leitura recomendada: requisitos, restrições e User Stories. Os agentes devem começar pelo `AGENTS.md`.

## Estado atual e próxima fase

Existe apenas documentação de requisitos e conceção: não há código funcional, dependências da aplicação, instalação, comandos de execução ou testes da aplicação. O autor escolheu um monólito modular para a ficha 02. Linguagem, framework, motor de base de dados, fornecedor de identidade e alojamento continuam por escolher.

O repositório Git existente é a pasta de trabalho da Matriz; não é criado outro repositório nem uma pasta `matriz` dentro dele. A ficha 01 está no commit `c13da97` (`docs: Specification Pack`), efetuado manualmente pelo autor e observado em `main` e `origin/main`.

O Architecture Pack da ficha 02 desenvolve os pressupostos existentes como proposta de desenho, sem os transformar em requisitos confirmados pelo cliente. A API documenta duas operações, não todos os fluxos do MVP; o wireframe não é uma aplicação executável. Os exemplos da aula não substituem os requisitos deste repositório.

A triagem crítica da ficha 02 foi aceite pelo autor. A revisão integral, perguntas bloqueantes de `docs/constraints.md` e commit dos novos artefactos continuam pendentes. Antes da ficha 03, validar as regras e escolher os detalhes técnicos necessários. Nesta atividade não é efetuado commit nem push, e o staging existente é preservado por indicação do autor.

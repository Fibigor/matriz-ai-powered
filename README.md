# Matriz

Aplicação de gestão de projetos e tarefas desenvolvida na ficha 03 de AI-Powered Software Engineering, a partir dos Specification Pack e Architecture Pack das fichas 01 e 02.

## Problema e objetivos

O ponto de partida do cliente é: “Precisamos de uma aplicação onde as nossas equipas possam organizar projetos, gerir tarefas e acompanhar o progresso do trabalho.”

A Matriz centraliza o trabalho de cada projeto, os responsáveis e os comentários e apresenta o progresso através dos estados das tarefas. Esta entrega implementa uma demonstração académica com dados fictícios, não um serviço preparado para produção.

## MVP proposto

O autor aprovou o âmbito alargado da ficha 03 para implementação. Isso não equivale a validação pelo cliente:

- Acesso autenticado com contas previamente disponibilizadas.
- Criação, consulta, pesquisa, edição e eliminação de projetos, com gestor e membros por projeto.
- Adição e remoção de membros de um projeto.
- Criação, consulta, edição e eliminação de tarefas, com filtros por estado e prioridade.
- Vários responsáveis elegíveis por tarefa, sem atribuições duplicadas.
- Comentários com autor autenticado e data atribuídos pelo servidor.
- Estados “Por fazer”, “Em curso” e “Concluída”.
- Contagens por estado e percentagem de tarefas concluídas por projeto.

Notificações, sprints, anexos, integrações, registo público, recuperação de palavra-passe e relatórios avançados ficam fora do MVP.

A interface mantém o tema escuro/azul inspirado no [Black Dashboard React](https://github.com/creativetimofficial/black-dashboard-react), com estrutura de espaço de trabalho ao estilo Jira: barra superior, navegação lateral, breadcrumbs, vistas e tabelas compactas. Em telemóvel, a navegação abre num diálogo modal. O painel usa as contagens reais do projeto selecionado, não métricas fictícias nem somas de uma página de projetos. Implementação original na stack existente, sem importar o template ou acrescentar dependências.

## Documentação

| Ficheiro | Conteúdo |
|---|---|
| [docs/requirements.md](docs/requirements.md) | Visão, utilizadores, requisitos, prioridades, âmbito e exercício de Prompt Engineering. |
| [docs/user-stories.md](docs/user-stories.md) | Onze User Stories atuais, critérios, exceções e histórico da ficha 01. |
| [docs/constraints.md](docs/constraints.md) | Factos, pressupostos, perguntas, segurança, decisões pendentes, revisão crítica e desafio complementar. |
| [AGENTS.md](AGENTS.md) | Instruções persistentes para agentes que trabalhem neste projeto. |
| [docs/architecture.md](docs/architecture.md) | Comparação de arquiteturas, monólito modular escolhido, componentes, fluxos e revisão crítica. |
| [docs/database.md](docs/database.md) | Entidades, cardinalidades, integridade e diagrama ER em Mermaid. |
| [openapi.yaml](openapi.yaml) | Contrato OpenAPI 3.1 da implementação da ficha 03. |
| [docs/ui/wireframe.png](docs/ui/wireframe.png) | Referência histórica da ficha 02, com [fonte SVG](docs/ui/wireframe.svg); não representa as extensões da ficha 03. |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Decisões aprovadas, diferenças face à ficha 02 e incrementos. |
| [docs/verification.md](docs/verification.md) | Cenários, resultados reais, testes, revisão e limitações. |

Leitura recomendada: requisitos, restrições e User Stories. Os agentes devem começar pelo `AGENTS.md`.

## Executar localmente

Pré-requisitos: Docker com Compose. Para desenvolvimento fora dos contentores: Java 21, Maven 3.9+, Node 22.12+ e npm. O monólito modular usa Spring Boot 3.5, React/TypeScript e PostgreSQL 17. `backend/` contém API e persistência; `frontend/` contém interface e testes.

Em PowerShell, na raiz do repositório:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item .env.example .env
}
docker compose -p matriz-ficha3 --env-file .env config --quiet
```

O comando `config --quiet` valida a configuração sem iniciar serviços nem mostrar os valores das variáveis. Se terminar sem erros, iniciar:

```powershell
docker compose -p matriz-ficha3 --env-file .env up --build -d
```

**Erro `required variable POSTGRES_PASSWORD is missing a value`:** o Compose não recebeu uma palavra-passe não vazia para PostgreSQL. `.env.example` é apenas um modelo, não é carregado automaticamente. Criar `.env` com o bloco acima; se já existir, não o substituir: editar apenas as variáveis em falta. Confirmar que o ficheiro se chama `.env` (não `.env.txt`) e que os comandos são executados na raiz do repositório.

Para a demonstração local, `.env.example` fornece `POSTGRES_PASSWORD=matriz-local-example`, `DEMO_ENABLED=true` e `DEMO_PASSWORD=Matriz-Demo-2026!`. `POSTGRES_PASSWORD` é usado pelo Compose tanto para a base de dados como para `DATABASE_PASSWORD` da aplicação; definir apenas `DATABASE_PASSWORD` em `.env` não resolve este erro. Manter `.env` fora do controlo de versões e não partilhar o seu conteúdo.

Se já existir um volume inicializado, usar a palavra-passe com que a base de dados foi criada: alterar `POSTGRES_PASSWORD` no ficheiro não altera a palavra-passe guardada no PostgreSQL. Não apagar o volume para resolver este problema.

Abrir `http://localhost:8080`. PostgreSQL fica exposto apenas em `127.0.0.1:55432`; o serviço da aplicação também é publicado apenas localmente. O Dockerfile compila React e inclui os ficheiros estáticos no JAR. Não há servidor externo de identidade nem mocks no percurso implementado.

Flyway aplica `backend/src/main/resources/db/migration/V1__initial_schema.sql` automaticamente. O volume Docker conserva a base de dados. O seed só corre com `DEMO_ENABLED=true`, precisa de `DEMO_PASSWORD` com pelo menos 12 caracteres e não altera as contas/dados existentes no arranque seguinte. Não usar `docker compose down -v` para reiniciar: isso elimina o volume.

Com o exemplo de configuração, as contas fictícias são `ana`, `bruno` e `carla`, com palavra-passe **`Matriz-Demo-2026!`**. Ana gere Alfa, Bruno participa em Alfa e Carla só tem o seu projeto Beta. O exemplo de palavra-passe é público e exclusivo da demonstração; mudar `.env` não redefine palavras-passe já gravadas. Não usar dados pessoais ou credenciais reais.

Para desenvolvimento, iniciar só a base de dados e executar em dois terminais:

```powershell
docker compose -p matriz-ficha3 up -d db
$env:DATABASE_PASSWORD='matriz-local-example'
$env:DEMO_ENABLED='true'
$env:DEMO_PASSWORD='Matriz-Demo-2026!'
mvn -f backend\pom.xml spring-boot:run
```

```powershell
Set-Location frontend
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. Vite encaminha `/api` para `127.0.0.1:8080`; toda a configuração do prefixo API está em `frontend/src/api.ts`. `.env` é lido pelo Compose, não automaticamente pelo Maven: ajustar as variáveis do terminal se forem alterados os valores do exemplo.

## Autenticação, permissões e testes

Sessão no servidor, cookie `JSESSIONID` HttpOnly/SameSite=Strict, timeout inativo de 30 minutos, BCrypt (custo 12). `GET /api/auth/csrf` fornece token para `X-CSRF-TOKEN`; login (`application/x-www-form-urlencoded`) e todas as escritas exigem CSRF. O identificador de sessão é renovado no login e invalidado no logout; o frontend não guarda credenciais ou tokens em localStorage. Reiniciar o backend termina sessões, mas não apaga dados.

Só o gestor edita/elimina projetos e gere membros/atribuições. Todos os participantes ativos gerem tarefas e comentam. A API aplica as mesmas restrições a acessos diretos; recursos alheios e inexistentes devolvem 404 indistinguível. A eliminação exige confirmação na interface e remove dependentes numa transação. As edições usam versão otimista; conflitos não sobrepõem dados silenciosamente.

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
Set-Location frontend
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes Java usam PostgreSQL isolado via Testcontainers (Docker necessário). `api.version` assegura compatibilidade do cliente Docker de testes com Docker Desktop 29. Os testes E2E requerem API e Vite já iniciados e seed de demonstração com os valores acima; criam e eliminam os seus próprios projetos, não os projetos existentes.

Para executar os mesmos E2E contra a aplicação completa do Compose, em vez de Vite:

```powershell
Set-Location frontend
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:8080'
npm run test:e2e
```

Parar serviços sem apagar o volume: `docker compose -p matriz-ficha3 stop`. Depois, `docker compose -p matriz-ficha3 start` volta a iniciá-los com os dados existentes.

## Estado da entrega

A entrega original da ficha 03 foi versionada pelo autor em `e73250d`; a revisão visual e de acessibilidade está em `f780a29` (`feat: enhance UI components with improved accessibility and visual organization`), observado em `main` e `origin/main` em 29-10-2026. A atualização documental posterior é trabalho da worktree, sem commit ou push efetuados pelo agente.

As conclusões da comparação de prompts realizada pelo autor no Gemini Pro estão em [docs/requirements.md](docs/requirements.md), sem transcrições das conversas. Os procedimentos para reproduzir a entrega numa cópia limpa, percorrer os fluxos por teclado e verificar o contrato e os diagramas estão em [docs/verification.md](docs/verification.md).

Antes de produção: rever dependências, políticas de palavras-passe e limitação de tentativas, configurar HTTPS e `COOKIE_SECURE=true`, segredos, retenção, backups, volumes/escala, identidade e acessibilidade. As verificações desta entrega não são certificação de segurança, conformidade ou desempenho.

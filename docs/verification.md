# Matriz — Verificação da ficha 03 e interface

## Identificação e alcance

Execução local em 29-10-2026, aplicação 0.3.0. Stack aprovada: Java 21/Spring Boot 3.5.7, React 19.2/TypeScript 5.9, PostgreSQL 17, monólito modular. No host: Windows, Maven 3.9.9, Node 25.6 e Docker Desktop 29.8; o Dockerfile compila com Node 22 e Java 21.

Branch `feature/ficha-pratica-1`, base `c13da97` (Specification Pack). Após a entrega original, o autor aplicou e versionou a ficha 03 em `e73250d` (`feat: full stack implementation-plan.md and setup`), observado em `main` e `origin/main`. Os ficheiros da implementação foram comparados com esse commit antes da revisão visual e correspondiam. A worktree e o staging, com onze eliminações anteriores, não foram integrados/reparados pelo agente. Não foi executado `git add`, commit, push, merge ou rebase pelo agente.

O âmbito alargado e as regras de acesso foram aprovados antes de implementar. Limites 1–120/1–200/2 000 mantidos por decisão do autor, em vez de copiar os limites meramente exemplificativos da ficha. Não se presume aceitação pelo cliente ou preparação para produção.

## Iteração visual posterior — tema escuro e estrutura Jira

Direção aprovada pelo autor: manter a paleta escura/azul inspirada no Black Dashboard React e reorganizar a interface como espaço de trabalho ao estilo Jira, sem novas dependências nem mudanças de API/permissões. Barra superior global, navegação lateral compacta, breadcrumbs, vistas e tabelas; navegação móvel em diálogo modal nativo.

| Verificação desta iteração | Resultado observado |
|---|---|
| Em `frontend`: `npm test` | 13 testes de componentes passaram: os 7 existentes, 4 do layout e 2 sobre dados reais/ausência de projetos no painel. |
| Em `frontend`: `npm run build` | TypeScript e Vite concluídos após a correção final de foco/scroll. |
| `docker compose -p matriz-ficha3 --env-file .env.example up --build -d` | Imagem reconstruída; aplicação respondeu HTTP 200 na porta 8080 com a base de dados existente. |
| Em `frontend`, `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080`; `npm run test:e2e -- --repeat-each=2` | 3 percursos repetidos duas vezes: 6 execuções passaram em 19,6 s. Inclui CRUD/colaboração/reload, credenciais inválidas e nova navegação desktop/móvel. |
| Navegação e dados reais | Alfa apresenta 2/1/2 tarefas e 2 de 5 concluídas; seleção não soma a página de projetos. O menu abre, recebe foco, permite Tab, impede foco no logout de fundo, fecha com Escape/devolve foco e fecha ao navegar. |
| Layout responsivo | Sem overflow horizontal do documento a 390 px em painel, lista de projetos, projeto e tarefa; tabelas podem deslocar horizontalmente dentro do seu contentor. Capturas revistas a 1440 px e 390 px, incluindo login, painel, menu, projeto e tarefa. |
| Atalho para o conteúdo | Mantém a rota hash, foca `main` e não o coloca sob a barra superior. `scroll-margin-top` corrigiu a sobreposição reproduzida no browser. |

Uma execução intermédia do percurso completo falhou após reload de comentários. Reprodução com POST intercetado antes do envio confirmou que `getByText` correspondia ao `TEXTAREA` com o rascunho mesmo sem comentário persistido. O E2E passou a exigir o texto dentro de um `article` de comentário antes e depois do reload; não se aumentou o timeout nem se alterou a persistência para satisfazer o teste. As duas repetições finais passaram.

Não foram alterados backend, contrato API, dependências, políticas de acesso ou dados existentes deliberadamente. Os percursos concluídos eliminam os seus próprios projetos; o ensaio interrompido conserva os seus dados fictícios, sem limpeza indiscriminada. Não se repetiram os testes Java ou o audit npm nesta iteração exclusivamente visual; os resultados originais abaixo são históricos, não novas execuções.

Fecho desta iteração: aplicação/PostgreSQL parados; volume `matriz-ficha3_matriz_data` existente; portas 8080, 5173 e 55432 sem listeners. Alterações visuais/documentais ainda na worktree, sem commit/push e sem alteração do staging.

## Registo original da ficha 03

As secções seguintes conservam as verificações da entrega original, anteriores à iteração visual e ao commit manual do autor.

## Nove cenários da ficha

| Caso | Esperado | Observado | Evidência |
|---|---|---|---|
| 01 — Acesso | Login válido, perfil e logout; credenciais inválidas/pedido sem sessão recusados; CSRF nas escritas. | Login/perfil 200; inválidas/sem sessão 401; escrita sem CSRF 403; logout 204. Página inicial anónima não anuncia falsamente sessão expirada. | `ApiIntegrationTest.authenticationCsrfAndLogoutAreEnforced`; os dois E2E; prova de reinício abaixo. |
| 02 — Projetos | Criar, listar, pesquisar, consultar, editar e eliminar segundo permissões. | Gestor autenticado inferido no servidor; criação 201; pesquisa sem distinção de maiúsculas; edição incrementa versão; membro sem gestão 403; eliminação 204. Novo projeto fica visível mesmo após a primeira página. | Testes API `validatesLimitsAndSupportsSearchPriorityAndMemberTaskCrud`, `deniesForeignIdentifiersAndManagerOperationsToMembers`; E2E completo; teste de componente “apresenta o projeto criado além da primeira página”. |
| 03 — Persistência | Tarefa aparece sem reload e mantém-se após reinício do backend. | Lista/contagens atualizadas uma única vez; teste cobre 21.ª tarefa; tarefa HIGH, versão 2, associação e comentário iguais antes/depois de reinício real. | Testes de componentes; API `createsAndReadsPersistedTaskAndRejectsInvalidInput`; prova de reinício com identificadores abaixo. |
| 04 — Validação | Campos vazios/só espaços e valores inválidos recusados, sem truncagem. | Título só espaços, título 201, nome 121 e descrição 2 001 dão 422; 120/200/2 000 aceites nos casos de fronteira; Unicode normalizado sem truncagem; campos JSON desconhecidos e versão obrigatória ausente dão 400. | `InputsTest.validatesUnicodeAfterTrimmingWithoutTruncation`; testes API de criação/limites; componente conserva texto perante 422. |
| 05 — Estado/prioridade | Edição e filtros coerentes com contagens globais. | DONE/HIGH persistidos; filtro TODO oculta a tarefa, mas mantém progresso global a 100%; filtro por prioridade usa o subconjunto correto. Nova tarefa mantém filtros ativos. | E2E completo; API de filtros/prioridade; componente de filtro; `InputsTest.roundsProgressHalfUpAndHandlesEmptyProjects`. |
| 06 — Responsáveis | Vários elegíveis, remoção isolada e ausência de duplicados. | Ana e Bruno na mesma tarefa; associação repetida com versão atual não duplica; versão antiga 409; Carla fora do projeto 422; membro não gere atribuições; remoção de uma mantém a outra. | API `assignmentsCommentsVersionsRevocationAndCascadeWorkTogether` e teste de limites/CRUD; E2E completo. |
| 07 — Comentários | Conteúdo, autor autenticado e data ficam guardados e visíveis. | Autor Bruno no teste API, Ana na prova de reinício; data do servidor; reload preserva comentário; novo comentário após 20 resultados aparece na última página. Conteúdo só espaços recusado. | API de colaboração/validação; E2E completo; componente de paginação de comentários; prova de reinício. |
| 08 — Autorização API | Trocar identificadores não permite acesso indevido. | Carla recebe 404 para projeto alheio e inexistente com o mesmo detalhe; criação alheia recusada; Bruno sem permissão de gestão recebe 403; após remoção da participação perde acesso. | `deniesForeignIdentifiersAndManagerOperationsToMembers`; `assignmentsCommentsVersionsRevocationAndCascadeWorkTogether`. |
| 09 — Eliminação/erros | Dependências removidas atomicamente; erros não geram sucesso nem perda de rascunho. | Eliminar tarefa/projeto confirmado na UI; recurso eliminado deixa de existir; projetos com atribuições/comentários podem ser eliminados; membro com atribuições não pode ser removido; falha 422 mantém título e não chama atualização de sucesso. | API de colaboração/cascata e CRUD de membro; E2E completo; componente “conserva o texto e mostra a falha sem anunciar sucesso”. |

Os testes MockMvc usam a aplicação Spring e PostgreSQL real isolado por Testcontainers, incluindo Flyway e BCrypt. Os mocks do cliente API existem apenas nos testes de componentes; os E2E usam frontend, backend, sessão e PostgreSQL reais. “Observado” descreve os casos executados, não todas as interleavings possíveis em produção.

## Comandos e resultados reais

Executados a partir da raiz, salvo indicação:

| Comando | Resultado final |
|---|---|
| `mvn -q -f backend\pom.xml test '-Dapi.version=1.44'` | 7 testes: 5 de integração e 2 unitários; zero falhas/erros/ignorados. Relatórios gerados em `backend/target/surefire-reports/`. |
| `mvn -q -f backend\pom.xml package '-DskipTests'` | JAR criado na verificação inicial; a imagem final voltou a compilar/empacotar o backend. Não é uma execução de testes. |
| Em `frontend`: `npm test` | 7 testes de componentes passaram com Vitest 4.1.12. |
| Em `frontend`: `npm run build` | TypeScript e Vite 7.3.7 concluídos; bundles de produção gerados. |
| Em `frontend`: `npm audit --omit=dev --audit-level=high` | Zero alertas de dependências de produção na verificação inicial. |
| Em `frontend`: `npm audit --audit-level=moderate` | Zero alertas em toda a árvore após atualização aprovada de Vite/Vitest e lockfile. |
| `docker compose -p matriz-ficha3 --env-file .env.example up --build -d` | Imagem construída com `npm ci` e Maven; PostgreSQL saudável e aplicação iniciada em `127.0.0.1:8080`. Página React e endpoint CSRF responderam 200. |
| Em `frontend`, `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:8080'`; `npm run test:e2e` | 2 testes passaram contra a imagem final, em 15,8 s no total: percurso completo e credenciais inválidas/layout a 390 px. |
| `docker compose -p matriz-ficha3 --env-file .env.example restart app` | Reinício real concluído; sessão anterior 401; dados idênticos após novo login. |

Também foram executados E2E com Vite em `127.0.0.1:5173` antes do teste final da imagem. Chromium foi instalado com `npx playwright install chromium` depois de o primeiro ensaio indicar que o browser estava ausente.

### Persistência após reinício

Foi criado pela API, com conta fictícia Ana, um conjunto dedicado à prova:

| Registo | Identificador / valor confirmado |
|---|---|
| Projeto | `41c0736b-cb3f-4ed4-9807-d421feb972c2`, nome `Restart proof 20261029` |
| Tarefa | `73357355-81c8-4b65-89a5-39342af95f80`, HIGH, versão 2 |
| Responsável | `user-bruno`, nome Bruno |
| Comentário | `aa190602-bd69-4984-ac2f-a3657080fe41`, autor `user-ana`, texto `Persistence proof: comment and assignment.` |

Após substituir a JVM local pela imagem Docker e depois reiniciar novamente o serviço `app`, as respostas completas do projeto, tarefa e comentários mantiveram-se iguais. A sessão anterior deixou de ser válida; um novo login permitiu consultar os mesmos dados.

Consulta SQL só de leitura antes/depois do reinício: **3 utilizadores, 5 projetos, 8 tarefas, 1 comentário, 3 atribuições e 1 migration bem-sucedida**, sem variação. Isso confirma que o seed não apagou, duplicou ou reinicializou os dados neste ensaio; não substitui testes de todas as possibilidades de inicialização parcial.

Os registos da prova e de tentativas E2E anteriormente interrompidas foram conservados no volume de demonstração; não foi feita limpeza indiscriminada. Os E2E finais criam e eliminam os seus próprios projetos.

### Contrato e documentação

OpenAPI 3.1 com **21 operações**, sessão/CSRF, DTOs atuais, responsáveis múltiplos, filtros, versões e regras de cascata. Foram analisados YAML, 99 referências internas, unicidade de operationId e parâmetros de caminho. Oito operações GET foram chamadas na aplicação e comparadas com os campos obrigatórios, tipos e enums dos schemas.

Estas verificações estruturais são limitadas: **não foi instalado/executado um validador integral de OpenAPI/JSON Schema**, nem se afirma validação exaustiva de cada resposta possível. Os limites após remoção de espaços são regras semânticas descritas no contrato, não `maxLength` sobre o texto bruto, que recusaria incorretamente entradas normalizáveis.

Requisitos, onze histórias atuais, restrições, arquitetura e modelo de seis tabelas foram alinhados. Os desenhos e decisões das fichas 01/02 ficam identificados como histórico, não como regras incompatíveis ainda em vigor. O wireframe antigo não representa todas as extensões da ficha 03.

## Problemas investigados e correções limitadas

| Evidência / reprodução | Causa confirmada e correção | Regressão |
|---|---|---|
| Submeter tarefa, obter erro de campo e procurar o input pelo rótulo original. | A mensagem estava dentro do `label` e alterava o nome acessível. Mensagem movida para fora do rótulo; não se enfraqueceu o teste de preservação. | Componente de erro/rascunho passou. |
| Criar item quando já há 20 tarefas/projetos/comentários. | Ordenação ascendente colocava a criação fora da página atual. Navegar para a última página prevista quando o item corresponde aos filtros; caso contrário preservar filtros e informar sucesso sem fingir correspondência. | Três casos com total 20→21 e caso de filtro não correspondente passaram. |
| E2E aguardava select de “Estado” e expirava. | `getByLabel` exato não correspondia ao texto integral do rótulo; o controlo tinha role/nome acessível corretos. Usar `getByRole('combobox', {name:'Estado', exact:true})`. Aumentar só o timeout não resolveu a causa. | Percurso real final passou, incluindo alteração DONE/HIGH. |
| Dois novos testes de paginação falharam apesar de item/autor já estarem visíveis. | Expectativa inventada “Página 2 / 2” diferia do texto real “Página 2 · 21 resultados · 2 páginas”. Corrigida a expectativa, não a interface. | Os sete componentes passaram. |
| `npm ci` da primeira imagem indicou alertas em ferramentas de desenvolvimento. | Audit identificou Vite/Vitest e dependências transitivas. Autor aprovou Vite 7.3.7/Vitest 4.1.12; lockfile regenerado, sem `audit fix --force`. | Testes/build/E2E repetidos; audit completo sem alertas. |
| Primeiro arranque Compose falhou ao publicar 8080. | A JVM local ainda detinha a porta após terminar o shell. PID e comando foram confirmados antes de parar exclusivamente esse processo; reconstrução/arranque seguintes passaram. | React/API 200 e E2E da imagem final passaram. |

### Revisão e refatoração

A revisão incidiu em permissões no servidor, conta ativa, identidade inferida, parâmetros SQL, limites Unicode, versões, FKs, cascatas, rascunhos/duplicados, coerência dos agregados e alinhamento documental. Os testes cobrem autorização direta e falhas, não apenas botões escondidos. Parâmetro obrigatório ausente passou a usar o mesmo Problem Details dos restantes erros de formato, com regressão API.

Oportunidade identificada: evitar duplicar validação, autorização e estados de submissão. `Inputs`, `ProjectService.access`, cliente API e hooks/componentes comuns já concentram essas regras desde a implementação. **Não foi feita uma refatoração adicional sem benefício demonstrado.** As correções de paginação e rótulos são alterações funcionais limitadas, não foram disfarçadas como refatoração sem mudança de comportamento.

## Três exemplos de utilização da IA

| Objetivo do pedido | Decisão humana / correção | Verificação |
|---|---|---|
| Conciliar a ficha 03 com os documentos anteriores antes de implementar. | Autor aprovou comentários, prioridade, pesquisa, CRUD e responsabilidade N:M, mantendo limites anteriores e as regras explícitas de gestão/participação. O scope não foi promovido automaticamente a decisão do cliente. | Rastreabilidade RF-01–11 / US-01–11; API e cenários acima. |
| Escolher uma implementação simples e preparar o incremento de persistência/autenticação. | A alternativa Django sugerida não foi adotada: o autor escolheu Java/Spring Boot, React e PostgreSQL. Foram aprovados sessão/CSRF/BCrypt e execução local, não JWT, mocks ou deploy público. | Build Maven/npm/Docker, testes com PostgreSQL e reinício real. |
| Investigar um E2E que expirava e evitar aceitar a primeira explicação da IA. | Hipótese de timeout insuficiente foi rejeitada como causa: contagem de localizadores confirmou zero para rótulo exato e um para role/nome. Corrigiu-se o localizador, sem alterar o comportamento da aplicação para satisfazer o teste. | E2E completo passou contra Vite e imagem Docker; resultado final registado acima. |

## Limitações e estado de entrega

- Não houve auditoria independente, pentest, ensaio de carga ou certificação de acessibilidade/segurança. O audit npm não cobre dependências Maven, imagens, configuração operacional ou falhas de lógica.
- Não foram simuladas todas as falhas de rede/base de dados nem todas as corridas concorrentes; conflito de versão e revogação têm testes, mas não há ensaio multicliente exaustivo. A resposta de transporte pode ser incerta e não deve ser repetida automaticamente.
- Seed local é opt-in e não reinicializa uma demonstração já existente. Contas fictícias e palavra-passe pública não servem produção. Retenção, identidade empresarial, HTTPS, limitação de tentativas, backups e recuperação continuam pendentes.
- Na entrega original foi verificado o build Docker com contexto de fontes e exclusão de builds/dependências locais, antes de existir um commit da ficha 03. O autor versionou-a posteriormente em `e73250d`. Esta worktree mantém as onze eliminações staged anteriores; nenhum ficheiro foi adicionado ao índice pelo agente e a iteração visual ainda não foi versionada.
- O autor autorizou parar os serviços locais ao terminar, conservando o volume `matriz-ficha3_matriz_data`. Para voltar a executar, seguir [README.md](../README.md); nunca remover o volume para um simples reinício.

Fecho observado na entrega original: aplicação e PostgreSQL parados; volume `matriz-ficha3_matriz_data` confirmado existente; portas locais 8080, 5173 e 55432 sem listeners. Verificação documental dessa entrega: 32 ligações locais existentes, nove cenários presentes e blocos de histórico equilibrados. O índice manteve as mesmas onze eliminações anteriores.

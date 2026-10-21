# Product: Curator

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decisão de implementação inicial formalizada para o protótipo:
- **Core:** React 19, TypeScript, Vite, React Router, Tailwind CSS v4, Lucide React.
- **Componentes de UI:** Primitivos acessíveis selecionados via Radix UI / shadcn/ui (diálogos, popovers, menus e interfaces de comando), adaptados estritamente aos tokens e regras do `design.md`.
- **Gerenciamento de Estado:** React state para interações locais de componentes; Zustand exclusivamente para estado genuinamente compartilhado de interface (referência selecionada, estado do painel lateral, overlay expandido, filtros globais de busca). Sem store global desnecessário para estados efêmeros.
- **Formulários e Validação:** React Hook Form e Zod para o formulário de captura e edição de metadados; validação enxuta para entrada de URLs sem barreiras ou wizards prolixos.
- **Camada de Persistência:** Padrão Repository (`ReferenceRepository`, `CollectionRepository`, `ProjectRepository`) desacoplado de componentes visuais, utilizando `localStorage` com dados iniciais de demonstração (mock). Arquitetura desenhada para substituição transparente por API REST/GraphQL ou banco de dados relacional sem refatoração de UI.
- **Testes:** Vitest para testes unitários e de lógica de filtragem; React Testing Library para componentes críticos de interface; Playwright reservado para fluxos ponta a ponta (E2E).

## Users

- **Web designers e UI/UX designers:** Profissionais que mapeiam benchmarks de layout, paletas cromáticas, micro-interações, tipografia e arquitetura visual para novos projetos.
- **Desenvolvedores frontend e creative developers:** Engenheiros que garimpam implementações técnicas arrojadas, soluções de CSS inovadoras, animações de alta performance e bibliotecas de componentes.
- **Diretores de arte e líderes de produto:** Criativos que estruturam painéis de referência conceituais e moodboards funcionais para alinhar visões de produto com clientes e squads.

## Product Purpose

Curator é um workspace privado para salvar, organizar e redescobrir referências da web. Conecta capturas visuais em alta resolução (screenshots), URLs canônicas, anotações editoriais em Markdown, trechos de código executável e arquivos complementares a uma única entidade central de referência.

O produto resolve a fragmentação caótica de links perdidos em favoritos do navegador, capturas de tela anônimas na pasta de downloads, canais de mensagens e notas dispersas. O Curator centraliza todo o repertório visual do criativo em uma biblioteca estruturada, rápida e visualmente reconhecível.

**Princípio Nuclear:**
> *"Capture now. Organize later. Find it when needed."*  
> (Capture no calor do momento. Organize quando for conveniente. Reencontre no instante exato da criação.)

O produto é otimizado obsessivamente para três momentos fundamentais:
1. **Capturar** uma referência com fricção zero (apenas colar a URL e salvar).
2. **Reconhecer** visualmente a referência salva ao navegar pela biblioteca.
3. **Recuperar** a referência exata através de busca instantânea e filtros contextuais durante a execução de um projeto.

## Positioning

Curator é uma ferramenta de ateliê digital de alto padrão. Posiciona-se na interseção entre:
- A precisão milimétrica e a velocidade operacional do **Linear**;
- A contenção visual, sobriedade e fluidez tátil do **Raycast**;
- A mentalidade de descoberta visual pura e respeito ao objeto curado do **Are.na**;
- A autoridade e elegância tipográfica de um arquivo editorial contemporâneo.

**O que o Curator recusa categoricamente:**
- Não é um agregador social nem possui feeds públicos de seguidores ou curtidas.
- Não possui mecanismos de gamificação, métricas de vaidade, sequências de uso ou emblemas.
- Não é um gerenciador de favoritos tradicional baseado em listas densas de links azuis e textos intermináveis.
- Não adota dashboards corporativos inchados, gráficos desnecessários ou widgets decorativos.
- É um santuário de trabalho privado, focado e silencioso por padrão.

## Operating Context

O Curator é operado prioritariamente em navegadores de computadores desktop e notebooks (telas amplas de design e desenvolvimento), oferecendo adaptação responsiva elegante para tablets e smartphones. 

É utilizado em duas situações de rotina:
1. **Modo Coleta Passiva / Ativa:** O usuário está navegando pela web ou redes de design, encontra uma referência notável e precisa arquivá-la em menos de 3 segundos sem interromper seu raciocínio.
2. **Modo Criação / Produção:** O usuário está no Figma ou no VS Code desenvolvendo um novo projeto e abre o Curator para resgatar referências de layouts específicos, padrões de formulários, paletas ou trechos de código arquivados semanas ou meses antes.

## Capabilities and Constraints

### Capacidades do Protótipo (MVP Frontend-First)
- **Biblioteca Central (Caixa de Entrada):** Grade responsiva priorizando screenshots visuais em proporção cinematográfica.
- **Captura Ágil de Referências:** Diálogo enxuto onde apenas a URL é obrigatória.
- **Simulação Honesta de Captura Assíncrona:** Ciclo de vida simulado de geração de screenshot (`pending` -> `ready` ou `failed`), permitindo retry manual e substituição de imagem em caso de falha.
- **Painel Lateral Contextual (Side Panel):** Abertura instantânea de metadados, anotações, trechos de código e arquivos sem perder a posição do scroll, a busca ativa ou o contexto do grid.
- **Visualização Expandida (Expanded Overlay):** Modo imersivo em quase tela cheia (92–96% da viewport) para inspeção detalhada de screenshots e documentação técnica.
- **Taxonomia Flexível:** Suporte a Coleções (curadorias temáticas), Projetos (entregáveis ou clientes) e Etiquetas (marcadores livres).
- **Busca e Filtragem Instantânea:** Busca em tempo real insensível a acentuação e caixa alta/baixa, combinando múltiplos critérios com semântica booleana precisa.
- **Persistência Local Integrada:** Modificações do usuário gravadas de forma resiliente no `localStorage`.

### Restrições Físicas e Técnicas
- **Sem Backend Real ou Banco de Dados em Nuvem no MVP:** Todas as operações ocorrem localmente no cliente.
- **Sem Automação Externa de Screenshot:** O protótipo utiliza um conjunto inicial de metadados e imagens demonstrativas realistas de sites contemporâneos e simula o processamento assíncrono de novas entradas sem fingir a existência de microsserviços proprietários.
- **Sem Autenticação ou Multi-usuário:** Acesso imediato à área de trabalho individual.
- **Localização Estrita:** Interface de usuário 100% em Português do Brasil (pt-BR), respeitando termos consagrados de tecnologia no código e nas convenções arquiteturais.

## Brand Commitments

- **Nome Oficial:** Curator.
- **Categoria de Marca:** Workspace visual privado para referências web.
- **Tom de Voz:** Seguro, técnico, focado, silencioso e editorial. Mensagens de interface concisas, livres de exclamações desnecessárias, jargões publicitários ou antropomorfizações ("assistente").
- **Idioma Padrão da Interface:** Português do Brasil (`pt-BR`).
  - Navegação e controles com traduções naturais e elegantes (ex: *Caixa de entrada*, *Projetos*, *Coleções*, *Etiquetas*, *Adicionar referência*, *Capturando imagem do site*).
  - Formatação brasileira para datas (`DD/MM/AAAA`) e horários no formato 24 horas.
  - Numerais tabulares para contadores de itens.

## Evidence on Hand

- **Dados de Demonstração Iniciais (Seed Mock Data):** Conjunto selecionado de referências reais de alto padrão da web (estúdios de design, produtos de software consolidados, portfólios premiados, sites de tipografia e landing pages contemporâneas) com capturas de tela nítidas em alta resolução, anotações ricas em Markdown, tags pertinentes e códigos reais (CSS, Tailwind, React).
- **Ausências Confirmadas:** O protótipo não deve fabricar falsas métricas de engajamento, estatísticas de produtividade artificial, falsos perfis de colaboradores ou promessas de sincronização em nuvem inexistentes.

## Product Principles

1. **Captura em Primeiro Lugar (Capture-First):** Se o ato de salvar exigir esforço cognitivo, o criativo deixará de arquivar. A URL é a única informação obrigatória; todo o restante (etiquetas, projeto, coleção, anotações) é opcional e pode ser preenchido a posteriori.
2. **Reconhecimento Visual sobre Listas Densas (Visual Recognition over Text-Heavy Lists):** Designers e desenvolvedores lembram de um site pela sua estética e composição visual, não pela URL ou pelo título textual. A imagem do site é a heroína da interface.
3. **Recuperação Rápida por Busca sobre Taxonomia Rígida (Searchability over Complex Filing):** O usuário não deve ser obrigado a navegar por árvores complexas de pastas. A busca global em tempo real é onipresente, tolerante e instantânea.
4. **Relacionamento Flexível sem Duplicação (Many-to-Many Associations):** Uma referência pode pertencer simultaneamente a múltiplos projetos (ex: *Projeto Fintech* e *Design System 2026*) e coleções (ex: *Minimalismo*, *Dark Mode*, *Tipografia Bold*) sem nunca clonar o registro de dados.
5. **Unidade de Contexto Integrada (All-in-One Reference):** Screenshots, link de origem, anotações de design, trechos de código e especificações de assets coexistem no mesmo cartão/painel da referência.
6. **Espaço Privado e Silencioso:** A ferramenta serve exclusivamente ao usuário. O foco deve repousar sobre as referências arquivadas, e não sobre elementos gráficos invasivos da própria interface do Curator.

## Accessibility & Inclusion

- Navegação completa por teclado com ordem de tabulação semântica e anéis de foco (`focus-visible`) nítidos e padronizados.
- Tecla `Escape` fecha hierarquicamente modais, diálogos de captura, overlay expandido e painel lateral.
- Suporte irrestrito a `prefers-reduced-motion` no sistema operacional: desativação imediata de transições e amortecimentos para usuários sensíveis a movimento.
- Relação de contraste de cores em conformidade rigorosa com **WCAG 2.1 nível AA** para textos normais, elementos gráficos essenciais e estados interativos.
- Textos alternativos pertinentes para capturas de tela e etiquetas ARIA em botões compostos apenas por ícones.

---

## Core Data Concepts (Entidades e Relações)

O modelo de dados do Curator é deliberadamente normalizado e relacional, garantindo que referências permaneçam instâncias únicas no armazenamento local:

```
┌────────────────────────────────────────────────────────┐
│                      REFERENCE                         │
├────────────────────────────────────────────────────────┤
│ id: string (uuid)                                      │
│ url: string                                            │
│ title: string                                          │
│ domain: string                                         │
│ screenshotUrl: string                                  │
│ screenshotStatus: 'pending' | 'ready' | 'failed'       │
│ notesMarkdown: string                                  │
│ tags: string[] (tag IDs ou nomes normalizados)         │
│ collectionIds: string[]                                │
│ projectIds: string[]                                   │
│ codeSnippets: CodeSnippet[]                            │
│ relatedFiles: ReferenceFile[]                          │
│ createdAt: ISO string                                  │
│ updatedAt: ISO string                                  │
└────────────────────────────────────────────────────────┘
        │ 1..n                  │ 1..n            │ 1..n
        ▼                       ▼                 ▼
┌──────────────┐        ┌──────────────┐   ┌──────────────┐
│  COLLECTION  │        │   PROJECT    │   │     TAG      │
├──────────────┤        ├──────────────┤   ├──────────────┤
│ id: string   │        │ id: string   │   │ id: string   │
│ name: string │        │ name: string │   │ name: string │
│ desc: string │        │ desc: string │   │ slug: string │
│ createdAt    │        │ client: str  │   │ color?: str  │
│ updatedAt    │        │ createdAt    │   │ createdAt    │
└──────────────┘        │ updatedAt    │   └──────────────┘
                        └──────────────┘
```

### 1. Referência (Reference)
A unidade nuclear do produto. Representa um recurso web preservado.
- `id`: Identificador único UUID v4.
- `url`: Endereço web completo válido (ex: `https://stripe.com/sessions`).
- `title`: Título descritivo do site (extraído automaticamente ou editado pelo usuário).
- `domain`: Nome de domínio normalizado para agrupamento visual (ex: `stripe.com`).
- `screenshotUrl`: URL pública ou referência de imagem local/base64 da captura visual.
- `screenshotStatus`: Estado do processamento da imagem:
  - `pending`: Captura em andamento (exibe placeholder pulsante e status textual honesto).
  - `ready`: Imagem capturada com sucesso e pronta para renderização.
  - `failed`: Falha no processamento (exibe estado visual neutro com opção de retry ou upload manual).
- `tags`: Vetor de identificadores de etiquetas associadas.
- `collectionIds`: Vetor de identificadores das coleções às quais a referência foi vinculada.
- `projectIds`: Vetor de identificadores dos projetos aos quais a referência foi associada.
- `notesMarkdown`: Texto livre formatado em Markdown para documentação visual, observações de UX, tipografia e regras de negócio.
- `codeSnippets`: Lista de trechos de código associados (ex: componentes React, regras CSS, configurações de animação).
- `relatedFiles`: Metadados de arquivos vinculados à referência.
- `createdAt` / `updatedAt`: Timestamps ISO 8601 para auditoria e ordenação cronológica.

### 2. Coleção (Collection)
Um agrupamento temático e atemporal de referências com curadoria do usuário (ex: *"Tipografia Brutalista"*, *"Padrões de Onboarding"*, *"Micro-interações 3D"*, *"Landing Pages Dark"*).
- Não há hierarquia forçada ou dependência de projetos.
- Uma referência pode pertencer a zero, uma ou dezenas de coleções simultaneamente.
- Remover uma referência de uma coleção remove apenas o vínculo na referência (`collectionIds`), preservando a referência intacta.

### 3. Projeto (Project)
Um agrupamento focado em uma entrega contextual, cliente ou iniciativa com escopo delimitado (ex: *"Redesign App Mobile"*, *"Landing Page Cliente X"*, *"Design System V2"*).
- Projetos podem possuir metadados específicos, como nome do cliente, descrição dos objetivos e status.
- Uma referência pode ser reaproveitada em múltiplos projetos independentes sem clonagem de dados.

### 4. Etiqueta (Tag)
Marcador transversal leve e reutilizável para categorização horizontal (ex: `minimalismo`, `editorial`, `fintech`, `saas`, `webgl`, `e-commerce`).
- Nomes são normalizados em caixa baixa para evitar duplicidades acidentais (ex: `Tailwind` e `tailwind` convergem para o mesmo marcador).

### 5. Trecho de Código (Code Snippet)
Registro técnico encapsulado pertencente a uma referência:
- `id`: Identificador único.
- `title`: Título do trecho (ex: *Botão magnético com GSAP*, *Layout de grid fluido*).
- `language`: Linguagem/sintaxe (ex: `typescript`, `css`, `html`, `jsx`, `json`).
- `code`: Texto do código-fonte preservando indentação e caracteres especiais.

### 6. Arquivo da Referência (Reference File)
Metadados para anexos vinculados à referência (paletas de cores exportadas, PDFs de especificações, assets vetoriais SVG):
- `id`: Identificador único.
- `name`: Nome do arquivo com extensão.
- `type`: Tipo MIME ou categoria de formato.
- `size`: Tamanho em bytes para exibição formatada (ex: `240 KB`).
- `url`: Link de download ou data URI para inspeção.

---

## MVP Scope (Escopo do Protótipo)

O protótipo inicial do Curator implementa integralmente os seguintes 12 blocos de funcionalidade:

1. **Caixa de Entrada / Biblioteca Principal (Inbox):** Ponto de entrada padrão da aplicação com listagem de todas as referências salvas, organizadas ou não, ordenadas por padrão das mais recentes para as mais antigas.
2. **Busca Global Integrada:** Campo de busca com filtragem reativa instantânea enquanto o usuário digita.
3. **Filtros Multifacetados:** Barra de controle permitindo filtrar simultaneamente por etiquetas, projetos, coleções e status de imagem.
4. **Fluxo de Captura de Referências (Add Reference):** Diálogo enxuto e centrado na URL com validação visual imediata.
5. **Painel Lateral de Detalhes (Side Panel):** Painel retrátil à direita (400–480 px) para consulta rápida e edição sem desarmar o grid de navegação.
6. **Overlay de Visualização Expandida (Expanded Overlay):** Visualização em 92–96% da tela para inspeção imersiva de screenshots, leitura completa de anotações e cópia de códigos.
7. **Gestão de Coleções:** Listagem, visualização dedicada com contagem de itens, criação, edição e exclusão de coleções.
8. **Gestão de Projetos:** Listagem de projetos com contexto, grid de referências vinculadas, criação, edição e exclusão de projetos.
9. **Gestão de Etiquetas:** Visualização consolidada de etiquetas, renomeação, contagem de referências e filtro direto por etiqueta.
10. **Acesso às Configurações Básicas:** Visualização minimalista para gerenciamento de dados locais (resetar dados de demonstração, limpar cache local e alternar temas).
11. **Estados Compartilhados e Feedback:** Tratamento honesto de carregamento, estados vazios, erros de validação, avisos de confirmação destrutiva e alertas visuais de sucesso.
12. **Persistência Local Resiliente:** Sincronização automática e silenciosa das ações do usuário com o `localStorage`.

---

## Capture Workflow (Fluxo de Captura)

O ato de salvar uma referência precisa ser mais rápido do que criar um favorito no navegador:

1. **Entrada Única:** O usuário aciona o botão *"Adicionar referência"* (ou o atalho global `N` ou `Ctrl/Cmd + K`).
2. **Validação Instantânea de URL:** O campo recebe foco automático. Ao colar a URL, o sistema valida a estrutura do link em tempo real.
3. **Salvamento Imediato:** O botão *"Salvar"* é habilitado imediatamente. O usuário **não é obrigado** a definir título, tags, coleções ou notas.
4. **Tratamento de URL Duplicada:** Se a URL já existir na base:
   - Uma mensagem clara informa: *"Esta URL já foi salva em sua biblioteca."*
   - O usuário recebe duas opções explícitas:
     - **Abrir referência existente:** Direciona imediatamente para o painel de detalhes da referência salva anteriormente.
     - **Salvar como nova referência:** Permite salvar um novo registro independente caso queira documentar um contexto visual separado.
5. **Simulação Honesta de Captura:**
   - Ao salvar, a referência é inserida no topo da Caixa de entrada com status `pending`.
   - Um timer simulado curto (1.5 a 3 segundos) atualiza o status para `ready` (exibindo a captura correspondente) ou ocasionalmente `failed` (para validação do fluxo de contingência).
   - O sistema **nunca alega** possuir um serviço de renderização headless em nuvem inexistente; o protótipo declara honestamente que está simulando a esteira de captura.
6. **Recuperação de Falha:**
   - Em caso de falha (`failed`), a referência é preservada na biblioteca.
   - O card e o painel exibem uma mensagem: *"Não foi possível capturar a imagem do site automaticamente."*
   - Duas ações ficam disponíveis: *"Tentar capturar novamente"* (retry da simulação) e *"Informar link de imagem manual"*.

---

## Search Behavior (Comportamento de Busca e Filtragem)

A busca é um dos pilares de maior valor utilitário do Curator:

- **Campos Indexados:** A busca analisa em tempo real os títulos das referências, domínios, URLs, etiquetas, conteúdo das anotações em Markdown, títulos de snippets de código e nomes de arquivos anexados.
- **Filtragem Reativa (Live Filtering):** A listagem atualiza instantaneamente a cada caractere digitado, sem necessidade de pressionar Enter.
- **Normalização de Texto:** Busca estritamente insensível a maiúsculas/minúsculas e acentuação (ex: digitar *"concepcao"*, *"concepção"* ou *"CONCEPCAO"* retorna os mesmos resultados via normalização Unicode NFD).
- **Semântica AND entre Termos:** Múltiplas palavras separadas por espaço são tratadas com operador lógico `AND` (ex: *"dashboard dark"* filtra referências que contenham ambos os termos).
- **Matching por Prefixo:** Correspondência de prefixo garantida em palavras-chave.
- **Estado Vazio de Busca:** Se o campo estiver em branco, todas as referências do contexto ativo são exibidas por ordem de criação.
- **Lógica de Filtros Combinados:**
  - Múltiplas etiquetas selecionadas utilizam lógica `OR` entre si (ex: etiquetas *fintech* OU *saas*).
  - Filtros de categorias distintas utilizam lógica `AND` (ex: Coleção *Minimalismo* `AND` Etiquetas (*fintech* `OR` *saas*)).
- **Preservação de Contexto:** A consulta digitada e os filtros selecionados permanecem intactos ao abrir, editar, expandir ou fechar o painel lateral de uma referência.

---

## Organization Behavior (Regras de Organização)

- **Coleções vs. Projetos:** 
  - *Coleções* reúnem princípios de design, linguagens visuais e padrões de interface perpétuos.
  - *Projetos* reúnem referências operacionais destinadas à execução de um produto ou cliente específico.
- **Flexibilidade Total:** Organizar é sempre opcional. Uma referência pode permanecer na Caixa de entrada sem qualquer tag ou pasta por tempo indeterminado.
- **Integridade Relacional:** Alterar ou desvincular uma coleção ou projeto jamais exclui a referência em si. A exclusão de uma referência é uma ação explícita e independente.

---

## Interaction Model (Modelo de Interação)

- **Abertura Não-Destrutiva de Detalhes:** Clicar em um cartão no grid abre o painel lateral direito (Side Panel). A grade de referências ajusta-se suavemente ou repousa sob o painel sem perder a posição do scroll nem os filtros ativos.
- **Transição para Modo Expandido:** Dentro do painel lateral, uma ação clara (*"Expandir visualização"*) abre o overlay de quase tela cheia (92–96% da viewport). A biblioteca de fundo permanece visível através de um backdrop escurecido suave com desfoque moderado.
- **Comportamento da Tecla Escape (`Esc`):**
  - Se o overlay expandido estiver aberto: pressionar `Esc` fecha o overlay e retorna ao painel lateral.
  - Se apenas o painel lateral estiver aberto: pressionar `Esc` fecha o painel lateral e devolve o foco ao card correspondente no grid.
  - Se um diálogo de confirmação estiver ativo: `Esc` cancela o diálogo e preserva a tela anterior.
- **Ações Destrutivas Protegidas:** Exclusões definitivas de referências, coleções ou projetos exigem confirmação em diálogo modal claro, com foco no botão de cancelamento por padrão.

---

## Explicitly Out of Scope (Fora do Escopo do MVP)

Para preservar o foco absoluto na experiência central de captura e redescoberta visual, os seguintes itens estão **expressamente excluídos** deste protótipo:
1. Autenticação, login social, controle de sessão ou telas de registro.
2. Colaboração multiusuário, comentários em tempo real ou compartilhamento em equipe.
3. Feed social público, perfis de usuários abertos ou contadores de seguidores.
4. Planos pagos, telas de faturamento, assinaturas ou integração com Stripe.
5. Classificação ou tagueamento automático via Inteligência Artificial / LLM.
6. Extensão para navegador Chrome/Firefox (o fluxo web interno cobre toda a demonstração de captura).
7. Serviço proprietário de captura automatizada em nuvem (Puppeteer/Playwright server-side).
8. Banco de dados em nuvem, sincronização remota ou APIs de backend corporativo.

---

## Success Criteria (Critérios Observáveis de Sucesso)

O protótipo do Curator será considerado bem-sucedido e pronto para implementação quando atender rigorosamente aos seguintes critérios:
1. **Navegação Inicial:** O usuário acessa a Caixa de entrada e visualiza imediatamente a coleção de referências de demonstração com screenshots carregadas com elegância e proporções consistentes.
2. **Busca e Filtro em Tempo Real:** O usuário pesquisa termos parciais ou combina etiquetas e visualiza a filtragem imediata do grid sem travamentos ou quebras de layout.
3. **Captura sem Atrito:** O usuário consegue colar uma URL, salvar em um único clique e acompanhar o ciclo de vida visual da captura simulada (`pending` -> `ready`).
4. **Inspeção Lateral Contínua:** O usuário clica em qualquer card, abre o painel lateral de detalhes, visualiza anotações e códigos associados sem que a página perca o scroll ou o estado de busca.
5. **Imersão Expandida:** O usuário consegue expandir a referência para tela quase cheia, examinar a captura em escala real e retornar ao painel lateral teclando `Esc`.
6. **Organização sem Perdas:** O usuário vincula e desvincula referências a coleções e projetos, observando os dados refletidos instantaneamente nas telas correspondentes sem clonagem de registros.
7. **Persistência Confiável:** Qualquer adição, edição de anotação, alteração de tags ou exclusão persiste intacta após a atualização da página (`F5`).
8. **Transparência de Estados:** Estados de erro (URL inválida, falha simulada de captura, busca sem resultados) são comunicados de forma sóbria, elegante e funcional, com caminhos fáceis de recuperação.
9. **Rigor em Múltiplos Dispositivos:** A interface preserva estabilidade, legibilidade e proporções estéticas tanto em monitores ultrawide quanto em notebooks compactos e dispositivos móveis.

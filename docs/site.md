# Arquitetura de Informação e Navegação: Salvei

<!-- impeccable:site-schema 1 -->

## Visão Geral da Estrutura da Aplicação

O Salvei foi concebido como uma aplicação web privada do tipo workspace, focada em produtividade visual para designers e engenheiros frontend. Não se comporta como uma página de marketing ou portal de conteúdo estático, mas sim como um ateliê de alta precisão.

### Layout Mestre (Application Shell)
A interface é composta por cinco regiões arquiteturais primárias:

1. **Barra Lateral Esquerda Persistente (Sidebar):**
   - Largura fixa de 240px no desktop (com capacidade de recolhimento para modo compacto de 64px ou gaveta em telas estreitas).
   - Identidade visual sóbria do Salvei no topo.
   - Navegação primária por destinos de primeiro nível.
   - Acesso rápido a Projetos e Coleções fixadas.
   - Ponto de entrada para Configurações na base.
2. **Barra Superior Global (Topbar):**
   - Altura compacta de 56px, alinhada à direita da barra lateral.
   - Campo de Busca Global de ativação rápida (`Ctrl/Cmd + K`).
   - Botão de ação primária destacada: *"Adicionar referência"* (`N`).
   - Indicador sutil de conectividade local e status de persistência.
3. **Área de Conteúdo Principal (Main Stage):**
   - Espaço amplo e fluido dedicado à renderização da biblioteca de referências.
   - Grid de screenshots de proporção cinematográfica com espaçamento equilibrado.
   - Cabeçalhos de seção contextuais com título da visão, contadores numéricos tabulares e controles de ordenação/filtragem.
4. **Painel Lateral de Detalhes da Referência (Side Panel):**
   - Gaveta deslizante ancorada à direita (largura de 400 a 480px).
   - Abre de forma não-destrutiva ao clicar em qualquer cartão de referência.
   - Preserva o estado subjacente da biblioteca (scroll, filtros e seleção).
5. **Overlay de Visualização Expandida (Expanded Overlay):**
   - Visualização imersiva em quase tela cheia (ocupando 92% a 96% da viewport).
   - Renderizada sobre a aplicação com efeito de atenuação visual de fundo (fundo escurecido translúcido com desfoque óptico).
   - Dedicada à inspeção em alta fidelidade da captura, anotações de design e código.

---

## Navegação Primária (Menu Principal)

A navegação da barra lateral estrutura o produto em torno de cinco destinos essenciais em Português do Brasil:

| Rota Canônica | Rótulo da Interface | Ícone Representativo | Descrição e Propósito |
| :--- | :--- | :--- | :--- |
| `/inbox` | **Caixa de entrada** | `Inbox` | Destino padrão. Exibe todas as referências salvas recentemente (organizadas ou pendentes de categorização), com ordenação decrescente por data de criação. |
| `/projects` | **Projetos** | `Briefcase` / `FolderGit2` | Visão de agrupamentos por projetos, iniciativas ou clientes. Permite acessar workspaces temáticos de entrega. |
| `/collections` | **Coleções** | `Layers` / `Bookmark` | Curadorias conceituais e atemporais estruturadas por linguagens estéticas, padrões de UI e referências técnicas. |
| `/tags` | **Etiquetas** | `Tag` / `Hash` | Índice taxonômico transversal de marcadores livres aplicados às referências salvas. |
| `/settings` | **Configurações** | `SlidersHorizontal` | Painel minimalista de gestão de dados locais, reset do acervo mock de demonstração e preferências visuais. |

---

## Telas Obrigatórias do Protótipo

Abaixo estão detalhadas as nove telas e superfícies que formam a experiência do Salvei:

### 1. Caixa de Entrada / Biblioteca Geral (`/inbox`)
- **Propósito:** Ponto central de recepção e consulta do acervo. Onde o criativo navega para redescobrir materiais recentes e revisar itens recém-capturados.
- **Layout:**
  - Cabeçalho de página: Título em destaque (*Caixa de entrada*), contador de referências em fonte monoespacada tabular (`[ 24 referências ]`), seletor de ordenação (*Mais recentes*, *Mais antigas*, *Título A-Z*).
  - Barra de ferramentas: Acesso rápido a filtros por etiquetas e status de captura.
  - Área central: Grid responsivo de cartões com screenshots dominantes (3 a 4 colunas em monitores amplos).
- **Componentes Principais:**
  - `HeaderSection`: Título e contadores.
  - `FilterBar`: Chips de filtro rápido por tags frequentes.
  - `ReferenceGrid`: Grid com layout adaptável.
  - `ReferenceCard`: Cartão com imagem de destaque, domínio, título e chips de tags.
- **Estados da Tela:**
  - *Carregando:* Grid de cartões esqueleto (skeletons com pulso suave).
  - *Com dados:* Lista fluida com lazy loading suave de imagens.
  - *Vazio:* Ilustração geométrica minimalista, mensagem explicativa (*"Sua biblioteca está vazia"*) e botão de ação primária para salvar a primeira referência.

### 2. Busca e Filtros Avançados (`/search`)
- **Propósito:** Localizar com velocidade cirúrgica referências através de combinações de termos e critérios facetados.
- **Layout:**
  - Barra superior de busca ativa com campo em destaque e botão de limpeza rápida (`Esc`).
  - Faixa de filtros ativos com chips removíveis individualmente ou ação *"Limpar todos os filtros"*.
  - Grade de resultados reutilizando o mesmo componente `ReferenceCard` da Caixa de entrada.
- **Controles de Filtro:**
  - Filtro por **Etiquetas** (multiseleção com semântica `OR`).
  - Filtro por **Projetos** associados (seleção única ou múltipla).
  - Filtro por **Coleções** associadas.
  - Filtro por **Tipo de Conteúdo** (possui código associado, possui anotações, possui arquivos anexos).
- **Estados da Tela:**
  - *Buscando:* Feedback imediato a cada tecla digitada sem recarregamento de página.
  - *Resultados encontrados:* Exibição da contagem exata (ex: `8 referências encontradas para "fintech"`).
  - *Nenhum resultado:* Painel sutil indicando a ausência de correspondências (*"Nenhuma referência encontrada para os filtros aplicados"*) com botão para resetar a busca.

### 3. Diálogo de Adicionar Referência (Add Reference Modal)
- **Propósito:** Captura ágil e de baixa fricção de uma nova referência web.
- **Layout:**
  - Modal compacto centralizado com largura de 520px e foco automático imediato no campo de URL.
  - Fechamento rápido por clique no backdrop ou tecla `Escape`.
- **Componentes e Campos:**
  - Campo de entrada de URL com prefixo visual `https://` e validação imediata de formato.
  - Seção expansível opcional (*"Adicionar detalhes agora"*):
    - Título alternativo (opcional).
    - Seleção rápida de etiquetas existentes ou criação de nova tag inline.
    - Associação a projetos ou coleções existentes via menu de seleção acessível.
    - Campo de anotações rápidas.
  - Botão de ação primária: *"Salvar referência"*.
- **Comportamento Especial:**
  - Apenas a URL é obrigatória.
  - **Detecção de URL Duplicada:** Se o link já estiver cadastrado, o modal exibe um alerta preventivo elegante com botão para *"Abrir referência existente"* ou *"Salvar como cópia independente"*.

### 4. Painel Lateral de Detalhes da Referência (Side Panel)
- **Propósito:** Consultar, ler anotações, copiar trechos de código e editar metadados de uma referência sem perder o contexto do grid subjacente.
- **Dimensões:** Largura fixa de 440px (faixa de 400 a 480px em desktop), ocupando 100% da altura da viewport à direita.
- **Anatomia do Painel:**
  - **Barra de Ações do Topo:**
    - Botão *"Fechar painel"* (`Esc`).
    - Botão *"Expandir visualização"* (abre o Overlay de quase tela cheia).
    - Menu de opções contextuais (Copiar link, Abrir no navegador, Excluir referência).
  - **Cabeçalho Visual:**
    - Miniatura de alta definição da captura de tela (clicável para expandir).
    - Status da captura em tempo real (`pending`, `ready`, `failed`).
  - **Metadados Principais:**
    - Título editável em linha.
    - Domínio e link externo direto com ícone `ArrowUpRight`.
    - Data de salvamento e última modificação.
  - **Organização:**
    - Seletores de Coleções e Projetos vinculados.
    - Lista de Etiquetas aplicadas (com capacidade de adicionar/remover tags instantaneamente).
  - **Aba de Anotações:**
    - Visualizador formatado em Markdown com tipografia editorial.
    - Botão de alternância para modo de edição direta.
  - **Aba de Código:**
    - Lista de trechos de código vinculados com destaque de sintaxe, linguagem e botão de cópia com feedback tátil em 1 clique (*"Copiado!"*).
  - **Aba de Arquivos:**
    - Lista de assets complementares com nome, tamanho e botão de download.

### 5. Overlay de Visualização Expandida (Expanded Overlay)
- **Propósito:** Modo de imersão total para análise detalhada do design, estudo de layouts complexos e cópia de grandes blocos de documentação técnica.
- **Dimensões:** Ocupa entre 92% e 96% da largura e altura da viewport, mantendo margens perimetrais que deixam a biblioteca visível de forma atenuada ao fundo.
- **Anatomia do Overlay:**
  - **Barra Superior Fixa:**
    - Título da referência e domínio.
    - Ação *"Visitar site original"* com link externo.
    - Botão *"Voltar ao painel"* / *"Fechar"* (`Esc`).
  - **Corpo em Duas Colunas (Desktop Amplo):**
    - **Coluna Esquerda (65% da largura):**
      - Visualizador de imagem em escala máxima com suporte a rolagem interna suave.
      - Opção de alternar entre visualização de desktop e visualização mobile quando disponível.
      - Estado de contingência com botão de substituição caso a imagem tenha falhado.
    - **Coluna Direita (35% da largura):**
      - Documentação detalhada em Markdown.
      - Blocos de código com sintaxe estilizada em tema editorial escuro/claro.
      - Histórico de metadados, projetos e coleções associadas.

### 6. Projetos (`/projects` e `/projects/:projectId`)
- **Propósito:** Organizar referências alinhadas a iniciativas com entregáveis, sprints ou clientes específicos.
- **Layout da Listagem (`/projects`):**
  - Lista de projetos em formato de cartões estruturais contendo: Nome do projeto, cliente/contexto, descrição sintética, contagem de referências e data da última atualização.
  - Botão de ação primária: *"Novo projeto"*.
- **Layout da Visão do Projeto (`/projects/:projectId`):**
  - Cabeçalho editorial: Nome do projeto, metadados do cliente, descrição e botão de edição/exclusão.
  - Grade de referências vinculadas ao projeto (reutilizando `ReferenceCard`).
  - Ação rápida de vincular referências existentes ao projeto.

### 7. Coleções (`/collections` e `/collections/:collectionId`)
- **Propósito:** Curadoria conceitual contínua de padrões de interface, estilos visuais e linguagens de design.
- **Layout da Listagem (`/collections`):**
  - Mosaico de coleções com visualização de capas dinâmicas (mosaico das últimas 3 screenshots de referências da coleção).
  - Nome da coleção, descrição e contador de itens.
  - Botão de criação de nova coleção.
- **Layout da Visão da Coleção (`/collections/:collectionId`):**
  - Cabeçalho imersivo com título da coleção, descrição editorial e contagem.
  - Grade filtrada exibindo exclusivamente os itens pertencentes àquela coleção.

### 8. Etiquetas (`/tags` e `/tags/:tagId`)
- **Propósito:** Gestão horizontal e descoberta de referências por palavras-chave livres.
- **Layout:**
  - Nuvem estruturada e lista alfabética de todas as etiquetas ativas na biblioteca com suas respectivas contagens numéricas (ex: `minimalismo (14)`, `fintech (9)`, `css-grid (6)`).
  - Ações de gerenciamento: Renomear etiqueta (atualiza todas as referências associadas em lote) e Excluir etiqueta.
  - Ao selecionar uma tag, exibe a grade correspondente de referências.

### 9. Configurações (`/settings`)
- **Propósito:** Manutenção de preferências locais e integridade da base do protótipo.
- **Layout:**
  - Painel de formulário enxuto em coluna única contida (640px de largura máxima).
  - Seções de configuração:
    - **Armazenamento e Dados Locais:**
      - Exibição do espaço consumido no `localStorage` (ex: `1.2 MB de 5 MB utilizados`).
      - Botão *"Restaurar dados de demonstração"* (recarrega os mocks originais de alta fidelidade).
      - Botão *"Limpar todas as referências"* (ação protegida com diálogo de confirmação dupla).
    - **Preferências de Interface:**
      - Alternância de tema visual (Claro, Escuro ou Seguir Sistema).
      - Informações de versão e arquitetura do Salvei.

---

## Estratégia de Roteamento e Sincronização de Estado

Para garantir a melhor usabilidade do navegador (botão Voltar funcional, capacidade de recarregar a página sem perder o item aberto e compartilhamento conceitual de links):

### 1. URLs Canônicas Principais
- `/inbox` — Caixa de entrada padrão.
- `/projects` — Listagem geral de projetos.
- `/projects/:projectId` — Visão detalhada de um projeto específico.
- `/collections` — Listagem de coleções.
- `/collections/:collectionId` — Visão de uma coleção específica.
- `/tags` — Gestão e índice de etiquetas.
- `/tags/:tagSlug` — Referências filtradas pela etiqueta.
- `/search` — Tela dedicada de busca com filtros complexos.
- `/settings` — Painel de configurações do usuário.

### 2. Estado de Superfícies Contextuais (Side Panel e Overlay)
- O **painel lateral de detalhes** é sincronizado com a URL através de um parâmetro de busca (*search parameter*):
  - Exemplo: `/inbox?ref=stripe-sessions-2026` ou `/projects/fintech-app?ref=stripe-sessions-2026`.
  - **Vantagem:** Permite que o usuário use o botão *"Voltar"* do navegador para fechar o painel lateral sem navegar para outra página. Se a página for atualizada (`F5`), a referência permanece aberta.
- O **overlay de visualização expandida** adiciona a flag modal:
  - Exemplo: `/inbox?ref=stripe-sessions-2026&view=expanded`.
  - Pressionar o botão Voltar do navegador ou a tecla `Esc` fecha o overlay e reverte a URL para `/inbox?ref=stripe-sessions-2026`, mantendo o painel lateral aberto.

---

## Regras de Navegação e Interação

1. **Persistência da Barra Lateral:** A barra lateral esquerda não se recarrega e mantém a indicação visual ativa da rota corrente.
2. **Preservação de Contexto e Scroll:** Clicar em um cartão de referência abre o painel lateral através de uma transição fluida, sem rolar a página para o topo, sem resetar a consulta de busca e sem desmarcar os chips de filtro ativos.
3. **Escalonamento Não-Destrutivo:**
   ```
   [ Grid de Referências da Biblioteca ]
          │ (clique no card)
          ▼
   [ Painel Lateral de Detalhes (440px) ] ── (Esc / Fechar) ──► Retorna ao Grid
          │ (ação "Expandir")
          ▼
   [ Overlay Quase Tela Cheia (94vw/vh) ] ── (Esc / Fechar) ──► Retorna ao Painel
   ```
4. **Respeito à Tecla Escape (`Esc`):**
   - Diálogo modal aberto → Fecha o diálogo.
   - Overlay expandido aberto → Fecha o overlay e retorna ao painel lateral.
   - Painel lateral aberto → Fecha o painel lateral e foca no card de origem.
5. **Comportamento em Telas Estreitas (< 768px):**
   - A barra lateral recolhe-se em uma gaveta acionada pelo menu hambúrguer.
   - O grid de referências adapta-se automaticamente para 1 coluna fluida.
   - O painel lateral de detalhes abre como gaveta de largura total (100vw).

---

## Fluxos Primários de Usuário (Passo a Passo)

### Fluxo 1: Salvar um Novo Website
1. O usuário está na aplicação e pressiona o atalho de teclado `N` (ou clica em *"Adicionar referência"*).
2. O diálogo de captura surge centralizado com foco imediato no campo de URL.
3. O usuário cola o endereço (ex: `https://www.apple.com/vision-pro/`) e clica em *"Salvar referência"* (ou pressiona `Enter`).
4. O diálogo fecha-se instantaneamente; a nova referência surge no primeiro slot da Caixa de entrada com o status visual `pending` (*"Capturando imagem do site..."*).
5. Após 2 segundos da simulação assíncrona, a miniatura em alta resolução aparece suavemente com status `ready`.

### Fluxo 2: Encontrar uma Referência Salva
1. O usuário pressiona `Ctrl/Cmd + K` (ou clica no campo de busca no topo).
2. Digita palavras-chave (ex: *"fintech dark"*).
3. A biblioteca filtra os itens instantaneamente a cada tecla digitada, ocultando itens não correspondentes com transição suave.
4. O usuário refina a seleção clicando no chip da etiqueta *"tipografia"*.
5. O resultado exibe as 3 referências que atendem simultaneamente aos critérios.

### Fluxo 3: Abrir e Expandir uma Referência
1. O usuário clica sobre o cartão da referência no grid.
2. O painel lateral direito de 440px desliza suavemente para dentro da tela; a URL é atualizada para `?ref=:id`.
3. O usuário examina os dados rápidos e clica no ícone de expansão no topo do painel.
4. O overlay expandido surge cobrindo 94% da tela com animação sutil; o fundo é escurecido.
5. O usuário estuda a screenshot em tamanho completo, revisa a documentação e clica na tecla `Esc`.
6. A tela retorna ao painel lateral; outro toque em `Esc` fecha o painel lateral e devolve o foco ao grid.

### Fluxo 4: Adicionar Anotações e Código a uma Referência
1. Com o painel lateral da referência aberto, o usuário clica na aba *"Anotações"*.
2. Clica no botão *"Editar anotação"*.
3. Escreve observações técnicas em Markdown (tópicos de UX, decisões de fontes e espaçamento).
4. Clica na aba *"Código"*, aciona *"Adicionar trecho"* e insere um componente de botão em Tailwind CSS.
5. O sistema salva as alterações imediatamente no `localStorage` e exibe um indicador discreto de confirmação (*"Alterações salvas"*).

### Fluxo 5: Organizar uma Referência em Projetos e Coleções
1. No painel lateral da referência, o usuário visualiza o bloco *"Organização"*.
2. Clica no seletor *"Projetos"* e marca o checkbox de *"Redesign Banco 2026"*.
3. Clica no seletor *"Coleções"* e vincula a referência a *"Micro-interações 3D"*.
4. Sem duplicar nenhum registro na base, a referência passa a constar instantaneamente na visão do projeto e da coleção.

### Fluxo 6: Criar uma Nova Coleção
1. O usuário clica em *"Coleções"* na barra lateral.
2. Clica no botão *"Nova coleção"*.
3. No diálogo, digita o nome (ex: *"Modo Noturno Minimalista"*) e uma descrição opcional.
4. Ao confirmar, a nova coleção é criada e fica imediatamente disponível para receber vínculos de referências.

### Fluxo 7: Recuperar-se de Falha na Captura de Imagem
1. Uma referência recém-adicionada tem sua captura assíncrona finalizada com o status `failed`.
2. O cartão na biblioteca exibe um container neutro elegante com ícone sutil e a mensagem *"Captura indisponível"*.
3. O usuário clica no cartão para abrir o painel lateral.
4. No painel, o usuário visualiza duas opções claras:
   - *"Tentar capturar novamente"* (reinicia o ciclo de simulação).
   - *"Informar link de imagem manual"* (abre um campo para colar a URL de uma screenshot externa ou imagem local).
5. Ao informar a URL manual, a miniatura é atualizada imediatamente para `ready`.

### Fluxo 8: Tratar Tentativa de URL Duplicada
1. O usuário abre o modal de captura e cola uma URL que já existe em sua biblioteca.
2. O sistema reconhece a URL duplicada e exibe um alerta inline sutil em tom neutro/âmbar:
   - *"Esta URL já existe em sua biblioteca."*
3. O usuário pode clicar em *"Abrir referência existente"* (fechando o modal e abrindo o painel lateral da referência original) ou *"Salvar como nova referência"* (caso queira registrar uma cópia isolada para outro propósito).

---

## Dicionário de Estados Compartilhados de Interface

| Identificador do Estado | Descrição da Experiência Visual | Comportamento e Ação do Usuário |
| :--- | :--- | :--- |
| **`INITIAL_LOADING`** | Esqueletos animados (skeletons com pulso suave em cinza claro) ocupam o espaço dos cartões e dos cabeçalhos. | Indica o carregamento do repositório local sem saltos bruscos de layout (*CLS zero*). |
| **`EMPTY_INBOX`** | Canvas limpo com ilustração geométrica vetorial sutil em traço fino e mensagem de boas-vindas. | Botão primário *"Adicionar primeira referência"* centralizado convidando ao uso. |
| **`NO_SEARCH_RESULTS`** | Mensagem sóbria: *"Nenhuma referência encontrada para 'termo'"*. | Botão de ação para *"Limpar busca e filtros"*, restaurando a visão completa da biblioteca. |
| **`INVALID_URL`** | Borda do campo de entrada em tom de erro controlado (`#EF4444`) com micro-rótulo explicativo (*"Insira uma URL válida iniciando com http:// ou https://"*). | O botão de salvar permanece desabilitado até a correção. |
| **`SAVING_STATE`** | Botão de salvar exibe micro-spinner discreto ou label *"Salvando..."* com opacidade atenuada. | Evita múltiplos cliques acidentais. |
| **`SCREENSHOT_PENDING`** | Card exibe placeholder estrutural com shimmer elegante e badge: `[ CAPTURANDO... ]`. | Usuário pode continuar navegando e interagindo com a biblioteca normalmente. |
| **`SCREENSHOT_READY`** | Transição suave de fade-in da imagem do site em alta definição substituindo o placeholder. | A referência atinge seu estado estável de repouso. |
| **`SCREENSHOT_FAILED`** | Placeholder cinza estético com micro-rótulo em fonte monoespacada: `[ CAPTURA INDISPONÍVEL ]`. | Oferece botões explícitos para tentar novamente ou inserir imagem manualmente. |
| **`PERSISTENCE_SUCCESS`** | Feedback visual silencioso no cabeçalho ou micro-toast na base (*"Alterações salvas"*). | Confirma a persistência no `localStorage`. |
| **`DESTRUCTIVE_CONFIRM`** | Diálogo modal com foco padrão no botão de cancelamento (*"Cancelar"*), destacando o risco da exclusão definitiva. | Requer confirmação consciente do usuário antes de expurgar o registro. |

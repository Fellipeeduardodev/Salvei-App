# Manifesto de Arquivos e Assets — Salvei

> **Inventário completo de arquivos, especificações técnicas, dimensões e propósitos de uso dos materiais de identidade visual e direção da landing page.**

---

## 1. Resumo Quantitativo do Pacote de Assets

- **Total de Pranchas de Apresentação (Boards Figma 1:1):** 11 pranchas completas em SVG vetorial nativo
- **Total de Logotipos, Símbolos e Ícones:** 12 arquivos vetoriais
- **Total de Imagens e Texturas de Alta Resolução:** 6 imagens curadas
- **Total de Mockups de Produto e Componentes:** 7 mockups vetoriais
- **Total de Seções da Landing Page:** 6 seções individuais + 1 canvas contínuo integrado (1440x4450)
- **Total de Documentos e Manuais:** 5 documentos detalhados em Markdown

---

## 2. Inventário Detalhado por Diretório

### `01-brand-strategy/` (Estratégia & Posicionamento)

| Arquivo | Formato | Dimensões | Descrição / Propósito no Figma |
| :--- | :--- | :--- | :--- |
| `brand-strategy-board.svg` | SVG | 1920 × 1080 | **Prancha da Página 1 do Figma:** Manifesto visual com a declaração da marca, audiência (50% dev / 50% designer), traços de personalidade e fluxo operacional em 3 tempos. |
| `brand-strategy-summary.md` | Markdown | — | Documento analítico completo sobre posicionamento, tom de voz, público e mensagens-chave. |

---

### `02-visual-identity/` (Identidade Visual, Logos & Tokens)

| Arquivo | Formato | Dimensões | Descrição / Propósito no Figma |
| :--- | :--- | :--- | :--- |
| `visual-identity-board.svg` | SVG | 1920 × 1080 | **Prancha da Página 2 do Figma:** Mostruário integrado contendo a anatomia do símbolo S-Prism, variações de logo, paleta de cores e escala tipográfica. |
| `color-swatches-board.svg` | SVG | 1440 × 900 | Amostra detalhada com todas as tonalidades cromáticas, tokens HEX, nomes semânticos e modo claro/escuro. |
| `typography-scale-board.svg` | SVG | 1440 × 900 | Escala tipográfica completa com Plus Jakarta Sans, Inter e JetBrains Mono em todos os pesos e tamanhos. |
| `symbol-salvei-primary.svg` | SVG | 512 × 512 | Símbolo oficial isolado sobre fundo grafite com pino cobalto de alta precisão. |
| `symbol-salvei-dark.svg` | SVG | 512 × 512 | Símbolo oficial para superfícies escuras (Dark Mode). |
| `symbol-salvei-light.svg` | SVG | 512 × 512 | Símbolo oficial para superfícies claras e brancas. |
| `symbol-salvei-cobalt.svg` | SVG | 512 × 512 | Símbolo oficial em Azul Cobalto monocromático. |
| `logo-wordmark-dark.svg` | SVG | 400 × 100 | Logotipia tipográfica em grafite profundo com pingo cobalto no "i". |
| `logo-wordmark-light.svg` | SVG | 400 × 100 | Logotipia tipográfica em branco puro para contraste sobre superfícies escuras. |
| `logo-wordmark-cobalt.svg` | SVG | 400 × 100 | Logotipia tipográfica em azul cobalto institucional. |
| `logo-lockup-horizontal-dark.svg` | SVG | 360 × 60 | Lockup oficial horizontal (símbolo + wordmark) para cabeçalhos e navegação. |
| `logo-lockup-horizontal-light.svg` | SVG | 360 × 60 | Lockup oficial horizontal para temas escuros. |
| `logo-lockup-stacked-dark.svg` | SVG | 300 × 200 | Lockup oficial empilhado para capas, materiais impressos e telas de splash. |
| `logo-lockup-stacked-light.svg` | SVG | 300 × 200 | Lockup oficial empilhado para superfícies escuras. |
| `app-icon-512x512.svg` | SVG | 512 × 512 | Ícone de aplicativo móvel e PWA com cantos arredondados contínuos (squircle). |
| `favicon.svg` | SVG | 32 × 32 | Favicon oficial web otimizado para abas do navegador em 16px e 32px. |
| `color-palette-tokens.json` | JSON | — | Especificação de tokens em formato compatível com Tailwind CSS, Style Dictionary e Figma Tokens. |

---

### `03-moodboards/` (Moodboards & Universo Criativo)

| Arquivo | Formato | Dimensões | Descrição / Propósito no Figma |
| :--- | :--- | :--- | :--- |
| `moodboards-showcase-board.svg` | SVG | 1920 × 1080 | **Prancha da Página 3 do Figma:** Composição editorial de galeria integrando os 4 eixos conceituais (Arquitetura, Digital, Tipografia e Ateliê). |
| `moodboards-curation-notes.md` | Markdown | — | Diretrizes conceituais e curadoria do universo estético. |

---

### `04-image-assets/` (Imagens Curadas & Social Share)

| Arquivo | Formato | Dimensões | Descrição / Categoria |
| :--- | :--- | :--- | :--- |
| `editorial-references/editorial-architecture-01.jpg` | JPG | Alta Resolução | Arquitetura minimalista de concreto e luz natural zenital com detalhe em cobalto. |
| `editorial-references/editorial-typography-print-02.jpg` | JPG | Alta Resolução | Impressão tipográfica em baixo relevo (letterpress) sobre papel de algodão. |
| `digital-references/digital-interface-grid-01.jpg` | JPG | Alta Resolução | Interface em dark mode com grid linear, cartões estéticos e tipografia técnica. |
| `digital-references/digital-design-system-spec-02.jpg` | JPG | Alta Resolução | Especificação de design tokens, matriz modular de 8px e classes Tailwind CSS. |
| `hybrid-compositions/hybrid-studio-still-01.jpg` | JPG | Alta Resolução | Still life de estúdio criativo reunindo livros suíços, caderno de notas e tablet. |
| `auxiliary-graphics/og-background-texture-1200x630.jpg` | JPG | 1200 × 630 | Textura abstrata em grafite e cobalto para fundos de cards sociais. |
| `og-social-share-1200x630.svg` | SVG | 1200 × 630 | Card oficial Open Graph para Twitter/X, LinkedIn e compartilhamento no WhatsApp. |

---

### `05-product-mockups/` (Mockups e Recursos de Interface)

| Arquivo | Formato | Dimensões | Descrição / Propósito no Figma |
| :--- | :--- | :--- | :--- |
| `real-app-hero-mockup.svg` | SVG | 1440 × 960 | **Prancha da Página 4 do Figma:** Mockup fiel do aplicativo Salvei em execução real, com sidebar lateral, barra superior, barra de filtros e grid de referências capturadas. |
| `desktop-browser-frame-light.svg` | SVG | 1440 × 900 | Moldura de navegador minimalista em modo claro com área reservada para capturas. |
| `desktop-browser-frame-dark.svg` | SVG | 1440 × 900 | Moldura de navegador minimalista em modo escuro (Dark Mode). |
| `feature-quicksearch-modal.svg` | SVG | 700 × 440 | Mockup vetorial da busca rápida (`Cmd+K` / Quick Search) com resultados em tempo real. |
| `feature-collections-mosaic.svg` | SVG | 640 × 420 | Mockup da visualização de Coleções em modo mosaico assimétrico dinâmico. |
| `feature-tags-taxonomy.svg` | SVG | 600 × 380 | Mockup do gerenciador de tags transversais com contadores numéricos. |
| `feature-reference-detail.svg` | SVG | 900 × 580 | Mockup da gaveta de detalhes da referência com notas em Markdown e classes Tailwind. |

---

### `06-landing-page-direction/` (Direção de Arte da Landing Page)

| Arquivo | Formato | Dimensões | Descrição / Propósito no Figma |
| :--- | :--- | :--- | :--- |
| `landing-page-full-direction-board.svg` | SVG | 1440 × 4450 | **Prancha da Página 6 do Figma (Completa):** Canvas vertical contínuo da landing page completa, da barra de topo até o rodapé. |
| `section-01-hero.svg` | SVG | 1440 × 900 | Seção 01: Hero com proposta de valor, pílula de workspace, CTA e teaser do app. |
| `section-02-problem.svg` | SVG | 1440 × 600 | Seção 02: O Problema (Abas Infinitas, Prints Sem Contexto vs Solução Salvei). |
| `section-03-workflow.svg` | SVG | 1440 × 700 | Seção 03: Como Funciona (Fluxo em 3 Tempos: Salvar, Organizar, Encontrar). |
| `section-04-features.svg` | SVG | 1440 × 800 | Seção 04: Funcionalidades Principais em grid 2×2 com detalhes técnicos. |
| `section-05-inspiration.svg` | SVG | 1440 × 850 | Seção 05: Galeria de Curadoria com imagens reais (arquitetura, editorial, código). |
| `section-06-closing-cta.svg` | SVG | 1440 × 600 | Seção 06: Chamada Final com glow cobalto, botão primário e rodapé institucional. |
| `landing-page-specifications.md` | Markdown | — | Especificações completas de arquitetura, seções, tipografia e espaçamentos. |

---

### Raiz de `brand-assets/`

| Arquivo | Formato | Descrição |
| :--- | :--- | :--- |
| `BRAND_GUIDELINES.md` | Markdown | Manual mestre de identidade visual, tipografia, regras de marca e paleta de cores. |
| `MANIFEST.md` | Markdown | Este inventário detalhado de arquivos e especificações. |
| `README.md` | Markdown | Guia passo a passo para importar os assets no Figma com 1 clique e organizar as 6 páginas. |

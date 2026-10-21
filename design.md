---
name: Curator
description: Sistema de design de alta precisão e ateliê editorial para o workspace privado de gestão de referências visuais da web.
colors:
  background: "#F8F8F6"
  surface: "#FFFFFF"
  primary: "#171717"
  secondary: "#737373"
  border: "#E7E7E5"
  accent: "#4355DB"
  accent-hover: "#3646B8"
  accent-subtle: "rgba(67, 85, 219, 0.08)"
  hover: "#F1F1EF"
  selected: "#EDEDEA"
  disabled: "#A8A8A6"
  signal-green: "#22c55e"
  warning: "#F59E0B"
  error: "#EF4444"
  backdrop: "rgba(15, 15, 15, 0.45)"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  header-pill:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  card-reference:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
---

# Design System: Curator

## 1. Visão Geral & Direção Visual

**Creative North Star: "A Precisão do Ateliê Digital"**

O Curator é um workspace visual privado construído com a convicção de que referências criativas merecem respeito arquitetônico e clareza absoluta. A identidade visual nasce da síntese rigorosa de quatro referências contemporâneas de excelência:

- **A precisão e a disciplina operacional do Linear:** Densidade de informação calibrada, atalhos de teclado ágeis, alinhamentos matemáticos e ausência de supérfluos.
- **A contenção, sobriedade e refinamento do Raycast:** Superfícies neutras de apoio, tipografia de suporte monoespacada legível e foco na tarefa sem distrações cromáticas.
- **A primazia do objeto visual do Are.na:** A captura de tela (screenshot) é a peça central da composição; a interface recua para que o trabalho curado seja a estrela absoluta da página.
- **A autoridade e o rigor editorial do portfólio de Fellipe Eduardo:** Tensão controlada entre escalas tipográficas, entrelinhas compactas nos títulos display (*The Tight Display Rule*), micro-legendas técnicas monospaçadas (*The Mono Micro-Anchor Rule*) e contraste formal deliberado (*The Dual Form Rule*).

### O que o Design do Curator Recusa Categoricamente (Anti-Patterns)
- **Sem painéis de controle administrativos genéricos:** Nada de cards multicoloridos de KPI, gráficos de rosca sem valor ou widgets inflados.
- **Sem estética de landing page promocional:** Sem ilustrações 3D de plástico, avatares flutuantes ou textos com gradientes chamativos.
- **Sem cards hiper-arredondados com sombras pesadas:** Bordas com raios desproporcionais (`rounded-3xl`) e sombras difusas artificiais degradam a atmosfera profissional de ferramenta de trabalho.
- **Sem poluição de links azuis:** Evitar listas densas e frias de URLs textuais; a identificação do site dá-se através da sua imagem em alta resolução.
- **Sem dispersão cromática arbitrária:** As cores do sistema são estritamente contidas. O azul acento (`#4355DB`) atua como condutor de ação e foco, nunca como ornamento generalizado.

---

## 2. Tokens de Cor & Regras Cromáticas

O sistema de cores do Curator é tonal, calmo e de alto contraste funcional. As variáveis CSS operam como fonte única da verdade (*single source of truth*) e são consumidas pelos utilitários do Tailwind CSS v4.

### Tabela de Tokens Principais (Light Theme de Base)

| Token CSS | Valor Hexadecimal | Utilização no Sistema |
| :--- | :--- | :--- |
| `--bg-canvas` | `#F8F8F6` | Fundo principal da aplicação; tonalidade de papel editorial fosco que reduz o brilho excessivo do branco puro. |
| `--bg-surface` | `#FFFFFF` | Superfície dos cartões de referência, painel lateral de detalhes, barra lateral e modais. |
| `--text-primary` | `#171717` | Cor primária para títulos, rótulos de navegação e textos de alto contraste. |
| `--text-secondary` | `#737373` | Texto de apoio, domínios de sites, contadores e parágrafos explicativos (contraste WCAG AA+). |
| `--text-muted` | `#A8A8A6` | Micro-legendas secundárias, placeholders de formulário e atalhos de teclado. |
| `--border-subtle` | `#E7E7E5` | Linhas estruturais divisórias de 1px e bordas de cartões e inputs. |
| `--border-hover` | `#D4D4D0` | Estado hover de bordas de cartões e botões secundários. |
| `--accent` | `#4355DB` | Azul acento de alta precisão reservado para botões primários, anéis de foco e seleções ativas. |
| `--accent-hover` | `#3646B8` | Estado hover do acento primário. |
| `--accent-subtle` | `rgba(67, 85, 219, 0.08)` | Fundo translúcido para chips selecionados e abas ativas. |
| `--bg-hover` | `#F1F1EF` | Realce de linha e hover em itens de menu da barra lateral e tabelas. |
| `--bg-selected` | `#EDEDEA` | Estado selecionado ativo de itens de lista e navegação. |
| `--signal-green` | `#22c55e` | **Status exclusivo:** Indicador pulsante de captura concluída com sucesso ou serviço ativo. |
| `--warning` | `#F59E0B` | Alertas de URL duplicada e avisos preventivos. |
| `--error` | `#EF4444` | Erros de validação e indicação de falha na captura de screenshot. |
| `--bg-backdrop` | `rgba(15, 15, 15, 0.45)` | Máscara de fundo para o overlay expandido e modais, combinada com `backdrop-blur-sm`. |

### Regras Cromáticas Fundamentais

**The Restrained Accent Rule.** O azul acento (`#4355DB`) é uma ferramenta funcional, não uma decoração. Nunca utilize o acento para pintar fundos de cartões inteiros, rodapés ou grandes títulos. Ele sinaliza foco, ação intencional e seleção ativa.

**The Single Signal Green Rule.** O verde esmeralda (`#22c55e`) nunca deve ser utilizado para botões genéricos ou tags casuais. Seu uso é restrito ao pulso de confirmação de captura assíncrona bem-sucedida (`ready`) e integridade operacional.

**The Flat & Tonal Default Rule.** Elementos no mesmo nível hierárquico se diferenciam pelo contraste tonal sutil entre o canvas (`#F8F8F6`), a superfície (`#FFFFFF`) e a borda fina (`#E7E7E5`), e não por sombras artificiais.

---

## 3. Tipografia & Escala Hierárquica

O sistema tipográfico equilibra a neutralidade refinada da fonte sem serifa contemporânea com a autoridade das fontes monoespacadas para coordenadas técnicas.

### Famílias Tipográficas
1. **Sans-Serif Primária:** `Inter` (com fallback para `Geist`, `system-ui`, `-apple-system`, `sans-serif`).
   - Utilizada para todo o corpo de texto, títulos de cartões, formulários e elementos de controle.
2. **Monospace / Coordenadas Técnicas:** `JetBrains Mono` (com fallback para `SFMono-Regular`, `ui-monospace`, `monospace`).
   - Utilizada para contadores, metadados de domínio, datas, tags de status e blocos de código.
3. **Display Opcional:** `Outfit` (utilizada pontualmente para títulos monumentais de abertura em coleções e na marca Curator).

### Escala Tipográfica (Typographic Hierarchy)

| Nível / Token | Família | Tamanho / Leading | Peso | Tracking | Uso no Produto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title** | `Inter` / `Outfit` | `clamp(1.75rem, 3vw, 2.5rem)` / `1.1` | 700 Bold | `-0.025em` | Títulos principais das telas (*Caixa de entrada*, *Projetos*). |
| **Section Heading** | `Inter` | `1.25rem (20px)` / `1.3` | 600 SemiBold | `-0.015em` | Cabeçalhos de grupos, títulos de modais e abas do painel. |
| **Card Title** | `Inter` | `0.9375rem (15px)` / `1.35` | 600 SemiBold | `-0.01em` | Título da referência no cartão da biblioteca. |
| **Body Regular** | `Inter` | `0.875rem (14px)` / `1.6` | 400 Regular | `normal` | Descrições, notas de Markdown, textos explicativos. |
| **Body Supporting** | `Inter` | `0.8125rem (13px)` / `1.5` | 400 Regular | `normal` | Rótulos de formulário secundários, textos de ajuda. |
| **Technical Label** | `JetBrains Mono` | `0.6875rem (11px)` / `1.4` | 600 SemiBold | `0.14em` | Domínios (`STRIPE.COM`), contadores `[ 24 ITENS ]`, status. |
| **Code Block** | `JetBrains Mono` | `0.8125rem (13px)` / `1.7` | 400 Regular | `normal` | Trechos de código (CSS, Tailwind, TypeScript). |

### Regras Tipográficas com Nome

**The Tight Display Rule.** Títulos principais devem manter entrelinha compacta (`leading <= 1.15`) e tracking sutilmente negativo. O espaçamento vertical frouxo em títulos quebra a solidez arquitetônica do layout.

**The Mono Micro-Anchor Rule.** Todo dado contextual técnico (datas `20/10/2026`, domínios, contadores numéricos, atalhos de teclado e tags de status) deve ser renderizado em `JetBrains Mono` com `tabular-nums` para evitar oscilações de layout durante atualizações.

---

## 4. Espaçamento, Grid & Geometria

### Sistema de Espaçamento Base 8
O ritmo espacial do Curator baseia-se em múltiplos de **8px**, permitindo passos finos de **4px** para alinhamentos ópticos de ícones e inputs:

- `4px` (`spacing-xs`): Espaçamento interno de micro-chips, separação entre ícones e textos curtos.
- `8px` (`spacing-sm`): Espaçamento entre campos adjacentes, padding de botões compactos.
- `16px` (`spacing-md`): Gaps padrão entre cartões no grid mobile, padding interno de cartões.
- `24px` (`spacing-lg`): Gaps de grid no desktop, padding padrão de painéis e cabeçalhos.
- `32px` (`spacing-xl`): Margens externas de seções da biblioteca.
- `48px` (`spacing-2xl`): Margens de respiração vertical em telas de detalhes e overlays.

### Dimensões Fixas da Aplicação
- **Largura da Barra Lateral (Sidebar):** `240px` (desktop) / `64px` (modo recolhido).
- **Altura da Barra Superior (Topbar):** `56px`.
- **Largura do Painel Lateral de Detalhes:** `440px` (faixa aceita: 400px a 480px).
- **Dimensões do Diálogo Modal:** Largura padrão de `520px`.
- **Proporção do Overlay Expandido:** Ocupa `94vw` de largura por `94vh` de altura (entre 92% e 96% do viewport), perfeitamente centralizado.
- **Largura Máxima do Conteúdo:** `1600px` (evita dispersão excessiva em monitores ultrawide).

### Grid Responsivo de Screenshots
A grade da Caixa de entrada adapta-se ao espaço disponível:
- **Telas Ultra-amplas (>= 1440px):** 4 colunas fluidas.
- **Desktop Padrão (1024px a 1439px):** 3 colunas fluidas.
- **Tablets e Desktop com Painel Lateral Aberto:** 2 colunas confortáveis.
- **Smartphones (< 640px):** 1 coluna com largura total.

---

## 5. Formas, Elevação & Sombras

### The Dual Form Rule (A Regra da Forma Dupla)
Seguindo o rigor da sua marca, o Curator equilibra exclusivamente **duas famílias geométricas**:

1. **Forma Arquitetônica / Contida (`rounded-sm: 4px` ou `rounded-none: 0px`):**
   - Aplicada a cartões de referência, molduras de screenshot, painéis laterais, diálogos e divisores estruturais.
   - Comunica estabilidade, seriedade e foco documental.
2. **Forma Tátil / Pílula (`rounded-full: 9999px` ou `rounded-md: 8px`):**
   - `rounded-full` é reservado para chips de status, seletor de visualização, atalhos de teclado e tags circulares táteis.
   - `rounded-md (8px)` é reservado para botões interativos e campos de formulário (`<input>`).
   - **Proibição Absoluta:** Jamais utilize cantos excessivamente arredondados (`rounded-2xl` ou `rounded-3xl` / 16px–24px) em cartões de referência ou containers de mídia.

### Vocabulário de Elevação & Profundidade
O Curator adota **Profundidade por Borda e Tonalidade** como padrão. Sombras só surgem quando uma camada flutua ativamente sobre outra:

- **Borda de Contorno Padrão:** `1px solid var(--border-subtle)` em todos os cartões, inputs e painéis em repouso.
- **Sombra de Painel Flutuante (Side Panel Shadow):** `-10px 0 30px rgba(0, 0, 0, 0.04)` para delimitar o painel sobre a biblioteca.
- **Sombra de Diálogo Modal & Popover:** `0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)`.
- **Sombra de Overlay Expandido:** `0 25px 60px rgba(0, 0, 0, 0.25)`.

---

## 6. Especificação dos Componentes Centrais

### 1. Cartão de Referência (`ReferenceCard`) — O Herói do Produto
O cartão é o elemento mais importante da experiência. O screenshot lidera a narrativa:
- **Moldura da Imagem:**
  - Proporção visual cinematográfica fixa em `16:10` (ou `4:3`).
  - Imagem preenche o container via `object-fit: cover` com transição sutil de escala no hover (`group-hover:scale-[1.015]` com duração de 300ms).
  - Borda inferior fina separando a imagem do rodapé textual.
- **Rodapé de Metadados:**
  - Padding contido: `12px 14px`.
  - Linha 1: Domínio em fonte monoespacada (`text-[11px] font-mono font-semibold tracking-wider text-neutral-500 uppercase`) + Indicador discreto de status (ponto pulsante verde para `ready`, cinza para `pending`, vermelho para `failed`).
  - Linha 2: Título da referência em `Inter` SemiBold (`text-sm text-neutral-900 truncate`).
  - Linha 3 (opcional): Até duas tags em formato micro-chip (`text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600 font-mono`).
- **Estado de Contingência (Screenshot Ausente ou Falha):**
  - Placeholder geométrico com gradiente sutil neutro em cinza suave (`#F1F1EF`), ícone vetorial discreto de globo/janela e micro-legenda `[ CAPTURA INDISPONÍVEL ]`.

### 2. Botões (`Button`)
- **Primary (Obsidian):** Fundo `#171717`, texto `#FFFFFF`, cantos `rounded-md (8px)`, tipografia `Inter 13px font-medium`. Hover para `#262626`.
- **Accent (Ação Primária de Destaque):** Fundo `#4355DB`, texto `#FFFFFF`, cantos `rounded-md (8px)`. Hover para `#3646B8`.
- **Secondary / Outline:** Borda de 1px `#E7E7E5`, fundo transparente, texto `#171717`. Hover com fundo `#F1F1EF`.
- **Ghost:** Sem borda, fundo transparente, texto `#737373`. Hover com texto `#171717` e fundo `#F1F1EF`.
- **Destructive:** Fundo `#EF4444`, texto `#FFFFFF`. Hover para `#DC2626`.
- **Estados:** Todos os botões contam com feedback de `active:scale-[0.98]` e anel de foco visível `focus-visible:ring-2 focus-visible:ring-[#4355DB] focus-visible:ring-offset-2`.

### 3. Barra de Busca Global (`SearchBar`)
- Altura de `38px`, borda fina `#E7E7E5`, cantos `rounded-md (8px)`, fundo `#FFFFFF` ou `#F8F8F6`.
- Ícone `Search` à esquerda com traço fino (`strokeWidth={1.75}`).
- Texto de placeholder sóbrio: *"Buscar por título, domínio, tag, código ou anotação..."*.
- Badge de atalho à direita em fonte mono: `Ctrl K` ou `⌘K` com fundo neutro.

### 4. Chips de Filtro & Etiquetas (`FilterChip` / `TagBadge`)
- Altura compacta de `26px` a `28px`.
- Formato pílula (`rounded-full`) ou cantos suaves (`rounded-md: 6px`).
- Estado inativo: Fundo `#FFFFFF`, borda `#E7E7E5`, texto `#737373`.
- Estado ativo/selecionado: Fundo `#4355DB`, borda `#4355DB`, texto `#FFFFFF`.

### 5. Barra Lateral de Navegação (`Sidebar`)
- Fundo `#FFFFFF` com borda lateral direita de 1px `#E7E7E5`.
- Links de navegação com padding `8px 12px`, cantos `rounded-md (6px)`, ícones de traço fino (18px).
- Link ativo: Fundo `#F1F1EF`, texto `#171717`, peso `font-semibold` e micro-indicador de barra vertical à esquerda.

### 6. Painel Lateral de Detalhes (`SidePanel`)
- Fundo `#FFFFFF`, borda esquerda de 1px `#E7E7E5`.
- Cabeçalho fixo com abas funcionais em pílula (*Visão Geral*, *Anotações*, *Código*, *Arquivos*).
- Área de conteúdo com rolagem vertical suave independente.

### 7. Overlay Expandido (`ExpandedOverlay`)
- Fundo do container: `#FFFFFF` com cantos `rounded-sm (4px)`.
- Backdrop: Escurecido translúcido `rgba(15, 15, 15, 0.45)` com `backdrop-blur-sm`.
- Layout em duas colunas respiradas no desktop, garantindo leitura técnica sem atrito.

### 8. Estados Vazios (`EmptyState`)
- Layout centralizado no canvas com espaçamento generoso.
- Ilustração vetorial minimalista em traço fino monocromático (sem desenhos cartunescos ou 3D inflado).
- Título conciso, parágrafo explicativo e botão de ação direta.

---

## 7. Motion & Transições

A cinemática do Curator segue a premissa de que a animação serve para orientar o foco e confirmar interações, nunca para atrasar o usuário:

- **Duração das Transições:** Rápidas e ágeis, entre `150ms` e `250ms`.
- **Função de Temporização:** `cubic-bezier(0.16, 1, 0.3, 1)` (curva de amortecimento suave e responsivo de alta precisão).
- **Abertura do Painel Lateral:** Translação em X de `+100%` para `0%` em 240ms.
- **Abertura do Overlay Expandido:** Fade-in de opacidade com escala sutil de entrada (`scale(0.98)` para `scale(1.0)`).
- **Hover de Cartão:** Elevação micrométrica imperceptível com transição suave da borda (`border-color` de `#E7E7E5` para `#D4D4D0`).
- **Diretriz Mandatória de Acessibilidade:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 8. Comportamento Responsivo

- **Desktop Amplo (>= 1280px):** Barra lateral expandida (240px), grid de 3 a 4 colunas, painel lateral ancorado sem sobrepor o grid de forma compressiva.
- **Notebooks e Telas Médias (1024px a 1279px):** Barra lateral compacta ou recolhível, grid de 2 a 3 colunas, painel lateral sobrepõe suavemente o conteúdo com backdrop leve.
- **Tablets (768px a 1023px):** Barra lateral recolhe para ícones (64px) ou menu drawer; grid de 2 colunas; overlay expandido passa para layout em pilha vertical única.
- **Dispositivos Móveis (< 768px):** Barra superior com acionador de menu hambúrguer; grid de 1 coluna; painel lateral abre como drawer de tela cheia (100vw).

---

## 9. Acessibilidade (a11y) & Usabilidade

1. **Navegação por Teclado:** Toda a aplicação deve ser completamente operável via teclado (`Tab`, `Shift + Tab`, `Enter`, `Espaço`, setas direcionais e atalhos rápidos).
2. **Anéis de Foco Padronizados:** Todo componente interativo em estado de foco via teclado (`:focus-visible`) exibe um anel de 2px em `#4355DB` com deslocamento (`offset`) de 2px, garantindo visibilidade imediata em qualquer fundo.
3. **Gerenciamento de Foco Modal:** Ao abrir um diálogo ou o overlay expandido, o foco é capturado e retido dentro do elemento; ao fechar, o foco é devolvido rigorosamente ao elemento que disparou a ação.
4. **Hierarquia Semântica:** Uso estrito de `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>` e títulos hierárquicos `<h1>` a `<h3>`.
5. **Rótulos para Leitores de Tela:** Todos os botões contendo apenas ícones possuem `aria-label` descritivo em Português do Brasil (ex: `aria-label="Fechar painel de detalhes"`).

---

## 10. Regras de Implementação do Design System

- **Centralização de Tokens:** Nunca utilize valores de cores ou espaçamentos arbitrários (`bg-[#232323]` ou `p-[17px]`) espalhados pelo código; consuma os tokens padronizados definidos no `@theme` do Tailwind CSS v4.
- **Composição sobre Monólitos:** Prefira criar componentes pequenos, especializados e composíveis em vez de componentes gigantescos repletos de dezenas de propriedades booleanas.
- **Manutenção de Consistência:** Não instale bibliotecas conflitantes de componentes visuais; utilize os primitivos do Radix UI estilizados rigorosamente com as classes do Curator.
- **Integridade da Marca:** Preserve o equilíbrio entre autoridade monocromática e a vibração pura dos screenshots capturados.

---

## 11. Direção Técnica Formalizada & Arquitetura Frontend

Conforme estabelecido para a inicialização do projeto Curator, a stack tecnológica e a arquitetura inicial estão formalizadas abaixo:

### Stack Tecnológica Decidida
- **Core:** React 19 + TypeScript 5.8 + Vite 6.
- **Roteamento:** React Router (com suporte a rotas canônicas e sincronização de estado contextual via query parameters).
- **Estilização:** Tailwind CSS v4 configurado com tokens do sistema via diretiva `@theme`.
- **Ícones:** Lucide React (ícones vetoriais geométricos, traço limpo de 1.75 a 2px).
- **Primitivos Acessíveis:** Radix UI / shadcn/ui para diálogos, popovers, menus e dropdowns.
- **Gerenciamento de Estado Compartilhado:** Zustand exclusivamente para o estado de visualização de UI (referência ativa, painel lateral aberto/fechado, overlay expandido, filtros facetados globais).
- **Formulários:** React Hook Form e validação de schema com Zod para o fluxo de captura e edição de metadados.
- **Persistência do Protótipo:** Repositório desacoplado (`ReferenceRepository`) baseado em `localStorage` e dados iniciais mockados, facilmente permutável por uma API REST/GraphQL no futuro.
- **Ambiente de Testes:** Vitest para testes unitários da camada de dados e lógica de busca; React Testing Library para componentes visuais essenciais.

### Estrutura de Diretórios Recomendada (`src/`)
```
src/
  app/                    # Setup da aplicação, providers de contexto e rotas (React Router)
    App.tsx
    routes.tsx
  components/             # Componentes transversais reutilizáveis
    layout/               # Shell, Sidebar, Topbar, Container
    references/           # ReferenceCard, ReferenceGrid, ScreenshotFrame
    search/               # SearchBar, FilterBar, FilterChip
    ui/                   # Primitivos atômicos (Button, Input, Modal, Drawer, Tooltip)
  features/               # Módulos verticais organizados por domínio
    library/              # Visão da Caixa de entrada e biblioteca principal
    references/           # Painel lateral de detalhes e overlay expandido
    collections/          # Listagem e gestão de coleções
    projects/             # Listagem e gestão de projetos
    tags/                 # Gestão de etiquetas e nuvem taxonômica
    settings/             # Tela de preferências locais e dados
  data/                   # Camada de abstração de dados e armazenamento
    mock/                 # Dados iniciais realistas de alta fidelidade
    repositories/         # Interfaces e implementações (localStorage)
  hooks/                  # Hooks customizados reutilizáveis (useKeyboardShortcut, useDebounce)
  lib/                    # Funções utilitárias (normalização de busca, datas pt-BR, formatação)
  types/                  # Definições completas de tipos TypeScript de domínio
  styles/                 # Arquivo index.css com tokens de design e temas do Tailwind v4
```

---

## 12. Localização & Idioma Obrigatório (pt-BR)

Em estrito cumprimento aos requisitos de produto, **100% da interface com o usuário é exibida em Português do Brasil (`pt-BR`)**:
- *Caixa de entrada* (Inbox)
- *Projetos* (Projects)
- *Coleções* (Collections)
- *Etiquetas* (Tags)
- *Configurações* (Settings)
- *Adicionar referência* (Add reference)
- *Salvar referência* (Save reference)
- *Expandir visualização* (Expand reference)
- *Buscar por título, domínio ou etiqueta...*
- *Nenhuma referência encontrada*
- *Capturando imagem do site...*
- *Captura indisponível*
- *Alterações salvas com sucesso*
- *Excluir definitivamente*

As convenções de código interno (nomes de arquivos, variáveis, funções, componentes e tipos TypeScript) permanecem em inglês profissional para assegurar a aderência aos padrões globais de engenharia de software.

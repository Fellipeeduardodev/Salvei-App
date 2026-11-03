# Brand Guidelines — Salvei

> **Manual de Identidade Visual, Direção de Arte e Sistema de Design do Salvei.**
>
> *Versão 1.0 — 2026*

---

## 1. A Marca Salvei

### 1.1 Origem e Conceito
O nome **Salvei** expressa a ação espontânea e definitiva do criador: o ato de resguardar uma ideia no instante em que ela surge. Em português brasileiro, o verbo no pretérito perfeito transmite segurança imediata — aquilo que foi visto está guardado, protegido e catalogado.

> **Assinatura Oficial:**
> *"Capture agora. Organize depois. Encontre quando precisar."*
>
> **Conceito Criativo:**
> *"Uma biblioteca visual para suas próximas ideias."*

### 1.2 Personalidade e Atributos de Marca
- **Sofisticada & Editorial:** Herdeira da tradição do design suíço internacional, da diagramação de revistas de arte e da sobriedade escandinava.
- **Discreta & Funcional:** Uma moldura silenciosa que não compete com o conteúdo das referências.
- **Técnica & Precisa:** Atenta à densidade de informação necessária aos desenvolvedores de software e engenheiros de interface.

---

## 2. Anatomia do Logotipo e Símbolo

### 2.1 O Símbolo Oficial: "Dual S-Tag Cut"
O símbolo oficial do Salvei sintetiza a essência do bookmarking e da curadoria visual de referências:

- **Geometria & Inclinação:** Dois cartões de referências com entalhes laterais (waist notches), separados por uma fenda diagonal precisa inclinada a **-16°**, formando a silhueta contínua e dinâmica da letra **"S"**.
- **Azul Cobalto Elétrico (`#3C3DE3`):** Tom vibrante que equilibra o rigor editorial suíço com energia digital contemporânea.
- **Eficiência Óptica:** Desenhado em malha vetorial pura com espessuras proporcionais, garantindo legibilidade perfeita desde micro-favicons de 16px até grandes superfícies de sinalização e mockups físicos.

### 2.2 O Wordmark Oficial
Construído com base na tipografia **Plus Jakarta Sans 800** (ou *Inter Display*), em caixa-baixa editorial:
- Escrita `salvei` com kerning negativo calibrado (-0.035em).
- Proporção óptica alinhada em altura (~80%) com o símbolo nas aplicações horizontais.

### 2.3 Matriz de Versões e Catálogo de Variações

| Versão | Conceito Morfológico | Arquivo Vetorial |
| :--- | :--- | :--- |
| **Símbolo Primário (Oficial)** | Dual S-Tag com entalhes e corte diagonal a -16°. | `02-visual-identity/symbol-salvei-primary.svg` |
| **Símbolo Dark Accent** | Versão otimizada com realce luminoso para fundo escuro (`#585BFF`). | `02-visual-identity/symbol-salvei-dark.svg` |
| **Símbolo Monocromático** | Versão em branco puro (`#FFFFFF`) ou grafite tinta (`#181820`). | `02-visual-identity/symbol-salvei-light.svg` |
| **Lockup Horizontal Light** | Símbolo + Wordmark em grafite para superfícies claras. | `02-visual-identity/logo-lockup-horizontal-light.svg` |
| **Lockup Horizontal Dark** | Símbolo + Wordmark em gelo para superfícies escuras. | `02-visual-identity/logo-lockup-horizontal-dark.svg` |
| **App Icon Squircle 512px** | Ícone em squircle iOS/macOS com elevação e iluminação. | `02-visual-identity/app-icon-512x512.svg` |
| **V1 • Ticket Cut S** | Duplo ticket com entalhes originais da referência enviada. | `02-visual-identity/variations/symbol-variation-01-ticket-original.svg` |
| **V2 • Fluid Ribbon** | Fita isométrica contínua com dobra traseira e profundidade. | `02-visual-identity/variations/symbol-variation-02-fluid-ribbon.svg` |
| **V3 • Precision Pill** | Geometria minimalista de pílulas concêntricas e micro-notches. | `02-visual-identity/variations/symbol-variation-03-minimal-pill.svg` |
| **V4 • 3D Layered Prism** | Volumetria com oclusão de contato e sombreamento sutil. | `02-visual-identity/variations/symbol-variation-04-layered-prism-3d.svg` |
| **V5 • Bookmark Pin** | Integração do marcador pontual de referência (Focal Pin). | `02-visual-identity/variations/symbol-variation-05-bookmark-pin.svg` |
| **V6 • Blueprint Stencil** | Monoline técnico com espessura de 3px para código e dark mode. | `02-visual-identity/variations/symbol-variation-06-technical-stencil.svg` |

### 2.4 Regras de Uso e Área de Proteção
1. **Área de Não Interferência:** Mantenha sempre um espaço livre equivalente a pelo menos 50% da altura do símbolo em torno do logotipo.
2. **Redução Mínima:**
   - Favicon: 16px × 16px
   - Símbolo isolado: 20px × 20px
   - Lockup completo: 90px de largura
3. **Usos Incorretos Proibidos:**
   - Não distorcer horizontalmente ou verticalmente.
   - Não aplicar sombras drop shadow difusas ou coloridas.
   - Não alterar a cor do pino cobalto para cores secundárias aleatórias.
   - Não rotacionar o símbolo em ângulos não ortogonais.

---

## 3. Cores Institucionais e Tokens de Design

A paleta de cores do Salvei foi calibrada para atender aos critérios de contraste WCAG AA/AAA e proporcionar uma atmosfera de tranquilidade visual.

### 3.1 Cores Principais

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Off-White     │  │    Grafite      │  │  Azul Cobalto   │
│    #F8F8F6      │  │    #171717      │  │     #4355DB     │
│  Fundo Principal│  │ Tipografia Base │  │  Ponto de Foco  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

| Nome do Token | Valor HEX | Uso Recomendado |
| :--- | :--- | :--- |
| `color-bg-primary` | `#F8F8F6` | Fundo principal da página e áreas de respiro (Modo Claro). |
| `color-bg-surface` | `#FFFFFF` | Superfície de cartões, modais e formulários (Modo Claro). |
| `color-text-primary` | `#171717` | Títulos, textos principais e elementos de alto contraste. |
| `color-text-muted` | `#737373` | Subtítulos, metadados secundários e rótulos auxiliares. |
| `color-brand-accent` | `#4355DB` | Botões de ação primária, pino da marca, foco e links ativos. |
| `color-brand-accent-light` | `#6375F1` | Destaques sobre fundos escuros e estados de hover. |
| `color-border-hairline` | `#E7E7E5` | Linhas de divisão de 1px e bordas de cartões no modo claro. |
| `color-surface-editorial` | `#E8E8E4` | Caixas de notas editoriais e fundos de badges neutros. |

### 3.2 Cores para Tema Escuro (Dark Mode)

| Nome do Token | Valor HEX | Uso Recomendado |
| :--- | :--- | :--- |
| `color-dark-bg` | `#111214` | Fundo profundo do modo escuro. |
| `color-dark-surface` | `#191B20` | Superfície elevada de cartões e gavetas laterais. |
| `color-dark-border` | `#2D3139` | Bordas e divisores de alta precisão no dark mode. |
| `color-dark-text` | `#F3F4F6` | Texto principal em superfícies escuras. |

> *O arquivo JSON com a especificação técnica completa encontra-se em `02-visual-identity/color-palette-tokens.json`.*

---

## 4. Sistema Tipográfico

O Salvei utiliza uma tríade tipográfica rigorosa, garantindo a coexistência fluida entre editorial e digital:

### 4.1 Famílias Tipográficas
1. **Plus Jakarta Sans (Sans-serif Geométrica):**
   - *Aplicação:* Títulos (H1, H2, H3), nomes de projetos, logotipos e destaques numéricos.
   - *Pesos recomendados:* SemiBold (600), Bold (700), ExtraBold (800).
   - *Kerning:* Tracking levemente negativo (-0.02em a -0.04em em tamanhos de exibição).
2. **Inter (Sans-serif Neogrotesca Neutra):**
   - *Aplicação:* Textos corridos, labels de formulários, botões, navegação e descrições.
   - *Pesos recomendados:* Regular (400), Medium (500), SemiBold (600).
   - *Entrelinha:* 1.5 a 1.6 para máxima legibilidade editorial.
3. **JetBrains Mono (Monoespaçada de Alta Legibilidade):**
   - *Aplicação:* Atalhos de teclado (`Cmd+K`), URLs, contadores, tags taxonômicas (`#design`), snippets de código e metadados de arquivos.
   - *Pesos recomendados:* Regular (400), Medium (500), SemiBold (600).

### 4.2 Escala Modular Tipográfica

| Nível | Tamanho / Line-Height | Fonte / Peso | Aplicação |
| :--- | :--- | :--- | :--- |
| **Hero H1** | 64px / 1.05 | Plus Jakarta Sans 800 | Frase de impacto da landing page. |
| **H2 Section** | 38px / 1.15 | Plus Jakarta Sans 800 | Títulos de seções principais. |
| **H3 Modal/Card** | 20px / 1.25 | Plus Jakarta Sans 700 | Títulos de referências e modais. |
| **Body Large** | 18px / 1.50 | Inter 400 | Subtítulo do hero e introduções. |
| **Body Base** | 14px / 1.55 | Inter 400 / 500 | Textos de cards, parágrafos e inputs. |
| **Caption & Tags** | 11px / 1.40 | JetBrains Mono 500 / 600 | Tags, URLs, atalhos de teclado e badges. |

---

## 5. Mockups e Apresentação de Produto

Para preservar a autenticidade do produto:
- O Salvei deve ser sempre apresentado em molduras de desktop de precisão (1440x900) com controles de janela discretos em estilo minimalista.
- A visualização das referências deve refletir o ecossistema real da aplicação: suporte a imagens com proporção natural, cartões com cantos arredondados de 8px e divisores em linha fina.
- Todos os mockups vetoriais prontos para uso no Figma encontram-se no diretório `05-product-mockups/`.

# Kit de Identidade Visual e Assets do Salvei

> **Guia de Importação e Uso no Figma para o time de design e desenvolvimento.**

---

## 1. Visão Geral

Este repositório contém todo o acervo visual, direção de arte, tokens e mockups desenvolvidos para a identidade da marca **Salvei** e a futura landing page institucional.

Todos os componentes gráficos foram renderizados em **vetores SVG nativos em escala 1:1**, permitindo arrastar e soltar diretamente para dentro do **Figma**, onde se desdobram em camadas, nós vetoriais e caixas de texto totalmente editáveis.

---

## 2. Como Importar para o Figma em 3 Passos

### Passo 1: Criar o Arquivo no Figma
1. Abra o Figma (no aplicativo desktop ou em [figma.com](https://figma.com)).
2. Crie um novo arquivo de design vazio.
3. Nomeie o arquivo como:
   ```
   Salvei — Brand & Landing Page
   ```

### Passo 2: Criar a Estrutura de Páginas Recomendada
No painel esquerdo do Figma (Pages), crie as seguintes 6 páginas:

```
├── 01 Estratégia de Marca
├── 02 Identidade Visual
├── 03 Moodboards
├── 04 Mockups do Produto
├── 05 Assets da Landing Page
└── 06 Direção da Landing Page
```

### Passo 3: Arrastar e Soltar as Pranchas Correspondentes

| Página do Figma | Arquivos Recomendados para Importação Direta |
| :--- | :--- |
| **01 Estratégia de Marca** | • Arraste `01-brand-strategy/brand-strategy-board.svg` |
| **02 Identidade Visual** | • Arraste `02-visual-identity/visual-identity-board.svg`<br>• Arraste `color-swatches-board.svg` e `typography-scale-board.svg`<br>• Arraste os símbolos e variações de logo para criar a biblioteca de componentes |
| **03 Moodboards** | • Arraste `03-moodboards/moodboards-showcase-board.svg`<br>• Arraste as 5 fotografias de alta resolução de `04-image-assets/` |
| **04 Mockups do Produto** | • Arraste `05-product-mockups/real-app-hero-mockup.svg`<br>• Arraste as molduras `desktop-browser-frame-light.svg` e `dark.svg`<br>• Arraste os mockups de features (`quicksearch`, `collections`, `tags`, `reference-detail`) |
| **05 Assets da Landing Page** | • Arraste `04-image-assets/og-social-share-1200x630.svg`<br>• Arraste o pack de símbolos e ícones para montagem rápida |
| **06 Direção da Landing Page** | • **Opção Canvas Contínuo:** Arraste `06-landing-page-direction/landing-page-full-direction-board.svg` (1440x4450)<br>• **Opção Seções Individuais:** Arraste `section-01-hero.svg` até `section-06-closing-cta.svg` |

---

## 3. Integração com Variáveis e Cores do Figma

Para configurar as variáveis locais no Figma de forma rápida:
1. Abra o arquivo `02-visual-identity/color-palette-tokens.json`.
2. As cores principais estão mapeadas:
   - `Off-White`: `#F8F8F6`
   - `Graphite`: `#171717`
   - `Cobalt`: `#4355DB`
   - `Editorial Gray`: `#E8E8E4`
   - `Hairline Border`: `#E7E7E5`
   - `Dark BG`: `#111214`
   - `Dark Surface`: `#191B20`

---

## 4. Tipografias Utilizadas

Para editar os textos nativamente no Figma com a fidelidade exata, certifique-se de ter as seguintes fontes instaladas (todas gratuitas no Google Fonts):
- **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** (Headings & Identidade)
- **[Inter](https://fonts.google.com/specimen/Inter)** (Corpo de Texto & Interface)
- **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** (Código, Metadados & Tags)

---

## 5. Nota sobre as Capacidades da API / MCP do Figma

A API REST pública do Figma é projetada para leitura, inspeção e exportação de nós existentes. A criação programática remota de novos arquivos `.fig` em contas pessoais não é suportada por endpoints REST sem a infraestrutura de administração Enterprise da equipe.

Por este motivo, entregamos os assets através de **pranchas vetoriais SVG nativas de alta resolução com precisão milimétrica**. Ao arrastá-las para a tela do Figma, a ferramenta converte automaticamente o código SVG em frames e curvas vetoriais nativas, proporcionando total liberdade de edição, troca de cores e personalização.

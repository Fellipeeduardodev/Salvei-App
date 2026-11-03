# Especificações de Design da Landing Page — Salvei

> **Diretrizes de direção de arte, arquitetura de conteúdo e especificações visuais para a futura landing page do Salvei.**
>
> *Nota: Este documento serve como guia exclusivo de design e prototipagem no Figma. Nenhuma linha de código frontend foi implementada nesta fase.*

---

## 1. Arquitetura de Seções e Conteúdo

A landing page foi concebida com 6 seções sequenciais fluidas sobre uma largura padrão de **1440px** com container central de **1200px**:

### Seção 01: Hero & Apresentação do Produto
- **Dimensões:** 1440px × 900px
- **Arquivo Vectorial:** `section-01-hero.svg`
- **Fundo:** Off-white (`#F8F8F6`)
- **Elementos:**
  - **Barra de Navegação:** Logotipo oficial horizontal Salvei (S-Prism + wordmark), links de navegação editorial (*Recursos, Manifesto, Atalhos, GitHub*) e botão secundário em grafite (*Acessar App →*).
  - **Badge Superior:** Pílula arredondada com ponto cobalto: `WORKSPACE DIGITAL DE REFERÊNCIAS`.
  - **Título Principal (H1):** `Salve, organize e encontre suas referências de design.` (Plus Jakarta Sans, 64px, Extra Bold, kerning -0.04em).
  - **Subtítulo:** `A biblioteca visual de alta precisão para designers e desenvolvedores. Reúna sites, capturas, interfaces e códigos em um ateliê privado.`
  - **CTA Primário:** Botão em Azul Cobalto (`#4355DB`), cantos arredondados de 8px, label `Começar Gratuitamente`.
  - **Microcopy de Confiança:** `100% Gratuito • Sem cartão • Nuvem Supabase`.
  - **Product Teaser:** Browser frame desktop peeking a partir da base, exibindo 3 cartões reais de referências (Linear UI, Kinfolk Architecture e Swiss Specimen).

---

### Seção 02: O Problema (Caos vs. Clareza)
- **Dimensões:** 1440px × 600px
- **Arquivo Vectorial:** `section-02-problem.svg`
- **Fundo:** Branco Puro (`#FFFFFF`) com linha divisória superior hairline (`#E7E7E5`)
- **Elementos:**
  - **Tag:** `O PROBLEMA QUE RESOLVEMOS` (JetBrains Mono, 11px, Bold, vermelho suave `#EF4444`).
  - **Título (H2):** `Suas referências criativas estão dispersas.`
  - **Grid de 3 Cartões Comparativos:**
    1. *Abas Infinitas:* 40 abas abertas que causam lentidão e se perdem na reinicialização do navegador.
    2. *Prints Sem Contexto:* Arquivos soltos na pasta Downloads sem URL, tags ou anotações explicativas.
    3. *A Solução Salvei:* Ateliê unificado com visualização imediata, metadados preservados e atalhos rápidos.

---

### Seção 03: Fluxo Operacional Essencial (3 Tempos)
- **Dimensões:** 1440px × 700px
- **Arquivo Vectorial:** `section-03-workflow.svg`
- **Fundo:** Off-white (`#F8F8F6`)
- **Elementos:**
  - **Tag:** `FLUXO OPERACIONAL ESSENCIAL` (Azul Cobalto).
  - **Título (H2):** `Simples de capturar. Impossível de esquecer.`
  - **Cards dos 3 Passos:**
    1. **01 Salvar:** Captura de links com extração instantânea de OG tags ou drag-and-drop de imagens com suporte a Ctrl+V.
    2. **02 Organizar:** Projetos temáticos, coleções com mosaicos dinâmicos e etiquetas taxonômicas inteligentes.
    3. **03 Encontrar:** Navegação rápida via tecla `/` ou modal `Cmd+K` sem recarregar a página.

---

### Seção 04: Recursos Projetados para Quem Cria
- **Dimensões:** 1440px × 800px
- **Arquivo Vectorial:** `section-04-features.svg`
- **Fundo:** Branco Puro (`#FFFFFF`)
- **Elementos:**
  - **Tag:** `RECURSOS PROJETADOS PARA QUEM CRIA`
  - **Título (H2):** `Ferramentas cirúrgicas para o fluxo diário.`
  - **Grid 2×2 de Cartões de Funcionalidades:**
    1. *Captura por URL ou Clipboard:* Detecção automática de domínio, favicon e screenshots em alta resolução.
    2. *Coleções & Mosaicos Dinâmicos:* Curadoria com respeito à proporção geométrica nativa de cada arquivo.
    3. *Tags Transversais & Notas Markdown:* Campos para anotações conceituais, paletas de cores HEX e trechos de código Tailwind CSS.
    4. *Quick Search & Atalhos Cmd+K:* Localização de referências em menos de 100ms via teclado.

---

### Seção 05: Curadoria Multidisciplinar (Galeria Visual)
- **Dimensões:** 1440px × 850px
- **Arquivo Vectorial:** `section-05-inspiration.svg`
- **Fundo:** Off-white (`#F8F8F6`)
- **Elementos:**
  - **Tag:** `CURADORIA MULTIDISCIPLINAR`
  - **Título (H2):** `Do código à arquitetura: eleve o nível visual do seu time.`
  - **Mosaico Assimétrico de 3 Colunas com Imagens Reais:**
    - *Coluna 1:* Arquitetura Minimalista (`editorial-architecture-01.jpg`) + Design Tokens Spec (`digital-design-system-spec-02.jpg`).
    - *Coluna 2:* Interface Linear em Dark Mode vertical estendida (`digital-interface-grid-01.jpg`).
    - *Coluna 3:* Tipografia Impressa em Baixo Relevo (`editorial-typography-print-02.jpg`) + Ateliê Híbrido Still Life (`hybrid-studio-still-01.jpg`).

---

### Seção 06: Chamada Final & Rodapé
- **Dimensões:** 1440px × 600px
- **Arquivo Vectorial:** `section-06-closing-cta.svg`
- **Fundo:** Grafite Intenso (`#171717`) com degradê radial cobalto suave no centro
- **Elementos:**
  - Símbolo S-Prism em alto contraste.
  - **Título:** `Pronto para dar um lar às suas referências?` (Branco, 52px).
  - **Subtítulo:** `Crie sua conta em 30 segundos. Comece a capturar inspirações e acerte na próxima entrega.`
  - **Botão Primário:** `Começar Gratuitamente` (Cobalto `#4355DB`).
  - **Garantia:** `Sem cobranças. Sem planos falsos. Totalmente funcional.`
  - **Rodapé:** Divisor hairline sutil e créditos com link para o produto: `© 2026 SALVEI • UMA BIBLIOTECA VISUAL PARA SUAS PRÓXIMAS IDEIAS • HTTPS://SALVEI.TECH`.

---

## 2. Canvas Completo Contínuo

- **Arquivo Vectorial Integrado:** `landing-page-full-direction-board.svg`
- **Dimensões Totais:** 1440px × 4450px
- **Utilidade:** Permite arrastar e soltar um único arquivo diretamente na tela do Figma para ter a visão vertical contínua completa de ponta a ponta da landing page.

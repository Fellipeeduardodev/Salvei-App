import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve('public/brand/hero-variations');
const tempHtmlDir = path.resolve('scripts/temp_templates');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(tempHtmlDir)) fs.mkdirSync(tempHtmlDir, { recursive: true });

function getBase64(relPath, mimeType = 'image/jpeg') {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) return '';
  const data = fs.readFileSync(fullPath).toString('base64');
  return `data:${mimeType};base64,${data}`;
}

const IMGS = {
  linear: getBase64('brand-assets/04-image-assets/digital-references/digital-interface-grid-01.jpg'),
  designSystem: getBase64('brand-assets/04-image-assets/digital-references/digital-design-system-spec-02.jpg'),
  architecture: getBase64('brand-assets/04-image-assets/editorial-references/editorial-architecture-01.jpg'),
  typography: getBase64('brand-assets/04-image-assets/editorial-references/editorial-typography-print-02.jpg'),
  hybrid: getBase64('brand-assets/04-image-assets/hybrid-compositions/hybrid-studio-still-01.jpg'),
  texture: getBase64('brand-assets/04-image-assets/auxiliary-graphics/og-background-texture-1200x630.jpg'),
};

// Common CSS styles & components
const COMMON_HEAD = `
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      background: #F8F8F6;
      color: #171717;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      position: relative;
    }
    .font-display { font-family: 'Outfit', sans-serif; }
    .font-headline { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    
    /* SVGs */
    .icon { display: inline-block; vertical-align: middle; stroke-width: 1.8; stroke: currentColor; fill: none; }
  </style>
`;

// Helper for card HTML
function renderCard({ img, title, domain, tags, dark = false }) {
  return `
    <div style="background:#FFFFFF; border:1px solid #E7E7E5; border-radius:10px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 4px 16px rgba(15,23,42,0.04);">
      <div style="width:100%; aspect-ratio:16/9.5; background:#191B20; overflow:hidden; position:relative;">
        <img src="${img}" style="width:100%; height:100%; object-fit:cover; display:block;" />
      </div>
      <div style="padding:14px 16px 16px; display:flex; flex-direction:column; gap:8px;">
        <h4 style="font-family:'Plus Jakarta Sans','Inter',sans-serif; font-weight:700; font-size:14px; line-height:1.3; color:#171717; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${title}
        </h4>
        <div style="font-family:'JetBrains Mono',monospace; font-size:11px; color:#4355DB; font-weight:500;">
          ${domain}
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:5px; margin-top:2px;">
          ${tags.map(t => `<span style="font-family:'JetBrains Mono',monospace; font-size:9.5px; padding:3px 7px; background:#F8F8F6; border:1px solid #E7E7E5; border-radius:4px; color:#737373;">#${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// 1. TEMPLATE: hero-01-floating-product
function getHtml01() {
  return `<!DOCTYPE html>
  <html>
  <head>
    ${COMMON_HEAD}
    <style>
      body {
        background: radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F0F3F9 60%, #E6EBF5 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: 2500px;
      }
      .ambient-glow {
        position: absolute;
        width: 1000px;
        height: 600px;
        top: 240px;
        left: 460px;
        background: radial-gradient(ellipse at center, rgba(67, 85, 219, 0.12) 0%, rgba(219, 234, 254, 0.25) 45%, transparent 70%);
        filter: blur(80px);
        pointer-events: none;
      }
      .window-chassis {
        width: 1440px;
        height: 890px;
        background: #F8F8F6;
        border-radius: 20px;
        border: 1px solid rgba(231, 231, 229, 0.9);
        box-shadow: 
          0 2px 6px rgba(15, 23, 42, 0.04),
          0 20px 40px -10px rgba(15, 23, 42, 0.12),
          0 45px 100px -20px rgba(15, 23, 42, 0.20);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: rotateX(4deg) rotateY(-5.5deg) rotateZ(0.8deg);
        transform-style: preserve-3d;
      }
      .browser-bar {
        height: 48px;
        background: #FFFFFF;
        border-bottom: 1px solid #E7E7E5;
        display: flex;
        align-items: center;
        padding: 0 20px;
        gap: 16px;
      }
      .dots { display: flex; gap: 7px; }
      .dot { width: 11px; height: 11px; border-radius: 50%; }
      .url-bar {
        margin: 0 auto;
        width: 480px;
        height: 28px;
        background: #F8F8F6;
        border: 1px solid #E7E7E5;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #171717;
      }
      .app-layout {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      .sidebar {
        width: 240px;
        background: #FFFFFF;
        border-right: 1px solid #E7E7E5;
        display: flex;
        flex-direction: column;
        padding: 20px 16px;
        gap: 24px;
      }
      .logo-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-left: 4px;
      }
      .nav-menu {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        color: #737373;
      }
      .nav-item.active {
        background: #F1F1EF;
        color: #171717;
        font-weight: 600;
      }
      .main-stage {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #F8F8F6;
      }
      .topbar {
        height: 56px;
        background: #FFFFFF;
        border-bottom: 1px solid #E7E7E5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 420px;
        height: 36px;
        background: #F8F8F6;
        border: 1px solid #E7E7E5;
        border-radius: 8px;
        padding: 0 12px;
        font-size: 13px;
        color: #737373;
      }
      .content-area {
        padding: 28px 32px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .header-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
      }
      .filters-row {
        display: flex;
        gap: 8px;
      }
      .filter-chip {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 6px;
        background: #FFFFFF;
        border: 1px solid #E7E7E5;
        color: #171717;
      }
      .filter-chip.active {
        background: #171717;
        color: #FFFFFF;
        border-color: #171717;
      }
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .floating-pill {
        position: absolute;
        bottom: 70px;
        right: 180px;
        background: #171717;
        color: #FFFFFF;
        padding: 10px 18px;
        border-radius: 9999px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 16px 36px -6px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.15);
        z-index: 50;
      }
    </style>
  </head>
  <body>
    <div class="ambient-glow"></div>

    <div class="window-chassis">
      <!-- Browser Top -->
      <div class="browser-bar">
        <div class="dots">
          <div class="dot" style="background:#FF5F56;"></div>
          <div class="dot" style="background:#FFBD2E;"></div>
          <div class="dot" style="background:#27C93F;"></div>
        </div>
        <div class="url-bar">
          <span style="display:flex; align-items:center; gap:6px;">
            <svg class="icon" style="width:12px; height:12px; stroke:#22c55e;" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            https://salvei.tech/app
          </span>
          <span style="color:#737373; font-size:10px;">[ WORKSPACE ATIVO ]</span>
        </div>
        <div style="width:50px;"></div>
      </div>

      <!-- App Interior -->
      <div class="app-layout">
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="logo-box">
            <div style="width:28px; height:28px; background:#171717; border-radius:7px; display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:800; font-family:'Plus Jakarta Sans'; font-size:15px; position:relative;">
              S<span style="position:absolute; top:3px; right:3px; width:4px; height:4px; border-radius:50%; background:#4355DB;"></span>
            </div>
            <span style="font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:18px; letter-spacing:-0.03em; color:#171717;">salve<span style="position:relative;">ı<span style="position:absolute; top:-2px; right:0; width:4px; height:4px; border-radius:50%; background:#4355DB;"></span></span></span>
          </div>

          <div class="nav-menu">
            <div class="nav-item active">
              <span style="display:flex; align-items:center; gap:9px;">
                <svg class="icon" style="width:15px; height:15px; stroke:#4355DB;" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                Caixa de entrada
              </span>
              <span class="font-mono" style="font-size:10px; background:#EDEDEA; padding:1px 6px; border-radius:4px; font-weight:600;">24</span>
            </div>
            <div class="nav-item">
              <span style="display:flex; align-items:center; gap:9px;">
                <svg class="icon" style="width:15px; height:15px;" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                Projetos
              </span>
              <span class="font-mono" style="font-size:10px; color:#A8A8A6;">6</span>
            </div>
            <div class="nav-item">
              <span style="display:flex; align-items:center; gap:9px;">
                <svg class="icon" style="width:15px; height:15px;" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                Coleções
              </span>
              <span class="font-mono" style="font-size:10px; color:#A8A8A6;">12</span>
            </div>
            <div class="nav-item">
              <span style="display:flex; align-items:center; gap:9px;">
                <svg class="icon" style="width:15px; height:15px;" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                Etiquetas
              </span>
            </div>
            <div class="nav-item" style="margin-top:auto;">
              <span style="display:flex; align-items:center; gap:9px;">
                <svg class="icon" style="width:15px; height:15px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Configurações
              </span>
            </div>
          </div>
        </div>

        <!-- Main Stage -->
        <div class="main-stage">
          <div class="topbar">
            <div class="search-box">
              <svg class="icon" style="width:15px; height:15px;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Pesquisar referências, tags ou domínios...</span>
              <span class="font-mono" style="margin-left:auto; font-size:10px; background:#FFFFFF; border:1px solid #E7E7E5; padding:2px 6px; border-radius:4px;">Cmd+K</span>
            </div>

            <div style="display:flex; align-items:center; gap:14px;">
              <button style="background:#4355DB; color:#FFFFFF; border:none; padding:8px 16px; border-radius:8px; font-weight:600; font-size:13px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                <svg class="icon" style="width:14px; height:14px; stroke:#FFF;" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Adicionar referência
              </button>
              <div style="width:32px; height:32px; border-radius:50%; background:#171717; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:700; font-size:12px;">
                FE
              </div>
            </div>
          </div>

          <div class="content-area">
            <div class="header-row">
              <div style="display:flex; align-items:baseline; gap:12px;">
                <h1 style="font-family:'Outfit',sans-serif; font-size:26px; font-weight:800; letter-spacing:-0.02em;">Caixa de entrada</h1>
                <span class="font-mono" style="font-size:12px; color:#737373;">[ 24 referências curadas ]</span>
              </div>
              <div class="filters-row">
                <span class="filter-chip active">Todas (24)</span>
                <span class="filter-chip">#interface</span>
                <span class="filter-chip">#editorial</span>
                <span class="filter-chip">#dark-mode</span>
                <span class="filter-chip">#design-system</span>
              </div>
            </div>

            <div class="cards-grid">
              ${renderCard({
                img: IMGS.linear,
                title: 'Linear Modern Product Workspace',
                domain: 'linear.app • UI / UX Benchmark',
                tags: ['interface', 'dark-mode', 'saas-2026']
              })}
              ${renderCard({
                img: IMGS.architecture,
                title: 'Ateliê de Concreto & Luz Rasante',
                domain: 'kinfolk.com • Arquitetura & Forma',
                tags: ['editorial', 'fotografia', 'composicao']
              })}
              ${renderCard({
                img: IMGS.hybrid,
                title: 'Swiss Design Specimen & Grid Tablet',
                domain: 'are.na/fellipe • Tipografia Híbrida',
                tags: ['tipografia', 'estudio', 'benchmarks']
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Badge -->
    <div class="floating-pill">
      <span style="width:7px; height:7px; border-radius:50%; background:#4355DB;"></span>
      <span>ATALHO RÁPIDO [ CMD+K ]</span>
    </div>
  </body>
  </html>`;
}

// 2. TEMPLATE: hero-02-editorial-showcase
function getHtml02() {
  return `<!DOCTYPE html>
  <html>
  <head>
    ${COMMON_HEAD}
    <style>
      body {
        background: #F8F8F6;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 50px 80px;
        gap: 40px;
      }
      .editorial-left {
        width: 1040px;
        height: 860px;
        background: #FFFFFF;
        border-radius: 18px;
        border: 1px solid #E7E7E5;
        box-shadow: 0 30px 80px -20px rgba(15, 23, 42, 0.10);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .editorial-right {
        width: 680px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .callout-box {
        background: #FFFFFF;
        border-radius: 14px;
        border: 1px solid #E7E7E5;
        box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.12);
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .tag-lead {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.14em;
        color: #4355DB;
        text-transform: uppercase;
      }
      .swatches-row {
        display: flex;
        gap: 10px;
      }
      .swatch {
        flex: 1;
        height: 48px;
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,0.06);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <!-- Left Main Stage Window -->
    <div class="editorial-left">
      <!-- Window Top Bar -->
      <div style="height:48px; background:#F8F8F6; border-bottom:1px solid #E7E7E5; display:flex; align-items:center; padding:0 18px; gap:12px;">
        <div style="display:flex; gap:6px;">
          <div style="width:10px; height:10px; border-radius:50%; background:#FF5F56;"></div>
          <div style="width:10px; height:10px; border-radius:50%; background:#FFBD2E;"></div>
          <div style="width:10px; height:10px; border-radius:50%; background:#27C93F;"></div>
        </div>
        <div style="font-family:'JetBrains Mono'; font-size:11px; color:#737373; margin-left:10px;">
          workspace.salvei.tech • [ BIBLIOTECA EDITORIAL ]
        </div>
      </div>

      <!-- Content Grid -->
      <div style="padding:28px; flex:1; display:flex; flex-direction:column; gap:22px; background:#FFFFFF;">
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <div>
            <h2 style="font-family:'Outfit'; font-size:24px; font-weight:800;">Caixa de entrada</h2>
            <p style="font-family:'Inter'; font-size:12px; color:#737373; margin-top:3px;">Referências com metadados e paletas extraídas automaticamente.</p>
          </div>
          <span style="font-family:'JetBrains Mono'; font-size:11px; padding:4px 10px; background:#F8F8F6; border:1px solid #E7E7E5; border-radius:6px; color:#171717; font-weight:600;">
            24 ITENS
          </span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:18px;">
          ${renderCard({
            img: IMGS.linear,
            title: 'Linear Modern Product Workspace',
            domain: 'linear.app • UI / UX Benchmark',
            tags: ['interface', 'dark-mode', 'saas-2026']
          })}
          ${renderCard({
            img: IMGS.architecture,
            title: 'Ateliê de Concreto & Luz Rasante',
            domain: 'kinfolk.com • Arquitetura & Forma',
            tags: ['editorial', 'fotografia', 'composicao']
          })}
        </div>
      </div>
    </div>

    <!-- Right Column: 3 Editorial Zoom Callouts -->
    <div class="editorial-right">
      <!-- Callout 1: Paleta e Inspeção -->
      <div class="callout-box">
        <div class="tag-lead">01 // INSPEÇÃO DE PALETA &amp; FORMA</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:'Plus Jakarta Sans'; font-size:16px; font-weight:700;">Linear UI Color Harmonics</h3>
          <span style="font-family:'JetBrains Mono'; font-size:10px; color:#22c55e;">READY</span>
        </div>
        <p style="font-size:12px; color:#737373; line-height:1.5;">
          Amostragem cromática extraída da captura visual para exportação direta em tokens CSS.
        </p>
        <div class="swatches-row">
          <div class="swatch" style="background:#171717; color:#FFFFFF;">#171717</div>
          <div class="swatch" style="background:#4355DB; color:#FFFFFF;">#4355DB</div>
          <div class="swatch" style="background:#F8F8F6; color:#171717;">#F8F8F6</div>
          <div class="swatch" style="background:#E7E7E5; color:#171717;">#E7E7E5</div>
        </div>
      </div>

      <!-- Callout 2: Tailwind Snippet -->
      <div class="callout-box" style="background:#171717; border-color:#2D3139; color:#FFFFFF;">
        <div class="tag-lead" style="color:#6375F1;">02 // SNIPPET TÉCNICO EXECUTÁVEL</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'JetBrains Mono'; font-size:12px; font-weight:600; color:#F3F4F6;">tailwind.config.css</span>
          <span style="font-family:'JetBrains Mono'; font-size:10px; color:#A8A8A6; border:1px solid #333; padding:2px 6px; border-radius:4px;">COPIAR</span>
        </div>
        <div style="font-family:'JetBrains Mono'; font-size:11px; line-height:1.6; color:#D1D5DB; background:#1F232B; padding:12px; border-radius:8px; border:1px solid #2D3139;">
          <span style="color:#6375F1;">grid</span> grid-cols-1 md:grid-cols-3<br>
          gap-4 bg-[#F8F8F6] p-6<br>
          <span style="color:#9CA3AF;">border border-[#E7E7E5]</span><br>
          <span style="color:#6375F1;">dark:bg-[#191B20]</span>
        </div>
      </div>

      <!-- Callout 3: Mosaico de Coleção -->
      <div class="callout-box">
        <div class="tag-lead">03 // CURADORIAS TEMÁTICAS</div>
        <h4 style="font-family:'Plus Jakarta Sans'; font-size:15px; font-weight:700;">Editorial &amp; Grids Suíços</h4>
        <div style="width:100%; height:90px; border-radius:8px; overflow:hidden; display:flex; gap:2px;">
          <img src="${IMGS.designSystem}" style="width:33.33%; height:100%; object-fit:cover;" />
          <img src="${IMGS.hybrid}" style="width:33.33%; height:100%; object-fit:cover;" />
          <img src="${IMGS.typography}" style="width:33.33%; height:100%; object-fit:cover;" />
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-family:'JetBrains Mono'; font-size:10.5px; color:#737373; margin-top:2px;">
          <span>[ 28 REFERÊNCIAS ]</span>
          <span style="color:#4355DB; font-weight:600;">VER ACERVO →</span>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

// 3. TEMPLATE: hero-03-layered-interface
function getHtml03() {
  return `<!DOCTYPE html>
  <html>
  <head>
    ${COMMON_HEAD}
    <style>
      body {
        background: radial-gradient(circle at 60% 40%, #FFFFFF 0%, #EEF2F8 60%, #E2E8F4 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .base-layer {
        width: 1400px;
        height: 840px;
        background: #FFFFFF;
        border-radius: 18px;
        border: 1px solid #E7E7E5;
        box-shadow: 0 20px 60px -15px rgba(15,23,42,0.10);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        filter: blur(0.5px);
        transform: scale(0.97) translateX(-40px);
      }
      .drawer-layer {
        position: absolute;
        right: 180px;
        top: 140px;
        width: 480px;
        height: 800px;
        background: #FFFFFF;
        border-radius: 18px;
        border: 1px solid #E7E7E5;
        box-shadow: 0 35px 90px -15px rgba(15,23,42,0.22);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 20;
      }
      .modal-layer {
        position: absolute;
        left: 280px;
        top: 260px;
        width: 620px;
        background: #FFFFFF;
        border-radius: 16px;
        border: 1px solid #E7E7E5;
        box-shadow: 0 40px 100px -20px rgba(15,23,42,0.30);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 30;
      }
    </style>
  </head>
  <body>
    <!-- Plane 1: Base Application Library -->
    <div class="base-layer">
      <div style="height:48px; background:#F8F8F6; border-bottom:1px solid #E7E7E5; display:flex; align-items:center; padding:0 20px; gap:8px;">
        <div style="width:10px; height:10px; border-radius:50%; background:#FF5F56;"></div>
        <div style="width:10px; height:10px; border-radius:50%; background:#FFBD2E;"></div>
        <div style="width:10px; height:10px; border-radius:50%; background:#27C93F;"></div>
        <span style="font-family:'JetBrains Mono'; font-size:11px; color:#737373; margin-left:14px;">Salvei — Workspace de Referências Web</span>
      </div>

      <div style="flex:1; display:flex;">
        <!-- Sidebar -->
        <div style="width:220px; background:#FFFFFF; border-right:1px solid #E7E7E5; padding:20px; display:flex; flex-direction:column; gap:12px;">
          <div style="font-family:'Plus Jakarta Sans'; font-weight:800; font-size:18px;">salveı</div>
          <div style="margin-top:16px; font-size:13px; font-weight:600; color:#4355DB;">Caixa de entrada [ 24 ]</div>
          <div style="font-size:13px; color:#737373;">Projetos</div>
          <div style="font-size:13px; color:#737373;">Coleções</div>
          <div style="font-size:13px; color:#737373;">Etiquetas</div>
        </div>

        <!-- Grid -->
        <div style="flex:1; padding:28px; background:#F8F8F6;">
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:18px;">
            ${renderCard({ img: IMGS.linear, title: 'Linear Modern Product Workspace', domain: 'linear.app', tags: ['interface', 'dark-mode'] })}
            ${renderCard({ img: IMGS.architecture, title: 'Ateliê de Concreto & Luz Rasante', domain: 'kinfolk.com', tags: ['editorial', 'arquitetura'] })}
            ${renderCard({ img: IMGS.hybrid, title: 'Swiss Design Specimen', domain: 'are.na/fellipe', tags: ['tipografia'] })}
          </div>
        </div>
      </div>
    </div>

    <!-- Plane 2: SidePanel Drawer (Middle Plane) -->
    <div class="drawer-layer">
      <div style="height:48px; border-bottom:1px solid #E7E7E5; display:flex; align-items:center; justify-content:space-between; padding:0 20px; background:#FAFAFA;">
        <span style="font-family:'JetBrains Mono'; font-size:11px; font-weight:700; color:#4355DB;">[ DETALHES DA REFERÊNCIA ]</span>
        <span style="font-family:'JetBrains Mono'; font-size:10px; color:#737373;">ESC PARA FECHAR</span>
      </div>
      <div style="padding:20px; display:flex; flex-direction:column; gap:16px; overflow-y:auto;">
        <div style="width:100%; aspect-ratio:16/10; border-radius:10px; overflow:hidden; border:1px solid #E7E7E5;">
          <img src="${IMGS.linear}" style="width:100%; height:100%; object-fit:cover;" />
        </div>
        <div>
          <h3 style="font-family:'Plus Jakarta Sans'; font-size:18px; font-weight:800;">Linear Modern UI</h3>
          <p style="font-family:'JetBrains Mono'; font-size:11.5px; color:#4355DB; margin-top:2px;">https://linear.app</p>
        </div>
        <div style="padding:12px; background:#F8F8F6; border-radius:8px; border:1px solid #E7E7E5;">
          <span style="font-family:'JetBrains Mono'; font-size:9.5px; font-weight:700; color:#737373;">NOTAS DO DESIGNER:</span>
          <p style="font-size:12px; color:#171717; margin-top:4px; line-height:1.4;">
            Grades modulares de 8px com contrastes de borda suaves para evitar fadiga visual em monitores amplos.
          </p>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <span style="font-family:'JetBrains Mono'; font-size:10px; padding:3px 8px; background:#F1F1EF; border-radius:4px;">#interface</span>
          <span style="font-family:'JetBrains Mono'; font-size:10px; padding:3px 8px; background:#F1F1EF; border-radius:4px;">#dark-mode</span>
          <span style="font-family:'JetBrains Mono'; font-size:10px; padding:3px 8px; background:#F1F1EF; border-radius:4px;">#saas-2026</span>
        </div>
      </div>
    </div>

    <!-- Plane 3: Command Palette / Quick Search (Foreground Layer) -->
    <div class="modal-layer">
      <div style="padding:16px 20px; border-bottom:1px solid #E7E7E5; display:flex; align-items:center; gap:12px;">
        <svg class="icon" style="width:18px; height:18px; stroke:#4355DB;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span style="font-size:15px; font-weight:500; color:#171717;">design system</span>
        <span style="margin-left:auto; font-family:'JetBrains Mono'; font-size:10.5px; color:#737373; background:#F8F8F6; border:1px solid #E7E7E5; padding:2px 8px; border-radius:4px;">3 RESULTADOS</span>
      </div>
      <div style="padding:10px 12px; display:flex; flex-direction:column; gap:4px;">
        <div style="padding:10px 14px; background:#F1F1EF; border-radius:8px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <svg class="icon" style="width:14px; height:14px; stroke:#4355DB;" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <span style="font-size:13.5px; font-weight:600; color:#171717;">Design System Tokens &amp; Modular Grid</span>
          </div>
          <span style="font-family:'JetBrains Mono'; font-size:10px; color:#737373;">designsystems.io</span>
        </div>
        <div style="padding:10px 14px; border-radius:8px; display:flex; align-items:center; justify-content:space-between;">
          <div style="display:flex; align-items:center; gap:10px;">
            <svg class="icon" style="width:14px; height:14px; stroke:#737373;" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span style="font-size:13.5px; color:#171717;">Linear Modern Product Workspace</span>
          </div>
          <span style="font-family:'JetBrains Mono'; font-size:10px; color:#737373;">linear.app</span>
        </div>
      </div>
      <div style="height:36px; background:#F8F8F6; border-top:1px solid #E7E7E5; display:flex; align-items:center; justify-content:space-between; padding:0 16px; font-family:'JetBrains Mono'; font-size:10px; color:#737373;">
        <span>NAVEGAR: [ ↑ ↓ ]</span>
        <span>SELECIONAR: [ ENTER ]</span>
      </div>
    </div>
  </body>
  </html>`;
}

// 4. TEMPLATE: hero-04-immersive-library
function getHtml04() {
  return `<!DOCTYPE html>
  <html>
  <head>
    ${COMMON_HEAD}
    <style>
      body {
        background: #F8F8F6;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 60px;
        position: relative;
      }
      .toolbar {
        width: 1800px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .grid-container {
        width: 1800px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
    </style>
  </head>
  <body>
    <!-- Top Filter & Category Navigation -->
    <div class="toolbar">
      <div style="display:flex; align-items:baseline; gap:16px;">
        <h1 style="font-family:'Outfit'; font-size:28px; font-weight:800; letter-spacing:-0.03em;">Biblioteca Geral</h1>
        <span class="font-mono" style="font-size:12px; color:#4355DB; font-weight:600;">[ 142 REFERÊNCIAS CURADAS ]</span>
      </div>

      <div style="display:flex; gap:8px;">
        <span style="font-family:'JetBrains Mono'; font-size:11px; padding:6px 14px; background:#171717; color:#FFFFFF; border-radius:6px; font-weight:600;">Tudo (142)</span>
        <span style="font-family:'JetBrains Mono'; font-size:11px; padding:6px 14px; background:#FFFFFF; border:1px solid #E7E7E5; color:#171717; border-radius:6px;">#interface</span>
        <span style="font-family:'JetBrains Mono'; font-size:11px; padding:6px 14px; background:#FFFFFF; border:1px solid #E7E7E5; color:#171717; border-radius:6px;">#editorial</span>
        <span style="font-family:'JetBrains Mono'; font-size:11px; padding:6px 14px; background:#FFFFFF; border:1px solid #E7E7E5; color:#171717; border-radius:6px;">#tipografia</span>
        <span style="font-family:'JetBrains Mono'; font-size:11px; padding:6px 14px; background:#FFFFFF; border:1px solid #E7E7E5; color:#171717; border-radius:6px;">#dark-mode</span>
        <span style="font-family:'JetBrains Mono'; font-size:11px; padding:6px 14px; background:#FFFFFF; border:1px solid #E7E7E5; color:#171717; border-radius:6px;">#design-system</span>
      </div>
    </div>

    <!-- 4x2 Rich Curated Grid -->
    <div class="grid-container">
      ${renderCard({ img: IMGS.linear, title: 'Linear Modern Product Workspace', domain: 'linear.app • UI / UX', tags: ['interface', 'dark-mode'] })}
      ${renderCard({ img: IMGS.architecture, title: 'Ateliê de Concreto & Luz Rasante', domain: 'kinfolk.com • Editorial', tags: ['editorial', 'arquitetura'] })}
      ${renderCard({ img: IMGS.hybrid, title: 'Swiss Design Specimen & Tablet', domain: 'are.na/fellipe • Tipografia', tags: ['tipografia', 'estudio'] })}
      ${renderCard({ img: IMGS.designSystem, title: 'Design System Tokens & Grid', domain: 'designsystems.io • Tokens', tags: ['design-system', 'tokens'] })}
      ${renderCard({ img: IMGS.typography, title: 'Letterpress Typography on Cotton', domain: 'monotype.com • Tátil', tags: ['impressao', 'relevo'] })}
      ${renderCard({ img: IMGS.texture, title: 'Isometric Layered Reference Grid', domain: 'salvei.tech • Geometria', tags: ['identidade', 'grid'] })}
      ${renderCard({ img: IMGS.linear, title: 'Command Menu & Quick Shortcuts', domain: 'linear.app • Atalhos', tags: ['atalhos', 'cmd-k'] })}
      ${renderCard({ img: IMGS.architecture, title: 'Minimalist Spatial Harmony', domain: 'archdaily.com • Espaço', tags: ['minimalismo', 'luz'] })}
    </div>
  </body>
  </html>`;
}

// 5. TEMPLATE: hero-05-perspective-mockup
function getHtml05() {
  return `<!DOCTYPE html>
  <html>
  <head>
    ${COMMON_HEAD}
    <style>
      body {
        background: radial-gradient(circle at 50% 35%, #FFFFFF 0%, #EEF2F7 50%, #DEE4EE 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: 2200px;
      }
      .studio-desk {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 380px;
        background: linear-gradient(to top, rgba(200, 210, 225, 0.4) 0%, transparent 100%);
        pointer-events: none;
      }
      .mockup-frame {
        width: 1460px;
        height: 900px;
        background: #FFFFFF;
        border-radius: 24px;
        border: 1px solid rgba(220, 224, 230, 0.9);
        box-shadow: 
          0 1px 2px rgba(0, 0, 0, 0.04),
          0 20px 45px -10px rgba(15, 23, 42, 0.16),
          0 55px 120px -25px rgba(15, 23, 42, 0.28);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transform: rotateX(9deg) rotateY(-11deg) rotateZ(2deg);
        transform-style: preserve-3d;
      }
      .chassis-top {
        height: 50px;
        background: #F8F8F6;
        border-bottom: 1px solid #E7E7E5;
        display: flex;
        align-items: center;
        padding: 0 20px;
      }
      .url-capsule {
        margin: 0 auto;
        width: 520px;
        height: 30px;
        background: #FFFFFF;
        border: 1px solid #E7E7E5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        font-family: 'JetBrains Mono';
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <div class="studio-desk"></div>

    <div class="mockup-frame">
      <div class="chassis-top">
        <div style="display:flex; gap:7px;">
          <div style="width:11px; height:11px; border-radius:50%; background:#FF5F56;"></div>
          <div style="width:11px; height:11px; border-radius:50%; background:#FFBD2E;"></div>
          <div style="width:11px; height:11px; border-radius:50%; background:#27C93F;"></div>
        </div>
        <div class="url-capsule">
          <span style="display:flex; align-items:center; gap:6px; color:#171717;">
            <svg class="icon" style="width:12px; height:12px; stroke:#22c55e;" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            https://salvei.tech/app
          </span>
          <span style="font-size:10px; color:#737373;">WORKSPACE ATIVO</span>
        </div>
        <div style="width:50px;"></div>
      </div>

      <div style="flex:1; display:flex;">
        <!-- Sidebar -->
        <div style="width:230px; background:#FAFAFA; border-right:1px solid #E7E7E5; padding:22px; display:flex; flex-direction:column; gap:20px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:26px; height:26px; background:#171717; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:800; font-size:14px;">S</div>
            <span style="font-family:'Plus Jakarta Sans'; font-weight:800; font-size:18px;">salveı</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
            <div style="padding:8px 12px; background:#FFFFFF; border:1px solid #E7E7E5; border-radius:8px; font-weight:600; font-size:13px; color:#4355DB;">
              Caixa de entrada [ 24 ]
            </div>
            <div style="padding:8px 12px; font-size:13px; color:#737373;">Projetos (6)</div>
            <div style="padding:8px 12px; font-size:13px; color:#737373;">Coleções (12)</div>
            <div style="padding:8px 12px; font-size:13px; color:#737373;">Etiquetas</div>
          </div>
        </div>

        <!-- Main Workspace -->
        <div style="flex:1; padding:30px 36px; background:#FFFFFF; display:flex; flex-direction:column; gap:22px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h2 style="font-family:'Outfit'; font-size:26px; font-weight:800;">Caixa de entrada</h2>
              <p style="font-size:12px; color:#737373; margin-top:2px;">Organize suas capturas visuais em um ateliê privado.</p>
            </div>
            <button style="background:#4355DB; color:#FFFFFF; border:none; padding:8px 16px; border-radius:8px; font-weight:600; font-size:13px;">
              + Nova Referência
            </button>
          </div>

          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px;">
            ${renderCard({ img: IMGS.linear, title: 'Linear Modern Product Workspace', domain: 'linear.app', tags: ['interface', 'dark-mode'] })}
            ${renderCard({ img: IMGS.architecture, title: 'Ateliê de Concreto & Luz Rasante', domain: 'kinfolk.com', tags: ['editorial', 'arquitetura'] })}
            ${renderCard({ img: IMGS.hybrid, title: 'Swiss Design Specimen', domain: 'are.na/fellipe', tags: ['tipografia'] })}
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

// 6. TEMPLATE: hero-06-full-width-experience
function getHtml06() {
  return `<!DOCTYPE html>
  <html>
  <head>
    ${COMMON_HEAD}
    <style>
      body {
        background: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 60px;
      }
      .panoramic-canvas {
        width: 1800px;
        height: 980px;
        background: #F8F8F6;
        border-radius: 20px;
        border: 1px solid #E7E7E5;
        box-shadow: 0 25px 70px -15px rgba(15, 23, 42, 0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .nav-global {
        height: 56px;
        background: #FFFFFF;
        border-bottom: 1px solid #E7E7E5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
      }
    </style>
  </head>
  <body>
    <div class="panoramic-canvas">
      <div class="nav-global">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:28px; height:28px; background:#171717; border-radius:7px; display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:800; font-size:14px;">S</div>
          <span style="font-family:'Plus Jakarta Sans'; font-weight:800; font-size:20px; color:#171717;">salveı</span>
          <span style="font-family:'JetBrains Mono'; font-size:11px; color:#737373; margin-left:14px; border-left:1px solid #E7E7E5; padding-left:14px;">WORKSPACE DE DESIGN &amp; ENGENHARIA</span>
        </div>

        <div style="display:flex; align-items:center; gap:14px;">
          <div style="display:flex; align-items:center; gap:8px; padding:6px 14px; background:#F8F8F6; border:1px solid #E7E7E5; border-radius:8px; font-size:12px; color:#737373; width:340px;">
            <svg class="icon" style="width:13px; height:13px;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Buscar referências...</span>
            <span class="font-mono" style="margin-left:auto; font-size:10px; background:#FFF; border:1px solid #E7E7E5; padding:1px 5px; border-radius:4px;">Cmd+K</span>
          </div>
          <button style="background:#4355DB; color:#FFFFFF; border:none; padding:7px 16px; border-radius:8px; font-weight:600; font-size:12.5px;">
            + Adicionar
          </button>
        </div>
      </div>

      <div style="flex:1; display:flex;">
        <!-- Sidebar -->
        <div style="width:260px; background:#FFFFFF; border-right:1px solid #E7E7E5; padding:24px 20px; display:flex; flex-direction:column; gap:20px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <div style="padding:10px 14px; background:#F1F1EF; border-radius:8px; font-weight:600; font-size:13px; color:#171717; display:flex; justify-content:space-between;">
              <span>Caixa de entrada</span>
              <span class="font-mono" style="font-size:11px; color:#4355DB;">24</span>
            </div>
            <div style="padding:10px 14px; font-size:13px; color:#737373; display:flex; justify-content:space-between;">
              <span>Projetos</span>
              <span class="font-mono" style="font-size:11px;">6</span>
            </div>
            <div style="padding:10px 14px; font-size:13px; color:#737373; display:flex; justify-content:space-between;">
              <span>Coleções</span>
              <span class="font-mono" style="font-size:11px;">12</span>
            </div>
            <div style="padding:10px 14px; font-size:13px; color:#737373;">
              <span>Etiquetas</span>
            </div>
          </div>
        </div>

        <!-- Wide Stage Grid -->
        <div style="flex:1; padding:32px 40px; background:#F8F8F6; display:flex; flex-direction:column; gap:24px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline;">
            <div style="display:flex; align-items:baseline; gap:14px;">
              <h1 style="font-family:'Outfit'; font-size:28px; font-weight:800;">Caixa de entrada</h1>
              <span class="font-mono" style="font-size:12px; color:#737373;">[ 24 referências curadas ]</span>
            </div>
            <div style="display:flex; gap:8px;">
              <span class="font-mono" style="font-size:11px; padding:4px 10px; background:#171717; color:#FFF; border-radius:6px;">Todas (24)</span>
              <span class="font-mono" style="font-size:11px; padding:4px 10px; background:#FFF; border:1px solid #E7E7E5; border-radius:6px;">#interface</span>
              <span class="font-mono" style="font-size:11px; padding:4px 10px; background:#FFF; border:1px solid #E7E7E5; border-radius:6px;">#editorial</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:24px;">
            ${renderCard({ img: IMGS.linear, title: 'Linear Modern Product Workspace', domain: 'linear.app • UI / UX', tags: ['interface', 'dark-mode', 'saas-2026'] })}
            ${renderCard({ img: IMGS.architecture, title: 'Ateliê de Concreto & Luz Rasante', domain: 'kinfolk.com • Arquitetura', tags: ['editorial', 'fotografia', 'composicao'] })}
            ${renderCard({ img: IMGS.hybrid, title: 'Swiss Design Specimen & Grid Tablet', domain: 'are.na/fellipe • Tipografia', tags: ['tipografia', 'estudio', 'benchmarks'] })}
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

// Map of variations
const VARIATIONS = [
  { name: 'hero-01-floating-product', title: 'Floating Product', fn: getHtml01 },
  { name: 'hero-02-editorial-showcase', title: 'Editorial Showcase', fn: getHtml02 },
  { name: 'hero-03-layered-interface', title: 'Layered Interface', fn: getHtml03 },
  { name: 'hero-04-immersive-library', title: 'Immersive Library', fn: getHtml04 },
  { name: 'hero-05-perspective-mockup', title: 'Perspective Mockup', fn: getHtml05 },
  { name: 'hero-06-full-width-experience', title: 'Full-Width Experience', fn: getHtml06 },
];

async function captureVariation(v) {
  const htmlPath = path.join(tempHtmlDir, `${v.name}.html`);
  const outPng = path.join(outDir, `${v.name}.png`);
  
  // Write HTML file
  fs.writeFileSync(htmlPath, v.fn(), 'utf-8');
  console.log(`Generating ${v.name}...`);

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--user-data-dir=C:\\Users\\HondG\\AppData\\Local\\Temp\\edge-hero-gen',
    '--disable-extensions',
    '--hide-scrollbars',
    '--disable-gpu',
    fileUrl
  ]);

  await new Promise(r => setTimeout(r, 1200));

  try {
    const res = await fetch('http://127.0.0.1:9229/json');
    const tabs = await res.json();
    const tab = tabs.find(t => t.url.includes(v.name));
    if (!tab) throw new Error('Tab not found');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait for fonts and images to settle
    await new Promise(r => setTimeout(r, 1200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPng, Buffer.from(shot.data, 'base64'));
    console.log(`✓ Exported ${v.name}.png (${Math.round(shot.data.length / 1024)} KB)`);

  } finally {
    proc.kill();
  }
}

async function main() {
  console.log('=== GERANDO AS 6 VARIAÇÕES DA HERO DO SALVEI (1920x1080) ===\n');
  for (const v of VARIATIONS) {
    try {
      await captureVariation(v);
    } catch (e) {
      console.error(`Falha ao gerar ${v.name}:`, e.message);
    }
  }
  console.log('\nTodas as 6 variações foram geradas com sucesso!');
}

main();

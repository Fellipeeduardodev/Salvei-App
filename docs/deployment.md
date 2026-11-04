# GUIA DE PUBLICAÇÃO E DEPLOY — SALVEI

Este documento descreve o procedimento passo a passo para publicar o **Salvei** na **Vercel** conectado ao banco de dados serverless **Neon PostgreSQL**.

---

## 1. Pré-requisitos para Publicação

1. Uma conta ativa na [Vercel](https://vercel.com).
2. O banco de dados **Neon PostgreSQL** configurado (Projeto: `salvei`, região `aws-sa-east-1`).
3. O código do projeto compilando sem erros (`npm run build` e `npm test` aprovados).

---

## 2. Método 1: Deploy com Integração Git (Recomendado)

Esta é a abordagem mais segura e automatizada para ambientes de produção.

### Passo 1: Enviar alterações para o GitHub
```bash
git add .
git commit -m "feat: configure Neon serverless backend and clean legacy supabase"
git push origin main
```

### Passo 2: Importar ou Atualizar o Projeto na Vercel
1. Acesse o [Painel da Vercel](https://vercel.com/dashboard) e localize o projeto `Salvei-App`.
2. A Vercel detecta automaticamente o preset como **Vite**:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Passo 3: Configurar as Variáveis de Ambiente na Vercel
Na seção **Settings > Environment Variables**, adicione as seguintes variáveis:

| Nome da Variável | Valor de Exemplo | Descrição |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:senha@ep-...sa-east-1.aws.neon.tech/neondb?sslmode=require` | String de conexão com pooling do Neon |
| `DATABASE_URL_UNPOOLED` | `postgresql://neondb_owner:senha@ep-...sa-east-1.aws.neon.tech/neondb?sslmode=require` | Conexão direta sem pooling |
| `VITE_GEMINI_API_KEY` | `AQ.Ab8RN6...` | Chave de API Google Gemini para OCR |
| `RESEND_API_KEY` | `re_123456789...` | Chave de API do Resend (resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | `Salvei <ola@salvei.tech>` | Remetente com o domínio verificado `salvei.tech` |
| `APP_URL` | `https://salvei.tech` | URL canônica da aplicação |

> **Importante:** Marque essas variáveis para os ambientes **Production**, **Preview** e **Development**.

### Passo 4: Concluir o Deploy
A Vercel executará a compilação do Vite e disponibilizará o app no domínio oficial `https://salvei.tech` (ou `https://salve.tech`).

---

## 3. Arquitetura Serverless no Vercel + Neon

O Salvei utiliza uma arquitetura híbrida ultra-eficiente:

1. **Frontend SPA (Vite + React 19):**
   - Servido a partir do CDN global da Vercel com cache imutável de assets (`/assets/*`).
   - Roteamento SPA gerido pelo navegador (`index.html`).
2. **API Serverless (`api/[...path].ts`):**
   - Captura todas as requisições em `/api/*` (`/api/auth/*`, `/api/library`, `/api/references`, `/api/collections`, `/api/projects`, etc.).
   - Conecta-se diretamente ao Neon PostgreSQL através de `@neondatabase/serverless` (driver WebSocket/HTTP sem cold-start).
3. **Modo Convidado (Offline-First):**
   - Armazenado no `localStorage`/`IndexedDB` do cliente para navegação sem cadastro instantânea.

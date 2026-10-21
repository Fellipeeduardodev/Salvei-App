# GUIA DE PUBLICAÇÃO E DEPLOY — SALVEI

Este documento descreve o procedimento passo a passo para publicar o **Salvei** na **Vercel** conectado ao **Supabase Cloud**.

---

## 1. Pré-requisitos para Publicação

1. Uma conta ativa na [Vercel](https://vercel.com).
2. O projeto configurado no Supabase com as chaves de API (`URL` e `Publishable/Anon Key`).
3. O código do projeto compilando sem erros (`npm run build` e `npm test` aprovados).

---

## 2. Método 1: Deploy com Integração Git (Recomendado)

Esta é a abordagem mais segura e automatizada para ambientes de produção.

### Passo 1: Inicializar o Repositório e Enviar para o GitHub
```bash
git init
git add .
git commit -m "feat: release candidate - Salvei Fase 8"
git branch -M main
git remote add origin https://github.com/<SEU_USUARIO>/<SEU_REPOSITORIO>.git
git push -u origin main
```

### Passo 2: Importar o Projeto na Vercel
1. Acesse o [Painel da Vercel](https://vercel.com/dashboard) e clique em **"Add New..." > "Project"**.
2. Conecte sua conta do GitHub e selecione o repositório `Curator`.
3. A Vercel detectará automaticamente o framework como **Vite**:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build` (ou `tsc && vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Passo 3: Configurar as Variáveis de Ambiente na Vercel
Na seção **Environment Variables**, adicione as seguintes variáveis:

| Nome da Variável | Valor de Exemplo | Descrição |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://dnldulbmdmvscypvfjqj.supabase.co` | URL do seu projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` ou `eyJhbGciOi...` | Chave pública / Anon do Supabase |
| `VITE_SUPABASE_STORAGE_BUCKET` | `curator-media` | Nome do bucket privado de mídia |

> **Importante:** Marque essas variáveis para os ambientes **Production**, **Preview** e **Development**.

### Passo 4: Concluir o Deploy
Clique em **"Deploy"**. A Vercel executará a compilação do TypeScript e do Vite em ~30 segundos e fornecerá a URL pública oficial (ex: `https://salvei-<seu-time>.vercel.app` ou seu domínio próprio como `https://salvei.tech`).

---

## 3. Método 2: Deploy Direto via Vercel CLI

Se preferir realizar o deploy diretamente a partir do terminal de desenvolvimento:

### Passo 1: Efetuar Login na Vercel CLI
Execute o comando de autenticação no terminal:
```bash
npx vercel login
```
*Siga as instruções exibidas na tela para confirmar a autenticação no navegador.*

### Passo 2: Vincular e Configurar o Projeto
```bash
npx vercel link
```
*Responda às perguntas interativas confirmando o escopo da sua conta e o nome do projeto (`salvei`).*

### Passo 3: Adicionar as Variáveis de Ambiente via CLI
```bash
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
npx vercel env add VITE_SUPABASE_STORAGE_BUCKET production
```
*Informe os valores solicitados pelo prompt.*

### Passo 4: Executar o Deploy de Produção
```bash
npx vercel --prod
```
O CLI fará o upload dos arquivos, executará o build e retornará a URL oficial de produção.

---

## 4. Configuração Pós-Deploy no Supabase (Obrigatório)

Para que a autenticação (login, cadastro, confirmações e redefinição de senha) funcione corretamente na URL publicada:

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard).
2. Selecione o seu projeto e navegue até **Authentication > URL Configuration**.
3. No campo **Site URL**, informe a URL da sua aplicação publicada:
   ```
   https://salvei.tech
   ```
4. Em **Redirect URLs**, adicione:
   ```
   https://salvei.tech/**
   https://www.salvei.tech/**
   http://localhost:3000/**
   ```
5. Clique em **Save**.

---

## 5. Configuração de Domínio Próprio (Opcional)

Caso deseje vincular um domínio personalizado (ex: `app.meudominio.com`):
1. No painel da Vercel, acesse **Settings > Domains**.
2. Digite o domínio desejado e clique em **Add**.
3. Adicione o registro DNS do tipo `CNAME` apontando para `cname.vercel-dns.com` nas configurações do seu provedor de domínio (Cloudflare, GoDaddy, Registro.br, etc.).
4. Atualize o **Site URL** no painel do Supabase com o novo domínio customizado.

---

## 6. Verificação de Saúde Pós-Deploy

Após a publicação, execute este checklist de validação na URL pública:
- [ ] A aplicação abre na tela de login sem mensagens de variáveis ausentes.
- [ ] É possível cadastrar uma nova conta de teste com e-mail e senha.
- [ ] As referências são salvas e persistidas no Supabase Cloud.
- [ ] O upload de mídia é armazenado no bucket `curator-media` e exibido com Signed URL.
- [ ] Ao recarregar uma rota interna (ex: `/?view=collections`), a página não retorna erro 404.
- [ ] A navegação inferior mobile funciona sem cortes em celulares reais.

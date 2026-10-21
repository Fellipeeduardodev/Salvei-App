# CURATOR — Workspace Editorial de Referências Visuais

O **Curator** é uma aplicação web de alta performance voltada para curadoria visual, organização e catalogação de referências de design, interfaces digitais, tipografia e produtos web.

Construído com uma estética editorial minimalista (paleta `#171717`, `#F8F8F6`, acento azul cobalto `#4355DB`, âmbar `#F59E0B` e esmeralda `#22c55e`), o Curator combina a agilidade de ferramentas de teclado-first com uma experiência móvel nativa tipo aplicativo.

---

## 1. Arquitetura e Tecnologias

- **Frontend Core:** React 19, TypeScript 5.7, Vite 6.4.
- **Estilização e Design System:** Tailwind CSS v4, suporte nativo a áreas seguras móveis (`env(safe-area-inset-bottom)`).
- **Ícones:** Lucide React (espessuras ópticas entre 1.8 e 2.5).
- **Backend & Banco de Dados:** Supabase Cloud (PostgreSQL 15).
- **Segurança de Dados:** Row Level Security (RLS) estrito em todas as tabelas baseado em `auth.uid() = user_id`.
- **Armazenamento de Mídia:** Supabase Storage (bucket privado `curator-media` com isolamento por usuário e Signed URLs de expiração automática).
- **Autenticação:** Supabase Auth (E-mail e Senha) com feedback e validação integral em português brasileiro.
- **Testes Automatizados:** Vitest 5.0 (126 testes de unidade, integração, ciclo de vida e responsividade).

---

## 2. Pré-requisitos de Desenvolvimento

- **Node.js:** Versão 20.x ou superior (testado e homologado em Node v24).
- **Gerenciador de Pacotes:** `npm` (versão 10+).
- **Conta Supabase:** Projeto criado na nuvem com PostgreSQL e Storage habilitados.

---

## 3. Instalação e Configuração Local

### Passo 1: Clonar o Repositório e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd Curator
npm install
```

### Passo 2: Configurar as Variáveis de Ambiente
Copie o modelo de variáveis de ambiente:
```bash
cp .env.example .env.local
```

Abra `.env.local` e configure com as credenciais do seu projeto Supabase:
```env
# URL do projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública/anon (segura para o frontend com RLS ativado)
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-publica-aqui

# Nome do bucket de mídia no Supabase Storage
VITE_SUPABASE_STORAGE_BUCKET=curator-media
```

> **Atenção:** Nunca insira a chave `service_role` ou segredos de servidor no código cliente ou no arquivo `.env.local`.

---

## 4. Scripts e Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite (padrão em `http://localhost:3000`). |
| `npm run build` | Compila o projeto com validação prévia de tipos TypeScript (`tsc && vite build`). |
| `npm run typecheck` | Executa a verificação de tipagem TypeScript sem gerar bundles (`tsc --noEmit`). |
| `npm run preview` | Executa um servidor local servindo a pasta de produção compilada (`dist/`). |
| `npm test` | Executa toda a suíte de 126 testes automatizados com o Vitest. |

---

## 5. Estrutura do Banco de Dados (Supabase & RLS)

O Curator utiliza um modelo relacional normalizado protegido por políticas de segurança a nível de linha (RLS):

- `profiles`: Metadados públicos do usuário (sincronizados via Auth).
- `references`: Tabela principal com URL, domínio, título, notas em Markdown, status de captura e flag de favorito.
- `projects`: Projetos de curadoria com nome e descrição.
- `project_references`: Tabela de junção entre projetos e referências.
- `collections`: Coleções temáticas.
- `collection_references`: Tabela de junção entre coleções e referências.
- `tags`: Etiquetas únicas por usuário (com slug normalizado).
- `reference_tags`: Tabela de junção entre referências e tags.
- `reference_code_snippets`: Trechos de código associados a referências (com syntax highlight).
- `reference_attachments`: Arquivos e documentos anexados.

### Políticas de Segurança (Row Level Security):
Todas as tabelas contam com políticas que garantem que cada usuário só possa selecionar (`SELECT`), inserir (`INSERT`), atualizar (`UPDATE`) e excluir (`DELETE`) seus próprios registros (`auth.uid() = user_id`). Tentativas de acesso não autorizado são bloqueadas nativamente pelo PostgreSQL.

---

## 6. Configuração do Supabase Storage

1. Crie um bucket privado chamado `curator-media`.
2. Configure o limite de tamanho para 15 MB (`15728640 bytes`).
3. Mime-types aceitos: `image/*`, `application/pdf`, `application/json`, `text/css`.
4. Ative políticas RLS no bucket para que cada usuário acesse apenas a pasta identificada pelo seu UUID (`auth.uid()`).

---

## 7. Publicação em Produção (Vercel)

O projeto está otimizado para deploy na **Vercel** através do arquivo [`vercel.json`](file:///C:/Users/HondG/OneDrive/Área%20de%20Trabalho/Curator-app/Curator/vercel.json), que inclui:
- Regras de reescrita para rotas SPA (`rewrites: [ { "source": "/(.*)", "destination": "/index.html" } ]`).
- Cabeçalhos de segurança HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`).
- Política de cache imutável para assets estáticos com hash (`/assets/*`).

Para mais detalhes sobre publicação manual ou contínua via Git, consulte o arquivo [`DEPLOYMENT.md`](file:///C:/Users/HondG/OneDrive/Área%20de%20Trabalho/Curator-app/Curator/DEPLOYMENT.md).

---

## 8. Diagnóstico de Problemas e Soluções (Troubleshooting)

### A tela fica em "Verificando sessão do Curator..."
- **Causa:** As variáveis `VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` não foram definidas ou possuem valores inválidos.
- **Solução:** Verifique se `.env.local` contém as chaves corretas e reinicie o servidor com `npm run dev`.

### Falha ao carregar imagens salvas
- **Causa:** O bucket `curator-media` não foi criado ou as políticas de RLS de storage estão bloqueando o upload.
- **Solução:** Confirme se o bucket `curator-media` existe no painel do Supabase e se a pasta do upload inicia com o UUID do usuário autenticado.

### Erro de CORS na autenticação
- **Causa:** A URL da aplicação (ex: `https://meu-curator.vercel.app`) não foi adicionada na lista de URLs permitidas no Supabase.
- **Solução:** Acesse o painel do Supabase em **Authentication > URL Configuration > Redirect URLs** e adicione o domínio de produção.

---

## 9. Licença e Manutenção

Projeto desenvolvido sob padrões modernos de código limpo, componentização modular em React e conformidade com acessibilidade WCAG 2.2 AA.

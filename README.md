<p align="center">
  <img src="public/logo-lg.png" alt="RD Fitness Logo" width="200" />
</p>

<h1 align="center">RD Fitness</h1>

<p align="center">
  <strong>E-commerce completo de moda fitness com painel administrativo, pagamentos integrados e entrega via Uber Direct.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle" alt="Drizzle ORM" />
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Banco de Dados](#-banco-de-dados)
- [Painel Administrativo](#-painel-administrativo)
- [Integrações](#-integrações)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Deploy](#-deploy)

---

## 🎯 Sobre o Projeto

**RD Fitness** é uma plataforma de e-commerce moderna e completa, desenvolvida especificamente para o segmento de **moda fitness**. A aplicação oferece uma experiência de compra premium com design dark mode, sistema de variantes de produtos (cores, tamanhos, estoque), carrinho de compras inteligente, checkout com múltiplos gateways de pagamento e entrega automatizada via **Uber Direct**.

### Diferenciais

- 🛒 **Carrinho inteligente** com persistência no banco de dados vinculado ao usuário
- 🎨 **Variantes de produto** com múltiplas cores, tamanhos e controle de estoque por SKU
- 💳 **Duplo gateway de pagamento** — Mercado Pago + Stripe
- 🚚 **Entrega automatizada** via Uber Direct com cotação em tempo real e rastreamento
- 📦 **Painel admin completo** com dashboard de métricas, gestão de pedidos, produtos, categorias, promoções e clientes
- 🔐 **Autenticação robusta** com Better Auth (e-mail/senha + Google OAuth)
- ☁️ **Upload de imagens** para Cloudflare R2 via Better Upload
- 📱 **Design responsivo** mobile-first com tema dark premium
- 🔍 **Busca de produtos** com pesquisa em tempo real
- 📊 **Dashboard analítico** com receita, top produtos e últimos pedidos

---

## ✨ Funcionalidades

### Loja (Cliente)

| Funcionalidade | Descrição |
|---|---|
| **Catálogo de Produtos** | Listagem com filtro por categoria, mais vendidos e novos produtos |
| **Página de Produto** | Detalhes completos com galeria de imagens, seletor de cor/tamanho e preço com desconto |
| **Carrinho de Compras** | Sidebar com adição, remoção, ajuste de quantidade e cálculo automático de totais |
| **Busca** | Pesquisa de produtos por nome em tempo real |
| **Checkout** | Fluxo completo com seleção de endereço, cálculo de frete (Uber Direct) e pagamento |
| **Meus Pedidos** | Histórico de pedidos com status (pendente, pago, cancelado) |
| **Endereços** | CRUD completo de endereços de entrega com CPF/CNPJ |
| **Promoções** | Banner carrossel com promoções ativas na homepage |
| **Autenticação** | Login via Google OAuth ou e-mail/senha |

### Painel Administrativo

| Funcionalidade | Descrição |
|---|---|
| **Dashboard** | Visão geral com total de produtos, pedidos, receita e clientes |
| **Gestão de Produtos** | CRUD completo de produtos com variantes (cor, tamanho, preço, custo, estoque) |
| **Gestão de Categorias** | Criar, editar e excluir categorias com imagem |
| **Gestão de Pedidos** | Visualizar todos os pedidos, detalhes, atualizar status, solicitar entrega Uber |
| **Gestão de Promoções** | Criar e gerenciar banners promocionais (ativar/desativar) |
| **Gestão de Clientes** | Listagem de clientes cadastrados |
| **Upload de Imagens** | Upload drag-and-drop para Cloudflare R2 |
| **Top Produtos** | Ranking dos produtos mais vendidos baseado nos pedidos |

---

## 🛠 Tecnologias

### Core

| Tecnologia | Versão | Finalidade |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 | Framework React com App Router e Server Actions |
| [React](https://react.dev) | 19.2 | Biblioteca de UI com Server Components |
| [TypeScript](https://typescriptlang.org) | 5.x | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Estilização utility-first |

### Banco de Dados

| Tecnologia | Finalidade |
|---|---|
| [PostgreSQL](https://postgresql.org) | Banco de dados relacional |
| [Drizzle ORM](https://orm.drizzle.team) | ORM type-safe com queries relacionais |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Migrações e gerenciamento de schema |

### Autenticação

| Tecnologia | Finalidade |
|---|---|
| [Better Auth](https://better-auth.com) | Autenticação com e-mail/senha e Google OAuth |

### Pagamentos

| Tecnologia | Finalidade |
|---|---|
| [Mercado Pago](https://www.mercadopago.com.br/developers) | Gateway de pagamento principal (PIX, cartão, boleto) |
| [Stripe](https://stripe.com) | Gateway de pagamento alternativo |

### Entrega

| Tecnologia | Finalidade |
|---|---|
| [Uber Direct API](https://developer.uber.com/docs/deliveries) | Cotação de frete, criação e rastreamento de entregas |

### Storage

| Tecnologia | Finalidade |
|---|---|
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | Armazenamento de imagens de produtos |
| [Better Upload](https://better-upload.js.org) | Client/Server para upload de arquivos |
| [AWS SDK S3](https://aws.amazon.com/sdk-for-javascript/) | Client compatível com R2 |

### UI & Componentes

| Tecnologia | Finalidade |
|---|---|
| [shadcn/ui](https://ui.shadcn.com) | Componentes acessíveis e customizáveis (Dialog, Sheet, Tabs, Table, etc.) |
| [Radix UI](https://radix-ui.com) | Primitivos de UI acessíveis |
| [Lucide React](https://lucide.dev) | Biblioteca de ícones |
| [Embla Carousel](https://embla-carousel.com) | Carrossel de imagens com auto-scroll |
| [Sonner](https://sonner.emilkowal.dev) | Notificações toast |

### Formulários & Validação

| Tecnologia | Finalidade |
|---|---|
| [React Hook Form](https://react-hook-form.com) | Gerenciamento de formulários performático |
| [Zod](https://zod.dev) | Validação de schemas com inferência de tipos |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | Integração Zod + React Hook Form |

### State Management & Data Fetching

| Tecnologia | Finalidade |
|---|---|
| [TanStack React Query](https://tanstack.com/query) | Cache, mutations e invalidação de queries |
| [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) | Mutações server-side type-safe |

### Fontes & Tipografia

| Fonte | Uso |
|---|---|
| [Outfit](https://fonts.google.com/specimen/Outfit) | Fonte principal (corpo) |
| [Montserrat](https://fonts.google.com/specimen/Montserrat) | Títulos e headings |
| [Geist](https://vercel.com/font) | Código e monospace |

### Dev Tools

| Tecnologia | Finalidade |
|---|---|
| [ESLint](https://eslint.org) | Linting de código |
| [Prettier](https://prettier.io) | Formatação de código |
| [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) | Ordenação de classes Tailwind |
| [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort) | Ordenação automática de imports |
| [tsx](https://github.com/privatenumber/tsx) | Execução de scripts TypeScript (seed) |

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTE (Browser)                  │
│  React 19 · TanStack Query · React Hook Form · shadcn   │
└──────────────┬──────────────────────────────┬───────────┘
               │ Server Components            │ Mutations
               │ & RSC Streaming              │ (Server Actions)
┌──────────────▼──────────────────────────────▼───────────┐
│                   NEXT.JS 16 (App Router)               │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │  Pages   │  │  API     │  │  Server   │  │ Middle │ │
│  │ (SSR/RSC)│  │  Routes  │  │  Actions  │  │  ware  │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬───┘ │
└───────┼─────────────┼──────────────┼─────────────┼──────┘
        │             │              │             │
┌───────▼─────────────▼──────────────▼─────────────▼──────┐
│                    CAMADA DE DADOS                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │ Drizzle ORM │  │ Better Auth │  │ Better Upload    │ │
│  │ (PostgreSQL)│  │ (Sessions)  │  │ (Cloudflare R2)  │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘ │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
┌─────────▼────┐  ┌───────▼──────┐  ┌────────▼─────────┐
│  PostgreSQL  │  │ Google OAuth │  │  Cloudflare R2   │
└──────────────┘  └──────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  INTEGRAÇÕES EXTERNAS                    │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Mercado Pago │  │  Stripe  │  │   Uber Direct    │  │
│  │ (Pagamentos) │  │ (Pagam.) │  │  (Frete/Entrega) │  │
│  └──────────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
rd-fitness/
├── drizzle/                    # Migrações do banco de dados
├── public/                     # Assets estáticos (logos, banners)
├── src/
│   ├── actions/                # Server Actions (35+ ações)
│   │   ├── add-cart-product/       # Adicionar produto ao carrinho
│   │   ├── create-checkout-session/# Criar sessão de checkout
│   │   ├── create-product/         # Criar produto (admin)
│   │   ├── calculate-uber-quote/   # Cotação de frete Uber
│   │   ├── request-uber-delivery/  # Solicitar entrega Uber
│   │   ├── payment/                # Processamento de pagamento
│   │   ├── finish-order/           # Finalizar pedido
│   │   └── ...                     # + 28 outras ações
│   ├── app/                    # Rotas (App Router)
│   │   ├── page.tsx                # Homepage (catálogo)
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── globals.css             # Design system (light/dark)
│   │   ├── admin/                  # Painel administrativo
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── products/              # CRUD de produtos
│   │   │   ├── categories/            # CRUD de categorias
│   │   │   ├── orders/                # Gestão de pedidos
│   │   │   ├── promotions/            # Gestão de promoções
│   │   │   └── customers/             # Listagem de clientes
│   │   ├── authentication/         # Página de login
│   │   ├── product-variant/[slug]/ # Página de detalhe do produto
│   │   ├── cart/                   # Página do carrinho
│   │   ├── checkout/               # Fluxo de checkout
│   │   │   ├── pending/               # Pagamento pendente
│   │   │   ├── success/               # Pagamento confirmado
│   │   │   └── failure/               # Pagamento falhou
│   │   ├── category/               # Filtro por categoria
│   │   ├── search/                 # Resultados de busca
│   │   ├── my-orders/              # Histórico de pedidos
│   │   ├── addreses/               # Gerenciamento de endereços
│   │   └── api/                    # API Routes
│   │       ├── auth/                   # Better Auth handler
│   │       ├── mercadopago/            # Webhooks Mercado Pago
│   │       ├── stripe/                 # Webhooks Stripe
│   │       ├── uber/                   # Webhooks Uber Direct
│   │       ├── upload/                 # Upload de arquivos (R2)
│   │       └── shipping-address/       # API de endereços
│   ├── components/
│   │   ├── common/                 # Componentes compartilhados
│   │   │   ├── header.tsx              # Header com busca e menu
│   │   │   ├── cart.tsx                # Sidebar do carrinho
│   │   │   ├── carousel.tsx            # Carrossel de promoções
│   │   │   ├── product-item.tsx        # Card de produto
│   │   │   ├── product-list.tsx        # Lista de produtos
│   │   │   ├── category-selector.tsx   # Seletor de categorias
│   │   │   └── auth-google.tsx         # Dialog de login Google
│   │   ├── admin/                  # Componentes do admin
│   │   │   ├── admin-layout.tsx        # Layout com sidebar
│   │   │   ├── app-sidebar.tsx         # Sidebar de navegação
│   │   │   ├── create-product-form.tsx # Formulário de produto
│   │   │   └── ...
│   │   └── ui/                     # shadcn/ui (32 componentes)
│   ├── db/
│   │   ├── index.ts                # Instância do Drizzle
│   │   ├── schema.ts              # Schema completo do banco
│   │   └── seed.ts                # Seed com dados iniciais
│   ├── helpers/
│   │   └── money.ts               # Formatação de valores (BRL)
│   ├── hooks/
│   │   ├── queries/               # React Query hooks (GET)
│   │   ├── mutations/             # React Query hooks (POST/PUT/DELETE)
│   │   └── use-mobile.ts          # Hook de detecção mobile
│   ├── lib/
│   │   ├── auth.ts                # Configuração Better Auth
│   │   ├── auth-client.ts         # Client-side auth
│   │   ├── admin-auth.ts          # Validação de admin
│   │   ├── mercadopago.ts         # Client Mercado Pago
│   │   ├── uber.ts                # Client Uber Direct (OAuth2, cotação, entrega)
│   │   ├── cloudflare.ts          # Client Cloudflare R2
│   │   ├── delivery-trigger.ts    # Trigger automático de entrega
│   │   └── utils.ts               # Utilitários (cn)
│   └── providers/
│       └── react-query.tsx        # Provider do React Query
├── drizzle.config.ts              # Configuração Drizzle Kit
├── next.config.ts                 # Configuração Next.js
├── components.json                # Configuração shadcn/ui
├── package.json                   # Dependências
└── tsconfig.json                  # Configuração TypeScript
```

---

## 📋 Pré-requisitos

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 15 (ou serviço gerenciado como Neon, Supabase, Railway)
- **Conta Cloudflare** com R2 habilitado (para upload de imagens)
- **Conta Google Cloud** com OAuth 2.0 configurado (para login social)
- **Conta Mercado Pago** (para pagamentos)
- **Conta Stripe** (opcional, para pagamentos alternativos)
- **Conta Uber Direct** (opcional, para entregas automatizadas)

---

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/Augusto9237/rd-fitness.git
cd rd-fitness
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente)).

### 4. Execute as migrações do banco

```bash
npx drizzle-kit push
```

### 5. (Opcional) Popule o banco com dados de exemplo

```bash
npm run seed
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz com as seguintes variáveis:

```env
# ─── Banco de Dados ───────────────────────────────────
DATABASE_URL=postgresql://user:password@host:5432/rd_fitness

# ─── Better Auth ──────────────────────────────────────
BETTER_AUTH_SECRET=sua-chave-secreta
BETTER_AUTH_URL=http://localhost:3000

# ─── Google OAuth ─────────────────────────────────────
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# ─── Mercado Pago ─────────────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=seu-access-token

# ─── Stripe ───────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ─── Cloudflare R2 (Upload de Imagens) ───────────────
R2_ACCOUNT_ID=seu-account-id
R2_ACCESS_KEY_ID=sua-access-key
R2_SECRET_ACCESS_KEY=sua-secret-key

# ─── Uber Direct (Entregas) ──────────────────────────
UBER_CLIENT_ID=seu-uber-client-id
UBER_CLIENT_SECRET=seu-uber-client-secret
UBER_CUSTOMER_ID=seu-uber-customer-id
UBER_PICKUP_ADDRESS="Endereço da loja"
UBER_PICKUP_PHONE="+5511999999999"
UBER_PICKUP_LATITUDE=-23.550520
UBER_PICKUP_LONGITUDE=-46.633308
UBER_PICKUP_BUSINESS_NAME="RD Fitness"
UBER_PICKUP_CONTACT_NAME="Expedição"
UBER_WEBHOOK_SIGNING_KEY=sua-signing-key
```

---

## 🗄 Banco de Dados

### Modelo de Dados

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ ACCOUNT : has
    USER ||--o{ SHIPPING_ADDRESS : has
    USER ||--o| CART : has
    USER ||--o{ ORDER : places

    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ PRODUCT_VARIANT : has

    CART ||--o{ CART_ITEM : contains
    CART_ITEM }o--|| PRODUCT_VARIANT : references

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER_ITEM }o--|| PRODUCT_VARIANT : references
    ORDER }o--|| SHIPPING_ADDRESS : delivers_to

    PRODUCT_VARIANT {
        uuid id PK
        text name
        text color
        jsonb size_in_stock
        int cost_in_cents
        int price_in_cents
        int discount_price_in_cents
        text[] image_url
    }

    ORDER {
        uuid id PK
        enum status
        int total_price_in_cents
        int shipping_fee_in_cents
        text uber_quote_id
        text uber_delivery_id
        text payment_id
    }
```

### Tabelas Principais

| Tabela | Descrição |
|---|---|
| `user` | Usuários com role (user/admin) |
| `session` | Sessões de autenticação |
| `account` | Contas vinculadas (Google, e-mail) |
| `verification` | Tokens de verificação |
| `category` | Categorias de produto |
| `product` | Produtos do catálogo |
| `product_variant` | Variantes (cor, tamanho, estoque, preço, imagens) |
| `cart` | Carrinho vinculado ao usuário |
| `cart_item` | Itens do carrinho |
| `shipping_address` | Endereços de entrega |
| `order` | Pedidos com status e dados de entrega Uber |
| `order_item` | Itens de cada pedido |
| `promotion` | Banners promocionais |

### Migrações

```bash
# Gerar uma nova migração após alterar o schema
npx drizzle-kit generate --name nome_descritivo

# Aplicar migrações pendentes
npx drizzle-kit push

# Visualizar o banco no Drizzle Studio
npx drizzle-kit studio
```

---

## 🔧 Painel Administrativo

### Acesso

1. Faça login com uma conta existente
2. Promova o usuário para admin no banco:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'seu-email@example.com';
```

3. Acesse via menu lateral → **"Painel Admin"** ou diretamente em `/admin`

### Rotas do Admin

| Rota | Funcionalidade |
|---|---|
| `/admin` | Dashboard com métricas e últimos pedidos |
| `/admin/products` | Listagem e gestão de produtos |
| `/admin/products/[id]/variants` | Variantes de um produto |
| `/admin/categories` | Gestão de categorias |
| `/admin/orders` | Gestão de pedidos |
| `/admin/promotions` | Gestão de promoções |
| `/admin/customers` | Listagem de clientes |

---

## 🔌 Integrações

### Mercado Pago

- **Preferences API** para criar sessões de pagamento
- **Webhooks** para receber notificações de pagamento em `/api/mercadopago`
- Suporte a PIX, cartão de crédito e boleto
- Cancelamento e reembolso automatizados

### Stripe

- Checkout Session para pagamentos internacionais
- **Webhooks** em `/api/stripe` para confirmação de pagamento
- Suporte a cartão de crédito

### Uber Direct

- **OAuth2** com cache de token em memória
- **Cotação de frete** em tempo real baseado no endereço de entrega
- **Criação de entrega** automática após confirmação de pagamento
- **Webhooks** em `/api/uber` para atualização de status de entrega
- **Cancelamento** de entregas em andamento
- **Verificação de assinatura HMAC** nos webhooks

### Cloudflare R2

- Upload de imagens de produtos via **Better Upload**
- Interface drag-and-drop no painel admin
- Suporte a múltiplas imagens por variante de produto

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Dev | `npm run dev` | Inicia o servidor de desenvolvimento |
| Build | `npm run build` | Gera o build de produção |
| Start | `npm run start` | Inicia o servidor de produção |
| Lint | `npm run lint` | Executa o ESLint |
| Seed | `npm run seed` | Popula o banco com dados de exemplo |

---

## 🚀 Deploy

### Vercel (Recomendado)

A maneira mais simples de fazer deploy é usando a [Vercel](https://vercel.com):

1. Faça push do projeto para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js 16:
- **Railway** — com PostgreSQL integrado
- **Render** — com banco PostgreSQL gerenciado
- **AWS Amplify** — com RDS PostgreSQL
- **Docker** — containerização completa

---

## 📄 Licença

Este projeto é privado e de uso exclusivo da **RD Fitness**.

---

<p align="center">
  Desenvolvido por <strong>Augusto Sousa</strong>
</p>

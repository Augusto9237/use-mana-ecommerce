This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Painel de Administração

### Acesso ao Painel Admin

A aplicação inclui um **painel de administração privado** para gerenciamento de produtos. Apenas usuários com role `admin` podem acessar.

#### Como Acessar:
1. Faça login com uma conta de administrador
2. No menu lateral (ícone de menu), você verá a opção **"Painel Admin"**
3. Ou acesse diretamente: `http://localhost:3000/admin`

#### Funcionalidades:

- **Criar Produtos**: `/admin/products/create`
  - Adicione novos produtos ao catálogo
  - Preencha nome, descrição, categoria e slug
  - Cada produto pode ter múltiplas variantes

- **Listar Produtos**: `/admin/products`
  - Visualize todos os produtos cadastrados
  - Veja a quantidade de variantes por produto
  - Acesse a edição e gerenciamento de variantes

- **Gerenciar Variantes**: `/admin/products/[productId]/variants`
  - Crie variantes (cores, tamanhos, versões) de um produto
  - Defina preço em centavos (ex: 9999 = R$ 99,99)
  - Adicione URL de imagem para cada variante

#### Estrutura de Dados:

- **Usuário com role admin**: Tem acesso completo ao painel
- **Produto**: Contém nome, descrição, categoria e slug
- **Variante de Produto**: Cores/versões específicas do produto com preço e imagem

#### Tecnologias Utilizadas:

- **Autenticação**: Better Auth
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Validação**: Zod schemas
- **Formulários**: React Hook Form
- **UI**: Shadcn/ui components

#### Para Habilitar Acesso Admin em um Usuário:

Use a interface do banco de dados ou execute uma migração para atualizar a coluna `role` do usuário:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'seu-email@example.com';
```

### Migrações de Banco de Dados

Após atualizar o schema, execute:

```bash
npm run migrate
# ou
npx drizzle-kit generate --name descriptive_name
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

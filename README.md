# Banca do Bairro

PDV touch para registrar pules em dinheiro, emitir comprovantes e fechar o caixa após o sorteio.

## Rodar localmente

```bash
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Abra `http://localhost:3000`. O painel fica em `/admin` e usa `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e configure:

- `DATABASE_URL`: conexão Neon com `-pooler`, usada pela aplicação.
- `DIRECT_URL`: conexão Neon direta, usada pelo Prisma CLI.
- `JWT_SECRET`: segredo aleatório com pelo menos 32 caracteres.
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`: credenciais criadas por `npm run db:seed`.
- `APP_URL`: origem exata permitida pelo CORS, por exemplo `https://banca.exemplo.com`.

## Docker

```bash
docker build -t banca-do-bairro .
docker run -d --name banca -p 80:80 --env-file .env banca-do-bairro
```

A aplicação sobe em `http://localhost`. O `.env` precisa estar sem aspas em volta dos valores: o `--env-file` do Docker não remove aspas, e uma `DATABASE_URL` entre aspas quebra o Prisma na inicialização. Antes do primeiro start, rode `npm run db:deploy && npm run db:seed` a partir do host.

## Deploy na Vercel

1. Envie o repositório para o GitHub e importe-o na Vercel.
2. Cadastre as seis variáveis acima em Project Settings > Environment Variables.
3. Use `npx prisma generate && next build` como Build Command.
4. Antes do primeiro deploy, rode `npm run db:deploy && npm run db:seed` em um ambiente seguro com as variáveis de produção.
5. Troque `APP_URL` pela URL final e faça o deploy novamente.

## Verificação

```bash
npm test
npm run lint
npm run build
npm run test:browser # requer Edge instalado e npm run dev ativo
```

Os multiplicadores ficam em `src/lib/domain.ts`. Ajuste-os antes de operar caso a banca use outra tabela.

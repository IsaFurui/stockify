# Plano: Teste de Integração para Auth Controller

## Objetivo

Testar a controller de autenticação end-to-end, verificando se o token JWT é gerado corretamente na resposta.

---

## Estrutura Atual do Projeto

```
src/
├── app.ts                          # App Fastify (export default app)
├── controllers/
│   └── auth-controller.ts         # POST /auth → retorna { ..., token }
├── services/Auth/
│   ├── auth.ts                    # AuthService
│   └── auth.spec.ts               # Teste unitário do service
├── factories/
│   └── make-user.ts               # Factory para criar usuários de teste
├── lib/
│   ├── env.ts                     # Validação de variáveis de ambiente
│   └── prisma.ts                  # Cliente Prisma
```

---

## Mudança 1: Refatorar `src/app.ts`

### Antes (atual)

```typescript
const app = fastify();

// ... configurações ...

export default app;
```

### Depois (refatorado)

```typescript
export async function build() {
  const app = fastify();

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: "30m" },
  });

  app.setErrorHandler(ErrorHandler);
  app.register(registerRoutes);

  app.post("/webhooks/pagamento", async (request, reply) => {
    const payload = request.body;
    console.log("📩 Webhook recebido:", payload);
    return reply.status(200).send({ received: true });
  });

  return app;
}

export default build(); // Mantém compatibilidade com server.ts
```

**Importante:** O comportamento em produção permanece o mesmo. Apenas extraímos a lógica para uma função reutilizável.

---

## Mudança 2: Criar `src/controllers/auth-controller.spec.ts`

```typescript
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { build } from "../app.js";
import { MakeUser } from "../factories/make-user.js";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import type { FastifyInstance } from "fastify";
import type { Usuario } from "../../generated/prisma/browser.js";

describe("POST /auth", () => {
  let app: FastifyInstance;
  let testUser: Usuario;

  beforeAll(async () => {
    app = await build();
    await app.ready();

    const password = "testPassword123";
    testUser = await MakeUser({
      UsuPasswordHash: await hash(password, 6),
    });
  });

  afterAll(async () => {
    await prisma.usuario.delete({ where: { UsuId: testUser.UsuId } });
    await app.close();
  });

  it("should return 200 and a token on valid credentials", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth",
      payload: {
        email: testUser.UsuEmail,
        senha: "testPassword123",
      },
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body).toHaveProperty("status", true);
  });

  it("should return 401 on invalid password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth",
      payload: {
        email: testUser.UsuEmail,
        senha: "wrongPassword",
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("should return 400 on invalid email format", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth",
      payload: {
        email: "invalid-email",
        senha: "anyPassword",
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
```

### Verificação opcional: Claims do JWT

```typescript
import { jwtVerify } from "jose";
import { env } from "../lib/env.js";

it("should return token with correct claims", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/auth",
    payload: {
      email: testUser.UsuEmail,
      senha: "testPassword123",
    },
  });

  const { token } = JSON.parse(response.body);
  const decoded = await jwtVerify(
    token,
    new TextEncoder().encode(env.JWT_SECRET),
  );

  expect(decoded.payload.sub).toBe(testUser.UsuId);
  expect(decoded.payload.role).toBe(testUser.Grupo);
});
```

---

## Alternativas de Banco de Dados para Testes

### Situação Atual

- Docker Compose com **Postgres** em `localhost:5432`
- Prisma com adapter Pg
- DATABASE_URL no `.env`

---

## Alternativa 1: DATABASE_URL diferente (RECOMENDADA)

### Como funciona

Criar um segundo banco Postgres (via Docker) na porta 5433 para testes.

### Implementação

**1. `docker-compose.yml` - adicionar serviço de teste:**

```yaml
services:
  api-solid-pg:
    image: bitnami/postgresql:latest
    ports:
      - "5432:5432"
    environment:
      - POSTGRESQL_USERNAME=root
      - POSTGRESQL_PASSWORD=password123
      - POSTGRESQL_DATABASE=stockify

  api-solid-pg-test:
    image: bitnami/postgresql:latest
    ports:
      - "5433:5432"
    environment:
      - POSTGRESQL_USERNAME=root
      - POSTGRESQL_PASSWORD=password123
      - POSTGRESQL_DATABASE=stockify_test
```

**2. Criar `.env.test`:**

```env
DATABASE_URL="postgresql://root:password123@localhost:5433/stockify_test?schema=public"
PORT=3031
JWT_SECRET="9oqShaD8EGd2mHwATEPfuRQ5AuuI2LvPc8345JGBeolMLu5OVnwhWfHfAKtSSJFC"
```

**3. Criar `scripts/reset-test-db.sh`:**

```bash
#!/bin/bash
set -e

echo "🚀 Resetando banco de teste..."

# 1. Subir container se não estiver rodando
docker compose up -d api-solid-pg-test

# 2. Aguardar Postgres ficar pronto
sleep 3

# 3. Rodar migrations
DATABASE_URL="postgresql://root:password123@localhost:5433/stockify_test?schema=public" \
  npx prisma migrate deploy

# 4. Seed (se tiver)
DATABASE_URL="postgresql://root:password123@localhost:5433/stockify_test?schema=public" \
  npx prisma db seed

echo "✅ Banco de teste pronto!"
```

**4. Criar `vitest.config.ts`:**

```typescript
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts"],
  },
});
```

**5. `package.json` - adicionar scripts:**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:db:reset": "./scripts/reset-test-db.sh"
  }
}
```

---

## Alternativa 2: Docker + Script de Setup

### Como funciona

Script completo que sobe um container Docker temporário de Postgres antes dos testes e remove após.

### Implementação

**1. Criar `scripts/test-docker.sh`:**

```bash
#!/bin/bash
set -e

CONTAINER_NAME="stockify-test-pg"
POSTGRES_USER="test"
POSTGRES_PASSWORD="test123"
POSTGRES_DB="stockify_test"
PORT=5434

cleanup() {
  echo "🧹 Limpando container de teste..."
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
}

trap cleanup EXIT

echo "🚀 Subindo Postgres de teste..."
docker run -d \
  --name $CONTAINER_NAME \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -p $PORT:5432 \
  postgres:16-alpine

# Aguardar Postgres ficar pronto
echo "⏳ Aguardando Postgres..."
sleep 3
for i in {1..10}; do
  if docker exec $CONTAINER_NAME pg_isready -U $POSTGRES_USER > /dev/null 2>&1; then
    echo "✅ Postgres pronto!"
    break
  fi
  sleep 1
done

# Rodar migrations
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PORT}/${POSTGRES_DB}"
npx prisma migrate deploy

# Rodar testes
echo "🧪 Rodando testes..."
vitest run

echo "✅ Testes finalizados!"
```

**2. `package.json` - adicionar script:**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "test:docker": "./scripts/test-docker.sh"
  }
}
```

---

## Comparação Detalhada

| Critério               | Alternativa 1 (DATABASE_URL)        | Alternativa 2 (Docker + Script)           |
| ---------------------- | ----------------------------------- | ----------------------------------------- |
| **Complexidade**       | Média - precisa config Docker extra | Alta - script bash + container management |
| **Isolamento**         | Bom - banco separado                | Excelente - container temp por execução   |
| **Performance**        | Rápido - banco já está rodando      | Lento - sobe container a cada suite       |
| **Recursos**           | Usa mais RAM (2 bancos)             | Libera recursos após testes               |
| **Parallelismo**       | Difícil - porta fixa                | Fácil - cada suite usa porta diferente    |
| **CI/CD**              | Mais simples                        | Mais complexo                             |
| **Dados persistentes** | Sim (entre execuções)               | Não (limpa após)                          |
| **Debugging**          | Mais fácil - dados persistem        | Mais difícil - dados somem                |

---

## Recomendação

### Para seu caso (desenvolvimento local, poucos testes):

**⚡ Alternativa 1 (DATABASE_URL diferente)** é mais prática porque:

1. **Mais simples** - só adiciona um serviço no docker-compose
2. **Mais rápido** - não precisa subir/baixar container a cada teste
3. **Menor fricção** - `vitest` roda direto sem wrapper de script
4. **Suficiente** - você já tem Postgres, só precisa de um banco separado
5. **Debugging fácil** - pode inspecionar dados entre execuções

### Quando usar Alternativa 2:

- CI/CD com runners efêmeros (GitHub Actions, etc.)
- Equipe grande com possíveis conflitos de porta
- Quer garantir estado 100% limpo entre execuções
- Ambiente de staging/produção similar ao local

---

## Resumo das Alterações

### Arquivos a criar:

| Arquivo                                   | Descrição                              |
| ----------------------------------------- | -------------------------------------- |
| `vitest.config.ts`                        | Configuração do Vitest com `.env.test` |
| `.env.test`                               | Variáveis de ambiente para testes      |
| `scripts/reset-test-db.sh`                | Script para resetar banco de teste     |
| `src/controllers/auth-controller.spec.ts` | Testes de integração da controller     |

### Arquivos a modificar:

| Arquivo              | Mudança                               |
| -------------------- | ------------------------------------- |
| `src/app.ts`         | Extrair lógica para função `build()`  |
| `docker-compose.yml` | Adicionar serviço `api-solid-pg-test` |
| `package.json`       | Adicionar scripts de teste            |

### Arquivos já existentes (não precisa criar):

- `src/controllers/auth-controller.ts` ✅
- `src/services/Auth/auth.ts` ✅
- `src/services/Auth/auth.spec.ts` ✅
- `src/factories/make-user.ts` ✅
- `src/lib/prisma.ts` ✅
- `src/lib/env.ts` ✅

---

## Fluxo de Execução (Alternativa 1)

```
1. Configuração inicial (uma vez):
   docker compose up -d api-solid-pg-test
   ./scripts/reset-test-db.sh

2. Antes de cada sessão de testes:
   ./scripts/reset-test-db.sh  # opcional, só se quiser reset

3. Rodar testes:
   npm test
   # ou
   npm run test:watch  # modo watch

4. Ver resultados:
   ✓ should return 200 and a token on valid credentials
   ✓ should return 401 on invalid password
   ✓ should return 400 on invalid email format
```

---

## Próximos Passos (pós-implementação)

1. Rodar `npm test` e verificar se todos os testes passam
2. Adicionar mais casos de teste se necessário (ex: usuário inexistente)
3. Configurar CI/CD se precisar rodar testes em pull requests
4. Considerar testes de integração para outras controllers

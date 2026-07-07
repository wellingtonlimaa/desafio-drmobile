# API de Clientes — Desafio Técnico

API REST para cadastro e gerenciamento de clientes, com CRUD completo, validação de dados, regras de negócio, paginação, filtros e tratamento centralizado de erros.

## Tecnologias

- **Node.js** (20+) e **TypeScript** — tipagem estática em modo `strict`
- **Express 5** — framework HTTP (a versão 5 encaminha automaticamente erros de handlers `async` ao middleware de erros)
- **MongoDB Atlas** + **Mongoose 9** — banco de dados e ODM (validações e normalizações no schema)
- **dotenv** — carregamento de variáveis de ambiente
- **tsx** — execução do TypeScript em desenvolvimento com recarga automática (equivalente ao nodemon, sem etapa de build)
- **swagger-ui-express** — documentação interativa dos endpoints (OpenAPI 3) em `/docs`
- **http-status** — constantes nomeadas para os códigos HTTP (`CREATED`, `NOT_FOUND`, `CONFLICT`…), evitando "números mágicos" espalhados pelo código

## Requisitos

- Node.js 20 ou superior
- npm
- Acesso a um banco MongoDB Atlas (string de conexão)

## Instalação

```bash
git clone <url-do-repositorio>
cd Drmobile
npm install
cp .env.example .env   # no Windows: copy .env.example .env
```

Em seguida, preencha o `.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/clientes
```

> O arquivo `.env` não é versionado. As credenciais de avaliação são disponibilizadas de forma segura, fora do repositório.

## Execução

```bash
npm run dev     # desenvolvimento, com recarga automática
npm run build   # compila o TypeScript para dist/
npm start       # executa a versão compilada
```

## Execução com Docker

O projeto inclui um `Dockerfile` (build multi-stage: compila o TypeScript e gera uma imagem final enxuta, só com as dependências de produção) e um `docker-compose.yml` que já expõe a porta e injeta as variáveis de ambiente.

Pré-requisitos: **Docker** e **Docker Compose** instalados, e o arquivo `.env` preenchido (o Compose lê o `MONGODB_URI` e o `PORT` dele via `env_file`; o `.env` nunca entra na imagem).


```bash
docker compose up --build      # constrói a imagem e sobe o container
```

A API fica disponível em `https://desafio-drmobile-production.up.railway.app` (e a documentação em `https://desafio-drmobile-production.up.railway.app/docs`).

Outros comandos úteis:

```bash
docker compose up -d --build   # sobe em segundo plano (detached)
docker compose logs -f         # acompanha os logs
docker compose down            # para e remove o container
```

> Como o banco é o MongoDB Atlas (na nuvem), não há um serviço de banco no Compose — basta a `MONGODB_URI` no `.env`.

### Execução em produção (imagem publicada)

Para rodar sem buildar nada, o `docker-compose-production.yml` usa a imagem já publicada no Docker Hub (`wellingtonlimaa/desafio-drmobile:1.0.0`), baixando-a automaticamente. É a forma mais rápida de subir a aplicação — só precisa do `.env` preenchido.

```bash
docker compose -f docker-compose-production.yml up -d
```

Para parar:

```bash
docker compose -f docker-compose-production.yml down
```

## Documentação interativa (Swagger)

Com a API rodando, acesse **`https://desafio-drmobile-production.up.railway.app/docs`**: a página lista todos os endpoints com parâmetros, corpos de exemplo e todas as respostas possíveis (sucesso e erro), e permite executar as requisições direto do navegador ("Try it out"). O contrato OpenAPI 3 em JSON fica disponível em `/docs.json`, para importação em outras ferramentas. A especificação é mantida em `src/docs/openapi.ts`.

## Endpoints

| Método | Caminho | Finalidade |
|---|---|---|
| POST | `/clientes` | Cadastrar cliente |
| GET | `/clientes` | Listar clientes (paginação e filtros) |
| GET | `/clientes/:id` | Consultar cliente por ID |
| PUT / PATCH | `/clientes/:id` | Atualizar cliente |
| DELETE | `/clientes/:id` | Excluir cliente |

### POST /clientes

A API aceita CPF, telefone e CEP com ou sem máscara, e normaliza os dados antes de salvar (somente números; e-mail em minúsculas; estado em maiúsculas; nome sem espaços nas bordas).

Requisição:

```json
{
  "nome": "João da Silva",
  "cpf": "529.982.247-25",
  "email": "JOAO@EMAIL.COM",
  "telefone": "(11) 99999-9999",
  "dataNascimento": "1995-05-10",
  "ativo": true,
  "endereco": {
    "cep": "01001-000",
    "logradouro": "Praça da Sé",
    "numero": "100",
    "complemento": "Apartamento 10",
    "bairro": "Sé",
    "cidade": "São Paulo",
    "estado": "sp"
  }
}
```

Resposta — `201 Created`:

```json
{
  "_id": "6a4aa91b4bf2f5a0ba4c747b",
  "nome": "João da Silva",
  "cpf": "52998224725",
  "email": "joao@email.com",
  "telefone": "11999999999",
  "dataNascimento": "1995-05-10T00:00:00.000Z",
  "ativo": true,
  "endereco": {
    "cep": "01001000",
    "logradouro": "Praça da Sé",
    "numero": "100",
    "complemento": "Apartamento 10",
    "bairro": "Sé",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "createdAt": "2026-07-05T12:00:00.000Z",
  "updatedAt": "2026-07-05T12:00:00.000Z"
}
```

### GET /clientes

Filtros opcionais combináveis:

```
GET /clientes?ativo=true
GET /clientes?nome=joao          (busca parcial, sem diferenciar maiúsculas/minúsculas)
GET /clientes?page=1&limit=10    (padrão: page=1, limit=10; limite máximo: 100)
```

Resposta — `200 OK`:

```json
{
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1,
  "data": [ { "...": "documentos de cliente" } ]
}
```

### GET /clientes/:id

- `200 OK` com o cliente;
- `404 Not Found` se não existir;
- `400 Bad Request` (`INVALID_ID`) se o ID tiver formato inválido.

### PUT / PATCH /clientes/:id

Atualização parcial: apenas os campos enviados são alterados, e todas as validações são reaplicadas. **O CPF não pode ser alterado** — se o corpo tentar mudá-lo, a API responde:

```json
{
  "error": "CPF_INVALID_UPDATE",
  "message": "O CPF do cliente não pode ser alterado."
}
```

(Enviar o CPF atual, idêntico, não gera erro — o campo é apenas ignorado.)

### DELETE /clientes/:id

- `204 No Content` em caso de sucesso (sem corpo de resposta);
- `404 Not Found` se o cliente não existir.

## Padrão de erros

Todas as respostas de erro saem do middleware central no formato:

```json
{
  "error": "CODIGO_DO_ERRO",
  "message": "Descrição legível.",
  "details": [ { "field": "email", "message": "Formato de e-mail inválido" } ]
}
```

(`details` aparece apenas em erros de validação.)

| Código HTTP | `error` | Quando ocorre |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Campos inválidos (com `details` por campo) |
| 400 | `CPF_INVALID_UPDATE` | Tentativa de alterar o CPF |
| 400 | `INVALID_ID` | ID com formato inválido |
| 400 | `INVALID_JSON` | Corpo da requisição não é JSON válido |
| 404 | `CUSTOMER_NOT_FOUND` | Cliente não encontrado |
| 404 | `ROUTE_NOT_FOUND` | Rota inexistente |
| 409 | `CPF_ALREADY_EXISTS` | CPF já cadastrado |
| 409 | `EMAIL_ALREADY_EXISTS` | E-mail já cadastrado |
| 500 | `INTERNAL_SERVER_ERROR` | Falha interna (sem expor detalhes, stack trace ou credenciais) |

## Collection do Postman

A pasta [postman/](postman/) contém a collection `clientes-api.postman_collection.json`, pronta para importar no Postman:

1. Importe o arquivo no Postman;
2. A variável `{{baseUrl}}` já vem definida como `https://desafio-drmobile-production.up.railway.app` (ajuste se necessário);
3. Execute a collection na ordem (Run collection): os cenários geram um CPF válido aleatório a cada execução, salvam o `clienteId` criado e validam automaticamente status, formato da resposta e mensagens de erro com `pm.test`.

Cenários cobertos: cadastro válido, CPF/e-mail inválidos e duplicados, menor de 18 anos, data futura, listagem com paginação e filtros, consulta por ID (existente e inexistente), atualização de nome e e-mail, tentativa de alteração de CPF e exclusão (existente e inexistente).

## Decisões técnicas

- **Arquitetura em camadas**: `routes` → `controllers` (HTTP) → `services` (regras de negócio) → `repositories` (acesso a dados) → `models` (schema e validações). A camada `repositories` (`src/repositories/`) concentra toda a interação com o Mongoose (queries, filtros, `skip`/`limit`), de modo que o service não conhece detalhes do banco — o que facilita testes e uma eventual troca de ODM. Erros de negócio usam a classe `AppError` (`src/errors/`) e são convertidos em resposta HTTP num único ponto, o middleware `errorHandler` (`src/middlewares/`). `app.ts` monta o Express e `server.ts` cuida do ciclo de vida (conexão com o banco e listen), o que facilita testes futuros.
- **Validação no schema do Mongoose**: obrigatoriedade, formatos, validadores customizados (algoritmo de CPF em `src/validators/`) e normalização via `set`/`trim`/`lowercase`/`uppercase`. Assim as regras valem para criação e atualização (`runValidators: true`).
- **CPF imutável em duas camadas**: o service compara o CPF enviado com o atual e responde `CPF_INVALID_UPDATE` (regra de negócio explícita), e o schema ainda marca o campo como `immutable` como defesa extra.
- **Exclusão física**: o DELETE remove o documento definitivamente, retornando `204 No Content`, por ser o comportamento mais previsível para um CRUD de avaliação. O campo `ativo` já existe e é filtrável (`?ativo=false`), então evoluir para *soft delete* seria trocar a exclusão por `ativo = false` no service e ajustar o filtro padrão da listagem.
- **Índices únicos** de CPF e e-mail no MongoDB garantem unicidade mesmo em requisições concorrentes; a violação (código 11000) é traduzida para `409 Conflict`.
- **Segurança**: credenciais somente via variáveis de ambiente (`.env` fora do versionamento, com `.env.example` de referência); erros internos são logados no servidor e nunca expostos ao consumidor.

### Melhorias futuras

- Testes automatizados (Jest + Supertest);
- ESLint + Prettier + Husky;
- Logs estruturados (pino);
- Soft delete como padrão de exclusão.

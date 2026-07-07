# ---- Etapa 1: build — compila o TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app

# copia só os manifestos primeiro para aproveitar o cache de camadas:
# se o código mudar mas as dependências não, o npm ci não roda de novo
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Etapa 2: runtime — imagem final, só com o necessário para rodar ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# instala apenas as dependências de produção (sem typescript, tsx, @types)
COPY package*.json ./
RUN npm ci --omit=dev

# traz o JavaScript compilado da etapa de build
COPY --from=build /app/dist ./dist

EXPOSE 3000

# roda como usuário sem privilégios, não como root
USER node

CMD ["node", "dist/server.js"]

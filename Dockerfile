# Estágio 1: Build do Frontend (React/Vite)
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copia os arquivos do frontend
COPY package*.json ./
RUN npm install

COPY . .
# A variável em branco força o frontend a usar caminhos relativos (ex: /api/users)
ENV VITE_API_URL=""
RUN npm run build


# Estágio 2: Build do Backend e configuração do servidor final
FROM node:18-alpine
WORKDIR /app

# Copia dependências do backend
COPY server/package*.json ./
RUN npm install

# Copia código do backend
COPY server/ ./
RUN npx prisma generate
RUN npx tsc

# Copia o build do frontend para a pasta public do backend (onde o express vai ler)
COPY --from=frontend-builder /app/dist ./public

# Expõe a porta que o backend roda
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]

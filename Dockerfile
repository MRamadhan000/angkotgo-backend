# =========================
# Stage 1: Build Application
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files terlebih dahulu
# Agar Docker caching lebih optimal
COPY package*.json ./

# Install semua dependencies
RUN npm ci

# Copy source code
COPY . .

# Build NestJS
RUN npm run build


# =========================
# Stage 2: Production
# =========================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies saja
RUN npm ci --omit=dev

# Copy hasil build dari stage builder
COPY --from=builder /app/dist ./dist

# Port NestJS
EXPOSE 3001

# Jalankan aplikasi
CMD ["node", "dist/main.js"]
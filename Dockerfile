# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time env vars (baked into the static bundle by Vite)
ARG VITE_ENTRA_CLIENT_ID
ARG VITE_ENTRA_TENANT_ID
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

ENV VITE_ENTRA_CLIENT_ID=$VITE_ENTRA_CLIENT_ID
ENV VITE_ENTRA_TENANT_ID=$VITE_ENTRA_TENANT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Node.js runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built frontend assets
COPY --from=builder /app/dist ./dist/

# Copy Express backend
COPY --from=builder /app/server ./server/

# Install only production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
RUN npm ci --omit=dev

EXPOSE 80
ENV PORT=80

CMD ["node", "server/index.js"]

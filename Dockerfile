# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:22-alpine AS builder
RUN corepack enable
ARG TMDB_API_KEY
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
ENV TMDB_API_KEY=${TMDB_API_KEY}
RUN pnpm run build-with-reviews

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginxinc/nginx-unprivileged:alpine AS runner
COPY nginx/app.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
EXPOSE 8080
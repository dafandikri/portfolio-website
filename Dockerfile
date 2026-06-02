# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:22-alpine AS builder
# Pin pnpm directly (matches package.json "packageManager") — avoids corepack
# signature-verification failures on the base image's bundled corepack.
RUN npm install -g pnpm@10.30.3
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
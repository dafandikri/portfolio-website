# ============================================
# Stage 1: Build the React application
# ============================================
FROM node:22-alpine AS builder
ARG TMDB_API_KEY
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
ENV TMDB_API_KEY=${TMDB_API_KEY}
RUN npm run build-with-reviews

# ============================================
# Stage 2: Serve with Nginx
# ============================================
FROM nginxinc/nginx-unprivileged:alpine AS runner
COPY nginx/app.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
EXPOSE 8080
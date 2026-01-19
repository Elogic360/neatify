# ============================================================================
# FRONTEND DOCKERFILE
# ShopHub E-Commerce Platform - React Frontend (Vite)
# ============================================================================

# ==========================================================================
# Base Stage
# ==========================================================================
FROM node:20-alpine as base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set work directory
WORKDIR /app

# ==========================================================================
# Dependencies Stage
# ==========================================================================
FROM base as dependencies

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# ==========================================================================
# Development Stage
# ==========================================================================
FROM dependencies as development

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run development server with HMR
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# ==========================================================================
# Build Stage
# ==========================================================================
FROM dependencies as build

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# ==========================================================================
# Production Stage (Nginx)
# ==========================================================================
FROM nginx:alpine as production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

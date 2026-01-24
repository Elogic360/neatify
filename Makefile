# ============================================================================
# MAKEFILE
# Neatify - Cleaning Supplies & Tools Platform
# ============================================================================
# Common development commands for the project
# Usage: make <command>
# ============================================================================

.PHONY: help install install-backend install-frontend dev dev-backend dev-frontend \
        build test lint format clean db-init db-migrate db-upgrade db-downgrade \
        docker-up docker-down docker-build docker-logs admin seed

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# HELP
# ============================================================================
help: ## Show this help message
	@echo "Neatify - Cleaning Supplies & Tools Platform - Development Commands"
	@echo ""
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# ============================================================================
# INSTALLATION
# ============================================================================
install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend dependencies
	@echo "📦 Installing backend dependencies..."
	cd backend && python -m venv venv
	cd backend && . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt
	@echo "✅ Backend dependencies installed!"

install-frontend: ## Install frontend dependencies
	@echo "📦 Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "✅ Frontend dependencies installed!"

# ============================================================================
# DEVELOPMENT
# ============================================================================
dev: ## Start both backend and frontend development servers
	@echo "🚀 Starting development servers..."
	@make -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	@echo "🐍 Starting FastAPI backend..."
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend development server
	@echo "⚛️ Starting Vite frontend..."
	cd frontend && pnpm run dev

# ============================================================================
# BUILD
# ============================================================================
build: ## Build frontend for production
	@echo "🏗️ Building frontend..."
	cd frontend && pnpm run build
	@echo "✅ Frontend built successfully!"

build-check: ## Type check and build frontend
	@echo "🔍 Type checking and building..."
	cd frontend && pnpm run build
	@echo "✅ Build check complete!"

# ============================================================================
# TESTING
# ============================================================================
test: ## Run all tests
	@echo "🧪 Running tests..."
	cd backend && . venv/bin/activate && pytest -v
	@echo "✅ Tests complete!"

test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	cd backend && . venv/bin/activate && pytest -v

test-coverage: ## Run tests with coverage
	@echo "📊 Running tests with coverage..."
	cd backend && . venv/bin/activate && pytest --cov=app --cov-report=html

# ============================================================================
# LINTING & FORMATTING
# ============================================================================
lint: ## Run linters on all code
	@echo "🔍 Running linters..."
	cd frontend && pnpm run lint
	cd backend && . venv/bin/activate && ruff check .
	@echo "✅ Linting complete!"

format: ## Format all code
	@echo "✨ Formatting code..."
	cd backend && . venv/bin/activate && ruff format .
	cd frontend && pnpm exec prettier --write "src/**/*.{ts,tsx,css}"
	@echo "✅ Formatting complete!"

# ============================================================================
# DATABASE
# ============================================================================
db-init: ## Initialize database with schema
	@echo "🗄️ Initializing database..."
	psql -U postgres -f scripts/init_database.sql
	@echo "✅ Database initialized!"

db-migrate: ## Create a new migration
	@echo "📝 Creating new migration..."
	@read -p "Migration message: " msg; \
	cd backend && . venv/bin/activate && alembic revision --autogenerate -m "$$msg"
	@echo "✅ Migration created!"

db-upgrade: ## Apply all pending migrations
	@echo "⬆️ Applying migrations..."
	cd backend && . venv/bin/activate && alembic upgrade head
	@echo "✅ Migrations applied!"

db-downgrade: ## Rollback last migration
	@echo "⬇️ Rolling back migration..."
	cd backend && . venv/bin/activate && alembic downgrade -1
	@echo "✅ Migration rolled back!"

db-history: ## Show migration history
	@echo "📜 Migration history:"
	cd backend && . venv/bin/activate && alembic history

db-current: ## Show current migration
	@echo "📍 Current migration:"
	cd backend && . venv/bin/activate && alembic current

# ============================================================================
# ADMIN & SEED DATA
# ============================================================================
admin: ## Create admin user
	@echo "👤 Creating admin user..."
	cd backend && . venv/bin/activate && python create_admin.py
	@echo "✅ Admin user created!"

seed: ## Seed database with sample data
	@echo "🌱 Seeding database..."
	cd backend && . venv/bin/activate && python -m app.seed
	@echo "✅ Database seeded!"

# ============================================================================
# DOCKER
# ============================================================================
docker-up: ## Start Docker containers (database only by default)
	@echo "🐳 Starting Docker containers..."
	docker compose up -d postgres
	@echo "✅ Containers started!"

docker-up-full: ## Start all Docker containers (full stack)
	@echo "🐳 Starting all Docker containers..."
	docker compose --profile full up -d
	@echo "✅ All containers started!"

docker-down: ## Stop Docker containers
	@echo "🛑 Stopping Docker containers..."
	docker compose down
	@echo "✅ Containers stopped!"

docker-build: ## Build Docker images
	@echo "🏗️ Building Docker images..."
	docker compose build
	@echo "✅ Images built!"

docker-logs: ## View Docker logs
	docker compose logs -f

docker-clean: ## Remove Docker containers and volumes
	@echo "🧹 Cleaning Docker resources..."
	docker compose down -v --remove-orphans
	@echo "✅ Docker resources cleaned!"

# ============================================================================
# CLEANUP
# ============================================================================
clean: ## Clean temporary files and caches
	@echo "🧹 Cleaning temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name ".DS_Store" -delete 2>/dev/null || true
	rm -rf frontend/dist 2>/dev/null || true
	rm -rf backend/htmlcov 2>/dev/null || true
	@echo "✅ Cleanup complete!"

clean-all: clean ## Clean everything including dependencies
	@echo "🧹 Cleaning dependencies..."
	rm -rf backend/venv 2>/dev/null || true
	rm -rf frontend/node_modules 2>/dev/null || true
	@echo "✅ Full cleanup complete!"

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================
setup-env: ## Create .env files from examples
	@echo "📄 Setting up environment files..."
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; echo "Created backend/.env"; fi
	@if [ ! -f frontend/.env ]; then cp frontend/.env.example frontend/.env; echo "Created frontend/.env"; fi
	@echo "✅ Environment files created! Please edit them with your configuration."

check-env: ## Verify environment setup
	@echo "🔍 Checking environment..."
	@test -f backend/.env || (echo "❌ backend/.env missing!" && exit 1)
	@test -f frontend/.env || (echo "❌ frontend/.env missing!" && exit 1)
	@echo "✅ Environment files present!"

# ============================================================================
# QUICK START
# ============================================================================
quickstart: setup-env install db-init db-upgrade admin ## Complete project setup
	@echo ""
	@echo "🎉 Neatify setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Edit backend/.env and frontend/.env with your configuration"
	@echo "  2. Run 'make dev' to start development servers"
	@echo "  3. Visit http://localhost:5173 for the frontend"
	@echo "  4. Visit http://localhost:8000/docs for API documentation"
	@echo ""

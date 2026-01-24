#!/bin/bash
# ============================================================================
# NEATIFY SETUP SCRIPT
# Cross-platform setup for development environment
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

print_header "Neatify - Cleaning Supplies & Tools Platform Setup"

echo "This script will set up your development environment."
echo ""

# ============================================================================
# Check Prerequisites
# ============================================================================
print_header "Checking Prerequisites"

MISSING_DEPS=0

check_command python3 || MISSING_DEPS=1
check_command node || MISSING_DEPS=1
check_command pnpm || MISSING_DEPS=1
check_command psql || print_warning "PostgreSQL CLI not found (optional if using Docker)"

if [ $MISSING_DEPS -eq 1 ]; then
    print_error "Some dependencies are missing. Please install them first."
    echo ""
    echo "See README.md for installation instructions."
    exit 1
fi

# ============================================================================
# Create Environment Files
# ============================================================================
print_header "Setting Up Environment Files"

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    print_success "Created backend/.env from template"
    print_warning "Please edit backend/.env with your configuration"
else
    print_warning "backend/.env already exists, skipping"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    print_success "Created frontend/.env from template"
else
    print_warning "frontend/.env already exists, skipping"
fi

# ============================================================================
# Setup Backend
# ============================================================================
print_header "Setting Up Backend"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q
print_success "Python dependencies installed"

# Create necessary directories
mkdir -p uploads/products logs
print_success "Created uploads and logs directories"

cd ..

# ============================================================================
# Setup Frontend
# ============================================================================
print_header "Setting Up Frontend"

cd frontend

echo "Installing Node.js dependencies..."
pnpm install --silent
print_success "Node.js dependencies installed"

cd ..

# ============================================================================
# Database Setup Instructions
# ============================================================================
print_header "Database Setup"

echo "You can set up the database in two ways:"
echo ""
echo "Option 1: Using Docker (Recommended)"
echo "  $ docker compose up -d postgres"
echo ""
echo "Option 2: Using local PostgreSQL"
echo "  $ psql -U postgres -f scripts/init_database.sql"
echo ""
echo "After the database is running, apply migrations:"
echo "  $ cd backend && source venv/bin/activate && alembic upgrade head"
echo ""

# ============================================================================
# Summary
# ============================================================================
print_header "Setup Complete!"

echo "Next steps:"
echo ""
echo "1. Configure your database connection in backend/.env"
echo "2. Start the database: docker compose up -d postgres"
echo "3. Run migrations: cd backend && source venv/bin/activate && alembic upgrade head"
echo "4. Create admin user: cd backend && python create_admin.py"
echo "5. Start development servers: make dev"
echo ""
echo "Access points:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend:  http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
print_success "Happy coding! 🚀"

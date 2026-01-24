# 🛍️ CommerceHub E-Commerce Platform

A full-stack e-commerce platform built with **FastAPI** (Python) backend and **React TypeScript** frontend, featuring a comprehensive admin system for product management.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### 🛒 Customer Features
- Browse products with advanced filtering and search
- Shopping cart management
- Product reviews and ratings
- User authentication and profile management
- Order tracking
- Category-based navigation

### 👨‍💼 Admin Features
- Complete product CRUD operations
- Multiple image upload per product
- Category management
- Dashboard with statistics and revenue tracking
- Inventory management with audit logs
- Product variations (colors, sizes, etc.)
- User management
- Order management with status updates
- Advanced reporting and analytics

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern Python web framework |
| **PostgreSQL** | Primary database |
| **SQLAlchemy** | ORM for database operations |
| **Pydantic** | Data validation |
| **JWT** | Authentication |
| **Alembic** | Database migrations |
| **Passlib** | Password hashing (bcrypt) |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **Lucide React** | Icons |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| PostgreSQL | 14+ | `psql --version` |

### Installing Prerequisites

<details>
<summary><strong>🐧 Linux (Ubuntu/Debian)</strong></summary>

```bash
# Update package list
sudo apt update

# Install Python 3.11+
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js 18+ (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```
</details>

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11

# Install Node.js
brew install node

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16
```
</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

```powershell
# Using winget (Windows Package Manager)

# Install Python
winget install Python.Python.3.11

# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
winget install PostgreSQL.PostgreSQL

# Or download installers from:
# - Python: https://www.python.org/downloads/
# - Node.js: https://nodejs.org/
# - PostgreSQL: https://www.postgresql.org/download/windows/
```
</details>

## 🚀 Quick Start

### Using Make (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd e_commerce-store

# Complete setup (creates env files, installs dependencies, sets up database)
make quickstart

# Start development servers
make dev
```

### Manual Setup

#### 1️⃣ Clone and Navigate

```bash
git clone <repository-url>
cd e_commerce-store
```

#### 2️⃣ Backend Setup

<details>
<summary><strong>🐧 Linux / 🍎 macOS</strong></summary>

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```
</details>

<details>
<summary><strong>🪟 Windows (PowerShell)</strong></summary>

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create environment file
Copy-Item .env.example .env

# Edit .env with your configuration
notepad .env
```
</details>

<details>
<summary><strong>🪟 Windows (Command Prompt)</strong></summary>

```cmd
cd backend

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
venv\Scripts\activate.bat

REM Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

REM Create environment file
copy .env.example .env

REM Edit .env with your configuration
notepad .env
```
</details>

#### 3️⃣ Database Setup

<details>
<summary><strong>🐧 Linux</strong></summary>

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ecommerce OWNER ecommerce_user;
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;
\q

# Or run the initialization script
sudo -u postgres psql -f scripts/init_database.sql

# Run migrations
cd backend
source venv/bin/activate
alembic upgrade head
```
</details>

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
# Start PostgreSQL service
brew services start postgresql@16

# Create database and user
psql postgres

CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ecommerce OWNER ecommerce_user;
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;
\q

# Or run the initialization script
psql postgres -f scripts/init_database.sql

# Run migrations
cd backend
source venv/bin/activate
alembic upgrade head
```
</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

```powershell
# Open psql (you may need to add PostgreSQL bin to PATH)
# Default path: C:\Program Files\PostgreSQL\16\bin\psql.exe
psql -U postgres

# Create database and user
CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE ecommerce OWNER ecommerce_user;
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;
\q

# Run migrations
cd backend
.\venv\Scripts\Activate.ps1
alembic upgrade head
```
</details>

#### 4️⃣ Create Admin User

```bash
cd backend
# Activate venv if not already activated
python create_admin.py
```

#### 5️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit if needed (defaults work for local development)
```

#### 6️⃣ Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# or: .\venv\Scripts\Activate.ps1  # Windows PowerShell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm run dev
```

## 🐳 Docker Setup (Alternative)

```bash
# Start PostgreSQL only (recommended for development)
docker compose up -d postgres

# Start full stack
docker compose --profile full up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

## 📁 Project Structure

```
e_commerce-store/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Core config, security
│   │   ├── db/                # Database session
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # Application entry
│   ├── alembic/               # Database migrations
│   ├── uploads/               # File uploads
│   ├── .env.example           # Environment template
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── app/               # App configuration
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example           # Environment template
│   ├── package.json           # Node dependencies
│   └── Dockerfile
├── scripts/                    # Setup scripts
│   └── init_database.sql      # Database initialization
├── docker-compose.yml          # Docker configuration
├── Makefile                    # Development commands
└── README.md                   # This file
```

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | Required |
| `SECRET_KEY` | JWT signing key | Required |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |
| `DEBUG` | Enable debug mode | `True` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiry | `30` |

See `backend/.env.example` for all options.

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `VITE_APP_NAME` | Application name | `CommerceHub` |

See `frontend/.env.example` for all options.

## 📚 Available Commands

```bash
# Installation
make install              # Install all dependencies
make install-backend      # Install backend only
make install-frontend     # Install frontend only

# Development
make dev                  # Start both servers
make dev-backend          # Start backend only
make dev-frontend         # Start frontend only

# Database
make db-init              # Initialize database
make db-migrate           # Create new migration
make db-upgrade           # Apply migrations
make db-downgrade         # Rollback migration

# Docker
make docker-up            # Start PostgreSQL
make docker-up-full       # Start full stack
make docker-down          # Stop containers

# Utilities
make lint                 # Run linters
make format               # Format code
make test                 # Run tests
make clean                # Clean temp files
```

## 🔐 Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Change default passwords** - Update all default values in production
3. **Generate new secret keys** - Use the provided commands to generate secure keys
4. **Use HTTPS in production** - Configure SSL/TLS for production deployments
5. **Review CORS settings** - Restrict origins in production

### Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Generate password hash
python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('your_password'))"
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run with coverage
make test-coverage

# Backend tests only
cd backend && pytest -v
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Made with ❤️ by the CommerceHub Team

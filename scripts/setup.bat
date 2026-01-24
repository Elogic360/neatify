@echo off
REM ============================================================================
REM NEATIFY SETUP SCRIPT FOR WINDOWS
REM Development environment setup
REM ============================================================================

echo.
echo ============================================================
echo Neatify - Cleaning Supplies ^& Tools Platform Setup
echo ============================================================
echo.

REM ============================================================================
REM Check Prerequisites
REM ============================================================================
echo Checking prerequisites...
echo.

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    exit /b 1
)
echo [OK] Python is installed

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js is installed

where pnpm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARNING] pnpm is not installed. Installing...
    npm install -g pnpm
)
echo [OK] pnpm is installed

echo.
echo ============================================================
echo Setting Up Environment Files
echo ============================================================
echo.

if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo [OK] Created backend\.env from template
    echo [WARNING] Please edit backend\.env with your configuration
) else (
    echo [INFO] backend\.env already exists, skipping
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo [OK] Created frontend\.env from template
) else (
    echo [INFO] frontend\.env already exists, skipping
)

echo.
echo ============================================================
echo Setting Up Backend
echo ============================================================
echo.

cd backend

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo [OK] Python dependencies installed

if not exist uploads\products mkdir uploads\products
if not exist logs mkdir logs
echo [OK] Created uploads and logs directories

cd ..

echo.
echo ============================================================
echo Setting Up Frontend
echo ============================================================
echo.

cd frontend

echo Installing Node.js dependencies...
call pnpm install --silent
echo [OK] Node.js dependencies installed

cd ..

echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo.
echo 1. Configure your database connection in backend\.env
echo 2. Start the database: docker compose up -d postgres
echo 3. Run migrations: cd backend ^&^& venv\Scripts\activate ^&^& alembic upgrade head
echo 4. Create admin user: cd backend ^&^& python create_admin.py
echo 5. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo 6. Start frontend: cd frontend ^&^& pnpm run dev
echo.
echo Access points:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
echo Happy coding!

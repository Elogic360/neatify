-- ============================================================================
-- SHOPHUB E-COMMERCE DATABASE INITIALIZATION SCRIPT
-- ============================================================================
-- Run this script as PostgreSQL superuser to set up the database
-- Usage: psql -U postgres -f init_database.sql
-- ============================================================================

-- ============================================================================
-- 1. CREATE DATABASE AND USER
-- ============================================================================

-- Drop existing database and user if they exist (for clean setup)
-- Comment these lines out if you want to preserve existing data
DROP DATABASE IF EXISTS ecommerce;
DROP USER IF EXISTS ecommerce_user;

-- Create the application database user
-- IMPORTANT: Change 'your_secure_password' to a strong password!
CREATE USER ecommerce_user WITH 
    LOGIN 
    PASSWORD 'your_secure_password'
    CREATEDB
    NOSUPERUSER
    NOCREATEROLE;

-- Create the database
CREATE DATABASE ecommerce
    WITH 
    OWNER = ecommerce_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0
    CONNECTION LIMIT = -1;

-- Add a comment to the database
COMMENT ON DATABASE ecommerce IS 'ShopHub E-Commerce Platform Database';

-- ============================================================================
-- 2. CONNECT TO THE NEW DATABASE
-- ============================================================================
\connect ecommerce

-- ============================================================================
-- 3. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- UUID generation (for unique identifiers)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Case-insensitive text (for email comparisons, etc.)
CREATE EXTENSION IF NOT EXISTS "citext";

-- Full-text search improvements
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO ecommerce_user;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO ecommerce_user;

-- Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecommerce_user;

-- Grant all privileges on all sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecommerce_user;

-- Grant all privileges on all functions in public schema
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ecommerce_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO ecommerce_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO ecommerce_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON FUNCTIONS TO ecommerce_user;

-- ============================================================================
-- 5. CREATE INITIAL SCHEMA (Tables will be created by Alembic migrations)
-- ============================================================================
-- The actual tables are managed by Alembic migrations.
-- Run 'alembic upgrade head' after this script to create all tables.

-- ============================================================================
-- 6. VERIFICATION
-- ============================================================================

-- Display created user and database info
SELECT 'Database and user created successfully!' AS status;
SELECT current_database() AS database_name, current_user AS connected_as;

-- List installed extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'citext', 'pg_trgm');

-- ============================================================================
-- END OF INITIALIZATION SCRIPT
-- ============================================================================

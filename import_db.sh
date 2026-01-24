#!/bin/bash
# Import Database to Production/Remote PostgreSQL
# This script imports your SQL dump to a new database host

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Database Import Script${NC}"
echo "================================"
echo ""

# Check if SQL file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No SQL file specified${NC}"
    echo ""
    echo "Usage: ./import_db.sh <sql_file> [database_url]"
    echo ""
    echo "Examples:"
    echo "  ./import_db.sh neatifyDB_backup.sql"
    echo "  ./import_db.sh neatifyDB_backup.sql postgresql://user:pass@host:5432/dbname"
    echo ""
    exit 1
fi

SQL_FILE="$1"

# Check if file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: File '$SQL_FILE' not found${NC}"
    exit 1
fi

# If .gz file, decompress first
if [[ "$SQL_FILE" == *.gz ]]; then
    echo -e "${YELLOW}📦 Decompressing $SQL_FILE...${NC}"
    gunzip -k "$SQL_FILE"
    SQL_FILE="${SQL_FILE%.gz}"
    echo -e "${GREEN}✅ Decompressed to $SQL_FILE${NC}"
    echo ""
fi

echo -e "${BLUE}📄 Import file: $SQL_FILE${NC}"
echo -e "${BLUE}📊 File size: $(du -h $SQL_FILE | cut -f1)${NC}"
echo ""

# Get database URL
if [ -z "$2" ]; then
    echo -e "${YELLOW}🔑 Enter Production Database URL:${NC}"
    echo "Format: postgresql://user:password@host:port/database"
    echo ""
    read -p "Database URL: " DATABASE_URL
else
    DATABASE_URL="$2"
fi

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: Database URL is required${NC}"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Confirm before proceeding
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will replace ALL data in the target database!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}❌ Import cancelled${NC}"
    exit 0
fi

# Start import
echo ""
echo -e "${BLUE}🔄 Starting import...${NC}"
echo "This may take several minutes depending on database size."
echo ""

# Import the database
psql "$DATABASE_URL" < "$SQL_FILE"

# Check if import was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Import completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Verify data in your application"
    echo "2. Create admin user if needed:"
    echo "   python backend/create_admin.py"
    echo "3. Test the application thoroughly"
    echo "4. Update CORS settings in backend"
else
    echo ""
    echo -e "${RED}❌ Import failed!${NC}"
    echo ""
    echo "Common issues:"
    echo "- Database URL is incorrect"
    echo "- Network connection issues"
    echo "- Insufficient permissions"
    echo "- Database already has conflicting data"
    echo ""
    echo "💡 Tip: Try dropping and recreating the database first:"
    echo "   DROP DATABASE IF EXISTS your_db_name;"
    echo "   CREATE DATABASE your_db_name;"
    exit 1
fi

# Run Alembic migrations if backend exists
if [ -d "backend" ]; then
    echo ""
    read -p "Run database migrations? (yes/no): " RUN_MIGRATIONS
    if [ "$RUN_MIGRATIONS" = "yes" ]; then
        echo -e "${BLUE}🔄 Running migrations...${NC}"
        cd backend
        export DATABASE_URL="$DATABASE_URL"
        alembic upgrade head
        cd ..
        echo -e "${GREEN}✅ Migrations completed${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo -e "${BLUE}Database is ready to use${NC}"

#!/bin/bash
# Export Local Database to SQL File
# This script exports your local PostgreSQL database to a SQL dump file

# Configuration
LOCAL_DB_NAME="ecommerce"  # Your local database name
LOCAL_DB_USER="ecommerce_user"  # Your local database user
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"
EXPORT_FILE="neatifyDB_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "🗄️  Exporting Local Database..."
echo "================================"
echo "Database: $LOCAL_DB_NAME"
echo "User: $LOCAL_DB_USER"
echo "Export File: $EXPORT_FILE"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump not found. Please install PostgreSQL client tools."
    exit 1
fi

# Export the database
echo "📦 Starting export..."
PGPASSWORD="commercePASS" pg_dump \
    -h $LOCAL_DB_HOST \
    -p $LOCAL_DB_PORT \
    -U $LOCAL_DB_USER \
    -d $LOCAL_DB_NAME \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    -F p \
    -f $EXPORT_FILE

# Check if export was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Export completed successfully!"
    echo "📄 File: $EXPORT_FILE"
    echo "📊 Size: $(du -h $EXPORT_FILE | cut -f1)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Review the exported file"
    echo "2. Use import_db.sh to import to production"
    echo "3. Keep this file as a backup"
else
    echo ""
    echo "❌ Export failed! Please check:"
    echo "- Database is running"
    echo "- Credentials are correct"
    echo "- You have sufficient permissions"
    exit 1
fi

# Create a compressed version
echo ""
echo "🗜️  Creating compressed backup..."
gzip -c $EXPORT_FILE > "${EXPORT_FILE}.gz"

if [ $? -eq 0 ]; then
    echo "✅ Compressed backup created: ${EXPORT_FILE}.gz"
    echo "📊 Compressed size: $(du -h ${EXPORT_FILE}.gz | cut -f1)"
    echo ""
    echo "💡 Tip: Upload the .gz file for faster transfer"
fi

echo ""
echo "🎉 All done!"

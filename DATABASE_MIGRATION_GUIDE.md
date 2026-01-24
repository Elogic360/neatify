# 🗄️ Database Export/Import Guide

## Quick Start

### 1. Export Local Database
```bash
# Make script executable
chmod +x export_db.sh

# Run export
./export_db.sh
```

This creates:
- `neatifyDB_backup_YYYYMMDD_HHMMSS.sql` - Full SQL dump
- `neatifyDB_backup_YYYYMMDD_HHMMSS.sql.gz` - Compressed version

### 2. Import to Production
```bash
# Make script executable
chmod +x import_db.sh

# Run import (will prompt for database URL)
./import_db.sh neatifyDB_backup_20260120_143000.sql

# Or specify database URL directly
./import_db.sh neatifyDB_backup_20260120_143000.sql "postgresql://user:pass@host:port/dbname"
```

---

## Detailed Instructions

### Export Local Database

**What it exports:**
- All tables (products, orders, users, etc.)
- All data (current products, customers, orders)
- Indexes and constraints
- No passwords in plain text (hashed)

**Command:**
```bash
./export_db.sh
```

**Output:**
```
🗄️  Exporting Local Database...
Database: ecommerce
User: ecommerce_user
Export File: neatifyDB_backup_20260120_143000.sql

📦 Starting export...
✅ Export completed successfully!
📄 File: neatifyDB_backup_20260120_143000.sql
📊 Size: 2.5M

🗜️  Creating compressed backup...
✅ Compressed backup created: neatifyDB_backup_20260120_143000.sql.gz
📊 Compressed size: 450K
```

---

### Import to Render Database

#### Step 1: Get Render Database URL

1. Go to Render Dashboard
2. Click on your PostgreSQL database
3. Copy the **Internal Database URL**
4. Format: `postgresql://user:password@host/database`

#### Step 2: Run Import Script

```bash
./import_db.sh neatifyDB_backup_20260120_143000.sql
```

**You'll be prompted:**
```
🔑 Enter Production Database URL:
Database URL: postgresql://neatify_user:xxx@dpg-xxx.oregon-postgres.render.com/neatify_production
```

**Confirm:**
```
⚠️  WARNING: This will replace ALL data in the target database!
Are you sure you want to continue? (yes/no): yes
```

#### Step 3: Wait for Completion
```
🔄 Starting import...
This may take several minutes...

✅ Import completed successfully!
```

---

## Manual Database Operations

### Manual Export
```bash
pg_dump -h localhost -U ecommerce_user -d ecommerce \
  --no-owner --no-acl --clean --if-exists \
  -f neatifyDB.sql
```

### Manual Import
```bash
# With password prompt
psql "postgresql://user:pass@host:port/database" < neatifyDB.sql

# Or using environment variable
export DATABASE_URL="postgresql://user:pass@host:port/database"
psql $DATABASE_URL < neatifyDB.sql
```

---

## Import to Specific Services

### Render (Recommended)

1. **Get Database URL:**
   - Render Dashboard → Database → Connection Info
   - Use **Internal Database URL**

2. **Import:**
   ```bash
   ./import_db.sh neatifyDB_backup.sql "postgresql://neatify_user:PASSWORD@dpg-XXXXX.oregon-postgres.render.com/neatify_production"
   ```

### Railway

1. **Get Database URL:**
   - Railway Dashboard → PostgreSQL → Variables
   - Copy `DATABASE_URL`

2. **Import:**
   ```bash
   ./import_db.sh neatifyDB_backup.sql "$RAILWAY_DATABASE_URL"
   ```

### Heroku

1. **Get Database URL:**
   ```bash
   heroku config:get DATABASE_URL -a your-app-name
   ```

2. **Import:**
   ```bash
   ./import_db.sh neatifyDB_backup.sql "$(heroku config:get DATABASE_URL)"
   ```

### Supabase

1. **Get Connection String:**
   - Supabase Dashboard → Project Settings → Database
   - Copy connection string

2. **Import:**
   ```bash
   ./import_db.sh neatifyDB_backup.sql "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```

---

## What Gets Exported/Imported

### ✅ Included:
- All product data
- All categories
- User accounts (with hashed passwords)
- Orders and order history
- Cart data
- Reviews and ratings
- Product images (database references)
- All relationships and foreign keys

### ❌ NOT Included:
- Actual image files (in uploads/ folder)
- Environment variables (.env files)
- Application code
- Logs

---

## Handling Image Files

Images are stored in `backend/uploads/` and need separate transfer:

### Option 1: Manual Upload to Cloud Storage

**Use Cloudinary (Recommended):**

1. Create free account at cloudinary.com
2. Upload images from `backend/uploads/products/`
3. Update product image URLs in database:
   ```sql
   UPDATE product_images 
   SET image_url = 'https://res.cloudinary.com/your-cloud/image/upload/...'
   WHERE image_url LIKE 'uploads/products/%';
   ```

### Option 2: Include in Deployment

**For Render:**
- Images uploaded after deployment will be lost on restart
- Use external storage (Cloudinary, AWS S3) for production

---

## Troubleshooting

### Export Fails

**Error: "pg_dump: command not found"**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

**Error: "password authentication failed"**
- Check password in export_db.sh (line 12)
- Default: `commercePASS`

### Import Fails

**Error: "relation already exists"**
- Database has existing data
- Solution: Drop and recreate database:
  ```sql
  DROP DATABASE IF EXISTS neatify_production;
  CREATE DATABASE neatify_production;
  ```

**Error: "connection refused"**
- Check database URL is correct
- Verify database is accessible from your location
- Check firewall/security group settings

**Error: "permission denied"**
- Make sure user has CREATE privileges
- Contact database host support

---

## Best Practices

### Before Export
1. **Test locally** - Ensure app works with current data
2. **Clean up** - Remove test data if needed
3. **Backup** - Keep previous backups

### Before Import
1. **Backup production** - Export existing prod data first
2. **Test connection** - Verify database URL works
3. **Schedule downtime** - Inform users if needed

### After Import
1. **Verify data** - Check products, users, orders
2. **Test functionality** - Login, add to cart, checkout
3. **Monitor logs** - Watch for errors
4. **Update CORS** - Add your domain to allowed origins

---

## Automated Backups

### Daily Backup Script

Create `daily_backup.sh`:
```bash
#!/bin/bash
cd /home/elogic360/Documents/CODELAB/e_commerce&store01
./export_db.sh
# Keep only last 7 days
find . -name "neatifyDB_backup_*.sql" -mtime +7 -delete
find . -name "neatifyDB_backup_*.sql.gz" -mtime +7 -delete
```

### Add to Cron (Linux/macOS)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/elogic360/Documents/CODELAB/e_commerce&store01/daily_backup.sh
```

---

## Database URLs Reference

### Format
```
postgresql://username:password@host:port/database
```

### Common Ports
- PostgreSQL: 5432
- Local: localhost or 127.0.0.1

### Examples
```bash
# Local
postgresql://ecommerce_user:commercePASS@localhost:5432/ecommerce

# Render
postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/neatify_production

# Heroku
postgresql://user:pass@ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5432/d123abc

# Supabase
postgresql://postgres:pass@db.projectid.supabase.co:5432/postgres
```

---

## Security Notes

⚠️ **Important:**
- Never commit database dumps to Git
- Keep credentials secure
- Use environment variables for passwords
- Regularly backup production data
- Test imports on staging first

---

## Quick Reference Commands

```bash
# Export local database
./export_db.sh

# Import to production
./import_db.sh backup.sql

# Import compressed file
./import_db.sh backup.sql.gz

# View file size
du -h neatifyDB_backup*.sql

# Test database connection
psql "postgresql://user:pass@host/db" -c "SELECT version();"

# Count tables after import
psql "postgresql://user:pass@host/db" -c "\dt"

# Count products
psql "postgresql://user:pass@host/db" -c "SELECT COUNT(*) FROM products;"
```

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review database host documentation
3. Verify database URL format
4. Check logs in import output

**Contact:**
- Phone: 0719 883 695 | 0685 395 844
- Location: BIASHARA COMPLEX, Komakoma

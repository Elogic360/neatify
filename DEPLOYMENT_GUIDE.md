# 🚀 Complete Deployment Guide

## Overview
- **Frontend**: Vercel (React + TypeScript)
- **Backend**: Render (FastAPI + PostgreSQL)

---

## Part 1: Deploy Backend to Render 🖥️

### Step 1: Push Code to GitHub
```bash
cd /home/elogic360/Documents/CODELAB/e_commerce&store01
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create PostgreSQL Database

1. **Click "New +"** → **PostgreSQL**
2. **Configure**:
   - Name: `neatify-db`
   - Database: `neatify_production`
   - User: `neatify_user`
   - Region: Oregon (or closest to you)
   - Plan: **Free**
3. **Click "Create Database"**
4. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 4: Deploy Backend Web Service

1. **Click "New +"** → **Web Service**
2. **Connect GitHub Repository**: `Elogic360/ecommerce` (or neatify)
3. **Configure**:
   ```
   Name: neatify-backend
   Region: Oregon
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && alembic upgrade head
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

4. **Add Environment Variables** (click "Advanced"):
   ```env
   DATABASE_URL=<paste-internal-database-url-from-step-3>
   SECRET_KEY=<generate-random-64-char-string>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
   APP_NAME=Neatify
   DEBUG=False
   ENVIRONMENT=production
   ```

   **Generate SECRET_KEY**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```

5. **Click "Create Web Service"**
6. **Wait for deployment** (~5-10 minutes)
7. **Copy your backend URL**: `https://neatify-backend.onrender.com`

### Step 5: Create Admin User

1. Go to Render Dashboard → **neatify-backend** → **Shell**
2. Run:
   ```bash
   cd backend
   python create_admin.py
   ```
3. Follow prompts to create admin account

### Step 6: Test Backend

Visit: `https://neatify-backend.onrender.com/docs`
- You should see FastAPI Swagger documentation
- Test login endpoint

---

## Part 2: Deploy Frontend to Vercel 🌐

### Step 1: Create Production Environment File

Create `frontend/.env.production`:
```env
VITE_API_URL=https://neatify-backend.onrender.com
VITE_APP_NAME=Neatify
VITE_APP_DESCRIPTION=Your one-stop shop for all cleaning supplies
```

**Commit this file**:
```bash
git add frontend/.env.production
git commit -m "Add production environment config"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click **"Add New..."** → **"Project"**
4. **Import** your GitHub repository: `Elogic360/ecommerce`
5. **Configure**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install
   ```

6. **Environment Variables** (click "Environment Variables"):
   ```env
   VITE_API_URL=https://neatify-backend.onrender.com
   VITE_APP_NAME=Neatify
   VITE_APP_DESCRIPTION=Your one-stop shop for all cleaning supplies
   ```

7. Click **"Deploy"**
8. Wait ~2-3 minutes for build
9. **Copy your frontend URL**: `https://neatify.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Step 3: Update Backend CORS

1. Go to Render → **neatify-backend** → **Environment**
2. Update `ALLOWED_ORIGINS`:
   ```
   https://neatify.vercel.app,https://neatify-*.vercel.app
   ```
3. Click **"Save Changes"** (will auto-redeploy)

---

## Part 3: Final Configuration ✅

### Update Frontend API URL (if needed)

If your Vercel domain is different, update:

1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Edit `VITE_API_URL` to match your Render backend URL
3. **Redeploy**: Deployments → Latest → ⋯ → Redeploy

### Add Custom Domain (Optional)

#### Vercel (Frontend)
1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your domain (e.g., `neatify.com`)
3. Update DNS records as shown
4. Wait for SSL certificate

#### Render (Backend)
1. Render Dashboard → neatify-backend → **Settings** → **Custom Domain**
2. Add domain (e.g., `api.neatify.com`)
3. Update DNS records
4. Update `VITE_API_URL` in Vercel

---

## Part 4: Post-Deployment Checklist 📋

### Test Everything

- [ ] Visit frontend: `https://your-app.vercel.app`
- [ ] Homepage loads correctly
- [ ] Products display with images
- [ ] User can browse products
- [ ] Admin login works: `/login`
- [ ] Admin panel accessible
- [ ] Can create products with images
- [ ] Cart functionality works
- [ ] Orders can be placed
- [ ] Backend API docs: `https://your-backend.onrender.com/docs`

### Monitor

**Vercel:**
- Dashboard → Analytics (free tier: 100k requests/month)
- Deployments → View logs

**Render:**
- Dashboard → Metrics
- Logs tab for errors
- Database → Metrics

---

## Part 5: Maintenance 🔧

### Update Deployment

**Frontend:**
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys
```

**Backend:**
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys
```

### Database Backups

Render Free PostgreSQL:
- No automatic backups on free tier
- Manual backup via CLI:
  ```bash
  pg_dump <database-url> > backup.sql
  ```

### Scaling (Paid Plans)

**Render:**
- Upgrade to Starter ($7/mo) for better performance
- Pro ($25/mo) for production use

**Vercel:**
- Free tier: Good for starting
- Pro ($20/mo): Custom domains, more bandwidth

---

## Troubleshooting 🔍

### Frontend Not Loading
- Check Vercel build logs
- Verify `VITE_API_URL` environment variable
- Check browser console for errors

### Backend Not Responding
- Check Render logs for errors
- Verify DATABASE_URL is set correctly
- Check if free tier is sleeping (takes ~30s to wake)

### CORS Errors
- Update `ALLOWED_ORIGINS` in Render backend
- Include all Vercel preview URLs: `https://*.vercel.app`

### Database Connection Issues
- Use **Internal Database URL** not External
- Format: `postgresql://user:pass@host/db`

### Images Not Showing
- Render free tier has no persistent storage
- Consider using Cloudinary or AWS S3 for images

---

## Environment Variables Summary

### Backend (Render)
```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-64-char-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=https://your-app.vercel.app
APP_NAME=Neatify
DEBUG=False
ENVIRONMENT=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://neatify-backend.onrender.com
VITE_APP_NAME=Neatify
VITE_APP_DESCRIPTION=Your one-stop shop for all cleaning supplies
```

---

## Cost Breakdown 💰

### Free Tier (Both Services)
- Render PostgreSQL: 90 days free trial
- Render Web Service: 750 hours/month (enough for 1 service)
- Vercel: 100GB bandwidth, unlimited deployments

### Limitations
- Render free tier: Spins down after 15min inactivity
- No automatic backups
- 512MB RAM on Render free

### Recommended for Production
- Render Starter: $7/mo (always on)
- Vercel Pro: $20/mo (better support)
- Total: ~$27/mo for reliable service

---

## 🎉 Success!

Your Neatify e-commerce platform is now live!

**Frontend**: https://your-app.vercel.app  
**Backend**: https://neatify-backend.onrender.com  
**API Docs**: https://neatify-backend.onrender.com/docs

**Admin Login**: /login  
**Contact**: 0719 883 695 | 0685 395 844  
**Location**: BIASHARA COMPLEX, Komakoma

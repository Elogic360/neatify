# 🚀 CommerceHub E-Commerce Deployment Guide

This guide will help you deploy the CommerceHub E-Commerce platform to **Netlify** (frontend) and **Render** (backend + PostgreSQL database).

## 📋 Prerequisites

- GitHub repository with the CommerceHub codebase
- Netlify account
- Render account
- Domain name (optional but recommended)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Netlify       │    │     Render      │    │   Render        │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - React + Vite  │    │ - FastAPI       │    │ - Managed DB    │
│ - TypeScript    │    │ - PostgreSQL    │    │ - Auto-backup   │
│ - Tailwind CSS  │    │ - JWT Auth      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌐 Frontend Deployment (Netlify)

### Step 1: Connect Repository
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:

### Step 2: Build Configuration
```
Base directory: frontend/
Build command: npm run build
Publish directory: dist
```

### Step 3: Environment Variables
Add these environment variables in Netlify:

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api/v1
VITE_APP_NAME=CommerceHub
VITE_APP_VERSION=1.5.0
VITE_APP_ENV=production
```

### Step 4: Deploy
- Netlify will automatically build and deploy
- Your site will be available at `https://your-site-name.netlify.app`

## 🔧 Backend Deployment (Render)

### Step 1: Database Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "PostgreSQL"
3. Configure:
   - Name: `commercehub-db`
   - Database: `commercehub_production`
   - User: `commercehub_user`
   - Region: Oregon (recommended)

### Step 2: Backend API Setup
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:

#### Build & Deploy Settings:
```
Runtime: Python 3
Build Command: cd backend && pip install -r requirements.txt && alembic upgrade head
Start Command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### Environment Variables:
```
DATABASE_URL=postgresql://[from-database-connection-string]
SECRET_KEY=[generate-random-key]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

### Step 3: Database Migration
The build command will automatically run database migrations.

## 🔗 Connecting Frontend to Backend

### Update Netlify Environment Variables
Once your Render backend is deployed, update the Netlify environment variable:

```
VITE_API_URL=https://your-render-service.onrender.com/api/v1
```

### CORS Configuration
Make sure your Render backend allows requests from your Netlify domain:

```
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

## 🗄️ Database Setup

### Initial Admin User
After deployment, create an admin user:

```bash
# SSH into your Render backend or run via Render shell
cd backend
python create_admin.py
```

Default credentials:
- Email: `admin@commercehub.com`
- Password: `admin123` (change immediately!)

## 🔒 Security Checklist

### Before Going Live:
- [ ] Change default admin password
- [ ] Generate new `SECRET_KEY`
- [ ] Update `ALLOWED_ORIGINS` to your actual domain
- [ ] Enable HTTPS (Netlify does this automatically)
- [ ] Set up monitoring and logging
- [ ] Configure backup policies for database

### Environment Variables:
- [ ] `SECRET_KEY`: 64+ character random string
- [ ] `DATABASE_URL`: From Render PostgreSQL
- [ ] `ALLOWED_ORIGINS`: Your Netlify domain
- [ ] `VITE_API_URL`: Your Render backend URL

## 🚀 Post-Deployment Steps

1. **Test the Application:**
   - Visit your Netlify URL
   - Try user registration
   - Test admin login
   - Verify product management

2. **Monitor Performance:**
   - Check Render logs
   - Monitor Netlify build status
   - Set up uptime monitoring

3. **Set up Custom Domain (Optional):**
   - Netlify: Add custom domain in site settings
   - Update `ALLOWED_ORIGINS` in Render

## 🐛 Troubleshooting

### Common Issues:

**CORS Errors:**
- Check `ALLOWED_ORIGINS` in Render environment variables
- Ensure it matches your Netlify domain exactly

**Database Connection:**
- Verify `DATABASE_URL` is correct
- Check Render PostgreSQL service is running

**Build Failures:**
- Check build logs in Netlify/Render
- Ensure all dependencies are in `requirements.txt`/`package.json`

**API Not Responding:**
- Check Render service logs
- Verify environment variables are set correctly

## 📊 Performance Optimization

### Netlify:
- Enable asset optimization
- Set up proper caching headers
- Use Netlify's CDN

### Render:
- Choose appropriate instance size
- Monitor memory usage
- Set up auto-scaling if needed

## 🔄 Updates and Maintenance

- Push changes to `main` branch for automatic deployment
- Monitor both Netlify and Render dashboards
- Set up alerts for downtime or errors

## 📞 Support

If you encounter issues:
1. Check the logs in Netlify/Render dashboards
2. Verify environment variables
3. Test locally with production settings
4. Check the CommerceHub documentation

---

**🎉 Your CommerceHub E-Commerce platform is now live!**</content>
<parameter name="filePath">/home/elogic360/Documents/CODELAB/e_commerce&store01/DEPLOYMENT_README.md
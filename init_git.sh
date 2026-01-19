#!/bin/bash
cd /home/elogic360/Documents/CODELAB/e_commerce&store

echo "Initializing Git repository..."
git init

echo "Adding remote origin..."
git remote add origin https://github.com/Elogic360/ecommerce-store.git

echo "Adding all files..."
git add .

echo "Creating initial commit..."
git commit -m "Initial commit: ShopHub E-Commerce Platform

- Full-stack e-commerce application
- FastAPI backend with PostgreSQL
- React TypeScript frontend with Tailwind CSS
- Admin dashboard with product management
- Shopping cart and order system
- JWT authentication and security
- File upload for product images
- Comprehensive documentation and setup"

echo "Pushing to GitHub..."
git push -u origin main

echo "Setup complete!"
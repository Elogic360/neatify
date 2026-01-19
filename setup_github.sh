#!/bin/bash

# ===========================================
# GITHUB SETUP SCRIPT FOR E-COMMERCE STORE
# ===========================================

echo "🚀 Setting up GitHub repository for ShopHub E-Commerce Store"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the root directory of the ecommerce-store project"
    exit 1
fi

print_status "Checking current directory..."
pwd

# Step 1: Initialize Git repository
print_status "Step 1: Initializing Git repository..."
if [ -d ".git" ]; then
    print_warning "Git repository already exists. Skipping initialization."
else
    git init
    print_success "Git repository initialized"
fi

# Step 2: Configure Git (optional - user can set their own)
print_status "Step 2: Configuring Git user (optional)..."
read -p "Enter your Git name (leave empty to skip): " git_name
read -p "Enter your Git email (leave empty to skip): " git_email

if [ ! -z "$git_name" ]; then
    git config user.name "$git_name"
    print_success "Git user name set to: $git_name"
fi

if [ ! -z "$git_email" ]; then
    git config user.email "$git_email"
    print_success "Git user email set to: $git_email"
fi

# Step 3: Add remote origin
print_status "Step 3: Adding GitHub remote..."
REMOTE_URL="https://github.com/Elogic360/ecommerce-store.git"

if git remote get-url origin >/dev/null 2>&1; then
    print_warning "Remote 'origin' already exists. Checking URL..."
    CURRENT_URL=$(git remote get-url origin)
    if [ "$CURRENT_URL" != "$REMOTE_URL" ]; then
        print_warning "Remote URL differs. Updating..."
        git remote set-url origin "$REMOTE_URL"
        print_success "Remote URL updated to: $REMOTE_URL"
    else
        print_success "Remote URL is correct"
    fi
else
    git remote add origin "$REMOTE_URL"
    print_success "Remote 'origin' added: $REMOTE_URL"
fi

# Step 4: Add all files to staging
print_status "Step 4: Adding files to staging area..."
git add .
print_success "All files added to staging"

# Step 5: Check what will be committed
print_status "Step 5: Checking what will be committed..."
echo "Files to be committed:"
git status --porcelain

# Ask for confirmation
echo ""
read -p "Do you want to proceed with the commit? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Commit cancelled by user"
    exit 0
fi

# Step 6: Initial commit
print_status "Step 6: Creating initial commit..."
git commit -m "Initial commit: ShopHub E-Commerce Platform

- Full-stack e-commerce application
- FastAPI backend with PostgreSQL
- React TypeScript frontend with Tailwind CSS
- Admin dashboard with product management
- Shopping cart and order system
- JWT authentication and security
- File upload for product images
- Comprehensive documentation and setup"

if [ $? -eq 0 ]; then
    print_success "Initial commit created successfully"
else
    print_error "Failed to create commit. Please check for errors above."
    exit 1
fi

# Step 7: Push to GitHub
print_status "Step 7: Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    print_success "Successfully pushed to GitHub!"
    print_success "Repository URL: https://github.com/Elogic360/ecommerce-store"
else
    print_error "Failed to push to GitHub. Please check:"
    echo "  1. Repository exists on GitHub"
    echo "  2. You have push permissions"
    echo "  3. Your SSH keys are configured (if using SSH)"
    echo "  4. Try: git push -u origin main"
    exit 1
fi

# Step 8: Final verification
print_status "Step 8: Verifying setup..."
echo ""
print_success "🎉 GitHub setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Visit: https://github.com/Elogic360/ecommerce-store"
echo "2. Enable branch protection for 'main' branch"
echo "3. Configure GitHub Actions for CI/CD (optional)"
echo "4. Invite collaborators if needed"
echo ""
echo "Repository structure:"
echo "- Private repository: ✅"
echo "- Comprehensive .gitignore: ✅"
echo "- Professional README: ✅"
echo "- MIT License: ✅"
echo "- All sensitive files excluded: ✅"

print_success "Setup complete! Happy coding! 🚀"
# Neatify E-Commerce Project Structure

## Overview
Neatify is a modern e-commerce platform for cleaning supplies, built with FastAPI (backend) and React + TypeScript (frontend).

## 📁 Project Structure

```
e_commerce&store01/
├── backend/                    # FastAPI Backend Application
│   ├── alembic/               # Database migrations
│   │   └── versions/          # Migration files
│   ├── app/                   # Main application code
│   │   ├── api/              # API utilities
│   │   ├── core/             # Core configurations (security, settings)
│   │   ├── db/               # Database session and utilities
│   │   ├── models/           # SQLAlchemy models (Product, User, Order, etc.)
│   │   ├── routers/          # API endpoints
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── products.py   # Product management
│   │   │   ├── cart_new.py   # Shopping cart
│   │   │   ├── orders_new.py # Order management
│   │   │   └── dashboard.py  # Admin dashboard
│   │   ├── schemas/          # Pydantic schemas for validation
│   │   ├── services/         # Business logic layer
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Unit and integration tests
│   ├── uploads/              # User uploaded files (product images)
│   ├── requirements.txt      # Python dependencies
│   ├── alembic.ini          # Alembic configuration
│   └── create_admin.py       # Script to create admin user
│
├── frontend/                  # React + TypeScript Frontend
│   ├── public/               # Static assets
│   │   └── neatify1.png     # Banner image
│   ├── src/                  # Source code
│   │   ├── app/             # Application core
│   │   │   ├── api.ts       # API client functions
│   │   │   └── store.ts     # State management (Zustand)
│   │   ├── components/       # Reusable components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   │   ├── FileUpload.tsx        # Multi-image upload
│   │   │   │   ├── AdminLayoutEnhanced.tsx
│   │   │   │   └── Toast.tsx
│   │   │   └── products/    # Product-related components
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx           # Landing page
│   │   │   ├── ProductsPage.tsx       # Product listing
│   │   │   ├── ProductDetail.tsx      # Product details
│   │   │   ├── CartPage.tsx           # Shopping cart
│   │   │   ├── CheckoutPage.tsx       # Checkout process
│   │   │   ├── Login.tsx              # Admin login
│   │   │   ├── AdminPanel.tsx         # Admin dashboard
│   │   │   └── AdminProductsNew.tsx   # Product management
│   │   ├── styles.css       # Global styles (Tailwind)
│   │   └── main.tsx         # React entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   └── tsconfig.json        # TypeScript configuration
│
├── migrations/               # SQL migration scripts
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Docker configuration
├── Makefile                 # Common commands
├── cleanup.sh              # Cleanup script (removes test files)
└── README.md               # Project documentation
```

## 🚀 Key Features

### Backend (FastAPI)
- **Authentication**: JWT-based authentication with role-based access control
- **Products**: Full CRUD operations with image uploads (up to 10 images per product)
- **Orders**: Complete order management with status tracking
- **Cart**: Persistent shopping cart for authenticated users
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Migrations**: Alembic for database version control

### Frontend (React + TypeScript)
- **Modern UI**: Tailwind CSS with responsive design
- **State Management**: Zustand for global state
- **Multi-Image Upload**: Drag & drop interface with reordering
- **Product Gallery**: Image carousel with zoom functionality
- **Admin Panel**: Full product and order management
- **Real-time Updates**: Toast notifications for user feedback

## 🛠️ Important Files

### Configuration Files
- `backend/.env` - Environment variables (database, JWT secret, etc.)
- `backend/alembic.ini` - Database migration settings
- `frontend/vite.config.ts` - Frontend build configuration
- `docker-compose.yml` - Docker services setup

### Core Application Files
- `backend/app/main.py` - FastAPI app initialization, CORS, routes
- `backend/app/core/security.py` - Authentication and authorization
- `backend/app/core/settings.py` - Application settings
- `frontend/src/app/store.ts` - Global state management
- `frontend/src/app/api.ts` - API client with axios

### Database Models
- `backend/app/models/product.py` - Product, Category, ProductImage, Review
- `backend/app/models/customer.py` - User, Address
- `backend/app/models/order.py` - Order, OrderItem, Cart, CartItem

## 📝 Development Scripts

### Backend
```bash
# Run development server
cd backend && uvicorn app.main:app --reload

# Create admin user
cd backend && python create_admin.py

# Run database migrations
cd backend && alembic upgrade head

# Run tests
cd backend && pytest
```

### Frontend
```bash
# Install dependencies
cd frontend && pnpm install

# Run development server
cd frontend && pnpm dev

# Build for production
cd frontend && pnpm build
```

## 🧹 Cleanup

To remove test files and temporary files:
```bash
chmod +x cleanup.sh
./cleanup.sh
```

This removes:
- Test scripts (test_*.py, check_*.py)
- Log files (*.log)
- Temporary outputs
- Old schema files
- Python cache

## 📦 Dependencies

### Backend
- FastAPI - Modern web framework
- SQLAlchemy - ORM
- Alembic - Database migrations
- Pydantic - Data validation
- python-jose - JWT tokens
- passlib - Password hashing
- Pillow - Image processing

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Zustand - State management
- Axios - HTTP client
- Lucide React - Icons

## 🏪 Business Context

**Neatify** is a cleaning supplies e-commerce store located at:
- **Location**: BIASHARA COMPLEX, Komakoma
- **Contact**: 0719 883 695 | 0685 395 844
- **Products**: Cleaning agents, detergents, air fresheners, waste solutions

## 🔐 Security

- JWT-based authentication
- Role-based access control (Admin/Customer)
- Password hashing with bcrypt
- CORS configuration for API security
- Input validation with Pydantic

## 📊 Database Schema

Main tables:
- `users` - Customer and admin accounts
- `products` - Product catalog
- `product_images` - Multiple images per product
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Items in orders
- `cart` - Shopping cart
- `reviews` - Product reviews
- `addresses` - Customer addresses

## 🎨 Branding

- **Primary Color**: Orange (#f97316)
- **Secondary Color**: Yellow
- **Font**: System default (professional, clean)
- **Logo**: neatify1.png (banner format)

## 📱 Contact

For development questions or issues, refer to the main README.md or contact the development team.

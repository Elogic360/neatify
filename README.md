# ShopHub E-Commerce Platform

A full-stack e-commerce platform built with FastAPI (Python) backend and React TypeScript frontend, featuring a comprehensive admin system for product management.

## Features

### User Features
- 🛍️ Browse products with advanced filtering and search
- 🛒 Shopping cart management
- ⭐ Product reviews and ratings
- 👤 User authentication and profile management
- 📦 Order tracking
- 🎯 Category-based navigation

### Admin Features
- ➕ Add, edit, and delete products
- 📸 Multiple image upload per product
- 🏷️ Category management
- 📊 Dashboard with statistics and revenue tracking
- 💰 Price and inventory management with audit logs
- 🎨 Product variations (colors, sizes, etc.)
- ✨ Featured products control
- 👥 User management (view, edit, delete users)
- 📦 Order management with status updates
- 📈 Inventory tracking and low stock alerts
- 🔍 Advanced search and filtering
- 📋 Comprehensive reporting and analytics

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Alembic** - Database migrations

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd e_commerce&store
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb ecommerce_db

# Or using psql:
psql -U postgres
CREATE DATABASE ecommerce_db;
\q

# Run migrations
alembic upgrade head
```

### 4. Create Admin User

Create a Python script `create_admin.py`:

```python
from app.db.session import SessionLocal
from app.models.customer import User
from app.core.security import get_password_hash

db = SessionLocal()

admin = User(
    email="admin@shophub.com",
    username="admin",
    full_name="Admin User",
    hashed_password=get_password_hash("admin123"),
    is_admin=True,
    is_active=True
)

db.add(admin)
db.commit()
print("Admin user created successfully!")
```

Run it:
```bash
python create_admin.py
```

### 5. Start Backend Server

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Backend will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

### 6. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## Project Structure

```
e_commerce&store/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py          # Authentication endpoints
│   │   │       ├── products.py      # Product management
│   │   │       └── cart.py          # Shopping cart
│   │   ├── core/
│   │   │   ├── config.py            # App configuration
│   │   │   └── security.py          # JWT & password hashing
│   │   ├── db/
│   │   │   ├── base.py              # SQLAlchemy base
│   │   │   └── session.py           # Database session
│   │   ├── models/                  # Database models
│   │   ├── schemas/                 # Pydantic schemas
│   │   └── main.py                  # FastAPI app entry
│   ├── uploads/                     # Product images
│   ├── .env                         # Environment variables
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── pages/
│   │   │   ├── Homepage.tsx         # Main user page
│   │   │   ├── AdminDashboard.tsx   # Admin panel
│   │   │   └── ProductDetail.tsx    # Product details
│   │   ├── app/
│   │   │   ├── api.ts               # API client
│   │   │   └── store.ts             # State management
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Products (Public)
- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/{id}` - Get product details
- `GET /api/v1/products/{id}/reviews` - Get product reviews

### Products (Admin)
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/{id}` - Update product
- `DELETE /api/v1/admin/products/{id}` - Delete product
- `POST /api/v1/admin/products/{id}/images` - Upload images

### Cart
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart` - Add item to cart
- `PUT /api/v1/cart/{id}` - Update cart item
- `DELETE /api/v1/cart/{id}` - Remove from cart

### Admin Dashboard
- `GET /api/v1/admin/dashboard/stats` - Get dashboard statistics

### Admin Users
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/users/{id}` - Get user details
- `PUT /api/v1/admin/users/{id}` - Update user
- `DELETE /api/v1/admin/users/{id}` - Delete user

### Admin Orders
- `GET /api/v1/admin/orders` - List all orders
- `GET /api/v1/admin/orders/{id}` - Get order details
- `PUT /api/v1/admin/orders/{id}/status` - Update order status
- `PUT /api/v1/admin/orders/{id}/payment-status` - Update payment status

### Admin Inventory
- `GET /api/v1/admin/inventory/logs` - Get inventory logs
- `POST /api/v1/admin/inventory/adjust` - Adjust stock levels
- `GET /api/v1/admin/inventory/low-stock` - Get low stock alerts

### Admin Categories
- `GET /api/v1/admin/categories` - List categories
- `POST /api/v1/admin/categories` - Create category
- `PUT /api/v1/admin/categories/{id}` - Update category
- `DELETE /api/v1/admin/categories/{id}` - Delete category

## Database Schema

### Main Tables
- **users** - User accounts and authentication
- **addresses** - Shipping addresses
- **products** - Product catalog with pricing and inventory
- **categories** - Product categories
- **product_images** - Product photos and media
- **product_variations** - Product variants (size, color)
- **cart_items** - Shopping cart contents
- **orders** - Customer orders and transactions
- **order_items** - Order line items
- **reviews** - Product reviews and ratings
- **inventory_logs** - Stock change audit trail

## Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce_db

# Security & Authentication
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Application Settings
APP_NAME=ShopHub E-Commerce
DEBUG=True
LOG_LEVEL=INFO

# File Upload Configuration
UPLOAD_DIR=uploads/products
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.gif,.webp

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$...

# API Configuration
API_V1_PREFIX=/api/v1
DOCS_URL=/docs
REDOC_URL=/redoc
```

### Frontend (.env)
```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api/v1

# App Configuration
VITE_APP_NAME=My E-Commerce Store
VITE_APP_DESCRIPTION=Your one-stop shop for everything

# Payment Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Feature Flags
VITE_ENABLE_CART_PERSISTENCE=true
VITE_ENABLE_WISHLIST=true
VITE_ENABLE_REVIEWS=true

# Currency & Localization
VITE_DEFAULT_CURRENCY=USD
VITE_DEFAULT_LANGUAGE=en
```

## Usage

### Admin Access
1. Navigate to http://localhost:5173/admin
2. Login with admin credentials:
   - Email: admin@shophub.com
   - Password: admin123

### Adding Products
1. Go to Admin Dashboard
2. Click "Products" tab
3. Click "Add Product" button
4. Fill in product details
5. Add images and categories
6. Save product

### User Shopping
1. Navigate to http://localhost:5173
2. Browse products
3. Add items to cart
4. Proceed to checkout

## System Verification

After setup, run the integration test to verify everything is working:

```bash
cd backend
python test_integration.py
```

This will test:
- Database connectivity
- Table existence
- Admin user setup
- API endpoints
- Authentication
- Dashboard functionality
- Inventory system

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists: `createdb ecommerce_db`

**Admin Login Not Working**
- Ensure admin user exists in database
- Check password hash in create_admin.py
- Verify JWT secret key

**API Returns 500 Error**
- Check backend logs
- Verify all dependencies are installed
- Ensure database migrations are applied

**Frontend Not Loading**
- Check if backend is running on port 8000
- Verify VITE_API_URL in frontend/.env
- Check browser console for errors

**Images Not Uploading**
- Ensure uploads/products directory exists
- Check file permissions
- Verify ALLOWED_EXTENSIONS in backend config

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Production Deployment

### Backend
1. Set production environment variables
2. Use gunicorn or uvicorn with workers
3. Set up reverse proxy (Nginx)
4. Enable HTTPS
5. Configure PostgreSQL for production

### Frontend
```bash
npm run build
# Deploy dist/ folder to hosting service
```

## Security Considerations

- Change SECRET_KEY in production
- Use strong passwords
- Enable HTTPS
- Implement rate limiting
- Validate all user inputs
- Use parameterized queries (SQLAlchemy handles this)
- Keep dependencies updated

## Performance Optimization

- Use database indexes
- Implement caching (Redis)
- Optimize images
- Enable CDN for static assets
- Use database connection pooling
- Implement pagination for large datasets

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] Product recommendations
- [ ] Wishlist feature
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Social media integration

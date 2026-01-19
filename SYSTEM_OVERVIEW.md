# ShopHub E-Commerce System - Complete Overview

## 🎯 System Architecture

This is a full-stack e-commerce application with:
- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL
- **Authentication**: JWT Bearer Tokens

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up database
# Ensure PostgreSQL is running and credentials match .env file

# Run migrations
alembic upgrade head

# Create admin user
python create_admin.py

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```

---

## 📋 Features Implemented

### ✅ Backend APIs

#### Authentication
- `/api/v1/auth/login` - User login with JWT
- `/api/v1/auth/register` - User registration
- `/api/v1/auth/me` - Get current user info

#### Products
- `/api/v1/products` - List products (with filtering, search, pagination)
- `/api/v1/products/{id}` - Get product details
- `/api/v1/products/{id}/reviews` - Get/Create reviews
- `/api/v1/admin/products` - Admin CRUD operations
- `/api/v1/admin/products/{id}/images` - Upload/Delete images

#### Categories
- `/api/v1/categories` - List all categories
- `/api/v1/admin/categories` - Admin CRUD for categories

#### Cart
- `/api/v1/cart` - Get user's cart
- `/api/v1/cart` (POST) - Add item to cart
- `/api/v1/cart/{id}` (PUT) - Update cart item
- `/api/v1/cart/{id}` (DELETE) - Remove from cart
- `/api/v1/cart` (DELETE) - Clear entire cart

#### Orders
- `/api/v1/orders` - Create and manage orders
- Supports both guest and registered users

#### Admin
- `/api/v1/admin/users` - User management
- `/api/v1/admin/stats` - Dashboard statistics
- `/api/v1/admin/inventory` - Inventory management
- `/api/v1/admin/inventory/adjust` - Stock adjustments
- `/api/v1/admin/inventory/logs` - Inventory change logs

### ✅ Frontend Pages

- **HomePage**: Product browsing, search, categories
- **Login**: Authentication
- **AdminPanel**: Admin dashboard with navigation
- **AdminDashboard**: Statistics overview
- **AdminUsers**: User management
- **AdminProducts**: Product management
- **AdminOrders**: Order management
- **AdminInventory**: Stock management

---

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: bcrypt for password storage
3. **Role-Based Access**: Admin vs User permissions
4. **CORS Protection**: Configured allowed origins
5. **SQL Injection Prevention**: SQLAlchemy ORM
6. **Input Validation**: Pydantic schemas

---

## ⚡ Performance Optimizations

1. **Database Connection Pooling**
   - Pool size: 5
   - Max overflow: 10
   - Pool timeout: 30s
   - Connection recycling: 1 hour

2. **Query Optimization**
   - Eager loading with `joinedload` to prevent N+1 queries
   - Indexed columns for faster lookups
   - Pagination on all list endpoints

3. **Frontend Optimization**
   - Vite for fast build times
   - Code splitting
   - Image lazy loading
   - API request caching in Zustand store

---

## 📦 Database Schema

### Core Tables
- `users`: User accounts with roles
- `products`: Product catalog
- `categories`: Product categories
- `product_images`: Product images
- `product_variations`: Product variants (size, color, etc.)
- `cart_items`: Shopping cart
- `orders`: Customer orders
- `order_items`: Order line items
- `reviews`: Product reviews
- `inventory_logs`: Stock change tracking
- `addresses`: User addresses

### Relationships
- Users → Orders (one-to-many)
- Users → Cart Items (one-to-many)
- Users → Reviews (one-to-many)
- Products → Images (one-to-many)
- Products → Categories (many-to-many)
- Products → Reviews (one-to-many)
- Orders → Order Items (one-to-many)

---

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173
API_V1_STR=/api/v1
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python test_db_connection.py  # Test database connection
python verify_admin_password.py  # Verify admin login
```

### Frontend Tests
```bash
cd frontend
pnpm test
```

---

## 📊 Admin Credentials

Default admin account (change after first login):
- **Email**: admin@shophub.com
- **Password**: admin123

---

## 🐛 Troubleshooting

### Database Connection Issues
1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify credentials in `.env`
3. Test connection: `python backend/test_db_connection.py`

### Authentication Issues
1. Check SECRET_KEY in `.env` matches between requests
2. Verify token is being sent in Authorization header
3. Check token expiration (default: 30 minutes)

### CORS Errors
1. Verify frontend URL in `ALLOWED_ORIGINS`
2. Check Vite proxy configuration
3. Ensure credentials are included in requests

---

## 🔄 API Flow Examples

### User Registration & Login
```typescript
// 1. Register
POST /api/v1/auth/register
Body: { email, username, password, full_name }

// 2. Login
POST /api/v1/auth/login
Body: FormData { username: email, password }
Response: { access_token, token_type }

// 3. Get user info
GET /api/v1/auth/me
Headers: { Authorization: "Bearer <token>" }
```

### Shopping Flow
```typescript
// 1. Browse products
GET /api/v1/products?limit=20&is_featured=true

// 2. Add to cart
POST /api/v1/cart
Body: { product_id, quantity, variation_id? }

// 3. View cart
GET /api/v1/cart

// 4. Create order
POST /api/v1/orders
Body: { address_id, payment_method, items }
```

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Order tracking
- [ ] Product recommendations
- [ ] Advanced search with filters
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Real-time inventory updates
- [ ] Analytics dashboard

---

## 👨‍💻 Development Guidelines

### Code Style
- **Backend**: Follow PEP 8
- **Frontend**: ESLint + Prettier configured
- **Commits**: Use conventional commits

### API Design
- RESTful principles
- Consistent error responses
- Proper HTTP status codes
- Comprehensive validation

### Database
- Always use migrations for schema changes
- Never expose sensitive data
- Use transactions for multi-step operations
- Index frequently queried columns

---

## 📝 License

Proprietary - All rights reserved

---

## 📧 Support

For issues or questions, contact the development team.

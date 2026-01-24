
# Phase 4: Backend Connection & Verification Guide

Excellent! Since you've already handled the database creation and updated the `.env` file, let's proceed to connect your FastAPI backend and verify everything is working.

---

## 🚀 Step 1: Navigate to the Backend Directory

Open your terminal and change into the backend project folder:

```bash
cd backend
```

---

## 🐍 Step 2: Activate Your Python Virtual Environment

It's crucial to work within your project's isolated environment.

```bash
source venv/bin/activate
```

---

## ✅ Step 3: Install Backend Dependencies (If You Haven't Already)

If you skipped this earlier or want to ensure all packages are up-to-date:

```bash
pip install -r requirements.txt
```

---

## ▶️ Step 4: Start the FastAPI Backend Server

This command will run your FastAPI application. It will also trigger SQLAlchemy to create all the tables in your 'ecommerce' database based on the models we defined.

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see output indicating that the server is running, typically on `http://127.0.0.1:8000` or `http://localhost:8000`.

---

## ✨ Step 5: Verify Backend Connection and Functionality

While the server is running, perform these checks:

### 1. Access the API Documentation

Open your web browser and go to:
[http://localhost:8000/docs](http://localhost:8000/docs)

You should see the interactive Swagger UI for your FastAPI application. This confirms that your backend is running and the API definitions are loaded. If you see this, it means your database connection was successful and the tables were created!

### 2. Create an Admin User (Highly Recommended for Testing)

To test authentication and admin features, create an admin user using the script detailed in the `README.md`.

First, **stop the running uvicorn server** (Ctrl+C in the terminal where it's running).

Then, still in the `backend` directory and with your virtual environment activated, run:

```bash
# Create a new file create_admin.py in the backend directory with the following content:
# from app.db.session import SessionLocal
# from app.models.customer import User
# from app.core.security import get_password_hash

# db = SessionLocal()

# admin = User(
#     email="admin@commercehub.com",
#     username="admin",
#     full_name="Admin User",
#     hashed_password=get_password_hash("admin123"),
#     is_admin=True,
#     is_active=True
# )

# db.add(admin)
# db.commit()
# print("Admin user created successfully!")
```

```bash
python create_admin.py
```

This will create an admin user with email `admin@commercehub.com` and password `admin123`.

### 3. Restart the Backend Server and Test Admin Login

Restart the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Go to [http://localhost:8000/docs](http://localhost:8000/docs), click on the 'Authorize' button (top right), and try logging in with the admin credentials (`admin@commercehub.com`, `admin123`). This verifies that your authentication routes and user model are correctly interacting with the database.

---

Once you confirm these steps are successful, your backend is fully integrated with your PostgreSQL database!

Let me know when you've gone through these steps, and we can then move on to resolving frontend issues.


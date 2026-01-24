"""
Admin Dashboard Router
Provides dashboard statistics, charts data, and quick overviews for admin panel
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from app.db.session import get_db
from app.models.customer import User
from app.models.product import Product, Category
from app.models.order import Order, OrderItem
from app.core.security import get_current_admin_user

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get main dashboard statistics"""
    # Calculate date boundaries
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    month_start = today.replace(day=1)
    month_start_dt = datetime.combine(month_start, datetime.min.time())
    
    # Get all stats in fewer queries
    # Basic counts
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    
    # Revenue queries combined
    revenue_stats = db.query(
        func.coalesce(func.sum(Order.total_amount), 0).label('total_revenue'),
        # Count orders created today
        func.count(
            case((Order.created_at >= today_start, Order.id), else_=None)
        ).label('today_orders'),
        # Sum revenue for today
        func.coalesce(
            func.sum(
                case((Order.created_at >= today_start, Order.total_amount), else_=0)
            ),
            0
        ).label('today_revenue'),
        # Count orders for current month
        func.count(
            case((Order.created_at >= month_start_dt, Order.id), else_=None)
        ).label('monthly_orders'),
        # Sum revenue for current month
        func.coalesce(
            func.sum(
                case((Order.created_at >= month_start_dt, Order.total_amount), else_=0)
            ),
            0
        ).label('monthly_revenue')
    ).filter(Order.payment_status == "paid").first()
    
    total_revenue, today_orders, today_revenue, monthly_orders, monthly_revenue = revenue_stats
    
    # Pending orders and low stock
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_(["pending", "processing"])
    ).scalar() or 0
    
    low_stock_count = db.query(func.count(Product.id)).filter(
        Product.stock < 10,
        Product.is_active == True
    ).scalar() or 0
    
    # Calculate last month revenue for growth comparison
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_end = month_start - timedelta(days=1)
    
    last_month_revenue = db.query(
        func.coalesce(func.sum(Order.total_amount), 0)
    ).filter(
        Order.created_at >= last_month_start,
        Order.created_at <= last_month_end,
        Order.payment_status == "paid"
    ).scalar() or 0
    
    revenue_growth = 0.0
    if float(last_month_revenue) > 0:
        revenue_growth = ((float(monthly_revenue) - float(last_month_revenue)) / float(last_month_revenue)) * 100
    
    # Status breakdown
    status_breakdown = {}
    status_counts = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    for status, count in status_counts:
        status_breakdown[status] = count
    
    # Top products
    top_products = db.query(
        Product.id,
        Product.name,
        Product.primary_image,
        func.coalesce(func.sum(OrderItem.quantity), 0).label('total_sold')
    ).join(OrderItem, OrderItem.product_id == Product.id, isouter=True
    ).join(Order, Order.id == OrderItem.order_id, isouter=True
    ).filter(Product.is_active == True
    ).group_by(Product.id
    ).order_by(desc('total_sold')
    ).limit(6).all()
    
    # Recent orders
    recent_orders = db.query(
        Order.id,
        User.full_name.label('customer_name'),
        Order.total_amount,
        Order.status,
        Order.created_at
    ).join(User, User.id == Order.user_id
    ).order_by(desc(Order.created_at)
    ).limit(5).all()
    
    # Low stock products
    low_stock_products = db.query(
        Product.id,
        Product.name,
        Product.stock
    ).filter(
        Product.stock < 10,
        Product.is_active == True
    ).order_by(Product.stock
    ).limit(5).all()
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "monthly_revenue": float(monthly_revenue),
        "last_month_revenue": float(last_month_revenue),
        "revenue_growth": revenue_growth,
        "monthly_orders": monthly_orders,
        "status_breakdown": status_breakdown,
        "pending_orders": pending_orders,
        "low_stock_count": low_stock_count,
        "top_products": [
            {
                "id": p.id,
                "name": p.name,
                "primary_image": p.primary_image,
                "total_sold": int(p.total_sold)
            } for p in top_products
        ],
        "recent_orders": [
            {
                "id": o.id,
                "customer_name": o.customer_name,
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at.isoformat()
            } for o in recent_orders
        ],
        "low_stock_products": [
            {
                "id": p.id,
                "name": p.name,
                "stock": p.stock
            } for p in low_stock_products
        ]
    }


@router.get("/sales")
def get_sales_data(
    period: str = Query("daily", enum=["daily", "weekly", "monthly"]),
    days: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get sales data for charts"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get orders with their dates and amounts
    orders = db.query(
        func.date(Order.created_at).label('date'),
        func.count(Order.id).label('order_count'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        Order.created_at >= start_date,
        Order.payment_status == "paid"
    ).group_by(
        func.date(Order.created_at)
    ).order_by(
        func.date(Order.created_at)
    ).all()
    
    # Format for chart
    sales_data = []
    for order in orders:
        sales_data.append({
            "date": order.date.isoformat() if order.date else None,
            "orders": order.order_count or 0,
            "revenue": float(order.revenue or 0)
        })
    
    return {
        "period": period,
        "days": days,
        "data": sales_data
    }


@router.get("/top-products")
def get_top_products(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get top selling products"""
    try:
        # Get products with order counts
        top_products = db.query(
            Product.id,
            Product.name,
            Product.price,
            Product.stock,
            Product.primary_image,
            func.coalesce(func.sum(OrderItem.quantity), 0).label('total_sold'),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price), 0).label('total_revenue')
        ).outerjoin(
            OrderItem, OrderItem.product_id == Product.id
        ).outerjoin(
            Order, Order.id == OrderItem.order_id
        ).filter(
            Product.is_active == True
        ).group_by(
            Product.id
        ).order_by(
            desc('total_sold')
        ).limit(limit).all()
        
        return [
            {
                "id": p.id,
                "name": p.name,
                "price": float(p.price) if p.price else 0,
                "stock": p.stock or 0,
                "image": p.primary_image,
                "total_sold": int(p.total_sold or 0),
                "revenue": float(p.total_revenue or 0)
            }
            for p in top_products
        ]
    except Exception as e:
        # Fallback: return products without sales data
        products = db.query(Product).filter(
            Product.is_active == True
        ).limit(limit).all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "price": float(p.price) if p.price else 0,
                "stock": p.stock or 0,
                "image": p.primary_image,
                "total_sold": 0,
                "revenue": 0
            }
            for p in products
        ]


@router.get("/category-sales")
def get_category_sales(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get sales by category"""
    try:
        from app.models.product import ProductCategoryAssociation
        
        # Single query to get all category sales data
        category_sales = db.query(
            Category.id,
            Category.name,
            func.count(OrderItem.id).label('order_count'),
            func.coalesce(func.sum(OrderItem.quantity), 0).label('items_sold'),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.price), 0).label('revenue')
        ).outerjoin(
            ProductCategoryAssociation,
            ProductCategoryAssociation.category_id == Category.id
        ).outerjoin(
            Product,
            Product.id == ProductCategoryAssociation.product_id
        ).outerjoin(
            OrderItem,
            OrderItem.product_id == Product.id
        ).outerjoin(
            Order,
            Order.id == OrderItem.order_id
        ).filter(
            Order.payment_status == "paid"
        ).group_by(
            Category.id,
            Category.name
        ).order_by(
            desc('revenue')
        ).all()
        
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "order_count": cat.order_count,
                "items_sold": int(cat.items_sold),
                "revenue": float(cat.revenue)
            }
            for cat in category_sales
        ]
    except Exception as e:
        # Fallback: return categories without sales data
        categories = db.query(Category).all()
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "order_count": 0,
                "items_sold": 0,
                "revenue": 0
            }
            for cat in categories
        ]


@router.get("/recent-orders")
def get_recent_orders(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get recent orders for dashboard"""
    orders = db.query(Order).order_by(
        desc(Order.created_at)
    ).limit(limit).all()
    
    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "customer_name": order.guest_name or (order.user.full_name if order.user else "Guest"),
            "customer_email": order.guest_email or (order.user.email if order.user else None),
            "total_amount": float(order.total_amount),
            "status": order.status,
            "payment_status": order.payment_status,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }
        for order in orders
    ]


@router.get("/low-stock")
def get_low_stock_products(
    limit: int = Query(5, ge=1, le=50),
    threshold: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get products with low stock"""
    products = db.query(Product).filter(
        Product.stock < threshold,
        Product.is_active == True
    ).order_by(
        Product.stock
    ).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "stock": p.stock,
            "price": float(p.price),
            "image": p.primary_image
        }
        for p in products
    ]

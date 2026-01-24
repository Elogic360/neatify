"""
Public Inventory endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.dependencies import get_db
from app.models.product import Product
from app.models.inventory_log import InventoryLog

router = APIRouter(tags=["inventory"])


@router.get("/logs")
def get_inventory_logs(
    product_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get inventory adjustment logs (public access for frontend)

    Optional filters:
    - product_id: Filter by specific product
    - limit: Number of logs to return (default: 50)
    """
    query = db.query(InventoryLog)

    if product_id:
        query = query.filter(InventoryLog.product_id == product_id)

    total = query.count()
    logs = query.order_by(desc(InventoryLog.created_at)).limit(limit).all()

    return {
        "total": total,
        "logs": [
            {
                "id": log.id,
                "product_id": log.product_id,
                "product_name": log.product.name if log.product else None,
                "product_sku": log.product.sku if log.product else None,
                "change_quantity": log.change_quantity,
                "new_stock": log.new_stock,
                "reason": log.reason,
                "admin_id": log.admin_id,
                "admin_username": log.admin.username if log.admin else None,
                "order_id": log.order_id,
                "created_at": log.created_at.isoformat()
            } for log in logs
        ]
    }


@router.get("/low-stock")
def get_low_stock_products(
    threshold: int = 10,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get products with stock below threshold (public access for frontend)

    Query parameters:
    - threshold: Stock level to consider "low" (default: 10)
    - limit: Maximum number of products to return (default: 10)
    """
    products = db.query(Product).filter(
        Product.stock < threshold,
        Product.is_active == True
    ).order_by(Product.stock).limit(limit).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "stock": p.stock,
            "primary_image": p.primary_image,
            "price": float(p.price)
        } for p in products
    ]
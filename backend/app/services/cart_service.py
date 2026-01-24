"""
Cart Service - Business logic for shopping cart operations
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

from app.models.cart import Cart, CartItem, CartStatus
from app.models.product import Product, ProductVariation
from app.models.customer import User
from app.schemas.cart import (
    CartItemCreate, CartItemUpdate, CartResponse, 
    CartItemResponse, CartSummary
)


class CartError(Exception):
    """Custom exception for cart-related errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class CartService:
    """Service class for cart operations"""
    
    # Configuration
    MAX_QUANTITY_PER_ITEM = 10
    CART_EXPIRATION_HOURS = 72
    TAX_RATE = Decimal("0.18")  # 18% VAT
    FREE_SHIPPING_THRESHOLD = Decimal("50000")  # Free shipping over 50,000
    SHIPPING_COST = Decimal("5000")  # Default shipping cost
    
    @classmethod
    def get_or_create_cart(
        cls,
        db: Session,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None
    ) -> Cart:
        """
        Get existing cart or create new one.
        Supports both authenticated users and anonymous sessions.
        """
        cart = None
        
        if user_id:
            # Look for user's active cart
            cart = db.query(Cart).filter(
                and_(
                    Cart.user_id == user_id,
                    Cart.status == CartStatus.ACTIVE.value
                )
            ).first()
        elif session_id:
            # Look for session cart
            cart = db.query(Cart).filter(
                and_(
                    Cart.session_id == session_id,
                    Cart.status == CartStatus.ACTIVE.value
                )
            ).first()
        
        if not cart:
            # Create new cart
            cart = Cart(
                user_id=user_id,
                session_id=session_id if not user_id else None,
                status=CartStatus.ACTIVE.value,
            )
            cart.set_expiration(cls.CART_EXPIRATION_HOURS)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        else:
            # Check if cart has expired
            if cart.is_expired:
                cart.status = CartStatus.EXPIRED.value
                db.commit()
                # Create new cart
                cart = Cart(
                    user_id=user_id,
                    session_id=session_id if not user_id else None,
                    status=CartStatus.ACTIVE.value,
                )
                cart.set_expiration(cls.CART_EXPIRATION_HOURS)
                db.add(cart)
                db.commit()
                db.refresh(cart)
            else:
                # Refresh expiration on activity
                cart.refresh_expiration(cls.CART_EXPIRATION_HOURS)
                db.commit()
        
        return cart
    
    @classmethod
    def get_cart(
        cls,
        db: Session,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None
    ) -> Optional[Cart]:
        """Get cart without creating if doesn't exist"""
        if user_id:
            return db.query(Cart).filter(
                and_(
                    Cart.user_id == user_id,
                    Cart.status == CartStatus.ACTIVE.value
                )
            ).first()
        elif session_id:
            return db.query(Cart).filter(
                and_(
                    Cart.session_id == session_id,
                    Cart.status == CartStatus.ACTIVE.value
                )
            ).first()
        return None
    
    @classmethod
    def get_cart_for_user_or_session(
        cls,
        db: Session,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> Optional[Cart]:
        """
        Get cart for authenticated user or guest session.
        Prioritizes user cart over session cart.
        """
        if user:
            return cls.get_cart(db, user_id=user.id)
        elif session_id:
            return cls.get_cart(db, session_id=session_id)
        return None
    
    @classmethod
    def detect_user_cart_status(
        cls,
        db: Session,
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> dict:
        """
        Detect cart status for user or session.
        Returns information about existing carts and recommendations.
        """
        status_info = {
            "has_user_cart": False,
            "has_session_cart": False,
            "user_cart_items": 0,
            "session_cart_items": 0,
            "can_merge": False,
            "recommend_merge": False,
            "user_type": "guest"
        }
        
        if user:
            status_info["user_type"] = "registered"
            user_cart = cls.get_cart(db, user_id=user.id)
            if user_cart and user_cart.items:
                status_info["has_user_cart"] = True
                status_info["user_cart_items"] = len(user_cart.items)
        
        if session_id:
            session_cart = cls.get_cart(db, session_id=session_id)
            if session_cart and session_cart.items:
                status_info["has_session_cart"] = True
                status_info["session_cart_items"] = len(session_cart.items)
        
        # Determine if merge is possible and recommended
        if status_info["has_user_cart"] and status_info["has_session_cart"]:
            status_info["can_merge"] = True
            # Recommend merge if session cart has items and user just logged in
            status_info["recommend_merge"] = status_info["session_cart_items"] > 0
        
    @classmethod
    def detect_user_cart_based_on_products(
        cls,
        db: Session,
        product_ids: List[int],
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> dict:
        """
        Intelligent cart detection based on selected products.
        Determines if user has existing cart with these products.
        """
        detection_result = {
            "user_has_relevant_cart": False,
            "session_has_relevant_cart": False,
            "relevant_user_items": [],
            "relevant_session_items": [],
            "recommend_user_cart": False,
            "recommend_session_merge": False,
            "cart_priority": "session"  # Default to session for guests
        }
        
        # Check user's cart for relevant products
        if user:
            user_cart = cls.get_cart(db, user_id=user.id)
            if user_cart and user_cart.items:
                relevant_items = []
                for item in user_cart.items:
                    if item.product_id in product_ids:
                        relevant_items.append({
                            "product_id": item.product_id,
                            "quantity": item.quantity,
                            "in_stock": item.product.stock >= item.quantity if item.product else False
                        })
                
                if relevant_items:
                    detection_result["user_has_relevant_cart"] = True
                    detection_result["relevant_user_items"] = relevant_items
                    detection_result["recommend_user_cart"] = True
                    detection_result["cart_priority"] = "user"
        
        # Check session cart for relevant products
        if session_id:
            session_cart = cls.get_cart(db, session_id=session_id)
            if session_cart and session_cart.items:
                relevant_items = []
                for item in session_cart.items:
                    if item.product_id in product_ids:
                        relevant_items.append({
                            "product_id": item.product_id,
                            "quantity": item.quantity,
                            "in_stock": item.product.stock >= item.quantity if item.product else False
                        })
                
                if relevant_items:
                    detection_result["session_has_relevant_cart"] = True
                    detection_result["relevant_session_items"] = relevant_items
        
        # Determine merge recommendation
        if (detection_result["user_has_relevant_cart"] and 
            detection_result["session_has_relevant_cart"] and
            user):
            # Both have relevant items - recommend merge to preserve user data
            detection_result["recommend_session_merge"] = True
        
        return detection_result
    
    @classmethod
    def get_smart_cart_for_products(
        cls,
        db: Session,
        product_ids: List[int],
        user: Optional[User] = None,
        session_id: Optional[str] = None
    ) -> tuple[Cart, dict]:
        """
        Get the most appropriate cart based on selected products.
        Returns cart and detection metadata.
        """
        detection = cls.detect_user_cart_based_on_products(db, product_ids, user, session_id)
        
        cart = None
        metadata = {
            "cart_source": "new",
            "detection_info": detection,
            "merge_recommended": False
        }
        
        if detection["cart_priority"] == "user" and user:
            # Use user's cart
            cart = cls.get_or_create_cart(db, user_id=user.id)
            metadata["cart_source"] = "user"
        elif session_id:
            # Use session cart
            cart = cls.get_or_create_cart(db, session_id=session_id)
            metadata["cart_source"] = "session"
            
            # Check if merge is recommended
            if detection["recommend_session_merge"]:
                metadata["merge_recommended"] = True
        else:
            # Create new cart
            if user:
                cart = cls.get_or_create_cart(db, user_id=user.id)
                metadata["cart_source"] = "user"
            else:
                session_id = cls.generate_session_id()
                cart = cls.get_or_create_cart(db, session_id=session_id)
                metadata["cart_source"] = "session"
                metadata["session_id"] = session_id
        
        return cart, metadata
    
    @classmethod
    def handle_guest_user_cart(
        cls,
        db: Session,
        session_id: str,
        product_ids: List[int] = None,
        user_context: dict = None
    ) -> dict:
        """
        Special handling for guest users.
        - Extends cart expiration for guest users with specific products
        - Tracks guest cart analytics
        - Prepares for potential conversion to registered user
        """
        cart = cls.get_cart(db, session_id=session_id)
        
        if not cart:
            return {"status": "no_cart", "message": "No guest cart found"}
        
        # Extend expiration for guest carts with valuable items
        if product_ids:
            # Check if cart contains high-value or frequently purchased items
            valuable_items = []
            for item in cart.items:
                if item.product_id in product_ids:
                    valuable_items.append(item.product_id)
            
            if valuable_items:
                # Extend expiration by 24 hours for carts with target products
                cart.refresh_expiration(96)  # 4 days instead of 3
                db.commit()
                
                return {
                    "status": "extended",
                    "message": f"Guest cart expiration extended due to valuable items",
                    "valuable_items": valuable_items,
                    "expires_at": cart.expires_at
                }
        
        return {
            "status": "standard",
            "message": "Standard guest cart handling",
            "expires_at": cart.expires_at
        }
    
    @classmethod
    def add_item(
        cls,
        db: Session,
        cart: Cart,
        item_data: CartItemCreate
    ) -> CartItem:
        """
        Add item to cart with validation.
        - Validates product exists and is active
        - Validates stock availability
        - Enforces max quantity per item
        - Updates or creates cart item
        """
        # Validate product
        product = db.query(Product).filter(
            and_(
                Product.id == item_data.product_id,
                Product.is_active == True
            )
        ).first()
        
        if not product:
            raise CartError("Product not found or not available", status.HTTP_404_NOT_FOUND)
        
        # Validate variation if provided
        variation = None
        available_stock = product.stock
        
        if item_data.variation_id:
            variation = db.query(ProductVariation).filter(
                and_(
                    ProductVariation.id == item_data.variation_id,
                    ProductVariation.product_id == item_data.product_id
                )
            ).first()
            
            if not variation:
                raise CartError("Product variation not found", status.HTTP_404_NOT_FOUND)
            
            if variation.stock is not None:
                available_stock = variation.stock
        
        # Check existing item in cart
        existing_item = db.query(CartItem).filter(
            and_(
                CartItem.cart_id == cart.id,
                CartItem.product_id == item_data.product_id,
                CartItem.variation_id == item_data.variation_id
            )
        ).first()
        
        new_quantity = item_data.quantity
        if existing_item:
            new_quantity = existing_item.quantity + item_data.quantity
        
        # Validate quantity limits
        if new_quantity > cls.MAX_QUANTITY_PER_ITEM:
            raise CartError(
                f"Maximum quantity per item is {cls.MAX_QUANTITY_PER_ITEM}",
                status.HTTP_400_BAD_REQUEST
            )
        
        # Validate stock
        if new_quantity > available_stock:
            raise CartError(
                f"Insufficient stock. Only {available_stock} items available",
                status.HTTP_400_BAD_REQUEST
            )
        
        if existing_item:
            # Update quantity
            existing_item.quantity = new_quantity
            existing_item.unit_price = product.price
            db.commit()
            db.refresh(existing_item)
            cls._update_cart_totals(db, cart)
            return existing_item
        else:
            # Create new cart item
            cart_item = CartItem(
                cart_id=cart.id,
                user_id=cart.user_id,
                product_id=item_data.product_id,
                variation_id=item_data.variation_id,
                quantity=item_data.quantity,
                unit_price=product.price,
            )
            db.add(cart_item)
            db.commit()
            db.refresh(cart_item)
            cls._update_cart_totals(db, cart)
            return cart_item
    
    @classmethod
    def update_item_quantity(
        cls,
        db: Session,
        cart: Cart,
        item_id: int,
        quantity: int
    ) -> CartItem:
        """Update cart item quantity with validation"""
        cart_item = db.query(CartItem).filter(
            and_(
                CartItem.id == item_id,
                CartItem.cart_id == cart.id
            )
        ).first()
        
        if not cart_item:
            raise CartError("Cart item not found", status.HTTP_404_NOT_FOUND)
        
        # Validate quantity limit
        if quantity > cls.MAX_QUANTITY_PER_ITEM:
            raise CartError(
                f"Maximum quantity per item is {cls.MAX_QUANTITY_PER_ITEM}",
                status.HTTP_400_BAD_REQUEST
            )
        
        # Validate stock
        product = cart_item.product
        available_stock = product.stock
        
        if cart_item.variation_id and cart_item.variation:
            if cart_item.variation.stock is not None:
                available_stock = cart_item.variation.stock
        
        if quantity > available_stock:
            raise CartError(
                f"Insufficient stock. Only {available_stock} items available",
                status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = quantity
        cart_item.unit_price = product.price  # Update price
        db.commit()
        db.refresh(cart_item)
        cls._update_cart_totals(db, cart)
        return cart_item
    
    @classmethod
    def remove_item(cls, db: Session, cart: Cart, item_id: int) -> bool:
        """Remove item from cart"""
        cart_item = db.query(CartItem).filter(
            and_(
                CartItem.id == item_id,
                CartItem.cart_id == cart.id
            )
        ).first()
        
        if not cart_item:
            raise CartError("Cart item not found", status.HTTP_404_NOT_FOUND)
        
        db.delete(cart_item)
        db.commit()
        cls._update_cart_totals(db, cart)
        return True
    
    @classmethod
    def clear_cart(cls, db: Session, cart: Cart) -> bool:
        """Remove all items from cart"""
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        cart.subtotal = Decimal("0")
        cart.tax_amount = Decimal("0")
        cart.total = Decimal("0")
        cart.discount_amount = Decimal("0")
        db.commit()
        return True
    
    @classmethod
    def _update_cart_totals(cls, db: Session, cart: Cart) -> None:
        """Recalculate and update cart totals"""
        subtotal = Decimal("0")
        
        for item in cart.items:
            price = item.unit_price or item.product.price
            subtotal += Decimal(str(price)) * item.quantity
        
        tax_amount = subtotal * cls.TAX_RATE
        
        # Apply shipping
        shipping = Decimal("0")
        if subtotal < cls.FREE_SHIPPING_THRESHOLD and subtotal > 0:
            shipping = cls.SHIPPING_COST
        
        # Apply discount
        discount = cart.discount_amount or Decimal("0")
        
        total = subtotal + tax_amount + shipping - discount
        
        cart.subtotal = subtotal
        cart.tax_amount = tax_amount
        cart.total = total
        db.commit()
    
    @classmethod
    def get_cart_summary(cls, db: Session, cart: Cart) -> CartSummary:
        """Get cart summary with totals"""
        cls._update_cart_totals(db, cart)
        
        shipping_estimate = Decimal("0")
        if cart.subtotal and cart.subtotal < cls.FREE_SHIPPING_THRESHOLD and cart.subtotal > 0:
            shipping_estimate = cls.SHIPPING_COST
        
        return CartSummary(
            item_count=cart.item_count,
            subtotal=cart.subtotal or Decimal("0"),
            tax_amount=cart.tax_amount or Decimal("0"),
            shipping_estimate=shipping_estimate,
            discount_amount=cart.discount_amount or Decimal("0"),
            total=cart.total or Decimal("0"),
        )
    
    @classmethod
    def validate_cart_for_checkout(cls, db: Session, cart: Cart) -> Tuple[bool, List[str]]:
        """
        Validate cart is ready for checkout.
        Returns (is_valid, list of issues)
        """
        issues = []
        
        if not cart.items:
            issues.append("Cart is empty")
            return False, issues
        
        for item in cart.items:
            product = item.product
            
            # Check product is still active
            if not product or not product.is_active:
                issues.append(f"Product '{product.name if product else 'Unknown'}' is no longer available")
                continue
            
            # Check stock
            available_stock = product.stock
            if item.variation_id and item.variation:
                if item.variation.stock is not None:
                    available_stock = item.variation.stock
            
            if item.quantity > available_stock:
                issues.append(
                    f"'{product.name}' has only {available_stock} items in stock (you have {item.quantity})"
                )
        
        return len(issues) == 0, issues
    
    @classmethod
    def merge_session_cart(
        cls,
        db: Session,
        user: User,
        session_id: str
    ) -> Optional[Cart]:
        """
        Merge anonymous session cart into user's cart.
        Called when user logs in.
        """
        session_cart = db.query(Cart).filter(
            and_(
                Cart.session_id == session_id,
                Cart.status == CartStatus.ACTIVE.value
            )
        ).first()
        
        if not session_cart or not session_cart.items:
            return None
        
        # Get or create user cart
        user_cart = cls.get_or_create_cart(db, user_id=user.id)
        
        # Merge items
        for session_item in session_cart.items:
            try:
                cls.add_item(
                    db, 
                    user_cart,
                    CartItemCreate(
                        product_id=session_item.product_id,
                        variation_id=session_item.variation_id,
                        quantity=session_item.quantity
                    )
                )
            except CartError:
                # Skip items that can't be added (out of stock, etc.)
                pass
        
        # Mark session cart as converted
        session_cart.status = CartStatus.CONVERTED.value
        db.commit()
        
        return user_cart
    
    @classmethod
    def apply_promo_code(
        cls,
        db: Session,
        cart: Cart,
        promo_code: str
    ) -> Tuple[bool, str]:
        """
        Apply promo code to cart.
        Returns (success, message)
        
        TODO: Implement promo code validation against promotions table
        """
        # Placeholder for promo code validation
        # In production, query promotions table
        
        cart.promo_code = promo_code
        # cart.discount_amount = calculated_discount
        db.commit()
        cls._update_cart_totals(db, cart)
        
        return True, "Promo code applied"
    
    @classmethod
    def mark_cart_converted(cls, db: Session, cart: Cart) -> None:
        """Mark cart as converted after order creation"""
        cart.status = CartStatus.CONVERTED.value
        db.commit()
    
    @classmethod
    def cleanup_expired_carts(cls, db: Session) -> int:
        """
        Cleanup expired carts (batch job).
        Returns number of carts cleaned up.
        """
        expired_carts = db.query(Cart).filter(
            and_(
                Cart.expires_at < datetime.utcnow(),
                Cart.status == CartStatus.ACTIVE.value
            )
        ).all()
        
        count = 0
        for cart in expired_carts:
            cart.status = CartStatus.EXPIRED.value
            count += 1
        
        db.commit()
        return count
    
    @classmethod
    def handle_guest_user_cart(
        cls,
        db: Session,
        session_id: str,
        product_ids: List[int] = None,
        user_context: dict = None
    ) -> dict:
        """
        Enhanced special handling for guest users.
        - Extends cart expiration for valuable carts
        - Tracks guest behavior patterns
        - Prepares for conversion analytics
        """
        cart = cls.get_cart(db, session_id=session_id)
        
        if not cart:
            return {
                "status": "no_cart", 
                "message": "No guest cart found",
                "actions": []
            }
        
        actions_taken = []
        expiration_extended = False
        
        # Extend expiration for carts with valuable items
        if product_ids:
            valuable_items = []
            total_value = 0
            
            for item in cart.items:
                if item.product and item.product_id in product_ids:
                    valuable_items.append(item.product_id)
                    # Calculate approximate value
                    price = float(item.product.price)
                    total_value += price * item.quantity
            
            # Extend expiration based on cart value and items
            if valuable_items:
                if total_value > 100000:  # High value cart (> 100,000)
                    cart.refresh_expiration(168)  # 7 days
                    expiration_extended = True
                    actions_taken.append("high_value_extension")
                elif len(valuable_items) >= 3:  # Multiple valuable items
                    cart.refresh_expiration(120)  # 5 days
                    expiration_extended = True
                    actions_taken.append("multi_item_extension")
                else:
                    cart.refresh_expiration(96)  # 4 days
                    expiration_extended = True
                    actions_taken.append("standard_extension")
                
                if expiration_extended:
                    db.commit()
        
        # Handle user context (browsing behavior, etc.)
        conversion_potential = "low"
        if user_context:
            if user_context.get("viewed_checkout", False):
                conversion_potential = "high"
            elif user_context.get("added_multiple_items", False):
                conversion_potential = "medium"
        
        return {
            "status": "handled",
            "message": f"Guest cart processed with {len(actions_taken)} actions",
            "actions": actions_taken,
            "expiration_extended": expiration_extended,
            "expires_at": cart.expires_at,
            "conversion_potential": conversion_potential,
            "cart_value": sum(float(item.line_total or 0) for item in cart.items),
            "item_count": cart.item_count
        }
    
    @staticmethod
    def generate_session_id() -> str:
        """Generate a unique session ID for anonymous carts"""
        return str(uuid.uuid4())
    
    @classmethod
    def get_session_product_count(
        cls,
        db: Session,
        session_id: str
    ) -> dict:
        """
        Get product count statistics for a session.
        Returns total products viewed, added to cart, etc.
        """
        # Get cart for session
        cart = cls.get_cart(db, session_id=session_id)
        
        if not cart:
            return {
                "session_id": session_id,
                "total_products_in_cart": 0,
                "total_quantity": 0,
                "unique_products": 0,
                "cart_value": 0,
                "last_activity": None
            }
        
        # Calculate statistics
        total_quantity = sum(item.quantity for item in cart.items)
        unique_products = len(cart.items)
        cart_value = sum(float(item.line_total or 0) for item in cart.items)
        
        return {
            "session_id": session_id,
            "total_products_in_cart": total_quantity,
            "total_quantity": total_quantity,
            "unique_products": unique_products,
            "cart_value": cart_value,
            "last_activity": cart.updated_at,
            "cart_status": cart.status.value,
            "expires_at": cart.expires_at
        }
    
    @classmethod
    def track_session_activity(
        cls,
        db: Session,
        session_id: str,
        activity_type: str,
        product_id: Optional[int] = None,
        metadata: Optional[dict] = None
    ) -> None:
        """
        Track user session activity for analytics.
        Types: view_product, add_to_cart, remove_from_cart, checkout_start, etc.
        """
        # For now, we'll update the cart's updated_at timestamp
        # In a production system, you'd want to store this in a separate analytics table
        cart = cls.get_cart(db, session_id=session_id)
        if cart:
            cart.updated_at = datetime.utcnow()
            db.commit()
    
    @classmethod
    def get_session_statistics(
        cls,
        db: Session,
        session_id: str
    ) -> dict:
        """
        Get comprehensive session statistics including product interactions.
        """
        stats = cls.get_session_product_count(db, session_id)
        
        # Add additional session metrics
        stats.update({
            "session_duration": None,  # Would need session start time
            "conversion_funnel": {
                "products_viewed": 0,  # Would need view tracking
                "products_added": stats["unique_products"],
                "checkout_started": False,
                "order_completed": False
            },
            "engagement_score": min(stats["unique_products"] * 10, 100)  # Simple scoring
        })
        
        return stats

import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../app/store/cart';
import { useStore } from '../app/store';
import { cartAPI, ordersAPI, getImageUrl } from '../app/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { X } from 'lucide-react';
import { useToast } from '../components/admin/Toast';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    primary_image?: string;
    stock?: number;
    is_active?: boolean;
  };
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function CartPage() {
  const nav = useNavigate();
  const { token, cart: apiCart, setCart } = useStore();
  const localLines = useCart((s) => s.lines);
  const localSetQty = useCart((s) => s.setQty);
  const localRemove = useCart((s) => s.remove);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: '',
    phone: '',
    address_line_1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Tanzania'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  // Fetch cart from API if logged in
  useEffect(() => {
    if (token) {
      setLoading(true);
      cartAPI.get()
        .then((response) => {
          const cartData = response.data;
          if (cartData && cartData.items) {
            setCart(cartData.items.map((item: any) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity,
              product: item.product
            })));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, setCart]);

  // Use API cart if logged in, otherwise use local cart
  const isLoggedIn = !!token;
  const cartItems: CartItem[] = isLoggedIn
    ? apiCart
    : localLines.map(l => ({
        id: l.product.id,
        product_id: l.product.id,
        quantity: l.quantity,
        product: {
          id: l.product.id,
          name: l.product.name,
          price: String(l.product.price),
          primary_image: l.product.image_url,
          stock: l.product.stock_quantity,
          is_active: l.product.is_active
        }
      }));

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  const handleQuantityChange = async (itemId: number, productId: number, newQty: number) => {
    if (isLoggedIn) {
      try {
        await cartAPI.update(itemId, { quantity: newQty });
        // Reload cart
        const response = await cartAPI.get();
        const cartData = response.data;
        if (cartData && cartData.items) {
          setCart(cartData.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product
          })));
        }
      } catch (error: any) {
        // If token expired or unauthorized, fallback to local cart and notify user
        if (error?.response?.status === 401) {
          showToast('Session expired. Switching to local cart mode.', 'warning');
          localSetQty(productId, newQty);
          return;
        }
        console.error('Error updating cart:', error);
      }
    } else {
      localSetQty(productId, newQty);
    }
  };

  const handleRemove = async (itemId: number, productId: number) => {
    if (isLoggedIn) {
      try {
        await cartAPI.remove(itemId);
        // Reload cart
        const response = await cartAPI.get();
        const cartData = response.data;
        if (cartData && cartData.items) {
          setCart(cartData.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product
          })));
        } else {
          setCart([]);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          showToast('Session expired. Switching to local cart for this session.', 'warning');
          localRemove(productId);
          return;
        }
        console.error('Error removing from cart:', error);
      }
    } else {
      localRemove(productId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Cart</h2>
        <Card>Loading cart...</Card>
      </div>
    );
  }

  const validateGuestForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!guestInfo.name.trim() || guestInfo.name.length < 2) {
      errors.name = 'Name is required (min 2 characters)';
    }
    if (!guestInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      errors.email = 'Valid email is required';
    }
    if (!guestInfo.phone.trim() || guestInfo.phone.length < 10) {
      errors.phone = 'Phone number is required (min 10 digits)';
    }
    if (!guestInfo.address_line_1.trim() || guestInfo.address_line_1.length < 5) {
      errors.address_line_1 = 'Address is required (min 5 characters)';
    }
    if (!guestInfo.city.trim() || guestInfo.city.length < 2) {
      errors.city = 'City is required';
    }
    if (!guestInfo.state.trim() || guestInfo.state.length < 2) {
      errors.state = 'State/Region is required';
    }
    if (!guestInfo.postal_code.trim() || guestInfo.postal_code.length < 3) {
      errors.postal_code = 'Postal code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // Prepare order items
    const items = cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity
    }));
    if (items.length === 0) return;
    
    if (isLoggedIn) {
      // For logged in users - proceed with order
      setPlacingOrder(true);
      try {
        const res = await ordersAPI.create({
          address_id: 1,
          payment_method: 'cod',
          items
        });

        const data = res.data;
        // Only clear server/local cart when instructed by backend
        if (data?.clear_client_cart) {
          try {
            await cartAPI.clear();
          } catch (e) {
            // ignore, server-side cart should be converted already
          }
          setCart([]);
        }

        setOrderNumber(data?.order_number || null);
        setOrderSuccess(true);
      } catch (e: any) {
        const errorMsg = e?.response?.data?.detail || e?.message || 'Unknown error';
        console.error('Order error:', e?.response?.data || e);
        // If session expired, switch to guest checkout automatically and show toast
        if (e?.response?.status === 401) {
          showToast('Session expired. Continuing as guest.', 'warning');
          setShowGuestForm(true);
        } else {
          showToast(`Failed to place order: ${errorMsg}`, 'error');
        }
      } finally {
        setPlacingOrder(false);
      }
    } else {
      // For guests - show the form first
      if (!showGuestForm) {
        setShowGuestForm(true);
        return;
      }
      
      // Validate the form
      if (!validateGuestForm()) {
        return;
      }
      
      setPlacingOrder(true);
      try {
        const res = await ordersAPI.createGuest({
          guest_email: guestInfo.email,
          guest_name: guestInfo.name,
          guest_phone: guestInfo.phone,
          address_line_1: guestInfo.address_line_1,
          city: guestInfo.city,
          state: guestInfo.state,
          postal_code: guestInfo.postal_code,
          country: guestInfo.country,
          payment_method: 'cod',
          items
        });

        const data = res.data;
        if (data?.clear_client_cart) {
          useCart.getState().clear();
        }

        setOrderNumber(data?.order_number || null);
        setOrderSuccess(true);
        setShowGuestForm(false);
      } catch (e: any) {
        const errorMsg = e?.response?.data?.detail || e?.message || 'Unknown error';
        console.error('Order error:', e?.response?.data || e);
        showToast(`Failed to place order: ${errorMsg}`, 'error');
      } finally {
        setPlacingOrder(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cart</h2>
          <p className="mt-1 text-sm text-slate-400">Review items before checkout.</p>
        </div>
        <Link to="/products" className="text-sm text-slate-300 hover:text-white">
          Continue shopping
        </Link>
      </div>
      {orderSuccess ? (
        <Card>
          <div className="text-lg font-semibold text-emerald-400 mb-2">Thank you for placing your order!</div>
          <div className="text-sm text-slate-300 mb-2">We will deliver to you soon.</div>
          {orderNumber && (
            <div className="mb-4">
              <div className="text-sm text-slate-400">Order number</div>
              <div className="font-mono font-semibold text-white mt-1">{orderNumber}</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button className="mt-2" onClick={() => nav('/products')}>Continue Shopping</Button>
            <Button variant="ghost" className="mt-2" onClick={() => nav('/orders')}>View Orders</Button>
          </div>
        </Card>
      ) : cartItems.length === 0 ? (
        <Card>
          <div className="text-sm">Your cart is empty.</div>
          <div className="mt-4">
            <Link to="/products">
              <Button>Browse products</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-4">
                  <img
                    src={getImageUrl(item.product.primary_image)}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold">{item.product.name}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      ${Number(item.product.price).toFixed(2)} •{' '}
                      <Badge tone={(item.product.stock || 0) > 0 ? 'success' : 'warning'}>
                        {(item.product.stock || 0) > 0 ? 'Available' : 'Sold out'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center border border-slate-600 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.product_id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-l-lg transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.product_id, Math.min(Math.max(1, item.product.stock || 10), item.quantity + 1))}
                      className="px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-r-lg transition-colors"
                      disabled={item.quantity >= (item.product.stock || 10)}
                    >
                      +
                    </button>
                  </div>
                  <Button variant="ghost" onClick={() => handleRemove(item.id, item.product_id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Card className="h-fit">
            <div className="text-sm font-semibold">Order summary</div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <span>Subtotal</span>
              <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Taxes/shipping calculated later.</div>
            {/* Checkout Options */}
            <div className="mt-5 space-y-3">
              <Button className="w-full" onClick={handlePlaceOrder} disabled={placingOrder}>
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </Button>
              {!isLoggedIn && (
                <p className="text-xs text-center text-slate-400">
                  Guest checkout - we'll ask for your details
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Guest Checkout Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Checkout Details</h3>
              <button 
                onClick={() => setShowGuestForm(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="border-b border-slate-700 pb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Contact Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.name ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email *</label>
                    <input
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.email ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.phone ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="+255 700 000 000"
                    />
                    {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Shipping Address</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Address *</label>
                    <input
                      type="text"
                      value={guestInfo.address_line_1}
                      onChange={(e) => setGuestInfo({ ...guestInfo, address_line_1: e.target.value })}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.address_line_1 ? 'border-red-500' : 'border-slate-600'}`}
                      placeholder="123 Main Street, Apt 4"
                    />
                    {formErrors.address_line_1 && <p className="text-xs text-red-400 mt-1">{formErrors.address_line_1}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">City *</label>
                      <input
                        type="text"
                        value={guestInfo.city}
                        onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.city ? 'border-red-500' : 'border-slate-600'}`}
                        placeholder="Dar es Salaam"
                      />
                      {formErrors.city && <p className="text-xs text-red-400 mt-1">{formErrors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">State/Region *</label>
                      <input
                        type="text"
                        value={guestInfo.state}
                        onChange={(e) => setGuestInfo({ ...guestInfo, state: e.target.value })}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.state ? 'border-red-500' : 'border-slate-600'}`}
                        placeholder="Dar es Salaam"
                      />
                      {formErrors.state && <p className="text-xs text-red-400 mt-1">{formErrors.state}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        value={guestInfo.postal_code}
                        onChange={(e) => setGuestInfo({ ...guestInfo, postal_code: e.target.value })}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formErrors.postal_code ? 'border-red-500' : 'border-slate-600'}`}
                        placeholder="00000"
                      />
                      {formErrors.postal_code && <p className="text-xs text-red-400 mt-1">{formErrors.postal_code}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Country</label>
                      <input
                        type="text"
                        value={guestInfo.country}
                        onChange={(e) => setGuestInfo({ ...guestInfo, country: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Tanzania"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Summary in Modal */}
              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Items ({cartItems.length})</span>
                  <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-white">Cash on Delivery</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full" 
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? 'Processing...' : 'Confirm Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ordersAPI } from '../app/api'
import { cartSubtotal, useCart } from '../app/store/cart'
import { useStore } from '../app/store'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { CouponInput, ShippingEstimate } from '../components/features'
import { useCouponStore } from '../stores/featuresStore'
import type { ShippingZone } from '../types/features'

export default function CheckoutPage() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'
  
  const { token, user } = useStore()
  const lines = useCart((s) => s.lines)
  const clear = useCart((s) => s.clear)

  const isLoggedIn = !!token
  const isGuest = !isLoggedIn || isGuestMode

  const subtotal = cartSubtotal(lines)
  
  // V1.5 Features
  const { appliedCoupon, discountAmount } = useCouponStore()
  const [selectedShipping, setSelectedShipping] = useState<ShippingZone | null>(null)
  
  // Calculate totals with coupon and shipping
  const shippingCost = selectedShipping?.base_rate || 0
  const total = subtotal - discountAmount + shippingCost

  // Guest info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  // Address info (for guest checkout)
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Tanzania')

  const [method, setMethod] = useState<'cod' | 'mobile_money' | 'bank_transfer' | 'credit_card'>('cod')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill user info if logged in
  useEffect(() => {
    if (user && !isGuest) {
      setName(user.full_name || user.username || '')
      setEmail(user.email || '')
    }
  }, [user, isGuest])

  // Payment method options with labels
  const paymentMethods = [
    { value: 'cod', label: '💵 Cash on Delivery', description: 'Pay when you receive', disabled: false },
    { value: 'mobile_money', label: '📱 Mobile Money', description: 'M-Pesa, Airtel Money', disabled: false },
    { value: 'bank_transfer', label: '🏦 Bank Transfer', description: 'Direct bank payment', disabled: false },
    { value: 'credit_card', label: '💳 Card (Coming Soon)', description: 'Credit/Debit card', disabled: true },
  ] as const

  const canSubmit = useMemo(() => {
    const hasItems = lines.length > 0
    const hasBasicInfo = name.trim().length > 1 && email.trim().length > 3
    
    if (isGuest) {
      // Guest checkout requires address
      const hasAddress = addressLine1.trim().length > 4 && city.trim().length > 1 && 
                        state.trim().length > 1 && postalCode.trim().length > 2
      const hasPhone = phone.trim().length > 4
      return hasItems && hasBasicInfo && hasAddress && hasPhone
    }
    
    return hasItems && hasBasicInfo
  }, [lines.length, name, email, phone, addressLine1, city, state, postalCode, isGuest])

  async function submit() {
    setError(null)
    setLoading(true)

    try {
      let order;
      
      if (isGuest) {
        // Guest checkout - use guest order endpoint
        const guestOrderPayload = {
          guest_email: email,
          guest_name: name,
          guest_phone: phone,
          address_line_1: addressLine1,
          address_line_2: addressLine2 || undefined,
          city: city,
          state: state,
          postal_code: postalCode,
          country: country,
          payment_method: method === 'cod' ? 'cash_on_delivery' : method,
          notes: `Payment: ${method}`,
          items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity }))
        }

        const response = await ordersAPI.createGuest(guestOrderPayload)
        order = response.data
        
        clear()
        // Show success message for guest orders
        nav(`/order-confirmation/${order.order_id}?guest=true&email=${encodeURIComponent(email)}`)
      } else {
        // Logged-in user checkout
        const orderPayload = {
          address_id: 1, // TODO: Get from user's addresses
          payment_method: method === 'cod' ? 'cash_on_delivery' : method,
          notes: `Customer: ${name}, Email: ${email}, Phone: ${phone || 'N/A'}`,
          items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity }))
        }

        const response = await ordersAPI.create(orderPayload)
        order = response.data

        clear()
        nav(`/order-confirmation/${order.id}`)
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Checkout</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isGuest ? '👤 Checking out as guest' : 'Enter details and place your order.'}
          </p>
          {isGuest && (
            <p className="mt-2 text-xs text-amber-400">
              Want to track your orders easily? <a href="/login?redirect=/checkout" className="underline hover:text-amber-300">Login or create an account</a>
            </p>
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
            <div className="mt-1 text-xs text-slate-400">
              Tip: Make sure backend is running and products have stock.
            </div>
          </div>
        ) : null}

        {/* Contact Information */}
        <Card>
          <div className="mb-4 text-sm font-semibold text-white">Contact Information</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="text-xs text-slate-400">Full name <span className="text-red-400">*</span></div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Email <span className="text-red-400">*</span></div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                type="email"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400">Phone {isGuest && <span className="text-red-400">*</span>}</div>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255 7XX XXX XXX" />
            </div>
          </div>
        </Card>

        {/* Shipping Address - Required for guest checkout */}
        {isGuest && (
          <Card>
            <div className="mb-4 text-sm font-semibold text-white">Shipping Address</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="text-xs text-slate-400">Address Line 1 <span className="text-red-400">*</span></div>
                <Input 
                  value={addressLine1} 
                  onChange={(e) => setAddressLine1(e.target.value)} 
                  placeholder="123 Main Street" 
                />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-slate-400">Address Line 2 (Optional)</div>
                <Input 
                  value={addressLine2} 
                  onChange={(e) => setAddressLine2(e.target.value)} 
                  placeholder="Apartment, suite, unit, etc." 
                />
              </div>
              <div>
                <div className="text-xs text-slate-400">City <span className="text-red-400">*</span></div>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dar es Salaam" />
              </div>
              <div>
                <div className="text-xs text-slate-400">State/Region <span className="text-red-400">*</span></div>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Ilala" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Postal Code <span className="text-red-400">*</span></div>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="11101" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Country <span className="text-red-400">*</span></div>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Tanzania" />
              </div>
            </div>
          </Card>
        )}

        {/* Payment Method */}
        <Card>
          <div className="mb-4 text-sm font-semibold text-white">Payment Method</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={m.disabled}
                onClick={() => !m.disabled && setMethod(m.value)}
                className={[
                  'rounded-xl border p-3 text-left transition',
                  m.disabled 
                    ? 'border-white/5 bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                    : method === m.value
                      ? 'border-green-400/40 bg-green-500/10 text-white ring-1 ring-green-400/30'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                ].join(' ')}
              >
                <div className="font-medium">{m.label}</div>
                <div className="text-xs text-slate-400 mt-1">{m.description}</div>
              </button>
            ))}
          </div>
        </Card>
        
        {/* V1.5: Shipping Options */}
        <Card>
          <ShippingEstimate
            subtotal={subtotal}
            onSelectShipping={setSelectedShipping}
            selectedZoneId={selectedShipping?.id}
          />
        </Card>
        
        {/* V1.5: Coupon Input */}
        <Card>
          <CouponInput cartTotal={subtotal} />
        </Card>
      </div>

      <Card className="h-fit">
        <div className="text-sm font-semibold">Summary</div>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{lines.reduce((n, l) => n + l.quantity, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>TZS {subtotal.toLocaleString()}</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount ({appliedCoupon.code})</span>
              <span>-TZS {discountAmount.toLocaleString()}</span>
            </div>
          )}
          {selectedShipping && (
            <div className="flex justify-between">
              <span>Shipping ({selectedShipping.name})</span>
              <span>TZS {shippingCost.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2">
            <div className="flex justify-between font-semibold text-white">
              <span>Total</span>
              <span>TZS {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button className="w-full" disabled={!canSubmit || loading} onClick={submit}>
            {loading ? 'Placing order…' : method === 'cod' ? '🛒 Place Order (Pay on Delivery)' : '🛒 Place Order'}
          </Button>
          {method === 'cod' && (
            <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <span>✓</span> Pay TZS {total.toLocaleString()} when your order arrives
            </div>
          )}
          {method === 'mobile_money' && (
            <div className="mt-2 text-xs text-amber-400">
              You'll receive payment instructions after placing the order
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
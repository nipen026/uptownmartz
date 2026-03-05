import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, Trash2, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, deliveryFee, couponDiscount, applyCoupon, totalItems } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleApplyCoupon = () => {
    if (applyCoupon(coupon)) {
      setCouponMsg('Coupon applied!');
    } else {
      setCouponMsg('Invalid coupon');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-20">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-lg font-bold text-foreground mb-1">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mb-6">Add some items to get started!</p>
        <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-bold">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Cart ({totalItems})</h1>
        </div>

        <div className="bg-accent/50 rounded-xl p-3 flex items-center gap-2 mb-4 text-xs text-accent-foreground">
          <span>⏱️</span>
          <span className="font-medium">Estimated delivery in <strong>10-15 mins</strong></span>
        </div>

        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {items.map(({ product, quantity }) => (
              <motion.div
                key={product.id}
                layout
                exit={{ opacity: 0, x: -100 }}
                className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
              >
                <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center text-3xl shrink-0">
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{product.quantity}</p>
                  <p className="text-sm font-bold text-foreground">₹{product.price * quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center bg-primary rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="text-primary-foreground px-2 py-1.5">
                      <Minus size={14} />
                    </button>
                    <span className="text-primary-foreground text-xs font-bold min-w-[20px] text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="text-primary-foreground px-2 py-1.5">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Coupon */}
        <div className="bg-card rounded-xl border border-border p-3 mb-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            <input
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={handleApplyCoupon} className="text-primary text-xs font-bold">Apply</button>
          </div>
          {couponMsg && <p className={`text-xs mt-1 ${couponDiscount > 0 ? 'text-primary' : 'text-destructive'}`}>{couponMsg}</p>}
        </div>

        {/* Bill */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Item Total</span><span className="text-foreground">₹{subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span className={deliveryFee === 0 ? 'text-primary font-medium' : 'text-foreground'}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Coupon Discount</span><span className="text-primary">-₹{couponDiscount}</span></div>}
            <div className="border-t border-border pt-2 flex justify-between font-bold"><span className="text-foreground">Grand Total</span><span className="text-foreground">₹{totalPrice}</span></div>
          </div>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-bold"
        >
          Proceed to Checkout — ₹{totalPrice}
        </button>
      </div>
    </div>
  );
}

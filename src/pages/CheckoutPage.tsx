import { ArrowLeft, MapPin, CreditCard, Banknote, Check, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { addresses } from '@/data/mock';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, deliveryFee, couponDiscount, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handlePlaceOrder = () => {
    setLoading(true);
    setTimeout(() => {
      clearCart();
      toast({ title: '🎉 Order Placed!', description: 'Your order will be delivered in 10-15 mins.' });
      navigate('/order-tracking');
    }, 1500);
  };

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-display font-bold text-foreground">Checkout</h1>
        </motion.div>

        {/* Address */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">Delivery Address</h3>
          <div className="space-y-2">
            {addresses.map(addr => (
              <motion.button
                key={addr.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAddress(addr.id)}
                className={cn(
                  'w-full text-left bg-card rounded-2xl border p-4 flex items-start gap-3 transition-all',
                  selectedAddress === addr.id ? 'border-primary bg-accent/50 shadow-sm' : 'border-border'
                )}
              >
                <MapPin size={18} className={selectedAddress === addr.id ? 'text-primary mt-0.5' : 'text-muted-foreground mt-0.5'} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{addr.label}</p>
                  <p className="text-xs text-muted-foreground">{addr.full}</p>
                </div>
                {selectedAddress === addr.id && <Check size={18} className="text-primary mt-0.5" />}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Payment */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">Payment Method</h3>
          <div className="space-y-2">
            {[
              { key: 'online' as const, icon: CreditCard, title: 'Pay Online', desc: 'UPI, Card, Wallet (Razorpay)' },
              { key: 'cod' as const, icon: Banknote, title: 'Cash on Delivery', desc: 'Pay when delivered' },
            ].map(m => (
              <motion.button
                key={m.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod(m.key)}
                className={cn(
                  'w-full text-left bg-card rounded-2xl border p-4 flex items-center gap-3 transition-all',
                  paymentMethod === m.key ? 'border-primary bg-accent/50 shadow-sm' : 'border-border'
                )}
              >
                <m.icon size={18} className={paymentMethod === m.key ? 'text-primary' : 'text-muted-foreground'} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                </div>
                {paymentMethod === m.key && <Check size={18} className="text-primary" />}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Order Summary</h3>
          <div className="space-y-1.5 text-sm">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-muted-foreground">
                <span className="line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                <span>₹{product.price * quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₹{subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? 'text-primary font-medium' : 'text-foreground'}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-primary">-₹{couponDiscount}</span></div>}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground"><span>Total</span><span>₹{totalPrice}</span></div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 justify-center">
          <Shield size={14} className="text-primary" />
          <span>100% secure payment. Your data is protected.</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePlaceOrder}
          disabled={loading}
          className={cn(
            'w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-bold shadow-lg transition-opacity',
            loading && 'opacity-70'
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.span>
              Processing...
            </span>
          ) : (
            `Place Order — ₹${totalPrice}`
          )}
        </motion.button>
      </div>
    </div>
  );
}

import { ArrowLeft, MapPin, CreditCard, Banknote, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { addresses } from '@/data/mock';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, deliveryFee, couponDiscount, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handlePlaceOrder = () => {
    clearCart();
    toast({ title: '🎉 Order Placed!', description: 'Your order will be delivered in 10-15 mins.' });
    navigate('/order-tracking');
  };

  if (items.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-bold text-foreground">Checkout</h1>
        </div>

        {/* Address */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">Delivery Address</h3>
          <div className="space-y-2">
            {addresses.map(addr => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr.id)}
                className={cn(
                  'w-full text-left bg-card rounded-xl border p-3 flex items-start gap-3 transition-colors',
                  selectedAddress === addr.id ? 'border-primary bg-accent/50' : 'border-border'
                )}
              >
                <MapPin size={18} className={selectedAddress === addr.id ? 'text-primary mt-0.5' : 'text-muted-foreground mt-0.5'} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{addr.label}</p>
                  <p className="text-xs text-muted-foreground">{addr.full}</p>
                </div>
                {selectedAddress === addr.id && <Check size={18} className="text-primary ml-auto mt-0.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">Payment Method</h3>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod('online')}
              className={cn(
                'w-full text-left bg-card rounded-xl border p-3 flex items-center gap-3',
                paymentMethod === 'online' ? 'border-primary bg-accent/50' : 'border-border'
              )}
            >
              <CreditCard size={18} className={paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'} />
              <div>
                <p className="text-sm font-semibold text-foreground">Pay Online</p>
                <p className="text-[11px] text-muted-foreground">UPI, Card, Wallet</p>
              </div>
              {paymentMethod === 'online' && <Check size={18} className="text-primary ml-auto" />}
            </button>
            <button
              onClick={() => setPaymentMethod('cod')}
              className={cn(
                'w-full text-left bg-card rounded-xl border p-3 flex items-center gap-3',
                paymentMethod === 'cod' ? 'border-primary bg-accent/50' : 'border-border'
              )}
            >
              <Banknote size={18} className={paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'} />
              <div>
                <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-[11px] text-muted-foreground">Pay when delivered</p>
              </div>
              {paymentMethod === 'cod' && <Check size={18} className="text-primary ml-auto" />}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Order Summary</h3>
          <div className="space-y-1.5 text-sm">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-muted-foreground">
                <span>{product.name} × {quantity}</span>
                <span>₹{product.price * quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">₹{subtotal}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? 'text-primary' : 'text-foreground'}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-primary">-₹{couponDiscount}</span></div>}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground"><span>Total</span><span>₹{totalPrice}</span></div>
          </div>
        </div>

        <button onClick={handlePlaceOrder} className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-bold">
          Place Order — ₹{totalPrice}
        </button>
      </div>
    </div>
  );
}

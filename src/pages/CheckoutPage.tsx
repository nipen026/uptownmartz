import { ArrowLeft, MapPin, CreditCard, Banknote, Check, Shield, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { paymentApi, addressApi } from '@/services/api';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiAddress } from '@/types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const emptyForm = { label: '', name: '', phone: '', address: '', city: '', district: '' };

// Inner Stripe payment form — must live inside <Elements>
function StripePaymentForm({
  orderId,
  totalPrice,
  onSuccess,
  onCancel,
}: {
  orderId: number;
  totalPrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success/${orderId}`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      toast({ title: 'Payment Failed', description: result.error.message, variant: 'destructive' });
      setLoading(false);
    } else if (result.paymentIntent?.status === 'succeeded') {
      try {
        await paymentApi.verify({ paymentIntentId: result.paymentIntent.id, orderId });
        toast({ title: 'Payment Successful!', description: 'Your order has been placed.' });
        onSuccess();
      } catch {
        toast({ title: 'Verification Failed', description: 'Please contact support.', variant: 'destructive' });
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-primary/30 p-5 mb-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">{t('checkout.payment_details')}</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground" disabled={loading}>
          <X size={18} />
        </button>
      </div>
      <PaymentElement />
      <button
        onClick={handleConfirm}
        disabled={!stripe || loading}
        className={cn(
          'w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-bold transition-opacity',
          (!stripe || loading) && 'opacity-70'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.span>
            {t('checkout.processing')}
          </span>
        ) : (
          t('checkout.confirm_payment', { total: totalPrice })
        )}
      </button>
    </motion.div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, totalPrice, deliveryFee, couponDiscount, clearCart, isLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const createOrder = useCreateOrder();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formSaving, setFormSaving] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setAddressLoading(true);
      addressApi.getAll()
        .then((data) => {
          setAddresses(data);
          const def = data.find(a => a.isDefault) || data[0];
          if (def) setSelectedAddress(def.id);
        })
        .catch(() => {})
        .finally(() => setAddressLoading(false));
    }
  }, [isAuthenticated]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleAddAddress = async () => {
    if (!formData.label || !formData.name || !formData.phone || !formData.address || !formData.city || !formData.district) {
      toast({ title: t('checkout.missing_fields'), description: t('checkout.fill_address_fields'), variant: 'destructive' });
      return;
    }
    setFormSaving(true);
    try {
      const newAddr = await addressApi.create({
        ...formData,
        isDefault: addresses.length === 0,
      });
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddress(newAddr.id);
      setShowAddForm(false);
      setFormData(emptyForm);
      toast({ title: t('checkout.address_added'), description: t('checkout.address_saved') });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save address', variant: 'destructive' });
    } finally {
      setFormSaving(false);
    }
  };

  const handleCODOrder = useCallback(async () => {
    setLoading(true);
    try {
      const order = await createOrder.mutateAsync('cod');
      clearCart();
      toast({ title: 'Order Placed!', description: 'Your order will be delivered soon.' });
      navigate(`/order-success/${order.id}`);
    } catch (error) {
      toast({
        title: 'Order Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [createOrder, clearCart, navigate]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to place an order.' });
      navigate('/login');
      return;
    }

    if (!selectedAddress && addresses.length > 0) {
      toast({ title: 'Select Address', description: 'Please select a delivery address.', variant: 'destructive' });
      return;
    }

    if (paymentMethod === 'cod') {
      await handleCODOrder();
    } else {
      setLoading(true);
      try {
        const data = await paymentApi.createOrder();
        setClientSecret(data.clientSecret);
        setCurrentOrderId(data.orderId);
      } catch (error) {
        toast({
          title: 'Payment Error',
          description: error instanceof Error ? error.message : 'Failed to initialize payment',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (items.length === 0 && !isLoading) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-display font-bold text-foreground">{t('checkout.title')}</h1>
        </motion.div>

        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/50 rounded-2xl p-3 flex items-center gap-2 mb-4 text-xs text-accent-foreground border border-accent">
            <span className="text-lg">👤</span>
            <span className="font-medium">
              <button onClick={() => navigate('/login')} className="text-primary font-bold underline">{t('checkout.login_link')}</button> {t('checkout.login_prompt')}
            </span>
          </motion.div>
        )}

        {/* Delivery Address */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h3 className="text-sm font-bold text-foreground mb-2">{t('checkout.delivery_address')}</h3>

          {addressLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2" />
                  <div className="h-3 bg-muted rounded w-48" />
                </div>
              ))}
            </div>
          ) : (
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{t('checkout.default')}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{addr.name} | {addr.phone}</p>
                    <p className="text-xs text-muted-foreground">{addr.address}, {addr.district}, {addr.city}</p>
                  </div>
                  {selectedAddress === addr.id && <Check size={18} className="text-primary mt-0.5" />}
                </motion.button>
              ))}

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className="w-full text-left bg-card rounded-2xl border border-dashed border-primary/40 p-4 flex items-center gap-3 hover:bg-accent/30 transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Plus size={16} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-primary">{t('checkout.add_address')}</p>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Stripe Payment Element — shown after creating PaymentIntent */}
        {clientSecret && currentOrderId && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#16a34a' } },
            }}
          >
            <StripePaymentForm
              orderId={currentOrderId}
              totalPrice={totalPrice}
              onSuccess={() => {
                clearCart();
                navigate(`/order-success/${currentOrderId}`);
              }}
              onCancel={() => {
                setClientSecret(null);
                setCurrentOrderId(null);
              }}
            />
          </Elements>
        )}

        {/* Payment Method — hidden once Stripe form is showing */}
        {!clientSecret && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
            <h3 className="text-sm font-bold text-foreground mb-2">{t('checkout.payment_method')}</h3>
            <div className="space-y-2">
              {[
                { key: 'online' as const, icon: CreditCard, title: t('checkout.pay_online'), desc: t('checkout.pay_online_sub') },
                { key: 'cod' as const, icon: Banknote, title: t('checkout.cod'), desc: t('checkout.cod_sub') },
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
        )}

        {/* Order Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3">{t('checkout.order_summary')}</h3>
          <div className="space-y-1.5 text-sm">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-muted-foreground">
                <span className="line-clamp-1 flex-1 mr-2">{product.name} × {quantity}</span>
                <span>HK${product.price * quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between">
              <span className="text-muted-foreground">{t('checkout.subtotal')}</span>
              <span className="text-foreground">HK${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('checkout.delivery')}</span>
              <span className={deliveryFee === 0 ? 'text-primary font-medium' : 'text-foreground'}>
                {deliveryFee === 0 ? t('common.free') : `HK$${deliveryFee}`}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('checkout.discount')}</span>
                <span className="text-primary">-HK${couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
              <span>{t('checkout.total')}</span>
              <span>HK${totalPrice}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 justify-center">
          <Shield size={14} className="text-primary" />
          <span>{t('checkout.secure')}</span>
        </div>

        {!clientSecret && (
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
                {t('checkout.processing')}
              </span>
            ) : paymentMethod === 'online' ? (
              t('checkout.pay_stripe', { total: totalPrice })
            ) : (
              t('checkout.place_order', { total: totalPrice })
            )}
          </motion.button>
        )}
      </div>

      {/* Add New Address Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl border border-border p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-bold text-foreground">{t('checkout.add_address')}</h3>
                <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('checkout.label')}</label>
                  <div className="flex gap-2">
                    {[t('checkout.home_label'), t('checkout.office_label'), t('checkout.other_label')].map(l => (
                      <button
                        key={l}
                        onClick={() => setFormData(f => ({ ...f, label: l }))}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                          formData.label === l ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border text-muted-foreground'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('checkout.full_name')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Chan Tai Man"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('checkout.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+852 9XXX XXXX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">{t('checkout.street_address')}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Flat 12A, Tower 1, 88 Nathan Road"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">{t('checkout.district')}</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={e => setFormData(f => ({ ...f, district: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tsim Sha Tsui"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">{t('checkout.area')}</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Kowloon"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddAddress}
                disabled={formSaving}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-bold mt-5 disabled:opacity-60"
              >
                {formSaving ? t('checkout.saving') : t('checkout.save_address')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CartPage() {
  const { items, updateQuantity, totalPrice, deliveryFee, couponDiscount, applyCoupon, totalItems } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    const result = await applyCoupon(coupon);
    if (result.valid) {
      setCouponMsg(`✅ ${t('cart.coupon_applied')}`);
    } else {
      setCouponMsg(`❌ ${result.message || t('cart.invalid_coupon')}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <span className="text-7xl block mb-4">🛒</span>
          <h2 className="text-xl font-display font-bold text-foreground mb-1">{t('cart.empty')}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t('cart.empty_sub')}</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-bold shadow-lg"
          >
            {t('home.explore_all')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-display font-bold text-foreground">{t('cart.title')} ({totalItems})</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/50 rounded-2xl p-3 flex items-center gap-2 mb-4 text-xs text-accent-foreground border border-accent">
          <span className="text-lg">⏱️</span>
          <span className="font-medium">Estimated delivery in <strong>10-15 mins</strong></span>
        </motion.div>

        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {items.map(({ product, quantity }, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card rounded-2xl border border-border p-3 flex items-center gap-3"
              >
                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-3xl shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{product.quantity}</p>
                  <motion.p key={quantity} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-sm font-bold text-foreground">HK${product.price * quantity}</motion.p>
                </div>
                <div className="flex items-center bg-primary rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="text-primary-foreground px-2.5 py-2 hover:bg-primary-foreground/10 transition-colors">
                    <Minus size={14} />
                  </button>
                  <motion.span key={quantity} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-primary-foreground text-xs font-bold min-w-[22px] text-center">{quantity}</motion.span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="text-primary-foreground px-2.5 py-2 hover:bg-primary-foreground/10 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Coupon */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-3 mb-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-muted-foreground" />
            <input
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              placeholder={t('cart.coupon_placeholder')}
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleApplyCoupon} className="text-primary text-xs font-bold">
              {t('cart.apply_coupon')}
            </motion.button>
          </div>
          <AnimatePresence>
            {couponMsg && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`text-xs mt-1 ${couponDiscount > 0 ? 'text-primary' : 'text-destructive'}`}>
                {couponMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bill */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl border border-border p-4 mb-4">
          <h3 className="text-sm font-bold text-foreground mb-3">{t('cart.bill')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('cart.item_total')}</span>
              <span className="text-foreground">HK${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('cart.delivery_fee')}</span>
              <span className={deliveryFee === 0 ? 'text-primary font-medium' : 'text-foreground'}>
                {deliveryFee === 0 ? t('common.free') : `HK$${deliveryFee}`}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.coupon_discount')}</span>
                <span className="text-primary">-HK${couponDiscount}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span className="text-foreground">{t('cart.grand_total')}</span>
              <span className="text-foreground">HK${totalPrice}</span>
            </div>
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 text-sm font-bold shadow-lg"
        >
          {t('cart.checkout_btn', { total: totalPrice })}
        </motion.button>
      </div>
    </div>
  );
}

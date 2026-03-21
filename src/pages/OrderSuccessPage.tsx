import { useParams, useNavigate } from 'react-router-dom';
import { Check, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg"
      >
        <Check size={40} className="text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-display font-bold text-foreground mb-2 text-center"
      >
        Order Placed Successfully!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground mb-1 text-center"
      >
        Thank you for your order
      </motion.p>

      {orderId && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-xs text-muted-foreground mb-6"
        >
          Order ID: <span className="font-bold text-foreground">ORD-{orderId}</span>
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl border border-border p-5 w-full max-w-sm mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Your order is being prepared</p>
            <p className="text-xs text-muted-foreground">Estimated delivery: 30-45 mins</p>
          </div>
        </div>
        <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground">
          You can track your order status from the Orders page.
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <button
          onClick={() => navigate('/order-tracking')}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <Package size={16} />
          Track Order
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="w-full bg-card border border-border text-foreground rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingBag size={16} />
          View All Orders
        </button>

        <button
          onClick={() => navigate('/')}
          className="text-sm text-primary font-semibold flex items-center justify-center gap-1"
        >
          Continue Shopping <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  );
}

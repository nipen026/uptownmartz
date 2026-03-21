import { RotateCcw, Package, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { data: orders = [], isLoading } = useOrders();

  const handleReorder = (items: typeof orders[0]['items']) => {
    items.forEach(({ product }) => addItem(product));
    navigate('/cart');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <span className="text-7xl block mb-4">📦</span>
          <h2 className="text-xl font-display font-bold text-foreground mb-1">Login to view orders</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to see your order history</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-bold shadow-lg"
          >
            Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-display font-bold text-foreground">My Orders</h1>
          <p className="text-xs text-muted-foreground">Track and reorder your purchases</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-5 bg-muted rounded-full w-16" />
                </div>
                <div className="flex gap-2 mb-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="w-11 h-11 bg-muted rounded-xl" />
                  ))}
                </div>
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-20">
            <span className="text-6xl block mb-3">📦</span>
            <p className="text-sm text-muted-foreground">No orders yet</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-primary" />
                    <span className="text-sm font-bold text-foreground">{order.id}</span>
                  </div>
                  <span className="text-[11px] bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full font-medium capitalize">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
                  {order.items.map(({ product }) => {
                    const isImageUrl = product.image.startsWith('http') || product.image.startsWith('/');
                    return (
                      <motion.div
                        key={product.id}
                        whileHover={{ scale: 1.1 }}
                        className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden"
                      >
                        {isImageUrl ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          product.image
                        )}
                      </motion.div>
                    );
                  })}
                  <span className="text-xs text-muted-foreground shrink-0 ml-1">{order.items.length} items</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-foreground">₹{order.total}</span>
                    <span className="text-[10px] text-muted-foreground ml-2 flex items-center gap-1 inline-flex">
                      <Calendar size={10} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReorder(order.items)}
                    className="flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-full"
                  >
                    <RotateCcw size={12} />
                    Reorder
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

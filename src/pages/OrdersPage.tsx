import { ArrowLeft, RotateCcw, Package, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pastOrders } from '@/data/mock';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleReorder = (items: typeof pastOrders[0]['items']) => {
    items.forEach(({ product }) => addItem(product));
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-display font-bold text-foreground">My Orders</h1>
          <p className="text-xs text-muted-foreground">Track and reorder your purchases</p>
        </div>

        {pastOrders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-20">
            <span className="text-6xl block mb-3">📦</span>
            <p className="text-sm text-muted-foreground">No orders yet</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((order, i) => (
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
                  {order.items.map(({ product }) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.1 }}
                      className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center text-xl shrink-0"
                    >
                      {product.image}
                    </motion.div>
                  ))}
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

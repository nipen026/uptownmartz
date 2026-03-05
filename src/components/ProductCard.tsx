import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(product.id);
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 25px -5px hsl(var(--primary) / 0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-card rounded-2xl border border-border p-3 flex flex-col relative overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {product.discount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-lg z-10"
        >
          {product.discount}% OFF
        </motion.span>
      )}
      <div className="flex items-center justify-center h-24 text-5xl mb-2 bg-muted rounded-xl transition-transform duration-300 group-hover:scale-105">
        {product.image}
      </div>
      <p className="text-[11px] text-muted-foreground mb-0.5">{product.quantity}</p>
      <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 mb-1 min-h-[2.5rem]">
        {product.name}
      </h3>
      <div className="flex items-center justify-between mt-auto pt-1">
        <div>
          <span className="text-sm font-bold text-foreground">₹{product.price}</span>
          {product.discount > 0 && (
            <span className="text-xs text-muted-foreground line-through ml-1">₹{product.originalPrice}</span>
          )}
        </div>
        <div onClick={e => e.stopPropagation()}>
          <AnimatePresence mode="wait">
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addItem(product)}
                className="bg-primary/10 text-primary border border-primary rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                ADD
              </motion.button>
            ) : (
              <motion.div
                key="qty"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="flex items-center bg-primary rounded-xl overflow-hidden shadow-md"
              >
                <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-primary-foreground px-2 py-1.5 hover:bg-primary-foreground/10 transition-colors">
                  <Minus size={14} />
                </button>
                <motion.span
                  key={qty}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-primary-foreground text-xs font-bold min-w-[20px] text-center"
                >
                  {qty}
                </motion.span>
                <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-primary-foreground px-2 py-1.5 hover:bg-primary-foreground/10 transition-colors">
                  <Plus size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

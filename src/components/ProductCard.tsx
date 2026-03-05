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
      className="bg-card rounded-xl border border-border p-3 flex flex-col relative overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {product.discount > 0 && (
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
          {product.discount}% OFF
        </span>
      )}
      <div className="flex items-center justify-center h-24 text-5xl mb-2 bg-muted rounded-lg">
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
                onClick={() => addItem(product)}
                className="bg-primary/10 text-primary border border-primary rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                ADD
              </motion.button>
            ) : (
              <motion.div
                key="qty"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="flex items-center bg-primary rounded-lg overflow-hidden"
              >
                <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-primary-foreground px-2 py-1.5">
                  <Minus size={14} />
                </button>
                <span className="text-primary-foreground text-xs font-bold min-w-[20px] text-center">{qty}</span>
                <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-primary-foreground px-2 py-1.5">
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

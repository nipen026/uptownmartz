import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(product.id);
  const navigate = useNavigate();
  const hasImage = product.image.startsWith('http') || product.image.startsWith('/');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group bg-card rounded-2xl border border-border/60 overflow-hidden cursor-pointer flex flex-col hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {hasImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {product.image}
          </div>
        )}

        {/* Discount badge */}
        {product.discount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm"
          >
            {product.discount}% OFF
          </motion.span>
        )}

        {/* Quick add overlay */}
        <div
          onClick={e => e.stopPropagation()}
          className="absolute bottom-2.5 right-2.5"
        >
          <AnimatePresence mode="wait">
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addItem(product)}
                className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Plus size={18} strokeWidth={2.5} />
              </motion.button>
            ) : (
              <motion.div
                key="qty"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center bg-primary rounded-full overflow-hidden shadow-lg"
              >
                <button
                  onClick={() => updateQuantity(product.id, qty - 1)}
                  className="text-primary-foreground px-2.5 py-2 hover:bg-primary-foreground/10 transition-colors"
                >
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
                <button
                  onClick={() => updateQuantity(product.id, qty + 1)}
                  className="text-primary-foreground px-2.5 py-2 hover:bg-primary-foreground/10 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-muted-foreground/70 uppercase tracking-wide mb-1">
          {product.brand || product.quantity}
        </p>
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">₹{product.price}</span>
            {product.discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

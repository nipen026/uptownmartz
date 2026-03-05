import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, ShoppingBag, Star, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const product = products.find(p => p.id === id);
  const similar = products.filter(p => p.category === product?.category && p.id !== id).slice(0, 4);
  const [liked, setLiked] = useState(false);

  if (!product) return <div className="p-4 text-center text-muted-foreground">Product not found</div>;

  const qty = getItemQuantity(product.id);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setLiked(!liked)} className="transition-colors">
              <Heart size={20} className={liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'} />
            </button>
            <button className="text-muted-foreground">
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-muted rounded-3xl flex items-center justify-center h-56 md:h-72 text-8xl md:text-9xl mb-5 relative overflow-hidden group"
        >
          <motion.span whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring' }}>
            {product.image}
          </motion.span>
          {product.discount > 0 && (
            <motion.span
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg"
            >
              {product.discount}% OFF
            </motion.span>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">{product.brand}</span>
            <span className="text-xs text-muted-foreground">{product.quantity}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">{product.name}</h2>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5 bg-primary/10 px-2 py-0.5 rounded-full">
              <Star size={12} className="fill-primary text-primary" />
              <span className="text-xs font-bold text-primary">4.5</span>
            </div>
            <span className="text-xs text-muted-foreground">1.2k ratings</span>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-display font-bold text-foreground">₹{product.price}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
                <span className="text-sm font-bold text-primary">Save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <AnimatePresence mode="wait">
            {qty === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addItem(product)}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-sm shadow-lg animate-pulse-glow"
              >
                <ShoppingBag size={18} />
                Add to Cart — ₹{product.price}
              </motion.button>
            ) : (
              <motion.div key="qty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center bg-primary rounded-2xl overflow-hidden shadow-lg">
                <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-primary-foreground px-8 py-4 hover:bg-primary-foreground/10 transition-colors">
                  <Minus size={18} />
                </button>
                <motion.span key={qty} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-primary-foreground text-xl font-bold min-w-[50px] text-center">
                  {qty}
                </motion.span>
                <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-primary-foreground px-8 py-4 hover:bg-primary-foreground/10 transition-colors">
                  <Plus size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {similar.length > 0 && (
          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-3">You might also like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {similar.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

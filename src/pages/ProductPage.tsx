import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, ShoppingBag, Star, Share2, Heart, Truck, Shield, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  const [liked, setLiked] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="max-w-6xl mx-auto px-4 animate-pulse">
          <div className="py-4 flex items-center gap-3">
            <div className="w-6 h-6 bg-muted rounded" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-3xl" />
            <div className="space-y-4 py-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-10 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-14 bg-muted rounded-2xl w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-4 text-center text-muted-foreground">Product not found</div>;

  const qty = getItemQuantity(product.id);
  const similar = allProducts.filter(p => p.category === product.category && p.id !== id).slice(0, 4);
  const hasImage = product.image.startsWith('http') || product.image.startsWith('/');

  const highlights = [
    { icon: Truck, label: 'Free delivery', sub: 'Orders above ₹199' },
    { icon: Shield, label: 'Quality assured', sub: '100% genuine products' },
    { icon: RotateCcw, label: 'Easy returns', sub: 'Within 7 days' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between py-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center transition-all hover:border-primary/40"
            >
              <Heart size={18} className={liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'} />
            </button>
            <button className="w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:border-primary/40 transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </motion.div>

        {/* Main content: Image + Details side by side on desktop */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-muted group"
          >
            {hasImage ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring' }}
                  className="text-8xl md:text-9xl"
                >
                  {product.image}
                </motion.span>
              </div>
            )}

            {/* Discount badge */}
            {product.discount > 0 && (
              <motion.span
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl shadow-lg"
              >
                {product.discount}% OFF
              </motion.span>
            )}

            {/* Stock badge */}
            {product.inStock && (
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-foreground">In Stock</span>
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex flex-col"
          >
            {/* Category + Rating */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-medium">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                <Star size={12} className="fill-primary text-primary" />
                <span className="text-xs font-bold text-primary">4.5</span>
              </div>
              <span className="text-xs text-muted-foreground">1.2k ratings</span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight mb-2">
              {product.name}
            </h1>

            {/* Quantity/Weight */}
            <p className="text-sm text-muted-foreground mb-4">{product.quantity}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl md:text-4xl font-display font-bold text-foreground">
                ₹{product.price}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">About this product</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {highlights.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-2xl">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-tight">{label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{sub}</span>
                </div>
              ))}
            </div>

            {/* Add to Cart */}
            <div className="mt-auto">
              <AnimatePresence mode="wait">
                {qty === 0 ? (
                  <motion.button
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addItem(product)}
                    className="w-full bg-primary text-primary-foreground rounded-2xl py-4 flex items-center justify-center gap-2.5 font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <ShoppingBag size={18} />
                    Add to Cart — ₹{product.price}
                  </motion.button>
                ) : (
                  <motion.div
                    key="qty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center bg-primary rounded-2xl overflow-hidden shadow-lg flex-1 justify-center">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="text-primary-foreground px-6 py-4 hover:bg-primary-foreground/10 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <motion.span
                        key={qty}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-primary-foreground text-xl font-bold min-w-[40px] text-center"
                      >
                        {qty}
                      </motion.span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="text-primary-foreground px-6 py-4 hover:bg-primary-foreground/10 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold text-foreground">₹{product.price * qty}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Already in cart indicator */}
              {qty > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-1.5 text-xs text-primary font-medium mt-3"
                >
                  <Check size={14} />
                  {qty} item{qty > 1 ? 's' : ''} in your cart
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="text-lg font-display font-bold text-foreground mb-4">You might also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similar.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

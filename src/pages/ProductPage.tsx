import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const product = products.find(p => p.id === id);
  const similar = products.filter(p => p.category === product?.category && p.id !== id).slice(0, 4);

  if (!product) return <div className="p-4 text-center text-muted-foreground">Product not found</div>;

  const qty = getItemQuantity(product.id);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-muted rounded-2xl flex items-center justify-center h-56 text-8xl mb-4 relative">
          {product.image}
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg">
              {product.discount}% OFF
            </span>
          )}
        </motion.div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">{product.brand} · {product.quantity}</p>
          <h2 className="text-xl font-bold text-foreground mb-1">{product.name}</h2>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
            {product.discount > 0 && (
              <span className="text-base text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        <div className="mb-6">
          {qty === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold text-sm"
            >
              <ShoppingBag size={18} />
              Add to Cart — ₹{product.price}
            </button>
          ) : (
            <div className="flex items-center justify-center bg-primary rounded-xl overflow-hidden">
              <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-primary-foreground px-6 py-3.5">
                <Minus size={18} />
              </button>
              <span className="text-primary-foreground text-lg font-bold min-w-[40px] text-center">{qty}</span>
              <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-primary-foreground px-6 py-3.5">
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>

        {similar.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">Similar Products</h3>
            <div className="grid grid-cols-2 gap-3">
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

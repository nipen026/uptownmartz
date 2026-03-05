import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCart() {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (totalItems === 0 || location.pathname === '/cart') return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={() => navigate('/cart')}
        className="fixed bottom-16 left-4 right-4 max-w-lg mx-auto bg-primary text-primary-foreground rounded-xl px-5 py-3.5 flex items-center justify-between z-50 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} />
          <span className="text-sm font-bold">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold">₹{totalPrice}</span>
          <span className="text-xs opacity-80 ml-1">→</span>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}

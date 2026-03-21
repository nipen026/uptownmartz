import { MapPin, ChevronDown, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DeliveryHeader() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-primary/10 p-2 rounded-full"
        >
          <MapPin size={16} className="text-primary" />
        </motion.div>
        <div>
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-sm font-bold text-foreground">Deliver to</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0]}!` : 'Select delivery location'}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
        className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
          <User size={14} className="text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground hidden md:block">
          {isAuthenticated ? user?.name?.split(' ')[0] : 'Login'}
        </span>
      </button>
    </div>
  );
}

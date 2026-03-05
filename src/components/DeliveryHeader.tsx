import { MapPin, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export function DeliveryHeader() {
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
            <span className="text-sm font-bold text-foreground">Home</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">42, Green Park Extension, New Delhi</p>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-right bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/20"
      >
        <p className="text-[10px] text-muted-foreground">Delivery in</p>
        <p className="text-sm font-bold text-primary">10 mins ⚡</p>
      </motion.div>
    </div>
  );
}

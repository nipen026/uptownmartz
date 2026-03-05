import { motion } from 'framer-motion';

const banners = [
  { id: 1, emoji: '⚡', title: 'Flash Deal!', subtitle: 'Up to 50% off on fruits', bg: 'bg-accent' },
  { id: 2, emoji: '🆓', title: 'Free Delivery', subtitle: 'On orders above ₹199', bg: 'bg-secondary/15' },
  { id: 3, emoji: '🎉', title: 'New User?', subtitle: 'Use code FIRST100 for ₹100 off', bg: 'bg-primary/10' },
];

export function PromoBanners() {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-1 py-1">
      {banners.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`${b.bg} rounded-2xl p-4 min-w-[260px] flex items-center gap-3 shrink-0 cursor-pointer border border-border/50`}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
            className="text-4xl"
          >
            {b.emoji}
          </motion.span>
          <div>
            <p className="text-sm font-bold text-foreground">{b.title}</p>
            <p className="text-xs text-muted-foreground">{b.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

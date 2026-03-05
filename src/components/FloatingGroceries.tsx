import { motion } from 'framer-motion';

const floatingItems = [
  { emoji: '🍎', size: 'text-4xl', x: '10%', y: '20%', delay: 0 },
  { emoji: '🥦', size: 'text-5xl', x: '80%', y: '15%', delay: 0.5 },
  { emoji: '🍞', size: 'text-3xl', x: '70%', y: '60%', delay: 1 },
  { emoji: '🥛', size: 'text-4xl', x: '15%', y: '70%', delay: 1.5 },
  { emoji: '🍇', size: 'text-3xl', x: '85%', y: '80%', delay: 0.8 },
  { emoji: '🥕', size: 'text-4xl', x: '5%', y: '45%', delay: 1.2 },
  { emoji: '🧀', size: 'text-3xl', x: '90%', y: '40%', delay: 0.3 },
  { emoji: '🍌', size: 'text-4xl', x: '45%', y: '10%', delay: 0.7 },
  { emoji: '🫐', size: 'text-2xl', x: '30%', y: '85%', delay: 1.8 },
  { emoji: '🥑', size: 'text-3xl', x: '60%', y: '5%', delay: 1.4 },
];

export function FloatingGroceries() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, i) => (
        <motion.span
          key={i}
          className={`absolute ${item.size} opacity-20`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, -5, -20, 0],
            rotate: [0, 5, -3, 8, 0],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  );
}

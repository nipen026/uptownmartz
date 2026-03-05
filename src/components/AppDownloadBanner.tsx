import { ScrollReveal } from './ScrollReveal';
import { motion } from 'framer-motion';

export function AppDownloadBanner() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="gradient-primary rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              {['🍎', '🥦', '🍞', '🥛', '🍇'].map((e, i) => (
                <motion.span
                  key={i}
                  className="absolute text-4xl"
                  style={{ left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
                Get the QuickCart App
              </h2>
              <p className="text-primary-foreground/80 text-sm mb-6 max-w-md mx-auto">
                Download now and enjoy exclusive app-only deals. Get ₹100 off on your first order!
              </p>
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-card text-foreground rounded-xl px-5 py-3 text-sm font-bold shadow-lg"
                >
                  📱 App Store
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-card text-foreground rounded-xl px-5 py-3 text-sm font-bold shadow-lg"
                >
                  🤖 Google Play
                </motion.button>
              </div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}

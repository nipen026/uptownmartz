import { useNavigate } from 'react-router-dom';
import { Check, Package, Truck, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const steps = [
  { icon: Check, label: 'Order Confirmed', desc: 'Your order has been placed successfully' },
  { icon: Package, label: 'Picking Items', desc: 'We are picking your items from the store' },
  { icon: Truck, label: 'Out for Delivery', desc: 'Your order is on its way!' },
  { icon: HomeIcon, label: 'Delivered', desc: 'Your order has been delivered' },
];

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const orderId = `ORD-${Math.floor(Math.random() * 9000 + 1000)}`;

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 3000),
      setTimeout(() => setCurrentStep(2), 8000),
      setTimeout(() => setCurrentStep(3), 15000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
          <h1 className="text-lg font-display font-bold text-foreground">Order Tracking</h1>
          <p className="text-xs text-muted-foreground">{orderId}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-accent to-accent/30 rounded-3xl p-6 mb-6 text-center border border-accent"
        >
          <p className="text-sm text-muted-foreground mb-1">Estimated delivery</p>
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-3xl font-display font-bold text-primary"
          >
            10-15 mins
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Sit back and relax! 🛋️</p>
        </motion.div>

        <div className="bg-card rounded-3xl border border-border p-6 mb-6">
          <div className="space-y-0">
            {steps.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={active ? { scale: [1, 1.15, 1] } : {}}
                      transition={active ? { repeat: Infinity, duration: 1.5 } : {}}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500',
                        done ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon size={18} />
                    </motion.div>
                    {i < steps.length - 1 && (
                      <motion.div
                        className="w-0.5 h-12"
                        initial={{ backgroundColor: 'hsl(var(--border))' }}
                        animate={{ backgroundColor: done ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </div>
                  <div className="pt-2 pb-8">
                    <p className={cn('text-sm font-semibold transition-colors', done ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</p>
                    <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                    {active && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[11px] text-primary font-medium mt-1 block">
                        In progress...
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Map placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-muted rounded-3xl h-40 mb-6 flex items-center justify-center border border-border overflow-hidden relative"
        >
          <div className="text-center z-10">
            <span className="text-3xl">🗺️</span>
            <p className="text-xs text-muted-foreground mt-1">Live tracking map</p>
          </div>
          <motion.div
            className="absolute w-3 h-3 bg-primary rounded-full"
            animate={{ x: [0, 50, 80, 120], y: [0, -20, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            style={{ left: '20%', top: '50%' }}
          />
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className="w-full bg-card border border-border rounded-2xl py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Back to Home
        </motion.button>
      </div>
    </div>
  );
}

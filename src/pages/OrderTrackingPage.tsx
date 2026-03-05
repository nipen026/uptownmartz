import { useNavigate } from 'react-router-dom';
import { Check, Package, Truck, Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const steps = [
  { icon: Check, label: 'Order Confirmed', time: 'Just now' },
  { icon: Package, label: 'Picking Items', time: '~2 mins' },
  { icon: Truck, label: 'Out for Delivery', time: '~8 mins' },
  { icon: HomeIcon, label: 'Delivered', time: '~12 mins' },
];

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

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
      <div className="max-w-lg mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-bold text-foreground">Order Tracking</h1>
          <p className="text-xs text-muted-foreground">Order #ORD-{Math.floor(Math.random() * 9000 + 1000)}</p>
        </div>

        <div className="bg-accent/50 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground">Estimated delivery</p>
          <p className="text-2xl font-bold text-primary">10-15 mins</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="space-y-0">
            {steps.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: active ? 1.1 : 1 }}
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon size={16} />
                    </motion.div>
                    {i < steps.length - 1 && (
                      <div className={cn('w-0.5 h-10', done ? 'bg-primary' : 'bg-border')} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-6">
                    <p className={cn('text-sm font-semibold', done ? 'text-foreground' : 'text-muted-foreground')}>{step.label}</p>
                    <p className="text-[11px] text-muted-foreground">{step.time}</p>
                    {active && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1">
                        <span className="text-[11px] text-primary font-medium animate-pulse">In progress...</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => navigate('/')} className="w-full bg-card border border-border rounded-xl py-3 text-sm font-semibold text-foreground">
          Back to Home
        </button>
      </div>
    </div>
  );
}

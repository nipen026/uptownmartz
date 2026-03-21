import { Zap, ShieldCheck, Clock, Truck } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { motion } from 'framer-motion';

const features = [
  { icon: Clock, title: '10-Minute Delivery', desc: 'Get your groceries delivered to your doorstep in just 10 minutes.' },
  { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'We handpick the freshest produce and top-quality brands for you.' },
  { icon: Zap, title: 'Best Prices', desc: 'Enjoy exclusive deals, flash sales, and everyday low prices.' },
  { icon: Truck, title: 'Free Delivery', desc: 'Free delivery on all orders above ₹199. No hidden charges ever.' },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 px-4 bg-accent/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-2">
            Why Choose QuickCart?
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">
            India's fastest grocery delivery platform
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl border border-border p-5 text-center h-full"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

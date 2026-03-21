import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const testimonials = [
  { name: 'Priya S.', text: "QuickCart delivers my groceries in 10 minutes! It's like magic. I can't imagine going back to traditional shopping.", rating: 5, avatar: '👩' },
  { name: 'Rahul M.', text: 'The product quality is consistently excellent. Fresh vegetables every single time. Love the discount deals too!', rating: 5, avatar: '👨' },
  { name: 'Anita K.', text: 'Best grocery app in the market. The UI is super smooth and the delivery is lightning fast. Highly recommend!', rating: 5, avatar: '👩‍💼' },
];

export function Testimonials() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-2">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">
            Trusted by thousands of happy shoppers
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -4, boxShadow: '0 12px 30px -8px hsl(var(--primary) / 0.15)' }}
                className="bg-card rounded-2xl border border-border p-6 h-full"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{t.avatar}</span>
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Zap, ShieldCheck, Clock, Truck } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function WhyChooseUs() {
  const { t } = useTranslation();

  const features = [
    { icon: Clock, title: t('why.fast_title'), desc: t('why.fast_desc') },
    { icon: ShieldCheck, title: t('why.quality_title'), desc: t('why.quality_desc') },
    { icon: Zap, title: t('why.price_title'), desc: t('why.price_desc') },
    { icon: Truck, title: t('why.delivery_title'), desc: t('why.delivery_desc') },
  ];

  return (
    <section className="py-16 px-4 bg-accent/30">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-2">
            {t('why.title')}
          </h2>
          <p className="text-muted-foreground text-center mb-10 text-sm">
            {t('home.hero_sub')}
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl p-6 border border-border text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

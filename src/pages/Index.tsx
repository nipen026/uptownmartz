import { DeliveryHeader } from '@/components/DeliveryHeader';
import { SearchBar } from '@/components/SearchBar';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { PromoBanners } from '@/components/PromoBanners';
import { FloatingGroceries } from '@/components/FloatingGroceries';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { Testimonials } from '@/components/Testimonials';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/ScrollReveal';
import { categories, products } from '@/data/mock';
import { motion } from 'framer-motion';

const Index = () => {
  const flashDeals = products.filter(p => p.discount >= 20);
  const recommended = products.slice(0, 6);
  const popular = products.slice(6, 12);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-accent/50 pt-2 pb-10">
        <FloatingGroceries />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <DeliveryHeader />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-6 mb-6"
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3 leading-tight">
              Groceries Delivered in{' '}
              <span className="text-gradient-primary">10 Minutes</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              From fresh produce to daily essentials — get everything delivered lightning fast.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 border-b border-border">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          <AnimatedCounter end={50000} suffix="+" label="Happy Customers" />
          <AnimatedCounter end={10} suffix=" min" label="Avg. Delivery" />
          <AnimatedCounter end={5000} suffix="+" label="Products" />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        {/* Promo Banners */}
        <ScrollReveal className="mt-8 mb-8">
          <PromoBanners />
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal className="mb-8">
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-4">Shop by Category</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <CategoryCard category={cat} />
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <ScrollReveal className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xl">⚡</motion.span>
                <h2 className="text-lg font-display font-bold text-foreground">Flash Deals</h2>
              </div>
              <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">See all →</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {flashDeals.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Recommended */}
        <ScrollReveal className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">🔥 Recommended for You</h2>
            <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">See all →</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </ScrollReveal>

        {/* Popular */}
        <ScrollReveal className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">🛒 Popular Products</h2>
            <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">See all →</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popular.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Testimonials */}
      <Testimonials />

      {/* App Download */}
      <AppDownloadBanner />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

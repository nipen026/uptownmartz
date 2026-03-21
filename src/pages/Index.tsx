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
import { useProducts, useCategories, useBestSellers } from '@/hooks/useProducts';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: products = [], isLoading: prodLoading } = useProducts();
  const { data: bestSellers = [] } = useBestSellers();

  const flashDeals = bestSellers.length > 0 ? bestSellers : products.filter(p => p.discount >= 20);
  const recommended = products.slice(0, 6);
  const popular = products.slice(6, 12);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent via-background to-accent/50 pt-2 pb-10">
        <FloatingGroceries />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-6 mb-6"
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3 leading-tight">
              Fresh Groceries,{' '}
              <span className="text-gradient-primary">Delivered Fast</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              From fresh produce to daily essentials — order now and get everything delivered right to your doorstep.
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
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-3 gap-4">
          <AnimatedCounter end={50000} suffix="+" label="Happy Customers" />
          <AnimatedCounter end={10} suffix=" min" label="Avg. Delivery" />
          <AnimatedCounter end={5000} suffix="+" label="Products" />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* Promo Banners */}
        <ScrollReveal className="mt-8 mb-8">
          <PromoBanners />
        </ScrollReveal>

        {/* Categories */}
        <ScrollReveal className="mb-8">
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-4">Shop by Category</h2>
          {catLoading ? (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-muted" />
                  <div className="h-3 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </ScrollReveal>

        {/* Flash Deals / Best Sellers */}
        {flashDeals.length > 0 && (
          <ScrollReveal className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-xl">⚡</motion.span>
                <h2 className="text-lg font-display font-bold text-foreground">Flash Deals</h2>
              </div>
              <span onClick={() => navigate('/products?filter=deals')} className="text-xs text-primary font-semibold cursor-pointer hover:underline">See all →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <span onClick={() => navigate('/products?filter=recommended')} className="text-xs text-primary font-semibold cursor-pointer hover:underline">See all →</span>
          </div>
          {prodLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/60 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3">
                    <div className="h-2.5 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommended.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Popular */}
        {popular.length > 0 && (
          <ScrollReveal className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-foreground">🛒 Popular Products</h2>
              <span onClick={() => navigate('/products?filter=popular')} className="text-xs text-primary font-semibold cursor-pointer hover:underline">See all →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {popular.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </ScrollReveal>
        )}
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

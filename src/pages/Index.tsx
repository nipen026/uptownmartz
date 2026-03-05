import { DeliveryHeader } from '@/components/DeliveryHeader';
import { SearchBar } from '@/components/SearchBar';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { PromoBanners } from '@/components/PromoBanners';
import { categories, products } from '@/data/mock';
import { motion } from 'framer-motion';

const Index = () => {
  const flashDeals = products.filter(p => p.discount >= 20);
  const recommended = products.slice(0, 6);
  const popular = products.slice(6, 12);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <DeliveryHeader />

        {/* Search */}
        <div className="mb-4">
          <SearchBar />
        </div>

        {/* Promo Banners */}
        <div className="mb-5">
          <PromoBanners />
        </div>

        {/* Categories */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-foreground mb-3">Shop by Category</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">⚡ Flash Deals</h2>
              <span className="text-xs text-primary font-semibold">See all</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {flashDeals.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">🔥 Recommended</h2>
            <span className="text-xs text-primary font-semibold">See all</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Popular */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">🛒 Popular Products</h2>
            <span className="text-xs text-primary font-semibold">See all</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popular.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

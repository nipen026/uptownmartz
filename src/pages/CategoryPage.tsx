import { useParams, useNavigate } from 'react-router-dom';
import { categories, products } from '@/data/mock';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLeft } from 'lucide-react';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const category = categories.find(c => c.id === id);
  const categoryProducts = products.filter(p => p.category === id);

  if (!category) return <div className="p-4 text-center text-muted-foreground">Category not found</div>;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-foreground">{category.name}</h1>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categoryProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {categoryProducts.length === 0 && (
          <p className="text-center text-muted-foreground mt-10 text-sm">No products in this category yet.</p>
        )}
      </div>
    </div>
  );
}

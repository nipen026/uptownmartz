import { Category } from '@/types';
import { useNavigate } from 'react-router-dom';

export function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/category/${category.id}`)}
      className="flex flex-col items-center gap-1.5 min-w-[72px]"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
        style={{ backgroundColor: category.color }}
      >
        {category.image}
      </div>
      <span className="text-[11px] font-medium text-foreground text-center leading-tight w-16">
        {category.name}
      </span>
    </button>
  );
}

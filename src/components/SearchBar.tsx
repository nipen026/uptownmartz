import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/search')}
      className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 text-muted-foreground"
    >
      <Search size={18} />
      <span className="text-sm">Search for groceries...</span>
    </button>
  );
}

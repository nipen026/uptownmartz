import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pastOrders } from '@/data/mock';
import { useCart } from '@/context/CartContext';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleReorder = (items: typeof pastOrders[0]['items']) => {
    items.forEach(({ product }) => addItem(product));
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-bold text-foreground">My Orders</h1>
        </div>

        {pastOrders.length === 0 ? (
          <div className="text-center mt-20">
            <span className="text-5xl">📦</span>
            <p className="text-sm text-muted-foreground mt-3">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastOrders.map(order => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">{order.id}</span>
                  <span className="text-[11px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium capitalize">{order.status.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
                  {order.items.map(({ product }) => (
                    <div key={product.id} className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl shrink-0">
                      {product.image}
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground shrink-0">{order.items.length} items</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">₹{order.total}</span>
                  <button
                    onClick={() => handleReorder(order.items)}
                    className="flex items-center gap-1 text-primary text-xs font-bold"
                  >
                    <RotateCcw size={12} />
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

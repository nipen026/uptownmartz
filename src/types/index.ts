// ===== Backend API Response Types =====

export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  isBestSeller: boolean;
  CategoryId: number | null;
  Category?: ApiCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  id: number;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCartItem {
  id: number;
  quantity: number;
  UserId: number;
  ProductId: number;
  Product: ApiProduct;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrderItem {
  id: number;
  quantity: number;
  price: number;
  OrderId: number;
  ProductId: number;
  Product: ApiProduct;
}

export interface ApiOrder {
  id: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  UserId: number;
  User?: ApiUser;
  OrderItems: ApiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface ApiAddress {
  id: number;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
  UserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  delivered: number;
  pending: number;
  cancelled: number;
  revenue: number;
}

// ===== Frontend Display Types (adapted from API) =====

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  quantity: string;
  category: string;
  description: string;
  inStock: boolean;
  brand: string;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  cartItemId?: number; // backend Cart row id
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'confirmed' | 'picking' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'pending';
  createdAt: string;
  deliveryAddress: string;
  estimatedTime: string;
  paymentMethod?: string;
}

export interface Address {
  id: string;
  label: string;
  full: string;
  isDefault: boolean;
  name?: string;
  phone?: string;
  city?: string;
  pincode?: string;
}

// ===== Helpers to convert API types to frontend types =====

const categoryColors: Record<number, string> = {
  1: 'hsl(145, 72%, 94%)',
  2: 'hsl(42, 100%, 94%)',
  3: 'hsl(25, 95%, 94%)',
  4: 'hsl(200, 80%, 94%)',
  5: 'hsl(0, 84%, 94%)',
  6: 'hsl(270, 60%, 94%)',
  7: 'hsl(320, 60%, 94%)',
  8: 'hsl(180, 60%, 94%)',
};

const categoryEmojis: Record<string, string> = {
  'fruits': '🥦', 'vegetables': '🥦', 'fruits & vegetables': '🥦',
  'dairy': '🥛', 'bread': '🥛', 'dairy & bread': '🥛',
  'snacks': '🍿',
  'beverages': '🧃',
  'instant food': '🍜', 'instant': '🍜',
  'household': '🧹',
  'personal care': '🧴',
  'baby care': '🍼',
};

function getCategoryEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(categoryEmojis)) {
    if (lower.includes(key)) return emoji;
  }
  return '📦';
}

export function apiCategoryToCategory(cat: ApiCategory): Category {
  return {
    id: String(cat.id),
    name: cat.name,
    image: cat.image || getCategoryEmoji(cat.name),
    color: categoryColors[cat.id] || `hsl(${(cat.id * 47) % 360}, 60%, 94%)`,
  };
}

export function getImageUrl(imagePath: string | null): string {
  if (!imagePath) return '📦';
  if (imagePath.startsWith('http')) return imagePath;
  return `${import.meta.env.VITE_BASE_URL}${imagePath}`;
}

export function apiProductToProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    image: p.image ? getImageUrl(p.image) : '📦',
    price: p.price,
    originalPrice: p.price,
    discount: 0,
    quantity: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
    category: p.CategoryId ? String(p.CategoryId) : '',
    description: p.description || '',
    inStock: p.stock > 0,
    brand: p.Category?.name || '',
    stock: p.stock,
  };
}

export function apiOrderToOrder(o: ApiOrder): Order {
  return {
    id: `ORD-${o.id}`,
    items: o.OrderItems.map(item => ({
      product: apiProductToProduct(item.Product),
      quantity: item.quantity,
    })),
    total: o.total,
    status: o.status as Order['status'],
    createdAt: o.createdAt,
    deliveryAddress: '',
    estimatedTime: '10-15 mins',
    paymentMethod: o.paymentMethod || undefined,
  };
}

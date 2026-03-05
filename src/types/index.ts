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
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'confirmed' | 'picking' | 'out_for_delivery' | 'delivered';
  createdAt: string;
  deliveryAddress: string;
  estimatedTime: string;
}

export interface Address {
  id: string;
  label: string;
  full: string;
  isDefault: boolean;
}

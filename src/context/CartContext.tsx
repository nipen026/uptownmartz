import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponDiscount(0);
  }, []);

  const getItemQuantity = useCallback((productId: string) => {
    return items.find(i => i.product.id === productId)?.quantity || 0;
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal > 199 ? 0 : 25;
  const totalPrice = subtotal + deliveryFee - couponDiscount;

  const applyCoupon = useCallback((code: string) => {
    if (code.toUpperCase() === 'QUICK50') {
      setCouponDiscount(50);
      return true;
    }
    if (code.toUpperCase() === 'FIRST100') {
      setCouponDiscount(100);
      return true;
    }
    return false;
  }, []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, totalItems, totalPrice, deliveryFee, couponDiscount, applyCoupon }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

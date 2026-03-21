import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CartItem, Product, apiProductToProduct } from '@/types';
import { cartApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const CART_STORAGE_KEY = 'uptownmartz_cart';

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
  isLoading: boolean;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

function saveCartToStorage(items: CartItem[]) {
  try {
    const data = items.map(i => ({
      product: i.product,
      quantity: i.quantity,
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Persist to localStorage whenever items change (for guest fallback)
  useEffect(() => {
    if (!isAuthenticated) {
      saveCartToStorage(items);
    }
  }, [items, isAuthenticated]);

  // Sync cart from backend when authenticated
  const syncCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const cartItems = await cartApi.get();
      const synced = cartItems.map((item) => ({
        product: apiProductToProduct(item.Product),
        quantity: item.quantity,
        cartItemId: item.id,
      }));
      setItems(synced);
      // Clear localStorage since backend is source of truth
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to sync cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Sync on auth state change (login/logout)
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        syncCart();
      } else {
        // When logged out, load from localStorage
        setItems(loadCartFromStorage());
      }
    }
  }, [isAuthenticated, authLoading, syncCart]);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });

    if (isAuthenticated) {
      cartApi.add(Number(product.id), 1).then(res => {
        setItems(prev =>
          prev.map(i => i.product.id === product.id ? { ...i, cartItemId: res.id } : i)
        );
      }).catch(() => {
        syncCart();
      });
    }
  }, [isAuthenticated, syncCart]);

  const removeItem = useCallback((productId: string) => {
    const item = itemsRef.current.find(i => i.product.id === productId);
    setItems(prev => prev.filter(i => i.product.id !== productId));

    if (isAuthenticated && item?.cartItemId) {
      cartApi.remove(item.cartItemId).catch(() => syncCart());
    }
  }, [isAuthenticated, syncCart]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const item = itemsRef.current.find(i => i.product.id === productId);

    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      if (isAuthenticated && item?.cartItemId) {
        cartApi.remove(item.cartItemId).catch(() => syncCart());
      }
    } else {
      setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
      if (isAuthenticated && item?.cartItemId) {
        cartApi.update(item.cartItemId, quantity).catch(() => syncCart());
      }
    }
  }, [isAuthenticated, syncCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponDiscount(0);
    localStorage.removeItem(CART_STORAGE_KEY);

    if (isAuthenticated) {
      cartApi.clear().catch(() => syncCart());
    }
  }, [isAuthenticated, syncCart]);

  const getItemQuantity = useCallback((productId: string) => {
    return items.find(i => i.product.id === productId)?.quantity || 0;
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal > 199 ? 0 : 25;
  const totalPrice = Math.max(0, subtotal + deliveryFee - couponDiscount);

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
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, getItemQuantity, totalItems, totalPrice, deliveryFee, couponDiscount, applyCoupon, isLoading, syncCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

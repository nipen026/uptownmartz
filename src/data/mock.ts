import { Product, Category, Order, Address } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Fruits & Vegetables', image: '🥦', color: 'hsl(145, 72%, 94%)' },
  { id: '2', name: 'Dairy & Bread', image: '🥛', color: 'hsl(42, 100%, 94%)' },
  { id: '3', name: 'Snacks', image: '🍿', color: 'hsl(25, 95%, 94%)' },
  { id: '4', name: 'Beverages', image: '🧃', color: 'hsl(200, 80%, 94%)' },
  { id: '5', name: 'Instant Food', image: '🍜', color: 'hsl(0, 84%, 94%)' },
  { id: '6', name: 'Household', image: '🧹', color: 'hsl(270, 60%, 94%)' },
  { id: '7', name: 'Personal Care', image: '🧴', color: 'hsl(320, 60%, 94%)' },
  { id: '8', name: 'Baby Care', image: '🍼', color: 'hsl(180, 60%, 94%)' },
];

export const products: Product[] = [
  { id: '1', name: 'Fresh Bananas', image: '🍌', price: 45, originalPrice: 60, discount: 25, quantity: '1 dozen', category: '1', description: 'Farm fresh bananas, naturally ripened.', inStock: true, brand: 'FreshFarm' },
  { id: '2', name: 'Amul Toned Milk', image: '🥛', price: 30, originalPrice: 32, discount: 6, quantity: '500 ml', category: '2', description: 'Pasteurized toned milk from Amul.', inStock: true, brand: 'Amul' },
  { id: '3', name: 'Lays Classic Salted', image: '🍟', price: 20, originalPrice: 20, discount: 0, quantity: '52g', category: '3', description: 'Classic salted potato chips.', inStock: true, brand: 'Lays' },
  { id: '4', name: 'Red Tomatoes', image: '🍅', price: 35, originalPrice: 50, discount: 30, quantity: '500g', category: '1', description: 'Farm fresh red tomatoes.', inStock: true, brand: 'FreshFarm' },
  { id: '5', name: 'Coca Cola', image: '🥤', price: 40, originalPrice: 45, discount: 11, quantity: '750 ml', category: '4', description: 'Refreshing Coca Cola.', inStock: true, brand: 'Coca Cola' },
  { id: '6', name: 'Maggi Noodles', image: '🍜', price: 14, originalPrice: 14, discount: 0, quantity: '70g', category: '5', description: '2-minute noodles by Nestle.', inStock: true, brand: 'Maggi' },
  { id: '7', name: 'Onions', image: '🧅', price: 30, originalPrice: 40, discount: 25, quantity: '1 kg', category: '1', description: 'Fresh red onions.', inStock: true, brand: 'FreshFarm' },
  { id: '8', name: 'Amul Butter', image: '🧈', price: 56, originalPrice: 58, discount: 3, quantity: '100g', category: '2', description: 'Pasteurized butter by Amul.', inStock: true, brand: 'Amul' },
  { id: '9', name: 'Kurkure Masala', image: '🌶️', price: 20, originalPrice: 20, discount: 0, quantity: '90g', category: '3', description: 'Crispy & crunchy puffed corn snack.', inStock: true, brand: 'Kurkure' },
  { id: '10', name: 'Sprite', image: '🍋', price: 40, originalPrice: 45, discount: 11, quantity: '750 ml', category: '4', description: 'Clear lemon lime flavored soft drink.', inStock: true, brand: 'Sprite' },
  { id: '11', name: 'Surf Excel', image: '🧴', price: 120, originalPrice: 145, discount: 17, quantity: '1 kg', category: '6', description: 'Washing powder for superior stain removal.', inStock: true, brand: 'Surf Excel' },
  { id: '12', name: 'Dove Soap', image: '🧼', price: 52, originalPrice: 60, discount: 13, quantity: '100g', category: '7', description: 'Moisturizing beauty bathing bar.', inStock: true, brand: 'Dove' },
  { id: '13', name: 'Green Capsicum', image: '🫑', price: 25, originalPrice: 35, discount: 29, quantity: '250g', category: '1', description: 'Crispy green capsicum.', inStock: true, brand: 'FreshFarm' },
  { id: '14', name: 'Bread (White)', image: '🍞', price: 40, originalPrice: 45, discount: 11, quantity: '400g', category: '2', description: 'Soft white bread slices.', inStock: true, brand: 'Harvest Gold' },
  { id: '15', name: 'Mango Juice', image: '🥭', price: 25, originalPrice: 30, discount: 17, quantity: '200 ml', category: '4', description: 'Natural mango juice.', inStock: true, brand: 'Real' },
  { id: '16', name: 'Baby Diapers', image: '👶', price: 399, originalPrice: 499, discount: 20, quantity: 'Pack of 30', category: '8', description: 'Ultra soft baby diapers.', inStock: true, brand: 'Pampers' },
];

export const addresses: Address[] = [
  { id: '1', label: 'Home', full: '42, Green Park Extension, New Delhi - 110016', isDefault: true },
  { id: '2', label: 'Office', full: '5th Floor, Tower B, Cyber City, Gurugram - 122002', isDefault: false },
];

export const pastOrders: Order[] = [
  {
    id: 'ORD-2847',
    items: [
      { product: products[0], quantity: 2 },
      { product: products[1], quantity: 1 },
      { product: products[5], quantity: 4 },
    ],
    total: 176,
    status: 'delivered',
    createdAt: '2025-03-04T10:30:00Z',
    deliveryAddress: '42, Green Park Extension, New Delhi',
    estimatedTime: '12 mins',
  },
  {
    id: 'ORD-2831',
    items: [
      { product: products[3], quantity: 1 },
      { product: products[4], quantity: 2 },
    ],
    total: 115,
    status: 'delivered',
    createdAt: '2025-03-02T18:15:00Z',
    deliveryAddress: '42, Green Park Extension, New Delhi',
    estimatedTime: '15 mins',
  },
];

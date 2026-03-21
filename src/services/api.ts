const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8070';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ===== Auth API =====
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; name: string; email: string; phone: string | null; role: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (name: string, email: string, password: string) =>
    request<{ id: number; name: string; email: string }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ name, email, password }) }
    ),

  getProfile: () =>
    request<{ id: number; name: string; email: string; phone: string | null; role: string }>(
      '/api/auth/me'
    ),

  updateProfile: (data: { name?: string; phone?: string }) =>
    request<{ id: number; name: string; email: string; phone: string | null; role: string }>(
      '/api/auth/profile',
      { method: 'PUT', body: JSON.stringify(data) }
    ),
};

// ===== Products API =====
import type { ApiProduct } from '@/types';

export const productsApi = {
  getAll: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request<ApiProduct[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) =>
    request<ApiProduct>(`/api/products/${id}`),

  getBestSellers: () =>
    request<ApiProduct[]>('/api/products/best-seller'),

  create: (formData: FormData) =>
    request<ApiProduct>('/api/products', { method: 'POST', body: formData }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' }),
};

// ===== Categories API =====
import type { ApiCategory } from '@/types';

export const categoriesApi = {
  getAll: () => request<ApiCategory[]>('/api/categories'),

  create: (data: { name: string; image?: string }) =>
    request<ApiCategory>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ===== Cart API =====
import type { ApiCartItem } from '@/types';

export const cartApi = {
  get: () => request<ApiCartItem[]>('/api/cart'),

  add: (productId: number, quantity: number = 1) =>
    request<ApiCartItem>('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  update: (cartItemId: number, quantity: number) =>
    request<ApiCartItem>(`/api/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  remove: (cartItemId: number) =>
    request<{ message: string }>(`/api/cart/${cartItemId}`, { method: 'DELETE' }),

  clear: () =>
    request<{ message: string }>('/api/cart', { method: 'DELETE' }),
};

// ===== Address API =====
import type { ApiAddress } from '@/types';

export const addressApi = {
  getAll: () => request<ApiAddress[]>('/api/addresses'),

  create: (data: { label: string; name: string; phone: string; address: string; city: string; pincode: string; isDefault?: boolean }) =>
    request<ApiAddress>('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<{ label: string; name: string; phone: string; address: string; city: string; pincode: string; isDefault: boolean }>) =>
    request<ApiAddress>(`/api/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/addresses/${id}`, { method: 'DELETE' }),
};

// ===== Orders API =====
import type { ApiOrder, DashboardStats } from '@/types';

export const ordersApi = {
  create: (paymentMethod?: string) =>
    request<ApiOrder>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod }),
    }),

  getAll: () => request<ApiOrder[]>('/api/orders'),

  getById: (id: number) => request<ApiOrder>(`/api/orders/${id}`),

  getAllAdmin: () => request<ApiOrder[]>('/api/orders/admin'),

  updateStatus: (id: number, status: string) =>
    request<ApiOrder>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ===== Dashboard API =====
export const dashboardApi = {
  getStats: () => request<DashboardStats>('/api/dashboard/stats'),
};

// ===== Payment API =====
export interface RazorpayOrderResponse {
  orderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: number;
}

export const paymentApi = {
  createOrder: () =>
    request<RazorpayOrderResponse>('/api/payment/create-order', { method: 'POST' }),

  verify: (data: PaymentVerifyRequest) =>
    request<{ message: string; order: ApiOrder }>('/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

import {
  ArrowLeft, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye,
  BarChart3, Calendar, CreditCard, Mail, Package, Tag, Search,
  Trash2, Edit2, Check, LayoutDashboard, ListOrdered, ChevronDown, Loader2,
  ImagePlus, Star, Users, Megaphone, ShieldCheck, UserX, ToggleLeft, ToggleRight,
  Ticket, BadgePercent, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { useState, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { useDashboardStats, useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi, usersApi, couponsApi } from '@/services/api';
import { getImageUrl } from '@/types';
import type { ApiProduct, ApiCategory, ApiOrder, ApiAdminUser, ApiCoupon } from '@/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const CHART_COLORS = [
  'hsl(145, 72%, 34%)', 'hsl(42, 100%, 50%)', 'hsl(25, 95%, 55%)',
  'hsl(200, 80%, 45%)', 'hsl(0, 84%, 55%)', 'hsl(270, 60%, 55%)',
  'hsl(320, 60%, 55%)', 'hsl(180, 60%, 40%)',
];

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending:          { label: 'Pending',          cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed:        { label: 'Confirmed',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  picking:          { label: 'Picking',          cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  out_for_delivery: { label: 'Out for Delivery', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  delivered:        { label: 'Delivered',        cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled:        { label: 'Cancelled',        cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const ORDER_STATUSES = ['confirmed', 'picking', 'out_for_delivery', 'delivered', 'cancelled'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Tab = 'overview' | 'orders' | 'products' | 'categories' | 'users' | 'marketing';

const emptyProduct = {
  name: '', price: '', stock: '', description: '', CategoryId: '', isBestSeller: false,
  image: null as File | null, previewUrl: '',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status.replace(/_/g, ' '), cls: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', meta.cls)}>
      {meta.label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: dashboard } = useDashboardStats();
  const { data: orders = [] } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  const { data: products = [], isLoading: productsLoading } = useQuery<ApiProduct[]>({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: categories = [] } = useQuery<ApiCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: allUsers = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<ApiAdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll(),
    enabled: false, // load on demand when tab opens
  });

  const { data: coupons = [], isLoading: couponsLoading, refetch: refetchCoupons } = useQuery<ApiCoupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: () => couponsApi.getAll(),
    enabled: false,
  });

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'users') refetchUsers();
    if (tab === 'marketing') refetchCoupons();
  }, [refetchUsers, refetchCoupons]);

  // ── Orders state ──
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [orderPopup, setOrderPopup] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // ── Product state ──
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [productForm, setProductForm] = useState({ ...emptyProduct });
  const [productSaving, setProductSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const productImageRef = useRef<HTMLInputElement>(null);

  // ── Category state ──
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', emoji: '' });
  const [categorySaving, setCategorySaving] = useState(false);

  // ── Users state ──
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [roleUpdatingId, setRoleUpdatingId] = useState<number | null>(null);
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // ── Marketing / Coupon state ──
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '', type: 'fixed' as 'fixed' | 'percentage',
    value: '', minOrderValue: '', usageLimit: '', expiresAt: '',
  });
  const [couponSaving, setCouponSaving] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<number | null>(null);
  const [togglingCouponId, setTogglingCouponId] = useState<number | null>(null);
  const [bestSellerUpdatingId, setBestSellerUpdatingId] = useState<number | null>(null);

  // ─── Computed chart data ──────────────────────────────────────────────────

  const dailyOrders = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter((o: ApiOrder) => o.createdAt?.startsWith(dateStr));
      return {
        day: DAY_NAMES[date.getDay()],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s: number, o: ApiOrder) => s + (o.total || 0), 0),
      };
    });
  }, [orders]);

  const categoryPieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    orders.forEach((order: ApiOrder) => {
      order.OrderItems?.forEach(item => {
        const name = item.Product?.Category?.name
          || categories.find(c => c.id === item.Product?.CategoryId)?.name
          || 'Other';
        catMap[name] = (catMap[name] || 0) + item.price * item.quantity;
      });
    });
    const total = Object.values(catMap).reduce((a, b) => a + b, 0);
    if (total === 0) {
      const prodMap: Record<string, number> = {};
      products.forEach(p => {
        const name = categories.find(c => c.id === p.CategoryId)?.name || 'Other';
        prodMap[name] = (prodMap[name] || 0) + 1;
      });
      const t2 = Object.values(prodMap).reduce((a, b) => a + b, 0) || 1;
      return Object.entries(prodMap).map(([name, count], i) => ({
        name, value: Math.round((count / t2) * 100), color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }
    return Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([name, amount], i) => ({
      name, value: Math.round((amount / total) * 100), color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [orders, products, categories]);

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = [
    { label: 'Total Orders',  value: dashboard?.totalOrders  ?? 0, sub: 'All time',        icon: ShoppingCart, color: 'text-blue-500',   bg: 'bg-blue-500/10' },
    { label: 'Delivered',     value: dashboard?.delivered    ?? 0, sub: 'Completed',       icon: TrendingUp,   color: 'text-primary',     bg: 'bg-primary/10'  },
    { label: 'Pending',       value: dashboard?.pending      ?? 0, sub: 'In progress',     icon: AlertTriangle,color: 'text-yellow-500', bg: 'bg-yellow-500/10'},
    { label: 'Revenue',       value: `HK$${dashboard?.revenue ?? 0}`, sub: 'Total earned', icon: BarChart3,    color: 'text-purple-500',  bg: 'bg-purple-500/10'},
    { label: 'Products',      value: products.length,         sub: `${categories.length} categories`, icon: Package, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Cancelled',     value: dashboard?.cancelled    ?? 0, sub: 'Orders',          icon: TrendingDown, color: 'text-destructive',  bg: 'bg-destructive/10'},
  ];

  // ─── Filtered data ────────────────────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    return orders.filter((o: ApiOrder) => {
      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const q = orderSearch.toLowerCase();
      const matchSearch = !q
        || String(o.id).includes(q)
        || (o.User?.name?.toLowerCase().includes(q) ?? false)
        || (o.User?.email?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchSearch;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: ApiProduct) => {
      const matchCat = productCatFilter === 'all' || String(p.CategoryId) === productCatFilter;
      const q = productSearch.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, productSearch, productCatFilter]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (orderId: number, status: string) => {
    setStatusUpdating(true);
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status } : prev);
      }
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast({ title: 'Status updated', description: `Order #${orderId} → ${status.replace(/_/g, ' ')}` });
    } catch (error) {
      toast({ title: 'Update failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setStatusUpdating(false);
    }
  }, [updateStatus, queryClient, selectedOrder]);

  const openProductModal = (product?: ApiProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: String(product.price),
        stock: String(product.stock),
        description: product.description || '',
        CategoryId: String(product.CategoryId ?? ''),
        isBestSeller: product.isBestSeller,
        image: null,
        previewUrl: product.image ? getImageUrl(product.image) : '',
      });
    } else {
      setEditingProduct(null);
      setProductForm({ ...emptyProduct });
    }
    setShowProductModal(true);
  };

  const handleProductImageChange = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProductForm(f => ({ ...f, image: file, previewUrl: url }));
  };

  const handleSaveProduct = useCallback(async () => {
    if (!productForm.name || !productForm.price || !productForm.stock) {
      toast({ title: 'Missing fields', description: 'Name, price and stock are required.', variant: 'destructive' });
      return;
    }
    if (!editingProduct && !productForm.image) {
      toast({ title: 'Image required', description: 'Please upload a product image.', variant: 'destructive' });
      return;
    }
    setProductSaving(true);
    try {
      const form = new FormData();
      form.append('name', productForm.name);
      form.append('price', productForm.price);
      form.append('stock', productForm.stock);
      form.append('description', productForm.description);
      form.append('CategoryId', productForm.CategoryId);
      form.append('isBestSeller', String(productForm.isBestSeller));
      if (productForm.image) form.append('image', productForm.image);

      await productsApi.create(form);
      toast({ title: editingProduct ? 'Product updated' : 'Product added', description: productForm.name });
      setShowProductModal(false);
      setProductForm({ ...emptyProduct });
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      toast({ title: 'Save failed', description: error instanceof Error ? error.message : 'Server error', variant: 'destructive' });
    } finally {
      setProductSaving(false);
    }
  }, [productForm, editingProduct, queryClient]);

  const handleDeleteProduct = useCallback(async (id: number) => {
    setDeleting(true);
    try {
      await productsApi.delete(id);
      toast({ title: 'Product deleted' });
      setDeleteConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      toast({ title: 'Delete failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }, [queryClient]);

  const handleCreateCategory = useCallback(async () => {
    if (!categoryForm.name) {
      toast({ title: 'Name required', description: 'Please enter a category name.', variant: 'destructive' });
      return;
    }
    setCategorySaving(true);
    try {
      await categoriesApi.create({ name: categoryForm.name, image: categoryForm.emoji || undefined });
      toast({ title: 'Category created', description: categoryForm.name });
      setShowCategoryModal(false);
      setCategoryForm({ name: '', emoji: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error) {
      toast({ title: 'Failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setCategorySaving(false);
    }
  }, [categoryForm, queryClient]);

  // ─── Filtered users ───────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u: ApiAdminUser) => {
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const q = userSearch.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [allUsers, userSearch, userRoleFilter]);

  // ─── User handlers ────────────────────────────────────────────────────────

  const handleToggleRole = useCallback(async (user: ApiAdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setRoleUpdatingId(user.id);
    try {
      await usersApi.updateRole(user.id, newRole);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetchUsers();
      toast({ title: 'Role updated', description: `${user.name} is now ${newRole}` });
    } catch (error) {
      toast({ title: 'Update failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setRoleUpdatingId(null);
    }
  }, [queryClient, refetchUsers]);

  const handleDeleteUser = useCallback(async (id: number) => {
    setDeletingUser(true);
    try {
      await usersApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetchUsers();
      setDeleteUserConfirmId(null);
      toast({ title: 'User deleted' });
    } catch (error) {
      toast({ title: 'Delete failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setDeletingUser(false);
    }
  }, [queryClient, refetchUsers]);

  // ─── Coupon handlers ──────────────────────────────────────────────────────

  const handleCreateCoupon = useCallback(async () => {
    if (!couponForm.code || !couponForm.value) {
      toast({ title: 'Missing fields', description: 'Code and value are required', variant: 'destructive' });
      return;
    }
    setCouponSaving(true);
    try {
      await couponsApi.create({
        code: couponForm.code,
        type: couponForm.type,
        value: parseFloat(couponForm.value),
        minOrderValue: couponForm.minOrderValue ? parseFloat(couponForm.minOrderValue) : 0,
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
        expiresAt: couponForm.expiresAt || null,
      });
      toast({ title: 'Coupon created', description: couponForm.code.toUpperCase() });
      setShowCouponModal(false);
      setCouponForm({ code: '', type: 'fixed', value: '', minOrderValue: '', usageLimit: '', expiresAt: '' });
      refetchCoupons();
    } catch (error) {
      toast({ title: 'Failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setCouponSaving(false);
    }
  }, [couponForm, refetchCoupons]);

  const handleToggleCoupon = useCallback(async (id: number) => {
    setTogglingCouponId(id);
    try {
      await couponsApi.toggle(id);
      refetchCoupons();
    } catch (error) {
      toast({ title: 'Failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setTogglingCouponId(null);
    }
  }, [refetchCoupons]);

  const handleDeleteCoupon = useCallback(async (id: number) => {
    setDeletingCouponId(id);
    try {
      await couponsApi.delete(id);
      refetchCoupons();
      toast({ title: 'Coupon deleted' });
    } catch (error) {
      toast({ title: 'Failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setDeletingCouponId(null);
    }
  }, [refetchCoupons]);

  const handleToggleBestSeller = useCallback(async (product: ApiProduct) => {
    setBestSellerUpdatingId(product.id);
    try {
      const fd = new FormData();
      fd.append('isBestSeller', String(!product.isBestSeller));
      await productsApi.update(product.id, fd);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: product.isBestSeller ? 'Removed from Best Sellers' : 'Added to Best Sellers', description: product.name });
    } catch (error) {
      toast({ title: 'Failed', description: error instanceof Error ? error.message : 'Try again', variant: 'destructive' });
    } finally {
      setBestSellerUpdatingId(null);
    }
  }, [queryClient]);

  // ─── Shared UI helpers ────────────────────────────────────────────────────

  const inputCls = 'w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/50';
  const labelCls = 'text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block';

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between py-4 border-b border-border mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors text-foreground">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">UpTownMartz Management Console</p>
            </div>
          </div>
          {/* Tab pills */}
          <div className="hidden md:flex items-center gap-1 bg-muted rounded-2xl p-1">
            {([
              { id: 'overview',   label: 'Overview',    icon: LayoutDashboard },
              { id: 'orders',     label: 'Orders',      icon: ListOrdered },
              { id: 'products',   label: 'Products',    icon: Package },
              { id: 'categories', label: 'Categories',  icon: Tag },
              { id: 'users',      label: 'Users',       icon: Users },
              { id: 'marketing',  label: 'Marketing',   icon: Megaphone },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                  activeTab === id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden gap-1 bg-muted rounded-2xl p-1 mb-5 overflow-x-auto no-scrollbar">
          {([
            { id: 'overview',   label: 'Overview'    },
            { id: 'orders',     label: 'Orders'      },
            { id: 'products',   label: 'Products'    },
            { id: 'categories', label: 'Categories'  },
            { id: 'users',      label: 'Users'       },
            { id: 'marketing',  label: 'Marketing'   },
          ] as { id: Tab; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                activeTab === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════
              TAB: OVERVIEW
          ══════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-2xl border border-border p-4"
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
                        <Icon size={16} className={s.color} />
                      </div>
                      <p className="text-xl font-display font-bold text-foreground leading-tight">{s.value}</p>
                      <p className="text-[11px] font-semibold text-foreground mt-0.5">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border border-border p-4">
                  <p className="text-sm font-bold text-foreground mb-0.5">Daily Orders</p>
                  <p className="text-[11px] text-muted-foreground mb-4">Last 7 days</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={dailyOrders} barSize={24}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} cursor={{ fill: 'hsl(var(--muted))', radius: 6 }} />
                      <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-card rounded-2xl border border-border p-4">
                  <p className="text-sm font-bold text-foreground mb-0.5">Revenue Trend</p>
                  <p className="text-[11px] text-muted-foreground mb-4">Last 7 days (HK$)</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={dailyOrders}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} formatter={(v: number) => [`HK$${v}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Recent orders + pie */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="md:col-span-2 bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-foreground">Recent Orders</p>
                    <button onClick={() => setActiveTab('orders')} className="text-[11px] text-primary font-semibold hover:underline">View all →</button>
                  </div>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((order: ApiOrder) => (
                      <div
                        key={order.id}
                        onClick={() => { setSelectedOrder(order); setOrderPopup(true); }}
                        className="flex cursor-pointer items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">ORD-{order.id}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {order.User?.name || 'Customer'} · {order.OrderItems?.length || 0} items
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <StatusBadge status={order.status} />
                          <span className="text-sm font-bold text-foreground">HK${order.total}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
                    )}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="bg-card rounded-2xl border border-border p-4">
                  <p className="text-sm font-bold text-foreground mb-0.5">Sales by Category</p>
                  <p className="text-[11px] text-muted-foreground mb-3">{orders.length > 0 ? 'Based on orders' : 'By product count'}</p>
                  {categoryPieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                            {categoryPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 mt-2">
                        {categoryPieData.slice(0, 5).map(c => (
                          <div key={c.name} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="text-muted-foreground flex-1 truncate">{c.name}</span>
                            <span className="font-semibold text-foreground">{c.value}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No data</p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB: ORDERS
          ══════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-2xl border border-border p-4 mb-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Search by order ID, name or email…"
                      className={cn(inputCls, 'pl-8')}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                      className={cn(inputCls, 'pr-8 appearance-none min-w-[160px]')}
                    >
                      <option value="all">All statuses</option>
                      {Object.entries(STATUS_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-foreground">Orders</p>
                  <p className="text-[11px] text-muted-foreground">{filteredOrders.length} of {orders.length}</p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left py-2.5 pr-3 text-xs font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order: ApiOrder) => (
                        <tr key={order.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-3 pr-3 font-semibold text-foreground whitespace-nowrap">ORD-{order.id}</td>
                          <td className="py-3 pr-3">
                            <p className="font-medium text-foreground text-xs">{order.User?.name || '—'}</p>
                            <p className="text-[10px] text-muted-foreground">{order.User?.email || ''}</p>
                          </td>
                          <td className="py-3 pr-3 text-[11px] text-muted-foreground whitespace-nowrap">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-HK', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="py-3 pr-3 text-xs text-muted-foreground">{order.OrderItems?.length ?? 0}</td>
                          <td className="py-3 pr-3 font-bold text-foreground whitespace-nowrap">HK${order.total}</td>
                          <td className="py-3 pr-3">
                            <select
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                              className="text-[10px] font-semibold rounded-lg px-2 py-1 bg-muted border border-border outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                            >
                              {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => { setSelectedOrder(order); setOrderPopup(true); }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                      <ListOrdered size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No orders match your filters</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB: PRODUCTS
          ══════════════════════════════════════ */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-2xl border border-border p-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search products…"
                      className={cn(inputCls, 'pl-8')}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={productCatFilter}
                      onChange={e => setProductCatFilter(e.target.value)}
                      className={cn(inputCls, 'pr-8 appearance-none min-w-[160px]')}
                    >
                      <option value="all">All categories</option>
                      {categories.map((c: ApiCategory) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <button
                    onClick={() => openProductModal()}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity shrink-0"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-foreground">Products</p>
                  <p className="text-[11px] text-muted-foreground">{filteredProducts.length} of {products.length}</p>
                </div>

                {productsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Product', 'Category', 'Price', 'Stock', 'Best Seller', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2.5 pr-3 text-xs font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p: ApiProduct) => (
                          <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2.5">
                                {p.image ? (
                                  <img src={getImageUrl(p.image)} className="w-9 h-9 rounded-xl object-cover shrink-0" alt={p.name} />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-base shrink-0">📦</div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground text-xs truncate max-w-[140px]">{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{p.description?.slice(0, 35) || '—'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-xs text-muted-foreground">
                              {categories.find(c => c.id === p.CategoryId)?.name || '—'}
                            </td>
                            <td className="py-3 pr-3 font-semibold text-foreground text-xs whitespace-nowrap">HK${p.price}</td>
                            <td className="py-3 pr-3">
                              <span className={cn('text-xs font-semibold', p.stock > 0 ? 'text-primary' : 'text-destructive')}>
                                {p.stock > 0 ? `${p.stock}` : 'Out'}
                              </span>
                            </td>
                            <td className="py-3 pr-3">
                              {p.isBestSeller
                                ? <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                : <span className="text-muted-foreground/40 text-xs">—</span>
                              }
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openProductModal(p)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(p.id)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No products found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB: CATEGORIES
          ══════════════════════════════════════ */}
          {activeTab === 'categories' && (
            <motion.div key="categories" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">Categories</p>
                    <p className="text-[11px] text-muted-foreground">{categories.length} total</p>
                  </div>
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Plus size={14} /> Add Category
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {categories.map((cat: ApiCategory) => (
                    <motion.div
                      key={cat.id}
                      whileHover={{ y: -2 }}
                      className="bg-muted/50 rounded-2xl border border-border p-4 flex flex-col items-center gap-2 text-center"
                    >
                      {cat.image ? (
                        cat.image.startsWith('http') || cat.image.startsWith('/')
                          ? <img src={getImageUrl(cat.image)} className="w-12 h-12 rounded-xl object-cover" alt={cat.name} />
                          : <span className="text-4xl">{cat.image}</span>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">📦</div>
                      )}
                      <p className="text-xs font-semibold text-foreground leading-tight">{cat.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {products.filter(p => p.CategoryId === cat.id).length} products
                      </p>
                    </motion.div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Tag size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No categories yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB: USERS
          ══════════════════════════════════════ */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-2xl border border-border p-4">

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Total Users',  value: allUsers.length,                                   icon: Users,      color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
                    { label: 'Admins',       value: allUsers.filter(u => u.role === 'admin').length,    icon: ShieldCheck,color: 'text-primary',     bg: 'bg-primary/10'    },
                    { label: 'Customers',    value: allUsers.filter(u => u.role === 'user').length,     icon: Users,      color: 'text-orange-500',  bg: 'bg-orange-500/10' },
                    { label: 'With Orders',  value: allUsers.filter(u => (u.Orders?.length ?? 0) > 0).length, icon: ShoppingCart, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-muted/50 rounded-2xl p-3 flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
                          <Icon size={15} className={s.color} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search by name or email…"
                      className={cn(inputCls, 'pl-8')}
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={userRoleFilter}
                      onChange={e => setUserRoleFilter(e.target.value)}
                      className={cn(inputCls, 'pr-8 appearance-none min-w-[140px]')}
                    >
                      <option value="all">All roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">Customer</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-foreground">Users</p>
                  <p className="text-[11px] text-muted-foreground">{filteredUsers.length} of {allUsers.length}</p>
                </div>

                {usersLoading ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['User', 'Email', 'Phone', 'Role', 'Orders', 'Joined', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2.5 pr-3 text-xs font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u: ApiAdminUser) => {
                          const orderCount = u.Orders?.length ?? 0;
                          const totalSpent = u.Orders?.reduce((s, o) => s + o.total, 0) ?? 0;
                          const isAdmin = u.role === 'admin';
                          return (
                            <tr key={u.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                              <td className="py-3 pr-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <p className="font-semibold text-foreground text-xs whitespace-nowrap">{u.name}</p>
                                </div>
                              </td>
                              <td className="py-3 pr-3 text-xs text-muted-foreground">{u.email}</td>
                              <td className="py-3 pr-3 text-xs text-muted-foreground">{u.phone || '—'}</td>
                              <td className="py-3 pr-3">
                                <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                                  {isAdmin ? 'Admin' : 'Customer'}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                <div>
                                  <p className="text-xs font-semibold text-foreground">{orderCount}</p>
                                  {totalSpent > 0 && <p className="text-[10px] text-muted-foreground">HK${totalSpent}</p>}
                                </div>
                              </td>
                              <td className="py-3 pr-3 text-[11px] text-muted-foreground whitespace-nowrap">
                                {new Date(u.createdAt).toLocaleDateString('en-HK', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleToggleRole(u)}
                                    disabled={roleUpdatingId === u.id}
                                    title={isAdmin ? 'Revoke admin' : 'Make admin'}
                                    className={cn('p-1.5 rounded-lg transition-colors', isAdmin ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10')}
                                  >
                                    {roleUpdatingId === u.id
                                      ? <Loader2 size={13} className="animate-spin" />
                                      : isAdmin ? <ShieldCheck size={13} /> : <ShieldCheck size={13} />}
                                  </button>
                                  <button
                                    onClick={() => setDeleteUserConfirmId(u.id)}
                                    title="Delete user"
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    <UserX size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && !usersLoading && (
                      <div className="text-center py-12">
                        <Users size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB: MARKETING
          ══════════════════════════════════════ */}
          {activeTab === 'marketing' && (
            <motion.div key="marketing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* ── Coupon Management ── */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-foreground flex items-center gap-2"><Ticket size={16} className="text-primary" /> Coupon Codes</p>
                    <p className="text-[11px] text-muted-foreground">Create discount codes for customers</p>
                  </div>
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Plus size={14} /> New Coupon
                  </button>
                </div>

                {couponsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-primary" /></div>
                ) : coupons.length === 0 ? (
                  <div className="text-center py-10">
                    <Ticket size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No coupons yet. Create one to boost sales.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left py-2.5 pr-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((c: ApiCoupon) => (
                          <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-3 pr-3">
                              <span className="font-mono font-bold text-foreground text-xs bg-muted px-2 py-0.5 rounded-lg">{c.code}</span>
                            </td>
                            <td className="py-3 pr-3">
                              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', c.type === 'percentage' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>
                                {c.type === 'percentage' ? '%' : 'Fixed'}
                              </span>
                            </td>
                            <td className="py-3 pr-3 font-semibold text-foreground text-xs">
                              {c.type === 'percentage' ? `${c.value}%` : `HK$${c.value}`}
                            </td>
                            <td className="py-3 pr-3 text-xs text-muted-foreground">
                              {c.minOrderValue > 0 ? `HK$${c.minOrderValue}` : '—'}
                            </td>
                            <td className="py-3 pr-3 text-xs text-muted-foreground">
                              {c.usageLimit ? `${c.usedCount}/${c.usageLimit}` : c.usedCount}
                            </td>
                            <td className="py-3 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                              {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-HK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="py-3 pr-3">
                              <button
                                onClick={() => handleToggleCoupon(c.id)}
                                disabled={togglingCouponId === c.id}
                                className="flex items-center gap-1 text-xs font-medium transition-colors"
                              >
                                {togglingCouponId === c.id
                                  ? <Loader2 size={14} className="animate-spin text-muted-foreground" />
                                  : c.active
                                    ? <ToggleRight size={20} className="text-primary" />
                                    : <ToggleLeft size={20} className="text-muted-foreground" />}
                                <span className={c.active ? 'text-primary' : 'text-muted-foreground'}>{c.active ? 'Active' : 'Off'}</span>
                              </button>
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => handleDeleteCoupon(c.id)}
                                disabled={deletingCouponId === c.id}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                {deletingCouponId === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Best Sellers Quick Toggle ── */}
              <div className="bg-card rounded-2xl border border-border p-4">
                <div className="mb-4">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2"><Star size={16} className="text-yellow-500" /> Best Sellers</p>
                  <p className="text-[11px] text-muted-foreground">Toggle which products appear as best sellers on the home page</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {products.map((p: ApiProduct) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                      {p.image
                        ? <img src={getImageUrl(p.image)} className="w-9 h-9 rounded-xl object-cover shrink-0" alt={p.name} />
                        : <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sm shrink-0">📦</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">HK${p.price}</p>
                      </div>
                      <button
                        onClick={() => handleToggleBestSeller(p)}
                        disabled={bestSellerUpdatingId === p.id}
                        className={cn('p-1.5 rounded-lg transition-colors shrink-0', p.isBestSeller ? 'text-yellow-500 bg-yellow-500/10' : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10')}
                        title={p.isBestSeller ? 'Remove from best sellers' : 'Mark as best seller'}
                      >
                        {bestSellerUpdatingId === p.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Star size={14} className={p.isBestSeller ? 'fill-yellow-500' : ''} />}
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="col-span-full text-sm text-muted-foreground text-center py-6">No products available</p>
                  )}
                </div>
              </div>

              {/* ── Coupon Stats ── */}
              {coupons.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Coupons', value: coupons.length,                                icon: Ticket,       color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
                    { label: 'Active',        value: coupons.filter(c => c.active).length,          icon: ToggleRight,  color: 'text-primary',     bg: 'bg-primary/10'    },
                    { label: 'Total Uses',    value: coupons.reduce((s, c) => s + c.usedCount, 0),  icon: BadgePercent, color: 'text-purple-500',  bg: 'bg-purple-500/10' },
                    { label: 'Expiring Soon', value: coupons.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date(Date.now() + 7*24*60*60*1000)).length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', s.bg)}>
                          <Icon size={16} className={s.color} />
                        </div>
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════
          DIALOG: ORDER DETAIL
      ═══════════════════════════════════════════ */}
      <Dialog open={orderPopup} onOpenChange={setOrderPopup}>
        <DialogContent className="sm:max-w-[520px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Order Details</span>
              {selectedOrder && <StatusBadge status={selectedOrder.status} />}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-sm mt-1">
              {/* Order meta */}
              <div className="bg-muted/40 rounded-2xl p-3.5 space-y-2.5">
                <Row label="Order ID" value={`ORD-${selectedOrder.id}`} bold />
                <Row
                  label={<span className="flex items-center gap-1"><Calendar size={11} /> Date</span>}
                  value={selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleDateString('en-HK', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'N/A'}
                />
                <Row
                  label={<span className="flex items-center gap-1"><CreditCard size={11} /> Payment</span>}
                  value={<span className="capitalize">{selectedOrder.paymentMethod || 'COD'}</span>}
                />
                <Row label="Total" value={<span className="font-bold text-base">HK${selectedOrder.total}</span>} />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <select
                    value={selectedOrder.status}
                    disabled={statusUpdating}
                    onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="text-xs font-semibold rounded-xl px-3 py-1.5 bg-muted border border-border outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-60"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer */}
              <section>
                <SectionTitle>Customer</SectionTitle>
                <div className="bg-muted/40 rounded-2xl p-3.5 space-y-1.5">
                  <p className="font-semibold text-foreground">{selectedOrder.User?.name || 'N/A'}</p>
                  {selectedOrder.User?.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail size={11} />{selectedOrder.User.email}</p>
                  )}
                </div>
              </section>

              {/* Items */}
              {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 && (
                <section>
                  <SectionTitle>Items ({selectedOrder.OrderItems.length})</SectionTitle>
                  <div className="space-y-2">
                    {selectedOrder.OrderItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-muted/40 rounded-2xl p-2.5">
                        {item.Product?.image
                          ? <img src={getImageUrl(item.Product.image)} alt={item.Product.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          : <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">📦</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-xs truncate">{item.Product?.name}</p>
                          <p className="text-[10px] text-muted-foreground">HK${item.price} × {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground shrink-0">HK${item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 px-1 font-bold text-sm">
                      <span>Total</span>
                      <span>HK${selectedOrder.total}</span>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════
          DIALOG: ADD / EDIT PRODUCT
      ═══════════════════════════════════════════ */}
      <Dialog open={showProductModal} onOpenChange={v => { if (!v) { setShowProductModal(false); setEditingProduct(null); } }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Image upload */}
            <div>
              <label className={labelCls}>Product Image {!editingProduct && <span className="text-destructive">*</span>}</label>
              <div
                onClick={() => productImageRef.current?.click()}
                className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              >
                {productForm.previewUrl ? (
                  <div className="relative">
                    <img src={productForm.previewUrl} alt="preview" className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-semibold flex items-center gap-1.5"><ImagePlus size={14} /> Change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImagePlus size={24} />
                    <p className="text-xs">Click to upload image</p>
                    <p className="text-[10px] opacity-60">PNG, JPG, WEBP · 500×500px recommended</p>
                  </div>
                )}
              </div>
              <input
                ref={productImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleProductImageChange(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Name */}
            <div>
              <label className={labelCls}>Product Name *</label>
              <input type="text" placeholder="e.g. Fresh Apples" className={inputCls} value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea rows={2} placeholder="Short description…" className={cn(inputCls, 'resize-none')} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Price (HK$) *</label>
                <input type="number" placeholder="0" className={inputCls} value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Stock *</label>
                <input type="number" placeholder="0" className={inputCls} value={productForm.stock} onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category</label>
              <div className="relative">
                <select className={cn(inputCls, 'appearance-none pr-8')} value={productForm.CategoryId} onChange={e => setProductForm(f => ({ ...f, CategoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((c: ApiCategory) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Best Seller toggle */}
            <div className="flex items-center justify-between bg-muted/50 border border-border rounded-2xl p-3.5">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Star size={14} className="text-yellow-500" /> Best Seller</p>
                <p className="text-[11px] text-muted-foreground">Feature this product on the home page</p>
              </div>
              <button
                type="button"
                onClick={() => setProductForm(f => ({ ...f, isBestSeller: !f.isBestSeller }))}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors relative',
                  productForm.isBestSeller ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all', productForm.isBestSeller ? 'left-[18px]' : 'left-0.5')} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => { setShowProductModal(false); setEditingProduct(null); }}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={productSaving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {productSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (editingProduct ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════
          DIALOG: ADD CATEGORY
      ═══════════════════════════════════════════ */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className={labelCls}>Category Name *</label>
              <input type="text" placeholder="e.g. Fruits & Vegetables" className={inputCls} value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Emoji Icon (optional)</label>
              <input type="text" placeholder="e.g. 🥦" className={inputCls} maxLength={4} value={categoryForm.emoji} onChange={e => setCategoryForm(f => ({ ...f, emoji: e.target.value }))} />
              <p className="text-[10px] text-muted-foreground mt-1">Used as the category icon if no image is uploaded</p>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowCategoryModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              onClick={handleCreateCategory}
              disabled={categorySaving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {categorySaving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : 'Create Category'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════
          DIALOG: DELETE CONFIRM
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-destructive" />
              </div>
              <h3 className="text-base font-bold text-foreground text-center mb-1">Delete Product?</h3>
              <p className="text-xs text-muted-foreground text-center mb-5">This action cannot be undone. The product will be permanently removed.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirmId)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          DIALOG: CREATE COUPON
      ═══════════════════════════════════════════ */}
      <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ticket size={16} className="text-primary" /> Create Coupon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className={labelCls}>Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. SUMMER20"
                className={inputCls}
                value={couponForm.code}
                onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Discount Type</label>
                <div className="relative">
                  <select
                    className={cn(inputCls, 'appearance-none pr-8')}
                    value={couponForm.type}
                    onChange={e => setCouponForm(f => ({ ...f, type: e.target.value as 'fixed' | 'percentage' }))}
                  >
                    <option value="fixed">Fixed (HK$)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Value *</label>
                <input
                  type="number"
                  placeholder={couponForm.type === 'percentage' ? '20' : '50'}
                  className={inputCls}
                  value={couponForm.value}
                  onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Min Order (HK$)</label>
                <input
                  type="number"
                  placeholder="0"
                  className={inputCls}
                  value={couponForm.minOrderValue}
                  onChange={e => setCouponForm(f => ({ ...f, minOrderValue: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Usage Limit</label>
                <input
                  type="number"
                  placeholder="Unlimited"
                  className={inputCls}
                  value={couponForm.usageLimit}
                  onChange={e => setCouponForm(f => ({ ...f, usageLimit: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Expiry Date (optional)</label>
              <input
                type="date"
                className={inputCls}
                value={couponForm.expiresAt}
                onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setShowCouponModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCoupon}
              disabled={couponSaving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {couponSaving ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : 'Create Coupon'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════
          DIALOG: DELETE USER CONFIRM
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteUserConfirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteUserConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserX size={22} className="text-destructive" />
              </div>
              <h3 className="text-base font-bold text-foreground text-center mb-1">Delete User?</h3>
              <p className="text-xs text-muted-foreground text-center mb-5">This will permanently remove the user and all their data.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteUserConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteUserConfirmId)}
                  disabled={deletingUser}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deletingUser ? <><Loader2 size={14} className="animate-spin" /> Deleting…</> : <><UserX size={14} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Row({ label, value, bold }: { label: React.ReactNode; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={cn('text-xs text-foreground', bold && 'font-bold')}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{children}</h4>;
}

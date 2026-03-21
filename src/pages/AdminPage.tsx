import { ArrowLeft, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye, BarChart3, MapPin, Calendar, CreditCard, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState, useCallback, useMemo } from 'react';
import { DialogHeader, DialogFooter, Dialog, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { useDashboardStats, useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi, addressApi } from '@/services/api';
import { getImageUrl } from '@/types';
import type { ApiProduct, ApiCategory, ApiOrder, ApiAddress } from '@/types';

const CHART_COLORS = [
  'hsl(145, 72%, 34%)',
  'hsl(42, 100%, 50%)',
  'hsl(25, 95%, 55%)',
  'hsl(200, 80%, 45%)',
  'hsl(0, 84%, 55%)',
  'hsl(270, 60%, 55%)',
  'hsl(320, 60%, 55%)',
  'hsl(180, 60%, 40%)',
  'hsl(60, 70%, 45%)',
  'hsl(330, 50%, 50%)',
];

const statusColors: Record<string, string> = {
  confirmed: 'bg-secondary/20 text-secondary-foreground',
  picking: 'bg-accent text-accent-foreground',
  out_for_delivery: 'bg-primary/10 text-primary',
  delivered: 'bg-primary/20 text-primary',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-destructive/10 text-destructive',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: dashboard } = useDashboardStats();
  const { data: orders = [] } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  const { data: products = [] } = useQuery<ApiProduct[]>({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: categories = [] } = useQuery<ApiCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    CategoryId: '',
    isBestSeller: false,
    image: null as File | null,
  });
  const [orderPopup, setOrderPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [selectedOrderAddresses, setSelectedOrderAddresses] = useState<ApiAddress[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image: null as File | null,
  });

  // Compute daily orders from real data (last 7 days)
  const dailyOrders = useMemo(() => {
    const now = new Date();
    const days: { day: string; orders: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = DAY_NAMES[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter((o: ApiOrder) => o.createdAt?.startsWith(dateStr));
      days.push({
        day: dayStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum: number, o: ApiOrder) => sum + (o.total || 0), 0),
      });
    }
    return days;
  }, [orders]);

  // Compute sales by category from real order items
  const categoryPieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    orders.forEach((order: ApiOrder) => {
      order.OrderItems?.forEach(item => {
        const catName = item.Product?.Category?.name || categories.find(c => c.id === item.Product?.CategoryId)?.name || 'Other';
        catMap[catName] = (catMap[catName] || 0) + (item.price * item.quantity);
      });
    });

    const total = Object.values(catMap).reduce((a, b) => a + b, 0);
    if (total === 0) {
      // Fallback: distribute by product count per category
      const prodCatMap: Record<string, number> = {};
      products.forEach(p => {
        const catName = categories.find(c => c.id === p.CategoryId)?.name || 'Other';
        prodCatMap[catName] = (prodCatMap[catName] || 0) + 1;
      });
      const prodTotal = Object.values(prodCatMap).reduce((a, b) => a + b, 0) || 1;
      return Object.entries(prodCatMap).map(([name, count], i) => ({
        name,
        value: Math.round((count / prodTotal) * 100),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }

    return Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], i) => ({
        name,
        value: Math.round((amount / total) * 100),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [orders, products, categories]);

  const handleOpenOrder = useCallback(async (order: ApiOrder) => {
    setSelectedOrder(order);
    setSelectedOrderAddresses([]);
    setOrderPopup(true);

    // Try to fetch the customer's addresses
    if (order.UserId) {
      try {
        const addrs = await addressApi.getAll();
        setSelectedOrderAddresses(addrs);
      } catch {
        // User might not have addresses or we may not have permission
      }
    }
  }, []);

  const handleCreateCategory = useCallback(async () => {
    if (!categoryForm.name) {
      alert('Category name is required');
      return;
    }

    try {
      let imageUrl = '';

      if (categoryForm.image) {
        const formData = new FormData();
        formData.append('file', categoryForm.image);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      await categoriesApi.create({
        name: categoryForm.name,
        image: imageUrl,
      });

      alert('Category created successfully');

      setShowCategoryModal(false);
      setCategoryForm({ name: '', image: null });

      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create category');
    }
  }, [categoryForm, queryClient]);

  const handleCreateProduct = useCallback(async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Please fill all required fields');
      return;
    }

    if (!formData.image) {
      alert('Please upload product image');
      return;
    }

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('price', formData.price);
      form.append('stock', formData.stock);
      form.append('description', formData.description);
      form.append('CategoryId', formData.CategoryId);
      form.append('isBestSeller', String(formData.isBestSeller));
      form.append('image', formData.image);

      await productsApi.create(form);
      alert('Product added successfully!');
      setShowModal(false);
      setFormData({ name: '', price: '', stock: '', description: '', CategoryId: '', isBestSeller: false, image: null });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Server error');
    }
  }, [formData, queryClient]);

  const handleStatusChange = useCallback(async (orderId: number, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update status');
    }
  }, [updateStatus, queryClient]);

  const stats = [
    { label: 'Total Orders', value: dashboard?.totalOrders || 0, change: '+12%', up: true, icon: ShoppingCart },
    { label: 'Delivered', value: dashboard?.delivered || 0, change: '+8%', up: true, icon: TrendingUp },
    { label: 'Pending', value: dashboard?.pending || 0, change: '+5%', up: true, icon: AlertTriangle },
    { label: 'Revenue', value: `₹${dashboard?.revenue || 0}`, change: '+10%', up: true, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">UpTownMartz Management Console</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  {s.change && (
                    <span className={`flex items-center text-[10px] font-bold ${s.up ? 'text-primary' : 'text-destructive'}`}>
                      {s.up ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                      {s.change}
                    </span>
                  )}
                </div>
                <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-1">Daily Orders</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Last 7 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyOrders}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-1">Revenue Trend</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Last 7 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dailyOrders}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} formatter={(value: number) => [`₹${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Orders + Categories */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="md:col-span-2 bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Recent Orders</h3>
              <span className="text-[11px] text-muted-foreground">{orders.length} total</span>
            </div>
            <div className="space-y-2">
              {orders.slice(0, 5).map((order: ApiOrder) => (
                <div
                  key={order.id}
                  onClick={() => handleOpenOrder(order)}
                  className="flex cursor-pointer items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      ORD-{order.id}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.User?.name || 'Customer'} · {order.OrderItems?.length || 0} items
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || ''}`}>
                      {order.status?.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      ₹{order.total}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-1">Sales by Category</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Based on {orders.length > 0 ? 'order data' : 'product distribution'}</p>
            {categoryPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {categoryPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} formatter={(value: number) => [`${value}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {categoryPieData.map(c => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-muted-foreground flex-1 truncate">{c.name}</span>
                      <span className="font-medium text-foreground">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            )}
          </motion.div>
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={orderPopup} onOpenChange={setOrderPopup}>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <p className="text-sm text-gray-500">Complete order information</p>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4 text-sm">
                {/* Order info */}
                <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-semibold">ORD-{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Calendar size={12} /> Date</span>
                    <span className="font-medium">
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5"><CreditCard size={12} /> Payment</span>
                    <span className="font-medium capitalize">{selectedOrder.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-base">₹{selectedOrder.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        handleStatusChange(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className="border rounded-lg px-2.5 py-1 text-xs font-medium capitalize bg-background"
                    >
                      {['confirmed', 'picking', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer info */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer</h4>
                  <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
                    <p className="font-semibold text-foreground">{selectedOrder.User?.name || 'N/A'}</p>
                    {selectedOrder.User?.email && (
                      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Mail size={11} /> {selectedOrder.User.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Delivery Address</h4>
                  {selectedOrderAddresses.length > 0 ? (
                    <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                      {(() => {
                        const addr = selectedOrderAddresses.find(a => a.isDefault) || selectedOrderAddresses[0];
                        return (
                          <>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span className="font-medium">{addr.label}</span>
                            </div>
                            <p className="text-muted-foreground text-xs pl-5">{addr.address}, {addr.city} - {addr.pincode}</p>
                            <p className="text-muted-foreground text-xs pl-5 flex items-center gap-1">
                              <Phone size={10} /> {addr.phone} · {addr.name}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">No address on file</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Items ({selectedOrder.OrderItems.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.OrderItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-2.5">
                          {item.Product?.image ? (
                            <img src={getImageUrl(item.Product.image)} alt={item.Product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">📦</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.Product?.name}</p>
                            <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground shrink-0">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Category Management */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Category Management</h3>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              <Plus size={12} />
              Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Image</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Name</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat: ApiCategory) => (
                  <tr key={cat.id} className="border-b border-border/50">
                    <td className="py-3">
                      {cat.image ? (
                        <img src={getImageUrl(cat.image)} className="w-10 h-10 rounded-lg object-cover" alt={cat.name} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">📦</div>
                      )}
                    </td>
                    <td className="py-3 font-medium text-foreground">{cat.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Category Dialog */}
        <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Create Category
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Add a new category for products
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <input
                  type="text"
                  placeholder="Example: Fruits"
                  className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded-md p-2 mt-1 cursor-pointer"
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      image: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-4 flex gap-2">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Create Category
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Management */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Product Management</h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              <Plus size={12} />
              Add Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Product</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Price</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Stock</th>
                  <th className="text-right py-2 text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: ApiProduct) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2.5 flex items-center gap-2">
                      {p.image ? (
                        <img src={getImageUrl(p.image)} className="w-8 h-8 rounded-md object-cover" alt={p.name} />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm">📦</div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.description?.slice(0, 30)}</p>
                      </div>
                    </td>
                    <td className="py-2.5 text-foreground">₹{p.price}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-medium ${p.stock > 0 ? 'text-primary' : 'text-destructive'}`}>
                        {p.stock > 0 ? `${p.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Product Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Product</DialogTitle>
              <p className="text-sm text-gray-500">Fill in the product details below to add a new item to your store inventory.</p>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product Name</label>
                <input
                  type="text"
                  placeholder="Example: Fresh Apples"
                  className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Product Description</label>
                <textarea
                  placeholder="Product description"
                  className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    placeholder="Available stock"
                    className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.CategoryId}
                  onChange={(e) => setFormData({ ...formData, CategoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: ApiCategory) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded-md p-2 mt-1 cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-gray-400 mt-1">Recommended size: 500x500px PNG or JPG</p>
              </div>

              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="text-sm font-medium">Best Seller</p>
                  <p className="text-xs text-gray-500">Mark this product as a best selling item</p>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
              >
                Save Product
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

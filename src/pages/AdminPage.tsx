import { ArrowLeft, Package, ShoppingCart, Users, Tag, BarChart3, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const dailyOrders = [
  { day: 'Mon', orders: 145 },
  { day: 'Tue', orders: 198 },
  { day: 'Wed', orders: 167 },
  { day: 'Thu', orders: 230 },
  { day: 'Fri', orders: 289 },
  { day: 'Sat', orders: 340 },
  { day: 'Sun', orders: 310 },
];

const revenueData = [
  { day: 'Mon', revenue: 12400 },
  { day: 'Tue', revenue: 18900 },
  { day: 'Wed', revenue: 15600 },
  { day: 'Thu', revenue: 22100 },
  { day: 'Fri', revenue: 28500 },
  { day: 'Sat', revenue: 34200 },
  { day: 'Sun', revenue: 31000 },
];

const categoryPieData = [
  { name: 'Fruits', value: 35, color: 'hsl(145, 72%, 34%)' },
  { name: 'Dairy', value: 25, color: 'hsl(42, 100%, 50%)' },
  { name: 'Snacks', value: 20, color: 'hsl(25, 95%, 55%)' },
  { name: 'Others', value: 20, color: 'hsl(270, 60%, 55%)' },
];

const stats = [
  { label: "Today's Orders", value: '340', change: '+12%', up: true, icon: ShoppingCart },
  { label: "Today's Revenue", value: '₹34.2K', change: '+8%', up: true, icon: BarChart3 },
  { label: 'Active Users', value: '1,280', change: '+5%', up: true, icon: Users },
  { label: 'Low Stock', value: '8', change: '', up: false, icon: AlertTriangle },
];

const recentOrders = [
  { id: 'ORD-3421', customer: 'Priya S.', items: 5, total: 342, status: 'picking' },
  { id: 'ORD-3420', customer: 'Rahul M.', items: 3, total: 189, status: 'out_for_delivery' },
  { id: 'ORD-3419', customer: 'Anita K.', items: 8, total: 567, status: 'confirmed' },
  { id: 'ORD-3418', customer: 'Vikram P.', items: 2, total: 98, status: 'delivered' },
];

const statusColors: Record<string, string> = {
  confirmed: 'bg-secondary/20 text-secondary-foreground',
  picking: 'bg-accent text-accent-foreground',
  out_for_delivery: 'bg-primary/10 text-primary',
  delivered: 'bg-primary/20 text-primary',
};

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">QuickCart Management Console</p>
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
            <h3 className="text-sm font-bold text-foreground mb-3">Daily Orders</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyOrders}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueData}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
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
              <button className="text-xs text-primary font-semibold">View all</button>
            </div>
            <div className="space-y-2">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{order.id}</p>
                    <p className="text-[11px] text-muted-foreground">{order.customer} · {order.items} items</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || ''}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-foreground">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="bg-card rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {categoryPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {categoryPieData.map(c => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-muted-foreground flex-1">{c.name}</span>
                  <span className="font-medium text-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Product Management */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Product Management</h3>
            <button className="flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg">
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
                {products.slice(0, 6).map(p => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2.5 flex items-center gap-2">
                      <span className="text-lg">{p.image}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.brand}</p>
                      </div>
                    </td>
                    <td className="py-2.5 text-foreground">₹{p.price}</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-medium ${p.inStock ? 'text-primary' : 'text-destructive'}`}>
                        {p.inStock ? 'In Stock' : 'Out'}
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
      </div>
    </div>
  );
}

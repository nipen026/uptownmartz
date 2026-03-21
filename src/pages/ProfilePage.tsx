import { User, MapPin, Package, Moon, Sun, ChevronRight, LogOut, Settings, ShieldCheck, ClipboardList, Users, X, Pencil, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { addressApi } from '@/services/api';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import type { ApiAddress } from '@/types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const [activeView, setActiveView] = useState<'menu' | 'orders' | 'addresses'>('menu');
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Load addresses when viewing them
  useEffect(() => {
    if (activeView === 'addresses' && isAuthenticated) {
      setAddressLoading(true);
      addressApi.getAll()
        .then(setAddresses)
        .catch(() => toast({ title: 'Error', description: 'Failed to load addresses', variant: 'destructive' }))
        .finally(() => setAddressLoading(false));
    }
  }, [activeView, isAuthenticated]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditOpen = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setShowEdit(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: editName, phone: editPhone });
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
      setShowEdit(false);
    } catch (error) {
      toast({ title: 'Update Failed', description: error instanceof Error ? error.message : 'Something went wrong', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <span className="text-7xl block mb-4">👤</span>
          <h2 className="text-xl font-display font-bold text-foreground mb-1">Login to view profile</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to manage your account</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-bold shadow-lg"
          >
            Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-display font-bold text-foreground">Profile</h1>
        </div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-5 flex items-center gap-4 mb-6"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-display font-bold text-foreground">{user?.name || 'User'}</h2>
            <p className="text-xs text-muted-foreground">{user?.phone || 'No phone added'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button onClick={handleEditOpen} className="text-xs text-primary font-bold flex items-center gap-1">
            <Pencil size={12} /> Edit
          </button>
        </motion.div>

        {/* Main menu — only 4 items + admin */}
        <AnimatePresence mode="wait">
          {activeView === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* My Orders */}
                <button
                  onClick={() => setActiveView('orders')}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
                    <Package size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">My Orders</p>
                    <p className="text-[11px] text-muted-foreground">{orders.length} orders placed</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>

                {/* My Address */}
                <button
                  onClick={() => setActiveView('addresses')}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <div className="w-9 h-9 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">My Address</p>
                    <p className="text-[11px] text-muted-foreground">Manage delivery addresses</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <div className="w-9 h-9 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center">
                    {darkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-[11px] text-muted-foreground">{darkMode ? 'On' : 'Off'}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-primary' : 'bg-muted'}`}>
                    <motion.div
                      layout
                      className="w-5 h-5 bg-white rounded-full shadow-sm"
                      style={{ marginLeft: darkMode ? 'auto' : 0 }}
                    />
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 bg-red-50 dark:bg-red-950 rounded-xl flex items-center justify-center">
                    <LogOut size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Logout</p>
                    <p className="text-[11px] text-muted-foreground">Sign out of your account</p>
                  </div>
                </button>
              </div>

              {/* Admin Management Button — only for admin */}
              {user?.role === 'admin' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => setShowAdminPopup(true)}
                  className="w-full flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-4 mt-4"
                >
                  <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center">
                    <ShieldCheck size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">Admin Management</p>
                    <p className="text-[11px] text-muted-foreground">Manage orders, users & more</p>
                  </div>
                  <ChevronRight size={16} className="text-primary" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Orders View */}
          {activeView === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-primary font-medium mb-4">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <h2 className="text-sm font-bold text-foreground mb-3">My Orders</h2>
              {ordersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl block mb-3">📦</span>
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                  <button onClick={() => navigate('/')} className="text-primary text-sm font-bold mt-2">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-2xl border border-border p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-primary" />
                          <span className="text-sm font-bold text-foreground">{order.id}</span>
                        </div>
                        <span className="text-[11px] bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full font-medium capitalize">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar">
                        {order.items.slice(0, 4).map(({ product }) => {
                          const isImg = product.image.startsWith('http') || product.image.startsWith('/');
                          return (
                            <div key={product.id} className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden">
                              {isImg ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : product.image}
                            </div>
                          );
                        })}
                        <span className="text-xs text-muted-foreground shrink-0">{order.items.length} items</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">₹{order.total}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Addresses View */}
          {activeView === 'addresses' && (
            <motion.div key="addresses" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-primary font-medium mb-4">
                <ChevronRight size={14} className="rotate-180" /> Back
              </button>
              <h2 className="text-sm font-bold text-foreground mb-3">My Addresses</h2>
              {addressLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-48" />
                    </div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl block mb-3">📍</span>
                  <p className="text-sm text-muted-foreground">No addresses saved</p>
                  <button onClick={() => navigate('/checkout')} className="text-primary text-sm font-bold mt-2">Add at Checkout</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-card rounded-2xl border border-border p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-primary mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{addr.label}</p>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{addr.name} | {addr.phone}</p>
                            <p className="text-xs text-muted-foreground">{addr.address}, {addr.city} - {addr.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Admin Management Popup — ISSUE 3 */}
      <AnimatePresence>
        {showAdminPopup && user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAdminPopup(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl border border-border p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-primary" />
                  <h3 className="text-lg font-display font-bold text-foreground">Admin Management</h3>
                </div>
                <button onClick={() => setShowAdminPopup(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { setShowAdminPopup(false); navigate('/admin'); }}
                  className="w-full flex items-center gap-3 p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center">
                    <ClipboardList size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Manage Orders</p>
                    <p className="text-[11px] text-muted-foreground">View, update & track all orders</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground ml-auto" />
                </button>

                <button
                  onClick={() => { setShowAdminPopup(false); navigate('/admin'); }}
                  className="w-full flex items-center gap-3 p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-xl flex items-center justify-center">
                    <Users size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Manage Users</p>
                    <p className="text-[11px] text-muted-foreground">View registered users</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground ml-auto" />
                </button>

                <button
                  onClick={() => { setShowAdminPopup(false); navigate('/admin'); }}
                  className="w-full flex items-center gap-3 p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center">
                    <Settings size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Admin Dashboard</p>
                    <p className="text-[11px] text-muted-foreground">Stats, charts & management</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground ml-auto" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowEdit(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl border border-border p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-display font-bold text-foreground">Edit Profile</h3>
                <button onClick={() => setShowEdit(false)} className="text-muted-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 text-sm font-bold mt-5 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

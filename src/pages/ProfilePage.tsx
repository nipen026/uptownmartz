import { User, MapPin, CreditCard, Bell, Moon, ChevronRight, LogOut, Settings, HelpCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: MapPin, label: 'Saved Addresses', desc: '2 addresses saved' },
      { icon: CreditCard, label: 'Payment Methods', desc: 'UPI, Cards' },
      { icon: Gift, label: 'Rewards & Coupons', desc: '2 coupons available' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', desc: 'Order updates, offers' },
      { icon: Moon, label: 'Dark Mode', desc: 'Coming soon' },
      { icon: Settings, label: 'Settings', desc: 'App settings' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', desc: 'FAQ, contact us' },
    ],
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-5xl mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-display font-bold text-foreground">Profile</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-5 flex items-center gap-4 mb-6"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-display font-bold text-foreground">Rahul Sharma</h2>
            <p className="text-xs text-muted-foreground">+91 98765 43210</p>
            <p className="text-xs text-muted-foreground">rahul@email.com</p>
          </div>
          <button className="text-xs text-primary font-bold">Edit</button>
        </motion.div>

        {/* Quick stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Orders', value: '24', emoji: '📦' },
            { label: 'Saved', value: '₹850', emoji: '💰' },
            { label: 'Rewards', value: '120 pts', emoji: '⭐' },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-3 text-center">
              <span className="text-xl">{s.emoji}</span>
              <p className="text-sm font-bold text-foreground mt-1">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {menuSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + si * 0.05 }}
            className="mb-4"
          >
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{section.title}</h3>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${i < section.items.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                      <Icon size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 bg-accent rounded-2xl border border-border p-4 text-accent-foreground"
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Admin Dashboard</span>
            <ChevronRight size={16} className="ml-auto" />
          </button>
          <button className="w-full flex items-center gap-3 bg-card rounded-2xl border border-border p-4 text-destructive">
            <LogOut size={18} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

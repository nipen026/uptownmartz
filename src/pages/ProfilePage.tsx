import { User, MapPin, CreditCard, Bell, Moon, ChevronRight, LogOut } from 'lucide-react';

const menuItems = [
  { icon: MapPin, label: 'Saved Addresses', desc: '2 addresses saved' },
  { icon: CreditCard, label: 'Payment Methods', desc: 'UPI, Cards' },
  { icon: Bell, label: 'Notifications', desc: 'Order updates, offers' },
  { icon: Moon, label: 'Dark Mode', desc: 'Coming soon' },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-lg mx-auto px-4">
        <div className="py-4">
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Rahul Sharma</h2>
            <p className="text-xs text-muted-foreground">+91 98765 43210</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden mb-5">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${i < menuItems.length - 1 ? 'border-b border-border' : ''}`}
              >
                <Icon size={18} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            );
          })}
        </div>

        <button className="w-full flex items-center gap-3 bg-card rounded-xl border border-border p-4 text-destructive">
          <LogOut size={18} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}

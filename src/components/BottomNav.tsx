import { Home, Search, ShoppingBag, User, Clock, LogIn, MapPin, ChevronDown, Check, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { addressApi } from '@/services/api';
import type { ApiAddress } from '@/types';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { totalItems } = useCart();

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      addressApi.getAll().then((data) => {
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault) || data[0] || null;
        setSelectedAddress(defaultAddr);
      }).catch(() => {});
    } else {
      setAddresses([]);
      setSelectedAddress(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Clock, label: 'Orders', path: '/orders' },
  ];

  const handleSelectAddress = (addr: ApiAddress) => {
    setSelectedAddress(addr);
    setDropdownOpen(false);
  };

  const deliveryLabel = selectedAddress
    ? `${selectedAddress.address}, ${selectedAddress.city}`
    : isAuthenticated
      ? 'Select address'
      : 'Select location';

  return (
    <>
      <nav className={cn(
        'sticky top-0 left-0 right-0 w-full z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 md:h-16">
          {/* Left: Brand + Deliver To */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Brand */}
            <div
              className="flex items-center gap-2 cursor-pointer select-none shrink-0"
              onClick={() => navigate('/')}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs md:text-sm">U</span>
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight">UptownMartz</span>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden md:block w-px h-6 bg-border/40" />

            {/* Deliver To dropdown - hidden on mobile, shown in mobile menu */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="bg-primary/10 p-1.5 rounded-full"
                >
                  <MapPin size={14} className="text-primary" />
                </motion.div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-foreground">Deliver to</span>
                    <motion.div
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={12} className="text-muted-foreground" />
                    </motion.div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight max-w-[180px] truncate">
                    {deliveryLabel}
                  </p>
                </div>
              </button>

              {/* Address Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-80 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border/40">
                      <p className="text-sm font-semibold text-foreground">Your addresses</p>
                      <p className="text-[11px] text-muted-foreground">Select a delivery location</p>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {!isAuthenticated ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground mb-3">Log in to see your saved addresses</p>
                          <button
                            onClick={() => { setDropdownOpen(false); navigate('/login'); }}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Login
                          </button>
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground mb-3">No saved addresses yet</p>
                          <button
                            onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Add an address
                          </button>
                        </div>
                      ) : (
                        addresses.map((addr, i) => (
                          <motion.button
                            key={addr.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                            onClick={() => handleSelectAddress(addr)}
                            className={cn(
                              'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                              selectedAddress?.id === addr.id
                                ? 'bg-primary/5'
                                : 'hover:bg-muted/50'
                            )}
                          >
                            <div className={cn(
                              'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                              selectedAddress?.id === addr.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}>
                              {selectedAddress?.id === addr.id ? (
                                <Check size={12} />
                              ) : (
                                <MapPin size={10} className="text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {addr.address}, {addr.city} - {addr.pincode}
                              </p>
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                {addr.name} &middot; {addr.phone}
                              </p>
                            </div>
                          </motion.button>
                        ))
                      )}
                    </div>

                    {isAuthenticated && addresses.length > 0 && (
                      <div className="border-t border-border/40 px-4 py-2.5">
                        <button
                          onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          + Add new address
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center: Nav links - desktop only */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ icon: Icon, label, path }) => {
              const active = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                  )}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Cart + Profile (desktop) / Cart + Hamburger (mobile) */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Cart - always visible */}
            <button
              onClick={() => navigate('/cart')}
              className={cn(
                'relative flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                location.pathname === '/cart'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              )}
            >
              <div className="relative">
                <ShoppingBag size={16} strokeWidth={location.pathname === '/cart' ? 2.5 : 1.8} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>

            {/* Divider - desktop only */}
            <div className="hidden md:block w-px h-5 bg-border/40" />

            {/* Profile / Login - desktop only */}
            <button
              onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
              className={cn(
                'hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all duration-200',
                (location.pathname === '/profile' || location.pathname === '/login')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-foreground/5 hover:bg-foreground/10 text-foreground'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold',
                (location.pathname === '/profile' || location.pathname === '/login')
                  ? 'bg-primary-foreground/20'
                  : 'bg-primary/10'
              )}>
                {isAuthenticated ? (
                  <span className={cn(
                    'text-xs font-bold',
                    (location.pathname === '/profile') ? 'text-primary-foreground' : 'text-primary'
                  )}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                ) : (
                  <LogIn size={14} className={(location.pathname === '/login') ? 'text-primary-foreground' : 'text-primary'} />
                )}
              </div>
              <span className="text-sm font-medium">
                {isAuthenticated ? user?.name?.split(' ')[0] : 'Login'}
              </span>
            </button>

            {/* Hamburger - mobile only */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-full text-foreground hover:bg-foreground/5 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-down panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-14 left-0 right-0 bg-card border-b border-border/60 shadow-xl z-50 md:hidden overflow-hidden"
            >
              <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
                {/* Deliver To section */}
                <div className="px-3 py-2.5 mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <MapPin size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Deliver to</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[250px]">
                        {deliveryLabel}
                      </p>
                    </div>
                  </div>

                  {/* Inline address list for mobile */}
                  {isAuthenticated && addresses.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={cn(
                            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            selectedAddress?.id === addr.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                          )}
                        >
                          {selectedAddress?.id === addr.id && <Check size={10} />}
                          {addr.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {isAuthenticated && addresses.length === 0 && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      + Add an address
                    </button>
                  )}
                  {!isAuthenticated && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Login to add address
                    </button>
                  )}
                </div>

                <div className="h-px bg-border/40 mx-3" />

                {/* Nav links */}
                {navLinks.map(({ icon: Icon, label, path }) => {
                  const active = location.pathname === path;
                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
                        active
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:bg-foreground/5'
                      )}
                    >
                      <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                      <span>{label}</span>
                    </button>
                  );
                })}

                <div className="h-px bg-border/40 mx-3" />

                {/* Profile / Login */}
                <button
                  onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
                    (location.pathname === '/profile' || location.pathname === '/login')
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-foreground/5'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    (location.pathname === '/profile' || location.pathname === '/login')
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10'
                  )}>
                    {isAuthenticated ? (
                      <span className={cn(
                        'text-xs font-bold',
                        (location.pathname === '/profile') ? 'text-primary-foreground' : 'text-primary'
                      )}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    ) : (
                      <LogIn size={14} className={(location.pathname === '/login') ? 'text-primary-foreground' : 'text-primary'} />
                    )}
                  </div>
                  <span>{isAuthenticated ? user?.name?.split(' ')[0] || 'Profile' : 'Login'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border/50 z-50 pb-safe md:hidden">
        <div className="flex items-center justify-around h-14">
          {[...navLinks, { icon: ShoppingBag, label: 'Cart', path: '/cart' }].map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            const isCart = path === '/cart';
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors relative',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  {isCart && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
              (location.pathname === '/profile' || location.pathname === '/login')
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            {isAuthenticated ? <User size={20} /> : <LogIn size={20} />}
            <span className="text-[10px] font-medium">
              {isAuthenticated ? user?.name?.split(' ')[0] || 'Profile' : 'Login'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

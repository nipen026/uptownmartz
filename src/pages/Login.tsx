import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: string })?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.8),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.6),transparent_50%)]" />

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-24 h-24 bg-primary-foreground/10 rounded-3xl"
        />
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 right-20 w-32 h-32 bg-primary-foreground/5 rounded-full"
        />
        <motion.div
          animate={{ y: [10, -20, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-16 h-16 bg-primary-foreground/10 rounded-2xl rotate-45"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-24 h-24 bg-primary-foreground/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 p-3">
            <img src="/logo.png" alt="UptownMartz" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4 leading-tight">
            Fresh groceries,<br />delivered fast.
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-sm mx-auto leading-relaxed">
            Get everything you need from your favorite store, right at your doorstep.
          </p>

          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">50K+</p>
              <p className="text-xs text-primary-foreground/60">Customers</p>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">10 min</p>
              <p className="text-xs text-primary-foreground/60">Avg Delivery</p>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">5K+</p>
              <p className="text-xs text-primary-foreground/60">Products</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <img src="/logo.png" alt="UptownMartz" className="h-12 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue shopping
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary font-semibold hover:underline"
              >
                Create one
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

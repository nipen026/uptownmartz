import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password);
      navigate("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ["", "Weak", "Good", "Strong"];
  const strengthColors = ["", "bg-destructive", "bg-yellow-500", "bg-green-500"];

  const perks = [
    "Track orders in real-time",
    "Save your favorite items",
    "Exclusive deals & offers",
    "Fast 10-minute delivery",
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--primary)/0.1),transparent_50%)]" />

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 right-24 w-20 h-20 bg-background/5 rounded-3xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-24 left-20 w-28 h-28 bg-primary/10 rounded-full"
        />
        <motion.div
          animate={{ y: [10, -15, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-16 w-14 h-14 bg-background/5 rounded-2xl rotate-12"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-12 max-w-lg"
        >
          <div className="w-24 h-24 bg-background/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 p-3">
            <img src="/logo.png" alt="UptownMartz" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-display font-bold text-background mb-4 leading-tight">
            Join thousands of<br />happy shoppers.
          </h1>
          <p className="text-background/50 text-lg mb-10 leading-relaxed">
            Create your account and start ordering fresh groceries today.
          </p>

          <div className="space-y-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-primary" />
                </div>
                <span className="text-background/70 text-sm">{perk}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Register Form */}
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
              Create account
            </h2>
            <p className="text-muted-foreground">
              Sign up to start ordering fresh groceries
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
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2.5"
                >
                  <div className="flex gap-1.5 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          passwordStrength >= level
                            ? strengthColors[passwordStrength]
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {strengthLabels[passwordStrength]} password
                  </p>
                </motion.div>
              )}
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
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center mt-6 leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

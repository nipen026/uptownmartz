import { ScrollReveal } from './ScrollReveal';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-3">QuickCart</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                India's fastest grocery delivery. Fresh groceries at your doorstep in 10 minutes.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Press</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Help</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">FAQ</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Delivery Areas</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Return Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Cookie Policy</li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 QuickCart. All rights reserved.</p>
          <div className="flex gap-4 text-lg">
            <span className="cursor-pointer hover:scale-110 transition-transform">📸</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">🐦</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">📘</span>
            <span className="cursor-pointer hover:scale-110 transition-transform">💼</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

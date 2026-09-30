import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 bg-eclipse-surface/30 backdrop-blur-md py-12 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group inline-flex">
              <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-eclipse-cyan/10 border border-eclipse-cyan/20">
                <Shield className="w-4 h-4 text-eclipse-cyan" />
              </div>
              <span className="text-base font-bold text-eclipse-bright tracking-tight">
                EclipseID
              </span>
            </Link>
            <p className="text-sm text-eclipse-text/80 leading-relaxed max-w-sm mb-6">
              The premier Zero-Knowledge identity protocol built natively for the Midnight Network. We shield real-world identities while proving on-chain compliance.
            </p>
            <p className="font-mono text-[10px] tracking-wider text-eclipse-muted/50 uppercase">
              MIDNIGHT.NETWORK // ZK.IDENTITY.PROTOCOL // v2.0
            </p>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-eclipse-bright font-semibold mb-4 text-sm tracking-wide">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">Cookie Policy</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">Web3 Disclaimer</Link></li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-eclipse-bright font-semibold mb-4 text-sm tracking-wide">Connect</h4>
            <ul className="space-y-3">
              <li><a href="https://github.com/lohit-40/EclipseID" target="_blank" rel="noreferrer" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">GitHub Repository</a></li>
              <li><Link to="/feedback" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">Submit Feedback</Link></li>
              <li><a href="mailto:legal@eclipse-id.com" className="text-sm text-eclipse-text hover:text-eclipse-cyan transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="w-full border-t border-black/5 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-eclipse-muted">
            &copy; {new Date().getFullYear()} EclipseID Protocol. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="text-[10px] font-mono text-eclipse-muted">POWERED BY MIDNIGHT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

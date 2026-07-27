import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { type DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import { useWallet } from './WalletContext';

// Pages
import Landing from './pages/Landing';
import Darkpool from './pages/Darkpool';
import Admin from './pages/Admin';
import Developers from './pages/Developers';

// Link Component for Navbar
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link 
      to={href}
      className={`transition-colors font-medium text-sm ${isActive ? 'text-rose-100 font-bold border-b border-rose-500' : 'text-rose-200/60 hover:text-rose-100'}`}
    >
      {children}
    </Link>
  );
};

export default function App() {
  const { wallet, setWallet, address, setAddress, isConnected, setIsConnected } = useWallet();
  const location = useLocation();
  
  const MASTER_ADMIN_WALLET = 'mn_addr_preprod1j26nj67vy6h0995upsdn85su3pvzqjfpyacclywcvv8e3zr4zrrqxv68xa';
  const isAdminMode = address === MASTER_ADMIN_WALLET;

  // Auto-connect wallet on load if available
  useEffect(() => {
    try {
      if (window.midnight && window.midnight.mnLace) {
        window.midnight.mnLace.enable().then((api: DAppConnectorWalletAPI) => {
          setWallet(api);
          api.state().then(state => {
            setIsConnected(true);
            setAddress(state.unshieldedAddress);
          }).catch(console.error);
        }).catch((err: any) => console.log('Wallet not auto-connected', err));
      }
    } catch (e) {
      console.error('Wallet detection error:', e);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.midnight || !window.midnight.mnLace) {
      alert("Lace wallet extension not found! Please install the Lace wallet.");
      return;
    }
    try {
      const api = await window.midnight.mnLace.enable();
      setWallet(api);
      const state = await api.state();
      setIsConnected(true);
      setAddress(state.unshieldedAddress);
    } catch (err) {
      console.error("User rejected connection", err);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsConnected(false);
    setAddress('');
  };

  return (
    <div className="min-h-screen bg-[#070410] text-rose-50 selection:bg-rose-500/30 selection:text-white font-sans relative overflow-x-hidden">
      {/* Background Animated Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-1/2 -left-1/2 w-[100vw] h-[100vw] rounded-full bg-gradient-to-r from-orange-600/30 to-rose-700/30 blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-1/2 -right-1/2 w-[120vw] h-[120vw] rounded-full bg-gradient-to-r from-purple-800/20 to-rose-900/20 blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sleek Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full backdrop-blur-sm border-b border-white/5 sticky top-0 bg-[#070410]/80">
          <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-110 transition-transform">
              <div className="w-3 h-3 bg-[#070410] rounded-full" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-50 to-rose-200/80 drop-shadow-md">EclipseID</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-2 rounded-full border border-white/10">
            <NavLink href="/darkpool">Darkpool dApp</NavLink>
            <NavLink href="/developers">Developers</NavLink>
            {isAdminMode && <NavLink href="/admin">Command Center</NavLink>}
          </div>

          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button onClick={connectWallet} className="bg-white/10 hover:bg-white/20 text-rose-50 px-6 py-2 rounded-full font-semibold border border-white/10 transition-all shadow-lg backdrop-blur-md cursor-pointer">
                Connect Lace
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  <span className="text-xs font-mono text-rose-200/70">{address.slice(0, 12)}...</span>
                </div>
                <button onClick={disconnectWallet} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">Disconnect</button>
              </div>
            )}
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 w-full relative">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/darkpool" element={<Darkpool />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/developers" element={<Developers />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="w-full text-center py-8 text-rose-200/30 text-xs border-t border-white/5 mt-auto">
          Built on Midnight Network • Zero-Knowledge Identity Protocol
        </footer>
      </div>
    </div>
  );
}

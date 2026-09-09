import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { type DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';
import { useWallet } from './WalletContext';
import { Terminal, Shield } from 'lucide-react';
import ScrambleText from './components/ScrambleText';
import { playSound } from './utils/sounds';

// Pages
import Landing from './pages/Landing';
import Darkpool from './pages/Darkpool';
import Admin from './pages/Admin';
import Developers from './pages/Developers';
import Feedback from './pages/Feedback';

// Link Component for Navbar
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link 
      to={href}
      className={`transition-colors font-medium text-sm ${isActive ? 'text-emerald-400 font-bold border-b border-emerald-500 shadow-[0_4px_15px_-3px_rgba(16,185,129,0.5)]' : 'text-emerald-200/60 hover:text-emerald-100'}`}
    >
      {children}
    </Link>
  );
};

export default function App() {
  const { wallet, setWallet, address, setAddress, isConnected, setIsConnected } = useWallet();
  const location = useLocation();
  
  const MASTER_ADMIN_WALLET = import.meta.env.VITE_MASTER_ADMIN_WALLET;
  const isAdminMode = address === MASTER_ADMIN_WALLET;

  // Auto-connect wallet on load if available
  useEffect(() => {
    try {
      if (window.midnight) {
        const connector = window.midnight.mnLace || window.midnight;
        if (connector.enable || connector.connect) {
          const connectPromise = connector.enable ? connector.enable() : connector.connect();
          connectPromise.then(async (api: any) => {
            let connectedApi = api;
            if (api.requestAuthorization) {
               connectedApi = await api.requestAuthorization();
            }
            setWallet(connectedApi);
            connectedApi.state().then((state: any) => {
              setIsConnected(true);
              setAddress(state.unshieldedAddress);
            }).catch(console.error);
          }).catch((err: any) => console.log('Wallet not auto-connected', err));
        }
      }
    } catch (e) {
      console.error('Wallet detection error:', e);
    }
  }, []);

  const connectWallet = async () => {
    playSound('scan');
    if (!window.midnight) {
      playSound('error');
      alert("Midnight wallet extension not found! Please install a compatible wallet like Lace.");
      return;
    }
    try {
      // Use mnLace if available, otherwise fallback to the generic window.midnight connector
      const connector = window.midnight.mnLace || window.midnight;
      
      // Some wallet versions use connect(), some use enable()
      const api = await (connector.enable ? connector.enable() : connector.connect());
      
      // If it returned an InitialAPI (has requestAuthorization), authorize it
      let connectedApi = api;
      if (api.requestAuthorization) {
         connectedApi = await api.requestAuthorization();
      }
      
      setWallet(connectedApi);
      const state = await connectedApi.state();
      setIsConnected(true);
      setAddress(state.unshieldedAddress);
      playSound('success');
    } catch (err) {
      playSound('error');
      console.error("User rejected connection or connection failed", err);
    }
  };

  const disconnectWallet = () => {
    playSound('alert');
    setWallet(null);
    setIsConnected(false);
    setAddress('');
  };

  return (
    <div className="min-h-screen bg-[#070410] text-emerald-50 selection:bg-emerald-500/30 selection:text-white font-mono relative overflow-x-hidden">
      {/* Cyber grid background matching Stellar project */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#0f2e1b_1px,transparent_1px),linear-gradient(to_bottom,#0f2e1b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sleek Hacker Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full backdrop-blur-md border-b border-emerald-900/50 sticky top-0 bg-[#070410]/80 z-50">
          <Link to="/" className="text-2xl font-black tracking-tighter flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="absolute inset-0 text-emerald-500 w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" strokeWidth={1.5} />
              <Terminal className="absolute inset-0 text-[#070410] w-full h-full scale-[0.5] z-10 fill-emerald-500" strokeWidth={2} />
            </div>
            <ScrambleText text="EclipseID" className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]" delayMs={100} />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 bg-black/40 px-6 py-2 rounded-none border border-emerald-900/50 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
            <NavLink href="/darkpool">Darkpool dApp</NavLink>
            <NavLink href="/developers">Developers</NavLink>
            <NavLink href="/feedback">Give Feedback</NavLink>
            {isAdminMode && <NavLink href="/admin">Command Center</NavLink>}
          </div>

          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button onClick={connectWallet} className="relative group overflow-hidden bg-transparent border border-emerald-500/50 text-emerald-400 px-6 py-2 font-mono font-bold transition-all hover:bg-emerald-500/10 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer rounded-none">
                <span className="relative z-10">CONNECT_WALLET</span>
                <div className="absolute inset-0 bg-emerald-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-[#0a140f] px-4 py-2 border border-emerald-500/30 rounded-none shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-mono text-emerald-400/80 tracking-widest">{address.slice(0, 12)}...</span>
                </div>
                <button onClick={disconnectWallet} className="text-xs text-rose-500 hover:text-rose-400 transition-colors tracking-widest">[ DISCONNECT ]</button>
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
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="w-full flex flex-col items-center justify-center py-8 text-emerald-500/40 text-xs border-t border-emerald-900/30 mt-auto gap-3 font-mono tracking-widest">
          <p>SYSTEM.CORE.MIDNIGHT_NETWORK // ZK.IDENTITY.PROTOCOL</p>
          <a href="https://x.com/EclipseID010" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold">
            [ FOLLOW_X ]
          </a>
        </footer>
      </div>
    </div>
  );
}

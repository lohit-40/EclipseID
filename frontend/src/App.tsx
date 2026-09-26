import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useWallet } from './WalletContext';
import { Shield, Menu, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ScrambleText from './components/ScrambleText';
import { playSound } from './utils/sounds';

// Pages
import Landing from './pages/Landing';
import Darkpool from './pages/Darkpool';
import Admin from './pages/Admin';
import Developers from './pages/Developers';
import Feedback from './pages/Feedback';

// Link Component for Navbar
const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  
  return (
    <Link 
      to={href}
      onClick={onClick}
      className={`relative text-sm font-semibold tracking-wide px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? 'text-eclipse-cyan bg-eclipse-cyan/10' : 'text-eclipse-text hover:text-eclipse-bright hover:bg-black/5'}`}
    >
      {children}
      {isActive && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-eclipse-cyan rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const { wallet, setWallet, address, setAddress, isConnected, setIsConnected } = useWallet();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const MASTER_ADMIN_WALLET = import.meta.env.VITE_MASTER_ADMIN_WALLET;
  const isAdminMode = address === MASTER_ADMIN_WALLET;

  // Track scroll for navbar glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
      const connector = window.midnight.mnLace || window.midnight;
      const api = await (connector.enable ? connector.enable() : connector.connect());
      
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
    <div className="min-h-screen bg-eclipse-void text-eclipse-text relative overflow-x-hidden">
      {/* Ambient Background */}
      <div className="grid-bg" />
      <div className="orb orb-cyan" />
      <div className="orb orb-violet" />
      <div className="orb orb-pink" />
      <div className="scanline-overlay" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ─── Glassmorphic Navbar ─── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-eclipse-void/70 backdrop-blur-2xl border-b border-black/5 shadow-lg shadow-black/5' : 'bg-transparent'}`}>
          <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto w-full">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-eclipse-cyan/10 border border-eclipse-cyan/20 group-hover:border-eclipse-cyan/40 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all duration-300">
                <Shield className="w-5 h-5 text-eclipse-cyan" strokeWidth={2} />
              </div>
              <span className="text-lg font-bold text-eclipse-bright tracking-tight hidden sm:block">
                <ScrambleText text="EclipseID" className="text-eclipse-bright" delayMs={100} />
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/darkpool">Darkpool</NavLink>
              <NavLink href="/developers">Developers</NavLink>
              <NavLink href="/feedback">Feedback</NavLink>
              {isAdminMode && <NavLink href="/admin">Admin</NavLink>}
            </div>

            <div className="flex items-center gap-3 z-50">
              {!isConnected ? (
                <button onClick={connectWallet} className="hidden md:flex neon-btn text-sm py-2.5 px-5">
                  <Zap size={16} />
                  Connect Wallet
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 glass-card px-4 py-2 !rounded-xl">
                    <div className="status-dot bg-eclipse-green" />
                    <span className="text-xs text-eclipse-text font-mono">{address.slice(0, 10)}...{address.slice(-4)}</span>
                  </div>
                  <button onClick={disconnectWallet} className="text-xs font-semibold text-eclipse-muted hover:text-eclipse-pink px-3 py-2 rounded-lg hover:bg-eclipse-pink/10 transition-all">
                    Disconnect
                  </button>
                </div>
              )}
              
              <button className="md:hidden p-2 rounded-lg hover:bg-black/5 transition-colors text-eclipse-text" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, y: 0, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed top-[72px] left-4 right-4 bg-eclipse-surface/90 backdrop-blur-2xl border border-black/10 rounded-2xl z-40 flex flex-col p-6 gap-3 shadow-2xl shadow-black/10"
            >
              <NavLink href="/darkpool" onClick={() => setIsMenuOpen(false)}>Darkpool dApp</NavLink>
              <NavLink href="/developers" onClick={() => setIsMenuOpen(false)}>Developers</NavLink>
              <NavLink href="/feedback" onClick={() => setIsMenuOpen(false)}>Feedback</NavLink>
              {isAdminMode && <NavLink href="/admin" onClick={() => setIsMenuOpen(false)}>Admin</NavLink>}
              
              <div className="border-t border-black/5 pt-4 mt-2">
                {!isConnected ? (
                  <button onClick={() => { connectWallet(); setIsMenuOpen(false); }} className="w-full neon-btn py-3 text-center">
                    <Zap size={16} /> Connect Wallet
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 glass-card px-4 py-3 !rounded-xl">
                      <div className="status-dot bg-eclipse-green" />
                      <span className="text-sm text-eclipse-text font-mono">{address.slice(0, 12)}...</span>
                    </div>
                    <button onClick={() => { disconnectWallet(); setIsMenuOpen(false); }} className="w-full text-sm font-semibold text-eclipse-muted hover:text-eclipse-pink py-3 rounded-lg hover:bg-eclipse-pink/10 transition-all">
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full relative pt-20">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/darkpool" element={<PageWrapper><Darkpool /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
              <Route path="/developers" element={<PageWrapper><Developers /></PageWrapper>} />
              <Route path="/feedback" element={<PageWrapper><Feedback /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        
        {/* ─── Footer ─── */}
        <footer className="w-full flex flex-col items-center justify-center py-10 text-eclipse-muted text-xs border-t border-black/5 mt-auto gap-3 relative z-10">
          <p className="font-mono tracking-wider opacity-60">MIDNIGHT.NETWORK // ZK.IDENTITY.PROTOCOL // v2.0</p>
        </footer>
      </div>
    </div>
  );
}

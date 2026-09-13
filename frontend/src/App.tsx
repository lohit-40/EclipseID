import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useWallet } from './WalletContext';
import { Terminal, Shield, Menu, X } from 'lucide-react';
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
      className={`transition-all font-bold text-sm px-4 py-2 uppercase tracking-widest border-2 text-center ${isActive ? 'bg-brutal-orange text-brutal-bg border-brutal-orange shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]' : 'bg-brutal-bg text-brutal-text border-brutal-text hover:bg-brutal-text hover:text-brutal-bg shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] hover:shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]'}`}
    >
      {children}
    </Link>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const { wallet, setWallet, address, setAddress, isConnected, setIsConnected } = useWallet();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
    <div className="min-h-screen bg-brutal-bg text-brutal-text selection:bg-brutal-orange selection:text-brutal-bg font-sans relative overflow-x-hidden">
      <div className="grain-overlay" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="flex items-center justify-between px-4 md:px-8 py-6 max-w-7xl mx-auto w-full sticky top-0 bg-brutal-bg z-50 border-b-4 border-brutal-text mb-8">
          <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-3 group uppercase z-50">
            <div className="relative w-10 h-10 flex items-center justify-center bg-brutal-orange text-brutal-bg border-2 border-brutal-text shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] transition-all">
              <Shield className="absolute inset-0 w-full h-full p-2" strokeWidth={2.5} />
            </div>
            <ScrambleText text="EclipseID" className="text-brutal-text hidden sm:block" delayMs={100} />
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <NavLink href="/darkpool">Darkpool dApp</NavLink>
            <NavLink href="/developers">Developers</NavLink>
            <NavLink href="/feedback">Give Feedback</NavLink>
            {isAdminMode && <NavLink href="/admin">Command Center</NavLink>}
          </div>

          <div className="flex items-center gap-4 z-50">
            {!isConnected ? (
              <button onClick={connectWallet} className="hidden md:block brutal-btn py-2 px-4 shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(28,28,28,1)]">
                CONNECT WALLET
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-4 bg-brutal-bg px-4 py-2 border-2 border-brutal-text shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
                <div className="flex items-center gap-2 font-bold">
                  <div className="w-3 h-3 rounded-none bg-brutal-orange border-2 border-brutal-text" />
                  <span className="text-xs uppercase tracking-widest">{address.slice(0, 12)}...</span>
                </div>
                <button onClick={disconnectWallet} className="text-xs font-bold bg-brutal-text text-brutal-bg px-2 py-1 uppercase tracking-widest hover:bg-brutal-orange transition-colors border-2 border-transparent hover:border-brutal-text">DISCONNECT</button>
              </div>
            )}
            
            <button className="md:hidden brutal-btn p-2 border-2 border-brutal-text bg-white shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-24 left-4 right-4 bg-white border-4 border-brutal-text shadow-[8px_8px_0px_0px_rgba(28,28,28,1)] z-40 flex flex-col p-6 gap-4"
            >
              <NavLink href="/darkpool" onClick={() => setIsMenuOpen(false)}>Darkpool dApp</NavLink>
              <NavLink href="/developers" onClick={() => setIsMenuOpen(false)}>Developers</NavLink>
              <NavLink href="/feedback" onClick={() => setIsMenuOpen(false)}>Give Feedback</NavLink>
              {isAdminMode && <NavLink href="/admin" onClick={() => setIsMenuOpen(false)}>Command Center</NavLink>}
              
              <div className="border-t-4 border-brutal-text pt-6 mt-2">
                {!isConnected ? (
                  <button onClick={() => { connectWallet(); setIsMenuOpen(false); }} className="w-full brutal-btn py-3 px-4 shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] text-center block">
                    CONNECT WALLET
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 font-bold bg-brutal-bg border-2 border-brutal-text py-3">
                      <div className="w-3 h-3 rounded-none bg-brutal-orange border-2 border-brutal-text" />
                      <span className="text-sm uppercase tracking-widest">{address.slice(0, 12)}...</span>
                    </div>
                    <button onClick={() => { disconnectWallet(); setIsMenuOpen(false); }} className="w-full font-bold bg-brutal-text text-brutal-bg px-4 py-3 uppercase tracking-widest border-2 border-brutal-text">DISCONNECT</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full relative">
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
        
        <footer className="w-full flex flex-col items-center justify-center py-8 text-brutal-text text-xs border-t-4 border-brutal-text mt-auto gap-3 font-bold uppercase tracking-widest bg-brutal-orange bg-opacity-10">
          <p>SYSTEM.CORE.MIDNIGHT_NETWORK // ZK.IDENTITY.PROTOCOL</p>
          <a href="https://x.com/EclipseID010" target="_blank" rel="noreferrer" className="hover:text-brutal-orange transition-colors flex items-center gap-1.5 underline underline-offset-4 decoration-2">
            [ FOLLOW X ]
          </a>
        </footer>
      </div>
    </div>
  );
}

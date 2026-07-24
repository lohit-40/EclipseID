import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createMidnightProviders } from './providers';
import { Contract } from './contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { Link001, Link002, Link003 } from './components/ui/skiper-ui/skiper40';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Hardcoded Cloudflare backend URL
const BACKEND_URL = 'https://eclipse-id-backend.lohitmishra25.workers.dev';

// ============================================================================
// ⚠️ ADMIN DEPLOYMENT STEP ⚠️
// 1. Enter Admin Mode in the UI.
// 2. Deploy the Contract.
// 3. Paste the resulting address here.
// ============================================================================
const HARDCODED_GLOBAL_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

function App() {
  const [wallet, setWallet] = useState<WalletConnectedAPI | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Loading & State
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [txResult, setTxResult] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  
  // User Flow State
  const [email, setEmail] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Admin Flow State
  const [deployedAddress, setDeployedAddress] = useState<string>(HARDCODED_GLOBAL_CONTRACT_ADDRESS);

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left / rect.width - 0.5);
    y.set(e.clientY - rect.top / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const connectWallet = async () => {
    try {
      setError(''); setTxResult('');
      setNetworkId('preprod');
      const midnight = (window as any).midnight;
      if (!midnight) throw new Error('Midnight provider not found. Please install Lace wallet.');
      const keys = Object.keys(midnight);
      let providerKey = keys.find(key => midnight[key] && typeof midnight[key].enable === 'function') || keys[0];
      const provider = midnight[providerKey];
      
      let walletApi;
      try {
        walletApi = await (provider.enable ? provider.enable('preprod') : provider.connect('preprod'));
      } catch (innerErr: any) {
        const msg = innerErr.message || String(innerErr);
        if (msg.toLowerCase().includes('locked')) {
          throw new Error('Your Lace Wallet is locked! Please open the Lace extension, enter your password to unlock it, and then click Connect again.');
        }
        if (msg.includes('feature-flags') || msg.includes('Remote API')) {
          throw new Error('Lace Wallet background service crashed (Known Lace Bug). Please Hard Refresh the page (Ctrl+Shift+R) and try connecting again.');
        }
        throw innerErr;
      }
      
      setWallet(walletApi);
      const unshieldedAddrObj = await walletApi.getUnshieldedAddress();
      setAddress(unshieldedAddrObj.unshieldedAddress);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect Lace wallet');
    }
  };

  const disconnectWallet = () => { setWallet(null); setAddress(''); setTxResult(''); setIsVerified(false); };

  const getContractInstance = async () => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!deployedAddress) throw new Error('Contract address not configured! Admin must deploy the contract first.');

    const providers = await createMidnightProviders(wallet, {
      indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
      indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    });

    const secretBytes = new TextEncoder().encode(address.substring(0, 32).padEnd(32, '0'));

    const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(
      CompiledContract.withWitnesses({
        secret_identity: () => secretBytes
      })
    );

    return findDeployedContract(providers, { contractAddress: deployedAddress, compiledContract });
  };

  // ============================================================================
  // ADMIN FLOWS
  // ============================================================================
  const handleAdminDeploy = async () => {
    if (!wallet) return;
    try {
      setLoading(true); setError(''); setTxResult(''); 
      setLoadingStep('Deploying Contract... (Waiting for Midnight Indexer, this can take a minute)');
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
      });
      const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(CompiledContract.withVacantWitnesses);
      
      const deployed = await deployContract(providers, { compiledContract });
      const addr = deployed.deployTxData.public.contractAddress;
      
      setDeployedAddress(addr);
      setTxResult(`Successfully deployed contract!\nAddress: ${addr}\n\nIMPORTANT: Copy this address and paste it into HARDCODED_GLOBAL_CONTRACT_ADDRESS in App.tsx!`);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false); setLoadingStep('');
    }
  };

  const handleAdminRegisterIssuer = async () => {
    try {
      setLoading(true); setError(''); setTxResult('');
      
      setLoadingStep('Fetching Issuer ID from Cloudflare...');
      const res = await fetch(`${BACKEND_URL}/api/issuer/request-credential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@eclipse.id', address })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setLoadingStep('Registering Issuer on Midnight... (Waiting for network confirmation)');
      const contract = await getContractInstance();
      const issuerBytes = fromHex(data.issuerId);
      const { txHash } = await contract.callTx.add_issuer(issuerBytes);
      
      setTxResult(`Admin: Backend Issuer Registered Successfully!\nTxHash: ${txHash}`);
    } catch (err: any) {
      setError(err.message || 'Failed to register issuer');
    } finally {
      setLoading(false); setLoadingStep('');
    }
  };

  // ============================================================================
  // USER FLOWS
  // ============================================================================
  const handleRequestCredential = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    if (!deployedAddress) { setError('System Error: Smart Contract is not configured. Admin must deploy and set the address.'); return; }
    try {
      setLoading(true); setError(''); setTxResult('');
      
      setLoadingStep('Authenticating with Cloudflare Identity Provider...');
      const res = await fetch(`${BACKEND_URL}/api/issuer/request-credential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setLoadingStep('Generating ZK Proof & Verifying on Midnight... (Waiting for block confirmation)');
      const contract = await getContractInstance();
      const issuerBytes = fromHex(data.issuerId);
      const nullifierBytes = fromHex(data.nullifier);
      
      const { txHash } = await contract.callTx.verify_and_claim(issuerBytes, nullifierBytes);
      
      setIsVerified(true);
      setTxResult(`Identity Verified Successfully!\nZK Proof TxHash: ${txHash}`);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false); setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-[#070410] text-rose-50 overflow-hidden relative font-sans">
      <motion.nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-10 border-b border-white/5">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-600">EclipseID</span>
          {deployedAddress && <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-400 text-xs font-bold tracking-widest border border-green-500/30">LIVE</span>}
        </div>
        <div className="flex gap-8 text-sm font-medium text-rose-200/60 items-center">
          <Link001 href="#">Documentation</Link001>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)} 
            className={`transition-colors text-xs font-mono border px-2 py-1 rounded cursor-pointer ${isAdminMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'hover:text-orange-400 border-white/10'}`}
          >
            {isAdminMode ? 'Exit Admin Mode' : 'Admin'}
          </button>
        </div>
      </motion.nav>

      <main className="max-w-4xl mx-auto px-8 pt-20 pb-24 relative z-10">
        <motion.div className="text-center mb-16 space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight flex flex-col items-center">
            <span>Next-gen Identity on</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 mt-2 block drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">Midnight Network.</span>
          </h1>
          <p className="text-rose-200/60 text-lg max-w-2xl mx-auto">
            Zero-knowledge smart contracts for selective disclosure. Get verified without revealing your underlying data.
          </p>
        </motion.div>

        <motion.div 
          onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
          style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
          className="bg-[#120a1f]/80 backdrop-blur-xl border border-rose-500/10 p-8 rounded-3xl shadow-2xl relative"
        >
          <div style={{ transform: "translateZ(30px)" }} className="relative z-10 w-full h-full">
            {!wallet ? (
              <div className="flex flex-col items-center py-12 text-center">
                <button onClick={connectWallet} className="bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-3 px-10 rounded-full cursor-pointer shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
                  Connect Lace Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />Lace Connected</h2>
                    <p className="text-sm text-rose-200/60 font-mono mt-1">{address}</p>
                  </div>
                  <button onClick={disconnectWallet} className="text-sm px-4 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-colors">Disconnect</button>
                </div>

                {isAdminMode ? (
                  <div className="space-y-6 pt-2 bg-rose-950/20 border border-rose-500/20 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-rose-300 border-b border-rose-500/20 pb-4 mb-4">Admin Dashboard</h3>
                    <p className="text-sm text-rose-200/70 mb-4">You are in Admin mode. You can deploy the global contract and authorize the Cloudflare backend to issue credentials.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-[#070410]/50 p-4 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">Global Contract Address</span>
                          <span className="font-mono text-xs text-rose-200/50">{deployedAddress || 'Not Deployed'}</span>
                        </div>
                        <button onClick={handleAdminDeploy} disabled={loading} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg font-semibold border border-orange-500/20 cursor-pointer text-sm transition-colors disabled:opacity-50">
                          Deploy Global Contract
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#070410]/50 p-4 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">Register Cloudflare Backend</span>
                          <span className="text-xs text-rose-200/50">Authorizes the backend to issue KYC credentials</span>
                        </div>
                        <button onClick={handleAdminRegisterIssuer} disabled={loading || !deployedAddress} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-4 py-2 rounded-lg font-semibold border border-rose-500/20 cursor-pointer text-sm transition-colors disabled:opacity-50">
                          Register Backend Issuer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pt-2">
                    {isVerified ? (
                      <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-2xl text-center space-y-4">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">✓</div>
                        <h3 className="text-2xl font-bold text-green-400">Identity Verified</h3>
                        <p className="text-green-200/70 text-sm">Your ZK proof was successfully submitted and verified on the Midnight network without leaking your personal data.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-md mx-auto">
                        <h3 className="text-xl font-medium text-center text-zinc-200">Request Identity Verification</h3>
                        <p className="text-center text-rose-200/60 text-sm mb-4">The Cloudflare backend will issue your KYC credential, and the Frontend will immediately generate a ZK Proof to claim it on-chain.</p>
                        
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#070410]/50 border border-rose-500/10 focus:border-orange-500/50 outline-none rounded-xl p-3 text-rose-50 text-center transition-colors"
                        />
                        <button
                          onClick={handleRequestCredential}
                          disabled={loading || !email}
                          className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:opacity-90 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-lg cursor-pointer flex justify-center items-center gap-3 transition-all"
                        >
                          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {loading ? 'Processing...' : 'Get Verified & Claim Identity'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Global Loading Spinner for Midnight Indexer */}
        {loading && loadingStep && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-blue-300 text-sm font-medium">{loadingStep}</p>
          </motion.div>
        )}

        {txResult && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-center text-sm break-all font-mono whitespace-pre-wrap">
            {txResult}
          </motion.div>
        )}
        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm font-medium">
            {error}
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;

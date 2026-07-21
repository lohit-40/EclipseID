import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createMidnightProviders } from './providers';
import { Contract } from './contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { Link001, Link002, Link003 } from './components/ui/skiper-ui/skiper40';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

// Note: In production, the contract address should be injected via environment variables
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

function App() {
  const [wallet, setWallet] = useState<WalletConnectedAPI | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [issuerId, setIssuerId] = useState<string>('');
  const [verifyIssuer, setVerifyIssuer] = useState<string>('');
  const [verifyNullifier, setVerifyNullifier] = useState<string>('');
  const [txResult, setTxResult] = useState<string>('');

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  /**
   * Connects to the user's Midnight wallet (e.g., Lace) using the DApp Connector API.
   * This is required to sign transactions and interact with the network.
   */
  const connectWallet = async () => {
    try {
      setError('');
      setNetworkId('preprod');
      setError('');
      const midnight = (window as any).midnight;
      if (!midnight) {
        throw new Error('Midnight provider not found. Please install a compatible wallet extension like Lace.');
      }

      const keys = Object.keys(midnight);
      let providerKey = keys.find(key => midnight[key] && typeof midnight[key].enable === 'function');
      if (!providerKey) providerKey = keys[0];

      const provider = midnight[providerKey];
      if (!provider) {
        throw new Error(`No valid wallet provider found in window.midnight. Available keys: ${keys.join(', ')}`);
      }

      const walletApi = await (provider.enable ? provider.enable('preprod') : provider.connect('preprod'));
      setWallet(walletApi);
      
      const unshieldedAddrObj = await walletApi.getUnshieldedAddress();
      setAddress(unshieldedAddrObj.unshieldedAddress);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect Lace wallet');
    }
  };

  /**
   * Disconnects the wallet and clears the current session state.
   */
  const disconnectWallet = () => {
    setWallet(null);
    setAddress('');
  };

  const [deployedAddress, setDeployedAddress] = useState<string>(CONTRACT_ADDRESS);

  /**
   * Instantiates the Midnight Contract using the provided address and the 
   * user's connected wallet providers (for signing and indexing).
   */
  const getContractInstance = async () => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!deployedAddress) throw new Error('Contract address not set in environment (VITE_CONTRACT_ADDRESS) or deployed yet');

    const providers = await createMidnightProviders(wallet, {
      indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
      indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    });

    const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(
      CompiledContract.withVacantWitnesses
    );

    return findDeployedContract(providers, {
      contractAddress: deployedAddress,
      compiledContract,
    });
  };

  /**
   * Deploys a new instance of the EclipseID contract to the Midnight Preprod network.
   * Note: In a real-world scenario, this is typically done once by an admin.
   */
  const handleDeploy = async () => {
    if (!wallet) return;
    try {
      setLoading(true);
      setError('');
      setTxResult('');
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
      });

      const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(
        CompiledContract.withVacantWitnesses
      );

      const deployed = await deployContract(providers, {
        compiledContract,
      });

      const addr = deployed.deployTxData.public.contractAddress;
      setDeployedAddress(addr);
      setTxResult(`Successfully deployed contract! Address: ${addr}`);
    } catch (err: any) {
      console.error('Deployment error:', err);
      let errorMsg = err instanceof Error ? err.message : String(err);
      
      // Decode Effect FiberFailures
      if (err && err.id === 'FiberFailure' && err.cause) {
        if (err.cause._tag === 'Fail' && err.cause.failure) {
          const failure = err.cause.failure;
          errorMsg = `Effect Failure (${failure._tag || 'Unknown'}): ${failure.message || failure.reason || JSON.stringify(failure)}`;
        } else {
          errorMsg = `FiberFailure: ${JSON.stringify(err.cause)}`;
        }
      } else if (typeof err === 'object' && err !== null && !(err instanceof Error)) {
        try { errorMsg = JSON.stringify(err, Object.getOwnPropertyNames(err)); } catch (e) {}
      }
      
      const stack = err instanceof Error && err.stack ? `\n\nStack: ${err.stack}` : '';
      setError(errorMsg + stack);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Invokes the `add_issuer` circuit.
   * Modifies the public ledger state to authorize a new credential issuer.
   */
  const handleAddIssuer = async () => {
    if (!issuerId) {
      setError('Please provide an issuer ID (hex string)');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setTxResult('');
      const contract = await getContractInstance();
      
      const issuerBytes = fromHex(issuerId.replace(/^0x/, ''));
      if (issuerBytes.length !== 32) {
        throw new Error('Issuer ID must be 32 bytes (64 hex characters)');
      }

      const { txHash } = await contract.callTx.add_issuer(issuerBytes);
      setTxResult(`Add Issuer Tx Submitted! Hash: ${txHash}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add issuer');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Invokes the `verify_and_claim` circuit using Zero-Knowledge Proofs.
   * Proves the user holds a valid credential without revealing their secret identity.
   */
  const handleVerify = async () => {
    if (!verifyIssuer || !verifyNullifier) {
      setError('Please provide both issuer and nullifier (hex strings)');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setTxResult('');
      const contract = await getContractInstance();
      
      const issuerBytes = fromHex(verifyIssuer.replace(/^0x/, ''));
      const nullifierBytes = fromHex(verifyNullifier.replace(/^0x/, ''));
      
      if (issuerBytes.length !== 32 || nullifierBytes.length !== 32) {
        throw new Error('Inputs must be 32 bytes (64 hex characters)');
      }

      const { txHash } = await contract.callTx.verify_and_claim(issuerBytes, nullifierBytes);
      setTxResult(`Verify & Claim Tx Submitted! Hash: ${txHash}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to verify');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 overflow-hidden relative font-sans">
      {/* Background gradients */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none" 
      />

      {/* Navbar with Skiper UI Components */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.5 }} 
        className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-10 border-b border-white/5"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="text-2xl font-black tracking-tighter flex"
        >
          {"EclipseID".split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 + 0.2, type: "spring" }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 inline-block hover:scale-125 transition-transform cursor-default"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
        <div className="flex gap-8 text-sm font-medium text-slate-400">
          <Link001 href="#" className="hover:text-white transition-colors">Documentation</Link001>
          <Link002 href="#" className="hover:text-white transition-colors">Contract</Link002>
          <Link003 href="#" className="hover:text-white transition-colors">SDK</Link003>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-8 pt-20 pb-24 relative z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.1 }} 
          className="text-center mb-16 space-y-4"
        >
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight flex flex-col items-center">
            <div className="flex flex-wrap justify-center overflow-hidden">
              {"Next-gen Identity on".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "100%", opacity: 0, filter: "blur(10px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                  className="mr-4 inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <motion.span 
              initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 mt-2 block"
            >
              Midnight Network.
            </motion.span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Deploy your zero-knowledge smart contracts instantly. Verify claims without revealing underlying data using Lace wallet.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.3 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateY,
            rotateX,
            transformStyle: "preserve-3d",
          }}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative group"
        >
          <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="relative z-10 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {!wallet ? (
            <div className="flex flex-col items-center py-12 text-center relative z-10">
              <motion.div 
                animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50"
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Connect to Get Started</h2>
              <p className="text-slate-400 mb-8 max-w-sm">
                Connect your Lace wallet to deploy and interact with the EclipseID smart contract.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 30px rgba(255,255,255,0.4)", "0px 0px 0px rgba(255,255,255,0)"] }}
                transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                onClick={connectWallet}
                className="bg-white text-black font-bold py-3 px-10 rounded-full cursor-pointer"
              >
                Connect Lace Wallet
              </motion.button>
            </div>
          ) : (
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Lace Connected
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 font-mono">{address}</p>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-800/50 cursor-pointer"
                >
                  Disconnect
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Contract Status</p>
                  {!deployedAddress && (
                    <button
                      onClick={handleDeploy}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 font-semibold py-1.5 px-4 rounded-full transition-colors border border-blue-500/20 cursor-pointer"
                    >
                      {loading && <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                      {loading ? 'Deploying...' : 'Deploy Now'}
                    </button>
                  )}
                </div>
                {deployedAddress ? (
                  <div className="font-mono bg-slate-950 p-4 rounded-xl text-sm break-all text-cyan-300 border border-cyan-500/20 shadow-inner">
                    {deployedAddress}
                  </div>
                ) : (
                  <div className="bg-yellow-500/5 text-yellow-500/70 p-4 rounded-xl border border-yellow-500/10 text-sm">
                    No contract deployed. Deploy to interact with the ZK circuits.
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-200">Add Issuer</h3>
                  <input
                    type="text"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500/50 outline-none rounded-xl p-3 text-slate-100 font-mono text-sm transition-colors"
                    placeholder="Issuer ID (32-byte Hex)"
                    value={issuerId}
                    onChange={(e) => setIssuerId(e.target.value)}
                  />
                  <button
                    onClick={handleAddIssuer}
                    disabled={loading || !deployedAddress}
                    className="flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 text-white font-medium py-2.5 px-4 rounded-xl transition-colors w-full text-sm cursor-pointer"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />}
                    Submit Issuer
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-zinc-200">Verify & Claim</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500/50 outline-none rounded-xl p-3 text-slate-100 font-mono text-sm transition-colors"
                      placeholder="Issuer ID (32-byte Hex)"
                      value={verifyIssuer}
                      onChange={(e) => setVerifyIssuer(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500/50 outline-none rounded-xl p-3 text-slate-100 font-mono text-sm transition-colors"
                      placeholder="Nullifier (32-byte Hex)"
                      value={verifyNullifier}
                      onChange={(e) => setVerifyNullifier(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleVerify}
                    disabled={loading || !deployedAddress}
                    className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 disabled:opacity-30 text-white font-medium py-2.5 px-4 rounded-xl transition-opacity w-full text-sm shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Verify Identity (ZK Proof)
                  </button>
                </div>
              </div>
              </div>
            )}
          </div>
        </motion.div>

        {txResult && (
          <div className="mt-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl w-full text-center text-sm font-medium backdrop-blur-md">
            {txResult}
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl w-full text-center text-sm font-medium backdrop-blur-md">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

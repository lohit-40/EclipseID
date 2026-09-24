import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { createMidnightProviders } from '../providers';
import { Contract } from '../contract/index';
type EclipseIdContract = Contract<any, any>;
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { type EclipseIdProviders } from '../providers';
import { Shield, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MASTER_ADMIN_WALLET = import.meta.env.VITE_MASTER_ADMIN_WALLET;

export default function Admin() {
  const { wallet, address, isConnected } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [deployedAddress, setDeployedAddress] = useState<string>('');
  const [isIssuerRegistered, setIsIssuerRegistered] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/contract`)
      .then(r => r.json())
      .then(d => { if (d.contractAddress) setDeployedAddress(d.contractAddress) })
      .catch(e => console.log('No global contract deployed yet'));
  }, []);

  const getContractInstance = async (providers: EclipseIdProviders): Promise<EclipseIdContract> => {
    if (!deployedAddress) throw new Error('Contract Address not deployed');
    return new Contract(providers).at(deployedAddress);
  };

  const handleAdminDeploy = async () => {
    if (!wallet) return;
    try {
      setLoading(true); setError('');
      setLoadingStep('Generating ZK Proof & Synchronizing Ledger... (~45s on preview)');
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
      });
      const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(CompiledContract.withVacantWitnesses);
      
      const deployed = await (async () => {
        const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
        return deployContract(providers, { compiledContract });
      })();
      
      const addr = deployed.deployTxData.public.contractAddress;
      
      setLoadingStep('Registering Contract Address...');
      let discoveryMessage = 'Global Registry Updated!';
      try {
        const cfRes = await fetch(`${BACKEND_URL}/api/admin/set-contract`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Admin-Key': 'eclipse-hackathon-2026-secure-key' 
          },
          body: JSON.stringify({ contractAddress: addr })
        });
        const cfData = await cfRes.json();
        if (!cfData.success) throw new Error(cfData.error);
      } catch (cfErr: any) {
        console.error('Registry failed:', cfErr);
        discoveryMessage = `Warning: Registration failed (${cfErr.message}). Retry or set manually.`;
      }
      
      setDeployedAddress(addr);
      setError('');
      alert(`Deployment Successful! ${discoveryMessage}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Deployment failed. Make sure your wallet is unlocked.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleAdminRegisterIssuer = async () => {
    if (!wallet) return;
    try {
      setLoading(true); setError('');
      setLoadingStep('Authorizing Backend as KYC Issuer...');
      
      const req = await fetch(`${BACKEND_URL}/api/issuer/public-key`);
      const data = await req.json();
      if (!data.publicKey) throw new Error('Could not fetch issuer public key from backend');
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
      });
      const contract = await getContractInstance(providers);
      
      const tx = await contract.callTx.add_issuer(data.publicKey);
      await providers.walletProvider.submitTransaction(await providers.proofProvider.proveTx(tx));
      
      setIsIssuerRegistered(true);
      alert('Backend Issuer Successfully Authorized!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Issuer registration failed.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <div className="glass-card p-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-eclipse-violet/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-eclipse-violet" />
          </div>
          <h2 className="text-2xl font-bold text-eclipse-bright mb-2 tracking-tight">Admin Command Center</h2>
          <p className="text-eclipse-muted text-sm">Connect your wallet to verify permissions.</p>
        </div>
      </div>
    );
  }

  if (address !== MASTER_ADMIN_WALLET) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <div className="glass-card p-10 max-w-md text-center !border-eclipse-pink/20">
          <h2 className="text-2xl font-bold text-eclipse-pink mb-3 tracking-tight">Unauthorized</h2>
          <p className="text-sm font-mono text-eclipse-muted break-all bg-eclipse-void/50 p-3 rounded-xl mb-3">{address}</p>
          <p className="text-sm text-eclipse-muted">This wallet is not authorized for protocol administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-eclipse-cyan/50" />
        
        <h3 className="text-2xl font-bold text-eclipse-bright mb-1 tracking-tight">Protocol Command Center</h3>
        <p className="text-sm text-eclipse-muted mb-8">Deploy and configure the EclipseID contract infrastructure.</p>
        
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between glass-card !rounded-xl p-5 gap-4">
            <div className="flex flex-col">
              <span className="font-semibold text-eclipse-bright text-sm">Global Contract Address</span>
              <span className="font-mono text-xs text-eclipse-muted mt-1 bg-eclipse-void/50 px-2 py-1 rounded-lg inline-block">{deployedAddress || 'NOT DEPLOYED'}</span>
            </div>
            <button onClick={handleAdminDeploy} disabled={loading} className="neon-btn py-2.5 px-5 text-xs whitespace-nowrap">
              Deploy Contract
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between glass-card !rounded-xl p-5 gap-4">
            <div className="flex flex-col">
              <span className="font-semibold text-eclipse-bright text-sm">Register Backend Issuer</span>
              <span className="text-xs text-eclipse-muted mt-1">Authorizes the backend to issue credentials</span>
            </div>
            <button onClick={handleAdminRegisterIssuer} disabled={loading || !deployedAddress} className="ghost-btn py-2.5 px-5 text-xs !text-eclipse-violet !border-eclipse-violet/30 hover:!bg-eclipse-violet/10 whitespace-nowrap">
              {isIssuerRegistered ? 'REGISTERED ✓' : 'Register Issuer'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-3 p-5 glass-card !rounded-xl">
            <Loader2 className="w-5 h-5 text-eclipse-cyan animate-spin" />
            <p className="text-sm text-eclipse-text">{loadingStep}</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 text-sm text-eclipse-pink bg-eclipse-pink/10 border border-eclipse-pink/20 rounded-xl p-4 text-center">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { createMidnightProviders } from '../providers';
import { Contract } from '../contract/index';
export type EclipseIdContract = Contract<any, any>;
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { type EclipseIdProviders } from '../providers';

const BACKEND_URL = 'https://eclipse-id-backend.lohitmishra25.workers.dev';
const MASTER_ADMIN_WALLET = 'mn_addr_preprod1j26nj67vy6h0995upsdn85su3pvzqjfpyacclywcvv8e3zr4zrrqxv68xa'; // The whitelisted wallet

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
      setLoadingStep('Generating ZK Proof & Synchronizing Ledger... (This takes ~45 seconds on Preprod)');
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
      });
      const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(CompiledContract.withVacantWitnesses);
      
      // We are waiting for the deploy to complete
      const deployed = await (async () => {
        // Because we don't have access to the underlying SDK deployContract directly here without importing it
        // We'll import it dynamically or we can just assume it's imported at the top. Wait, let me import it.
        const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
        return deployContract(providers, { compiledContract });
      })();
      
      const addr = deployed.deployTxData.public.contractAddress;
      
      setLoadingStep('Registering Contract Address to Cloudflare...');
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
        console.error('Cloudflare registry failed:', cfErr);
        discoveryMessage = `Warning: Cloudflare registration failed (${cfErr.message}). Please retry deployment or set manually.`;
      }
      
      setDeployedAddress(addr);
      setError(''); // Clear error to show success
      // We'll just show a success alert or let the UI update
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
      setLoadingStep('Authorizing Cloudflare Backend as KYC Issuer...');
      
      const req = await fetch(`${BACKEND_URL}/api/issuer/public-key`);
      const data = await req.json();
      if (!data.publicKey) throw new Error('Could not fetch issuer public key from backend');
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
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

  // Web3 Auth Check
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-rose-100 mb-4">Admin Command Center</h2>
        <p className="text-rose-200/60 mb-8">Connect your wallet to verify permissions.</p>
      </div>
    );
  }

  if (address !== MASTER_ADMIN_WALLET) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-3xl max-w-md">
          <h2 className="text-2xl font-bold mb-2">Unauthorized Access</h2>
          <p className="text-sm opacity-80 font-mono break-all">{address}</p>
          <p className="mt-4 text-sm">This wallet is not whitelisted for protocol administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#120a1f] border border-rose-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-rose-600" />
        <h3 className="text-xl font-bold text-rose-100 mb-2">Protocol Command Center</h3>
        <p className="text-sm text-rose-200/60 mb-8">Deploy the foundational contract and authorize the KYC issuer.</p>
        
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
              <span className="text-xs text-rose-200/50">Authorizes the backend to issue credentials</span>
            </div>
            <button onClick={handleAdminRegisterIssuer} disabled={loading || !deployedAddress} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-4 py-2 rounded-lg font-semibold border border-rose-500/20 cursor-pointer text-sm transition-colors disabled:opacity-50">
              {isIssuerRegistered ? 'Registered' : 'Register Backend Issuer'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-white/5">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium text-rose-200/60 animate-pulse">{loadingStep}</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}

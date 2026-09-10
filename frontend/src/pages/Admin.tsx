import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { createMidnightProviders } from '../providers';
import { Contract } from '../contract/index';
export type EclipseIdContract = Contract<any, any>;
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { type EclipseIdProviders } from '../providers';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MASTER_ADMIN_WALLET = import.meta.env.VITE_MASTER_ADMIN_WALLET; // The whitelisted wallet

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
      setLoadingStep('Generating ZK Proof & Synchronizing Ledger... (This takes ~45 seconds on preview)');
      
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
      setLoadingStep('Authorizing Cloudflare Backend as KYC Issuer...');
      
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
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center font-sans">
        <h2 className="text-4xl font-black text-brutal-text mb-4 uppercase tracking-widest">Admin Command Center</h2>
        <p className="text-brutal-bg bg-brutal-orange border-4 border-brutal-text px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">Connect your wallet to verify permissions.</p>
      </div>
    );
  }

  if (address !== MASTER_ADMIN_WALLET) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center font-sans">
        <div className="bg-brutal-bg border-4 border-brutal-text p-8 shadow-[8px_8px_0px_0px_rgba(28,28,28,1)] max-w-md">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-widest text-brutal-orange">Unauthorized Access</h2>
          <p className="text-sm font-mono break-all font-bold bg-white p-2 border-2 border-brutal-text">{address}</p>
          <p className="mt-4 text-base font-bold">This wallet is not whitelisted for protocol administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 font-sans px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border-4 border-brutal-text p-8 relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(28,28,28,1)]">
        <div className="absolute top-0 left-0 w-full h-2 bg-brutal-orange" />
        <h3 className="text-3xl font-black text-brutal-text mb-2 uppercase tracking-widest">Protocol Command Center</h3>
        <p className="text-base text-brutal-text mb-8 font-bold">Deploy the foundational contract and authorize the KYC issuer.</p>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-brutal-bg p-6 border-4 border-brutal-text shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] gap-4">
            <div className="flex flex-col">
              <span className="font-black text-lg uppercase">Global Contract Address</span>
              <span className="font-mono text-sm font-bold bg-white px-2 py-1 border-2 border-brutal-text mt-2">{deployedAddress || 'NOT DEPLOYED'}</span>
            </div>
            <button onClick={handleAdminDeploy} disabled={loading} className="brutal-btn py-3 px-6 text-sm shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] whitespace-nowrap">
              Deploy Global Contract
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-brutal-bg p-6 border-4 border-brutal-text shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] gap-4">
            <div className="flex flex-col">
              <span className="font-black text-lg uppercase">Register Backend Issuer</span>
              <span className="text-sm font-bold mt-2">Authorizes the backend to issue credentials</span>
            </div>
            <button onClick={handleAdminRegisterIssuer} disabled={loading || !deployedAddress} className="brutal-btn py-3 px-6 text-sm shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] whitespace-nowrap bg-brutal-text text-white hover:bg-brutal-orange hover:text-brutal-text">
              {isIssuerRegistered ? 'REGISTERED' : 'REGISTER BACKEND ISSUER'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white border-4 border-brutal-text shadow-[4px_4px_0px_0px_rgba(255,69,34,1)]">
            <div className="w-8 h-8 border-4 border-brutal-orange border-t-brutal-text animate-spin mb-4" />
            <p className="text-base font-black text-brutal-text animate-pulse uppercase tracking-widest text-center">{loadingStep}</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 bg-brutal-orange border-4 border-brutal-text text-white p-6 text-center text-lg font-black uppercase shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}

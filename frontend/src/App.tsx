import { useState, useEffect } from 'react';
import { type WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createMidnightProviders } from './providers';
import { Contract } from './contract/index.js';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
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

  const connectWallet = async () => {
    try {
      setError('');
      const midnight = (window as any).midnight;
      if (!midnight) {
        throw new Error('Midnight provider not found. Please install a compatible wallet extension like Lace.');
      }

      // Dynamically find any available provider (like 1am/Night Wallet or Lace)
      const keys = Object.keys(midnight);
      
      // Grab the first valid provider we find
      let providerKey = keys.find(key => midnight[key] && typeof midnight[key].enable === 'function');
      if (!providerKey) providerKey = keys[0];

      const provider = midnight[providerKey];
      if (!provider) {
        throw new Error(`No valid wallet provider found in window.midnight. Available keys: ${keys.join(', ')}`);
      }

      // Enable the provider to connect the wallet
      const walletApi = await (provider.enable ? provider.enable() : provider.connect());
      setWallet(walletApi);
      
      const unshieldedAddr = await walletApi.getUnshieldedAddress();
      setAddress(unshieldedAddr);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect Lace wallet');
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setAddress('');
  };

  const [deployedAddress, setDeployedAddress] = useState<string>(CONTRACT_ADDRESS);

  const getContractInstance = async () => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!deployedAddress) throw new Error('Contract address not set in environment (VITE_CONTRACT_ADDRESS) or deployed yet');

    const providers = await createMidnightProviders(wallet, {
      indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
      indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    });

    const compiledContract = CompiledContract.make('EclipseIdContract', Contract).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets('') // Will fetch .zkir, .pk, .vk from public directory
    );

    return findDeployedContract(providers, {
      contractAddress: deployedAddress,
      compiledContract,
      privateStateKey: 'eclipse-id-private-state',
    });
  };

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
        CompiledContract.withVacantWitnesses,
        CompiledContract.withCompiledFileAssets('')
      );

      const deployed = await deployContract(providers, {
        privateStateId: 'eclipse-id-private-state',
        initialPrivateState: {},
        compiledContract,
      });

      const addr = deployed.deployTxData.public.contractAddress;
      setDeployedAddress(addr);
      setTxResult(`Successfully deployed contract! Address: ${addr}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to deploy contract');
    } finally {
      setLoading(false);
    }
  };

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

      // Execute circuit
      const { txHash } = await contract.callTx.add_issuer(issuerBytes);
      setTxResult(`Add Issuer Tx Submitted! Hash: ${txHash}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add issuer');
    } finally {
      setLoading(false);
    }
  };

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

      // Execute circuit
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
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Midnight EclipseID</h1>
      
      {!wallet ? (
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
          >
            Connect Midnight Wallet
          </button>
          <div className="mt-4 text-sm text-gray-400 bg-gray-800 p-4 rounded border border-gray-700 w-full max-w-2xl text-center">
            <p>Debug Info: Available Midnight Providers:</p>
            <pre className="mt-2 text-green-400 font-mono text-left">
              {JSON.stringify((window as any).midnight ? Object.keys((window as any).midnight) : 'window.midnight is undefined', null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-green-400">Lace Wallet Connected</h2>
            <button 
              onClick={disconnectWallet}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Disconnect
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Your Address</p>
            <p className="font-mono bg-gray-900 p-3 rounded text-sm break-all text-blue-300">
              {address}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Contract Address</p>
            {deployedAddress ? (
              <p className="font-mono bg-gray-900 p-3 rounded text-sm break-all text-purple-300 border border-purple-500/30">
                {deployedAddress}
              </p>
            ) : (
              <div className="bg-gray-900 p-4 rounded border border-yellow-500/30 flex justify-between items-center">
                <span className="text-yellow-400 text-sm">No contract deployed yet.</span>
                <button
                  onClick={handleDeploy}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                >
                  {loading ? 'Deploying...' : 'Deploy Contract to Preprod'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-8">
            {/* Add Issuer Section */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Add Issuer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Issuer ID (32-byte Hex)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono"
                    placeholder="e.g. 0123456789abcdef..."
                    value={issuerId}
                    onChange={(e) => setIssuerId(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAddIssuer}
                  disabled={loading || !deployedAddress}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors w-full"
                >
                  {loading ? 'Processing...' : 'Submit Add Issuer'}
                </button>
              </div>
            </div>

            {/* Verify Section */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-green-400">Verify Identity & Claim Nullifier</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Issuer ID (32-byte Hex)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono"
                    placeholder="e.g. 0123456789abcdef..."
                    value={verifyIssuer}
                    onChange={(e) => setVerifyIssuer(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nullifier (32-byte Hex)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono"
                    placeholder="e.g. 0123456789abcdef..."
                    value={verifyNullifier}
                    onChange={(e) => setVerifyNullifier(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleVerify}
                  disabled={loading || !deployedAddress}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors w-full"
                >
                  {loading ? 'Processing...' : 'Submit Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {txResult && (
        <div className="mt-6 bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg w-full max-w-2xl text-center">
          {txResult}
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg w-full max-w-2xl text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;

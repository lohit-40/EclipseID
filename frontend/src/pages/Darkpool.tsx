import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { createMidnightProviders } from '../providers';
import { Contract } from '../contract/index';
export type EclipseIdContract = Contract<any, any>;
import { type EclipseIdProviders } from '../providers';
import { ShieldCheck, Lock, Terminal, Activity, CheckCircle2 } from 'lucide-react';
import ScrambleText from '../components/ScrambleText';
import { playSound } from '../utils/sounds';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const hexToBytes = (hex: string) => {
  return new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
};

export default function Darkpool() {
  const { wallet, address, isConnected } = useWallet();
  const [email, setEmail] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [txResult, setTxResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.terminal-window', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, { scope: container });

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`]);
  };

  const getContractAddress = async (): Promise<string> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/contract`);
      const data = await res.json();
      if (data.contractAddress) return data.contractAddress;
      throw new Error('Contract Address not found');
    } catch (err) {
      throw new Error('Smart Contract is not configured. Wait for admin deployment.');
    }
  };

  const getContractInstance = async (providers: EclipseIdProviders): Promise<EclipseIdContract> => {
    const contractAddress = await getContractAddress();
    return new Contract(providers).at(contractAddress);
  };

  const handleVerify = async () => {
    if (!wallet || !email) return;
    try {
      playSound('scan');
      setLoading(true); setError(''); setTxResult(''); setLogs([]);
      
      const step1 = 'Generating Confidential ID via Issuer...';
      setLoadingStep(step1); addLog(step1);
      const req = await fetch(`${BACKEND_URL}/api/issuer/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await req.json();
      if (!data.success) throw new Error(data.error);
      playSound('success');
      
      const { secret_identity } = data;
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
      });
      
      const step2 = 'Securing ID & Attributes in Local Shielded Vault...';
      setLoadingStep(step2); addLog(step2);
      playSound('scan');
      
      const issuerReq = await fetch(`${BACKEND_URL}/api/issuer/public-key`);
      const issuerData = await issuerReq.json();
      
      const userAttributes = {
        secret_id: BigInt(secret_identity),
        issuer_pk: hexToBytes(issuerData.publicKey),
        is_accredited: true,
        age: 25n 
      };
      await providers.privateStateProvider.set('user_credential', userAttributes);
      
      addLog('Attributes Shielded Locally (Age: 25, Accredited: true).');
      playSound('success');
      
      setIsVerified(true);
      setTxResult('Successfully Verified Off-Chain! Your full KYC attributes are shielded locally.');
    } catch (err: any) {
      playSound('error');
      console.error(err);
      setError(err.message || 'Verification failed. Make sure your Lace wallet is unlocked.');
      addLog(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleEnterDarkpool = async () => {
    if (!wallet) return;
    try {
      playSound('scan');
      setLoading(true); setError(''); setTxResult(''); setLogs([]);
      
      const step1 = 'Generating ZK Proof of Accreditation & Age...';
      setLoadingStep(step1); addLog(step1);
      
      const providers = await createMidnightProviders(wallet, {
        indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
      });
      
      const contract = await getContractInstance(providers);
      
      addLog('Fetching Authorized Issuer...');
      const req = await fetch(`${BACKEND_URL}/api/issuer/public-key`);
      const data = await req.json();
      if (!data.publicKey) throw new Error('Could not fetch issuer public key');
      playSound('success');

      addLog('Proving: is_accredited == true && age >= 18');
      playSound('scan');
      
      // Call the Selective Disclosure circuit
      const tx = await contract.callTx.verify_and_claim(hexToBytes(data.publicKey), 18n, true);
      
      const step2 = 'Submitting ZK Proof to Blockchain...';
      setLoadingStep(step2); addLog(step2);
      await providers.walletProvider.submitTransaction(await providers.proofProvider.proveTx(tx));
      
      playSound('success');
      setTxResult('ACCESS GRANTED. You have anonymously entered the Darkpool.');
      addLog('Transaction confirmed. ZK Proof validated on-chain.');
      setHasAccess(true);
    } catch (err: any) {
      playSound('error');
      console.error(err);
      setError(err.message || 'Access Denied. Proof generation failed.');
      addLog(`ACCESS DENIED: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-4 text-center font-mono">
        <Lock className="w-16 h-16 text-vibe-accent mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
        <h2 className="text-3xl font-black text-vibe-primary mb-4 tracking-widest">ENCRYPTED_SECTOR</h2>
        <p className="text-vibe-accent/60 mb-8 border border-vibe-dark/50 bg-[#0a0014] px-6 py-3">CONNECTION REQUIRED FOR ZK_AUTH</p>
      </div>
    );
  }

  return (
    <div ref={container} className="max-w-4xl mx-auto mt-12 px-4 font-mono">
      <div className="terminal-window bg-[#0a0014] rounded-none border border-vibe-accent/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
        {/* Hacker Terminal Header */}
        <div className="bg-vibe-dark/20 border-b border-vibe-accent/30 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-vibe-accent text-sm tracking-widest font-bold">
            <Terminal size={16} />
            <span>ZK_AUTH_TERMINAL_V1.0</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-vibe-accent/20 border border-vibe-accent/50" />
            <div className="w-3 h-3 rounded-full bg-vibe-accent/20 border border-vibe-accent/50" />
            <div className="w-3 h-3 rounded-full bg-vibe-accent animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 border-l-2 border-vibe-accent pl-4 py-2">
             <h2 className="text-2xl font-black text-vibe-primary mb-2 uppercase tracking-widest"><ScrambleText text="Authentication Protocol" delayMs={100} /></h2>
             <p className="text-vibe-accent/70 text-sm">Execute local KYC shielding and generate zero-knowledge proof of compliance to access the Darkpool.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Action Panel */}
            <div className="space-y-8">
              {/* Step 1 */}
              <div className={`p-6 border transition-all ${isVerified ? 'bg-vibe-dark/10 border-vibe-accent/20' : 'bg-[#030008] border-vibe-accent/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-vibe-secondary flex items-center gap-2">
                    <span className="text-xs bg-vibe-accent/20 px-2 py-1 text-vibe-primary">STEP_01</span>
                    Local KYC Shield
                  </h3>
                  {isVerified && <CheckCircle2 className="text-vibe-accent w-5 h-5" />}
                </div>
                
                {!isVerified ? (
                  <>
                    <p className="text-sm text-vibe-accent/60 mb-4">Simulate KYC API to fetch and shield attributes locally.</p>
                    <input
                      type="email"
                      placeholder="ENTER_EMAIL_ADDRESS"
                      className="w-full bg-black border border-vibe-accent/30 rounded-none px-4 py-3 text-vibe-secondary focus:outline-none focus:border-vibe-primary focus:shadow-[0_0_10px_rgba(16,185,129,0.3)] placeholder:text-vibe-dark/50 mb-4 font-mono transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      onClick={handleVerify}
                      disabled={loading || !email}
                      className="w-full bg-vibe-accent/10 border border-vibe-accent text-vibe-primary font-bold py-3 hover:bg-vibe-accent hover:text-black transition-all disabled:opacity-50 tracking-widest flex items-center justify-center gap-2 group"
                    >
                      <ShieldCheck className="group-hover:animate-pulse" size={18} />
                      EXECUTE_SHIELDING
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-vibe-primary">KYC attributes successfully shielded in local Midnight vault.</p>
                )}
              </div>

              {/* Step 2 */}
              <div className={`p-6 border transition-all ${!isVerified ? 'opacity-50 border-vibe-dark/30' : 'bg-[#030008] border-vibe-accent/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'} ${hasAccess ? 'border-vibe-accent shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-vibe-secondary flex items-center gap-2">
                    <span className="text-xs bg-vibe-accent/20 px-2 py-1 text-vibe-primary">STEP_02</span>
                    ZK Compliance Proof
                  </h3>
                  {hasAccess && <CheckCircle2 className="text-vibe-accent w-5 h-5" />}
                </div>
                
                <p className="text-sm text-vibe-accent/60 mb-4">Prove `age &gt;= 18` and `is_accredited == true` via ZK circuit.</p>
                <button
                  onClick={handleEnterDarkpool}
                  disabled={loading || !isVerified || hasAccess}
                  className="w-full bg-vibe-accent/10 border border-vibe-accent text-vibe-primary font-bold py-3 hover:bg-vibe-accent hover:text-black transition-all disabled:opacity-50 tracking-widest flex items-center justify-center gap-2 group"
                >
                  <Activity className="group-hover:animate-pulse" size={18} />
                  GENERATE_PROOF
                </button>
              </div>
            </div>

            {/* Terminal Output Panel */}
            <div className="bg-black border border-vibe-dark/50 p-4 font-mono text-xs flex flex-col relative h-[400px]">
              <div className="absolute top-0 right-0 bg-vibe-dark/30 px-2 py-1 text-vibe-accent border-b border-l border-vibe-dark/50">OUTPUT_LOG</div>
              <div className="flex-1 overflow-y-auto space-y-2 mt-6 pr-2 custom-scrollbar">
                <div className="text-vibe-accent/40">SYSTEM READY. AWAITING COMMANDS...</div>
                {logs.map((log, i) => (
                  <div key={i} className={log.includes('ERROR') || log.includes('DENIED') ? 'text-rose-500' : 'text-vibe-primary'}>
                    <ScrambleText text={log} delayMs={0} />
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center gap-2 text-vibe-secondary mt-4">
                    <span className="animate-pulse">_</span>
                    <ScrambleText text={loadingStep} delayMs={50} />
                  </div>
                )}
                
                {error && (
                  <div className="text-rose-500 border-l-2 border-rose-500 pl-2 mt-4 bg-rose-500/10 py-2">
                    <ScrambleText text={error} />
                  </div>
                )}
                
                {txResult && (
                  <div className="text-vibe-secondary border-l-2 border-vibe-accent pl-2 mt-4 bg-vibe-accent/10 py-2 font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <ScrambleText text={txResult} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
        }
      `}</style>
    </div>
  );
}

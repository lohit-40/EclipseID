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
      <div className="flex flex-col items-center justify-center pt-32 px-4 text-center font-sans">
        <Lock className="w-24 h-24 text-brutal-text mb-6 drop-shadow-[4px_4px_0px_rgba(255,69,34,1)]" />
        <h2 className="text-4xl font-black text-brutal-text mb-4 tracking-widest uppercase">ENCRYPTED SECTOR</h2>
        <p className="text-brutal-bg mb-8 border-4 border-brutal-text bg-brutal-orange px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">CONNECTION REQUIRED FOR ZK_AUTH</p>
      </div>
    );
  }

  return (
    <div ref={container} className="max-w-5xl mx-auto mt-12 px-4 font-sans">
      <div className="terminal-window bg-white rounded-none border-4 border-brutal-text shadow-[8px_8px_0px_0px_rgba(28,28,28,1)] relative overflow-hidden">
        {/* Hacker Terminal Header */}
        <div className="bg-brutal-bg border-b-4 border-brutal-text p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-brutal-text text-sm tracking-widest font-bold">
            <Terminal size={16} />
            <span>ZK_AUTH_TERMINAL_V1.0</span>
          </div>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-none bg-brutal-bg border-2 border-brutal-text" />
            <div className="w-4 h-4 rounded-none bg-brutal-bg border-2 border-brutal-text" />
            <div className="w-4 h-4 rounded-none bg-brutal-orange border-2 border-brutal-text" />
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8 border-l-4 border-brutal-orange pl-4 py-2 bg-brutal-bg shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
             <h2 className="text-3xl font-black text-brutal-text mb-2 uppercase tracking-widest"><ScrambleText text="Authentication Protocol" delayMs={100} /></h2>
             <p className="text-brutal-text font-bold text-sm uppercase">Execute local KYC shielding and generate zero-knowledge proof of compliance to access the Darkpool.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Action Panel */}
            <div className="space-y-8">
              {/* Step 1 */}
              <div className={`p-6 border-4 transition-all bg-white shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] ${isVerified ? 'border-brutal-orange bg-brutal-bg' : 'border-brutal-text'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-brutal-text flex items-center gap-2 text-xl">
                    <span className="text-sm bg-brutal-text px-2 py-1 text-brutal-bg uppercase">STEP 01</span>
                    Local KYC Shield
                  </h3>
                  {isVerified && <CheckCircle2 className="text-brutal-orange w-8 h-8" />}
                </div>
                
                {!isVerified ? (
                  <>
                    <p className="text-sm text-brutal-text font-bold mb-4 uppercase">Simulate KYC API to fetch and shield attributes locally.</p>
                    <input
                      type="email"
                      placeholder="ENTER_EMAIL_ADDRESS"
                      className="brutal-input mb-4 font-sans text-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                      onClick={handleVerify}
                      disabled={loading || !email}
                      className="w-full bg-brutal-orange border-4 border-brutal-text text-brutal-bg font-black py-4 hover:bg-brutal-text hover:text-white transition-all disabled:opacity-50 tracking-widest flex items-center justify-center gap-2 group text-lg shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] uppercase"
                    >
                      <ShieldCheck className="group-hover:translate-x-1 transition-transform" size={24} />
                      EXECUTE SHIELDING
                    </button>
                  </>
                ) : (
                  <p className="text-base text-brutal-text font-bold p-4 bg-white border-2 border-brutal-text shadow-[2px_2px_0px_0px_rgba(28,28,28,1)]">KYC attributes successfully shielded in local Midnight vault.</p>
                )}
              </div>

              {/* Step 2 */}
              <div className={`p-6 border-4 transition-all bg-white shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] ${!isVerified ? 'opacity-50 border-brutal-text/30 shadow-none' : 'border-brutal-text'} ${hasAccess ? 'border-brutal-orange bg-brutal-bg' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-brutal-text flex items-center gap-2 text-xl">
                    <span className="text-sm bg-brutal-text px-2 py-1 text-brutal-bg uppercase">STEP 02</span>
                    ZK Compliance Proof
                  </h3>
                  {hasAccess && <CheckCircle2 className="text-brutal-orange w-8 h-8" />}
                </div>
                
                <p className="text-sm text-brutal-text font-bold mb-4 uppercase">Prove `age &gt;= 18` and `is_accredited == true` via ZK circuit.</p>
                <button
                  onClick={handleEnterDarkpool}
                  disabled={loading || !isVerified || hasAccess}
                  className="w-full bg-brutal-text border-4 border-brutal-text text-brutal-bg font-black py-4 hover:bg-brutal-orange hover:text-brutal-text transition-all disabled:opacity-50 tracking-widest flex items-center justify-center gap-2 group text-lg shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] uppercase"
                >
                  <Activity className="group-hover:translate-x-1 transition-transform" size={24} />
                  GENERATE PROOF
                </button>
              </div>
            </div>

            {/* Terminal Output Panel */}
            <div className="bg-brutal-bg border-4 border-brutal-text p-6 font-mono text-sm flex flex-col relative h-[450px] shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]">
              <div className="absolute top-0 right-0 bg-brutal-text px-4 py-2 text-white font-bold tracking-widest uppercase">OUTPUT LOG</div>
              <div className="flex-1 overflow-y-auto space-y-4 mt-8 pr-4 custom-scrollbar font-bold">
                <div className="text-brutal-text">SYSTEM READY. AWAITING COMMANDS...</div>
                {logs.map((log, i) => (
                  <div key={i} className={log.includes('ERROR') || log.includes('DENIED') ? 'text-white bg-brutal-orange px-2 py-1 border-2 border-brutal-text' : 'text-brutal-text border-l-4 border-brutal-text pl-2'}>
                    <ScrambleText text={log} delayMs={0} />
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center gap-2 text-brutal-text mt-4">
                    <span className="animate-pulse font-black text-xl">_</span>
                    <ScrambleText text={loadingStep} delayMs={50} />
                  </div>
                )}
                
                {error && (
                  <div className="text-white border-4 border-brutal-text pl-4 mt-4 bg-brutal-orange py-4 font-black text-base shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
                    <ScrambleText text={error} />
                  </div>
                )}
                
                {txResult && (
                  <div className="text-brutal-text border-4 border-brutal-text pl-4 mt-4 bg-white py-4 font-black shadow-[4px_4px_0px_0px_rgba(255,69,34,1)] text-base">
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
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F2F0EB;
          border-left: 2px solid #1C1C1C;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1C1C1C;
        }
      `}</style>
    </div>
  );
}

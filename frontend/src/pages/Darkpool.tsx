import { useState, useRef } from 'react';
import { useWallet } from '../WalletContext';
import { createMidnightProviders } from '../providers';
import { Contract } from '../contract/index';
type EclipseIdContract = Contract<any, any>;
import { type EclipseIdProviders } from '../providers';
import { ShieldCheck, Lock, Activity, CheckCircle2, Terminal, ChevronRight } from 'lucide-react';
import ScrambleText from '../components/ScrambleText';
import { playSound } from '../utils/sounds';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const hexToBytes = (hex: string) => {
  return new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
};

export default function Darkpool() {
  const { wallet, address, isConnected } = useWallet();
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<string>('25');
  const [isAccredited, setIsAccredited] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [txResult, setTxResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.terminal-panel', {
      y: 30,
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
        is_accredited: isAccredited,
        age: BigInt(age || 0) 
      };
      await providers.privateStateProvider.set('user_credential', userAttributes);
      
      addLog(`Attributes Shielded Locally (Age: ${age}, Accredited: ${isAccredited}).`);
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
      setLoading(true); setError(''); setTxResult('');
      
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
      <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-eclipse-violet/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-eclipse-violet" />
          </div>
          <h2 className="text-2xl font-bold text-eclipse-bright mb-3 tracking-tight">Encrypted Sector</h2>
          <p className="text-eclipse-muted text-sm mb-6">Connect your Midnight wallet to access the ZK Authentication Terminal</p>
          <div className="px-4 py-2 rounded-full bg-eclipse-violet/10 border border-eclipse-violet/20 text-eclipse-violet text-xs font-semibold inline-block">
            CONNECTION REQUIRED
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={container} className="max-w-6xl mx-auto mt-8 px-4">
      <div className="terminal-panel glass-card overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 text-eclipse-muted text-sm font-mono">
            <Terminal size={16} className="text-eclipse-cyan" />
            <span>ZK_AUTH_TERMINAL</span>
            <span className="text-eclipse-cyan/40">v2.0</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-eclipse-pink/60" />
            <div className="w-3 h-3 rounded-full bg-eclipse-amber/60" />
            <div className="w-3 h-3 rounded-full bg-eclipse-green/60" />
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-eclipse-bright mb-2 tracking-tight">
              <ScrambleText text="Authentication Protocol" delayMs={100} />
            </h2>
            <p className="text-eclipse-muted text-sm">Execute local KYC shielding and generate zero-knowledge proof of compliance.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Panel */}
            <div className="space-y-5">
              {/* Step 1 */}
              <div className={`glass-card p-6 transition-all ${isVerified ? '!border-eclipse-green/30' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-eclipse-bright flex items-center gap-3 text-lg">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-eclipse-cyan/10 text-eclipse-cyan font-mono">01</span>
                    Local KYC Shield
                  </h3>
                  {isVerified && <CheckCircle2 className="text-eclipse-green w-6 h-6" />}
                </div>
                
                {!isVerified ? (
                  <>
                    <p className="text-sm text-eclipse-muted mb-4">Simulate KYC API to fetch and shield attributes locally.</p>
                    <div className="flex flex-col gap-3 mb-5">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="glass-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="number"
                          placeholder="Age"
                          className="glass-input sm:w-1/3"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <label className="flex items-center gap-3 cursor-pointer glass-input flex-1 select-none !py-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-eclipse-cyan cursor-pointer rounded"
                            checked={isAccredited}
                            onChange={(e) => setIsAccredited(e.target.checked)}
                          />
                          <span className="text-sm text-eclipse-text">Accredited Investor</span>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleVerify}
                      disabled={loading || !email}
                      className="w-full neon-btn py-3.5 text-sm"
                    >
                      <ShieldCheck size={18} />
                      Execute Shielding
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-eclipse-green/5 border border-eclipse-green/10">
                    <CheckCircle2 className="text-eclipse-green w-5 h-5 shrink-0" />
                    <p className="text-sm text-eclipse-green">KYC attributes successfully shielded in local vault.</p>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className={`glass-card p-6 transition-all ${!isVerified ? 'opacity-40 pointer-events-none' : ''} ${hasAccess ? '!border-eclipse-green/30' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-eclipse-bright flex items-center gap-3 text-lg">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-eclipse-violet/10 text-eclipse-violet font-mono">02</span>
                    ZK Compliance Proof
                  </h3>
                  {hasAccess && <CheckCircle2 className="text-eclipse-green w-6 h-6" />}
                </div>
                
                <p className="text-sm text-eclipse-muted mb-4">Prove <code className="text-eclipse-cyan text-xs bg-eclipse-cyan/5 px-1.5 py-0.5 rounded">age ≥ 18</code> and <code className="text-eclipse-violet text-xs bg-eclipse-violet/5 px-1.5 py-0.5 rounded">is_accredited</code> via ZK circuit.</p>
                <button
                  onClick={handleEnterDarkpool}
                  disabled={loading || !isVerified || hasAccess}
                  className="w-full ghost-btn py-3.5 text-sm !text-eclipse-violet !border-eclipse-violet/30 hover:!bg-eclipse-violet/10 hover:!border-eclipse-violet/60"
                >
                  <Activity size={18} />
                  Generate Proof
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Terminal Output Panel */}
            <div className="terminal-glass p-5 flex flex-col h-[450px]">
              <div className="flex items-center gap-2 mb-4 text-xs text-eclipse-muted font-mono">
                <div className="w-2 h-2 rounded-full bg-eclipse-cyan/50 animate-pulse" />
                OUTPUT LOG
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-xs">
                <div className="text-eclipse-muted/60">$ awaiting commands...</div>
                {logs.map((log, i) => (
                  <div key={i} className={log.includes('ERROR') || log.includes('DENIED') ? 'text-eclipse-pink bg-eclipse-pink/10 px-3 py-2 rounded-lg border border-eclipse-pink/20' : 'text-eclipse-text pl-3 border-l-2 border-eclipse-cyan/20 py-1'}>
                    <ScrambleText text={log} delayMs={0} />
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-center gap-2 text-eclipse-cyan mt-2">
                    <span className="animate-pulse text-lg">▊</span>
                    <ScrambleText text={loadingStep} delayMs={50} />
                  </div>
                )}
                
                {error && (
                  <div className="text-eclipse-pink border border-eclipse-pink/20 bg-eclipse-pink/10 rounded-xl px-4 py-3 mt-2">
                    <ScrambleText text={error} />
                  </div>
                )}
                
                {txResult && (
                  <div className="text-eclipse-green border border-eclipse-green/20 bg-eclipse-green/10 rounded-xl px-4 py-3 mt-2 font-semibold">
                    <ScrambleText text={txResult} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

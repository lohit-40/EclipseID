import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Moon, Fingerprint } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center pt-20 px-4 text-center max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="mb-12 flex flex-col items-center">
        <motion.div 
          className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-6"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Moon className="absolute inset-0 text-cyan-500 w-full h-full fill-cyan-500/20 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" strokeWidth={1.5} />
          <Fingerprint className="absolute inset-0 text-white w-full h-full scale-[0.65] drop-shadow-lg" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 pb-4">
          EclipseID
        </h1>
        <p className="text-xl md:text-3xl text-rose-100/90 font-medium mt-4">
          Zero-Knowledge Identity for Confidential DeFi
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-rose-200/60 leading-relaxed mb-12">
        <p className="mb-4">
          KYC requirements shouldn't mean permanently linking your real-world identity to a public ledger. 
          The current model of Web3 identity is fundamentally broken, exposing user privacy to anyone with an internet connection.
        </p>
        <p>
          EclipseID acts as the ultimate cryptographic shield between centralized KYC providers and decentralized applications. 
          Using Midnight's Zero-Knowledge technology, prove you are an accredited investor without ever revealing who you actually are.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-6">
        <Link to="/darkpool" className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold text-lg shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
          Enter the Darkpool
        </Link>
        <Link to="/developers" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-rose-100 font-bold text-lg hover:bg-white/10 transition-colors">
          View Documentation
        </Link>
      </motion.div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
        <div className="bg-[#070410]/50 p-6 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4 text-xl">1</div>
          <h3 className="text-xl font-bold text-rose-100 mb-2">Off-chain Issuance</h3>
          <p className="text-sm text-rose-200/60">Complete traditional KYC. Our authorized backend issues a cryptographic credential directly to your shielded wallet.</p>
        </div>
        <div className="bg-[#070410]/50 p-6 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 mb-4 text-xl">2</div>
          <h3 className="text-xl font-bold text-rose-100 mb-2">Zero-Knowledge Proof</h3>
          <p className="text-sm text-rose-200/60">Generate a local ZK proof that you possess a valid credential, without exposing the credential data to the network.</p>
        </div>
        <div className="bg-[#070410]/50 p-6 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 text-xl">3</div>
          <h3 className="text-xl font-bold text-rose-100 mb-2">Confidential Access</h3>
          <p className="text-sm text-rose-200/60">Access regulated DeFi darkpools anonymously. The smart contract mathematically verifies the proof, preserving total privacy.</p>
        </div>
      </div>
    </div>
  );
}

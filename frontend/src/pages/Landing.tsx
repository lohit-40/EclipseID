import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal, ShieldAlert, Fingerprint, LockKeyhole } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrambleText from '../components/ScrambleText';
import { playSound } from '../utils/sounds';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export default function Landing() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial glitch/entry animation
    gsap.from('.glitch-item', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power4.out",
      delay: 0.2
    });

    // Scroll triggered card animations
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-container',
        start: 'top 80%',
      },
      y: 40,
      opacity: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(1.7)"
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col items-center justify-center pt-24 px-4 text-center max-w-5xl mx-auto font-mono">
      <div className="mb-16 flex flex-col items-center w-full">
        <motion.div 
          className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center mb-8 glitch-item"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          onMouseEnter={() => playSound('scan')}
        >
          <div className="absolute inset-0 bg-vibe-accent/10 rounded-full blur-3xl animate-pulse" />
          <Fingerprint className="absolute inset-0 text-vibe-accent w-full h-full drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] opacity-20" strokeWidth={0.5} />
          <LockKeyhole className="absolute inset-0 text-vibe-secondary w-full h-full scale-[0.4] z-10 drop-shadow-2xl" strokeWidth={1} />
        </motion.div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-vibe-secondary via-vibe-primary to-teal-700 pb-4 glitch-item drop-shadow-[0_0_25px_rgba(16,185,129,0.3)] uppercase">
          <ScrambleText text="SYSTEM.ECLIPSE_ID" delayMs={300} />
        </h1>
        <p className="text-xl md:text-2xl text-vibe-primary font-bold mt-4 tracking-widest uppercase glitch-item bg-black/50 px-6 py-2 border border-vibe-accent/30">
          <ScrambleText text="[ Zero-Knowledge Identity Protocol ]" delayMs={600} />
        </p>
      </div>

      <div className="text-lg md:text-xl text-white/90/70 leading-relaxed mb-16 max-w-3xl glitch-item text-left border-l-4 border-vibe-accent pl-6 bg-vibe-dark/10 py-4 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
        <p className="mb-4">
          &gt; WARNING: Current Web3 identity vectors are compromised. Linking real-world PII to public ledgers creates systemic privacy failure.
        </p>
        <p>
          &gt; SOLUTION: EclipseID deploys a cryptographic shield between KYC providers and decentralized infrastructure. Prove strict compliance parameters (Age, Accreditation) using Midnight Network ZK-SNARKs. <span className="text-vibe-primary font-bold">Zero data leakage. Total anonymity.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 glitch-item w-full sm:w-auto">
        <Link 
          to="/darkpool" 
          onMouseEnter={() => playSound('scan')}
          className="relative group px-10 py-5 bg-transparent border-2 border-vibe-accent text-vibe-primary font-black tracking-widest text-lg overflow-hidden hover:text-black transition-colors"
        >
          <div className="absolute inset-0 bg-vibe-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
          <span className="relative z-10 flex items-center gap-3">
            <ShieldAlert size={24} />
            ENTER_DARKPOOL
          </span>
        </Link>
        <Link 
          to="/developers" 
          onMouseEnter={() => playSound('scan')}
          className="px-10 py-5 bg-[#030008] border border-vibe-dark/50 text-vibe-accent font-bold tracking-widest text-lg hover:bg-vibe-dark/20 hover:border-vibe-accent/50 transition-all shadow-[0_0_15px_rgba(16,185,129,0)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center gap-3"
        >
          <Terminal size={24} />
          VIEW_DOCS
        </Link>
      </div>

      <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full features-container mb-32">
        <div className="feature-card bg-[#0a0014] p-8 border border-vibe-dark/50 hover:border-vibe-accent/50 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vibe-dark to-vibe-accent" />
          <div className="text-vibe-accent font-black text-4xl opacity-20 absolute -right-2 -top-2 group-hover:scale-110 transition-transform font-mono">01</div>
          <h3 className="text-xl font-bold text-vibe-secondary mb-4 tracking-widest uppercase">Off-chain Issuance</h3>
          <p className="text-sm text-white/90/60 leading-relaxed font-mono">Execute traditional KYC vectors. Authorized nodes issue a secure cryptographic credential directly into your local shielded vault. No public broadcast.</p>
        </div>
        <div className="feature-card bg-[#0a0014] p-8 border border-vibe-dark/50 hover:border-vibe-accent/50 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vibe-dark to-vibe-accent" />
          <div className="text-vibe-accent font-black text-4xl opacity-20 absolute -right-2 -top-2 group-hover:scale-110 transition-transform font-mono">02</div>
          <h3 className="text-xl font-bold text-vibe-secondary mb-4 tracking-widest uppercase">ZK Circuit Proof</h3>
          <p className="text-sm text-white/90/60 leading-relaxed font-mono">Synthesize a local Zero-Knowledge proof confirming credential validity and required attributes (e.g. age &gt;= 18) without exposing underlying values.</p>
        </div>
        <div className="feature-card bg-[#0a0014] p-8 border border-vibe-dark/50 hover:border-vibe-accent/50 transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vibe-dark to-vibe-accent" />
          <div className="text-vibe-accent font-black text-4xl opacity-20 absolute -right-2 -top-2 group-hover:scale-110 transition-transform font-mono">03</div>
          <h3 className="text-xl font-bold text-vibe-secondary mb-4 tracking-widest uppercase">Confidential Access</h3>
          <p className="text-sm text-white/90/60 leading-relaxed font-mono">Infiltrate regulated DeFi darkpools entirely anonymously. The smart contract verifies the ZK mathematical footprint. Privacy preserved.</p>
        </div>
      </div>
    </div>
  );
}

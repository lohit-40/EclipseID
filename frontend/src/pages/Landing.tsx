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
    gsap.from('.glitch-item', {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power4.out",
      delay: 0.2
    });

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
    <div ref={container} className="flex flex-col items-center justify-center pt-24 px-4 text-center max-w-5xl mx-auto font-sans">
      <div className="mb-16 flex flex-col items-center w-full">
        <motion.div 
          className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center mb-8 glitch-item bg-brutal-orange border-4 border-brutal-text shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          onMouseEnter={() => playSound('scan')}
        >
          <Fingerprint className="absolute inset-0 text-brutal-bg w-full h-full opacity-50 p-4" strokeWidth={1} />
          <LockKeyhole className="absolute inset-0 text-brutal-text w-full h-full scale-[0.4] z-10" strokeWidth={2.5} />
        </motion.div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-brutal-text pb-4 glitch-item uppercase drop-shadow-[4px_4px_0px_rgba(255,69,34,1)]">
          <ScrambleText text="SYSTEM.ECLIPSE_ID" delayMs={300} />
        </h1>
        <p className="text-xl md:text-2xl text-brutal-bg bg-brutal-text font-bold mt-4 tracking-widest uppercase glitch-item px-6 py-2 border-4 border-brutal-text shadow-[4px_4px_0px_0px_rgba(255,69,34,1)]">
          <ScrambleText text="[ Zero-Knowledge Identity Protocol ]" delayMs={600} />
        </p>
      </div>

      <div className="text-lg md:text-xl text-brutal-text leading-relaxed mb-16 max-w-3xl glitch-item text-left border-4 border-brutal-text p-6 bg-white shadow-[8px_8px_0px_0px_rgba(255,69,34,1)] font-bold uppercase">
        <p className="mb-4">
          &gt; WARNING: Current Web3 identity vectors are compromised. Linking real-world PII to public ledgers creates systemic privacy failure.
        </p>
        <p>
          &gt; SOLUTION: EclipseID deploys a cryptographic shield between KYC providers and decentralized infrastructure. Prove strict compliance parameters (Age, Accreditation) using Midnight Network ZK-SNARKs. <span className="text-brutal-orange">Zero data leakage. Total anonymity.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 glitch-item w-full sm:w-auto">
        <Link 
          to="/darkpool" 
          onMouseEnter={() => playSound('scan')}
          className="brutal-btn shadow-[8px_8px_0px_0px_rgba(28,28,28,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] text-xl"
        >
          <ShieldAlert size={28} />
          ENTER DARKPOOL
        </Link>
        <Link 
          to="/developers" 
          onMouseEnter={() => playSound('scan')}
          className="px-10 py-5 bg-white border-4 border-brutal-text text-brutal-text font-bold tracking-widest text-xl transition-all shadow-[8px_8px_0px_0px_rgba(255,69,34,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(255,69,34,1)] hover:bg-brutal-text hover:text-white flex items-center justify-center gap-3 uppercase"
        >
          <Terminal size={28} />
          VIEW DOCS
        </Link>
      </div>

      <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full features-container mb-32">
        <div className="feature-card brutal-card relative group">
          <div className="text-brutal-orange font-black text-6xl absolute -right-4 -top-6 group-hover:scale-110 transition-transform">01</div>
          <h3 className="text-2xl font-black text-brutal-text mb-4 tracking-widest uppercase">Off-chain Issuance</h3>
          <p className="text-base text-brutal-text leading-relaxed font-bold">Execute traditional KYC vectors. Authorized nodes issue a secure cryptographic credential directly into your local shielded vault. No public broadcast.</p>
        </div>
        <div className="feature-card brutal-card relative group">
          <div className="text-brutal-orange font-black text-6xl absolute -right-4 -top-6 group-hover:scale-110 transition-transform">02</div>
          <h3 className="text-2xl font-black text-brutal-text mb-4 tracking-widest uppercase">ZK Circuit Proof</h3>
          <p className="text-base text-brutal-text leading-relaxed font-bold">Synthesize a local Zero-Knowledge proof confirming credential validity and required attributes (e.g. age &gt;= 18) without exposing underlying values.</p>
        </div>
        <div className="feature-card brutal-card relative group">
          <div className="text-brutal-orange font-black text-6xl absolute -right-4 -top-6 group-hover:scale-110 transition-transform">03</div>
          <h3 className="text-2xl font-black text-brutal-text mb-4 tracking-widest uppercase">Confidential Access</h3>
          <p className="text-base text-brutal-text leading-relaxed font-bold">Infiltrate regulated DeFi darkpools entirely anonymously. The smart contract verifies the ZK mathematical footprint. Privacy preserved.</p>
        </div>
      </div>
    </div>
  );
}

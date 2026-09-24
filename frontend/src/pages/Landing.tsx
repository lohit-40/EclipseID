import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, Fingerprint, LockKeyhole, Code2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrambleText from '../components/ScrambleText';
import { playSound } from '../utils/sounds';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

const features = [
  {
    num: '01',
    title: 'Off-chain Issuance',
    desc: 'Authorized KYC nodes issue encrypted credentials directly into your local shielded vault. No public broadcast. Zero data exposure.',
    color: 'cyan',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    num: '02',
    title: 'ZK Circuit Proof',
    desc: 'Generate a local Zero-Knowledge proof confirming credential validity (age ≥ 18, accredited) without exposing any underlying personal data.',
    color: 'violet',
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    num: '03',
    title: 'Confidential Access',
    desc: 'Enter regulated DeFi darkpools anonymously. The smart contract verifies only the ZK mathematical footprint. Full privacy preserved.',
    color: 'pink',
    icon: <LockKeyhole className="w-6 h-6" />,
  },
];

const colorMap: Record<string, { glow: string; text: string; bg: string; border: string }> = {
  cyan: { glow: 'shadow-[0_0_30px_rgba(0,229,255,0.15)]', text: 'text-eclipse-cyan', bg: 'bg-eclipse-cyan/10', border: 'border-eclipse-cyan/20 hover:border-eclipse-cyan/40' },
  violet: { glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]', text: 'text-eclipse-violet', bg: 'bg-eclipse-violet/10', border: 'border-eclipse-violet/20 hover:border-eclipse-violet/40' },
  pink: { glow: 'shadow-[0_0_30px_rgba(236,72,153,0.15)]', text: 'text-eclipse-pink', bg: 'bg-eclipse-pink/10', border: 'border-eclipse-pink/20 hover:border-eclipse-pink/40' },
};

export default function Landing() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.hero-item', {
      y: 60,
      opacity: 0,
      stagger: 0.15,
      duration: 1.2,
      ease: "power4.out",
      delay: 0.1
    });

    gsap.from('.feature-card-3d', {
      scrollTrigger: {
        trigger: '.features-section',
        start: 'top 80%',
      },
      y: 60,
      opacity: 0,
      rotateX: 15,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col items-center pt-16 md:pt-24 px-4 max-w-6xl mx-auto">
      {/* ─── Hero Section ─── */}
      <section className="text-center mb-24 md:mb-32 flex flex-col items-center w-full perspective-container">
        {/* 3D Floating Shield */}
        <motion.div 
          className="relative w-32 h-32 md:w-44 md:h-44 flex items-center justify-center mb-10 hero-item shield-3d"
          onMouseEnter={() => playSound('scan')}
        >
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-eclipse-cyan/10 blur-xl" />
          {/* Glass container */}
          <div className="relative w-full h-full rounded-3xl bg-eclipse-surface/50 backdrop-blur-xl border border-black/10 flex items-center justify-center overflow-hidden">
            <Fingerprint className="absolute inset-0 w-full h-full opacity-10 text-eclipse-cyan p-6" strokeWidth={0.8} />
            <LockKeyhole className="relative text-eclipse-cyan w-12 h-12 md:w-16 md:h-16 z-10 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]" strokeWidth={1.5} />
            {/* Shimmer line */}
            <motion.div 
              className="absolute inset-0 bg-eclipse-cyan/5 -skew-x-12"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 2 }}
            />
          </div>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-eclipse-bright pb-2 hero-item leading-[0.95]">
          <ScrambleText text="Eclipse" delayMs={300} />
          <span className="gradient-text"><ScrambleText text="ID" delayMs={500} /></span>
        </h1>

        <p className="text-lg md:text-xl text-eclipse-muted mt-6 hero-item max-w-xl leading-relaxed">
          <ScrambleText text="Zero-Knowledge Identity Protocol on Midnight Network" delayMs={600} />
        </p>

        {/* Description glass card */}
        <div className="glass-card p-6 md:p-8 mt-10 max-w-2xl text-left hero-item">
          <p className="text-eclipse-text leading-relaxed text-sm md:text-base">
            <span className="text-eclipse-cyan font-mono text-xs opacity-60 block mb-2">{'>'} STATUS: ACTIVE</span>
            Current Web3 identity systems link real-world PII to public ledgers, creating systemic privacy failure. 
            EclipseID deploys a cryptographic shield between KYC providers and decentralized infrastructure — prove compliance 
            using <span className="text-eclipse-cyan font-semibold">Midnight Network ZK-SNARKs</span>. Zero data leakage. Total anonymity.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 hero-item w-full sm:w-auto">
          <Link 
            to="/darkpool" 
            onMouseEnter={() => playSound('scan')}
            className="neon-btn text-lg px-10 py-4"
          >
            <ShieldAlert size={22} />
            Enter Darkpool
          </Link>
          <Link 
            to="/developers" 
            onMouseEnter={() => playSound('scan')}
            className="ghost-btn text-lg px-10 py-4"
          >
            <Code2 size={22} />
            View Docs
          </Link>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="w-full mb-32 features-section perspective-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => {
            const c = colorMap[f.color];
            return (
              <div 
                key={f.num} 
                className={`feature-card-3d tilt-card glass-card ${c.border} p-8 relative group cursor-default`}
              >
                {/* Number badge */}
                <div className={`absolute -top-3 -right-3 w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center font-black text-lg ${c.text} border border-current/20 group-hover:scale-110 transition-transform`}>
                  {f.num}
                </div>
                
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-5 ${c.text}`}>
                  {f.icon}
                </div>
                
                <h3 className="text-xl font-bold text-eclipse-bright mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-eclipse-muted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Tech Stack Section ─── */}
      <section className="w-full mb-32">
        <div className="animated-border">
          <div className="glass-card p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-eclipse-bright mb-4 tracking-tight">
              Built on <span className="gradient-text">Midnight Network</span>
            </h2>
            <p className="text-eclipse-muted max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Leveraging the Compact language, ZK-SNARKs, and the Midnight partner chain for privacy-preserving smart contracts.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Compact', 'ZK-SNARKs', 'Midnight', 'React 19', 'TypeScript', 'Vite'].map((t) => (
                <span key={t} className="px-4 py-2 rounded-full text-xs font-semibold text-eclipse-text bg-black/5 border border-black/5">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

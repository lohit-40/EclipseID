import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LegalPageLayout({ title, lastUpdated, children }: { title: string, lastUpdated: string, children: ReactNode }) {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 md:px-10 max-w-4xl mx-auto w-full min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-eclipse-bright mb-4">{title}</h1>
        <p className="text-eclipse-cyan font-mono text-xs tracking-widest mb-12 uppercase font-semibold">
          {'>'} LAST UPDATED: {lastUpdated}
        </p>
        
        <div className="glass-card p-8 md:p-12 text-left space-y-6 text-eclipse-text leading-relaxed text-sm md:text-base">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

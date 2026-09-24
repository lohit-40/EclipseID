import { motion } from 'framer-motion';

export default function Developers() {
  return (
    <div className="max-w-4xl mx-auto pt-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-eclipse-bright mb-3 tracking-tight">
          Developer <span className="gradient-text">Integration</span>
        </h1>
        <p className="text-eclipse-muted text-lg max-w-xl">
          Integrate EclipseID's zero-knowledge KYC into your own dApps in minutes.
        </p>
      </motion.div>

      <div className="space-y-8 mb-20">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold text-eclipse-bright mb-2 tracking-tight flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-eclipse-cyan/10 text-eclipse-cyan font-mono">01</span>
            Smart Contract Integration
          </h2>
          <p className="text-eclipse-muted mb-6 text-sm">
            EclipseID exports a public verifier. Your smart contract can call our verification circuit to ensure a user is accredited.
          </p>
          <div className="terminal-glass p-5 overflow-x-auto">
            <pre className="text-sm text-eclipse-text font-mono">
              <code>{`import EclipseID;

export circuit borrow_funds(amount: Uint<64>): [] {
  // Enforce accredited investor via EclipseID
  assert EclipseID.verify_accredited(caller) 
    "Borrower must be an accredited investor";
    
  // Continue with your confidential DeFi logic...
  ledger.balances[caller] += amount;
}`}</code>
            </pre>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold text-eclipse-bright mb-2 tracking-tight flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-eclipse-violet/10 text-eclipse-violet font-mono">02</span>
            Frontend Integration
          </h2>
          <p className="text-eclipse-muted mb-6 text-sm">
            Use our React SDK to trigger the ZK proof generation seamlessly inside your frontend.
          </p>
          <div className="terminal-glass p-5 overflow-x-auto">
            <pre className="text-sm text-eclipse-cyan font-mono">
              <code>{`import { useEclipseID } from '@eclipse-id/react';

function BorrowButton() {
  const { proveAccreditation } = useEclipseID();
  
  const handleBorrow = async () => {
    // Generates a local ZK proof from user's shielded vault
    const proof = await proveAccreditation();
    
    // Submit transaction with attached proof
    await myContract.callTx.borrow_funds(1000, proof);
  };
  
  return <button onClick={handleBorrow}>Borrow</button>;
}`}</code>
            </pre>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="animated-border"
        >
          <div className="glass-card p-10 md:p-14 text-center">
            <h3 className="text-3xl font-bold text-eclipse-bright mb-3 tracking-tight">
              Build with <span className="gradient-text">Privacy</span>
            </h3>
            <p className="text-eclipse-muted mb-8 text-sm max-w-md mx-auto">Join the movement to protect user data on public ledgers.</p>
            <button className="neon-btn px-10 py-4 text-lg mx-auto">
              Read Full Documentation
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

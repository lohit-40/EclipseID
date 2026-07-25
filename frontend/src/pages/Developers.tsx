import { motion } from 'framer-motion';

export default function Developers() {
  return (
    <div className="max-w-4xl mx-auto pt-16 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 mb-4">
          Developer Integration
        </h1>
        <p className="text-xl text-rose-200/60">
          Integrate EclipseID's zero-knowledge KYC into your own dApps in minutes.
        </p>
      </motion.div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-rose-100 mb-4">1. Smart Contract Integration (Compact)</h2>
          <p className="text-rose-200/60 mb-4">
            EclipseID exports a public verifier. Your smart contract can simply call our verification circuit to ensure a user is accredited without ever seeing their data.
          </p>
          <div className="bg-[#070410] border border-white/10 rounded-2xl p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-emerald-400">
              <code>{`import EclipseID;

export circuit borrow_funds(amount: Uint<64>): [] {
  // Enforce that the caller is an accredited investor via EclipseID
  assert EclipseID.verify_accredited(caller) 
    "Borrower must be an accredited investor";
    
  // Continue with your confidential DeFi logic...
  ledger.balances[caller] += amount;
}`}</code>
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-rose-100 mb-4">2. Frontend Integration (midnight-js)</h2>
          <p className="text-rose-200/60 mb-4">
            Use our React SDK to trigger the ZK proof generation seamlessly inside your frontend.
          </p>
          <div className="bg-[#070410] border border-white/10 rounded-2xl p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-sky-400">
              <code>{`import { useEclipseID } from '@eclipse-id/react';

function BorrowButton() {
  const { proveAccreditation } = useEclipseID();
  
  const handleBorrow = async () => {
    // Generates a local ZK proof from the user's shielded vault
    const proof = await proveAccreditation();
    
    // Submit your transaction with the attached proof
    await myContract.callTx.borrow_funds(1000, proof);
  };
  
  return <button onClick={handleBorrow}>Borrow Confidentially</button>;
}`}</code>
            </pre>
          </div>
        </section>

        <section className="bg-gradient-to-r from-orange-500/10 to-rose-600/10 border border-orange-500/20 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-orange-400 mb-2">Build with Privacy</h3>
          <p className="text-rose-200/80 mb-6">Join the movement to protect user data on public ledgers.</p>
          <button className="px-6 py-3 bg-orange-500/20 text-orange-400 font-semibold rounded-xl border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
            Read Full Documentation
          </button>
        </section>
      </div>
    </div>
  );
}

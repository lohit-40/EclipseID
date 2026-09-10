import { motion } from 'framer-motion';

export default function Developers() {
  return (
    <div className="max-w-4xl mx-auto pt-16 px-4 font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 border-4 border-brutal-text p-8 bg-brutal-orange shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]">
        <h1 className="text-4xl font-black text-brutal-bg mb-4 uppercase tracking-widest">
          Developer Integration
        </h1>
        <p className="text-xl text-brutal-bg font-bold">
          Integrate EclipseID's zero-knowledge KYC into your own dApps in minutes.
        </p>
      </motion.div>

      <div className="space-y-12 mb-20">
        <section className="bg-white border-4 border-brutal-text p-8 shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]">
          <h2 className="text-3xl font-black text-brutal-text mb-4 uppercase tracking-widest flex items-center gap-4">
            <span className="bg-brutal-text text-white px-3 py-1">1</span>
            Smart Contract Integration (Compact)
          </h2>
          <p className="text-brutal-text font-bold mb-6 text-lg">
            EclipseID exports a public verifier. Your smart contract can simply call our verification circuit to ensure a user is accredited without ever seeing their data.
          </p>
          <div className="bg-brutal-bg border-4 border-brutal-text p-6 overflow-x-auto shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
            <pre className="text-sm font-bold text-brutal-text">
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

        <section className="bg-white border-4 border-brutal-text p-8 shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]">
          <h2 className="text-3xl font-black text-brutal-text mb-4 uppercase tracking-widest flex items-center gap-4">
            <span className="bg-brutal-text text-white px-3 py-1">2</span>
            Frontend Integration (midnight-js)
          </h2>
          <p className="text-brutal-text font-bold mb-6 text-lg">
            Use our React SDK to trigger the ZK proof generation seamlessly inside your frontend.
          </p>
          <div className="bg-brutal-bg border-4 border-brutal-text p-6 overflow-x-auto shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
            <pre className="text-sm font-bold text-brutal-orange">
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

        <section className="bg-brutal-bg border-4 border-brutal-text p-12 text-center shadow-[12px_12px_0px_0px_rgba(255,69,34,1)]">
          <h3 className="text-4xl font-black text-brutal-text mb-4 uppercase tracking-widest">Build with Privacy</h3>
          <p className="text-brutal-text font-bold mb-8 text-xl">Join the movement to protect user data on public ledgers.</p>
          <button className="brutal-btn py-4 px-10 text-xl mx-auto shadow-[8px_8px_0px_0px_rgba(28,28,28,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
            READ FULL DOCUMENTATION
          </button>
        </section>
      </div>
    </div>
  );
}

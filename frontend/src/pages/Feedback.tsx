import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../WalletContext';
import { Send, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Feedback() {
  const { isConnected, address } = useWallet();
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // In a real app, this would be an API call to a backend database.
    // For the hackathon MVP, we simulate successful submission.
    console.log("Feedback Submitted:", { address, feedback });
    
    setSubmitted(true);
    setFeedback('');
    
    // Automatically dismiss success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 relative font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full flex flex-col gap-8 relative z-10"
      >
        <div className="text-center flex flex-col gap-4 bg-brutal-orange border-4 border-brutal-text p-8 shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]">
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-brutal-bg uppercase">
            Developer Feedback
          </h1>
          <p className="text-brutal-bg font-bold text-lg uppercase">
            Help us improve EclipseID. Your feedback is securely logged with your verifiable Preprod wallet address.
          </p>
        </div>

        <div className="bg-white border-4 border-brutal-text p-8 shadow-[12px_12px_0px_0px_rgba(28,28,28,1)] flex flex-col gap-6">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <ShieldCheck className="w-24 h-24 text-brutal-text mb-4 drop-shadow-[4px_4px_0px_rgba(255,69,34,1)]" />
              <h3 className="text-2xl font-black text-brutal-text uppercase tracking-widest">Connect Wallet to Provide Feedback</h3>
              <p className="text-brutal-text font-bold max-w-md bg-brutal-bg p-4 border-2 border-brutal-text">
                We require a connected Midnight Preprod wallet to verify that you are a real user on the testnet. 
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-black text-brutal-text uppercase tracking-widest">Verifiable Preprod Address</label>
                <div className="bg-brutal-bg border-4 border-brutal-text px-4 py-3 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]">
                  <div className="w-4 h-4 rounded-none bg-brutal-orange border-2 border-brutal-text" />
                  <span className="font-mono font-bold text-base text-brutal-text truncate">{address}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="feedback" className="text-lg font-black text-brutal-text uppercase tracking-widest">Your Feedback</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your experience issuing and claiming a ZK credential? Any bugs or feature requests?"
                  className="bg-white border-4 border-brutal-text px-4 py-4 min-h-[200px] text-brutal-text font-bold placeholder:text-brutal-text/40 focus:outline-none focus:border-brutal-orange focus:shadow-[4px_4px_0px_0px_rgba(255,69,34,1)] resize-y shadow-[4px_4px_0px_0px_rgba(28,28,28,1)]"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={!feedback.trim() || submitted}
                className="brutal-btn py-6 text-xl mt-4 shadow-[8px_8px_0px_0px_rgba(28,28,28,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(28,28,28,1)] disabled:opacity-50 disabled:cursor-not-allowed group w-full"
              >
                {submitted ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-brutal-bg" />
                    <span>FEEDBACK RECORDED</span>
                  </>
                ) : (
                  <>
                    <Send className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                    <span>SUBMIT FEEDBACK</span>
                  </>
                )}
              </button>
              
              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center font-black text-brutal-orange mt-4 bg-brutal-text p-4 border-4 border-brutal-text shadow-[4px_4px_0px_0px_rgba(255,69,34,1)] uppercase tracking-widest"
                >
                  Thank you! Your feedback has been securely logged to the Level 5 Ledger.
                </motion.div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

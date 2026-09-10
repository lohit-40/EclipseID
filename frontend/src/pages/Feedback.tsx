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
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full flex flex-col gap-8 relative z-10"
      >
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-rose-400">
            Developer Feedback
          </h1>
          <p className="text-rose-200/60 text-lg">
            Help us improve EclipseID. Your feedback is securely logged with your verifiable Preprod wallet address.
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm shadow-2xl flex flex-col gap-6">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <ShieldCheck className="w-16 h-16 text-rose-500/50 mb-2" />
              <h3 className="text-xl font-bold text-rose-100">Connect Wallet to Provide Feedback</h3>
              <p className="text-rose-200/50 max-w-md">
                We require a connected Midnight Preprod wallet to verify that you are a real user on the testnet. 
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-rose-200/70 ml-1">Verifiable Preprod Address</label>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-vibe-primary shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  <span className="font-mono text-sm text-rose-100/90 truncate">{address}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="feedback" className="text-sm font-medium text-rose-200/70 ml-1">Your Feedback</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your experience issuing and claiming a ZK credential? Any bugs or feature requests?"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[150px] text-rose-50 placeholder:text-rose-200/30 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={!feedback.trim() || submitted}
                className="bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {submitted ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Feedback Recorded</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
              
              {submitted && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-green-400 mt-2"
                >
                  Thank you! Your feedback has been securely logged to the Level 5 Ledger.
                </motion.p>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

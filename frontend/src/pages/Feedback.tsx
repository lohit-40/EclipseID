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
    console.log("Feedback Submitted:", { address, feedback });
    setSubmitted(true);
    setFeedback('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full flex flex-col gap-6 relative z-10"
      >
        <div className="text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-eclipse-bright mb-3 tracking-tight">
            Developer <span className="gradient-text">Feedback</span>
          </h1>
          <p className="text-eclipse-muted text-sm max-w-md mx-auto">
            Help us improve EclipseID. Your feedback is securely logged with your verifiable wallet address.
          </p>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-eclipse-violet/10 flex items-center justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-eclipse-violet" />
              </div>
              <h3 className="text-xl font-bold text-eclipse-bright tracking-tight">Connect Wallet</h3>
              <p className="text-eclipse-muted text-sm max-w-sm">
                A connected Midnight wallet is required to verify you are a real user on the testnet.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-eclipse-text">Wallet Address</label>
                <div className="flex items-center gap-3 glass-input !py-3">
                  <div className="status-dot bg-eclipse-green" />
                  <span className="font-mono text-sm text-eclipse-muted truncate">{address}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="feedback" className="text-sm font-semibold text-eclipse-text">Your Feedback</label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your experience? Any bugs or feature requests?"
                  className="glass-input min-h-[180px] resize-y"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={!feedback.trim() || submitted}
                className="neon-btn py-4 text-sm mt-2 w-full disabled:opacity-40"
              >
                {submitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Feedback Recorded</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
              
              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm font-semibold text-eclipse-green bg-eclipse-green/10 border border-eclipse-green/20 rounded-xl p-4"
                >
                  Thank you! Your feedback has been securely logged.
                </motion.div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

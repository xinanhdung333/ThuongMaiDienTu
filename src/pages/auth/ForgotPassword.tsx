import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      toast('Recovery link sent to your email!', 'success');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl"
        >
          <div className="mb-6 flex items-center">
            <Link to="/login" className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Recover Password</h1>
                <p className="text-xs text-slate-400 mt-1.5">
                  Enter your email address and we'll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send Reset Link
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 mb-4">
                <Mail className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                We've sent a password reset link to <span className="font-bold text-slate-600 dark:text-slate-200">{email}</span>. Please click the link inside the email to configure a new password.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                Back to Login
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
export default ForgotPassword;

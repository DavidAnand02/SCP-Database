import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = error.message;
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network Error: Failed to connect to the authentication server. Please check your internet connection or Supabase project status.';
      }
      setError(errorMessage);
    } else {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      if (!adminEmail || data.user?.email !== adminEmail) {
        await supabase.auth.signOut();
        setError('Security Violation: Unauthorized administrative access detected.');
      } else {
        onLogin();
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-panel border-foundation-accent/20">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center overflow-hidden animate-pulse shrink-0">
          <img 
            src="https://jvibllpldifuhgnargtt.supabase.co/storage/v1/object/public/scp-images/SCP_Foundation_Logo_White.png" 
            alt="SCP Foundation Logo"
            className="w-full h-full object-contain p-2"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tighter terminal-text uppercase">Admin Authentication</h2>
        <p className="text-xs text-foundation-muted font-mono uppercase tracking-widest">Level 4 Clearance Required</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-foundation-border rounded px-4 py-2 text-sm font-mono text-foundation-ink focus:outline-none focus:border-foundation-accent transition-colors"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-foundation-muted uppercase tracking-widest">Security Key</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-foundation-border rounded px-4 py-2 text-sm font-mono text-foundation-ink focus:outline-none focus:border-foundation-accent transition-colors"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-500 text-xs font-mono uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-foundation-accent text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-foundation-accent/80 transition-colors disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Access Terminal'}
        </button>

        <Link 
          to="/"
          className="flex items-center justify-center gap-2 text-xs font-mono text-foundation-muted hover:text-foundation-accent uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Return to Directory
        </Link>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-[10px] text-foundation-muted font-mono uppercase leading-tight">
          Unauthorized access to this terminal is a punishable offense under Foundation Protocol 14-B.
          Your IP and biometric data have been logged.
        </p>
      </div>
    </div>
  );
};

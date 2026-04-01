import React, { useState } from 'react';
import { 
  auth, 
  googleProvider, 
  githubProvider, 
  facebookProvider,
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from '../lib/firebase';
import { Github, Mail, Lock, User, LogIn, Sparkles, ArrowRight, Loader2, Chrome, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent!');
        setIsForgotPassword(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
        onSuccess?.();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        toast.success('Account created successfully!');
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Auth error full:', error);
      // Log specific details if available
      if (error.code) console.error('Error code:', error.code);
      if (error.customData) console.error('Custom data:', error.customData);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: any) => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Social auth error full:', error);
      if (error.code) console.error('Error code:', error.code);
      toast.error(error.message || 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neon-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Neon Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-magenta/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-neon-cyan/5">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-2xl flex items-center justify-center text-white shadow-lg shadow-neon-cyan/20 mb-6 rotate-3">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tight mb-2">
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {isForgotPassword 
                ? "Enter your email to receive a reset link" 
                : isLogin 
                  ? "Sign in to continue to OmniChat Studio" 
                  : "Join the future of AI chatbot building"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {!isLogin && !isForgotPassword && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-cyan transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all text-sm font-medium"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-cyan transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all text-sm font-medium"
              />
            </div>

            {!isForgotPassword && (
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-cyan transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all text-sm font-medium"
                />
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs font-bold text-slate-500 hover:text-neon-cyan transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-neon-black rounded-2xl py-4 font-black text-sm hover:bg-neon-cyan transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-white/5"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {!isForgotPassword && (
            <>
              <div className="my-8 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Or continue with</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialAuth(googleProvider)}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-slate-800/50 border border-white/5 rounded-2xl py-3.5 hover:bg-slate-800 hover:border-white/10 transition-all group"
                  title="Google"
                >
                  <Chrome size={20} className="text-slate-400 group-hover:text-neon-cyan transition-colors" />
                </button>
                <button
                  onClick={() => handleSocialAuth(githubProvider)}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-slate-800/50 border border-white/5 rounded-2xl py-3.5 hover:bg-slate-800 hover:border-white/10 transition-all group"
                  title="GitHub"
                >
                  <Github size={20} className="text-slate-400 group-hover:text-neon-cyan transition-colors" />
                </button>
                <button
                  onClick={() => handleSocialAuth(facebookProvider)}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-slate-800/50 border border-white/5 rounded-2xl py-3.5 hover:bg-slate-800 hover:border-white/10 transition-all group"
                  title="Facebook"
                >
                  <Facebook size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>
            </>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsLogin(!isLogin);
                }
              }}
              className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
            >
              {isForgotPassword 
                ? 'Back to Login' 
                : isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-[1px] w-8 bg-white/5" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            OmniChat Studio Pro
          </p>
          <div className="h-[1px] w-8 bg-white/5" />
        </div>
      </div>
    </div>
  );
}

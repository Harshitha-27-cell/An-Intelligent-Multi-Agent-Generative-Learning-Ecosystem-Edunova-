
import React, { useState } from 'react';
import { Page } from '../App';
import { Compass, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="glow-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div 
          className="flex items-center gap-2 justify-center mb-10 cursor-pointer"
          onClick={() => onNavigate('landing')}
        >
          <div className="p-2 bg-blue-600 rounded-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">EDUNOVA AI</span>
        </div>

        <div className="glass-card p-8 rounded-3xl border-white/10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 font-medium">Forgot Password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-[#161d2b] text-slate-500">Or continue with</span></div>
          </div>

          <button className="w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-3">
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Don't have an account? 
          <button 
            onClick={() => onNavigate('signup')}
            className="text-blue-400 font-bold hover:text-blue-300 ml-1 transition-colors"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

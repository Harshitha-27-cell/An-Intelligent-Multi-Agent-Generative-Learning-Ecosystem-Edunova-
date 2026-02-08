
import React, { useState } from 'react';
import { Page } from '../App';
import { Compass, User, Mail, CheckCircle2 } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (page: Page) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const [role, setRole] = useState<'student' | 'professional'>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="glow-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      
      <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div 
          className="flex items-center gap-2 justify-center mb-10 cursor-pointer"
          onClick={() => onNavigate('landing')}
        >
          <div className="p-2 bg-blue-600 rounded-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">EDUNOVA AI</span>
        </div>

        <div className="glass-card p-8 md:p-10 rounded-3xl border-white/10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-slate-400 mt-2">Join thousands of others starting their journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 mb-2">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'student' ? 'bg-blue-500' : 'bg-white/10'}`}>
                   <User className="w-5 h-5 text-white" />
                </div>
                <span className={`font-semibold ${role === 'student' ? 'text-white' : 'text-slate-400'}`}>I'm a Student</span>
              </button>
              <button 
                type="button"
                onClick={() => setRole('professional')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'professional' ? 'bg-violet-600/20 border-violet-500 ring-2 ring-violet-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'professional' ? 'bg-violet-500' : 'bg-white/10'}`}>
                   <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <span className={`font-semibold ${role === 'professional' ? 'text-white' : 'text-slate-400'}`}>Professional</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input 
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Create a strong password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" required className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500" />
                <p className="text-xs text-slate-400">
                  I agree to the <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          Already have an account? 
          <button 
            onClick={() => onNavigate('login')}
            className="text-blue-400 font-bold hover:text-blue-300 ml-1 transition-colors"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

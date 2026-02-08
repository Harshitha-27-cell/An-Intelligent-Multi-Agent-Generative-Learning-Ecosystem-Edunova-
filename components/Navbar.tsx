
import React from 'react';
import { Page } from '../App';
import { Compass, Bell, Settings, Menu } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: Page) => void;
  variant?: 'solid' | 'transparent';
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, variant = 'transparent' }) => {
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${variant === 'solid' ? 'bg-[#0a0f1d]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('landing')}
        >
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">EDUNOVA AI</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-400">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">Dashboard</button>
          <button className="hover:text-white transition-colors">Career Paths</button>
          <button onClick={() => onNavigate('community')} className="hover:text-white transition-colors">Community</button>
          <button className="hover:text-white transition-colors">Mentors</button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0f1d]"></span>
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button 
            onClick={() => onNavigate('login')}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Dashboard
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

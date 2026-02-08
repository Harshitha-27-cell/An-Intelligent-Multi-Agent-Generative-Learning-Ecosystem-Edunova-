
import React from 'react';
import Navbar from '../components/Navbar';
import { Page } from '../App';
import { ArrowRight, Star, Users, Target, BookOpen, Compass } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      <Navbar onNavigate={onNavigate} />
      
      {/* Glow Effects */}
      <div className="glow-effect top-[-10%] left-[-10%]" />
      <div className="glow-effect bottom-[10%] right-[-5%] opacity-50" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
            <Star className="w-3.5 h-3.5" />
            <span>Trusted by 50,000+ Students Worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-white mb-8 max-w-5xl leading-tight">
            Your Career. Your Path. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500">
              One Platform.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Navigate your professional journey with AI-driven personalized learning, 
            expert career guidance, and intensive placement preparation.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="group px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2 active:scale-95"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95">
              Explore Features
            </button>
          </div>

          {/* Hero Illustration Placeholder */}
          <div className="mt-24 w-full max-w-6xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent z-10" />
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 p-4 md:p-8 aspect-video md:aspect-[21/9] flex items-center justify-center">
              <div className="grid grid-cols-12 gap-4 w-full h-full opacity-60">
                <div className="col-span-3 bg-white/5 rounded-lg animate-pulse" />
                <div className="col-span-6 bg-blue-500/10 rounded-lg animate-pulse delay-75" />
                <div className="col-span-3 bg-white/5 rounded-lg animate-pulse delay-150" />
                <div className="col-span-4 bg-white/5 rounded-lg animate-pulse delay-200" />
                <div className="col-span-8 bg-indigo-500/10 rounded-lg animate-pulse delay-300" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold text-xl">Interactive Roadmap Engine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target className="text-blue-400" />}
              title="Personalized Paths"
              description="AI-driven curriculum that adapts to your skills, goals, and learning pace for maximum efficiency."
            />
            <FeatureCard 
              icon={<BookOpen className="text-violet-400" />}
              title="Placement Mastery"
              description="From mock interviews to aptitude bootcamps, we provide everything needed to ace your dream job."
            />
            <FeatureCard 
              icon={<Users className="text-indigo-400" />}
              title="Expert Mentorship"
              description="Connect with industry leaders from top tech firms who provide 1-on-1 guidance for your career."
            />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-white">EDUNOVA AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p className="text-sm text-slate-600">© 2024 EDUNOVA AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-all group border-white/10">
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;

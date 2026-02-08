
import React from 'react';
import { Page } from '../App';
import { 
  Zap, 
  Flame, 
  Map, 
  FileText, 
  Sparkles, 
  Brain, 
  Layers, 
  Users,
  ArrowRight,
  ChevronRight,
  Clock,
  Compass,
  Bot,
  Video
} from 'lucide-react';
import Navbar from '../components/Navbar';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      <Navbar onNavigate={onNavigate} variant="solid" />
      
      <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Good Morning, Alex</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">Ready to <span className="text-blue-500">level up?</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Flame className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">12 Day Streak</p>
                <p className="text-sm font-bold">Maintaining Momentum</p>
              </div>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skill Level</p>
                <p className="text-sm font-bold text-indigo-400">Advanced Learner</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* Main Focus Card */}
          <div className="lg:col-span-8 glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Map className="w-40 h-40 text-blue-500" />
            </div>
            
            <div className="relative z-10">
              <span className="px-3 py-1 bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">Active Roadmap</span>
              <h2 className="text-4xl font-black mt-4 mb-6 leading-tight">Frontend Engineering <br/>Mastery Path</h2>
              
              <div className="flex flex-wrap gap-8 mb-10">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Current Module</p>
                  <p className="text-lg font-bold">React Server Components</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Completion</p>
                  <p className="text-lg font-bold">68%</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Est. Completion</p>
                  <p className="text-lg font-bold">2 Weeks</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => onNavigate('learning-path')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                >
                  Continue Learning
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white/5 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
                  View Path Details
                </button>
              </div>
            </div>
          </div>

          {/* Activity/Task Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Upcoming Tasks</h3>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <div className="space-y-4">
                <TaskItem 
                  title="Mock Interview (FAANG)" 
                  time="Today, 4:00 PM" 
                  icon={<Video className="w-4 h-4 text-blue-500" />} 
                  onClick={() => onNavigate('interview')}
                />
                <TaskItem 
                  title="Algorithm Drill #12" 
                  time="Tomorrow" 
                  icon={<Brain className="w-4 h-4 text-indigo-500" />} 
                  onClick={() => onNavigate('quiz')}
                />
                <TaskItem 
                  title="Community AMA" 
                  time="Jan 24" 
                  icon={<Users className="w-4 h-4 text-violet-500" />} 
                  onClick={() => onNavigate('community')}
                />
              </div>
              <button className="w-full mt-8 py-3 bg-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all border border-white/5">
                View All Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard 
            icon={<Bot className="w-6 h-6 text-blue-400" />}
            title="AI Study Assistant"
            desc="Your personal 24/7 tutor for concepts, doubts, and career advice."
            onClick={() => onNavigate('study-assistant')}
          />
          <ModuleCard 
            icon={<Map className="w-6 h-6 text-blue-500" />}
            title="Career Roadmap"
            desc="AI-generated learning path tailored to your dream job."
            onClick={() => onNavigate('learning-path')}
          />
          <ModuleCard 
            icon={<Brain className="w-6 h-6 text-indigo-500" />}
            title="AI Powered Quiz"
            desc="Test your knowledge with content-adaptive questions."
            onClick={() => onNavigate('quiz')}
          />
          <ModuleCard 
            icon={<Video className="w-6 h-6 text-cyan-400" />}
            title="Mock Interview"
            desc="Real-time technical and behavioral voice interviews with Gemini."
            onClick={() => onNavigate('interview')}
          />
          <ModuleCard 
            icon={<Layers className="w-6 h-6 text-orange-400" />}
            title="Flashcard Engine"
            desc="Convert your study notes into efficient SRS cards."
            onClick={() => onNavigate('flashcards')}
          />
          <ModuleCard 
            icon={<FileText className="w-6 h-6 text-violet-500" />}
            title="ATS Resume Scorer"
            desc="Check your score and optimize for ATS algorithms."
            onClick={() => onNavigate('ats-scorer')}
          />
          <ModuleCard 
            icon={<Users className="w-6 h-6 text-green-500" />}
            title="Study Community"
            desc="Discuss topics, share resources, and grow with peers."
            onClick={() => onNavigate('community')}
          />
        </div>
      </main>
    </div>
  );
};

const TaskItem: React.FC<{ title: string; time: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, time, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
  >
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-slate-200 group-hover:text-white">{title}</h4>
      <p className="text-[10px] text-slate-500 font-medium">{time}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
  </button>
);

const ModuleCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick?: () => void }> = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="glass-card p-8 rounded-[2rem] border-white/5 hover:border-blue-500/20 transition-all group cursor-pointer active:scale-[0.98]"
  >
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">{desc}</p>
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
      Launch Module
      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

export default Dashboard;

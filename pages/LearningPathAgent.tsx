
import React, { useState } from 'react';
import { Page } from '../App';
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Target, 
  Zap, 
  Code, 
  Brain, 
  Rocket, 
  Trophy,
  Loader2,
  Sparkles,
  Info,
  Lightbulb
} from 'lucide-react';

interface LearningPathAgentProps {
  onNavigate: (page: Page) => void;
}

type Step = 1 | 2 | 3 | 4;

const LearningPathAgent: React.FC<LearningPathAgentProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<Step>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    targetRole: '',
    experienceLevel: '',
    currentSkills: '',
    preferredPace: 'Moderate',
    timeAvailability: '6'
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4) as Step);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as Step);

  const handleSubmit = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setRoadmap(mockRoadmap);
    setIsGenerating(false);
    setStep(4);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <button 
          onClick={() => step === 4 ? setStep(1) : onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{step === 4 ? 'Back to Setup' : 'Back to Dashboard'}</span>
        </button>

        {step < 4 && !isGenerating && (
          <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in duration-700">
            {/* Left Intro/Context Panel */}
            <div className="lg:col-span-5 space-y-10">
              <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Roadmap Orchestrator</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-6 leading-[1.1]">Build Your <br/><span className="text-blue-500">Career Engine.</span></h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  We use Bayesian skill analysis and labor market data to generate a roadmap that bridges the gap between where you are and where you want to be.
                </p>
              </header>

              <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl border-white/5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">Goal Alignment</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Paths synchronized with industry-standard certifications and job descriptions.</p>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">Adaptive Intervals</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Adjust your pace anytime. The roadmap recalibrates based on your completion rate.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Wizard Panel */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8 md:p-12 rounded-[3rem] border-white/10 shadow-2xl space-y-10">
                {/* Progress Indicators */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-500' : 'bg-white/5'}`} />
                  ))}
                </div>

                <div className="min-h-[350px]">
                  {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-6">
                        <label className="text-2xl font-black block tracking-tight">Select your target trajectory</label>
                        <div className="grid grid-cols-2 gap-4">
                          {['Frontend Engineer', 'Fullstack Developer', 'Data Scientist', 'DevOps Engineer', 'AI/ML Specialist', 'Product Manager'].map((role) => (
                            <button
                              key={role}
                              onClick={() => handleInputChange('targetRole', role)}
                              className={`p-6 rounded-2xl border text-left transition-all group ${formData.targetRole === role ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                            >
                              <span className={`font-bold block mb-1 group-hover:text-blue-400 transition-colors ${formData.targetRole === role ? 'text-blue-400' : 'text-slate-300'}`}>{role}</span>
                              <p className="text-[10px] text-slate-600 font-medium">Top skill gap: {role === 'Frontend Engineer' ? 'TypeScript' : 'Distributed Systems'}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-6">
                        <label className="text-2xl font-black block tracking-tight">Audit your current skills</label>
                        <textarea 
                          placeholder="e.g. React hooks, Python basics, Figma, SQL fundamentals..."
                          className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                          value={formData.currentSkills}
                          onChange={(e) => handleInputChange('currentSkills', e.target.value)}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Proficiency Level</label>
                        <div className="flex gap-3">
                          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => handleInputChange('experienceLevel', lvl)}
                              className={`flex-1 py-4 rounded-xl border text-sm font-bold transition-all ${formData.experienceLevel === lvl ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-6">
                        <label className="text-2xl font-black block tracking-tight">Velocity and Commitment</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'Casual', desc: '<10h/wk' },
                            { id: 'Moderate', desc: '20h/wk' },
                            { id: 'Intensive', desc: '40h/wk' }
                          ].map((pace) => (
                            <button
                              key={pace.id}
                              onClick={() => handleInputChange('preferredPace', pace.id)}
                              className={`p-6 rounded-2xl border flex flex-col items-center gap-1 transition-all ${formData.preferredPace === pace.id ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                            >
                              <span className={`font-black text-sm uppercase tracking-widest ${formData.preferredPace === pace.id ? 'text-white' : ''}`}>{pace.id}</span>
                              <span className="text-[10px] font-medium">{pace.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block">Timeframe (Months)</label>
                        <input 
                          type="range" min="1" max="12" step="1"
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          value={formData.timeAvailability}
                          onChange={(e) => handleInputChange('timeAvailability', e.target.value)}
                        />
                        <div className="flex justify-between text-[10px] text-slate-600 font-black uppercase tracking-widest">
                          <span>1 Month</span>
                          <span className="text-blue-500">Duration: {formData.timeAvailability} Months</span>
                          <span>1 Year</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-white/5">
                  <button 
                    onClick={prevStep}
                    disabled={step === 1}
                    className="px-6 py-3 text-slate-500 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={step === 3 ? handleSubmit : nextStep}
                    disabled={step === 1 && !formData.targetRole}
                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all flex items-center gap-3 shadow-xl shadow-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                  >
                    {step === 3 ? 'Generate Engine' : 'Next Milestone'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700 text-center">
            <div className="relative mb-12">
              <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
              <div className="absolute inset-0 blur-[100px] bg-blue-500/40 animate-pulse"></div>
            </div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter">Synchronizing Knowledge.</h2>
            <p className="text-slate-400 max-w-sm text-lg font-medium">We're indexing 400+ career paths to find the optimal route for your {formData.targetRole} goal.</p>
          </div>
        )}

        {step === 4 && roadmap && !isGenerating && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Target: {formData.targetRole}</div>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg">{formData.preferredPace} Velocity</div>
                </div>
                <h1 className="text-7xl font-black tracking-tighter leading-none">Learning <br/><span className="text-blue-500">Trajectory.</span></h1>
              </div>
              <div className="flex items-center gap-6 p-8 glass-card rounded-[2.5rem] border-white/10">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Duration</p>
                  <p className="text-2xl font-black text-white">{formData.timeAvailability}m</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Proficiency</p>
                  <p className="text-2xl font-black text-white">{formData.experienceLevel}</p>
                </div>
                <button className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20">Sync Calendar</button>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-12 relative">
              {/* Timeline Connector */}
              <div className="hidden lg:block absolute left-[31px] top-12 bottom-12 w-px bg-gradient-to-b from-blue-500 via-indigo-500/50 to-transparent"></div>

              <div className="lg:col-span-8 space-y-12">
                {roadmap.phases.map((phase: any, idx: number) => (
                  <div key={idx} className="relative lg:pl-24 group">
                    <div className="hidden lg:flex absolute left-0 top-1 w-16 h-16 bg-[#0a0f1d] border-4 border-blue-500 rounded-full items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                      {idx === 0 ? <Rocket className="w-7 h-7 text-blue-400" /> : idx === 1 ? <Code className="w-7 h-7 text-blue-400" /> : <Trophy className="w-7 h-7 text-blue-400" />}
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border border-white/5 group-hover:border-blue-500/30 transition-all shadow-2xl">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Phase {idx + 1}</span>
                          <h3 className="text-3xl font-black text-white leading-tight">{phase.title}</h3>
                        </div>
                        <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest shrink-0">
                          Timeline: {phase.duration}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Zap className="w-4 h-4 text-blue-500" /> Core Skill Stacks
                          </h4>
                          <ul className="space-y-4">
                            {phase.topics.map((topic: string, tidx: number) => (
                              <li key={tidx} className="flex items-center gap-4 text-slate-300 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                <span className="text-sm">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center text-center">
                          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                             <Brain className="w-5 h-5 text-indigo-400" />
                          </div>
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Goal Objective</h4>
                          <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                            "{phase.milestone}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar for Roadmap View */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 sticky top-24 space-y-8">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" /> Learning Logic
                  </h4>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Based on your <span className="text-white">{formData.experienceLevel}</span> level, we prioritized foundational <span className="text-white">logical abstractions</span> before framework-specific syntax.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended Tools</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-center">VS Code</div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-center">Cursor AI</div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-center">Postman</div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-center">Excalidraw</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <button className="w-full py-4 bg-blue-600/10 text-blue-400 rounded-xl font-black text-xs uppercase tracking-widest border border-blue-500/20 hover:bg-blue-600/20 transition-all">
                      Export to Notion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock Roadmap Data
const mockRoadmap = {
  phases: [
    {
      title: "Core Mechanics & Environment",
      duration: "0-4 Weeks",
      topics: ["Advanced ES6+ Scoping", "Functional Programming paradigms", "Git/Gitflow collaborative logic", "DOM Lifecycle & events"],
      milestone: "Architect and deploy a responsive, purely semantic portfolio with optimized bundle size and automated CI/CD."
    },
    {
      title: "State Orchestration & DX",
      duration: "1-3 Months",
      topics: ["React 19 Rendering internals", "Complex state transitions", "Zustand & Immer patterns", "Query caching strategies"],
      milestone: "Build a high-throughput, data-driven dashboard that consumes complex REST/GraphQL APIs with optimistic UI updates."
    },
    {
      title: "Production Scaling & Systems",
      duration: "4-6 Months",
      topics: ["Typescript Generics & Utility types", "End-to-End Testing (Playwright)", "Security: JWT & RBAC flows", "Cloud Deployment (AWS/Vercel)"],
      milestone: "Capstone: A full-stack enterprise module with real-time features, robust error handling, and 90%+ test coverage."
    }
  ]
};

export default LearningPathAgent;

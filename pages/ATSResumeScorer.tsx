
import React, { useState, useRef } from 'react';
import { Page } from '../App';
import { 
  ArrowLeft, 
  FileText, 
  Target, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Brain, 
  Zap, 
  Search,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Upload,
  FileUp,
  X
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import Navbar from '../components/Navbar';

// Dynamically import pdf.js from ESM
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.min.mjs';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

interface ATSResumeScorerProps {
  onNavigate: (page: Page) => void;
}

type ScorerState = 'setup' | 'analyzing' | 'report';

interface ScorerReport {
  atsScore: number;
  fitVerdict: 'Strong Match' | 'Moderate Match' | 'Weak Match';
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  criticalGaps: string[];
  sectionFeedback: {
    skills: string;
    experience: string;
    projects: string;
    education: string;
  };
  optimizationProtocol: string[];
}

const ATSResumeScorer: React.FC<ATSResumeScorerProps> = ({ onNavigate }) => {
  const [state, setState] = useState<ScorerState>('setup');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState<ScorerReport | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File) => {
    setIsParsingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeText(fullText.trim());
    } catch (error) {
      console.error('PDF parsing failed:', error);
      alert('Failed to parse PDF. Please try copying text manually.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      extractTextFromPdf(file);
    } else if (file) {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setState('analyzing');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an ATS Resume Evaluation Engine. Analyze this resume against the job description.
        
        Resume: ${resumeText}
        Job Description: ${jobDescription}
        
        Evaluate based on:
        1. Keyword & Skill Match (Hard skills, tools).
        2. Role Relevance.
        3. Experience Quality (Action verbs, measurable impact).
        4. Formatting & Section clarity.
        
        Return a JSON object matching this structure:
        {
          "atsScore": number (0-100),
          "fitVerdict": "Strong Match" | "Moderate Match" | "Weak Match",
          "matchedKeywords": string[],
          "missingKeywords": string[],
          "strengths": string[],
          "criticalGaps": string[],
          "sectionFeedback": {
            "skills": string,
            "experience": string,
            "projects": string,
            "education": string
          },
          "optimizationProtocol": string[]
        }`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.NUMBER },
              fitVerdict: { type: Type.STRING },
              matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              sectionFeedback: {
                type: Type.OBJECT,
                properties: {
                  skills: { type: Type.STRING },
                  experience: { type: Type.STRING },
                  projects: { type: Type.STRING },
                  education: { type: Type.STRING }
                }
              },
              optimizationProtocol: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['atsScore', 'fitVerdict', 'matchedKeywords', 'missingKeywords', 'strengths', 'criticalGaps', 'sectionFeedback', 'optimizationProtocol']
          }
        }
      });

      const data = JSON.parse(response.text);
      setReport(data);
      setState('report');
    } catch (error) {
      console.error('Analysis failed:', error);
      setState('setup');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white selection:bg-blue-500/30">
      <Navbar onNavigate={onNavigate} variant="solid" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <button 
          onClick={() => state === 'report' ? setState('setup') : onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{state === 'report' ? 'New Scan' : 'Back to Dashboard'}</span>
        </button>

        {state === 'setup' && (
          <div className="grid lg:grid-cols-2 gap-12 items-start animate-in fade-in duration-700">
            <div className="space-y-10">
              <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATS Screening Logic</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Master the <br/><span className="text-blue-500">Recruiter Filter.</span></h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  Professional-grade ATS scanning to identify keyword gaps and structural weaknesses before you apply. Now supporting direct PDF uploads.
                </p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Zap className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-bold mb-1">Precision Scoring</h3>
                  <p className="text-xs text-slate-500">Recruitment-grade algorithms</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Search className="w-8 h-8 text-indigo-500 mb-4" />
                  <h3 className="font-bold mb-1">Keyword Mining</h3>
                  <p className="text-xs text-slate-500">Identify missing skill-tokens</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/10 space-y-8 shadow-2xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Your Resume
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3 h-3" /> Upload PDF
                    </button>
                  </div>

                  <div className="relative group">
                    {isParsingPdf && (
                      <div className="absolute inset-0 bg-[#0a0f1d]/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl border border-blue-500/20">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Extracting PDF Text...</span>
                      </div>
                    )}
                    
                    {!resumeText && !isParsingPdf && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer"
                      >
                         <FileUp className="w-8 h-8 text-slate-700 mb-2" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Drop PDF or Click to Upload</span>
                      </div>
                    )}

                    <textarea 
                      placeholder="Resume content will appear here after upload, or paste manually..."
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                    
                    {resumeText && (
                      <button 
                        onClick={() => setResumeText('')}
                        className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4" /> Target Job Description
                  </label>
                  <textarea 
                    placeholder="Paste the job description you are applying for..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={!resumeText.trim() || !jobDescription.trim() || isParsingPdf}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 disabled:opacity-30 group active:scale-95"
              >
                Analyze Match
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {state === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700 text-center">
            <div className="relative mb-12">
              <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
              <div className="absolute inset-0 blur-[80px] bg-blue-500/30 animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter">Running ATS Simulation</h2>
            <p className="text-slate-400 max-w-sm text-lg font-medium">Gemini is parsing your profile against industry-standard screening benchmarks.</p>
          </div>
        )}

        {state === 'report' && report && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-6xl font-black tracking-tighter mb-2">Scan <span className="text-blue-500">Report</span></h1>
                <p className="text-slate-400 text-lg font-medium">Analysis complete. View your ATS compatibility profile.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setState('setup')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">New Scan</button>
                <div className={`px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 border ${report.fitVerdict === 'Strong Match' ? 'bg-green-500/10 text-green-400 border-green-500/20' : report.fitVerdict === 'Moderate Match' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  Verdict: {report.fitVerdict}
                </div>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Score Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-10 rounded-[2.5rem] border-white/10 text-center bg-gradient-to-b from-blue-600/5 to-transparent">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-10 block">Compatibility Score</span>
                  <div className="text-[10rem] font-black leading-none text-white tracking-tighter">{report.atsScore}</div>
                  <div className="text-blue-400 font-bold text-xl mb-10">out of 100</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Keywords</p>
                      <p className="text-xl font-bold text-white">{report.matchedKeywords.length}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Gaps</p>
                      <p className="text-xl font-bold text-white">{report.missingKeywords.length}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-[2rem] border-white/10">
                   <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <Zap className="w-4 h-4 text-blue-500" /> Optimization Protocol
                   </h4>
                   <div className="space-y-4">
                      {report.optimizationProtocol.map((step, i) => (
                        <div key={i} className="flex gap-3 text-sm font-medium text-slate-300 leading-relaxed group">
                           <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-400 shrink-0 mt-0.5">
                             {i + 1}
                           </div>
                           <span className="group-hover:text-white transition-colors">{step}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Main Analysis Panel */}
              <div className="lg:col-span-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-green-500/[0.02]">
                    <h4 className="text-green-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Core Strengths
                    </h4>
                    <div className="space-y-3">
                      {report.strengths.map((s, i) => <div key={i} className="text-sm text-slate-300 font-medium leading-relaxed flex gap-2"><span>•</span> {s}</div>)}
                    </div>
                  </div>
                  <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-red-500/[0.02]">
                    <h4 className="text-red-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Critical Gaps
                    </h4>
                    <div className="space-y-3">
                      {report.criticalGaps.map((g, i) => <div key={i} className="text-sm text-slate-300 font-medium leading-relaxed flex gap-2"><span>•</span> {g}</div>)}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border-white/10 space-y-10">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" /> Section-wise Feedback
                  </h4>
                  <div className="grid md:grid-cols-2 gap-10">
                    <FeedbackSection title="Skills & Keywords" icon={<Zap className="w-4 h-4" />} content={report.sectionFeedback.skills} />
                    <FeedbackSection title="Work Experience" icon={<Briefcase className="w-4 h-4" />} content={report.sectionFeedback.experience} />
                    <FeedbackSection title="Project Portfolio" icon={<Brain className="w-4 h-4" />} content={report.sectionFeedback.projects} />
                    <FeedbackSection title="Academic Record" icon={<FileText className="w-4 h-4" />} content={report.sectionFeedback.education} />
                  </div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                   <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Keyword Matrix</h4>
                   <div className="flex flex-wrap gap-2">
                      {report.matchedKeywords.map((k, i) => (
                        <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {k}
                        </span>
                      ))}
                      {report.missingKeywords.map((k, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          Missing: {k}
                        </span>
                      ))}
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

const FeedbackSection: React.FC<{ title: string; icon: React.ReactNode; content: string }> = ({ title, icon, content }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
      {icon} {title}
    </div>
    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{content}"</p>
  </div>
);

export default ATSResumeScorer;

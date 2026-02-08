
import React, { useState, useRef } from 'react';
import { Page } from '../App';
import { 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  BarChart3, 
  BookOpen, 
  Lightbulb,
  FileText,
  AlertCircle,
  TrendingUp,
  Brain,
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

interface QuizAgentProps {
  onNavigate: (page: Page) => void;
}

type QuizState = 'setup' | 'loading' | 'quiz' | 'evaluating' | 'report';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QuizAgent: React.FC<QuizAgentProps> = ({ onNavigate }) => {
  const [state, setState] = useState<QuizState>('setup');
  const [material, setMaterial] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [report, setReport] = useState<any | null>(null);
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
        const pageText = textContent.items.map((item: any) => (item as any).str).join(' ');
        fullText += pageText + '\n';
      }
      
      setMaterial(fullText.trim());
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

  const startQuiz = async () => {
    if (!material.trim()) return;
    setState('loading');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a quiz with ${questionCount} multiple choice questions strictly based on the provided material only.
        
        Material: ${material}
        Difficulty: ${difficulty}
        
        Return the result as a JSON array of objects, where each object has:
        "question": string,
        "options": string array (exactly 4 options),
        "correctAnswer": integer (0-3 index),
        "explanation": string`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctAnswer', 'explanation']
            }
          }
        }
      });

      const generatedQuestions = JSON.parse(response.text);
      setQuestions(generatedQuestions);
      setState('quiz');
      setCurrentQuestionIndex(0);
      setAnswers([]);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      setState('setup');
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      evaluateQuiz(newAnswers);
    }
  };

  const evaluateQuiz = async (finalAnswers: number[]) => {
    setState('evaluating');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (q.correctAnswer === finalAnswers[idx]) correctCount++;
    });
    const score = (correctCount / questions.length) * 10;
    const percentage = (correctCount / questions.length) * 100;

    const performanceLevel = percentage >= 90 ? 'Mastery' : percentage >= 70 ? 'Competent' : percentage >= 40 ? 'Developing' : 'Beginner';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze performance for a quiz on: ${material.substring(0, 300)}...
        Quiz Results: ${questions.map((q, i) => `Q: ${q.question} | Correct: ${q.correctAnswer === finalAnswers[i]}`).join('\n')}
        
        Provide:
        1. Topic-wise accuracy percentages.
        2. Key concepts answered incorrectly.
        3. Areas for improvement.
        4. Study and revision suggestions.
        5. Next quiz difficulty.
        
        Return as JSON:
        "topicAccuracy": [{ "topic": string, "accuracy": number }],
        "missedConcepts": string array,
        "improvementAreas": string array,
        "studyTips": string array,
        "nextDifficulty": string`,
        config: { responseMimeType: 'application/json' }
      });

      const aiEvaluation = JSON.parse(response.text);
      setReport({
        score,
        percentage,
        performanceLevel,
        correctCount,
        totalQuestions: questions.length,
        ...aiEvaluation
      });
      setState('report');
    } catch (error) {
      setReport({ score, percentage, performanceLevel, correctCount, totalQuestions: questions.length });
      setState('report');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      <Navbar onNavigate={onNavigate} variant="solid" />
      
      <div className="max-w-6xl mx-auto px-6 py-12 pt-32">
        <button 
          onClick={() => state === 'report' ? setState('setup') : onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{state === 'report' ? 'New Assessment' : 'Back to Dashboard'}</span>
        </button>

        {state === 'setup' && (
          <div className="grid lg:grid-cols-2 gap-12 items-start animate-in fade-in duration-700">
            <div className="space-y-8">
              <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Assessment Engine</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">Test Your <br/><span className="text-blue-500">Knowledge.</span></h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Provide your study material or upload a PDF, and we'll generate a custom-tailored quiz to identify your gaps and master the topic.
                </p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Zap className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-bold mb-1">Instant Generation</h3>
                  <p className="text-xs text-slate-500">Proprietary logic mapping</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Trophy className="w-8 h-8 text-violet-500 mb-4" />
                  <h3 className="font-bold mb-1">Skill Tracking</h3>
                  <p className="text-xs text-slate-500">Historical performance data</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/10 space-y-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Content Source
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Extracting PDF Content...</span>
                    </div>
                  )}

                  {!material && !isParsingPdf && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all cursor-pointer"
                    >
                       <FileUp className="w-8 h-8 text-slate-700 mb-2" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Drop PDF or Click to Upload Material</span>
                    </div>
                  )}

                  <textarea 
                    placeholder="Paste text or specify topic..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                  
                  {material && (
                    <button 
                      onClick={() => setMaterial('')}
                      className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Questions</label>
                  <select 
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {[5, 10, 15, 20].map(c => <option key={c} value={c} className="bg-[#0a0f1d]">{c} Questions</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {['Easy', 'Medium', 'Hard'].map(l => <option key={l} value={l} className="bg-[#0a0f1d]">{l}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={startQuiz}
                disabled={!material.trim() || isParsingPdf}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 disabled:opacity-30 group active:scale-95"
              >
                Start Assessment
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700 text-center">
            <div className="relative mb-12">
              <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
              <div className="absolute inset-0 blur-3xl bg-blue-500/20 animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Curating your Quiz</h2>
            <p className="text-slate-400 max-w-sm text-lg">EDUNOVA AI is extracting key concepts and generating unique questions from your source material.</p>
          </div>
        )}

        {state === 'quiz' && questions.length > 0 && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
                </div>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">
                {difficulty} Mode
              </div>
            </div>

            <div className="glass-card p-10 md:p-14 rounded-[3rem] border-white/10 space-y-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Brain className="w-32 h-32 text-blue-500" />
              </div>
              
              <h3 className="text-3xl font-bold leading-tight text-white relative z-10">
                {questions[currentQuestionIndex].question}
              </h3>

              <div className="grid gap-4 relative z-10">
                {questions[currentQuestionIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-blue-600/10 hover:border-blue-500/50 transition-all group flex items-center justify-between active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/50 transition-all">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-lg font-medium text-slate-300 group-hover:text-white">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state === 'evaluating' && (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700 text-center">
             <div className="relative mb-12">
              <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Assessing Performance</h2>
            <p className="text-slate-400 max-w-sm text-lg">We are analyzing your logic and identifying specific areas that need focus.</p>
          </div>
        )}

        {state === 'report' && report && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-6xl font-black tracking-tighter mb-2">Quiz <span className="text-blue-500">Analytics</span></h1>
                <p className="text-slate-400 text-lg font-medium">Session complete. View your performance roadmap below.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setState('setup')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">New Drill</button>
                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20">Download Report</button>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-10 rounded-[2.5rem] border-white/10 text-center bg-gradient-to-b from-blue-600/5 to-transparent flex flex-col items-center">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-8">Overall Proficiency</span>
                  <div className="text-[10rem] font-black leading-none text-white tracking-tighter">{Math.round(report.score)}</div>
                  <div className="text-blue-400 font-bold text-xl mb-10">out of 10</div>
                  <div className={`px-6 py-2.5 rounded-full border text-sm font-black uppercase tracking-wider ${report.percentage >= 70 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {report.performanceLevel}
                  </div>
                </div>

                <div className="glass-card p-8 rounded-[2rem] border-white/10">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Topic-wise Accuracy
                  </h4>
                  <div className="space-y-6">
                    {report.topicAccuracy?.map((t: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>{t.topic}</span>
                          <span className="text-blue-400">{t.accuracy}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${t.accuracy}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 rounded-[2rem] border-white/10 bg-orange-600/[0.03]">
                    <h4 className="text-orange-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Incorrect Concepts
                    </h4>
                    <div className="space-y-4">
                      {report.missedConcepts?.map((c: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm text-slate-300 leading-relaxed group">
                           <XCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                           <span className="group-hover:text-white transition-colors">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-[2rem] border-white/10 bg-blue-600/[0.03]">
                    <h4 className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" /> Improvement Areas
                    </h4>
                    <div className="space-y-4">
                      {report.improvementAreas?.map((area: string, i: number) => (
                        <div key={i} className="flex gap-4 text-sm text-slate-300 leading-relaxed group">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                           <span className="group-hover:text-white transition-colors">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-blue-600/10 to-indigo-900/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Lightbulb className="w-40 h-40 text-blue-400" />
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row gap-12">
                      <div className="flex-1 space-y-6">
                        <h4 className="text-2xl font-bold flex items-center gap-3">
                          Revision Strategy
                        </h4>
                        <div className="grid gap-4">
                           {report.studyTips?.map((tip: string, i: number) => (
                             <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5 text-sm text-slate-300 leading-relaxed italic">
                                "{tip}"
                             </div>
                           ))}
                        </div>
                      </div>
                      <div className="md:w-px bg-white/10" />
                      <div className="md:w-72 flex flex-col justify-center text-center space-y-6">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Next Difficulty</span>
                         <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                           <span className="text-2xl font-black text-white">{report.nextDifficulty}</span>
                         </div>
                         <button onClick={() => setState('setup')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 active:scale-95">
                            Level Up
                         </button>
                      </div>
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

export default QuizAgent;

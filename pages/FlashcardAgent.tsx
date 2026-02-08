
import React, { useState, useRef } from 'react';
import { Page } from '../App';
import { 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  RotateCw, 
  CheckCircle2, 
  Loader2, 
  BookOpen, 
  Zap, 
  Trophy,
  Brain,
  Plus,
  ArrowRight,
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

interface FlashcardAgentProps {
  onNavigate: (page: Page) => void;
}

type FlashcardState = 'setup' | 'loading' | 'study' | 'report';

interface Flashcard {
  front: string;
  back: string;
  tag: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const FlashcardAgent: React.FC<FlashcardAgentProps> = ({ onNavigate }) => {
  const [state, setState] = useState<FlashcardState>('setup');
  const [material, setMaterial] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
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

  const generateFlashcards = async () => {
    if (!material.trim()) return;
    setState('loading');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Convert the following study material into high-quality flashcards for spaced repetition.
        
        Input Rules:
        Material: ${material}
        
        Output Rules:
        1. Atomic cards (one concept each).
        2. Question-answer format.
        3. Concise, factual answers (2-5 lines).
        4. Simple language.
        5. Return as JSON array of objects with keys: "front", "back", "tag", "difficulty" (Easy/Medium/Hard).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                tag: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ['front', 'back', 'tag', 'difficulty']
            }
          }
        }
      });

      const generatedCards = JSON.parse(response.text || '[]');
      setFlashcards(generatedCards);
      setState('study');
      setCurrentIndex(0);
      setKnownCount(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      setState('setup');
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setState('report');
    }
  };

  const markKnown = () => {
    setKnownCount(prev => prev + 1);
    handleNext();
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white selection:bg-blue-500/30">
      <Navbar onNavigate={onNavigate} variant="solid" />
      
      <div className="max-w-6xl mx-auto px-6 py-12 pt-32">
        <button 
          onClick={() => state === 'report' ? setState('setup') : onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{state === 'report' ? 'New Deck' : 'Back to Dashboard'}</span>
        </button>

        {state === 'setup' && (
          <div className="grid lg:grid-cols-2 gap-12 items-center animate-in fade-in duration-700">
            <div className="space-y-10">
              <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                  <Layers className="w-3.5 h-3.5" />
                  <span>SRS Intelligence</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Convert Notes to <br/><span className="text-blue-500">Atomic Cards.</span></h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  Leverage AI to slice your complex study material into efficient flashcards optimized for long-term retention. Now supporting PDF sources.
                </p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Zap className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-bold mb-1">Atomic Recall</h3>
                  <p className="text-xs text-slate-500">Single-concept focus</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <RotateCw className="w-8 h-8 text-indigo-500 mb-4" />
                  <h3 className="font-bold mb-1">Active Study</h3>
                  <p className="text-xs text-slate-500">Optimized for SRS</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/10 space-y-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Study Source
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Extracting PDF...</span>
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
                    placeholder="Paste your raw notes, concepts, or article text here..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
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

              <button 
                onClick={generateFlashcards}
                disabled={!material.trim() || isParsingPdf}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 disabled:opacity-30 group active:scale-95"
              >
                Generate Cards
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-700 text-center">
            <div className="relative mb-12">
              <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
              <div className="absolute inset-0 blur-[80px] bg-blue-500/30 animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter">Synthesizing Decks</h2>
            <p className="text-slate-400 max-w-sm text-lg font-medium">Gemini is analyzing your material to extract the most critical facts and relationships.</p>
          </div>
        )}

        {state === 'study' && flashcards.length > 0 && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-10 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-blue-500 font-bold text-xs uppercase tracking-widest">Card {currentIndex + 1} of {flashcards.length}</span>
                <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5">
                  {flashcards[currentIndex].difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20">
                  {flashcards[currentIndex].tag}
                </span>
              </div>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="group cursor-pointer perspective-1000 w-full h-[400px] mb-12"
            >
              <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden glass-card rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-white/10 shadow-2xl">
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Front</div>
                  <h3 className="text-3xl md:text-4xl font-black leading-tight">
                    {flashcards[currentIndex].front}
                  </h3>
                  <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    <RotateCw className="w-4 h-4" /> Click to reveal answer
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-blue-500/30 bg-blue-600/[0.02] shadow-2xl shadow-blue-900/10">
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Answer</div>
                  <p className="text-xl md:text-2xl font-medium text-slate-200 leading-relaxed max-w-lg">
                    {flashcards[currentIndex].back}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all disabled:opacity-30 border border-white/5"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handleNext}
                className="px-10 py-5 bg-white/5 rounded-[2rem] font-bold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 group active:scale-95"
              >
                Unsure
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={markKnown}
                className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3 active:scale-95"
              >
                Mastered
                <CheckCircle2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {state === 'report' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center">
            <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
              <Trophy className="w-16 h-16 text-blue-500" />
            </div>
            
            <h1 className="text-6xl font-black tracking-tighter">Session <span className="text-blue-500">Complete.</span></h1>
            <p className="text-slate-400 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              Fantastic momentum. You've audited <span className="text-white font-bold">{flashcards.length} key concepts</span> today.
            </p>

            <div className="grid md:grid-cols-3 gap-6 py-10">
              <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Mastery Rate</span>
                <div className="text-5xl font-black text-white">{Math.round((knownCount / flashcards.length) * 100)}%</div>
              </div>
              <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Cards Studied</span>
                <div className="text-5xl font-black text-white">{flashcards.length}</div>
              </div>
              <div className="glass-card p-8 rounded-[2.5rem] border-white/10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Known Cards</span>
                <div className="text-5xl font-black text-blue-500">{knownCount}</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setState('setup')}
                className="px-10 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                Another Deck
              </button>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3 active:scale-95"
              >
                Go to Dashboard
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default FlashcardAgent;

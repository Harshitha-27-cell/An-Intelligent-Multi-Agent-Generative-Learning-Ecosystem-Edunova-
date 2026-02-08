
import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  RefreshCcw,
  MessageSquare,
  BookOpen,
  Briefcase,
  Code,
  Image as ImageIcon,
  Type as TypeIcon,
  ChevronRight,
  Maximize2,
  Download,
  ShieldCheck
} from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import Navbar from '../components/Navbar';

interface AIStudyAssistantProps {
  onNavigate: (page: Page) => void;
}

type AssistantMode = 'explain' | 'visual';

interface Message {
  role: 'user' | 'assistant';
  content?: string;
  image?: string;
  type: 'text' | 'image';
}

const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<AssistantMode>('explain');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      type: 'text',
      content: "Hello! I'm your AI Study Assistant. I am ready to help you learn.\n\nI am currently in 'Explain Mode'. I will provide simple, clear explanations with confidence scores. Switch to 'Visual Mode' if you need a diagram or flowchart!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', type: 'text', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      if (mode === 'explain') {
        const chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are an AI Study Assistant for an EduTech learning platform. 
            You are operating in EXPLAIN MODE.
            
            PURPOSE: Help users understand concepts in a simple, clear, and readable manner.
            
            RULES:
            - Explain concepts as if teaching a student.
            - Use plain language, short paragraphs, and bullet points.
            - Avoid unnecessary jargon.
            - Give examples only if they improve clarity.
            - Keep answers concise and structured.
            - NO emojis.
            - NO markdown-heavy formatting (e.g., avoid excessive bolding or tables).
            
            MANDATORY OUTPUT STRUCTURE (EXACT ORDER):
            **Explanation**: [Your clear, student-friendly explanation]
            
            **Confidence Score**: [0-100]%
            
            **Why this confidence score?**: [Brief 1-2 line reasoning explaining the score based on clarity and completeness]`,
          },
        });

        setMessages(prev => [...prev, { role: 'assistant', type: 'text', content: '' }]);
        const stream = await chat.sendMessageStream({ message: textToSend });
        let fullResponse = '';

        for await (const chunk of stream) {
          const chunkText = (chunk as GenerateContentResponse).text || '';
          fullResponse += chunkText;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = fullResponse;
            return newMessages;
          });
        }
      } else {
        // Visual Mode
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `Generate a clean, modern educational visual for: ${textToSend}. 
            Format: Use flowcharts, block diagrams, or concept maps. 
            Rules: Minimal text inside visuals, clear labels, logical flow. 
            Style: Educational, neutral background, 16:9 aspect ratio. 
            Do NOT provide any text explanation, only the image.` }]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        let imageUrl = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        if (imageUrl) {
          setMessages(prev => [...prev, { role: 'assistant', type: 'image', image: imageUrl }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', type: 'text', content: "I was unable to generate a visual for this request. Please try a different prompt or switch to Explain Mode." }]);
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', type: 'text', content: "I encountered an error processing your request. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "Explain Recursion", icon: <Code className="w-4 h-4" />, mode: 'explain' as const },
    { label: "Diagram: DNS Lookup", icon: <ImageIcon className="w-4 h-4" />, mode: 'visual' as const },
    { label: "Career: Data Analyst", icon: <Briefcase className="w-4 h-4" />, mode: 'explain' as const },
    { label: "Flowchart: CI/CD", icon: <ImageIcon className="w-4 h-4" />, mode: 'visual' as const }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col">
      <Navbar onNavigate={onNavigate} variant="solid" />
      
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-32 pb-8 px-6">
        {/* Header with Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black flex items-center gap-2">
                <Bot className="w-6 h-6 text-blue-500" />
                AI Study Assistant
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Intelligence Session</span>
              </div>
            </div>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 self-start shadow-xl">
            <button 
              onClick={() => setMode('explain')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'explain' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <TypeIcon className="w-4 h-4" />
              Explain
            </button>
            <button 
              onClick={() => setMode('visual')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'visual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ImageIcon className="w-4 h-4" />
              Visual
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-8 pr-2 mb-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform hover:scale-105 ${msg.role === 'assistant' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              
              <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`p-6 rounded-[2rem] shadow-2xl relative overflow-hidden ${msg.role === 'assistant' ? 'glass-card border-white/10' : 'bg-blue-600 text-white'}`}>
                  {msg.type === 'text' ? (
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                       {msg.content}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative group cursor-zoom-in rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
                        <img src={msg.image} alt="Educational Visual" className="w-full h-auto rounded-2xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                           <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
                              <Maximize2 className="w-5 h-5" />
                           </button>
                           <a href={msg.image} download="diagram.png" className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all">
                              <Download className="w-5 h-5" />
                           </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                         <Sparkles className="w-3 h-3 text-indigo-400" />
                         AI Generated Diagram
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === 'assistant' && msg.type === 'text' && msg.content && msg.content.includes('Confidence Score') && (
                  <div className="flex items-center gap-2 px-4 py-1">
                     <ShieldCheck className="w-3 h-3 text-green-500" />
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                       Verified Educational Insight
                     </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-5 animate-pulse">
               <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border-2 border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Bot className="w-6 h-6" />
               </div>
               <div className="glass-card p-6 rounded-[2rem] border-white/10 flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    {mode === 'visual' ? 'Generating Visual...' : 'Crafting Explanation...'}
                  </span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Area */}
        <div className="space-y-6">
          {messages.length < 4 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setMode(s.mode);
                    handleSend(undefined, s.label);
                  }}
                  className="glass-card p-5 rounded-[2rem] border-white/5 hover:border-blue-500/30 text-left group transition-all"
                >
                  <div className={`mb-3 p-2 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${s.mode === 'visual' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest leading-tight block">{s.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <form onSubmit={handleSend} className="relative z-10">
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                {mode === 'explain' ? <TypeIcon className="w-5 h-5 text-blue-500" /> : <ImageIcon className="w-5 h-5 text-indigo-500" />}
              </div>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'explain' ? "What concept should I explain?" : "What process should I visualize?"}
                className={`w-full bg-white/5 border-2 rounded-[2.5rem] py-6 px-16 text-white placeholder:text-slate-600 focus:outline-none transition-all shadow-2xl ${mode === 'explain' ? 'border-white/10 focus:border-blue-500/50' : 'border-white/10 focus:border-indigo-500/50'}`}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-30 shadow-lg ${mode === 'explain' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'}`}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </form>
            <div className={`absolute inset-0 blur-[60px] opacity-20 -z-10 transition-colors duration-500 ${mode === 'explain' ? 'bg-blue-500' : 'bg-indigo-500'}`} />
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${mode === 'explain' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-700'}`} />
               <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${mode === 'explain' ? 'text-blue-400' : 'text-slate-500'}`}>Explain Mode</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${mode === 'visual' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`} />
               <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${mode === 'visual' ? 'text-indigo-400' : 'text-slate-500'}`}>Visual Mode</span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AIStudyAssistant;

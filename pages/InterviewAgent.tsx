import React, { useState, useRef, useEffect } from 'react';
import { Page } from '../App';
import { 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Square, 
  CheckCircle2, 
  MessageSquare, 
  Trophy, 
  AlertCircle,
  Loader2, 
  Sparkles, 
  ChevronRight, 
  Activity,
  Lightbulb
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import Navbar from '../components/Navbar';

interface InterviewAgentProps {
  onNavigate: (page: Page) => void;
}

type InterviewState = 'setup' | 'active' | 'evaluating' | 'report';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const InterviewAgent: React.FC<InterviewAgentProps> = ({ onNavigate }) => {
  const [state, setState] = useState<InterviewState>('setup');
  const [isConnecting, setIsConnecting] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');
  
  const [config, setConfig] = useState({
    role: '',
    experience: 'Fresher',
    type: 'Technical',
    questionLimit: 10
  });

  const [report, setReport] = useState<any | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  // Effect to attach stream when video element becomes available in 'active' state
  useEffect(() => {
    if (state === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [state]);

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    if (!config.role) return;
    setIsConnecting(true);
    setUserTranscript('');
    setModelTranscript('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                if (micActive) {
                  session.sendRealtimeInput({ media: pcmBlob });
                }
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (!canvasRef.current || !videoRef.current || !videoActive) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              
              canvasRef.current.width = videoRef.current.videoWidth || 640;
              canvasRef.current.height = videoRef.current.videoHeight || 480;
              ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
              
              canvasRef.current.toBlob(
                async (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64Data = (reader.result as string).split(',')[1];
                      sessionPromise.then((session) => {
                        session.sendRealtimeInput({
                          media: { data: base64Data, mimeType: 'image/jpeg' }
                        });
                      });
                    };
                    reader.readAsDataURL(blob);
                  }
                },
                'image/jpeg',
                0.6
              );
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setModelTranscript(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setUserTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContextRef.current!,
                24000,
                1,
              );
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: `You are an AI Mock Interviewer for an EduTech career-preparation platform.
          Target Job Role: ${config.role}
          Experience Level: ${config.experience}
          Interview Type: ${config.type}

          INTERVIEW RULES:
          - Ask one question at a time.
          - Ask exactly 8–10 questions total.
          - Adjust difficulty based on the user's answers.
          - Wait for the user's response before continuing.
          - Allow the user to type or say "End Interview" to terminate early.
          - Automatically end the interview after the final question and give a brief professional sign-off.
          
          TONE & BEHAVIOR:
          - Professional and realistic.
          - Encouraging, not harsh.
          - Simulate a real interviewer, not a tutor. Avoid long monologues.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });
      
      sessionRef.current = await sessionPromise;
      setIsConnecting(false);
      setState('active');
    } catch (error) {
      console.error('Failed to start interview:', error);
      setIsConnecting(false);
      stopSession();
    }
  };

  const endInterview = async () => {
    setState('evaluating');
    const finalTranscripts = { user: userTranscript, model: modelTranscript };
    stopSession();
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Evaluate the following interview for a ${config.role} role. Provide a high-fidelity evaluation report.
        User Transcript: ${finalTranscripts.user}
        Interviewer Transcript: ${finalTranscripts.model}
        
        Return the result as JSON with this structure:
        {
          "overallScore": number (0-10),
          "verdict": "Hire" | "No-Hire",
          "parameters": {
            "communication": number (0-10),
            "technical": number (0-10),
            "problemSolving": number (0-10),
            "confidence": number (0-10),
            "readiness": number (0-10),
            "clarity": number (0-10)
          },
          "strengths": string[],
          "weaknesses": string[],
          "feedback": string,
          "recommendations": string[],
          "reviseTopics": string[]
        }`,
        config: { responseMimeType: 'application/json' }
      });
      
      const evaluation = JSON.parse(response.text);
      setReport(evaluation);
      setState('report');
    } catch (error) {
      console.error('Evaluation failed:', error);
      setState('setup');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      <Navbar onNavigate={onNavigate} variant="solid" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <button 
          onClick={() => state === 'report' ? setState('setup') : onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{state === 'report' ? 'New Interview' : 'Back to Dashboard'}</span>
        </button>

        {state === 'setup' && (
          <div className="grid lg:grid-cols-2 gap-12 items-center animate-in fade-in duration-700">
            <div className="space-y-10">
              <header>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Interactive Career Lab</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Face Your Next <br/><span className="text-blue-500">Big Opportunity.</span></h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  Practice with our high-fidelity Gemini AI simulator. Get parameter-wise feedback on your communication, logic, and role readiness.
                </p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Mic className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-bold mb-1">Voice Protocol</h3>
                  <p className="text-xs text-slate-500">Native real-time audio interaction</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Sparkles className="w-8 h-8 text-indigo-500 mb-4" />
                  <h3 className="font-bold mb-1">Smart Analytics</h3>
                  <p className="text-xs text-slate-500">Hire/No-Hire verdict insights</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-white/10 space-y-8 shadow-2xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Job Role</label>
                  <input 
                    type="text" 
                    value={config.role}
                    onChange={(e) => setConfig({...config, role: e.target.value})}
                    placeholder="e.g. Software Developer, Data Analyst"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience Level</label>
                    <select 
                      value={config.experience}
                      onChange={(e) => setConfig({...config, experience: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option className="bg-[#0a0f1d]">Fresher</option>
                      <option className="bg-[#0a0f1d]">Intermediate</option>
                      <option className="bg-[#0a0f1d]">Experienced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Interview Type</label>
                    <select 
                      value={config.type}
                      onChange={(e) => setConfig({...config, type: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option className="bg-[#0a0f1d]">Technical</option>
                      <option className="bg-[#0a0f1d]">HR</option>
                      <option className="bg-[#0a0f1d]">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={startSession}
                disabled={isConnecting || !config.role}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Begin Assessment'}
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {state === 'active' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[600px]">
            <div className="lg:col-span-8 glass-card rounded-[2.5rem] relative overflow-hidden bg-slate-900/40 border border-white/10">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-1000 ${videoActive ? 'opacity-100' : 'opacity-0'}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 z-20">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Live Interview</span>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/10 z-20">
                <button onClick={() => setMicActive(!micActive)} className={`p-4 rounded-2xl transition-all ${micActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-red-500/20 text-red-500'}`}>
                  {micActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <button onClick={() => setVideoActive(!videoActive)} className={`p-4 rounded-2xl transition-all ${videoActive ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-500'}`}>
                  {videoActive ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                <div className="w-px h-10 bg-white/10" />
                <button onClick={endInterview} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-red-500 transition-all">
                  <Square className="w-4 h-4 fill-current" /> Terminate Session
                </button>
              </div>
            </div>
            <div className="lg:col-span-4 glass-card p-8 rounded-[2.5rem] flex flex-col overflow-hidden border border-white/10">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Transcription Stream
              </h4>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {modelTranscript && (
                  <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 text-sm italic text-slate-300 leading-relaxed">
                    {modelTranscript}
                  </div>
                )}
                {userTranscript && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-sm font-medium text-white leading-relaxed">
                    {userTranscript}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {state === 'evaluating' && (
          <div className="flex flex-col items-center justify-center py-40 animate-in fade-in text-center">
            <Loader2 className="w-20 h-20 text-blue-500 animate-spin mb-8" />
            <h2 className="text-4xl font-black mb-4 tracking-tighter">Auditing Your Performance</h2>
            <p className="text-slate-400 max-w-sm text-lg font-medium">Gemini is checking communication, role readiness, and problem-solving metrics.</p>
          </div>
        )}

        {state === 'report' && report && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-6xl font-black tracking-tighter mb-2">Performance <span className="text-blue-500">Audit</span></h1>
                <p className="text-slate-400 text-lg font-medium">Session complete. View your {config.role} readiness below.</p>
              </div>
              <div className="flex gap-4">
                <div className={`px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 border ${report.verdict === 'Hire' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  Verdict: {report.verdict}
                </div>
                <button onClick={() => setState('setup')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20">New Practice</button>
              </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-10 rounded-[2.5rem] border-white/10 text-center bg-gradient-to-b from-blue-600/5 to-transparent">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-10 block">Weighted Score</span>
                  <div className="text-[10rem] font-black leading-none text-white tracking-tighter">{report.overallScore}</div>
                  <div className="text-blue-400 font-bold text-xl mb-10">out of 10</div>
                  <div className="grid grid-cols-2 gap-4">
                    <ParameterStat label="Comm." value={report.parameters?.communication} />
                    <ParameterStat label="Tech" value={report.parameters?.technical} />
                    <ParameterStat label="Logic" value={report.parameters?.problemSolving} />
                    <ParameterStat label="Confidence" value={report.parameters?.confidence} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 rounded-[2rem] border-white/10">
                    <h4 className="text-green-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Observed Strengths
                    </h4>
                    <div className="space-y-3">
                      {report.strengths?.map((s: string, i: number) => <div key={i} className="text-sm text-slate-300 font-medium leading-relaxed flex gap-2"><span>•</span> {s}</div>)}
                    </div>
                  </div>
                  <div className="glass-card p-8 rounded-[2rem] border-white/10">
                    <h4 className="text-orange-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Growth Targets
                    </h4>
                    <div className="space-y-3">
                      {report.weaknesses?.map((w: string, i: number) => <div key={i} className="text-sm text-slate-300 font-medium leading-relaxed flex gap-2"><span>•</span> {w}</div>)}
                    </div>
                  </div>
                </div>
                <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Lightbulb className="w-24 h-24 text-blue-400" />
                  </div>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-3">
                    Expert Evaluation Summary
                  </h4>
                  <p className="text-slate-300 text-lg leading-relaxed italic relative z-10">"{report.feedback}"</p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {report.reviseTopics?.map((t: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        Revise: {t}
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

const ParameterStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{value}/10</p>
  </div>
);

export default InterviewAgent;

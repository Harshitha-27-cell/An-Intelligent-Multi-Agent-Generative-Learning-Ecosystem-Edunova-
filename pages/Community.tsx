
import React, { useState } from 'react';
import { Page } from '../App';
import { 
  Compass, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Filter, 
  Award, 
  MoreHorizontal, 
  ArrowUp, 
  Plus, 
  ShieldCheck, 
  Users, 
  Tag, 
  BookOpen, 
  Briefcase, 
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Zap,
  Check
} from 'lucide-react';

interface CommunityProps {
  onNavigate: (page: Page) => void;
}

type Category = 'All' | 'Subject Discussions' | 'Interview Prep' | 'Career Guidance' | 'Resources';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  title: string;
  content: string;
  category: Category;
  tags: string[];
  upvotes: number;
  replies: number;
  isAiVerified?: boolean;
  time: string;
}

const initialPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
      role: 'Data Science Student'
    },
    title: 'How to handle "Explain Transformers like I am five" in a tech interview?',
    content: 'I have a Google interview coming up for an internship role. They specifically asked about NLP concepts in the initial screening...',
    category: 'Interview Prep',
    tags: ['Google', 'NLP', 'Internship'],
    upvotes: 42,
    replies: 12,
    isAiVerified: true,
    time: '2h ago'
  },
  {
    id: '2',
    author: {
      name: 'Marcus Thorne',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
      role: 'Senior Frontend Dev'
    },
    title: 'Best patterns for scalable React 19 applications?',
    content: 'With the new React Compiler coming out, how are you guys rethinking your state management strategies? I have been looking at Zustand...',
    category: 'Subject Discussions',
    tags: ['React', 'Architecture', 'WebDev'],
    upvotes: 128,
    replies: 34,
    isAiVerified: false,
    time: '5h ago'
  },
  {
    id: '3',
    author: {
      name: 'Alex Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
      role: 'Fullstack Dev'
    },
    title: 'Common pitfalls in AWS Cloud Practitioner exam?',
    content: 'Just started my cloud journey. Looking for specific areas that people often miss in the exam. Any recommendations for practice sets?',
    category: 'Resources',
    tags: ['AWS', 'Cloud', 'Certification'],
    upvotes: 56,
    replies: 8,
    isAiVerified: true,
    time: '8h ago'
  }
];

const Community: React.FC<CommunityProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // New Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Category>('Subject Discussions');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsPublishing(true);
    // Simulate minor delay for "AI verification" check
    await new Promise(resolve => setTimeout(resolve, 800));

    const tagsArray = newPostTags
      .split(',')
      .map(t => t.trim().replace('#', ''))
      .filter(t => t !== '');

    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      author: {
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
        role: 'Fullstack Dev'
      },
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
      upvotes: 0,
      replies: 0,
      isAiVerified: true, // Auto-verified by "EDUNOVA AI"
      time: 'Just now'
    };

    setPosts([newPost, ...posts]);
    setIsPublishing(false);
    setShowAskModal(false);
    
    // Reset Form
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
    setNewPostCategory('Subject Discussions');
  };

  const filteredPosts = posts.filter(post => 
    (activeCategory === 'All' || post.category === activeCategory) &&
    (post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     post.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white selection:bg-blue-500/30">
      {/* Navbar Integration */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-10 sticky top-0 bg-[#0a0f1d]/90 backdrop-blur-md z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">EDUNOVA AI</span>
        </div>

        <div className="flex-1 max-w-xl mx-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-4 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search discussions, resources, or topics..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            onClick={() => setShowAskModal(true)}>
            <Plus className="w-4 h-4" /> Ask Question
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="User avatar" />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 md:px-10 py-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Navigation & Filters */}
          <aside className="lg:col-span-3 space-y-8 sticky top-24 hidden lg:block">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Categories</h3>
              <CategoryItem label="All" active={activeCategory === 'All'} onClick={() => setActiveCategory('All')} />
              <CategoryItem label="Subject Discussions" icon={<BookOpen className="w-4 h-4" />} active={activeCategory === 'Subject Discussions'} onClick={() => setActiveCategory('Subject Discussions')} />
              <CategoryItem label="Interview Prep" icon={<Users className="w-4 h-4" />} active={activeCategory === 'Interview Prep'} onClick={() => setActiveCategory('Interview Prep')} />
              <CategoryItem label="Career Guidance" icon={<Briefcase className="w-4 h-4" />} active={activeCategory === 'Career Guidance'} onClick={() => setActiveCategory('Career Guidance')} />
              <CategoryItem label="Resources" icon={<TrendingUp className="w-4 h-4" />} active={activeCategory === 'Resources'} onClick={() => setActiveCategory('Resources')} />
            </div>

            <div className="glass-card p-6 rounded-[2rem] border-white/10 space-y-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Filter className="w-3 h-3" /> Quick Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-all">Unanswered</button>
                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white transition-all">Resolved</button>
                <button className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">AI Verified Only</button>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/10 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                <Award className="w-4 h-4" /> Top Contributors
              </div>
              <div className="space-y-4">
                <ContributorItem name="Sarah C." score="2,450" />
                <ContributorItem name="Marcus T." score="1,820" />
                <ContributorItem name="Elena V." score="1,540" />
              </div>
            </div>
          </aside>

          {/* Center Panel: Feed */}
          <section className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black tracking-tight">{activeCategory} Discussions</h2>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Sort by: <span className="text-white cursor-pointer hover:text-blue-400">Trending</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.map(post => (
                <DiscussionCard key={post.id} post={post} />
              ))}
              {filteredPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass-card rounded-[3rem] border-white/5">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-slate-700" />
                   </div>
                   <h3 className="text-xl font-bold">No discussions found</h3>
                   <p className="text-slate-500 max-w-xs text-sm">We couldn't find any discussions matching your criteria. Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Panel: Smart Assistance */}
          <aside className="lg:col-span-3 space-y-6 sticky top-24 hidden lg:block">
            <div className="glass-card p-8 rounded-[3rem] border-white/10 bg-gradient-to-br from-blue-600/10 to-transparent relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Sparkles className="w-20 h-20 text-blue-400" />
               </div>
               <h3 className="text-lg font-black tracking-tight mb-4 relative z-10">AI Smart Feed</h3>
               <p className="text-xs text-slate-400 leading-relaxed mb-6 relative z-10 font-medium">
                 Based on your current <span className="text-white">Frontend Roadmap</span>, these discussions might interest you:
               </p>
               <div className="space-y-4 relative z-10">
                  <SuggestedItem title="React Server Components: The full guide" icon={<BookOpen className="w-3 h-3" />} />
                  <SuggestedItem title="Mock Technical Interview with FAANG seniors" icon={<Users className="w-3 h-3" />} />
                  <SuggestedItem title="New CSS anchor positioning tutorial" icon={<Zap className="w-3 h-3" />} />
               </div>
            </div>

            <div className="glass-card p-6 rounded-[2.5rem] border-white/10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['#React19', '#AWS_Cert', '#DSA_Cracker', '#Remote_Internship', '#System_Design', '#TypeScript'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-blue-400 cursor-pointer transition-colors border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 border border-white/5 rounded-[2.5rem] space-y-4 bg-white/[0.02]">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Community Rules
               </h4>
               <ul className="space-y-2 text-[10px] text-slate-500 font-medium list-disc pl-4">
                  <li>Be respectful and academically focused.</li>
                  <li>Avoid duplicate low-quality questions.</li>
                  <li>Use descriptive titles with relevant tags.</li>
               </ul>
            </div>
          </aside>

        </div>
      </main>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#0a0f1d]/80 backdrop-blur-md" onClick={() => setShowAskModal(false)} />
          <div className="glass-card w-full max-w-2xl rounded-[3rem] border-white/10 p-10 animate-in fade-in zoom-in duration-300 relative z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight">Post a Question</h2>
              <button onClick={() => setShowAskModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Plus className="w-6 h-6 rotate-45 text-slate-500" /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question Title</label>
                <input 
                  type="text" 
                  placeholder="Be specific and concise..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Context & Details</label>
                <textarea 
                  placeholder="Describe what you are trying to solve or discuss..." 
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags (e.g. #javascript, #logic)</label>
                   <input 
                    type="text" 
                    placeholder="Comma separated tags..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                   <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as Category)}
                   >
                      <option className="bg-[#0a0f1d]" value="Subject Discussions">Subject Discussion</option>
                      <option className="bg-[#0a0f1d]" value="Interview Prep">Interview Prep</option>
                      <option className="bg-[#0a0f1d]" value="Career Guidance">Career Guidance</option>
                      <option className="bg-[#0a0f1d]" value="Resources">Resources</option>
                   </select>
                </div>
              </div>
              <button 
                onClick={handlePublish}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || isPublishing}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
              >
                 {isPublishing ? (
                   <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                   <>
                    Publish Discussion
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                   </>
                 )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryItem: React.FC<{ label: string; icon?: React.ReactNode; active?: boolean; onClick: () => void }> = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${active ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    <div className="flex items-center gap-3">
      {icon || <TrendingUp className="w-4 h-4" />}
      <span className="text-sm font-bold">{label}</span>
    </div>
    <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
  </button>
);

const ContributorItem: React.FC<{ name: string; score: string }> = ({ name, score }) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 overflow-hidden">
        <img src={`https://i.pravatar.cc/100?u=${name}`} className="w-full h-full object-cover" alt={name} />
      </div>
      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{name}</span>
    </div>
    <div className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
      {score} XP
    </div>
  </div>
);

const DiscussionCard: React.FC<{ post: Post }> = ({ post }) => (
  <div className="glass-card p-8 rounded-[3rem] border-white/5 hover:border-white/10 transition-all group cursor-pointer active:scale-[0.99] relative overflow-hidden">
    {post.isAiVerified && (
      <div className="absolute top-0 right-0 p-8 opacity-5">
         <Sparkles className="w-24 h-24 text-blue-500" />
      </div>
    )}
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
            <img src={post.author.avatar} className="w-full h-full object-cover" alt={post.author.name} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white leading-none mb-1">{post.author.name}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{post.author.role} • {post.time}</p>
          </div>
          <div className="flex items-center gap-2">
             {post.isAiVerified && (
               <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3 h-3" /> AI Verified
               </div>
             )}
             <div className="hidden sm:block px-3 py-1 bg-white/5 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">
               {post.category}
             </div>
          </div>
        </div>

        <h3 className="text-xl font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 font-medium italic">
          "{post.content}"
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-white/5 rounded-md border border-white/5">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="md:w-px bg-white/10 self-stretch" />

      <div className="md:w-24 flex md:flex-col justify-between md:justify-center items-center gap-6">
         <div className="text-center group/vote hover:scale-110 transition-transform">
            <ArrowUp className="w-6 h-6 text-slate-500 group-hover/vote:text-blue-400 mb-1 mx-auto" />
            <span className="text-sm font-black text-slate-400 group-hover/vote:text-white">{post.upvotes}</span>
         </div>
         <div className="text-center">
            <MessageSquare className="w-6 h-6 text-slate-700 mb-1 mx-auto" />
            <span className="text-sm font-black text-slate-500">{post.replies}</span>
         </div>
      </div>
    </div>
  </div>
);

const SuggestedItem: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
       {icon}
    </div>
    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors truncate">{title}</span>
  </div>
);

export default Community;

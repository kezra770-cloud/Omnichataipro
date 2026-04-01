import React, { useState, useEffect } from 'react';
import { 
  Settings, MessageSquare, Globe, Share2, Code, Palette, Sparkles, 
  Layout, Database, ShieldCheck, LogIn, LogOut, User as UserIcon, 
  Plus, Save, Image as ImageIcon, Volume2, Mic, BrainCircuit, Rocket, Bot,
  ShoppingBag, Moon, MessageCircle, Instagram, Slack, Send, Disc, Twitter, Linkedin,
  Music, Video, Radio, Sliders, Youtube, Play, Library, BarChart3, Layers, Users
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import ChatInterface, { CHAT_TEMPLATES } from './components/ChatInterface';
import Auth from './components/Auth';
import MediaStudio from './components/MediaStudio';
import AnalyticsView from './components/AnalyticsView';
import MarketplaceView from './components/MarketplaceView';
import SettingsView from './components/SettingsView';
import { cn } from './lib/utils';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, doc, setDoc, query, where, onSnapshot, Timestamp, User 
} from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'logic' | 'studio' | 'analytics' | 'marketplace' | 'deploy' | 'settings'>('design');
  const [botName, setBotName] = useState('My Assistant');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [systemInstruction, setSystemInstruction] = useState('You are a helpful AI assistant.');
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState({
    imageGen: true,
    tts: true,
    voice: false,
    reasoning: true,
    media: true,
    mixer: true,
    kb: true
  });

  const toggleCapability = (key: keyof typeof capabilities) => {
    setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated!`);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProjects([]);
        setCurrentProjectId(null);
      }
    });
    
    toast.info('Welcome to OmniChat Builder! Start by designing your bot.', {
      description: 'You can customize the name, color, and AI behavior in the sidebar.',
      duration: 5000,
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    // This is now handled by the Auth component
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const saveProject = async () => {
    if (!user) {
      toast.error('Please login to save your project');
      return;
    }

    const projectData = {
      name: botName,
      accentColor,
      systemInstruction,
      userId: user.uid,
      updatedAt: Timestamp.now(),
    };

    try {
      const id = currentProjectId || Date.now().toString();
      await setDoc(doc(db, 'projects', id), projectData, { merge: true });
      setCurrentProjectId(id);
      toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    }
  };

  const loadProject = (proj: any) => {
    setBotName(proj.name);
    setAccentColor(proj.accentColor);
    setSystemInstruction(proj.systemInstruction);
    setCurrentProjectId(proj.id);
    toast.info(`Loaded ${proj.name}`);
  };

  const createNew = () => {
    setBotName('New Bot');
    setAccentColor('#3b82f6');
    setSystemInstruction('You are a helpful AI assistant.');
    setCurrentProjectId(null);
    toast.info('Started new project');
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-right" theme="dark" />
        <Auth onSuccess={() => toast.success('Welcome to OmniChat!')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neon-black flex flex-col font-sans text-slate-300">
      <Toaster position="top-right" theme="dark" />
      
      {/* Navigation Bar */}
      <header className="h-20 bg-neon-black/80 backdrop-blur-2xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={createNew}>
          <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-2xl flex items-center justify-center text-white shadow-xl shadow-neon-cyan/20 group-hover:rotate-6 transition-all duration-500">
            <Sparkles size={26} />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight leading-none text-white">OmniChat</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.3em]">Studio Pro</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v2.4</span>
            </div>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 bg-white/5 p-1.5 rounded-[1.25rem] border border-white/5 backdrop-blur-md">
          {(['design', 'logic', 'studio', 'analytics', 'marketplace', 'deploy', 'settings'] as const).filter(id => {
            if (id === 'studio') return capabilities.media;
            return true;
          }).map((id) => {
            const icons = { design: Palette, logic: BrainCircuit, studio: Music, analytics: BarChart3, marketplace: ShoppingBag, deploy: Rocket, settings: Settings };
            const labels = { design: 'Design', logic: 'Logic', studio: 'Studio', analytics: 'Analytics', marketplace: 'Marketplace', deploy: 'Deploy', settings: 'Settings' };
            const Icon = icons[id];
            return (
              <button 
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5",
                  activeTab === id 
                    ? "bg-white text-neon-black shadow-lg shadow-white/20 scale-105" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {labels[id]}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={createNew}
              className="p-3 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/10 rounded-2xl transition-all border border-transparent hover:border-neon-cyan/20"
              title="New Project"
            >
              <Plus size={22} />
            </button>
            <button 
              onClick={saveProject}
              className="px-6 py-3 bg-white text-neon-black rounded-2xl text-sm font-bold hover:bg-neon-cyan hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-white/5"
            >
              <Save size={18} />
              Save
            </button>
            <div className="h-10 w-[1px] bg-white/5 mx-1" />
            <div className="flex items-center -space-x-2 mr-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-neon-black bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  {['JD', 'AS', 'MK'][i-1]}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-neon-black bg-neon-cyan flex items-center justify-center text-[10px] font-bold text-neon-black shadow-lg animate-pulse">
                +1
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} 
                  alt={user.displayName || ''} 
                  className="w-10 h-10 rounded-full border-2 border-white/10 shadow-sm group-hover:scale-110 transition-transform cursor-pointer" 
                />
                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
              </div>
              <button 
                onClick={handleLogout} 
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar / Controls */}
        <aside className="w-[400px] bg-neon-black border-r border-white/5 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Globe size={16} className="text-slate-500 group-focus-within:text-neon-cyan transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search features, templates..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-neon-cyan outline-none transition-all text-xs font-bold text-white placeholder:text-slate-600"
            />
          </div>

          {projects.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-5">Your Projects</h2>
              <div className="space-y-3">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-4 group",
                      currentProjectId === p.id 
                        ? "bg-white/5 border-neon-cyan/30 shadow-lg shadow-neon-cyan/5" 
                        : "bg-white/5 border-transparent hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110",
                      currentProjectId === p.id ? "bg-neon-cyan" : "bg-slate-700"
                    )}
                    style={currentProjectId === p.id ? { backgroundColor: p.accentColor } : {}}
                    >
                      <Bot size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate group-hover:text-neon-cyan transition-colors">{p.name}</div>
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                        Updated {p.updatedAt?.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Appearance</h2>
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-400 ml-1">Bot Name</label>
                    <input 
                      type="text" 
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-transparent rounded-xl focus:bg-white/10 focus:border-neon-cyan outline-none transition-all text-sm font-medium text-white"
                      placeholder="e.g. Support Bot"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 ml-1">Brand Color</label>
                    <div className="flex gap-3 flex-wrap">
                      {['#00ffff', '#ff00ff', '#39ff14', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff'].map(color => (
                        <button
                          key={color}
                          onClick={() => setAccentColor(color)}
                          className={cn(
                            "w-10 h-10 rounded-2xl border-4 transition-all shadow-md hover:scale-110 active:scale-95",
                            accentColor === color ? "border-white ring-2 ring-neon-cyan shadow-xl" : "border-transparent ring-1 ring-white/10"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="relative group">
                        <input 
                          type="color" 
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-2xl overflow-hidden border-4 border-transparent ring-1 ring-white/10 p-0 cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Interface</h2>
                <div className="space-y-4">
                  <button className="w-full p-5 bg-white/5 border-2 border-transparent rounded-[1.5rem] text-left hover:border-neon-cyan/30 hover:bg-white/10 hover:shadow-xl hover:shadow-neon-cyan/5 transition-all flex items-center gap-5 group">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl shadow-sm text-neon-cyan flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5"><Layout size={24} /></div>
                    <div>
                      <span className="block text-sm font-bold text-white">Layout Options</span>
                      <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Full page, popup, or bubble</span>
                    </div>
                  </button>
                  <button className="w-full p-5 bg-white/5 border-2 border-transparent rounded-[1.5rem] text-left hover:border-neon-magenta/30 hover:bg-white/10 hover:shadow-xl hover:shadow-neon-magenta/5 transition-all flex items-center gap-5 group">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl shadow-sm text-neon-magenta flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5"><MessageSquare size={24} /></div>
                    <div>
                      <span className="block text-sm font-bold text-white">Chat Bubbles</span>
                      <span className="block text-[10px] font-medium text-slate-500 mt-0.5">Modern, classic, or minimal</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Theme Engine</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Neon', icon: Sparkles, color: 'text-neon-cyan' },
                    { name: 'Dark', icon: Moon, color: 'text-slate-400' },
                    { name: 'Glass', icon: Layout, color: 'text-white' },
                  ].map((theme) => (
                    <button 
                      key={theme.name}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:border-neon-cyan transition-all group"
                    >
                      <theme.icon size={20} className={cn(theme.color, "group-hover:scale-110 transition-transform")} />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase tracking-widest">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logic' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">AI Configuration</h2>
                <div className="space-y-6">
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-400 ml-1">System Instructions</label>
                    <textarea 
                      rows={6}
                      value={systemInstruction}
                      onChange={(e) => setSystemInstruction(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-transparent rounded-xl focus:bg-white/10 focus:border-neon-cyan outline-none transition-all text-sm font-medium text-white resize-none leading-relaxed"
                      placeholder="Define how your bot should behave..."
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Quick Templates</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {CHAT_TEMPLATES.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => {
                            setSystemInstruction(template.instruction);
                            toast.success(`Applied ${template.name} template!`);
                          }}
                          className={cn(
                            "p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-4 group",
                            systemInstruction === template.instruction 
                              ? "bg-white/10 border-neon-cyan/30" 
                              : "bg-white/5 border-transparent hover:border-white/10"
                          )}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{template.icon}</span>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">{template.name}</div>
                            <div className="text-[10px] font-medium text-slate-500 line-clamp-1 mt-0.5">{template.instruction}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Capabilities</h2>
                <div className="space-y-3">
                  {[
                    { id: 'imageGen', icon: ImageIcon, label: 'Image Generation', color: 'text-neon-magenta' },
                    { id: 'tts', icon: Volume2, label: 'Text to Speech', color: 'text-neon-cyan' },
                    { id: 'voice', icon: Mic, label: 'Voice Response', color: 'text-neon-lime' },
                    { id: 'reasoning', icon: BrainCircuit, label: 'High Reasoning', color: 'text-purple-400' },
                    { id: 'media', icon: Library, label: 'Media Library', color: 'text-blue-400' },
                    { id: 'mixer', icon: Sliders, label: 'DJ Mixer', color: 'text-orange-400' },
                    { id: 'kb', icon: Database, label: 'Knowledge Base', color: 'text-neon-cyan' },
                  ].map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => toggleCapability(item.id as any)}
                      className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border-2 border-transparent hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={20} className={cn(item.color, "group-hover:scale-110 transition-transform")} />
                        <span className="text-sm font-bold text-slate-300">{item.label}</span>
                      </div>
                      <div className={cn(
                        "w-11 h-6 rounded-full relative transition-all duration-300",
                        capabilities[item.id as keyof typeof capabilities] ? "bg-neon-cyan" : "bg-slate-700"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
                          capabilities[item.id as keyof typeof capabilities] ? "right-1" : "right-6"
                        )} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {capabilities.tts && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Voice Selection</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map((voice) => (
                      <button 
                        key={voice}
                        className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:border-neon-cyan/30 transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-neon-cyan">{voice}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Neural Engine</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {capabilities.kb && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Knowledge Base (RAG)</h2>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 hover:border-neon-cyan transition-all cursor-pointer group">
                      <div className="p-2.5 bg-slate-800 rounded-xl text-neon-cyan group-hover:scale-110 transition-transform">
                        <Plus size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Upload Documents</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">PDF, DOCX, TXT (Max 50MB)</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'Company_Handbook.pdf', size: '2.4 MB', type: 'PDF' },
                        { name: 'Product_Specs.docx', size: '1.1 MB', type: 'DOCX' },
                      ].map((doc) => (
                        <div key={doc.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-3">
                            <Database size={14} className="text-slate-500" />
                            <div className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{doc.name}</div>
                          </div>
                          <div className="text-[10px] font-bold text-slate-600">{doc.size}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-white/10 rounded-[2rem] text-white shadow-xl shadow-neon-cyan/5 relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                      <Sparkles size={16} className="text-neon-cyan" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">Pro Tip</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-90 text-slate-300">
                    Use specific system instructions to define your bot's personality and tone for a more engaging experience.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'studio' && (
            <MediaStudio />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'marketplace' && (
            <MarketplaceView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Integration</h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Websites</h3>
                    <button 
                      onClick={() => toast.success('Embed code copied to clipboard!')}
                      className="w-full p-5 bg-white text-neon-black rounded-2xl text-left hover:bg-neon-cyan transition-all flex items-center justify-between group shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-neon-black/10 rounded-xl group-hover:scale-110 transition-transform">
                          <Code size={22} className="text-neon-black" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Web Widget</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">Copy script tag</div>
                        </div>
                      </div>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Shopify', icon: ShoppingBag },
                        { name: 'WordPress', icon: Globe },
                        { name: 'Wix', icon: Layout },
                        { name: 'Squarespace', icon: Moon },
                      ].map(platform => (
                        <button 
                          key={platform.name}
                          className="p-4 bg-white/5 border-2 border-transparent rounded-2xl text-left hover:border-neon-cyan/30 transition-all group"
                        >
                          <platform.icon size={18} className="text-neon-cyan mb-2 group-hover:scale-110 transition-transform" />
                          <div className="font-bold text-xs text-slate-400 group-hover:text-white">{platform.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Social Networks</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'WhatsApp', icon: MessageCircle },
                        { name: 'Messenger', icon: MessageSquare },
                        { name: 'Instagram', icon: Instagram },
                        { name: 'Slack', icon: Slack },
                        { name: 'Telegram', icon: Send },
                        { name: 'Discord', icon: Disc },
                        { name: 'Twitter (X)', icon: Twitter },
                        { name: 'LinkedIn', icon: Linkedin },
                      ].map(platform => (
                        <button 
                          key={platform.name}
                          className="p-4 bg-white/5 border-2 border-transparent rounded-2xl text-left hover:border-neon-magenta/30 transition-all group"
                        >
                          <platform.icon size={18} className="text-neon-magenta mb-2 group-hover:scale-110 transition-transform" />
                          <div className="font-bold text-xs text-slate-400 group-hover:text-white">{platform.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Export Source</h2>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4">
                    <button 
                      onClick={() => toast.success('Preparing source code bundle...')}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-neon-cyan transition-all flex items-center gap-4 group"
                    >
                      <div className="p-2.5 bg-slate-800 rounded-xl text-neon-cyan group-hover:scale-110 transition-transform">
                        <Code size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Download React Source</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Full source code with dependencies</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => toast.success('Generating documentation...')}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-neon-magenta transition-all flex items-center gap-4 group"
                    >
                      <div className="p-2.5 bg-slate-800 rounded-xl text-neon-magenta group-hover:scale-110 transition-transform">
                        <Layers size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">API Documentation</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Swagger/OpenAPI spec</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Preview Area */}
        <section className="flex-1 bg-neon-black/50 p-12 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-magenta/20 rounded-full blur-[120px]" />
          </div>

          <div className="absolute top-8 left-8 flex items-center gap-3 text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Preview Environment</span>
          </div>

          <div className="w-full max-w-md h-[680px] relative animate-in zoom-in-95 duration-700">
            {/* Phone Frame Mockup */}
            <div className="absolute inset-0 bg-slate-900 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border-[12px] border-slate-800 pointer-events-none z-0" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-slate-800 rounded-b-3xl z-20" />
            
            <div className="absolute inset-2 bg-neon-black rounded-[2.8rem] overflow-hidden z-10 shadow-inner">
              <ChatInterface 
                botName={botName} 
                accentColor={accentColor} 
                systemInstruction={systemInstruction}
                capabilities={capabilities}
                onUpdateSystemInstruction={(instruction) => {
                  setSystemInstruction(instruction);
                  toast.success('System instruction updated!');
                }}
              />
            </div>
          </div>

          <div className="mt-10 flex items-center gap-6">
            <button className="flex items-center gap-2.5 text-xs font-bold text-slate-500 hover:text-neon-cyan transition-colors group">
              <Globe size={18} className="group-hover:rotate-12 transition-transform" />
              Open in new tab
            </button>
            <div className="h-5 w-[1px] bg-white/10" />
            <button className="flex items-center gap-2.5 text-xs font-bold text-slate-500 hover:text-neon-cyan transition-colors group">
              <Share2 size={18} className="group-hover:scale-110 transition-transform" />
              Share preview
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

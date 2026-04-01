import React, { useState } from 'react';
import { 
  Music, Video, Radio, Sliders, Youtube, Play, Library, 
  Search, Plus, MoreVertical, Volume2, SkipBack, SkipForward, 
  Pause, Headphones, Disc, Activity, Mic, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  title: string;
  artist: string;
  type: 'music' | 'video';
  thumbnail: string;
  duration: string;
  platform: 'youtube' | 'local' | 'spotify';
}

const MOCK_LIBRARY: MediaItem[] = [
  { id: '1', title: 'Cyberpunk Beats', artist: 'Neon Rider', type: 'music', thumbnail: 'https://picsum.photos/seed/music1/200/200', duration: '3:45', platform: 'local' },
  { id: '2', title: 'Night Drive Mix', artist: 'Synthwave Pro', type: 'music', thumbnail: 'https://picsum.photos/seed/music2/200/200', duration: '12:20', platform: 'youtube' },
  { id: '3', title: 'Studio Session Live', artist: 'OmniChat Studio', type: 'video', thumbnail: 'https://picsum.photos/seed/video1/200/200', duration: '45:00', platform: 'youtube' },
  { id: '4', title: 'Lo-Fi Chill', artist: 'Study Girl', type: 'music', thumbnail: 'https://picsum.photos/seed/music3/200/200', duration: '2:15', platform: 'spotify' },
];

export default function MediaStudio() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'mixer' | 'live'>('library');
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mixerState, setMixerState] = useState({
    deckA: { volume: 80, pitch: 0, playing: false },
    deckB: { volume: 60, pitch: 0, playing: false },
    crossfader: 50,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Searching for "${searchQuery}" across platforms...`);
  };

  const playTrack = (track: MediaItem) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    toast.info(`Now playing: ${track.title} by ${track.artist}`);
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (MOCK_LIBRARY.length > 0) {
        playTrack(MOCK_LIBRARY[0]);
      }
      return;
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Sub-Navigation */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        {[
          { id: 'library', icon: Library, label: 'Library' },
          { id: 'mixer', icon: Sliders, label: 'DJ Mixer' },
          { id: 'live', icon: Radio, label: 'Live' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
              activeSubTab === tab.id 
                ? "bg-white/10 text-neon-cyan shadow-sm" 
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-neon-cyan transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YouTube, Spotify, or Library..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 border-2 border-transparent rounded-xl focus:bg-white/10 focus:border-neon-cyan outline-none transition-all text-sm font-medium text-white"
              />
            </form>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Recent Media</h3>
                <button className="text-[10px] font-bold text-neon-cyan hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {MOCK_LIBRARY.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => playTrack(item)}
                    className={cn(
                      "p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-all group cursor-pointer",
                      currentTrack?.id === item.id && "border-neon-cyan/50 bg-white/10"
                    )}
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className={cn(
                        "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                        currentTrack?.id === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        {currentTrack?.id === item.id && isPlaying ? (
                          <Pause size={20} className="text-neon-cyan fill-neon-cyan" />
                        ) : (
                          <Play size={20} className="text-white fill-white" />
                        )}
                      </div>
                      <div className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] font-bold text-white">
                        {item.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-bold truncate transition-colors",
                        currentTrack?.id === item.id ? "text-neon-cyan" : "text-white group-hover:text-neon-cyan"
                      )}>{item.title}</div>
                      <div className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{item.artist}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.platform === 'youtube' && <Youtube size={14} className="text-red-500" />}
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Player */}
            {currentTrack && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={currentTrack.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{currentTrack.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentTrack.artist}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="p-2 bg-neon-cyan text-neon-black rounded-full shadow-lg">
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'mixer' && (
          <motion.div
            key="mixer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Deck A */}
              <div className="space-y-4 p-5 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Disc className="text-neon-cyan animate-spin-slow" size={40} />
                </div>
                <h4 className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest">Deck A</h4>
                <div className="space-y-6 relative z-10">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>VOLUME</span>
                      <span>{mixerState.deckA.volume}%</span>
                    </div>
                    <input 
                      type="range" 
                      value={mixerState.deckA.volume}
                      onChange={(e) => setMixerState(s => ({ ...s, deckA: { ...s.deckA, volume: parseInt(e.target.value) } }))}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neon-cyan" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><SkipBack size={18} /></button>
                    <button 
                      onClick={() => setMixerState(s => ({ ...s, deckA: { ...s.deckA, playing: !s.deckA.playing } }))}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                        mixerState.deckA.playing ? "bg-neon-cyan text-neon-black scale-110" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {mixerState.deckA.playing ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><SkipForward size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Deck B */}
              <div className="space-y-4 p-5 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Disc className="text-neon-magenta animate-spin-slow" size={40} />
                </div>
                <h4 className="text-[10px] font-bold text-neon-magenta uppercase tracking-widest">Deck B</h4>
                <div className="space-y-6 relative z-10">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>VOLUME</span>
                      <span>{mixerState.deckB.volume}%</span>
                    </div>
                    <input 
                      type="range" 
                      value={mixerState.deckB.volume}
                      onChange={(e) => setMixerState(s => ({ ...s, deckB: { ...s.deckB, volume: parseInt(e.target.value) } }))}
                      className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neon-magenta" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><SkipBack size={18} /></button>
                    <button 
                      onClick={() => setMixerState(s => ({ ...s, deckB: { ...s.deckB, playing: !s.deckB.playing } }))}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                        mixerState.deckB.playing ? "bg-neon-magenta text-neon-black scale-110" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {mixerState.deckB.playing ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors"><SkipForward size={18} /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Crossfader */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className={mixerState.crossfader < 50 ? "text-neon-cyan" : ""}>Deck A</span>
                <span>Crossfader</span>
                <span className={mixerState.crossfader > 50 ? "text-neon-magenta" : ""}>Deck B</span>
              </div>
              <input 
                type="range" 
                value={mixerState.crossfader}
                onChange={(e) => setMixerState(s => ({ ...s, crossfader: parseInt(e.target.value) }))}
                className="w-full h-8 bg-slate-800/50 rounded-xl appearance-none cursor-pointer accent-white border-x-8 border-transparent" 
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {['FX 1', 'FX 2', 'LOOP', 'SYNC'].map(fx => (
                <button key={fx} className="py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all active:scale-95">
                  {fx}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="p-6 bg-gradient-to-br from-red-500/10 to-neon-magenta/10 border border-red-500/20 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Offline</span>
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                  <Radio size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Start Livestream</h4>
                  <p className="text-xs text-slate-500 mt-1">Broadcast your chat studio to YouTube, Twitch, or custom RTMP.</p>
                </div>
                <button className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                  Go Live Now
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Stream Settings</h3>
              <div className="space-y-3">
                {[
                  { icon: Activity, label: 'Bitrate Control', value: '6000 kbps' },
                  { icon: Mic, label: 'Audio Input', value: 'Studio Mic (USB)' },
                  { icon: Settings, label: 'Resolution', value: '1080p 60fps' },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3 text-slate-300">
                      <setting.icon size={18} className="text-neon-cyan" />
                      <span className="text-sm font-medium">{setting.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{setting.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { Settings, Key, User, Bell, Shield, Globe, Zap, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function SettingsView() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Account Settings</h2>
        <div className="space-y-6">
          <div className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-neon-cyan/20">
                JD
              </div>
              <div>
                <div className="text-lg font-bold text-white">John Doe</div>
                <div className="text-xs font-medium text-slate-500">john.doe@example.com</div>
              </div>
              <button className="ml-auto px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'API Keys', icon: Key, description: 'Manage your Gemini and external service keys', color: 'text-neon-cyan' },
              { label: 'Notifications', icon: Bell, description: 'Configure email and push alerts', color: 'text-neon-magenta' },
              { label: 'Security', icon: Shield, description: 'Two-factor auth and session management', color: 'text-neon-lime' },
              { label: 'Team', icon: User, description: 'Manage collaborators and permissions', color: 'text-purple-400' },
            ].map((item) => (
              <button key={item.label} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] text-left hover:bg-white/10 transition-all flex items-center gap-5 group">
                <div className={cn("p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform", item.color)}>
                  <item.icon size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Advanced Configuration</h2>
        <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Developer Mode</div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">Enable advanced debugging and API logs</div>
              </div>
              <div className="w-11 h-6 bg-neon-cyan rounded-full relative">
                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Auto-Save Projects</div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">Automatically sync changes to cloud</div>
              </div>
              <div className="w-11 h-6 bg-slate-700 rounded-full relative">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => toast.success('Settings saved successfully!')}
            className="w-full py-4 bg-white text-neon-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neon-cyan transition-all shadow-xl shadow-white/5"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

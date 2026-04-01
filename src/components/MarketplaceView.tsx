import React from 'react';
import { ShoppingBag, Star, Download, Sparkles, Bot, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const TEMPLATES = [
  { name: 'Customer Support Pro', icon: Bot, rating: 4.9, downloads: '12k', color: 'text-neon-cyan', description: 'Advanced support bot with RAG integration.' },
  { name: 'Lead Gen Master', icon: Zap, rating: 4.8, downloads: '8.5k', color: 'text-neon-magenta', description: 'High-conversion lead generation flow.' },
  { name: 'E-commerce Assistant', icon: ShoppingBag, rating: 4.7, downloads: '5.2k', color: 'text-neon-lime', description: 'Integrated with Shopify & Stripe.' },
  { name: 'Secure Auth Bot', icon: ShieldCheck, rating: 4.9, downloads: '3.1k', color: 'text-purple-400', description: 'Enterprise-grade authentication assistant.' },
];

export default function MarketplaceView() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Featured Templates</h2>
        <div className="grid grid-cols-1 gap-4">
          {TEMPLATES.map((template) => (
            <div key={template.name} className="p-6 bg-white/5 border border-white/5 rounded-[2.5rem] group hover:bg-white/10 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <template.icon size={80} className={template.color} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("p-3 rounded-2xl bg-slate-800", template.color)}>
                    <template.icon size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">{template.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        {template.rating}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Download size={12} />
                        {template.downloads}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed line-clamp-2">{template.description}</p>
                <button 
                  onClick={() => toast.success(`Installing ${template.name}...`)}
                  className="w-full py-3 bg-white text-neon-black rounded-xl text-xs font-bold hover:bg-neon-cyan transition-all shadow-lg shadow-white/5"
                >
                  Install Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-white/10 rounded-[2rem] text-white shadow-xl shadow-neon-cyan/5 relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
              <Sparkles size={16} className="text-neon-cyan" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">New Arrival</span>
          </div>
          <p className="text-xs font-medium leading-relaxed opacity-90 text-slate-300">
            Check out the new **Multimodal Studio** template for advanced media bots.
          </p>
        </div>
      </div>
      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Power Plugins</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Stripe Payments', icon: ShieldCheck, color: 'text-neon-cyan', description: 'Accept payments directly in chat.' },
            { name: 'Google Calendar', icon: Zap, color: 'text-neon-magenta', description: 'Schedule meetings automatically.' },
            { name: 'Slack Sync', icon: MessageSquare, color: 'text-neon-lime', description: 'Mirror conversations to Slack channels.' },
            { name: 'Zendesk Ticket', icon: Bot, color: 'text-purple-400', description: 'Create support tickets from chat.' },
          ].map((plugin) => (
            <button key={plugin.name} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] text-left hover:bg-white/10 transition-all flex items-center gap-5 group">
              <div className={cn("p-3 bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform", plugin.color)}>
                <plugin.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{plugin.name}</div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">{plugin.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

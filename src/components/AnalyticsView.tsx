import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, MessageSquare, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';

const STATS = [
  { label: 'Total Conversations', value: '12,482', change: '+12.5%', trend: 'up', icon: MessageSquare, color: 'text-neon-cyan' },
  { label: 'Active Users', value: '1,204', change: '+5.2%', trend: 'up', icon: Users, color: 'text-neon-magenta' },
  { label: 'Avg. Response Time', value: '0.8s', change: '-10.1%', trend: 'up', icon: Clock, color: 'text-neon-lime' },
  { label: 'Satisfaction Rate', value: '98.2%', change: '+0.4%', trend: 'up', icon: TrendingUp, color: 'text-purple-400' },
];

export default function AnalyticsView() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Performance Overview</h2>
        <div className="grid grid-cols-1 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] group hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-slate-800", stat.color)}>
                  <stat.icon size={20} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                  stat.trend === 'up' ? "bg-neon-lime/10 text-neon-lime" : "bg-red-500/10 text-red-500"
                )}>
                  {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">User Engagement</h2>
        <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={120} className="text-neon-cyan" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-end gap-2 h-32">
              {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 60, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-neon-cyan/20 to-neon-cyan rounded-t-lg"
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Recent Conversations</h2>
        <div className="space-y-3">
          {[
            { user: 'Sarah Miller', time: '2m ago', message: 'How do I reset my password?', status: 'Resolved' },
            { user: 'James Wilson', time: '15m ago', message: 'Pricing for enterprise plan?', status: 'Active' },
            { user: 'Elena Rodriguez', time: '45m ago', message: 'Integration with Slack failed.', status: 'Pending' },
          ].map((chat) => (
            <div key={chat.user} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 group-hover:border-neon-cyan transition-colors">
                  {chat.user.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{chat.user}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{chat.message}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
                  chat.status === 'Resolved' ? "bg-neon-lime/10 text-neon-lime" :
                  chat.status === 'Active' ? "bg-neon-cyan/10 text-neon-cyan" : "bg-orange-500/10 text-orange-500"
                )}>
                  {chat.status}
                </div>
                <div className="text-[9px] font-bold text-slate-600 mt-1">{chat.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

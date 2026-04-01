import React, { useState, useRef, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Send, Bot, User, Loader2, RefreshCcw, Trash2, 
  Image as ImageIcon, Volume2, VolumeX, Mic, MicOff, Sparkles,
  Globe, MessageCircle, Instagram, Slack, Smartphone, ShieldCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { getChatResponseStream, generateImage, textToSpeech, transcribeAudio } from '@/src/services/gemini';

type Channel = 'web' | 'whatsapp' | 'slack' | 'instagram';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
  audioUrl?: string;
}

interface ChatInterfaceProps {
  systemInstruction?: string;
  botName?: string;
  accentColor?: string;
  capabilities?: {
    imageGen: boolean;
    tts: boolean;
    voice: boolean;
    reasoning: boolean;
    media: boolean;
    mixer: boolean;
    kb: boolean;
  };
  onUpdateSystemInstruction?: (instruction: string) => void;
}

export const CHAT_TEMPLATES = [
  {
    name: 'Customer Support',
    instruction: 'You are a professional and empathetic customer support agent. Your goal is to help users resolve their issues efficiently while maintaining a positive and helpful tone. Always be polite and patient.',
    icon: '🎧'
  },
  {
    name: 'Sales Assistant',
    instruction: 'You are a persuasive and knowledgeable sales assistant. Your goal is to understand the user\'s needs and recommend the best products or services. Be proactive, highlight benefits, and guide them towards a purchase.',
    icon: '💰'
  },
  {
    name: 'FAQ Bot',
    instruction: 'You are a concise and informative FAQ bot. Your goal is to provide direct and accurate answers to common questions. Keep your responses brief and to the point.',
    icon: '❓'
  },
  {
    name: 'Creative Writer',
    instruction: 'You are a creative and imaginative writing assistant. Your goal is to help users brainstorm ideas, write stories, or compose poems. Be expressive and encouraging.',
    icon: '✍️'
  },
  {
    name: 'DJ Bot',
    instruction: 'You are a high-energy, music-loving DJ bot. Your goal is to talk about music, recommend tracks, and keep the vibe upbeat. Use music-related slang and emojis. You know everything about genres, artists, and festivals.',
    icon: '🎧'
  }
];

export default function ChatInterface({ 
  systemInstruction = "You are a helpful AI assistant.",
  botName = "OmniBot",
  accentColor = "#3b82f6",
  capabilities = {
    imageGen: true,
    tts: true,
    voice: true,
    reasoning: true,
    media: true,
    mixer: true,
    kb: true
  },
  onUpdateSystemInstruction
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel>('web');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = async (text: string) => {
    if (!isTtsEnabled) return;
    try {
      const audioUrl = await textToSpeech(text);
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          try {
            const transcription = await transcribeAudio(base64Audio, 'audio/webm');
            if (transcription) {
              setInput(prev => prev + (prev ? ' ' : '') + transcription.trim());
            }
          } catch (error) {
            console.error('Transcription error:', error);
          } finally {
            setIsLoading(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (messages.length === 0) {
      toast.error('No messages to ' + action.toLowerCase());
      return;
    }
    
    const lastBotMessage = [...messages].reverse().find(m => m.role === 'model');
    if (!lastBotMessage) {
      toast.error('No bot response to ' + action.toLowerCase());
      return;
    }

    let prompt = '';
    switch (action) {
      case 'Summarize':
        prompt = `Summarize the following text concisely: "${lastBotMessage.content}"`;
        break;
      case 'Translate':
        prompt = `Translate the following text to Spanish: "${lastBotMessage.content}"`;
        break;
      case 'Analyze':
        prompt = `Analyze the tone and key points of the following text: "${lastBotMessage.content}"`;
        break;
      default:
        return;
    }

    setInput(prompt);
    // Automatically send after a small delay to let the user see the input
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    
    // Check for image generation command
    if (userMessage.content.toLowerCase().startsWith('/image ')) {
      if (!capabilities.imageGen) {
        const botMessage: Message = {
          id: botMessageId,
          role: 'model',
          content: 'Image generation is currently disabled for this bot.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        return;
      }

      const prompt = userMessage.content.slice(7);
      const botMessage: Message = {
        id: botMessageId,
        role: 'model',
        content: `Generating image for: "${prompt}"...`,
        timestamp: new Date(),
        type: 'image'
      };
      setMessages(prev => [...prev, botMessage]);

      try {
        const imageUrl = await generateImage(prompt);
        if (imageUrl) {
          setMessages(prev => prev.map(m => 
            m.id === botMessageId ? { ...m, content: `Here is your image for: "${prompt}"`, imageUrl } : m
          ));
        } else {
          setMessages(prev => prev.map(m => 
            m.id === botMessageId ? { ...m, content: 'Failed to generate image. Please try again.' } : m
          ));
        }
      } catch (error) {
        console.error('Image gen error:', error);
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, content: 'Error generating image.' } : m
        ));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const botMessage: Message = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      let fullResponse = '';
      const stream = getChatResponseStream(currentInput, history, systemInstruction);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, content: fullResponse } : m
        ));
      }
      setIsTyping(false);

      if (isTtsEnabled) {
        playAudio(fullResponse);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setMessages(prev => prev.map(m => 
        m.id === botMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.' } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-neon-black relative overflow-hidden font-sans">
      <audio ref={audioRef} className="hidden" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 z-20 bg-neon-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-neon-cyan/20 text-white group relative overflow-hidden"
               style={{ backgroundColor: accentColor }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot size={22} className="relative z-10" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-white leading-tight tracking-tight">{botName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.5)]" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Now</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {[
            { id: 'web', icon: Globe },
            { id: 'whatsapp', icon: MessageCircle },
            { id: 'slack', icon: Slack },
            { id: 'instagram', icon: Instagram },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id as Channel)}
              className={cn(
                "p-2 rounded-lg transition-all",
                activeChannel === ch.id 
                  ? "bg-white text-neon-black shadow-lg" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              title={`${ch.id.charAt(0).toUpperCase() + ch.id.slice(1)} Preview`}
            >
              <ch.icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsTtsEnabled(!isTtsEnabled)}
            className={cn(
              "p-2.5 transition-all rounded-xl border border-transparent",
              isTtsEnabled ? "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20 shadow-sm" : "text-slate-500 hover:bg-white/5 hover:text-white"
            )}
            title={isTtsEnabled ? "Disable Voice" : "Enable Voice"}
          >
            {isTtsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={clearChat}
            className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all rounded-xl"
            title="Clear conversation"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neon-black custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 shadow-xl shadow-neon-cyan/5 flex items-center justify-center mb-6 text-slate-700 border border-white/5">
              <Bot size={40} />
            </div>
            <h4 className="text-xl font-display font-bold text-white mb-3 tracking-tight">Meet {botName}</h4>
            <p className="text-slate-500 max-w-[240px] text-sm leading-relaxed mb-10">
              Your intelligent assistant is ready. Try <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs text-neon-cyan">/image</code> to create art.
            </p>

            {onUpdateSystemInstruction && (
              <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Quick Start</span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CHAT_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => onUpdateSystemInstruction(template.instruction)}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:border-neon-cyan/30 hover:shadow-xl hover:shadow-neon-cyan/5 transition-all group active:scale-95"
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{template.icon}</div>
                      <div className="text-xs font-bold text-white group-hover:text-neon-cyan transition-colors">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-3.5 max-w-[90%]",
                  message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm",
                  message.role === 'user' ? "bg-white/10 text-slate-400" : "text-white"
                )}
                style={message.role === 'model' ? { backgroundColor: accentColor } : {}}
                >
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "flex flex-col gap-1.5",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4.5 py-3.5 rounded-2xl shadow-sm border relative overflow-hidden group",
                    message.role === 'user' 
                      ? "bg-white/10 text-white rounded-tr-none border-white/10" 
                      : "bg-white/5 text-slate-200 rounded-tl-none border-white/5"
                  )}>
                    {message.role === 'user' && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
                    )}
                    <div className={cn(
                      "markdown-body prose prose-sm max-w-none leading-relaxed relative z-10",
                      message.role === 'user' ? "prose-invert" : "text-slate-200"
                    )}>
                      <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                    </div>
                    
                    {message.imageUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <img 
                          src={message.imageUrl} 
                          alt="Generated" 
                          className="w-full h-auto object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="px-1 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-6 py-2"
          >
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bot is thinking</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="absolute bottom-24 right-6 flex flex-col gap-2 z-20">
        {[
          { icon: Sparkles, color: 'bg-neon-cyan', label: 'Summarize' },
          { icon: Globe, color: 'bg-neon-magenta', label: 'Translate' },
          { icon: ShieldCheck, color: 'bg-neon-lime', label: 'Analyze' },
        ].map((action) => (
          <button 
            key={action.label}
            onClick={() => handleQuickAction(action.label)}
            className={cn(
              "p-3 rounded-2xl text-neon-black shadow-lg hover:scale-110 active:scale-95 transition-all group relative",
              action.color
            )}
            title={action.label}
          >
            <action.icon size={18} />
            <span className="absolute right-full mr-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-neon-black relative z-20">
        <div className="absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-neon-black to-transparent pointer-events-none" />
        <form 
          onSubmit={handleSend}
          className="relative flex items-center gap-3"
        >
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading || isRecording}
              className="w-full pl-5 pr-12 py-4.5 bg-white/5 border-2 border-white/5 rounded-[1.5rem] focus:bg-white/10 focus:border-neon-cyan focus:shadow-xl focus:shadow-neon-cyan/10 outline-none transition-all text-sm font-medium text-white placeholder-slate-600"
              style={{ '--tw-ring-color': accentColor } as any}
            />
            {capabilities.voice && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isRecording ? "text-red-500 bg-red-500/10 scale-110" : "text-slate-500 hover:text-neon-cyan hover:bg-white/5"
                  )}
                  title={isRecording ? "Stop Recording" : "Voice Input"}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isRecording}
            className="w-14 h-14 rounded-[1.5rem] text-white shadow-xl shadow-neon-cyan/20 hover:shadow-neon-cyan/30 hover:scale-105 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed active:scale-95 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="h-[1px] w-10 bg-white/5" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            Powered by OmniChat
          </p>
          <div className="h-[1px] w-10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}

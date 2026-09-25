'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Dumbbell, 
  ShieldAlert, 
  Utensils, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function AICoachChat() {
  const { profile, chatMessages, sendChatMessage } = useFitnessStore();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Can I replace squats with dumbbells?',
    'Give me a Tamil-style high-protein breakfast',
    'I only have 30 minutes today',
    'My lower back feels tight today',
    'How much protein should I eat per meal?',
    'Can you make tomorrow\'s workout easier?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isSending]);

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);
    try {
      await sendChatMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* CHAT HEADER */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Bot className="h-6 w-6" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AuraFit AI Coach</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Groq Llama 3.3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded in your biometric metrics, equipment ({profile.availableEquipment.length} items), and goals
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Dumbbell className="h-3.5 w-3.5 text-emerald-400" />
            {profile.workoutDaysPerWeek}d Plan
          </span>
          <span className="flex items-center gap-1">
            <Utensils className="h-3.5 w-3.5 text-amber-400" />
            {profile.targetCalories} kcal
          </span>
        </div>
      </div>

      {/* MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/80 text-slate-200 border border-white/5 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-1 ${
                    isUser ? 'text-slate-800 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-3xl rounded-tl-none bg-slate-950/80 p-4 border border-white/5 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Analyzing user biometrics and generating sports science response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="px-4 py-2 border-t border-white/5 bg-slate-950/40 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Try asking:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] text-slate-300 hover:text-emerald-300 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-white/10 shrink-0 transition whitespace-nowrap"
          >
            {p}
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask your coach anything (e.g. Can I replace lunges? Tamil dinner recipe?)..."
          className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

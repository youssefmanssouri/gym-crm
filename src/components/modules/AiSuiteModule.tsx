'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Send, Flame, Apple, TrendingUp, AlertCircle, UserCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { apiChatWithAI, apiGenerateBusinessInsights } from '@/lib/api-client';

export const AiSuiteModule: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string }>>([
    {
      sender: 'AI',
      text: 'Hello! I am APEX AI, your master fitness & gym intelligence assistant. Ask me anything about workout programming, diet macros, member retention strategies, or revenue optimization!',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: 'USER', text: userText }]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const data = await apiChatWithAI(userText);
      setMessages((prev) => [...prev, { sender: 'AI', text: data.response || 'I am processing your query.' }]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'AI chat request failed';
      setMessages((prev) => [...prev, { sender: 'AI', text: `Error: ${message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateBusinessInsights = async () => {
    setIsReportLoading(true);
    try {
      const data = await apiGenerateBusinessInsights();
      setAiReport(data.report);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to generate insights';
      setAiReport(`⚠️ Unable to generate AI intelligence report: ${message}`);
    } finally {
      setIsReportLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            APEX Gemini AI Power Suite <Sparkles className="w-5 h-5 text-cyan-400" />
          </h2>
          <p className="text-xs text-zinc-400 mt-1">AI Fitness Chatbot, Predictive Churn Modeling, and Strategic Revenue Insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Chatbot */}
        <Card className="lg:col-span-2 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">APEX Fitness Assistant Chatbot</h3>
                <p className="text-[10px] text-zinc-500">Powered by Google Gemini AI</p>
              </div>
            </div>
            <Badge variant="cyan">ONLINE</Badge>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'USER'
                      ? 'bg-cyan-500 text-zinc-950 font-medium rounded-br-none'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 text-zinc-400 p-3 rounded-2xl text-xs animate-pulse">
                  APEX AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-zinc-800 flex gap-2">
            <Input
              placeholder="Ask about workouts, nutrition, or gym retention..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="text-xs"
            />
            <Button variant="glow" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </Card>

        {/* Business Intelligence & Predictive Churn Card */}
        <Card glow className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-cyan-950/30 border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">AI Business Forecast</h3>
          </div>

          <p className="text-xs text-zinc-400">
            Click below to execute Gemini AI strategic revenue and churn risk analysis over current gym KPIs.
          </p>

          <Button
            variant="glow"
            size="sm"
            className="w-full"
            disabled={isReportLoading}
            onClick={handleGenerateBusinessInsights}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {isReportLoading ? 'Analyzing Business...' : 'Run Strategic Forecast'}
          </Button>

          {aiReport && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
              {aiReport}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

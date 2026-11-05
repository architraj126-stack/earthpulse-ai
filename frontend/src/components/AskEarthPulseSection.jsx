import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Quote, ShieldCheck, CheckCircle2, Loader2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { askEarthPulseAI } from '../services/api';

const STARTER_CHIPS = [
  "Is this trend statistically significant?",
  "What does Sen's slope tell us about the rate of change?",
  "How does urbanization affect these numbers?",
  "Where on Earth is temperature rising the fastest?",
  "Explain the difference between Sen's slope and Linear Regression."
];

export default function AskEarthPulseSection({ currentAnalysis = null }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleAsk = async (queryToAsk) => {
    const q = queryToAsk || question;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const historyPayload = chatHistory.slice(-5);
      const res = await askEarthPulseAI(q, currentAnalysis, historyPayload);
      setResponse(res);
      setChatHistory((prev) => [
        ...prev.slice(-4),
        { role: 'user', content: q },
        { role: 'assistant', content: res.answer }
      ]);
      setQuestion('');
    } catch (err) {
      alert('AI Assistant service error: ' + (err.message || 'Failed to query knowledge engine.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#13263A] rounded-2xl border border-[#1E3A56] p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E3A56]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-heading flex items-center gap-2">
              <span>Ask EarthPulse AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30 uppercase tracking-wider">
                BM25 Scientific RAG
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Inquire about trend detection, significance thresholds, and physical climate mechanisms grounded strictly in verified science.
            </p>
          </div>
        </div>
      </div>

      {/* Starter Question Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          {STARTER_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(chip)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#0D1B2A] border border-[#1E3A56] text-slate-300 hover:text-[#00D4FF] hover:border-[#00D4FF]/50 transition text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="relative"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a scientific question (e.g. 'Is temperature increasing in Bengaluru?')..."
          className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-xl px-4 py-3 pr-24 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00D4FF] shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2 top-2 px-3.5 py-1.5 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#071426] font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Structured 3-Part Answer Card */}
      {response && (
        <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
          <div className="text-xs text-[#00D4FF] font-semibold border-b border-[#1E3A56] pb-2 flex items-center justify-between">
            <span className="truncate">Q: {response.question}</span>
            <span className="text-[10px] text-slate-400 font-mono">Verified 3-Part Science Guide</span>
          </div>

          {/* Section 1: What the data shows */}
          <div className="space-y-1 bg-[#13263A] p-3.5 rounded-xl border border-[#1E3A56]">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#00D4FF] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. What the data shows</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {response.what_data_shows || response.statistical_observation || response.answer}
            </p>
          </div>

          {/* Section 2: What it means */}
          <div className="space-y-1 bg-[#13263A] p-3.5 rounded-xl border border-[#1E3A56]">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#35D07F] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. What it means</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {response.what_it_means || response.scientific_context || 'Regional climate shifting in response to planetary dynamics and local land-use patterns.'}
            </p>
          </div>

          {/* Section 3: Sources */}
          <div className="space-y-1 bg-[#13263A] p-3.5 rounded-xl border border-[#1E3A56]">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5" />
              <span>3. Sources</span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {response.sources_text || 'NASA POWER Project; IPCC AR6 WGI.'}
            </p>
          </div>

          {/* Citations badges */}
          {response.sources_and_citations && response.sources_and_citations.length > 0 && (
            <div className="pt-2 border-t border-[#1E3A56] flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium">Verified Knowledge Files:</span>
              {response.sources_and_citations.map((src, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#13263A] border border-[#1E3A56] text-[#00D4FF] font-mono text-[10px]"
                >
                  {src.title}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Quote, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { askEarthPulseAI } from '../services/api';

const PRESET_QUESTIONS = [
  "Is temperature increasing in Bengaluru?",
  "What does the Mann-Kendall p-value mean?",
  "How much has this variable changed per year?",
  "Explain the trend in simple language.",
  "What is the difference between Sen's slope and Linear Regression?",
  "What causes the Urban Heat Island effect?"
];

export default function AskEarthPulseSection({ currentAnalysis = null }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleAsk = async (queryToAsk) => {
    const q = queryToAsk || question;
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await askEarthPulseAI(q, currentAnalysis);
      setResponse(res);
    } catch (err) {
      alert('AI Assistant service error: ' + (err.message || 'Failed to query knowledge engine.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E3A56]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Ask EarthPulse AI</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#35D07F]/15 text-[#35D07F] border border-[#35D07F]/30 uppercase tracking-wider">
                Grounded Scientific RAG
              </span>
            </h3>
            <p className="text-xs text-[#9BAEC2]">
              Inquire about current statistical trends, p-values, or climate mechanisms backed by our verified knowledge base.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Question Pills */}
      <div className="space-y-1.5">
        <span className="text-[11px] text-[#9BAEC2] font-medium">Quick Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(pq);
                handleAsk(pq);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#0D1B2A] border border-[#1E3A56] text-[#9BAEC2] hover:text-[#00D4FF] hover:border-[#00D4FF] transition text-left"
            >
              {pq}
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
          className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-xl px-4 py-3 pr-24 text-sm text-white placeholder-[#9BAEC2] focus:outline-none focus:border-[#00D4FF] shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#071426] font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50 active:scale-95"
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

      {/* Response Card */}
      {response && (
        <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
          
          <div className="text-xs text-[#00D4FF] font-semibold border-b border-[#1E3A56] pb-2 flex items-center justify-between">
            <span className="truncate">Q: {response.question}</span>
            <span className="text-[10px] text-[#9BAEC2] font-mono">Grounded RAG Response</span>
          </div>

          {/* Main Answer Narrative */}
          <div className="text-sm text-white leading-relaxed space-y-2 whitespace-pre-line font-sans">
            {response.answer}
          </div>

          {/* Structured Observation & Context Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            {response.statistical_observation && (
              <div className="bg-[#13263A] p-3 rounded-lg border border-[#1E3A56] space-y-1">
                <span className="font-bold text-[#35D07F] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Statistical Observation</span>
                </span>
                <p className="text-[#9BAEC2] leading-snug">
                  {response.statistical_observation}
                </p>
              </div>
            )}

            {response.scientific_context && (
              <div className="bg-[#13263A] p-3 rounded-lg border border-[#1E3A56] space-y-1">
                <span className="font-bold text-[#00D4FF] flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Physical Climate Mechanism</span>
                </span>
                <p className="text-[#9BAEC2] leading-snug line-clamp-3">
                  {response.scientific_context}
                </p>
              </div>
            )}
          </div>

          {/* Sources and Citations */}
          {response.sources_and_citations && response.sources_and_citations.length > 0 && (
            <div className="pt-2 border-t border-[#1E3A56] flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-[#9BAEC2] flex items-center gap-1 font-semibold">
                <Quote className="w-3 h-3 text-[#00D4FF]" />
                <span>Verified Sources:</span>
              </span>
              {response.sources_and_citations.map((src, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#13263A] border border-[#1E3A56] text-[#00D4FF] font-mono text-[10px]"
                >
                  {src.title} ({src.category})
                </span>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}

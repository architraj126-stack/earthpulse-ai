import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Quote, CheckCircle2, Loader2 } from 'lucide-react';
import { askEarthPulseAI } from '../services/api';

const STARTER_CHIPS = [
  'Is this trend statistically significant?',
  "What does Sen's slope tell us?",
  'Where is temperature rising fastest?'
];

export default function AskEarthPulseSection({ currentAnalysis = null, compact = false }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleAsk = async (queryToAsk) => {
    const q = (queryToAsk || question).trim();
    if (!q) return;
    setLoading(true);
    setErrorMsg(null);
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
      setErrorMsg(err.message || 'Knowledge assistant is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-[var(--card)] rounded-[14px] border border-[var(--border)] ${
        compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 space-y-4'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" aria-hidden="true" />
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text)]">Ask EarthPulse</h3>
        </div>
        <span
          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: 'var(--sig-soft)',
            color: 'var(--sig)',
            borderColor: 'var(--sig)'
          }}
        >
          BM25 Grounded
        </span>
      </div>

      {/* Starter Chips */}
      <div className="flex flex-wrap gap-1">
        {STARTER_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(chip)}
            className="text-[11px] px-2 py-1 rounded-lg bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors text-left"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Query Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex items-center gap-1.5"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about significance, mechanisms..."
          aria-label="Ask EarthPulse AI scientific question"
          className="flex-1 min-w-0 bg-[var(--panel)] border border-[var(--border)] rounded-[10px] px-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-label="Send question"
          className="px-3 py-1.5 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs inline-flex items-center gap-1 disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>

      {errorMsg && (
        <div className="text-xs p-2.5 rounded-[10px] border border-[var(--warm)] text-[var(--warm)] bg-[var(--warm-soft)]">
          {errorMsg}
        </div>
      )}

      {/* Grounded 3-Part Response */}
      {response && (
        <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[12px] p-3 space-y-2.5 text-xs">
          <div className="font-semibold text-[var(--text)] border-b border-[var(--border)] pb-1.5">
            Q: {response.question}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[var(--accent)]">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              <span>What the data shows</span>
            </div>
            <p className="text-[var(--text)] leading-relaxed">
              {response.what_data_shows || response.answer}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--sig)' }}>
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              <span>What it means</span>
            </div>
            <p className="text-[var(--muted)] leading-relaxed">
              {response.what_it_means || 'Regional trend evaluated against WMO & IPCC AR6 climate diagnostics.'}
            </p>
          </div>

          <div className="space-y-1 pt-1 border-t border-[var(--border)]">
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-[var(--muted)]">
              <Quote className="w-3 h-3" aria-hidden="true" />
              <span>Sources</span>
            </div>
            <p className="text-[11px] font-mono text-[var(--muted)] leading-snug">
              {response.sources_text || 'NASA POWER; IPCC AR6 WGI.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Award,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import TimeSeriesChart from '../components/TimeSeriesChart';
import { getDetectiveCases } from '../services/api';
import staticCases from '../data/detective_cases.json';

export default function DetectiveCasesPage() {
  const [cases, setCases] = useState(staticCases || []);
  const [selectedCaseId, setSelectedCaseId] = useState(staticCases[0]?.id || 'arctic_warming');
  const [userAnswers, setUserAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDetectiveCases()
      .then((data) => {
        if (data && data.length > 0) {
          setCases(data);
        }
      })
      .catch(() => {});
  }, []);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleSelectAnswer = (qIdx, optIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [`${selectedCaseId}_${qIdx}`]: optIdx
    }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setShowQuizResults(false);
  };

  const handleTryLive = () => {
    navigate('/investigate', {
      state: {
        variable: activeCase.variable,
        latitude: activeCase.location.latitude,
        longitude: activeCase.location.longitude,
        locationName: activeCase.location.name,
        startYear: parseInt(activeCase.period.start.slice(0, 4), 10),
        endYear: parseInt(activeCase.period.end.slice(0, 4), 10)
      }
    });
  };

  // Calculate quiz score
  const quizItems = activeCase?.quiz || [];
  const correctCount = quizItems.reduce((acc, q, idx) => {
    const userChoice = userAnswers[`${selectedCaseId}_${idx}`];
    return acc + (userChoice === q.correct_index ? 1 : 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0D1B2A] border border-[#1E3A56] p-6 rounded-3xl shadow-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Guided Science Cases</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Earth Science Detective Cases
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Walk through real, verified environmental investigations. Each case pairs historical NASA observations with step-by-step scientific deduction, quizzes, and live API exploration.
          </p>
        </div>

        {/* Live Try It Button */}
        <button
          type="button"
          onClick={handleTryLive}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#35D07F] text-[#071426] font-extrabold text-xs sm:text-sm flex items-center space-x-2 hover:brightness-110 shadow-lg shadow-[#00D4FF]/20 active:scale-95 transition"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Try This Case Live on NASA API</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Case Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cases.map((c) => {
          const isSelected = selectedCaseId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCaseId(c.id);
                handleResetQuiz();
              }}
              className={`p-4 rounded-2xl border text-left transition space-y-2 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#13263A] border-[#00D4FF] shadow-xl shadow-[#00D4FF]/15 ring-1 ring-[#00D4FF]'
                  : 'bg-[#13263A]/60 border-[#1E3A56] hover:border-slate-500 hover:bg-[#13263A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  c.badge.includes('Polar')
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : c.badge.includes('Monsoon')
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                }`}>
                  {c.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {c.variable} ({c.unit})
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-heading leading-tight">{c.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.question}</p>
              </div>

              <div className="text-[11px] text-[#00D4FF] font-medium pt-1 flex items-center space-x-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{c.location.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE CASE WORKBENCH */}
      {activeCase && (
        <div className="space-y-6">

          {/* Reference Data Attribution Badge (Mandatory: Never label cached data as live) */}
          <div className="bg-[#0D1B2A] border border-[#1E3A56] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#35D07F]" />
              <span className="font-semibold text-white">Verified Benchmark Dataset:</span>
              <span className="font-mono text-[#00D4FF]">{activeCase.data_source_label}</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Spatial cell: ~50 km grid &bull; Quality: 100% complete
            </div>
          </div>

          {/* 5-Step Guided Deduction Narration */}
          <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="text-base sm:text-lg font-bold text-white font-heading flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#00D4FF]" />
              <span>5-Step Scientific Investigation Walkthrough</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {/* Step 1 */}
              <div className="bg-[#13263A] p-3.5 rounded-2xl border border-[#1E3A56] space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[#00D4FF] font-extrabold font-mono text-[11px] uppercase tracking-wider">Step 1: The Question</div>
                  <p className="text-slate-300 mt-1 leading-snug">{activeCase.narration.step1_question}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#13263A] p-3.5 rounded-2xl border border-[#1E3A56] space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[#00D4FF] font-extrabold font-mono text-[11px] uppercase tracking-wider">Step 2: The Variable</div>
                  <p className="text-slate-300 mt-1 leading-snug">{activeCase.narration.step2_variable}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#13263A] p-3.5 rounded-2xl border border-[#1E3A56] space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[#00D4FF] font-extrabold font-mono text-[11px] uppercase tracking-wider">Step 3: The Place</div>
                  <p className="text-slate-300 mt-1 leading-snug">{activeCase.narration.step3_location}</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#13263A] p-3.5 rounded-2xl border border-[#1E3A56] space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[#00D4FF] font-extrabold font-mono text-[11px] uppercase tracking-wider">Step 4: The Chart</div>
                  <p className="text-slate-300 mt-1 leading-snug">{activeCase.narration.step4_chart}</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-[#13263A] p-3.5 rounded-2xl border border-[#35D07F]/40 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="text-[#35D07F] font-extrabold font-mono text-[11px] uppercase tracking-wider">Step 5: The Verdict</div>
                  <p className="text-slate-200 mt-1 font-medium leading-snug">{activeCase.narration.step5_verdict}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <TimeSeriesChart
            data={activeCase.time_series}
            variableName={activeCase.variable_name}
            unit={activeCase.unit}
            pettitt={activeCase.summary?.pettitt}
          />

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Sen's Slope Rate</div>
              <div className="text-xl font-mono font-extrabold text-[#00D4FF]">
                {activeCase.summary?.rate_per_decade > 0 ? '+' : ''}{activeCase.summary?.rate_per_decade} {activeCase.unit}/decade
              </div>
            </div>

            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Mann-Kendall Significance</div>
              <div className="text-xl font-mono font-extrabold text-white">
                p = {activeCase.summary?.mann_kendall?.p_value?.toFixed(5) || 'N/A'}
              </div>
              <div className="text-[11px] text-slate-400">
                {activeCase.summary?.is_significant ? 'Statistically Significant (p < 0.05)' : 'No Significant Trend (p >= 0.05)'}
              </div>
            </div>

            <div className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Observations Analyzed</div>
              <div className="text-xl font-mono font-extrabold text-[#35D07F]">
                {activeCase.summary?.observation_count} monthly points
              </div>
              <div className="text-[11px] text-slate-400">
                1990–2023 complete baseline
              </div>
            </div>
          </div>

          {/* 3-QUESTION INTERACTIVE QUIZ */}
          <div className="bg-[#0D1B2A] border border-[#1E3A56] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1E3A56]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Detective Knowledge Check: 3-Question Quiz
                  </h3>
                  <p className="text-xs text-slate-400">
                    Test your understanding of the statistical findings and physical mechanisms behind this case.
                  </p>
                </div>
              </div>

              {/* Score Indicator */}
              <div className="flex items-center space-x-2 text-xs font-mono bg-[#13263A] px-3.5 py-1.5 rounded-xl border border-[#1E3A56]">
                <span className="text-slate-400">Score:</span>
                <span className="text-[#00D4FF] font-bold text-sm">{correctCount} / {quizItems.length}</span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-5">
              {quizItems.map((q, qIdx) => {
                const userChoice = userAnswers[`${selectedCaseId}_${qIdx}`];
                const hasAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correct_index;

                return (
                  <div
                    key={qIdx}
                    className="bg-[#13263A] border border-[#1E3A56] p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start space-x-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0D1B2A] border border-[#1E3A56] text-[#00D4FF] text-xs font-mono font-bold shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-white font-heading">
                        {q.question}
                      </h4>
                    </div>

                    {/* Radio Options */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isOptionSelected = userChoice === optIdx;
                        let optionStyle = 'bg-[#0D1B2A] border-[#1E3A56] text-slate-300 hover:border-slate-500 hover:text-white';

                        if (hasAnswered) {
                          if (optIdx === q.correct_index) {
                            optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                          } else if (isOptionSelected) {
                            optionStyle = 'bg-red-500/20 border-red-500 text-red-300';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && optIdx === q.correct_index && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                            {hasAnswered && isOptionSelected && optIdx !== q.correct_index && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Scientific Explanation Box once answered */}
                    {hasAnswered && (
                      <div className={`p-3 rounded-xl text-xs space-y-1 ${
                        isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200' : 'bg-slate-800/80 border border-slate-700 text-slate-300'
                      }`}>
                        <div className="font-bold flex items-center space-x-1.5">
                          <Info className="w-3.5 h-3.5" />
                          <span>Scientific Explanation:</span>
                        </div>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reset / Live Run CTA footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E3A56]">
              <button
                type="button"
                onClick={handleResetQuiz}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#13263A] hover:bg-[#1E3A56] text-slate-300 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Quiz Answers</span>
              </button>

              <button
                type="button"
                onClick={handleTryLive}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#071426] font-bold text-xs transition active:scale-95 shadow-lg shadow-[#00D4FF]/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Live Analysis on {activeCase.location.name}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

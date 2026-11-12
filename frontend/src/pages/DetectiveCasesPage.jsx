import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MapPin,
  Sparkles,
  Award,
  Play,
  RotateCcw,
  Info
} from 'lucide-react';
import TimeSeriesChart from '../components/TimeSeriesChart';
import { getDetectiveCases } from '../services/api';
import staticCases from '../data/detective_cases.json';
import { formatSigned } from '../utils/climateMath';

export default function DetectiveCasesPage() {
  const [cases, setCases] = useState(staticCases || []);
  const [selectedCaseId, setSelectedCaseId] = useState(staticCases[0]?.id || 'arctic_warming');
  const [userAnswers, setUserAnswers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getDetectiveCases()
      .then((data) => {
        if (data && data.length > 0) setCases(data);
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

  const handleResetQuiz = () => setUserAnswers({});

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

  const quizItems = activeCase?.quiz || [];
  const correctCount = quizItems.reduce((acc, q, idx) => {
    return acc + (userAnswers[`${selectedCaseId}_${idx}`] === q.correct_index ? 1 : 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[var(--panel)] border border-[var(--border)] p-5 rounded-[14px]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--accent)]">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Guided Climate Investigations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            Earth Science Detective Cases
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl">
            Verified historical NASA datasets paired with 5-step scientific deduction, interactive knowledge checks, and live API launch.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTryLive}
          className="px-4 py-2.5 rounded-[12px] bg-[var(--accent)] text-[var(--accent-fg)] font-bold text-xs sm:text-sm inline-flex items-center gap-2 shrink-0"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>Try Live in Mission Control</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
              aria-pressed={isSelected}
              className={`p-4 rounded-[14px] border text-left transition-colors space-y-2 flex flex-col justify-between ${
                isSelected
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                  : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--panel)] border border-[var(--border)] text-[var(--text)]">
                  {c.badge}
                </span>
                <span className="text-[10px] text-[var(--muted)] font-mono">
                  {c.variable} ({c.unit})
                </span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-[var(--text)] leading-snug">{c.title}</h2>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{c.question}</p>
              </div>

              <div className="text-[11px] text-[var(--accent)] font-medium pt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{c.location.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Case Content */}
      {activeCase && (
        <div className="space-y-5">
          {/* Cached Dataset Provenance Bar */}
          <div className="bg-[var(--panel)] border border-[var(--border)] px-4 py-2.5 rounded-[14px] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--sig)' }} aria-hidden="true" />
              <span className="font-semibold text-[var(--text)]">Saved NASA Archive Snapshot:</span>
              <span className="font-mono text-[var(--accent)]">{activeCase.data_source_label}</span>
            </div>
            <div className="text-[var(--muted)] font-mono text-[11px]">
              ~50 km grid cell · Complete 1990–2023 baseline
            </div>
          </div>

          {/* 5-Step Walkthrough */}
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[14px] p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
              <span>5-Step Scientific Deduction Walkthrough</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {[
                { label: 'Step 1 · Question', text: activeCase.narration.step1_question },
                { label: 'Step 2 · Variable', text: activeCase.narration.step2_variable },
                { label: 'Step 3 · Place', text: activeCase.narration.step3_location },
                { label: 'Step 4 · Chart', text: activeCase.narration.step4_chart },
                { label: 'Step 5 · Verdict', text: activeCase.narration.step5_verdict, highlight: true }
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--card)] p-3.5 rounded-[12px] border space-y-1.5"
                  style={{ borderColor: s.highlight ? 'var(--sig)' : 'var(--border)' }}
                >
                  <div
                    className="font-bold font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: s.highlight ? 'var(--sig)' : 'var(--accent)' }}
                  >
                    {s.label}
                  </div>
                  <p className="text-[var(--text)] leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <TimeSeriesChart
            data={activeCase.time_series}
            variableName={activeCase.variable_name}
            unit={activeCase.unit}
            pettitt={activeCase.summary?.pettitt}
            slopeDirection={activeCase.summary?.sens_slope_per_year ?? 0}
          />

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[14px] space-y-1">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                Sen&apos;s Slope Rate
              </div>
              <div
                className="text-xl font-mono font-extrabold"
                style={{
                  color:
                    (activeCase.summary?.rate_per_decade ?? 0) >= 0 ? 'var(--warm)' : 'var(--cool)'
                }}
              >
                {formatSigned(activeCase.summary?.rate_per_decade, 3)} {activeCase.unit}/dec
              </div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[14px] space-y-1">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                Mann-Kendall Significance
              </div>
              <div className="text-xl font-mono font-extrabold text-[var(--text)]">
                p = {activeCase.summary?.mann_kendall?.p_value?.toFixed(5) || 'N/A'}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                {activeCase.summary?.is_significant
                  ? 'Statistically Significant (p < 0.05)'
                  : 'No Significant Trend (p ≥ 0.05)'}
              </div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[14px] space-y-1">
              <div className="text-[11px] text-[var(--muted)] font-semibold uppercase tracking-wider">
                Observations Analyzed
              </div>
              <div className="text-xl font-mono font-extrabold" style={{ color: 'var(--sig)' }}>
                {activeCase.summary?.observation_count} monthly pts
              </div>
              <div className="text-[11px] text-[var(--muted)]">1990–2023 baseline</div>
            </div>
          </div>

          {/* 3-Question Quiz */}
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-[14px] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
                <div>
                  <h3 className="text-base font-bold text-[var(--text)]">Detective Knowledge Check</h3>
                  <p className="text-xs text-[var(--muted)]">Verify statistical interpretation and physical mechanisms.</p>
                </div>
              </div>
              <div className="text-xs font-mono bg-[var(--card)] px-3 py-1.5 rounded-full border border-[var(--border)]">
                Score: <strong className="text-[var(--accent)]">{correctCount} / {quizItems.length}</strong>
              </div>
            </div>

            <div className="space-y-4">
              {quizItems.map((q, qIdx) => {
                const userChoice = userAnswers[`${selectedCaseId}_${qIdx}`];
                const hasAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correct_index;

                return (
                  <div key={qIdx} className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-[14px] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[var(--panel)] border border-[var(--border)] text-[var(--accent)] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-[var(--text)]">{q.question}</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isPicked = userChoice === optIdx;
                        let style = {};
                        let cls = 'bg-[var(--panel)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]';

                        if (hasAnswered) {
                          if (optIdx === q.correct_index) {
                            style = { backgroundColor: 'var(--sig-soft)', borderColor: 'var(--sig)' };
                            cls = 'font-semibold text-[var(--text)]';
                          } else if (isPicked) {
                            style = { backgroundColor: 'var(--warm-soft)', borderColor: 'var(--warm)' };
                            cls = 'text-[var(--text)]';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            style={style}
                            className={`p-3 rounded-[10px] border text-left text-xs transition-colors flex items-center justify-between ${cls}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && optIdx === q.correct_index && (
                              <CheckCircle2 className="w-4 h-4 shrink-0 ml-2" style={{ color: 'var(--sig)' }} />
                            )}
                            {hasAnswered && isPicked && optIdx !== q.correct_index && (
                              <XCircle className="w-4 h-4 shrink-0 ml-2" style={{ color: 'var(--warm)' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <div
                        className="p-3 rounded-[10px] border text-xs space-y-1"
                        style={{
                          backgroundColor: isCorrect ? 'var(--sig-soft)' : 'var(--card-subtle)',
                          borderColor: isCorrect ? 'var(--sig)' : 'var(--border)'
                        }}
                      >
                        <div className="font-bold flex items-center gap-1.5 text-[var(--text)]">
                          <Info className="w-3.5 h-3.5" />
                          <span>Scientific Explanation</span>
                        </div>
                        <p className="text-[var(--muted)] leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Answers</span>
              </button>
              <button
                type="button"
                onClick={handleTryLive}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[var(--accent)] text-[var(--accent-fg)] font-bold text-xs"
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

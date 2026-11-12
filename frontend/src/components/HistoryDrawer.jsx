import React, { useEffect, useState } from 'react';
import { X, History, MapPin, Loader2 } from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { SignificanceBadge, TrendArrow } from './ui';

export default function HistoryDrawer({ isOpen, onClose, onSelectRun }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getAnalysisHistory(15)
        .then((data) => setHistoryItems(data || []))
        .catch(() => setHistoryItems([]))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleItemClick = (item) => {
    if (onSelectRun) {
      onSelectRun(item);
    }
    onClose();
    navigate(
      `/investigate?var=${encodeURIComponent(item.variable)}&lat=${item.latitude}&lon=${item.longitude}&loc=${encodeURIComponent(item.location_name || '')}&start=${(item.start_date || '1990').slice(0, 4)}&end=${(item.end_date || '2023').slice(0, 4)}`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Investigation History"
    >
      <div className="w-full max-w-md bg-[var(--panel)] h-full border-l border-[var(--border)] p-5 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <History className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
            <h3 className="text-base font-bold">Investigation History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history drawer"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-subtle)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-[var(--muted)]">
              <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
              <span className="text-xs">Loading previous runs...</span>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)] text-sm">
              <History className="w-9 h-9 mx-auto mb-2 opacity-40" />
              <p>No previous analysis runs logged yet.</p>
              <p className="text-xs mt-1">Runs are automatically recorded when analyzed.</p>
            </div>
          ) : (
            historyItems.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => handleItemClick(item)}
                className="w-full text-left bg-[var(--card)] hover:border-[var(--accent)] border border-[var(--border)] p-3.5 rounded-[14px] transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-[var(--text)] text-sm">
                    {item.variable_name} <span className="font-mono text-xs text-[var(--muted)]">({item.variable})</span>
                  </div>
                  <SignificanceBadge isSignificant={Boolean(item.is_significant)} />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.location_name}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-2 border-t border-[var(--border)]">
                  <span className="font-mono">
                    {item.start_date?.slice(0, 4)}–{item.end_date?.slice(0, 4)}
                  </span>
                  {item.sen_slope !== undefined && item.sen_slope !== null && (
                    <TrendArrow
                      value={item.sen_slope * 10}
                      unit="/dec"
                      decimals={2}
                      isSignificant={Boolean(item.is_significant)}
                      className="text-xs"
                    />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border)] text-[11px] text-[var(--muted)] text-center font-mono">
          SQLite log · earthpulse.db
        </div>
      </div>
    </div>
  );
}

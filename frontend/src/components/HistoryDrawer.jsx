import React, { useEffect, useState } from 'react';
import { X, History, ArrowRight, Calendar, MapPin, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
    navigate('/investigate');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0D1B2A] h-full border-l border-[#1E3A56] p-5 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E3A56]">
          <div className="flex items-center space-x-2 text-white">
            <History className="w-5 h-5 text-[#00D4FF]" />
            <h3 className="text-base font-bold font-heading">Investigation History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#13263A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 text-[#00D4FF] animate-spin" />
              <span className="text-xs">Loading previous runs...</span>
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p>No previous analysis runs logged yet.</p>
              <p className="text-xs text-slate-500 mt-1">Runs are automatically recorded in local SQLite database.</p>
            </div>
          ) : (
            historyItems.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => handleItemClick(item)}
                className="bg-[#13263A] hover:bg-[#1E3A56]/60 cursor-pointer border border-[#1E3A56] p-3.5 rounded-xl transition space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-white text-sm group-hover:text-[#00D4FF] transition">
                    {item.variable_name} ({item.variable})
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      item.is_significant
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}
                  >
                    {item.is_significant ? 'Significant' : 'Not Sig.'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
                  <span className="truncate">{item.location_name}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1E3A56]/40">
                  <span className="font-mono">{item.start_date?.slice(0, 4)}–{item.end_date?.slice(0, 4)}</span>
                  <span className="font-mono text-white">
                    Slope: {item.sen_slope !== undefined ? `${item.sen_slope > 0 ? '+' : ''}${item.sen_slope.toFixed(4)}/yr` : 'N/A'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#1E3A56] text-[11px] text-slate-400 text-center">
          Persisted securely in local SQLite database (<code className="text-[#00D4FF]">earthpulse.db</code>)
        </div>
      </div>
    </div>
  );
}

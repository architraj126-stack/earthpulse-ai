import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function DateSelector({
  startDate = '2000-01-01',
  endDate = '2023-12-31',
  frequency = 'monthly',
  onStartDateChange,
  onEndDateChange,
  onFrequencyChange
}) {
  const maxDate = '2024-12-31';
  const minDate = '1981-01-01';

  const applyPreset = (start, end) => {
    onStartDateChange(start);
    onEndDateChange(end);
  };

  const startYear = parseInt(startDate.slice(0, 4), 10);
  const endYear = parseInt(endDate.slice(0, 4), 10);
  const yearSpan = isNaN(endYear - startYear) ? 0 : Math.max(1, endYear - startYear + 1);

  const isValidRange = startDate <= endDate;

  return (
    <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Calendar className="w-4 h-4 text-[#00D4FF]" />
          <span>Analysis Window & Resolution</span>
        </div>
        <div className="text-xs text-[#9BAEC2]">
          Span: <span className="text-[#00D4FF] font-semibold">{yearSpan} Years</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Start Date */}
        <div>
          <label className="block text-xs text-[#9BAEC2] mb-1 font-medium">Start Date</label>
          <input
            type="date"
            min={minDate}
            max={endDate}
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs text-[#9BAEC2] mb-1 font-medium">End Date</label>
          <input
            type="date"
            min={startDate}
            max={maxDate}
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {/* Temporal Frequency */}
        <div>
          <label className="block text-xs text-[#9BAEC2] mb-1 font-medium">Frequency</label>
          <div className="flex rounded-lg bg-[#0D1B2A] p-0.5 border border-[#1E3A56]">
            <button
              type="button"
              onClick={() => onFrequencyChange('monthly')}
              className={`flex-1 py-1 text-xs rounded font-medium transition ${
                frequency === 'monthly'
                  ? 'bg-[#00D4FF] text-[#071426] font-semibold shadow-sm'
                  : 'text-[#9BAEC2] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onFrequencyChange('daily')}
              className={`flex-1 py-1 text-xs rounded font-medium transition ${
                frequency === 'daily'
                  ? 'bg-[#00D4FF] text-[#071426] font-semibold shadow-sm'
                  : 'text-[#9BAEC2] hover:text-white'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
        <span className="text-[#9BAEC2] mr-1">Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset('2014-01-01', '2023-12-31')}
          className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#1E3A56] text-[#9BAEC2] hover:text-[#00D4FF] hover:border-[#00D4FF] transition"
        >
          10 Years (2014–2023)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('2004-01-01', '2023-12-31')}
          className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#1E3A56] text-[#9BAEC2] hover:text-[#00D4FF] hover:border-[#00D4FF] transition"
        >
          20 Years (2004–2023)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('2000-01-01', '2023-12-31')}
          className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#1E3A56] text-[#9BAEC2] hover:text-[#00D4FF] hover:border-[#00D4FF] transition"
        >
          2000–2023
        </button>
        <button
          type="button"
          onClick={() => applyPreset('1981-01-01', '2023-12-31')}
          className="px-2 py-0.5 rounded bg-[#0D1B2A] border border-[#1E3A56] text-[#9BAEC2] hover:text-[#00D4FF] hover:border-[#00D4FF] transition"
        >
          Full Archive (1981–2023)
        </button>
      </div>

      {!isValidRange && (
        <div className="flex items-center gap-1.5 text-xs text-[#FF4D4D] bg-[#FF4D4D]/10 p-2 rounded-lg border border-[#FF4D4D]/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Invalid date window: Start date must be earlier than or equal to End date.</span>
        </div>
      )}
    </div>
  );
}

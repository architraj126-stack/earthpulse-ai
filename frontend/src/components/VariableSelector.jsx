import React, { useState } from 'react';
import { Search, Thermometer, CloudRain, Droplets, Wind, Sun, Info, Check, Filter } from 'lucide-react';

const VARIABLE_ICONS = {
  T2M: Thermometer,
  PRECTOTCORR: CloudRain,
  RH2M: Droplets,
  WS2M: Wind,
  ALLSKY_SFC_SW_DWN: Sun
};

const VARIABLE_ACCENTS = {
  T2M: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  PRECTOTCORR: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  RH2M: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  WS2M: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  ALLSKY_SFC_SW_DWN: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
};

export default function VariableSelector({
  variables = [],
  selectedVariable = 'T2M',
  onSelectVariable
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...new Set(variables.map(v => v.category))];

  const filtered = variables.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                          v.parameter.toLowerCase().includes(search.toLowerCase()) ||
                          v.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#13263A] rounded-xl border border-[#1E3A56] p-4 shadow-lg space-y-4">
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variables by name, parameter (e.g. T2M, PRECTOTCORR), or definition..."
            className="w-full bg-[#0D1B2A] border border-[#1E3A56] rounded-lg px-3.5 py-2 pl-9 text-sm text-white placeholder-[#9BAEC2] focus:outline-none focus:border-[#00D4FF]"
          />
          <Search className="w-4 h-4 text-[#9BAEC2] absolute left-3 top-2.5" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#00D4FF] text-[#071426] font-semibold'
                  : 'bg-[#0D1B2A] text-[#9BAEC2] hover:text-white border border-[#1E3A56]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Variable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(item => {
          const isSelected = selectedVariable === item.parameter;
          const Icon = VARIABLE_ICONS[item.parameter] || Thermometer;
          const accentClass = VARIABLE_ACCENTS[item.parameter] || 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/30';

          return (
            <div
              key={item.parameter}
              onClick={() => onSelectVariable(item.parameter)}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0D1B2A] border-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.25)] ring-1 ring-[#00D4FF]'
                  : 'bg-[#0D1B2A]/70 border-[#1E3A56] hover:border-[#9BAEC2]/50 hover:bg-[#0D1B2A]'
              }`}
            >
              <div>
                {/* Header: Icon, Code & Unit */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg border ${accentClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white tracking-wide">
                          {item.parameter}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#13263A] text-[#00D4FF] font-mono border border-[#1E3A56]">
                          {item.unit}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9BAEC2] block">{item.category}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00D4FF] text-[#071426]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Full Name & Simple Definition */}
                <h4 className="font-semibold text-sm text-white mb-1 leading-snug">
                  {item.name}
                </h4>
                <p className="text-xs text-[#9BAEC2] leading-relaxed mb-3 line-clamp-2">
                  {item.definition}
                </p>
              </div>

              {/* Footer Metadata */}
              <div className="pt-2 border-t border-[#1E3A56] text-[10px] space-y-1 text-[#9BAEC2]">
                <div className="flex items-center justify-between">
                  <span>NASA Source:</span>
                  <span className="text-white font-medium truncate max-w-[170px]">{item.source.split('/')[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolution:</span>
                  <span className="text-white capitalize">{item.temporal_resolutions?.join(', ')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

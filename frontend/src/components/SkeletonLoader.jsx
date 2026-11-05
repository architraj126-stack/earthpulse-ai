import React from 'react';

export default function SkeletonLoader({ text = 'Loading EarthPulse Platform...' }) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-[#1E3A56] border-t-[#00D4FF] animate-spin" />
        <div className="absolute w-8 h-8 rounded-full bg-[#00D4FF]/20 animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-white font-heading">{text}</p>
        <p className="text-xs text-slate-400 font-mono">Syncing NASA Earth Observation Nodes...</p>
      </div>
    </div>
  );
}

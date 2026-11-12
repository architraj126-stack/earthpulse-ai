import React from 'react';

export default function SkeletonLoader({ text = 'Loading EarthPulse Observatory...' }) {
  return (
    <div
      className="w-full min-h-[55vh] flex flex-col items-center justify-center p-8 space-y-4"
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-[var(--text)]">{text}</p>
        <p className="text-xs text-[var(--muted)] font-mono">Retrieving NASA POWER records &amp; statistical series...</p>
      </div>
    </div>
  );
}

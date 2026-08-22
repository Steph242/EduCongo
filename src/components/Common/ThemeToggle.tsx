import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Passer au thème Clair (Bleu Marine & Blanc)' : 'Passer au thème Sombre (Bleu Nuit)'}
      aria-label="Changer le thème"
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-300 cursor-pointer select-none active:scale-95 group ${
        isDark
          ? 'bg-slate-900/60 hover:bg-slate-800 text-amber-300 border-white/15 hover:border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
          : 'bg-white/90 hover:bg-white text-indigo-900 border-slate-300 hover:border-indigo-400 shadow-[0_2px_10px_rgba(30,58,138,0.1)]'
      } ${className}`}
    >
      <span
        className={`material-symbols-outlined text-[18px] transition-transform duration-500 ${
          isDark ? 'rotate-0 text-amber-300' : 'rotate-180 text-indigo-600'
        }`}
      >
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      {!compact && (
        <span className="text-[11.5px] font-semibold hidden sm:inline">
          {isDark ? 'Clair' : 'Sombre'}
        </span>
      )}
    </button>
  );
};

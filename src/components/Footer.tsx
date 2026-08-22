import React from 'react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenHelp: () => void;
  onOpenDevPanel?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, onOpenHelp }) => {
  return (
    <footer className="bg-slate-950/60 dark:bg-slate-950/70 light:bg-white/80 backdrop-blur-xl border-t border-white/10 dark:border-white/10 light:border-slate-200 mt-auto py-8 relative z-20 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white text-xs font-extrabold shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            EC
          </div>
          <span className="text-[17px] font-bold bg-gradient-to-r from-white to-slate-300 dark:from-white dark:to-slate-300 light:from-slate-900 light:to-blue-950 bg-clip-text text-transparent tracking-tight">
            EduCongo
          </span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-slate-400 text-center md:text-left">
          © 2024-2025 Plateforme Nationale de Gestion Scolaire - République du Congo.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] text-slate-400">
          <button
            onClick={onOpenAbout}
            className="hover:text-blue-400 hover:underline transition-all cursor-pointer"
          >
            Confidentialité & Données
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:text-blue-400 hover:underline transition-all cursor-pointer"
          >
            Conditions d'utilisation
          </button>
          <button
            onClick={onOpenHelp}
            className="hover:text-blue-400 hover:underline transition-all cursor-pointer"
          >
            Assistance technique
          </button>
        </nav>
      </div>
    </footer>
  );
};

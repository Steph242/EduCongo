import React from 'react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenHelp: () => void;
  onOpenDevPanel?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, onOpenHelp, onOpenDevPanel }) => {
  return (
    <footer className="bg-slate-950/50 backdrop-blur-xl border-t border-white/10 mt-auto py-8 relative z-20">
      <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            EC
          </div>
          <span className="text-[17px] font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">EduCongo</span>
        </div>

        <p className="text-[12px] sm:text-[13px] text-slate-400 text-center md:text-left">
          © 2024 Système de Gestion Scolaire du Congo. Tous droits réservés.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[12px] text-slate-400">
          {onOpenDevPanel && (
            <button
              onClick={onOpenDevPanel}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-all flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20"
            >
              <span className="material-symbols-outlined text-[14px]">terminal</span>
              Console Développeur
            </button>
          )}
          <button
            onClick={onOpenAbout}
            className="hover:text-emerald-400 hover:underline transition-all cursor-pointer"
          >
            Confidentialité
          </button>
          <button
            onClick={onOpenAbout}
            className="hover:text-emerald-400 hover:underline transition-all cursor-pointer"
          >
            Conditions d'utilisation
          </button>
          <button
            onClick={onOpenHelp}
            className="hover:text-emerald-400 hover:underline transition-all cursor-pointer"
          >
            Assistance technique
          </button>
        </nav>
      </div>
    </footer>
  );
};

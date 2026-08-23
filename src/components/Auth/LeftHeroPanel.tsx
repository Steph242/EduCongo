import React from 'react';

interface LeftHeroPanelProps {
  variant?: 'login' | 'register';
}

export const LeftHeroPanel: React.FC<LeftHeroPanelProps> = ({ variant = 'login' }) => {
  return (
    <div className="relative w-full lg:w-1/2 min-h-[380px] lg:min-h-[580px] overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.4)] my-2 lg:my-0 flex flex-col justify-between p-6 sm:p-8 md:p-10">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Flag accent bar with Frosted Glass capsule */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 bg-slate-950/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex w-6 h-4 rounded overflow-hidden shadow-sm">
            <div className="w-1/3 bg-[#009543]"></div>
            <div className="w-1/3 bg-[#FBDE4A]"></div>
            <div className="w-1/3 bg-[#DC241F]"></div>
          </div>
          <span className="text-white text-xs font-semibold tracking-wide">
            République du Congo
          </span>
        </div>
      </div>

      {/* Text overlay depending on view */}
      <div className="relative z-10 text-white mt-auto pt-8">
        {variant === 'login' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-xl px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 mb-4 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
              Système National d'Établissements
            </div>
            <h1 className="text-[30px] sm:text-[36px] lg:text-[42px] font-extrabold leading-tight tracking-tight text-white mb-3">
              L'Excellence Scolaire <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">au Congo</span>
            </h1>
            <p className="text-[13.5px] sm:text-[15px] text-slate-300 max-w-lg leading-relaxed font-light">
              Plateforme numérique sécurisée pour la gestion administrative, pédagogique et financière des établissements scolaires en République du Congo.
            </p>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 backdrop-blur-xl px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 mb-4 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <span className="material-symbols-outlined text-[16px] text-indigo-400">school</span>
              Nouvelle Inscription Scolaire
            </div>
            <h2 className="text-[26px] sm:text-[32px] lg:text-[36px] font-extrabold leading-snug text-white mb-3">
              Rejoignez le réseau numérique EduCongo.
            </h2>
            <p className="text-[13.5px] sm:text-[15px] text-slate-300 max-w-lg leading-relaxed font-light">
              Gérez votre établissement avec précision et fluidité. Une plateforme conçue pour les réalités de notre écosystème éducatif.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


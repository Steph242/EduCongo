import React from 'react';

interface LeftHeroPanelProps {
  variant?: 'login' | 'register';
}

export const LeftHeroPanel: React.FC<LeftHeroPanelProps> = ({ variant = 'login' }) => {
  return (
    <div className="relative w-full lg:w-1/2 h-[560px] max-h-[90vh] overflow-hidden rounded-3xl border border-white/15 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between p-6 sm:p-8 md:p-9 group select-none">
      {/* High Quality Background Image illustrating authentic African & Congolese classroom life */}
      <img
        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80"
        alt="Élèves et communauté scolaire au Congo"
        className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 opacity-40"
      />

      {/* Modern Gradient & Frosted Glass Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-to-t from-emerald-950/30 via-transparent to-transparent pointer-events-none" />

      {/* Ambient background glows */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Flag accent bar with Frosted Glass capsule */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex w-6 h-4 rounded overflow-hidden shadow-sm">
            <div className="w-1/3 bg-[#009543]"></div>
            <div className="w-1/3 bg-[#FBDE4A]"></div>
            <div className="w-1/3 bg-[#DC241F]"></div>
          </div>
          <span className="text-white text-xs font-semibold tracking-wide">
            République du Congo
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          MEPPSA Cloud Ready
        </div>
      </div>

      {/* Text overlay depending on view */}
      <div className="relative z-10 text-white mt-auto pt-4">
        {variant === 'login' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-xl px-3 py-1 rounded-xl text-[11px] font-semibold text-emerald-300 mb-2.5 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">verified</span>
              Système National d'Établissements
            </div>
            <h1 className="text-[26px] sm:text-[30px] lg:text-[32px] font-extrabold leading-tight tracking-tight text-white mb-2">
              L'Excellence Scolaire <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">en République du Congo</span>
            </h1>
            <p className="text-[12px] sm:text-[13px] text-slate-300 max-w-md leading-relaxed font-light">
              Plateforme numérique sécurisée pour la gestion administrative, pédagogique et financière des établissements scolaires congolais.
            </p>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 backdrop-blur-xl px-3 py-1 rounded-xl text-[11px] font-semibold text-indigo-300 mb-2.5 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <span className="material-symbols-outlined text-[14px] text-indigo-400">school</span>
              Nouvelle Inscription Scolaire
            </div>
            <h2 className="text-[24px] sm:text-[28px] lg:text-[30px] font-extrabold leading-snug text-white mb-2">
              Rejoignez le réseau EduCongo
            </h2>
            <p className="text-[12px] sm:text-[13px] text-slate-300 max-w-md leading-relaxed font-light">
              Créez votre compte administrateur en 3 clics. Vous configurerez l'ensemble de votre établissement (cycles, classes, frais) directement depuis votre tableau de bord.
            </p>
          </div>
        )}

        {/* Feature bullets */}
        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
            <span>Bulletins & Relevés</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
            <span>Mobile Money (MTN/Airtel)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
            <span>Cartes Scolaires QR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
            <span>Sous-domaine dédié</span>
          </div>
        </div>
      </div>
    </div>
  );
};




import React from 'react';

interface LeftHeroPanelProps {
  variant?: 'login' | 'register';
}

export const LeftHeroPanel: React.FC<LeftHeroPanelProps> = ({ variant = 'login' }) => {
  const heroImageSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuDBlnJyMGrxwcA0E0p6ZWL3zDobmraByrjRLay1eL3B04JDSYGmch9FMFR0G3fndjdEYMjM1093c4NJ-FotUKs1SO5_khxXqxqDz4wPeJtiZiZu0eu-bRWbgSmiMhKa6yFi5YEsZ6ppFA5vGyJrGD_mn_4zZaxXAaOPLx_G6y-vn1nuU2qXlgzOBl2li6DInJTbnqmNKpRV8Y8tZaIq34YDCrWMBQwI2v_ljKAWXLzmGoHeLxRorf_P";
  const fallbackImageSrc = "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative w-full lg:w-1/2 min-h-[420px] lg:min-h-[620px] overflow-hidden rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)] my-2 lg:my-0 flex flex-col justify-end group">
      {/* Background Image with fallback */}
      <img
        alt="L'Excellence Scolaire au Congo"
        className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
        src={heroImageSrc}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallbackImageSrc;
        }}
      />

      {/* Dark & Multi-layer Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent"></div>
      <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay"></div>

      {/* Flag accent bar with Frosted Glass capsule */}
      <div className="absolute top-6 left-6 flex items-center gap-2.5 bg-slate-950/50 backdrop-blur-xl px-4 py-2 rounded-full border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex w-6 h-4 rounded overflow-hidden shadow-sm">
          <div className="w-1/3 bg-[#009543]"></div>
          <div className="w-1/3 bg-[#FBDE4A]"></div>
          <div className="w-1/3 bg-[#DC241F]"></div>
        </div>
        <span className="text-white text-xs font-semibold tracking-wide">
          République du Congo
        </span>
      </div>

      {/* Text overlay depending on view */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 text-white">
        {variant === 'login' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-xl px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 mb-4 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
              Système National d'Établissements
            </div>
            <h1 className="text-[32px] sm:text-[38px] lg:text-[44px] font-extrabold leading-tight tracking-tight text-white mb-3">
              L'Excellence Scolaire <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent">au Congo</span>
            </h1>
            <p className="text-[14px] sm:text-[16px] text-slate-300 max-w-lg leading-relaxed font-light">
              Système de gestion moderne pour les établissements scolaires exigeants de Brazzaville, Pointe-Noire et de l'ensemble des départements.
            </p>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 backdrop-blur-xl px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 mb-4 border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <span className="material-symbols-outlined text-[16px] text-indigo-400">school</span>
              Nouvelle Inscription Scolaire
            </div>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold leading-snug text-white mb-3">
              Rejoignez l'avenir de l'éducation au Congo.
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-300 max-w-lg leading-relaxed font-light">
              Gérez votre établissement avec précision et fluidité. Une plateforme conçue pour les réalités de notre écosystème éducatif.
            </p>
          </div>
        )}

        {/* Feature Highlights Bottom Frosted Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-white/10 text-[12px] text-slate-200">
          <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">payments</span>
            <span className="truncate">MTN & Airtel Money</span>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-amber-300 text-[18px]">assignment</span>
            <span className="truncate">Bulletins MEPPSA</span>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-indigo-400 text-[18px]">verified_user</span>
            <span className="truncate">Conforme Ministère</span>
          </div>
        </div>
      </div>
    </div>
  );
};

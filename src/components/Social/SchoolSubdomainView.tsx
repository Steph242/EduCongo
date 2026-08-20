import React, { useState } from 'react';
import { SchoolSocialFeed } from './SchoolSocialFeed';
import { SchoolPortalModal } from './SchoolPortalModal';
import { PortalRole } from '../../types';

interface SchoolSubdomainViewProps {
  schoolName: string;
  schoolCode: string;
  subdomain?: string;
  slogan?: string;
  logoUrl?: string;
  city?: string;
  department?: string;
  onOpenAdminLogin: () => void;
  onBackToMainPortal: () => void;
}

export const SchoolSubdomainView: React.FC<SchoolSubdomainViewProps> = ({
  schoolName,
  schoolCode,
  subdomain = 'lycee-excellence',
  slogan = 'Discipline - Travail - Succès',
  logoUrl = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
  city = 'Brazzaville',
  department = 'Brazzaville',
  onOpenAdminLogin,
  onBackToMainPortal,
}) => {
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [targetPortalRole, setTargetPortalRole] = useState<PortalRole>('parent');

  const fullDomain = `${subdomain || 'etablissement'}.educongo.cg`;

  const handleOpenRolePortal = (role: PortalRole) => {
    setTargetPortalRole(role);
    setPortalModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-[#f8fafc] font-sans selection:bg-emerald-500 selection:text-white relative pb-12">
      {/* Top Domain Address Bar Header */}
      <div className="bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMainPortal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Portail National EduCongo</span>
          </button>

          {/* Browser-style address pill */}
          <div className="flex items-center gap-2 bg-black/50 border border-emerald-500/30 px-3 py-1 rounded-xl font-mono text-xs text-emerald-400 shadow-inner">
            <span className="material-symbols-outlined text-[15px] text-emerald-400">lock</span>
            <span className="text-slate-400">https://</span>
            <strong className="text-emerald-300 font-bold">{fullDomain}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="px-3.5 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">admin_panel_settings</span>
            <span>Accès Direction</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase of the School */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 w-full space-y-8">
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-emerald-950/30 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Top National Ribbon */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            {/* School Official Logo */}
            <div className="relative shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-slate-800"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  {schoolName.charAt(0)}
                </div>
              )}
              {/* National flag stamp icon */}
              <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1 rounded-xl border border-white/20 shadow-md">
                <span className="text-sm">🇨🇬</span>
              </div>
            </div>

            {/* School identity information */}
            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                  Établissement Homologué MEPPSA
                </span>
                <span className="font-mono text-xs text-indigo-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  Code : {schoolCode}
                </span>
                <span className="text-xs text-slate-400">
                  {city}, {department}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {schoolName}
              </h1>

              {/* School Slogan */}
              <div className="italic text-sm sm:text-base font-semibold text-emerald-300 flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-yellow-400 text-[18px]">format_quote</span>
                <span>« {slogan} »</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Bienvenue sur le portail numérique officiel de l'établissement. Consultez le fil d'actualités en direct, accédez aux dossiers scolaires et aux relevés de notes.
              </p>
            </div>
          </div>

          {/* Quick Access Access Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
            {/* Parent card */}
            <button
              type="button"
              onClick={() => handleOpenRolePortal('parent')}
              className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-400/50 transition-all text-left group cursor-pointer shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">family_restroom</span>
              </div>
              <div className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                Espace Parents d'Élèves
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Connexion par Téléphone + PIN à 4 chiffres (bulletins, absences, écolages).
              </p>
            </button>

            {/* Student card */}
            <button
              type="button"
              onClick={() => handleOpenRolePortal('student')}
              className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 transition-all text-left group cursor-pointer shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">school</span>
              </div>
              <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                Espace Élèves & Étudiants
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Connexion par Code Étudiant + PIN à 6 chiffres (carte scolaire QR, notes).
              </p>
            </button>

            {/* Staff card */}
            <button
              type="button"
              onClick={() => handleOpenRolePortal('staff')}
              className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-teal-400/50 transition-all text-left group cursor-pointer shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">badge</span>
              </div>
              <div className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">
                Personnel & Enseignants
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Connexion par Téléphone + PIN à 6 chiffres (publications, appel de classe).
              </p>
            </button>
          </div>
        </div>

        {/* Live School Social Feed on the Subdomain Showcase */}
        <SchoolSocialFeed
          schoolName={schoolName}
          schoolCode={schoolCode}
          cityName={city}
          canCreatePost={false}
        />
      </div>

      {/* Modal Multi-Role Portal */}
      <SchoolPortalModal
        isOpen={portalModalOpen}
        onClose={() => setPortalModalOpen(false)}
        schoolName={schoolName}
        schoolCode={schoolCode}
        cityName={city}
        initialRole={targetPortalRole}
      />
    </div>
  );
};

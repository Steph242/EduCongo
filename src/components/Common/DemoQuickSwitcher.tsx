import React, { useState } from 'react';
import { RegisteredSchoolAccount, SchoolRegistrationData } from '../../types';
import { INITIAL_REGISTERED_SCHOOLS } from '../../data/mockRegisteredSchools';

interface DemoQuickSwitcherProps {
  onSelectSchool: (school: {
    name: string;
    city: string;
    code: string;
    slogan?: string;
    logoUrl?: string;
    subdomain?: string;
  }) => void;
  onOpenDevPanel: () => void;
  onOpenPortal: (school?: {
    name: string;
    city: string;
    code: string;
    slogan?: string;
    logoUrl?: string;
    subdomain?: string;
  }) => void;
  onFillRegistrationForm?: (sampleData: SchoolRegistrationData) => void;
  onNavigateScreen?: (screen: 'auth' | 'dashboard' | 'dev_panel' | 'subdomain_portal') => void;
}

export const DemoQuickSwitcher: React.FC<DemoQuickSwitcherProps> = ({
  onSelectSchool,
  onOpenDevPanel,
  onOpenPortal,
  onFillRegistrationForm,
  onNavigateScreen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profiles' | 'tools'>('profiles');

  const SAMPLE_REGISTRATION_MOCK: SchoolRegistrationData = {
    schoolName: 'Collège Privé La Renaissance de Talangaï',
    codeFormat: 'departement',
    schoolCode: 'BZV-24-REN',
    schoolType: 'secondaire',
    department: 'Brazzaville',
    city: 'Brazzaville',
    arrondissement: 'Arrondissement 6 (Talangaï)',
    directorName: 'Mme Jeanne-Marie Koumba',
    adminRole: 'directeur',
    adminFullName: 'Jeanne-Marie Koumba',
    workEmail: 'direction@renaissance-bzv.cg',
    personalEmail: 'jm.koumba@gmail.com',
    workPhone: '+242 06 720 11 33',
    personalPhone: '+242 05 440 22 11',
    password: 'Password123!',
    slogan: 'Lumière, Discipline et Avenir',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=300&q=80',
    subdomain: 'renaissance-talangai',
    isEmailVerified: true,
    isPhoneVerified: true,
    documents: {
      agrementFile: 'arrete_homologation_renaissance.pdf',
      statutsFile: 'statuts_fondation_renaissance.pdf',
      identityFile: 'cni_jeanne_marie.pdf',
    },
  };

  return (
    <>
      {/* Floating Demo Badge / Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-[0_8px_25px_rgba(99,102,241,0.5)] border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <span className="material-symbols-outlined text-[18px]">terminal</span>
          <span className="hidden sm:inline">Mode Démo & Développeur</span>
          <span className="sm:hidden">Dev</span>
        </button>
      </div>

      {/* Modal / Quick Switcher Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-950/95 border border-indigo-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                  <span className="material-symbols-outlined text-[22px]">developer_mode</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                    Accès Rapide Démo & Développeur
                  </h3>
                  <p className="text-xs text-indigo-300">
                    Basculez instantanément entre les comptes, établissements et outils
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Quick Switch Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('profiles')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'profiles'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">switch_account</span>
                Profils & Rôles Démo (1 Clic)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tools')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'tools'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">build</span>
                Outils de Développement & Formulaire
              </button>
            </div>

            {/* Profiles Tab */}
            {activeTab === 'profiles' && (
              <div className="space-y-4">
                {/* 1. Super Admin Developer Control Panel Button */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 border border-indigo-400/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                      🛠️ Accès Système National MEPPSA
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                      Droits Totaux
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenDevPanel();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">terminal</span>
                      <span>Ouvrir le Control Panel Développeur (Super Admin)</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Gestion des établissements, audit logs, santé des microservices MTN/Airtel, console SQL et diffusion d’alertes ministérielles.
                  </p>
                </div>

                {/* 2. Direct School Impersonations */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">school</span>
                    Se connecter en tant qu’Établissement Spécifique :
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {INITIAL_REGISTERED_SCHOOLS.slice(0, 6).map((sch) => (
                      <button
                        key={sch.id}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onSelectSchool({
                            name: sch.schoolName,
                            city: sch.city,
                            code: sch.schoolCode,
                            slogan: sch.slogan,
                            logoUrl: sch.logoUrl,
                            subdomain: sch.subdomain,
                          });
                        }}
                        className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            {sch.schoolCode}
                          </span>
                          <span className="text-[10px] text-slate-400">{sch.city}</span>
                        </div>
                        <div className="font-bold text-white text-xs truncate group-hover:text-emerald-300 transition-colors">
                          {sch.schoolName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {sch.directorName}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Public Subdomain & Portal */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Portail Public & Réseau Social Scolaire</div>
                    <div className="text-[11px] text-emerald-400 font-mono">https://lycee-excellence.edu-congo.netlify.app</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenPortal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">language</span>
                    Visiter
                  </button>
                </div>
              </div>
            )}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-4 text-xs">
                {/* Autofill Registration */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">auto_fix_high</span>
                    Remplissage Automatique du Formulaire d’Inscription
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Pré-remplit instantanément toutes les étapes de l'assistant d’inscription avec un établissement réaliste (Collège de Talangaï) pour tester le flux de validation sans saisie manuelle.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onFillRegistrationForm) {
                        onFillRegistrationForm(SAMPLE_REGISTRATION_MOCK);
                      }
                      if (onNavigateScreen) {
                        onNavigateScreen('auth');
                      }
                      setIsOpen(false);
                      alert('Formulaire d’inscription pré-rempli avec succès !');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">magic_button</span>
                    Pré-remplir le dossier d'inscription
                  </button>
                </div>

                {/* Quick Navigation Shortcuts */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="font-bold text-white text-sm">Navigation Directe d'Écran</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateScreen) onNavigateScreen('auth');
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-left cursor-pointer"
                    >
                      🔑 Page de Connexion / Inscription
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateScreen) onNavigateScreen('dashboard');
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-left cursor-pointer"
                    >
                      📊 Tableau de Bord Scolaire
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateScreen) onNavigateScreen('subdomain_portal');
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-left cursor-pointer"
                    >
                      🌐 Portail Sous-Domaine & Agora
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateScreen) onNavigateScreen('dev_panel');
                        setIsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-left cursor-pointer"
                    >
                      🛠️ Control Panel Développeur
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

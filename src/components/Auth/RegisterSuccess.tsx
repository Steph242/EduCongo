import React from 'react';
import { SchoolRegistrationData } from '../../types';

interface RegisterSuccessProps {
  formData: SchoolRegistrationData;
  onReturnHome: () => void;
  onEnterDashboard: () => void;
  onOpenPortal?: () => void;
  onOpenHelp: () => void;
}

export const RegisterSuccess: React.FC<RegisterSuccessProps> = ({
  formData,
  onReturnHome,
  onEnterDashboard,
  onOpenPortal,
  onOpenHelp,
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success Card */}
      <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <span className="material-symbols-outlined text-[44px]">
            check_circle
          </span>
        </div>

        <h2 className="text-[24px] sm:text-[28px] font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent mb-2 leading-tight">
          Demande soumise avec succès !
        </h2>

        <p className="text-[15px] font-semibold text-emerald-400 mb-4">
          Votre dossier d'inscription pour {formData.schoolName || "l'établissement"} est désormais validé et enregistré.
        </p>

        {/* Dossier info pill */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-5 text-left text-[13px] space-y-2 backdrop-blur-md">
          <div className="flex justify-between">
            <span className="text-slate-400">Code attribué :</span>
            <span className="font-bold text-indigo-300 font-mono">{formData.schoolCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Établissement :</span>
            <span className="font-medium text-slate-200">{formData.schoolName}</span>
          </div>
          {formData.slogan && (
            <div className="flex justify-between">
              <span className="text-slate-400">Devise :</span>
              <span className="font-medium text-yellow-300 italic text-xs">« {formData.slogan} »</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">Département :</span>
            <span className="font-medium text-slate-200">{formData.department || 'Brazzaville'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ville & Quartier :</span>
            <span className="font-medium text-slate-200">
              {formData.city} {formData.arrondissement ? `(${formData.arrondissement})` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Adresse web (Portail) :</span>
            <span className="font-mono font-bold text-emerald-300 text-xs">
              https://{formData.subdomain || 'mon-ecole'}.educongo.cg
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vérifications :</span>
            <span className="font-medium text-emerald-400 text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {formData.isPhoneVerified ? 'SMS OTP Validé' : 'OTP Prêt'} • {formData.isEmailVerified ? 'Email Validé' : 'Lien Prêt'}
            </span>
          </div>
        </div>

        <p className="text-[13px] text-slate-300 mb-6 leading-relaxed font-light">
          Votre compte est désormais opérationnel. Vous pouvez vous connecter à la gestion ou visiter l'agora publique de l'école.
        </p>

        <div className="space-y-3">
          {onOpenPortal && (
            <button
              type="button"
              onClick={onOpenPortal}
              className="w-full flex justify-center items-center py-3 px-6 rounded-xl shadow-sm text-[14px] font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 border border-emerald-400/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">language</span>
              Visiter le Portail & Réseau Social de l'École
            </button>
          )}

          <button
            type="button"
            onClick={onEnterDashboard}
            className="w-full flex justify-center items-center py-2.5 px-6 rounded-xl border border-emerald-500/30 text-[13px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">dashboard</span>
            Accéder au tableau de bord administrateur
          </button>

          <button
            type="button"
            onClick={onReturnHome}
            className="w-full flex justify-center items-center py-2 px-6 rounded-xl border border-white/10 text-[12.5px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] mr-1.5">login</span>
            Page de connexion
          </button>
        </div>
      </div>

      {/* Support Text */}
      <div className="mt-6 text-center">
        <p className="text-[13px] text-slate-400">
          Besoin d'aide ?{' '}
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            Consulter le guide EduCongo
          </button>
        </p>
      </div>
    </div>
  );
};

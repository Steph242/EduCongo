import React, { useState } from 'react';
import { SchoolRegistrationData } from '../../types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { saveRegisteredAccount } from '../../services/accountService';

interface RegisterStep3Props {
  formData: SchoolRegistrationData;
  onChange: (field: keyof SchoolRegistrationData, value: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterStep3: React.FC<RegisterStep3Props> = ({
  formData,
  onChange,
  onSubmit,
  onBack,
  onSwitchToLogin,
}) => {
  const { isOnline } = useNetworkStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRealFileUpload = (
    docKey: 'agrementFile' | 'statutsFile' | 'identityFile',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedDocs = {
        ...formData.documents,
        [docKey]: file.name,
      };
      onChange('documents', updatedDocs);
    }
  };

  const handleRemoveFile = (docKey: 'agrementFile' | 'statutsFile' | 'identityFile') => {
    const updatedDocs = {
      ...formData.documents,
      [docKey]: null,
    };
    onChange('documents', updatedDocs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      return;
    }
    setIsSubmitting(true);
    // Persist real registered school account
    saveRegisteredAccount(formData);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 800);
  };

  return (
    <div className="w-full max-w-md bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative z-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent mb-1 tracking-tight">
          EduCongo
        </h1>
        <p className="text-[14px] text-slate-300 font-light">
          Pièces Justificatives & Agrément
        </p>
      </div>

      {/* Form Steps (Frosted Glass Pills) */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-slate-300 text-[12px] font-medium opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mr-1.5 text-[11px] font-bold">
            ✓
          </span>
          <span className="hidden sm:inline">Établissement</span>
        </button>
        <div className="w-4 h-px bg-white/20"></div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-slate-300 text-[12px] font-medium opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mr-1.5 text-[11px] font-bold">
            ✓
          </span>
          <span className="hidden sm:inline">Admin</span>
        </button>
        <div className="w-4 h-px bg-white/20"></div>
        <div className="flex items-center text-emerald-400 text-[12px] font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 mr-1.5 text-[11px] font-bold">
            3
          </span>
          <span>Vérification</span>
        </div>
      </div>

      {/* Offline Alert if disconnected */}
      {!isOnline && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2.5 backdrop-blur-md animate-in fade-in">
          <span className="material-symbols-outlined text-rose-400 text-[20px] shrink-0">wifi_off</span>
          <div>
            <span className="font-bold block text-white">Connexion internet requise</span>
            <span className="text-[11px] text-rose-300">
              Vos documents et paramètres sont enregistrés en local. La transmission au serveur MEPPSA reprendra dès le rétablissement du réseau.
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          {/* Agrément d'ouverture */}
          <div className="p-3.5 border border-white/15 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[22px]">
                  description
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-100">
                  Agrément d'ouverture (MEPPSA)
                </p>
                <p className="text-[11px] text-slate-400">
                  {formData.documents.agrementFile ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      {formData.documents.agrementFile}
                    </span>
                  ) : (
                    'PDF, JPG, PNG (max 5Mo)'
                  )}
                </p>
              </div>
            </div>
            {formData.documents.agrementFile ? (
              <button
                type="button"
                onClick={() => handleRemoveFile('agrementFile')}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
              >
                Changer
              </button>
            ) : (
              <label className="text-emerald-300 text-[12px] font-bold hover:bg-emerald-500/20 cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 transition-all backdrop-blur-md">
                <span>Choisir</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleRealFileUpload('agrementFile', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Statuts de l'établissement */}
          <div className="p-3.5 border border-white/15 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <span className="material-symbols-outlined text-[22px]">
                  folder_open
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-100">
                  Statuts ou Règlement Intérieur
                </p>
                <p className="text-[11px] text-slate-400">
                  {formData.documents.statutsFile ? (
                    <span className="text-indigo-300 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      {formData.documents.statutsFile}
                    </span>
                  ) : (
                    'PDF, DOCX (max 10Mo)'
                  )}
                </p>
              </div>
            </div>
            {formData.documents.statutsFile ? (
              <button
                type="button"
                onClick={() => handleRemoveFile('statutsFile')}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
              >
                Changer
              </button>
            ) : (
              <label className="text-indigo-300 text-[12px] font-bold hover:bg-indigo-500/20 cursor-pointer px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 transition-all backdrop-blur-md">
                <span>Choisir</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleRealFileUpload('statutsFile', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Pièce d'identité du Responsable */}
          <div className="p-3.5 border border-white/15 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <span className="material-symbols-outlined text-[22px]">
                  badge
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-100">
                  CNI ou Passeport du Directeur / Promoteur
                </p>
                <p className="text-[11px] text-slate-400">
                  {formData.documents.identityFile ? (
                    <span className="text-teal-300 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      {formData.documents.identityFile}
                    </span>
                  ) : (
                    'CNI / Passeport (recto-verso)'
                  )}
                </p>
              </div>
            </div>
            {formData.documents.identityFile ? (
              <button
                type="button"
                onClick={() => handleRemoveFile('identityFile')}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-medium"
              >
                Changer
              </button>
            ) : (
              <label className="text-teal-300 text-[12px] font-bold hover:bg-teal-500/20 cursor-pointer px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 transition-all backdrop-blur-md">
                <span>Choisir</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleRealFileUpload('identityFile', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Info note */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-[12px] text-amber-200 flex items-start gap-2.5 backdrop-blur-md">
          <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">info</span>
          <span>
            Tous les documents sont soumis à la validation des inspecteurs académiques du Ministère de l'Enseignement Préscolaire, Primaire, Secondaire et de l'Alphabétisation (MEPPSA).
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-3 border border-white/15 text-slate-300 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[14px] font-medium cursor-pointer backdrop-blur-md"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            className={`flex-1 text-white text-[14px] font-semibold rounded-xl py-3 border transition-all flex justify-center items-center ${
              isOnline
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
                : 'bg-slate-800/70 text-slate-400 border-white/10 cursor-not-allowed opacity-75'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Soumission...
              </>
            ) : isOnline ? (
              <>
                <span>Soumettre pour vérification</span>
                <span className="material-symbols-outlined ml-2 text-[18px]">
                  send
                </span>
              </>
            ) : (
              <>
                <span>Hors-ligne (En attente réseau)</span>
                <span className="material-symbols-outlined ml-2 text-[18px] text-amber-400">
                  wifi_off
                </span>
              </>
            )}
          </button>
        </div>

        {/* Log in link */}
        <p className="text-center text-[12px] text-slate-400 mt-4">
          Vous avez déjà un compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-400 font-bold hover:underline cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </form>
    </div>
  );
};

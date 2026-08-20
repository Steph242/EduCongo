import React, { useMemo, useState } from 'react';
import { SchoolRegistrationData } from '../../types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { FormFieldBadge, FormFieldFeedback } from '../Common/FormFieldValidation';

interface RegisterStep2Props {
  formData: SchoolRegistrationData;
  onChange: (field: keyof SchoolRegistrationData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterStep2: React.FC<RegisterStep2Props> = ({
  formData,
  onChange,
  onNext,
  onBack,
  onSwitchToLogin,
}) => {
  const { isOnline } = useNetworkStatus();
  const [showErrors, setShowErrors] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const fieldValidation = useMemo(() => {
    const isAdminFullNameValid = Boolean(formData.adminFullName && formData.adminFullName.trim().length >= 2);
    const isAdminRoleValid = Boolean(formData.adminRole && formData.adminRole.trim().length > 0);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isPersonalEmailValid = Boolean(formData.personalEmail && emailRegex.test(formData.personalEmail.trim()));
    const digitsOnly = formData.personalPhone ? formData.personalPhone.replace(/\D/g, '') : '';
    const isPersonalPhoneValid = digitsOnly.length >= 6;
    const isPasswordValid = Boolean(formData.password && formData.password.length >= 4);

    const requiredFields = [
      { name: "Nom complet de l'administrateur", valid: isAdminFullNameValid },
      { name: "Fonction", valid: isAdminRoleValid },
      { name: "E-mail personnel", valid: isPersonalEmailValid },
      { name: "Téléphone personnel", valid: isPersonalPhoneValid },
      { name: "Mot de passe", valid: isPasswordValid },
    ];

    const completedCount = requiredFields.filter(f => f.valid).length;
    const totalCount = requiredFields.length;
    const isAllValid = isAdminFullNameValid && isAdminRoleValid && isPersonalEmailValid && isPersonalPhoneValid && isPasswordValid;

    return {
      isAdminFullNameValid,
      isAdminRoleValid,
      isPersonalEmailValid,
      isPersonalPhoneValid,
      isPasswordValid,
      requiredFields,
      completedCount,
      totalCount,
      isAllValid,
    };
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldValidation.isAllValid) {
      setShowErrors(true);
      return;
    }
    onNext();
  };

  return (
    <div className="w-full max-w-md bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative z-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent mb-1 tracking-tight">
          EduCongo
        </h1>
        <p className="text-[14px] text-slate-300 font-light">
          Compte Administrateur Principal
        </p>
      </div>

      {/* Form Steps (Frosted Glass Pills) */}
      <div className="flex items-center justify-center space-x-2 mb-5">
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
        <div className="flex items-center text-emerald-400 text-[12px] font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 mr-1.5 text-[11px] font-bold">
            2
          </span>
          <span>Admin</span>
        </div>
        <div className="w-4 h-px bg-white/20"></div>
        <div className="flex items-center text-slate-400 text-[12px] font-medium opacity-60">
          <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white/20 mr-1.5 text-[11px]">
            3
          </span>
          <span className="hidden sm:inline">Vérif</span>
        </div>
      </div>

      {/* Progress & Validation Indicator */}
      <div className="mb-5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <span className={`material-symbols-outlined text-[16px] ${fieldValidation.isAllValid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {fieldValidation.isAllValid ? 'check_circle' : 'pending_actions'}
            </span>
            {fieldValidation.isAllValid ? 'Toutes les cases admin sont prêtes' : 'Complétion des informations admin'}
          </span>
          <span className={`font-mono font-bold text-xs ${fieldValidation.isAllValid ? 'text-emerald-400' : 'text-slate-400'}`}>
            {fieldValidation.completedCount} / {fieldValidation.totalCount}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${
              fieldValidation.isAllValid 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${(fieldValidation.completedCount / fieldValidation.totalCount) * 100}%` }}
          ></div>
        </div>

        {showErrors && !fieldValidation.isAllValid && (
          <div className="mt-2.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-rose-400 text-[16px]">error</span>
            <span>Veuillez renseigner toutes les informations de l'administrateur.</span>
          </div>
        )}

        {!isOnline && (
          <div className="mt-2.5 p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-rose-400 text-[16px]">wifi_off</span>
            <span>Hors ligne : les données saisies restent sauvegardées sur cet appareil.</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom de l'administrateur */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              className="block text-[12px] font-medium text-slate-300"
              htmlFor="admin-fullname"
            >
              Nom complet de l'administrateur <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isAdminFullNameValid}
              isTouched={touchedFields.adminFullName}
              showErrors={showErrors}
              value={formData.adminFullName}
              validLabel="Rempli"
              invalidLabel="Min. 2 lettres"
            />
          </div>
          <div className="relative">
            <input
              id="admin-fullname"
              name="admin-fullname"
              type="text"
              required
              value={formData.adminFullName}
              onFocus={() => markTouched('adminFullName')}
              onChange={(e) => {
                markTouched('adminFullName');
                onChange('adminFullName', e.target.value);
              }}
              placeholder="Prénom et Nom de l'administrateur"
              className={`w-full rounded-xl border ${
                (touchedFields.adminFullName || showErrors) && !fieldValidation.isAdminFullNameValid 
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30' 
                  : fieldValidation.isAdminFullNameValid && formData.adminFullName
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              } text-white focus:bg-white/[0.08] px-3.5 py-2.5 pr-10 text-[14px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {fieldValidation.isAdminFullNameValid && formData.adminFullName ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : (touchedFields.adminFullName || showErrors) && !fieldValidation.isAdminFullNameValid ? (
                <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isAdminFullNameValid}
            isTouched={touchedFields.adminFullName}
            showErrors={showErrors}
            value={formData.adminFullName}
            errorMessage="Veuillez renseigner le nom et prénom de l'administrateur (min. 2 caractères)."
            successMessage="Nom d'administrateur validé"
          />
        </div>

        {/* Fonction */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              className="block text-[12px] font-medium text-slate-300"
              htmlFor="admin-role"
            >
              Fonction au sein de l'établissement <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isAdminRoleValid}
              isTouched={touchedFields.adminRole}
              showErrors={showErrors}
              value={formData.adminRole}
              validLabel="Sélectionné"
              invalidLabel="Choix requis"
            />
          </div>
          <div className="relative">
            <select
              id="admin-role"
              name="admin-role"
              required
              value={formData.adminRole}
              onChange={(e) => {
                markTouched('adminRole');
                onChange('adminRole', e.target.value);
              }}
              className={`w-full rounded-xl border ${
                (touchedFields.adminRole || showErrors) && !fieldValidation.isAdminRoleValid 
                  ? 'border-rose-400/70 bg-rose-500/10' 
                  : fieldValidation.isAdminRoleValid && formData.adminRole
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04]'
                  : 'border-white/15 bg-white/[0.05]'
              } text-slate-200 focus:border-emerald-400 focus:bg-white/[0.08] px-3.5 py-2.5 text-[14px] appearance-none transition-all outline-none pr-8 cursor-pointer backdrop-blur-md`}
            >
              <option value="" disabled className="bg-[#0b1329] text-slate-400">
                Sélectionnez votre fonction
              </option>
              <option value="proviseur" className="bg-[#0b1329] text-white">Proviseur / Principal</option>
              <option value="directeur" className="bg-[#0b1329] text-white">Directeur des études / Général</option>
              <option value="censeur" className="bg-[#0b1329] text-white">Censeur</option>
              <option value="secretaire" className="bg-[#0b1329] text-white">Secrétaire général</option>
              <option value="econome" className="bg-[#0b1329] text-white">Économe / Intendant</option>
              <option value="promoteur" className="bg-[#0b1329] text-white">Promoteur / Fondateur</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isAdminRoleValid}
            isTouched={touchedFields.adminRole}
            showErrors={showErrors}
            value={formData.adminRole}
            errorMessage="Veuillez sélectionner la responsabilité administrative exercée."
            successMessage="Fonction académique validée"
          />
        </div>

        {/* School Summary Reminder Badge */}
        {Boolean(formData.schoolName || formData.schoolCode) && (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">school</span>
              <div>
                <span className="text-slate-300 font-semibold block">{formData.schoolName || 'Établissement'}</span>
                <span className="text-slate-400 text-[11px]">
                  {formData.city || formData.department || 'Congo'} {formData.arrondissement ? `• ${formData.arrondissement}` : ''}
                </span>
              </div>
            </div>
            {formData.schoolCode && (
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-500/30">
                {formData.schoolCode}
              </span>
            )}
          </div>
        )}

        <div className="w-full h-px bg-white/10 my-2"></div>

        {/* E-mail personnel */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              className="block text-[12px] font-medium text-slate-300"
              htmlFor="email-personal"
            >
              E-mail personnel de secours <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isPersonalEmailValid}
              isTouched={touchedFields.personalEmail}
              showErrors={showErrors}
              value={formData.personalEmail}
              validLabel="Email valide"
              invalidLabel="Format email"
            />
          </div>
          <div className="relative">
            <input
              id="email-personal"
              name="email-personal"
              type="email"
              required
              value={formData.personalEmail}
              onFocus={() => markTouched('personalEmail')}
              onChange={(e) => {
                markTouched('personalEmail');
                onChange('personalEmail', e.target.value);
              }}
              placeholder="nom.prenom@gmail.com"
              className={`w-full rounded-xl border ${
                (touchedFields.personalEmail || showErrors) && !fieldValidation.isPersonalEmailValid 
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30' 
                  : fieldValidation.isPersonalEmailValid && formData.personalEmail
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              } text-white focus:bg-white/[0.08] px-3.5 py-2.5 pr-10 text-[14px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {fieldValidation.isPersonalEmailValid && formData.personalEmail ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : (touchedFields.personalEmail || showErrors) && !fieldValidation.isPersonalEmailValid ? (
                <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isPersonalEmailValid}
            isTouched={touchedFields.personalEmail}
            showErrors={showErrors}
            value={formData.personalEmail}
            errorMessage="Format d'e-mail personnel incorrect (ex: nom@gmail.com)."
            successMessage="Format d'e-mail de secours valide"
          />
        </div>

        {/* Numéro de téléphone personnel */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              className="block text-[12px] font-medium text-slate-300"
              htmlFor="phone-personal"
            >
              Numéro de téléphone personnel (+242) <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isPersonalPhoneValid}
              isTouched={touchedFields.personalPhone}
              showErrors={showErrors}
              value={formData.personalPhone}
              validLabel="Numéro valide"
              invalidLabel="Min. 6 chiffres"
            />
          </div>
          <div className="relative">
            <div className="flex">
              <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-white/15 bg-white/[0.08] text-emerald-300 text-[13px] font-semibold backdrop-blur-md">
                +242
              </span>
              <input
                id="phone-personal"
                name="phone-personal"
                type="tel"
                required
                value={formData.personalPhone}
                onFocus={() => markTouched('personalPhone')}
                onChange={(e) => {
                  markTouched('personalPhone');
                  onChange('personalPhone', e.target.value);
                }}
                placeholder="06 000 00 00"
                className={`w-full rounded-r-xl border ${
                  (touchedFields.personalPhone || showErrors) && !fieldValidation.isPersonalPhoneValid 
                    ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30' 
                    : fieldValidation.isPersonalPhoneValid && formData.personalPhone
                    ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                    : 'border-white/15 bg-white/[0.05]'
                } text-white focus:bg-white/[0.08] px-3.5 py-2.5 pr-10 text-[14px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
              />
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {fieldValidation.isPersonalPhoneValid && formData.personalPhone ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : (touchedFields.personalPhone || showErrors) && !fieldValidation.isPersonalPhoneValid ? (
                <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isPersonalPhoneValid}
            isTouched={touchedFields.personalPhone}
            showErrors={showErrors}
            value={formData.personalPhone}
            errorMessage="Numéro mobile personnel incomplet (au moins 6 chiffres)."
            successMessage="Numéro mobile personnel valide (+242)"
          />
        </div>

        {/* Mot de passe du compte */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              className="block text-[12px] font-medium text-slate-300"
              htmlFor="admin-password"
            >
              Mot de passe de connexion <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isPasswordValid}
              isTouched={touchedFields.password}
              showErrors={showErrors}
              value={formData.password || ''}
              validLabel="Défini"
              invalidLabel="Min. 4 car."
            />
          </div>
          <div className="relative">
            <input
              id="admin-password"
              name="admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password || ''}
              onFocus={() => markTouched('password')}
              onChange={(e) => {
                markTouched('password');
                onChange('password', e.target.value);
              }}
              placeholder="Créez un mot de passe sécurisé"
              className={`w-full rounded-xl border ${
                (touchedFields.password || showErrors) && !fieldValidation.isPasswordValid 
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30' 
                  : fieldValidation.isPasswordValid && formData.password
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              } text-white focus:bg-white/[0.08] px-3.5 py-2.5 pr-20 text-[14px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {fieldValidation.isPasswordValid && formData.password ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isPasswordValid}
            isTouched={touchedFields.password}
            showErrors={showErrors}
            value={formData.password || ''}
            errorMessage="Le mot de passe doit comporter au moins 4 caractères."
            successMessage="Mot de passe sécurisé enregistré"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-3 border border-white/15 text-slate-300 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[14px] font-medium cursor-pointer backdrop-blur-md"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={!fieldValidation.isAllValid}
            className={`flex-1 text-white text-[14px] font-semibold rounded-xl py-3 border transition-all flex justify-center items-center ${
              fieldValidation.isAllValid
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
                : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-70 shadow-none'
            }`}
          >
            <span>
              {fieldValidation.isAllValid 
                ? 'Étape Suivante (Documents)' 
                : `Compléter (${fieldValidation.completedCount}/${fieldValidation.totalCount})`}
            </span>
            <span className={`material-symbols-outlined ml-2 text-[18px] ${fieldValidation.isAllValid ? 'text-white' : 'text-slate-400'}`}>
              {fieldValidation.isAllValid ? 'arrow_forward' : 'lock'}
            </span>
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

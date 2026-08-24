import React, { useMemo, useState } from 'react';
import { SchoolRegistrationData, CodeFormat, SchoolType } from '../../types';
import { 
  CONGO_DEPARTMENTS, 
  CONGO_DEPARTMENTS_CONFIG, 
  generateSchoolCode 
} from '../../data/mockData';
import { 
  isSchoolNameTaken, 
  isWorkEmailTaken, 
  isPhoneTaken, 
  isSubdomainTaken 
} from '../../services/accountService';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { FormFieldBadge, FormFieldFeedback } from '../Common/FormFieldValidation';
import { VerificationModal } from './VerificationModal';
import { LiveCameraCaptureModal } from '../Common/LiveCameraCaptureModal';

interface RegisterStep1Props {
  formData: SchoolRegistrationData;
  onChange: (field: keyof SchoolRegistrationData, value: any) => void;
  onNext: () => void;
  onSwitchToLogin: () => void;
}

const SCHOOL_TYPE_OPTIONS: Array<{ value: SchoolType; label: string; description: string }> = [
  { value: 'primaire', label: 'École Primaire (Élémentaire)', description: 'Cycle CP1 au CM2' },
  { value: 'secondaire', label: 'Collège (Secondaire)', description: 'Cycle 6ème à la 3ème (BEPC)' },
  { value: 'primaire_college', label: 'Primaire et Collège', description: 'Groupe Scolaire CP1 jusqu\'à la 3ème' },
  { value: 'lycee', label: 'Lycée d\'Enseignement Général', description: '2nde, 1ère, Terminales (A, C, D)' },
  { value: 'general_technique', label: 'Général et Technique (Polyvalent)', description: 'Lycée Polyvalent filières générales & techniques' },
  { value: 'technique', label: 'Lycée Technique & Commercial', description: 'Filières industrielles, compta, secrétariat' },
  { value: 'centre_formation_pro', label: 'Centre de Formation Professionnelle (CFP)', description: 'Apprentissage métiers, certificats et brevets pro' },
  { value: 'centre_encadrement', label: 'Centre d\'Encadrement Pédagogique', description: 'Soutien scolaire, prépa concours & examens' },
  { value: 'superieur', label: 'Institut Supérieur / Université', description: 'Licence, Master, Doctorat, BTS' },
];

const LOGO_PRESETS = [
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80',
];

export const RegisterStep1: React.FC<RegisterStep1Props> = ({
  formData,
  onChange,
  onNext,
  onSwitchToLogin,
}) => {
  const { isOnline } = useNetworkStatus();
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Verification modal state (Email verification exclusively)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // Camera modal state for school logo
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Current active department config
  const currentDeptConfig = useMemo(() => {
    if (!formData.department) return null;
    return CONGO_DEPARTMENTS_CONFIG[formData.department] || null;
  }, [formData.department]);

  const availableCities = useMemo(() => {
    return currentDeptConfig?.cities || [];
  }, [currentDeptConfig]);

  const availableArrondissements = useMemo(() => {
    return currentDeptConfig?.arrondissements || [];
  }, [currentDeptConfig]);

  // Generate clean subdomain slug from school name
  const suggestedSubdomain = useMemo(() => {
    if (formData.subdomain) return formData.subdomain;
    if (!formData.schoolName) return '';
    return formData.schoolName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30);
  }, [formData.schoolName, formData.subdomain]);

  // Telecom operator detection for Republic of Congo numbers
  const detectedOperator = useMemo(() => {
    const cleanDigits = (formData.workPhone || '').replace(/\D/g, '');
    if (cleanDigits.startsWith('06') || cleanDigits.startsWith('6')) {
      return { name: 'MTN Congo', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    }
    if (cleanDigits.startsWith('05') || cleanDigits.startsWith('5') || cleanDigits.startsWith('04') || cleanDigits.startsWith('4')) {
      return { name: 'Airtel Congo', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
    }
    return null;
  }, [formData.workPhone]);

  // Validation rules computed in real-time
  const fieldValidation = useMemo(() => {
    const isSchoolNameLengthValid = Boolean(formData.schoolName && formData.schoolName.trim().length >= 3);
    const isSchoolNameUnique = !isSchoolNameTaken(formData.schoolName);
    const isSchoolNameValid = isSchoolNameLengthValid && isSchoolNameUnique;

    const currentSub = (formData.subdomain || suggestedSubdomain || '').toLowerCase().trim();
    const isSubdomainFormatValid = Boolean(currentSub && /^[a-z0-9-]+$/.test(currentSub) && currentSub.length >= 3);
    const isSubdomainUnique = !isSubdomainTaken(currentSub);
    const isSubdomainValid = isSubdomainFormatValid && isSubdomainUnique;

    const isDepartmentValid = Boolean(formData.department && formData.department.trim().length > 0);
    const isCityValid = Boolean(formData.city && formData.city.trim().length > 0);
    const isArrondissementValid = Boolean(formData.arrondissement && formData.arrondissement.trim().length > 0);
    const isSchoolTypeValid = Boolean(formData.schoolType && formData.schoolType.trim().length > 0);
    const isDirectorNameValid = Boolean(formData.directorName && formData.directorName.trim().length >= 2);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormatValid = Boolean(formData.workEmail && emailRegex.test(formData.workEmail.trim()));
    const isWorkEmailUnique = !isWorkEmailTaken(formData.workEmail);
    const isWorkEmailValid = isEmailFormatValid && isWorkEmailUnique;
    const isEmailVerified = Boolean(formData.isEmailVerified);
    
    const digitsOnly = formData.workPhone ? formData.workPhone.replace(/\D/g, '') : '';
    const isPhoneFormatValid = digitsOnly.length >= 6;
    const isWorkPhoneUnique = !isPhoneTaken(formData.workPhone);
    const isWorkPhoneValid = isPhoneFormatValid && isWorkPhoneUnique;

    const requiredFields = [
      { name: "Nom de l'établissement (unique)", valid: isSchoolNameValid },
      { name: "Sous-domaine dédié", valid: isSubdomainValid },
      { name: "Département", valid: isDepartmentValid },
      { name: "Ville", valid: isCityValid },
      { name: "Arrondissement / Quartier", valid: isArrondissementValid },
      { name: "Type d'établissement", valid: isSchoolTypeValid },
      { name: "Nom du responsable", valid: isDirectorNameValid },
      { name: "E-mail professionnel (unique)", valid: isWorkEmailValid },
      { name: "Vérification E-mail", valid: isEmailVerified },
      { name: "Téléphone (unique)", valid: isWorkPhoneValid },
    ];

    const completedCount = requiredFields.filter(f => f.valid).length;
    const totalCount = requiredFields.length;
    const isAllValid = requiredFields.every(f => f.valid);

    return {
      isSchoolNameLengthValid,
      isSchoolNameUnique,
      isSchoolNameValid,
      isSubdomainFormatValid,
      isSubdomainUnique,
      isSubdomainValid,
      isDepartmentValid,
      isCityValid,
      isArrondissementValid,
      isSchoolTypeValid,
      isDirectorNameValid,
      isEmailFormatValid,
      isWorkEmailUnique,
      isWorkEmailValid,
      isEmailVerified,
      isPhoneFormatValid,
      isWorkPhoneUnique,
      isWorkPhoneValid,
      requiredFields,
      completedCount,
      totalCount,
      isAllValid,
    };
  }, [formData, suggestedSubdomain]);

  // Regenerate school code when department or format changes without auto-selecting city or arrondissement
  const handleDepartmentChange = (newDept: string) => {
    markTouched('department');
    onChange('department', newDept);
    // Reset city and arrondissement so the user explicitly chooses them
    onChange('city', '');
    onChange('arrondissement', '');

    if (newDept) {
      const newCode = generateSchoolCode(newDept, formData.codeFormat || 'departement');
      onChange('schoolCode', newCode);
    } else {
      onChange('schoolCode', '');
    }
  };

  const handleCityChange = (newCity: string) => {
    markTouched('city');
    onChange('city', newCity);
  };

  const handleFormatChange = (newFormat: CodeFormat) => {
    onChange('codeFormat', newFormat);
    if (formData.department) {
      const newCode = generateSchoolCode(formData.department, newFormat);
      onChange('schoolCode', newCode);
    }
  };

  const handleSchoolNameChange = (val: string) => {
    markTouched('schoolName');
    onChange('schoolName', val);
    if (!formData.subdomain) {
      const slug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 30);
      onChange('subdomain', slug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isEmailVerified) {
      // If email is not yet verified, open the verification modal directly!
      setVerificationModalOpen(true);
      return;
    }
    if (!fieldValidation.isAllValid) {
      setShowErrors(true);
      return;
    }
    // ensure subdomain is set
    if (!formData.subdomain && suggestedSubdomain) {
      onChange('subdomain', suggestedSubdomain);
    }
    onNext();
  };

  return (
    <div className="w-full max-w-lg bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative z-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent mb-1 tracking-tight">
          EduCongo
        </h1>
        <p className="text-[14px] text-slate-300 font-light">
          Inscription d'un Établissement Scolaire
        </p>
      </div>

      {/* Form Steps (Frosted Glass Pills) */}
      <div className="flex items-center justify-center space-x-2 mb-5">
        <div className="flex items-center text-emerald-400 text-[12px] font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 mr-1.5 text-[11px] font-bold">
            1
          </span>
          <span>Établissement</span>
        </div>
        <div className="w-4 h-px bg-white/20"></div>
        <div className="flex items-center text-slate-400 text-[12px] font-medium opacity-60">
          <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white/20 mr-1.5 text-[11px]">
            2
          </span>
          <span className="hidden sm:inline">Admin</span>
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
            {fieldValidation.isAllValid ? 'Toutes les cases sont prêtes' : 'Remplissage des informations'}
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
                : 'bg-gradient-to-r from-emerald-600 to-indigo-500'
            }`}
            style={{ width: `${(fieldValidation.completedCount / fieldValidation.totalCount) * 100}%` }}
          ></div>
        </div>

        {showErrors && !fieldValidation.isAllValid && (
          <div className="mt-2.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[15px] text-rose-400 shrink-0">error</span>
            <span>Veuillez compléter toutes les cases requises et vérifier votre e-mail pour continuer.</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom de l'établissement */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="schoolName">
              Nom officiel de l'établissement <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isSchoolNameValid}
              isTouched={touchedFields.schoolName}
              showErrors={showErrors}
              value={formData.schoolName}
              validLabel="Nom unique & valide"
              invalidLabel={!fieldValidation.isSchoolNameUnique ? "Nom déjà pris" : "Min. 3 car."}
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              school
            </span>
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              value={formData.schoolName}
              onFocus={() => markTouched('schoolName')}
              onChange={(e) => handleSchoolNameChange(e.target.value)}
              placeholder="Ex: Lycée Victor Augagneur, Collège Mafouta..."
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-[13.5px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.schoolName || showErrors) && !fieldValidation.isSchoolNameValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                  : fieldValidation.isSchoolNameValid && formData.schoolName
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {fieldValidation.isSchoolNameValid && formData.schoolName ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isSchoolNameValid}
            isTouched={touchedFields.schoolName}
            showErrors={showErrors}
            value={formData.schoolName}
            errorMessage={
              !fieldValidation.isSchoolNameUnique
                ? "Ce nom d'établissement est déjà enregistré sur EduCongo. Veuillez en saisir un autre."
                : "Veuillez saisir le nom complet de l'établissement (minimum 3 caractères)."
            }
            successMessage="Nom d'établissement unique et disponible"
          />
        </div>

        {/* Sous-domaine dédié de l'établissement (Exigence 1) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="subdomain">
              Sous-domaine Web EduCongo <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isSubdomainValid}
              isTouched={touchedFields.subdomain}
              showErrors={showErrors}
              value={formData.subdomain || suggestedSubdomain}
              validLabel="Sous-domaine disponible"
              invalidLabel={!fieldValidation.isSubdomainUnique ? "Déjà réservé" : "Min. 3 car. (a-z, 0-9, -)"}
            />
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-white/15 bg-white/[0.08] text-slate-400 text-[12px] font-mono select-none">
              https://
            </span>
            <input
              id="subdomain"
              name="subdomain"
              type="text"
              required
              value={formData.subdomain ?? suggestedSubdomain}
              onFocus={() => markTouched('subdomain')}
              onChange={(e) => {
                markTouched('subdomain');
                const cleanSlug = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '')
                  .slice(0, 35);
                onChange('subdomain', cleanSlug);
              }}
              placeholder="mon-ecole"
              className={`w-full py-2.5 px-3 border border-white/15 bg-white/[0.05] text-emerald-300 font-mono font-bold text-[13px] outline-none transition-all ${
                (touchedFields.subdomain || showErrors) && !fieldValidation.isSubdomainValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400'
                  : 'focus:border-emerald-400'
              }`}
            />
            <span className="inline-flex items-center px-3 py-2.5 rounded-r-xl border border-l-0 border-white/15 bg-white/[0.08] text-emerald-400 text-[12px] font-mono font-semibold select-none">
              .edu-congo.netlify.app
            </span>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isSubdomainValid}
            isTouched={touchedFields.subdomain}
            showErrors={showErrors}
            value={formData.subdomain || suggestedSubdomain}
            errorMessage={
              !fieldValidation.isSubdomainUnique
                ? "Ce sous-domaine est déjà réservé par un autre établissement."
                : "Sous-domaine requis (lettres minuscules, chiffres et tirets uniquement)."
            }
            successMessage={`Adresse web : https://${formData.subdomain || suggestedSubdomain || 'ecole'}.edu-congo.netlify.app`}
          />
        </div>

        {/* Type d'établissement (Cycles MEPPSA) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="schoolType">
              Type & Cycle d'enseignement (MEPPSA) <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isSchoolTypeValid}
              isTouched={touchedFields.schoolType}
              showErrors={showErrors}
              value={formData.schoolType}
              validLabel="Cycle choisi"
              invalidLabel="Sélection requise"
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              account_balance
            </span>
            <select
              id="schoolType"
              name="schoolType"
              required
              value={formData.schoolType}
              onFocus={() => markTouched('schoolType')}
              onChange={(e) => {
                markTouched('schoolType');
                onChange('schoolType', e.target.value as SchoolType);
              }}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-[13px] outline-none transition-all text-white backdrop-blur-md appearance-none cursor-pointer border ${
                (touchedFields.schoolType || showErrors) && !fieldValidation.isSchoolTypeValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                  : fieldValidation.isSchoolTypeValid && formData.schoolType
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            >
              <option value="" className="bg-slate-900 text-slate-400">
                -- Sélectionnez le cycle / type d'enseignement --
              </option>
              {SCHOOL_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-1">
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
              {fieldValidation.isSchoolTypeValid && formData.schoolType && (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              )}
              <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isSchoolTypeValid}
            isTouched={touchedFields.schoolType}
            showErrors={showErrors}
            value={formData.schoolType}
            errorMessage="Veuillez sélectionner le type d'établissement homologué."
            successMessage="Cycle d'enseignement validé"
          />
        </div>

        {/* Localisation Territoriale (Département, Ville, Arrondissement) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Département */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[12px] font-medium text-slate-300" htmlFor="department">
                Département <span className="text-rose-400">*</span>
              </label>
              <FormFieldBadge
                isValid={fieldValidation.isDepartmentValid}
                isTouched={touchedFields.department}
                showErrors={showErrors}
                value={formData.department}
                validLabel="Choisi"
                invalidLabel="Requis"
              />
            </div>
            <div className="relative">
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onFocus={() => markTouched('department')}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all text-white backdrop-blur-md appearance-none cursor-pointer border ${
                  (touchedFields.department || showErrors) && !fieldValidation.isDepartmentValid
                    ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400'
                    : 'border-white/15 bg-white/[0.05]'
                }`}
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  -- Choisir un département --
                </option>
                {CONGO_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Ville */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[12px] font-medium text-slate-300" htmlFor="city">
                Ville / Commune <span className="text-rose-400">*</span>
              </label>
              <FormFieldBadge
                isValid={fieldValidation.isCityValid}
                isTouched={touchedFields.city}
                showErrors={showErrors}
                value={formData.city}
                validLabel="Choisie"
                invalidLabel="Requis"
              />
            </div>
            <div className="relative">
              <select
                id="city"
                name="city"
                required
                disabled={!formData.department}
                value={formData.city}
                onFocus={() => markTouched('city')}
                onChange={(e) => handleCityChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all text-white backdrop-blur-md appearance-none cursor-pointer border ${
                  (touchedFields.city || showErrors) && !fieldValidation.isCityValid
                    ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400'
                    : 'border-white/15 bg-white/[0.05]'
                } ${!formData.department ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  {formData.department ? '-- Choisir une ville --' : 'Sélectionnez un département'}
                </option>
                {availableCities.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Arrondissement / Quartier */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="arrondissement">
              Arrondissement / Quartier <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isArrondissementValid}
              isTouched={touchedFields.arrondissement}
              showErrors={showErrors}
              value={formData.arrondissement}
              validLabel="Renseigné"
              invalidLabel="Requis"
            />
          </div>
          {availableArrondissements.length > 0 ? (
            <div className="relative">
              <select
                id="arrondissement"
                name="arrondissement"
                required
                value={formData.arrondissement}
                onFocus={() => markTouched('arrondissement')}
                onChange={(e) => {
                  markTouched('arrondissement');
                  onChange('arrondissement', e.target.value);
                }}
                className={`w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all text-white backdrop-blur-md appearance-none cursor-pointer border ${
                  (touchedFields.arrondissement || showErrors) && !fieldValidation.isArrondissementValid
                    ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400'
                    : 'border-white/15 bg-white/[0.05]'
                }`}
              >
                <option value="" className="bg-slate-900 text-slate-400">
                  -- Choisir un arrondissement / secteur --
                </option>
                {availableArrondissements.map((arr) => (
                  <option key={arr} value={arr} className="bg-slate-900 text-white">
                    {arr}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          ) : (
            <input
              id="arrondissement"
              name="arrondissement"
              type="text"
              required
              value={formData.arrondissement}
              onFocus={() => markTouched('arrondissement')}
              onChange={(e) => {
                markTouched('arrondissement');
                onChange('arrondissement', e.target.value);
              }}
              placeholder="Ex: Centre-ville, Quartier Ouenze, Quartier Mpita..."
              className={`w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.arrondissement || showErrors) && !fieldValidation.isArrondissementValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
          )}
        </div>

        {/* Code Établissement (Généré avec choix du format) */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
              Code Établissement MEPPSA
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Homologation 2024-2025</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              readOnly
              value={formData.schoolCode || 'Sélectionnez un département ci-dessus'}
              className="flex-1 font-mono text-emerald-300 font-extrabold text-sm px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/30 text-center tracking-wider"
            />
            <button
              type="button"
              onClick={() => {
                if (formData.department) {
                  const newCode = generateSchoolCode(formData.department, formData.codeFormat || 'departement');
                  onChange('schoolCode', newCode);
                }
              }}
              className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs border border-white/10 cursor-pointer"
              title="Régénérer le code"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>

          {/* Format selection */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Format :</span>
            {(['departement', 'annee', 'standard'] as CodeFormat[]).map((fmt) => (
              <label key={fmt} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="codeFormat"
                  checked={formData.codeFormat === fmt}
                  onChange={() => handleFormatChange(fmt)}
                  className="accent-emerald-500 w-3 h-3"
                />
                <span className={formData.codeFormat === fmt ? 'text-emerald-300 font-bold' : ''}>
                  {fmt === 'departement' ? 'BZV-24-XXX' : fmt === 'annee' ? '2024-BZV-XXX' : 'CG-BZV-XXX'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Nom du Responsable / Directeur */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="directorName">
              Nom & Prénom du Responsable / Fondateur <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isDirectorNameValid}
              isTouched={touchedFields.directorName}
              showErrors={showErrors}
              value={formData.directorName}
              validLabel="Renseigné"
              invalidLabel="Min. 2 car."
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              person
            </span>
            <input
              id="directorName"
              name="directorName"
              type="text"
              required
              value={formData.directorName}
              onFocus={() => markTouched('directorName')}
              onChange={(e) => {
                markTouched('directorName');
                onChange('directorName', e.target.value);
              }}
              placeholder="Ex: M. Jean-Claude MOUNGOUNGA"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-[13px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.directorName || showErrors) && !fieldValidation.isDirectorNameValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
          </div>
        </div>

        {/* E-mail professionnel + Vérification E-mail Obligatoire (Exigence 4 & 1) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <label className="block text-[12px] font-medium text-slate-300" htmlFor="email">
                E-mail professionnel de l'établissement <span className="text-rose-400">*</span>
              </label>
            </div>
            {formData.isEmailVerified ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/40 animate-in fade-in">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                E-mail vérifié (Supabase Auth)
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                Vérification requise
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.workEmail}
                onFocus={() => markTouched('workEmail')}
                onChange={(e) => {
                  markTouched('workEmail');
                  onChange('workEmail', e.target.value);
                  if (formData.isEmailVerified) {
                    onChange('isEmailVerified', false);
                  }
                }}
                placeholder="direction@ecole.cg"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                  formData.isEmailVerified
                    ? 'border-emerald-400/50 bg-emerald-500/[0.04]'
                    : 'border-white/15 bg-white/[0.05]'
                } text-white focus:border-emerald-400 text-[13px] outline-none backdrop-blur-md font-mono`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!formData.workEmail || !formData.workEmail.includes('@')) {
                  alert('Veuillez d\'abord saisir une adresse e-mail valide.');
                  return;
                }
                setVerificationModalOpen(true);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                formData.isEmailVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {formData.isEmailVerified ? 'check_circle' : 'mark_email_read'}
              </span>
              <span>{formData.isEmailVerified ? 'Vérifié' : 'Vérifier l\'E-mail'}</span>
            </button>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isWorkEmailValid}
            isTouched={touchedFields.workEmail}
            showErrors={showErrors}
            value={formData.workEmail}
            errorMessage={
              !fieldValidation.isWorkEmailUnique
                ? "Cette adresse e-mail est déjà associée à un établissement enregistré."
                : "Veuillez saisir une adresse e-mail professionnelle valide."
            }
            successMessage={formData.isEmailVerified ? "Adresse e-mail confirmée et unique" : "Format e-mail valide & disponible"}
          />
        </div>

        {/* Numéro de téléphone (+242) SANS vérification OTP (Exigence 4) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <label className="block text-[12px] font-medium text-slate-300" htmlFor="phone">
                Numéro de téléphone (+242) <span className="text-rose-400">*</span>
              </label>
              {detectedOperator && (
                <span className={`text-[9.5px] px-2 py-0.2 rounded-full border font-bold ${detectedOperator.color} animate-in fade-in`}>
                  {detectedOperator.name}
                </span>
              )}
            </div>
            <FormFieldBadge
              isValid={fieldValidation.isWorkPhoneValid}
              isTouched={touchedFields.workPhone}
              showErrors={showErrors}
              value={formData.workPhone}
              validLabel="Numéro valide & unique"
              invalidLabel={!fieldValidation.isWorkPhoneUnique ? "Numéro déjà pris" : "Min. 6 chiffres"}
            />
          </div>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/15 bg-white/[0.08] text-emerald-300 text-[13px] font-semibold backdrop-blur-md">
              +242
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.workPhone}
              onFocus={() => markTouched('workPhone')}
              onChange={(e) => {
                markTouched('workPhone');
                onChange('workPhone', e.target.value);
              }}
              placeholder="06 000 00 00"
              className="w-full rounded-r-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 px-3.5 py-2.5 text-[13.5px] outline-none backdrop-blur-md font-mono"
            />
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isWorkPhoneValid}
            isTouched={touchedFields.workPhone}
            showErrors={showErrors}
            value={formData.workPhone}
            errorMessage={
              !fieldValidation.isWorkPhoneUnique
                ? "Ce numéro de téléphone est déjà associé à un établissement enregistré."
                : "Numéro de contact requis (min. 6 chiffres)."
            }
            successMessage="Numéro de téléphone unique et enregistré"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!fieldValidation.isAllValid}
            className={`w-full text-white text-[14px] font-semibold rounded-xl py-3 border transition-all flex justify-center items-center ${
              fieldValidation.isAllValid
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
                : !formData.isEmailVerified && fieldValidation.isWorkEmailValid
                ? 'bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer'
                : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-70 shadow-none'
            }`}
          >
            <span>
              {fieldValidation.isAllValid 
                ? 'Étape Suivante (Admin)' 
                : !formData.isEmailVerified && fieldValidation.isWorkEmailValid
                ? 'Vérifier l\'e-mail pour continuer'
                : `Remplir toutes les cases (${fieldValidation.completedCount}/${fieldValidation.totalCount})`}
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

      {/* Verification Modal for Email Confirmation (Exigence 1 & 4) */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        type="email"
        targetValue={formData.workEmail || 'direction@ecole.cg'}
        schoolName={formData.schoolName || 'Votre établissement'}
        onVerified={() => {
          onChange('isEmailVerified', true);
          setVerificationModalOpen(false);
        }}
      />

      {/* Live Camera for Logo */}
      <LiveCameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          onChange('logoUrl', dataUrl);
          setIsCameraOpen(false);
        }}
        title="Photographier le logo de l'école"
        subtitle="Placez l'insigne ou le cachet au centre du cadre"
      />
    </div>
  );
};

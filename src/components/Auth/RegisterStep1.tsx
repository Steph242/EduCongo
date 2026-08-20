import React, { useMemo, useState } from 'react';
import { SchoolRegistrationData, CodeFormat, SchoolType } from '../../types';
import { 
  CONGO_DEPARTMENTS, 
  CONGO_DEPARTMENTS_CONFIG, 
  generateSchoolCode 
} from '../../data/mockData';
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

  // Verification modals state
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    type: 'email' | 'phone';
    targetValue: string;
  }>({
    isOpen: false,
    type: 'phone',
    targetValue: '',
  });

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

  // Validation rules computed in real-time
  const fieldValidation = useMemo(() => {
    const isSchoolNameValid = Boolean(formData.schoolName && formData.schoolName.trim().length >= 3);
    const isDepartmentValid = Boolean(formData.department && formData.department.trim().length > 0);
    const isCityValid = Boolean(formData.city && formData.city.trim().length > 0);
    const isArrondissementValid = Boolean(formData.arrondissement && formData.arrondissement.trim().length > 0);
    const isSchoolTypeValid = Boolean(formData.schoolType && formData.schoolType.trim().length > 0);
    const isDirectorNameValid = Boolean(formData.directorName && formData.directorName.trim().length >= 2);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isWorkEmailValid = Boolean(formData.workEmail && emailRegex.test(formData.workEmail.trim()));
    
    const digitsOnly = formData.workPhone ? formData.workPhone.replace(/\D/g, '') : '';
    const isWorkPhoneValid = digitsOnly.length >= 6;

    const requiredFields = [
      { name: "Nom de l'établissement", valid: isSchoolNameValid },
      { name: "Département", valid: isDepartmentValid },
      { name: "Ville", valid: isCityValid },
      { name: "Arrondissement / Quartier", valid: isArrondissementValid },
      { name: "Type d'établissement", valid: isSchoolTypeValid },
      { name: "Nom du responsable", valid: isDirectorNameValid },
      { name: "E-mail professionnel", valid: isWorkEmailValid },
      { name: "Téléphone", valid: isWorkPhoneValid },
    ];

    const completedCount = requiredFields.filter(f => f.valid).length;
    const totalCount = requiredFields.length;
    const isAllValid = requiredFields.every(f => f.valid);

    return {
      isSchoolNameValid,
      isDepartmentValid,
      isCityValid,
      isArrondissementValid,
      isSchoolTypeValid,
      isDirectorNameValid,
      isWorkEmailValid,
      isWorkPhoneValid,
      requiredFields,
      completedCount,
      totalCount,
      isAllValid,
    };
  }, [formData]);

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
          Inscription Établissement Scolaire & Portail Numérique
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
            {fieldValidation.isAllValid ? 'Toutes les cases sont prêtes' : 'Complétion de l\'étape'}
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

        {/* Warning if user tried to submit with empty fields */}
        {showErrors && !fieldValidation.isAllValid && (
          <div className="mt-2.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5 animate-in fade-in">
            <span className="material-symbols-outlined text-rose-400 text-[16px]">error</span>
            <span>Veuillez corriger ou renseigner toutes les cases signalées en rouge.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Nom de l'établissement */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              className="block text-[12px] font-medium text-slate-300"
              htmlFor="schoolName"
            >
              Nom de l'établissement <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isSchoolNameValid}
              isTouched={touchedFields.schoolName}
              showErrors={showErrors}
              value={formData.schoolName}
              validLabel="Nom valide"
              invalidLabel="Min. 3 lettres"
            />
          </div>
          <div className="relative">
            <input
              id="schoolName"
              name="schoolName"
              type="text"
              required
              value={formData.schoolName}
              onFocus={() => markTouched('schoolName')}
              onChange={(e) => handleSchoolNameChange(e.target.value)}
              placeholder="Nom complet de l'établissement"
              className={`w-full rounded-xl border ${
                (touchedFields.schoolName || showErrors) && !fieldValidation.isSchoolNameValid 
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30' 
                  : fieldValidation.isSchoolNameValid && formData.schoolName
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              } text-white focus:bg-white/[0.08] px-3.5 py-2.5 pr-10 text-[14px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {fieldValidation.isSchoolNameValid && formData.schoolName ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : (touchedFields.schoolName || showErrors) && !fieldValidation.isSchoolNameValid ? (
                <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={fieldValidation.isSchoolNameValid}
            isTouched={touchedFields.schoolName}
            showErrors={showErrors}
            value={formData.schoolName}
            errorMessage="Le nom officiel de l'établissement doit comporter au moins 3 caractères."
            successMessage="Nom d'établissement valide"
          />
        </div>

        {/* Slogan & Sous-domaine Numérique (Exigence 7) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">language</span>
            <span>Sous-domaine & Identité Visuelle de l'École</span>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1" htmlFor="school-slogan">
              Devise / Slogan de l'établissement
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                format_quote
              </span>
              <input
                id="school-slogan"
                type="text"
                value={formData.slogan || ''}
                onChange={(e) => onChange('slogan', e.target.value)}
                placeholder="Ex: Discipline - Travail - Succès"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none text-xs backdrop-blur-md"
              />
            </div>
          </div>

          {/* Subdomain Input */}
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1" htmlFor="school-subdomain">
              Adresse web dédiée (Sous-domaine personnalisé)
            </label>
            <div className="flex items-center">
              <input
                id="school-subdomain"
                type="text"
                value={formData.subdomain || suggestedSubdomain || ''}
                onChange={(e) =>
                  onChange(
                    'subdomain',
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '')
                      .slice(0, 30)
                  )
                }
                placeholder="nom-etablissement"
                className="w-full px-3 py-2 rounded-l-xl border border-white/15 bg-white/[0.05] text-emerald-300 font-mono text-xs focus:border-emerald-400 outline-none backdrop-blur-md"
              />
              <span className="inline-flex items-center px-3 py-2 rounded-r-xl border border-l-0 border-white/15 bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold whitespace-nowrap">
                .educongo.cg
              </span>
            </div>
          </div>

          {/* Logo Chooser / Camera Live Capture */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-medium text-slate-300">Logo de l'école / Blason officiel</label>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[10.5px] cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                Photographier le logo
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo école"
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-400 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-slate-400 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                </div>
              )}

              <div className="flex-1 flex gap-1.5 overflow-x-auto">
                {LOGO_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange('logoUrl', url)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer shrink-0 ${
                      formData.logoUrl === url ? 'border-emerald-400 scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Département & Ville Grid */}
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
                validLabel="Sélectionné"
                invalidLabel="Choix requis"
              />
            </div>
            <div className="relative">
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className={`w-full rounded-xl border ${
                  (touchedFields.department || showErrors) && !fieldValidation.isDepartmentValid 
                    ? 'border-rose-400/70 bg-rose-500/10' 
                    : fieldValidation.isDepartmentValid && formData.department
                    ? 'border-emerald-400/40 bg-emerald-500/[0.04]'
                    : 'border-white/15 bg-white/[0.05]'
                } text-slate-200 focus:border-emerald-400 focus:bg-white/[0.08] px-3 py-2 text-[13px] appearance-none transition-all outline-none pr-8 cursor-pointer backdrop-blur-md`}
              >
                <option value="" disabled className="bg-[#0b1329] text-slate-400">
                  Sélectionner un département
                </option>
                {CONGO_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-[#0b1329] text-white">
                    {dept} ({CONGO_DEPARTMENTS_CONFIG[dept]?.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>
          </div>

          {/* Ville / Commune */}
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
                validLabel="Sélectionné"
                invalidLabel="Choix requis"
              />
            </div>
            <div className="relative">
              <select
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!formData.department}
                className={`w-full rounded-xl border ${
                  (touchedFields.city || showErrors) && !fieldValidation.isCityValid 
                    ? 'border-rose-400/70 bg-rose-500/10' 
                    : fieldValidation.isCityValid && formData.city
                    ? 'border-emerald-400/40 bg-emerald-500/[0.04]'
                    : 'border-white/15 bg-white/[0.05]'
                } text-slate-200 focus:border-emerald-400 focus:bg-white/[0.08] px-3 py-2 text-[13px] appearance-none transition-all outline-none pr-8 cursor-pointer backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="" disabled className="bg-[#0b1329] text-slate-400">
                  {formData.department ? 'Sélectionner une ville' : 'Choisir département d\'abord'}
                </option>
                {availableCities.map((c) => (
                  <option key={c} value={c} className="bg-[#0b1329] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrondissement / Quartier */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="arrondissement">
              Arrondissement / Quartier {formData.department ? `(${formData.department})` : ''} <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isArrondissementValid}
              isTouched={touchedFields.arrondissement}
              showErrors={showErrors}
              value={formData.arrondissement}
              validLabel="Défini"
              invalidLabel="Choix requis"
            />
          </div>
          <div className="relative">
            <select
              id="arrondissement"
              name="arrondissement"
              required
              value={formData.arrondissement}
              onChange={(e) => {
                markTouched('arrondissement');
                onChange('arrondissement', e.target.value);
              }}
              disabled={!formData.department}
              className={`w-full rounded-xl border ${
                (touchedFields.arrondissement || showErrors) && !fieldValidation.isArrondissementValid 
                  ? 'border-rose-400/70 bg-rose-500/10' 
                  : fieldValidation.isArrondissementValid && formData.arrondissement
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04]'
                  : 'border-white/15 bg-white/[0.05]'
              } text-slate-200 focus:border-emerald-400 focus:bg-white/[0.08] px-3.5 py-2 text-[13px] appearance-none transition-all outline-none pr-8 cursor-pointer backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="" disabled className="bg-[#0b1329] text-slate-400">
                {formData.department ? 'Sélectionner arrondissement / quartier' : 'Choisir département d\'abord'}
              </option>
              {availableArrondissements.map((arr) => (
                <option key={arr} value={arr} className="bg-[#0b1329] text-white">
                  {arr}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Code Établissement Auto-généré */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-slate-300 flex items-center gap-1.5" htmlFor="school-code">
              <span className="material-symbols-outlined text-indigo-400 text-[16px]">qr_code_2</span>
              Code Établissement Auto-généré
            </label>
            {formData.department && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">done</span>
                {currentDeptConfig?.code || 'CONGO'}
              </span>
            )}
          </div>

          <input
            id="school-code"
            name="school-code"
            type="text"
            readOnly
            value={formData.schoolCode || 'Attente de sélection du département...'}
            className="w-full rounded-xl border border-indigo-400/40 bg-indigo-500/15 text-indigo-200 font-mono font-bold tracking-wider px-3.5 py-2 text-[13px] cursor-not-allowed select-all backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          />

          <div className="relative">
            <select
              id="code-format"
              name="code-format"
              value={formData.codeFormat}
              onChange={(e) => handleFormatChange(e.target.value as CodeFormat)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.05] text-slate-200 focus:border-emerald-400 px-3 py-1.5 text-[12px] appearance-none outline-none pr-8 cursor-pointer"
            >
              <option value="departement" className="bg-[#0b1329] text-white">
                Format Département ({currentDeptConfig?.code || 'BZV'}-24-X8B)
              </option>
              <option value="standard" className="bg-[#0b1329] text-white">
                Format National Standard (CG-{currentDeptConfig?.code || 'BZV'}-24-X8B)
              </option>
              <option value="annee" className="bg-[#0b1329] text-white">
                Format Année Complète ({currentDeptConfig?.code || 'BZV'}-2024-X8B)
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Type d'établissement (Exigence 4) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="school-type">
              Type / Ordre d'établissement <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isSchoolTypeValid}
              isTouched={touchedFields.schoolType}
              showErrors={showErrors}
              value={formData.schoolType}
              validLabel="Sélectionné"
              invalidLabel="Choix requis"
            />
          </div>
          <div className="relative">
            <select
              id="school-type"
              name="school-type"
              required
              value={formData.schoolType}
              onChange={(e) => {
                markTouched('schoolType');
                onChange('schoolType', e.target.value);
              }}
              className={`w-full rounded-xl border ${
                (touchedFields.schoolType || showErrors) && !fieldValidation.isSchoolTypeValid 
                  ? 'border-rose-400/70 bg-rose-500/10' 
                  : fieldValidation.isSchoolTypeValid && formData.schoolType
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04]'
                  : 'border-white/15 bg-white/[0.05]'
              } text-slate-200 focus:border-emerald-400 focus:bg-white/[0.08] px-3.5 py-2.5 text-[13px] appearance-none transition-all outline-none pr-8 cursor-pointer backdrop-blur-md`}
            >
              <option value="" disabled className="bg-[#0b1329] text-slate-400">
                Sélectionnez le type d'établissement
              </option>
              {SCHOOL_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0b1329] text-white">
                  {opt.label} ({opt.description})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        {/* Nom du responsable */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="admin-name">
              Nom du responsable (Directeur / Proviseur) <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={fieldValidation.isDirectorNameValid}
              isTouched={touchedFields.directorName}
              showErrors={showErrors}
              value={formData.directorName}
              validLabel="Rempli"
              invalidLabel="Min. 2 lettres"
            />
          </div>
          <input
            id="admin-name"
            name="admin-name"
            type="text"
            required
            value={formData.directorName}
            onFocus={() => markTouched('directorName')}
            onChange={(e) => {
              markTouched('directorName');
              onChange('directorName', e.target.value);
            }}
            placeholder="Prénom Nom du Chef d'Établissement"
            className="w-full rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 px-3.5 py-2 text-[13.5px] outline-none backdrop-blur-md"
          />
        </div>

        {/* E-mail professionnel + Vérification (Exigence 1) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="email">
              E-mail professionnel <span className="text-rose-400">*</span>
            </label>
            {formData.isEmailVerified ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/40">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Vérifié par lien
              </span>
            ) : (
              <FormFieldBadge
                isValid={fieldValidation.isWorkEmailValid}
                isTouched={touchedFields.workEmail}
                showErrors={showErrors}
                value={formData.workEmail}
                validLabel="Email valide"
                invalidLabel="Format email"
              />
            )}
          </div>
          <div className="flex gap-2">
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
              }}
              placeholder="direction@ecole.cg"
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 px-3.5 py-2 text-[13px] outline-none backdrop-blur-md font-mono"
            />
            <button
              type="button"
              onClick={() =>
                setVerificationModal({
                  isOpen: true,
                  type: 'email',
                  targetValue: formData.workEmail || 'direction@ecole.cg',
                })
              }
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                formData.isEmailVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/40'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {formData.isEmailVerified ? 'mark_email_read' : 'send'}
              </span>
              <span>{formData.isEmailVerified ? 'Confirmé' : 'Vérifier (Lien)'}</span>
            </button>
          </div>
        </div>

        {/* Numéro de téléphone (+242) + Vérification OTP (Exigence 1) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[12px] font-medium text-slate-300" htmlFor="phone">
              Numéro de téléphone (+242) <span className="text-rose-400">*</span>
            </label>
            {formData.isPhoneVerified ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/40">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                Vérifié par OTP
              </span>
            ) : (
              <FormFieldBadge
                isValid={fieldValidation.isWorkPhoneValid}
                isTouched={touchedFields.workPhone}
                showErrors={showErrors}
                value={formData.workPhone}
                validLabel="Numéro valide"
                invalidLabel="Min. 6 chiffres"
              />
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1">
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
                className="w-full rounded-r-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 px-3 py-2 text-[13px] outline-none backdrop-blur-md font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setVerificationModal({
                  isOpen: true,
                  type: 'phone',
                  targetValue: formData.workPhone ? `+242 ${formData.workPhone}` : '+242 06 650 12 34',
                })
              }
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                formData.isPhoneVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/40'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {formData.isPhoneVerified ? 'check_circle' : 'sms'}
              </span>
              <span>{formData.isPhoneVerified ? 'Validé' : 'Vérifier (OTP)'}</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!fieldValidation.isAllValid}
            className={`w-full text-white text-[14px] font-semibold rounded-xl py-3 border transition-all flex justify-center items-center ${
              fieldValidation.isAllValid
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
                : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-70 shadow-none'
            }`}
          >
            <span>
              {fieldValidation.isAllValid 
                ? 'Étape Suivante (Admin)' 
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

      {/* Verification Modal for Phone OTP & Email Link */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal((prev) => ({ ...prev, isOpen: false }))}
        type={verificationModal.type}
        targetValue={verificationModal.targetValue}
        schoolName={formData.schoolName || 'Votre établissement'}
        onVerified={() => {
          if (verificationModal.type === 'phone') {
            onChange('isPhoneVerified', true);
          } else {
            onChange('isEmailVerified', true);
          }
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

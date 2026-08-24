import React, { useState, useMemo } from 'react';
import { FormFieldBadge, FormFieldFeedback } from '../Common/FormFieldValidation';
import { saveRegisteredAccount } from '../../services/accountService';

interface RegisterCardProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (accountData: {
    name: string;
    city: string;
    code: string;
    adminFullName?: string;
    workEmail?: string;
    subdomain?: string;
  }) => void;
  onSignUpWithSupabase?: (
    email: string,
    password: string,
    schoolData: { adminFullName: string; schoolName: string; subdomain: string }
  ) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
}

export const RegisterCard: React.FC<RegisterCardProps> = ({
  onSwitchToLogin,
  onRegisterSuccess,
  onSignUpWithSupabase,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Validation rules
  const validation = useMemo(() => {
    const isUsernameValid = username.trim().length >= 3;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email.trim());
    const isPasswordValid = password.length >= 6;
    const isAllValid = isUsernameValid && isEmailValid && isPasswordValid;

    return {
      isUsernameValid,
      isEmailValid,
      isPasswordValid,
      isAllValid,
    };
  }, [username, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isAllValid) {
      setShowErrors(true);
      setErrorMsg('Veuillez remplir correctement les 3 informations obligatoires.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubdomain = cleanUsername
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `ecole-${Math.floor(1000 + Math.random() * 9000)}`;

    const defaultSchoolName = `Établissement ${cleanUsername}`;
    const generatedCode = `CG-BZV-24-${Math.floor(100 + Math.random() * 900)}`;

    try {
      if (onSignUpWithSupabase) {
        const res = await onSignUpWithSupabase(cleanEmail, password, {
          adminFullName: cleanUsername,
          schoolName: defaultSchoolName,
          subdomain: cleanSubdomain,
        });

        setIsLoading(false);
        if (!res.success) {
          setErrorMsg(res.error || "Erreur lors de l'enregistrement du compte.");
          return;
        }

        onRegisterSuccess({
          name: defaultSchoolName,
          city: 'Brazzaville',
          code: generatedCode,
          adminFullName: cleanUsername,
          workEmail: cleanEmail,
          subdomain: cleanSubdomain,
        });
        return;
      }

      // Local account creation fallback
      const newAccount = await saveRegisteredAccount({
        schoolName: defaultSchoolName,
        schoolCode: generatedCode,
        adminFullName: cleanUsername,
        workEmail: cleanEmail,
        password: password,
        schoolType: 'secondaire',
        city: 'Brazzaville',
        department: 'Brazzaville',
        workPhone: '06 000 00 00',
        subdomain: cleanSubdomain,
        isEmailVerified: true,
      });

      setIsLoading(false);
      onRegisterSuccess({
        name: newAccount.schoolName,
        city: newAccount.city,
        code: newAccount.schoolCode,
        adminFullName: newAccount.adminFullName,
        workEmail: newAccount.workEmail,
        subdomain: newAccount.subdomain,
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Une erreur inattendue est survenue.');
    }
  };

  return (
    <div className="w-full lg:w-1/2 h-[560px] max-h-[90vh] bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 flex flex-col justify-between overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-extrabold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent tracking-tight leading-none">
              Créer un Compte
            </h1>
            <p className="text-[11.5px] text-slate-400 font-light mt-0.5">
              Inscription simplifiée en 3 éléments
            </p>
          </div>

          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="px-2.5 py-1 rounded-lg font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Connexion
            </button>
            <span className="px-2.5 py-1 rounded-lg font-bold bg-indigo-500 text-white shadow-sm">
              Inscription
            </span>
          </div>
        </div>

        {/* Notice informative */}
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-200 text-[11px] flex items-center gap-2 backdrop-blur-md mb-1">
          <span className="material-symbols-outlined text-[16px] text-indigo-400 shrink-0">info</span>
          <span>Vous compléterez l'ensemble des données de l'établissement (cycles, filières, logo) dans la configuration administrateur.</span>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11.5px] flex items-center gap-2 backdrop-blur-md animate-in fade-in mb-1">
            <span className="material-symbols-outlined text-[16px] text-rose-400 shrink-0">error</span>
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main 3-field form */}
      <form onSubmit={handleSubmit} className="space-y-3 my-auto">
        {/* Field 1: Nom d'utilisateur / Administrateur */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11.5px] font-medium text-slate-300 block" htmlFor="reg-username">
              1. Nom d'utilisateur ou Nom Administrateur <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={validation.isUsernameValid}
              isTouched={touchedFields.username}
              showErrors={showErrors}
              value={username}
              validLabel="Valide"
              invalidLabel="Min. 3 car."
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              person
            </span>
            <input
              id="reg-username"
              name="username"
              type="text"
              required
              value={username}
              onFocus={() => markTouched('username')}
              onChange={(e) => {
                markTouched('username');
                setUsername(e.target.value);
              }}
              placeholder="Ex: Michel Ngoma (Directeur)"
              className={`w-full pl-9 pr-9 py-2 rounded-xl text-[13px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.username || showErrors) && !validation.isUsernameValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                  : validation.isUsernameValid && username
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {validation.isUsernameValid && username ? (
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={validation.isUsernameValid}
            isTouched={touchedFields.username}
            showErrors={showErrors}
            value={username}
            errorMessage="Veuillez saisir votre nom ou pseudo (au moins 3 caractères)."
            successMessage="Nom d'utilisateur valide"
          />
        </div>

        {/* Field 2: E-mail */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11.5px] font-medium text-slate-300 block" htmlFor="reg-email">
              2. Adresse E-mail <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={validation.isEmailValid}
              isTouched={touchedFields.email}
              showErrors={showErrors}
              value={email}
              validLabel="Email valide"
              invalidLabel="Requis"
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              mail
            </span>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              value={email}
              onFocus={() => markTouched('email')}
              onChange={(e) => {
                markTouched('email');
                setEmail(e.target.value);
              }}
              placeholder="Ex: direction@mon-ecole.com"
              className={`w-full pl-9 pr-9 py-2 rounded-xl text-[13px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.email || showErrors) && !validation.isEmailValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                  : validation.isEmailValid && email
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {validation.isEmailValid && email ? (
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={validation.isEmailValid}
            isTouched={touchedFields.email}
            showErrors={showErrors}
            value={email}
            errorMessage="Veuillez saisir une adresse e-mail valide avec @ et domaine."
            successMessage="Adresse e-mail valide"
          />
        </div>

        {/* Field 3: Mot de passe */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="reg-password" className="text-[11.5px] font-medium text-slate-300">
              3. Mot de passe <span className="text-rose-400">*</span>
            </label>
            <FormFieldBadge
              isValid={validation.isPasswordValid}
              isTouched={touchedFields.password}
              showErrors={showErrors}
              value={password}
              validLabel="Sécurisé"
              invalidLabel="Min. 6 car."
            />
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              lock
            </span>
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onFocus={() => markTouched('password')}
              onChange={(e) => {
                markTouched('password');
                setPassword(e.target.value);
              }}
              placeholder="Min. 6 caractères"
              className={`w-full pl-9 pr-16 py-2 rounded-xl text-[13px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.password || showErrors) && !validation.isPasswordValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                  : validation.isPasswordValid && password
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {validation.isPasswordValid && password ? (
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={validation.isPasswordValid}
            isTouched={touchedFields.password}
            showErrors={showErrors}
            value={password}
            errorMessage="Le mot de passe doit comporter au moins 6 caractères."
            successMessage="Mot de passe valide"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !validation.isAllValid}
          className={`w-full py-2.5 mt-1 text-white rounded-xl text-[13px] font-semibold border transition-all flex items-center justify-center gap-2 ${
            validation.isAllValid
              ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 border-indigo-400/40 shadow-[0_0_25px_rgba(99,102,241,0.35)] cursor-pointer active:scale-[0.99]'
              : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-70'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Création du compte en cours...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Valider l'Inscription & Configurer</span>
            </>
          )}
        </button>
      </form>

      {/* Footer link back to login */}
      <div className="pt-2 border-t border-white/10 text-center">
        <p className="text-[11.5px] text-slate-400">
          Vous avez déjà un compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
          >
            Se connecter
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        </p>
      </div>
    </div>
  );
};

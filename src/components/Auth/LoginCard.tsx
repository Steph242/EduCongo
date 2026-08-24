import React, { useMemo, useState } from 'react';
import { FormFieldBadge, FormFieldFeedback } from '../Common/FormFieldValidation';
import { verifySchoolLogin } from '../../services/accountService';

interface LoginCardProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: (schoolInfo?: { name: string; city: string; code: string; slogan?: string; logoUrl?: string; subdomain?: string }) => void;
  onLoginWithSupabase?: (identifier: string, password: string, mode: 'phone' | 'email') => Promise<{ success: boolean; error?: string }>;
  onForgotPassword: () => void;
}

type LoginMode = 'phone' | 'email';

export const LoginCard: React.FC<LoginCardProps> = ({
  onSwitchToRegister,
  onLoginSuccess,
  onLoginWithSupabase,
  onForgotPassword,
}) => {
  // Credentials - with Remember Me persistence
  const [phone, setPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('educongo_remember_me_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rememberMe && parsed.mode === 'phone') {
          return parsed.identifier || '';
        }
      }
    } catch {}
    return '';
  });
  const [emailOrCode, setEmailOrCode] = useState(() => {
    try {
      const saved = localStorage.getItem('educongo_remember_me_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rememberMe && parsed.mode === 'email') {
          return parsed.identifier || '';
        }
      }
    } catch {}
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      const saved = localStorage.getItem('educongo_remember_me_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.rememberMe);
      }
    } catch {}
    return false;
  });
  const [loginMode, setLoginMode] = useState<LoginMode>(() => {
    try {
      const saved = localStorage.getItem('educongo_remember_me_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.rememberMe && (parsed.mode === 'phone' || parsed.mode === 'email')) {
          return parsed.mode;
        }
      }
    } catch {}
    return 'phone';
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Detect telecom operator for Republic of Congo numbers
  const detectedOperator = useMemo(() => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.startsWith('06') || cleanDigits.startsWith('6')) {
      return { name: 'MTN Congo', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    }
    if (cleanDigits.startsWith('05') || cleanDigits.startsWith('5') || cleanDigits.startsWith('04') || cleanDigits.startsWith('4')) {
      return { name: 'Airtel Congo', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
    }
    return null;
  }, [phone]);

  const validation = useMemo(() => {
    // Phone validation
    const digitsOnly = phone ? phone.replace(/\D/g, '') : '';
    const isPhoneValid = digitsOnly.length >= 6;

    // Email or Code validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailFormat = emailRegex.test(emailOrCode.trim());
    const isSchoolCodeFormat = emailOrCode.trim().length >= 4;
    const isEmailOrCodeValid = Boolean(emailOrCode && (isEmailFormat || isSchoolCodeFormat));

    // Password validation
    const isPasswordValid = Boolean(password && password.length >= 4);

    const isCurrentCredentialValid = loginMode === 'phone' ? isPhoneValid : isEmailOrCodeValid;
    const isAllValid = isCurrentCredentialValid && isPasswordValid;

    return {
      isPhoneValid,
      isEmailOrCodeValid,
      isPasswordValid,
      isAllValid,
      isEmailFormat,
    };
  }, [loginMode, phone, emailOrCode, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isAllValid) {
      setShowErrors(true);
      setErrorMsg(
        loginMode === 'phone'
          ? 'Veuillez saisir un numéro de téléphone congolais valide (+242).'
          : 'Veuillez saisir une adresse email ou un code établissement valide.'
      );
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const identifier = loginMode === 'phone' ? `+242${phone.replace(/\D/g, '')}` : emailOrCode.trim();

    const handleRememberMeSave = () => {
      if (rememberMe) {
        localStorage.setItem(
          'educongo_remember_me_v3',
          JSON.stringify({
            rememberMe: true,
            mode: loginMode,
            identifier: loginMode === 'phone' ? phone : emailOrCode,
          })
        );
      } else {
        localStorage.removeItem('educongo_remember_me_v3');
      }
    };

    try {
      if (onLoginWithSupabase) {
        const res = await onLoginWithSupabase(identifier, password, loginMode);
        setIsLoading(false);
        if (!res.success) {
          setErrorMsg(res.error || 'Identifiants ou mot de passe incorrects.');
        } else {
          handleRememberMeSave();
        }
        return;
      }

      // Local fallback verification
      const result = verifySchoolLogin(identifier, password, loginMode);
      setIsLoading(false);
      if (!result.success || !result.account) {
        setErrorMsg(result.errorMessage || 'Identifiants ou mot de passe incorrects.');
        return;
      }

      handleRememberMeSave();

      onLoginSuccess({
        name: result.account.schoolName,
        city: result.account.city,
        code: result.account.schoolCode,
        slogan: result.account.slogan,
        logoUrl: result.account.logoUrl,
        subdomain: result.account.subdomain,
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Une erreur de connexion est survenue.');
    }
  };

  return (
    <div className="w-full lg:w-1/2 h-[560px] max-h-[90vh] bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 flex flex-col justify-between overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent mb-0.5 tracking-tight">
              EduCongo
            </h1>
            <p className="text-[11.5px] text-slate-400 font-light">
              Portail Numérique des Établissements Scolaires
            </p>
          </div>
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-500 text-slate-950 shadow-sm">
              Connexion
            </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="px-2.5 py-1 rounded-lg font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Inscription
            </button>
          </div>
        </div>

        {/* Local Reality Selector: Connexion par Téléphone OU par Email */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md mb-2">
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setErrorMsg('');
            }}
            className={`py-1.5 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'phone'
                ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Par Téléphone</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('email');
              setErrorMsg('');
            }}
            className={`py-1.5 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'email'
                ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>Par E-mail / Code</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11.5px] flex items-center gap-2 backdrop-blur-md animate-in fade-in">
            <span className="material-symbols-outlined text-[16px] text-rose-400 shrink-0">error</span>
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3 my-auto">
        {/* OPTION 1: MODE TÉLÉPHONE MOBILE CONGOLAIS (+242) */}
        {loginMode === 'phone' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <label
                  className="text-[11px] font-medium text-slate-300 block"
                  htmlFor="login-phone"
                >
                  Numéro de mobile (+242) <span className="text-rose-400">*</span>
                </label>
                {detectedOperator && (
                  <span className={`text-[9.5px] px-2 py-0.5 rounded-full border font-bold ${detectedOperator.color} animate-in fade-in`}>
                    {detectedOperator.name}
                  </span>
                )}
              </div>
              <FormFieldBadge
                isValid={validation.isPhoneValid}
                isTouched={touchedFields.phone}
                showErrors={showErrors}
                value={phone}
                validLabel="Format valide"
                invalidLabel="Numéro requis"
              />
            </div>
            <div className="relative">
              <div className="flex">
                <div className="flex items-center gap-1.5 px-3 bg-white/[0.07] border border-r-0 border-white/15 rounded-l-xl text-slate-300 text-xs font-mono select-none">
                  <span className="w-4 h-2.5 rounded-xs overflow-hidden flex">
                    <span className="w-1/3 bg-[#009543]"></span>
                    <span className="w-1/3 bg-[#FBDE4A]"></span>
                    <span className="w-1/3 bg-[#DC241F]"></span>
                  </span>
                  +242
                </div>
                <input
                  id="login-phone"
                  name="phone"
                  type="tel"
                  required
                  value={phone}
                  onFocus={() => markTouched('phone')}
                  onChange={(e) => {
                    markTouched('phone');
                    setPhone(e.target.value);
                  }}
                  placeholder="06 000 00 00"
                  className={`w-full rounded-r-xl border ${
                    (touchedFields.phone || showErrors) && !validation.isPhoneValid
                      ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                      : validation.isPhoneValid && phone
                      ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                      : 'border-white/15 bg-white/[0.05]'
                  } text-white focus:bg-white/[0.08] px-3.5 py-2 text-[13px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
                />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {validation.isPhoneValid && phone ? (
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                ) : null}
              </div>
            </div>
            <FormFieldFeedback
              isValid={validation.isPhoneValid}
              isTouched={touchedFields.phone}
              showErrors={showErrors}
              value={phone}
              errorMessage="Numéro mobile congolais invalide (+242)."
              successMessage="Numéro congolais reconnu (+242)"
            />
          </div>
        )}

        {/* OPTION 2: MODE EMAIL OU CODE ÉTABLISSEMENT */}
        {loginMode === 'email' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                className="text-[11px] font-medium text-slate-300 block"
                htmlFor="login-email"
              >
                E-mail officiel ou Code Établissement <span className="text-rose-400">*</span>
              </label>
              <FormFieldBadge
                isValid={validation.isEmailOrCodeValid}
                isTouched={touchedFields.emailOrCode}
                showErrors={showErrors}
                value={emailOrCode}
                validLabel={validation.isEmailFormat ? "Email valide" : "Code valide"}
                invalidLabel="Format requis"
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                {validation.isEmailFormat ? 'mail' : 'qr_code_2'}
              </span>
              <input
                id="login-email"
                name="email"
                type="text"
                required
                value={emailOrCode}
                onFocus={() => markTouched('emailOrCode')}
                onChange={(e) => {
                  markTouched('emailOrCode');
                  setEmailOrCode(e.target.value);
                }}
                placeholder="Ex: direction@mon-ecole.com ou BZV-24-X8B"
                className={`w-full pl-9 pr-9 py-2 rounded-xl text-[13px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                  (touchedFields.emailOrCode || showErrors) && !validation.isEmailOrCodeValid
                    ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                    : validation.isEmailOrCodeValid && emailOrCode
                    ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                    : 'border-white/15 bg-white/[0.05]'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {validation.isEmailOrCodeValid && emailOrCode ? (
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                ) : null}
              </div>
            </div>
            <FormFieldFeedback
              isValid={validation.isEmailOrCodeValid}
              isTouched={touchedFields.emailOrCode}
              showErrors={showErrors}
              value={emailOrCode}
              errorMessage="Veuillez saisir une adresse email valide ou le code officiel."
              successMessage={validation.isEmailFormat ? "Adresse e-mail valide" : "Code établissement renseigné"}
            />
          </div>
        )}

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <label htmlFor="login-password" className="text-[11px] font-medium text-slate-300">
                Mot de passe <span className="text-rose-400">*</span>
              </label>
              <FormFieldBadge
                isValid={validation.isPasswordValid}
                isTouched={touchedFields.password}
                showErrors={showErrors}
                value={password}
                validLabel="Renseigné"
                invalidLabel="Min. 4 car."
              />
            </div>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              lock
            </span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onFocus={() => markTouched('password')}
              onChange={(e) => {
                markTouched('password');
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
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
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-emerald-500"
            />
            <span>Se souvenir de moi sur cet appareil</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !validation.isAllValid}
          className={`w-full py-2.5 mt-1 text-white rounded-xl text-[13px] font-semibold border transition-all flex items-center justify-center gap-2 ${
            validation.isAllValid
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
              : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-70'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Se connecter {loginMode === 'phone' ? 'par Téléphone' : 'par E-mail'}</span>
            </>
          )}
        </button>
      </form>

      {/* Footer switch to register */}
      <div className="pt-2 border-t border-white/10 text-center">
        <p className="text-[11.5px] text-slate-400">
          Votre établissement n'est pas encore inscrit ?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-emerald-400 font-bold hover:underline cursor-pointer inline-flex items-center gap-0.5 ml-1"
          >
            Créer un compte
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        </p>
      </div>
    </div>
  );
};

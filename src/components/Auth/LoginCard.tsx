import React, { useMemo, useState, useEffect } from 'react';
import { FormFieldBadge, FormFieldFeedback } from '../Common/FormFieldValidation';
import { verifySchoolLogin, getRegisteredAccounts } from '../../services/accountService';
import { RegisteredSchoolAccount } from '../../types';

interface LoginCardProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: (schoolInfo?: { name: string; city: string; code: string }) => void;
  onForgotPassword: () => void;
}

type LoginMode = 'phone' | 'email';

export const LoginCard: React.FC<LoginCardProps> = ({
  onSwitchToRegister,
  onLoginSuccess,
  onForgotPassword,
}) => {
  const [loginMode, setLoginMode] = useState<LoginMode>('phone');
  
  // Credentials - empty by default so user can type real information
  const [phone, setPhone] = useState('');
  const [emailOrCode, setEmailOrCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredSchoolAccount[]>([]);

  // Load registered accounts on mount
  useEffect(() => {
    const list = getRegisteredAccounts();
    setRegisteredAccounts(list);
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      setIsLoading(false);
      const identifier = loginMode === 'phone' ? phone : emailOrCode;
      const result = verifySchoolLogin(identifier, password, loginMode);

      if (!result.success || !result.account) {
        setErrorMsg(result.errorMessage || 'Identifiants ou mot de passe invalides.');
        return;
      }

      onLoginSuccess({
        name: result.account.schoolName,
        city: result.account.city,
        code: result.account.schoolCode,
      });
    }, 600);
  };

  return (
    <div className="w-full max-w-md bg-white/[0.05] backdrop-blur-2xl rounded-3xl border border-white/15 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative z-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-extrabold bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent mb-1 tracking-tight">
          EduCongo
        </h1>
        <p className="text-[13.5px] text-slate-300 font-light">
          Portail Numérique des Établissements Scolaires
        </p>
      </div>

      {/* Main Tab Navigation: Connexion / Inscription */}
      <div className="flex border-b border-white/10 mb-6 relative">
        <button
          type="button"
          className="flex-1 pb-3 text-center text-[14px] font-bold text-emerald-400 border-b-2 border-emerald-400 transition-all cursor-pointer drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="flex-1 pb-3 text-center text-[14px] font-medium text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          Créer un compte
        </button>
      </div>

      {/* Local Reality Selector: Connexion par Téléphone OU par Email */}
      <div className="mb-5">
        <label className="block text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-wider text-center">
          Mode d'identification
        </label>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'phone'
                ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">smartphone</span>
            <span>Par Téléphone</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMode('email');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              loginMode === 'email'
                ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">mail</span>
            <span>Par E-mail / Code</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[13px] flex items-center gap-2.5 backdrop-blur-md animate-in fade-in">
          <span className="material-symbols-outlined text-[18px] text-rose-400">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OPTION 1: MODE TÉLÉPHONE MOBILE CONGOLAIS (+242) */}
        {loginMode === 'phone' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <label
                  className="text-[12px] font-medium text-slate-300 block"
                  htmlFor="login-phone"
                >
                  Numéro de mobile (+242) <span className="text-rose-400">*</span>
                </label>
                {detectedOperator && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${detectedOperator.color} animate-in fade-in`}>
                    {detectedOperator.name}
                  </span>
                )}
              </div>
              <FormFieldBadge
                isValid={validation.isPhoneValid}
                isTouched={touchedFields.phone}
                showErrors={showErrors}
                value={phone}
                validLabel="Numéro valide"
                invalidLabel="Min. 6 chiffres"
              />
            </div>
            <div className="relative">
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/15 bg-white/[0.08] text-emerald-300 text-[13px] font-bold backdrop-blur-md">
                  +242
                </span>
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
                  } text-white focus:bg-white/[0.08] px-3.5 py-2.5 pr-10 text-[14px] transition-all outline-none backdrop-blur-md placeholder:text-slate-500`}
                />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {validation.isPhoneValid && phone ? (
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                ) : (touchedFields.phone || showErrors) && !validation.isPhoneValid ? (
                  <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
                ) : null}
              </div>
            </div>
            <FormFieldFeedback
              isValid={validation.isPhoneValid}
              isTouched={touchedFields.phone}
              showErrors={showErrors}
              value={phone}
              errorMessage="Numéro mobile invalide (6 à 9 chiffres, ex: 06 650 12 34 ou 05 500 00 00)."
              successMessage="Numéro congolais reconnu (+242)"
            />
          </div>
        )}

        {/* OPTION 2: MODE EMAIL OU CODE ÉTABLISSEMENT */}
        {loginMode === 'email' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                className="text-[12px] font-medium text-slate-300 block"
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
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
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
                placeholder="direction@ecole.cg ou BZV-24-X8B"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-[14px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                  (touchedFields.emailOrCode || showErrors) && !validation.isEmailOrCodeValid
                    ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                    : validation.isEmailOrCodeValid && emailOrCode
                    ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                    : 'border-white/15 bg-white/[0.05]'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {validation.isEmailOrCodeValid && emailOrCode ? (
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                ) : (touchedFields.emailOrCode || showErrors) && !validation.isEmailOrCodeValid ? (
                  <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
                ) : null}
              </div>
            </div>
            <FormFieldFeedback
              isValid={validation.isEmailOrCodeValid}
              isTouched={touchedFields.emailOrCode}
              showErrors={showErrors}
              value={emailOrCode}
              errorMessage="Veuillez saisir une adresse email valide ou le code officiel de l'école."
              successMessage={validation.isEmailFormat ? "Adresse e-mail valide" : "Code établissement renseigné"}
            />
          </div>
        )}

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <label htmlFor="login-password" className="text-[12px] font-medium text-slate-300">
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
              className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
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
              className={`w-full pl-10 pr-20 py-2.5 rounded-xl text-[14px] outline-none transition-all text-white placeholder:text-slate-500 backdrop-blur-md border ${
                (touchedFields.password || showErrors) && !validation.isPasswordValid
                  ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                  : validation.isPasswordValid && password
                  ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-white/15 bg-white/[0.05]'
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {validation.isPasswordValid && password ? (
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
              ) : null}
            </div>
          </div>
          <FormFieldFeedback
            isValid={validation.isPasswordValid}
            isTouched={touchedFields.password}
            showErrors={showErrors}
            value={password}
            errorMessage="Le mot de passe doit comporter au moins 4 caractères."
            successMessage="Mot de passe sécurisé"
          />
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-[12px] text-slate-300 cursor-pointer select-none">
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
          className={`w-full py-3 mt-2 text-white rounded-xl text-[14px] font-semibold border transition-all flex items-center justify-center gap-2 ${
            validation.isAllValid
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
              : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-70'
          }`}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Connexion en cours...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">login</span>
              Se connecter {loginMode === 'phone' ? 'par Téléphone' : 'par E-mail'}
            </>
          )}
        </button>
      </form>

      {/* Accounts information footer */}
      <div className="mt-7 pt-5 border-t border-white/10">
        {registeredAccounts.length > 0 ? (
          <div>
            <p className="text-[12px] text-slate-400 font-medium mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                Établissements enregistrés ({registeredAccounts.length}) :
              </span>
              <span className="text-[11px] text-emerald-400/80">Comptes réels</span>
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {registeredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    if (loginMode === 'phone') {
                      setPhone(acc.workPhone || acc.personalPhone);
                    } else {
                      setEmailOrCode(acc.schoolCode || acc.workEmail);
                    }
                    if (acc.password) {
                      setPassword(acc.password);
                    }
                    setErrorMsg('');
                    setShowErrors(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-white/10 hover:border-emerald-400/40 bg-white/[0.03] hover:bg-white/[0.07] text-[12px] transition-all group backdrop-blur-md cursor-pointer flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                      {acc.schoolName}
                    </div>
                    <div className="text-slate-400 text-[11px] truncate">
                      {acc.city} • Code: {acc.schoolCode} • Tél: {acc.workPhone}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                    Sélectionner
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-slate-400 text-[12px] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-indigo-400 text-[18px] shrink-0 mt-0.5">how_to_reg</span>
            <div>
              <span className="text-slate-300 font-semibold block mb-0.5">Aucun compte actif trouvé</span>
              <span>
                Pour accéder au portail EduCongo, vous devez d'abord{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer inline"
                >
                  enregistrer votre établissement
                </button>.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  getDeveloperAccounts,
  createDeveloperAccount,
  verifyDeveloperCredentials,
  sendEmailVerificationCode,
  verifyEmailCode,
  DeveloperAccount,
  VALID_SECURITY_KEYS,
} from '../../services/devAccountService';

interface DevAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (devAccount?: DeveloperAccount) => void;
  onDevAuthenticated?: () => void;
}

type AuthTab = 'login' | 'register';

export const DevAuthModal: React.FC<DevAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onDevAuthenticated,
}) => {

  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('Super-Administrateur Système');
  const [regDepartment, setRegDepartment] = useState('MEPPSA - Direction des Systèmes d’Information (DSI)');
  const [regPhone, setRegPhone] = useState('+242 06 600 00 00');
  const [regSecurityKey, setRegSecurityKey] = useState('MEPPSA-DEV-2024');

  // Available Developer Accounts
  const [accounts, setAccounts] = useState<DeveloperAccount[]>([]);

  // Email 2FA Code Step if requested
  const [isVerificationCodeStep, setIsVerificationCodeStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAccounts(getDeveloperAccounts());
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerAuthSuccess = (acc?: DeveloperAccount) => {
    if (onSuccess) onSuccess(acc);
    if (onDevAuthenticated) onDevAuthenticated();
  };

  /* ====================== LOGIN HANDLER ====================== */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = verifyDeveloperCredentials(email, password);
      if (!res.success || !res.account) {
        setErrorMessage(res.message || 'Identifiants développeur non reconnus.');
        return;
      }

      triggerAuthSuccess(res.account);
      onClose();
    }, 350);
  };

  /* ====================== REGISTER HANDLER ====================== */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await createDeveloperAccount({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment,
        phone: regPhone,
        securityKey: regSecurityKey,
      });

      setIsLoading(false);

      if (!res.success || !res.account) {
        setErrorMessage(res.message || 'Erreur lors de la création du compte développeur.');
        return;
      }

      setSuccessMessage(`Compte développeur pour "${res.account.fullName}" créé avec succès !`);
      setAccounts(getDeveloperAccounts());

      // Auto-login and enter console after brief success feedback
      setTimeout(() => {
        triggerAuthSuccess(res.account);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
    }
  };

  const handleSelectExistingAccount = (acc: DeveloperAccount) => {
    setEmail(acc.email);
    setPassword(acc.password || 'DevAdmin2024!');
    setErrorMessage('');
    setActiveTab('login');
  };

  const handleUseDemoCredentials = () => {
    setEmail('dev@edu-congo.netlify.app');
    setPassword('DevAdmin2024!');
    setErrorMessage('');
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await verifyEmailCode(email || 'dev@edu-congo.netlify.app', verificationCode);
    setIsLoading(false);
    if (res.success) {
      const acc = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()) || accounts[0];
      triggerAuthSuccess(acc);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-indigo-500/30 animate-in zoom-in-95 duration-150 relative overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Flag / Indigo Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-md shrink-0">
              <span className="material-symbols-outlined text-[24px]">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-white text-base">
                  Console d'Administration & Dev
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  MEPPSA ROOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Espace sécurisé réservé aux ingénieurs et administrateurs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Mode Selector Tabs (Connexion / Créer un compte) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">lock_open</span>
            Connexion Dev
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Créer un Compte Dev
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 mb-4 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-indigo-400 text-[18px] shrink-0 mt-0.5">
            verified_user
          </span>
          <div className="flex-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{activeTab === 'login' ? 'Authentification Sécurisée' : 'Nouveau Compte Administrateur'}</span>
              <span className="text-[10px] text-emerald-400 font-mono">DSI & Supabase</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {activeTab === 'login'
                ? 'Connectez-vous avec vos accès développeur ou sélectionnez un compte certifié ci-dessous.'
                : 'Enregistrez un nouveau profil administrateur avec habilitation nationale de sécurité.'}
            </div>
          </div>
        </div>

        {/* Global Feedback Messages */}
        {errorMessage && (
          <div className="p-2.5 mb-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 mb-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar space-y-3.5">
          {/* ======================================================== */}
          {/* ================= TAB 1: LOGIN ========================= */}
          {/* ======================================================== */}
          {activeTab === 'login' && !isVerificationCodeStep && (
            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              {/* Email */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  E-mail Développeur / Super-Admin <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    alternate_email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@edu-congo.netlify.app ou votre email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none backdrop-blur-md font-mono text-[13px]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-300">
                    Mot de passe <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none backdrop-blur-md text-[13px]"
                  />
                </div>
              </div>

              {/* Quick autofill helper */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleUseDemoCredentials}
                  className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-indigo-300 rounded-xl border border-indigo-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">key</span>
                  <span>Remplir les identifiants par défaut (dev@edu-congo.netlify.app)</span>
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-center"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold border border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-spin material-symbols-outlined text-[16px]">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Ouvrir la Console
                    </>
                  )}
                </button>
              </div>

              {/* Quick Pick from registered developer accounts */}
              {accounts.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Comptes Développeurs Enregistrés ({accounts.length})</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-indigo-400 hover:underline cursor-pointer lowercase first-letter:uppercase"
                    >
                      + Nouveau
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectExistingAccount(acc)}
                        className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          email.toLowerCase() === acc.email.toLowerCase()
                            ? 'bg-indigo-500/20 border-indigo-400/50 text-white'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            <span className="truncate">{acc.fullName}</span>
                            {acc.isCustom && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                                Personnalisé
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                        </div>
                        <span className="text-[10px] text-indigo-400 font-semibold shrink-0 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          Choisir
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ======================================================== */}
          {/* ================= TAB 2: REGISTER ====================== */}
          {/* ======================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nom complet de l'ingénieur / administrateur <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ex: M. Bienvenu MOUKOKO ou Brealyston"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none backdrop-blur-md text-[13px]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  E-mail développeur / professionnel <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    alternate_email
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Ex: dev@edu-congo.netlify.app ou brealyston007@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none backdrop-blur-md font-mono text-[13px]"
                  />
                </div>
              </div>

              {/* Technical Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Rôle technique <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-white focus:border-indigo-400 outline-none text-xs"
                  >
                    <option value="Super-Administrateur Système">Super-Administrateur Système (Root)</option>
                    <option value="Ingénieur Cloud & DevOps">Ingénieur Cloud & DevOps</option>
                    <option value="Développeur Full-Stack">Développeur Full-Stack EduCongo</option>
                    <option value="Inspecteur DSI MEPPSA">Inspecteur DSI MEPPSA</option>
                    <option value="Auditeur & Sécurité">Auditeur & Sécurité Informatique</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Service / Pôle
                  </label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="Ex: MEPPSA DSI"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Mot de passe <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Confirmer mot de passe <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirmez"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Security Clearance Key */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-300">
                    Clé d'habilitation de sécurité nationale <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setRegSecurityKey('MEPPSA-DEV-2024')}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Clé officielle MEPPSA-DEV-2024
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 text-[18px]">
                    key
                  </span>
                  <input
                    type="text"
                    required
                    value={regSecurityKey}
                    onChange={(e) => setRegSecurityKey(e.target.value.toUpperCase())}
                    placeholder="MEPPSA-DEV-2024"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 focus:border-amber-400 outline-none font-mono text-xs font-bold tracking-wider"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Clé d'autorisation délivrée par la Direction des Systèmes d'Information (DSI).
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Numéro de téléphone d'astreinte
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    phone
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+242 06 600 00 00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-center"
                >
                  J'ai déjà un compte
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !regFullName || !regEmail || !regPassword || !regSecurityKey}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl font-bold border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-spin material-symbols-outlined text-[16px]">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">add_moderator</span>
                      Créer & Accéder
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* ================= 2FA VERIFICATION CODE ================= */}
          {/* ======================================================== */}
          {isVerificationCodeStep && (
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300">
                Code de sécurité envoyé à <strong className="text-indigo-300 font-mono">{email}</strong>
                {generatedCode && (
                  <div className="mt-1.5 text-[11px] text-emerald-400 font-mono">
                    Code de test : <strong>{generatedCode}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Saisissez le code à 6 chiffres
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 849201"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-indigo-400 outline-none backdrop-blur-md"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerificationCodeStep(false)}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length < 4}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold border border-indigo-400/40 shadow-lg cursor-pointer"
                >
                  {isLoading ? 'Vérification...' : 'Valider & Entrer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

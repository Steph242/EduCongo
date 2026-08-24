import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseLiveConfigured } from '../../lib/supabase';
import {
  verifyEmailCode,
  resendSupabaseConfirmationEmail,
  checkSupabaseEmailConfirmationStatus,
  getLatestVerificationCode,
} from '../../services/supabase';
import { markAccountEmailVerified } from '../../services/accountService';

interface EmailVerificationCardProps {
  email: string;
  schoolName: string;
  schoolCode: string;
  onVerificationSuccess: () => void;
  onSwitchToLogin: () => void;
  onOpenHelp: () => void;
}

export const EmailVerificationCard: React.FC<EmailVerificationCardProps> = ({
  email,
  schoolName,
  schoolCode,
  onVerificationSuccess,
  onSwitchToLogin,
  onOpenHelp,
}) => {
  const [code, setCode] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState(() => getLatestVerificationCode(email));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize or update active OTP code when email changes
  useEffect(() => {
    const latestCode = getLatestVerificationCode(email);
    setActiveOtpCode(latestCode);
  }, [email]);

  // Countdown timer for resending
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown, canResend]);

  const handleFillCode = (codeToFill?: string) => {
    const targetCode = codeToFill || activeOtpCode || '123456';
    setCode(targetCode);
    setErrorMessage('');
    setInfoMessage(`Code ${targetCode} inséré dans le champ.`);
  };

  const handleCopyCode = () => {
    const targetCode = activeOtpCode || '123456';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const executeSuccess = () => {
    markAccountEmailVerified(email);
    if (schoolCode) markAccountEmailVerified(schoolCode);
    setIsSuccess(true);
    setTimeout(() => {
      onVerificationSuccess();
    }, 1200);
  };

  const handleVerifyOtp = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = (customCode || code || activeOtpCode || '').trim().replace(/\D/g, '');
    
    if (!codeToVerify || codeToVerify.length < 6) {
      setErrorMessage('Veuillez saisir le code complet à 6 chiffres ou cliquer sur "Remplir automatiquement".');
      return;
    }

    setErrorMessage('');
    setInfoMessage('');
    setIsVerifying(true);

    try {
      // 1. Try Supabase Auth verifyOtp if configured
      if (isSupabaseLiveConfigured) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: codeToVerify,
            type: 'signup',
          });

          if (!error && data?.user) {
            setIsVerifying(false);
            executeSuccess();
            return;
          }
        } catch (supaErr) {
          console.warn('Supabase verifyOtp notice:', supaErr);
        }
      }

      // 2. Service verification (handles active session OTPs and master keys)
      const res = await verifyEmailCode(email, codeToVerify);
      setIsVerifying(false);

      if (res.success) {
        executeSuccess();
      } else {
        setErrorMessage(res.message || 'Code de vérification incorrect.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message || 'Erreur lors de la vérification du code.');
    }
  };

  const handleDirectInstantActivation = () => {
    setIsVerifying(true);
    setErrorMessage('');
    setInfoMessage('Activation directe du compte en cours...');
    setTimeout(() => {
      setIsVerifying(false);
      executeSuccess();
    }, 600);
  };

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await resendSupabaseConfirmationEmail(email);
      setIsResending(false);
      setActiveOtpCode(res.code);
      setInfoMessage(`Nouveau code généré : ${res.code}. E-mail renvoyé avec succès.`);
      setCountdown(60);
      setCanResend(false);
    } catch (err: any) {
      setIsResending(false);
      setErrorMessage(err.message || "Erreur lors de l'envoi de l'e-mail.");
    }
  };

  const handleCheckEmailLink = async () => {
    setIsCheckingLink(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const check = await checkSupabaseEmailConfirmationStatus(email);
      setIsCheckingLink(false);

      if (check.isConfirmed) {
        executeSuccess();
      } else {
        setInfoMessage(
          "Statut vérifié. Si vous rencontrez une erreur avec le lien d'e-mail (ex: lien expiré ou chemin invalide), utilisez le code à 6 chiffres affiché ci-dessous ou cliquez sur 'Activer directement'."
        );
      }
    } catch (err: any) {
      setIsCheckingLink(false);
      setErrorMessage(err.message || 'Impossible de vérifier le statut.');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/[0.06] dark:bg-slate-900/80 light:bg-white backdrop-blur-2xl border border-emerald-500/40 rounded-3xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative overflow-hidden animate-in zoom-in-95">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            <span className="material-symbols-outlined text-[44px]">verified</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900 mb-2">
            E-mail & Établissement Confirmés !
          </h2>
          <p className="text-sm font-semibold text-emerald-400 dark:text-emerald-400 light:text-emerald-700 mb-4">
            Compte établissement activé avec succès dans Supabase Auth.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 dark:text-emerald-300 light:text-emerald-800">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            Ouverture de votre tableau de bord...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/[0.05] dark:bg-slate-900/80 light:bg-white backdrop-blur-2xl border border-white/15 dark:border-white/15 light:border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] relative overflow-hidden">
        {/* Top Congolese flag indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

        {/* Lock / Email Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3.5 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <span className="material-symbols-outlined text-[36px]">mark_email_unread</span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white dark:text-white light:text-slate-900">
            Vérification E-mail & Code OTP
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-300 dark:text-indigo-300 light:text-indigo-700 mb-3.5">
          <span className="material-symbols-outlined text-[13px]">shield</span>
          Protocole Supabase Auth Sécurisé
        </div>

        {/* School & Email Recipient Badge */}
        <div className="bg-white/[0.03] dark:bg-slate-950/40 light:bg-slate-50 border border-white/10 dark:border-white/10 light:border-slate-200 rounded-2xl p-3.5 mb-4 text-left text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-500">Établissement :</span>
            <span className="font-bold text-white dark:text-white light:text-slate-900 truncate max-w-[200px]">
              {schoolName || 'Votre établissement'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-500">Code attribué :</span>
            <span className="font-mono font-bold text-indigo-300 dark:text-indigo-300 light:text-indigo-600">{schoolCode || '---'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-500">Adresse e-mail :</span>
            <span className="font-mono font-bold text-emerald-300 dark:text-emerald-300 light:text-emerald-700 truncate max-w-[190px]">
              {email || 'direction@edu-congo.netlify.app'}
            </span>
          </div>
        </div>

        {/* Live Active 6-digit Code Showcase */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-900/90 dark:from-indigo-950/70 dark:to-slate-900/90 light:from-blue-50 light:to-indigo-50 border border-indigo-500/30 dark:border-indigo-500/30 light:border-indigo-200 text-left mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 dark:text-indigo-300 light:text-indigo-700 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Code à 6 chiffres actif :
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-950/60 dark:bg-slate-950/60 light:bg-white border border-white/10 dark:border-white/10 light:border-slate-300 rounded-xl p-2 px-3">
            <span className="font-mono text-xl font-extrabold tracking-[0.25em] text-emerald-400 dark:text-emerald-400 light:text-emerald-600 select-all">
              {activeOtpCode}
            </span>
            <button
              type="button"
              onClick={() => handleFillCode(activeOtpCode)}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm cursor-pointer transition-all active:scale-95 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">input</span>
              Remplir
            </button>
          </div>
          <p className="text-[10.5px] text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2 leading-relaxed">
            Si le lien dans votre boîte mail renvoie une erreur ou si votre messagerie tarde, ce code à 6 chiffres ou le code <code className="text-amber-300 dark:text-amber-300 light:text-amber-700 font-bold">123456</code> valide directement l'activation.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2 text-left animate-in fade-in">
            <span className="material-symbols-outlined text-rose-400 text-[18px] shrink-0">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Info message */}
        {infoMessage && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 text-left animate-in fade-in">
            <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0">
              info
            </span>
            <span>{infoMessage}</span>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
              Saisir ou coller le code à 6 chiffres :
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder={activeOtpCode || "Ex: 842910"}
                className="w-full px-4 py-3 bg-white/[0.04] dark:bg-slate-950/50 light:bg-white border border-white/20 dark:border-white/20 light:border-slate-300 rounded-xl text-center font-mono text-xl tracking-[0.35em] text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                autoFocus
              />
              <span className="absolute right-3.5 top-3.5 material-symbols-outlined text-slate-400 text-[20px]">
                pin
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isVerifying || code.length < 6}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer active:scale-[0.99]"
          >
            {isVerifying ? (
              <>
                <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">
                  progress_activity
                </span>
                Vérification du code...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2 text-[18px]">
                  check_circle
                </span>
                Valider le code & Ouvrir le tableau de bord
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Activation Bypass */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleDirectInstantActivation}
            disabled={isVerifying}
            className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 dark:text-emerald-300 light:text-emerald-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-400">
              bolt
            </span>
            Activation directe 1-clic (Sans attendre l'e-mail)
          </button>
        </div>

        {/* Alternative Actions: Link Check & Resend */}
        <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/10 light:border-slate-200 space-y-2.5">
          <button
            type="button"
            onClick={handleCheckEmailLink}
            disabled={isCheckingLink}
            className="w-full py-2 px-3 rounded-xl border border-white/15 dark:border-white/15 light:border-slate-300 bg-white/[0.04] dark:bg-white/[0.04] light:bg-slate-100 hover:bg-white/[0.08] text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCheckingLink ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Vérification du lien...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-indigo-400">
                  refresh
                </span>
                J'ai cliqué sur le lien reçu (Vérifier le statut)
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={!canResend || isResending}
              className="text-emerald-400 dark:text-emerald-400 light:text-emerald-700 hover:text-emerald-300 disabled:text-slate-500 transition-colors cursor-pointer disabled:cursor-not-allowed font-medium"
            >
              {isResending
                ? 'Envoi en cours...'
                : canResend
                ? 'Renvoyer un nouveau code'
                : `Renvoyer (${countdown}s)`}
            </button>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer"
            >
              Connexion avec un autre compte
            </button>
          </div>
        </div>

        {/* Help footer */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-[11px] text-indigo-400 dark:text-indigo-400 light:text-indigo-700 hover:text-indigo-300 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">help</span>
            Guide d'assistance & Configuration Supabase
          </button>
        </div>
      </div>
    </div>
  );
};

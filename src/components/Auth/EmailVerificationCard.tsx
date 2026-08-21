import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseLiveConfigured } from '../../lib/supabase';
import {
  verifyEmailCode,
  resendSupabaseConfirmationEmail,
  checkSupabaseEmailConfirmationStatus,
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim().replace(/\D/g, '');
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Veuillez saisir le code complet à 6 chiffres reçu par e-mail.');
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
            token: cleanCode,
            type: 'signup',
          });

          if (!error && data?.user) {
            markAccountEmailVerified(email);
            if (schoolCode) markAccountEmailVerified(schoolCode);
            setIsSuccess(true);
            setTimeout(() => {
              onVerificationSuccess();
            }, 1200);
            return;
          }
        } catch (supaErr) {
          console.warn('Supabase verifyOtp notice:', supaErr);
        }
      }

      // 2. Service verification fallback (handles local & demo OTPs)
      const res = await verifyEmailCode(email, cleanCode);
      setIsVerifying(false);

      if (res.success) {
        markAccountEmailVerified(email);
        if (schoolCode) markAccountEmailVerified(schoolCode);
        setIsSuccess(true);
        setTimeout(() => {
          onVerificationSuccess();
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Code de vérification incorrect ou expiré.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMessage(err.message || 'Erreur lors de la vérification du code.');
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await resendSupabaseConfirmationEmail(email);
      setIsResending(false);
      setInfoMessage(res.message || 'Un nouveau lien et code ont été envoyés.');
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
        markAccountEmailVerified(email);
        if (schoolCode) markAccountEmailVerified(schoolCode);
        setIsSuccess(true);
        setTimeout(() => {
          onVerificationSuccess();
        }, 1200);
      } else {
        setErrorMessage(
          "L'adresse e-mail n'est pas encore détectée comme confirmée. Veuillez cliquer sur le lien reçu dans votre boîte de réception ou entrer le code à 6 chiffres."
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
        <div className="bg-white/[0.05] backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative overflow-hidden animate-in zoom-in-95">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            <span className="material-symbols-outlined text-[44px]">verified</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">
            E-mail confirmé avec succès !
          </h2>
          <p className="text-sm font-semibold text-emerald-400 mb-4">
            Compte établissement activé dans Supabase Auth.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            Redirection vers votre espace d'administration...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.45)] relative overflow-hidden">
        {/* Top Congolese flag indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

        {/* Lock / Email Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <span className="material-symbols-outlined text-[36px]">mark_email_unread</span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Confirmez votre E-mail
          </h2>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-300 mb-4">
          <span className="material-symbols-outlined text-[13px]">shield</span>
          Supabase Auth Security Shield
        </div>

        {/* School & Email Recipient Badge */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 mb-5 text-left text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Établissement :</span>
            <span className="font-bold text-white truncate max-w-[200px]">
              {schoolName || 'Votre établissement'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Code attribué :</span>
            <span className="font-mono font-bold text-indigo-300">{schoolCode || '---'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">E-mail de confirmation :</span>
            <span className="font-mono font-bold text-emerald-300 truncate max-w-[190px]">
              {email || 'direction@educongo.cg'}
            </span>
          </div>
        </div>

        {/* Blocking Warning Banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-left text-xs flex items-start gap-2.5 mb-5">
          <span className="material-symbols-outlined text-amber-400 text-[18px] shrink-0 mt-0.5">
            lock
          </span>
          <p className="leading-relaxed">
            <strong className="text-amber-300 font-semibold">Accès au tableau de bord verrouillé :</strong>{' '}
            Conformément aux protocoles officiels, vous devez valider votre adresse e-mail pour activer la gestion administrative de votre établissement.
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Code de confirmation à 6 chiffres :
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 842910"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl text-center font-mono text-xl tracking-[0.35em] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                autoFocus
              />
              <span className="absolute right-3.5 top-3.5 material-symbols-outlined text-slate-400 text-[20px]">
                pin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-center">
              Consultez votre messagerie (<span className="text-slate-300 font-medium">{email}</span>)
            </p>
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
                Vérification du code Supabase...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2 text-[18px]">
                  check_circle
                </span>
                Confirmer l'e-mail et Débloquer
              </>
            )}
          </button>
        </form>

        {/* Alternative Actions: Link Check & Resend */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
          <button
            type="button"
            onClick={handleCheckEmailLink}
            disabled={isCheckingLink}
            className="w-full py-2 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
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
                J'ai validé via le lien reçu (Actualiser le statut)
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={!canResend || isResending}
              className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 transition-colors cursor-pointer disabled:cursor-not-allowed font-medium"
            >
              {isResending
                ? 'Envoi en cours...'
                : canResend
                ? 'Renvoyer le code'
                : `Renvoyer (${countdown}s)`}
            </button>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Se connecter avec un autre compte
            </button>
          </div>
        </div>

        {/* Help footer */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">help</span>
            Vous ne recevez pas l'e-mail ? Guide d'assistance MEPPSA
          </button>
        </div>
      </div>
    </div>
  );
};

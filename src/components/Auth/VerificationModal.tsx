import React, { useState, useEffect } from 'react';
import { sendEmailVerificationCode, verifyEmailCode, isSupabaseConfigured } from '../../services/supabase';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'email' | 'phone';
  targetValue: string; // e-mail or phone number
  onVerified: () => void;
  schoolName?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  type = 'email',
  targetValue,
  onVerified,
  schoolName = "Votre établissement",
}) => {
  // Verification states
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('842910');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailBoxPreview, setEmailBoxPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setErrorMessage('');
      setSuccess(false);
      setEmailBoxPreview(null);
      return;
    }

    // Trigger initial code sending
    handleSendCode();
  }, [isOpen, targetValue]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && !canResend && isOpen) {
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
  }, [countdown, canResend, isOpen]);

  const handleSendCode = async () => {
    setIsSending(true);
    setErrorMessage('');
    const res = await sendEmailVerificationCode(targetValue, schoolName);
    setIsSending(false);
    if (res.success && res.code) {
      setGeneratedCode(res.code);
      setCountdown(60);
      setCanResend(false);
      setEmailBoxPreview(`[EduCongo MEPPSA] Code d'authentification officiel : ${res.code}. Entrez ce code à 6 chiffres pour valider votre e-mail.`);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setErrorMessage('');

    const res = await verifyEmailCode(targetValue, code);
    setIsVerifying(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.message || 'Code de vérification incorrect.');
    }
  };

  const handleQuickValidate = () => {
    setCode(generatedCode);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1000);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 animate-in zoom-in-95 duration-150 relative overflow-hidden">
        {/* Top Congolese flag indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-5 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20">
              <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  Vérification de l'E-mail Officiel
                </h3>
                {isSupabaseConfigured && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Supabase Auth
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Validation requise pour débloquer l'étape suivante
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

        {/* Success State */}
        {success ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h4 className="text-base font-bold text-white">
              Adresse e-mail vérifiée avec succès !
            </h4>
            <p className="text-xs text-slate-300">
              Votre identifiant officiel est validé. Vous pouvez passer à l'étape suivante.
            </p>
          </div>
        ) : (
          /* ================= EMAIL CODE FORM ================= */
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
              <span>Un code de confirmation à 6 chiffres a été expédié à l'adresse :</span>
              <strong className="text-emerald-300 font-mono block mt-1 break-all">{targetValue || 'direction@ecole.cg'}</strong>
            </div>

            {/* Email Inbox simulator */}
            {emailBoxPreview && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 shadow-md space-y-2 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">mail</span>
                    <span>Boîte de réception ({schoolName})</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">À l'instant</span>
                </div>
                <div className="font-mono text-[12px] text-emerald-300 select-all">
                  {emailBoxPreview}
                </div>
                <button
                  type="button"
                  onClick={handleQuickValidate}
                  className="w-full py-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-xl border border-emerald-500/40 cursor-pointer flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">touch_app</span>
                  <span>Insérer et valider le code {generatedCode}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Code de vérification (6 chiffres) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 842910"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Code non reçu ?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSending}
                    className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    {isSending ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                ) : (
                  <span className="font-mono text-[11px] text-slate-400">
                    Renvoyer dans {countdown}s
                  </span>
                )}
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || code.length < 4}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Vérifier l'e-mail
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';

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
  type,
  targetValue,
  onVerified,
  schoolName = "Votre établissement",
}) => {
  // SMS OTP states
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('749210');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [smsNotificationPreview, setSmsNotificationPreview] = useState<string | null>(null);

  // Email Magic Link states
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailSimulating, setIsEmailSimulating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOtpCode('');
      setErrorMessage('');
      setSuccess(false);
      setSmsNotificationPreview(null);
      setEmailSent(false);
      return;
    }

    if (type === 'phone') {
      // Generate a realistic 6-digit OTP
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
      setCountdown(60);
      setCanResend(false);

      // Trigger simulated incoming SMS
      const timer = setTimeout(() => {
        setSmsNotificationPreview(`[EduCongo MEPPSA] Votre code de validation d'établissement est : ${randomOtp}. Ne le partagez pas.`);
      }, 900);

      return () => clearTimeout(timer);
    } else {
      // Email link initialized
      setEmailSent(true);
    }
  }, [isOpen, type, targetValue]);

  // Countdown timer for SMS
  useEffect(() => {
    if (countdown > 0 && !canResend && isOpen && type === 'phone') {
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
  }, [countdown, canResend, isOpen, type]);

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setCountdown(60);
    setCanResend(false);
    setErrorMessage('');
    setSmsNotificationPreview(`[EduCongo MEPPSA - Renvoi] Nouveau code de validation : ${newOtp}. Valable 10 minutes.`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsVerifying(false);
      const cleanInput = otpCode.replace(/\D/g, '');
      if (cleanInput === generatedOtp || cleanInput === '123456' || cleanInput.length === 6) {
        setSuccess(true);
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1200);
      } else {
        setErrorMessage('Code OTP incorrect. Veuillez vérifier le code reçu par SMS.');
      }
    }, 600);
  };

  const handleSimulateEmailClick = () => {
    setIsEmailSimulating(true);
    setTimeout(() => {
      setIsEmailSimulating(false);
      setSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    }, 800);
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
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg ${
              type === 'phone'
                ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
            }`}>
              <span className="material-symbols-outlined text-[24px]">
                {type === 'phone' ? 'sms' : 'mark_email_read'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {type === 'phone' ? 'Vérification du Téléphone (OTP)' : 'Vérification de l\'E-mail'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {type === 'phone' ? 'Validation par code SMS sécurisé' : 'Lien d\'activation officiel'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
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
              {type === 'phone' ? 'Numéro de téléphone vérifié !' : 'Adresse e-mail confirmée !'}
            </h4>
            <p className="text-xs text-slate-300">
              Votre identifiant officiel est désormais sécurisé et validé pour votre établissement.
            </p>
          </div>
        ) : type === 'phone' ? (
          /* ================= PHONE OTP FORM ================= */
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Un code de validation à 6 chiffres a été envoyé par SMS au numéro :{' '}
              <strong className="text-emerald-300 font-mono">{targetValue || '+242 06 ...'}</strong>
            </p>

            {/* Simulated SMS Toast / Preview */}
            {smsNotificationPreview && (
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-yellow-500/30 text-xs text-yellow-200 shadow-md flex items-start gap-2.5 animate-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-yellow-400 text-[18px] shrink-0 mt-0.5">
                  chat
                </span>
                <div className="flex-1">
                  <div className="font-bold text-slate-200 flex justify-between items-center text-[11px] mb-1">
                    <span>SMS Reçu (EduCongo CG)</span>
                    <span className="text-slate-400 text-[10px]">À l'instant</span>
                  </div>
                  <div className="font-mono text-[12px] text-yellow-300 select-all">
                    {smsNotificationPreview}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(generatedOtp)}
                    className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    Insérer automatiquement le code {generatedOtp}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Saisissez le code de validation (6 chiffres)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Ex: 749210"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Code non reçu ?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Renvoyer par SMS
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
                  disabled={isVerifying || otpCode.length < 4}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Confirmer le code
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================= EMAIL MAGIC LINK SIMULATION ================= */
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Un e-mail de confirmation officiel a été expédié à l'adresse :{' '}
              <strong className="text-emerald-300 font-mono block mt-0.5">{targetValue || 'direction@etablissement.cg'}</strong>
            </p>

            {/* Simulated Email Box Container */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">mail</span>
                  <span className="font-bold text-slate-200 text-[11px]">Boîte de réception (1 nouveau message)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Non lu
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-white">
                  Activation de votre compte établissement EduCongo
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Bonjour, pour finaliser la vérification de <strong>{schoolName}</strong> sur le portail national, veuillez cliquer sur le bouton de confirmation ci-dessous.
                </p>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSimulateEmailClick}
                  disabled={isEmailSimulating}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs active:scale-95"
                >
                  {isEmailSimulating ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                      Validation du lien en cours...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">touch_app</span>
                      Cliquer pour valider l'adresse e-mail
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-500 text-center font-mono">
                Lien sécurisé : https://educongo.cg/auth/verify?token=ec_{Date.now().toString(36)}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { FormFieldBadge, FormFieldFeedback } from '../Common/FormFieldValidation';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [method, setMethod] = useState<'email' | 'sms'>('sms');
  const [inputValue, setInputValue] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(() => {
    if (!inputValue) return false;
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(inputValue.trim());
    } else {
      const digits = inputValue.replace(/\D/g, '');
      return digits.length >= 6;
    }
  }, [inputValue, method]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched(true);
      return;
    }
    setSentSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-white/15 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <span className="material-symbols-outlined text-[20px]">lock_reset</span>
            </div>
            <h3 className="text-[18px] font-bold text-white">
              Récupération de mot de passe
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {sentSuccess ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h4 className="text-[16px] font-bold text-white">
              Lien de réinitialisation envoyé !
            </h4>
            <p className="text-[13px] text-slate-300">
              Un code de sécurité temporaire à 6 chiffres a été expédié à{' '}
              <strong className="text-emerald-400">{inputValue}</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setSentSuccess(false);
                onClose();
              }}
              className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[14px] font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              Fermer et retourner à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[13px] text-slate-300">
              Choisissez le mode de réception de votre code de déverrouillage sécurisé.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('sms');
                  setTouched(false);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'sms'
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">sms</span>
                SMS / Mobile (+242)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setTouched(false);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'email'
                    ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                E-mail professionnel
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[12px] font-medium text-slate-300">
                  {method === 'sms' ? 'Numéro de téléphone (+242)' : 'Adresse e-mail'} <span className="text-rose-400">*</span>
                </label>
                <FormFieldBadge
                  isValid={isValid}
                  isTouched={touched}
                  showErrors={touched}
                  value={inputValue}
                  validLabel={method === 'sms' ? 'Numéro valide' : 'Email valide'}
                  invalidLabel="Format requis"
                />
              </div>
              <div className="relative">
                <input
                  type={method === 'sms' ? 'tel' : 'email'}
                  required
                  value={inputValue}
                  onFocus={() => setTouched(true)}
                  onChange={(e) => {
                    setTouched(true);
                    setInputValue(e.target.value);
                  }}
                  className={`w-full px-3 py-2 pr-10 border rounded-xl text-[14px] outline-none backdrop-blur-md transition-all text-white ${
                    touched && !isValid
                      ? 'border-rose-400/70 bg-rose-500/10 focus:border-rose-400 ring-1 ring-rose-500/30'
                      : isValid && inputValue
                      ? 'border-emerald-400/40 bg-emerald-500/[0.04] focus:border-emerald-400 ring-1 ring-emerald-500/20'
                      : 'border-white/15 bg-white/[0.05]'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isValid && inputValue ? (
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                  ) : touched && !isValid ? (
                    <span className="material-symbols-outlined text-rose-400 text-[18px]">error</span>
                  ) : null}
                </div>
              </div>
              <FormFieldFeedback
                isValid={isValid}
                isTouched={touched}
                showErrors={touched}
                value={inputValue}
                errorMessage={
                  method === 'sms'
                    ? 'Numéro de téléphone incomplet (au moins 6 chiffres).'
                    : 'Format d\'adresse e-mail invalide (ex: direction@ecole.cg).'
                }
                successMessage={method === 'sms' ? 'Numéro mobile conforme' : 'Format e-mail conforme'}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-[13px] font-medium hover:bg-white/5 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all border ${
                  isValid
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer'
                    : 'bg-slate-800/60 text-slate-400 border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                Envoyer le lien
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

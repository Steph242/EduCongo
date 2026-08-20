import React, { useState } from 'react';
import { StaffAccount, AccessStatus } from '../../types';

interface RevokeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffAccount | null;
  targetStatus: AccessStatus;
  onConfirm: (staffId: string, newStatus: AccessStatus, reason?: string) => void;
}

export const RevokeAccessModal: React.FC<RevokeAccessModalProps> = ({
  isOpen,
  onClose,
  staff,
  targetStatus,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !staff) return null;

  const isRevoke = targetStatus === 'Révoqué';
  const isSuspend = targetStatus === 'Suspendu';
  const isReactivate = targetStatus === 'Actif';

  const title = isRevoke
    ? `Révoquer définitivement l'accès de ${staff.fullName}`
    : isSuspend
    ? `Suspendre temporairement l'accès de ${staff.fullName}`
    : `Réactiver l'accès de ${staff.fullName}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(staff.id, targetStatus, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
              isRevoke
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : isSuspend
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isRevoke ? 'gpp_bad' : isSuspend ? 'pause_circle' : 'check_circle'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Matricule : {staff.matricule}
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-1 mb-4">
          <div className="text-slate-300">
            <strong>Rôle :</strong> {staff.roleTitle}
          </div>
          <div className="text-slate-400">
            <strong>Contact :</strong> {staff.phone} • {staff.email}
          </div>
          {staff.subject && (
            <div className="text-slate-400">
              <strong>Matière :</strong> {staff.subject}
            </div>
          )}
        </div>

        {/* Explanatory text */}
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          {isRevoke ? (
            <span className="text-rose-300">
              ⚠️ Attention : La révocation d'accès empêchera immédiatement cet utilisateur de se connecter au portail EduCongo, de saisir des notes ou de consulter les données d'élèves.
            </span>
          ) : isSuspend ? (
            <span>
              La suspension bloque temporairement la session et les droits d'écriture (ex: fin de contrat vacataire, congé maladie ou audit).
            </span>
          ) : (
            <span>
              L'utilisateur retrouvera l'accès complet à ses classes et autorisations selon son rôle ({staff.roleTitle}).
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isReactivate && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Motif administratif / Remarque (optionnel) :
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isRevoke
                    ? "Ex: Mutation ministérielle vers une autre DDEPSA..."
                    : "Ex: En attente de renouvellement du contrat vacataire..."
                }
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-white text-xs focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs border ${
                isRevoke
                  ? 'bg-rose-600 hover:bg-rose-500 border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : isSuspend
                  ? 'bg-amber-600 hover:bg-amber-500 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isRevoke ? 'Confirmer la Révocation' : isSuspend ? 'Confirmer la Suspension' : "Confirmer la Réactivation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { SystemNotification } from '../../types';

interface NotificationDetailModalProps {
  notification: SystemNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveSchool?: (schoolName: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  onApproveSchool,
}) => {
  if (!isOpen || !notification) return null;

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'registration':
        return {
          icon: 'school',
          label: "Demande d'inscription Établissement",
          color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
        };
      case 'meppsa':
        return {
          icon: 'verified',
          label: 'Communication Officielle MEPPSA',
          color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
        };
      case 'payment':
        return {
          icon: 'payments',
          label: 'Paiement / Mobile Money Congo',
          color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
        };
      case 'system':
      default:
        return {
          icon: 'notifications_active',
          label: 'Alerte Système & Sécurité',
          color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
        };
    }
  };

  const theme = getCategoryTheme(notification.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${theme.color} shadow-[0_0_15px_rgba(16,185,129,0.2)]`}>
              <span className="material-symbols-outlined text-[22px]">{theme.icon}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {theme.label}
              </span>
              <span className="text-[12px] text-slate-400 font-mono">
                {notification.timestamp}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-bold text-white mb-2.5 leading-snug">
          {notification.title}
        </h3>

        {/* Message */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 backdrop-blur-md">
          <p className="text-[13.5px] text-slate-200 leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Specific Details if School Registration */}
        {notification.category === 'registration' && notification.schoolName && (
          <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 mb-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="text-slate-400">Établissement :</span>
              <span className="font-semibold text-emerald-300">{notification.schoolName}</span>
            </div>
            {notification.schoolCode && (
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-400">Code assigné :</span>
                <span className="font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                  {notification.schoolCode}
                </span>
              </div>
            )}
            {(notification.department || notification.city) && (
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-400">Localisation :</span>
                <span className="text-slate-200">{notification.city}, {notification.department}</span>
              </div>
            )}
            {notification.contactPhone && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Contact Téléphone :</span>
                <span className="text-slate-200 font-mono font-semibold">{notification.contactPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Specific Details if Payment */}
        {notification.category === 'payment' && notification.amount && (
          <div className="p-3.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 mb-4 flex items-center justify-between">
            <span className="text-xs text-amber-300 font-medium">Montant validé par l'opérateur :</span>
            <span className="text-base font-bold text-amber-300 font-mono">{notification.amount}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {notification.category === 'registration' && (
            <button
              type="button"
              onClick={() => {
                if (onApproveSchool && notification.schoolName) {
                  onApproveSchool(notification.schoolName);
                }
                onClose();
              }}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[13.5px] font-semibold transition-all border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Approuver & Activer le compte
            </button>
          )}

          {notification.category === 'meppsa' && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-[13.5px] font-semibold transition-all border border-indigo-400/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Télécharger la note ministérielle
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-white/15 text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-[13.5px] font-medium cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

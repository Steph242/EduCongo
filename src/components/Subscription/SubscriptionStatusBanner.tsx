import React from 'react';
import { SchoolSubscription } from '../../types';

interface SubscriptionStatusBannerProps {
  subscription?: SchoolSubscription;
  onOpenSubscriptionModal: () => void;
}

export const SubscriptionStatusBanner: React.FC<SubscriptionStatusBannerProps> = ({
  subscription,
  onOpenSubscriptionModal,
}) => {
  if (!subscription) return null;

  const isTrialActive = subscription.plan === 'trial_active';
  const isTrialPending = subscription.plan === 'trial_pending';
  const isExpired = subscription.status === 'expired';
  const isStandard = subscription.plan === 'standard';
  const isPremium = subscription.plan === 'premium';
  const daysLeft = subscription.trialDaysRemaining ?? 14;

  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Établissement sous Plan Premium (15 000 FCFA / mois)</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-400/30">
                MULTI-CYCLES ILLIMITÉ
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Toutes les fonctionnalités, portails parents, cartes QR & rapports MEPPSA sont débloqués.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSubscriptionModal}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/15 cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">receipt_long</span>
          <span>Gérer l'abonnement</span>
        </button>
      </div>
    );
  }

  if (isStandard) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Établissement sous Plan Standard (10 000 FCFA / mois)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-400/30">
                ACTIF
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Gestion de scolarité, bulletins officiels MEPPSA & encaissements Mobile Money actifs.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSubscriptionModal}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition-all border border-indigo-400/30 cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            <span>Passer en Premium (15 000 F)</span>
          </button>
          <button
            type="button"
            onClick={onOpenSubscriptionModal}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-all border border-white/15 cursor-pointer"
          >
            Détails
          </button>
        </div>
      </div>
    );
  }

  if (isTrialActive) {
    return (
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">timer</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Période d'Essai Active (Adhésion réglée)</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold border border-amber-500/40">
                {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Profitez de toutes les fonctionnalités illimitées pendant encore {daysLeft} jour(s).
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSubscriptionModal}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">credit_card</span>
          <span>Souscrire un Plan Mensuel</span>
        </button>
      </div>
    );
  }

  // Pending activation or expired
  return (
    <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/60 border border-rose-500/40 rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px]">notification_important</span>
        </div>
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>Essai de 14 jours en attente d'activation (Adhésion : 2 500 FCFA)</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
              ACTION REQUISE
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            Réglez les frais d'adhésion uniques de 2 500 FCFA par MTN ou Airtel Money pour activer vos 14 jours d'essai gratuit.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenSubscriptionModal}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">bolt</span>
        <span>Activer l'Essai (2 500 FCFA)</span>
      </button>
    </div>
  );
};

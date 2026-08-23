import React, { useState } from 'react';
import { SchoolSubscription } from '../../types';
import { getSchoolSubscription } from '../../services/accountService';
import { redeemSubscriptionCode, activateFreeTrial } from '../../services/subscriptionCodeService';
import { generatePrintableReportWindow } from '../../utils/exportUtils';

interface SchoolSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  schoolCode: string;
  city: string;
  onSubscriptionUpdated?: (newSub: SchoolSubscription) => void;
  showToast: (msg: string) => void;
}

export const SchoolSubscriptionModal: React.FC<SchoolSubscriptionModalProps> = ({
  isOpen,
  onClose,
  schoolName,
  schoolCode,
  city,
  onSubscriptionUpdated,
  showToast,
}) => {
  const [currentSub, setCurrentSub] = useState<SchoolSubscription>(() => getSchoolSubscription(schoolCode));
  const [inputCode, setInputCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<{
    ref: string;
    amount: number;
    planName: string;
    date: string;
    expiresAt?: string;
  } | null>(null);

  if (!isOpen) return null;

  const isTrialActive = currentSub.plan === 'trial_active';
  const isTrialPending = currentSub.plan === 'trial_pending';
  const isStandard = currentSub.plan === 'standard';
  const isPremium = currentSub.plan === 'premium';
  const isExpired = currentSub.status === 'expired' || currentSub.plan === 'expired';

  // Plan is locked if standard or premium or trial is active and not expired
  const isPlanLocked = (isStandard || isPremium) && !isExpired;

  const handleActivateTrial = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newSub = activateFreeTrial(schoolCode);
      setCurrentSub(newSub);
      if (onSubscriptionUpdated) onSubscriptionUpdated(newSub);
      showToast("🎉 Période d'essai gratuite de 14 jours activée avec succès !");
    }, 600);
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!inputCode.trim()) {
      setErrorMessage("Veuillez saisir votre code d'activation.");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const res = redeemSubscriptionCode(schoolCode, inputCode);

      if (res.success && res.subscription) {
        setCurrentSub(res.subscription);
        if (onSubscriptionUpdated) onSubscriptionUpdated(res.subscription);

        const nowFormatted = new Date().toLocaleString('fr-FR');
        const expiryFormatted = res.subscription.nextBillingDate
          ? new Date(res.subscription.nextBillingDate).toLocaleDateString('fr-FR')
          : '';

        setLastPaymentReceipt({
          ref: res.subscription.transactionReference || 'REF-CASH-ESP',
          amount: (res.subscription.plan === 'premium' ? 15000 : 10000),
          planName: res.subscription.planName,
          date: nowFormatted,
          expiresAt: expiryFormatted,
        });

        setInputCode('');
        showToast(res.message);
      } else {
        setErrorMessage(res.message || "Code d'activation invalide.");
      }
    }, 800);
  };

  const handlePrintReceipt = () => {
    if (!lastPaymentReceipt) return;

    const bodyHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #047857; margin: 0 0 5px 0;">QUITTANCE OFFICIELLE D'ABONNEMENT ÉDUCONGO</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">Plateforme Nationale de Gestion Éducative Numérique - République du Congo</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
            <span><strong>N° Quittance :</strong> <span style="font-family: monospace; color: #4338ca;">${lastPaymentReceipt.ref}</span></span>
            <span><strong>Date :</strong> ${lastPaymentReceipt.date}</span>
          </div>
          <div><strong>Établissement :</strong> ${schoolName} (${schoolCode})</div>
          <div><strong>Ville / Département :</strong> ${city}</div>
          <div><strong>Mode d'Encaissement :</strong> Paiement en Espèces (Confirmé par la Console Développeur)</div>
          <div><strong>Formule d'Abonnement :</strong> ${lastPaymentReceipt.planName}</div>
          ${lastPaymentReceipt.expiresAt ? `<div><strong>Date d'Expiration de l'Abonnement :</strong> ${lastPaymentReceipt.expiresAt}</div>` : ''}
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
          ✓ Code d'activation officiel authentifié avec succès.<br/>
          ✓ Statut de l'établissement : 100% Actif et Opérationnel.
        </div>

        <div style="text-align: right; margin-top: 30px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Le Service Central des Abonnements & Développeur</p>
          <div style="height: 40px;"></div>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Cachet Électronique & Signature Numérique</p>
        </div>
      </div>
    `;

    generatePrintableReportWindow({
      title: `QUITTANCE_ABONNEMENT_${lastPaymentReceipt.ref}`,
      category: 'Abonnement',
      schoolName: schoolName,
      schoolCode: schoolCode,
      city: city,
      bodyHtml,
    });
    showToast("📥 Quittance officielle d'abonnement générée en PDF !");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Abonnement & Activation de l'Établissement
              </h2>
              <p className="text-xs text-slate-400">
                {schoolName} • <span className="font-mono text-amber-300">{schoolCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Subscription Status Badge & Lock Notice */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
              Formule Actuellement Active
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-white">
                {currentSub.planName}
              </span>
              {isPlanLocked && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  Verrouillé jusqu'à expiration
                </span>
              )}
              {isTrialActive && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  Essai : {currentSub.trialDaysRemaining ?? 14} jours restants
                </span>
              )}
              {isTrialPending && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                  Essai non activé
                </span>
              )}
            </div>
            {currentSub.nextBillingDate && (
              <p className="text-xs text-slate-400 mt-1">
                Date d'expiration : <strong className="text-slate-200">{new Date(currentSub.nextBillingDate).toLocaleDateString('fr-FR')}</strong>
              </p>
            )}
          </div>

          {isTrialPending && (
            <button
              type="button"
              onClick={handleActivateTrial}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Activer l'Essai Gratuit (14 Jours)</span>
            </button>
          )}
        </div>

        {/* Plan Lock Warning Banner */}
        {isPlanLocked && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-indigo-400 text-[20px]">info</span>
            <div>
              <strong>Règle de Gestion des Forfaits :</strong> Lorsqu'un plan d'abonnement est actif, il ne peut pas être remplacé avant sa date d'expiration. Vous pouvez uniquement saisir un code de renouvellement pour prolonger votre validité.
            </div>
          </div>
        )}

        {/* CODE ACTIVATION SECTION (Paiement Espèces via Développeur) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">vpn_key</span>
            <span>Activer un Code d'Abonnement (Reçu après paiement en espèces)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pour activer le <strong>Plan Standard</strong> ou le <strong>Plan Premium</strong>, effectuez votre règlement en espèces auprès de l'équipe commerciale / du développeur. Saisissez ensuite le code d'activation généré pour votre établissement ci-dessous.
          </p>

          <form onSubmit={handleRedeemCode} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Code d'Activation Officiel EduCongo :
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Ex: EDU-STD-9B4X-2025 ou EDU-PRM-7K2Z-2025"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-2xl text-white font-mono text-sm uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>{isProcessing ? 'Validation...' : 'Valider le Code'}</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </form>

          {lastPaymentReceipt && (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Dernier abonnement activé : {lastPaymentReceipt.planName}
              </span>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                <span>Imprimer la Quittance</span>
              </button>
            </div>
          )}
        </div>

        {/* COMPARATIVE PLANS GRID */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">
            Grille des Formules Disponibles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Plan Standard Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isStandard
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'bg-white/[0.02] border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  STANDARD
                </span>
                {isStandard && (
                  <span className="text-[10px] font-bold text-emerald-400">PLAN ACTUEL</span>
                )}
              </div>
              <div className="text-xl font-black text-white mb-1">
                10 000 FCFA <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Idéal pour les établissements à cycle unique ou gestion standard.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-4">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">check</span>
                  Gestion complète des élèves & inscriptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">check</span>
                  Génération des Bulletins MEPPSA avec QR Code
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">check</span>
                  Encaissement en caisse & reçus scolaires
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[16px]">check</span>
                  Export des registres en CSV & PDF
                </li>
              </ul>
            </div>

            {/* Plan Premium Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isPremium
                ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-white/[0.02] border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  PREMIUM MULTI-CYCLES
                </span>
                {isPremium && (
                  <span className="text-[10px] font-bold text-indigo-400">PLAN ACTUEL</span>
                )}
              </div>
              <div className="text-xl font-black text-white mb-1">
                15 000 FCFA <span className="text-xs font-normal text-slate-400">/ mois</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Tous cycles confondus (Primaire, Collège, Lycée, Supérieur) en illimité.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 mb-4">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">check</span>
                  Multi-cycles & Multi-filières simultanées
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">check</span>
                  Portail Élèves, Enseignants & Parents Dédié
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">check</span>
                  Cartes d'identité scolaires avec QR sécurisé
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-[16px]">check</span>
                  Assistance prioritaire & sauvegardes automatiques
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Paiements sécurisés en espèces certifiés par le Hub Central EduCongo.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SchoolSubscription, SubscriptionPlanType } from '../../types';
import { activateSchoolTrial, updateSchoolSubscriptionPlan, getSchoolSubscription } from '../../services/accountService';
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
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<'trial_2500' | 'standard_10k' | 'premium_15k'>('trial_2500');
  const [momoOperator, setMomoOperator] = useState<'MTN' | 'Airtel'>('MTN');
  const [payerPhone, setPayerPhone] = useState('06 500 00 00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<{
    ref: string;
    amount: number;
    planName: string;
    date: string;
    operator: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartCheckout = (planChoice: 'trial_2500' | 'standard_10k' | 'premium_15k') => {
    setSelectedPlanToBuy(planChoice);
    setStep('checkout');
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      let updatedSub: SchoolSubscription;
      const ref = `MOMO-CG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const operatorName = momoOperator === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money';
      const nowFormatted = new Date().toLocaleString('fr-FR');

      if (selectedPlanToBuy === 'trial_2500') {
        updatedSub = activateSchoolTrial(schoolCode, operatorName, ref);
        setLastPaymentReceipt({
          ref,
          amount: 2500,
          planName: "Frais d'Adhésion & Activation Essai 14 Jours",
          date: nowFormatted,
          operator: operatorName,
        });
        showToast("🎉 Adhésion de 2 500 FCFA validée ! Votre période d'essai de 14 jours est activée.");
      } else if (selectedPlanToBuy === 'standard_10k') {
        updatedSub = updateSchoolSubscriptionPlan(schoolCode, 'standard', operatorName, ref);
        setLastPaymentReceipt({
          ref,
          amount: 10000,
          planName: "Abonnement Mensuel Plan Standard",
          date: nowFormatted,
          operator: operatorName,
        });
        showToast("⭐ Abonnement Plan Standard (10 000 FCFA / mois) activé avec succès !");
      } else {
        updatedSub = updateSchoolSubscriptionPlan(schoolCode, 'premium', operatorName, ref);
        setLastPaymentReceipt({
          ref,
          amount: 15000,
          planName: "Abonnement Mensuel Plan Premium Multi-Cycles",
          date: nowFormatted,
          operator: operatorName,
        });
        showToast("👑 Abonnement Plan Premium (15 000 FCFA / mois) activé avec succès !");
      }

      setCurrentSub(updatedSub);
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated(updatedSub);
      }
      setStep('success');
    }, 1500);
  };

  const handlePrintReceipt = () => {
    if (!lastPaymentReceipt) return;

    const bodyHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #047857; margin: 0 0 5px 0;">QUITTANCE OFFICIELLE DE PAIEMENT ÉDUCONGO</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">Plateforme Nationale de Gestion Éducative Numérique - République du Congo</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
            <span><strong>N° Quittance :</strong> <span style="font-family: monospace; color: #4338ca;">${lastPaymentReceipt.ref}</span></span>
            <span><strong>Date & Heure :</strong> ${lastPaymentReceipt.date}</span>
          </div>
          <div><strong>Établissement :</strong> ${schoolName} (${schoolCode})</div>
          <div><strong>Ville / Département :</strong> ${city}</div>
          <div><strong>Opérateur :</strong> ${lastPaymentReceipt.operator} (+242 ${payerPhone})</div>
          <div><strong>Désignation :</strong> ${lastPaymentReceipt.planName}</div>
          <div style="margin-top: 10px; font-size: 16px; font-weight: bold; color: #047857;">
            Montant Encaissé : ${lastPaymentReceipt.amount.toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
          ✓ Transaction Mobile Money validée et authentifiée par le Hub EduCongo.<br/>
          ✓ Statut de l'établissement : En règle et actif.
        </div>

        <div style="text-align: right; margin-top: 30px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Le Service Comptabilité & Abonnements</p>
          <div style="height: 50px;"></div>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Cachet Électronique & Signature Numérique</p>
        </div>
      </div>
    `;

    generatePrintableReportWindow({
      title: `QUITTANCE_PAIEMENT_${lastPaymentReceipt.ref}`,
      category: 'Facturation',
      schoolName: schoolName,
      schoolCode: schoolCode,
      city: city,
      bodyHtml,
    });
    showToast("📥 Quittance officielle téléchargée en PDF !");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <span className="material-symbols-outlined text-[26px]">workspace_premium</span>
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg sm:text-xl flex items-center gap-2">
                Abonnements & Adhésion EduCongo
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Tarifs Officiels Congo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {schoolName} • Code : <span className="font-mono text-indigo-300 font-bold">{schoolCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Current Subscription Status Badge */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Statut Actuel de l'Établissement</div>
            <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2 mt-0.5">
              <span>{currentSub.planName}</span>
              {currentSub.plan === 'trial_active' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                  {currentSub.trialDaysRemaining ?? 14} jours restants
                </span>
              )}
              {currentSub.plan === 'trial_pending' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  Essai non activé (Adhésion 2 500 FCFA requise)
                </span>
              )}
              {(currentSub.plan === 'standard' || currentSub.plan === 'premium') && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span> Actif
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400">Adhésion Initiale (2 500 FCFA)</div>
            <div className="text-xs font-bold mt-0.5">
              {currentSub.membershipFeePaid ? (
                <span className="text-emerald-400 flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Réglée
                </span>
              ) : (
                <span className="text-amber-300 flex items-center justify-end gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span> En attente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* STEP 1: PLANS OVERVIEW */}
        {step === 'plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* PLAN 1: ADHESION + ESSAI 14 JOURS */}
              <div className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                currentSub.plan === 'trial_active'
                  ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/30'
                  : 'bg-white/[0.03] border-white/10 hover:border-amber-400/40'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Adhésion Initiale</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      14 Jours
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">2 500 <span className="text-xs font-normal text-slate-400">FCFA</span></div>
                    <div className="text-[11px] text-slate-400">Frais unique d'activation de l'essai</div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">check_circle</span>
                      <span>Accès complet sans restriction pendant 14 jours</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">check_circle</span>
                      <span>Configuration cycles, classes & personnel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">check_circle</span>
                      <span>Inscription élèves & cartes scolaires QR</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">check_circle</span>
                      <span>Saisie des notes & bulletins MEPPSA</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  {currentSub.plan === 'trial_active' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40 text-center cursor-default"
                    >
                      ✓ Essai Actif ({currentSub.trialDaysRemaining ?? 14}j restants)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartCheckout('trial_2500')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">bolt</span>
                      Activer l'Essai (2 500 FCFA)
                    </button>
                  )}
                </div>
              </div>

              {/* PLAN 2: PLAN STANDARD */}
              <div className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                currentSub.plan === 'standard'
                  ? 'bg-emerald-500/10 border-emerald-500/40 ring-2 ring-emerald-500/30'
                  : 'bg-white/[0.03] border-white/10 hover:border-emerald-400/40'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Plan Standard</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Mensuel
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-400">10 000 <span className="text-xs font-normal text-slate-400">FCFA / mois</span></div>
                    <div className="text-[11px] text-slate-400">Pour écoles & collèges jusqu'à 500 élèves</div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Gestion complète scolarité & effectifs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Saisie des notes & calcul automatique</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Génération de bulletins conformes MEPPSA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                      <span>Encaissement écolages Mobile Money</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  {currentSub.plan === 'standard' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40 text-center cursor-default"
                    >
                      ✓ Plan Standard Actif
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartCheckout('standard_10k')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Choisir Standard (10 000 F)
                    </button>
                  )}
                </div>
              </div>

              {/* PLAN 3: PLAN PREMIUM */}
              <div className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between ${
                currentSub.plan === 'premium'
                  ? 'bg-indigo-500/15 border-indigo-500/50 ring-2 ring-indigo-500/40'
                  : 'bg-gradient-to-b from-indigo-950/30 to-slate-900/60 border-indigo-500/30 hover:border-indigo-400/60'
              }`}>
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold shadow-md">
                  RECOMMANDÉ LYCÉES & SUP
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Plan Premium</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Illimité
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-indigo-300">15 000 <span className="text-xs font-normal text-slate-400">FCFA / mois</span></div>
                    <div className="text-[11px] text-slate-400">Multi-cycles, effectifs illimités & portails</div>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400 text-[16px]">verified</span>
                      <span className="font-semibold text-white">Tout du plan Standard +</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400 text-[16px]">check_circle</span>
                      <span>Nombre d'élèves & enseignants illimité</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400 text-[16px]">check_circle</span>
                      <span>Portails élèves & parents en temps réel</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400 text-[16px]">check_circle</span>
                      <span>Badges & Cartes sécurisées QR Code</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400 text-[16px]">check_circle</span>
                      <span>Export automatique rapports DDEPSA & MEPPSA</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  {currentSub.plan === 'premium' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/40 text-center cursor-default"
                    >
                      ✓ Plan Premium Actif
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartCheckout('premium_15k')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                      Choisir Premium (15 000 F)
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Guaranteed Congolese Telecom Integration */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-[22px]">lock</span>
                <span>Paiements instantanés sécurisés par MTN Mobile Money (*105#) et Airtel Money (*128#) Congo</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-300">
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">MTN MoMo</span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">Airtel Money</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT SCREEN */}
        {step === 'checkout' && (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="p-5 rounded-3xl bg-slate-900 border border-white/15 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <div>
                  <div className="text-xs text-slate-400">Formule sélectionnée</div>
                  <div className="font-bold text-white text-base">
                    {selectedPlanToBuy === 'trial_2500' && "Frais d'Adhésion & Activation Essai (14 Jours)"}
                    {selectedPlanToBuy === 'standard_10k' && "Abonnement Mensuel Plan Standard (1 Mois)"}
                    {selectedPlanToBuy === 'premium_15k' && "Abonnement Mensuel Plan Premium (1 Mois)"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Montant total</div>
                  <div className="text-xl font-black text-emerald-400">
                    {selectedPlanToBuy === 'trial_2500' && "2 500 FCFA"}
                    {selectedPlanToBuy === 'standard_10k' && "10 000 FCFA"}
                    {selectedPlanToBuy === 'premium_15k' && "15 000 FCFA"}
                  </div>
                </div>
              </div>

              {/* Operator Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-xs">
                  Choisissez votre opérateur Mobile Money congolais :
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMomoOperator('MTN')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      momoOperator === 'MTN'
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 font-bold ring-2 ring-yellow-400/30'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm">MTN MoMo</div>
                    <div className="text-[10px] text-slate-400">Code USSD *105#</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMomoOperator('Airtel')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      momoOperator === 'Airtel'
                        ? 'bg-red-500/20 border-red-400 text-red-300 font-bold ring-2 ring-red-400/30'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-sm">Airtel Money</div>
                    <div className="text-[10px] text-slate-400">Code USSD *128#</div>
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-slate-300 font-medium mb-1 text-xs">
                  Numéro de téléphone payeur (+242) :
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs font-mono text-slate-300 font-bold">
                    +242
                  </span>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="06 000 00 00"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono text-xs outline-none focus:border-emerald-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Une invite de validation de paiement Push vous sera envoyée sur votre téléphone portable.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('plans')}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 text-xs font-medium cursor-pointer"
                >
                  Retour aux formules
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Validation en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send_to_mobile</span>
                      <span>
                        Payer {selectedPlanToBuy === 'trial_2500' ? '2 500 FCFA' : selectedPlanToBuy === 'standard_10k' ? '10 000 FCFA' : '15 000 FCFA'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & RECEIPT */}
        {step === 'success' && lastPaymentReceipt && (
          <div className="space-y-6 max-w-lg mx-auto text-center">
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <span className="material-symbols-outlined text-[36px]">verified</span>
              </div>

              <div>
                <h3 className="font-extrabold text-white text-lg">Paiement Validé avec Succès !</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Votre établissement est désormais officiellement actif sur la plateforme EduCongo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-left space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Réf. Quittance:</span>
                  <span className="text-indigo-300 font-bold">{lastPaymentReceipt.ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Montant réglé:</span>
                  <span className="text-emerald-400 font-bold">{lastPaymentReceipt.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Formule:</span>
                  <span className="text-white">{lastPaymentReceipt.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Opérateur:</span>
                  <span className="text-yellow-300">{lastPaymentReceipt.operator}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  Télécharger la Quittance PDF
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  Accéder au Tableau de Bord
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

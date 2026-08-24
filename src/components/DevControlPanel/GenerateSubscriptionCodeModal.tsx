import React, { useState } from 'react';
import { RegisteredSchoolAccount } from '../../types';
import {
  generateSubscriptionCode,
  SubscriptionActivationCode,
  redeemSubscriptionCode,
} from '../../services/subscriptionCodeService';
import { generatePrintableReportWindow } from '../../utils/exportUtils';

interface GenerateSubscriptionCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schools: RegisteredSchoolAccount[];
  initialSchoolCode?: string;
  currentDevEmail: string;
  onCodeGenerated?: (newCode: SubscriptionActivationCode) => void;
}

export const GenerateSubscriptionCodeModal: React.FC<GenerateSubscriptionCodeModalProps> = ({
  isOpen,
  onClose,
  schools,
  initialSchoolCode,
  currentDevEmail,
  onCodeGenerated,
}) => {
  const [targetSchoolCode, setTargetSchoolCode] = useState<string>(initialSchoolCode || (schools[0]?.schoolCode || 'UNIVERSAL'));
  const [plan, setPlan] = useState<'standard' | 'premium'>('standard');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<SubscriptionActivationCode | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetSchool = schools.find((s) => s.schoolCode === targetSchoolCode);
  const targetSchoolName = targetSchoolCode === 'UNIVERSAL'
    ? 'Tous Établissements (Code Universel)'
    : (targetSchool ? targetSchool.schoolName : 'Établissement Scolaire');

  const monthlyPrice = plan === 'premium' ? 15000 : 10000;
  const totalPrice = monthlyPrice * durationMonths;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      const codeObj = generateSubscriptionCode({
        targetSchoolCode,
        targetSchoolName,
        plan,
        durationMonths,
        issuedByDevEmail: currentDevEmail || 'admin.dsi@edu-congo.netlify.app',
      });

      setGeneratedCode(codeObj);
      if (onCodeGenerated) {
        onCodeGenerated(codeObj);
      }
    }, 500);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrintSlip = () => {
    if (!generatedCode) return;

    const bodyHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin: 0 0 5px 0;">BORDEREAU OFFICIEL D'ÉMISSION DU CODE D'ACTIVATION</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">Console Centrale Développeur EduCongo • Direction des Systèmes d'Information (DSI)</p>
        </div>

        <div style="background: #f8fafc; border: 2px dashed #93c5fd; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px;">Code d'Activation Officiel</div>
          <div style="font-size: 28px; font-family: monospace; font-weight: 900; color: #1e3a8a; letter-spacing: 2px; margin: 10px 0;">${generatedCode.code}</div>
          <div style="font-size: 11px; color: #475569;">Ce code est strictement confidentiel et à usage unique.</div>
        </div>

        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
            <span><strong>Réf. Transaction :</strong> <span style="font-family: monospace;">${generatedCode.paymentReference}</span></span>
            <span><strong>Date d'Émission :</strong> ${new Date(generatedCode.issuedAt).toLocaleString('fr-FR')}</span>
          </div>
          <div><strong>Établissement Bénéficiaire :</strong> ${generatedCode.targetSchoolName} (${generatedCode.targetSchoolCode})</div>
          <div><strong>Formule d'Abonnement :</strong> ${generatedCode.plan === 'premium' ? 'Plan Premium Multi-Cycles' : 'Plan Standard'}</div>
          <div><strong>Durée de l'Abonnement :</strong> ${generatedCode.durationMonths} Mois</div>
          <div><strong>Montant Encaissé (Espèces) :</strong> <strong style="color: #047857;">${generatedCode.priceFCFA.toLocaleString()} FCFA</strong></div>
          <div><strong>Émis par :</strong> ${generatedCode.issuedByDevEmail}</div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
          <strong>Instructions pour l'établissement :</strong><br/>
          1. Connectez-vous sur votre tableau de bord administrateur EduCongo.<br/>
          2. Accédez à la section « Abonnement & Activation ».<br/>
          3. Cliquez sur le bouton devant votre formule choisie (${generatedCode.plan === 'premium' ? 'Plan Premium' : 'Plan Standard'}).<br/>
          4. Saisissez ce code dans le champ d'activation pour débloquer immédiatement l'ensemble des modules.
        </div>

        <div style="text-align: right; margin-top: 30px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Le Responsable Développeur / DSI</p>
          <div style="height: 35px;"></div>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Signature & Cachet Électronique DSI</p>
        </div>
      </div>
    `;

    generatePrintableReportWindow({
      title: `BORDEREAU_CODE_${generatedCode.code}`,
      category: 'Activation',
      schoolName: generatedCode.targetSchoolName,
      schoolCode: generatedCode.targetSchoolCode,
      city: 'Brazzaville',
      bodyHtml,
    });
  };

  const handleReset = () => {
    setGeneratedCode(null);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Générateur de Codes d'Activation de Plan
              </h2>
              <p className="text-xs text-slate-400">
                Console Développeur & Direction Commerciale DSI
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

        {!generatedCode ? (
          /* Generation Form */
          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Plan Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Plan d'Abonnement à Générer <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('standard')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    plan === 'standard'
                      ? 'bg-emerald-950/60 border-emerald-400 ring-1 ring-emerald-500/40 text-white'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-emerald-300">Plan Standard</span>
                    <span className="text-xs font-mono font-bold text-white">10 000 FCFA/m</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Cycle unique, bulletins QR, gestion scolaire & caisse.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlan('premium')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    plan === 'premium'
                      ? 'bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-500/40 text-white'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-indigo-300">Plan Premium</span>
                    <span className="text-xs font-mono font-bold text-white">15 000 FCFA/m</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Multi-cycles, portail personnalisé, cartes QR, support prioritaire.
                  </p>
                </button>
              </div>
            </div>

            {/* Target School */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="target-school">
                2. Établissement Bénéficiaire <span className="text-rose-400">*</span>
              </label>
              <select
                id="target-school"
                value={targetSchoolCode}
                onChange={(e) => setTargetSchoolCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-white text-xs outline-none focus:border-amber-400"
              >
                <option value="UNIVERSAL">🌐 Tous Établissements (Code Multi-écoles Universel)</option>
                {schools.map((s) => (
                  <option key={s.id || s.schoolCode} value={s.schoolCode}>
                    🏫 {s.schoolName} ({s.schoolCode}) — {s.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="duration-months">
                3. Durée de l'Abonnement <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { months: 1, label: '1 Mois' },
                  { months: 3, label: '3 Mois (Trimestre)' },
                  { months: 6, label: '6 Mois (Semestre)' },
                  { months: 10, label: '10 Mois (Année Scol.)' },
                  { months: 12, label: '12 Mois (Année Civ.)' },
                ].map((item) => (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => setDurationMonths(item.months)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      durationMonths === item.months
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Price and Cash Notice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                  Montant Total à Encaisser (Espèces)
                </div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {totalPrice.toLocaleString()} <span className="text-xs font-normal text-slate-300">FCFA</span>
                </div>
                <div className="text-[10.5px] text-slate-400 mt-0.5">
                  {durationMonths} mois × {monthlyPrice.toLocaleString()} FCFA ({plan === 'premium' ? 'Plan Premium' : 'Plan Standard'})
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>Paiement Espèces Confirmé</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 hover:opacity-90 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>{isGenerating ? 'Génération en cours...' : 'Générer le Code d\'Activation'}</span>
              </button>
            </div>

          </form>
        ) : (
          /* Result Card after Generation */
          <div className="space-y-5 animate-in fade-in">
            
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Code Généré avec Succès !
              </div>

              <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                Code d'Activation Officiel EduCongo
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-amber-400/50 flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-wider select-all">
                  {generatedCode.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'done' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-left">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] text-slate-400">Plan</div>
                  <div className="font-bold text-white mt-0.5 capitalize">{generatedCode.plan}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] text-slate-400">Durée</div>
                  <div className="font-bold text-white mt-0.5">{generatedCode.durationMonths} Mois</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] text-slate-400">Montant</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{generatedCode.priceFCFA.toLocaleString()} FCFA</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <div className="text-[10px] text-slate-400">Cible</div>
                  <div className="font-bold text-amber-300 mt-0.5 truncate">{generatedCode.targetSchoolCode}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Imprimer le Bordereau d'Activation (PDF)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (generatedCode) {
                      const res = redeemSubscriptionCode(generatedCode.targetSchoolCode, generatedCode.code);
                      if (res.success) {
                        alert(`🎉 Code ${generatedCode.code} activé avec succès pour ${generatedCode.targetSchoolName} !`);
                        onClose();
                      } else {
                        alert(res.message);
                      }
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                  title="Appliquer et activer immédiatement ce code sans saisie manuelle"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Activer Immédiatement</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                >
                  Générer un Autre Code
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer shadow-md"
                >
                  Terminer
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

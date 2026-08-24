import React, { useState } from 'react';
import { RegisteredSchoolAccount } from '../../types';
import {
  SubscriptionActivationCode,
  getSubscriptionCodes,
  deleteSubscriptionCode,
} from '../../services/subscriptionCodeService';
import { generatePrintableReportWindow } from '../../utils/exportUtils';

interface DevSubscriptionCodesTabProps {
  schools: RegisteredSchoolAccount[];
  currentDevEmail: string;
  onOpenGenerateModal: (preselectedSchoolCode?: string) => void;
  showFeedback: (msg: string) => void;
}

export const DevSubscriptionCodesTab: React.FC<DevSubscriptionCodesTabProps> = ({
  schools,
  currentDevEmail,
  onOpenGenerateModal,
  showFeedback,
}) => {
  const [codes, setCodes] = useState<SubscriptionActivationCode[]>(getSubscriptionCodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'standard' | 'premium'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshCodes = () => {
    setCodes(getSubscriptionCodes());
  };

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    showFeedback(`Code ${codeText} copié !`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string, codeText: string) => {
    if (window.confirm(`Confirmer la suppression / révocation du code d'activation ${codeText} ?`)) {
      const ok = deleteSubscriptionCode(id);
      if (ok) {
        refreshCodes();
        showFeedback(`Code ${codeText} supprimé avec succès.`);
      }
    }
  };

  const handlePrintSlip = (codeObj: SubscriptionActivationCode) => {
    const bodyHtml = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin: 0 0 5px 0;">BORDEREAU OFFICIEL D'ÉMISSION DU CODE D'ACTIVATION</h2>
          <p style="margin: 0; font-size: 13px; color: #475569;">Console Centrale Développeur EduCongo • Direction des Systèmes d'Information (DSI)</p>
        </div>

        <div style="background: #f8fafc; border: 2px dashed #93c5fd; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px;">Code d'Activation Officiel</div>
          <div style="font-size: 28px; font-family: monospace; font-weight: 900; color: #1e3a8a; letter-spacing: 2px; margin: 10px 0;">${codeObj.code}</div>
          <div style="font-size: 11px; color: #475569;">Ce code est strictement confidentiel et à usage unique.</div>
        </div>

        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px;">
            <span><strong>Réf. Transaction :</strong> <span style="font-family: monospace;">${codeObj.paymentReference}</span></span>
            <span><strong>Date d'Émission :</strong> ${new Date(codeObj.issuedAt).toLocaleString('fr-FR')}</span>
          </div>
          <div><strong>Établissement Bénéficiaire :</strong> ${codeObj.targetSchoolName} (${codeObj.targetSchoolCode})</div>
          <div><strong>Formule d'Abonnement :</strong> ${codeObj.plan === 'premium' ? 'Plan Premium Multi-Cycles' : 'Plan Standard'}</div>
          <div><strong>Durée de l'Abonnement :</strong> ${codeObj.durationMonths} Mois</div>
          <div><strong>Montant Encaissé (Espèces) :</strong> <strong style="color: #047857;">${codeObj.priceFCFA.toLocaleString()} FCFA</strong></div>
          <div><strong>Émis par :</strong> ${codeObj.issuedByDevEmail}</div>
          <div><strong>Statut :</strong> ${codeObj.isUsed ? `Déjà utilisé le ${new Date(codeObj.usedAt || '').toLocaleString('fr-FR')}` : 'Actif / Prêt à l’emploi'}</div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
          <strong>Instructions d'activation pour l'administrateur scolaire :</strong><br/>
          1. Se connecter à l'espace d'administration EduCongo.<br/>
          2. Cliquer sur « Abonnement & Activation ».<br/>
          3. Cliquer sur le bouton devant le <strong>${codeObj.plan === 'premium' ? 'Plan Premium' : 'Plan Standard'}</strong> pour ouvrir le champ de saisie.<br/>
          4. Entrer le code d'activation ci-dessus et valider.
        </div>

        <div style="text-align: right; margin-top: 30px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Le Responsable Développeur / DSI</p>
          <div style="height: 35px;"></div>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Signature & Cachet Électronique DSI</p>
        </div>
      </div>
    `;

    generatePrintableReportWindow({
      title: `BORDEREAU_CODE_${codeObj.code}`,
      category: 'Activation',
      schoolName: codeObj.targetSchoolName,
      schoolCode: codeObj.targetSchoolCode,
      city: 'Brazzaville',
      bodyHtml,
    });
  };

  const filteredCodes = codes.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetSchoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetSchoolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.paymentReference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = planFilter === 'all' || c.plan === planFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !c.isUsed) ||
      (statusFilter === 'used' && c.isUsed);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalCodesCount = codes.length;
  const activeCodesCount = codes.filter((c) => !c.isUsed).length;
  const usedCodesCount = codes.filter((c) => c.isUsed).length;
  const totalRevenueFCFA = codes.reduce((sum, c) => sum + (c.priceFCFA || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-slate-400 text-xs font-semibold">Total Codes Émis</div>
          <div className="text-2xl font-black text-white mt-1">{totalCodesCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Toutes formules confondues</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-emerald-400 text-xs font-semibold">Codes Prêts à l'Emploi</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{activeCodesCount}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Disponibles pour activation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-indigo-400 text-xs font-semibold">Codes Utilisés</div>
          <div className="text-2xl font-black text-indigo-300 mt-1">{usedCodesCount}</div>
          <div className="text-[11px] text-indigo-400 mt-0.5">Abonnements appliqués</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-amber-400 text-xs font-semibold">Volume Total Encaissé</div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {totalRevenueFCFA.toLocaleString()} <span className="text-xs font-normal">FCFA</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-0.5">Paiements validés par la DSI</div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher par code, école, référence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400"
          >
            <option value="all">Tous les Plans</option>
            <option value="standard">Plan Standard (10k FCFA)</option>
            <option value="premium">Plan Premium (15k FCFA)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-amber-400"
          >
            <option value="all">Tous les Statuts</option>
            <option value="active">🟢 Prêt à l'emploi (Non utilisé)</option>
            <option value="used">🔵 Déjà utilisé</option>
          </select>
        </div>

        {/* Generate Code Button */}
        <button
          type="button"
          onClick={() => onOpenGenerateModal()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500 hover:opacity-90 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          <span>Générer un Code d'Abonnement</span>
        </button>
      </div>

      {/* Codes Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code d'Activation</th>
                <th className="py-3 px-4">Formule & Durée</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Établissement Cible</th>
                <th className="py-3 px-4">Date d'Émission</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl mb-1 block opacity-40">vpn_key_off</span>
                    Aucun code d'activation trouvé. Cliquez sur « Générer un Code d'Abonnement » pour en créer un.
                  </td>
                </tr>
              ) : (
                filteredCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300 text-sm tracking-wide bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          {c.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code, c.id)}
                          title="Copier le code"
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedId === c.id ? 'done' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Réf: {c.paymentReference}
                      </div>
                    </td>

                    {/* Plan & Duration */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {c.plan === 'premium' ? (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                            PREMIUM
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            STANDARD
                          </span>
                        )}
                        <span className="text-white font-medium">{c.durationMonths} Mois</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400">
                        {c.priceFCFA.toLocaleString()} FCFA
                      </span>
                    </td>

                    {/* Target School */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[200px]">
                        {c.targetSchoolName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {c.targetSchoolCode}
                      </div>
                    </td>

                    {/* Issued At */}
                    <td className="py-3 px-4">
                      <div className="text-slate-300">
                        {new Date(c.issuedAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.issuedByDevEmail}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {c.isUsed ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            Utilisé
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            le {new Date(c.usedAt || '').toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Prêt à l'emploi
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePrintSlip(c)}
                          title="Imprimer le bordereau officiel"
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          title="Supprimer / Révoquer ce code"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-white/15 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              EC
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-white leading-tight">
                À propos d'EduCongo
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                Plateforme Nationale de Gestion Scolaire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-[14px] text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">EduCongo</strong> est la solution numérique unifiée conçue pour moderniser et simplifier la gouvernance des établissements scolaires en République du Congo (Brazzaville, Pointe-Noire, Dolisie, Nkayi, Owando, Ouesso, etc.).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="material-symbols-outlined text-emerald-400 text-[20px] mb-1">school</span>
              <h4 className="font-semibold text-xs text-emerald-400 uppercase tracking-wider mb-1">Conformité MEPPSA</h4>
              <p className="text-xs text-slate-400">Calcul automatique des moyennes et bulletins scolaires normalisés.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="material-symbols-outlined text-indigo-400 text-[20px] mb-1">payments</span>
              <h4 className="font-semibold text-xs text-indigo-400 uppercase tracking-wider mb-1">Paiements Locaux</h4>
              <p className="text-xs text-slate-400">Recouvrement direct de l'écolage via MTN Mobile Money & Airtel Money.</p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Conçu dans le respect du système éducatif congolais et des directives de l'Inspection Générale de l'Enseignement Primaire, Secondaire et Technique.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export const HelpModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-white/15 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.35)]">
              <span className="material-symbols-outlined text-[24px]">contact_support</span>
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-white leading-tight">
                Centre d'Aide & Support
              </h3>
              <p className="text-xs text-indigo-400 font-medium">
                Assistance technique 6j/7
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-sm">
            <h4 className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">location_on</span>
              Bureaux à Brazzaville
            </h4>
            <p className="text-xs text-slate-400">Avenue de l'Indépendance, Centre-ville, Brazzaville</p>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">Tél : +242 06 600 00 00 / +242 05 500 00 00</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-sm">
            <h4 className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">location_on</span>
              Bureaux à Pointe-Noire
            </h4>
            <p className="text-xs text-slate-400">Boulevard Général de Gaulle, Pointe-Noire</p>
            <p className="text-xs text-emerald-400 mt-1 font-semibold">Tél : +242 06 900 00 00</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Questions Fréquentes
            </h4>
            <details className="p-3 rounded-xl bg-white/[0.03] text-xs border border-white/10 cursor-pointer">
              <summary className="font-semibold text-slate-200">Comment obtenir la validation de l'Agrément ?</summary>
              <p className="mt-2 text-slate-400">Téléversez la copie numérique de votre arrêté ministériel d'ouverture lors de l'Étape 3. Nos auditeurs vérifient le numéro sous 48h.</p>
            </details>
            <details className="p-3 rounded-xl bg-white/[0.03] text-xs border border-white/10 cursor-pointer">
              <summary className="font-semibold text-slate-200">Comment lier les comptes MTN & Airtel Money ?</summary>
              <p className="mt-2 text-slate-400">Dans l'onglet Écolage & Finances, activez les passerelles de paiement marchand pour recevoir directement les frais de scolarité sur le compte de l'école.</p>
            </details>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

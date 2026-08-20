import React from 'react';
import { AdminDocument } from '../../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: AdminDocument | null;
  schoolName?: string;
  schoolCode?: string;
  city?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  schoolName = "Lycée d'Excellence de Brazzaville",
  schoolCode = 'BZV-24-X8B',
  city = 'Brazzaville',
}) => {
  if (!isOpen || !document) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'circulaire':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'arrete':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'certificat':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'bordereau':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'recu':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'circulaire':
        return 'campaign';
      case 'arrete':
        return 'gavel';
      case 'certificat':
        return 'workspace_premium';
      case 'bordereau':
        return 'table_chart';
      case 'recu':
        return 'receipt_long';
      case 'reglement':
        return 'menu_book';
      default:
        return 'description';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex justify-between items-start pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {getCategoryIcon(document.category)}
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(
                    document.category
                  )}`}
                >
                  {document.categoryLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Réf: {document.reference}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {document.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-base sm:text-lg mt-1 leading-snug">
                {document.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar space-y-5">
          {/* Official Document Sheet */}
          <div className="bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 rounded-2xl p-6 sm:p-8 border border-white/10 text-slate-100 shadow-inner relative overflow-hidden font-serif">
            {/* Congolese Flag subtle stripe on top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

            {/* Official Header */}
            <div className="text-center pb-5 border-b border-white/10 font-sans">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-300">
                RÉPUBLIQUE DU CONGO
              </div>
              <div className="text-[9.5px] italic text-slate-400">Unité - Travail - Progrès</div>
              <div className="text-[11px] font-bold uppercase text-slate-200 mt-1">
                MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                {document.department || 'Direction Départementale des Enseignements (DDEPSA)'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Établissement : {schoolName} • Code : {schoolCode}
              </div>
            </div>

            {/* Document Title / Banner */}
            <div className="text-center my-6">
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-sans underline decoration-emerald-400 decoration-2 underline-offset-8 inline-block">
                {document.title}
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-3 italic">
                {document.summary}
              </p>
            </div>

            {/* Document Body */}
            <div className="bg-black/30 p-4 sm:p-6 rounded-xl border border-white/5 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {document.content}
            </div>

            {/* Metadata Footer: Signatory & Date */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 font-sans text-xs">
              <div className="space-y-1 text-slate-400">
                <div>
                  <strong className="text-slate-300">Date d'émission :</strong> {document.issueDate}
                </div>
                <div>
                  <strong className="text-slate-300">Destinataires :</strong>{' '}
                  {document.targetAudience}
                </div>
                <div>
                  <strong className="text-slate-300">Taille du fichier :</strong>{' '}
                  {document.fileSize || '1.2 Mo (PDF certifié)'}
                </div>
              </div>

              <div className="text-right sm:text-right w-full sm:w-auto">
                <div className="text-[11px] font-bold uppercase text-slate-300">
                  {document.signatoryRole}
                </div>
                <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                  {document.signatory}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Document Authentifié & Signé Numériquement
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Mots-clés :</span>
            {document.tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 rounded-lg text-[10.5px]"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            Réf: {document.reference}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Imprimer / Exporter PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Student } from '../../types';

interface StudentQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onViewBulletin?: (student: Student) => void;
  onGenerateCertificate?: (student: Student) => void;
}

export const StudentQuickViewModal: React.FC<StudentQuickViewModalProps> = ({
  isOpen,
  onClose,
  student,
  onViewBulletin,
  onGenerateCertificate,
}) => {
  if (!isOpen || !student) return null;

  const tuitionPercent = Math.round((student.tuitionPaid / (student.tuitionTotal || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/30">
              {student.firstName.charAt(0)}
              {student.lastName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {student.firstName} {student.lastName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Matricule : <span className="text-indigo-300 font-bold">{student.matricule}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Student Details Grid */}
        <div className="space-y-3.5 text-xs">
          {/* Class & Academic Summary */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Classe Assignée
              </span>
              <span className="text-sm font-extrabold text-emerald-400">
                {student.classroom}
              </span>
            </div>

            <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Moyenne Générale (T1)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-white">
                  {student.averageGrade.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">/ 20</span>
                <span
                  className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    student.averageGrade >= 14
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : student.averageGrade >= 10
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {student.averageGrade >= 16
                    ? 'Très Bien'
                    : student.averageGrade >= 14
                    ? 'Bien'
                    : student.averageGrade >= 12
                    ? 'A. Bien'
                    : student.averageGrade >= 10
                    ? 'Passable'
                    : 'Insuffisant'}
                </span>
              </div>
            </div>
          </div>

          {/* Birth & Origin */}
          <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/10 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Date et lieu de naissance :</span>
              <span className="text-slate-200 font-medium">
                {student.birthDate} à {student.birthPlace}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Genre :</span>
              <span className="text-slate-200 font-medium">
                {student.gender === 'M' ? 'Masculin (Garçon)' : 'Féminin (Fille)'}
              </span>
            </div>
          </div>

          {/* Parent contact */}
          <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/10 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Contact Parent / Tuteur Légal
            </span>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">{student.parentName}</span>
              <a
                href={`tel:${student.parentPhone}`}
                className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span className="material-symbols-outlined text-[14px]">call</span>
                {student.parentPhone}
              </a>
            </div>
          </div>

          {/* Tuition Status */}
          <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Écolage & Frais de scolarité :</span>
              <span className="font-bold text-white">
                {student.tuitionPaid.toLocaleString('fr-FR')} / {student.tuitionTotal.toLocaleString('fr-FR')} FCFA ({tuitionPercent}%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  tuitionPercent === 100
                    ? 'bg-emerald-500'
                    : tuitionPercent >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${tuitionPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (onViewBulletin) onViewBulletin(student);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">
              description
            </span>
            Consulter Bulletin
          </button>

          <button
            type="button"
            onClick={() => {
              if (onGenerateCertificate) onGenerateCertificate(student);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              workspace_premium
            </span>
            Certificat Scolaire
          </button>
        </div>
      </div>
    </div>
  );
};

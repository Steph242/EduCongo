import React, { useState } from 'react';
import { Student } from '../../types';
import { StudentIdCardModal } from './StudentIdCardModal';
import { SchoolSocialFeed } from '../Social/SchoolSocialFeed';

interface StudentWorkspaceProps {
  schoolName: string;
  schoolCode: string;
  cityName: string;
  student?: Student;
}

export const StudentWorkspace: React.FC<StudentWorkspaceProps> = ({
  schoolName,
  schoolCode,
  cityName,
  student = {
    id: 'STU-001',
    matricule: 'CG-2024-0891',
    firstName: 'Arsène',
    lastName: 'LOUBOU',
    gender: 'M',
    classroom: 'Terminale D',
    birthDate: '2006-04-12',
    birthPlace: 'Brazzaville',
    parentName: 'M. Jean-Paul LOUBOU',
    parentPhone: '06 650 44 33',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    email: 'arsene.loubou@eleve.cg',
    bloodGroup: 'O+',
    address: 'Bacongo, Brazzaville',
    status: 'Inscrit',
    tuitionPaid: 150000,
    tuitionTotal: 150000,
    averageGrade: 16.4,
  },
}) => {
  const [activeTab, setActiveTab] = useState<'grades' | 'attendance' | 'homework' | 'finance' | 'social'>('grades');
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Student Profile Hero Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900/30 via-slate-900/50 to-emerald-900/30 border border-teal-500/20 backdrop-blur-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img
            src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={student.firstName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{student.firstName} {student.lastName}</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                {student.classroom}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Matricule : <span className="font-mono text-emerald-400 font-bold">{student.matricule}</span> • Moyenne Générale : <span className="font-bold text-yellow-300">{student.averageGrade} / 20</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsIdCardOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold border border-emerald-400/30 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            Carte Scolaire QR
          </button>

          {/* Sub Navigation */}
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('grades')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'grades' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Notes & Bulletin
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'attendance' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Assiduité
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('homework')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'homework' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Devoirs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'finance' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Écolage
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'social' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fil d'Actu
            </button>
          </div>
        </div>
      </div>

      {/* ================= TAB: NOTES & BULLETIN ================= */}
      {activeTab === 'grades' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">assignment</span>
              Relevé de Notes du 1er Trimestre
            </h3>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              Rang : 2ème / 42 élèves
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-3">Matière</th>
                  <th className="p-3 text-center">Coef</th>
                  <th className="p-3 text-center">Devoir 1</th>
                  <th className="p-3 text-center">Devoir 2</th>
                  <th className="p-3 text-center">Composition</th>
                  <th className="p-3 text-center">Moyenne / 20</th>
                  <th className="p-3">Appréciations des Enseignants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-white">Mathématiques</td>
                  <td className="p-3 text-center font-bold">5</td>
                  <td className="p-3 text-center font-mono">16.5</td>
                  <td className="p-3 text-center font-mono">17.0</td>
                  <td className="p-3 text-center font-mono">18.0</td>
                  <td className="p-3 text-center font-bold text-emerald-400 font-mono">17.4 / 20</td>
                  <td className="p-3 text-slate-300">Excellent trimestre, esprit d'analyse remarquable.</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-white">Sciences Physiques</td>
                  <td className="p-3 text-center font-bold">4</td>
                  <td className="p-3 text-center font-mono">15.0</td>
                  <td className="p-3 text-center font-mono">16.0</td>
                  <td className="p-3 text-center font-mono">16.5</td>
                  <td className="p-3 text-center font-bold text-emerald-400 font-mono">16.0 / 20</td>
                  <td className="p-3 text-slate-300">Très bon travail régulier en TP et cours.</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-white">Français & Littérature</td>
                  <td className="p-3 text-center font-bold">3</td>
                  <td className="p-3 text-center font-mono">14.0</td>
                  <td className="p-3 text-center font-mono">15.0</td>
                  <td className="p-3 text-center font-mono">14.5</td>
                  <td className="p-3 text-center font-bold text-emerald-400 font-mono">14.5 / 20</td>
                  <td className="p-3 text-slate-300">Bonne rédaction et esprit critique affûté.</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-white">Anglais</td>
                  <td className="p-3 text-center font-bold">2</td>
                  <td className="p-3 text-center font-mono">17.0</td>
                  <td className="p-3 text-center font-mono">18.0</td>
                  <td className="p-3 text-center font-mono">17.5</td>
                  <td className="p-3 text-center font-bold text-emerald-400 font-mono">17.5 / 20</td>
                  <td className="p-3 text-slate-300">Very good participation in class.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: ASSIDUITÉ ================= */}
      {activeTab === 'attendance' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">insights</span>
            Bilan d'Assiduité & Présences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="text-2xl font-extrabold text-emerald-400">98.5%</div>
              <div className="text-xs text-slate-300 mt-1">Taux d'assiduité trimestriel</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-extrabold text-white">0</div>
              <div className="text-xs text-slate-300 mt-1">Absence injustifiée</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-2xl font-extrabold text-white">1</div>
              <div className="text-xs text-slate-300 mt-1">Retard justifié</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DEVOIRS ================= */}
      {activeTab === 'homework' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">assignment_turned_in</span>
            Cahier de Textes & Devoirs à Rendre
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex justify-between items-center">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                  Mathématiques
                </span>
                <h4 className="font-bold text-white text-sm mt-1">Exercices sur les fonctions exponentielles</h4>
                <p className="text-xs text-slate-300">Exercices 4, 5 et 6 page 112.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-400 font-bold">Pour le 28 Nov 2024</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: FINANCES / ÉCOLAGE ================= */}
      {activeTab === 'finance' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">account_balance_wallet</span>
            Situation des Frais de Scolarité & Écolage
          </h3>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400">Statut de Paiement</div>
              <div className="text-lg font-bold text-emerald-400">Frais de Scolarité Soldés (100%)</div>
            </div>
            <div className="text-right font-mono">
              <span className="text-lg font-bold text-white">150 000 FCFA</span>
              <span className="text-xs text-slate-400 block">sur 150 000 FCFA</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: FIL D'ACTUALITÉS ================= */}
      {activeTab === 'social' && (
        <SchoolSocialFeed
          schoolName={schoolName}
          schoolCode={schoolCode}
          cityName={cityName}
          currentUser={{
            id: student.id,
            fullName: `${student.firstName} ${student.lastName}`,
            role: 'student',
            roleTitle: `Élève (${student.classroom})`,
            phone: student.parentPhone,
            matricule: student.matricule,
          }}
          canCreatePost={false}
        />
      )}

      {/* ID Card Modal */}
      <StudentIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        student={student}
        schoolName={schoolName}
        schoolCode={schoolCode}
        city={cityName}
      />
    </div>
  );
};

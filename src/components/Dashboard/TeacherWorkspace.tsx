import React, { useState } from 'react';
import { Student, Teacher } from '../../types';
import { SchoolSocialFeed } from '../Social/SchoolSocialFeed';

interface TeacherWorkspaceProps {
  schoolName: string;
  schoolCode: string;
  cityName: string;
  teacher?: Teacher;
  students: Student[];
  onOpenFeed?: () => void;
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  classroom: string;
  dueDate: string;
  instructions: string;
  status: 'active' | 'completed';
}

interface AttendanceRecordEntry {
  studentMatricule: string;
  studentName: string;
  status: 'present' | 'absent' | 'retard' | 'justifie';
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
  schoolName,
  schoolCode,
  cityName,
  teacher = {
    id: 't_demo',
    matricule: 'ENS-BZV-042',
    name: 'Prof. Brice MABIALA',
    subject: 'Mathématiques & Sciences Physiques',
    phone: '06 650 11 22',
    email: 'b.mabiala@educongo.cg',
    status: 'Actif',
    classroom: 'Terminale D & Première C',
  },
  students,
}) => {
  const [activeTeacherSubTab, setActiveTeacherSubTab] = useState<'grades' | 'attendance' | 'schedule' | 'homework' | 'social'>('grades');
  const [selectedClass, setSelectedClass] = useState<string>('Terminale D');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathématiques');

  // Homework list
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([
    {
      id: 'hw-1',
      title: 'Devoir Maison : Fonctions Exponentielles et Logarithmes',
      subject: 'Mathématiques',
      classroom: 'Terminale D',
      dueDate: '2024-11-28',
      instructions: 'Résoudre les exercices 4, 5 et 6 page 112 du manuel national. Rendre sur feuille double.',
      status: 'active',
    },
    {
      id: 'hw-2',
      title: 'Préparation TP : Cinématique & Loi de Newton',
      subject: 'Sciences Physiques',
      classroom: 'Première C',
      dueDate: '2024-11-30',
      instructions: 'Tracer la courbe de vitesse et déterminer l\'accélération moyenne du solide.',
      status: 'active',
    },
  ]);

  // New homework form
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwClass, setNewHwClass] = useState('Terminale D');
  const [newHwDueDate, setNewHwDueDate] = useState('');
  const [newHwInstructions, setNewHwInstructions] = useState('');
  const [isAddingHw, setIsAddingHw] = useState(false);

  // Grades entry state
  const classStudents = students.filter((s) => s.classroom === selectedClass);
  const [gradesMap, setGradesMap] = useState<Record<string, { devoir1: string; devoir2: string; compo: string; note: string }>>({
    'CG-2024-001': { devoir1: '16.5', devoir2: '17', compo: '18', note: 'Très bon travail' },
    'CG-2024-002': { devoir1: '14', devoir2: '15', compo: '14.5', note: 'Régulier' },
    'CG-2024-003': { devoir1: '12', devoir2: '13.5', compo: '11', note: 'En progrès' },
  });

  // Attendance call state
  const [callDate, setCallDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceCall, setAttendanceCall] = useState<Record<string, 'present' | 'absent' | 'retard' | 'justifie'>>({});
  const [isSavedCall, setIsSavedCall] = useState(false);

  const handleGradeChange = (matricule: string, field: 'devoir1' | 'devoir2' | 'compo' | 'note', val: string) => {
    setGradesMap((prev) => ({
      ...prev,
      [matricule]: {
        ...(prev[matricule] || { devoir1: '', devoir2: '', compo: '', note: '' }),
        [field]: val,
      },
    }));
  };

  const handleSetAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'retard' | 'justifie'> = {};
    classStudents.forEach((s) => {
      updated[s.matricule] = 'present';
    });
    setAttendanceCall(updated);
    setIsSavedCall(false);
  };

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle || !newHwDueDate) return;

    const hw: HomeworkItem = {
      id: `hw-${Date.now()}`,
      title: newHwTitle,
      subject: selectedSubject,
      classroom: newHwClass,
      dueDate: newHwDueDate,
      instructions: newHwInstructions,
      status: 'active',
    };

    setHomeworkList([hw, ...homeworkList]);
    setNewHwTitle('');
    setNewHwInstructions('');
    setIsAddingHw(false);
  };

  return (
    <div className="space-y-5">
      {/* Teacher Workspace Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-teal-900/30 border border-emerald-500/20 backdrop-blur-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">cast_for_education</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{teacher.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                Enseignant Titulaire
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Matière : <span className="font-semibold text-emerald-400">{teacher.subject}</span> • Matricule : <span className="font-mono text-slate-400">{teacher.matricule}</span>
            </p>
          </div>
        </div>

        {/* Quick actions tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTeacherSubTab('grades')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTeacherSubTab === 'grades'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/[0.05] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Saisie des Notes
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherSubTab('attendance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTeacherSubTab === 'attendance'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/[0.05] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            Faire l'Appel
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherSubTab('homework')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTeacherSubTab === 'homework'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/[0.05] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment_add</span>
            Devoirs & Travaux
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherSubTab('schedule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTeacherSubTab === 'schedule'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/[0.05] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Emploi du Temps
          </button>

          <button
            type="button"
            onClick={() => setActiveTeacherSubTab('social')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTeacherSubTab === 'social'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/[0.05] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">forum</span>
            Fil d'Actualités
          </button>
        </div>
      </div>

      {/* ================= TAB 1: SAISIE DES NOTES ================= */}
      {activeTeacherSubTab === 'grades' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">edit_note</span>
                Carnet de Notes & Évaluations Trimestrielles
              </h3>
              <p className="text-xs text-slate-400">
                Saisissez les notes de Devoirs et Compositions pour le calcul automatique des moyennes officielles MEPPSA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs outline-none"
              >
                <option value="Terminale D" className="bg-slate-900">Terminale D</option>
                <option value="Terminale C" className="bg-slate-900">Terminale C</option>
                <option value="Première C" className="bg-slate-900">Première C</option>
                <option value="3ème A" className="bg-slate-900">3ème A</option>
              </select>

              <button
                type="button"
                onClick={() => alert('Notes enregistrées et synchronisées avec le serveur !')}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold border border-emerald-400/30 cursor-pointer shadow-md flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Enregistrer les Notes
              </button>
            </div>
          </div>

          {/* Grades Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
                <tr>
                  <th className="p-3">Matricule</th>
                  <th className="p-3">Nom & Prénom Élève</th>
                  <th className="p-3 text-center">Devoir 1 (/20)</th>
                  <th className="p-3 text-center">Devoir 2 (/20)</th>
                  <th className="p-3 text-center">Composition (/20)</th>
                  <th className="p-3 text-center">Moyenne Matière</th>
                  <th className="p-3">Appréciation Pédagogique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Aucun élève inscrit dans cette classe pour le moment.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((st) => {
                    const rec = gradesMap[st.matricule] || { devoir1: '', devoir2: '', compo: '', note: '' };
                    const d1 = parseFloat(rec.devoir1) || 0;
                    const d2 = parseFloat(rec.devoir2) || 0;
                    const cp = parseFloat(rec.compo) || 0;
                    const moy = ((d1 + d2) / 2 + cp) / 2;

                    return (
                      <tr key={st.matricule} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-mono text-indigo-300 font-bold">{st.matricule}</td>
                        <td className="p-3 font-semibold text-white">{st.lastName} {st.firstName}</td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={rec.devoir1}
                            onChange={(e) => handleGradeChange(st.matricule, 'devoir1', e.target.value)}
                            placeholder="Ex: 15"
                            className="w-16 text-center py-1 rounded-lg bg-white/[0.05] border border-white/15 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={rec.devoir2}
                            onChange={(e) => handleGradeChange(st.matricule, 'devoir2', e.target.value)}
                            placeholder="Ex: 14.5"
                            className="w-16 text-center py-1 rounded-lg bg-white/[0.05] border border-white/15 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={rec.compo}
                            onChange={(e) => handleGradeChange(st.matricule, 'compo', e.target.value)}
                            placeholder="Ex: 16"
                            className="w-16 text-center py-1 rounded-lg bg-white/[0.05] border border-white/15 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                          />
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-400 font-mono">
                          {moy > 0 ? moy.toFixed(2) + ' / 20' : '—'}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={rec.note}
                            onChange={(e) => handleGradeChange(st.matricule, 'note', e.target.value)}
                            placeholder="Ex: Bon trimestre, continuer ainsi"
                            className="w-full py-1 px-2 rounded-lg bg-white/[0.05] border border-white/15 text-white text-xs focus:border-emerald-400 outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FAIRE L'APPEL ================= */}
      {activeTeacherSubTab === 'attendance' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">fact_check</span>
                Feuille d'Appel Numérique & Pointage
              </h3>
              <p className="text-xs text-slate-400">
                Pointez les présences, absences et retards de la séance. Les parents reçoivent une alerte instantanée.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-xs outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleSetAllPresent}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 cursor-pointer"
              >
                Tous Présents
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSavedCall(true);
                  alert(`✅ Feuille d'appel du ${callDate} validée pour la classe ${selectedClass} !`);
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold border border-emerald-400/30 cursor-pointer shadow-md"
              >
                Valider l'Appel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classStudents.map((st) => {
              const currentStatus = attendanceCall[st.matricule] || 'present';
              return (
                <div
                  key={st.matricule}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={st.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={st.firstName}
                      className="w-9 h-9 rounded-xl object-cover border border-white/20"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{st.lastName} {st.firstName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{st.matricule}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAttendanceCall((prev) => ({ ...prev, [st.matricule]: 'present' }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        currentStatus === 'present'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceCall((prev) => ({ ...prev, [st.matricule]: 'absent' }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        currentStatus === 'absent'
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttendanceCall((prev) => ({ ...prev, [st.matricule]: 'retard' }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        currentStatus === 'retard'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      R
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: DEVOIRS & TRAVAUX ================= */}
      {activeTeacherSubTab === 'homework' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">assignment_add</span>
                Cahier de Textes & Devoirs à la Maison
              </h3>
              <p className="text-xs text-slate-400">
                Publiez des exercices, devoirs surveillés et lectures pour vos classes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingHw(!isAddingHw)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold border border-emerald-400/30 cursor-pointer shadow-md flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">{isAddingHw ? 'close' : 'add'}</span>
              {isAddingHw ? 'Fermer le formulaire' : 'Nouveau Devoir'}
            </button>
          </div>

          {/* Form to add homework */}
          {isAddingHw && (
            <form onSubmit={handleAddHomework} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Titre du Devoir *</label>
                  <input
                    type="text"
                    required
                    value={newHwTitle}
                    onChange={(e) => setNewHwTitle(e.target.value)}
                    placeholder="Ex: Exercices Suites Numériques"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Classe Destinataire *</label>
                  <select
                    value={newHwClass}
                    onChange={(e) => setNewHwClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs outline-none"
                  >
                    <option value="Terminale D" className="bg-slate-900">Terminale D</option>
                    <option value="Terminale C" className="bg-slate-900">Terminale C</option>
                    <option value="Première C" className="bg-slate-900">Première C</option>
                    <option value="3ème A" className="bg-slate-900">3ème A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Limite de Remise *</label>
                  <input
                    type="date"
                    required
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Consignes & Énoncé *</label>
                <textarea
                  rows={3}
                  required
                  value={newHwInstructions}
                  onChange={(e) => setNewHwInstructions(e.target.value)}
                  placeholder="Détaillez les exercices à faire, les critères de notation..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 text-white text-xs outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Publier le Devoir
                </button>
              </div>
            </form>
          )}

          {/* Homework list */}
          <div className="space-y-3">
            {homeworkList.map((hw) => (
              <div
                key={hw.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {hw.classroom}
                    </span>
                    <span className="font-bold text-white text-sm">{hw.title}</span>
                  </div>
                  <p className="text-xs text-slate-300">{hw.instructions}</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    À rendre pour le {hw.dueDate}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                    Actif
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: EMPLOI DU TEMPS ================= */}
      {activeTeacherSubTab === 'schedule' && (
        <div className="p-5 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">calendar_month</span>
            Emploi du Temps Hebdomadaire de l'Enseignant
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => (
              <div key={day} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-emerald-400 border-b border-white/10 pb-1">{day}</div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-0.5">
                  <div className="font-bold text-[11px]">07h30 - 09h30</div>
                  <div className="text-[10px] text-slate-300">Terminale D • Salle 12</div>
                  <div className="text-[10px] font-semibold">Mathématiques</div>
                </div>
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 space-y-0.5">
                  <div className="font-bold text-[11px]">10h00 - 12h00</div>
                  <div className="text-[10px] text-slate-300">Première C • Salle 08</div>
                  <div className="text-[10px] font-semibold">Sciences Physiques</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: FIL D'ACTUALITÉS ================= */}
      {activeTeacherSubTab === 'social' && (
        <SchoolSocialFeed
          schoolName={schoolName}
          schoolCode={schoolCode}
          cityName={cityName}
          currentUser={{
            id: teacher.id,
            fullName: teacher.name,
            role: 'staff',
            roleTitle: 'Enseignant',
            phone: teacher.phone,
          }}
          canCreatePost={true}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { PortalAccount, PortalRole, Student, SubjectGrade, StaffRole } from '../../types';
import { authenticatePortalUser, getParentChildren } from '../../services/portalService';
import { INITIAL_STUDENTS, SAMPLE_BULLETIN_GRADES } from '../../data/mockData';
import { SchoolSocialFeed } from './SchoolSocialFeed';
import { StudentIdCardModal } from '../Dashboard/StudentIdCardModal';
import { StaffRoleDropdown } from '../Auth/StaffRoleDropdown';
import { STAFF_PROFILE_OPTIONS } from '../../data/mockStaff';

interface SchoolPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  schoolCode: string;
  cityName?: string;
  initialRole?: PortalRole;
}

export const SchoolPortalModal: React.FC<SchoolPortalModalProps> = ({
  isOpen,
  onClose,
  schoolName,
  schoolCode,
  cityName = 'Brazzaville',
  initialRole = 'parent',
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<PortalRole>(initialRole);
  const [selectedStaffRole, setSelectedStaffRole] = useState<StaffRole>('enseignant_titulaire');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [isRegisteringPin, setIsRegisteringPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticated Session State
  const [currentAccount, setCurrentAccount] = useState<PortalAccount | null>(null);

  // Parent view state
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  const [parentActiveTab, setParentActiveTab] = useState<'dossier' | 'feed' | 'card'>('dossier');

  // Student view state
  const [studentCardOpen, setStudentCardOpen] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (isRegisteringPin && pin !== confirmPin) {
      setIsLoading(false);
      setErrorMessage('Les deux codes PIN saisis ne correspondent pas.');
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      const res = authenticatePortalUser(
        activeRoleTab,
        identifier,
        pin,
        isRegisteringPin,
        activeRoleTab === 'staff' ? selectedStaffRole : undefined
      );
      if (res.success && res.account) {
        setCurrentAccount(res.account);
        setErrorMessage('');
      } else {
        setErrorMessage(res.errorMessage || 'Échec de connexion au portail.');
        if (res.isFirstLogin) {
          setIsRegisteringPin(true);
        }
      }
    }, 500);
  };

  const handleLogoutSession = () => {
    setCurrentAccount(null);
    setPin('');
    setConfirmPin('');
    setIsRegisteringPin(false);
  };

  const requiredPinDigits = activeRoleTab === 'parent' ? 4 : 6;

  // If parent logged in, get children data
  const parentChildren: Student[] = currentAccount && currentAccount.role === 'parent'
    ? getParentChildren(currentAccount, INITIAL_STUDENTS)
    : [];

  const selectedChild: Student | undefined = parentChildren[selectedChildIndex] || parentChildren[0];

  // If student logged in, find their record
  const studentSelf: Student | undefined = currentAccount && currentAccount.role === 'student'
    ? INITIAL_STUDENTS.find((s) => s.matricule.toUpperCase() === currentAccount.identifier.toUpperCase()) || INITIAL_STUDENTS[0]
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col relative">
        {/* Top Flag Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

        {/* Modal Top Nav Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Portail Membres & Réseau Social • {schoolName}
              </h3>
              <p className="text-xs text-slate-400">
                Espace dédié Parents (PIN 4 chiffres), Élèves & Personnel (PIN 6 chiffres)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentAccount && (
              <button
                type="button"
                onClick={handleLogoutSession}
                className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-rose-400/40 text-slate-300 hover:text-rose-300 bg-white/[0.04] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                Déconnexion
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* ===================== LOGGED IN VIEWS ===================== */}
        {currentAccount ? (
          <div className="space-y-6 flex-1">
            {/* User Session Ribbon */}
            <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
              <div className="flex items-center gap-3">
                {currentAccount.avatarUrl ? (
                  <img
                    src={currentAccount.avatarUrl}
                    alt={currentAccount.displayName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400/60 shadow bg-slate-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300 text-lg">
                    {currentAccount.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-white text-base flex items-center gap-2">
                    <span>{currentAccount.displayName}</span>
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-emerald-300">{currentAccount.roleTitle}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">Identifiant : {currentAccount.identifier}</span>
                  </div>
                </div>
              </div>

              {/* Parent top subtabs */}
              {currentAccount.role === 'parent' && (
                <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setParentActiveTab('dossier')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      parentActiveTab === 'dossier' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                    Dossier Scolaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentActiveTab('feed')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      parentActiveTab === 'feed' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">feed</span>
                    Actualités École
                  </button>
                </div>
              )}
            </div>

            {/* PARENT VIEW */}
            {currentAccount.role === 'parent' && (
              <>
                {parentActiveTab === 'feed' ? (
                  <SchoolSocialFeed
                    schoolName={schoolName}
                    schoolCode={schoolCode}
                    cityName={cityName}
                    currentUser={currentAccount}
                    canCreatePost={false}
                  />
                ) : (
                  /* Parent Student Dossier View */
                  <div className="space-y-6">
                    {/* Multi-Child Selector Tabs */}
                    {parentChildren.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-xs font-semibold text-slate-400">Enfants scolarisés :</span>
                        {parentChildren.map((child, idx) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => setSelectedChildIndex(idx)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                              selectedChildIndex === idx
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">face</span>
                            <span>{child.firstName} {child.lastName} ({child.classroom})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedChild && (
                      <div className="space-y-5">
                        {/* Child Summary Card */}
                        <div className="bg-white/[0.04] p-5 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          <div className="md:col-span-3 flex flex-col items-center text-center space-y-2">
                            <img
                              src={selectedChild.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                              alt={selectedChild.firstName}
                              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-md bg-slate-800"
                            />
                            <div className="font-mono text-[11px] font-bold text-indigo-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                              {selectedChild.matricule}
                            </div>
                          </div>

                          <div className="md:col-span-9 space-y-3">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <h4 className="text-xl font-extrabold text-white">
                                  {selectedChild.lastName.toUpperCase()} {selectedChild.firstName}
                                </h4>
                                <div className="text-xs text-slate-400">
                                  Classe : <strong className="text-emerald-300">{selectedChild.classroom}</strong> • Année 2024-2025
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  Moyenne Générale : {selectedChild.averageGrade} / 20
                                </span>
                              </div>
                            </div>

                            {/* 3 Metric Cards for Parent */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Assiduité & Présences</div>
                                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                  98.2% de présence
                                </div>
                                <div className="text-[10px] text-slate-400">0 absence injustifiée</div>
                              </div>

                              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Frais de Scolarité</div>
                                <div className="text-sm font-bold text-slate-200">
                                  {selectedChild.tuitionPaid.toLocaleString('fr-FR')} / {selectedChild.tuitionTotal.toLocaleString('fr-FR')} FCFA
                                </div>
                                <div className="text-[10px] text-emerald-400 font-semibold">
                                  {selectedChild.tuitionPaid >= selectedChild.tuitionTotal ? '✅ Totalement à jour' : `Solde restant : ${(selectedChild.tuitionTotal - selectedChild.tuitionPaid).toLocaleString('fr-FR')} FCFA`}
                                </div>
                              </div>

                              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Rang & Conduite</div>
                                <div className="text-sm font-bold text-purple-300">
                                  2ème sur 42 élèves
                                </div>
                                <div className="text-[10px] text-slate-300">Conduite : Très Bonne</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Grades Breakdown for Parent */}
                        <div className="bg-white/[0.03] p-5 rounded-3xl border border-white/10 space-y-3">
                          <h5 className="font-bold text-sm text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-400">assignment</span>
                            Relevé Trimestriel des Évaluations Harmonisées
                          </h5>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-white/[0.05] text-slate-300 border-b border-white/10">
                                <tr>
                                  <th className="p-2.5">Discipline</th>
                                  <th className="p-2.5">Devoir 1</th>
                                  <th className="p-2.5">Devoir 2</th>
                                  <th className="p-2.5">Composition</th>
                                  <th className="p-2.5">Moyenne</th>
                                  <th className="p-2.5">Enseignant</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {SAMPLE_BULLETIN_GRADES.map((g, i) => (
                                  <tr key={i} className="hover:bg-white/[0.02]">
                                    <td className="p-2.5 font-semibold text-slate-200">{g.subject}</td>
                                    <td className="p-2.5 font-mono">{g.devoir1}</td>
                                    <td className="p-2.5 font-mono">{g.devoir2}</td>
                                    <td className="p-2.5 font-mono font-bold text-emerald-300">{g.composition}</td>
                                    <td className="p-2.5 font-mono font-bold text-white">
                                      {((g.devoir1 + g.devoir2 + g.composition * 2) / 4).toFixed(1)} / 20
                                    </td>
                                    <td className="p-2.5 text-slate-400">{g.teacher}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* STUDENT VIEW */}
            {currentAccount.role === 'student' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <SchoolSocialFeed
                      schoolName={schoolName}
                      schoolCode={schoolCode}
                      cityName={cityName}
                      currentUser={currentAccount}
                      canCreatePost={false}
                    />
                  </div>

                  {/* Student Widget Sidebar */}
                  <div className="space-y-4">
                    {studentSelf && (
                      <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 space-y-3 text-center">
                        <img
                          src={studentSelf.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={studentSelf.firstName}
                          className="w-20 h-20 mx-auto rounded-2xl object-cover border-2 border-emerald-400"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{studentSelf.firstName} {studentSelf.lastName}</div>
                          <div className="text-xs text-emerald-400 font-semibold">{studentSelf.classroom}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{studentSelf.matricule}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setStudentCardOpen(true)}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold border border-emerald-400/30 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                          Ma Carte Scolaire QR
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <StudentIdCardModal
                  isOpen={studentCardOpen}
                  onClose={() => setStudentCardOpen(false)}
                  student={studentSelf || null}
                  schoolName={schoolName}
                  schoolCode={schoolCode}
                  city={cityName}
                />
              </div>
            )}

            {/* STAFF VIEW */}
            {currentAccount.role === 'staff' && (
              <SchoolSocialFeed
                schoolName={schoolName}
                schoolCode={schoolCode}
                cityName={cityName}
                currentUser={currentAccount}
                canCreatePost={true}
              />
            )}
          </div>
        ) : (
          /* ===================== PORTAL LOGIN FORM ===================== */
          <div className="max-w-md mx-auto w-full py-2 space-y-5">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/[0.04] rounded-2xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveRoleTab('parent');
                  setErrorMessage('');
                  setIsRegisteringPin(false);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeRoleTab === 'parent'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">family_restroom</span>
                <span>Parents (PIN 4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRoleTab('student');
                  setErrorMessage('');
                  setIsRegisteringPin(false);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeRoleTab === 'student'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">school</span>
                <span>Élèves (PIN 6)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRoleTab('staff');
                  setErrorMessage('');
                  setIsRegisteringPin(false);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  activeRoleTab === 'staff'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">badge</span>
                <span>Personnel (PIN 6)</span>
              </button>
            </div>

            {/* Login Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <span className="font-bold text-white block">
                  {activeRoleTab === 'parent'
                    ? 'Accès Dossiers Scolaires & Actualités Parents'
                    : activeRoleTab === 'student'
                    ? 'Espace Apprenant & Carte Étudiant QR'
                    : 'Portail Enseignants & Personnel Administratif'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {activeRoleTab === 'parent'
                    ? 'Saisissez votre numéro de téléphone et votre code PIN personnel à 4 chiffres.'
                    : activeRoleTab === 'student'
                    ? 'Saisissez votre Code Étudiant / Matricule et votre code PIN à 6 chiffres.'
                    : 'Saisissez votre numéro de téléphone professionnel et votre code PIN à 6 chiffres.'}
                </span>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* STAFF ROLE SELECTION DROPDOWN (Enseignant / Personnel Administratif) */}
              {activeRoleTab === 'staff' && (
                <StaffRoleDropdown
                  selectedRole={selectedStaffRole}
                  onSelectRole={(role) => setSelectedStaffRole(role)}
                  onSelectSampleStaff={(staff) => {
                    setIdentifier(staff.phone);
                    setPin('123456');
                    setErrorMessage('');
                  }}
                  label="Profil & Fonction de Connexion"
                />
              )}

              {/* Identifier Input */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {activeRoleTab === 'student'
                    ? 'Code Étudiant / Matricule National *'
                    : 'Numéro de téléphone (+242) *'}
                </label>
                <input
                  type={activeRoleTab === 'student' ? 'text' : 'tel'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeRoleTab === 'student'
                      ? 'Ex: CG-2024-0891'
                      : 'Ex: 06 650 44 33'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md font-mono"
                />
              </div>

              {/* PIN input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-300">
                    {isRegisteringPin
                      ? `Créer votre code PIN (${requiredPinDigits} chiffres) *`
                      : `Code PIN (${requiredPinDigits} chiffres) *`}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={requiredPinDigits}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder={`Saisir vos ${requiredPinDigits} chiffres`}
                  className="w-full text-center tracking-[0.3em] font-mono text-lg py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>

              {/* Confirm PIN if registering */}
              {isRegisteringPin && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Confirmez votre code PIN ({requiredPinDigits} chiffres) *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={requiredPinDigits}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={`Confirmez vos ${requiredPinDigits} chiffres`}
                    className="w-full text-center tracking-[0.3em] font-mono text-lg py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisteringPin(!isRegisteringPin);
                    setErrorMessage('');
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer font-semibold"
                >
                  {isRegisteringPin ? 'Se connecter avec un PIN existant' : 'Première connexion ? Définir un PIN'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || pin.length !== requiredPinDigits}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    <span>{isRegisteringPin ? 'Créer le PIN & Accéder au Portail' : 'Accéder au Portail Membres'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

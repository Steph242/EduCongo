import React, { useState, useEffect } from 'react';
import {
  RegisteredSchoolAccount,
  SchoolCycle,
  SchoolClassroom,
  StaffAccount,
  StaffRole,
  PermissionKey,
  SchoolSubscription,
} from '../../types';
import {
  getSchoolData,
  saveSchoolData,
  updateRegisteredAccount,
  getSchoolSubscription,
  DEFAULT_CONGO_CYCLES,
  DEFAULT_CONGO_CLASSES,
} from '../../services/accountService';
import { PERMISSION_DEFINITIONS, ROLE_DEFAULT_PERMISSIONS } from '../../data/mockStaff';
import { StaffModal } from './StaffModal';
import { SchoolSubscriptionModal } from '../Subscription/SchoolSubscriptionModal';

interface SchoolAdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolAccount: RegisteredSchoolAccount;
  onSchoolUpdated?: (updated: RegisteredSchoolAccount) => void;
  showToast: (msg: string) => void;
}

type ConfigTab = 'profile' | 'cycles' | 'classes' | 'staff' | 'subscription';

export const SchoolAdminConfigModal: React.FC<SchoolAdminConfigModalProps> = ({
  isOpen,
  onClose,
  schoolAccount,
  onSchoolUpdated,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('profile');

  // School Profile state
  const [schoolName, setSchoolName] = useState(schoolAccount.schoolName || '');
  const [slogan, setSlogan] = useState(schoolAccount.slogan || '');
  const [directorName, setDirectorName] = useState(schoolAccount.directorName || '');
  const [adminFullName, setAdminFullName] = useState(schoolAccount.adminFullName || '');
  const [workPhone, setWorkPhone] = useState(schoolAccount.workPhone || '');
  const [workEmail, setWorkEmail] = useState(schoolAccount.workEmail || '');
  const [city, setCity] = useState(schoolAccount.city || 'Brazzaville');
  const [department, setDepartment] = useState(schoolAccount.department || 'Brazzaville');
  const [arrondissement, setArrondissement] = useState(schoolAccount.arrondissement || 'Centre');
  const [logoUrl, setLogoUrl] = useState(schoolAccount.logoUrl || '');
  const [academicYear, setAcademicYear] = useState('2024 - 2025');

  // Cycles state
  const [cycles, setCycles] = useState<SchoolCycle[]>(() => {
    const data = getSchoolData(schoolAccount.schoolCode);
    return data.cycles && data.cycles.length > 0 ? data.cycles : DEFAULT_CONGO_CYCLES;
  });
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleCode, setNewCycleCode] = useState('');
  const [newCycleDesc, setNewCycleDesc] = useState('');

  // Classes state
  const [classes, setClasses] = useState<SchoolClassroom[]>(() => {
    const data = getSchoolData(schoolAccount.schoolCode);
    return data.classes && data.classes.length > 0 ? data.classes : DEFAULT_CONGO_CLASSES;
  });
  const [newClassName, setNewClassName] = useState('');
  const [newClassCycleId, setNewClassCycleId] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('');
  const [newClassSection, setNewClassSection] = useState('A');
  const [newClassCapacity, setNewClassCapacity] = useState(45);
  const [newClassRoomNumber, setNewClassRoomNumber] = useState('');

  // Staff state
  const [staffList, setStaffList] = useState<StaffAccount[]>(() => {
    const data = getSchoolData(schoolAccount.schoolCode);
    return data.staff || [];
  });
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffAccount | null>(null);

  // Subscription modal trigger
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<SchoolSubscription>(() => getSchoolSubscription(schoolAccount.schoolCode));

  useEffect(() => {
    if (isOpen) {
      const data = getSchoolData(schoolAccount.schoolCode);
      setSchoolName(schoolAccount.schoolName);
      setSlogan(schoolAccount.slogan || '');
      setDirectorName(schoolAccount.directorName || '');
      setAdminFullName(schoolAccount.adminFullName || '');
      setWorkPhone(schoolAccount.workPhone);
      setWorkEmail(schoolAccount.workEmail);
      setCity(schoolAccount.city);
      setDepartment(schoolAccount.department);
      setArrondissement(schoolAccount.arrondissement || 'Centre');
      setLogoUrl(schoolAccount.logoUrl || '');
      setAcademicYear(data.schoolSettings?.academicYear || '2024 - 2025');

      setCycles(data.cycles && data.cycles.length > 0 ? data.cycles : DEFAULT_CONGO_CYCLES);
      setClasses(data.classes && data.classes.length > 0 ? data.classes : DEFAULT_CONGO_CLASSES);
      setStaffList(data.staff || []);
      setCurrentSub(getSchoolSubscription(schoolAccount.schoolCode));
    }
  }, [isOpen, schoolAccount]);

  if (!isOpen) return null;

  // Save General Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateRegisteredAccount(schoolAccount.schoolCode, {
      schoolName,
      slogan,
      directorName,
      adminFullName,
      workPhone,
      workEmail,
      city,
      department,
      arrondissement,
      logoUrl,
    });

    saveSchoolData(schoolAccount.schoolCode, {
      schoolSettings: {
        academicYear,
        currency: 'FCFA',
        gradingScale: 20,
        passingGrade: 10,
      },
    });

    if (updated && onSchoolUpdated) {
      onSchoolUpdated(updated);
    }
    showToast("✓ Profil et paramètres de l'établissement mis à jour avec succès !");
  };

  // Add Cycle
  const handleAddCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleName.trim()) return;

    const newCycle: SchoolCycle = {
      id: `CYC-${Date.now().toString(36).toUpperCase()}`,
      name: newCycleName.trim(),
      code: newCycleCode.trim() || newCycleName.slice(0, 4).toUpperCase(),
      description: newCycleDesc.trim() || 'Cycle configuré',
      classesCount: 0,
    };

    const updated = [...cycles, newCycle];
    setCycles(updated);
    saveSchoolData(schoolAccount.schoolCode, { cycles: updated });
    setNewCycleName('');
    setNewCycleCode('');
    setNewCycleDesc('');
    showToast(`✓ Nouveau cycle "${newCycle.name}" ajouté !`);
  };

  // Delete Cycle
  const handleDeleteCycle = (id: string, name: string) => {
    if (window.confirm(`Supprimer le cycle "${name}" ? Les classes rattachées seront conservées.`)) {
      const updated = cycles.filter((c) => c.id !== id);
      setCycles(updated);
      saveSchoolData(schoolAccount.schoolCode, { cycles: updated });
      showToast(`✓ Cycle "${name}" supprimé.`);
    }
  };

  // Add Classroom
  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const selectedCycle = cycles.find((c) => c.id === newClassCycleId);

    const newCls: SchoolClassroom = {
      id: `CLS-${Date.now().toString(36).toUpperCase()}`,
      name: newClassName.trim(),
      cycleId: newClassCycleId || undefined,
      cycleName: selectedCycle?.name || 'Général',
      level: newClassLevel || newClassName.trim(),
      section: newClassSection || 'A',
      capacity: Number(newClassCapacity) || 50,
      studentCount: 0,
      classroomNumber: newClassRoomNumber || undefined,
    };

    const updated = [...classes, newCls];
    setClasses(updated);
    saveSchoolData(schoolAccount.schoolCode, { classes: updated });
    setNewClassName('');
    setNewClassLevel('');
    setNewClassRoomNumber('');
    showToast(`✓ Nouvelle classe "${newCls.name}" ajoutée !`);
  };

  // Delete Classroom
  const handleDeleteClassroom = (id: string, name: string) => {
    if (window.confirm(`Supprimer la classe "${name}" ?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      saveSchoolData(schoolAccount.schoolCode, { classes: updated });
      showToast(`✓ Classe "${name}" supprimée.`);
    }
  };

  // Save Staff
  const handleSaveStaff = (savedStaff: StaffAccount) => {
    let updated: StaffAccount[];
    const exists = staffList.some((s) => s.id === savedStaff.id);
    if (exists) {
      updated = staffList.map((s) => (s.id === savedStaff.id ? savedStaff : s));
      showToast(`✓ Compte de ${savedStaff.fullName} mis à jour.`);
    } else {
      updated = [savedStaff, ...staffList];
      showToast(`✓ Nouvel agent/enseignant ${savedStaff.fullName} ajouté avec succès !`);
    }

    setStaffList(updated);
    saveSchoolData(schoolAccount.schoolCode, { staff: updated });
    setIsStaffModalOpen(false);
    setStaffToEdit(null);
  };

  // Delete Staff
  const handleDeleteStaff = (id: string, name: string) => {
    if (window.confirm(`Supprimer le compte de "${name}" ?`)) {
      const updated = staffList.filter((s) => s.id !== id);
      setStaffList(updated);
      saveSchoolData(schoolAccount.schoolCode, { staff: updated });
      showToast(`✓ Compte de "${name}" supprimé.`);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
        <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative">
          
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-[26px]">tune</span>
              </div>
              <div>
                <h2 className="font-extrabold text-white text-lg sm:text-xl flex items-center gap-2">
                  Panneau de Configuration Administrateur
                </h2>
                <p className="text-xs text-slate-400">
                  {schoolName} • Code MEPPSA : <span className="font-mono text-indigo-300 font-bold">{schoolAccount.schoolCode}</span>
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar">
            {[
              { id: 'profile' as ConfigTab, label: '1. Profil & Établissement', icon: 'school' },
              { id: 'cycles' as ConfigTab, label: '2. Cycles & Filières', icon: 'account_tree', count: cycles.length },
              { id: 'classes' as ConfigTab, label: '3. Classes & Niveaux', icon: 'meeting_room', count: classes.length },
              { id: 'staff' as ConfigTab, label: '4. Personnel, Enseignants & Rôles', icon: 'manage_accounts', count: staffList.length },
              { id: 'subscription' as ConfigTab, label: '5. Abonnement & Adhésion', icon: 'workspace_premium' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-slate-300 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ================= TAB 1: PROFIL ÉTABLISSEMENT ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nom Officiel de l'Établissement *</label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Devise / Slogan Scolaire</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Ex: Discipline - Travail - Succès"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400 italic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nom du Proviseur / Directeur</label>
                  <input
                    type="text"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Téléphone Officiel (+242)</label>
                  <input
                    type="tel"
                    value={workPhone}
                    onChange={(e) => setWorkPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">E-mail Officiel de Contact</label>
                  <input
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Département</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Année Scolaire en cours</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2024 - 2025"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">URL du Logo Officiel (Image / Blason)</label>
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-slate-800"
                    />
                  )}
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Enregistrer les Informations
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: CYCLES D'ENSEIGNEMENT ================= */}
          {activeTab === 'cycles' && (
            <div className="space-y-6 text-xs">
              {/* Form to add a cycle */}
              <form onSubmit={handleAddCycle} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">add_circle</span>
                  Ajouter un Nouveau Cycle d'Enseignement
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nom du Cycle *</label>
                    <input
                      type="text"
                      required
                      value={newCycleName}
                      onChange={(e) => setNewCycleName(e.target.value)}
                      placeholder="Ex: Lycée Technique & Industriel"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Code / Abréviation</label>
                    <input
                      type="text"
                      value={newCycleCode}
                      onChange={(e) => setNewCycleCode(e.target.value.toUpperCase())}
                      placeholder="Ex: LYC-TECH"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono uppercase outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Description / Séries</label>
                    <input
                      type="text"
                      value={newCycleDesc}
                      onChange={(e) => setNewCycleDesc(e.target.value)}
                      placeholder="Ex: Séries F3, F4, G2..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Créer le Cycle
                  </button>
                </div>
              </form>

              {/* Cycles List */}
              <div className="space-y-3">
                <div className="font-bold text-slate-200 text-sm">Cycles Configurés pour l'Établissement ({cycles.length})</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cycles.map((cyc) => {
                    const attachedClasses = classes.filter((c) => c.cycleId === cyc.id || c.cycleName?.toLowerCase() === cyc.name.toLowerCase());
                    return (
                      <div key={cyc.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {cyc.code}
                            </span>
                            <span className="font-bold text-white text-sm">{cyc.name}</span>
                          </div>
                          {cyc.description && <p className="text-[11px] text-slate-400">{cyc.description}</p>}
                          <div className="text-[11px] text-emerald-400 font-medium pt-1">
                            {attachedClasses.length} classe(s) rattachée(s)
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCycle(cyc.id, cyc.name)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Supprimer ce cycle"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: CLASSES & NIVEAUX ================= */}
          {activeTab === 'classes' && (
            <div className="space-y-6 text-xs">
              {/* Form to add a class */}
              <form onSubmit={handleAddClassroom} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">add_circle</span>
                  Créer une Nouvelle Classe / Division
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Nom de la Classe *</label>
                    <input
                      type="text"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="Ex: Terminale D2, 3ème B..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Cycle de Rattachement</label>
                    <select
                      value={newClassCycleId}
                      onChange={(e) => setNewClassCycleId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                    >
                      <option value="">Sélectionner un cycle</option>
                      {cycles.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Niveau / Degré</label>
                    <input
                      type="text"
                      value={newClassLevel}
                      onChange={(e) => setNewClassLevel(e.target.value)}
                      placeholder="Ex: Terminale, 1ère, 3ème..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Section / Division</label>
                    <input
                      type="text"
                      value={newClassSection}
                      onChange={(e) => setNewClassSection(e.target.value)}
                      placeholder="A, B, C, D..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Capacité Maximale d'Élèves</label>
                    <input
                      type="number"
                      value={newClassCapacity}
                      onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">N° de Salle / Bâtiment</label>
                    <input
                      type="text"
                      value={newClassRoomNumber}
                      onChange={(e) => setNewClassRoomNumber(e.target.value)}
                      placeholder="Ex: Salle 104 - Bâtiment B"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Ajouter la Classe
                  </button>
                </div>
              </form>

              {/* Classes Table */}
              <div className="space-y-3">
                <div className="font-bold text-slate-200 text-sm">Classes de l'Établissement ({classes.length})</div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Nom de la Classe</th>
                        <th className="py-3 px-4">Cycle</th>
                        <th className="py-3 px-4">Niveau</th>
                        <th className="py-3 px-4 text-center">Capacité</th>
                        <th className="py-3 px-4">Salle</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-normal">
                      {classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{cls.name}</td>
                          <td className="py-3 px-4 text-indigo-300">{cls.cycleName || 'Général'}</td>
                          <td className="py-3 px-4 text-slate-300">{cls.level}</td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{cls.capacity} places</td>
                          <td className="py-3 px-4 text-slate-400">{cls.classroomNumber || 'Non définie'}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteClassroom(cls.id, cls.name)}
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              title="Supprimer la classe"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: PERSONNEL, ENSEIGNANTS & RÔLES ================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Comptes du Personnel & Enseignants</h3>
                  <p className="text-slate-400 text-xs">
                    Création des profils, attribution des rôles (Directeur, Censeur, Enseignant, Comptable, Surveillant) et matrice de permissions.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStaffToEdit(null);
                    setIsStaffModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Créer un Profil Personnel</span>
                </button>
              </div>

              {/* Staff Table */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Agent / Enseignant</th>
                      <th className="py-3 px-4">Matricule & Rôle</th>
                      <th className="py-3 px-4">Matière / Discipline</th>
                      <th className="py-3 px-4">Classes Affectées</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-normal">
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Aucun agent ou enseignant configuré pour le moment. Cliquez sur "Créer un Profil Personnel" pour commencer.
                        </td>
                      </tr>
                    ) : (
                      staffList.map((st) => (
                        <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white">{st.fullName}</div>
                            <div className="text-[10px] text-slate-400">{st.department}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-indigo-300 font-bold">{st.matricule}</div>
                            <div className="text-[10px] text-emerald-400 font-semibold">{st.roleTitle || st.role}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{st.subject || '—'}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {st.classes && st.classes.length > 0 ? (
                                st.classes.map((c) => (
                                  <span key={c} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-200">{st.phone}</div>
                            <div className="text-[10px] text-slate-400">{st.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.accessStatus === 'Actif'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {st.accessStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setStaffToEdit(st);
                                  setIsStaffModalOpen(true);
                                }}
                                className="p-1 rounded-lg text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
                                title="Modifier le profil & rôles"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(st.id, st.fullName)}
                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                                title="Supprimer"
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
          )}

          {/* ================= TAB 5: ABONNEMENT & ADHÉSION ================= */}
          {activeTab === 'subscription' && (
            <div className="space-y-6 text-xs">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Abonnement de l'Établissement</div>
                    <div className="text-xl font-extrabold text-white mt-1">{currentSub.planName}</div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Tarification conforme : Adhésion Essai 14J (2 500 FCFA), Standard (10 000 FCFA/mois), Premium (15 000 FCFA/mois).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    <span>Gérer / Changer de Formule</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="text-slate-400 text-[11px]">Statut de Facturation</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5 capitalize">{currentSub.status}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="text-slate-400 text-[11px]">Adhésion 2 500 FCFA</div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {currentSub.membershipFeePaid ? '✓ Réglée' : 'En attente'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="text-slate-400 text-[11px]">Prochaine Échéance</div>
                    <div className="font-bold text-indigo-300 text-sm mt-0.5">
                      {currentSub.nextBillingDate ? new Date(currentSub.nextBillingDate).toLocaleDateString('fr-FR') : 'Non planifiée'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <StaffModal
          isOpen={isStaffModalOpen}
          onClose={() => {
            setIsStaffModalOpen(false);
            setStaffToEdit(null);
          }}
          onSave={handleSaveStaff}
          staffToEdit={staffToEdit}
          cityName={city}
        />
      )}

      {/* Subscription Modal */}
      {isSubModalOpen && (
        <SchoolSubscriptionModal
          isOpen={isSubModalOpen}
          onClose={() => {
            setIsSubModalOpen(false);
            setCurrentSub(getSchoolSubscription(schoolAccount.schoolCode));
          }}
          schoolName={schoolName}
          schoolCode={schoolAccount.schoolCode}
          city={city}
          onSubscriptionUpdated={(updated) => setCurrentSub(updated)}
          showToast={showToast}
        />
      )}
    </>
  );
};

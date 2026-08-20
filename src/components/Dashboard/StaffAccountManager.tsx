import React, { useState } from 'react';
import { StaffAccount, AccessStatus, StaffRole } from '../../types';
import { INITIAL_STAFF_ACCOUNTS, PERMISSION_DEFINITIONS } from '../../data/mockStaff';
import { StaffModal } from './StaffModal';
import { RevokeAccessModal } from './RevokeAccessModal';
import { StaffAccessCardModal } from './StaffAccessCardModal';

interface StaffAccountManagerProps {
  schoolName: string;
  schoolCode: string;
  cityName: string;
  showToast: (msg: string) => void;
}

type StaffViewSubTab = 'accounts' | 'matrix' | 'audit';

export const StaffAccountManager: React.FC<StaffAccountManagerProps> = ({
  schoolName,
  schoolCode,
  cityName,
  showToast,
}) => {
  const [staffList, setStaffList] = useState<StaffAccount[]>(INITIAL_STAFF_ACCOUNTS);
  const [subTab, setSubTab] = useState<StaffViewSubTab>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffAccount | null>(null);

  const [revokeModalState, setRevokeModalState] = useState<{
    isOpen: boolean;
    staff: StaffAccount | null;
    targetStatus: AccessStatus;
  }>({
    isOpen: false,
    staff: null,
    targetStatus: 'Suspendu',
  });

  const [accessCardModalState, setAccessCardModalState] = useState<{
    isOpen: boolean;
    staff: StaffAccount | null;
  }>({
    isOpen: false,
    staff: null,
  });

  // Filter staff list
  const filteredStaff = staffList.filter((st) => {
    const matchesSearch =
      st.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.phone.includes(searchTerm) ||
      (st.subject && st.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'teachers'
        ? st.role.startsWith('enseignant')
        : roleFilter === 'direction'
        ? ['proviseur', 'censeur'].includes(st.role)
        : roleFilter === 'vie_scolaire'
        ? ['surveillant_general', 'infirmier'].includes(st.role)
        : roleFilter === 'finance'
        ? ['comptable', 'secretaire'].includes(st.role)
        : st.role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' || st.accessStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats calculation
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.accessStatus === 'Actif').length;
  const teachersCount = staffList.filter((s) => s.role.startsWith('enseignant')).length;
  const suspendedCount = staffList.filter((s) => s.accessStatus === 'Suspendu' || s.accessStatus === 'Révoqué').length;

  const handleSaveStaff = (savedStaff: StaffAccount) => {
    const exists = staffList.some((s) => s.id === savedStaff.id);
    if (exists) {
      setStaffList(staffList.map((s) => (s.id === savedStaff.id ? savedStaff : s)));
      showToast(`Compte de ${savedStaff.fullName} mis à jour avec succès !`);
    } else {
      setStaffList([savedStaff, ...staffList]);
      showToast(`Nouveau compte créé pour ${savedStaff.fullName} (SMS envoyé au ${savedStaff.phone}) !`);
    }
  };

  const handleUpdateStatus = (staffId: string, newStatus: AccessStatus, reason?: string) => {
    setStaffList(
      staffList.map((s) =>
        s.id === staffId
          ? {
              ...s,
              accessStatus: newStatus,
              revocationReason: reason || s.revocationReason,
            }
          : s
      )
    );
    const target = staffList.find((s) => s.id === staffId);
    showToast(
      `Accès de ${target?.fullName || 'l\'agent'} défini sur : ${newStatus.toUpperCase()}`
    );
  };

  const handleResetPassword = (staff: StaffAccount) => {
    const newPass = `Edu#${Math.floor(100000 + Math.random() * 900000)}`;
    setStaffList(
      staffList.map((s) =>
        s.id === staff.id ? { ...s, temporaryPassword: newPass } : s
      )
    );
    showToast(`Nouveau mot de passe temporaire (${newPass}) envoyé par SMS à ${staff.phone}`);
  };

  return (
    <div className="space-y-6">
      {/* Staff KPI Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Personnel
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{totalStaff}</div>
          <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {activeStaff} comptes actifs
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Corps Enseignant
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{teachersCount}</div>
          <div className="mt-2 text-xs text-slate-400">
            Titulaires & vacataires affectés
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Comptes Restreints
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">shield_person</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{suspendedCount}</div>
          <div className="mt-2 text-xs text-slate-400">
            Suspendus ou révoqués
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sécurité & MEPPSA
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">2FA + SMS (+242)</div>
          <div className="mt-2 text-xs text-teal-400 font-medium">
            Chiffrement conforme DDEPSA
          </div>
        </div>
      </div>

      {/* Control Tabs Header */}
      <div className="bg-white/[0.04] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'accounts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            Comptes & Affectations ({staffList.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'matrix'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock_person</span>
            Matrice des Permissions
          </button>
          <button
            type="button"
            onClick={() => setSubTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              subTab === 'audit'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Journal d'Accès & Sécurité
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setStaffToEdit(null);
              setIsStaffModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Créer un Compte
          </button>
        </div>
      </div>

      {/* ================= SUB-TAB 1: ACCOUNTS LIST ================= */}
      {subTab === 'accounts' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white/[0.04] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, matricule, matière, tél (+242)..."
                  className="w-full pl-9 pr-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
                />
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-white/15 rounded-xl text-xs text-slate-200 focus:border-emerald-400 outline-none bg-slate-900/80 cursor-pointer"
              >
                <option value="all">Tous les corps de métier</option>
                <option value="teachers">Corps Enseignant</option>
                <option value="direction">Direction & Censure</option>
                <option value="vie_scolaire">Vie Scolaire & Discipline</option>
                <option value="finance">Comptabilité & Secrétariat</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-white/15 rounded-xl text-xs text-slate-200 focus:border-emerald-400 outline-none bg-slate-900/80 cursor-pointer"
              >
                <option value="all">Tous les statuts d'accès</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Révoqué">Révoqué</option>
              </select>
            </div>

            {/* Layout switch & count */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {filteredStaff.length} membre(s)
              </span>
              <div className="flex items-center bg-white/[0.05] p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewLayout('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewLayout === 'table'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vue Tableau"
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewLayout === 'grid'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vue Grille / Cartes"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW: TABLE LAYOUT */}
          {viewLayout === 'table' && (
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.06] border-b border-white/10 text-slate-300 font-semibold">
                    <tr>
                      <th className="p-3.5">Matricule & Identité</th>
                      <th className="p-3.5">Fonction & Service</th>
                      <th className="p-3.5">Matière / Affectations</th>
                      <th className="p-3.5">Téléphone (+242) & E-mail</th>
                      <th className="p-3.5">Statut Accès</th>
                      <th className="p-3.5">Dernière Connexion</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStaff.map((st) => (
                      <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                        {/* Identity */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {st.photoUrl ? (
                                <img
                                  src={st.photoUrl}
                                  alt={st.fullName}
                                  className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shadow-sm bg-slate-800"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-xs border border-emerald-400/30">
                                  {st.fullName.charAt(0)}
                                </div>
                              )}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                                  st.accessStatus === 'Actif'
                                    ? 'bg-emerald-400'
                                    : st.accessStatus === 'Suspendu'
                                    ? 'bg-amber-400'
                                    : 'bg-rose-400'
                                }`}
                              ></span>
                            </div>
                            <div>
                              <div className="font-mono text-[11px] font-bold text-indigo-300">
                                {st.matricule}
                              </div>
                              <div className="font-bold text-slate-100 text-xs sm:text-sm leading-tight">
                                {st.fullName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Inscrit le {st.joinDate}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Dept */}
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{st.roleTitle}</div>
                          <div className="text-slate-400 text-[11px]">{st.department}</div>
                        </td>

                        {/* Subject / Classes */}
                        <td className="p-3.5">
                          {st.subject ? (
                            <div>
                              <span className="font-semibold text-emerald-400">
                                {st.subject}
                              </span>
                              {st.classes && st.classes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {st.classes.map((c, i) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 text-[10px]"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Administration générale</span>
                          )}
                        </td>

                        {/* Contacts */}
                        <td className="p-3.5 text-slate-300">
                          <div className="font-mono text-white font-medium">{st.phone}</div>
                          <div className="text-[11px] text-slate-400">{st.email}</div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              st.accessStatus === 'Actif'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : st.accessStatus === 'Suspendu'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {st.accessStatus}
                          </span>
                        </td>

                        {/* Last login */}
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {st.lastLogin}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Badge */}
                            <button
                              type="button"
                              onClick={() => setAccessCardModalState({ isOpen: true, staff: st })}
                              title="Voir la carte d'accès officielle"
                              className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/15 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">badge</span>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setStaffToEdit(st);
                                setIsStaffModalOpen(true);
                              }}
                              title="Modifier les droits et informations"
                              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>

                            {/* Password reset / SMS */}
                            <button
                              type="button"
                              onClick={() => handleResetPassword(st)}
                              title="Renvoyer identifiants par SMS (+242)"
                              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">key</span>
                            </button>

                            {/* Suspend / Revoke */}
                            {st.accessStatus === 'Actif' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setRevokeModalState({
                                    isOpen: true,
                                    staff: st,
                                    targetStatus: 'Suspendu',
                                  })
                                }
                                title="Suspendre l'accès"
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  lock
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setRevokeModalState({
                                    isOpen: true,
                                    staff: st,
                                    targetStatus: 'Actif',
                                  })
                                }
                                title="Réactiver l'accès"
                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 rounded-lg transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  lock_open
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: GRID / CARD LAYOUT */}
          {viewLayout === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((st) => (
                <div
                  key={st.id}
                  className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-emerald-400/40 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4 flex flex-col justify-between group hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)]"
                >
                  <div className="space-y-3.5">
                    {/* Header with Photo, Name and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {st.photoUrl ? (
                            <img
                              src={st.photoUrl}
                              alt={st.fullName}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] bg-slate-800"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-lg text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/30">
                              {st.fullName.charAt(0)}
                            </div>
                          )}
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                              st.accessStatus === 'Actif'
                                ? 'bg-emerald-400'
                                : st.accessStatus === 'Suspendu'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          ></span>
                        </div>
                        <div>
                          <div className="font-mono text-[10.5px] font-bold text-indigo-300">
                            {st.matricule}
                          </div>
                          <h4 className="font-bold text-white text-sm leading-snug">
                            {st.fullName}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Depuis {st.joinDate}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          st.accessStatus === 'Actif'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : st.accessStatus === 'Suspendu'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {st.accessStatus}
                      </span>
                    </div>

                    {/* Role & Department info */}
                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-400">{st.roleTitle}</span>
                        {st.subject && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold text-[10px]">
                            {st.subject}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-500">corporate_fare</span>
                        {st.department}
                      </div>
                    </div>

                    {/* Contacts info */}
                    <div className="space-y-1 text-xs text-slate-300">
                      <p className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-[14px] text-emerald-400">
                          phone
                        </span>
                        {st.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                        <span className="material-symbols-outlined text-[14px] text-indigo-400">
                          mail
                        </span>
                        {st.email}
                      </p>
                    </div>

                    {/* Classes assignées */}
                    {st.classes && st.classes.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[10px] text-slate-400 block mb-1 font-semibold">
                          Classes assignées :
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {st.classes.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-white/[0.06] border border-white/10 text-slate-200 text-[10px] rounded-lg font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons footer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setAccessCardModalState({ isOpen: true, staff: st })}
                      className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    >
                      <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
                      <span>Carte d'Accès QR</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleResetPassword(st)}
                        title="Renvoyer mot de passe par SMS"
                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/15 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">key</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStaffToEdit(st);
                          setIsStaffModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 rounded-lg transition-colors cursor-pointer"
                        title="Modifier le compte"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      {st.accessStatus === 'Actif' ? (
                        <button
                          type="button"
                          onClick={() =>
                            setRevokeModalState({
                              isOpen: true,
                              staff: st,
                              targetStatus: 'Suspendu',
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                          title="Suspendre l'accès"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setRevokeModalState({
                              isOpen: true,
                              staff: st,
                              targetStatus: 'Actif',
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/15 rounded-lg transition-colors cursor-pointer"
                          title="Réactiver l'accès"
                        >
                          <span className="material-symbols-outlined text-[16px]">lock_open</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 2: PERMISSIONS MATRIX ================= */}
      {subTab === 'matrix' && (
        <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-6">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">policy</span>
              Matrice des Habilitations par Profil (MEPPSA République du Congo)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configuration de la sécurité selon les directives ministérielles pour la protection des données scolaires.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-white/10">
              <thead className="bg-white/[0.06] border-b border-white/10 text-slate-200">
                <tr>
                  <th className="p-3 border-r border-white/10">Modules & Droits</th>
                  <th className="p-3 text-center border-r border-white/10">Proviseur / Direction</th>
                  <th className="p-3 text-center border-r border-white/10">Censeur des Études</th>
                  <th className="p-3 text-center border-r border-white/10">Professeurs</th>
                  <th className="p-3 text-center border-r border-white/10">Surveillant Général</th>
                  <th className="p-3 text-center">Comptabilité / Écolage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {Object.entries(PERMISSION_DEFINITIONS).map(([key, info]) => (
                  <tr key={key} className="hover:bg-white/[0.02]">
                    <td className="p-3 border-r border-white/10">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">
                          {info.icon}
                        </span>
                        {info.label}
                      </div>
                      <div className="text-[10px] text-slate-400">{info.description}</div>
                    </td>

                    {/* Proviseur */}
                    <td className="p-3 text-center border-r border-white/10">
                      <span className="inline-block w-5 h-5 rounded bg-emerald-500 text-slate-950 font-bold leading-5">
                        ✓
                      </span>
                    </td>

                    {/* Censeur */}
                    <td className="p-3 text-center border-r border-white/10">
                      {['saisie_notes', 'validation_bulletins', 'appel_presences', 'gestion_inscriptions', 'rapports_meppsa'].includes(key) ? (
                        <span className="inline-block w-5 h-5 rounded bg-emerald-500 text-slate-950 font-bold leading-5">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">-</span>
                      )}
                    </td>

                    {/* Teachers */}
                    <td className="p-3 text-center border-r border-white/10">
                      {['saisie_notes', 'appel_presences'].includes(key) ? (
                        <span className="inline-block w-5 h-5 rounded bg-emerald-500 text-slate-950 font-bold leading-5">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">-</span>
                      )}
                    </td>

                    {/* Surveillant */}
                    <td className="p-3 text-center border-r border-white/10">
                      {['appel_presences', 'gestion_inscriptions', 'communication_sms'].includes(key) ? (
                        <span className="inline-block w-5 h-5 rounded bg-emerald-500 text-slate-950 font-bold leading-5">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">-</span>
                      )}
                    </td>

                    {/* Comptable */}
                    <td className="p-3 text-center">
                      {['encaissement_ecolage', 'gestion_inscriptions'].includes(key) ? (
                        <span className="inline-block w-5 h-5 rounded bg-emerald-500 text-slate-950 font-bold leading-5">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-600 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: AUDIT & SECURITY ================= */}
      {subTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-400">security</span>
              Journal des Événements & Audit de Sécurité des Comptes
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Traçabilité en temps réel des accès, modifications de permissions et connexions du personnel.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div>
                    <span className="font-semibold text-white">Connexion réussie :</span>{' '}
                    <span className="text-slate-300">Prof. Dieudonné Mikala</span> (Saisie notes Trimestre 1)
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">Aujourd'hui 11:30</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <div>
                    <span className="font-semibold text-white">Création de compte :</span>{' '}
                    <span className="text-slate-300">M. Rodrigue Samba (Sciences Physiques)</span>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">Hier 15:10</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <div>
                    <span className="font-semibold text-white">Suspension temporaire :</span>{' '}
                    <span className="text-slate-300">M. Jean-Baptiste Kolélas (Renouvellement contrat)</span>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">10 Nov 2024</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div>
                    <span className="font-semibold text-white">Validation bordereau MEPPSA :</span>{' '}
                    <span className="text-slate-300">Censeur Rodrigue Bouanga</span>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">08 Nov 2024</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSave={handleSaveStaff}
        staffToEdit={staffToEdit}
        cityName={cityName}
      />

      <RevokeAccessModal
        isOpen={revokeModalState.isOpen}
        onClose={() => setRevokeModalState({ ...revokeModalState, isOpen: false })}
        staff={revokeModalState.staff}
        targetStatus={revokeModalState.targetStatus}
        onConfirm={handleUpdateStatus}
      />

      <StaffAccessCardModal
        isOpen={accessCardModalState.isOpen}
        onClose={() => setAccessCardModalState({ ...accessCardModalState, isOpen: false })}
        staff={accessCardModalState.staff}
        schoolName={schoolName}
        schoolCode={schoolCode}
        city={cityName}
      />
    </div>
  );
};

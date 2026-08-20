import React, { useState, useMemo } from 'react';
import { RegisteredSchoolAccount, MicroserviceHealth, DeveloperFeatureFlag, Student, StaffAccount } from '../../types';
import {
  getRegisteredSchools,
  saveRegisteredSchools,
  updateSchoolStatus,
  deleteSchoolAccount,
  getAuditLogs,
  addAuditLog,
  calculateNationalStats,
  resetDevSandbox,
  INITIAL_MICROSERVICES,
  INITIAL_FEATURE_FLAGS,
} from '../../services/devControlService';
import { CONGO_DEPARTMENTS, CONGO_CITIES } from '../../data/mockData';

interface DevControlPanelProps {
  onBackToApp: () => void;
  onImpersonateSchool: (school: RegisteredSchoolAccount) => void;
  onOpenPortal: (school: RegisteredSchoolAccount) => void;
}

type DevTab = 'schools' | 'audit' | 'microservices' | 'console' | 'broadcast' | 'sandbox';

export const DevControlPanel: React.FC<DevControlPanelProps> = ({
  onBackToApp,
  onImpersonateSchool,
  onOpenPortal,
}) => {
  const [activeTab, setActiveTab] = useState<DevTab>('schools');
  const [schools, setSchools] = useState<RegisteredSchoolAccount[]>(getRegisteredSchools);
  const [auditLogs, setAuditLogs] = useState(getAuditLogs);
  const [microservices, setMicroservices] = useState<MicroserviceHealth[]>(INITIAL_MICROSERVICES);
  const [featureFlags, setFeatureFlags] = useState<DeveloperFeatureFlag[]>(INITIAL_FEATURE_FLAGS);

  // Filters for schools table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Selected school for inspection modal
  const [inspectingSchool, setInspectingSchool] = useState<RegisteredSchoolAccount | null>(null);

  // New School Modal state
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [newSchoolForm, setNewSchoolForm] = useState({
    schoolName: '',
    schoolCode: '',
    schoolType: 'lycee',
    department: 'Brazzaville',
    city: 'Brazzaville',
    arrondissement: '',
    directorName: '',
    workEmail: '',
    workPhone: '+242 06 ',
    slogan: 'Discipline - Travail - Succès',
    subdomain: '',
  });

  // SQL Query console simulator state
  const [sqlQuery, setSqlQuery] = useState("SELECT id, schoolName, city, status FROM schools WHERE department = 'Brazzaville';");
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Broadcast simulator state
  const [broadcastForm, setBroadcastForm] = useState({
    title: 'Circulaire Ministérielle MEPPSA N° 2024-88',
    message: 'Calendrier des compositions du 1er Trimestre arrêté du 02 au 06 Décembre 2024.',
    targetDepartment: 'all',
    priority: 'urgent' as 'urgent' | 'high' | 'normal',
  });
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);

  // Refresh data helper
  const refreshData = () => {
    setSchools(getRegisteredSchools());
    setAuditLogs(getAuditLogs());
  };

  // National metrics
  const stats = useMemo(() => calculateNationalStats(schools), [schools]);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const matchesSearch =
        s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.schoolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.directorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = filterDepartment === 'all' || s.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      const matchesType = filterType === 'all' || s.schoolType === filterType;

      return matchesSearch && matchesDept && matchesStatus && matchesType;
    });
  }, [schools, searchQuery, filterDepartment, filterStatus, filterType]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Actif':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Validé':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'En attente':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Suspendu':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  // Status changer handler
  const handleStatusChange = (schoolId: string, newStatus: 'Actif' | 'En attente' | 'Validé' | 'Suspendu') => {
    updateSchoolStatus(schoolId, newStatus);
    refreshData();
  };

  // Delete school handler
  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    if (window.confirm(`Confirmer la suppression irréversible de l'établissement "${schoolName}" ?`)) {
      deleteSchoolAccount(schoolId);
      refreshData();
    }
  };

  // Create school handler
  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolForm.schoolName || !newSchoolForm.schoolCode) return;

    const newSchool: RegisteredSchoolAccount = {
      id: `SCH-00${schools.length + 1}`,
      schoolName: newSchoolForm.schoolName,
      schoolCode: newSchoolForm.schoolCode.toUpperCase(),
      schoolType: newSchoolForm.schoolType,
      department: newSchoolForm.department,
      city: newSchoolForm.city,
      arrondissement: newSchoolForm.arrondissement || 'Centre-ville',
      directorName: newSchoolForm.directorName || 'Directeur Général',
      adminFullName: newSchoolForm.directorName || 'Directeur Général',
      adminRole: 'proviseur',
      workEmail: newSchoolForm.workEmail || `contact@${newSchoolForm.schoolCode.toLowerCase()}.educongo.cg`,
      personalEmail: 'admin@educongo.cg',
      workPhone: newSchoolForm.workPhone,
      personalPhone: '+242 05 500 00 00',
      slogan: newSchoolForm.slogan || 'Discipline - Travail - Succès',
      subdomain: newSchoolForm.subdomain || newSchoolForm.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      isEmailVerified: true,
      isPhoneVerified: true,
      registeredAt: new Date().toISOString(),
      status: 'Actif',
      documents: {
        agrementFile: 'agrement_provisionne_dev.pdf',
        statutsFile: 'statuts_provisionnes.pdf',
        identityFile: 'cni_directeur.pdf',
      },
    };

    const updated = [newSchool, ...schools];
    saveRegisteredSchools(updated);
    addAuditLog({
      level: 'SECURITY',
      action: 'Création manuelle d’un établissement (Console Développeur)',
      category: 'SCHOOL_MGMT',
      actor: {
        id: 'DEV-ROOT',
        name: 'Super-Admin Développeur',
        role: 'Root Developer',
        ipAddress: '127.0.0.1 (Local Console)',
      },
      target: {
        type: 'school',
        id: newSchool.id,
        name: newSchool.schoolName,
      },
      details: `Provisionnement direct de l'établissement ${newSchool.schoolName} avec le code ${newSchool.schoolCode}.`,
      status: 'SUCCESS',
    });

    refreshData();
    setIsAddSchoolModalOpen(false);
    setNewSchoolForm({
      schoolName: '',
      schoolCode: '',
      schoolType: 'lycee',
      department: 'Brazzaville',
      city: 'Brazzaville',
      arrondissement: '',
      directorName: '',
      workEmail: '',
      workPhone: '+242 06 ',
      slogan: 'Discipline - Travail - Succès',
      subdomain: '',
    });
  };

  // SQL Query execution simulator
  const handleExecuteSql = () => {
    setSqlError(null);
    const query = sqlQuery.trim().toLowerCase();

    if (query.includes('schools')) {
      let res = [...schools];
      if (query.includes('brazzaville')) {
        res = res.filter((s) => s.department.toLowerCase().includes('brazzaville') || s.city.toLowerCase().includes('brazzaville'));
      } else if (query.includes('pointe-noire')) {
        res = res.filter((s) => s.department.toLowerCase().includes('pointe') || s.city.toLowerCase().includes('pointe'));
      }
      setSqlResult(res);
    } else if (query.includes('audit')) {
      setSqlResult(auditLogs.slice(0, 10));
    } else if (query.includes('count')) {
      setSqlResult([{ total_schools: schools.length, total_students: stats.totalStudentsNational, total_teachers: stats.totalTeachersNational }]);
    } else {
      setSqlResult(schools.slice(0, 5));
    }
  };

  // Broadcast sender
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog({
      level: 'MEPPSA',
      action: `Diffusion Nationale Alerte Ministérielle : ${broadcastForm.title}`,
      category: 'SYSTEM',
      actor: {
        id: 'DEV-MEPPSA',
        name: 'Super-Admin Ministère / Développeur',
        role: 'Direction des Systèmes d’Information',
        ipAddress: '10.0.1.1 (MEPPSA Secure Hub)',
      },
      details: `Message diffusé aux établissements (${broadcastForm.targetDepartment === 'all' ? 'Tous départements' : broadcastForm.targetDepartment}) : "${broadcastForm.message}"`,
      status: 'SUCCESS',
    });
    refreshData();
    setBroadcastSuccessMessage(`Alerte ministérielle diffusée avec succès à ${broadcastForm.targetDepartment === 'all' ? 'l’ensemble des 12 départements du Congo' : broadcastForm.targetDepartment} !`);
    setTimeout(() => setBroadcastSuccessMessage(null), 5000);
  };

  // Ping microservice simulator
  const handlePingService = (serviceId: string) => {
    setMicroservices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const newLatency = Math.floor(20 + Math.random() * 150);
          return {
            ...s,
            latencyMs: newLatency,
            lastChecked: "À l'instant",
          };
        }
        return s;
      })
    );
  };

  // Toggle Feature Flag
  const handleToggleFlag = (flagId: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => {
        if (f.id === flagId) {
          const updated = { ...f, enabled: !f.enabled };
          addAuditLog({
            level: 'SECURITY',
            action: `Modification Feature Flag : ${f.name} -> ${updated.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`,
            category: 'SECURITY',
            actor: {
              id: 'DEV-ROOT',
              name: 'Super-Admin Développeur',
              role: 'Root',
            },
            details: `Le drapeau expérimental "${f.name}" a été ${updated.enabled ? 'activé' : 'désactivé'}.`,
            status: 'SUCCESS',
          });
          return updated;
        }
        return f;
      })
    );
    setTimeout(refreshData, 100);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-16">
      {/* Top Root Bar */}
      <div className="border-b border-indigo-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <span className="material-symbols-outlined text-white text-[24px]">terminal</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-base sm:text-lg tracking-wide flex items-center gap-1.5">
                EduCongo Control Panel <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">ROOT DEV & SUPER ADMIN</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Surveillance nationale, audit complet, gestion des établissements & console développeur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CLUSTER CONGO BZV: CONNECTÉ (LATENCE 18ms)
          </div>

          <button
            type="button"
            onClick={onBackToApp}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/15 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Retour à l'Application
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Établissements</span>
              <span className="material-symbols-outlined text-indigo-400 text-[20px]">domain</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.totalRegisteredSchools}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check</span>
              {stats.activeSchools} actifs • {stats.pendingSchools} en attente
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Élèves Recensés</span>
              <span className="material-symbols-outlined text-blue-400 text-[20px]">school</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.totalStudentsNational.toLocaleString()}</div>
            <div className="text-[11px] text-blue-400 font-semibold mt-1">
              Sur 12 Départements
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Corps Enseignant</span>
              <span className="material-symbols-outlined text-purple-400 text-[20px]">badge</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.totalTeachersNational.toLocaleString()}</div>
            <div className="text-[11px] text-purple-400 font-semibold mt-1">
              Titulaires & Vacataires
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Volume FCFA Encaissé</span>
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">payments</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {(stats.totalTuitionCollectedFCFA / 1000000).toFixed(1)}M <span className="text-xs font-normal">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">
              MTN MoMo {stats.momoPercentage}% • Airtel {stats.airtelPercentage}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Assiduité Moyenne</span>
              <span className="material-symbols-outlined text-teal-400 text-[20px]">how_to_reg</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300">{stats.averageNationalAttendance}%</div>
            <div className="text-[11px] text-teal-400 font-semibold mt-1">
              Pointages biométriques & présence
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Microservices</span>
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">dns</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">7 / 7 OK</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              Passerelles MTN & Airtel Live
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar">
          {[
            { id: 'schools', label: 'Établissements Inscrits', icon: 'domain', count: schools.length },
            { id: 'audit', label: 'Journal d’Audit & Sécurité', icon: 'security', count: auditLogs.length },
            { id: 'microservices', label: 'Microservices & Passerelles', icon: 'hub', count: microservices.length },
            { id: 'console', label: 'Console SQL & Feature Flags', icon: 'code' },
            { id: 'broadcast', label: 'Alertes Ministérielles MEPPSA', icon: 'campaign' },
            { id: 'sandbox', label: 'Sandbox & Restauration', icon: 'database' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DevTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30'
                  : 'text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ==================== TAB 1: REGISTERED SCHOOLS MANAGEMENT ==================== */}
        {activeTab === 'schools' && (
          <div className="space-y-4">
            {/* Filter and Action Header */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, code, ville, proviseur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
                  />
                </div>

                {/* Filter Dept */}
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-slate-200 outline-none"
                >
                  <option value="all">Tous Départements (12)</option>
                  {CONGO_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-slate-200 outline-none"
                >
                  <option value="all">Tous Statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Validé">Validé</option>
                  <option value="En attente">En attente</option>
                  <option value="Suspendu">Suspendu</option>
                </select>

                {/* Filter Type */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-slate-200 outline-none"
                >
                  <option value="all">Tous Niveaux</option>
                  <option value="lycee">Lycée Général</option>
                  <option value="technique">Lycée Technique</option>
                  <option value="primaire_college">Primaire & Collège</option>
                  <option value="primaire">Primaire</option>
                  <option value="secondaire">Collège</option>
                  <option value="superieur">Supérieur / CFP</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Ajouter Établissement (Dev)
                </button>
              </div>
            </div>

            {/* Schools Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Établissement & Devise</th>
                      <th className="py-3.5 px-4">Code MEPPSA</th>
                      <th className="py-3.5 px-4">Localisation</th>
                      <th className="py-3.5 px-4">Direction / Contact</th>
                      <th className="py-3.5 px-4">Sous-Domaine</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Actions Développeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-normal">
                    {filteredSchools.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=100&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-white/15 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{s.schoolName}</div>
                              {s.slogan && (
                                <div className="text-[11px] text-yellow-300/90 italic font-serif">
                                  « {s.slogan} »
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 capitalize">
                                Type: {s.schoolType} • Créé le {new Date(s.registeredAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-400/20">
                            {s.schoolCode}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">{s.city}</div>
                          <div className="text-[11px] text-slate-400">{s.department}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">{s.directorName}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">{s.workPhone}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{s.workEmail}</div>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => onOpenPortal(s)}
                            className="font-mono text-emerald-400 hover:text-emerald-300 text-[11px] flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>{s.subdomain || 'etablissement'}.educongo.cg</span>
                            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={s.status}
                            onChange={(e) => handleStatusChange(s.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-full border text-[11px] font-bold outline-none cursor-pointer ${getStatusBadge(s.status)}`}
                          >
                            <option value="Actif" className="bg-slate-900 text-emerald-400">Actif</option>
                            <option value="Validé" className="bg-slate-900 text-blue-400">Validé</option>
                            <option value="En attente" className="bg-slate-900 text-amber-400">En attente</option>
                            <option value="Suspendu" className="bg-slate-900 text-rose-400">Suspendu</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Impersonate Button */}
                            <button
                              type="button"
                              onClick={() => onImpersonateSchool(s)}
                              title="Prendre le contrôle (Se connecter en tant que cette école)"
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)] cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">bolt</span>
                              Prendre Contrôle
                            </button>

                            {/* Inspect details */}
                            <button
                              type="button"
                              onClick={() => setInspectingSchool(s)}
                              title="Inspecter le dossier"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSchool(s.id, s.schoolName)}
                              title="Supprimer définitivement"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: AUDIT TRAIL & SYSTEM LOGS ==================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">shield_lock</span>
                  Journal d’Audit & Traçabilité Cryptographique National
                </h3>
                <p className="text-xs text-slate-400">
                  Enregistrement inaltérable des connexions, flux Mobile Money, notes et validations officielles
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addAuditLog({
                      level: 'SECURITY',
                      action: 'Audit de sécurité manuel déclenché par l’administrateur',
                      category: 'SECURITY',
                      actor: {
                        id: 'DEV-ROOT',
                        name: 'Super-Admin Développeur',
                        role: 'Root',
                        ipAddress: '154.72.164.22',
                      },
                      details: 'Vérification de l’intégrité des 8 bases de données d’établissements. Zéro anomalie détectée.',
                      status: 'SUCCESS',
                    });
                    refreshData();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  Injecter Événement d’Audit
                </button>
              </div>
            </div>

            {/* Audit Logs List */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/[0.03] transition-colors text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                        log.level === 'FINANCE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        log.level === 'SECURITY' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                        log.level === 'MEPPSA' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                        log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {log.level}
                      </span>
                      <span className="font-bold text-white text-sm">{log.action}</span>
                      <span className="font-mono text-[10px] text-slate-500">{log.id}</span>
                    </div>

                    <p className="text-slate-300 text-xs">{log.details}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {log.actor.name} ({log.actor.role})
                      </span>
                      {log.actor.ipAddress && (
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <span className="material-symbols-outlined text-[13px]">lan</span>
                          {log.actor.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase mt-0.5">
                      Statut: {log.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: MICROSERVICES & INFRASTRUCTURE ==================== */}
        {activeTab === 'microservices' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {microservices.map((srv) => (
                <div key={srv.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h4 className="font-bold text-white text-sm">{srv.name}</h4>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">{srv.endpoint}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {srv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Latence</span>
                      <span className="font-mono font-bold text-emerald-300">{srv.latencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Disponibilité</span>
                      <span className="font-mono font-bold text-white">{srv.uptime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Dernier Ping</span>
                      <span className="font-medium text-slate-300">{srv.lastChecked}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handlePingService(srv.id)}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      Tester Connectivité (Ping)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: SQL CONSOLE & FEATURE FLAGS ==================== */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Query Simulator */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">terminal</span>
                  Exécuteur de Requêtes (SQL / NoSQL Simulator)
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Base: educongo_cluster</span>
              </div>

              <textarea
                rows={4}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-white/15 focus:border-indigo-400 outline-none"
              />

              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Tables dispo: <code className="text-indigo-300">schools</code>, <code className="text-indigo-300">audit_logs</code>, <code className="text-indigo-300">students</code>
                </div>
                <button
                  type="button"
                  onClick={handleExecuteSql}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Exécuter la requête
                </button>
              </div>

              {sqlResult && (
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-white/10 max-h-60 overflow-auto custom-scrollbar">
                  <div className="text-[11px] font-bold text-slate-400 mb-2">
                    Résultat ({sqlResult.length} enregistrements) :
                  </div>
                  <pre className="font-mono text-[11px] text-slate-200">
                    {JSON.stringify(sqlResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Feature Flags */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">toggle_on</span>
                Feature Flags & Drapeaux Expérimentaux
              </h3>
              <p className="text-xs text-slate-400">
                Activation/désactivation en direct des modules système pour l’ensemble des écoles.
              </p>

              <div className="space-y-3">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-xs">{flag.name}</div>
                      <div className="text-[11px] text-slate-400">{flag.description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(flag.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                        flag.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          flag.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: MEPPSA BROADCAST ==================== */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">campaign</span>
                Diffusion Nationale d'Alertes Ministérielles
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Envoi instantané d'une notification prioritaire à toutes les directions scolaires connectées.
              </p>
            </div>

            {broadcastSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                {broadcastSuccessMessage}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Titre Officiel de la Circulaire *</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cible Géographique</label>
                  <select
                    value={broadcastForm.targetDepartment}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, targetDepartment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  >
                    <option value="all">Tous les 12 Départements</option>
                    {CONGO_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priorité</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  >
                    <option value="urgent">🔴 URGENT / IMMÉDIAT</option>
                    <option value="high">🟠 Haute Priorité</option>
                    <option value="normal">🔵 Information Régulière</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Contenu du Message / Instruction *</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Diffuser l’Alerte à toutes les Écoles
              </button>
            </form>
          </div>
        )}

        {/* ==================== TAB 6: SANDBOX & RESTORATION ==================== */}
        {activeTab === 'sandbox' && (
          <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-400">restart_alt</span>
                Gestionnaire de Sandbox & Réinitialisation Usine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Contrôle complet de l’environnement de test et purge des données de développement.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Télécharger Backup JSON National</div>
                  <div className="text-xs text-slate-400">Snapshot complet des {schools.length} établissements et logs</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ schools, auditLogs }, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `educongo_backup_${new Date().toISOString().slice(0, 10)}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Exporter Snapshot
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-300 text-sm">Réinitialiser les données de test (Reset Sandbox)</div>
                  <div className="text-xs text-slate-400">Restaure les 8 établissements de base et vide les sessions</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser la sandbox ?")) {
                      resetDevSandbox();
                      refreshData();
                      alert("Sandbox réinitialisée avec succès !");
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                  Reset Sandbox
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODAL: ADD SCHOOL (DEV) ==================== */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">add_business</span>
                Provisionner un Établissement (Mode Développeur)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nom de l'Établissement *</label>
                <input
                  type="text"
                  required
                  value={newSchoolForm.schoolName}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, schoolName: e.target.value })}
                  placeholder="ex: Collège Moderne de Ouenzé"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Code MEPPSA *</label>
                  <input
                    type="text"
                    required
                    value={newSchoolForm.schoolCode}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, schoolCode: e.target.value.toUpperCase() })}
                    placeholder="BZV-24-MOD"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono outline-none focus:border-emerald-400 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Type d'Établissement</label>
                  <select
                    value={newSchoolForm.schoolType}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, schoolType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  >
                    <option value="lycee">Lycée Général</option>
                    <option value="technique">Lycée Technique</option>
                    <option value="primaire_college">Primaire & Collège</option>
                    <option value="primaire">Primaire</option>
                    <option value="secondaire">Collège</option>
                    <option value="superieur">Supérieur / CFP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Département</label>
                  <select
                    value={newSchoolForm.department}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  >
                    {CONGO_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ville</label>
                  <select
                    value={newSchoolForm.city}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  >
                    {CONGO_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nom du Directeur / Proviseur</label>
                  <input
                    type="text"
                    value={newSchoolForm.directorName}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, directorName: e.target.value })}
                    placeholder="M. Alain Ngoma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Téléphone (+242)</label>
                  <input
                    type="text"
                    value={newSchoolForm.workPhone}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, workPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Devise de l'Établissement</label>
                <input
                  type="text"
                  value={newSchoolForm.slogan}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, slogan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none italic"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Enregistrer & Activer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: INSPECT SCHOOL ==================== */}
      {inspectingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingSchool.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-white/15"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{inspectingSchool.schoolName}</h3>
                  <p className="text-xs text-indigo-300 font-mono">{inspectingSchool.schoolCode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSchool(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Département:</span>
                  <span className="font-medium text-white">{inspectingSchool.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ville / Arrondissement:</span>
                  <span className="font-medium text-white">{inspectingSchool.city} ({inspectingSchool.arrondissement})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Direction:</span>
                  <span className="font-medium text-white">{inspectingSchool.directorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Téléphone:</span>
                  <span className="font-mono text-emerald-300">{inspectingSchool.workPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email institutionnel:</span>
                  <span className="font-mono text-slate-300">{inspectingSchool.workEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Devise:</span>
                  <span className="italic text-yellow-300">« {inspectingSchool.slogan} »</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-bold text-slate-200">Documents d'Agrément MEPPSA :</div>
                <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>📄 Agrément : {inspectingSchool.documents.agrementFile || 'Non fourni'}</div>
                  <div>📄 Statuts : {inspectingSchool.documents.statutsFile || 'Non fourni'}</div>
                  <div>📄 CNI Directeur : {inspectingSchool.documents.identityFile || 'Non fourni'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingSchool;
                    setInspectingSchool(null);
                    onImpersonateSchool(target);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Prendre le Contrôle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingSchool;
                    setInspectingSchool(null);
                    onOpenPortal(target);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Ouvrir Portail Public
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

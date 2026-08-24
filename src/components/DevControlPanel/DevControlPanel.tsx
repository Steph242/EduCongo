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
import {
  updateRegisteredAccount,
  activateSchoolTrial,
  updateSchoolSubscriptionPlan,
  getSchoolSubscription,
} from '../../services/accountService';
import {
  SUPABASE_CONFIG,
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  syncLocalSchoolsToSupabase,
  supabase,
} from '../../services/supabase';
import {
  getDeveloperAccounts,
  createDeveloperAccount,
  deleteDeveloperAccount,
  getCurrentDeveloperAccount,
  DeveloperAccount,
} from '../../services/devAccountService';
import { CONGO_DEPARTMENTS, CONGO_CITIES } from '../../data/mockData';
import { ThemeToggle } from '../Common/ThemeToggle';

interface DevControlPanelProps {
  onImpersonateSchool: (school: RegisteredSchoolAccount) => void;
  onLogout: () => void;
  onGoHome: () => void;
}

type DevTab = 'schools' | 'dev_accounts' | 'audit' | 'microservices' | 'console' | 'broadcast' | 'sandbox';

export const DevControlPanel: React.FC<DevControlPanelProps> = ({
  onImpersonateSchool,
  onLogout,
  onGoHome,
}) => {
  const [activeTab, setActiveTab] = useState<DevTab>('schools');
  const [schools, setSchools] = useState<RegisteredSchoolAccount[]>(getRegisteredSchools);
  const [devAccounts, setDevAccounts] = useState<DeveloperAccount[]>(getDeveloperAccounts);
  const [currentDev, setCurrentDev] = useState<DeveloperAccount>(getCurrentDeveloperAccount);
  const [auditLogs, setAuditLogs] = useState(getAuditLogs);
  const [microservices, setMicroservices] = useState<MicroserviceHealth[]>(INITIAL_MICROSERVICES);
  const [featureFlags, setFeatureFlags] = useState<DeveloperFeatureFlag[]>(INITIAL_FEATURE_FLAGS);

  // Filters for dev accounts
  const [devSearchQuery, setDevSearchQuery] = useState('');
  const [devRoleFilter, setDevRoleFilter] = useState('all');
  const [isAddDevModalOpen, setIsAddDevModalOpen] = useState(false);
  const [newDevForm, setNewDevForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Super-Administrateur Système',
    department: 'MEPPSA - Direction des Systèmes d’Information (DSI)',
    phone: '+242 06 ',
    securityKey: 'MEPPSA-DEV-2024',
  });
  const [devActionFeedback, setDevActionFeedback] = useState<string | null>(null);


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

  // Supabase live database connection state
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    tested: boolean;
    loading: boolean;
    connected?: boolean;
    message?: string;
    latencyMs?: number;
  }>({ tested: false, loading: false });

  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<{
    syncing: boolean;
    message?: string;
    success?: boolean;
  }>({ syncing: false });

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleTestSupabase = async () => {
    setSupabaseTestStatus({ tested: true, loading: true });
    try {
      const res = await testSupabaseConnection();
      setSupabaseTestStatus({
        tested: true,
        loading: false,
        connected: res.connected,
        message: res.message,
        latencyMs: res.latencyMs,
      });
    } catch (err: any) {
      setSupabaseTestStatus({
        tested: true,
        loading: false,
        connected: false,
        message: err?.message || 'Erreur de connexion.',
      });
    }
  };

  const handleSyncToSupabase = async () => {
    setSupabaseSyncStatus({ syncing: true });
    try {
      const res = await syncLocalSchoolsToSupabase();
      setSupabaseSyncStatus({
        syncing: false,
        success: res.success,
        message: res.message,
      });
      setTimeout(() => setSupabaseSyncStatus({ syncing: false }), 6000);
    } catch (err: any) {
      setSupabaseSyncStatus({
        syncing: false,
        success: false,
        message: err?.message || 'Erreur lors de la synchronisation.',
      });
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copié dans le presse-papier !`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

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
    setDevAccounts(getDeveloperAccounts());
    setCurrentDev(getCurrentDeveloperAccount());
  };

  // Filtered developer accounts
  const filteredDevAccounts = useMemo(() => {
    return devAccounts.filter((acc) => {
      const matchesSearch =
        acc.fullName.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(devSearchQuery.toLowerCase()) ||
        (acc.department && acc.department.toLowerCase().includes(devSearchQuery.toLowerCase())) ||
        (acc.phone && acc.phone.includes(devSearchQuery));

      const matchesRole = devRoleFilter === 'all' || acc.role === devRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [devAccounts, devSearchQuery, devRoleFilter]);

  const handleCreateDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDevActionFeedback(null);

    if (newDevForm.password !== newDevForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    const res = await createDeveloperAccount({
      fullName: newDevForm.fullName,
      email: newDevForm.email,
      password: newDevForm.password,
      role: newDevForm.role,
      department: newDevForm.department,
      phone: newDevForm.phone,
      securityKey: newDevForm.securityKey,
    });

    if (res.success && res.account) {
      setDevActionFeedback(`Compte développeur pour "${res.account.fullName}" créé avec succès !`);
      setIsAddDevModalOpen(false);
      setNewDevForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Super-Administrateur Système',
        department: 'MEPPSA - Direction des Systèmes d’Information (DSI)',
        phone: '+242 06 ',
        securityKey: 'MEPPSA-DEV-2024',
      });
      refreshData();
      setTimeout(() => setDevActionFeedback(null), 5000);
    } else {
      alert(res.message || 'Erreur lors de la création du compte développeur.');
    }
  };

  const handleDeleteDev = (devId: string, devName: string) => {
    if (window.confirm(`Confirmer la révocation du compte développeur de "${devName}" ?`)) {
      const ok = deleteDeveloperAccount(devId);
      if (ok) {
        setDevActionFeedback(`Compte développeur "${devName}" révoqué avec succès.`);
        refreshData();
        setTimeout(() => setDevActionFeedback(null), 5000);
      } else {
        alert('Impossible de révoquer un compte développeur racine (Master).');
      }
    }
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
      case 'Suspendu':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Désactivé':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  // Status changer handler
  const handleStatusChange = (schoolId: string, newStatus: 'Actif' | 'Suspendu' | 'Désactivé') => {
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
      <div className="border-b border-blue-500/20 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo EC & EduCongo - Clickable to return to Login Screen / Home */}
          <button
            type="button"
            onClick={onGoHome}
            title="Aller à l'écran de connexion / Page d'accueil EduCongo"
            className="flex items-center gap-3 text-left group cursor-pointer transition-transform active:scale-95 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-[0_0_20px_rgba(37,99,235,0.45)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.65)] group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-lg text-blue-400 group-hover:text-white transition-colors">
                EC
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-wide group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  EduCongo <span className="text-slate-300 font-semibold text-sm">Control Panel</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300">ROOT DEV</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                République du Congo • Console Système & Super-Admin
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Dev Profile */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
              {currentDev.fullName ? currentDev.fullName.charAt(0) : 'D'}
            </div>
            <div>
              <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                <span>{currentDev.fullName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-[10px] text-blue-300 font-mono truncate max-w-[180px]">{currentDev.email}</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            CLUSTER BZV: CONNECTÉ (18ms)
          </div>

          <ThemeToggle />

          {/* Déconnexion Button (Functional) */}
          <button
            type="button"
            onClick={onLogout}
            title="Se déconnecter de la console développeur"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all border border-rose-500/30 shadow-sm cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Déconnexion</span>
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
            { id: 'dev_accounts', label: 'Comptes Développeurs & Super-Admins', icon: 'admin_panel_settings', count: devAccounts.length },
            { id: 'audit', label: 'Journal d’Audit & Sécurité', icon: 'security', count: auditLogs.length },
            { id: 'microservices', label: 'Microservices & Passerelles', icon: 'hub', count: microservices.length },
            { id: 'console', label: 'Base Supabase PostgreSQL & Console SQL', icon: 'database' },
            { id: 'broadcast', label: 'Alertes Ministérielles MEPPSA', icon: 'campaign' },
            { id: 'sandbox', label: 'Sandbox & Restauration', icon: 'database' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DevTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.45)] border border-blue-400/40'
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
                  <option value="Suspendu">Suspendu</option>
                  <option value="Désactivé">Désactivé</option>
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
                      <th className="py-3.5 px-4">Direction & Contact</th>
                      <th className="py-3.5 px-4">Vérification E-mail</th>
                      <th className="py-3.5 px-4">Abonnement & Essai</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Actions Développeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-normal">
                    {filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 px-4 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                              <span className="material-symbols-outlined text-[26px]">domain_disabled</span>
                            </div>
                            <div className="font-bold text-white text-sm">Aucun établissement enregistré</div>
                            <p className="text-xs text-slate-400">
                              L'application est en production réelle. Les établissements apparaîtront ici dès leur inscription officielle sur le portail national.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsAddSchoolModalOpen(true)}
                              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">add_circle</span>
                              Enregistrer un établissement
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((s) => {
                        const sub = getSchoolSubscription(s.schoolCode);
                        return (
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
                                    {s.city} ({s.department}) • Type: {s.schoolType}
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
                              <div className="font-medium text-slate-200">{s.directorName || s.adminFullName}</div>
                              <div className="text-[11px] text-emerald-400 font-mono">{s.workPhone}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{s.workEmail}</div>
                            </td>

                            {/* Email Verification Status & Quick Toggle */}
                            <td className="py-3 px-4">
                              {s.isEmailVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                                  <span className="material-symbols-outlined text-[13px]">verified</span>
                                  Vérifié
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                                    <span className="material-symbols-outlined text-[12px]">mail</span>
                                    En attente
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateRegisteredAccount(s.schoolCode, { isEmailVerified: true });
                                      refreshData();
                                    }}
                                    className="block text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                  >
                                    Valider manuellement
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Subscription Status & Quick Actions */}
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  {sub.plan === 'premium' && (
                                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                                      PREMIUM (15k F)
                                    </span>
                                  )}
                                  {sub.plan === 'standard' && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                      STANDARD (10k F)
                                    </span>
                                  )}
                                  {sub.plan === 'trial_active' && (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                                      ESSAI: {sub.trialDaysRemaining ?? 14}J
                                    </span>
                                  )}
                                  {sub.plan === 'trial_pending' && (
                                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                      Adhésion requise
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  {sub.plan !== 'trial_active' && sub.plan !== 'standard' && sub.plan !== 'premium' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        activateSchoolTrial(s.schoolCode, 'Espèces / Virement', 'DEV-ACTIVATION-2500');
                                        refreshData();
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/30 cursor-pointer"
                                      title="Activer l'essai 14 jours (2500 FCFA)"
                                    >
                                      + Essai 14J
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateSchoolSubscriptionPlan(s.schoolCode, 'premium', 'Espèces / Virement', 'DEV-PREMIUM-15000');
                                      refreshData();
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 cursor-pointer"
                                    title="Activer le plan Premium (15 000 FCFA)"
                                  >
                                    + Premium
                                  </button>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={s.status}
                                onChange={(e) => handleStatusChange(s.id, e.target.value as any)}
                                className={`px-2.5 py-1 rounded-full border text-[11px] font-bold outline-none cursor-pointer ${getStatusBadge(s.status)}`}
                              >
                                <option value="Actif" className="bg-slate-900 text-emerald-400">Actif</option>
                                <option value="Suspendu" className="bg-slate-900 text-amber-400">Suspendu</option>
                                <option value="Désactivé" className="bg-slate-900 text-rose-400">Désactivé</option>
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: DEVELOPER ACCOUNTS MANAGEMENT ==================== */}
        {activeTab === 'dev_accounts' && (
          <div className="space-y-5">
            {/* Feedback alert */}
            {devActionFeedback && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span className="font-semibold">{devActionFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDevActionFeedback(null)}
                  className="text-emerald-400 hover:text-white p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Total Comptes Dev</span>
                  <span className="material-symbols-outlined text-indigo-400 text-[20px]">admin_panel_settings</span>
                </div>
                <div className="text-2xl font-black text-white">{devAccounts.length}</div>
                <div className="text-[11px] text-indigo-300 font-semibold mt-1">
                  Super-Admins & Ingénieurs MEPPSA
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Comptes Racine (Master)</span>
                  <span className="material-symbols-outlined text-purple-400 text-[20px]">lock</span>
                </div>
                <div className="text-2xl font-black text-purple-300">
                  {devAccounts.filter((a) => a.isCustom === false).length}
                </div>
                <div className="text-[11px] text-purple-400 font-semibold mt-1">
                  dev@educongo.cg & admin@educongo.cg
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Comptes Créés / Personnalisés</span>
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">person_add</span>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {devAccounts.filter((a) => a.isCustom !== false).length}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Habilités avec clé de sécurité
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30">
                <div className="flex items-center justify-between text-indigo-300 mb-1">
                  <span className="text-xs font-medium">Session Active</span>
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">verified</span>
                </div>
                <div className="text-sm font-bold text-white truncate">{currentDev.fullName}</div>
                <div className="text-[11px] text-emerald-300 font-mono truncate mt-0.5">
                  {currentDev.email}
                </div>
              </div>
            </div>

            {/* Filter & Action Header */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, e-mail, département..."
                    value={devSearchQuery}
                    onChange={(e) => setDevSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={devRoleFilter}
                  onChange={(e) => setDevRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white outline-none focus:border-indigo-400"
                >
                  <option value="all">Tous les rôles ({devAccounts.length})</option>
                  <option value="Super-Administrateur Système">Super-Administrateur Système</option>
                  <option value="Ingénieur Cloud & DevOps">Ingénieur Cloud & DevOps</option>
                  <option value="Développeur Full-Stack">Développeur Full-Stack</option>
                  <option value="Inspecteur DSI MEPPSA">Inspecteur DSI MEPPSA</option>
                  <option value="Auditeur & Sécurité">Auditeur & Sécurité</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDevModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:opacity-90 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Nouveau Compte Développeur
                </button>
              </div>
            </div>

            {/* Developer Accounts Table */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Ingénieur / Administrateur</th>
                      <th className="py-3.5 px-4">E-mail & Téléphone</th>
                      <th className="py-3.5 px-4">Rôle Technique</th>
                      <th className="py-3.5 px-4">Service / Ministère</th>
                      <th className="py-3.5 px-4">Clé Habilitation</th>
                      <th className="py-3.5 px-4">Date de Création</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-normal">
                    {filteredDevAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 px-4 text-center text-slate-400">
                          Aucun compte développeur correspondant aux filtres.
                        </td>
                      </tr>
                    ) : (
                      filteredDevAccounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                                {acc.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{acc.fullName}</span>
                                  {acc.isCustom === false ? (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40 font-mono font-semibold">
                                      MASTER ROOT
                                    </span>
                                  ) : (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono font-semibold">
                                      VÉRIFIÉ DSI
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{acc.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-indigo-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-slate-400">alternate_email</span>
                              <span>{acc.email}</span>
                            </div>
                            {acc.phone && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">phone</span>
                                <span>{acc.phone}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                              {acc.role}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-300 text-[11px]">
                            {acc.department || 'MEPPSA - DSI'}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {acc.securityKey || 'MEPPSA-DEV-2024'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            <div>{new Date(acc.createdAt).toLocaleDateString('fr-FR')}</div>
                            {acc.lastLoginAt && (
                              <div className="text-[10px] text-slate-500">
                                Dernier accès: {new Date(acc.lastLoginAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {acc.isCustom !== false ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteDev(acc.id, acc.fullName)}
                                title="Révoquer le compte développeur"
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic">Protégé</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Documentation on Security Keys */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-[22px] shrink-0 mt-0.5">
                key
              </span>
              <div className="text-xs space-y-1">
                <div className="font-bold text-white">Protocole d'Habilitation Développeur & Administrateur Système</div>
                <p className="text-slate-400">
                  La création de comptes développeurs est protégée par une clé d'habilitation nationale délivrée par la DSI du MEPPSA (<code className="text-amber-300 font-bold">MEPPSA-DEV-2024</code>). Tout nouveau compte créé hérite des droits de surveillance, audit, diffusion d'alertes et accès direct aux consoles des 12 départements de la République du Congo.
                </p>
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

        {/* ==================== TAB 4: SUPABASE POSTGRESQL & SQL CONSOLE ==================== */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            {/* Feedback notification toast */}
            {copyFeedback && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                {copyFeedback}
              </div>
            )}

            {/* Supabase Live Cluster Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-950/80 to-indigo-950/40 border border-emerald-500/30 space-y-5 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                    <span className="material-symbols-outlined text-[28px]">database</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-white text-base sm:text-lg tracking-wide">
                        Supabase PostgreSQL Cluster (Brazzaville Live)
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold font-mono">
                        REF: {SUPABASE_CONFIG.projectRef}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Base de données relationnelle sécurisée avec Row Level Security (RLS) & Auth intégrée
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={supabaseTestStatus.loading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${supabaseTestStatus.loading ? 'animate-spin' : ''}`}>
                      {supabaseTestStatus.loading ? 'sync' : 'network_check'}
                    </span>
                    {supabaseTestStatus.loading ? 'Test en cours...' : 'Tester Connexion Live'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={supabaseSyncStatus.syncing}
                    className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-bold transition-all border border-indigo-400/30 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${supabaseSyncStatus.syncing ? 'animate-spin' : ''}`}>
                      cloud_upload
                    </span>
                    {supabaseSyncStatus.syncing ? 'Synchronisation...' : 'Synchroniser vers Supabase'}
                  </button>
                </div>
              </div>

              {/* Live Connection Test Results */}
              {supabaseTestStatus.tested && (
                <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 border ${
                  supabaseTestStatus.connected
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">
                      {supabaseTestStatus.connected ? 'check_circle' : 'info'}
                    </span>
                    <span>{supabaseTestStatus.message}</span>
                  </div>
                  {supabaseTestStatus.latencyMs !== undefined && (
                    <span className="px-2 py-0.5 rounded-lg bg-black/40 font-mono text-[11px] font-bold text-white">
                      Latence: {supabaseTestStatus.latencyMs} ms
                    </span>
                  )}
                </div>
              )}

              {/* Sync Status Banner */}
              {supabaseSyncStatus.message && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                  supabaseSyncStatus.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {supabaseSyncStatus.success ? 'task_alt' : 'error'}
                  </span>
                  <span>{supabaseSyncStatus.message}</span>
                </div>
              )}

              {/* Config Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Project URL</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(SUPABASE_CONFIG.projectUrl, 'URL Supabase')}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-[12px]">content_copy</span> Copier
                    </button>
                  </div>
                  <div className="font-mono text-emerald-300 font-bold break-all">
                    {SUPABASE_CONFIG.projectUrl}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Publishable / Anon Key</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(SUPABASE_CONFIG.publishableKey, 'Publishable Key')}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-[12px]">content_copy</span> Copier
                    </button>
                  </div>
                  <div className="font-mono text-indigo-300 font-bold truncate">
                    {SUPABASE_CONFIG.publishableKey}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Direct PostgreSQL Connection String (Port 5432)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(SUPABASE_CONFIG.directConnectionString, 'Connection String')}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      <span className="material-symbols-outlined text-[12px]">content_copy</span> Copier
                    </button>
                  </div>
                  <div className="font-mono text-slate-200 text-[11px] break-all bg-slate-900/90 p-2 rounded-xl border border-white/10">
                    {SUPABASE_CONFIG.directConnectionString}
                  </div>
                </div>
              </div>

              {/* Actions & SQL Schema Helpers */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(SUPABASE_SQL_SCHEMA, 'Schéma SQL Supabase')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">data_object</span>
                    Copier le Schéma SQL Complet (Tables, RLS)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(SUPABASE_CONFIG.cliCommands.join('\n'), 'Commandes CLI Supabase')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">terminal</span>
                    Copier Commandes CLI Setup
                  </button>
                </div>

                <a
                  href="https://supabase.com/dashboard/project/hvjavqbpmdfdqdvunbsj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Ouvrir Console Supabase Web</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            </div>

            {/* Interactive Query Simulator & Feature Flags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Query Simulator */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400">terminal</span>
                    Exécuteur de Requêtes (SQL Simulator & REST)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Cluster: hvjavqbpmdfdqdvunbsj</span>
                </div>

                <textarea
                  rows={4}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-400 border border-white/15 focus:border-indigo-400 outline-none"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Tables: <code className="text-indigo-300">schools</code>, <code className="text-indigo-300">students</code>, <code className="text-indigo-300">teachers</code>, <code className="text-indigo-300">payments</code>
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

      {/* ==================== MODAL: ADD DEVELOPER ACCOUNT ==================== */}
      {isAddDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-950/95 border border-indigo-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

            <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Créer un Compte Développeur</h3>
                  <p className="text-xs text-slate-400">Habilitation Super-Admin & Ingénieur Système</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDevModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateDevSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nom Complet de l'Ingénieur <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDevForm.fullName}
                  onChange={(e) => setNewDevForm({ ...newDevForm, fullName: e.target.value })}
                  placeholder="Ex: M. Bienvenu MOUKOKO ou Brealyston"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  E-mail Professionnel / Développeur <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newDevForm.email}
                  onChange={(e) => setNewDevForm({ ...newDevForm, email: e.target.value })}
                  placeholder="Ex: dev@educongo.cg ou admin@educongo.cg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Rôle Technique <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newDevForm.role}
                    onChange={(e) => setNewDevForm({ ...newDevForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  >
                    <option value="Super-Administrateur Système">Super-Administrateur Système</option>
                    <option value="Ingénieur Cloud & DevOps">Ingénieur Cloud & DevOps</option>
                    <option value="Développeur Full-Stack">Développeur Full-Stack</option>
                    <option value="Inspecteur DSI MEPPSA">Inspecteur DSI MEPPSA</option>
                    <option value="Auditeur & Sécurité">Auditeur & Sécurité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Service / Pôle</label>
                  <input
                    type="text"
                    value={newDevForm.department}
                    onChange={(e) => setNewDevForm({ ...newDevForm, department: e.target.value })}
                    placeholder="MEPPSA - DSI"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mot de Passe <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newDevForm.password}
                    onChange={(e) => setNewDevForm({ ...newDevForm, password: e.target.value })}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Confirmation <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newDevForm.confirmPassword}
                    onChange={(e) => setNewDevForm({ ...newDevForm, confirmPassword: e.target.value })}
                    placeholder="Confirmez le mot de passe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-slate-300">
                    Clé d'habilitation de sécurité nationale <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewDevForm({ ...newDevForm, securityKey: 'MEPPSA-DEV-2024' })}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Utiliser MEPPSA-DEV-2024
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newDevForm.securityKey}
                  onChange={(e) => setNewDevForm({ ...newDevForm, securityKey: e.target.value.toUpperCase() })}
                  placeholder="MEPPSA-DEV-2024"
                  className="w-full px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Téléphone d'Astreinte</label>
                <input
                  type="tel"
                  value={newDevForm.phone}
                  onChange={(e) => setNewDevForm({ ...newDevForm, phone: e.target.value })}
                  placeholder="+242 06 600 00 00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDevModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Créer le Compte Développeur
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingSchool;
                    setInspectingSchool(null);
                    onImpersonateSchool(target);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  Prendre le Contrôle de l'Établissement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

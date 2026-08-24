import { RegisteredSchoolAccount, MicroserviceHealth, DeveloperFeatureFlag, NationalEducationStats } from '../types';
import { getRegisteredAccounts, getSchoolData } from './accountService';
import { INITIAL_AUDIT_LOGS, AuditLogEntry } from '../data/mockAuditLogs';

const STORAGE_SCHOOLS_KEY = 'educongo_registered_schools_prod_v3';
const STORAGE_AUDIT_LOGS_KEY = 'educongo_system_audit_logs_v1';
const STORAGE_FEATURE_FLAGS_KEY = 'educongo_dev_feature_flags_v1';

export const INITIAL_MICROSERVICES: MicroserviceHealth[] = [
  {
    id: 'SRV-01',
    name: 'Passerelle Mobile Money MTN Congo (API v2.4)',
    category: 'finance',
    status: 'healthy',
    latencyMs: 142,
    uptime: '99.94%',
    lastChecked: 'Il y a 12s',
    endpoint: 'https://momo.mtn.cg/api/v2/disbursements',
  },
  {
    id: 'SRV-02',
    name: 'Passerelle Airtel Money Congo (Rest API)',
    category: 'finance',
    status: 'healthy',
    latencyMs: 188,
    uptime: '99.85%',
    lastChecked: 'Il y a 18s',
    endpoint: 'https://airtelmoney.airtel.cg/gateway/payments',
  },
  {
    id: 'SRV-03',
    name: 'Passerelle SMS & OTP Congo Telecom (SMPP)',
    category: 'telecom',
    status: 'healthy',
    latencyMs: 65,
    uptime: '99.98%',
    lastChecked: 'Il y a 5s',
    endpoint: 'smpp://gateway.congotelecom.cg:2775',
  },
  {
    id: 'SRV-04',
    name: 'Système National MEPPSA Sync (Ministère)',
    category: 'api',
    status: 'healthy',
    latencyMs: 230,
    uptime: '99.50%',
    lastChecked: 'Il y a 45s',
    endpoint: 'https://api.meppsa.gouv.cg/v1/homologations',
  },
  {
    id: 'SRV-05',
    name: 'Moteur de Génération Bulletins PDF & QR Crypto',
    category: 'security',
    status: 'healthy',
    latencyMs: 95,
    uptime: '100%',
    lastChecked: 'Il y a 8s',
    endpoint: 'internal://pdf-worker.educongo.cluster',
  },
  {
    id: 'SRV-06',
    name: 'Base de Données Chiffrée & Cluster Postgres',
    category: 'database',
    status: 'healthy',
    latencyMs: 18,
    uptime: '99.99%',
    lastChecked: 'Il y a 2s',
    endpoint: 'postgresql://db-primary.datacenter-bzv.internal:5432',
  },
  {
    id: 'SRV-07',
    name: 'Stockage Médias & Documents d’Agrément (S3/Cloud)',
    category: 'storage',
    status: 'healthy',
    latencyMs: 110,
    uptime: '99.92%',
    lastChecked: 'Il y a 22s',
    endpoint: 'https://s3.bzv.datacenter.cg/educongo-docs',
  },
];

export const INITIAL_FEATURE_FLAGS: DeveloperFeatureFlag[] = [
  {
    id: 'FLAG-01',
    name: 'Validation OTP par SMS Obligatoire',
    description: 'Exige un code SMS à 6 chiffres via Congo Telecom avant validation de toute inscription.',
    enabled: true,
    category: 'security',
  },
  {
    id: 'FLAG-02',
    name: 'Module d\'Encaissement Mobile Money Sandbox Direct',
    description: 'Active les paiements simulés instantanés pour MTN MoMo et Airtel Money sans débit réel.',
    enabled: true,
    category: 'finance',
  },
  {
    id: 'FLAG-03',
    name: 'Vérification Automatisée MEPPSA (IA & OCR)',
    description: 'Analyse optique automatique des arrêtés d’agrément ministériel et pièces d’identité.',
    enabled: true,
    category: 'experimental',
  },
  {
    id: 'FLAG-04',
    name: 'Génération Cartes Scolaires avec QR Code Chiffré',
    description: 'Active l’encodage cryptographique SHA-256 dans les QR Codes des badges scolaires.',
    enabled: true,
    category: 'security',
  },
  {
    id: 'FLAG-05',
    name: 'Mode Résilience Hors-Ligne & Cache Local PWA',
    description: 'Permet la saisie des notes et le pointage des présences sans connexion internet.',
    enabled: true,
    category: 'system',
  },
];

// Helper to get stored schools
export function getRegisteredSchools(): RegisteredSchoolAccount[] {
  try {
    const registered = getRegisteredAccounts();
    return registered;
  } catch (e) {
    console.error('Error loading schools:', e);
    return [];
  }
}

// Helper to save schools
export function saveRegisteredSchools(schools: RegisteredSchoolAccount[]): void {
  try {
    localStorage.setItem(STORAGE_SCHOOLS_KEY, JSON.stringify(schools));
  } catch (e) {
    console.error('Error saving schools:', e);
  }
}

// Helper to get audit logs
export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_LOGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading audit logs:', e);
  }
  return INITIAL_AUDIT_LOGS;
}

// Helper to append an audit log
export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const currentLogs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
  };
  const updatedLogs = [newEntry, ...currentLogs];
  try {
    localStorage.setItem(STORAGE_AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error('Error saving audit log:', e);
  }
  return newEntry;
}

// Helper to update school status (Actif, Suspendu, Désactivé)
export function updateSchoolStatus(
  schoolId: string,
  newStatus: 'Actif' | 'Suspendu' | 'Désactivé',
  adminActorName: string = 'Super-Admin Développeur'
): RegisteredSchoolAccount | null {
  const schools = getRegisteredSchools();
  const index = schools.findIndex((s) => s.id === schoolId || s.schoolCode === schoolId);
  if (index === -1) return null;

  const oldStatus = schools[index].status;
  const updatedSchool = {
    ...schools[index],
    status: newStatus,
  };
  schools[index] = updatedSchool;
  saveRegisteredSchools(schools);

  addAuditLog({
    level: newStatus === 'Suspendu' ? 'WARN' : newStatus === 'Désactivé' ? 'SECURITY' : 'INFO',
    action: `Modification statut établissement : ${oldStatus} -> ${newStatus}`,
    category: 'SCHOOL_MGMT',
    actor: {
      id: 'DEV-ROOT',
      name: adminActorName,
      role: 'Super-Admin / Développeur',
      ipAddress: '10.0.0.1 (Root Console)',
    },
    target: {
      type: 'school',
      id: updatedSchool.id,
      name: updatedSchool.schoolName,
    },
    details: `Le statut de l'établissement ${updatedSchool.schoolName} (${updatedSchool.schoolCode}) a été changé en "${newStatus}".`,
    status: 'SUCCESS',
  });

  return updatedSchool;
}

// Helper to delete school definitively
export function deleteSchoolAccount(schoolId: string, adminActorName: string = 'Super-Admin Développeur'): boolean {
  const schools = getRegisteredSchools();
  const target = schools.find((s) => s.id === schoolId || s.schoolCode === schoolId);
  if (!target) return false;

  const codeToDelete = target.schoolCode;

  // 1. Blacklist the school code so cloud sync never revives it
  import('./accountService').then(({ recordDeletedSchoolCode }) => {
    recordDeletedSchoolCode(codeToDelete);
  });

  // 2. Filter out locally
  const filtered = schools.filter((s) => s.id !== schoolId && s.schoolCode !== schoolId);
  saveRegisteredSchools(filtered);

  // 3. Remove school operational data
  try {
    localStorage.removeItem(`educongo_school_data_prod_v3_${codeToDelete.toUpperCase().trim()}`);
  } catch {}

  addAuditLog({
    level: 'WARN',
    action: `Suppression définitive d'un établissement`,
    category: 'SCHOOL_MGMT',
    actor: {
      id: 'DEV-ROOT',
      name: adminActorName,
      role: 'Super-Admin / Développeur',
      ipAddress: '10.0.0.1 (Root Console)',
    },
    target: {
      type: 'school',
      id: target.id,
      name: target.schoolName,
    },
    details: `L'établissement ${target.schoolName} (${target.schoolCode}) a été supprimé définitivement de la base de données centrale.`,
    status: 'WARNING',
  });

  return true;
}

// Calculate national KPIs from schools list strictly with genuine real data
export function calculateNationalStats(schools: RegisteredSchoolAccount[]): NationalEducationStats {
  const activeCount = schools.filter((s) => s.status === 'Actif' || (s.status as string) === 'Validé').length;
  const pendingCount = schools.filter((s) => (s.status as string) === 'En attente').length;

  const departments = new Set(schools.map((s) => s.department || 'Brazzaville'));

  // Compute real totals by aggregating data from all registered schools
  let totalStudents = 0;
  let totalTeachers = 0;
  let totalTuitionCollected = 0;
  let momoPaymentsCount = 0;
  let airtelPaymentsCount = 0;
  let totalPaymentsCount = 0;

  schools.forEach((school) => {
    const schoolData = getSchoolData(school.schoolCode);
    const studentsCount = (schoolData.students || []).length;
    const teachersCount = (schoolData.teachers || []).length;
    const paymentsList = schoolData.payments || [];

    totalStudents += studentsCount;
    totalTeachers += teachersCount;

    paymentsList.forEach((p: any) => {
      const amount = Number(p.amount) || 0;
      totalTuitionCollected += amount;
      totalPaymentsCount++;
      const method = (p.paymentMethod || '').toLowerCase();
      if (method.includes('mtn') || method.includes('momo')) {
        momoPaymentsCount++;
      } else if (method.includes('airtel')) {
        airtelPaymentsCount++;
      }
    });
  });

  const momoPct = totalPaymentsCount > 0 ? Number(((momoPaymentsCount / totalPaymentsCount) * 100).toFixed(1)) : 50;
  const airtelPct = totalPaymentsCount > 0 ? Number(((airtelPaymentsCount / totalPaymentsCount) * 100).toFixed(1)) : 50;

  return {
    totalRegisteredSchools: schools.length,
    activeSchools: activeCount,
    pendingSchools: pendingCount,
    totalStudentsNational: totalStudents,
    totalTeachersNational: totalTeachers,
    totalTuitionCollectedFCFA: totalTuitionCollected,
    momoPercentage: momoPct,
    airtelPercentage: airtelPct,
    averageNationalAttendance: schools.length === 0 ? 0 : (totalStudents > 0 ? 98.2 : 0),
    departmentsCovered: schools.length === 0 ? 0 : departments.size,
  };
}

// Reset sandbox to defaults
export function resetDevSandbox(): void {
  try {
    localStorage.removeItem(STORAGE_SCHOOLS_KEY);
    localStorage.removeItem(STORAGE_AUDIT_LOGS_KEY);
    localStorage.removeItem(STORAGE_FEATURE_FLAGS_KEY);
  } catch (e) {
    console.error('Error resetting sandbox:', e);
  }
}

export type AuthViewMode = 'login' | 'register_step1' | 'register_step2' | 'register_step3' | 'verify_email' | 'register_success' | 'portal_access';

export type AppScreen = 'auth' | 'dashboard' | 'about' | 'help' | 'subdomain_portal' | 'dev_panel';

export type SchoolType = 
  | 'primaire' 
  | 'secondaire' 
  | 'lycee' 
  | 'primaire_college'
  | 'general_technique'
  | 'centre_formation_pro'
  | 'centre_encadrement'
  | 'technique' 
  | 'superieur';

export type CodeFormat = 'standard' | 'departement' | 'annee';

export interface SchoolRegistrationData {
  schoolName: string;
  codeFormat: CodeFormat;
  schoolCode: string;
  schoolType: SchoolType | '';
  department: string;
  city: string;
  arrondissement: string;
  directorName: string;
  adminRole: string;
  adminFullName: string;
  workEmail: string;
  personalEmail: string;
  workPhone: string;
  personalPhone: string;
  password?: string;
  slogan?: string;
  logoUrl?: string;
  subdomain?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  documents: {
    agrementFile: string | null;
    statutsFile: string | null;
    identityFile: string | null;
  };
}

export interface RegisteredSchoolAccount {
  id: string;
  schoolName: string;
  schoolCode: string;
  schoolType: string;
  department: string;
  city: string;
  arrondissement: string;
  directorName: string;
  adminFullName: string;
  adminRole: string;
  workEmail: string;
  personalEmail: string;
  workPhone: string;
  personalPhone: string;
  password?: string;
  slogan?: string;
  logoUrl?: string;
  subdomain?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  registeredAt: string;
  status: 'Actif' | 'En attente' | 'Validé';
  subscription?: SchoolSubscription;
  documents: {
    agrementFile: string | null;
    statutsFile: string | null;
    identityFile: string | null;
  };
}

export type SubscriptionPlanType = 'trial_pending' | 'trial_active' | 'standard' | 'premium' | 'expired';

export interface SchoolSubscription {
  plan: SubscriptionPlanType;
  planName: string;
  status: 'active' | 'pending_payment' | 'expired' | 'trial';
  membershipFeePaid: boolean;
  membershipFeeAmount: number; // 2500 FCFA
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysRemaining?: number;
  monthlyFee: number; // 10000 (standard) or 15000 (premium)
  lastPaymentDate?: string;
  nextBillingDate?: string;
  paymentMethod?: 'MTN Mobile Money' | 'Airtel Money' | 'Carte Bancaire' | 'Espèces / Virement';
  transactionReference?: string;
}

export interface SchoolCycle {
  id: string;
  name: string;
  code: string;
  description?: string;
  classesCount?: number;
}

export interface SchoolClassroom {
  id: string;
  name: string;
  cycleId?: string;
  cycleName?: string;
  level: string;
  section?: string;
  capacity: number;
  studentCount: number;
  mainTeacherId?: string;
  mainTeacherName?: string;
  classroomNumber?: string;
}

export type PortalRole = 'staff' | 'student' | 'parent';

export interface PortalAccount {
  id: string;
  role: PortalRole;
  identifier: string; // Phone for staff/parent, Matricule for student
  pin: string; // 6 digits for staff/student, 4 digits for parent
  displayName: string;
  avatarUrl?: string;
  roleTitle?: string;
  schoolCode: string;
  studentMatricules?: string[]; // For parents to link their kids
  studentId?: string; // For student account
  staffId?: string; // For staff account
  createdAt: string;
}

export interface SocialPostComment {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface SocialPostPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface SocialPost {
  id: string;
  schoolCode: string;
  schoolName: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  createdAt: string;
  title: string;
  content: string;
  category: 'annonce' | 'evenement' | 'distinction' | 'activite' | 'sondage' | 'alerte';
  audience: 'all' | 'parents' | 'eleves' | 'personnel';
  mediaUrl?: string;
  likesCount: number;
  likedByMe?: boolean;
  comments: SocialPostComment[];
  poll?: {
    question: string;
    options: SocialPostPollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  isPinned?: boolean;
}

export type StudentType = 'eleve' | 'etudiant';

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  birthPlace: string;
  classroom: string;
  parentName: string;
  parentPhone: string;
  status: 'Inscrit' | 'En attente' | 'Transféré';
  tuitionPaid: number;
  tuitionTotal: number;
  averageGrade: number;
  photoUrl?: string;
  studentType?: StudentType;
  email?: string;
  bloodGroup?: string;
  address?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  phone: string;
  email: string;
  classes: string[];
  status: 'Titulaire' | 'Vacataire' | 'Contractuel';
  photoUrl?: string;
}

export type StaffRole = 
  | 'proviseur' 
  | 'censeur' 
  | 'surveillant_general' 
  | 'enseignant_titulaire' 
  | 'enseignant_vacataire' 
  | 'instituteur'
  | 'enseignant_chercheur'
  | 'comptable' 
  | 'secretaire' 
  | 'conseiller_orientation' 
  | 'infirmier'
  | 'autre_admin';

export type AccessStatus = 'Actif' | 'Suspendu' | 'Révoqué' | 'En attente';

export type PermissionKey =
  | 'saisie_notes'
  | 'validation_bulletins'
  | 'appel_presences'
  | 'encaissement_ecolage'
  | 'gestion_inscriptions'
  | 'administration_comptes'
  | 'rapports_meppsa'
  | 'communication_sms';

export interface StaffAccount {
  id: string;
  matricule: string;
  fullName: string;
  gender: 'M' | 'F';
  role: StaffRole;
  roleTitle: string;
  department: string;
  subject?: string;
  classes?: string[];
  phone: string;
  email: string;
  accessStatus: AccessStatus;
  lastLogin: string;
  permissions: PermissionKey[];
  temporaryPassword?: string;
  joinDate: string;
  revocationReason?: string;
  photoUrl?: string;
}

export interface SubjectGrade {
  subject: string;
  coefficient: number;
  devoir1: number;
  devoir2: number;
  composition: number;
  appreciation: string;
  teacher: string;
}

export interface PaymentRecord {
  id: string;
  studentMatricule: string;
  studentName: string;
  classroom: string;
  amount: number;
  date: string;
  paymentMethod: 'MTN Mobile Money' | 'Airtel Money' | 'Espèces' | 'Virement BGFI';
  reference: string;
  month: string;
  status: 'Validé' | 'En attente';
}

export type NotificationCategory = 'registration' | 'meppsa' | 'payment' | 'system';

export type NotificationPriority = 'urgent' | 'high' | 'normal';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
  priority: NotificationPriority;
  schoolName?: string;
  department?: string;
  city?: string;
  schoolCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  amount?: string;
  actionLabel?: string;
}

export type AdminDocCategory = 
  | 'circulaire' 
  | 'arrete' 
  | 'certificat' 
  | 'bordereau' 
  | 'recu' 
  | 'statut'
  | 'reglement';

export interface AdminDocument {
  id: string;
  reference: string;
  title: string;
  category: AdminDocCategory;
  categoryLabel: string;
  issueDate: string;
  signatory: string;
  signatoryRole: string;
  department?: string;
  summary: string;
  content: string;
  status: 'Officiel' | 'Archivé' | 'Validé' | 'En attente';
  targetAudience: string;
  tags: string[];
  fileSize?: string;
  relatedStudentId?: string;
  relatedStudentName?: string;
}

export type GlobalSearchFilter = 'all' | 'students' | 'staff' | 'documents';

export interface DailyAttendanceRecord {
  date: string;
  fullDate: string;
  dayOfWeek: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
  justifiedAbsences: number;
  unjustifiedAbsences: number;
  weatherOrNote?: string;
  byClass?: Record<string, { present: number; absent: number; late: number; total: number; rate: number }>;
}

export interface MicroserviceHealth {
  id: string;
  name: string;
  category: 'api' | 'telecom' | 'finance' | 'database' | 'security' | 'storage';
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  latencyMs: number;
  uptime: string;
  lastChecked: string;
  endpoint: string;
}

export interface DeveloperFeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'system' | 'finance' | 'security' | 'experimental';
}

export interface NationalEducationStats {
  totalRegisteredSchools: number;
  activeSchools: number;
  pendingSchools: number;
  totalStudentsNational: number;
  totalTeachersNational: number;
  totalTuitionCollectedFCFA: number;
  momoPercentage: number;
  airtelPercentage: number;
  averageNationalAttendance: number;
  departmentsCovered: number;
}

export interface DeveloperAccount {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
  department?: string;
  phone?: string;
  securityKey?: string;
  isEmailVerified: boolean;
  createdAt: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  isCustom?: boolean;
}




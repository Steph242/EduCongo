import { SchoolRegistrationData, RegisteredSchoolAccount, SchoolSubscription, SubscriptionPlanType, SchoolCycle, SchoolClassroom, StaffAccount } from '../types';
import { registerSchoolWithSupabase } from './supabase';

const STORAGE_KEY = 'educongo_registered_schools_prod_v3';
const SCHOOL_DATA_STORAGE_KEY_PREFIX = 'educongo_school_data_prod_v3_';

/**
 * Normalizes phone numbers for accurate Congolese telecom matching
 * Strips non-digits, international prefix +242 / 242, and leading zeros.
 */
export function normalizeCongoPhone(phone: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('242')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Default initial cycles for Congolese educational framework
 */
export const DEFAULT_CONGO_CYCLES: SchoolCycle[] = [
  { id: 'CYC-PRIM', name: 'Enseignement Primaire (CP1 - CM2)', code: 'PRIM', description: 'Cycle Fondamental 1' },
  { id: 'CYC-COL', name: 'Collège d\'Enseignement Général (6ème - 3ème)', code: 'COL', description: 'Cycle Fondamental 2 (BEPC)' },
  { id: 'CYC-LYC-GEN', name: 'Lycée d\'Enseignement Général (2nde - Tle)', code: 'LYC-GEN', description: 'Séries A4, C, D (Baccalauréat Général)' },
  { id: 'CYC-LYC-TECH', name: 'Lycée Technique & Professionnel', code: 'LYC-TECH', description: 'Séries F3, F4, G2, BG (Baccalauréat Technique)' },
  { id: 'CYC-SUP', name: 'Enseignement Supérieur & Université', code: 'SUP', description: 'Licence, Master, BTS' },
];

/**
 * Default initial classrooms for Congolese education
 */
export const DEFAULT_CONGO_CLASSES: SchoolClassroom[] = [
  { id: 'CLS-6A', name: '6ème A', cycleId: 'CYC-COL', cycleName: 'Collège', level: '6ème', section: 'A', capacity: 50, studentCount: 0 },
  { id: 'CLS-5A', name: '5ème A', cycleId: 'CYC-COL', cycleName: 'Collège', level: '5ème', section: 'A', capacity: 50, studentCount: 0 },
  { id: 'CLS-4A', name: '4ème A', cycleId: 'CYC-COL', cycleName: 'Collège', level: '4ème', section: 'A', capacity: 50, studentCount: 0 },
  { id: 'CLS-3A', name: '3ème A', cycleId: 'CYC-COL', cycleName: 'Collège', level: '3ème', section: 'A', capacity: 50, studentCount: 0 },
  { id: 'CLS-2C', name: '2nde C', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: '2nde', section: 'C', capacity: 45, studentCount: 0 },
  { id: 'CLS-2A', name: '2nde A', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: '2nde', section: 'A', capacity: 45, studentCount: 0 },
  { id: 'CLS-1D', name: 'Première D', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: '1ère', section: 'D', capacity: 45, studentCount: 0 },
  { id: 'CLS-1C', name: 'Première C', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: '1ère', section: 'C', capacity: 40, studentCount: 0 },
  { id: 'CLS-TD', name: 'Terminale D', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: 'Terminale', section: 'D', capacity: 45, studentCount: 0 },
  { id: 'CLS-TC', name: 'Terminale C', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: 'Terminale', section: 'C', capacity: 40, studentCount: 0 },
  { id: 'CLS-TA4', name: 'Terminale A4', cycleId: 'CYC-LYC-GEN', cycleName: 'Lycée Général', level: 'Terminale', section: 'A4', capacity: 50, studentCount: 0 },
];

/**
 * Retrieves all registered school accounts from persistent storage.
 * Genuine registered schools are stored here.
 */
export function getRegisteredAccounts(): RegisteredSchoolAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading registered accounts:', err);
  }
  return [];
}

export interface SchoolCustomData {
  isNewlyCreated: boolean;
  students: any[];
  teachers: any[];
  payments: any[];
  staff: StaffAccount[];
  classes: SchoolClassroom[];
  cycles: SchoolCycle[];
  subscription?: SchoolSubscription;
  schoolSettings?: {
    academicYear: string;
    currency: string;
    gradingScale: number;
    passingGrade: number;
    headmasterSignatureUrl?: string;
    schoolStampUrl?: string;
  };
}

/**
 * Get school specific operational data.
 */
export function getSchoolData(schoolCode: string): SchoolCustomData {
  const cleanCode = (schoolCode || '').toUpperCase().trim();
  if (!cleanCode) {
    return {
      isNewlyCreated: true,
      students: [],
      teachers: [],
      payments: [],
      staff: [],
      classes: DEFAULT_CONGO_CLASSES,
      cycles: DEFAULT_CONGO_CYCLES,
      schoolSettings: {
        academicYear: '2024 - 2025',
        currency: 'FCFA',
        gradingScale: 20,
        passingGrade: 10,
      },
    };
  }

  const storageKey = `${SCHOOL_DATA_STORAGE_KEY_PREFIX}${cleanCode}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isNewlyCreated: parsed.isNewlyCreated ?? false,
        students: parsed.students || [],
        teachers: parsed.teachers || [],
        payments: parsed.payments || [],
        staff: parsed.staff || [],
        classes: (parsed.classes && parsed.classes.length > 0) ? parsed.classes : DEFAULT_CONGO_CLASSES,
        cycles: (parsed.cycles && parsed.cycles.length > 0) ? parsed.cycles : DEFAULT_CONGO_CYCLES,
        subscription: parsed.subscription,
        schoolSettings: parsed.schoolSettings || {
          academicYear: '2024 - 2025',
          currency: 'FCFA',
          gradingScale: 20,
          passingGrade: 10,
        },
      };
    }
  } catch (e) {
    console.error('Error loading school data:', e);
  }

  return {
    isNewlyCreated: true,
    students: [],
    teachers: [],
    payments: [],
    staff: [],
    classes: DEFAULT_CONGO_CLASSES,
    cycles: DEFAULT_CONGO_CYCLES,
    schoolSettings: {
      academicYear: '2024 - 2025',
      currency: 'FCFA',
      gradingScale: 20,
      passingGrade: 10,
    },
  };
}

/**
 * Save school specific operational data
 */
export function saveSchoolData(schoolCode: string, data: Partial<SchoolCustomData>): void {
  const cleanCode = (schoolCode || '').toUpperCase().trim();
  if (!cleanCode) return;

  const storageKey = `${SCHOOL_DATA_STORAGE_KEY_PREFIX}${cleanCode}`;
  const current = getSchoolData(schoolCode);
  const merged = { ...current, ...data };

  try {
    localStorage.setItem(storageKey, JSON.stringify(merged));
  } catch (e) {
    console.error('Error saving school data:', e);
  }
}

/**
 * Update an account in the registry
 */
export function updateRegisteredAccount(schoolCode: string, partial: Partial<RegisteredSchoolAccount>): RegisteredSchoolAccount | null {
  const accounts = getRegisteredAccounts();
  const searchCode = (schoolCode || '').toUpperCase().trim();
  let updatedAccount: RegisteredSchoolAccount | null = null;

  const newAccounts = accounts.map((acc) => {
    if (acc.schoolCode.toUpperCase().trim() === searchCode) {
      updatedAccount = { ...acc, ...partial };
      return updatedAccount;
    }
    return acc;
  });

  if (updatedAccount) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
    } catch (e) {
      console.error('Error updating registered account:', e);
    }
  }

  return updatedAccount;
}

/**
 * Get or compute active subscription for a school
 */
export function getSchoolSubscription(schoolCode: string): SchoolSubscription {
  const cleanCode = (schoolCode || '').toUpperCase().trim();
  const schoolData = getSchoolData(cleanCode);
  const accounts = getRegisteredAccounts();
  const account = accounts.find((a) => a.schoolCode.toUpperCase().trim() === cleanCode);

  const existingSub = schoolData.subscription || account?.subscription;
  if (existingSub) {
    // Calculate trial days remaining if trial is active
    if (existingSub.plan === 'trial_active' && existingSub.trialEndDate) {
      const now = new Date().getTime();
      const end = new Date(existingSub.trialEndDate).getTime();
      const diffDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      return {
        ...existingSub,
        trialDaysRemaining: diffDays,
        status: diffDays > 0 ? 'trial' : 'expired',
      };
    }
    return existingSub;
  }

  // Default initial pending trial subscription
  const defaultSub: SchoolSubscription = {
    plan: 'trial_pending',
    planName: 'Essai 14 Jours (En attente d\'activation)',
    status: 'pending_payment',
    membershipFeePaid: false,
    membershipFeeAmount: 2500,
    monthlyFee: 10000,
  };

  return defaultSub;
}

/**
 * Activate 14-day trial after payment of 2 500 FCFA membership fee
 */
export function activateSchoolTrial(
  schoolCode: string,
  paymentMethod: SchoolSubscription['paymentMethod'] = 'MTN Mobile Money',
  transactionRef?: string
): SchoolSubscription {
  const now = new Date();
  const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const ref = transactionRef || `ADHESION-2500-${Date.now().toString(36).toUpperCase()}`;

  const activatedSubscription: SchoolSubscription = {
    plan: 'trial_active',
    planName: 'Période d\'Essai Illimitée (14 Jours)',
    status: 'trial',
    membershipFeePaid: true,
    membershipFeeAmount: 2500,
    trialStartDate: now.toISOString(),
    trialEndDate: endDate.toISOString(),
    trialDaysRemaining: 14,
    monthlyFee: 10000,
    lastPaymentDate: now.toISOString(),
    nextBillingDate: endDate.toISOString(),
    paymentMethod,
    transactionReference: ref,
  };

  saveSchoolData(schoolCode, { subscription: activatedSubscription });
  updateRegisteredAccount(schoolCode, { subscription: activatedSubscription });
  return activatedSubscription;
}

/**
 * Upgrade or change school subscription to Standard (10 000 FCFA) or Premium (15 000 FCFA)
 */
export function updateSchoolSubscriptionPlan(
  schoolCode: string,
  plan: 'standard' | 'premium',
  paymentMethod: SchoolSubscription['paymentMethod'] = 'MTN Mobile Money',
  transactionRef?: string
): SchoolSubscription {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const monthlyFee = plan === 'premium' ? 15000 : 10000;
  const ref = transactionRef || `SUB-${plan.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const updatedSubscription: SchoolSubscription = {
    plan,
    planName: plan === 'premium' ? 'Plan Premium Multi-Cycles (15 000 FCFA / mois)' : 'Plan Standard (10 000 FCFA / mois)',
    status: 'active',
    membershipFeePaid: true,
    membershipFeeAmount: 2500,
    monthlyFee,
    lastPaymentDate: now.toISOString(),
    nextBillingDate: nextMonth.toISOString(),
    paymentMethod,
    transactionReference: ref,
  };

  saveSchoolData(schoolCode, { subscription: updatedSubscription });
  updateRegisteredAccount(schoolCode, { subscription: updatedSubscription });
  return updatedSubscription;
}

/**
 * Check if a school code is already taken
 */
export function isSchoolCodeTaken(schoolCode: string): boolean {
  if (!schoolCode) return false;
  const accounts = getRegisteredAccounts();
  return accounts.some((acc) => acc.schoolCode.toUpperCase() === schoolCode.toUpperCase().trim());
}

/**
 * Check if a work email is already taken
 */
export function isWorkEmailTaken(email: string): boolean {
  if (!email) return false;
  const accounts = getRegisteredAccounts();
  const cleanEmail = email.toLowerCase().trim();
  return accounts.some(
    (acc) =>
      (acc.workEmail && acc.workEmail.toLowerCase().trim() === cleanEmail) ||
      (acc.personalEmail && acc.personalEmail.toLowerCase().trim() === cleanEmail)
  );
}

/**
 * Check if a phone number is already registered
 */
export function isPhoneTaken(phone: string): boolean {
  const normInput = normalizeCongoPhone(phone);
  if (!normInput) return false;
  const accounts = getRegisteredAccounts();
  return accounts.some(
    (acc) =>
      normalizeCongoPhone(acc.workPhone) === normInput ||
      normalizeCongoPhone(acc.personalPhone) === normInput
  );
}

/**
 * Check if a subdomain is already taken
 */
export function isSubdomainTaken(subdomain: string): boolean {
  if (!subdomain) return false;
  const cleanSub = subdomain.toLowerCase().trim();
  const accounts = getRegisteredAccounts();
  return accounts.some((acc) => (acc.subdomain || '').toLowerCase().trim() === cleanSub);
}

/**
 * Save a new registered school account with full Supabase integration
 */
export async function saveRegisteredAccount(data: SchoolRegistrationData): Promise<RegisteredSchoolAccount> {
  const accounts = getRegisteredAccounts();

  const initialSubscription: SchoolSubscription = {
    plan: 'trial_pending',
    planName: 'Essai 14 Jours (Adhésion 2 500 FCFA)',
    status: 'pending_payment',
    membershipFeePaid: false,
    membershipFeeAmount: 2500,
    monthlyFee: 10000,
  };

  const newAccount: RegisteredSchoolAccount = {
    id: `SCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    schoolName: data.schoolName,
    schoolCode: data.schoolCode,
    schoolType: data.schoolType || 'secondaire',
    department: data.department || 'Brazzaville',
    city: data.city || 'Brazzaville',
    arrondissement: data.arrondissement || 'Centre',
    directorName: data.directorName || '',
    adminFullName: data.adminFullName || '',
    adminRole: data.adminRole || 'Directeur / Proviseur',
    workEmail: data.workEmail,
    personalEmail: data.personalEmail || '',
    workPhone: data.workPhone,
    personalPhone: data.personalPhone || '',
    password: data.password || '',
    slogan: data.slogan || 'Discipline - Travail - Succès',
    logoUrl: data.logoUrl || '',
    subdomain: data.subdomain || data.schoolCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    isEmailVerified: data.isEmailVerified ?? false,
    isPhoneVerified: data.isPhoneVerified ?? false,
    registeredAt: new Date().toISOString(),
    status: 'Actif',
    subscription: initialSubscription,
    documents: {
      agrementFile: data.documents?.agrementFile || null,
      statutsFile: data.documents?.statutsFile || null,
      identityFile: data.documents?.identityFile || null,
    },
  };

  accounts.push(newAccount);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving registered account to localStorage:', err);
  }

  // Initialize a clean operational structure with default Congolese cycles and classes
  saveSchoolData(data.schoolCode, {
    isNewlyCreated: true,
    students: [],
    teachers: [],
    payments: [],
    staff: [],
    classes: DEFAULT_CONGO_CLASSES,
    cycles: DEFAULT_CONGO_CYCLES,
    subscription: initialSubscription,
    schoolSettings: {
      academicYear: '2024 - 2025',
      currency: 'FCFA',
      gradingScale: 20,
      passingGrade: 10,
    },
  });

  // Sync to Supabase Auth & Database in background
  registerSchoolWithSupabase(data).catch((e) => {
    console.warn('Supabase sync notice:', e);
  });

  return newAccount;
}

/**
 * Mark a school account as verified after Supabase email confirmation
 */
export function markAccountEmailVerified(emailOrCode: string): boolean {
  if (!emailOrCode) return false;
  const accounts = getRegisteredAccounts();
  const search = emailOrCode.trim().toLowerCase();
  let found = false;

  const updated = accounts.map((acc) => {
    if (
      acc.workEmail.toLowerCase() === search ||
      acc.personalEmail?.toLowerCase() === search ||
      acc.schoolCode.toLowerCase() === search
    ) {
      found = true;
      return { ...acc, isEmailVerified: true };
    }
    return acc;
  });

  if (found) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating email verification in storage:', e);
    }
  }
  return found;
}

export interface VerificationResult {
  success: boolean;
  error?: 'ACCOUNT_NOT_FOUND' | 'INVALID_PASSWORD' | 'EMPTY_CREDENTIALS' | 'EMAIL_NOT_VERIFIED';
  errorMessage?: string;
  account?: RegisteredSchoolAccount;
}

/**
 * Strictly verifies credentials against registered accounts.
 */
export function verifySchoolLogin(
  identifier: string,
  passwordInput: string,
  mode: 'phone' | 'email'
): VerificationResult {
  const trimmedId = (identifier || '').trim();
  const trimmedPass = (passwordInput || '').trim();

  if (!trimmedId || !trimmedPass) {
    return {
      success: false,
      error: 'EMPTY_CREDENTIALS',
      errorMessage: 'Veuillez saisir vos identifiants et votre mot de passe.',
    };
  }

  const accounts = getRegisteredAccounts();
  let matchedAccount: RegisteredSchoolAccount | undefined;

  if (mode === 'phone') {
    const inputPhoneDigits = normalizeCongoPhone(trimmedId);
    if (!inputPhoneDigits || inputPhoneDigits.length < 6) {
      return {
        success: false,
        error: 'ACCOUNT_NOT_FOUND',
        errorMessage: 'Numéro de téléphone congolais non reconnu.',
      };
    }

    matchedAccount = accounts.find((acc) => {
      const workDigits = normalizeCongoPhone(acc.workPhone);
      const personalDigits = normalizeCongoPhone(acc.personalPhone);
      return (workDigits && workDigits === inputPhoneDigits) || (personalDigits && personalDigits === inputPhoneDigits);
    });
  } else {
    // Mode email ou code établissement
    const lowerId = trimmedId.toLowerCase();
    matchedAccount = accounts.find((acc) => {
      const matchWorkEmail = acc.workEmail && acc.workEmail.toLowerCase() === lowerId;
      const matchPersonalEmail = acc.personalEmail && acc.personalEmail.toLowerCase() === lowerId;
      const matchCode = acc.schoolCode && acc.schoolCode.toLowerCase() === lowerId;
      return matchWorkEmail || matchPersonalEmail || matchCode;
    });
  }

  if (!matchedAccount) {
    return {
      success: false,
      error: 'ACCOUNT_NOT_FOUND',
      errorMessage:
        mode === 'phone'
          ? `Aucun compte établissement n'est enregistré avec le numéro ${trimmedId}. Veuillez d'abord créer un compte.`
          : `Aucun compte établissement n'est enregistré avec l'identifiant "${trimmedId}". Veuillez vérifier la saisie ou créer un compte.`,
    };
  }

  // Verify password strictly against credentials
  const expectedPassword = matchedAccount.password;

  if (!expectedPassword || expectedPassword !== trimmedPass) {
    return {
      success: false,
      error: 'INVALID_PASSWORD',
      errorMessage: 'Mot de passe incorrect pour ce compte administrateur.',
      account: matchedAccount,
    };
  }

  // Verify email confirmation status
  if (matchedAccount.isEmailVerified === false) {
    return {
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      errorMessage: "L'adresse e-mail de votre établissement n'a pas encore été confirmée via Supabase. Veuillez valider votre e-mail pour accéder au tableau de bord.",
      account: matchedAccount,
    };
  }

  return {
    success: true,
    account: matchedAccount,
  };
}

import { SchoolRegistrationData, RegisteredSchoolAccount, SchoolSubscription, SubscriptionPlanType, SchoolCycle, SchoolClassroom, StaffAccount, SchoolStatus } from '../types';
import { registerSchoolWithSupabase, supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'educongo_registered_schools_prod_v3';
const SCHOOL_DATA_STORAGE_KEY_PREFIX = 'educongo_school_data_prod_v3_';
const DELETED_SCHOOLS_BLACKLIST_KEY = 'educongo_deleted_school_codes_v3';

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
 * Retrieves the blacklist of explicitly deleted school codes
 */
export function getDeletedSchoolCodes(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SCHOOLS_BLACKLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((c: string) => c.toUpperCase().trim());
    }
  } catch {}
  return [];
}

/**
 * Blacklists a deleted school code so it is NEVER restored from remote sync
 */
export function recordDeletedSchoolCode(code: string): void {
  if (!code) return;
  const clean = code.toUpperCase().trim();
  const current = getDeletedSchoolCodes();
  if (!current.includes(clean)) {
    current.push(clean);
    try {
      localStorage.setItem(DELETED_SCHOOLS_BLACKLIST_KEY, JSON.stringify(current));
    } catch {}
  }
}

/**
 * Removes a school code from the blacklist (e.g. if newly created)
 */
export function removeDeletedSchoolCode(code: string): void {
  if (!code) return;
  const clean = code.toUpperCase().trim();
  const current = getDeletedSchoolCodes().filter((c) => c !== clean);
  try {
    localStorage.setItem(DELETED_SCHOOLS_BLACKLIST_KEY, JSON.stringify(current));
  } catch {}
}

/**
 * Initial cycles for educational framework - Pure empty state (configured by school admin)
 */
export const DEFAULT_CONGO_CYCLES: SchoolCycle[] = [];

/**
 * Initial classrooms - Pure empty state (configured by school admin)
 */
export const DEFAULT_CONGO_CLASSES: SchoolClassroom[] = [];

/**
 * Saves the full list of registered accounts
 */
export function saveRegisteredAccountsList(accounts: RegisteredSchoolAccount[]): void {
  try {
    const deletedCodes = new Set(getDeletedSchoolCodes());
    const filtered = accounts.filter((a) => !deletedCodes.has(a.schoolCode.toUpperCase().trim()));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error saving registered accounts list:', err);
  }
}

/**
 * Retrieves all registered school accounts from persistent storage.
 * Genuine registered schools are stored here.
 */
export function getRegisteredAccounts(): RegisteredSchoolAccount[] {
  try {
    const deletedCodes = new Set(getDeletedSchoolCodes());
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((a: RegisteredSchoolAccount) => !deletedCodes.has(a.schoolCode?.toUpperCase().trim()));
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
      classes: [],
      cycles: [],
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
        classes: parsed.classes || [],
        cycles: parsed.cycles || [],
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
    classes: [],
    cycles: [],
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
    planName: "Essai Gratuit 14 Jours (En attente d'activation)",
    status: 'pending_payment',
    membershipFeePaid: false,
    membershipFeeAmount: 0,
    monthlyFee: 10000,
  };

  return defaultSub;
}

/**
 * Activate 100% Free 14-day trial (0 FCFA, no membership fee)
 */
export function activateSchoolTrial(
  schoolCode: string,
  paymentMethod: SchoolSubscription['paymentMethod'] = 'Espèces / Virement',
  transactionRef?: string
): SchoolSubscription {
  const now = new Date();
  const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const ref = transactionRef || `ESSAI-GRATUIT-${Date.now().toString(36).toUpperCase()}`;

  const activatedSubscription: SchoolSubscription = {
    plan: 'trial_active',
    planName: "Période d'Essai Gratuite (14 Jours)",
    status: 'trial',
    membershipFeePaid: true,
    membershipFeeAmount: 0,
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
  paymentMethod: SchoolSubscription['paymentMethod'] = 'Espèces / Virement',
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
    membershipFeeAmount: 0,
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
 * Check if a school name is already taken (case-insensitive)
 */
export function isSchoolNameTaken(schoolName: string, excludeCode?: string): boolean {
  if (!schoolName) return false;
  const accounts = getRegisteredAccounts();
  const cleanName = schoolName.trim().toLowerCase();
  const exclude = (excludeCode || '').trim().toUpperCase();
  return accounts.some((acc) => {
    if (exclude && acc.schoolCode.toUpperCase() === exclude) return false;
    return (acc.schoolName || '').trim().toLowerCase() === cleanName;
  });
}

/**
 * Check if a school code is already taken
 */
export function isSchoolCodeTaken(schoolCode: string, excludeCode?: string): boolean {
  if (!schoolCode) return false;
  const accounts = getRegisteredAccounts();
  const cleanCode = schoolCode.toUpperCase().trim();
  const exclude = (excludeCode || '').trim().toUpperCase();
  return accounts.some((acc) => {
    if (exclude && acc.schoolCode.toUpperCase() === exclude) return false;
    return acc.schoolCode.toUpperCase().trim() === cleanCode;
  });
}

/**
 * Check if a work email is already taken
 */
export function isWorkEmailTaken(email: string, excludeCode?: string): boolean {
  if (!email) return false;
  const accounts = getRegisteredAccounts();
  const cleanEmail = email.toLowerCase().trim();
  const exclude = (excludeCode || '').trim().toUpperCase();
  return accounts.some((acc) => {
    if (exclude && acc.schoolCode.toUpperCase() === exclude) return false;
    return (
      (acc.workEmail && acc.workEmail.toLowerCase().trim() === cleanEmail) ||
      (acc.personalEmail && acc.personalEmail.toLowerCase().trim() === cleanEmail)
    );
  });
}

/**
 * Check if a phone number is already registered
 */
export function isPhoneTaken(phone: string, excludeCode?: string): boolean {
  const normInput = normalizeCongoPhone(phone);
  if (!normInput || normInput.length < 6) return false;
  const accounts = getRegisteredAccounts();
  const exclude = (excludeCode || '').trim().toUpperCase();
  return accounts.some((acc) => {
    if (exclude && acc.schoolCode.toUpperCase() === exclude) return false;
    return (
      normalizeCongoPhone(acc.workPhone) === normInput ||
      normalizeCongoPhone(acc.personalPhone) === normInput
    );
  });
}

/**
 * Check if a subdomain is already taken
 */
export function isSubdomainTaken(subdomain: string, excludeCode?: string): boolean {
  if (!subdomain) return false;
  const cleanSub = subdomain.toLowerCase().trim();
  const accounts = getRegisteredAccounts();
  const exclude = (excludeCode || '').trim().toUpperCase();
  return accounts.some((acc) => {
    if (exclude && acc.schoolCode.toUpperCase() === exclude) return false;
    return (acc.subdomain || '').toLowerCase().trim() === cleanSub;
  });
}

/**
 * Save a new registered school account with full Supabase integration
 */
export async function saveRegisteredAccount(data: SchoolRegistrationData): Promise<RegisteredSchoolAccount> {
  const accounts = getRegisteredAccounts();

  // Validate strict uniqueness constraints
  if (isSchoolNameTaken(data.schoolName)) {
    throw new Error(`Un établissement portant le nom "${data.schoolName}" est déjà enregistré sur EduCongo.`);
  }

  if (isWorkEmailTaken(data.workEmail)) {
    throw new Error(`L'adresse e-mail "${data.workEmail}" est déjà associée à un établissement enregistré.`);
  }

  if (isPhoneTaken(data.workPhone)) {
    throw new Error(`Le numéro de téléphone (+242) "${data.workPhone}" est déjà associé à un établissement.`);
  }

  const finalSubdomain = (data.subdomain || data.schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase().trim();
  if (isSubdomainTaken(finalSubdomain)) {
    throw new Error(`Le sous-domaine "${finalSubdomain}" est déjà utilisé.`);
  }

  const initialSubscription: SchoolSubscription = {
    plan: 'trial_pending',
    planName: "Essai Gratuit 14 Jours (En attente d'activation)",
    status: 'pending_payment',
    membershipFeePaid: false,
    membershipFeeAmount: 0,
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

export const registerSchoolAccount = saveRegisteredAccount;

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

  // Verify school status (Requirement 3)
  if (matchedAccount.status === 'Désactivé' || (matchedAccount.status as string) === 'Inactif') {
    return {
      success: false,
      error: 'ACCOUNT_NOT_FOUND',
      errorMessage: "Cet établissement a été désactivé par l'administration centrale. L'accès est strictement inaccessible pour l'ensemble des utilisateurs.",
      account: matchedAccount,
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

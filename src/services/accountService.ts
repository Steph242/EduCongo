import { SchoolRegistrationData, RegisteredSchoolAccount } from '../types';
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
 * Retrieves all registered school accounts from persistent storage.
 * Only genuine registered schools are stored here.
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
  staff: any[];
  classes: string[];
  cycles: string[];
}

/**
 * Get school specific operational data.
 * Every newly registered school is 100% EMPTY by default (virgin state).
 * All indicators at 0, no pre-filled classes, no pre-filled students or teachers.
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
    };
  }

  const storageKey = `${SCHOOL_DATA_STORAGE_KEY_PREFIX}${cleanCode}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading school data:', e);
  }

  // 100% Empty state for new schools
  return {
    isNewlyCreated: true,
    students: [],
    teachers: [],
    payments: [],
    staff: [],
    classes: [],
    cycles: [],
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
 * and initialize a completely empty data record.
 */
export async function saveRegisteredAccount(data: SchoolRegistrationData): Promise<RegisteredSchoolAccount> {
  const accounts = getRegisteredAccounts();

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

  // Initialize a completely empty record for this school
  saveSchoolData(data.schoolCode, {
    isNewlyCreated: true,
    students: [],
    teachers: [],
    payments: [],
    staff: [],
    classes: [],
    cycles: [],
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

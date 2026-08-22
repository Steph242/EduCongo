import { SchoolRegistrationData, RegisteredSchoolAccount } from '../types';
import { registerSchoolWithSupabase } from './supabase';

const STORAGE_KEY = 'educongo_registered_schools_prod_v2';
const SCHOOL_DATA_STORAGE_KEY_PREFIX = 'educongo_school_data_prod_v2_';

/**
 * Super Administrator account configured for direct login and system administration
 */
export const SUPER_ADMIN_ACCOUNT: RegisteredSchoolAccount = {
  id: 'SUPER_ADMIN_STEPH',
  schoolName: 'Super Administration EduCongo (MEPPSA)',
  schoolCode: 'SUPER-ADMIN-CG',
  schoolType: 'superadmin',
  department: 'Brazzaville',
  city: 'Brazzaville',
  arrondissement: 'Plateau des 15 Ans',
  directorName: 'Steph ALONGO',
  adminFullName: 'Steph ALONGO',
  adminRole: 'superadmin',
  workEmail: 'steph.alongo@gmail.com',
  personalEmail: 'steph.alongo@gmail.com',
  workPhone: '+242 06 600 00 00',
  personalPhone: '+242 06 600 00 00',
  password: 'Verlaine92/Brealy95/',
  registeredAt: '2024-01-01T00:00:00.000Z',
  status: 'Actif',
  isEmailVerified: true,
  slogan: 'Direction Générale & Supervision Nationale des Établissements',
  subdomain: 'superadmin',
  documents: {
    agrementFile: null,
    statutsFile: null,
    identityFile: null,
  },
};

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
 * Always includes the super administrator account and newly registered schools.
 */
export function getRegisteredAccounts(): RegisteredSchoolAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Ensure super admin is included and no duplicates
        const filtered = parsed.filter(
          (acc) => acc.workEmail?.toLowerCase() !== 'steph.alongo@gmail.com'
        );
        return [SUPER_ADMIN_ACCOUNT, ...filtered];
      }
    }
  } catch (err) {
    console.error('Error loading registered accounts:', err);
  }
  return [SUPER_ADMIN_ACCOUNT];
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
 * Requirement 3: Every newly registered school is 100% EMPTY by default.
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

  // 100% Empty state for new schools: Administrator must configure from A to Z
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
 * Save school operational data
 */
export function saveSchoolData(schoolCode: string, data: Partial<SchoolCustomData>): void {
  const cleanCode = (schoolCode || '').toUpperCase().trim();
  const storageKey = `${SCHOOL_DATA_STORAGE_KEY_PREFIX}${cleanCode}`;
  const existing = getSchoolData(cleanCode);
  const updated = { ...existing, ...data };
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving school data:', e);
  }
}

/**
 * Saves a new registered school account to persistent storage and connects with Supabase.
 */
export function saveRegisteredAccount(data: SchoolRegistrationData): RegisteredSchoolAccount {
  const accounts = getRegisteredAccounts();

  // Check if an account with this schoolCode or email/phone already exists to update it
  const cleanCode = (data.schoolCode || '').trim().toUpperCase();
  const existingIndex = accounts.findIndex(
    (acc) =>
      (cleanCode && acc.schoolCode.toUpperCase() === cleanCode) ||
      (data.workEmail && acc.workEmail.toLowerCase() === data.workEmail.trim().toLowerCase()) ||
      (data.workPhone && normalizeCongoPhone(acc.workPhone) === normalizeCongoPhone(data.workPhone))
  );

  const newAccount: RegisteredSchoolAccount = {
    id: existingIndex >= 0 ? accounts[existingIndex].id : 'sch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    schoolName: data.schoolName.trim(),
    schoolCode: data.schoolCode.trim().toUpperCase(),
    schoolType: data.schoolType || 'secondaire',
    department: data.department || 'Brazzaville',
    city: data.city || 'Brazzaville',
    arrondissement: data.arrondissement || '',
    directorName: data.directorName || '',
    adminFullName: data.adminFullName || '',
    adminRole: data.adminRole || 'proviseur',
    workEmail: data.workEmail.trim().toLowerCase(),
    personalEmail: (data.personalEmail || '').trim().toLowerCase(),
    workPhone: data.workPhone.trim(),
    personalPhone: (data.personalPhone || '').trim(),
    password: data.password || 'EduCongo2024!',
    registeredAt: new Date().toISOString(),
    status: 'Actif',
    isEmailVerified: Boolean(data.isEmailVerified),
    documents: {
      agrementFile: data.documents?.agrementFile || null,
      statutsFile: data.documents?.statutsFile || null,
      identityFile: data.documents?.identityFile || null,
    },
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = newAccount;
  } else {
    accounts.push(newAccount);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving account to localStorage:', err);
  }

  // Initialize strictly EMPTY data state for this newly registered school
  saveSchoolData(cleanCode, {
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
 * Strictly verifies credentials against registered accounts and Super Admin.
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


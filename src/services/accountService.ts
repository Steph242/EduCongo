import { SchoolRegistrationData, RegisteredSchoolAccount } from '../types';
import { INITIAL_REGISTERED_SCHOOLS } from '../data/mockRegisteredSchools';
import { registerSchoolWithSupabase } from './supabase';

const STORAGE_KEY = 'educongo_registered_schools_prod';
const SCHOOL_DATA_STORAGE_KEY_PREFIX = 'educongo_school_data_prod_';

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
  return INITIAL_REGISTERED_SCHOOLS;
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
 * Returns persisted data or clean empty state for genuine administration.
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

  // Real production school: strictly clean data
  return {
    isNewlyCreated: true,
    students: [],
    teachers: [],
    payments: [],
    staff: [],
    classes: ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'],
    cycles: ['Collège', 'Lycée'],
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
    staff: [
      {
        id: 'staff_admin_init',
        matricule: `ADM-${cleanCode}-01`,
        fullName: data.adminFullName || data.directorName || 'Administrateur Principal',
        gender: 'M',
        role: (data.adminRole as any) || 'proviseur',
        roleTitle: 'Administrateur Général Établissement',
        department: 'Direction Générale',
        phone: data.workPhone,
        email: data.workEmail,
        accessStatus: 'Actif',
        lastLogin: 'À l\'instant',
        permissions: [
          'saisie_notes',
          'validation_bulletins',
          'appel_presences',
          'encaissement_ecolage',
          'gestion_inscriptions',
          'administration_comptes',
          'rapports_meppsa',
          'communication_sms',
        ],
        joinDate: new Date().toLocaleDateString('fr-FR'),
      },
    ],
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
 * Strictly verifies credentials against actually registered accounts.
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

  // Verify password strictly against registered school credentials
  const expectedPassword = matchedAccount.password;
  
  if (!expectedPassword || expectedPassword !== trimmedPass) {
    return {
      success: false,
      error: 'INVALID_PASSWORD',
      errorMessage: 'Mot de passe incorrect pour cet établissement.',
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

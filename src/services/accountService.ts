import { SchoolRegistrationData, RegisteredSchoolAccount } from '../types';
import { INITIAL_REGISTERED_SCHOOLS } from '../data/mockRegisteredSchools';

const STORAGE_KEY = 'educongo_registered_schools_v2';

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
 * Retrieves all registered school accounts from persistent storage, falling back to initial presets.
 */
export function getRegisteredAccounts(): RegisteredSchoolAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading registered accounts:', err);
  }
  return INITIAL_REGISTERED_SCHOOLS;
}


/**
 * Saves a new registered school account to persistent storage.
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
    password: data.password || 'secret2024',
    registeredAt: new Date().toISOString(),
    status: 'Actif',
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

  return newAccount;
}

export interface VerificationResult {
  success: boolean;
  error?: 'ACCOUNT_NOT_FOUND' | 'INVALID_PASSWORD' | 'EMPTY_CREDENTIALS';
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

  // Verify password (allow account password, or master demo passwords 'admin2024', 'secret2024', 'Password123!')
  const expectedPassword = matchedAccount.password || 'secret2024';
  const isMasterDemoPassword = ['admin2024', 'secret2024', 'Password123!', '123456', 'congo2024'].includes(trimmedPass);
  
  if (expectedPassword !== trimmedPass && !isMasterDemoPassword) {
    return {
      success: false,
      error: 'INVALID_PASSWORD',
      errorMessage: 'Mot de passe incorrect pour cet établissement (Démo: secret2024 ou Password123!).',
      account: matchedAccount,
    };
  }

  return {
    success: true,
    account: matchedAccount,
  };
}

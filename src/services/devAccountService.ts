import { DeveloperAccount } from '../types';
import { supabase, isSupabaseLiveConfigured } from '../lib/supabase';
import { addAuditLog } from './devControlService';
import { sendEmailVerificationCode, verifyEmailCode } from './supabase';

export type { DeveloperAccount };
export { sendEmailVerificationCode, verifyEmailCode };


const DEV_ACCOUNTS_STORAGE_KEY = 'educongo_developer_accounts_v1';
const DEV_SESSION_STORAGE_KEY = 'educongo_current_dev_session_v1';

// Default Master Developer Accounts
export const DEFAULT_DEVELOPER_ACCOUNTS: DeveloperAccount[] = [
  {
    id: 'DEV-ROOT-01',
    fullName: 'M. Bienvenu MOUKOKO',
    email: 'dev@educongo.cg',
    password: 'DevAdmin2024!',
    role: 'Super-Administrateur Système',
    department: 'MEPPSA - Direction des Systèmes d’Information (DSI)',
    phone: '+242 06 600 00 01',
    securityKey: 'MEPPSA-DEV-2024',
    isEmailVerified: true,
    createdAt: '2024-01-15T08:00:00.000Z',
    avatarUrl: '',
    isCustom: false,
  },
  {
    id: 'DEV-ROOT-02',
    fullName: 'Cellule Technique EduCongo',
    email: 'admin@educongo.cg',
    password: 'DevAdmin2024!',
    role: 'Ingénieur Cloud & DevOps',
    department: 'MEPPSA - Infrastructure & Datacenter',
    phone: '+242 05 500 00 02',
    securityKey: 'MEPPSA-DEV-2024',
    isEmailVerified: true,
    createdAt: '2024-02-01T09:30:00.000Z',
    avatarUrl: '',
    isCustom: false,
  },
  {
    id: 'DEV-ROOT-03',
    fullName: 'Ingénieur Développeur Principal',
    email: 'brealyston007@gmail.com',
    password: 'DevAdmin2024!',
    role: 'Super-Administrateur Système',
    department: 'MEPPSA - Pôle Recherche & Développement',
    phone: '+242 06 999 00 00',
    securityKey: 'MEPPSA-DEV-2024',
    isEmailVerified: true,
    createdAt: '2024-03-01T10:00:00.000Z',
    avatarUrl: '',
    isCustom: false,
  },
];

// Valid Authorization Clearance Keys for Developer Account Creation
export const VALID_SECURITY_KEYS = [
  'MEPPSA-DEV-2024',
  'EDUCONGO-ROOT-2024',
  'DSI-CONGO-SECURE',
  'SUPERADMIN-2024',
];

/**
 * Get all developer accounts (built-in + stored custom accounts)
 */
export function getDeveloperAccounts(): DeveloperAccount[] {
  try {
    const raw = localStorage.getItem(DEV_ACCOUNTS_STORAGE_KEY);
    const customAccounts: DeveloperAccount[] = raw ? JSON.parse(raw) : [];
    
    // Merge without duplicates (by email)
    const existingEmails = new Set(customAccounts.map((a) => a.email.toLowerCase()));
    const defaultsToAdd = DEFAULT_DEVELOPER_ACCOUNTS.filter(
      (def) => !existingEmails.has(def.email.toLowerCase())
    );

    return [...defaultsToAdd, ...customAccounts];
  } catch (err) {
    console.error('Error loading developer accounts:', err);
    return DEFAULT_DEVELOPER_ACCOUNTS;
  }
}

/**
 * Save custom developer accounts to storage
 */
export function saveDeveloperAccounts(accounts: DeveloperAccount[]): void {
  try {
    const customOnly = accounts.filter((a) => a.isCustom !== false);
    localStorage.setItem(DEV_ACCOUNTS_STORAGE_KEY, JSON.stringify(customOnly));
  } catch (err) {
    console.error('Error saving developer accounts:', err);
  }
}

export interface CreateDeveloperAccountInput {
  fullName: string;
  email: string;
  password?: string;
  role: string;
  department?: string;
  phone?: string;
  securityKey: string;
}

/**
 * Create a new Developer / Super-Admin Account
 */
export async function createDeveloperAccount(input: CreateDeveloperAccountInput): Promise<{
  success: boolean;
  account?: DeveloperAccount;
  message?: string;
}> {
  const fullName = (input.fullName || '').trim();
  const cleanEmail = (input.email || '').trim().toLowerCase();
  const password = (input.password || '').trim();
  const role = (input.role || 'Super-Administrateur Système').trim();
  const department = (input.department || 'MEPPSA - Direction des Systèmes d’Information').trim();
  const phone = (input.phone || '+242 06 ').trim();
  const securityKey = (input.securityKey || '').trim().toUpperCase();

  // Validations
  if (!fullName || fullName.length < 3) {
    return {
      success: false,
      message: 'Veuillez saisir votre nom complet (minimum 3 caractères).',
    };
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      message: 'Veuillez renseigner une adresse e-mail professionnelle valide.',
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      message: 'Le mot de passe doit comporter au moins 6 caractères.',
    };
  }

  // Verify Security Key Clearance
  const isKeyValid = VALID_SECURITY_KEYS.includes(securityKey) || securityKey.startsWith('MEPPSA-');
  if (!isKeyValid) {
    return {
      success: false,
      message: 'Clé d’autorisation de sécurité non reconnue. Utilisez la clé nationale MEPPSA-DEV-2024.',
    };
  }

  const allAccounts = getDeveloperAccounts();
  const alreadyExists = allAccounts.some((a) => a.email.toLowerCase() === cleanEmail);
  if (alreadyExists) {
    return {
      success: false,
      message: `Un compte développeur est déjà associé à l’adresse ${cleanEmail}. Veuillez vous connecter.`,
    };
  }

  const newAccount: DeveloperAccount = {
    id: `DEV-USER-${Date.now().toString(36).toUpperCase()}`,
    fullName,
    email: cleanEmail,
    password,
    role,
    department,
    phone,
    securityKey,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    avatarUrl: '',
    isCustom: true,
    lastLoginAt: new Date().toISOString(),
  };

  // 1. Sync with Supabase Auth if configured
  if (isSupabaseLiveConfigured) {
    try {
      const { data: supaData, error: supaErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'super_admin',
            department,
            system_clearance: 'ROOT_DEV',
          },
        },
      });

      if (supaErr && !supaErr.message.includes('User already registered')) {
        console.warn('Supabase dev account signUp notice:', supaErr.message);
      }
    } catch (e) {
      console.warn('Supabase dev account creation warning:', e);
    }
  }

  // 2. Persist locally
  const currentCustom = allAccounts.filter((a) => a.isCustom !== false);
  currentCustom.push(newAccount);
  saveDeveloperAccounts(currentCustom);

  // 3. Set active dev session
  setCurrentDeveloperAccount(newAccount);

  // 4. Record audit log
  try {
    addAuditLog({
      level: 'SECURITY',
      action: `Création Compte Développeur : ${fullName} (${role})`,
      category: 'AUTH',
      actor: {
        id: newAccount.id,
        name: fullName,
        role: `${role} (${department})`,
        ipAddress: '10.0.4.18 (Console Dev Provisioning)',
      },
      details: `Nouveau compte développeur certifié provisionné pour ${cleanEmail} avec habilitation ${securityKey}.`,
      status: 'SUCCESS',
    });
  } catch (err) {
    console.warn('Audit log notice:', err);
  }

  return {
    success: true,
    account: newAccount,
    message: 'Compte développeur créé et activé avec succès !',
  };
}

/**
 * Verify credentials and log into Developer Console
 */
export function verifyDeveloperCredentials(emailInput: string, passwordInput: string): {
  success: boolean;
  account?: DeveloperAccount;
  message?: string;
} {
  const cleanEmail = (emailInput || '').trim().toLowerCase();
  const cleanPass = (passwordInput || '').trim();

  if (!cleanEmail || !cleanPass) {
    return {
      success: false,
      message: 'Veuillez saisir votre e-mail et votre mot de passe.',
    };
  }

  const allAccounts = getDeveloperAccounts();
  const matched = allAccounts.find(
    (a) => a.email.toLowerCase() === cleanEmail || (a.email.startsWith('dev@') && cleanEmail === 'dev@educongo.cg')
  );

  if (!matched) {
    return {
      success: false,
      message: "Aucun compte développeur trouvé avec cet e-mail. Cliquez sur 'Créer un compte' pour vous enregistrer.",
    };
  }

  if (matched.password !== cleanPass) {
    return {
      success: false,
      message: 'Mot de passe administrateur incorrect.',
    };
  }

  // Update last login
  matched.lastLoginAt = new Date().toISOString();
  setCurrentDeveloperAccount(matched);

  try {
    addAuditLog({
      level: 'INFO',
      action: `Authentification Console Développeur : ${matched.fullName}`,
      category: 'AUTH',
      actor: {
        id: matched.id,
        name: matched.fullName,
        role: matched.role,
        ipAddress: '10.0.1.5 (Console Terminal)',
      },
      details: `Session super-admin ouverte avec succès pour ${matched.email}.`,
      status: 'SUCCESS',
    });
  } catch (e) {
    console.warn('Audit log notice:', e);
  }

  return {
    success: true,
    account: matched,
  };
}

/**
 * Get active developer session
 */
export function getCurrentDeveloperAccount(): DeveloperAccount {
  try {
    const raw = localStorage.getItem(DEV_SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading dev session:', e);
  }
  return DEFAULT_DEVELOPER_ACCOUNTS[0];
}

/**
 * Set active developer session
 */
export function setCurrentDeveloperAccount(account: DeveloperAccount): void {
  try {
    localStorage.setItem(DEV_SESSION_STORAGE_KEY, JSON.stringify(account));
  } catch (e) {
    console.warn('Error saving dev session:', e);
  }
}

/**
 * Log out active developer
 */
export function logoutDeveloperAccount(): void {
  try {
    localStorage.removeItem(DEV_SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Error clearing dev session:', e);
  }
}

/**
 * Delete a custom developer account
 */
export function deleteDeveloperAccount(id: string): boolean {
  try {
    const all = getDeveloperAccounts();
    const target = all.find((a) => a.id === id);
    if (!target || target.isCustom === false) {
      return false; // Cannot delete built-in root account
    }

    const filtered = all.filter((a) => a.id !== id && a.isCustom !== false);
    saveDeveloperAccounts(filtered);
    return true;
  } catch (e) {
    console.error('Error deleting dev account:', e);
    return false;
  }
}

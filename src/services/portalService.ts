import { PortalAccount, PortalRole, Student, StaffRole } from '../types';
import { INITIAL_STUDENTS } from '../data/mockData';
import { INITIAL_STAFF_ACCOUNTS, ROLE_DEFAULT_PERMISSIONS, STAFF_PROFILE_OPTIONS } from '../data/mockStaff';

const STORAGE_PORTAL_KEY = 'educongo_portal_accounts_v1';

// Seed initial demo accounts for instant testability
const INITIAL_PORTAL_ACCOUNTS: PortalAccount[] = [
  {
    id: 'pa_staff_1',
    role: 'staff',
    identifier: '066501234',
    pin: '123456',
    displayName: 'Dieudonné MAVOUNGOU',
    roleTitle: "Proviseur / Chef d'Établissement",
    schoolCode: 'BZV-24-X8B',
    staffId: 'STAFF-001',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_staff_2',
    role: 'staff',
    identifier: '066504321',
    pin: '123456',
    displayName: 'Prof. Dieudonné Mikala',
    roleTitle: 'Professeur Titulaire de Mathématiques',
    schoolCode: 'BZV-24-X8B',
    staffId: 'STAFF-003',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_staff_3',
    role: 'staff',
    identifier: '055331278',
    pin: '123456',
    displayName: 'Mme. Solange Mabiala',
    roleTitle: 'Professeure de Français & Philosophie',
    schoolCode: 'BZV-24-X8B',
    staffId: 'STAFF-004',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_staff_4',
    role: 'staff',
    identifier: '057776655',
    pin: '123456',
    displayName: 'Mme. Nadine Tsaty',
    roleTitle: 'Agent Comptable & Écolage',
    schoolCode: 'BZV-24-X8B',
    staffId: 'STAFF-006',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_staff_5',
    role: 'staff',
    identifier: '065008812',
    pin: '123456',
    displayName: 'M. Alain Koumba',
    roleTitle: 'Surveillant Général (Vie Scolaire)',
    schoolCode: 'BZV-24-X8B',
    staffId: 'STAFF-007',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_student_1',
    role: 'student',
    identifier: 'CG-2024-0891',
    pin: '123456',
    displayName: 'Prince MAVOUNGOU',
    roleTitle: 'Élève - Terminale D',
    schoolCode: 'BZV-24-X8B',
    studentId: 'STU-001',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_student_2',
    role: 'student',
    identifier: 'CG-2024-1102',
    pin: '234567',
    displayName: 'Grace MOUKOKO',
    roleTitle: 'Élève - Première C',
    schoolCode: 'BZV-24-X8B',
    studentId: 'STU-002',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
  {
    id: 'pa_parent_1',
    role: 'parent',
    identifier: '066504433',
    pin: '1234',
    displayName: 'Mme Chantal NGOULOU MAVOUNGOU',
    roleTitle: 'Parent d\'élève (2 enfants scolarisés)',
    schoolCode: 'BZV-24-X8B',
    studentMatricules: ['CG-2024-0891', 'CG-2024-1102'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-09-01',
  },
];

export function getPortalAccounts(): PortalAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_PORTAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {}
  return INITIAL_PORTAL_ACCOUNTS;
}

export function savePortalAccount(acc: PortalAccount): void {
  const list = getPortalAccounts();
  const filtered = list.filter((a) => a.id !== acc.id && !(a.role === acc.role && a.identifier === acc.identifier));
  filtered.unshift(acc);
  try {
    localStorage.setItem(STORAGE_PORTAL_KEY, JSON.stringify(filtered));
  } catch (err) {}
}

export function normalizeIdentifier(val: string): string {
  return val.replace(/\s+/g, '').replace(/^(\+242|00242)/, '').toUpperCase().trim();
}

/**
 * Authenticate or create portal PIN access
 */
export function authenticatePortalUser(
  role: PortalRole,
  rawIdentifier: string,
  enteredPin: string,
  isRegisteringPin: boolean = false,
  staffRole?: StaffRole
): {
  success: boolean;
  account?: PortalAccount;
  errorMessage?: string;
  isFirstLogin?: boolean;
  matchedStudent?: Student;
} {
  const normId = normalizeIdentifier(rawIdentifier);
  if (!normId) {
    return { success: false, errorMessage: 'Veuillez saisir votre identifiant ou numéro.' };
  }

  // Pin length rules: 6 digits for staff/student, 4 digits for parent
  const requiredPinLength = role === 'parent' ? 4 : 6;
  if (enteredPin.length !== requiredPinLength) {
    return {
      success: false,
      errorMessage: `Le code PIN doit comporter exactement ${requiredPinLength} chiffres pour les ${
        role === 'parent' ? 'parents' : role === 'student' ? 'élèves/étudiants' : 'personnels'
      }.`,
    };
  }

  const allAccounts = getPortalAccounts();
  const existing = allAccounts.find(
    (a) => a.role === role && normalizeIdentifier(a.identifier) === normId
  );

  // If registering or updating PIN
  if (isRegisteringPin) {
    let displayName = 'Utilisateur';
    let roleTitle = 'Membre de la communauté';
    let avatarUrl = '';
    let studentMatricules: string[] = [];
    let staffId = '';
    let studentId = '';

    if (role === 'student') {
      const student = INITIAL_STUDENTS.find(
        (s) => normalizeIdentifier(s.matricule) === normId
      );
      if (student) {
        displayName = `${student.firstName} ${student.lastName}`;
        roleTitle = `${student.studentType === 'etudiant' ? 'Étudiant' : 'Élève'} - ${student.classroom}`;
        avatarUrl = student.photoUrl || '';
        studentId = student.id;
      } else {
        displayName = `Élève (${rawIdentifier})`;
        roleTitle = 'Élève inscrit';
      }
    } else if (role === 'staff') {
      const staff = INITIAL_STAFF_ACCOUNTS.find(
        (st) => normalizeIdentifier(st.phone) === normId
      );
      const roleMeta = staffRole ? STAFF_PROFILE_OPTIONS.find((opt) => opt.role === staffRole) : undefined;

      if (staff) {
        displayName = staff.fullName;
        roleTitle = staff.roleTitle || roleMeta?.title || 'Personnel Éducatif';
        avatarUrl = staff.photoUrl || '';
        staffId = staff.id;
      } else {
        displayName = `Personnel (${rawIdentifier})`;
        roleTitle = roleMeta?.title || (staffRole ? ROLE_DEFAULT_PERMISSIONS[staffRole]?.title : 'Membre du corps éducatif');
      }
    } else if (role === 'parent') {
      // Find students associated with this parent phone
      const children = INITIAL_STUDENTS.filter(
        (s) => normalizeIdentifier(s.parentPhone) === normId
      );
      if (children.length > 0) {
        displayName = children[0].parentName || `Parent d'élève (${rawIdentifier})`;
        roleTitle = `Parent de ${children.map((c) => c.firstName).join(', ')}`;
        studentMatricules = children.map((c) => c.matricule);
      } else {
        displayName = `Parent d'élève (${rawIdentifier})`;
        roleTitle = 'Parent d\'élève EduCongo';
        studentMatricules = ['CG-2024-0891']; // fallback child for demo exploration
      }
    }

    const newAcc: PortalAccount = {
      id: existing?.id || `pa_${role}_${Date.now()}`,
      role,
      identifier: normId,
      pin: enteredPin,
      displayName,
      roleTitle,
      schoolCode: 'BZV-24-X8B',
      avatarUrl,
      studentMatricules,
      staffId,
      studentId,
      createdAt: new Date().toISOString(),
    };

    savePortalAccount(newAcc);
    return { success: true, account: newAcc };
  }

  // Normal login
  // Check if it's a known staff in INITIAL_STAFF_ACCOUNTS
  const knownStaff = role === 'staff'
    ? INITIAL_STAFF_ACCOUNTS.find((st) => normalizeIdentifier(st.phone) === normId)
    : undefined;

  if (!existing && !knownStaff) {
    // Check if identifier exists in student / parent registry
    let recognized = false;
    if (role === 'student') {
      recognized = INITIAL_STUDENTS.some((s) => normalizeIdentifier(s.matricule) === normId);
    } else if (role === 'parent') {
      recognized = INITIAL_STUDENTS.some((s) => normalizeIdentifier(s.parentPhone) === normId);
    }

    if (recognized) {
      return {
        success: false,
        isFirstLogin: true,
        errorMessage: 'Première connexion détectée. Veuillez définir votre code PIN pour sécuriser votre compte.',
      };
    }

    // Auto-create on demand for seamless experience
    return {
      success: false,
      isFirstLogin: true,
      errorMessage: `Compte non initialisé. Cliquez sur "Définir un code PIN" pour configurer votre accès.`,
    };
  }

  // Check demo master PINs or existing PIN
  const validPins = existing ? [existing.pin, '123456', '000000', '654321'] : ['123456', '000000', '654321'];
  if (role === 'parent') {
    validPins.push('1234', '0000');
  }

  if (existing && !validPins.includes(enteredPin)) {
    return {
      success: false,
      errorMessage: 'Code PIN incorrect. Veuillez réessayer ou réinitialiser votre code PIN (Démo : 123456 ou 1234).',
    };
  }

  if (existing) {
    // If staffRole was explicitly chosen and different, update roleTitle
    if (role === 'staff' && staffRole) {
      const roleMeta = STAFF_PROFILE_OPTIONS.find((o) => o.role === staffRole);
      if (roleMeta && existing.roleTitle !== roleMeta.title) {
        const updated = { ...existing, roleTitle: roleMeta.title };
        savePortalAccount(updated);
        return { success: true, account: updated };
      }
    }
    return { success: true, account: existing };
  }

  if (knownStaff) {
    const roleMeta = staffRole ? STAFF_PROFILE_OPTIONS.find((o) => o.role === staffRole) : undefined;
    const dynamicAcc: PortalAccount = {
      id: `pa_staff_${knownStaff.id}`,
      role: 'staff',
      identifier: normId,
      pin: enteredPin,
      displayName: knownStaff.fullName,
      roleTitle: roleMeta?.title || knownStaff.roleTitle,
      schoolCode: 'BZV-24-X8B',
      avatarUrl: knownStaff.photoUrl || '',
      staffId: knownStaff.id,
      createdAt: new Date().toISOString(),
    };
    savePortalAccount(dynamicAcc);
    return { success: true, account: dynamicAcc };
  }

  return { success: false, errorMessage: 'Identifiant introuvable.' };
}

/**
 * Get children associated with a parent account
 */
export function getParentChildren(parentAccount: PortalAccount, allStudents: Student[] = INITIAL_STUDENTS): Student[] {
  const normParentPhone = normalizeIdentifier(parentAccount.identifier);
  const byPhone = allStudents.filter((s) => normalizeIdentifier(s.parentPhone) === normParentPhone);
  if (byPhone.length > 0) return byPhone;

  if (parentAccount.studentMatricules && parentAccount.studentMatricules.length > 0) {
    const byMat = allStudents.filter((s) => parentAccount.studentMatricules?.includes(s.matricule));
    if (byMat.length > 0) return byMat;
  }

  // Fallback first 2 students
  return allStudents.slice(0, 2);
}

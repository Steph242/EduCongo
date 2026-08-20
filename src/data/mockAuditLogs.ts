export type AuditLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY' | 'FINANCE' | 'MEPPSA' | 'GRADES' | 'SCHOOL_MGMT' | 'CERTIFICATES';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  action: string;
  category: 'AUTH' | 'SCHOOL_MGMT' | 'FINANCE' | 'GRADES' | 'CERTIFICATES' | 'SYSTEM' | 'SECURITY' | 'API';
  actor: {
    id: string;
    name: string;
    role: string;
    schoolCode?: string;
    schoolName?: string;
    ipAddress?: string;
  };
  target?: {
    type: 'school' | 'student' | 'staff' | 'payment' | 'grade' | 'config' | 'system';
    id?: string;
    name?: string;
  };
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  meta?: Record<string, any>;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-9921',
    timestamp: '2024-11-20T10:42:15Z',
    level: 'FINANCE',
    action: 'Encaissement Mobile Money validé',
    category: 'FINANCE',
    actor: {
      id: 'ACC-002',
      name: 'Mme Clarisse Mabiala',
      role: 'Comptable',
      schoolCode: 'BZV-24-X8B',
      schoolName: "Lycée d'Excellence de Brazzaville",
      ipAddress: '154.72.164.22 (Congo Telecom Brazzaville)',
    },
    target: {
      type: 'payment',
      id: 'PAY-2024-001',
      name: 'Arsène Mavoungou (CG-2024-8831)',
    },
    details: 'Transaction MTN MoMo 25 000 FCFA enregistrée (Réf: MTN-242-990812) pour Novembre 2024.',
    status: 'SUCCESS',
    meta: {
      amount: 25000,
      channel: 'MTN MoMo',
      fee: 0,
      currency: 'XAF',
    },
  },
  {
    id: 'LOG-9920',
    timestamp: '2024-11-20T10:15:30Z',
    level: 'SECURITY',
    action: 'Génération Carte Scolaire Officielle avec QR Code',
    category: 'CERTIFICATES',
    actor: {
      id: 'SURV-001',
      name: 'Surveillant Général',
      role: 'Surveillant',
      schoolCode: 'BZV-24-X8B',
      schoolName: "Lycée d'Excellence de Brazzaville",
      ipAddress: '154.72.164.22',
    },
    target: {
      type: 'student',
      id: 'STU-003',
      name: 'Junior Massamba',
    },
    details: 'Impression badge PVC sécurisé avec photo instantanée et signature numérique du Proviseur.',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-9919',
    timestamp: '2024-11-20T09:58:12Z',
    level: 'GRADES',
    action: 'Saisie & Clôture Notes Trimestre 1',
    category: 'GRADES',
    actor: {
      id: 'PROF-001',
      name: 'M. Mabiala Dieudonné',
      role: 'Enseignant Titulaire',
      schoolCode: 'BZV-24-X8B',
      schoolName: "Lycée d'Excellence de Brazzaville",
      ipAddress: '197.234.221.8 (Airtel CG Pointe-Noire)',
    },
    target: {
      type: 'grade',
      name: 'Mathématiques - Terminale C',
    },
    details: '45 notes de Devoir 2 et Composition validées. Moyenne de classe: 13.8/20.',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-9918',
    timestamp: '2024-11-20T08:30:00Z',
    level: 'INFO',
    action: 'Appel Général de Présence Matinale',
    category: 'SYSTEM',
    actor: {
      id: 'PROV-001',
      name: 'Dieudonné Mouambenga',
      role: 'Proviseur',
      schoolCode: 'BZV-24-X8B',
      schoolName: "Lycée d'Excellence de Brazzaville",
      ipAddress: '154.72.164.22',
    },
    target: {
      type: 'school',
      name: 'Effectif Global (435 élèves)',
    },
    details: 'Taux de présence du jour: 98.6%. 6 absents dont 5 justifiés médicalement.',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-9917',
    timestamp: '2024-11-19T18:45:00Z',
    level: 'WARN',
    action: 'Tentative de connexion avec mot de passe erroné',
    category: 'AUTH',
    actor: {
      id: 'ANON',
      name: 'Utilisateur non authentifié',
      role: 'Inconnu',
      ipAddress: '41.243.12.90 (MTN Congo)',
    },
    target: {
      type: 'school',
      name: 'Lycée Savorgnan de Brazza (BZV-24-SBZ)',
    },
    details: 'Échec de saisie du mot de passe pour le compte proviseur. Tentative 2/5 (Bloqué temporairement si 5 échecs).',
    status: 'WARNING',
  },
  {
    id: 'LOG-9916',
    timestamp: '2024-11-19T14:12:40Z',
    level: 'MEPPSA',
    action: 'Synchronisation Rapport Trimestriel MEPPSA',
    category: 'API',
    actor: {
      id: 'DEV-ROOT',
      name: 'Système National EduCongo API',
      role: 'Super-Admin Développeur',
      ipAddress: '10.0.4.1 (Datacenter Brazzaville)',
    },
    target: {
      type: 'system',
      name: 'Serveur Central Ministère MEPPSA',
    },
    details: 'Transmission chiffrée SSL des effectifs et indicateurs de 8 établissements homologués.',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-9915',
    timestamp: '2024-11-19T11:05:22Z',
    level: 'SCHOOL_MGMT',
    action: 'Dossier d’inscription validé par la Direction Départementale',
    category: 'SCHOOL_MGMT',
    actor: {
      id: 'DDE-BZV',
      name: 'Inspecteur Régional DDE Brazzaville',
      role: 'Super-Admin DDE',
      ipAddress: '154.72.160.10',
    },
    target: {
      type: 'school',
      id: 'SCH-006',
      name: 'Institut Supérieur Technologique de Dolisie',
    },
    details: 'Agrément ministériel N° 2024/044/MESUP validé et statut passé à "Validé".',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-9914',
    timestamp: '2024-11-18T16:20:10Z',
    level: 'SECURITY',
    action: 'Modification des droits d’un compte enseignant',
    category: 'SECURITY',
    actor: {
      id: 'PROV-001',
      name: 'Dieudonné Mouambenga',
      role: 'Proviseur',
      schoolCode: 'BZV-24-X8B',
      ipAddress: '154.72.164.22',
    },
    target: {
      type: 'staff',
      id: 'STF-004',
      name: 'Mme Patricia Okemba (SVT)',
    },
    details: 'Attribution de la permission "saisie_notes" et révocation de "administration_comptes".',
    status: 'SUCCESS',
  },
];

import { StaffAccount, PermissionKey, StaffRole } from '../types';

export const PERMISSION_DEFINITIONS: Record<PermissionKey, { label: string; description: string; category: string; icon: string }> = {
  saisie_notes: {
    label: 'Saisie des notes & devoirs',
    description: 'Enregistrer les notes de devoirs et compositions pour ses classes assignées.',
    category: 'Pédagogie',
    icon: 'edit_note',
  },
  validation_bulletins: {
    label: 'Validation des bulletins officiels',
    description: 'Verrouiller, approuver et signer les bulletins trimestriels pour le MEPPSA.',
    category: 'Pédagogie',
    icon: 'verified',
  },
  appel_presences: {
    label: "Appel & Registre d'assiduité",
    description: "Pointer les présences, retards et absences injustifiées lors de l'appel quotidien.",
    category: 'Vie Scolaire',
    icon: 'how_to_reg',
  },
  encaissement_ecolage: {
    label: 'Encaissement & Trésorerie',
    description: 'Recevoir les paiements de scolarité par MTN MoMo, Airtel Money ou espèces.',
    category: 'Finance',
    icon: 'payments',
  },
  gestion_inscriptions: {
    label: 'Gestion des inscriptions & dossiers',
    description: 'Créer, inscrire des élèves et délivrer des certificats de scolarité officiels.',
    category: 'Administration',
    icon: 'person_add',
  },
  administration_comptes: {
    label: 'Administration des comptes & accès',
    description: 'Créer des profils enseignants, modifier les droits ou révoquer les accès.',
    category: 'Administration',
    icon: 'admin_panel_settings',
  },
  rapports_meppsa: {
    label: 'Export des statistiques MEPPSA',
    description: 'Générer les bordereaux officiels pour la Direction Départementale (DDEPSA).',
    category: 'Inspection',
    icon: 'analytics',
  },
  communication_sms: {
    label: 'Alerte SMS Parents (+242)',
    description: 'Diffuser des SMS aux parents via MTN / Airtel pour les absences ou convocations.',
    category: 'Vie Scolaire',
    icon: 'sms',
  },
};

export const ROLE_DEFAULT_PERMISSIONS: Record<StaffRole, { title: string; department: string; permissions: PermissionKey[] }> = {
  proviseur: {
    title: "Proviseur / Chef d'Établissement",
    department: 'Direction Générale',
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
  },
  censeur: {
    title: 'Censeur des Études',
    department: 'Direction des Études & Pédagogie',
    permissions: [
      'saisie_notes',
      'validation_bulletins',
      'appel_presences',
      'gestion_inscriptions',
      'rapports_meppsa',
    ],
  },
  surveillant_general: {
    title: 'Surveillant Général (Vie Scolaire)',
    department: 'Vie Scolaire & Discipline',
    permissions: [
      'appel_presences',
      'gestion_inscriptions',
      'communication_sms',
    ],
  },
  enseignant_titulaire: {
    title: 'Professeur Titulaire',
    department: 'Corps Pédagogique',
    permissions: [
      'saisie_notes',
      'appel_presences',
    ],
  },
  enseignant_vacataire: {
    title: 'Professeur Vacataire',
    department: 'Corps Pédagogique',
    permissions: [
      'saisie_notes',
      'appel_presences',
    ],
  },
  instituteur: {
    title: "Maître d'École / Instituteur",
    department: 'Enseignement Primaire',
    permissions: [
      'saisie_notes',
      'appel_presences',
      'gestion_inscriptions',
    ],
  },
  enseignant_chercheur: {
    title: 'Enseignant-Chercheur / Maître-Assistant',
    department: 'Enseignement Supérieur & Recherche',
    permissions: [
      'saisie_notes',
      'validation_bulletins',
      'appel_presences',
    ],
  },
  comptable: {
    title: 'Agent Comptable & Écolage',
    department: 'Intendance & Finances',
    permissions: [
      'encaissement_ecolage',
      'gestion_inscriptions',
    ],
  },
  secretaire: {
    title: 'Secrétaire de Direction',
    department: 'Secrétariat & Inscriptions',
    permissions: [
      'gestion_inscriptions',
      'communication_sms',
    ],
  },
  conseiller_orientation: {
    title: "Conseiller d'Orientation Pédagogique",
    department: 'Service Orientation',
    permissions: [
      'validation_bulletins',
      'rapports_meppsa',
    ],
  },
  infirmier: {
    title: 'Infirmier(ère) Scolaire',
    department: 'Service Médical & Soins',
    permissions: [
      'appel_presences',
    ],
  },
  autre_admin: {
    title: 'Personnel Administratif & Logistique',
    department: 'Services Généraux',
    permissions: [
      'appel_presences',
    ],
  },
};

export interface StaffProfileOption {
  role: StaffRole;
  category: 'enseignant' | 'administratif';
  title: string;
  shortTitle: string;
  icon: string;
  badgeColor: string;
  description: string;
  permissionsPreview: string;
}

export const STAFF_PROFILE_OPTIONS: StaffProfileOption[] = [
  // 1. Catégorie Enseignants (Pédagogie)
  {
    role: 'enseignant_titulaire',
    category: 'enseignant',
    title: 'Professeur Titulaire (Collège / Lycée)',
    shortTitle: 'Prof. Titulaire',
    icon: 'school',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Saisie continue des notes, calcul des moyennes, appel quotidien des classes assignées.',
    permissionsPreview: 'Notes, Absences, Cahier de texte',
  },
  {
    role: 'enseignant_vacataire',
    category: 'enseignant',
    title: 'Professeur Vacataire / Contractuel',
    shortTitle: 'Prof. Vacataire',
    icon: 'history_edu',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    description: 'Gestion des notes de sa discipline et registre de présence des heures dispensées.',
    permissionsPreview: 'Saisie des notes de sa matière, Pointage',
  },
  {
    role: 'instituteur',
    category: 'enseignant',
    title: "Maître d'École / Instituteur (Primaire)",
    shortTitle: "Maître d'École",
    icon: 'menu_book',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Tenue du carnet de classe, évaluations continues et suivi personnalisé des écoliers.',
    permissionsPreview: 'Évaluations primaires, Cahier de classe',
  },
  {
    role: 'enseignant_chercheur',
    category: 'enseignant',
    title: 'Enseignant-Chercheur (Supérieur / Université)',
    shortTitle: 'Enseignant-Chercheur',
    icon: 'psychology',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    description: 'Gestion des unités d\'enseignement (UE), crédits ECTS, travaux dirigés et jurys d\'examen.',
    permissionsPreview: 'Notes d\'UE, Jurys, Validation académique',
  },

  // 2. Catégorie Personnel Administratif & Encadrement
  {
    role: 'proviseur',
    category: 'administratif',
    title: "Proviseur / Directeur / Chef d'Établissement",
    shortTitle: "Proviseur / Directeur",
    icon: 'shield_person',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Direction générale, signature des bulletins, validation des bordereaux MEPPSA et supervision globale.',
    permissionsPreview: 'Droits totaux direction, MEPPSA, Clôture',
  },
  {
    role: 'censeur',
    category: 'administratif',
    title: 'Censeur des Études / Directeur Pédagogique',
    shortTitle: 'Censeur des Études',
    icon: 'assignment_turned_in',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Organisation des examens harmonisés, plannings de cours et verrouillage des bulletins trimestriels.',
    permissionsPreview: 'Bulletins, Emplois du temps, Examens',
  },
  {
    role: 'surveillant_general',
    category: 'administratif',
    title: 'Surveillant Général / Vie Scolaire',
    shortTitle: 'Surveillant Général',
    icon: 'notifications_active',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Discipline, sanctions, gestion des retards, registres d\'assiduité et alertes SMS parents.',
    permissionsPreview: 'Discipline, Absences, SMS aux familles',
  },
  {
    role: 'comptable',
    category: 'administratif',
    title: 'Agent Comptable & Trésorier (Intendance)',
    shortTitle: 'Agent Comptable',
    icon: 'payments',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Encaissements frais de scolarité (MTN MoMo, Airtel Money, Espèces), reçu fiscal et états financiers.',
    permissionsPreview: 'Encaissement écolage, Reçus, Trésorerie',
  },
  {
    role: 'secretaire',
    category: 'administratif',
    title: 'Secrétaire de Direction & Inscriptions',
    shortTitle: 'Secrétaire de Direction',
    icon: 'badge',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    description: 'Traitement des dossiers d\'admission, édition des certificats de scolarité et cartes d\'identité QR.',
    permissionsPreview: 'Inscriptions, Certificats, Cartes scolaires',
  },
  {
    role: 'conseiller_orientation',
    category: 'administratif',
    title: 'Conseiller d\'Orientation Pédagogique',
    shortTitle: 'Conseiller Orientation',
    icon: 'explore',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Accompagnement dans les choix de filières (Séries A, C, D, TI, STG), statistiques et conseils.',
    permissionsPreview: 'Orientation, Conseils de classe, Profils',
  },
  {
    role: 'infirmier',
    category: 'administratif',
    title: 'Infirmier(ère) Scolaire / Santé',
    shortTitle: 'Infirmier(ère)',
    icon: 'medical_services',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Fiches médicales, dispenses EPS, soins d\'urgence et registres sanitaires scolaires.',
    permissionsPreview: 'Soins, Dispenses, Fiches de santé',
  },
  {
    role: 'autre_admin',
    category: 'administratif',
    title: 'Autre Personnel Administratif & Logistique',
    shortTitle: 'Administration Générale',
    icon: 'engineering',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    description: 'Support technique, logistique des locaux, inventaires et maintenance scolaire.',
    permissionsPreview: 'Services généraux, Registres logistiques',
  },
];

export const INITIAL_STAFF_ACCOUNTS: StaffAccount[] = [];


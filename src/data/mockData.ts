import { Student, Teacher, SubjectGrade, PaymentRecord, DailyAttendanceRecord } from '../types';
export type { DailyAttendanceRecord };

/**
 * Production Initial State: 100% Empty State
 * No seed mock students, teachers, or payments.
 * Every new registered school begins virgin with 0 records.
 */
export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_TEACHERS: Teacher[] = [];

export const SAMPLE_BULLETIN_GRADES: SubjectGrade[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export interface DepartmentConfig {
  code: string;
  name: string;
  chefLieu: string;
  cities: string[];
  arrondissements: string[];
}

export const CONGO_DEPARTMENTS_CONFIG: Record<string, DepartmentConfig> = {
  'Brazzaville': {
    code: 'BZV',
    name: 'Brazzaville',
    chefLieu: 'Brazzaville',
    cities: ['Brazzaville', 'Île Mbamou', 'Kintélé'],
    arrondissements: [
      'Makélékélé (Arrondissement 1)',
      'Bacongo (Arrondissement 2)',
      'Poto-Poto (Arrondissement 3)',
      'Moungali (Arrondissement 4)',
      'Ouenzé (Arrondissement 5)',
      'Talangaï (Arrondissement 6)',
      'Mfilou (Arrondissement 7)',
      'Madibou (Arrondissement 8)',
      'Djiri (Arrondissement 9)'
    ]
  },
  'Pointe-Noire': {
    code: 'PNR',
    name: 'Pointe-Noire',
    chefLieu: 'Pointe-Noire',
    cities: ['Pointe-Noire', 'Tchiamba-Nzassi'],
    arrondissements: [
      'Émery Patrice Lumumba (Arrondissement 1)',
      'Mvou-Mvou (Arrondissement 2)',
      'Tié-Tié (Arrondissement 3)',
      'Loandjili (Arrondissement 4)',
      'Mongo-Mpoukou (Arrondissement 5)',
      'Ngoyo (Arrondissement 6)'
    ]
  },
  'Bouenza': {
    code: 'BOU',
    name: 'Bouenza',
    chefLieu: 'Madingou',
    cities: ['Nkayi', 'Madingou', 'Loudima', 'Mouyondzi', 'Boko-Songho', 'Mfouati', 'Kingoué', 'Yamba'],
    arrondissements: [
      'Nkayi - Arrondissement 1 (Mouana Nto)',
      'Nkayi - Arrondissement 2 (Soulou)',
      'Madingou - Centre Administratif',
      'Loudima - Gare / Cité',
      'Mouyondzi - Centre',
      'Boko-Songho - Bourg'
    ]
  },
  'Niari': {
    code: 'NIA',
    name: 'Niari',
    chefLieu: 'Dolisie (Loubomo)',
    cities: ['Dolisie (Loubomo)', 'Mossendjo', 'Kibangou', 'Makabana', 'Mayoko', 'Kimongo', 'Louvakou'],
    arrondissements: [
      'Dolisie - Arrondissement 1 (Moungoundou-Nord)',
      'Dolisie - Arrondissement 2 (Moungoundou-Sud)',
      'Dolisie - Quartier Gaïa / Fond Tié-Tié',
      'Mossendjo - Centre Ville',
      'Kibangou - Secteur Principal',
      'Makabana - Gare'
    ]
  },
  'Pool': {
    code: 'POL',
    name: 'Pool',
    chefLieu: 'Kinkala',
    cities: ['Kinkala', 'Mindouli', 'Boko', 'Ngabé', 'Kindamba', 'Mayama', 'Ignié', 'Louingui', 'Goma Tsé-Tsé'],
    arrondissements: [
      'Kinkala - Centre / Plateau',
      'Mindouli - Cité Minière',
      'Boko - Chef-lieu de District',
      'Ignié - Secteur Nord',
      'Ngabé - Rive du Fleuve',
      'Kindamba - Centre'
    ]
  },
  'Kouilou': {
    code: 'KOU',
    name: 'Kouilou',
    chefLieu: 'Loango',
    cities: ['Loango', 'Hinda', 'Madingo-Kayes', 'Mvouti', 'Kakamoéka', 'Nzambi'],
    arrondissements: [
      'Loango - Cité Administrative',
      'Hinda - Centre Bourg',
      'Madingo-Kayes - Littoral',
      'Mvouti - Mayombe',
      'Nzambi - Zone Côtière'
    ]
  },
  'Plateaux': {
    code: 'PLT',
    name: 'Plateaux',
    chefLieu: 'Djambala',
    cities: ['Djambala', 'Gamboma', 'Ngo', 'Lekana', 'Mpouya', 'Allembé', 'Makotimpoko', 'Ongogni'],
    arrondissements: [
      'Djambala - Plateau Batéké',
      'Gamboma - Centre Commercial',
      'Ngo - Carrefour',
      'Lekana - Centre',
      'Mpouya - Secteur Fluvial'
    ]
  },
  'Cuvette': {
    code: 'CUV',
    name: 'Cuvette',
    chefLieu: 'Owando',
    cities: ['Owando', 'Oyo', 'Makoua', 'Boundji', 'Mossaka', 'Loukoléla', 'Okoyo', 'Ollombo'],
    arrondissements: [
      'Owando - Centre Administratif',
      'Oyo - Alima / Centre',
      'Makoua - Mission Equatoriale',
      'Boundji - Mission Catholique',
      'Mossaka - Port Fluvial',
      'Loukoléla - Rive Congo'
    ]
  },
  'Cuvette-Ouest': {
    code: 'CVO',
    name: 'Cuvette-Ouest',
    chefLieu: 'Ewo',
    cities: ['Ewo', 'Kellé', 'Mbomo', 'Etoumbi', 'Okoyo', 'Mbama'],
    arrondissements: [
      'Ewo - Centre Ville',
      'Kellé - District',
      'Mbomo - Zone Odzala',
      'Etoumbi - Centre',
      'Okoyo - Plateau'
    ]
  },
  'Sangha': {
    code: 'SAN',
    name: 'Sangha',
    chefLieu: 'Ouesso',
    cities: ['Ouesso', 'Pokola', 'Mokéko', 'Sembé', 'Souanké', 'Ngbala'],
    arrondissements: [
      'Ouesso - Arrondissement 1 (Djalangoye)',
      'Ouesso - Arrondissement 2 (Mbindjo)',
      'Pokola - Cité Forestière (CIB)',
      'Mokéko - Centre',
      'Sembé - Bourg Frontalier'
    ]
  },
  'Likouala': {
    code: 'LIK',
    name: 'Likouala',
    chefLieu: 'Impfondo',
    cities: ['Impfondo', 'Bétou', 'Dongou', 'Enyellé', 'Epéna', 'Liranga'],
    arrondissements: [
      'Impfondo - Centre Fluvial / Port',
      'Bétou - Zone Forestière',
      'Dongou - Cité Historique',
      'Epéna - Réserve Lac Télé',
      'Enyellé - Secteur Nord'
    ]
  },
  'Lékoumou': {
    code: 'LEK',
    name: 'Lékoumou',
    chefLieu: 'Sibiti',
    cities: ['Sibiti', 'Komono', 'Zanaga', 'Bambama', 'Mayéyé'],
    arrondissements: [
      'Sibiti - Centre / Plateau',
      'Komono - Gare / Bourg',
      'Zanaga - Zone Minière',
      'Bambama - District'
    ]
  }
};

export const CONGO_DEPARTMENTS = Object.keys(CONGO_DEPARTMENTS_CONFIG);

export const CONGO_CITIES = [
  'Brazzaville',
  'Pointe-Noire',
  'Dolisie (Loubomo)',
  'Nkayi',
  'Ouesso',
  'Owando',
  'Kinkala',
  'Madingou',
  'Sibiti',
  'Impfondo',
  'Djambala',
  'Ewo',
  'Gamboma',
  'Oyo',
  'Loango',
  'Hinda',
  'Mindouli',
  'Mossendjo',
  'Pokola',
  'Bétou',
  'Autre'
];

export const CONGO_ARRONDISSEMENTS_BZV = CONGO_DEPARTMENTS_CONFIG['Brazzaville'].arrondissements;
export const CONGO_ARRONDISSEMENTS_PNR = CONGO_DEPARTMENTS_CONFIG['Pointe-Noire'].arrondissements;

export function getDepartmentCode(departmentName: string): string {
  if (CONGO_DEPARTMENTS_CONFIG[departmentName]) {
    return CONGO_DEPARTMENTS_CONFIG[departmentName].code;
  }
  for (const deptKey of Object.keys(CONGO_DEPARTMENTS_CONFIG)) {
    const conf = CONGO_DEPARTMENTS_CONFIG[deptKey];
    if (deptKey.toLowerCase().includes(departmentName.toLowerCase()) || 
        conf.cities.some(c => c.toLowerCase().includes(departmentName.toLowerCase()))) {
      return conf.code;
    }
  }
  return 'BZV';
}

export function generateSchoolCode(departmentName: string, format: string = 'departement', randomSuffix: string = 'X8B'): string {
  const deptCode = getDepartmentCode(departmentName);
  
  if (format === 'annee') {
    return `${deptCode}-2024-${randomSuffix}`;
  } else if (format === 'standard') {
    return `CG-${deptCode}-24-${randomSuffix}`;
  } else {
    return `${deptCode}-24-${randomSuffix}`;
  }
}

/**
 * Attendance data is strictly collected from real live attendance logs per school.
 * Default is an empty list.
 */
export const MONTHLY_ATTENDANCE_DATA: DailyAttendanceRecord[] = [];

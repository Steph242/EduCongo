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
  // Try to find if departmentName matches a city or substring
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
    // format === 'departement' or default
    return `${deptCode}-24-${randomSuffix}`;
  }
}

export const MONTHLY_ATTENDANCE_DATA: DailyAttendanceRecord[] = [
  {
    date: '01 Nov',
    fullDate: 'Vendredi 01 Nov 2024',
    dayOfWeek: 'Ven',
    present: 420,
    absent: 15,
    late: 8,
    total: 435,
    rate: 96.6,
    justifiedAbsences: 11,
    unjustifiedAbsences: 4,
    weatherOrNote: 'Journée normale - Climat clément',
    byClass: {
      'Terminale D': { present: 48, absent: 2, late: 1, total: 50, rate: 96.0 },
      'Terminale C': { present: 43, absent: 2, late: 0, total: 45, rate: 95.6 },
      'Première D': { present: 52, absent: 1, late: 2, total: 53, rate: 98.1 },
      '3ème A': { present: 58, absent: 2, late: 1, total: 60, rate: 96.7 },
    }
  },
  {
    date: '04 Nov',
    fullDate: 'Lundi 04 Nov 2024',
    dayOfWeek: 'Lun',
    present: 412,
    absent: 23,
    late: 14,
    total: 435,
    rate: 94.7,
    justifiedAbsences: 16,
    unjustifiedAbsences: 7,
    weatherOrNote: 'Pluie matinale à Brazzaville',
    byClass: {
      'Terminale D': { present: 46, absent: 4, late: 2, total: 50, rate: 92.0 },
      'Terminale C': { present: 42, absent: 3, late: 1, total: 45, rate: 93.3 },
      'Première D': { present: 50, absent: 3, late: 2, total: 53, rate: 94.3 },
      '3ème A': { present: 56, absent: 4, late: 3, total: 60, rate: 93.3 },
    }
  },
  {
    date: '05 Nov',
    fullDate: 'Mardi 05 Nov 2024',
    dayOfWeek: 'Mar',
    present: 425,
    absent: 10,
    late: 5,
    total: 435,
    rate: 97.7,
    justifiedAbsences: 8,
    unjustifiedAbsences: 2,
    weatherOrNote: 'Excellente assiduité',
    byClass: {
      'Terminale D': { present: 49, absent: 1, late: 0, total: 50, rate: 98.0 },
      'Terminale C': { present: 44, absent: 1, late: 0, total: 45, rate: 97.8 },
      'Première D': { present: 52, absent: 1, late: 1, total: 53, rate: 98.1 },
      '3ème A': { present: 59, absent: 1, late: 1, total: 60, rate: 98.3 },
    }
  },
  {
    date: '06 Nov',
    fullDate: 'Mercredi 06 Nov 2024',
    dayOfWeek: 'Mer',
    present: 428,
    absent: 7,
    late: 4,
    total: 435,
    rate: 98.4,
    justifiedAbsences: 6,
    unjustifiedAbsences: 1,
    weatherOrNote: 'Devoirs surveillés MEPPSA',
    byClass: {
      'Terminale D': { present: 50, absent: 0, late: 1, total: 50, rate: 100.0 },
      'Terminale C': { present: 45, absent: 0, late: 0, total: 45, rate: 100.0 },
      'Première D': { present: 52, absent: 1, late: 0, total: 53, rate: 98.1 },
      '3ème A': { present: 59, absent: 1, late: 0, total: 60, rate: 98.3 },
    }
  },
  {
    date: '07 Nov',
    fullDate: 'Jeudi 07 Nov 2024',
    dayOfWeek: 'Jeu',
    present: 422,
    absent: 13,
    late: 6,
    total: 435,
    rate: 97.0,
    justifiedAbsences: 10,
    unjustifiedAbsences: 3,
    byClass: {
      'Terminale D': { present: 48, absent: 2, late: 1, total: 50, rate: 96.0 },
      'Terminale C': { present: 44, absent: 1, late: 1, total: 45, rate: 97.8 },
      'Première D': { present: 51, absent: 2, late: 0, total: 53, rate: 96.2 },
      '3ème A': { present: 58, absent: 2, late: 1, total: 60, rate: 96.7 },
    }
  },
  {
    date: '08 Nov',
    fullDate: 'Vendredi 08 Nov 2024',
    dayOfWeek: 'Ven',
    present: 418,
    absent: 17,
    late: 9,
    total: 435,
    rate: 96.1,
    justifiedAbsences: 13,
    unjustifiedAbsences: 4,
    byClass: {
      'Terminale D': { present: 47, absent: 3, late: 2, total: 50, rate: 94.0 },
      'Terminale C': { present: 43, absent: 2, late: 1, total: 45, rate: 95.6 },
      'Première D': { present: 51, absent: 2, late: 1, total: 53, rate: 96.2 },
      '3ème A': { present: 57, absent: 3, late: 2, total: 60, rate: 95.0 },
    }
  },
  {
    date: '11 Nov',
    fullDate: 'Lundi 11 Nov 2024',
    dayOfWeek: 'Lun',
    present: 415,
    absent: 20,
    late: 11,
    total: 435,
    rate: 95.4,
    justifiedAbsences: 15,
    unjustifiedAbsences: 5,
    byClass: {
      'Terminale D': { present: 48, absent: 2, late: 1, total: 50, rate: 96.0 },
      'Terminale C': { present: 42, absent: 3, late: 2, total: 45, rate: 93.3 },
      'Première D': { present: 50, absent: 3, late: 1, total: 53, rate: 94.3 },
      '3ème A': { present: 56, absent: 4, late: 2, total: 60, rate: 93.3 },
    }
  },
  {
    date: '12 Nov',
    fullDate: 'Mardi 12 Nov 2024',
    dayOfWeek: 'Mar',
    present: 430,
    absent: 5,
    late: 3,
    total: 435,
    rate: 98.9,
    justifiedAbsences: 4,
    unjustifiedAbsences: 1,
    weatherOrNote: 'Pic de présence mensuel',
    byClass: {
      'Terminale D': { present: 50, absent: 0, late: 0, total: 50, rate: 100.0 },
      'Terminale C': { present: 45, absent: 0, late: 0, total: 45, rate: 100.0 },
      'Première D': { present: 53, absent: 0, late: 1, total: 53, rate: 100.0 },
      '3ème A': { present: 59, absent: 1, late: 0, total: 60, rate: 98.3 },
    }
  },
  {
    date: '13 Nov',
    fullDate: 'Mercredi 13 Nov 2024',
    dayOfWeek: 'Mer',
    present: 426,
    absent: 9,
    late: 5,
    total: 435,
    rate: 97.9,
    justifiedAbsences: 7,
    unjustifiedAbsences: 2,
    byClass: {
      'Terminale D': { present: 49, absent: 1, late: 1, total: 50, rate: 98.0 },
      'Terminale C': { present: 44, absent: 1, late: 0, total: 45, rate: 97.8 },
      'Première D': { present: 52, absent: 1, late: 0, total: 53, rate: 98.1 },
      '3ème A': { present: 58, absent: 2, late: 1, total: 60, rate: 96.7 },
    }
  },
  {
    date: '14 Nov',
    fullDate: 'Jeudi 14 Nov 2024',
    dayOfWeek: 'Jeu',
    present: 421,
    absent: 14,
    late: 7,
    total: 435,
    rate: 96.8,
    justifiedAbsences: 10,
    unjustifiedAbsences: 4,
    byClass: {
      'Terminale D': { present: 48, absent: 2, late: 1, total: 50, rate: 96.0 },
      'Terminale C': { present: 43, absent: 2, late: 1, total: 45, rate: 95.6 },
      'Première D': { present: 51, absent: 2, late: 1, total: 53, rate: 96.2 },
      '3ème A': { present: 57, absent: 3, late: 1, total: 60, rate: 95.0 },
    }
  },
  {
    date: '15 Nov',
    fullDate: 'Vendredi 15 Nov 2024',
    dayOfWeek: 'Ven',
    present: 417,
    absent: 18,
    late: 10,
    total: 435,
    rate: 95.9,
    justifiedAbsences: 14,
    unjustifiedAbsences: 4,
    byClass: {
      'Terminale D': { present: 47, absent: 3, late: 2, total: 50, rate: 94.0 },
      'Terminale C': { present: 43, absent: 2, late: 1, total: 45, rate: 95.6 },
      'Première D': { present: 50, absent: 3, late: 1, total: 53, rate: 94.3 },
      '3ème A': { present: 57, absent: 3, late: 2, total: 60, rate: 95.0 },
    }
  },
  {
    date: '18 Nov',
    fullDate: 'Lundi 18 Nov 2024',
    dayOfWeek: 'Lun',
    present: 414,
    absent: 21,
    late: 12,
    total: 435,
    rate: 95.2,
    justifiedAbsences: 17,
    unjustifiedAbsences: 4,
    byClass: {
      'Terminale D': { present: 46, absent: 4, late: 2, total: 50, rate: 92.0 },
      'Terminale C': { present: 43, absent: 2, late: 1, total: 45, rate: 95.6 },
      'Première D': { present: 51, absent: 2, late: 2, total: 53, rate: 96.2 },
      '3ème A': { present: 56, absent: 4, late: 2, total: 60, rate: 93.3 },
    }
  },
  {
    date: '19 Nov',
    fullDate: 'Mardi 19 Nov 2024',
    dayOfWeek: 'Mar',
    present: 427,
    absent: 8,
    late: 4,
    total: 435,
    rate: 98.2,
    justifiedAbsences: 6,
    unjustifiedAbsences: 2,
    byClass: {
      'Terminale D': { present: 49, absent: 1, late: 0, total: 50, rate: 98.0 },
      'Terminale C': { present: 44, absent: 1, late: 0, total: 45, rate: 97.8 },
      'Première D': { present: 53, absent: 0, late: 0, total: 53, rate: 100.0 },
      '3ème A': { present: 59, absent: 1, late: 1, total: 60, rate: 98.3 },
    }
  },
  {
    date: '20 Nov',
    fullDate: 'Mercredi 20 Nov 2024',
    dayOfWeek: 'Mer',
    present: 429,
    absent: 6,
    late: 3,
    total: 435,
    rate: 98.6,
    justifiedAbsences: 5,
    unjustifiedAbsences: 1,
    byClass: {
      'Terminale D': { present: 50, absent: 0, late: 0, total: 50, rate: 100.0 },
      'Terminale C': { present: 45, absent: 0, late: 0, total: 45, rate: 100.0 },
      'Première D': { present: 52, absent: 1, late: 0, total: 53, rate: 98.1 },
      '3ème A': { present: 60, absent: 0, late: 1, total: 60, rate: 100.0 },
    }
  },
  {
    date: '21 Nov',
    fullDate: 'Jeudi 21 Nov 2024',
    dayOfWeek: 'Jeu',
    present: 423,
    absent: 12,
    late: 6,
    total: 435,
    rate: 97.2,
    justifiedAbsences: 9,
    unjustifiedAbsences: 3,
    byClass: {
      'Terminale D': { present: 49, absent: 1, late: 1, total: 50, rate: 98.0 },
      'Terminale C': { present: 43, absent: 2, late: 0, total: 45, rate: 95.6 },
      'Première D': { present: 51, absent: 2, late: 1, total: 53, rate: 96.2 },
      '3ème A': { present: 58, absent: 2, late: 1, total: 60, rate: 96.7 },
    }
  },
  {
    date: '22 Nov',
    fullDate: 'Vendredi 22 Nov 2024',
    dayOfWeek: 'Ven',
    present: 419,
    absent: 16,
    late: 8,
    total: 435,
    rate: 96.3,
    justifiedAbsences: 12,
    unjustifiedAbsences: 4,
    byClass: {
      'Terminale D': { present: 47, absent: 3, late: 1, total: 50, rate: 94.0 },
      'Terminale C': { present: 44, absent: 1, late: 1, total: 45, rate: 97.8 },
      'Première D': { present: 51, absent: 2, late: 1, total: 53, rate: 96.2 },
      '3ème A': { present: 57, absent: 3, late: 2, total: 60, rate: 95.0 },
    }
  },
  {
    date: '25 Nov',
    fullDate: 'Lundi 25 Nov 2024',
    dayOfWeek: 'Lun',
    present: 416,
    absent: 19,
    late: 10,
    total: 435,
    rate: 95.6,
    justifiedAbsences: 15,
    unjustifiedAbsences: 4,
    byClass: {
      'Terminale D': { present: 47, absent: 3, late: 2, total: 50, rate: 94.0 },
      'Terminale C': { present: 43, absent: 2, late: 1, total: 45, rate: 95.6 },
      'Première D': { present: 50, absent: 3, late: 1, total: 53, rate: 94.3 },
      '3ème A': { present: 57, absent: 3, late: 2, total: 60, rate: 95.0 },
    }
  },
  {
    date: '26 Nov',
    fullDate: 'Mardi 26 Nov 2024',
    dayOfWeek: 'Mar',
    present: 428,
    absent: 7,
    late: 3,
    total: 435,
    rate: 98.4,
    justifiedAbsences: 6,
    unjustifiedAbsences: 1,
    byClass: {
      'Terminale D': { present: 49, absent: 1, late: 0, total: 50, rate: 98.0 },
      'Terminale C': { present: 45, absent: 0, late: 0, total: 45, rate: 100.0 },
      'Première D': { present: 52, absent: 1, late: 0, total: 53, rate: 98.1 },
      '3ème A': { present: 60, absent: 0, late: 1, total: 60, rate: 100.0 },
    }
  },
  {
    date: '27 Nov',
    fullDate: 'Mercredi 27 Nov 2024',
    dayOfWeek: 'Mer',
    present: 427,
    absent: 8,
    late: 4,
    total: 435,
    rate: 98.2,
    justifiedAbsences: 6,
    unjustifiedAbsences: 2,
    byClass: {
      'Terminale D': { present: 49, absent: 1, late: 0, total: 50, rate: 98.0 },
      'Terminale C': { present: 44, absent: 1, late: 1, total: 45, rate: 97.8 },
      'Première D': { present: 52, absent: 1, late: 0, total: 53, rate: 98.1 },
      '3ème A': { present: 59, absent: 1, late: 1, total: 60, rate: 98.3 },
    }
  },
  {
    date: '28 Nov',
    fullDate: 'Jeudi 28 Nov 2024',
    dayOfWeek: 'Jeu',
    present: 424,
    absent: 11,
    late: 5,
    total: 435,
    rate: 97.5,
    justifiedAbsences: 9,
    unjustifiedAbsences: 2,
    byClass: {
      'Terminale D': { present: 48, absent: 2, late: 1, total: 50, rate: 96.0 },
      'Terminale C': { present: 44, absent: 1, late: 0, total: 45, rate: 97.8 },
      'Première D': { present: 52, absent: 1, late: 0, total: 53, rate: 98.1 },
      '3ème A': { present: 58, absent: 2, late: 1, total: 60, rate: 96.7 },
    }
  },
  {
    date: '29 Nov',
    fullDate: 'Vendredi 29 Nov 2024',
    dayOfWeek: 'Ven',
    present: 421,
    absent: 14,
    late: 7,
    total: 435,
    rate: 96.8,
    justifiedAbsences: 11,
    unjustifiedAbsences: 3,
    weatherOrNote: 'Bilan fin de mois conforme MEPPSA',
    byClass: {
      'Terminale D': { present: 48, absent: 2, late: 1, total: 50, rate: 96.0 },
      'Terminale C': { present: 43, absent: 2, late: 1, total: 45, rate: 95.6 },
      'Première D': { present: 51, absent: 2, late: 1, total: 53, rate: 96.2 },
      '3ème A': { present: 58, absent: 2, late: 1, total: 60, rate: 96.7 },
    }
  }
];


import { Student, Teacher, SubjectGrade, PaymentRecord, DailyAttendanceRecord } from '../types';
export type { DailyAttendanceRecord };

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-001',
    matricule: 'CG-2024-8831',
    firstName: 'Arsène',
    lastName: 'Mavoungou',
    gender: 'M',
    birthDate: '2007-04-14',
    birthPlace: 'Pointe-Noire',
    classroom: 'Terminale D',
    parentName: 'Jean-Claude Mavoungou',
    parentPhone: '+242 06 612 34 56',
    status: 'Inscrit',
    tuitionPaid: 150000,
    tuitionTotal: 150000,
    averageGrade: 15.4,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    studentType: 'eleve',
    email: 'arsene.mavoungou@eleve.cg',
    bloodGroup: 'O+',
    address: 'Av. Moe Pratt, Pointe-Noire',
  },
  {
    id: 'STU-002',
    matricule: 'CG-2024-8832',
    firstName: 'Grace',
    lastName: 'Ngouabi',
    gender: 'F',
    birthDate: '2008-01-22',
    birthPlace: 'Brazzaville (Bacongo)',
    classroom: 'Terminale D',
    parentName: 'Marie-Therèse Ngouabi',
    parentPhone: '+242 05 520 88 19',
    status: 'Inscrit',
    tuitionPaid: 120000,
    tuitionTotal: 150000,
    averageGrade: 16.8,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    studentType: 'eleve',
    email: 'grace.ngouabi@eleve.cg',
    bloodGroup: 'A+',
    address: 'Rue Dahomey, Bacongo, Brazzaville',
  },
  {
    id: 'STU-003',
    matricule: 'CG-2024-8833',
    firstName: 'Junior',
    lastName: 'Massamba',
    gender: 'M',
    birthDate: '2007-09-08',
    birthPlace: 'Dolisie',
    classroom: 'Terminale C',
    parentName: 'Hilaire Massamba',
    parentPhone: '+242 06 931 44 20',
    status: 'Inscrit',
    tuitionPaid: 150000,
    tuitionTotal: 150000,
    averageGrade: 17.2,
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
    studentType: 'eleve',
    email: 'junior.massamba@eleve.cg',
    bloodGroup: 'B+',
    address: 'Quartier Moungali, Brazzaville',
  },
  {
    id: 'STU-004',
    matricule: 'CG-2024-8834',
    firstName: 'Dorcas',
    lastName: 'Loubaki',
    gender: 'F',
    birthDate: '2008-11-17',
    birthPlace: 'Brazzaville (Ouenzé)',
    classroom: 'Première D',
    parentName: 'Christian Loubaki',
    parentPhone: '+242 06 441 22 10',
    status: 'Inscrit',
    tuitionPaid: 80000,
    tuitionTotal: 140000,
    averageGrade: 14.1,
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    studentType: 'eleve',
    email: 'dorcas.loubaki@eleve.cg',
    bloodGroup: 'AB+',
    address: 'Av. des 3 Martyrs, Ouenzé, Brazzaville',
  },
  {
    id: 'STU-005',
    matricule: 'CG-2024-8835',
    firstName: 'Kevin',
    lastName: 'Bouity',
    gender: 'M',
    birthDate: '2009-03-30',
    birthPlace: 'Pointe-Noire (Tié-Tié)',
    classroom: '3ème A',
    parentName: 'Patrice Bouity',
    parentPhone: '+242 05 777 90 01',
    status: 'Inscrit',
    tuitionPaid: 110000,
    tuitionTotal: 120000,
    averageGrade: 13.7,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    studentType: 'eleve',
    email: 'kevin.bouity@eleve.cg',
    bloodGroup: 'O-',
    address: 'Fond Tié-Tié, Pointe-Noire',
  },
  {
    id: 'STU-006',
    matricule: 'CG-2024-8836',
    firstName: 'Syntyche',
    lastName: 'Okemba',
    gender: 'F',
    birthDate: '2009-07-12',
    birthPlace: 'Oyo',
    classroom: '3ème A',
    parentName: 'Fernand Okemba',
    parentPhone: '+242 06 500 11 99',
    status: 'Inscrit',
    tuitionPaid: 120000,
    tuitionTotal: 120000,
    averageGrade: 18.1,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    studentType: 'eleve',
    email: 'syntyche.okemba@eleve.cg',
    bloodGroup: 'A-',
    address: 'Quartier Plateau des 15 Ans, Brazzaville',
  },
  {
    id: 'STU-007',
    matricule: 'UNIV-2024-9101',
    firstName: 'Brice Rostand',
    lastName: 'Mampouya',
    gender: 'M',
    birthDate: '2003-06-18',
    birthPlace: 'Brazzaville (Poto-Poto)',
    classroom: 'Licence 2 Informatique & Systèmes',
    parentName: 'Gaston Mampouya',
    parentPhone: '+242 06 880 19 22',
    status: 'Inscrit',
    tuitionPaid: 350000,
    tuitionTotal: 350000,
    averageGrade: 16.5,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    studentType: 'etudiant',
    email: 'brice.mampouya@etudiant-congo.cg',
    bloodGroup: 'O+',
    address: 'Rond-Point Moungali, Brazzaville',
  },
  {
    id: 'STU-008',
    matricule: 'UNIV-2024-9102',
    firstName: 'Audrey Chancia',
    lastName: 'Ndoudi',
    gender: 'F',
    birthDate: '2004-10-05',
    birthPlace: 'Pointe-Noire',
    classroom: 'Master 1 Gestion Financière & Audit',
    parentName: 'Sylvie Ndoudi',
    parentPhone: '+242 05 600 45 77',
    status: 'Inscrit',
    tuitionPaid: 450000,
    tuitionTotal: 450000,
    averageGrade: 17.0,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    studentType: 'etudiant',
    email: 'audrey.ndoudi@etudiant-congo.cg',
    bloodGroup: 'B+',
    address: 'Centre-Ville, Face Total Tour, Brazzaville',
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'TCH-001',
    name: 'Prof. Dieudonné Mikala',
    subject: 'Mathématiques',
    phone: '+242 06 650 43 21',
    email: 'd.mikala@educongo.cg',
    classes: ['Terminale C', 'Terminale D', 'Première C'],
    status: 'Titulaire',
  },
  {
    id: 'TCH-002',
    name: 'Mme. Solange Mabiala',
    subject: 'Français & Littérature',
    phone: '+242 05 533 12 78',
    email: 's.mabiala@educongo.cg',
    classes: ['Terminale A4', 'Première D', '3ème A'],
    status: 'Titulaire',
  },
  {
    id: 'TCH-003',
    name: 'M. Rodrigue Samba',
    subject: 'Sciences Physiques & Chimie',
    phone: '+242 06 910 87 65',
    email: 'r.samba@educongo.cg',
    classes: ['Terminale D', 'Terminale C', 'Première D'],
    status: 'Titulaire',
  },
  {
    id: 'TCH-004',
    name: 'Dr. Clarisse Goma',
    subject: 'SVT (Sciences de la Vie et de la Terre)',
    phone: '+242 06 422 99 00',
    email: 'c.goma@educongo.cg',
    classes: ['Terminale D', 'Première D'],
    status: 'Titulaire',
  },
  {
    id: 'TCH-005',
    name: 'M. Jean-Baptiste Kolélas',
    subject: 'Histoire - Géographie & ECM',
    phone: '+242 05 711 02 44',
    email: 'jb.kolelas@educongo.cg',
    classes: ['Terminale A4', 'Terminale D', '3ème A'],
    status: 'Vacataire',
  },
  {
    id: 'TCH-006',
    name: 'Mme. Edwige Nguimbi',
    subject: 'Anglais',
    phone: '+242 06 808 31 15',
    email: 'e.nguimbi@educongo.cg',
    classes: ['Terminale D', 'Terminale C', '3ème A'],
    status: 'Titulaire',
  }
];

export const SAMPLE_BULLETIN_GRADES: SubjectGrade[] = [
  {
    subject: 'Mathématiques',
    coefficient: 5,
    devoir1: 16.5,
    devoir2: 15.0,
    composition: 17.0,
    appreciation: 'Très bon travail. Esprit d\'analyse rigoureux.',
    teacher: 'Prof. Mikala',
  },
  {
    subject: 'Sciences Physiques',
    coefficient: 4,
    devoir1: 14.0,
    devoir2: 16.0,
    composition: 15.5,
    appreciation: 'Bonne maîtrise des concepts de dynamique et d\'optique.',
    teacher: 'M. Samba',
  },
  {
    subject: 'Sciences de la Vie et de la Terre (SVT)',
    coefficient: 5,
    devoir1: 17.0,
    devoir2: 16.5,
    composition: 18.0,
    appreciation: 'Excellent trimestre. Devoir de synthèse remarquable.',
    teacher: 'Dr. Goma',
  },
  {
    subject: 'Français / Philosophie',
    coefficient: 3,
    devoir1: 13.5,
    devoir2: 14.0,
    composition: 14.5,
    appreciation: 'Expression claire, argumentation bien articulée.',
    teacher: 'Mme. Mabiala',
  },
  {
    subject: 'Histoire - Géographie',
    coefficient: 2,
    devoir1: 15.0,
    devoir2: 15.5,
    composition: 16.0,
    appreciation: 'Très bonne participation et devoirs soignés.',
    teacher: 'M. Kolélas',
  },
  {
    subject: 'Anglais',
    coefficient: 2,
    devoir1: 14.5,
    devoir2: 15.0,
    composition: 15.0,
    appreciation: 'Aisance à l\'oral et bonne compréhension écrite.',
    teacher: 'Mme. Nguimbi',
  },
  {
    subject: 'Éducation Civique et Morale (ECM)',
    coefficient: 1,
    devoir1: 17.0,
    devoir2: 18.0,
    composition: 17.5,
    appreciation: 'Très exemplaire.',
    teacher: 'M. Kolélas',
  },
  {
    subject: 'EPS (Éducation Physique et Sportive)',
    coefficient: 1,
    devoir1: 16.0,
    devoir2: 16.0,
    composition: 16.0,
    appreciation: 'Régularité et bel esprit d\'équipe.',
    teacher: 'M. Koumba',
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-2024-001',
    studentMatricule: 'CG-2024-8831',
    studentName: 'Arsène Mavoungou',
    classroom: 'Terminale D',
    amount: 50000,
    date: '2024-10-05',
    paymentMethod: 'MTN Mobile Money',
    reference: 'MOMO-CG-994821',
    month: 'Octobre 2024',
    status: 'Validé',
  },
  {
    id: 'PAY-2024-002',
    studentMatricule: 'CG-2024-8832',
    studentName: 'Grace Ngouabi',
    classroom: 'Terminale D',
    amount: 50000,
    date: '2024-10-06',
    paymentMethod: 'Airtel Money',
    reference: 'AIRTEL-CG-483011',
    month: 'Octobre 2024',
    status: 'Validé',
  },
  {
    id: 'PAY-2024-003',
    studentMatricule: 'CG-2024-8833',
    studentName: 'Junior Massamba',
    classroom: 'Terminale C',
    amount: 50000,
    date: '2024-10-07',
    paymentMethod: 'MTN Mobile Money',
    reference: 'MOMO-CG-102943',
    month: 'Octobre 2024',
    status: 'Validé',
  },
  {
    id: 'PAY-2024-004',
    studentMatricule: 'CG-2024-8835',
    studentName: 'Kevin Bouity',
    classroom: '3ème A',
    amount: 40000,
    date: '2024-10-10',
    paymentMethod: 'Espèces',
    reference: 'REC-ESP-2024-904',
    month: 'Octobre 2024',
    status: 'Validé',
  },
  {
    id: 'PAY-2024-005',
    studentMatricule: 'CG-2024-8836',
    studentName: 'Syntyche Okemba',
    classroom: '3ème A',
    amount: 40000,
    date: '2024-10-12',
    paymentMethod: 'Virement BGFI',
    reference: 'BGFI-TRF-00392',
    month: 'Octobre 2024',
    status: 'Validé',
  }
];

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


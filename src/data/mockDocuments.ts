import { AdminDocument } from '../types';

export const ADMIN_DOCUMENTS: AdminDocument[] = [
  {
    id: 'DOC-001',
    reference: 'CIRC-MEPPSA-2024-048',
    title: "Circulaire Ministérielle - Calendrier National des Examens d'État 2024-2025",
    category: 'circulaire',
    categoryLabel: 'Circulaire Ministérielle',
    issueDate: '15/09/2024',
    signatory: 'Prof. Jean-Luc Mouthou',
    signatoryRole: "Ministre de l'Enseignement Préscolaire, Primaire, Secondaire et de l'Alphabétisation",
    department: 'Direction Générale des Examens et Concours (DEC)',
    summary: "Fixation des dates officielles de déroulement des épreuves du Baccalauréat Général, Technique, du BEPC et du CEPE session 2025 en République du Congo.",
    content: `RÉPUBLIQUE DU CONGO
Unité - Travail - Progrès
MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION
DIRECTION GÉNÉRALE DES EXAMENS ET CONCOURS (DEC)

CIRCULAIRE N° 0048/MEPPSA/CAB/DEC-24

Portant calendrier des examens d'État et des compositions de fin de trimestre pour l'année scolaire 2024-2025.

Il est porté à la connaissance de tous les Directeurs Départementaux (DDEPSA), Chefs d'Établissements publics et conventionnés, le chronogramme officiel suivant :

1. BACCALAURÉAT GÉNÉRAL (Séries A, C, D) :
   - Épreuves écrites : Du Mardi 17 Juin au Vendredi 20 Juin 2025.
   - Délibérations et publication : Au plus tard le Samedi 12 Juillet 2025.

2. BREVET D'ÉTUDES DU PREMIER CYCLE (BEPC) :
   - Épreuves écrites : Du Mardi 08 Juillet au Vendredi 11 Juillet 2025.
   - Épreuves d'Éducation Physique et Sportive (EPS) : Du 19 au 24 Mai 2025.

3. ARRÊT DES NOTES DU 1ER TRIMESTRE :
   - Vendredi 20 Décembre 2024 sur toute l'étendue du territoire national.

Les chefs d'établissements sont tenus au respect scrupuleux des présentes dispositions sous peine de sanctions administratives.`,
    status: 'Officiel',
    targetAudience: 'Tous les établissements scolaires (Publics & Privés)',
    tags: ['BAC 2025', 'BEPC', 'Examens', 'Calendrier', 'MEPPSA', 'DEC'],
    fileSize: '1.4 Mo (PDF)',
  },
  {
    id: 'DOC-002',
    reference: 'ARR-MEPPSA-8421/CAB',
    title: "Arrêté Ministériel portant Agrément et Reconnaissance Officielle de l'Établissement",
    category: 'arrete',
    categoryLabel: 'Arrêté Ministériel',
    issueDate: '12/10/2021',
    signatory: 'Cabinet du Ministre',
    signatoryRole: 'Ministère de Tutelle MEPPSA',
    department: 'Direction Départementale de Brazzaville (DDEPSA-BZV)',
    summary: "Agrément définitif autorisant l'ouverture et le fonctionnement du second cycle de l'enseignement général (Séries A4, C, D).",
    content: `RÉPUBLIQUE DU CONGO
Unité - Travail - Progrès
MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION

ARRÊTÉ N° 8421 / MEPPSA / CAB / DGE / DPES-21

Portant agrément et autorisation définitive d'ouverture d'un établissement d'enseignement général secondaire.

LE MINISTRE,
Vu la Constitution de la République du Congo ;
Vu la Loi N° 25/95 du 17 Novembre 1995 modifiant la Loi scolaire N° 008/90 ;
Vu le rapport d'inspection de conformité pédagogique et matérielle de la DDEPSA Brazzaville ;

ARRÊTE :
Article 1er : Il est accordé à l'établissement d'enseignement secondaire l'agrément ministériel N° 8421 autorisant l'accueil d'élèves de la 6ème à la Terminale.
Article 2 : Les filières autorisées sont : Série Littéraire (A4), Séries Scientifiques (C et D).
Article 3 : Le présent arrêté prend effet à compter de la rentrée scolaire 2021-2022 et sera enregistré et communiqué partout où besoin sera.`,
    status: 'Officiel',
    targetAudience: 'Direction d\'Établissement & Inspection',
    tags: ['Agrément', 'Homologation', 'Arrêté', 'Ministère', 'Ouverture'],
    fileSize: '2.1 Mo (PDF)',
  },
  {
    id: 'DOC-003',
    reference: 'CERT-SCO-2024-8831',
    title: 'Certificat de Scolarité Officiel - Arsène Mavoungou (Terminale D)',
    category: 'certificat',
    categoryLabel: 'Certificat de Scolarité',
    issueDate: '05/10/2024',
    signatory: 'Dieudonné Mavoungou',
    signatoryRole: "Proviseur / Chef d'Établissement",
    department: 'Secrétariat Général & Registre des Inscriptions',
    summary: "Attestation officielle certifiant l'inscription régulière de l'élève Arsène Mavoungou (Matricule CG-2024-8831) en classe de Terminale D pour l'année 2024-2025.",
    content: `RÉPUBLIQUE DU CONGO
MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION
DDEPSA BRAZZAVILLE

CERTIFICAT DE SCOLARITÉ N° CERT-SCO-2024-8831

Je soussigné, Proviseur du Lycée, atteste par la présente que :
- Nom et Prénom : MAVOUNGOU Arsène
- Né le : 14 Avril 2007 à Pointe-Noire
- Matricule Scolaire : CG-2024-8831
- Classe : Terminale D (Sciences Naturelles & Mathématiques)

Est régulièrement inscrit(e) dans les registres matricules de notre établissement pour l'année académique 2024-2025.
En foi de quoi le présent certificat est délivré pour servir et valoir ce que de droit.`,
    status: 'Validé',
    targetAudience: 'Élève & Parents (Dossier BAC 2025)',
    tags: ['Certificat', 'Arsène Mavoungou', 'CG-2024-8831', 'Terminale D'],
    fileSize: '450 Ko (PDF)',
    relatedStudentId: 'STU-001',
    relatedStudentName: 'Arsène Mavoungou',
  },
  {
    id: 'DOC-004',
    reference: 'CERT-SCO-2024-8832',
    title: 'Certificat de Scolarité Officiel - Grace Ngouabi (Terminale D)',
    category: 'certificat',
    categoryLabel: 'Certificat de Scolarité',
    issueDate: '06/10/2024',
    signatory: 'Dieudonné Mavoungou',
    signatoryRole: "Proviseur / Chef d'Établissement",
    department: 'Secrétariat Général & Registre des Inscriptions',
    summary: "Attestation de scolarité délivrée à Grace Ngouabi, élève inscrite en Terminale D avec le matricule CG-2024-8832.",
    content: `RÉPUBLIQUE DU CONGO
MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION

CERTIFICAT DE SCOLARITÉ N° CERT-SCO-2024-8832
Élève : NGOUABI Grace
Née le 22/01/2008 à Brazzaville (Bacongo)
Matricule : CG-2024-8832
Classe : Terminale D

Certifié conforme aux registres de la scolarité.`,
    status: 'Validé',
    targetAudience: 'Élève & Parents',
    tags: ['Certificat', 'Grace Ngouabi', 'CG-2024-8832', 'Terminale D'],
    fileSize: '440 Ko (PDF)',
    relatedStudentId: 'STU-002',
    relatedStudentName: 'Grace Ngouabi',
  },
  {
    id: 'DOC-005',
    reference: 'BORD-DDEPSA-BZV-T1',
    title: 'Bordereau Récapitulatif Trimestriel des Notes & Effectifs DDEPSA',
    category: 'bordereau',
    categoryLabel: 'Bordereau Pédagogique DDEPSA',
    issueDate: '18/11/2024',
    signatory: 'M. Rodrigue Bouanga',
    signatoryRole: 'Censeur des Études',
    department: 'Direction des Études & Pédagogie',
    summary: "Rapport officiel de synthèse des moyennes générales par niveau (6ème à Terminale), taux de réussite et assiduité pour transmission à la Direction Départementale.",
    content: `DIRECTION DÉPARTEMENTALE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE ET SECONDAIRE DE BRAZZAVILLE

BORDEREAU RÉCAPITULATIF TRIMESTRIEL DES RÉSULTATS (T1 - 2024/2025)

1. Effectif total contrôlé : 1 248 élèves (612 Filles / 636 Garçons)
2. Taux d'assiduité global : 94.2%
3. Moyenne générale d'établissement : 14.3 / 20
4. Classes d'examen (Terminale & 3ème) :
   - Terminale C : 100% admis prévisionnels (> 12/20)
   - Terminale D : 91.5% taux de passage
   - 3ème A : 88.0% taux de passage

Transmis pour visa de l'Inspection Pédagogique Régionale de Brazzaville.`,
    status: 'Validé',
    targetAudience: 'Inspection Pédagogique & DDEPSA',
    tags: ['Bordereau', 'DDEPSA', 'Trimestre 1', 'Statistiques', 'Censure'],
    fileSize: '3.2 Mo (PDF)',
  },
  {
    id: 'DOC-006',
    reference: 'STAT-ETAB-REG-2024',
    title: "Règlement Intérieur et Statuts de l'Établissement Scolaire",
    category: 'reglement',
    categoryLabel: 'Règlement Intérieur & Statuts',
    issueDate: '01/09/2024',
    signatory: "Conseil d'Administration & Direction",
    signatoryRole: "Conseil d'Établissement",
    department: 'Vie Scolaire & Discipline',
    summary: "Code de conduite, régime des sanctions disciplinaires, respect des tenues scolaires officielles (Kaki / Bleu ciel) et consignes d'assiduité.",
    content: `RÈGLEMENT INTÉRIEUR OFFICIEL DE L'ÉTABLISSEMENT - SESSION 2024-2025

ARTICLE 1 : Port de la tenue scolaire réglementaire obligatoire (Pantalon/Jupe kaki ou bleu selon niveau).
ARTICLE 2 : Ponctualité stricte aux sonneries de 07h15 et 12h30. Tout retard non justifié entraîne le non-accès en salle de classe.
ARTICLE 3 : Interdiction stricte de téléphones portables connectés durant les heures de cours et devoirs sur table.
ARTICLE 4 : Respect mutuel envers les enseignants, surveillants généraux et personnels administratifs.`,
    status: 'Officiel',
    targetAudience: 'Élèves, Parents d\'élèves & Enseignants',
    tags: ['Règlement', 'Statuts', 'Discipline', 'Vie Scolaire', 'Tenue'],
    fileSize: '890 Ko (PDF)',
  },
  {
    id: 'DOC-007',
    reference: 'CIRC-DDEPSA-ECO-024',
    title: "Note de Service DDEPSA - Encadrement des Frais d'Écolage & Paiements Mobiles (+242)",
    category: 'circulaire',
    categoryLabel: 'Circulaire Départementale',
    issueDate: '20/09/2024',
    signatory: 'Direction Départementale Brazzaville',
    signatoryRole: 'Directeur Départemental DDEPSA',
    department: 'Service des Affaires Financières et Écoles Privées',
    summary: "Modalités d'encadrement des paiements dématérialisés via MTN Mobile Money et Airtel Money pour sécuriser les cotisations scolaires parentales.",
    content: `DDEPSA BRAZZAVILLE - NOTE DE SERVICE FINANCIÈRE N° 024

Objet : Modalités de perception des frais de scolarité et traçabilité bancaire/mobile money.

Il est vivement encouragé pour l'année 2024-2025 d'utiliser les canaux certifiés :
- MTN Mobile Money (Compte Marchand Établissement)
- Airtel Money Congo
- Virement BGFI Bank Congo

Tout paiement donne lieu à l'émission immédiate d'un reçu numérique authentifié par le système central EduCongo.`,
    status: 'Officiel',
    targetAudience: 'Intendance, Comptables & Parents',
    tags: ['Écolage', 'MTN MoMo', 'Airtel Money', 'Finances', 'DDEPSA'],
    fileSize: '1.1 Mo (PDF)',
  },
  {
    id: 'DOC-008',
    reference: 'REC-PAY-2024-001',
    title: "Reçu Officiel d'Écolage N° 001/2024 - Arsène Mavoungou (MTN MoMo)",
    category: 'recu',
    categoryLabel: 'Reçu de Versement',
    issueDate: '05/10/2024',
    signatory: 'Mme. Nadine Tsaty',
    signatoryRole: 'Agent Comptable & Écolage',
    department: 'Intendance & Caisse Scolaire',
    summary: "Reçu de paiement de scolarité d'un montant de 50 000 FCFA (Mois d'Octobre 2024) réglé par MTN Mobile Money (Réf: MOMO-CG-994821).",
    content: `REÇU DE PAIEMENT SCOLARITÉ N° REC-PAY-2024-001
Établissement : Lycée d'Excellence de Brazzaville
Matricule Élève : CG-2024-8831 (Arsène Mavoungou)
Classe : Terminale D
Montant versé : 50 000 FCFA
Mode : MTN Mobile Money (Réf: MOMO-CG-994821)
Mois : Octobre 2024
Statut : Encaissé & Validé`,
    status: 'Validé',
    targetAudience: 'Parent d\'élève (Jean-Claude Mavoungou)',
    tags: ['Reçu', 'Paiement', 'MTN MoMo', '50000 FCFA', 'Arsène Mavoungou'],
    fileSize: '320 Ko (PDF)',
    relatedStudentId: 'STU-001',
    relatedStudentName: 'Arsène Mavoungou',
  },
  {
    id: 'DOC-009',
    reference: 'DEC-PEDA-2024-012',
    title: "Décision Rectorale - Désignation des Professeurs Principaux 2024-2025",
    category: 'arrete',
    categoryLabel: 'Décision Pédagogique',
    issueDate: '28/09/2024',
    signatory: 'Dieudonné Mavoungou',
    signatoryRole: "Proviseur / Chef d'Établissement",
    department: 'Direction des Études & Censure',
    summary: "Attribution des responsabilités de suivi pédagogique des classes d'examen : Prof. Mikala (Terminale C/D), Mme Mabiala (Terminale A4), M. Samba (Première D).",
    content: `DÉCISION D'AFFECTATION PÉDAGOGIQUE N° 012/DIR-24
Portant désignation des Professeurs Principaux pour l'année scolaire 2024-2025.

Sont nommés Professeurs Principaux :
- Terminale C & D : Prof. Dieudonné Mikala (Mathématiques)
- Terminale A4 : Mme Solange Mabiala (Français/Philo)
- Première D : M. Rodrigue Samba (Sciences Physiques)
- 3ème A : M. Jean-Baptiste Kolélas (Histoire-Géo)

Les nommés sont chargés du suivi disciplinaire et de la coordination des conseils de classe.`,
    status: 'Officiel',
    targetAudience: 'Corps Enseignant & Conseil Pédagogique',
    tags: ['Professeurs Principaux', 'Affectation', 'Conseil', 'Mikala', 'Mabiala'],
    fileSize: '680 Ko (PDF)',
  },
  {
    id: 'DOC-010',
    reference: 'PROT-SANTE-2024',
    title: "Protocole Sanitaire, Infirmerie Scolaire & Fiche d'Urgence",
    category: 'reglement',
    categoryLabel: 'Protocole Sanitaire & Sécurité',
    issueDate: '10/09/2024',
    signatory: 'Service Médical & Direction',
    signatoryRole: 'Infirmerie Scolaire',
    department: 'Service Médical & Soins',
    summary: "Procédures de prise en charge rapide des élèves malades, trousse d'urgence, déclaration d'incidents et numéros d'urgence de Brazzaville/Pointe-Noire.",
    content: `PROTOCOLE D'URGENCE MÉDICALE ET INFIRMERIE SCOLAIRE

1. Tout élève présentant de la fièvre, malaise ou blessure est immédiatement dirigé vers l'infirmerie scolaire.
2. Notification par SMS immédiate aux parents d'élèves enregistrés dans le système EduCongo.
3. Numéro Samu / Urgence Hôpital CHU Brazzaville / Hôpital Général Loandjili PNR en cas d'évacuation médicale.`,
    status: 'Officiel',
    targetAudience: 'Infirmiers, Surveillants & Parents',
    tags: ['Santé', 'Infirmerie', 'Urgences', 'Protocole', 'Sécurité'],
    fileSize: '510 Ko (PDF)',
  }
];

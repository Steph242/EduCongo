import { Student, PaymentRecord, SubjectGrade, DailyAttendanceRecord } from '../types';

/**
 * Trigger download of a UTF-8 CSV file with BOM for perfect Excel / LibreOffice compatibility
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const sanitize = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(';'),
    ...rows.map((row) => row.map(sanitize).join(';')),
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens accented French characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to trigger print dialog for official document layouts
 */
export function printDocument(title?: string) {
  if (title) {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  } else {
    window.print();
  }
}

/**
 * Export a Single Student's Grade Bulletin to CSV
 */
export function exportSingleStudentBulletinCSV(
  student: Student,
  grades: SubjectGrade[],
  schoolName: string = "Lycée d'Excellence de Brazzaville",
  term: string = '1er Trimestre 2024-2025'
) {
  const headers = [
    'Discipline / Matière',
    'Enseignant',
    'Coefficient',
    'Devoir 1 (/20)',
    'Devoir 2 (/20)',
    'Composition (/20)',
    'Moyenne Matière (/20)',
    'Points Pondérés',
    'Appréciation du Professeur'
  ];

  let totalCoef = 0;
  let totalPoints = 0;

  const rows = grades.map((g) => {
    const avg = (g.devoir1 + g.devoir2 + g.composition * 2) / 4;
    const weighted = avg * g.coefficient;
    totalCoef += g.coefficient;
    totalPoints += weighted;

    return [
      g.subject,
      g.teacher,
      g.coefficient,
      g.devoir1.toFixed(1),
      g.devoir2.toFixed(1),
      g.composition.toFixed(1),
      avg.toFixed(2),
      weighted.toFixed(2),
      g.appreciation
    ];
  });

  const overallAvg = (totalPoints / (totalCoef || 1)).toFixed(2);

  // Append Summary Rows
  rows.push(['', '', '', '', '', '', '', '', '']);
  rows.push(['TOTAL COEFFICIENTS', '', totalCoef, '', '', '', '', '', '']);
  rows.push(['TOTAL POINTS PONDÉRÉS', '', '', '', '', '', '', totalPoints.toFixed(2), '']);
  rows.push(['MOYENNE GÉNÉRALE DU TRIMESTRE', '', '', '', '', '', overallAvg + ' / 20', '', '']);
  rows.push(['ÉLÈVE', `${student.firstName} ${student.lastName}`, 'MATRICULE', student.matricule, 'CLASSE', student.classroom, '', '', '']);
  rows.push(['ÉTABLISSEMENT', schoolName, 'PÉRIODE', term, 'DATE EXPORT', new Date().toLocaleDateString('fr-FR'), '', '', '']);

  const filename = `Bulletin_${student.matricule}_${student.lastName}_${student.classroom.replace(/\s+/g, '_')}_T1.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * Export Class-Wide Grade Sheet (Procès-Verbal Trimestriel) to CSV
 */
export function exportClassGradeSheetCSV(
  classroom: string,
  studentsInClass: Student[],
  schoolName: string = "Lycée d'Excellence de Brazzaville"
) {
  const headers = [
    'Rang',
    'Matricule',
    'Nom',
    'Prénom',
    'Sexe',
    'Classe',
    'Moyenne T1 (/20)',
    'Mention / Observation',
    'Statut Écolage',
    'Contact Parent'
  ];

  // Sort students by average descending
  const sorted = [...studentsInClass].sort((a, b) => b.averageGrade - a.averageGrade);

  const rows = sorted.map((st, idx) => {
    let mention = 'Passable';
    if (st.averageGrade >= 16) mention = 'Très Bien (Tableau d\'Honneur)';
    else if (st.averageGrade >= 14) mention = 'Bien (Encouragements)';
    else if (st.averageGrade >= 12) mention = 'Assez Bien';
    else if (st.averageGrade < 10) mention = 'Insuffisant (Avertissement)';

    return [
      idx + 1,
      st.matricule,
      st.lastName,
      st.firstName,
      st.gender === 'M' ? 'Garçon' : 'Fille',
      st.classroom,
      st.averageGrade.toFixed(2),
      mention,
      st.tuitionPaid >= st.tuitionTotal ? 'Soldé' : `${Math.round((st.tuitionPaid / st.tuitionTotal) * 100)}% payé`,
      st.parentPhone
    ];
  });

  const classAvg = (sorted.reduce((acc, s) => acc + s.averageGrade, 0) / (sorted.length || 1)).toFixed(2);
  rows.push(['', '', '', '', '', '', '', '', '', '']);
  rows.push(['STATISTIQUES DE CLASSE', '', '', '', '', '', `Moyenne : ${classAvg}/20`, `Effectif : ${sorted.length} élèves`, '', '']);
  rows.push(['ÉTABLISSEMENT', schoolName, 'CLASSE', classroom, 'PÉRIODE', '1er Trimestre 2024-2025', 'DATE', new Date().toLocaleDateString('fr-FR'), '', '']);

  const filename = `Proces_Verbal_Notes_${classroom.replace(/\s+/g, '_')}_2024_2025.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * Export Students Registry to CSV
 */
export function exportStudentsRegistryCSV(
  students: Student[],
  schoolName: string = "Lycée d'Excellence de Brazzaville",
  classFilter: string = 'all'
) {
  const headers = [
    'N° Matricule',
    'Nom',
    'Prénom',
    'Sexe',
    'Date de Naissance',
    'Lieu de Naissance',
    'Classe',
    'Moyenne Générale',
    'Statut Inscription',
    'Écolage Versé (FCFA)',
    'Écolage Total (FCFA)',
    'Taux Règlement (%)',
    'Nom Parent / Tuteur',
    'Téléphone Parent (+242)'
  ];

  const filtered = classFilter === 'all' ? students : students.filter(s => s.classroom === classFilter);

  const rows = filtered.map((s) => [
    s.matricule,
    s.lastName,
    s.firstName,
    s.gender === 'M' ? 'Masculin' : 'Féminin',
    s.birthDate,
    s.birthPlace,
    s.classroom,
    s.averageGrade.toFixed(2),
    s.status,
    s.tuitionPaid,
    s.tuitionTotal,
    Math.round((s.tuitionPaid / (s.tuitionTotal || 1)) * 100),
    s.parentName,
    s.parentPhone
  ]);

  const filename = `Registre_Eleves_${classFilter.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * Export Attendance Records to CSV
 */
export function exportAttendanceCSV(
  attendanceRecords: DailyAttendanceRecord[],
  selectedClass: string = 'all',
  schoolName: string = "Lycée d'Excellence de Brazzaville"
) {
  const headers = [
    'Date',
    'Jour',
    'Classe',
    'Élèves Présents',
    'Retards',
    'Total Absents',
    'Absences Justifiées',
    'Absences Injustifiées',
    'Effectif Total',
    'Taux d\'Assiduité (%)',
    'Observations Météo / Vie Scolaire'
  ];

  const rows = attendanceRecords.map((rec) => {
    if (selectedClass !== 'all' && rec.byClass && rec.byClass[selectedClass]) {
      const cls = rec.byClass[selectedClass];
      const just = Math.round(cls.absent * 0.7);
      return [
        rec.fullDate,
        rec.dayOfWeek,
        selectedClass,
        cls.present,
        cls.late,
        cls.absent,
        just,
        cls.absent - just,
        cls.total,
        cls.rate,
        rec.weatherOrNote || ''
      ];
    }

    return [
      rec.fullDate,
      rec.dayOfWeek,
      'Toutes classes',
      rec.present,
      rec.late,
      rec.absent,
      rec.justifiedAbsences,
      rec.unjustifiedAbsences,
      rec.total,
      rec.rate,
      rec.weatherOrNote || ''
    ];
  });

  const filename = `Rapport_Assiduite_Presence_${selectedClass.replace(/\s+/g, '_')}_Nov2024.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * Export Financial Transactions to CSV
 */
export function exportFinancialTransactionsCSV(
  payments: PaymentRecord[],
  schoolName: string = "Lycée d'Excellence de Brazzaville"
) {
  const headers = [
    'N° Quittance / Référence',
    'Date Versement',
    'Matricule Élève',
    'Nom Élève',
    'Classe',
    'Mois Couvert',
    'Canal de Paiement (MoMo/Airtel/Cash)',
    'Montant Encaissé (FCFA)',
    'Statut Transaction'
  ];

  const rows = payments.map((p) => [
    p.reference,
    p.date,
    p.studentMatricule,
    p.studentName,
    p.classroom,
    p.month,
    p.paymentMethod,
    p.amount,
    p.status
  ]);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  rows.push(['', '', '', '', '', '', 'TOTAL ENCAISSEMENTS', total, 'FCFA']);
  rows.push(['ÉTABLISSEMENT', schoolName, 'DATE RAPPORT', new Date().toLocaleDateString('fr-FR'), '', '', '', '', '']);

  const filename = `Journal_Encaissements_Ecolage_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * HTML Document Generator for Clean Printable / PDF Export of official Congolese school documents
 */
export function generatePrintableReportWindow(options: {
  title: string;
  category: string;
  schoolName: string;
  schoolCode: string;
  city: string;
  bodyHtml: string;
}) {
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    // Fallback to standard window.print if popup blocked
    window.print();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${options.title} - ${options.schoolName}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 12px;
    }
    .header-table td {
      vertical-align: top;
    }
    .republic-title {
      font-family: Arial, sans-serif;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .motto {
      font-size: 9.5px;
      font-style: italic;
      color: #475569;
    }
    .school-title {
      font-family: Arial, sans-serif;
      font-size: 15px;
      font-weight: bold;
      color: #047857;
      text-transform: uppercase;
    }
    .document-title {
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 20px 0;
      padding: 6px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      letter-spacing: 0.5px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-family: Arial, sans-serif;
      font-size: 11.5px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #94a3b8;
      padding: 6px 8px;
    }
    table.data-table th {
      background-color: #e2e8f0;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 10.5px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .stamp-box {
      border: 2px dashed #059669;
      border-radius: 50%;
      width: 110px;
      height: 110px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 9px;
      color: #059669;
      font-weight: bold;
      text-transform: uppercase;
      margin-left: auto;
      transform: rotate(5deg);
    }
    .footer-section {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      page-break-inside: avoid;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 40%;">
        <div class="republic-title">RÉPUBLIQUE DU CONGO</div>
        <div class="motto">Unité - Travail - Progrès</div>
        <div style="font-size: 10px; font-weight: bold; margin-top: 4px;">
          MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION (MEPPSA)
        </div>
        <div style="font-size: 9.5px; color: #475569;">Direction Départementale de l'Éducation (${options.city})</div>
      </td>
      <td style="width: 25%; text-align: center;">
        <div style="font-size: 28px; margin-bottom: 2px;">🇨🇬</div>
        <div style="font-size: 10px; font-family: Arial, sans-serif; font-weight: bold; color: #047857;">MEPPSA CONGO</div>
      </td>
      <td style="width: 35%; text-align: right;">
        <div class="school-title">${options.schoolName}</div>
        <div style="font-size: 10px; font-family: monospace; color: #475569;">Code Établissement : ${options.schoolCode}</div>
        <div style="font-size: 10.5px; font-weight: bold; margin-top: 4px;">Année Scolaire 2024 - 2025</div>
      </td>
    </tr>
  </table>

  <div class="document-title">${options.title}</div>

  ${options.bodyHtml}

  <div class="footer-section">
    <div style="font-size: 11px;">
      <div>Fait à <strong>${options.city}</strong>, le ${new Date().toLocaleDateString('fr-FR')}</div>
      <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Document certifié conforme par le Système National EduCongo</div>
    </div>
    <div>
      <div style="text-align: center; font-size: 11px; font-weight: bold; margin-bottom: 5px; font-family: Arial, sans-serif;">
        LE CHEF D'ÉTABLISSEMENT / PROVISEUR
      </div>
      <div class="stamp-box">
        <div>RÉPUBLIQUE DU CONGO</div>
        <div style="font-size: 8px; margin: 2px 0;">DIRECTION DES ÉTUDES</div>
        <div>SCEAU OFFICIEL</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

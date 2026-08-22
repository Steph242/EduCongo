import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  Teacher,
  SubjectGrade,
  PaymentRecord,
  RegisteredSchoolAccount,
  SchoolSubscription,
} from '../../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  SAMPLE_BULLETIN_GRADES,
  INITIAL_PAYMENTS,
} from '../../data/mockData';
import { AttendanceChart } from './AttendanceChart';
import { StaffAccountManager } from './StaffAccountManager';
import { StudentIdCardModal } from './StudentIdCardModal';
import { TeacherWorkspace } from './TeacherWorkspace';
import { StudentWorkspace } from './StudentWorkspace';
import { SchoolSocialFeed } from '../Social/SchoolSocialFeed';
import { getSchoolData, saveSchoolData, getSchoolSubscription, getRegisteredAccounts } from '../../services/accountService';
import { SchoolAdminConfigModal } from './SchoolAdminConfigModal';
import { SchoolSubscriptionModal } from '../Subscription/SchoolSubscriptionModal';
import { SubscriptionStatusBanner } from '../Subscription/SubscriptionStatusBanner';
import {
  exportSingleStudentBulletinCSV,
  exportClassGradeSheetCSV,
  exportStudentsRegistryCSV,
  exportFinancialTransactionsCSV,
  generatePrintableReportWindow,
} from '../../utils/exportUtils';

interface SchoolDashboardProps {
  schoolName: string;
  schoolCode: string;
  city: string;
  slogan?: string;
  logoUrl?: string;
  subdomain?: string;
  onLogout: () => void;
  onOpenSubdomainView?: () => void;
  externalSelectedTab?: TabType;
  externalSelectedStudent?: Student | null;
}

type TabType = 'overview' | 'attendance' | 'students' | 'bulletins' | 'finance' | 'staff' | 'certificates' | 'social';

const STUDENT_PHOTO_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', label: 'Élève 1' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Élève 2' },
  { url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80', label: 'Élève 3' },
  { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', label: 'Élève 4' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', label: 'Étudiant 1' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', label: 'Étudiante 2' },
];

const DEFAULT_FALLBACK_STUDENT: Student = {
  id: 'STU-INIT',
  matricule: 'CG-2024-0001',
  firstName: 'Nouvel',
  lastName: 'Apprenant',
  gender: 'M',
  studentType: 'eleve',
  birthDate: '2008-01-01',
  birthPlace: 'Brazzaville',
  classroom: 'Terminale D',
  parentName: 'Parent / Tuteur',
  parentPhone: '+242 06 000 00 00',
  photoUrl: STUDENT_PHOTO_PRESETS[0].url,
  email: 'eleve@educongo.cg',
  bloodGroup: 'O+',
  address: 'Brazzaville',
  status: 'Inscrit',
  tuitionPaid: 0,
  tuitionTotal: 150000,
  averageGrade: 14.5,
};

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({
  schoolName: initialSchoolName,
  schoolCode,
  city: initialCity,
  slogan: initialSlogan = 'Discipline - Travail - Succès',
  logoUrl: initialLogoUrl = 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
  subdomain = 'lycee-brazza',
  onLogout,
  onOpenSubdomainView,
  externalSelectedTab,
  externalSelectedStudent,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(externalSelectedTab || 'overview');
  const [tabHistory, setTabHistory] = useState<TabType[]>([]);
  const [activeRole, setActiveRole] = useState<'admin' | 'enseignant' | 'comptable' | 'secretaire' | 'eleve'>('admin');
  
  // School profile dynamic state
  const [schoolName, setSchoolName] = useState(initialSchoolName);
  const [city, setCity] = useState(initialCity);
  const [slogan, setSlogan] = useState(initialSlogan);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);

  const [students, setStudents] = useState<Student[]>(() => {
    const data = getSchoolData(schoolCode);
    return data.students || [];
  });
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const data = getSchoolData(schoolCode);
    return data.teachers || [];
  });
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const data = getSchoolData(schoolCode);
    return data.payments || [];
  });

  // Subscription state
  const [subscription, setSubscription] = useState<SchoolSubscription>(() => getSchoolSubscription(schoolCode));
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAdminConfigModalOpen, setIsAdminConfigModalOpen] = useState(false);

  // Sync when schoolCode changes
  useEffect(() => {
    const data = getSchoolData(schoolCode);
    setStudents(data.students || []);
    setTeachers(data.teachers || []);
    setPayments(data.payments || []);
    setSubscription(getSchoolSubscription(schoolCode));
  }, [schoolCode]);

  const persistSchoolData = (newStudents: Student[], newTeachers: Teacher[], newPayments: PaymentRecord[]) => {
    saveSchoolData(schoolCode, {
      students: newStudents,
      teachers: newTeachers,
      payments: newPayments,
      isNewlyCreated: false,
    });
  };

  // Robust tab navigation with history tracking
  const navigateToTab = (newTab: TabType) => {
    if (newTab === activeTab) return;
    setTabHistory((prev) => [...prev.filter((t) => t !== newTab), activeTab]);
    setActiveTab(newTab);
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const previous = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, -1));
      setActiveTab(previous);
    } else if (activeTab !== 'overview') {
      setActiveTab('overview');
    }
  };

  // Student filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [studentViewLayout, setStudentViewLayout] = useState<'grid' | 'table'>('grid');
  const [studentTypeFilter, setStudentTypeFilter] = useState<'all' | 'eleve' | 'etudiant'>('all');

  // Payment cascading filter state (Requirement 5)
  const [paymentCycle, setPaymentCycle] = useState<'all' | 'primaire' | 'college' | 'lycee' | 'superieur'>('all');
  const [paymentClass, setPaymentClass] = useState<string>('all');
  const [paymentPeriodMode, setPaymentPeriodMode] = useState<'mois' | 'trimestre'>('mois');

  // Student ID Card Modal state
  const [idCardModalState, setIdCardModalState] = useState<{
    isOpen: boolean;
    student: Student | null;
  }>({
    isOpen: false,
    student: null,
  });

  // Bulletin inspection state - Safe initialization with fallback
  const [selectedStudentForBulletin, setSelectedStudentForBulletin] = useState<Student>(() => {
    if (externalSelectedStudent) return externalSelectedStudent;
    const data = getSchoolData(schoolCode);
    if (data.students && data.students.length > 0) return data.students[0];
    return DEFAULT_FALLBACK_STUDENT;
  });
  const [bulletinGrades] = useState<SubjectGrade[]>(SAMPLE_BULLETIN_GRADES);

  // Left sidebar mobile state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync external tab and student if triggered from global search
  useEffect(() => {
    if (externalSelectedTab) {
      setActiveTab(externalSelectedTab);
    }
  }, [externalSelectedTab]);

  useEffect(() => {
    if (externalSelectedStudent) {
      setSelectedStudentForBulletin(externalSelectedStudent);
    }
  }, [externalSelectedStudent]);

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New student form state - initialized to empty fields for real data input
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    gender: 'M' as 'M' | 'F',
    studentType: 'eleve' as 'eleve' | 'etudiant',
    birthDate: '',
    birthPlace: '',
    classroom: '',
    parentName: '',
    parentPhone: '',
    photoUrl: '',
    email: '',
    bloodGroup: '',
    address: '',
    tuitionTotal: 0,
  });

  // New payment form state - Safe fallback
  const [newPayment, setNewPayment] = useState({
    studentMatricule: '',
    amount: 50000,
    paymentMethod: 'MTN Mobile Money' as PaymentRecord['paymentMethod'],
    month: 'Novembre 2024',
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.lastName) return;

    const matriculePrefix = newStudent.studentType === 'etudiant' ? 'UNIV-2024' : 'CG-2024';
    const cleanMatricule = `${matriculePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const created: Student = {
      id: `STU-${Date.now().toString().slice(-4)}`,
      matricule: cleanMatricule,
      firstName: newStudent.firstName.trim(),
      lastName: newStudent.lastName.trim(),
      gender: newStudent.gender,
      studentType: newStudent.studentType,
      birthDate: newStudent.birthDate,
      birthPlace: newStudent.birthPlace || city || 'Brazzaville',
      classroom: newStudent.classroom,
      parentName: newStudent.parentName.trim() || 'Parent / Tuteur Légal',
      parentPhone: newStudent.parentPhone.trim(),
      photoUrl: newStudent.photoUrl || STUDENT_PHOTO_PRESETS[0].url,
      email: newStudent.email.trim() || `${newStudent.firstName.toLowerCase()}.${newStudent.lastName.toLowerCase()}@${newStudent.studentType === 'etudiant' ? 'etudiant-congo.cg' : 'eleve.cg'}`,
      bloodGroup: newStudent.bloodGroup || 'O+',
      address: newStudent.address || city || 'Brazzaville',
      status: 'Inscrit',
      tuitionPaid: 0,
      tuitionTotal: newStudent.tuitionTotal || (newStudent.studentType === 'etudiant' ? 350000 : 150000),
      averageGrade: 14.5,
    };

    const updatedStudents = [created, ...students];
    setStudents(updatedStudents);
    persistSchoolData(updatedStudents, teachers, payments);
    setIsAddStudentOpen(false);
    showToast(`✅ ${newStudent.studentType === 'etudiant' ? 'Étudiant' : 'Élève'} ${created.firstName} ${created.lastName} enregistré avec succès !`);
    
    // Automatically open the generated ID Card with QR code!
    setIdCardModalState({
      isOpen: true,
      student: created,
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.matricule === newPayment.studentMatricule);
    if (!st) return;

    const createdPayment: PaymentRecord = {
      id: `PAY-2024-${Date.now().toString().slice(-4)}`,
      studentMatricule: st.matricule,
      studentName: `${st.firstName} ${st.lastName}`,
      classroom: st.classroom,
      amount: Number(newPayment.amount),
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: newPayment.paymentMethod,
      reference: `${newPayment.paymentMethod.startsWith('MTN') ? 'MOMO' : 'AIRTEL'}-CG-${Math.floor(100000 + Math.random() * 900000)}`,
      month: newPayment.month,
      status: 'Validé',
    };

    const updatedPayments = [createdPayment, ...payments];
    const updatedStudents = students.map((s) =>
      s.matricule === st.matricule
        ? { ...s, tuitionPaid: Math.min(s.tuitionTotal, s.tuitionPaid + Number(newPayment.amount)) }
        : s
    );
    setPayments(updatedPayments);
    setStudents(updatedStudents);
    persistSchoolData(updatedStudents, teachers, updatedPayments);
    setIsNewPaymentOpen(false);
    showToast(`Paiement de ${newPayment.amount.toLocaleString('fr-FR')} FCFA validé !`);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName} ${s.matricule} ${s.classroom} ${s.parentName} ${s.email || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classroom === selectedClass;
    const matchesType =
      studentTypeFilter === 'all' ||
      (studentTypeFilter === 'etudiant' ? s.studentType === 'etudiant' : s.studentType !== 'etudiant');
    return matchesSearch && matchesClass && matchesType;
  });

  const totalTuitionExpected = students.reduce((acc, s) => acc + s.tuitionTotal, 0);
  const totalTuitionCollected = students.reduce((acc, s) => acc + s.tuitionPaid, 0);
  const collectionRate = totalTuitionExpected > 0 ? Math.round((totalTuitionCollected / totalTuitionExpected) * 100) : 0;
  const generalAverageGrade = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.averageGrade || 0), 0) / students.length).toFixed(1)
    : '0.0';
  const estimatedSuccessRate = students.length > 0
    ? Math.round((students.filter((s) => (s.averageGrade || 0) >= 10).length / students.length) * 100)
    : 0;

  // Compute bulletin stats
  const totalCoef = bulletinGrades.reduce((acc, g) => acc + g.coefficient, 0);
  const totalPoints = bulletinGrades.reduce(
    (acc, g) => acc + ((g.devoir1 + g.devoir2 + g.composition * 2) / 4) * g.coefficient,
    0
  );
  const overallAverage = (totalPoints / totalCoef).toFixed(2);

  // Export handlers
  const handleExportStudentBulletinCSV = () => {
    exportSingleStudentBulletinCSV(
      selectedStudentForBulletin,
      bulletinGrades,
      schoolName || "Lycée d'Excellence",
      '1er Trimestre 2024-2025'
    );
    showToast(`📊 Relevé de notes de ${selectedStudentForBulletin.firstName} ${selectedStudentForBulletin.lastName} exporté en CSV !`);
  };

  const handleExportStudentBulletinPDF = () => {
    const gradesRows = bulletinGrades
      .map((g) => {
        const avg = (g.devoir1 + g.devoir2 + g.composition * 2) / 4;
        const weighted = avg * g.coefficient;
        return `<tr>
          <td class="bold">${g.subject}<div style="font-size: 9px; color: #64748b; font-weight: normal;">${g.teacher}</div></td>
          <td class="text-center bold">${g.coefficient}</td>
          <td class="text-center">${g.devoir1}</td>
          <td class="text-center">${g.devoir2}</td>
          <td class="text-center bold">${g.composition}</td>
          <td class="text-center bold" style="color: #047857;">${avg.toFixed(2)}</td>
          <td class="text-center font-mono bold" style="color: #4338ca;">${weighted.toFixed(2)}</td>
          <td style="font-size: 10px; font-style: italic;">"${g.appreciation}"</td>
        </tr>`;
      })
      .join('');

    const bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; margin-bottom: 15px;">
        <div><span style="color: #64748b; font-size: 9.5px; text-transform: uppercase; display: block;">Nom & Prénom</span><strong>${selectedStudentForBulletin.firstName} ${selectedStudentForBulletin.lastName}</strong></div>
        <div><span style="color: #64748b; font-size: 9.5px; text-transform: uppercase; display: block;">Matricule National</span><strong style="font-family: monospace; color: #4338ca;">${selectedStudentForBulletin.matricule}</strong></div>
        <div><span style="color: #64748b; font-size: 9.5px; text-transform: uppercase; display: block;">Classe</span><strong style="color: #047857;">${selectedStudentForBulletin.classroom}</strong></div>
        <div><span style="color: #64748b; font-size: 9.5px; text-transform: uppercase; display: block;">Lieu de Naissance</span><span>${selectedStudentForBulletin.birthPlace}</span></div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Disciplines</th>
            <th class="text-center">Coef</th>
            <th class="text-center">Devoir 1</th>
            <th class="text-center">Devoir 2</th>
            <th class="text-center">Compo</th>
            <th class="text-center">Moy / 20</th>
            <th class="text-center">Total Coef</th>
            <th>Appréciations des Professeurs</th>
          </tr>
        </thead>
        <tbody>
          ${gradesRows}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td>TOTAUX & MOYENNE GÉNÉRALE</td>
            <td class="text-center">${totalCoef}</td>
            <td colspan="4" class="text-right">TOTAL POINTS PONDÉRÉS :</td>
            <td class="text-center font-mono" style="font-size: 13px; color: #4338ca;">${totalPoints.toFixed(2)}</td>
            <td>
              <span style="background: #059669; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">
                ${overallAverage} / 20
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 15px; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; font-family: Arial, sans-serif; font-size: 10.5px; background: #fafafa;">
        <div>
          <strong style="text-transform: uppercase; font-size: 9.5px; color: #475569; display: block; margin-bottom: 4px;">Bilan Pédagogique</strong>
          <div>Rang : <strong>2ème / 42 élèves</strong></div>
          <div>Tableau d'Honneur : <strong style="color: #047857;">Félicitations du Conseil</strong></div>
          <div>Assiduité : <strong>0 absence injustifiée</strong></div>
        </div>
        <div>
          <strong style="text-transform: uppercase; font-size: 9.5px; color: #475569; display: block; margin-bottom: 4px;">Visa du Professeur Principal</strong>
          <div style="margin-top: 25px; font-style: italic; color: #475569;">Signé & validé numériquement</div>
        </div>
        <div style="text-align: right;">
          <strong style="text-transform: uppercase; font-size: 9.5px; color: #475569; display: block; margin-bottom: 4px;">Le Chef d'Établissement</strong>
          <div style="margin-top: 25px; font-weight: bold;">Le Proviseur</div>
        </div>
      </div>
    `;

    generatePrintableReportWindow({
      title: `BULLETIN OFFICIEL DE NOTES DU 1ER TRIMESTRE - ANNÉE SCOLAIRE 2024-2025`,
      category: 'Bulletin',
      schoolName: schoolName || "Lycée d'Excellence",
      schoolCode: schoolCode || 'BZV-24-X8B',
      city: city || 'Brazzaville',
      bodyHtml,
    });
    showToast(`📥 Bulletin officiel de ${selectedStudentForBulletin.firstName} généré en PDF !`);
  };

  const handleExportClassPVCSV = () => {
    const classStudents = students.filter((s) => s.classroom === selectedStudentForBulletin.classroom);
    exportClassGradeSheetCSV(selectedStudentForBulletin.classroom, classStudents, schoolName || "Lycée d'Excellence");
    showToast(`📊 Procès-Verbal de ${selectedStudentForBulletin.classroom} exporté en CSV !`);
  };

  const handleExportClassPVPDF = () => {
    const classStudents = [...students.filter((s) => s.classroom === selectedStudentForBulletin.classroom)].sort(
      (a, b) => b.averageGrade - a.averageGrade
    );
    const studentRows = classStudents
      .map(
        (st, idx) => `<tr>
      <td class="text-center bold">${idx + 1}</td>
      <td class="font-mono bold" style="color: #4338ca;">${st.matricule}</td>
      <td class="bold">${st.lastName}</td>
      <td>${st.firstName}</td>
      <td class="text-center">${st.gender === 'M' ? 'Garçon' : 'Fille'}</td>
      <td class="text-center bold" style="color: #047857; font-size: 12px;">${st.averageGrade.toFixed(2)} / 20</td>
      <td>${
        st.averageGrade >= 16
          ? "Très Bien (Tableau d'Honneur)"
          : st.averageGrade >= 14
          ? 'Bien (Encouragements)'
          : st.averageGrade >= 12
          ? 'Assez Bien'
          : 'Passable'
      }</td>
      <td class="text-center">${st.tuitionPaid >= st.tuitionTotal ? 'Soldé' : 'En cours'}</td>
    </tr>`
      )
      .join('');

    const bodyHtml = `
      <div style="margin-bottom: 12px; font-size: 11px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif;">
        <strong>Classe :</strong> ${selectedStudentForBulletin.classroom} • <strong>Effectif :</strong> ${classStudents.length} élèves • <strong>Moyenne de classe :</strong> 14.8 / 20
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th class="text-center">Rang</th>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th class="text-center">Genre</th>
            <th class="text-center">Moyenne T1</th>
            <th>Mention du Conseil</th>
            <th class="text-center">Écolage</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>
    `;

    generatePrintableReportWindow({
      title: `PROCÈS-VERBAL DE DÉLIBÉRATION DU CONSEIL DE CLASSE - ${selectedStudentForBulletin.classroom.toUpperCase()}`,
      category: 'Procès-Verbal',
      schoolName: schoolName || "Lycée d'Excellence",
      schoolCode: schoolCode || 'BZV-24-X8B',
      city: city || 'Brazzaville',
      bodyHtml,
    });
    showToast(`📥 Procès-Verbal de ${selectedStudentForBulletin.classroom} généré en PDF !`);
  };

  const handleExportStudentsRegistryCSV = () => {
    exportStudentsRegistryCSV(students, schoolName || "Lycée d'Excellence", selectedClass);
    showToast(`📊 Registre des élèves (${selectedClass === 'all' ? 'Toutes classes' : selectedClass}) exporté en CSV !`);
  };

  const handleExportStudentsPDF = () => {
    const filtered = selectedClass === 'all' ? students : students.filter((s) => s.classroom === selectedClass);
    const studentRows = filtered
      .map(
        (s, idx) => `<tr>
      <td class="text-center bold">${idx + 1}</td>
      <td class="font-mono bold" style="color: #4338ca;">${s.matricule}</td>
      <td class="bold">${s.lastName} ${s.firstName}</td>
      <td class="text-center">${s.gender}</td>
      <td>${s.birthDate} (${s.birthPlace})</td>
      <td class="text-center bold" style="color: #047857;">${s.classroom}</td>
      <td style="font-family: monospace;">${s.parentPhone}</td>
      <td class="text-center" style="height: 25px; border-bottom: 1px dotted #94a3b8;"></td>
    </tr>`
      )
      .join('');

    const bodyHtml = `
      <div style="margin-bottom: 12px; font-size: 11px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif;">
        <strong>Filtre de classe :</strong> ${selectedClass === 'all' ? 'Toutes les classes' : selectedClass} • <strong>Total élèves inscrits :</strong> ${filtered.length}
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th class="text-center">N°</th>
            <th>Matricule</th>
            <th>Nom & Prénom</th>
            <th class="text-center">Sexe</th>
            <th>Date & Lieu Naissance</th>
            <th class="text-center">Classe</th>
            <th>Contact Parent</th>
            <th class="text-center" style="width: 120px;">Émargement / Visa</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>
    `;

    generatePrintableReportWindow({
      title: `REGISTRE OFFICIEL ET FEUILLE D'ÉMARGEMENT DES ÉLÈVES - ${selectedClass === 'all' ? "ENSEMBLE DE L'ÉTABLISSEMENT" : selectedClass.toUpperCase()}`,
      category: 'Registre',
      schoolName: schoolName || "Lycée d'Excellence",
      schoolCode: schoolCode || 'BZV-24-X8B',
      city: city || 'Brazzaville',
      bodyHtml,
    });
    showToast(`📥 Registre des élèves généré en PDF !`);
  };

  const handleExportFinanceCSV = () => {
    exportFinancialTransactionsCSV(payments, schoolName || "Lycée d'Excellence");
    showToast(`📊 Journal des encaissements et transactions exporté en CSV !`);
  };

  const handleExportFinancePDF = () => {
    const paymentRows = payments
      .map(
        (p) => `<tr>
      <td class="font-mono bold" style="color: #4338ca;">${p.reference}</td>
      <td>${p.date}</td>
      <td class="bold">${p.studentName}</td>
      <td class="text-center">${p.classroom}</td>
      <td>${p.month}</td>
      <td><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${p.paymentMethod}</span></td>
      <td class="text-right bold" style="color: #047857;">${p.amount.toLocaleString('fr-FR')} FCFA</td>
      <td class="text-center bold" style="color: #047857;">${p.status}</td>
    </tr>`
      )
      .join('');

    const bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; margin-bottom: 15px;">
        <div><strong>Total Recouvré :</strong> <span style="font-size: 14px; font-weight: bold; color: #047857;">${totalTuitionCollected.toLocaleString('fr-FR')} FCFA</span></div>
        <div><strong>Reste à Recouvrer :</strong> <span style="font-size: 14px; font-weight: bold; color: #b45309;">${(totalTuitionExpected - totalTuitionCollected).toLocaleString('fr-FR')} FCFA</span></div>
        <div><strong>Taux de Recouvrement :</strong> <span style="font-size: 14px; font-weight: bold; color: #4338ca;">${collectionRate}%</span></div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>N° Quittance</th>
            <th>Date</th>
            <th>Élève</th>
            <th class="text-center">Classe</th>
            <th>Mois Couvert</th>
            <th>Mode Règlement</th>
            <th class="text-right">Montant (FCFA)</th>
            <th class="text-center">Statut</th>
          </tr>
        </thead>
        <tbody>
          ${paymentRows}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td colspan="6" class="text-right">TOTAL ENCAISSÉ :</td>
            <td class="text-right" style="color: #047857; font-size: 13px;">${totalTuitionCollected.toLocaleString('fr-FR')} FCFA</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    `;

    generatePrintableReportWindow({
      title: `BILAN FINANCIER TRIMESTRIEL ET ÉCOLAGES MOBILE MONEY`,
      category: 'Finances',
      schoolName: schoolName || "Lycée d'Excellence",
      schoolCode: schoolCode || 'BZV-24-X8B',
      city: city || 'Brazzaville',
      bodyHtml,
    });
    showToast(`📥 Bilan financier généré en PDF !`);
  };

  const handleExportCertificatePDF = () => {
    const bodyHtml = `
      <div style="padding: 20px; font-size: 14px; line-height: 1.8;">
        <p>Je soussigné, <strong>Chef d'Établissement</strong> du <em>${schoolName || "Lycée d'Excellence"}</em>, atteste par la présente que :</p>
        
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; margin: 20px 0; font-family: Arial, sans-serif;">
          <div style="margin-bottom: 8px;">L'élève : <strong style="font-size: 16px; color: #0f172a;">${selectedStudentForBulletin.firstName} ${selectedStudentForBulletin.lastName}</strong></div>
          <div style="margin-bottom: 8px;">Né(e) le : <strong>${selectedStudentForBulletin.birthDate}</strong> à <strong>${selectedStudentForBulletin.birthPlace}</strong></div>
          <div style="margin-bottom: 8px;">Matricule National : <strong style="font-family: monospace; color: #4338ca;">${selectedStudentForBulletin.matricule}</strong></div>
          <div>Est régulièrement inscrit(e) dans notre établissement pour l'année scolaire <strong>2024 - 2025</strong> en classe de <strong style="color: #047857;">${selectedStudentForBulletin.classroom}</strong>.</div>
        </div>

        <p>En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.</p>
      </div>
    `;

    generatePrintableReportWindow({
      title: `CERTIFICAT DE SCOLARITÉ OFFICIEL`,
      category: 'Certificat',
      schoolName: schoolName || "Lycée d'Excellence",
      schoolCode: schoolCode || 'BZV-24-X8B',
      city: city || 'Brazzaville',
      bodyHtml,
    });
    showToast(`📥 Certificat de scolarité de ${selectedStudentForBulletin.firstName} généré en PDF !`);
  };

  const handleExportOverviewPDF = () => {
    const bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; margin-bottom: 15px;">
        <div><strong>Total Élèves :</strong> ${students.length}</div>
        <div><strong>Enseignants Actifs :</strong> ${teachers.length}</div>
        <div><strong>Taux Recouvrement :</strong> ${collectionRate}%</div>
        <div><strong>Moyenne Générale :</strong> 15.8 / 20</div>
      </div>
      <h4 style="font-family: Arial, sans-serif; text-transform: uppercase; font-size: 12px; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Répartition des Effectifs par Classe</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>Classe</th>
            <th class="text-center">Effectif</th>
            <th class="text-center">Garçons</th>
            <th class="text-center">Filles</th>
            <th class="text-center">Moyenne Classe</th>
            <th class="text-center">Taux Assiduité</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bold">Terminale D</td>
            <td class="text-center bold">42</td>
            <td class="text-center">22</td>
            <td class="text-center">20</td>
            <td class="text-center bold" style="color: #047857;">15.4 / 20</td>
            <td class="text-center font-mono">98.2%</td>
          </tr>
          <tr>
            <td class="bold">Terminale C</td>
            <td class="text-center bold">35</td>
            <td class="text-center">19</td>
            <td class="text-center">16</td>
            <td class="text-center bold" style="color: #047857;">16.1 / 20</td>
            <td class="text-center font-mono">97.8%</td>
          </tr>
          <tr>
            <td class="bold">Première D</td>
            <td class="text-center bold">45</td>
            <td class="text-center">23</td>
            <td class="text-center">22</td>
            <td class="text-center bold" style="color: #047857;">14.6 / 20</td>
            <td class="text-center font-mono">96.5%</td>
          </tr>
          <tr>
            <td class="bold">3ème A</td>
            <td class="text-center bold">48</td>
            <td class="text-center">24</td>
            <td class="text-center">24</td>
            <td class="text-center bold" style="color: #047857;">14.2 / 20</td>
            <td class="text-center font-mono">95.9%</td>
          </tr>
        </tbody>
      </table>
    `;

    generatePrintableReportWindow({
      title: `RAPPORT DE SYNTHÈSE GLOBALE DE L'ÉTABLISSEMENT - TRIMESTRE 1`,
      category: 'Rapport Synthèse',
      schoolName: schoolName || "Lycée d'Excellence",
      schoolCode: schoolCode || 'BZV-24-X8B',
      city: city || 'Brazzaville',
      bodyHtml,
    });
    showToast(`📥 Rapport de synthèse globale généré en PDF !`);
  };

  // Module Navigation Items
  const NAVIGATION_MODULES = [
    {
      group: "TABLEAU DE BORD",
      items: [
        {
          id: 'overview' as TabType,
          label: 'Vue Générale',
          shortLabel: 'Vue Générale',
          icon: 'dashboard',
          badge: 'Direct',
          badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          desc: 'Indicateurs clés & synthèse',
        },
      ],
    },
    {
      group: "PÉDAGOGIE & SCOLARITÉ",
      items: [
        {
          id: 'attendance' as TabType,
          label: 'Assiduité & Présences',
          shortLabel: 'Assiduité',
          icon: 'insights',
          badge: '97.2%',
          badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
          desc: 'Rapport DDEPSA & journal',
        },
        {
          id: 'students' as TabType,
          label: 'Effectif & Élèves',
          shortLabel: 'Élèves',
          icon: 'groups',
          badge: `${students.length}`,
          badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          desc: 'Registre & fiches élèves',
        },
        {
          id: 'bulletins' as TabType,
          label: 'Bulletins & Notes Congo',
          shortLabel: 'Bulletins',
          icon: 'assignment',
          badge: 'MEPPSA',
          badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          desc: 'Bulletins officiels & PV',
        },
      ],
    },
    {
      group: "COMMUNAUTÉ & RÉSEAU SOCIAL",
      items: [
        {
          id: 'social' as TabType,
          label: 'Réseau Social & Fil d\'Actu',
          shortLabel: 'Réseau Social',
          icon: 'forum',
          badge: 'Agora',
          badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          desc: 'Publications, sondages & vie scolaire',
        },
      ],
    },
    {
      group: "ADMINISTRATION & FINANCES",
      items: [
        {
          id: 'finance' as TabType,
          label: 'Écolage & Mobile Money',
          shortLabel: 'Finances',
          icon: 'account_balance_wallet',
          badge: 'MTN / Airtel',
          badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          desc: 'Recouvrement & quittances',
        },
        {
          id: 'staff' as TabType,
          label: 'Personnel & Enseignants',
          shortLabel: 'Personnel',
          icon: 'admin_panel_settings',
          badge: `${teachers.length}`,
          badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          desc: 'Comptes profs & accès',
        },
        {
          id: 'certificates' as TabType,
          label: 'Certificats & Documents',
          shortLabel: 'Certificats',
          icon: 'description',
          badge: 'A4 Officiel',
          badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
          desc: 'Attestations de scolarité',
        },
      ],
    },
  ];

  const currentGroup = NAVIGATION_MODULES.find((g) => g.items.some((item) => item.id === activeTab)) || NAVIGATION_MODULES[0];
  const currentModule = NAVIGATION_MODULES.flatMap((g) => g.items).find((item) => item.id === activeTab) || NAVIGATION_MODULES[0].items[0];
  const previousTabId = tabHistory.length > 0 ? tabHistory[tabHistory.length - 1] : (activeTab !== 'overview' ? 'overview' : null);
  const previousModule = previousTabId ? NAVIGATION_MODULES.flatMap((g) => g.items).find((item) => item.id === previousTabId) : null;

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-24 right-6 z-50 bg-emerald-500/90 backdrop-blur-xl text-slate-950 px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 font-semibold">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-sm">{successToast}</span>
        </div>
      )}

      {/* Main Outer Layout: ALWAYS VISIBLE SIDEBAR + CONTENT */}
      <div className="flex-1 flex w-full max-w-[1780px] mx-auto px-1 sm:px-3 lg:px-6 py-4 gap-3 sm:gap-5">
        
        {/* ======================================================== */}
        {/* PERMANENT, ALWAYS-VISIBLE LEFT SIDEBAR (ALL SCREEN SIZES) */}
        {/* ======================================================== */}
        <aside
          className={`shrink-0 transition-all duration-300 z-20 ${
            isMobileSidebarOpen
              ? 'w-64 sm:w-72 lg:w-72 xl:w-80'
              : 'w-16 sm:w-20 lg:w-72 xl:w-80'
          }`}
        >
          <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto bg-slate-950/70 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-2 sm:p-3 lg:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between custom-scrollbar">
            <div className="space-y-4 lg:space-y-6">
              
              {/* Sidebar Header & Toggle for Compact/Full View */}
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/30 shrink-0">
                      <span className="material-symbols-outlined text-[22px]">school</span>
                    </div>
                    <div className="min-w-0 flex-1 hidden lg:block">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {schoolName || "Lycée d'Excellence"}
                      </h2>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-emerald-400">location_on</span>
                        {city || 'Brazzaville'} • <span className="text-indigo-300 font-mono">{schoolCode || 'BZV-24-X8B'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Toggle button on small screens or manual collapse */}
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    title={isMobileSidebarOpen ? "Réduire la barre latérale" : "Agrandir la barre latérale"}
                    className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-300 border border-white/10 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isMobileSidebarOpen ? 'chevron_left' : 'chevron_right'}
                    </span>
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-white/10 hidden lg:flex items-center justify-between text-[10px]">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Agréé MEPPSA Congo
                  </span>
                  <span className="text-slate-400 font-mono">T1 2024-2025</span>
                </div>
              </div>

              {/* Action Buttons in Sidebar */}
              <div className={`grid gap-1.5 sm:gap-2 ${isMobileSidebarOpen ? 'grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  title="Inscrire un nouvel élève"
                  className="w-full py-2 px-1 sm:px-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[10px] sm:text-[11px] font-bold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-1 border border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  <span className={isMobileSidebarOpen ? 'inline' : 'hidden lg:inline'}>+ Inscrire</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(true)}
                  title="Encaisser les frais de scolarité"
                  className="w-full py-2 px-1 sm:px-2 bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40 border border-indigo-500/40 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1 backdrop-blur-md cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">payments</span>
                  <span className={isMobileSidebarOpen ? 'inline' : 'hidden lg:inline'}>Encaisser</span>
                </button>
              </div>

              {/* Navigation Modules (Grouped & Always Visible) */}
              <nav className="space-y-4" aria-label="Modules du logiciel">
                {NAVIGATION_MODULES.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <div className={`px-2 text-[9px] font-bold tracking-wider text-slate-400 uppercase ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                      {group.group}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigateToTab(item.id)}
                            title={`${item.label} - ${item.desc}`}
                            className={`w-full text-left p-2 sm:p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all cursor-pointer group relative ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
                                : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 justify-center lg:justify-start w-full lg:w-auto">
                              <div className="relative flex items-center justify-center">
                                <span
                                  className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                                    isActive
                                      ? 'text-emerald-400 font-variation-fill drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                      : 'text-slate-400 group-hover:text-emerald-300'
                                  }`}
                                >
                                  {item.icon}
                                </span>
                                {/* Dot indicator for active on compact mode */}
                                {isActive && (
                                  <span className={`lg:hidden absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 ${isMobileSidebarOpen ? 'hidden' : 'block'}`} />
                                )}
                              </div>

                              <div className={`truncate ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                                <div className={`truncate ${isActive ? 'font-bold text-white' : ''}`}>
                                  {item.label}
                                </div>
                                <div className="text-[9px] text-slate-400 truncate font-normal">
                                  {item.desc}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full border font-mono font-medium ${
                                isMobileSidebarOpen ? 'inline-block' : 'hidden lg:inline-block'
                              } ${
                                isActive
                                  ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                                  : item.badgeColor
                              }`}
                            >
                              {item.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Direct Quick Exports in Sidebar */}
              <div className={`pt-2 border-t border-white/10 ${isMobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="px-2 text-[9px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                  EXPORTS DIRECTS
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={handleExportOverviewPDF}
                    title="Télécharger le Rapport de Synthèse Trimestriel"
                    className="w-full text-left px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-semibold transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                      Bilan Synthèse PDF
                    </span>
                    <span className="material-symbols-outlined text-[13px]">download</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportStudentsRegistryCSV}
                    title="Télécharger le Registre Matricule des Élèves"
                    className="w-full text-left px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px]">csv</span>
                      Registre Élèves CSV
                    </span>
                    <span className="material-symbols-outlined text-[13px]">download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Footer: Connectivity & Logout */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              <div className={`px-2 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[10px] text-slate-400 ${isMobileSidebarOpen ? 'flex' : 'hidden lg:flex'}`}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En Ligne
                </span>
                <span className="font-mono text-[9px] text-slate-400">Sync Brazza</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter de la session"
                className="w-full py-1.5 sm:py-2 px-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span className={isMobileSidebarOpen ? 'inline' : 'hidden lg:inline'}>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN CONTENT AREA */}
        {/* ======================================================== */}
        <main className="flex-1 min-w-0 space-y-5">
          
          {/* Executive Header Banner with Breadcrumbs & Back Navigation */}
          <div className="bg-white/[0.04] backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-3.5">
            
            {/* Top Navigation & Interactive Breadcrumbs Bar */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 flex-wrap">
              {/* Back button & Breadcrumbs */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Back button */}
                {(activeTab !== 'overview' || tabHistory.length > 0) && (
                  <button
                    type="button"
                    onClick={handleGoBack}
                    title={previousModule ? `Retour à : ${previousModule.label}` : 'Retour au tableau de bord'}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.15)] group"
                  >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform text-emerald-400">
                      arrow_back
                    </span>
                    <span>Retour {previousModule ? `(${previousModule.shortLabel || previousModule.label})` : 'au menu'}</span>
                  </button>
                )}

                {/* Interactive Breadcrumbs Trail */}
                <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400" aria-label="Fil d'Ariane">
                  <button
                    type="button"
                    onClick={() => navigateToTab('overview')}
                    className={`flex items-center gap-1 hover:text-emerald-300 transition-colors cursor-pointer ${
                      activeTab === 'overview' ? 'text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-400">home</span>
                    <span>Tableau de bord</span>
                  </button>

                  {activeTab !== 'overview' && (
                    <>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-400 hidden sm:inline">{currentGroup.group}</span>
                      <span className="text-slate-600 hidden sm:inline">/</span>
                      <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {currentModule.label}
                      </span>
                    </>
                  )}
                </nav>
              </div>

              {/* History Quick Links if multiple tabs visited */}
              {tabHistory.length > 1 && (
                <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Consultés :</span>
                  {tabHistory.slice(-2).map((histTab) => {
                    const mod = NAVIGATION_MODULES.flatMap((g) => g.items).find((m) => m.id === histTab);
                    if (!mod) return null;
                    return (
                      <button
                        key={histTab}
                        type="button"
                        onClick={() => navigateToTab(histTab)}
                        className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px] text-emerald-400">{mod.icon}</span>
                        {mod.shortLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Title & Quick Actions Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pt-0.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] shrink-0">
                  <span className="material-symbols-outlined text-[26px]">{currentModule.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
                    <span>EduCongo</span>
                    <span>/</span>
                    <span className="text-emerald-400 font-semibold">{currentGroup.group}</span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                    {currentModule.label}
                  </h2>
                </div>
              </div>

              {/* Fast Quick Actions in Module Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAdminConfigModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Configurer l'Établissement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                  <span>Abonnement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  <span>Inscrire un Élève</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/40 border border-indigo-500/40 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  <span>Encaisser</span>
                </button>
              </div>
            </div>

            {/* Subscription Banner on School Dashboard */}
            <SubscriptionStatusBanner
              subscription={subscription}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            />

            {/* Profile / Role Selector Bar (RBAC System - Requirement 5) */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">account_circle</span>
                <span className="text-xs font-bold text-slate-300">Profil Actif :</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">(Simuler l'interface selon le profil)</span>
              </div>

              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {[
                  { id: 'admin', label: 'Proviseur / Admin', icon: 'shield_person' },
                  { id: 'enseignant', label: 'Enseignant', icon: 'cast_for_education' },
                  { id: 'comptable', label: 'Comptable (Caisse)', icon: 'payments' },
                  { id: 'secretaire', label: 'Secrétariat', icon: 'badge' },
                  { id: 'eleve', label: 'Élève / Étudiant', icon: 'school' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setActiveRole(r.id as any);
                      if (r.id === 'comptable') navigateToTab('finance');
                      if (r.id === 'secretaire') navigateToTab('students');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeRole === r.id
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/40'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* ==================== ROLE-SPECIFIC WORKSPACES ==================== */}
        {activeRole === 'enseignant' ? (
          <TeacherWorkspace
            schoolName={schoolName}
            schoolCode={schoolCode}
            cityName={city}
            students={students}
          />
        ) : activeRole === 'eleve' ? (
          <StudentWorkspace
            schoolName={schoolName}
            schoolCode={schoolCode}
            cityName={city}
            student={students[0] || {
              id: 'STU-001',
              matricule: 'CG-2024-001',
              firstName: 'Élève',
              lastName: 'Inscrit',
              gender: 'M',
              classroom: 'Terminale D',
              birthDate: '2006-04-12',
              birthPlace: city || 'Brazzaville',
              parentName: 'Parent / Tuteur Légal',
              parentPhone: '06 650 00 00',
              photoUrl: STUDENT_PHOTO_PRESETS[0].url,
              email: 'eleve@educongo.cg',
              bloodGroup: 'O+',
              address: city || 'Brazzaville',
              status: 'Inscrit',
              tuitionPaid: 0,
              tuitionTotal: 150000,
              averageGrade: 15.5,
            }}
          />
        ) : (
          <>
          {/* Empty School State Banner if no students registered yet (Requirement 3) */}
          {students.length === 0 && activeTab === 'overview' && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-indigo-950/40 border border-emerald-500/30 backdrop-blur-2xl text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <span className="material-symbols-outlined text-[36px]">rocket_launch</span>
              </div>
              <div className="max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Bienvenue dans l'espace de gestion de {schoolName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Ce compte d'établissement a été créé avec succès et est actuellement <strong>vierge de données</strong>. En tant qu'administrateur, vous pouvez configurer l'ensemble des modules selon l'organisation de votre école.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</div>
                  <h4 className="text-sm font-bold text-white">Inscrire des élèves</h4>
                  <p className="text-[11px] text-slate-400">Enregistrez vos effectifs avec génération automatique de matricule et carte QR.</p>
                  <button onClick={() => setIsAddStudentOpen(true)} className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">+ Inscrire un élève</button>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">2</div>
                  <h4 className="text-sm font-bold text-white">Personnel & Profs</h4>
                  <p className="text-[11px] text-slate-400">Ajoutez les enseignants titulaires et attribuez les accès aux carnets de notes.</p>
                  <button onClick={() => navigateToTab('staff')} className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">Gérer le personnel</button>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</div>
                  <h4 className="text-sm font-bold text-white">Grille d'Écolage</h4>
                  <p className="text-[11px] text-slate-400">Enregistrez les versements MTN Mobile Money, Airtel Money ou espèces.</p>
                  <button onClick={() => setIsNewPaymentOpen(true)} className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">+ Encaisser</button>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">4</div>
                  <h4 className="text-sm font-bold text-white">Vie Scolaire & Fil</h4>
                  <p className="text-[11px] text-slate-400">Publiez des annonces officielles, sondages et consignes pour votre communauté.</p>
                  <button onClick={() => navigateToTab('social')} className="text-xs text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer">Fil d'actualité</button>
                </div>
              </div>
            </div>
          )}
          
        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-emerald-400/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Élèves Inscrits
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{students.length}</div>
                <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +12% vs année passée
                </div>
              </div>

              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Enseignants Actifs
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">co_present</span>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{teachers.length}</div>
                <div className="mt-2 text-xs text-slate-400">
                  100% des matières couvertes
                </div>
              </div>

              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-amber-400/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recouvrement Scolarité
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{collectionRate}%</div>
                <div className="mt-2 text-xs text-slate-400 font-medium">
                  {totalTuitionCollected.toLocaleString('fr-FR')} / {totalTuitionExpected.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-teal-400/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Moyenne Générale
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">star</span>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{generalAverageGrade} / 20</div>
                <div className="mt-2 text-xs text-teal-400 font-medium">
                  Taux de réussite estimé : {estimatedSuccessRate}%
                </div>
              </div>
            </div>

            {/* Attendance Chart Data Visualization (Recharts) */}
            <AttendanceChart schoolName={schoolName} cityName={city} schoolCode={schoolCode} studentsCount={students.length} />

            {/* Middle Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Students */}
              <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[20px]">person</span>
                    Dernières Inscriptions & Fiches Élèves
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateToTab('students')}
                    className="text-xs text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Voir tout ({students.length})</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-medium">
                        <th className="pb-3">Matricule</th>
                        <th className="pb-3">Nom & Prénom</th>
                        <th className="pb-3">Classe</th>
                        <th className="pb-3">Parent / Contact</th>
                        <th className="pb-3">Statut Écolage</th>
                        <th className="pb-3 text-right">Moyenne</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {students.slice(0, 5).map((st) => (
                        <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-3 font-mono font-semibold text-indigo-300">{st.matricule}</td>
                          <td className="py-3 font-bold text-slate-100">{st.firstName} {st.lastName}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-medium">
                              {st.classroom}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{st.parentPhone}</td>
                          <td className="py-3">
                            {st.tuitionPaid >= st.tuitionTotal ? (
                              <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                                Soldé
                              </span>
                            ) : (
                              <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
                                {((st.tuitionPaid / st.tuitionTotal) * 100).toFixed(0)}% réglé
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right font-bold text-slate-100">
                            {st.averageGrade} / 20
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            {/* Quick Actions & Official Congolese Modules */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-600/30 via-teal-600/20 to-emerald-950/40 backdrop-blur-xl border border-emerald-500/30 text-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-yellow-300">verified</span>
                    <h4 className="font-bold text-sm">Système Éducatif Congolais</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 font-light">
                    Générez et exportez les bulletins officiels conformes aux directives de l'Inspection Générale de Brazzaville et Pointe-Noire (MEPPSA).
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('bulletins')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Consulter les Bulletins
                    </button>
                    <button
                      type="button"
                      onClick={handleExportOverviewPDF}
                      title="Exporter le Rapport de Synthèse Trimestriel en PDF"
                      className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      Bilan Global PDF
                    </button>
                  </div>
                </div>

                <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400 text-[18px]">bolt</span>
                      Accès & Exports Rapides
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      PDF / CSV
                    </span>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleExportStudentsRegistryCSV}
                      className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-between text-xs group cursor-pointer"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-emerald-300 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-400 text-[16px]">csv</span>
                        Exporter le Registre des Élèves (CSV)
                      </span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-300 text-[16px]">download</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportFinanceCSV}
                      className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-between text-xs group cursor-pointer"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-emerald-300 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-400 text-[16px]">receipt_long</span>
                        Exporter le Journal des Paiements (CSV)
                      </span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-300 text-[16px]">download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('staff')}
                      className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-between text-xs group cursor-pointer"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-emerald-300">Gérer les Comptes Enseignants</span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-300 text-[16px]">arrow_forward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('certificates')}
                      className="w-full text-left p-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all flex items-center justify-between text-xs group cursor-pointer"
                    >
                      <span className="font-medium text-slate-300 group-hover:text-emerald-300">Imprimer Certificat de Scolarité</span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-300 text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: ATTENDANCE (FULL VIEW) ==================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">how_to_reg</span>
                  Module d'Assiduité & Registre Quotidien MEPPSA
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Suivi journalier de l'assiduité des apprenants pour le mois en cours ({city || 'Brazzaville'} - Année scolaire 2024-2025).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast("Fiche d'appel du jour synchronisée avec succès !")}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Faire l'Appel du Jour
                </button>
              </div>
            </div>

            <AttendanceChart schoolName={schoolName} cityName={city} schoolCode={schoolCode} studentsCount={students.length} />
          </div>
        )}

        {/* ==================== TAB: STUDENTS ==================== */}
        {activeTab === 'students' && (
          <div className="space-y-5">
            {/* Header controls & filters */}
            <div className="bg-white/[0.04] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-3.5">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search & Class filter */}
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative flex-1 min-w-[220px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher par nom, matricule, classe, parent..."
                      className="w-full pl-9 pr-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
                    />
                  </div>

                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border border-white/15 rounded-xl text-xs text-slate-200 focus:border-emerald-400 outline-none bg-slate-900 cursor-pointer"
                  >
                    <option value="all">Toutes les classes / filières</option>
                    <option value="Terminale D">Terminale D</option>
                    <option value="Terminale C">Terminale C</option>
                    <option value="Première D">Première D</option>
                    <option value="3ème A">3ème A</option>
                    <option value="Licence 2 Informatique & Systèmes">Licence 2 Info</option>
                    <option value="Master 1 Gestion Financière & Audit">Master 1 Gestion</option>
                  </select>

                  {/* Student Type Selector Tabs */}
                  <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setStudentTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        studentTypeFilter === 'all'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tous ({students.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentTypeFilter('eleve')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        studentTypeFilter === 'eleve'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Élèves ({students.filter((s) => s.studentType !== 'etudiant').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentTypeFilter('etudiant')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        studentTypeFilter === 'etudiant'
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Étudiants ({students.filter((s) => s.studentType === 'etudiant').length})
                    </button>
                  </div>
                </div>

                {/* Right Actions & Layout Switch */}
                <div className="flex items-center gap-2">
                  {/* Layout switch: Grid (default) vs Table */}
                  <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setStudentViewLayout('grid')}
                      title="Affichage Cartes / Grille (Recommandé)"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        studentViewLayout === 'grid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudentViewLayout('table')}
                      title="Affichage Tableau"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        studentViewLayout === 'table'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">table_rows</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportStudentsPDF}
                    title="Exporter la liste d'émargement / appel en PDF"
                    className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                    <span className="hidden sm:inline">PDF Émargement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewStudent({
                        firstName: '',
                        lastName: '',
                        gender: 'M',
                        studentType: studentTypeFilter === 'etudiant' ? 'etudiant' : 'eleve',
                        birthDate: '',
                        birthPlace: '',
                        classroom: '',
                        parentName: '',
                        parentPhone: '',
                        photoUrl: '',
                        email: '',
                        bloodGroup: '',
                        address: '',
                        tuitionTotal: 0,
                      });
                      setIsAddStudentOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Inscrire un Apprenant</span>
                  </button>
                </div>
              </div>

              {/* Informative counter banner */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Affichage de <strong className="text-white font-bold">{filteredStudents.length}</strong> apprenant(s) trouvé(s) • Format prioritaire : <span className="text-emerald-400 font-semibold">{studentViewLayout === 'grid' ? 'Grille / Cartes avec Photos & QR' : 'Tableau Synthétique'}</span>
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Génération automatique de cartes scolaires avec codes QR instantanés
                </span>
              </div>
            </div>

            {/* ================= VIEW 1: GRID / CARD LAYOUT (DEFAULT) ================= */}
            {studentViewLayout === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((st) => {
                  const isEtudiant = st.studentType === 'etudiant';
                  const tuitionPercent = Math.min(100, Math.round((st.tuitionPaid / (st.tuitionTotal || 1)) * 100));

                  return (
                    <div
                      key={st.id}
                      className={`backdrop-blur-xl p-5 rounded-3xl border transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between group hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] ${
                        isEtudiant
                          ? 'bg-gradient-to-b from-indigo-950/30 to-slate-900/60 border-indigo-500/25 hover:border-indigo-400/50'
                          : 'bg-white/[0.04] border-white/10 hover:border-emerald-400/40'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Top Card Header: Photo, Name, Badges */}
                        <div className="flex items-start gap-3.5">
                          <div className="relative shrink-0">
                            {st.photoUrl ? (
                              <img
                                src={st.photoUrl}
                                alt={`${st.firstName} ${st.lastName}`}
                                className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-md bg-slate-800 ${
                                  isEtudiant ? 'border-indigo-400/60 shadow-indigo-500/20' : 'border-emerald-400/60 shadow-emerald-500/20'
                                }`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = STUDENT_PHOTO_PRESETS[0].url;
                                }}
                              />
                            ) : (
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl text-white border ${
                                isEtudiant
                                  ? 'bg-gradient-to-br from-indigo-600 to-slate-800 border-indigo-400/40'
                                  : 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-400/40'
                              }`}>
                                {st.firstName.charAt(0)}
                              </div>
                            )}

                            <span
                              className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md font-bold text-[9px] border shadow ${
                                st.gender === 'M'
                                  ? 'bg-blue-500 text-white border-blue-400'
                                  : 'bg-pink-500 text-white border-pink-400'
                              }`}
                            >
                              {st.gender === 'M' ? 'M' : 'F'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border uppercase tracking-wider ${
                                isEtudiant
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {isEtudiant ? 'Étudiant MESRS' : 'Élève MEPPSA'}
                              </span>

                              {st.bloodGroup && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[9.5px] font-bold">
                                  {st.bloodGroup}
                                </span>
                              )}
                            </div>

                            <h4 className="font-extrabold text-white text-base leading-tight truncate">
                              {st.lastName.toUpperCase()} {st.firstName}
                            </h4>

                            <div className="font-mono text-[11px] font-bold text-indigo-300 mt-0.5">
                              {st.matricule}
                            </div>
                          </div>
                        </div>

                        {/* Class & Academic Info */}
                        <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Classe / Filière :</span>
                            <span className="font-bold text-emerald-300 text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                              {st.classroom}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Date de naissance :</span>
                            <span className="text-slate-200">{st.birthDate} ({st.birthPlace})</span>
                          </div>

                          {st.averageGrade && (
                            <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-white/5">
                              <span className="text-slate-400">Moyenne Générale :</span>
                              <span className="font-bold text-amber-400 text-xs">
                                {st.averageGrade} / 20
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Parent / Contact Details */}
                        <div className="space-y-1 text-xs text-slate-300 bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-slate-500">person</span>
                              Tuteur :
                            </span>
                            <span className="font-medium text-slate-200 truncate max-w-[150px]">{st.parentName}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-emerald-400">phone</span>
                              Contact :
                            </span>
                            <span className="font-mono text-slate-200 text-[10.5px]">{st.parentPhone}</span>
                          </div>

                          {st.address && (
                            <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5 truncate">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px] text-slate-500">home</span>
                                Domicile :
                              </span>
                              <span className="truncate max-w-[150px]">{st.address}</span>
                            </div>
                          )}
                        </div>

                        {/* Tuition & Financial progress */}
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Scolarité / Écolage :</span>
                            <span className="font-semibold text-slate-200 font-mono">
                              {st.tuitionPaid.toLocaleString('fr-FR')} / {st.tuitionTotal.toLocaleString('fr-FR')} FCFA ({tuitionPercent}%)
                            </span>
                          </div>
                          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${
                                tuitionPercent >= 100
                                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                                  : tuitionPercent >= 50
                                  ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]'
                                  : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                              }`}
                              style={{ width: `${tuitionPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons Footer */}
                      <div className="pt-4 mt-3 border-t border-white/10 flex flex-col gap-2">
                        {/* Primary QR Code Card Button */}
                        <button
                          type="button"
                          onClick={() => setIdCardModalState({ isOpen: true, student: st })}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                            isEtudiant
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/40 shadow-indigo-600/20'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/30 shadow-emerald-600/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                          <span>{isEtudiant ? "Carte d'Étudiant QR" : "Carte Scolaire QR"}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForBulletin(st);
                              navigateToTab('bulletins');
                            }}
                            className="flex-1 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                          >
                            <span className="material-symbols-outlined text-[15px] text-emerald-400">assignment</span>
                            <span>Bulletin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForBulletin(st);
                              navigateToTab('certificates');
                            }}
                            className="flex-1 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                          >
                            <span className="material-symbols-outlined text-[15px] text-indigo-400">description</span>
                            <span>Certificat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= VIEW 2: TABLE VIEW ================= */}
            {studentViewLayout === 'table' && (
              <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.06] border-b border-white/10 text-slate-300 font-semibold">
                    <tr>
                      <th className="p-3.5">Photo & Matricule</th>
                      <th className="p-3.5">Nom et Prénom</th>
                      <th className="p-3.5">Type & Sexe</th>
                      <th className="p-3.5">Date & Lieu de Naissance</th>
                      <th className="p-3.5">Classe / Filière</th>
                      <th className="p-3.5">Parent / Contact</th>
                      <th className="p-3.5">Écolage</th>
                      <th className="p-3.5 text-right">Actions & Carte QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.photoUrl || STUDENT_PHOTO_PRESETS[0].url}
                              alt={st.firstName}
                              className="w-9 h-9 rounded-xl object-cover border border-emerald-400/40 bg-slate-800 shrink-0"
                            />
                            <span className="font-mono font-bold text-indigo-300 text-[11px]">{st.matricule}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-100">{st.lastName.toUpperCase()} {st.firstName}</div>
                          {st.email && <div className="text-[10px] text-slate-400">{st.email}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                              st.studentType === 'etudiant' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {st.studentType === 'etudiant' ? 'Étudiant' : 'Élève'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${st.gender === 'M' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-pink-500/15 text-pink-300 border border-pink-500/30'}`}>
                              {st.gender === 'M' ? 'Masculin' : 'Féminin'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {st.birthDate} ({st.birthPlace})
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {st.classroom}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">
                          <div className="text-slate-200">{st.parentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.parentPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">
                            {st.tuitionPaid.toLocaleString('fr-FR')} / {st.tuitionTotal.toLocaleString('fr-FR')} FCFA
                          </div>
                          <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                              style={{ width: `${Math.min(100, (st.tuitionPaid / st.tuitionTotal) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => setIdCardModalState({ isOpen: true, student: st })}
                            title="Générer la Carte Scolaire / Étudiant avec Code QR"
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                            <span className="text-[11px] font-semibold">Carte QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForBulletin(st);
                              navigateToTab('bulletins');
                            }}
                            title="Voir le Bulletin Officiel"
                            className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/15 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForBulletin(st);
                              navigateToTab('certificates');
                            }}
                            title="Certificat de Scolarité"
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: BULLETIN OFFICIEL CONGO ==================== */}
        {activeTab === 'bulletins' && (
          <div className="space-y-6">
            {/* Quick Navigation Strip inside Bulletin View */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateToTab('students')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">arrow_back</span>
                  <span>Revenir à l'annuaire des Élèves</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('overview')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-400">home</span>
                  <span>Tableau de bord</span>
                </button>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">
                Module <span className="text-emerald-400 font-semibold">Notes & Bulletins Officiels (MEPPSA Congo)</span>
              </div>
            </div>

            {/* Student Switcher and Complete Export Toolbar for Bulletin */}
            <div className="bg-white/[0.04] backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <span className="text-xs font-semibold text-slate-300">Élève sélectionné :</span>
                <select
                  value={selectedStudentForBulletin.matricule}
                  onChange={(e) => {
                    const found = students.find((s) => s.matricule === e.target.value);
                    if (found) setSelectedStudentForBulletin(found);
                  }}
                  className="px-3 py-1.5 border border-white/15 rounded-xl text-xs font-medium text-slate-200 outline-none bg-slate-900/80 cursor-pointer min-w-[240px]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.matricule}>
                      {s.firstName} {s.lastName} ({s.classroom} - {s.matricule})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Moyenne : {selectedStudentForBulletin.averageGrade} / 20
                </span>
              </div>

              {/* Action and Export Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleExportStudentBulletinPDF}
                  title="Exporter le Bulletin Officiel en PDF conforme MEPPSA"
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Bulletin PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportStudentBulletinCSV}
                  title="Exporter le relevé de notes individuel en CSV"
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <span className="material-symbols-outlined text-[16px]">csv</span>
                  <span>Relevé CSV</span>
                </button>

                <div className="h-6 w-[1px] bg-white/20 hidden sm:block mx-1"></div>

                <button
                  type="button"
                  onClick={handleExportClassPVCSV}
                  title="Exporter le Procès-Verbal de Délibération de la Classe en CSV"
                  className="px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  <span>PV Classe (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportClassPVPDF}
                  title="Exporter le Procès-Verbal de Délibération de la Classe en PDF"
                  className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>PV Classe (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            {/* Official Congolese Report Card Paper (Printable) */}
            <div className="bg-white/[0.06] backdrop-blur-2xl p-6 sm:p-10 rounded-3xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.4)] max-w-[900px] mx-auto text-slate-100 font-sans print:bg-white print:text-black print:border-none print:shadow-none">
              {/* Header Republic of Congo */}
              <div className="flex justify-between items-start border-b-2 border-white/20 print:border-slate-800 pb-4 mb-6 text-center">
                <div className="text-left w-1/3">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-slate-200 print:text-slate-700">
                    RÉPUBLIQUE DU CONGO
                  </div>
                  <div className="text-[9px] italic text-slate-400 print:text-slate-500">Unité - Travail - Progrès</div>
                  <div className="text-[10px] font-semibold text-slate-300 print:text-slate-600 mt-2">
                    MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION (MEPPSA)
                  </div>
                  <div className="text-[10px] text-slate-400 print:text-slate-600">
                    Direction Départementale de l'Éducation ({city || 'Brazzaville'})
                  </div>
                </div>

                <div className="w-1/3 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 p-1 mb-1 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <span className="material-symbols-outlined text-emerald-400 text-[28px]">school</span>
                  </div>
                  <div className="font-bold text-sm uppercase text-emerald-300 print:text-emerald-700">
                    {schoolName || "Lycée d'Excellence"}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">Code : {schoolCode}</div>
                </div>

                <div className="text-right w-1/3">
                  <div className="text-[11px] font-bold text-slate-200 print:text-slate-700 uppercase">
                    ANNÉE SCOLAIRE 2024 - 2025
                  </div>
                  <div className="inline-block mt-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/40 uppercase">
                    BULLETIN DU 1ER TRIMESTRE
                  </div>
                </div>
              </div>

              {/* Student Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10 text-xs mb-6 backdrop-blur-md">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Nom & Prénom</span>
                  <strong className="text-white font-bold">{selectedStudentForBulletin.firstName} {selectedStudentForBulletin.lastName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Matricule National</span>
                  <strong className="font-mono text-indigo-300">{selectedStudentForBulletin.matricule}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Classe</span>
                  <strong className="text-emerald-300 font-bold">{selectedStudentForBulletin.classroom}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Lieu de Naissance</span>
                  <span className="text-slate-300">{selectedStudentForBulletin.birthPlace}</span>
                </div>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border border-white/15">
                  <thead className="bg-white/[0.08] border-b border-white/15 text-slate-200 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-r border-white/10">Disciplines</th>
                      <th className="p-2 border-r border-white/10 text-center">Coef</th>
                      <th className="p-2 border-r border-white/10 text-center">Devoir 1</th>
                      <th className="p-2 border-r border-white/10 text-center">Devoir 2</th>
                      <th className="p-2 border-r border-white/10 text-center">Composition</th>
                      <th className="p-2 border-r border-white/10 text-center">Moy / 20</th>
                      <th className="p-2 border-r border-white/10 text-center">Total Coef</th>
                      <th className="p-2">Appréciations des Professeurs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {bulletinGrades.map((g, idx) => {
                      const subjectAvg = ((g.devoir1 + g.devoir2 + g.composition * 2) / 4);
                      const weighted = subjectAvg * g.coefficient;
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-2 border-r border-white/10 font-semibold text-slate-100">
                            {g.subject}
                            <span className="block text-[9px] text-slate-400 font-normal">{g.teacher}</span>
                          </td>
                          <td className="p-2 border-r border-white/10 text-center font-bold">{g.coefficient}</td>
                          <td className="p-2 border-r border-white/10 text-center text-slate-300">{g.devoir1}</td>
                          <td className="p-2 border-r border-white/10 text-center text-slate-300">{g.devoir2}</td>
                          <td className="p-2 border-r border-white/10 text-center font-semibold text-white">{g.composition}</td>
                          <td className="p-2 border-r border-white/10 text-center font-bold text-emerald-400">
                            {subjectAvg.toFixed(2)}
                          </td>
                          <td className="p-2 border-r border-white/10 text-center font-mono font-bold text-indigo-300">
                            {weighted.toFixed(2)}
                          </td>
                          <td className="p-2 text-slate-300 text-[11px] italic">
                            "{g.appreciation}"
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-white/[0.08] font-bold text-xs border-t-2 border-white/20">
                    <tr>
                      <td className="p-2.5 uppercase">Totaux & Moyenne Générale</td>
                      <td className="p-2.5 text-center text-white">{totalCoef}</td>
                      <td colSpan={4} className="p-2.5 text-right uppercase text-slate-300">
                        Total Points Pondérés :
                      </td>
                      <td className="p-2.5 text-center font-mono text-base text-indigo-300">
                        {totalPoints.toFixed(2)}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-xs">Moyenne Trimestre :</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                            {overallAverage} / 20
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Council Deliberation & Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-white/15 rounded-2xl p-4 text-xs bg-white/[0.02]">
                <div>
                  <h5 className="font-bold uppercase text-slate-300 text-[10px] mb-1">
                    Bilan Pédagogique
                  </h5>
                  <div className="space-y-1 text-slate-400">
                    <p>Rang : <strong className="text-slate-200">2ème / 42 élèves</strong></p>
                    <p>Tableau d'Honneur : <strong className="text-emerald-400">Félicitations du Conseil</strong></p>
                    <p>Absences injustifiées : <strong className="text-slate-200">0 heure</strong></p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold uppercase text-slate-300 text-[10px] mb-1">
                    Visa du Professeur Principal
                  </h5>
                  <div className="h-16 flex items-end">
                    <span className="italic text-slate-400 text-[11px]">Signé numériquement</span>
                  </div>
                </div>

                <div className="text-right">
                  <h5 className="font-bold uppercase text-slate-300 text-[10px] mb-1">
                    Le Chef d'Établissement / Proviseur
                  </h5>
                  <div className="h-16 flex flex-col justify-end items-end">
                    <div className="w-16 h-16 border border-dashed border-emerald-400/40 rounded-full flex items-center justify-center text-[9px] text-emerald-400 font-bold uppercase rotate-12">
                      Sceau Officiel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: FINANCE & MOBILE MONEY ==================== */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Recouvré</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {totalTuitionCollected.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-xs text-slate-400 mt-1">Sur l'ensemble des classes</div>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <span className="text-xs text-slate-400 uppercase font-semibold">Reste à Recouvrer</span>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {(totalTuitionExpected - totalTuitionCollected).toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-xs text-slate-400 mt-1">Échéances Novembre / Décembre</div>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Passerelles Actives</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-bold">MTN MoMo Congo</span>
                    <span className="px-2.5 py-1 bg-red-500/15 text-red-300 border border-red-500/30 rounded-full text-xs font-bold">Airtel Money CG</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(true)}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  + Enregistrer un encaissement
                </button>
              </div>
            </div>

            {/* Payments Log */}
            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
              <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">receipt_long</span>
                  Historique des Transactions et Quittances
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportFinancePDF}
                    title="Exporter le bilan financier en PDF"
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
                    <span>Bilan PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportFinanceCSV}
                    title="Exporter le journal des quittances en CSV / Excel"
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">csv</span>
                    <span>Grand Livre (CSV)</span>
                  </button>
                </div>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.06] text-slate-300 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Référence</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Élève</th>
                    <th className="p-3.5">Classe</th>
                    <th className="p-3.5">Mois</th>
                    <th className="p-3.5">Moyen de Paiement</th>
                    <th className="p-3.5 text-right">Montant (FCFA)</th>
                    <th className="p-3.5 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-indigo-300">{p.reference}</td>
                      <td className="p-3.5 text-slate-400">{p.date}</td>
                      <td className="p-3.5 font-bold text-slate-100">{p.studentName}</td>
                      <td className="p-3.5 text-slate-300">{p.classroom}</td>
                      <td className="p-3.5 text-slate-300">{p.month}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.paymentMethod.includes('MTN')
                            ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30'
                            : p.paymentMethod.includes('Airtel')
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : 'bg-white/10 text-slate-200 border border-white/10'
                        }`}>
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-100">
                        {p.amount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB: STAFF & TEACHER ACCOUNTS ==================== */}
        {activeTab === 'staff' && (
          <StaffAccountManager
            schoolName={schoolName}
            schoolCode={schoolCode}
            cityName={city}
            showToast={showToast}
          />
        )}

        {/* ==================== TAB: SOCIAL NETWORK & AGORA ==================== */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <SchoolSocialFeed
              schoolName={schoolName}
              schoolCode={schoolCode}
              currentUser={{
                id: 'ADM-001',
                name: 'Direction de l\'Établissement',
                role: 'admin',
                avatarUrl: logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              }}
              onOpenSubdomainView={onOpenSubdomainView}
            />
          </div>
        )}

        {/* ==================== TAB: CERTIFICATES ==================== */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 max-w-[800px] mx-auto">
            {/* Quick Navigation Strip inside Certificates View */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateToTab('students')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">arrow_back</span>
                  <span>Revenir aux Élèves</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('overview')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-400">home</span>
                  <span>Tableau de bord</span>
                </button>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">
                Module <span className="text-indigo-400 font-semibold">Certificats & Attestations</span>
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Générateur d'Attestations et Certificats de Scolarité
                </div>
                <div className="text-[11px] text-slate-400">
                  Élève concerné : <strong className="text-emerald-300">{selectedStudentForBulletin.firstName} {selectedStudentForBulletin.lastName}</strong> ({selectedStudentForBulletin.classroom})
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCertificatePDF}
                  title="Générer et exporter le certificat certifié en PDF"
                  className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>Exporter en PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-1.5 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            <div className="bg-white/[0.06] backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.4)] text-slate-100 font-serif leading-relaxed print:bg-white print:text-black">
              <div className="text-center mb-8 border-b pb-6 border-white/15">
                <div className="font-sans font-bold text-xs uppercase text-slate-300 tracking-wider">
                  RÉPUBLIQUE DU CONGO
                </div>
                <div className="font-sans text-[10px] italic text-slate-400 mb-2">Unité - Travail - Progrès</div>
                <div className="font-sans text-xs font-semibold uppercase text-slate-200">
                  MINISTÈRE DE L'ENSEIGNEMENT PRÉSCOLAIRE, PRIMAIRE, SECONDAIRE ET DE L'ALPHABÉTISATION
                </div>
                <div className="font-sans text-sm font-bold text-emerald-400 mt-2 uppercase">
                  {schoolName || "Lycée d'Excellence"}
                </div>
                <div className="font-sans text-[11px] text-slate-400 font-mono">Code Établissement : {schoolCode}</div>
              </div>

              <h2 className="text-center text-xl sm:text-2xl font-bold uppercase tracking-widest text-white mb-8 underline decoration-emerald-400 decoration-2 underline-offset-8">
                CERTIFICAT DE SCOLARITÉ
              </h2>

              <div className="space-y-4 text-sm text-justify text-slate-200">
                <p>
                  Je soussigné, <strong>Chef d'Établissement</strong> du <em>{schoolName || "Lycée d'Excellence"}</em>, atteste par la présente que :
                </p>

                <div className="my-4 p-4 bg-white/[0.03] rounded-2xl border border-white/10 font-sans text-xs space-y-1.5 text-slate-200 backdrop-blur-md">
                  <p>L'élève : <strong className="text-white">{selectedStudentForBulletin.firstName} {selectedStudentForBulletin.lastName}</strong></p>
                  <p>Né(e) le : <strong className="text-white">{selectedStudentForBulletin.birthDate}</strong> à <strong className="text-white">{selectedStudentForBulletin.birthPlace}</strong></p>
                  <p>Matricule National : <strong className="font-mono text-indigo-300">{selectedStudentForBulletin.matricule}</strong></p>
                  <p>Est régulièrement inscrit(e) dans notre établissement pour l'année scolaire <strong>2024 - 2025</strong> en classe de <strong className="text-emerald-300">{selectedStudentForBulletin.classroom}</strong>.</p>
                </div>

                <p>
                  En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.
                </p>
              </div>

              <div className="mt-12 pt-6 flex justify-between items-end font-sans text-xs">
                <div>
                  <p className="text-slate-300">Fait à {city || 'Brazzaville'}, le {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-center">
                  <p className="font-bold uppercase text-slate-200">Le Chef d'Établissement</p>
                  <div className="w-24 h-24 mt-2 border-2 border-dashed border-emerald-400/40 rounded-full flex items-center justify-center text-[10px] text-emerald-400 font-bold uppercase rotate-6 mx-auto">
                    Cachet & Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </main>
      </div>

      {/* ==================== MODAL: ADD STUDENT ==================== */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">person_add</span>
                  {newStudent.studentType === 'etudiant' ? "Créer un Compte Étudiant (MESRS)" : "Inscrire un Élève (MEPPSA)"}
                </h3>
                <p className="text-xs text-slate-400">
                  Enregistrement complet avec photo d'identité & carte scolaire QR automatique
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              {/* Type selector: Élève vs Étudiant */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Type d'apprenant / Ordre d'enseignement *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setNewStudent({
                        ...newStudent,
                        studentType: 'eleve',
                        classroom: 'Terminale D',
                        tuitionTotal: 150000,
                      })
                    }
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newStudent.studentType === 'eleve'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      Élève (MEPPSA)
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Collège / Lycée Général & Technique</div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setNewStudent({
                        ...newStudent,
                        studentType: 'etudiant',
                        classroom: 'Licence 2 Informatique & Systèmes',
                        tuitionTotal: 350000,
                      })
                    }
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      newStudent.studentType === 'etudiant'
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                      Étudiant (MESRS)
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">Université / Institut Supérieur / BTS</div>
                  </button>
                </div>
              </div>

              {/* Photo selector */}
              <div className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/10 space-y-2.5">
                <label className="block font-semibold text-slate-200">
                  Photo d'identité pour la carte scolaire & dossier *
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={newStudent.photoUrl || STUDENT_PHOTO_PRESETS[0].url}
                    alt="Aperçu Photo"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-md bg-slate-800 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-[11px] text-slate-400 block mb-1">Choisir parmi les portraits prédéfinis :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {STUDENT_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewStudent({ ...newStudent, photoUrl: preset.url })}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            newStudent.photoUrl === preset.url
                              ? 'border-emerald-400 scale-110 shadow-sm'
                              : 'border-white/20 opacity-70 hover:opacity-100'
                          }`}
                          title={preset.label}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    value={newStudent.photoUrl}
                    onChange={(e) => setNewStudent({ ...newStudent, photoUrl: e.target.value })}
                    placeholder="Ou collez l'URL d'une photo personnalisée..."
                    className="w-full px-3 py-1.5 border border-white/15 rounded-xl text-[11px] bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    placeholder="Ex: Destin"
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Nom de famille *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    placeholder="Ex: MOUKASSA"
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Gender & Classroom/Filière */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Genre</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'M' | 'F' })}
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs outline-none bg-slate-900 text-slate-200"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    {newStudent.studentType === 'etudiant' ? "Filière / Niveau" : "Classe d'affectation"}
                  </label>
                  <select
                    value={newStudent.classroom}
                    onChange={(e) => setNewStudent({ ...newStudent, classroom: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs outline-none bg-slate-900 text-slate-200"
                  >
                    <option value="" disabled className="text-slate-400">
                      {newStudent.studentType === 'etudiant' ? 'Sélectionner la filière' : 'Sélectionner la classe'}
                    </option>
                    {newStudent.studentType === 'etudiant' ? (
                      <>
                        <option value="Licence 1 Informatique">Licence 1 Informatique</option>
                        <option value="Licence 2 Informatique & Systèmes">Licence 2 Informatique & Systèmes</option>
                        <option value="Licence 3 Génie Logiciel">Licence 3 Génie Logiciel</option>
                        <option value="Master 1 Gestion Financière & Audit">Master 1 Gestion Financière</option>
                        <option value="Master 2 Management & Stratégie">Master 2 Management & Stratégie</option>
                        <option value="BTS Comptabilité & Gestion">BTS Comptabilité & Gestion</option>
                      </>
                    ) : (
                      <>
                        <option value="Terminale D">Terminale D (Scientifique)</option>
                        <option value="Terminale C">Terminale C (Maths/Physique)</option>
                        <option value="Terminale A4">Terminale A4 (Littéraire)</option>
                        <option value="Première D">Première D</option>
                        <option value="Première C">Première C</option>
                        <option value="3ème A">3ème A (BEPC)</option>
                        <option value="6ème">6ème</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Birth & Blood Group */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={newStudent.birthDate}
                    onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Lieu de naissance</label>
                  <input
                    type="text"
                    value={newStudent.birthPlace}
                    onChange={(e) => setNewStudent({ ...newStudent, birthPlace: e.target.value })}
                    placeholder="Brazzaville, Pointe-Noire..."
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Groupe Sanguin</label>
                  <select
                    value={newStudent.bloodGroup}
                    onChange={(e) => setNewStudent({ ...newStudent, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs outline-none bg-slate-900 text-slate-200"
                  >
                    <option value="" disabled className="text-slate-400">
                      Choisir
                    </option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>

              {/* Email & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Courriel de l'apprenant</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="prenom.nom@educongo.cg"
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Adresse / Quartier</label>
                  <input
                    type="text"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    placeholder="Ex: Bacongo, Brazzaville"
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Parent & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Nom du Parent / Tuteur Légal</label>
                  <input
                    type="text"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    placeholder="Prénom Nom"
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Téléphone Parent (+242)</label>
                  <input
                    type="tel"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    placeholder="+242 06 000 00 00"
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md font-mono"
                  />
                </div>
              </div>

              {/* Tuition Fees total */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Frais annuels de scolarité (FCFA)</label>
                <input
                  type="number"
                  step={5000}
                  value={newStudent.tuitionTotal}
                  onChange={(e) => setNewStudent({ ...newStudent, tuitionTotal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md font-mono"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  <span>Inscrire & Générer Carte QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: STUDENT ID CARD & QR CODE ==================== */}
      <StudentIdCardModal
        isOpen={idCardModalState.isOpen}
        onClose={() => setIdCardModalState({ isOpen: false, student: null })}
        student={idCardModalState.student}
        schoolName={schoolName}
        schoolCode={schoolCode}
        slogan={slogan}
        logoUrl={logoUrl}
        city={city}
        onUpdateStudentPhoto={(id, newPhotoUrl) => {
          setStudents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, photoUrl: newPhotoUrl } : s))
          );
          if (idCardModalState.student && idCardModalState.student.id === id) {
            setIdCardModalState((prev) => ({
              ...prev,
              student: prev.student ? { ...prev.student, photoUrl: newPhotoUrl } : null,
            }));
          }
        }}
      />

      {/* ==================== MODAL: NEW PAYMENT (EXIGENCE 5) ==================== */}
      {isNewPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/15 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">
                    Encaissement Scolarité & Mobile Money
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sélection par Cycle, Classe et Période (Mois / Trimestre)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPaymentOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
              {/* Filter Row: Cycle & Classe (Exigence 5) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">filter_alt</span>
                  Filtrer l'élève par Cycle & Classe
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cycle */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      1. Cycle d'enseignement
                    </label>
                    <select
                      value={paymentCycle}
                      onChange={(e) => {
                        setPaymentCycle(e.target.value as any);
                        setPaymentClass('all');
                      }}
                      className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs outline-none bg-slate-900 text-slate-200"
                    >
                      <option value="all">Tous les cycles</option>
                      <option value="primaire">Primaire (CP1 - CM2)</option>
                      <option value="college">Collège (6ème - 3ème)</option>
                      <option value="lycee">Lycée Général (2nde - Tle)</option>
                      <option value="superieur">Enseignement Supérieur / CFP</option>
                    </select>
                  </div>

                  {/* Classe */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      2. Classe concernée
                    </label>
                    <select
                      value={paymentClass}
                      onChange={(e) => setPaymentClass(e.target.value)}
                      className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs outline-none bg-slate-900 text-slate-200"
                    >
                      <option value="all">Toutes les classes</option>
                      {paymentCycle === 'primaire' && (
                        <>
                          <option value="CP1">CP1</option>
                          <option value="CP2">CP2</option>
                          <option value="CE1">CE1</option>
                          <option value="CE2">CE2</option>
                          <option value="CM1">CM1</option>
                          <option value="CM2">CM2</option>
                        </>
                      )}
                      {paymentCycle === 'college' && (
                        <>
                          <option value="6ème">6ème</option>
                          <option value="5ème">5ème</option>
                          <option value="4ème">4ème</option>
                          <option value="3ème A">3ème A (BEPC)</option>
                        </>
                      )}
                      {paymentCycle === 'lycee' && (
                        <>
                          <option value="Première C">Première C</option>
                          <option value="Première D">Première D</option>
                          <option value="Terminale C">Terminale C</option>
                          <option value="Terminale D">Terminale D</option>
                          <option value="Terminale A4">Terminale A4</option>
                        </>
                      )}
                      {paymentCycle === 'superieur' && (
                        <>
                          <option value="Licence 1 Informatique">Licence 1</option>
                          <option value="Licence 2 Informatique & Systèmes">Licence 2</option>
                          <option value="Licence 3 Génie Logiciel">Licence 3</option>
                          <option value="BTS Comptabilité & Gestion">BTS Comptabilité</option>
                        </>
                      )}
                      {paymentCycle === 'all' && (
                        <>
                          <option value="CM2">CM2 (Primaire)</option>
                          <option value="3ème A">3ème A (Collège)</option>
                          <option value="Terminale D">Terminale D (Lycée)</option>
                          <option value="Terminale C">Terminale C (Lycée)</option>
                          <option value="Première D">Première D (Lycée)</option>
                          <option value="Licence 2 Informatique & Systèmes">Licence 2 (Supérieur)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Nom de l'élève (Exigence 5) */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    3. Nom de l'élève *
                  </label>
                  <select
                    value={newPayment.studentMatricule}
                    onChange={(e) => setNewPayment({ ...newPayment, studentMatricule: e.target.value })}
                    className="w-full px-3 py-2 border border-emerald-400/40 rounded-xl text-xs outline-none bg-slate-900 text-white font-medium focus:ring-1 focus:ring-emerald-400"
                  >
                    {students
                      .filter((s) => {
                        if (paymentClass !== 'all' && s.classroom !== paymentClass) return false;
                        if (paymentCycle === 'primaire' && !/CP|CE|CM/i.test(s.classroom)) return false;
                        if (paymentCycle === 'college' && !/6ème|5ème|4ème|3ème/i.test(s.classroom)) return false;
                        if (paymentCycle === 'lycee' && !/2nde|1ère|Terminale|Première/i.test(s.classroom)) return false;
                        if (paymentCycle === 'superieur' && !/Licence|Master|BTS/i.test(s.classroom) && s.studentType !== 'etudiant') return false;
                        return true;
                      })
                      .map((s) => (
                        <option key={s.id} value={s.matricule}>
                          {s.lastName.toUpperCase()} {s.firstName} • {s.classroom} ({s.matricule}) — Solde: {s.tuitionTotal - s.tuitionPaid} FCFA
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Période: Mois ou Trimestre (Exigence 5) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Période d'Écolage *
                  </label>
                  <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/10 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentPeriodMode('mois');
                        setNewPayment({ ...newPayment, month: 'Novembre 2024' });
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        paymentPeriodMode === 'mois' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Par Mois
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentPeriodMode('trimestre');
                        setNewPayment({ ...newPayment, month: '1er Trimestre Complet' });
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        paymentPeriodMode === 'trimestre' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Par Trimestre
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {paymentPeriodMode === 'mois' ? 'Sélection du Mois' : 'Sélection du Trimestre'}
                    </label>
                    <select
                      value={newPayment.month}
                      onChange={(e) => setNewPayment({ ...newPayment, month: e.target.value })}
                      className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs outline-none bg-slate-900 text-slate-200"
                    >
                      {paymentPeriodMode === 'mois' ? (
                        <>
                          <option value="Octobre 2024">Octobre 2024</option>
                          <option value="Novembre 2024">Novembre 2024</option>
                          <option value="Décembre 2024">Décembre 2024</option>
                          <option value="Janvier 2025">Janvier 2025</option>
                          <option value="Février 2025">Février 2025</option>
                          <option value="Mars 2025">Mars 2025</option>
                          <option value="Avril 2025">Avril 2025</option>
                          <option value="Mai 2025">Mai 2025</option>
                          <option value="Juin 2025">Juin 2025</option>
                        </>
                      ) : (
                        <>
                          <option value="1er Trimestre Complet">1er Trimestre Complet (Oct-Déc)</option>
                          <option value="2ème Trimestre Complet">2ème Trimestre Complet (Jan-Mar)</option>
                          <option value="3ème Trimestre Complet">3ème Trimestre Complet (Avr-Juin)</option>
                          <option value="Frais Annuels Globaux">Année Complète (Forfait Global)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Montant à encaisser (FCFA) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-white/[0.05] text-white focus:border-emerald-400 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Mode de règlement */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Mode de Paiement Authentifié</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPayment({ ...newPayment, paymentMethod: 'MTN Mobile Money' })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      newPayment.paymentMethod === 'MTN Mobile Money'
                        ? 'border-yellow-400/50 bg-yellow-500/20 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>MTN MoMo</span>
                    <span className="text-[10px] font-bold bg-yellow-400 text-slate-950 px-1 rounded">242</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPayment({ ...newPayment, paymentMethod: 'Airtel Money' })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      newPayment.paymentMethod === 'Airtel Money'
                        ? 'border-red-400/50 bg-red-500/20 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>Airtel Money</span>
                    <span className="text-[10px] font-bold bg-red-500 text-white px-1 rounded">242</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPayment({ ...newPayment, paymentMethod: 'Espèces' })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      newPayment.paymentMethod === 'Espèces'
                        ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    Espèces (Caisse)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPayment({ ...newPayment, paymentMethod: 'Virement BGFI' })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      newPayment.paymentMethod === 'Virement BGFI'
                        ? 'border-blue-400/50 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    Virement Bancaire
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentOpen(false)}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  Valider et Générer Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Admin Configuration Modal */}
      {isAdminConfigModalOpen && (
        <SchoolAdminConfigModal
          isOpen={isAdminConfigModalOpen}
          onClose={() => {
            setIsAdminConfigModalOpen(false);
            const fresh = getSchoolData(schoolCode);
            setStudents(fresh.students || []);
            setTeachers(fresh.teachers || []);
            setPayments(fresh.payments || []);
            setSubscription(getSchoolSubscription(schoolCode));
          }}
          schoolAccount={
            getRegisteredAccounts().find((a) => a.schoolCode === schoolCode) || {
              id: 'SCH-DEFAULT',
              schoolName: schoolName,
              schoolCode: schoolCode,
              city: city,
              department: 'Brazzaville',
              arrondissement: 'Centre',
              slogan: slogan,
              directorName: 'Directeur Général',
              adminFullName: 'Administrateur',
              workPhone: '+242 06 000 00 00',
              workEmail: 'direction@educongo.cg',
              schoolType: 'lycee',
              passwordHash: '',
              status: 'Actif',
              isEmailVerified: true,
              registeredAt: new Date().toISOString(),
              documents: {},
            }
          }
          onSchoolUpdated={(updated) => {
            setSchoolName(updated.schoolName);
            setCity(updated.city);
            setSlogan(updated.slogan || '');
            setLogoUrl(updated.logoUrl || logoUrl);
          }}
          showToast={showToast}
        />
      )}

      {/* School Subscription Modal */}
      {isSubscriptionModalOpen && (
        <SchoolSubscriptionModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => {
            setIsSubscriptionModalOpen(false);
            setSubscription(getSchoolSubscription(schoolCode));
          }}
          schoolName={schoolName}
          schoolCode={schoolCode}
          city={city}
          onSubscriptionUpdated={(updated) => setSubscription(updated)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

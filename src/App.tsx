import React, { useState, useEffect } from 'react';
import { AuthViewMode, AppScreen, SchoolRegistrationData, SystemNotification, Student, StaffAccount, AdminDocument } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LeftHeroPanel } from './components/Auth/LeftHeroPanel';
import { LoginCard } from './components/Auth/LoginCard';
import { RegisterStep1 } from './components/Auth/RegisterStep1';
import { RegisterStep2 } from './components/Auth/RegisterStep2';
import { RegisterStep3 } from './components/Auth/RegisterStep3';
import { RegisterSuccess } from './components/Auth/RegisterSuccess';
import { SchoolDashboard } from './components/Dashboard/SchoolDashboard';
import { SchoolSubdomainView } from './components/Social/SchoolSubdomainView';
import { DevControlPanel } from './components/DevControlPanel/DevControlPanel';
import { DemoQuickSwitcher } from './components/Common/DemoQuickSwitcher';
import { ForgotPasswordModal } from './components/Modals/ForgotPasswordModal';
import { AboutModal, HelpModal } from './components/Modals/AboutModal';
import { NotificationDetailModal } from './components/Modals/NotificationDetailModal';
import { DocumentViewerModal } from './components/Modals/DocumentViewerModal';
import { StudentQuickViewModal } from './components/Modals/StudentQuickViewModal';
import { StaffAccessCardModal } from './components/Dashboard/StaffAccessCardModal';
import { OfflineAlertBanner } from './components/Common/OfflineAlertBanner';
import { ToastNotification } from './components/Common/ToastNotification';
import { useNotifications } from './hooks/useNotifications';

const EMPTY_REGISTRATION_DATA: SchoolRegistrationData = {
  schoolName: '',
  codeFormat: 'departement',
  schoolCode: '',
  schoolType: '',
  department: '',
  city: '',
  arrondissement: '',
  directorName: '',
  adminRole: '',
  adminFullName: '',
  workEmail: '',
  personalEmail: '',
  workPhone: '',
  personalPhone: '',
  slogan: '',
  logoUrl: '',
  subdomain: '',
  documents: {
    agrementFile: null,
    statutsFile: null,
    identityFile: null,
  },
};

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('auth');
  const [authMode, setAuthMode] = useState<AuthViewMode>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Active school data (for dashboard and forms)
  const [currentSchool, setCurrentSchool] = useState({
    name: "Lycée d'Excellence de Brazzaville",
    city: 'Brazzaville',
    code: 'BZV-24-X8B',
    slogan: 'Travail - Rigueur - Réussite',
    logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
    subdomain: 'lycee-excellence',
  });

  // Global search navigation & selected items
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<AdminDocument | null>(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStaffForCard, setSelectedStaffForCard] = useState<StaffAccount | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'attendance' | 'students' | 'bulletins' | 'finance' | 'staff' | 'certificates' | 'social'>('overview');
  const [dashboardStudent, setDashboardStudent] = useState<Student | null>(null);

  // Simulated notifications system hook
  const {
    notifications,
    unreadCount,
    activeToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    triggerSimulatedNotification,
    resetToDefault,
    isAutoSimulate,
    setIsAutoSimulate,
    soundEnabled,
    setSoundEnabled,
  } = useNotifications();

  // Selected notification for detail modal
  const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);

  // Registration wizard form state - strictly empty for genuine registration
  const [registrationData, setRegistrationData] = useState<SchoolRegistrationData>(EMPTY_REGISTRATION_DATA);

  // Clear any old drafts from previous versions to guarantee clean slate
  useEffect(() => {
    try {
      localStorage.removeItem('educongo_registration_draft');
      localStorage.removeItem('educongo_registration_draft_v2');
      localStorage.removeItem('educongo_registration_draft_v3');
    } catch {}
  }, []);

  // Modals visibility
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const handleRegistrationChange = (field: keyof SchoolRegistrationData, value: any) => {
    setRegistrationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoginSuccess = (info?: { name: string; city: string; code: string; slogan?: string; logoUrl?: string; subdomain?: string }) => {
    if (info) {
      setCurrentSchool({
        name: info.name,
        city: info.city,
        code: info.code,
        slogan: info.slogan || 'Discipline - Travail - Succès',
        logoUrl: info.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
        subdomain: info.subdomain || 'lycee-brazza',
      });
    }
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('auth');
    setAuthMode('login');
  };

  const handleApproveSchoolFromNotif = (schoolName: string) => {
    setCurrentSchool({
      name: schoolName,
      city: 'Brazzaville',
      code: 'BZV-24-DSN',
      slogan: 'Excellence & Intégrité',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
      subdomain: 'ecole-brazza',
    });
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  // Search selection handlers
  const handleSelectStudentFromSearch = (student: Student) => {
    setSelectedStudentForView(student);
  };

  const handleSelectStaffFromSearch = (staff: StaffAccount) => {
    setSelectedStaffForCard(staff);
  };

  const handleSelectDocumentFromSearch = (doc: AdminDocument) => {
    setSelectedDocForViewer(doc);
  };

  const handleJumpToBulletin = (student: Student) => {
    setDashboardStudent(student);
    setDashboardTab('bulletins');
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleJumpToCertificate = (student: Student) => {
    setDashboardStudent(student);
    setDashboardTab('certificates');
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-[#f8fafc] font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Frosted Glass Mesh & Glow Layers */}
      <div className="mesh-bg"></div>
      <div className="glow-1"></div>
      <div className="glow-2"></div>
      <div className="glow-3"></div>

      {/* Universal Top Header with Global Search & Notification Center */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        isLoggedIn={isLoggedIn}
        schoolName={currentSchool.name}
        onLogout={handleLogout}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenDevPanel={() => setCurrentScreen('dev_panel')}
        // Global search handlers
        onSelectStudent={handleSelectStudentFromSearch}
        onSelectStaff={handleSelectStaffFromSearch}
        onSelectDocument={handleSelectDocumentFromSearch}
        // Notifications props
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
        onClearAllNotifications={clearAllNotifications}
        onResetDefaultNotifications={resetToDefault}
        onTriggerSimulation={triggerSimulatedNotification}
        onSelectNotification={(notif) => setSelectedNotification(notif)}
        isAutoSimulate={isAutoSimulate}
        onToggleAutoSimulate={() => setIsAutoSimulate(!isAutoSimulate)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Toast Notification Alert (Top-Right Pop-in) */}
      <ToastNotification
        notification={activeToast}
        onDismiss={dismissToast}
        onClick={(notif) => {
          markAsRead(notif.id);
          setSelectedNotification(notif);
          dismissToast();
        }}
      />

      {/* Connectivity Alert Banner */}
      <div className="pt-3">
        <OfflineAlertBanner />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {currentScreen === 'dev_panel' ? (
          <DevControlPanel
            onBackToApp={() => setCurrentScreen(isLoggedIn ? 'dashboard' : 'auth')}
            onImpersonateSchool={(sch) => {
              setCurrentSchool({
                name: sch.schoolName,
                city: sch.city,
                code: sch.schoolCode,
                slogan: sch.slogan || 'Discipline - Travail - Succès',
                logoUrl: sch.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
                subdomain: sch.subdomain || 'mon-ecole',
              });
              setIsLoggedIn(true);
              setCurrentScreen('dashboard');
            }}
            onOpenPortal={(sch) => {
              setCurrentSchool({
                name: sch.schoolName,
                city: sch.city,
                code: sch.schoolCode,
                slogan: sch.slogan || 'Discipline - Travail - Succès',
                logoUrl: sch.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
                subdomain: sch.subdomain || 'mon-ecole',
              });
              setCurrentScreen('subdomain_portal');
            }}
          />
        ) : currentScreen === 'subdomain_portal' ? (
          <SchoolSubdomainView
            schoolName={currentSchool.name}
            schoolCode={currentSchool.code}
            city={currentSchool.city}
            slogan={currentSchool.slogan}
            logoUrl={currentSchool.logoUrl}
            subdomain={currentSchool.subdomain}
            onBackToDashboard={() => setCurrentScreen(isLoggedIn ? 'dashboard' : 'auth')}
          />
        ) : currentScreen === 'dashboard' ? (
          <SchoolDashboard
            schoolName={currentSchool.name}
            schoolCode={currentSchool.code}
            city={currentSchool.city}
            slogan={currentSchool.slogan}
            logoUrl={currentSchool.logoUrl}
            subdomain={currentSchool.subdomain}
            onLogout={handleLogout}
            onOpenSubdomainView={() => setCurrentScreen('subdomain_portal')}
            externalSelectedTab={dashboardTab}
            externalSelectedStudent={dashboardStudent}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-8 px-4 sm:px-6">
            <div className="w-full max-w-[1280px] mx-auto">
              {/* Split Screen Auth Layout */}
              <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-12 min-h-[580px]">
                {/* Left Photo & Branding Hero Banner */}
                <LeftHeroPanel variant={authMode === 'login' ? 'login' : 'register'} />

                {/* Right Form Card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-4">
                  {authMode === 'login' && (
                    <LoginCard
                      onSwitchToRegister={() => {
                        setRegistrationData(EMPTY_REGISTRATION_DATA);
                        setAuthMode('register_step1');
                      }}
                      onLoginSuccess={handleLoginSuccess}
                      onForgotPassword={() => setIsForgotModalOpen(true)}
                    />
                  )}

                  {authMode === 'register_step1' && (
                    <RegisterStep1
                      formData={registrationData}
                      onChange={handleRegistrationChange}
                      onNext={() => setAuthMode('register_step2')}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}

                  {authMode === 'register_step2' && (
                    <RegisterStep2
                      formData={registrationData}
                      onChange={handleRegistrationChange}
                      onNext={() => setAuthMode('register_step3')}
                      onBack={() => setAuthMode('register_step1')}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}

                  {authMode === 'register_step3' && (
                    <RegisterStep3
                      formData={registrationData}
                      onChange={handleRegistrationChange}
                      onSubmit={() => setAuthMode('register_success')}
                      onBack={() => setAuthMode('register_step2')}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}

                  {authMode === 'register_success' && (
                    <RegisterSuccess
                      formData={registrationData}
                      onReturnHome={() => setAuthMode('login')}
                      onEnterDashboard={() => {
                        setCurrentSchool({
                          name: registrationData.schoolName || "Lycée Savorgnan de Brazza",
                          city: registrationData.city || 'Brazzaville',
                          code: registrationData.schoolCode || 'CONGO-24-X8B',
                          slogan: registrationData.slogan || 'Discipline - Travail - Succès',
                          logoUrl: registrationData.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
                          subdomain: registrationData.subdomain || 'lycee-brazza',
                        });
                        setIsLoggedIn(true);
                        setCurrentScreen('dashboard');
                      }}
                      onOpenPortal={() => {
                        setCurrentSchool({
                          name: registrationData.schoolName || "Lycée Savorgnan de Brazza",
                          city: registrationData.city || 'Brazzaville',
                          code: registrationData.schoolCode || 'CONGO-24-X8B',
                          slogan: registrationData.slogan || 'Discipline - Travail - Succès',
                          logoUrl: registrationData.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
                          subdomain: registrationData.subdomain || 'lycee-brazza',
                        });
                        setCurrentScreen('subdomain_portal');
                      }}
                      onOpenHelp={() => setIsHelpModalOpen(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Universal Footer */}
      <Footer
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
      
      {/* Notification Inspection & Action Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        onApproveSchool={handleApproveSchoolFromNotif}
      />

      {/* Global Search - Administrative Document Preview Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedDocForViewer)}
        onClose={() => setSelectedDocForViewer(null)}
        document={selectedDocForViewer}
        schoolName={currentSchool.name}
        schoolCode={currentSchool.code}
        city={currentSchool.city}
      />

      {/* Global Search - Student Quick View Modal */}
      <StudentQuickViewModal
        isOpen={Boolean(selectedStudentForView)}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
        onViewBulletin={handleJumpToBulletin}
        onGenerateCertificate={handleJumpToCertificate}
      />

      {/* Global Search - Staff Access Card Modal */}
      <StaffAccessCardModal
        isOpen={Boolean(selectedStaffForCard)}
        onClose={() => setSelectedStaffForCard(null)}
        staff={selectedStaffForCard}
        schoolName={currentSchool.name}
        schoolCode={currentSchool.code}
        slogan={currentSchool.slogan}
        logoUrl={currentSchool.logoUrl}
        city={currentSchool.city}
      />

      {/* Floating Demo & Developer Quick Switcher */}
      <DemoQuickSwitcher
        onSelectSchool={(sch) => {
          setCurrentSchool({
            name: sch.name,
            city: sch.city,
            code: sch.code,
            slogan: sch.slogan || 'Discipline - Travail - Succès',
            logoUrl: sch.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
            subdomain: sch.subdomain || 'mon-ecole',
          });
          setIsLoggedIn(true);
          setCurrentScreen('dashboard');
        }}
        onOpenDevPanel={() => {
          setCurrentScreen('dev_panel');
        }}
        onOpenPortal={(sch) => {
          if (sch) {
            setCurrentSchool({
              name: sch.name,
              city: sch.city,
              code: sch.code,
              slogan: sch.slogan || 'Discipline - Travail - Succès',
              logoUrl: sch.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
              subdomain: sch.subdomain || 'mon-ecole',
            });
          }
          setCurrentScreen('subdomain_portal');
        }}
        onFillRegistrationForm={(sampleData) => {
          setRegistrationData(sampleData);
          setCurrentScreen('auth');
          setAuthMode('register_step1');
        }}
        onNavigateScreen={(scr) => {
          setCurrentScreen(scr);
          if (scr === 'dashboard') {
            setIsLoggedIn(true);
          }
        }}
      />
    </div>
  );
}
export default App;

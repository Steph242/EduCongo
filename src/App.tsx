import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthViewMode, AppScreen, SchoolRegistrationData, SystemNotification, Student, StaffAccount, AdminDocument } from './types';
import { supabase } from './lib/supabase';
import { getRegisteredAccounts, saveRegisteredAccount, markAccountEmailVerified } from './services/accountService';
import { verifyDeveloperCredentials } from './services/devAccountService';
import { isEmailAlreadyVerified } from './services/supabase';
import { Footer } from './components/Footer';
import { LeftHeroPanel } from './components/Auth/LeftHeroPanel';
import { LoginCard } from './components/Auth/LoginCard';
import { RegisterCard } from './components/Auth/RegisterCard';
import { EmailVerificationCard } from './components/Auth/EmailVerificationCard';
import { RegisterSuccess } from './components/Auth/RegisterSuccess';
import { SchoolDashboard } from './components/Dashboard/SchoolDashboard';
import { SchoolSubdomainView } from './components/Social/SchoolSubdomainView';
import { DevControlPanel } from './components/DevControlPanel/DevControlPanel';
import { ForgotPasswordModal } from './components/Modals/ForgotPasswordModal';
import { AboutModal, HelpModal } from './components/Modals/AboutModal';
import { NotificationDetailModal } from './components/Modals/NotificationDetailModal';
import { DocumentViewerModal } from './components/Modals/DocumentViewerModal';
import { StudentQuickViewModal } from './components/Modals/StudentQuickViewModal';
import { StaffAccessCardModal } from './components/Dashboard/StaffAccessCardModal';
import { DevAuthModal } from './components/DevControlPanel/DevAuthModal';
import { ToastNotification } from './components/Common/ToastNotification';
import { useNotifications } from './hooks/useNotifications';
import { syncAllCloudData } from './services/cloudSyncService';

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

// Session persistence helpers
const getSavedSession = () => {
  try {
    const raw = localStorage.getItem('educongo_active_session_v3');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export function App() {
  const savedSession = useMemo(() => getSavedSession(), []);

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    if (savedSession?.isLoggedIn && savedSession?.currentScreen) {
      return savedSession.currentScreen;
    }
    return 'auth';
  });
  const [authMode, setAuthMode] = useState<AuthViewMode>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(savedSession?.isLoggedIn);
  });

  // Active school data (for dashboard and forms)
  const [currentSchool, setCurrentSchool] = useState(() => {
    if (savedSession?.currentSchool?.name) {
      return savedSession.currentSchool;
    }
    return {
      name: '',
      city: '',
      code: '',
      slogan: 'Discipline - Travail - Succès',
      logoUrl: '',
      subdomain: '',
    };
  });

  // Global search navigation & selected items
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<AdminDocument | null>(null);
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [selectedStaffForCard, setSelectedStaffForCard] = useState<StaffAccount | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'attendance' | 'students' | 'bulletins' | 'finance' | 'staff' | 'certificates' | 'social'>(() => {
    return savedSession?.dashboardTab || 'overview';
  });
  const [dashboardStudent, setDashboardStudent] = useState<Student | null>(null);

  // Modals visibility
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDevAuthModalOpen, setIsDevAuthModalOpen] = useState(false);
  const [isDevAuthenticated, setIsDevAuthenticated] = useState<boolean>(() => {
    return Boolean(savedSession?.isDevAuthenticated);
  });
  const [isDevImpersonating, setIsDevImpersonating] = useState(false);

  // Registration wizard form state
  const [registrationData, setRegistrationData] = useState<SchoolRegistrationData>(EMPTY_REGISTRATION_DATA);

  // Sync URL hash with current screen/state (Address bar routing)
  const updateUrlHash = useCallback((screen: AppScreen, mode: AuthViewMode, schoolCode?: string, isDev?: boolean) => {
    try {
      let targetHash = '#/login';
      if (screen === 'dev_panel' && isDev) {
        targetHash = '#/developer';
      } else if (screen === 'dashboard') {
        targetHash = schoolCode ? `#/dashboard?school=${schoolCode}` : '#/dashboard';
      } else if (screen === 'subdomain_portal') {
        targetHash = currentSchool.subdomain ? `#/portal?school=${currentSchool.subdomain}` : '#/portal';
      } else if (screen === 'auth') {
        if (mode === 'register_step1' || mode === 'register_step2' || mode === 'register_step3' || mode === 'register_success') {
          targetHash = '#/register';
        } else if (mode === 'verify_email') {
          targetHash = '#/verify-email';
        } else {
          targetHash = '#/login';
        }
      }
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    } catch {}
  }, [currentSchool.subdomain]);

  // Sync data with Supabase Cloud on mount
  useEffect(() => {
    syncAllCloudData().catch((err) => {
      console.warn('Initial cloud sync notice:', err);
    });
  }, []);

  // Save active session to localStorage & update URL hash
  useEffect(() => {
    if (isLoggedIn && (currentScreen === 'dashboard' || currentScreen === 'dev_panel' || currentScreen === 'subdomain_portal')) {
      try {
        localStorage.setItem(
          'educongo_active_session_v3',
          JSON.stringify({
            isLoggedIn: true,
            currentScreen,
            isDevAuthenticated,
            currentSchool,
            dashboardTab,
          })
        );
      } catch {}
    }
    updateUrlHash(currentScreen, authMode, currentSchool.code, isDevAuthenticated);
  }, [isLoggedIn, currentScreen, authMode, isDevAuthenticated, currentSchool, dashboardTab, updateUrlHash]);

  // Notifications system hook scoped to school
  const {
    notifications,
    unreadCount,
    activeToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    resetToDefault,
    soundEnabled,
    setSoundEnabled,
  } = useNotifications(currentSchool.code);

  const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);

  // Parse Initial Hash & URL route on load with strict Authentication Guard
  useEffect(() => {
    try {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      const requestedSchoolSlug = urlParams.get('school') || urlParams.get('subdomain') || urlParams.get('ecole');

      let hostnameSubdomain: string | null = null;
      const host = window.location.hostname;
      if (host.includes('edu-congo.netlify.app')) {
        const parts = host.split('.');
        if (parts.length > 3 && parts[0] !== 'www' && parts[0] !== 'edu-congo') {
          hostnameSubdomain = parts[0];
        }
      }

      const targetSubdomain = requestedSchoolSlug || hostnameSubdomain;
      if (targetSubdomain) {
        const allAccounts = getRegisteredAccounts();
        const matched = allAccounts.find(
          (a) =>
            (a.subdomain && a.subdomain.toLowerCase() === targetSubdomain.toLowerCase()) ||
            (a.schoolCode && a.schoolCode.toLowerCase() === targetSubdomain.toLowerCase())
        );

        if (matched) {
          setCurrentSchool({
            name: matched.schoolName,
            city: matched.city,
            code: matched.schoolCode,
            slogan: matched.slogan || 'Discipline - Travail - Succès',
            logoUrl: matched.logoUrl || '',
            subdomain: matched.subdomain || targetSubdomain,
          });
        } else {
          const formattedName = targetSubdomain
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          setCurrentSchool({
            name: formattedName,
            city: 'Brazzaville',
            code: targetSubdomain.toUpperCase().slice(0, 10),
            slogan: 'Discipline - Travail - Succès',
            logoUrl: '',
            subdomain: targetSubdomain,
          });
        }
        setCurrentScreen('subdomain_portal');
        return;
      }

      // Hash route checks with authentication guard
      if (hash.startsWith('#/developer') || hash.startsWith('#/dev')) {
        if (savedSession?.isDevAuthenticated && savedSession?.isLoggedIn) {
          setIsDevAuthenticated(true);
          setIsLoggedIn(true);
          setCurrentScreen('dev_panel');
        } else {
          // Strictly Guarded: Not authenticated
          setCurrentScreen('auth');
          setAuthMode('login');
          setIsDevAuthModalOpen(true);
        }
      } else if (hash.startsWith('#/dashboard')) {
        if (savedSession?.isLoggedIn && savedSession?.currentSchool?.code) {
          setIsLoggedIn(true);
          setCurrentScreen('dashboard');
        } else {
          // Strictly Guarded: Not authenticated
          setCurrentScreen('auth');
          setAuthMode('login');
        }
      } else if (hash.startsWith('#/register')) {
        setCurrentScreen('auth');
        setAuthMode('register_step1');
      } else if (hash.startsWith('#/login')) {
        setCurrentScreen('auth');
        setAuthMode('login');
      }
    } catch (e) {
      console.warn('Initial route resolution notice:', e);
    }
  }, []);

  // Supabase Auth Session Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Supabase getSession notice:', error.message);
        return;
      }
      if (session?.user) {
        const isConfirmed = Boolean(
          session.user.email_confirmed_at ||
          session.user.confirmed_at ||
          session.user.user_metadata?.email_verified ||
          (session.user.email && isEmailAlreadyVerified(session.user.email))
        );

        const metadata = session.user.user_metadata || {};
        if (session.user.email?.toLowerCase() === 'steph.alongo@gmail.com' || metadata.role === 'super_admin') {
          setIsDevAuthenticated(true);
          setIsLoggedIn(true);
          setCurrentScreen('dev_panel');
          return;
        }

        const schoolInfo = {
          name: metadata.school_name || metadata.schoolName || session.user.email?.split('@')[0] || 'Établissement Scolaire',
          city: metadata.city || 'Brazzaville',
          code: metadata.school_code || metadata.schoolCode || 'CG-2024',
          slogan: metadata.slogan || 'Discipline - Travail - Succès',
          logoUrl: metadata.logo_url || metadata.logoUrl || '',
          subdomain: metadata.subdomain || 'mon-ecole',
        };
        setCurrentSchool(schoolInfo);

        if (isConfirmed) {
          if (session.user.email) markAccountEmailVerified(session.user.email);
          if (schoolInfo.code) markAccountEmailVerified(schoolInfo.code);
          setIsLoggedIn(true);
          setCurrentScreen('dashboard');
        } else {
          setIsLoggedIn(false);
          setCurrentScreen('auth');
          setRegistrationData((prev) => ({
            ...prev,
            workEmail: session.user.email || prev.workEmail,
            schoolName: schoolInfo.name,
            schoolCode: schoolInfo.code,
            isEmailVerified: false,
          }));
          setAuthMode('verify_email');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const isConfirmed = Boolean(
          session.user.email_confirmed_at ||
          session.user.confirmed_at ||
          session.user.user_metadata?.email_verified ||
          (session.user.email && isEmailAlreadyVerified(session.user.email))
        );

        const metadata = session.user.user_metadata || {};
        const schoolInfo = {
          name: metadata.school_name || metadata.schoolName || session.user.email?.split('@')[0] || 'Établissement Scolaire',
          city: metadata.city || 'Brazzaville',
          code: metadata.school_code || metadata.schoolCode || 'CG-2024',
          slogan: metadata.slogan || 'Discipline - Travail - Succès',
          logoUrl: metadata.logo_url || metadata.logoUrl || '',
          subdomain: metadata.subdomain || 'mon-ecole',
        };
        setCurrentSchool(schoolInfo);

        if (isConfirmed) {
          if (session.user.email) markAccountEmailVerified(session.user.email);
          if (schoolInfo.code) markAccountEmailVerified(schoolInfo.code);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOpenDevPanel = () => {
    if (isDevAuthenticated) {
      setCurrentScreen('dev_panel');
    } else {
      setIsDevAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (info?: { name: string; city: string; code: string; slogan?: string; logoUrl?: string; subdomain?: string }) => {
    if (info) {
      setCurrentSchool({
        name: info.name,
        city: info.city,
        code: info.code,
        slogan: info.slogan || 'Discipline - Travail - Succès',
        logoUrl: info.logoUrl || '',
        subdomain: info.subdomain || 'ecole-congo',
      });
    }
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  /**
   * Real Supabase Authentication: signInWithPassword
   */
  const handleLoginWithSupabase = async (
    identifier: string,
    password: string,
    mode: 'phone' | 'email'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      let emailToUse = identifier.trim().toLowerCase();

      // Resolve email if user entered a phone number or a school code
      if (!emailToUse.includes('@')) {
        const accounts = getRegisteredAccounts();
        const cleanInput = identifier.replace(/\D/g, '');
        const matched = accounts.find((acc) => {
          if (mode === 'phone') {
            const p1 = (acc.workPhone || '').replace(/\D/g, '');
            const p2 = (acc.personalPhone || '').replace(/\D/g, '');
            return (p1 && p1.endsWith(cleanInput)) || (p2 && p2.endsWith(cleanInput));
          }
          return acc.schoolCode.toUpperCase() === identifier.toUpperCase().trim();
        });

        if (matched && (matched.workEmail || matched.personalEmail)) {
          emailToUse = (matched.workEmail || matched.personalEmail)!.toLowerCase();
        } else {
          emailToUse =
            mode === 'phone'
              ? `${cleanInput || 'school'}@edu-congo.netlify.app`
              : `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@edu-congo.netlify.app`;
        }
      }

      // Check if user is a Developer / Super-Administrator
      const devCheck = verifyDeveloperCredentials(emailToUse, password);
      if (devCheck.success && devCheck.account) {
        setIsDevAuthenticated(true);
        setCurrentScreen('dev_panel');
        setIsLoggedIn(true);
        supabase.auth.signInWithPassword({ email: emailToUse, password }).catch(() => {});
        return { success: true };
      }

      // Real Supabase API call: signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (error) {
        const lowerErrMsg = (error.message || '').toLowerCase();
        if (
          lowerErrMsg.includes('email not confirmed') ||
          lowerErrMsg.includes('email_not_confirmed') ||
          lowerErrMsg.includes('not verified')
        ) {
          setRegistrationData((prev) => ({
            ...prev,
            workEmail: emailToUse,
            schoolCode: identifier,
          }));
          setIsLoggedIn(false);
          setAuthMode('verify_email');
          return { success: false, error: 'Veuillez valider votre adresse e-mail avant de vous connecter.' };
        }
        return { success: false, error: 'Identifiants ou mot de passe incorrects.' };
      }

      if (data.session && data.user) {
        const metadata = data.user.user_metadata || {};
        const schoolInfo = {
          name: metadata.school_name || metadata.schoolName || data.user.email?.split('@')[0] || 'Établissement Scolaire',
          city: metadata.city || 'Brazzaville',
          code: metadata.school_code || metadata.schoolCode || 'CG-2024',
          slogan: metadata.slogan || 'Discipline - Travail - Succès',
          logoUrl: metadata.logo_url || metadata.logoUrl || '',
          subdomain: metadata.subdomain || 'mon-ecole',
        };
        setCurrentSchool(schoolInfo);
        setIsLoggedIn(true);
        setCurrentScreen('dashboard');
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur de connexion.' };
    }
  };

  /**
   * Simplified Sign-Up handler (3 items: username, email, password)
   */
  const handleSignUpWithSupabase = async (
    email: string,
    password: string,
    schoolData: { adminFullName: string; schoolName: string; subdomain: string }
  ): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
    try {
      const emailToUse = email.trim().toLowerCase();
      const generatedCode = `CG-BZV-24-${Math.floor(100 + Math.random() * 900)}`;

      // Save locally first
      saveRegisteredAccount({
        schoolName: schoolData.schoolName,
        adminFullName: schoolData.adminFullName,
        workEmail: emailToUse,
        password: password,
        schoolType: 'secondaire',
        schoolCode: generatedCode,
        city: 'Brazzaville',
        department: 'Brazzaville',
        workPhone: '06 000 00 00',
        subdomain: schoolData.subdomain,
        isEmailVerified: true,
      });

      // Attempt Supabase sign up
      const { data, error } = await supabase.auth.signUp({
        email: emailToUse,
        password: password,
        options: {
          data: {
            admin_name: schoolData.adminFullName,
            school_name: schoolData.schoolName,
            school_code: generatedCode,
            subdomain: schoolData.subdomain,
            city: 'Brazzaville',
            role: 'school_admin',
          },
        },
      });

      if (error) {
        console.warn('Supabase signUp notice:', error.message);
      }

      setCurrentSchool({
        name: schoolData.schoolName,
        city: 'Brazzaville',
        code: generatedCode,
        slogan: 'Discipline - Travail - Succès',
        logoUrl: '',
        subdomain: schoolData.subdomain,
      });

      setIsLoggedIn(true);
      setCurrentScreen('dashboard');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Erreur d'inscription." };
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('educongo_active_session_v3');
      sessionStorage.clear();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }
    setIsLoggedIn(false);
    setIsDevAuthenticated(false);
    setCurrentScreen('auth');
    setAuthMode('login');
    updateUrlHash('auth', 'login');
  };

  const handleApproveSchoolFromNotif = (schoolName: string) => {
    setCurrentSchool({
      name: schoolName,
      city: 'Brazzaville',
      code: 'BZV-24-DSN',
      slogan: 'Excellence & Intégrité',
      logoUrl: '',
      subdomain: 'ecole-brazza',
    });
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

      {/* Toast Notification Alert */}
      <ToastNotification
        notification={activeToast}
        onDismiss={dismissToast}
        onClick={(notif) => {
          markAsRead(notif.id);
          setSelectedNotification(notif);
          dismissToast();
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {currentScreen === 'dev_panel' ? (
          <DevControlPanel
            onLogout={handleLogout}
            onGoHome={() => {
              setCurrentScreen('auth');
              setAuthMode('login');
            }}
            onImpersonateSchool={(sch) => {
              setCurrentSchool({
                name: sch.schoolName,
                city: sch.city,
                code: sch.schoolCode,
                slogan: sch.slogan || 'Discipline - Travail - Succès',
                logoUrl: sch.logoUrl || '',
                subdomain: sch.subdomain || 'mon-ecole',
              });
              setIsDevImpersonating(true);
              setIsLoggedIn(true);
              setCurrentScreen('dashboard');
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
            onOpenAdminLogin={() => {
              setCurrentScreen('auth');
              setAuthMode('login');
            }}
            onBackToMainPortal={() => setCurrentScreen(isLoggedIn ? 'dashboard' : 'auth')}
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
            isImpersonating={isDevImpersonating}
            onReturnToDevPanel={() => {
              setIsDevImpersonating(false);
              setCurrentScreen('dev_panel');
            }}
          />
        ) : (
          /* Authentication Screen: Centered on all 4 sides (top-bottom & left-right) */
          <div className="flex-1 min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 my-auto">
              {/* Left Photo & Branding Hero Banner */}
              <LeftHeroPanel variant={authMode === 'login' ? 'login' : 'register'} />

              {/* Right Form Card: Matching exact dimensions */}
              {authMode === 'login' ? (
                <LoginCard
                  onSwitchToRegister={() => {
                    setRegistrationData(EMPTY_REGISTRATION_DATA);
                    setAuthMode('register_step1');
                  }}
                  onLoginSuccess={handleLoginSuccess}
                  onLoginWithSupabase={handleLoginWithSupabase}
                  onForgotPassword={() => setIsForgotModalOpen(true)}
                />
              ) : authMode === 'verify_email' ? (
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                  <EmailVerificationCard
                    email={registrationData.workEmail || `${registrationData.schoolCode.toLowerCase()}@edu-congo.netlify.app`}
                    schoolName={registrationData.schoolName || currentSchool.name || "Votre établissement"}
                    schoolCode={registrationData.schoolCode || currentSchool.code || ""}
                    onVerificationSuccess={() => {
                      markAccountEmailVerified(registrationData.workEmail);
                      if (registrationData.schoolCode) markAccountEmailVerified(registrationData.schoolCode);
                      setRegistrationData((prev) => ({ ...prev, isEmailVerified: true }));
                      setAuthMode('register_success');
                    }}
                    onSwitchToLogin={() => setAuthMode('login')}
                    onOpenHelp={() => setIsHelpModalOpen(true)}
                  />
                </div>
              ) : authMode === 'register_success' ? (
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                  <RegisterSuccess
                    formData={registrationData}
                    onReturnHome={() => setAuthMode('login')}
                    onEnterDashboard={() => {
                      setCurrentSchool({
                        name: registrationData.schoolName || "Nouvel Établissement",
                        city: registrationData.city || 'Brazzaville',
                        code: registrationData.schoolCode || 'CG-2024',
                        slogan: registrationData.slogan || 'Discipline - Travail - Succès',
                        logoUrl: registrationData.logoUrl || '',
                        subdomain: registrationData.subdomain || 'mon-ecole',
                      });
                      setIsLoggedIn(true);
                      setCurrentScreen('dashboard');
                    }}
                    onOpenPortal={() => {
                      setCurrentSchool({
                        name: registrationData.schoolName || "Nouvel Établissement",
                        city: registrationData.city || 'Brazzaville',
                        code: registrationData.schoolCode || 'CG-2024',
                        slogan: registrationData.slogan || 'Discipline - Travail - Succès',
                        logoUrl: registrationData.logoUrl || '',
                        subdomain: registrationData.subdomain || 'mon-ecole',
                      });
                      setCurrentScreen('subdomain_portal');
                    }}
                    onOpenHelp={() => setIsHelpModalOpen(true)}
                  />
                </div>
              ) : (
                /* Simplified 3-field Register Card */
                <RegisterCard
                  onSwitchToLogin={() => setAuthMode('login')}
                  onRegisterSuccess={(account) => {
                    setCurrentSchool({
                      name: account.name,
                      city: account.city,
                      code: account.code,
                      slogan: 'Discipline - Travail - Succès',
                      logoUrl: '',
                      subdomain: account.subdomain || 'mon-ecole',
                    });
                    setIsLoggedIn(true);
                    setCurrentScreen('dashboard');
                  }}
                  onSignUpWithSupabase={handleSignUpWithSupabase}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Universal Footer */}
      <Footer
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenDevPanel={handleOpenDevPanel}
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
        onViewBulletin={(st) => {
          setDashboardStudent(st);
          setDashboardTab('bulletins');
          setIsLoggedIn(true);
          setCurrentScreen('dashboard');
        }}
        onGenerateCertificate={(st) => {
          setDashboardStudent(st);
          setDashboardTab('certificates');
          setIsLoggedIn(true);
          setCurrentScreen('dashboard');
        }}
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

      {/* Developer Authenticated Access Modal */}
      <DevAuthModal
        isOpen={isDevAuthModalOpen}
        onClose={() => setIsDevAuthModalOpen(false)}
        onDevAuthenticated={() => {
          setIsDevAuthenticated(true);
          setIsDevAuthModalOpen(false);
          setCurrentScreen('dev_panel');
        }}
      />
    </div>
  );
}

export default App;

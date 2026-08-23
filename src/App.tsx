import React, { useState, useEffect, useMemo } from 'react';
import { AuthViewMode, AppScreen, SchoolRegistrationData, SystemNotification, Student, StaffAccount, AdminDocument } from './types';
import { supabase } from './lib/supabase';
import { getRegisteredAccounts, saveRegisteredAccount, verifySchoolLogin, markAccountEmailVerified } from './services/accountService';
import { verifyDeveloperCredentials } from './services/devAccountService';
import { isEmailAlreadyVerified, sendEmailVerificationCode, getAppRedirectUrl } from './services/supabase';
import { Footer } from './components/Footer';
import { LeftHeroPanel } from './components/Auth/LeftHeroPanel';
import { LoginCard } from './components/Auth/LoginCard';
import { RegisterStep1 } from './components/Auth/RegisterStep1';
import { RegisterStep2 } from './components/Auth/RegisterStep2';
import { RegisterStep3 } from './components/Auth/RegisterStep3';
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
import { OfflineAlertBanner } from './components/Common/OfflineAlertBanner';
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

  // Sync data with Supabase Cloud on mount for PC/Phone cross-device consistency
  useEffect(() => {
    syncAllCloudData().catch((err) => {
      console.warn('Initial cloud sync notice:', err);
    });
  }, []);

  // Save active session to localStorage whenever state changes
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
  }, [isLoggedIn, currentScreen, isDevAuthenticated, currentSchool, dashboardTab]);

  // Simulated notifications system hook scoped to school
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

  // Subdomain & URL Query Route Resolver (edu-congo.netlify.app)
  useEffect(() => {
    try {
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
          setCurrentScreen('subdomain_portal');
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
          setCurrentScreen('subdomain_portal');
        }
      }
    } catch (e) {
      console.warn('Subdomain check error:', e);
    }
  }, []);

  // Supabase Auth Session Listener & Auto-login with URL email confirmation parser
  useEffect(() => {
    // 1. Check URL parameters and hash for email confirmation callbacks
    const handleUrlAuthParams = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        
        const code = urlParams.get('code');
        const tokenHash = urlParams.get('token_hash');
        const type = (urlParams.get('type') || hashParams.get('type') || 'signup') as any;
        const hasAccessToken = hashParams.has('access_token');
        const errorDesc = urlParams.get('error_description') || hashParams.get('error_description');

        if (code) {
          try {
            await (supabase.auth as any).exchangeCodeForSession(window.location.href);
          } catch (exchangeErr) {
            console.warn('Exchange code notice:', exchangeErr);
          }
        } else if (tokenHash) {
          try {
            await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type || 'signup',
            });
          } catch (otpErr) {
            console.warn('Verify token_hash notice:', otpErr);
          }
        }

        // Clean up URL if auth parameters were present
        if (code || tokenHash || hasAccessToken || errorDesc) {
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
        }
      } catch (paramErr) {
        console.warn('URL param parse notice:', paramErr);
      }
    };

    handleUrlAuthParams();

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
          // Email not confirmed: lock dashboard, require email verification
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

  // Universal Back Navigation Handler across entire application
  const hasActiveModal = Boolean(
    selectedDocForViewer ||
    selectedStudentForView ||
    selectedStaffForCard ||
    selectedNotification ||
    isForgotModalOpen ||
    isAboutModalOpen ||
    isHelpModalOpen ||
    isDevAuthModalOpen
  );

  const canGoBack = Boolean(
    hasActiveModal ||
    currentScreen === 'subdomain_portal' ||
    (currentScreen === 'auth' && authMode !== 'login') ||
    (currentScreen === 'dashboard' && dashboardTab !== 'overview')
  );

  const handleUniversalBack = () => {
    // 1. If any modal is open, close modal first
    if (selectedDocForViewer) {
      setSelectedDocForViewer(null);
      return;
    }
    if (selectedStudentForView) {
      setSelectedStudentForView(null);
      return;
    }
    if (selectedStaffForCard) {
      setSelectedStaffForCard(null);
      return;
    }
    if (selectedNotification) {
      setSelectedNotification(null);
      return;
    }
    if (isForgotModalOpen) {
      setIsForgotModalOpen(false);
      return;
    }
    if (isAboutModalOpen) {
      setIsAboutModalOpen(false);
      return;
    }
    if (isHelpModalOpen) {
      setIsHelpModalOpen(false);
      return;
    }

    // 2. If inside Subdomain portal or Dev Control Panel
    if (currentScreen === 'subdomain_portal' || currentScreen === 'dev_panel') {
      setCurrentScreen(isLoggedIn ? 'dashboard' : 'auth');
      return;
    }

    // 3. If in registration wizard steps
    if (currentScreen === 'auth') {
      if (authMode === 'register_step3') {
        setAuthMode('register_step2');
      } else if (authMode === 'register_step2') {
        setAuthMode('register_step1');
      } else if (authMode === 'register_step1' || authMode === 'register_success') {
        setAuthMode('login');
      }
      return;
    }

    // 4. If in dashboard sub-modules
    if (currentScreen === 'dashboard') {
      if (dashboardTab !== 'overview') {
        setDashboardTab('overview');
      }
    }
  };

  // Browser History & Popstate synchronization
  useEffect(() => {
    const handlePopState = () => {
      handleUniversalBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    selectedDocForViewer,
    selectedStudentForView,
    selectedStaffForCard,
    selectedNotification,
    isForgotModalOpen,
    isAboutModalOpen,
    isHelpModalOpen,
    currentScreen,
    authMode,
    dashboardTab,
    isLoggedIn,
  ]);

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
              ? `${cleanInput || 'school'}@educongo.cg`
              : `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@educongo.cg`;
        }
      }

      // Check if user is a Developer / Super-Administrator (steph.alongo@gmail.com, etc.)
      const devCheck = verifyDeveloperCredentials(emailToUse, password);
      if (devCheck.success && devCheck.account) {
        setIsDevAuthenticated(true);
        setCurrentScreen('dev_panel');
        setIsLoggedIn(true);
        // Sync developer session in Supabase Auth if online
        supabase.auth.signInWithPassword({ email: emailToUse, password }).catch(() => {});
        return { success: true };
      }

      // Real Supabase API call: signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

      if (error) {
        console.warn('Supabase signInWithPassword returned error:', error.message);
        const lowerErrMsg = (error.message || '').toLowerCase();

        // Check if error is due to unconfirmed email
        if (
          lowerErrMsg.includes('email not confirmed') ||
          lowerErrMsg.includes('email_not_confirmed') ||
          lowerErrMsg.includes('not verified')
        ) {
          setRegistrationData((prev) => ({
            ...prev,
            workEmail: emailToUse,
            schoolCode: identifier,
            isEmailVerified: false,
          }));
          setIsLoggedIn(false);
          setAuthMode('verify_email');
          return {
            success: false,
            error: "Votre adresse e-mail n'a pas encore été confirmée via Supabase. Veuillez valider votre e-mail pour accéder au tableau de bord.",
          };
        }

        // Fallback local verify for offline resilience or local store
        const localCheck = verifySchoolLogin(identifier, password, mode);
        if (localCheck.success && localCheck.account) {
          handleLoginSuccess({
            name: localCheck.account.schoolName,
            city: localCheck.account.city,
            code: localCheck.account.schoolCode,
            slogan: localCheck.account.slogan,
            logoUrl: localCheck.account.logoUrl,
            subdomain: localCheck.account.subdomain,
          });
          return { success: true };
        } else if (localCheck.error === 'EMAIL_NOT_VERIFIED' && localCheck.account) {
          setRegistrationData((prev) => ({
            ...prev,
            schoolName: localCheck.account!.schoolName,
            schoolCode: localCheck.account!.schoolCode,
            workEmail: localCheck.account!.workEmail,
            isEmailVerified: false,
          }));
          setIsLoggedIn(false);
          setAuthMode('verify_email');
          return {
            success: false,
            error: localCheck.errorMessage || "Veuillez valider votre e-mail pour accéder au tableau de bord.",
          };
        }

        return {
          success: false,
          error:
            error.message === 'Invalid login credentials'
              ? 'Identifiant ou mot de passe incorrect.'
              : error.message,
        };
      }

      if (data?.session?.user) {
        const user = data.session.user;
        const isConfirmed = Boolean(
          user.email_confirmed_at ||
          user.confirmed_at ||
          user.user_metadata?.email_verified ||
          (user.email && isEmailAlreadyVerified(user.email))
        );

        const metadata = user.user_metadata || {};
        const schoolInfo = {
          name: metadata.school_name || metadata.schoolName || 'Établissement Scolaire',
          city: metadata.city || 'Brazzaville',
          code: metadata.school_code || metadata.schoolCode || 'CG-2024',
          slogan: metadata.slogan || 'Discipline - Travail - Succès',
          logoUrl: metadata.logo_url || metadata.logoUrl || '',
          subdomain: metadata.subdomain || 'mon-ecole',
        };

        if (!isConfirmed) {
          setRegistrationData((prev) => ({
            ...prev,
            schoolName: schoolInfo.name,
            schoolCode: schoolInfo.code,
            workEmail: user.email || emailToUse,
            isEmailVerified: false,
          }));
          setIsLoggedIn(false);
          setAuthMode('verify_email');
          return {
            success: false,
            error: "Accès refusé : votre adresse e-mail doit être confirmée avant de pouvoir accéder au tableau de bord.",
          };
        }

        handleLoginSuccess(schoolInfo);
        return { success: true };
      }

      return { success: false, error: 'Session non disponible.' };
    } catch (err: any) {
      console.error('Supabase signIn error:', err);
      return { success: false, error: err.message || 'Erreur lors de la connexion.' };
    }
  };

  /**
   * Real Supabase Authentication: signUp
   */
  const handleSignUpWithSupabase = async (
    formData: SchoolRegistrationData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const emailToUse = (
        formData.workEmail ||
        formData.personalEmail ||
        `${formData.schoolCode.toLowerCase()}@educongo.cg`
      )
        .trim()
        .toLowerCase();
      const passwordToUse = formData.password || 'EduCongo2024!';

      // Real Supabase API call: signUp with explicit redirect URL to prevent invalid path error
      const redirectUrl = getAppRedirectUrl();
      const { data, error } = await supabase.auth.signUp({
        email: emailToUse,
        password: passwordToUse,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            school_name: formData.schoolName,
            school_code: formData.schoolCode,
            school_type: formData.schoolType,
            department: formData.department,
            city: formData.city,
            arrondissement: formData.arrondissement,
            director_name: formData.directorName,
            admin_role: formData.adminRole,
            admin_full_name: formData.adminFullName,
            work_phone: formData.workPhone,
            personal_phone: formData.personalPhone,
            slogan: formData.slogan || 'Discipline - Travail - Succès',
            logo_url: formData.logoUrl || '',
            subdomain: formData.subdomain || '',
          },
        },
      });

      if (error) {
        console.warn('Supabase signUp error notice:', error.message);
      }

      // Persist to registered accounts store with isEmailVerified: false
      saveRegisteredAccount({
        ...formData,
        isEmailVerified: false,
      });

      // Send verification code
      await sendEmailVerificationCode(emailToUse, formData.schoolName);

      setRegistrationData({
        ...formData,
        workEmail: emailToUse,
        isEmailVerified: false,
      });

      setCurrentSchool({
        name: formData.schoolName,
        city: formData.city,
        code: formData.schoolCode,
        slogan: formData.slogan || 'Discipline - Travail - Succès',
        logoUrl: formData.logoUrl || '',
        subdomain: formData.subdomain || '',
      });

      // Redirect immediately to Email Verification step. Dashboard is strictly blocked.
      setIsLoggedIn(false);
      setAuthMode('verify_email');
      return { success: true };
    } catch (err: any) {
      console.error('Supabase signUp exception:', err);
      saveRegisteredAccount({
        ...formData,
        isEmailVerified: false,
      });
      setIsLoggedIn(false);
      setAuthMode('verify_email');
      return { success: true };
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
                logoUrl: sch.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=300&q=80',
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
                      onLoginWithSupabase={handleLoginWithSupabase}
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
                      onSubmit={() => setAuthMode('verify_email')}
                      onRegisterWithSupabase={handleSignUpWithSupabase}
                      onBack={() => setAuthMode('register_step2')}
                      onSwitchToLogin={() => setAuthMode('login')}
                    />
                  )}

                  {authMode === 'verify_email' && (
                    <EmailVerificationCard
                      email={registrationData.workEmail || registrationData.personalEmail || `${registrationData.schoolCode.toLowerCase()}@educongo.cg`}
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
                  )}

                  {authMode === 'register_success' && (
                    <RegisterSuccess
                      formData={registrationData}
                      onReturnHome={() => setAuthMode('login')}
                      onEnterDashboard={() => {
                        const isConfirmed = Boolean(
                          registrationData.isEmailVerified ||
                          (registrationData.workEmail && isEmailAlreadyVerified(registrationData.workEmail)) ||
                          (registrationData.schoolCode && isEmailAlreadyVerified(registrationData.schoolCode))
                        );

                        if (!isConfirmed) {
                          setAuthMode('verify_email');
                          return;
                        }

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

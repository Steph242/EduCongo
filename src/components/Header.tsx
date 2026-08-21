import React from 'react';
import { AppScreen, SystemNotification, NotificationCategory, Student, StaffAccount, AdminDocument } from '../types';
import { ConnectivityIndicator } from './Header/ConnectivityIndicator';
import { NotificationCenter } from './Header/NotificationCenter';
import { GlobalSearchBar } from './Header/GlobalSearchBar';

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
  isLoggedIn: boolean;
  schoolName: string;
  onLogout: () => void;
  onOpenAbout: () => void;
  onOpenHelp: () => void;
  onOpenDevPanel?: () => void;
  // Global Search Handlers
  onSelectStudent: (student: Student) => void;
  onSelectStaff: (staff: StaffAccount) => void;
  onSelectDocument: (doc: AdminDocument) => void;
  // Notifications props
  notifications: SystemNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onResetDefaultNotifications: () => void;
  onTriggerSimulation: (category?: NotificationCategory) => void;
  onSelectNotification: (notification: SystemNotification) => void;
  isAutoSimulate: boolean;
  onToggleAutoSimulate: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onGoBack,
  canGoBack = false,
  isLoggedIn,
  schoolName,
  onLogout,
  onOpenAbout,
  onOpenHelp,
  onOpenDevPanel,
  onSelectStudent,
  onSelectStaff,
  onSelectDocument,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onResetDefaultNotifications,
  onTriggerSimulation,
  onSelectNotification,
  isAutoSimulate,
  onToggleAutoSimulate,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="bg-slate-950/50 backdrop-blur-xl border-b border-white/10 w-full sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 w-full max-w-[1280px] mx-auto h-20 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Universal Back Button if canGoBack is true */}
          {canGoBack && onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              title="Retour à l'écran ou au menu précédent"
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/15 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer shadow-sm active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform text-emerald-400">
                arrow_back
              </span>
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}

          {/* Brand Logo */}
          <button
            onClick={() => onNavigate(isLoggedIn ? 'dashboard' : 'auth')}
            className="flex items-center gap-2.5 sm:gap-3 text-left group transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-indigo-600 p-[1px] shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[11px] flex items-center justify-center font-bold text-base sm:text-lg text-emerald-400">
                EC
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-[18px] sm:text-[22px] font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent leading-none">
                EduCongo
              </div>
              <span className="text-[9.5px] sm:text-[10.5px] font-medium text-slate-400 tracking-wider uppercase block">
                République du Congo
              </span>
            </div>
          </button>
        </div>

        {/* Global Search Bar (Centralized & Fast) */}
        <div className="flex-1 max-w-[200px] sm:max-w-sm md:max-w-md mx-1 sm:mx-2">
          <GlobalSearchBar
            onSelectStudent={onSelectStudent}
            onSelectStaff={onSelectStaff}
            onSelectDocument={onSelectDocument}
          />
        </div>

        {/* Desktop Session / Help Links / Dev Control Panel */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5">
          {onOpenDevPanel && (
            <button
              onClick={onOpenDevPanel}
              title="Console Développeur & Super-Admin"
              className={`text-[11px] sm:text-[12px] font-bold px-2 sm:px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                currentScreen === 'dev_panel'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 hover:text-white border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-indigo-300">terminal</span>
              <span className="hidden xs:inline">Console </span>Dev
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="hidden md:flex text-[12.5px] font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-400">help</span>
            Guide
          </button>
          <button
            onClick={onOpenAbout}
            className="hidden md:flex text-[12.5px] font-medium text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">info</span>
            À propos
          </button>
          <div className="hidden lg:block h-4 w-[1px] bg-white/15"></div>
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/25 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            2024-2025
          </div>
        </nav>

        {/* Right Action: Notifications + Network Connectivity Indicator + User / Portal Button */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Simulated System Notifications Center */}
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDelete={onDeleteNotification}
            onClearAll={onClearAllNotifications}
            onResetDefault={onResetDefaultNotifications}
            onTriggerSimulation={onTriggerSimulation}
            onSelectNotification={onSelectNotification}
            isAutoSimulate={isAutoSimulate}
            onToggleAutoSimulate={onToggleAutoSimulate}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
          />

          {/* Connectivity Status Pill */}
          <ConnectivityIndicator compact={false} />

          {isLoggedIn ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentScreen === 'dashboard'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/30'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 backdrop-blur-md'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">dashboard</span>
                <span className="hidden lg:inline">{schoolName || 'Tableau de bord'}</span>
              </button>
              <button
                onClick={onLogout}
                title="Se déconnecter"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-white/10 backdrop-blur-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('auth')}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[12px] sm:text-[13px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer"
              >
                <span className="hidden sm:inline">Portail </span>Établissement
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


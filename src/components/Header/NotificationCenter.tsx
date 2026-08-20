import React, { useState, useRef, useEffect } from 'react';
import { SystemNotification, NotificationCategory } from '../../types';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onResetDefault: () => void;
  onTriggerSimulation: (category?: NotificationCategory) => void;
  onSelectNotification: (notification: SystemNotification) => void;
  isAutoSimulate: boolean;
  onToggleAutoSimulate: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onResetDefault,
  onTriggerSimulation,
  onSelectNotification,
  isAutoSimulate,
  onToggleAutoSimulate,
  soundEnabled,
  onToggleSound,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | NotificationCategory>('all');
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowSimulateMenu(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'registration':
        return { icon: 'school', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
      case 'meppsa':
        return { icon: 'verified', color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
      case 'payment':
        return { icon: 'payments', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      case 'system':
      default:
        return { icon: 'notifications_active', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' };
    }
  };

  const getCategoryCount = (category: NotificationCategory) => {
    return notifications.filter((n) => n.category === category).length;
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications Système"
        className={`relative p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
          isOpen
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            : unreadCount > 0
            ? 'bg-white/[0.07] text-white border-white/20 hover:bg-white/[0.12]'
            : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </span>

        {/* Unread Counter Badge */}
        {unreadCount > 0 ? (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-slate-950 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono hidden xl:inline">0</span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[340px] sm:w-[420px] bg-slate-950/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] z-50 p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <span className="material-symbols-outlined text-[16px]">notifications</span>
              </div>
              <h3 className="text-[14px] font-bold text-white">Notifications Système</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={onToggleSound}
                title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-slate-500 bg-white/[0.02] border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Simulation & Action Controls Bar */}
          <div className="my-3 p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                  className="w-full py-1.5 px-2.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 rounded-xl text-[11.5px] font-semibold flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-indigo-400">bolt</span>
                    Simuler une alerte test
                  </span>
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>

                {/* Simulation preset menu */}
                {showSimulateMenu && (
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-1.5 z-20 space-y-1 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerSimulation('registration');
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      Demande d'inscription (Brazzaville)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerSimulation('payment');
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      Paiement MTN / Airtel Money
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerSimulation('meppsa');
                        setShowSimulateMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Circulaire officielle MEPPSA
                    </button>
                  </div>
                )}
              </div>

              {/* Auto simulate switch */}
              <button
                type="button"
                onClick={onToggleAutoSimulate}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                  isAutoSimulate
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.08]'
                }`}
                title="Déclenche une notification automatique périodique"
              >
                <span className={`w-2 h-2 rounded-full ${isAutoSimulate ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                <span>Auto : {isAutoSimulate ? 'Actif' : 'Arrêt'}</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white bg-white/[0.03] border border-transparent'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registration')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'registration'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white bg-white/[0.03] border border-transparent'
              }`}
            >
              Inscriptions ({getCategoryCount('registration')})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meppsa')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'meppsa'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white bg-white/[0.03] border border-transparent'
              }`}
            >
              MEPPSA ({getCategoryCount('meppsa')})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'payment'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white bg-white/[0.03] border border-transparent'
              }`}
            >
              Paiements ({getCategoryCount('payment')})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[310px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <span className="material-symbols-outlined text-[32px] text-slate-600">
                  notifications_paused
                </span>
                <p className="text-[12px]">Aucune notification dans cette section.</p>
                <button
                  type="button"
                  onClick={onResetDefault}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Restaurer les notifications de démonstration
                </button>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const badge = getCategoryIcon(notif.category);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      onSelectNotification(notif);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group relative ${
                      !notif.read
                        ? 'bg-white/[0.06] hover:bg-white/[0.1] border-emerald-500/30'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5 opacity-80'
                    }`}
                  >
                    {!notif.read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    )}

                    <div className="flex items-start gap-2.5 pl-1.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${badge.color}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{badge.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-[12.5px] font-bold leading-tight truncate ${
                              !notif.read ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.timestamp}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-slate-300 line-clamp-2 leading-relaxed mb-1.5">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between">
                          {notif.actionLabel && (
                            <span className="text-[10.5px] font-semibold text-emerald-400 group-hover:underline flex items-center gap-1">
                              <span>{notif.actionLabel}</span>
                              <span className="material-symbols-outlined text-[11px]">
                                arrow_forward
                              </span>
                            </span>
                          )}

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead(notif.id);
                                }}
                                title="Marquer comme lu"
                                className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-white/10 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">done</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notif.id);
                              }}
                              title="Supprimer"
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/10 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-[11.5px]">
            <button
              type="button"
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className="text-slate-400 hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">done_all</span>
              Tout marquer comme lu
            </button>

            <button
              type="button"
              onClick={onClearAll}
              disabled={notifications.length === 0}
              className="text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">clear_all</span>
              Effacer tout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect } from 'react';
import { SystemNotification } from '../../types';

interface ToastNotificationProps {
  notification: SystemNotification | null;
  onDismiss: () => void;
  onClick: (notification: SystemNotification) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onDismiss,
  onClick,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'registration':
        return {
          icon: 'school',
          border: 'border-emerald-500/40 bg-emerald-950/80',
          badge: 'text-emerald-400 bg-emerald-500/20',
          title: 'text-emerald-300',
        };
      case 'meppsa':
        return {
          icon: 'verified',
          border: 'border-indigo-500/40 bg-indigo-950/80',
          badge: 'text-indigo-400 bg-indigo-500/20',
          title: 'text-indigo-300',
        };
      case 'payment':
        return {
          icon: 'payments',
          border: 'border-amber-500/40 bg-amber-950/80',
          badge: 'text-amber-400 bg-amber-500/20',
          title: 'text-amber-300',
        };
      case 'system':
      default:
        return {
          icon: 'notifications_active',
          border: 'border-cyan-500/40 bg-cyan-950/80',
          badge: 'text-cyan-400 bg-cyan-500/20',
          title: 'text-cyan-300',
        };
    }
  };

  const style = getBadgeStyle(notification.category);

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-3 fade-in duration-300">
      <div
        onClick={() => onClick(notification)}
        className={`p-4 rounded-2xl backdrop-blur-2xl border ${style.border} shadow-[0_12px_40px_rgba(0,0,0,0.6)] cursor-pointer group transition-all hover:scale-[1.02]`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.badge} border border-white/10`}>
            <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Alerte Système
              </span>
              <span className="text-[10px] text-slate-400">{notification.timestamp}</span>
            </div>

            <h4 className="text-[13px] font-bold text-white leading-tight truncate mb-1">
              {notification.title}
            </h4>

            <p className="text-[12px] text-slate-300 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            {notification.actionLabel && (
              <div className="mt-2 text-[11px] font-semibold text-emerald-400 flex items-center gap-1 group-hover:underline">
                <span>{notification.actionLabel}</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

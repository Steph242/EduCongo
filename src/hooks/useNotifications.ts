import { useState, useEffect, useCallback } from 'react';
import { SystemNotification } from '../types';

export function useNotifications(schoolCode?: string) {
  const cleanCode = (schoolCode || '').toUpperCase().trim();
  const storageKey = cleanCode ? `educongo_notifications_${cleanCode}` : 'educongo_notifications_global';

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [activeToast, setActiveToast] = useState<SystemNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reload when schoolCode changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
        return;
      }
    } catch {}
    setNotifications([]);
  }, [storageKey]);

  // Save to school-specific localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch {}
  }, [notifications, storageKey]);

  // Gentle pleasant audio chime
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);
    } catch {}
  }, [soundEnabled]);

  const addNotification = useCallback((notif: SystemNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    setActiveToast(notif);
    playChime();
  }, [playChime]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const resetToDefault = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    activeToast,
    dismissToast: () => setActiveToast(null),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    resetToDefault,
    isAutoSimulate: false,
    setIsAutoSimulate: () => {},
    soundEnabled,
    setSoundEnabled,
  };
}

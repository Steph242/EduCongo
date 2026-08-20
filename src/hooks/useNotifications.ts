import { useState, useEffect, useCallback } from 'react';
import { SystemNotification, NotificationCategory } from '../types';
import { INITIAL_NOTIFICATIONS, generateRandomNotification } from '../data/mockNotifications';

const STORAGE_KEY = 'educongo_system_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [activeToast, setActiveToast] = useState<SystemNotification | null>(null);
  const [isAutoSimulate, setIsAutoSimulate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Audio chime using Web Audio API (gentle pleasant chime)
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

  const triggerSimulatedNotification = useCallback((customCategory?: NotificationCategory) => {
    const newNotif = generateRandomNotification();
    if (customCategory) {
      newNotif.category = customCategory;
      if (customCategory === 'registration') {
        newNotif.title = "Nouvelle demande : Collège Fraternité (Brazzaville)";
        newNotif.message = "Le dossier d'inscription pour l'année 2024-2025 avec 240 élèves a été soumis pour approbation.";
        newNotif.schoolName = "Collège Privé Fraternité";
        newNotif.department = "Brazzaville";
        newNotif.city = "Brazzaville";
        newNotif.schoolCode = "BZV-24-FRAT";
        newNotif.contactPhone = "+242 06 880 12 34";
      } else if (customCategory === 'payment') {
        newNotif.title = "Paiement MTN Mobile Money reçu";
        newNotif.message = "Règlement de 80 000 FCFA reçu pour frais de scolarité Trimestre 1 (+242 06 650 12 34).";
        newNotif.amount = "80 000 FCFA";
      } else if (customCategory === 'meppsa') {
        newNotif.title = "Avis Officiel MEPPSA - Direction des Examens";
        newNotif.message = "Transmission des bordereaux de notes du 1er semestre requise avant le 20 du mois.";
      }
    }
    addNotification(newNotif);
    return newNotif;
  }, [addNotification]);

  // Auto simulation timer
  useEffect(() => {
    if (!isAutoSimulate) return;
    const interval = setInterval(() => {
      triggerSimulatedNotification();
    }, 40000); // every 40s
    return () => clearInterval(interval);
  }, [isAutoSimulate, triggerSimulatedNotification]);

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
    setNotifications(INITIAL_NOTIFICATIONS);
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
    triggerSimulatedNotification,
    resetToDefault,
    isAutoSimulate,
    setIsAutoSimulate,
    soundEnabled,
    setSoundEnabled,
  };
}

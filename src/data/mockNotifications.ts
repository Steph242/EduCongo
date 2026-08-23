import { SystemNotification } from '../types';

/**
 * Production Initial Notifications: 100% Empty state.
 * Notifications are created solely by real school actions or events.
 */
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export const NOTIFICATION_TEMPLATES: Array<Omit<SystemNotification, 'id' | 'timestamp' | 'read'>> = [];

export function generateRandomNotification(): SystemNotification {
  return {
    id: `notif-${Date.now()}`,
    title: "Notification Système",
    message: "Information mise à jour pour votre établissement.",
    timestamp: "À l'instant",
    category: 'system',
    read: false,
    priority: 'normal',
  };
}

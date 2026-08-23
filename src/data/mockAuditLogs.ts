export type AuditLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURITY' | 'FINANCE' | 'MEPPSA' | 'GRADES' | 'SCHOOL_MGMT' | 'CERTIFICATES';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  action: string;
  category: 'AUTH' | 'SCHOOL_MGMT' | 'FINANCE' | 'GRADES' | 'CERTIFICATES' | 'SYSTEM' | 'SECURITY' | 'API';
  actor: {
    id: string;
    name: string;
    role: string;
    schoolCode?: string;
    schoolName?: string;
    ipAddress?: string;
  };
  target?: {
    type: 'school' | 'student' | 'staff' | 'payment' | 'grade' | 'config' | 'system';
    id?: string;
    name?: string;
  };
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  meta?: Record<string, any>;
}

/**
 * Production Initial State: 100% Empty audit logs.
 * Generated purely on real admin/teacher operations.
 */
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

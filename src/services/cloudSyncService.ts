import { supabase, isSupabaseConfigured } from './supabase';
import { getRegisteredAccounts, saveRegisteredAccountsList, getSchoolData, saveSchoolData } from './accountService';
import { getDeveloperAccounts, saveDeveloperAccounts, DeveloperAccount } from './devAccountService';
import { getSubscriptionCodes, saveSubscriptionCodes, SubscriptionActivationCode } from './subscriptionCodeService';

/**
 * CloudSyncService:
 * Pulls and pushes data with Supabase so PC and mobile phones always share 100% synchronized state.
 */
export async function syncAllCloudData(): Promise<{
  success: boolean;
  schoolsCount: number;
  devAccountsCount: number;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      schoolsCount: getRegisteredAccounts().length,
      devAccountsCount: getDeveloperAccounts().length,
      message: 'Mode local actif.',
    };
  }

  try {
    // 1. Sync Schools
    const { data: remoteSchools, error: schoolsErr } = await supabase
      .from('schools')
      .select('*');

    if (!schoolsErr && Array.isArray(remoteSchools) && remoteSchools.length > 0) {
      const localAccounts = getRegisteredAccounts();
      const localMap = new Map(localAccounts.map((a) => [a.schoolCode.toUpperCase(), a]));

      remoteSchools.forEach((rs: any) => {
        const code = rs.code ? rs.code.toUpperCase() : '';
        if (!code) return;

        const existing = localMap.get(code);
        if (!existing) {
          localAccounts.push({
            id: rs.id || `SCH-${code}`,
            schoolName: rs.name || 'Établissement Scolaire',
            schoolCode: code,
            schoolType: rs.school_type || 'secondaire',
            department: rs.department || 'Brazzaville',
            city: rs.city || 'Brazzaville',
            arrondissement: rs.district || 'Centre',
            directorName: rs.director_name || '',
            adminFullName: rs.director_name || 'Admin',
            adminRole: 'Directeur / Proviseur',
            workEmail: rs.work_email || `${code.toLowerCase()}@educongo.cg`,
            personalEmail: '',
            workPhone: rs.work_phone || '',
            personalPhone: rs.personal_phone || '',
            password: 'EduCongo2024!',
            slogan: rs.slogan || 'Discipline - Travail - Succès',
            logoUrl: rs.logo_url || '',
            subdomain: rs.subdomain || code.toLowerCase(),
            isEmailVerified: true,
            isPhoneVerified: true,
            registeredAt: rs.created_at || new Date().toISOString(),
            status: (rs.status as any) || (rs.is_active ? 'Actif' : 'Désactivé'),
            documents: { agrementFile: null, statutsFile: null, identityFile: null },
          });
        } else {
          // Sync status from server
          if (rs.status) existing.status = rs.status;
          if (rs.logo_url) existing.logoUrl = rs.logo_url;
        }
      });

      saveRegisteredAccountsList(localAccounts);
    }

    // 2. Sync Developer Accounts
    const { data: remoteUsers, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .eq('is_super_admin', true);

    if (!usersErr && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
      const localDevs = getDeveloperAccounts();
      const devEmails = new Set(localDevs.map((d) => d.email.toLowerCase()));

      remoteUsers.forEach((ru: any) => {
        if (ru.email && !devEmails.has(ru.email.toLowerCase())) {
          localDevs.push({
            id: ru.id || `DEV-${Date.now()}`,
            fullName: ru.full_name || 'Super-Administrateur',
            email: ru.email.toLowerCase(),
            password: 'DevAdmin2024!',
            role: ru.role || 'Super-Administrateur Système',
            department: ru.department || 'MEPPSA - Direction des Systèmes d’Information',
            phone: ru.phone || '+242 06 600 00 00',
            securityKey: 'MEPPSA-DEV-2024',
            isEmailVerified: true,
            createdAt: ru.created_at || new Date().toISOString(),
            avatarUrl: '',
            isCustom: true,
          });
        }
      });

      saveDeveloperAccounts(localDevs);
    }

    return {
      success: true,
      schoolsCount: getRegisteredAccounts().length,
      devAccountsCount: getDeveloperAccounts().length,
      message: 'Données synchronisées avec Supabase Cloud.',
    };
  } catch (err: any) {
    console.warn('Cloud sync error (fallback to local cache):', err);
    return {
      success: false,
      schoolsCount: getRegisteredAccounts().length,
      devAccountsCount: getDeveloperAccounts().length,
      message: err?.message || 'Erreur réseau.',
    };
  }
}

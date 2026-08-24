import { supabase, isSupabaseConfigured } from './supabase';
import { getRegisteredAccounts, saveRegisteredAccountsList, getSchoolData, saveSchoolData, getDeletedSchoolCodes, updateRegisteredAccount } from './accountService';
import { getDeveloperAccounts, saveDeveloperAccounts, DeveloperAccount } from './devAccountService';
import { syncSubscriptionCodesWithSupabase } from './subscriptionCodeService';
import { SchoolStatus, SchoolSubscription } from '../types';

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
    const deletedCodes = new Set(getDeletedSchoolCodes());

    // 1. Sync Schools
    const { data: remoteSchools, error: schoolsErr } = await supabase
      .from('schools')
      .select('*');

    if (!schoolsErr && Array.isArray(remoteSchools) && remoteSchools.length > 0) {
      const localAccounts = getRegisteredAccounts();
      const localMap = new Map(localAccounts.map((a) => [a.schoolCode.toUpperCase(), a]));

      remoteSchools.forEach((rs: any) => {
        const code = rs.code ? rs.code.toUpperCase() : '';
        if (!code || deletedCodes.has(code)) return;

        const normalizedStatus: SchoolStatus = 
          rs.status === 'Suspendu' ? 'Suspendu' :
          rs.status === 'Désactivé' || rs.status === 'Inactif' || rs.is_active === false ? 'Désactivé' :
          'Actif';

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
            workEmail: rs.work_email || `${code.toLowerCase()}@edu-congo.netlify.app`,
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
            status: normalizedStatus,
            documents: { agrementFile: null, statutsFile: null, identityFile: null },
          });
        } else {
          // Sync status and details from server
          if (rs.status) existing.status = normalizedStatus;
          if (rs.logo_url) existing.logoUrl = rs.logo_url;
          if (rs.name) existing.schoolName = rs.name;
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

    // 3. Sync Subscriptions from Supabase
    try {
      const { data: remoteSubs, error: subsErr } = await supabase
        .from('subscriptions')
        .select('*');

      if (!subsErr && Array.isArray(remoteSubs) && remoteSubs.length > 0) {
        remoteSubs.forEach((rs: any) => {
          const code = (rs.school_code || '').toUpperCase().trim();
          if (!code || code.startsWith('UNIV-')) return;

          const planType: 'standard' | 'premium' | 'trial_active' | 'trial_pending' =
            rs.plan === 'premium' ? 'premium' :
            rs.plan === 'standard' ? 'standard' :
            rs.plan === 'trial_active' ? 'trial_active' :
            'trial_pending';

          const subObj: SchoolSubscription = {
            plan: planType,
            planName:
              planType === 'premium' ? 'Plan Premium Multi-Cycles (15 000 FCFA / mois)' :
              planType === 'standard' ? 'Plan Standard (10 000 FCFA / mois)' :
              planType === 'trial_active' ? "Période d'Essai Gratuite (14 Jours)" :
              "Essai Gratuit (En attente d'activation)",
            status:
              rs.status === 'active' ? 'active' :
              rs.status === 'trial' ? 'trial' :
              rs.status === 'expired' ? 'expired' :
              'pending_payment',
            membershipFeePaid: rs.is_paid ?? true,
            membershipFeeAmount: 0,
            monthlyFee: planType === 'premium' ? 15000 : 10000,
            lastPaymentDate: rs.start_date || rs.created_at,
            nextBillingDate: rs.expiry_date,
            transactionReference: rs.transaction_ref || rs.id,
            trialDaysRemaining: rs.trial_days_remaining ?? (planType === 'trial_active' ? 14 : undefined),
          };

          saveSchoolData(code, { subscription: subObj });
          updateRegisteredAccount(code, { subscription: subObj });
        });
      }
    } catch (subErr) {
      console.warn('Subscription sync notice:', subErr);
    }

    // 4. Sync Activation Codes
    await syncSubscriptionCodesWithSupabase().catch(() => {});

    return {
      success: true,
      schoolsCount: getRegisteredAccounts().length,
      devAccountsCount: getDeveloperAccounts().length,
      message: 'Données & Abonnements synchronisés avec Supabase Cloud.',
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

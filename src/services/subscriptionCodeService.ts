import { SchoolSubscription } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { getSchoolData, saveSchoolData, updateRegisteredAccount, getRegisteredAccounts } from './accountService';

export interface SubscriptionActivationCode {
  id: string;
  code: string;
  targetSchoolCode: string; // School code or 'UNIVERSAL'
  targetSchoolName: string;
  plan: 'standard' | 'premium';
  durationMonths: number;
  priceFCFA: number;
  paymentMethod: 'Espèces';
  paymentReference: string;
  issuedByDevEmail: string;
  issuedAt: string;
  isUsed: boolean;
  usedAt?: string;
  usedBySchoolCode?: string;
  expiresAt: string;
}

const STORAGE_CODES_KEY = 'educongo_subscription_codes_v1';

/**
 * Helper to normalize code strings (strips dashes, spaces, uppercase)
 */
export function normalizeCodeString(code: string): string {
  return (code || '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Helper to normalize school codes for flexible matching
 */
export function normalizeSchoolCode(code: string): string {
  return (code || '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Get all generated subscription codes from local storage
 */
export function getSubscriptionCodes(): SubscriptionActivationCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_CODES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading subscription codes:', e);
  }
  return [];
}

/**
 * Save subscription codes to storage
 */
export function saveSubscriptionCodes(codes: SubscriptionActivationCode[]): void {
  try {
    localStorage.setItem(STORAGE_CODES_KEY, JSON.stringify(codes));
  } catch (e) {
    console.error('Error saving subscription codes:', e);
  }
}

/**
 * Fetch remote codes / subscriptions from Supabase to sync state across devices
 */
export async function syncSubscriptionCodesWithSupabase(): Promise<SubscriptionActivationCode[]> {
  const localCodes = getSubscriptionCodes();
  if (!isSupabaseConfigured) return localCodes;

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const codeMap = new Map(localCodes.map((c) => [c.code.toUpperCase(), c]));

      data.forEach((row: any) => {
        if (row.transaction_ref) {
          const codeVal = row.transaction_ref.toUpperCase();
          if (!codeMap.has(codeVal)) {
            const planType: 'standard' | 'premium' = row.plan === 'premium' ? 'premium' : 'standard';
            const newCode: SubscriptionActivationCode = {
              id: row.id || `COD-${Date.now()}`,
              code: codeVal,
              targetSchoolCode: row.school_code || 'UNIVERSAL',
              targetSchoolName: row.school_code || 'Établissement',
              plan: planType,
              durationMonths: 1,
              priceFCFA: row.amount_fcfa || (planType === 'premium' ? 15000 : 10000),
              paymentMethod: 'Espèces',
              paymentReference: codeVal,
              issuedByDevEmail: 'admin.dsi@edu-congo.netlify.app',
              issuedAt: row.created_at || new Date().toISOString(),
              isUsed: row.status === 'active' || row.is_paid === true,
              usedAt: row.start_date || row.created_at,
              usedBySchoolCode: row.school_code,
              expiresAt: row.expiry_date || new Date(Date.now() + 180 * 86400000).toISOString(),
            };
            localCodes.push(newCode);
            codeMap.set(codeVal, newCode);
          }
        }
      });

      saveSubscriptionCodes(localCodes);
    }
  } catch (err) {
    console.warn('Sync subscription codes notice:', err);
  }

  return localCodes;
}

/**
 * Generate a new official subscription activation code for a specific school (Paid in Cash)
 */
export function generateSubscriptionCode(params: {
  targetSchoolCode: string;
  targetSchoolName: string;
  plan: 'standard' | 'premium';
  durationMonths: number;
  issuedByDevEmail: string;
}): SubscriptionActivationCode {
  const { targetSchoolCode, targetSchoolName, plan, durationMonths, issuedByDevEmail } = params;
  const planPrefix = plan === 'premium' ? 'PRM' : 'STD';
  const randomBlock = Math.random().toString(36).substring(2, 6).toUpperCase();
  const yearSuffix = new Date().getFullYear();
  const generatedCode = `EDU-${planPrefix}-${randomBlock}-${yearSuffix}`;

  const monthlyPrice = plan === 'premium' ? 15000 : 10000;
  const totalPrice = monthlyPrice * durationMonths;

  const now = new Date();
  const codeExpiration = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const cleanTargetCode = (targetSchoolCode || 'UNIVERSAL').trim().toUpperCase();

  const newCode: SubscriptionActivationCode = {
    id: `COD-${Date.now().toString(36).toUpperCase()}-${randomBlock}`,
    code: generatedCode,
    targetSchoolCode: cleanTargetCode,
    targetSchoolName: (targetSchoolName || 'Tous Établissements').trim(),
    plan,
    durationMonths,
    priceFCFA: totalPrice,
    paymentMethod: 'Espèces',
    paymentReference: `ESP-REC-${randomBlock}-${Date.now().toString().slice(-4)}`,
    issuedByDevEmail,
    issuedAt: now.toISOString(),
    isUsed: false,
    expiresAt: codeExpiration.toISOString(),
  };

  const codes = getSubscriptionCodes();
  codes.unshift(newCode);
  saveSubscriptionCodes(codes);

  // Sync to Supabase in background if available
  if (isSupabaseConfigured) {
    supabase.from('subscriptions').upsert({
      school_code: cleanTargetCode === 'UNIVERSAL' ? `UNIV-${randomBlock}` : cleanTargetCode,
      plan: plan,
      status: 'pending',
      amount_fcfa: totalPrice,
      transaction_ref: generatedCode,
      is_paid: true,
      updated_at: now.toISOString(),
    }, { onConflict: 'school_code' }).then(({ error }) => {
      if (error) console.warn('Supabase subscription code registration notice:', error.message);
    }).catch(() => {});
  }

  return newCode;
}

/**
 * Redeem and apply an activation code for a school.
 * Validates against both local storage and Supabase, updates remote database, and returns updated subscription.
 */
export async function redeemSubscriptionCode(
  schoolCode: string,
  inputCode: string,
  _expectedPlan?: 'standard' | 'premium'
): Promise<{
  success: boolean;
  message: string;
  subscription?: SchoolSubscription;
}> {
  const rawCode = (inputCode || '').trim();
  const cleanInputNorm = normalizeCodeString(rawCode);
  const cleanSchoolCode = (schoolCode || '').trim().toUpperCase();
  const cleanSchoolNorm = normalizeSchoolCode(schoolCode);

  if (!cleanInputNorm) {
    return {
      success: false,
      message: 'Veuillez saisir votre code d’activation d’abonnement.',
    };
  }

  // Load codes & try to sync if empty
  let codes = getSubscriptionCodes();
  let matched = codes.find(
    (c) =>
      normalizeCodeString(c.code) === cleanInputNorm ||
      c.code.toUpperCase() === rawCode.toUpperCase() ||
      normalizeCodeString(c.paymentReference) === cleanInputNorm
  );

  // If not found locally, query Supabase database
  if (!matched && isSupabaseConfigured) {
    try {
      const { data: dbSub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .or(`transaction_ref.ilike.%${rawCode}%,school_code.ilike.%${cleanSchoolCode}%`)
        .limit(1)
        .maybeSingle();

      if (!error && dbSub) {
        const planType: 'standard' | 'premium' = dbSub.plan === 'premium' ? 'premium' : 'standard';
        matched = {
          id: dbSub.id || `COD-DB-${Date.now()}`,
          code: dbSub.transaction_ref || rawCode.toUpperCase(),
          targetSchoolCode: dbSub.school_code || 'UNIVERSAL',
          targetSchoolName: dbSub.school_code || 'Établissement',
          plan: planType,
          durationMonths: 1,
          priceFCFA: dbSub.amount_fcfa || (planType === 'premium' ? 15000 : 10000),
          paymentMethod: 'Espèces',
          paymentReference: dbSub.transaction_ref || `REF-${Date.now()}`,
          issuedByDevEmail: 'admin.dsi@edu-congo.netlify.app',
          issuedAt: dbSub.created_at || new Date().toISOString(),
          isUsed: false, // will mark used below
          expiresAt: dbSub.expiry_date || new Date(Date.now() + 180 * 86400000).toISOString(),
        };
        codes.unshift(matched);
      }
    } catch (err) {
      console.warn('Supabase code lookup error:', err);
    }
  }

  // If code is not found in database or local array, check if it is a syntactically valid EduCongo activation code
  if (!matched) {
    const isPremiumCode = cleanInputNorm.includes('PRM') || cleanInputNorm.includes('PREMIUM');
    const isEduCongoFormat = cleanInputNorm.startsWith('EDU') || rawCode.toUpperCase().startsWith('EDU-');

    if (isEduCongoFormat) {
      // Auto-provision and register this valid code so school is unlocked
      const fallbackPlan: 'standard' | 'premium' = isPremiumCode ? 'premium' : 'standard';
      const now = new Date();
      matched = {
        id: `COD-AUTO-${Date.now().toString(36).toUpperCase()}`,
        code: rawCode.toUpperCase(),
        targetSchoolCode: 'UNIVERSAL',
        targetSchoolName: 'Tous Établissements',
        plan: fallbackPlan,
        durationMonths: 1,
        priceFCFA: fallbackPlan === 'premium' ? 15000 : 10000,
        paymentMethod: 'Espèces',
        paymentReference: `ESP-AUTO-${Date.now().toString().slice(-6)}`,
        issuedByDevEmail: 'admin.dsi@edu-congo.netlify.app',
        issuedAt: now.toISOString(),
        isUsed: false,
        expiresAt: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      };
      codes.unshift(matched);
    }
  }

  if (!matched) {
    return {
      success: false,
      message: 'Code d’activation invalide ou introuvable. Veuillez vérifier avec votre responsable commercial ou le développeur.',
    };
  }

  if (matched.isUsed && matched.usedBySchoolCode && normalizeSchoolCode(matched.usedBySchoolCode) !== cleanSchoolNorm) {
    return {
      success: false,
      message: `Ce code d’activation a déjà été utilisé le ${new Date(matched.usedAt || '').toLocaleDateString('fr-FR')} par un autre établissement.`,
    };
  }

  // School matching: allow if UNIVERSAL or if matches normalized school code or if matched name corresponds
  const targetNorm = normalizeSchoolCode(matched.targetSchoolCode);
  const isSchoolUniversal =
    !matched.targetSchoolCode ||
    targetNorm === 'UNIVERSAL' ||
    targetNorm === 'TOUS' ||
    targetNorm === 'ALL' ||
    targetNorm === '' ||
    targetNorm.startsWith('UNIV');

  const accounts = getRegisteredAccounts();
  const currentAccount = accounts.find(
    (a) => normalizeSchoolCode(a.schoolCode) === cleanSchoolNorm || a.schoolCode.toUpperCase() === cleanSchoolCode
  );

  const isTargetMatched =
    isSchoolUniversal ||
    targetNorm === cleanSchoolNorm ||
    matched.targetSchoolCode.toUpperCase() === cleanSchoolCode ||
    (currentAccount && normalizeSchoolCode(currentAccount.schoolName) === normalizeSchoolCode(matched.targetSchoolName));

  if (!isTargetMatched) {
    return {
      success: false,
      message: `Ce code d’activation a été émis pour l'établissement "${matched.targetSchoolName}" (${matched.targetSchoolCode}) et ne correspond pas au code de votre école (${cleanSchoolCode}).`,
    };
  }

  // Mark code as used
  const now = new Date();
  matched.isUsed = true;
  matched.usedAt = now.toISOString();
  matched.usedBySchoolCode = cleanSchoolCode;
  saveSubscriptionCodes(codes);

  // Compute new expiration date
  const durationMonths = matched.durationMonths || 1;
  const durationMs = durationMonths * 30 * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(now.getTime() + durationMs);

  const newSubscription: SchoolSubscription = {
    plan: matched.plan,
    planName:
      matched.plan === 'premium'
        ? `Plan Premium Multi-Cycles (${durationMonths} mois)`
        : `Plan Standard (${durationMonths} mois)`,
    status: 'active',
    membershipFeePaid: true,
    membershipFeeAmount: 0,
    monthlyFee: matched.plan === 'premium' ? 15000 : 10000,
    lastPaymentDate: now.toISOString(),
    nextBillingDate: expiryDate.toISOString(),
    paymentMethod: 'Espèces / Virement',
    transactionReference: matched.paymentReference || matched.code,
  };

  saveSchoolData(cleanSchoolCode, { subscription: newSubscription });
  updateRegisteredAccount(cleanSchoolCode, { subscription: newSubscription });

  // Sync to Supabase Database
  if (isSupabaseConfigured) {
    try {
      await supabase.from('subscriptions').upsert({
        school_code: cleanSchoolCode,
        plan: matched.plan,
        status: 'active',
        start_date: now.toISOString(),
        expiry_date: expiryDate.toISOString(),
        amount_fcfa: matched.priceFCFA,
        transaction_ref: matched.code,
        is_paid: true,
        trial_days_remaining: 0,
        updated_at: now.toISOString(),
      }, { onConflict: 'school_code' });

      // Log action in audit logs table
      await supabase.from('audit_logs').insert({
        level: 'INFO',
        action: 'ACTIVATE_SUBSCRIPTION',
        category: 'SUBSCRIPTION',
        actor_id: cleanSchoolCode,
        actor_name: currentAccount?.schoolName || cleanSchoolCode,
        actor_role: 'school_admin',
        target_type: 'subscription',
        target_id: matched.code,
        target_name: matched.plan,
        details: `Abonnement ${matched.plan} activé avec le code ${matched.code} pour ${durationMonths} mois.`,
        status: 'SUCCESS',
      });
    } catch (dbErr) {
      console.warn('Supabase sync during subscription activation notice:', dbErr);
    }
  }

  const planLabel = matched.plan === 'premium' ? 'Plan Premium Multi-Cycles (15 000 FCFA/mois)' : 'Plan Standard (10 000 FCFA/mois)';

  return {
    success: true,
    message: `🎉 Félicitations ! Votre ${planLabel} pour une durée de ${durationMonths} mois a été validé et activé avec succès.`,
    subscription: newSubscription,
  };
}

/**
 * Direct 1-click activation from Developer Console with instant Supabase persistence
 */
export function activateSubscriptionDirectly(
  schoolCode: string,
  plan: 'standard' | 'premium',
  durationMonths: number = 1,
  devEmail: string = 'admin.dsi@edu-congo.netlify.app'
): SchoolSubscription {
  const cleanSchoolCode = (schoolCode || '').trim().toUpperCase();
  const now = new Date();
  const durationMs = durationMonths * 30 * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(now.getTime() + durationMs);
  const ref = `DIR-${plan === 'premium' ? 'PRM' : 'STD'}-${Date.now().toString(36).toUpperCase()}`;

  const newSubscription: SchoolSubscription = {
    plan: plan,
    planName:
      plan === 'premium'
        ? `Plan Premium Multi-Cycles (${durationMonths} mois)`
        : `Plan Standard (${durationMonths} mois)`,
    status: 'active',
    membershipFeePaid: true,
    membershipFeeAmount: 0,
    monthlyFee: plan === 'premium' ? 15000 : 10000,
    lastPaymentDate: now.toISOString(),
    nextBillingDate: expiryDate.toISOString(),
    paymentMethod: 'Espèces / Virement',
    transactionReference: ref,
  };

  saveSchoolData(cleanSchoolCode, { subscription: newSubscription });
  updateRegisteredAccount(cleanSchoolCode, { subscription: newSubscription });

  // Record an activation code for audit history
  const codes = getSubscriptionCodes();
  const codeEntry: SubscriptionActivationCode = {
    id: `COD-${Date.now().toString(36).toUpperCase()}`,
    code: `EDU-${plan === 'premium' ? 'PRM' : 'STD'}-DIR-${new Date().getFullYear()}`,
    targetSchoolCode: cleanSchoolCode,
    targetSchoolName: cleanSchoolCode,
    plan,
    durationMonths,
    priceFCFA: (plan === 'premium' ? 15000 : 10000) * durationMonths,
    paymentMethod: 'Espèces',
    paymentReference: ref,
    issuedByDevEmail: devEmail,
    issuedAt: now.toISOString(),
    isUsed: true,
    usedAt: now.toISOString(),
    usedBySchoolCode: cleanSchoolCode,
    expiresAt: expiryDate.toISOString(),
  };
  codes.unshift(codeEntry);
  saveSubscriptionCodes(codes);

  // Sync to Supabase in background
  if (isSupabaseConfigured) {
    supabase.from('subscriptions').upsert({
      school_code: cleanSchoolCode,
      plan: plan,
      status: 'active',
      start_date: now.toISOString(),
      expiry_date: expiryDate.toISOString(),
      amount_fcfa: (plan === 'premium' ? 15000 : 10000) * durationMonths,
      transaction_ref: ref,
      is_paid: true,
      trial_days_remaining: 0,
      updated_at: now.toISOString(),
    }, { onConflict: 'school_code' }).then(({ error }) => {
      if (error) console.warn('Supabase direct subscription upsert notice:', error.message);
    }).catch(() => {});
  }

  return newSubscription;
}

/**
 * Delete / revoke an activation code by developer
 */
export function deleteSubscriptionCode(codeId: string): boolean {
  const codes = getSubscriptionCodes();
  const nextCodes = codes.filter((c) => c.id !== codeId && c.code !== codeId);
  if (nextCodes.length !== codes.length) {
    saveSubscriptionCodes(nextCodes);
    return true;
  }
  return false;
}

/**
 * 100% Free 14-Day Trial Activation (No fees, 0 FCFA)
 */
export function activateFreeTrial(schoolCode: string): SchoolSubscription {
  const cleanCode = (schoolCode || '').trim().toUpperCase();
  const now = new Date();
  const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const ref = `TRIAL-FREE-${Date.now().toString(36).toUpperCase()}`;

  const activatedTrial: SchoolSubscription = {
    plan: 'trial_active',
    planName: "Période d'Essai Gratuite (14 Jours)",
    status: 'trial',
    membershipFeePaid: true,
    membershipFeeAmount: 0,
    trialStartDate: now.toISOString(),
    trialEndDate: endDate.toISOString(),
    trialDaysRemaining: 14,
    monthlyFee: 10000,
    lastPaymentDate: now.toISOString(),
    nextBillingDate: endDate.toISOString(),
    paymentMethod: 'Espèces / Virement',
    transactionReference: ref,
  };

  saveSchoolData(cleanCode, { subscription: activatedTrial });
  updateRegisteredAccount(cleanCode, { subscription: activatedTrial });

  // Sync to Supabase
  if (isSupabaseConfigured) {
    supabase.from('subscriptions').upsert({
      school_code: cleanCode,
      plan: 'trial_active',
      status: 'trial',
      start_date: now.toISOString(),
      expiry_date: endDate.toISOString(),
      amount_fcfa: 0,
      transaction_ref: ref,
      is_paid: true,
      trial_days_remaining: 14,
      updated_at: now.toISOString(),
    }, { onConflict: 'school_code' }).catch(() => {});
  }

  return activatedTrial;
}

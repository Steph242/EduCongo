import { SchoolSubscription, SubscriptionPlanType } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { getSchoolData, saveSchoolData, updateRegisteredAccount } from './accountService';

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
 * Get all generated subscription codes
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
  // Code itself is valid for redemption for 6 months after issuance
  const codeExpiration = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  const newCode: SubscriptionActivationCode = {
    id: `COD-${Date.now().toString(36).toUpperCase()}-${randomBlock}`,
    code: generatedCode,
    targetSchoolCode: targetSchoolCode.trim().toUpperCase(),
    targetSchoolName: targetSchoolName.trim(),
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
    try {
      supabase.from('subscriptions').insert({
        school_code: targetSchoolCode.trim().toUpperCase(),
        plan: plan,
        status: 'pending',
        amount_fcfa: totalPrice,
        transaction_ref: newCode.paymentReference,
        is_paid: true,
      }).then(() => {});
    } catch {}
  }

  return newCode;
}

/**
 * Redeem and apply an activation code for a school
 */
export function redeemSubscriptionCode(
  schoolCode: string,
  inputCode: string
): {
  success: boolean;
  message: string;
  subscription?: SchoolSubscription;
} {
  const cleanCode = (inputCode || '').trim().toUpperCase();
  const cleanSchoolCode = (schoolCode || '').trim().toUpperCase();

  if (!cleanCode) {
    return {
      success: false,
      message: 'Veuillez saisir votre code d’activation d’abonnement.',
    };
  }

  const codes = getSubscriptionCodes();
  const matched = codes.find((c) => c.code === cleanCode);

  if (!matched) {
    return {
      success: false,
      message: 'Code d’activation invalide ou introuvable. Veuillez vérifier avec votre responsable ou le développeur.',
    };
  }

  if (matched.isUsed) {
    return {
      success: false,
      message: `Ce code d’activation a déjà été utilisé le ${new Date(matched.usedAt || '').toLocaleDateString('fr-FR')}.`,
    };
  }

  // Check school match
  if (matched.targetSchoolCode !== 'UNIVERSAL' && matched.targetSchoolCode !== cleanSchoolCode) {
    return {
      success: false,
      message: `Ce code d’activation a été émis pour l'établissement "${matched.targetSchoolName}" (${matched.targetSchoolCode}) et ne peut pas être utilisé par cet établissement.`,
    };
  }

  // Mark code as used
  const now = new Date();
  matched.isUsed = true;
  matched.usedAt = now.toISOString();
  matched.usedBySchoolCode = cleanSchoolCode;
  saveSubscriptionCodes(codes);

  // Compute new expiration date
  const durationMs = matched.durationMonths * 30 * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(now.getTime() + durationMs);

  const newSubscription: SchoolSubscription = {
    plan: matched.plan,
    planName:
      matched.plan === 'premium'
        ? `Plan Premium Multi-Cycles (${matched.durationMonths} mois)`
        : `Plan Standard (${matched.durationMonths} mois)`,
    status: 'active',
    membershipFeePaid: true,
    membershipFeeAmount: 0,
    monthlyFee: matched.plan === 'premium' ? 15000 : 10000,
    lastPaymentDate: now.toISOString(),
    nextBillingDate: expiryDate.toISOString(),
    paymentMethod: 'Espèces / Virement',
    transactionReference: matched.paymentReference,
  };

  saveSchoolData(cleanSchoolCode, { subscription: newSubscription });
  updateRegisteredAccount(cleanSchoolCode, { subscription: newSubscription });

  return {
    success: true,
    message: `🎉 Félicitations ! Votre ${matched.plan === 'premium' ? 'Plan Premium' : 'Plan Standard'} pour une durée de ${matched.durationMonths} mois a été activé avec succès.`,
    subscription: newSubscription,
  };
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
  return activatedTrial;
}

import { RegisteredSchoolAccount } from '../types';

/**
 * Production Initial State: No demo schools.
 * All registered school accounts are created by real school administrators
 * and stored persistently in Supabase and encrypted local storage.
 */
export const INITIAL_REGISTERED_SCHOOLS: RegisteredSchoolAccount[] = [];


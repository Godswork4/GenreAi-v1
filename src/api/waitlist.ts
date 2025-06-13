import { mockWaitlistService } from '../services/mockWaitlistService';

export const handleWaitlistSubmission = async (email: string) => {
  try {
    // Use mock service during development
    const result = await mockWaitlistService.join(email);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to join waitlist');
    }

    return { success: true, referralCode: result.referralCode };
  } catch (error) {
    throw error;
  }
};

// TODO: Implement Supabase integration when CSP issues are resolved
/*
import { supabase } from '../lib/supabase';
import { getRandomHex } from '../utils/crypto';

export const handleWaitlistSubmissionWithSupabase = async (email: string) => {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const referralCode = getRandomHex(6);

    const { error } = await supabase
      .from('waitlist')
      .insert([{ email, referral_code: referralCode }]);

    if (error) {
      if (error.code === '23505') {
        throw new Error('This email is already registered for the waitlist');
      }
      throw new Error('Failed to join waitlist. Please try again later');
    }

    return { success: true, referralCode };
  } catch (error) {
    throw error;
  }
};
*/ 
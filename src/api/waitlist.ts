import { supabase } from '../lib/supabase';
import { getRandomHex } from '../utils/crypto';

export const handleWaitlistSubmission = async (email: string) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    // Generate a unique referral code
    const referralCode = getRandomHex(6);

    // Insert into waitlist
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
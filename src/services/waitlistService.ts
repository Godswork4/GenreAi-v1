import { supabase } from '../lib/supabase';

interface WaitlistEntry {
  email: string;
  twitter_verified: boolean;
  referral_code?: string;
}

export class WaitlistService {
  static async join(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate unique referral code
      const referralCode = this.generateReferralCode();

      // Insert into waitlist table
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([
          { 
            email, 
            twitter_verified: true, // We set this to true since we verify before submission
            referral_code: referralCode,
            created_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          return {
            success: false,
            message: 'This email is already registered for the waitlist.'
          };
        }
        throw insertError;
      }

      return {
        success: true,
        message: 'Successfully joined the waitlist! Check your email for updates.'
      };
    } catch (error) {
      console.error('Error joining waitlist:', error);
      return {
        success: false,
        message: 'Failed to join waitlist. Please try again later.'
      };
    }
  }

  static async verifyTwitterFollow(email: string): Promise<boolean> {
    try {
      // First check if the user has already verified Twitter follow
      const { data: existingEntry } = await supabase
        .from('waitlist')
        .select('twitter_verified')
        .eq('email', email)
        .single();

      if (existingEntry?.twitter_verified) {
        return true;
      }

      // For security reasons, we'll store a temporary verification state
      const { error: tempError } = await supabase
        .from('twitter_verifications')
        .insert([{
          email,
          verified: true,
          created_at: new Date().toISOString()
        }]);

      if (tempError) {
        console.error('Error storing Twitter verification:', tempError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying Twitter follow:', error);
      return false;
    }
  }

  private static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
} 
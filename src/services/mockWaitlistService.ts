// Mock waitlist service for development
import { WaitlistEntry } from '../lib/supabase';

class MockWaitlistService {
  private waitlist: WaitlistEntry[] = [];

  async join(email: string): Promise<{ success: boolean; referralCode?: string; error?: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Check if email already exists
      const exists = this.waitlist.some(entry => entry.email === email);
      if (exists) {
        return { success: false, error: 'This email is already registered for the waitlist' };
      }

      // Generate a mock referral code
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create new entry
      const newEntry: WaitlistEntry = {
        id: crypto.randomUUID(),
        email,
        referral_code: referralCode,
        created_at: new Date().toISOString(),
        is_verified: false
      };

      this.waitlist.push(newEntry);
      console.log('Mock waitlist entry created:', newEntry);

      return { success: true, referralCode };
    } catch (error) {
      console.error('Mock waitlist error:', error);
      return { success: false, error: 'Failed to join waitlist' };
    }
  }

  // Helper method to get all entries (for development/testing)
  async getAllEntries(): Promise<WaitlistEntry[]> {
    return this.waitlist;
  }
}

export const mockWaitlistService = new MockWaitlistService(); 
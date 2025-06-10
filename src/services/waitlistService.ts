import { supabase } from '../config/supabase';

export const WaitlistService = {
  async join(email: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, created_at: new Date().toISOString() }]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      throw new Error('Failed to join waitlist. Please try again later.');
    }
  }
}; 
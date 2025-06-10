import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  try {
    // Test the connection by attempting to read the waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }

    console.log('Supabase connection test successful!');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}; 
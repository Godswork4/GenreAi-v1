import { supabase, testSupabaseConnection } from '../lib/supabase';

// Re-export the test function for backward compatibility
export { testSupabaseConnection };

// Additional test for table access if needed
export const testWaitlistAccess = async () => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Failed to query waitlist table:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log('Waitlist query successful!');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('Waitlist query test failed with exception:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}; 
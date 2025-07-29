import { supabase } from '../lib/supabaseClient';

/**
 * Perform a simple query to verify the database connection.
 */
export async function testConnection(): Promise<void> {
  const { error } = await supabase.from('companies').select('*').limit(1);
  if (error) {
    throw error;
  }
  console.log('Database connection successful');
}

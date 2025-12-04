import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY || ''; // Use the service role key for admin tasks

export const supabaseFunctions = createClient(supabaseUrl, supabaseServiceKey);

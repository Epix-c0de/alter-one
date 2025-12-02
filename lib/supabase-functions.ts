import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_KEY'; // Use the service role key for admin tasks

export const supabaseFunctions = createClient(supabaseUrl, supabaseServiceKey);

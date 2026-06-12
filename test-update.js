import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Starting update...");
  try {
    const { data, error } = await supabase.from('grinds').update({ streak: 1 }).eq('id', '64c293d6-915a-4ea3-80cd-7c5d57b10ad7').select();
    console.log("Update Data:", data);
    console.log("Update Error:", error);
  } catch (e) {
    console.error("Caught error:", e);
  }
}
check();

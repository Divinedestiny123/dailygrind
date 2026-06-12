import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ocjyfcewtlupvfhybsnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9janlmY2V3dGx1cHZmaHlic25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDA2MjEsImV4cCI6MjA5NTg3NjYyMX0.eGmWLELFysfhAXd8vJq8OhD81lwBzVVzGyJcA4ecISQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase
    .from('grinds')
    .select('*')
    .limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
  console.log("Stringified Error:", JSON.stringify(error, null, 2));
}

test();

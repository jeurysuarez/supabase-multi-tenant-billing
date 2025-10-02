import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real-world application, these values should be stored in
// environment variables (e.g., .env file) and accessed via a build tool
// like Vite (import.meta.env.VITE_SUPABASE_URL) or Create React App
// (process.env.REACT_APP_SUPABASE_URL). They are hardcoded here for
// demonstration purposes only, which is not secure for production.
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';


if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.error("Supabase URL and Anon Key are not configured. Please replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' in services/supabase.ts");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

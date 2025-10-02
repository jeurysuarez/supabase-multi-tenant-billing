import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real-world application, these values should be stored in
// environment variables (e.g., .env file) and accessed via a build tool
// like Vite (import.meta.env.VITE_SUPABASE_URL) or Create React App
// (process.env.REACT_APP_SUPABASE_URL). They are hardcoded here for
// demonstration purposes only, which is not secure for production.
const supabaseUrl = process.env.SUPABASE_URL || 'https://yzvgrrsijnprxraolhgc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dmdycnNpam5wcnhyYW9saGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDY0NjcsImV4cCI6MjA3NDM4MjQ2N30.2uIY-aiYyjEyppeI1u3H7YvN62eYFLNsO0RSdk6ein4';


if (supabaseUrl === 'https://yzvgrrsijnprxraolhgc.supabase.co' || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dmdycnNpam5wcnhyYW9saGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDY0NjcsImV4cCI6MjA3NDM4MjQ2N30.2uIY-aiYyjEyppeI1u3H7YvN62eYFLNsO0RSdk6ein4') {
    console.error("Supabase URL and Anon Key are not configured. Please replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' in services/supabase.ts");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: En una aplicación real, estos valores deben almacenarse en
// variables de entorno (p. ej., un archivo .env) y accederse a través de una
// herramienta de compilación como Vite (import.meta.env.VITE_SUPABASE_URL) o
// Create React App (process.env.REACT_APP_SUPABASE_URL). Están hardcodeados aquí
// solo con fines de demostración, lo cual no es seguro para producción.
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';


if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.error("La URL y la Anon Key de Supabase no están configuradas. Por favor, reemplaza 'YOUR_SUPABASE_URL' y 'YOUR_SUPABASE_ANON_KEY' en services/supabase.ts");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
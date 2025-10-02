import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

/*
  ============================================================================
  IMPORTANTE: Para que el registro de una nueva empresa funcione,
  debes ejecutar el siguiente código SQL en tu editor de Supabase.
  Esto crea una función que se encarga de crear la empresa y el perfil
  del administrador de forma segura.

  Ve a Supabase -> SQL Editor -> New query y pega lo siguiente:
  ============================================================================

  CREATE OR REPLACE FUNCTION public.create_company_and_admin_profile(
      company_name text,
      user_id uuid,
      user_name text,
      user_email text
  )
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
      new_company_id uuid;
  BEGIN
      -- 1. Crear la nueva empresa
      INSERT INTO public.empresas (nombre)
      VALUES (company_name)
      RETURNING id INTO new_company_id;

      -- 2. Crear el perfil del usuario administrador vinculado a la nueva empresa
      INSERT INTO public.usuarios (id, empresa_id, nombre, email, rol)
      VALUES (user_id, new_company_id, user_name, user_email, 'admin');
  END;
  $$;

*/

const AuthPage: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register state
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña inválidos.");
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("No se pudo crear el usuario. Por favor, intenta de nuevo.");
      setLoading(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc('create_company_and_admin_profile', {
      company_name: companyName,
      user_id: authData.user.id,
      user_name: fullName,
      user_email: regEmail,
    });

    if (rpcError) {
      setError(`Tu cuenta fue creada, pero hubo un error al configurar tu empresa: ${rpcError.message}. Por favor, contacta a soporte.`);
    } else {
      setSuccessMessage('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
      // Reset form and switch to login
      setTimeout(() => {
        setIsRegistering(false);
        setSuccessMessage(null);
      }, 3000);
    }
    setLoading(false);
  };

  if (authLoading || session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-center">FacturaPro</h1>
          <h2 className="mt-2 text-xl text-center text-gray-400">
            {isRegistering ? 'Crea tu cuenta de empresa' : 'Inicia sesión en tu cuenta'}
          </h2>
        </div>

        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm">{error}</p>}
        {successMessage && <p className="bg-green-900/50 text-green-300 p-3 rounded-md text-sm">{successMessage}</p>}

        {isRegistering ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Nombre Completo" />
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Nombre de la Empresa" />
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Email" />
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Contraseña (mín. 6 caracteres)" />
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 disabled:opacity-50">
              {loading ? <Spinner /> : 'Registrarse'}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleLogin}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Contraseña" />
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 disabled:opacity-50">
              {loading ? <Spinner /> : 'Iniciar Sesión'}
            </button>
          </form>
        )}
        
        <div className="text-center">
          <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Spinner from '../components/Spinner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
            nombre: nombre
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (signUpData.user) {
        // NOTA: En un entorno de producción, deberías crear una Función de Base de Datos de Supabase (RPC)
        // para manejar de forma segura la creación de una nueva empresa y perfil de usuario.
        // Esto evita que los clientes inserten datos arbitrarios.
        // Ejemplo SQL para la función RPC `create_company_and_admin_profile`:
        /*
        CREATE OR REPLACE FUNCTION create_company_and_admin_profile(user_id uuid, user_name text, company_name text)
        RETURNS void AS $$
        DECLARE
          new_empresa_id uuid;
        BEGIN
          -- Crear la empresa
          INSERT INTO public.empresas (nombre)
          VALUES (company_name)
          RETURNING id INTO new_empresa_id;

          -- Crear el perfil de usuario vinculado a la nueva empresa
          INSERT INTO public.usuarios (id, nombre, empresa_id, rol)
          VALUES (user_id, user_name, new_empresa_id, 'admin');
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        */
      const { error: rpcError } = await supabase.rpc('create_company_and_admin_profile', {
        user_id: signUpData.user.id,
        user_name: nombre,
        company_name: nombreEmpresa,
      });

      if (rpcError) {
        setError(`Registro fallido: ${rpcError.message}. Por favor, contacta a soporte.`);
      } else {
        setMessage('¡Éxito! Por favor, revisa tu correo electrónico para confirmar tu registro.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isLogin ? 'Bienvenido de Nuevo' : 'Crear Cuenta'}
        </h2>
        
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md mb-4">{error}</p>}
        {message && <p className="bg-green-500/20 text-green-400 p-3 rounded-md mb-4">{message}</p>}

        <form onSubmit={isLogin ? handleLogin : handleSignUp}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2" htmlFor="nombreEmpresa">Nombre de la Empresa</label>
                <input
                  type="text"
                  id="nombreEmpresa"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-primary-800"
          >
            {loading ? <Spinner /> : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6">
          {isLogin ? "¿No tienes una cuenta?" : '¿Ya tienes una cuenta?'}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary-400 hover:underline ml-2 font-semibold">
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
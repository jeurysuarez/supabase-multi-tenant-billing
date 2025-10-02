import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const AuthPage: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  // Prevent flash of login page for authenticated users
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If session is loaded and exists, we should be redirected by useEffect.
  // This helps prevent showing the form for a split second before redirect.
  if (session) {
    return null;
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // The AuthProvider's onAuthStateChange listener will handle the session
      // and redirect will happen via the useEffect hook.
      // But we can navigate immediately for better UX.
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-center">FacturaPro</h1>
          <h2 className="mt-2 text-xl text-center text-gray-400">
            Inicia sesión en tu cuenta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm">{error}</p>}
          
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="password"className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Contraseña"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? <Spinner /> : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

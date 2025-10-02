import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            FacturaPro
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Bienvenido. Inicia sesión para acceder a tu cuenta.
          </p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#8B5CF6',
                  brandAccent: '#7C3AED',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#374151',
                  defaultButtonBackgroundHover: '#4B5563',
                  defaultButtonBorder: 'rgb(63, 63, 70)',
                  defaultButtonText: 'white',
                  dividerBackground: '#4B5563',
                  inputBackground: '#1F2937',
                  inputBorder: '#4B5563',
                  inputBorderHover: '#6B7280',
                  inputBorderFocus: '#8B5CF6',
                  inputText: 'white',
                  inputLabelText: '#D1D5DB',
                  inputPlaceholder: '#6B7280',
                  messageText: '#9CA3AF',
                  messageTextDanger: '#F87171',
                  anchorTextColor: '#A78BFA',
                  anchorTextColorHover: '#C4B5FD',
                }
              }
            }
          }}
          view="sign_in" // Only show sign in form. No public sign up.
          showLinks={true} // Shows forgot password link
          providers={[]} // No social providers
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo Electrónico',
                password_label: 'Contraseña',
                email_input_placeholder: 'tu.email@ejemplo.com',
                password_input_placeholder: 'Tu contraseña',
                button_label: 'Iniciar Sesión',
                loading_button_label: 'Iniciando sesión...',
                link_text: undefined, // Hides the "Don't have an account? Sign up" link
              },
              forgotten_password: {
                email_label: 'Correo Electrónico',
                email_input_placeholder: 'tu.email@ejemplo.com',
                button_label: 'Enviar instrucciones de recuperación',
                loading_button_label: 'Enviando...',
                link_text: '¿Olvidaste tu contraseña?',
                confirmation_text: 'Revisa tu correo para el enlace de recuperación de contraseña.'
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;

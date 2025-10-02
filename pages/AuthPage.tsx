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

  // SVG Logo Component
  const Logo = () => (
    <svg 
      className="w-12 h-12 mx-auto text-primary-600" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl border border-slate-200/50">
        <div className="text-center">
          <Logo />
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            FacturaPro
          </h1>
          <p className="mt-2 text-sm text-slate-500">
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
                  brand: '#2563eb',
                  brandAccent: '#1d4ed8',
                  brandButtonText: 'white',
                  defaultButtonBackground: 'white',
                  defaultButtonBackgroundHover: '#f8fafc',
                  defaultButtonBorder: 'rgb(203 213 225)',
                  defaultButtonText: 'rgb(30 41 59)',
                  dividerBackground: '#e2e8f0',
                  inputBackground: 'transparent',
                  inputBorder: 'rgb(203 213 225)',
                  inputBorderHover: 'rgb(148 163 184)',
                  inputBorderFocus: '#2563eb',
                  inputText: 'rgb(15 23 42)',
                  inputLabelText: 'rgb(51 65 85)',
                  inputPlaceholder: 'rgb(100 116 139)',
                  messageText: '#64748b',
                  messageTextDanger: '#dc2626',
                  anchorTextColor: '#1d4ed8',
                  // FIX: Corrected typo `anchorTextColorHover` to `anchorTextHoverColor` to match the correct theme property.
                  anchorTextHoverColor: '#1e3a8a',
                }
              }
            }
          }}
          view="sign_in"
          showLinks={true}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo Electrónico',
                password_label: 'Contraseña',
                email_input_placeholder: 'tu.email@ejemplo.com',
                password_input_placeholder: 'Tu contraseña',
                button_label: 'Iniciar Sesión',
                loading_button_label: 'Iniciando sesión...',
                link_text: undefined,
              },
              forgotten_password: {
                email_label: 'Correo Electrónico',
                email_input_placeholder: 'tu.email@ejemplo.com',
                button_label: 'Enviar instrucciones',
                loading_button_label: 'Enviando...',
                link_text: '¿Olvidaste tu contraseña?',
                confirmation_text: 'Revisa tu correo para el enlace de recuperación.'
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;
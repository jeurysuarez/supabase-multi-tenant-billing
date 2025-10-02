import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Usuario } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Usuario | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// FIX: Export AuthContext to be used in other files, specifically in the custom hook `hooks/useAuth.ts`.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // This function checks for a profile and handles the case where it's missing.
  const checkUserProfile = async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data: userProfile, error } = await supabase
      .from('usuarios')
      .select('*, empresa:empresas(*)')
      .eq('id', user.id)
      .single();
    
    // PGRST116: Supabase error for "exact one row not found"
    if (error && error.code !== 'PGRST116') {
        console.error("Error al obtener el perfil de usuario:", error);
        setProfile(null);
        await supabase.auth.signOut(); // Sign out on error
        return;
    }

    if (userProfile) {
      setProfile(userProfile as Usuario);
    } else {
      // If no profile is found for an authenticated user, sign them out.
      // This prevents an infinite redirect loop between AuthPage and ProtectedRoute.
      setProfile(null);
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await checkUserProfile(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(true);
        await checkUserProfile(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle setting session, user, and profile to null.
  };

  const value = {
    session,
    user,
    profile,
    loading,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

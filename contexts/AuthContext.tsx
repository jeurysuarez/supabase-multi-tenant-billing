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

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('*, empresa:empresas(*)')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile as Usuario);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
           const { data: userProfile } = await supabase
            .from('usuarios')
            .select('*, empresa:empresas(*)')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile as Usuario);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
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

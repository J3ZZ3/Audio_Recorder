import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext({});

const ACCESS_TOKEN_KEY = 'supabase.access.token';
const REFRESH_TOKEN_KEY = 'supabase.refresh.token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        if (session?.access_token && session?.refresh_token) {
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.access_token);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refresh_token);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setUser(session?.user ?? null);
      if (session?.access_token && session?.refresh_token) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refresh_token);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp: async (data) => {
      const response = await supabase.auth.signUp(data);
      return response;
    },
    signIn: async (data) => {
      const response = await supabase.auth.signInWithPassword(data);
      return response;
    },
    signOut: async () => {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      return await supabase.auth.signOut();
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
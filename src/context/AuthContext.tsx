import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: UserRole) => void;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'chargeos_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isSupabaseActive = isSupabaseConfigured();

  // Load existing user or seed initial active user
  useEffect(() => {
    const initAuth = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase session load error:', err);
        }
      }

      // Check local storage session
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        // Provide a default active driver session for rapid first-touch testing
        const defaultDriver: UserProfile = {
          id: 'usr-driver-priya',
          email: 'priya.sharma@mumbai-ev.in',
          full_name: 'Priya Sharma',
          phone: '+91 98200 87654',
          role: 'driver',
          default_search_radius_km: 15,
          currency: 'INR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setUser(defaultDriver);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultDriver));
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'password123'
        });
        if (error) {
          // If remote login fails, continue with local simulation
          console.warn('Remote Supabase auth failed, using local auth session:', error.message);
        } else if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            setUser(profile);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
            setLoading(false);
            return { success: true };
          }
        }
      } catch (err) {
        console.warn('Supabase signIn catch error:', err);
      }
    }

    // Local authentication fallback
    const targetRole = role || 'driver';
    const profile: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      phone: '+91 98200 12345',
      role: targetRole,
      default_search_radius_km: 15,
      currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(profile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    setLoading(false);
    return { success: true };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role }
          }
        });
        if (error) {
          console.warn('Supabase remote sign up error:', error.message);
        } else if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            role,
            default_search_radius_km: 15,
            currency: 'INR',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          await supabase.from('profiles').insert([newProfile]);
          setUser(newProfile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
          setLoading(false);
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase signUp catch error:', err);
      }
    }

    // Local profile creation
    const newProfile: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      default_search_radius_km: 15,
      currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setUser(newProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...updates,
      updated_at: new Date().toISOString()
    };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (err) {
        console.warn('Supabase update profile error:', err);
      }
    }
  };

  // Helper for quick testing between Driver, Operator, and Fleet Manager roles
  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    updateProfile({ role: newRole });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchRole,
        isSupabaseActive
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

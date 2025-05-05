import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserProfile = {
  userid: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  roles: string[];
  isStaff?: boolean;
  isDoctor?: boolean;
  doctorId?: number;
  specialization?: string;
  qualification?: string;
  isCustomer?: boolean;
  customerId?: number;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  profile_picture?: string;
  profile_completed?: boolean;
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    [key: string]: any;
  };
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string, userData: any) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isDoctor: () => boolean;
  isCustomer: () => boolean;
  refreshProfile: () => Promise<void>;
  isProfileComplete: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      // Use the get_user_profile_details function for enhanced profile details
      const { data, error } = await supabase.rpc('get_user_profile_details', { p_user_id: userId });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        // Fixed: Check if data is an object with a success property
        if (typeof data === 'object' && data !== null && 'success' in data) {
          if (data.success) {
            // Type assertion to help TypeScript understand the structure
            const profileData = data as Record<string, any>;
            // Remove success flag and use the rest of the data
            const { success, ...userData } = profileData;
            setUserProfile(userData as UserProfile);
          }
        } else {
          // Handle case where data doesn't have expected structure
          console.error('Unexpected data format from get_user_profile_details');
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Use setTimeout to avoid potential infinite recursion with Supabase
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const isProfileComplete = () => {
    return !!userProfile?.profile_completed;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        }
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      return { data, error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error updating password:', error);
      return { data: null, error };
    }
  };

  const hasRole = (role: string): boolean => {
    if (!userProfile || !userProfile.roles) return false;
    return userProfile.roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('Admin');
  };

  const isStaff = (): boolean => {
    return hasRole('Staff') || isAdmin();
  };

  const isDoctor = (): boolean => {
    return !!userProfile?.isDoctor;
  };

  const isCustomer = (): boolean => {
    return !!userProfile?.isCustomer;
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    isAdmin,
    isStaff,
    isDoctor,
    isCustomer,
    refreshProfile,
    isProfileComplete
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

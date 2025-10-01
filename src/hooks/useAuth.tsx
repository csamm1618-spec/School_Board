import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, getUserSchoolInfo, UserProfile, isSupabaseConfigured } from '../lib/supabaseClient';

// Debug utility that only logs in development
const debugLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

const debugError = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

type AuthContextValue = {
  user: User | null;
  userProfile: UserProfile | null;
  schoolId: string | undefined;
  schoolName: string | undefined;
  schoolLogoUrl: string | undefined;
  profileName: string | undefined;
  userRole: 'owner' | 'staff';
  loading: boolean;
  signOut: () => Promise<void>;
  refetchUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const useProvideAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        debugError('Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 15000); // 15 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, [loading]);

    useEffect(() => {
      // If Supabase isn't configured, expose a safe, non-authenticated state and exit early
      if (!isSupabaseConfigured) {
        debugError('Supabase not configured. Skipping auth initialization.');
        setUser(null);
        setLoading(false);
        return;
      }
      const initializeAuth = async () => {
      try {
        debugLog('Initializing auth...');
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        debugLog('Session:', session ? 'Found' : 'None');
        setUser(session?.user ?? null);
        if (session?.user) {
          debugLog('Loading user profile for:', session.user.id);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        debugError('Error initializing auth:', error);
      } finally {
        debugLog('Auth initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          debugLog('Auth state changed:', _event, session ? 'Session found' : 'No session');
          setLoading(true);
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          debugError('Error in auth state change:', error);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

    const loadUserProfile = async (userId: string, retryCount = 0) => {
      if (!isSupabaseConfigured) {
        debugError('Supabase not configured. Skipping profile load.');
        setUserProfile(null);
        return;
      }
    const abortController = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds between retries

    try {
      debugLog('Loading profile for user:', userId, 'Attempt:', retryCount + 1);

      // Set up timeout with AbortController for proper cancellation
      timeoutId = setTimeout(() => {
        debugError('Profile loading timed out after 10 seconds');
        abortController.abort();
      }, 10000);

      const profile = await getUserSchoolInfo(userId, abortController.signal);
      debugLog('Profile loaded:', profile ? 'Found' : 'None');

      // Clear timeout since request completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // If no profile exists yet, retry a few times
      // This handles cases where profile creation is still in progress
      if (!profile && retryCount < MAX_RETRIES) {
        debugLog(`Profile not found, retrying in ${RETRY_DELAY}ms (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return loadUserProfile(userId, retryCount + 1);
      }

      // Type-safe profile validation and role assignment
      if (profile) {
        // Ensure profile has a role, default to 'staff' if missing
        if (!profile.role) {
          profile.role = 'staff';
        }
        setUserProfile(profile);
      } else {
        // After all retries, if still no profile, set to null
        debugError('Profile not found after all retries');
        setUserProfile(null);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        debugError('Profile loading timed out');
        // Retry on timeout if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES) {
          debugLog(`Timeout occurred, retrying (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return loadUserProfile(userId, retryCount + 1);
        }
      } else {
        debugError('Error loading user profile:', error);
      }

      // Don't set a default profile with empty school_id - let it be null
      // This will properly trigger the "School Information Missing" message
      setUserProfile(null);
    } finally {
      // Only clean up timeout, don't abort the controller if request succeeded
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };

    const signOut = async () => {
try {
if (isSupabaseConfigured) {
await supabase.auth.signOut();
}
} catch (e) {
if (import.meta.env.DEV) console.error('Sign out failed:', e);
} finally {
// Clear local state immediately so UI updates at once
setUser(null);
setUserProfile(null);
}
};

    const refetchUserProfile = async () => {
      if (!isSupabaseConfigured) return;
      if (user) {
        await loadUserProfile(user.id);
      }
    };

  return {
    user,
    userProfile,
    schoolId: userProfile?.school_id,
    schoolName: userProfile?.school?.name,
    schoolLogoUrl: userProfile?.school?.logo_url,
    profileName: userProfile?.profile_name,
    userRole: (userProfile?.role as 'owner' | 'staff') || 'staff',
    loading,
    signOut,
    refetchUserProfile,
  } as AuthContextValue;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useProvideAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

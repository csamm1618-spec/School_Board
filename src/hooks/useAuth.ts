import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, getUserSchoolInfo, UserProfile } from '../lib/supabaseClient';

// Debug utility that only logs in development
const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const debugError = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        debugError('⚠️ Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 15000); // 15 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, [loading]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        debugLog('🔍 Initializing auth...');
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        debugLog('📱 Session:', session ? 'Found' : 'None');
        setUser(session?.user ?? null);
        if (session?.user) {
          debugLog('👤 Loading user profile for:', session.user.id);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        debugError('❌ Error initializing auth:', error);
      } finally {
        debugLog('✅ Auth initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          debugLog('🔄 Auth state changed:', _event, session ? 'Session found' : 'No session');
          setLoading(true);
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          debugError('❌ Error in auth state change:', error);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      debugLog('👤 Loading profile for user:', userId);
      
      // Set up timeout with AbortController for proper cancellation
      timeoutId = setTimeout(() => {
        debugError('⏰ Profile loading timed out after 10 seconds');
        abortController.abort();
      }, 10000); // Increased timeout to 10 seconds
      
      const profile = await getUserSchoolInfo(userId, abortController.signal);
      debugLog('📋 Profile loaded:', profile ? 'Found' : 'None');

      // Clear timeout since request completed successfully
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // If no profile exists yet, create one
      // The AuthPage now handles school creation and user profile linking during signup.
      // If a profile is missing here, it indicates an issue or a user signed up externally.

      // Type-safe profile validation and role assignment
      if (profile) {
        // Ensure profile has a role, default to 'staff' if missing
        if (!profile.role) {
          profile.role = 'staff';
        }
        setUserProfile(profile);
      } else {
        // Handle null profile explicitly
        setUserProfile(null);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        debugError('⏰ Profile loading timed out');
      } else {
        debugError('❌ Error loading user profile:', error);
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
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const refetchUserProfile = async () => {
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
    userRole: userProfile?.role || 'staff',
    loading, 
    signOut,
    refetchUserProfile
  };
};
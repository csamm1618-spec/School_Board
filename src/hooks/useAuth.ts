import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserSchoolInfo, UserProfile } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setLoading(true);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      let profile = await getUserSchoolInfo(userId);

      // If no profile exists yet, create one
      // The AuthPage now handles school creation and user profile linking during signup.
      // If a profile is missing here, it indicates an issue or a user signed up externally.

      // Ensure profile has a role, default to 'staff' if missing
      if (profile && !profile.role) {
        profile.role = 'staff';
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Set a default profile structure to prevent infinite loading
      setUserProfile({
        id: '',
        user_id: userId,
        school_id: '',
        role: 'staff',
        created_at: new Date().toISOString()
      });
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
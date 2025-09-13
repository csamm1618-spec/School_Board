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

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
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
    profileName: userProfile?.profile_name,
    loading, 
    signOut,
    refetchUserProfile
  };
};
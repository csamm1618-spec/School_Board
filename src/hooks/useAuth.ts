import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserSchoolInfo, createUserProfile, UserProfile, getSchools } from '../lib/supabaseClient';

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
      async (event, session) => {
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
      if (!profile) {
        // Get the first available school as default
        const schools = await getSchools();
        if (schools.length === 0) {
          throw new Error('No schools available. Please contact administrator.');
        }
        
        const defaultSchoolId = schools[0].id;
        profile = await createUserProfile(userId, defaultSchoolId);
      }

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

  return { 
    user, 
    userProfile, 
    schoolId: userProfile?.school_id,
    schoolName: userProfile?.school?.name,
    loading, 
    signOut 
  };
};
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserSchoolInfo, createUserProfile, UserProfile } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
  try {
    let profile = await getUserSchoolInfo(userId);

    // If no profile exists yet, create one
    if (!profile) {
      // ⚡ You can choose how to assign schoolId here
      // For now, let’s assume you have a "default" schoolId
      const defaultSchoolId = "YOUR_DEFAULT_SCHOOL_ID";  

      profile = await createUserProfile(userId, defaultSchoolId);
    }

    setUserProfile(profile);
  } catch (error) {
    console.error('Error loading user profile:', error);
    setUserProfile(null);
  } finally {
    setLoading(false);
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
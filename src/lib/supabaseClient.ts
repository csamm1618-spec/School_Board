import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Check if environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface School {
  id: string;
  name: string;
  location: string;
  logo_url?: string;
  created_at: string;
}

export type Role = 'owner' | 'staff';

export interface UserProfile {
  id: string;
  user_id: string;
  school_id: string;
  profile_name?: string;
  role: Role;
  created_at: string;
  school?: School;
}

export interface Parent {
  id: string;
  parent_name: string;
  phone_number: string;
  email?: string;
  relationship: string;
  school_id: string;
  created_at: string;
  school?: School;
}

export interface Student {
  id: string;
  student_name: string;
  grade: string;
  date_of_birth?: string;
  school_id: string;
  created_at: string;
  school?: School;
}

export interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
  school_id: string;
  created_at: string;
  parent?: Parent;
  student?: Student;
  school?: School;
}

// Helper function to get user's school info
export const getUserSchoolInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      school:schools(*)
    `)
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Helper function to create user profile for new signups
export const createUserProfile = async (userId: string, schoolId: string, profileName?: string, role: Role = 'owner') => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{user_id: userId, school_id: schoolId, profile_name: profileName, role}])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to get all schools
export const getSchools = async () => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// Helper function to create a new school
export const createSchool = async (schoolName: string, location?: string) => {
  const { data, error } = await supabase
    .from('schools')
    .insert([{ name: schoolName, location: location || '' }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to upload school logo
export const uploadSchoolLogo = async (schoolId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${schoolId}-logo-${Date.now()}.${fileExt}`;
    const filePath = `school-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('school-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('school-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading school logo:', error);
    throw error;
  }
};

// Helper function to update school logo URL
export const updateSchoolLogo = async (schoolId: string, logoUrl: string) => {
  const { data, error } = await supabase
    .from('schools')
    .update({ logo_url: logoUrl })
    .eq('id', schoolId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const sendWelcomeSMS = async (parentName: string, phoneNumber: string) => {
  try {
    const message = `Welcome to our school, ${parentName}! Thank you for onboarding. We're excited to have your family as part of our school community. 🎓`;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message,
        type: 'welcome',
        parentName
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending welcome SMS:', error);
    throw error;
  }
};

export const sendBulkSMS = async (phoneNumbers: string[], message: string) => {
  try {
    const promises = phoneNumbers.map(phoneNumber => 
      fetch(`${supabaseUrl}/functions/v1/send-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          type: 'bulk'
        })
      })
    );

    const responses = await Promise.allSettled(promises);
    return responses;
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    throw error;
  }
};
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingVars: string[] = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = missingVars.length === 0;

if (!isSupabaseConfigured) {
  console.warn(
    `Supabase environment variables missing: ${missingVars.join(
      ', '
    )}. The application will run in a limited mode until they are provided.`
  );
}

let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = (): SupabaseClient => {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Supabase client requested before environment was configured. Missing: ${missingVars.join(', ')}`
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
};

export const getSupabaseClient = (): SupabaseClient => createSupabaseClient();

// Proxy to lazily instantiate the client while keeping existing import sites unchanged.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = createSupabaseClient();
    const value = (client as any)[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

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
  email?: string;
  role: Role;
  created_at: string;
  school?: School;
  invite_token?: string;
  status: 'pending' | 'active' | 'suspended';
  invited_by?: string;
  invited_at?: string;
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
export const getUserSchoolInfo = async (userId: string, signal?: AbortSignal) => {
  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      school:schools(*)
    `)
    .eq('user_id', userId);

  if (signal) {
    query = query.abortSignal(signal);
  }

  const { data, error } = await query.maybeSingle();

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

// Helper function to create a staff invite
export const createStaffInvite = async (
  schoolId: string, 
  staffName: string, 
  staffEmail: string, 
  invitedBy: string
) => {
  const { generateInviteToken } = await import('../utils/inviteTokens');
  const inviteToken = generateInviteToken();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      school_id: schoolId,
      profile_name: staffName,
      email: staffEmail,
      role: 'staff',
      invite_token: inviteToken,
      status: 'pending',
      invited_by: invitedBy,
      invited_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to get staff invite by token
export const getStaffInviteByToken = async (token: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      school:schools(*)
    `)
    .eq('invite_token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Helper function to accept staff invite
export const acceptStaffInvite = async (token: string, userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      user_id: userId,
      status: 'active',
      invite_token: null
    })
    .eq('invite_token', token)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to get all staff for a school
export const getSchoolStaff = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      school:schools(*),
      invited_by_profile:user_profiles!invited_by(profile_name, role)
    `)
    .eq('school_id', schoolId)
    .in('role', ['staff'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Helper function to update staff status
export const updateStaffStatus = async (profileId: string, status: 'active' | 'suspended') => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ status })
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Helper function to resend invite (generate new token)
export const resendStaffInvite = async (profileId: string) => {
  const { generateInviteToken } = await import('../utils/inviteTokens');
  const newToken = generateInviteToken();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      invite_token: newToken,
      invited_at: new Date().toISOString()
    })
    .eq('id', profileId)
    .select()
    .single();

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

// Strict variants that treat non-2xx responses as failures and avoid mojibake
export const sendWelcomeSMSStrict = async (parentName: string, phoneNumber: string) => {
  const message = `Welcome to our school, ${parentName}! Thank you for onboarding. We're excited to have your family as part of our school community.`;
  const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to: phoneNumber, message, type: 'welcome', parentName })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`SMS gateway responded with ${response.status}: ${text}`);
  }
  return response.json().catch(() => ({}));
};

export const sendBulkSMSStrict = async (phoneNumbers: string[], message: string) => {
  const promises = phoneNumbers.map(async (to) => {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message, type: 'bulk' })
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`SMS gateway responded with ${response.status}: ${text}`);
    }
    return response.json().catch(() => ({}));
  });
  return Promise.allSettled(promises);
};

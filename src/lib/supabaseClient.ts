import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Parent {
  id: string;
  parent_name: string;
  phone_number: string;
  email?: string;
  relationship: string;
  created_at: string;
}

export interface Student {
  id: string;
  student_name: string;
  grade: string;
  date_of_birth?: string;
  created_at: string;
}

export interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
  parent?: Parent;
  student?: Student;
}

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
/*
  # Fix Profile Access Policies

  1. Policy Changes
    - Drop the overly restrictive "Staff can view other staff" policy
    - Add policy for users to read their own profile data
    - Add policy for staff/owners to view other staff within their school
  
  2. Security
    - Maintains proper access control
    - Allows efficient self-profile lookups
    - Preserves school-based isolation
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Staff can view other staff" ON public.user_profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow staff/owners to view other staff members within their school
CREATE POLICY "Staff can view school staff"
ON public.user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.school_id = user_profiles.school_id
  )
);
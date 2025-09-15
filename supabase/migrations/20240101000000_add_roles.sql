-- Add role column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN role text DEFAULT 'staff' CHECK (role IN ('owner', 'staff'));

-- Update existing users to have owner role (since they created the school)
UPDATE public.user_profiles SET role = 'owner' WHERE role IS NULL;

-- Add RLS policies for role-based access
-- Only owners can manage staff
CREATE POLICY "Only owners can manage staff roles"
ON public.user_profiles
FOR UPDATE
USING (
  user_id = auth.uid() AND role = 'owner'
);

-- Only owners can remove staff
CREATE POLICY "Only owners can remove staff"
ON public.user_profiles
FOR DELETE
USING (
  user_id = auth.uid() AND role = 'owner'
);

-- Staff can only view other staff members
CREATE POLICY "Staff can view other staff"
ON public.user_profiles
FOR SELECT
USING (
  school_id = (
    SELECT school_id FROM public.user_profiles 
    WHERE user_id = auth.uid()
  )
);

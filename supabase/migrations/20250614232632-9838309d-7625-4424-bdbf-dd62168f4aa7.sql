
-- Helper function to get the doctor ID of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_current_doctor_id()
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT d.doctorid 
  FROM public.doctors d
  WHERE d.email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())
  LIMIT 1;
$$;

-- Helper function to get the user ID of the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT u.userid 
  FROM public.users u
  WHERE u.email = (SELECT au.email FROM auth.users au WHERE au.id = auth.uid())
  LIMIT 1;
$$;

-- Enable Row Level Security on patient_referrals table
ALTER TABLE public.patient_referrals ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: 
-- Doctors can see referrals they sent or received.
-- Patients can see their own referrals.
CREATE POLICY "Doctors and patients can view their own referrals"
ON public.patient_referrals
FOR SELECT
USING (
  (referring_doctor_id = public.get_current_doctor_id()) OR
  (referred_to_doctor_id = public.get_current_doctor_id()) OR
  (patient_id = public.get_current_user_id())
);

-- Policy for INSERT:
-- Only the referring doctor can create a referral.
CREATE POLICY "Referring doctors can create referrals"
ON public.patient_referrals
FOR INSERT
WITH CHECK (
  referring_doctor_id = public.get_current_doctor_id()
);

-- Policy for UPDATE:
-- The referring doctor can cancel, the referred-to doctor can update status/date.
CREATE POLICY "Involved doctors can update referrals"
ON public.patient_referrals
FOR UPDATE
USING (
  (referring_doctor_id = public.get_current_doctor_id()) OR
  (referred_to_doctor_id = public.get_current_doctor_id())
);

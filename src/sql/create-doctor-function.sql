
-- Function to create a doctor record from an existing user
CREATE OR REPLACE FUNCTION public.create_doctor_from_user(
  p_user_id INTEGER,
  p_specialization TEXT,
  p_qualification TEXT,
  p_consultation_fee NUMERIC DEFAULT 500.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
  v_doctor_id INTEGER;
BEGIN
  -- Get user details
  SELECT * INTO v_user_record FROM users WHERE userid = p_user_id;
  
  IF v_user_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Create doctor record
  INSERT INTO doctors (
    userid, 
    firstname, 
    lastname, 
    email,
    specialization, 
    qualification, 
    consultationfee, 
    isactive
  ) VALUES (
    v_user_record.userid,
    v_user_record.firstname,
    v_user_record.lastname,
    v_user_record.email,
    p_specialization,
    p_qualification,
    p_consultation_fee,
    TRUE
  )
  RETURNING doctorid INTO v_doctor_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Doctor record created', 
    'doctorid', v_doctor_id
  );
END;
$$;

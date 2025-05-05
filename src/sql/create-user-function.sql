
-- Function to create a new user with role assignment
CREATE OR REPLACE FUNCTION public.create_user(
  p_firstname TEXT,
  p_lastname TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_username TEXT,
  p_passwordhash TEXT,
  p_role TEXT,
  p_isactive BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id INTEGER;
  v_role_id INTEGER;
  v_result JSONB;
BEGIN
  -- First, try to get role ID
  SELECT roleid INTO v_role_id FROM userroles WHERE rolename = p_role;
  
  IF v_role_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid role specified');
  END IF;
  
  -- Check if email or username already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email already in use');
  END IF;
  
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Username already in use');
  END IF;
  
  -- Insert new user
  INSERT INTO users (
    firstname,
    lastname,
    email,
    phone,
    address,
    username,
    passwordhash,
    isactive,
    datecreated
  ) VALUES (
    p_firstname,
    p_lastname,
    p_email,
    p_phone,
    p_address,
    p_username,
    p_passwordhash,
    p_isactive,
    CURRENT_TIMESTAMP
  )
  RETURNING userid INTO v_user_id;
  
  -- Assign role to the user
  INSERT INTO userrolemapping (userid, roleid)
  VALUES (v_user_id, v_role_id);
  
  -- Create customer profile if role is Customer
  IF p_role = 'Customer' THEN
    INSERT INTO customerprofiles (customerid)
    VALUES (v_user_id);
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'User created successfully', 
    'userid', v_user_id
  );
END;
$$;

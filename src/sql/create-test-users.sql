
-- Create test users with different roles
-- Note: Run this SQL query in the Supabase SQL Editor to create test users

-- Create function to easily create test users with roles
CREATE OR REPLACE FUNCTION create_test_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT
) RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
  v_response JSON;
  v_role_id INTEGER;
  v_user_db_id INTEGER;
BEGIN
  -- Create auth user
  SELECT
    auth.sign_up(p_email, p_password, '{"role":"' || p_role || '","first_name":"' || p_first_name || '","last_name":"' || p_last_name || '"}')
  INTO v_response;
  
  v_user_id := (v_response->>'user')::json->>'id';
  
  -- Confirm user immediately (for testing purposes)
  UPDATE auth.users SET email_confirmed_at = now() WHERE id = v_user_id;
  
  -- Return success message
  RETURN 'Created user ' || p_email || ' with role ' || p_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create test users
SELECT create_test_user('admin@example.com', 'Password123!', 'Admin', 'User', 'Admin');
SELECT create_test_user('staff@example.com', 'Password123!', 'Staff', 'User', 'Staff');
SELECT create_test_user('doctor@example.com', 'Password123!', 'Doctor', 'User', 'Staff');
SELECT create_test_user('lab@example.com', 'Password123!', 'Lab', 'Technician', 'LabTechnician');
SELECT create_test_user('customer@example.com', 'Password123!', 'John', 'Customer', 'Customer');

-- Create doctor record for the doctor user
DO $$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- Get the user ID for the doctor email
  SELECT userid INTO v_user_id FROM users WHERE email = 'doctor@example.com';
  
  -- Create doctor record
  INSERT INTO doctors (userid, firstname, lastname, specialization, qualification, consultationfee, isactive)
  VALUES (v_user_id, 'Doctor', 'User', 'General Medicine', 'MD', 500.00, TRUE)
  ON CONFLICT DO NOTHING;
END;
$$;


-- First, fix the users table to have auto-incrementing userid
ALTER TABLE users ALTER COLUMN userid SET DEFAULT nextval('users_userid_seq'::regclass);

-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS users_userid_seq OWNED BY users.userid;

-- Set the sequence to start from the next available number
SELECT setval('users_userid_seq', COALESCE((SELECT MAX(userid) FROM users), 0) + 1);

-- Create test users using a safer approach
-- First check if users already exist, then create only if they don't

DO $$
DECLARE
  test_users TEXT[] := ARRAY['admin@example.com', 'staff@example.com', 'doctor@example.com', 'lab@example.com', 'customer@example.com'];
  user_email TEXT;
  user_exists BOOLEAN;
BEGIN
  FOREACH user_email IN ARRAY test_users
  LOOP
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) INTO user_exists;
    
    IF NOT user_exists THEN
      -- Create the user based on email
      IF user_email = 'admin@example.com' THEN
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
          'admin@example.com', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          '{"first_name":"Admin","last_name":"User","role":"Admin"}', false
        );
      ELSIF user_email = 'staff@example.com' THEN
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
          'staff@example.com', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          '{"first_name":"Staff","last_name":"User","role":"Staff"}', false
        );
      ELSIF user_email = 'doctor@example.com' THEN
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
          'doctor@example.com', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          '{"first_name":"Doctor","last_name":"User","role":"Doctor"}', false
        );
      ELSIF user_email = 'lab@example.com' THEN
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
          'lab@example.com', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          '{"first_name":"Lab","last_name":"Technician","role":"LabTechnician"}', false
        );
      ELSIF user_email = 'customer@example.com' THEN
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
          created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
          'customer@example.com', crypt('Password123!', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}',
          '{"first_name":"John","last_name":"Customer","role":"Customer"}', false
        );
      END IF;
    END IF;
  END LOOP;
END $$;

-- Sync users to our database tables (only create if they don't exist)
INSERT INTO users (
  username, passwordhash, email, firstname, lastname, datecreated, isactive, profile_completed
)
SELECT 
  au.email, 'supabase_auth', au.email,
  au.raw_user_meta_data->>'first_name',
  au.raw_user_meta_data->>'last_name',
  now(), true, true
FROM auth.users au
WHERE au.email IN ('admin@example.com', 'staff@example.com', 'doctor@example.com', 'lab@example.com', 'customer@example.com')
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = au.email);

-- Assign roles (only if mapping doesn't exist)
INSERT INTO userrolemapping (userid, roleid)
SELECT u.userid, ur.roleid
FROM users u
JOIN auth.users au ON u.email = au.email
JOIN userroles ur ON ur.rolename = au.raw_user_meta_data->>'role'
WHERE u.email IN ('admin@example.com', 'staff@example.com', 'doctor@example.com', 'lab@example.com', 'customer@example.com')
AND NOT EXISTS (SELECT 1 FROM userrolemapping urm WHERE urm.userid = u.userid AND urm.roleid = ur.roleid);

-- Create customer profile (only if doesn't exist)
INSERT INTO customerprofiles (customerid)
SELECT u.userid
FROM users u
JOIN auth.users au ON u.email = au.email
WHERE au.raw_user_meta_data->>'role' = 'Customer'
AND u.email = 'customer@example.com'
AND NOT EXISTS (SELECT 1 FROM customerprofiles cp WHERE cp.customerid = u.userid);

-- Create doctor record (only if doesn't exist)
INSERT INTO doctors (userid, firstname, lastname, email, specialization, qualification, consultationfee, isactive)
SELECT u.userid, u.firstname, u.lastname, u.email, 'General Medicine', 'MD', 500.00, true
FROM users u
JOIN auth.users au ON u.email = au.email
WHERE au.raw_user_meta_data->>'role' = 'Doctor'
AND u.email = 'doctor@example.com'
AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.userid = u.userid);

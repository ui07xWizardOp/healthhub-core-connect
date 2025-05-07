
-- Update auth trigger function to assign roles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id INT;
  role_name TEXT;
  role_id INT;
BEGIN
  -- Extract role from metadata if provided, default to Customer
  role_name := COALESCE(new.raw_user_meta_data->>'role', 'Customer');
  
  -- Insert into users table
  INSERT INTO public.users (
    username, 
    passwordhash, 
    email, 
    phone, 
    firstname, 
    lastname, 
    datecreated,
    isactive
  ) VALUES (
    new.email, -- Use email as username initially
    'supabase_auth', -- Placeholder since actual password is managed by Supabase Auth
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    now(),
    TRUE
  ) RETURNING userid INTO new_user_id;
  
  -- Get role ID
  SELECT roleid INTO role_id FROM userroles WHERE rolename = role_name;
  
  -- If role exists, assign it to the user
  IF role_id IS NOT NULL THEN
    INSERT INTO public.userrolemapping (userid, roleid)
    VALUES (new_user_id, role_id);
    
    -- Also create a customer profile record if the role is Customer
    IF role_name = 'Customer' THEN
      INSERT INTO public.customerprofiles (customerid)
      VALUES (new_user_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run this function after an auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

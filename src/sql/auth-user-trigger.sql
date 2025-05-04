
-- This trigger function will insert a row into public.users whenever a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run this function after an auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

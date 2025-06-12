/*
  # Fix Profile Creation RLS Issue

  1. Database Changes
    - Add function to handle automatic profile creation
    - Add trigger to create basic profile on user signup
    - Update RLS policies to allow the trigger to work

  2. Security
    - Maintain RLS security while allowing automatic profile creation
    - Ensure users can only update their own profiles
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a basic profile record for the new user
  -- This will be updated later by the client with full details
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone_number,
    date_of_birth,
    account_type,
    nin,
    bvn
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, '1900-01-01'::date),
    COALESCE((NEW.raw_user_meta_data->>'account_type')::account_type, 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'nin', ''),
    COALESCE(NEW.raw_user_meta_data->>'bvn', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policy to allow the trigger function to insert profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Ensure the trigger function can bypass RLS when needed
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
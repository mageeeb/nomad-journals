-- Phase 1: Critical Database Security Fixes

-- Add published status to posts table for content control
ALTER TABLE public.posts ADD COLUMN published boolean DEFAULT false;

-- Enable Row Level Security on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts table
-- Public users can only view published posts
CREATE POLICY "Public can view published posts" 
ON public.posts 
FOR SELECT 
USING (published = true);

-- Authenticated users with admin role can do everything on posts
CREATE POLICY "Admins can manage all posts" 
ON public.posts 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Enable Row Level Security on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts table
-- Anyone can submit contact forms (INSERT only)
CREATE POLICY "Anyone can submit contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view contact submissions
CREATE POLICY "Admins can view contacts" 
ON public.contacts 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update profiles table to ensure user_id is not nullable (security requirement)
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Create a trigger to automatically create profile for new users with default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'employee')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
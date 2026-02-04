-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create emergency_services table for admin-managed services
CREATE TABLE public.emergency_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL CHECK (category IN ('hospital', 'ambulance', 'police', 'fire', 'ngo')),
    address text NOT NULL,
    phone text,
    latitude double precision,
    longitude double precision,
    is_active boolean NOT NULL DEFAULT true,
    rating double precision,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid
);

-- Enable RLS on emergency_services
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;

-- Anyone can view active emergency services
CREATE POLICY "Anyone can view active emergency services"
ON public.emergency_services
FOR SELECT
USING (is_active = true);

-- Admins can manage emergency services
CREATE POLICY "Admins can insert emergency services"
ON public.emergency_services
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update emergency services"
ON public.emergency_services
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete emergency services"
ON public.emergency_services
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all emergency services"
ON public.emergency_services
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on emergency_services
CREATE TRIGGER update_emergency_services_updated_at
BEFORE UPDATE ON public.emergency_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin SELECT policies on blood_donors and profiles for admin access
CREATE POLICY "Admins can view all blood donors"
ON public.blood_donors
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all blood donors"
ON public.blood_donors
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all blood donors"
ON public.blood_donors
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
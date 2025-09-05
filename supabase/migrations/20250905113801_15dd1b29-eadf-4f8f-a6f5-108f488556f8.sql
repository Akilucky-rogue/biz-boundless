-- Fix security vulnerabilities in RLS policies

-- Drop existing overly permissive policies for invoices
DROP POLICY "All users can view invoices" ON public.invoices;
DROP POLICY "All users can update invoices" ON public.invoices;

-- Create admin-only policies for invoices (financial data)
CREATE POLICY "Only admins can view invoices" 
ON public.invoices 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Only admins can update invoices" 
ON public.invoices 
FOR UPDATE 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Drop existing overly permissive policy for payments
DROP POLICY "All users can view payments" ON public.payments;

-- Create admin-only policy for payments (financial data)
CREATE POLICY "Only admins can view payments" 
ON public.payments 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Drop existing overly permissive policy for profiles
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Create more restrictive profile policy - users can only view their own profile, admins can view all
CREATE POLICY "Users can view own profile, admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  get_user_role(auth.uid()) = 'admin'::user_role
);

-- Ensure invoice items also follow admin-only access since they contain financial data
DROP POLICY "All users can view invoice items" ON public.invoice_items;

CREATE POLICY "Only admins can view invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);
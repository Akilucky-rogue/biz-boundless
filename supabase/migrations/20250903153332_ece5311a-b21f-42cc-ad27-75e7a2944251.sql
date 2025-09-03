-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'employee');

-- Create enum for product units
CREATE TYPE public.product_unit AS ENUM ('kg', 'gm', 'ltr', 'ml', 'pcs', 'box', 'pack');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue');

-- Create enum for invoice status
CREATE TYPE public.invoice_status AS ENUM ('draft', 'pending', 'paid', 'cancelled');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  gstin TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gstin TEXT,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table for product catalog
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  sku TEXT UNIQUE,
  barcode TEXT,
  unit product_unit NOT NULL DEFAULT 'pcs',
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  mrp DECIMAL(10,2),
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  hsn_code TEXT,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory batches table
CREATE TABLE public.inventory_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id),
  batch_number TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  remaining_quantity INTEGER NOT NULL DEFAULT 0,
  purchase_price DECIMAL(10,2) NOT NULL,
  expiry_date DATE,
  location TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  batch_id UUID REFERENCES public.inventory_batches(id),
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  reference_type TEXT, -- 'purchase', 'sale', 'adjustment'
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  status invoice_status DEFAULT 'draft',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status DEFAULT 'pending',
  due_date DATE,
  delivery_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  batch_id UUID REFERENCES public.inventory_batches(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash', 'card', 'upi', 'bank_transfer'
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer quotes table
CREATE TABLE public.customer_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quoted_price DECIMAL(10,2) NOT NULL,
  delivery_time_days INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_quotes ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for vendors (admin only)
CREATE POLICY "Only admins can view vendors" ON public.vendors FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Only admins can insert vendors" ON public.vendors FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Only admins can update vendors" ON public.vendors FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for customers (admin only)
CREATE POLICY "Only admins can view customers" ON public.customers FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Only admins can insert customers" ON public.customers FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Only admins can update customers" ON public.customers FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for categories
CREATE POLICY "All users can view categories" ON public.categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create RLS policies for products
CREATE POLICY "All users can view products" ON public.products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can insert products" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "All users can update products" ON public.products FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for inventory batches
CREATE POLICY "All users can view inventory" ON public.inventory_batches FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can insert inventory" ON public.inventory_batches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "All users can update inventory" ON public.inventory_batches FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for stock movements
CREATE POLICY "All users can view stock movements" ON public.stock_movements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can insert stock movements" ON public.stock_movements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for invoices
CREATE POLICY "All users can view invoices" ON public.invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can insert invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "All users can update invoices" ON public.invoices FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for invoice items
CREATE POLICY "All users can view invoice items" ON public.invoice_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can insert invoice items" ON public.invoice_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for payments
CREATE POLICY "All users can view payments" ON public.payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "All users can insert payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for customer quotes (admin only)
CREATE POLICY "Only admins can view customer quotes" ON public.customer_quotes FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Only admins can modify customer quotes" ON public.customer_quotes FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_quotes_updated_at BEFORE UPDATE ON public.customer_quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories
INSERT INTO public.categories (name, description) VALUES 
('Electronics', 'Electronic items and gadgets'),
('Groceries', 'Food items and consumables'),
('Clothing', 'Apparel and accessories'),
('Home & Garden', 'Home improvement and gardening supplies'),
('Books & Stationery', 'Books, notebooks, and office supplies');
-- Insert demo users for testing
-- First, we need to insert demo auth users (this would normally happen through the signup flow)
-- But for demonstration purposes, let's create some sample profiles

-- Create a sample admin profile (assuming auth.users entries exist)
-- Note: In real implementation, these would be created through the signup flow

-- For now, let's just create some sample categories and demonstrate the system
INSERT INTO public.categories (name, description, parent_id) VALUES 
('Electronics', 'Electronic devices and components', NULL),
('Smartphones', 'Mobile phones and accessories', (SELECT id FROM public.categories WHERE name = 'Electronics')),
('Laptops', 'Portable computers', (SELECT id FROM public.categories WHERE name = 'Electronics')),
('Groceries', 'Food and consumable items', NULL),
('Beverages', 'Drinks and liquid refreshments', (SELECT id FROM public.categories WHERE name = 'Groceries')),
('Snacks', 'Quick food items', (SELECT id FROM public.categories WHERE name = 'Groceries'));
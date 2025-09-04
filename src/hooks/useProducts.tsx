import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  unit: 'kg' | 'gm' | 'ltr' | 'ml' | 'pcs' | 'box' | 'pack';
  purchase_price: number;
  selling_price: number;
  mrp?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  tax_rate?: number;
  hsn_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    refetch: fetchProducts,
  };
};
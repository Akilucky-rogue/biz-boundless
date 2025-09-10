import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  address?: string;
  gstin?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addVendor = async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([vendor])
        .select()
        .single();

      if (error) throw error;
      
      setVendors(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Vendor added successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setVendors(prev => prev.map(v => v.id === id ? data : v));
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    loading,
    addVendor,
    updateVendor,
    refetch: fetchVendors,
  };
};
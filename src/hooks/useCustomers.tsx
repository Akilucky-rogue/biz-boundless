import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  credit_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    refetch: fetchCustomers,
  };
};
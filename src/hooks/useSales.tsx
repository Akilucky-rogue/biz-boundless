import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id?: string;
  status: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  total_amount: number;
  due_date?: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  customers?: {
    name: string;
  };
  invoice_items?: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  line_total: number;
  products?: {
    name: string;
    unit: string;
  };
}

export const useSales = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            name
          ),
          invoice_items (
            *,
            products (
              name,
              unit
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoice: {
    customer_id?: string;
    items: {
      product_id: string;
      quantity: number;
      unit_price: number;
      tax_rate?: number;
    }[];
    discount_amount?: number;
    notes?: string;
  }) => {
    try {
      // Calculate totals
      const subtotal = invoice.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );
      const tax_amount = invoice.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price * (item.tax_rate || 0) / 100), 0
      );
      const total_amount = subtotal + tax_amount - (invoice.discount_amount || 0);

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          customer_id: invoice.customer_id,
          subtotal,
          tax_amount,
          discount_amount: invoice.discount_amount || 0,
          total_amount,
          notes: invoice.notes,
          status: 'draft',
          payment_status: 'pending',
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsWithInvoiceId = invoice.items.map(item => ({
        invoice_id: invoiceData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate || 0,
        line_total: item.quantity * item.unit_price * (1 + (item.tax_rate || 0) / 100),
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      await fetchInvoices(); // Refresh data
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      return { data: invoiceData, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateInvoiceStatus = async (id: string, status: string, payment_status?: string) => {
    try {
      const updates: any = { status };
      if (payment_status) updates.payment_status = payment_status;

      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update invoice status",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // Calculate today's stats
  const todaysInvoices = invoices.filter(inv => {
    const today = new Date().toDateString();
    const invoiceDate = new Date(inv.created_at).toDateString();
    return today === invoiceDate;
  });

  const todaysRevenue = todaysInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoiceStatus,
    refetch: fetchInvoices,
    todaysInvoices,
    todaysRevenue,
  };
};
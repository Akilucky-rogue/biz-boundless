import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  product_id: string;
  vendor_id?: string;
  quantity: number;
  remaining_quantity: number;
  purchase_price: number;
  expiry_date?: string;
  purchased_at: string;
  location?: string;
  batch_number?: string;
  products?: {
    name: string;
    unit: string;
    min_stock_level?: number;
    selling_price: number;
  };
}

interface StockSummary {
  product_id: string;
  product_name: string;
  unit: string;
  total_stock: number;
  min_stock_level?: number;
  selling_price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_batches')
        .select(`
          *,
          products (
            name,
            unit,
            min_stock_level,
            selling_price
          )
        `)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
      
      // Calculate stock summary
      const summary = calculateStockSummary(data || []);
      setStockSummary(summary);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStockSummary = (inventoryData: InventoryItem[]): StockSummary[] => {
    const productMap = new Map<string, StockSummary>();
    
    inventoryData.forEach(item => {
      if (!item.products) return;
      
      const productId = item.product_id;
      const existing = productMap.get(productId);
      
      if (existing) {
        existing.total_stock += item.remaining_quantity;
      } else {
        productMap.set(productId, {
          product_id: productId,
          product_name: item.products.name,
          unit: item.products.unit,
          total_stock: item.remaining_quantity,
          min_stock_level: item.products.min_stock_level,
          selling_price: item.products.selling_price,
          status: 'in_stock'
        });
      }
    });

    // Determine status for each product
    return Array.from(productMap.values()).map(item => ({
      ...item,
      status: item.total_stock === 0 
        ? 'out_of_stock' 
        : item.min_stock_level && item.total_stock <= item.min_stock_level 
          ? 'low_stock' 
          : 'in_stock'
    }));
  };

  const addInventoryBatch = async (batch: {
    product_id: string;
    vendor_id?: string;
    quantity: number;
    purchase_price: number;
    expiry_date?: string;
    location?: string;
    batch_number?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('inventory_batches')
        .insert([{
          ...batch,
          remaining_quantity: batch.quantity,
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchInventory(); // Refresh data
      toast({
        title: "Success",
        description: "Inventory batch added successfully",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add inventory batch",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    stockSummary,
    loading,
    addInventoryBatch,
    refetch: fetchInventory,
  };
};
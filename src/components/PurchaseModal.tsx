import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useVendors } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
}

interface PurchaseItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export const PurchaseModal = ({ open, onClose }: PurchaseModalProps) => {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [items, setItems] = useState<PurchaseItem[]>([{ product_id: "", quantity: 0, unit_price: 0 }]);
  const [transportCharges, setTransportCharges] = useState(0);
  const [packingCharges, setPackingCharges] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { vendors } = useVendors();
  const { products } = useProducts();
  const { toast } = useToast();

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 0, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const updatedItems = [...items];
    if (field === 'product_id') {
      updatedItems[index][field] = value as string;
      // Auto-fill price if product is selected
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].unit_price = product.purchase_price;
      }
    } else {
      updatedItems[index][field] = Number(value);
    }
    setItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + transportCharges + packingCharges + otherCharges;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVendor || items.some(item => !item.product_id || item.quantity <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create inventory batches for each item
      for (const item of items) {
        await supabase.from('inventory_batches').insert({
          product_id: item.product_id,
          vendor_id: selectedVendor,
          quantity: item.quantity,
          remaining_quantity: item.quantity,
          purchase_price: item.unit_price,
          purchased_at: purchaseDate.toISOString(),
          location: notes || 'Warehouse',
        });
      }
      
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      
      // Reset form
      setSelectedVendor("");
      setPurchaseDate(new Date());
      setItems([{ product_id: "", quantity: 0, unit_price: 0 }]);
      setTransportCharges(0);
      setPackingCharges(0);
      setOtherCharges(0);
      setNotes("");
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create New Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Purchase Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !purchaseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={(date) => date && setPurchaseDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={16} className="mr-1" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={item.product_id} onValueChange={(value) => updateItem(index, 'product_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit Price (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price || ""}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label>Total</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`₹${(item.quantity * item.unit_price).toFixed(2)}`}
                      readOnly
                      className="bg-muted flex-1"
                    />
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Charges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Transport Charges (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={transportCharges || ""}
                onChange={(e) => setTransportCharges(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Packing Charges (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={packingCharges || ""}
                onChange={(e) => setPackingCharges(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Other Charges (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={otherCharges || ""}
                onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or special instructions..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Purchase Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport Charges:</span>
                <span>₹{transportCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Packing Charges:</span>
                <span>₹{packingCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Charges:</span>
                <span>₹{otherCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
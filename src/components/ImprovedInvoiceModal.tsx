import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Minus, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";

interface ImprovedInvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

interface InvoiceItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export const ImprovedInvoiceModal = ({ open, onClose }: ImprovedInvoiceModalProps) => {
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ product_id: "", quantity: 0, unit_price: 0 }]);
  const [transportCharges, setTransportCharges] = useState(0);
  const [packingCharges, setPackingCharges] = useState(0);
  const [tax, setTax] = useState(0);
  const [transportDetails, setTransportDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const { customers } = useCustomers();
  const { products } = useProducts();
  const { stockSummary } = useInventory();
  const { createInvoice } = useSales();
  const { toast } = useToast();

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 0, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    if (field === 'product_id') {
      updatedItems[index][field] = value as string;
      // Auto-fill unit price and reset quantity when product changes
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].unit_price = product.selling_price;
        updatedItems[index].quantity = 0; // Clear quantity when changing product
      }
    } else if (field === 'quantity') {
      updatedItems[index][field] = Number(value) || 0;
    } else {
      updatedItems[index][field] = Number(value);
    }
    setItems(updatedItems);
  };

  const getProductStock = (productId: string) => {
    const stockItem = stockSummary.find(item => item.product_id === productId);
    return stockItem ? stockItem.total_stock : 0;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + transportCharges + packingCharges + tax;
  };

  const resetForm = () => {
    setInvoiceDate(new Date());
    setSelectedCustomer("");
    setCustomerSearch("");
    setItems([{ product_id: "", quantity: 0, unit_price: 0 }]);
    setTransportCharges(0);
    setPackingCharges(0);
    setTax(0);
    setTransportDetails("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.some(item => !item.product_id || item.quantity <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and ensure quantities are greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const invoiceData = {
        customer_id: selectedCustomer === "walk-in" ? null : selectedCustomer,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: 0,
          line_total: item.quantity * item.unit_price,
        })),
        subtotal: calculateSubtotal(),
        tax_amount: tax,
        discount_amount: 0,
        total_amount: calculateTotal(),
        notes: transportDetails,
      };
      
      const result = await createInvoice(invoiceData);
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndPrint = async (e: React.FormEvent) => {
    // For now, just create the invoice
    await handleSubmit(e);
    // TODO: Implement PDF generation and printing
    toast({
      title: "Invoice Created",
      description: "Print functionality will be available soon",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={(date) => date && setInvoiceDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Type to search customers..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer("");
                  }}
                  className="pl-9"
                />
              </div>
              {customerSearch && (
                <div className="max-h-32 overflow-y-auto bg-card border rounded-md">
                  <div
                    className="p-2 hover:bg-muted cursor-pointer border-b"
                    onClick={() => {
                      setSelectedCustomer("walk-in");
                      setCustomerSearch("Walk-in Customer");
                    }}
                  >
                    Walk-in Customer
                  </div>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedCustomer(customer.id);
                        setCustomerSearch(customer.name);
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      {customer.phone && (
                        <div className="text-sm text-muted-foreground">{customer.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.product_id);
              const currentStock = getProductStock(item.product_id);
              
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={item.product_id} onValueChange={(value) => updateItem(index, 'product_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Stock: {getProductStock(product.id)} {product.unit}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProduct && (
                      <div className="text-xs text-muted-foreground">
                        Current Stock: {currentStock} {selectedProduct.unit}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      max={currentStock}
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      placeholder="0"
                      onFocus={(e) => e.target.select()} // Clear when typing
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

                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input
                      value={`₹${(item.quantity * item.unit_price).toFixed(2)}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <div className="flex gap-2">
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
              );
            })}
          </div>

          {/* Charges */}
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
              <Label>Tax (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={tax || ""}
                onChange={(e) => setTax(Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Transport Details */}
          <div className="space-y-2">
            <Label htmlFor="transport_details">Transport Details</Label>
            <Textarea
              id="transport_details"
              value={transportDetails}
              onChange={(e) => setTransportDetails(e.target.value)}
              placeholder="Transport details, delivery instructions..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Invoice Summary</h3>
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
                <span>Tax:</span>
                <span>₹{tax.toFixed(2)}</span>
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
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
            <Button 
              type="button" 
              disabled={loading} 
              className="flex-1" 
              onClick={handleCreateAndPrint}
            >
              Create & Print Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
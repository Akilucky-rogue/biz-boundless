import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

interface ImprovedProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: any;
}

// Predefined units with ability to add custom ones
const DEFAULT_UNITS = [
  "pcs", "kg", "gm", "ltr", "ml", "box", "pack", "dozen", "ft", "meter", "inch"
];

export const ImprovedProductModal = ({ open, onClose, product }: ImprovedProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    product_group: "",
    unit: "pcs",
    opening_stock: 0,
    selling_price: 0,
    purchase_price: 0,
    min_stock_level: 0,
    description: "",
    sku: "",
    barcode: ""
  });
  
  const [customUnit, setCustomUnit] = useState("");
  const [availableUnits, setAvailableUnits] = useState(DEFAULT_UNITS);
  const [productGroups, setProductGroups] = useState<string[]>([
    "Groceries", "Electronics", "Clothing", "Books", "Health & Beauty"
  ]);
  const [loading, setLoading] = useState(false);

  const { addProduct, updateProduct } = useProducts();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        product_group: product.category || "",
        unit: product.unit || "pcs",
        opening_stock: product.opening_stock || 0,
        selling_price: product.selling_price || 0,
        purchase_price: product.purchase_price || 0,
        min_stock_level: product.min_stock_level || 0,
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || ""
      });
    } else {
      setFormData({
        name: "",
        product_group: "",
        unit: "pcs",
        opening_stock: 0,
        selling_price: 0,
        purchase_price: 0,
        min_stock_level: 0,
        description: "",
        sku: "",
        barcode: ""
      });
    }
  }, [product, open]);

  const handleAddUnit = () => {
    if (customUnit && !availableUnits.includes(customUnit)) {
      setAvailableUnits([...availableUnits, customUnit]);
      setFormData({ ...formData, unit: customUnit });
      setCustomUnit("");
    }
  };

  const handleAddGroup = () => {
    if (formData.product_group && !productGroups.includes(formData.product_group)) {
      setProductGroups([...productGroups, formData.product_group]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        unit: formData.unit,
        selling_price: formData.selling_price,
        purchase_price: formData.purchase_price,
        min_stock_level: formData.min_stock_level,
        description: formData.description,
        sku: formData.sku,
        barcode: formData.barcode,
        is_active: true,
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        const { data: newProduct, error: productError } = await addProduct(productData);
        
        // If opening stock > 0, create an inventory batch
        if (!productError && newProduct && formData.opening_stock > 0) {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.from('inventory_batches').insert({
            product_id: newProduct.id,
            quantity: formData.opening_stock,
            remaining_quantity: formData.opening_stock,
            purchase_price: formData.purchase_price,
            purchased_at: new Date().toISOString(),
            location: 'Initial Stock',
          });
        }
      }

      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name - Mandatory */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Product Group - Optional, searchable */}
          <div className="space-y-2">
            <Label>Product Group</Label>
            <div className="flex gap-2">
              <Input
                value={formData.product_group}
                onChange={(e) => setFormData({ ...formData, product_group: e.target.value })}
                placeholder="Type or select product group"
                list="product-groups"
              />
              <datalist id="product-groups">
                {productGroups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Units - Editable list */}
          <div className="space-y-2">
            <Label>Unit</Label>
            <div className="flex gap-2">
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Add custom unit"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddUnit}
              >
                Add Unit
              </Button>
            </div>
            
            {/* Show current units as badges */}
            <div className="flex flex-wrap gap-1">
              {availableUnits.slice(-5).map((unit) => (
                <Badge key={unit} variant="secondary" className="text-xs">
                  {unit}
                </Badge>
              ))}
            </div>
          </div>

          {/* Opening Stock - Mandatory */}
          <div className="space-y-2">
            <Label htmlFor="opening_stock">Opening Stock *</Label>
            <Input
              id="opening_stock"
              type="number"
              min="0"
              value={formData.opening_stock}
              onChange={(e) => setFormData({ ...formData, opening_stock: Number(e.target.value) })}
              placeholder="Enter opening stock quantity"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (₹)</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            {/* Selling Price - Not mandatory */}
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price (₹)</Label>
              <Input
                id="selling_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Stock Keeping Unit"
              />
            </div>

            {/* Min Stock Level */}
            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
              <Input
                id="min_stock_level"
                type="number"
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="Product barcode"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
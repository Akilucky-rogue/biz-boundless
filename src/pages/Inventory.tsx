import { useState } from "react";
import { Search, Filter, Package, AlertTriangle, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventory";
import { ProductModal } from "@/components/ProductModal";
import { useAuth } from "@/hooks/useAuth";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const { stockSummary, loading } = useInventory();
  const { isAdmin } = useAuth();

  const inventoryItems = stockSummary.map(item => ({
    id: item.product_id,
    name: item.product_name,
    category: "General", // We can enhance this later with category lookup
    stock: item.total_stock,
    unit: item.unit,
    price: item.selling_price,
    lowStockAlert: item.min_stock_level || 0,
    status: item.status
  }));


  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock": return "text-success";
      case "low_stock": return "text-warning";
      case "out_of_stock": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock": return "bg-success-light text-success";
      case "low_stock": return "bg-warning-light text-warning";
      case "out_of_stock": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Manage your product catalog and stock levels</p>
          </div>
          <Button variant="gradient" onClick={() => setShowProductModal(true)}>
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-lg p-3 text-center border border-border/50">
            <p className="text-lg font-bold text-foreground">
              {loading ? "..." : inventoryItems.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center border border-border/50">
            <p className="text-lg font-bold text-warning">
              {loading ? "..." : inventoryItems.filter(item => item.status === 'low_stock').length}
            </p>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center border border-border/50">
            <p className="text-lg font-bold text-destructive">
              {loading ? "..." : inventoryItems.filter(item => item.status === 'out_of_stock').length}
            </p>
            <p className="text-xs text-muted-foreground">Out of Stock</p>
          </div>
        </div>

        {/* Inventory List */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                  {item.status.replace("_", " ")}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Stock</p>
                  <p className={`font-semibold ${getStatusColor(item.status)}`}>
                    {item.stock} {item.unit}
                    {item.stock <= item.lowStockAlert && item.stock > 0 && (
                      <AlertTriangle size={14} className="inline ml-1 text-warning" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-semibold text-foreground">₹{item.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Alert At</p>
                  <p className="font-semibold text-foreground">{item.lowStockAlert} {item.unit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <ProductModal 
        open={showProductModal} 
        onClose={() => setShowProductModal(false)} 
      />
    </div>
  );
}
import { useState } from "react";
import { Search, Plus, Receipt, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PurchaseModal } from "@/components/PurchaseModal";

export default function Purchase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { isAdmin } = useAuth();

  // Mock purchase data for now - will be replaced with real data later
  const purchases = [];

  const filteredPurchases = purchases.filter((purchase: any) =>
    purchase.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Purchases</h1>
          <p className="text-muted-foreground">Track purchase orders and vendor transactions</p>
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-secondary rounded-xl p-4 mb-6 text-secondary-foreground">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Today's Purchases</h2>
            <Calendar size={20} className="text-secondary-foreground/80" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">₹0</p>
              <p className="text-sm text-secondary-foreground/80">Total Amount</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-secondary-foreground/80">Transactions</p>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter size={18} />
          </Button>
          <Button variant="gradient" onClick={() => setShowPurchaseModal(true)} className="shrink-0">
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">New Purchase</span>
          </Button>
        </div>

        {/* Purchase List */}
        <div className="space-y-3">
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first purchase order
              </p>
              <Button variant="gradient" onClick={() => setShowPurchaseModal(true)}>
                <Plus size={16} className="mr-2" />
                Create First Purchase
              </Button>
            </div>
          ) : (
            filteredPurchases.map((purchase: any) => (
              <div key={purchase.id} className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
                {/* Purchase item details will go here */}
              </div>
            ))
          )}
        </div>
      </div>
      
      <PurchaseModal 
        open={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />
    </div>
  );
}
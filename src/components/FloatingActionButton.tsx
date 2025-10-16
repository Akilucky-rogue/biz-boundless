import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Package, ShoppingCart, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { InvoiceModal } from "@/components/InvoiceModal";
import { CustomerModal } from "@/components/CustomerModal";
import { ProductModal } from "@/components/ProductModal";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Hide FAB on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  const baseActions = [
    { icon: Package, label: "Add Product", action: () => setShowProductModal(true) },
    { icon: ShoppingCart, label: "New Sale", action: () => setShowInvoiceModal(true) },
  ];

  const adminActions = [
    { icon: Users, label: "Add Customer", action: () => setShowCustomerModal(true) },
    { icon: Building2, label: "Add Vendor", action: () => navigate('/vendors') },
    { icon: Package, label: "View Catalogue", action: () => navigate('/catalogue') },
  ];

  const quickActions = isAdmin ? [...baseActions, ...adminActions] : baseActions;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fab-container mb-16 sm:mb-0">
      {/* Quick action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-slide-up mb-2">
          {quickActions.map(({ icon: Icon, label, action }) => (
            <Button
              key={label}
              onClick={() => handleAction(action)}
              className="fab-action w-12 h-12 rounded-full bg-card text-foreground shadow-md border border-border/50 hover:bg-muted hover:scale-105 transition-all duration-200"
              size="sm"
            >
              <Icon size={18} />
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        size="lg"
      >
        <Plus size={24} />
      </Button>

      {/* Modals */}
      <InvoiceModal open={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} />
      <CustomerModal open={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
      <ProductModal open={showProductModal} onClose={() => setShowProductModal(false)} />
    </div>
  );
};
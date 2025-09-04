import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Package, ShoppingCart, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Hide FAB on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  const baseActions = [
    { icon: Package, label: "Add Product", action: () => console.log("Add Product") },
    { icon: ShoppingCart, label: "New Sale", action: () => console.log("New Sale") },
  ];

  const adminActions = [
    { icon: Users, label: "Add Customer", action: () => console.log("Add Customer") },
    { icon: Building2, label: "Add Vendor", action: () => console.log("Add Vendor") },
  ];

  const quickActions = isAdmin ? [...baseActions, ...adminActions] : baseActions;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fab-container">
      {/* Quick action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-slide-up">
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
    </div>
  );
};
import { useState } from "react";
import { Plus, Package, Users, UserPlus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  { icon: Package, label: "Add Item", action: "add-inventory" },
  { icon: UserPlus, label: "Add Vendor", action: "add-vendor" },
  { icon: Users, label: "Add Customer", action: "add-customer" },
  { icon: Receipt, label: "New Invoice", action: "new-invoice" },
];

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Executing action: ${action}`);
    setIsOpen(false);
    // TODO: Implement action handlers
  };

  return (
    <div className="fab-container">
      {/* Quick action buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-slide-up">
          {quickActions.map(({ icon: Icon, label, action }) => (
            <Button
              key={action}
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
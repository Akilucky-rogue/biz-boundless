import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Package, ShoppingCart, FileText, Users, Building2, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: BarChart3, label: "Dashboard" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/sales", icon: ShoppingCart, label: "Sales" },
  { path: "/reports", icon: FileText, label: "Reports" },
];

const adminNavItems = [
  { path: "/vendors", icon: Building2, label: "Vendors" },
  { path: "/customers", icon: Users, label: "Customers" },
];

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, signOut, profile } = useAuth();

  // Hide navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-bottom">
      <div className="flex items-center px-2 py-2">
        {/* Main Navigation Items */}
        <div className="flex flex-1">
          {displayItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "text-primary bg-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={18} className={`mb-1 ${isActive ? "text-primary" : ""}`} />
                <span className={`text-xs font-medium truncate ${isActive ? "text-primary" : ""}`}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="flex flex-col items-center px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <LogOut size={16} />
            <span className="text-xs">Logout</span>
          </Button>
          {profile && (
            <div className="text-xs text-center text-muted-foreground mt-1">
              <div className="truncate max-w-16">{profile.full_name}</div>
              <div className="text-xs capitalize">{profile.role}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
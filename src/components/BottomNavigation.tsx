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

const catalogueItem = { path: "/catalogue", icon: Package, label: "Catalogue" };

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

  const displayItems = isAdmin 
    ? [...navItems, ...adminNavItems, catalogueItem] 
    : [...navItems, catalogueItem];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-lg safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Main Navigation Items */}
          <div className="flex gap-1 flex-1">
            {displayItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-[70px] ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="text-xs font-medium">
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 border-l border-border/50 pl-3 ml-3">
            {profile && (
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-foreground">{profile.full_name}</div>
                <div className="text-xs text-muted-foreground capitalize">{profile.role}</div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
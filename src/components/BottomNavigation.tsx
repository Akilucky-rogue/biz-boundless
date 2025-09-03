import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, Package, ShoppingCart, FileText } from "lucide-react";

const navItems = [
  { path: "/", icon: BarChart3, label: "Dashboard" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/sales", icon: ShoppingCart, label: "Sales" },
  { path: "/reports", icon: FileText, label: "Reports" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ path, icon: Icon, label }) => {
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
            <Icon size={20} className={`mb-1 ${isActive ? "text-primary" : ""}`} />
            <span className={`text-xs font-medium truncate ${isActive ? "text-primary" : ""}`}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
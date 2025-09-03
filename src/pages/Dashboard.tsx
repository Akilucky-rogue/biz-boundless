import { StatsCard } from "@/components/StatsCard";
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart
} from "lucide-react";

export default function Dashboard() {
  // Mock data - will be replaced with real data later
  const stats = [
    {
      title: "Total Sales",
      value: "₹12,450",
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
      gradient: true
    },
    {
      title: "Inventory Items",
      value: "1,247",
      change: "+23 new items",
      changeType: "positive" as const,
      icon: Package
    },
    {
      title: "Active Customers",
      value: "89",
      change: "+5 this week",
      changeType: "positive" as const,
      icon: Users
    },
    {
      title: "Low Stock Alerts",
      value: "12",
      change: "3 critical",
      changeType: "negative" as const,
      icon: AlertTriangle
    }
  ];

  const recentSales = [
    { id: 1, customer: "Rajesh Kumar", amount: "₹850", time: "10 min ago" },
    { id: 2, customer: "Priya Sharma", amount: "₹650", time: "25 min ago" },
    { id: 3, customer: "Amit Singh", amount: "₹1,200", time: "1 hour ago" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, manage your store efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              gradient={stat.gradient}
            />
          ))}
        </div>

        {/* Recent Sales */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Sales</h2>
            <TrendingUp size={20} className="text-success" />
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingCart size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sale.customer}</p>
                    <p className="text-xs text-muted-foreground">{sale.time}</p>
                  </div>
                </div>
                <p className="font-semibold text-success">{sale.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-muted/50 rounded-lg text-left hover:bg-muted transition-colors">
              <Package className="text-primary mb-2" size={20} />
              <p className="font-medium text-foreground">Add Inventory</p>
              <p className="text-xs text-muted-foreground">Manage stock levels</p>
            </button>
            <button className="p-4 bg-muted/50 rounded-lg text-left hover:bg-muted transition-colors">
              <Users className="text-secondary mb-2" size={20} />
              <p className="font-medium text-foreground">New Customer</p>
              <p className="text-xs text-muted-foreground">Add customer details</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}